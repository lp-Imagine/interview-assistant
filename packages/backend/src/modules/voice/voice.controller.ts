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
}
