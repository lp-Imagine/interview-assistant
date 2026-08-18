import { Injectable } from "@nestjs/common";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";

/** 允许通过设置页修改的环境变量（危险项如 DATABASE_URL / JWT_SECRET 不在其中） */
export const EDITABLE_KEYS = [
  "LLM_API_KEY",
  "LLM_BASE_URL",
  "LLM_MODEL",
  "EMBEDDING_API_KEY",
  "EMBEDDING_BASE_URL",
  "EMBEDDING_MODEL",
  "CORS_ORIGINS",
] as const;

/** 需要脱敏展示的密钥字段 */
const SECRET_KEYS = new Set(["LLM_API_KEY", "EMBEDDING_API_KEY"]);

function mask(value: string): string {
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}****${value.slice(-2)}`;
}

@Injectable()
export class SettingsService {
  /**
   * 定位项目根目录的 .env：从 cwd 向上查找（dev 时 cwd=packages/backend，
   * pm2 生产 cwd=项目根），保证任何启动方式都能读写同一份 .env。
   */
  private resolveEnvFile(): string {
    let dir = process.cwd();
    for (let i = 0; i < 6; i++) {
      const candidate = join(dir, ".env");
      if (existsSync(candidate)) return candidate;
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
    // 兜底：编译产物 modules/settings/ 上溯到项目根
    return join(__dirname, "../../../.env");
  }

  private readMap(): Record<string, string> {
    const raw = readFileSync(this.resolveEnvFile(), "utf-8");
    const map: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
      if (m) map[m[1]] = m[2].trim();
    }
    return map;
  }

  /** 返回可编辑配置，密钥脱敏 */
  readMasked(): Record<string, string> {
    const map = this.readMap();
    const out: Record<string, string> = {};
    for (const key of EDITABLE_KEYS) {
      const value = map[key] ?? "";
      out[key] = SECRET_KEYS.has(key) && value ? mask(value) : value;
    }
    return out;
  }

  /** 更新 .env 中指定的字段（空串/未提交的字段跳过，避免误清空） */
  update(patch: Record<string, unknown>): string[] {
    const map = this.readMap();
    const changed: string[] = [];
    for (const key of EDITABLE_KEYS) {
      const value = patch[key];
      if (typeof value !== "string") continue;
      const trimmed = value.trim();
      if (trimmed === "") continue; // 留空 = 不修改（密钥脱敏回填时尤其需要）
      if (map[key] !== trimmed) {
        map[key] = trimmed;
        changed.push(key);
      }
    }
    if (changed.length === 0) return changed;

    let out = readFileSync(this.resolveEnvFile(), "utf-8");
    for (const key of changed) {
      const line = `${key}=${map[key]}`;
      const re = new RegExp(`^${key}=.*$`, "m");
      out = re.test(out) ? out.replace(re, line) : `${out}\n${line}\n`;
    }
    writeFileSync(this.resolveEnvFile(), out);
    return changed;
  }

  /** 延迟触发 pm2 重启（pm2 守护进程独立于本进程，重启后新 env 生效） */
  scheduleRestart(pm2Name: string): void {
    setTimeout(() => {
      try {
        const child = spawn("pm2", ["restart", pm2Name], {
          detached: true,
          stdio: "ignore",
        });
        // 必须监听 error：pm2 不存在（如本地开发环境）时 spawn 触发
        // 'error' 事件（ENOENT），不监听会变成 unhandled error 直接崩掉进程
        child.on("error", () => {
          // 静默失败，不阻塞响应；本地开发改 .env 后需手动重启后端
        });
        child.unref();
      } catch {
        // 重启失败不阻塞响应，前端提示手动重启
      }
    }, 800);
  }
}
