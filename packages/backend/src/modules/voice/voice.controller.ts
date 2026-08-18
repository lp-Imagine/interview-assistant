import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";

interface TtsResult {
  base64: string;
  format: string;
}

/** 从 SSE 事件 JSON 里提取 audio base64（兼容多层嵌套） */
function extractAudioField(jsonText: string): string {
  try {
    const obj = JSON.parse(jsonText);
    const walk = (n: any): string | undefined => {
      if (!n || typeof n !== "object") return undefined;
      if (typeof n.audio === "string" && n.audio) return n.audio;
      if (typeof n.data === "string" && n.data) {
        // data 可能就是 base64 音频
        try {
          JSON.parse(n.data);
        } catch {
          return n.data;
        }
      }
      for (const key of Object.keys(n)) {
        if (
          key === "event" ||
          key === "type" ||
          key === "seq" ||
          key === "duration"
        )
          continue;
        const found = walk(n[key]);
        if (found) return found;
      }
      return undefined;
    };
    return walk(obj) ?? "";
  } catch {
    // 非 JSON 行：可能本身就是 base64 音频
    return jsonText.replace(/"/g, "").trim();
  }
}

/**
 * 豆包语音（火山语音技术平台）：
 * - TTS 合成: POST https://openspeech.bytedance.com/api/v3/tts/unidirectional/sse
 *   鉴权: X-Api-Key（语音平台独立 key，非 ark LLM key）+ X-Api-Resource-Id
 *   resource: seed-tts-2.0
 * - ASR 识别: POST https://openspeech.bytedance.com/api/v3/auc/bigmodel/recognize/flash
 *   resource: volc.bigasr.auc_turbo
 * 控制台开通/拿 key: https://console.volcengine.com/speech
 */
@Controller("voice")
export class VoiceController {
  private readonly logger = new Logger("VoiceController");

  private resolveEnvFile(): string {
    let dir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const candidate = join(dir, ".env");
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    return join(__dirname, "../../../.env");
  }

  private readEnv(key: string): string | undefined {
    const val = process.env[key];
    if (val) return val;
    try {
      const raw = readFileSync(this.resolveEnvFile(), "utf-8");
      const m = raw.match(new RegExp(`^${key}=(.*)$`, "m"));
      return m ? m[1].trim() : undefined;
    } catch {
      return undefined;
    }
  }

  /** 火山语音平台鉴权头（X-Api-Key + resource） */
  private voiceHeaders(resourceId: string): Record<string, string> {
    const apiKey = this.readEnv("VOICE_API_KEY");
    if (!apiKey) {
      throw new BadRequestException(
        "VOICE_API_KEY 未配置：请到设置页填写火山语音平台 API Key（console.volcengine.com/speech）",
      );
    }
    return {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
      "X-Api-Resource-Id": resourceId,
      "X-Api-Request-Id": randomUUID(),
      "X-Api-Sequence": "-1",
    };
  }

  /** TTS：语音合成（豆包语音，SSE 返回 mp3 base64） */
  @Post("tts")
  async tts(
    @Body() body: { text?: string },
  ): Promise<{ ok: true } & TtsResult> {
    const text = (body.text ?? "").trim();
    if (!text) throw new BadRequestException("text 不能为空");
    if (text.length > 500)
      throw new BadRequestException("text 过长（最多 500 字）");

    const resourceId = this.readEnv("TTS_RESOURCE_ID") || "volc.seedtts.auc";
    const speaker = this.readEnv("TTS_SPEAKER") || "zh_female_xiaohe";
    const headers = this.voiceHeaders(resourceId);

    const payload = {
      text,
      speaker,
      audio_format: "mp3",
      sample_rate: 24000,
      speed_ratio: 1.0,
    };

    try {
      const res = await fetch(
        "https://openspeech.bytedance.com/api/v3/tts/unidirectional/sse",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const err = (await res.text()).slice(0, 300);
        this.logger.warn(`TTS failed ${res.status}: ${err}`);
        throw new BadRequestException(
          `语音合成失败（${res.status}）：请确认已开通豆包语音合成并在设置页填 VOICE_API_KEY`,
        );
      }

      const raw = await res.text();
      this.logger.log(`TTS raw[${raw.length}]: ${raw.slice(0, 400)}`);
      // SSE 解析（兼容多层嵌套）：data: {audio} / {data:{audio}} / {data:{data:{audio}}}
      const audioParts: string[] = [];
      for (const line of raw.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const jsonText = line.slice(5).trim();
        if (!jsonText || jsonText === "[DONE]") continue;
        const audio = extractAudioField(jsonText);
        if (audio) audioParts.push(audio);
      }
      if (!audioParts.length) {
        throw new BadRequestException(
          "语音合成未返回音频（请检查音色/开通状态）",
        );
      }
      return { ok: true, base64: audioParts.join(""), format: "mp3" };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : "语音合成失败";
      this.logger.warn(`TTS error: ${message}`);
      throw new BadRequestException(`语音合成失败：${message}`);
    }
  }

  /** ASR：语音识别（极速版，同步返回） */
  @Post("asr")
  async asr(
    @Body() body: { audio?: string; format?: string },
  ): Promise<{ ok: true; text: string }> {
    const audio = (body.audio ?? "").trim();
    if (!audio) throw new BadRequestException("audio 不能为空");
    if (audio.length > 8_000_000)
      throw new BadRequestException("音频过大（最多约 6MB）");

    // 新版录音文件识别：resource volc.seedasr.auc，submit + query 两段式
    const resourceId = this.readEnv("ASR_RESOURCE_ID") || "volc.seedasr.auc";
    const requestId = randomUUID();
    const headers = this.voiceHeaders(resourceId);
    headers["X-Api-Request-Id"] = requestId;

    const format =
      body.format === "mp4" ? "mp4" : body.format === "ogg" ? "ogg" : "wav";
    const payload = {
      user: { uid: "dsh-interview" },
      audio: {
        format,
        data: audio,
        codec: "raw",
        rate: 16000,
        bits: 16,
        channel: 1,
      },
      request: {
        model_name: "bigmodel",
        enable_itn: true,
        enable_punc: true,
        show_utterances: false,
      },
    };

    try {
      // 1. 提交任务
      const submitRes = await fetch(
        "https://openspeech.bytedance.com/api/v3/auc/bigmodel/submit",
        {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        },
      );
      const submitJson = await submitRes.json().catch(() => ({}));
      this.logger.log(
        `ASR submit: ${JSON.stringify(submitJson).slice(0, 300)}`,
      );
      if (
        !submitRes.ok ||
        (submitJson.code !== undefined && submitJson.code !== 0)
      ) {
        const errText = JSON.stringify(submitJson).slice(0, 300);
        this.logger.warn(`ASR submit failed ${submitRes.status}: ${errText}`);
        throw new BadRequestException(
          `语音识别提交失败（${submitRes.status}）：请确认已开通语音识别并在设置页填 VOICE_API_KEY / ASR_RESOURCE_ID`,
        );
      }

      // 2. 轮询查询结果（最多 30 秒）
      let text = "";
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        const queryRes = await fetch(
          "https://openspeech.bytedance.com/api/v3/auc/bigmodel/query",
          {
            method: "POST",
            headers,
            body: JSON.stringify({}),
          },
        );
        const queryJson = await queryRes.json().catch(() => ({}));
        const code = queryJson.code;
        if (i === 0 || code !== 1) {
          this.logger.log(
            `ASR query[${i}]: ${JSON.stringify(queryJson).slice(0, 250)}`,
          );
        }
        // result 可能是对象 {text} 或数组 [{text}]；code 可能缺失
        const result = queryJson.result;
        const candidate =
          typeof result === "string"
            ? result
            : Array.isArray(result)
              ? (result[0]?.text ?? "")
              : (result?.text ?? "");
        const candidateText = String(candidate || queryJson.text || "").trim();
        if (candidateText) {
          text = candidateText;
          break;
        }
        // 明确失败码（非 0/1）才中断；否则继续轮询
        if (code !== undefined && code !== 0 && code !== 1) {
          this.logger.warn(`ASR query failed code=${code}`);
          break;
        }
      }

      if (!text)
        throw new BadRequestException(
          "语音识别未返回内容（请检查音频或开通状态）",
        );
      return { ok: true, text };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : "语音识别失败";
      this.logger.warn(`ASR error: ${message}`);
      throw new BadRequestException(`语音识别失败：${message}`);
    }
  }
}
