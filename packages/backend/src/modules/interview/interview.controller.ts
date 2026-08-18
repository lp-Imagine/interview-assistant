import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("interview")
export class InterviewController {
  constructor(private readonly interview: InterviewService) {}

  @Post("sessions")
  async create(
    @Body() body: { totalQuestions?: number },
    @CurrentUser() user: { id: string },
  ) {
    try {
      const total = Math.max(1, Math.min(Number(body.totalQuestions) || 3, 6));
      const result = await this.interview.createSession(user.id, total);
      return { ok: true, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "创建面试失败";
      throw new BadRequestException(
        message.includes("API Key") || message.includes("apiKey")
          ? "大模型 API Key 未配置，请到设置页填写 LLM_API_KEY"
          : message,
      );
    }
  }

  @Get("sessions")
  async list(@CurrentUser() user: { id: string }) {
    const sessions = await this.interview.listSessions(user.id);
    return { ok: true, sessions };
  }

  @Get("sessions/:id")
  async detail(@Param("id") id: string, @CurrentUser() user: { id: string }) {
    const session = await this.interview.getSession(id, user.id);
    if (!session) throw new NotFoundException("会话不存在");
    return { ok: true, session };
  }

  @Post("sessions/:id/answer")
  async answer(
    @Param("id") id: string,
    @Body() body: { answer: string },
    @CurrentUser() user: { id: string },
  ) {
    const answer = (body.answer ?? "").trim();
    if (!answer) throw new BadRequestException("回答不能为空");
    try {
      const result = await this.interview.answerTurn(id, user.id, answer);
      return { ok: true, ...result };
    } catch (error) {
      const message = error instanceof Error ? error.message : "提交回答失败";
      if (message.includes("会话")) throw new NotFoundException(message);
      throw new BadRequestException(message);
    }
  }
}
