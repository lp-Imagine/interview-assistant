import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

interface TtsResult {
  /** base64 编码的音频（mp3） */
  base64: string;
  format: string;
}

@Controller("voice")
export class VoiceController {
  private readonly logger = new Logger("VoiceController");

  /** 定位项目根目录 .env（与 settings 模块一致） */
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

  /** 从 .env 读取配置（进程环境未注入时兜底） */
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

  /** 火山方舟 TTS：语音合成（与 LLM 共用 ark key） */
  @Post("tts")
  async tts(
    @Body() body: { text?: string },
  ): Promise<{ ok: true } & TtsResult> {
    const text = (body.text ?? "").trim();
    if (!text) throw new BadRequestException("text 不能为空");
    if (text.length > 500)
      throw new BadRequestException("text 过长（最多 500 字）");

    const apiKey = this.readEnv("LLM_API_KEY");
    if (!apiKey)
      throw new BadRequestException("LLM_API_KEY 未配置，无法使用语音合成");

    const model = this.readEnv("TTS_MODEL") || "doubao-tts-seed-240628";
    const voiceType = this.readEnv("TTS_VOICE") || "zh_female_xiaohe";
    const baseUrl = this.readEnv("LLM_BASE_URL") || "";
    // ark 方舟的 TTS 端点；非火山端点时返回错误让前端回退浏览器语音
    const ttsUrl = /ark\.cn-beijing\.volces\.com/i.test(baseUrl)
      ? baseUrl.replace(/\/+$/, "") + "/tts"
      : this.readEnv("TTS_BASE_URL");

    this.logger.log(
      `TTS baseUrl=${baseUrl || "(empty)"} ttsUrl=${ttsUrl || "(none)"}`,
    );

    if (!ttsUrl) {
      throw new BadRequestException(
        "当前 LLM 非火山方舟，无法使用火山语音合成",
      );
    }

    try {
      const res = await fetch(ttsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: text,
          voice_type: voiceType,
          response_format: "mp3",
          speed_ratio: 1.0,
        }),
      });

      if (!res.ok) {
        const errText = (await res.text()).slice(0, 300);
        this.logger.warn(`TTS failed ${res.status}: ${errText}`);
        throw new BadRequestException(`语音合成失败（${res.status}）`);
      }

      const contentType = res.headers.get("content-type") || "";
      const buf = Buffer.from(await res.arrayBuffer());

      // ark 通常返回 JSON { data: { audio: base64 } }
      if (contentType.includes("application/json")) {
        const json = JSON.parse(buf.toString("utf-8"));
        const audio = json?.data?.audio ?? json?.audio;
        if (typeof audio === "string" && audio) {
          return { ok: true, base64: audio, format: "mp3" };
        }
        throw new BadRequestException("语音合成响应缺少音频数据");
      }

      // 也可能是原始二进制音频
      return { ok: true, base64: buf.toString("base64"), format: "mp3" };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : "语音合成失败";
      this.logger.warn(`TTS error: ${message}`);
      throw new BadRequestException(`语音合成失败：${message}`);
    }
  }

  /** 火山方舟 ASR：语音识别（录音 → 文字，国内可用） */
  @Post("asr")
  async asr(
    @Body() body: { audio?: string; format?: string },
  ): Promise<{ ok: true; text: string }> {
    const audio = (body.audio ?? "").trim();
    if (!audio) throw new BadRequestException("audio 不能为空");
    if (audio.length > 8_000_000)
      throw new BadRequestException("音频过大（最多约 6MB）");

    const apiKey = this.readEnv("LLM_API_KEY");
    if (!apiKey)
      throw new BadRequestException("LLM_API_KEY 未配置，无法使用语音识别");

    const model = this.readEnv("ASR_MODEL") || "doubao-asr-1-240826";
    const baseUrl = this.readEnv("LLM_BASE_URL") || "";
    const asrUrl = /ark\.cn-beijing\.volces\.com/i.test(baseUrl)
      ? baseUrl.replace(/\/+$/, "") + "/audio/asr"
      : this.readEnv("ASR_BASE_URL");
    if (!asrUrl)
      throw new BadRequestException(
        "当前 LLM 非火山方舟，无法使用火山语音识别",
      );

    // ark 多模态语音识别：content 内嵌 base64 音频
    const mime =
      body.format === "wav"
        ? "audio/wav"
        : body.format === "mp3"
          ? "audio/mpeg"
          : "audio/wav";
    const payload = {
      model,
      content: [
        {
          type: "audio",
          audio_url: `data:${mime};base64,${audio}`,
        },
      ],
    };

    try {
      const res = await fetch(asrUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = (await res.text()).slice(0, 300);
        this.logger.warn(`ASR failed ${res.status}: ${errText}`);
        throw new BadRequestException(`语音识别失败（${res.status}）`);
      }

      const json = await res.json();
      // ark 返回 content 数组，取纯文本
      const contents = json?.content ?? json?.choices?.[0]?.message?.content;
      let text = "";
      if (typeof contents === "string") {
        text = contents;
      } else if (Array.isArray(contents)) {
        text = contents
          .map((c: any) => (typeof c === "string" ? c : (c?.text ?? "")))
          .join("");
      } else if (typeof json?.text === "string") {
        text = json.text;
      }
      const cleaned = text.trim();
      if (!cleaned)
        throw new BadRequestException(
          "语音识别未返回内容（可能未开通语音模型）",
        );
      return { ok: true, text: cleaned };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : "语音识别失败";
      this.logger.warn(`ASR error: ${message}`);
      throw new BadRequestException(`语音识别失败：${message}`);
    }
  }
}
