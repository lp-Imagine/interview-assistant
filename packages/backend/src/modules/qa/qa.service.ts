import { Injectable, Logger } from "@nestjs/common";
import { Response } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { RagService } from "../rag/rag.service";

interface StreamContext {
  userId: string;
  question: string;
  res: Response;
  isFollowUp: boolean;
  isQa: boolean;
  questionId?: string;
  history?: Array<{ role: string; content: string }>;
}

@Injectable()
export class QaService {
  private readonly logger = new Logger(QaService.name);
  private openai: any = null;

  constructor(
    private prisma: PrismaService,
    private ragService: RagService,
  ) {}

  // ── OpenAI lazy init ──

  private getOpenAI() {
    if (!this.openai) {
      const OpenAI = require("openai").OpenAI;
      this.openai = new OpenAI({
        apiKey: process.env.LLM_API_KEY,
        baseURL: process.env.LLM_BASE_URL,
      });
    }
    return this.openai;
  }

  // ── SSE helpers ──

  private sendEvent(res: Response, event: object) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  // ── RAG context ──

  private async buildContext(
    question: string,
    history?: Array<{ role: string; content: string }>,
  ) {
    const ragPromise = this.ragService
      .searchSimilar(question, 5)
      .catch(() => [] as string[]);
    const timeoutPromise = new Promise<string[]>((resolve) =>
      setTimeout(() => resolve([]), 1500),
    );
    const chunks = await Promise.race([ragPromise, timeoutPromise]);

    const contextText = chunks.length
      ? `相关文档片段：\n${chunks.join("\n\n")}`
      : "暂无相关文档上下文";

    const historyText = history?.length
      ? `\n\n对话历史：\n${history.map((m) => `${m.role === "user" ? "候选人" : "面试官"}: ${m.content}`).join("\n")}`
      : "";

    return { contextText, historyText };
  }

  // ── Prompt builders ──

  private buildFullPrompt(
    contextText: string,
    historyText: string,
    question: string,
  ) {
    return `你是资深前端面试官，为候选人准备一道面试题的高分回答模板。

候选人的背景资料（简历/项目/技术栈）：
${contextText}${historyText}

面试官提问：${question}

请生成一份**可直接背诵的高分回答**。

**输出格式要求（必须严格遵守，每个部分以指定标签开头）：**

[回答]
- 口语化表达，还原真实面试对话语气（可以用"首先...其次...另外我想补充的是..."这样的自然过渡）
- 回答要结构化：先总述核心观点，再分点展开，最后总结
- **重要**：结合候选人背景中提到的具体技术栈和项目经验来举例说明，让回答显得真实有深度
- 体现模块owner思维和用户体验意识，不要背书式的干瘪回答
- 控制篇幅：3-5个要点，不要太冗长

[回答结构]
用编号列出回答的提纲要点（3-5条）。每条一行，格式为"1. 要点内容"。

[高频追问]
列出3-4个这个回答可能引发的真实追问（还原面试官追问逻辑）。每条一行，以问号结尾。

[考察点]
分析这道题的考察意图、面试官在意的关键点、以及什么样的回答算高分。

注意：上面四个标签 [回答] [回答结构] [高频追问] [考察点] 必须原样输出，不可省略或替换。`;
  }

  private buildFollowUpPrompt(
    contextText: string,
    historyText: string,
    question: string,
  ) {
    return `你是资深前端面试官，候选人在面试中遇到了一个追问。

候选人的背景资料（简历/项目/技术栈）：
${contextText}${historyText}

面试官的追问：${question}

请直接生成一个**口语化的面试回答**，要求：
- 还原真实面试对话语气，直接回答问题
- 结合候选人背景中提到的具体技术栈和项目经验来举例说明
- 控制篇幅：不要太冗长，直击要点
- 只输出 [回答] 标签即可，不需要输出回答结构、高频追问和考察点

[回答]`;
  }

  private buildQaPrompt(
    contextText: string,
    historyText: string,
    question: string,
  ) {
    return `你是资深前端面试官，候选人向你请教一个技术问题，请直接给出专业、详细的解答。

候选人的背景资料（简历/项目/技术栈）：
${contextText}${historyText}

候选人的问题：${question}

要求：
- 直接回答问题，无需任何格式标签
- 结合候选人的背景资料和项目经验来举例说明
- 回答要结构化、深入，体现专业性
- 使用自然的面试官口吻，像是在面试中给候选人讲解`;
  }

  // ── LLM streaming ──

  private async streamLLM(prompt: string, ctx: StreamContext) {
    const openai = this.getOpenAI();
    const model = process.env.LLM_MODEL || "deepseek-chat";

    const stream = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    let fullResponse = "";
    let completed = false;

    const req = (ctx.res as any).req;
    req.on("close", () => {
      if (!completed && fullResponse) {
        this.handleStreamEnd(fullResponse, ctx).catch(() => {});
      }
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content || "";
      if (content) {
        fullResponse += content;
        this.sendEvent(ctx.res, { type: "answer", content });
      }
    }

    completed = true;
    await this.handleStreamEnd(fullResponse, ctx);
  }

  // ── Post-stream result handler ──

  private async handleStreamEnd(fullResponse: string, ctx: StreamContext) {
    const { userId, question, res, isFollowUp, isQa, questionId } = ctx;
    const sections = this.parseSections(fullResponse);

    // Send final events
    if (isFollowUp || isQa) {
      this.sendEvent(res, {
        type: "done",
        content: isQa ? fullResponse : sections.answer,
      });
    } else {
      this.sendEvent(res, { type: "structure", content: sections.structure });
      this.sendEvent(res, { type: "followUps", content: sections.followUps });
      this.sendEvent(res, { type: "insight", content: sections.insight });
      this.sendEvent(res, { type: "done", content: sections.answer });
    }

    res.end();

    // Persist: QA history only for free-form chat, not workspace answers
    if (isQa) {
      await this.saveHistory(userId, question, fullResponse);
    }

    if (questionId && !isFollowUp) {
      try {
        await this.saveQuestionAnswer(questionId, sections);
      } catch (err: any) {
        this.logger.error(
          `Failed to save answer to QuestionAnswer: ${err.message}`,
        );
      }
    }
  }

  // ── Public: main entry ──

  private sendConfigHint(res: Response, reason?: string): void {
    this.sendEvent(res, {
      type: "answer",
      content: `⚠️ ${reason ?? "大模型 API Key 未配置"}。请到左侧「设置」页填写 LLM_API_KEY（以及 Base URL / 模型名），保存后约 5 秒生效，再回来重新提问。`,
    });
    this.sendEvent(res, { type: "done", content: "" });
    res.end();
  }

  async streamAnswer(
    userId: string,
    question: string,
    res: Response,
    mode?: string,
    questionId?: string,
    history?: Array<{ role: string; content: string }>,
  ) {
    // 未配置大模型密钥：不假装回答，明确引导去设置页
    if (!process.env.LLM_API_KEY) {
      this.sendConfigHint(res);
      return;
    }

    const ctx: StreamContext = {
      userId,
      question,
      res,
      isFollowUp: mode === "followup",
      isQa: mode === "qa",
      questionId,
      history,
    };

    const { contextText, historyText } = await this.buildContext(
      question,
      history,
    );

    let prompt: string;
    if (ctx.isFollowUp) {
      prompt = this.buildFollowUpPrompt(contextText, historyText, question);
    } else if (ctx.isQa) {
      prompt = this.buildQaPrompt(contextText, historyText, question);
    } else {
      prompt = this.buildFullPrompt(contextText, historyText, question);
    }

    try {
      await this.streamLLM(prompt, ctx);
    } catch (err: any) {
      this.logger.error("LLM call failed: " + err.message);
      // 不再返回模板化假回答，改为明确错误提示
      this.sendConfigHint(res, `大模型调用失败：${err.message}`);
    }
  }

  // ── Section parser ──

  private parseSections(text: string): {
    answer: string;
    structure: Array<{ step: number; content: string }>;
    followUps: string[];
    insight: string;
  } {
    const extractSection = (tag: string): string => {
      const regex = new RegExp(
        `\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[(?:回答结构|高频追问|考察点)\\]|$)`,
        "i",
      );
      const match = text.match(regex);
      return match ? match[1].trim() : "";
    };

    const answer = extractSection("回答");
    const structureText = extractSection("回答结构");
    const followUpsText = extractSection("高频追问");
    const insight = extractSection("考察点");

    const structureList = structureText
      .split("\n")
      .filter((line) => /^\d+[\.\、]/.test(line.trim()))
      .map((line) => {
        const cleaned = line.replace(/^\d+[\.\、]\s*/, "");
        return { step: 0, content: cleaned };
      })
      .map((item, index) => ({ ...item, step: index + 1 }));

    const followUps = followUpsText
      .split("\n")
      .map((line) => line.replace(/^[\d\.\-\•\s]+/, "").trim())
      .filter(
        (line) =>
          line.length > 0 && (line.endsWith("？") || line.endsWith("?")),
      );

    return {
      answer: answer || text,
      structure: structureList,
      followUps: followUps.length
        ? followUps
        : ["可以详细说明一下吗？", "具体是如何实现的？"],
      insight: insight || "考察技术理解的深度和实际应用能力",
    };
  }

  // ── Persistence ──

  async saveHistory(userId: string, question: string, answer: string) {
    await this.prisma.qaHistory.create({
      data: { userId, question, answer },
    });
  }

  private async saveQuestionAnswer(
    questionId: string,
    sections: {
      answer: string;
      structure: Array<{ step: number; content: string }>;
      followUps: string[];
      insight: string;
    },
  ) {
    const existing = await this.prisma.questionAnswer.findFirst({
      where: { questionId },
    });

    if (existing) {
      await this.prisma.questionAnswer.update({
        where: { id: existing.id },
        data: {
          answer: sections.answer,
          structure: sections.structure as any,
          followUps: sections.followUps,
          insight: sections.insight,
        },
      });
    } else {
      await this.prisma.questionAnswer.create({
        data: {
          questionId,
          answer: sections.answer,
          structure: sections.structure as any,
          followUps: sections.followUps,
          insight: sections.insight,
        },
      });
    }
  }

  // ── History (used by controller) ──

  async getHistory(userId: string) {
    return this.prisma.qaHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
  }

  async deleteHistory(userId: string) {
    await this.prisma.qaHistory.deleteMany({ where: { userId } });
  }
}
