import { Controller, Post, Get, Delete, Body, Res } from "@nestjs/common";
import { Response } from "express";
import { QaService } from "./qa.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("qa")
export class QaController {
  constructor(private readonly qaService: QaService) {}

  @Post("ask")
  async ask(
    @Body("question") question: string,
    @Body("mode") mode: string | undefined,
    @Body("questionId") questionId: string | undefined,
    @Body("history")
    history: Array<{ role: string; content: string }> | undefined,
    @Res() res: Response,
    @CurrentUser() user: { id: string; email: string },
  ) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    await this.qaService.streamAnswer(
      user.id,
      question,
      res,
      mode,
      questionId,
      history,
    );
  }

  @Get("history")
  getHistory(
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: { id: string; email: string },
  ) {
    res.setHeader("Cache-Control", "no-store");
    return this.qaService.getHistory(user.id);
  }

  @Delete("history")
  deleteHistory(@CurrentUser() user: { id: string; email: string }) {
    return this.qaService.deleteHistory(user.id);
  }
}
