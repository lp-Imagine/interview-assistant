import { Body, Controller, Get, Put } from "@nestjs/common";
import { SettingsService } from "./settings.service";

@Controller("settings")
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get()
  read(): { ok: true; settings: Record<string, string> } {
    return { ok: true, settings: this.settings.readMasked() };
  }

  @Put()
  update(@Body() body: Record<string, unknown>): {
    ok: true;
    changed: string[];
    message: string;
  } {
    const changed = this.settings.update(body);
    if (changed.length === 0) {
      return {
        ok: true,
        changed,
        message: "没有需要保存的变更（留空字段不会修改）",
      };
    }
    this.settings.scheduleRestart("ai-interview-backend");
    return {
      ok: true,
      changed,
      message: `已保存 ${changed.length} 项，后端正在重启（约 5 秒后生效）`,
    };
  }
}
