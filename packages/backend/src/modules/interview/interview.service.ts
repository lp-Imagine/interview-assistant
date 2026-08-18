import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface InterviewTurnPayload {
  question: string;
}

interface AnswerPayload {
  feedback: string;
  nextQuestion: string;
  done: boolean;
}

@Injectable()
export class InterviewService {
  private readonly logger = new Logger("InterviewService");
  private openai: any = null;

  constructor(private prisma: PrismaService) {}

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

  /** 基于已完成文档（简历/JD/面试经验）构建候选人画像 */
  private async buildContext(userId: string): Promise<string> {
    const docs = await this.prisma.document.findMany({
      where: { userId, status: "COMPLETED" },
      include: { analysis: true },
    });

    if (!docs.length) {
      return "候选人未上传简历资料，请基于常见技术岗位（前后端/算法等）出通用面试题。";
    }

    const parts: string[] = [];
    for (const doc of docs) {
      const typeLabel =
        doc.type === "RESUME"
          ? "简历"
          : doc.type === "JD"
            ? "岗位JD"
            : "面试经验";
      parts.push(`【${typeLabel}: ${doc.fileName}】`);

      const chunks = await this.prisma.chunk.findMany({
        where: { documentId: doc.id },
        take: 8,
        orderBy: { chunkIndex: "asc" },
      });
      if (chunks.length) {
        parts.push(chunks.map((c) => c.content).join("\n"));
      }
      if (doc.analysis) {
        parts.push(`技术栈: ${doc.analysis.techStack.join("、")}`);
        parts.push(`关键领域: ${doc.analysis.keywords.join("、")}`);
      }
    }
    return parts.join("\n\n").slice(0, 6000);
  }

  private async callLLM(prompt: string): Promise<Record<string, unknown>> {
    const openai = this.getOpenAI();
    const model = process.env.LLM_MODEL || "deepseek-chat";

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      const startedAt = Date.now();
      try {
        // 火山 LLM 生成点评可能较慢，设 90s 超时，避免前端无限等待
        const response = await openai.chat.completions.create(
          {
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8,
            max_tokens: 1200,
            response_format: { type: "json_object" },
          },
          { timeout: 90_000 },
        );
        this.logger.log(
          `Interview LLM ok in ${Date.now() - startedAt}ms (attempt ${attempt + 1})`,
        );
        const content = response.choices[0].message.content?.trim() ?? "";
        // 容忍 markdown 围栏包裹的 JSON
        const stripped = content
          .replace(/```(?:json)?\s*/g, "")
          .replace(/```/g, "");
        const parsed = JSON.parse(stripped);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error(
      lastError instanceof Error ? lastError.message : "AI 返回解析失败",
    );
  }

  /** 创建模拟面试会话并生成第一题 */
  async createSession(
    userId: string,
    totalQuestions = 3,
  ): Promise<{
    session: any;
    question: string;
  }> {
    const context = await this.buildContext(userId);
    const prompt = `你是一位资深面试官，正在为候选人进行模拟面试。请根据以下候选人资料，先判断其目标岗位/职级，然后提出第一个面试问题。

候选人资料：
${context}

要求：
1. 第一题要具体、有针对性（结合候选人技术栈/项目），不要泛泛而谈
2. 语气自然，像真实面试官开场
3. 面试共 ${totalQuestions} 题，从易到难递进

只输出 JSON：{"question": "第一个面试问题"}`;

    const parsed = await this.callLLM(prompt);
    const question = String(parsed.question ?? "").trim();
    if (!question) throw new Error("AI 未能生成面试题");

    const session = await this.prisma.interviewSession.create({
      data: {
        userId,
        totalQuestions,
        status: "active",
      },
    });
    await this.prisma.interviewTurn.create({
      data: {
        sessionId: session.id,
        index: 0,
        question,
      },
    });
    return { session, question };
  }

  /** 提交回答 → 点评 + 下一题（或结束） */
  async answerTurn(
    sessionId: string,
    userId: string,
    answer: string,
  ): Promise<{
    feedback: string;
    nextQuestion: string;
    done: boolean;
    turn: any;
    currentIndex: number;
    totalQuestions: number;
  }> {
    const session = await this.prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { turns: { orderBy: { index: "asc" } } },
    });
    if (!session) throw new Error("会话不存在");
    if (session.status !== "active") throw new Error("会话已结束");

    const currentTurn = session.turns.find(
      (t) => t.index === session.currentIndex,
    );
    if (!currentTurn) throw new Error("当前题目不存在");

    const context = await this.buildContext(userId);
    const done = session.currentIndex >= session.totalQuestions - 1;

    const prompt = `你是一位资深面试官，正在为候选人进行模拟面试。候选人资料如下：

${context}

面试进行到第 ${session.currentIndex + 1}/${session.totalQuestions} 题。
面试官刚才的提问：${currentTurn.question}
候选人的回答：${answer}

请以面试官口吻：
1. 点评候选人的回答（2-4 句，先肯定优点，再指出可改进之处，语气专业友善）
${done ? "2. 这是最后一题，请在反馈后给出简短总结性的结束语" : "2. 提出下一个更有深度的追问或新问题（要递进）"}

只输出 JSON：{"feedback": "你的点评", "nextQuestion": "${done ? "END" : "下一个问题"}"}`;

    const parsed = await this.callLLM(prompt);
    const feedback = String(parsed.feedback ?? "").trim();
    const nextQuestion = String(parsed.nextQuestion ?? "").trim();

    // 更新当前轮次的回答和点评
    await this.prisma.interviewTurn.update({
      where: { id: currentTurn.id },
      data: { answer, feedback },
    });

    if (done) {
      await this.prisma.interviewSession.update({
        where: { id: sessionId },
        data: { status: "done", updatedAt: new Date() },
      });
      return {
        feedback,
        nextQuestion: "",
        done: true,
        turn: { ...currentTurn, answer, feedback },
        currentIndex: session.currentIndex,
        totalQuestions: session.totalQuestions,
      };
    }

    // 存下一题并推进
    const nextIndex = session.currentIndex + 1;
    await this.prisma.interviewTurn.create({
      data: { sessionId, index: nextIndex, question: nextQuestion },
    });
    await this.prisma.interviewSession.update({
      where: { id: sessionId },
      data: { currentIndex: nextIndex, updatedAt: new Date() },
    });

    return {
      feedback,
      nextQuestion,
      done: false,
      turn: { ...currentTurn, answer, feedback },
      currentIndex: nextIndex,
      totalQuestions: session.totalQuestions,
    };
  }

  async getSession(sessionId: string, userId: string) {
    return this.prisma.interviewSession.findFirst({
      where: { id: sessionId, userId },
      include: { turns: { orderBy: { index: "asc" } } },
    });
  }

  async listSessions(userId: string) {
    return this.prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 30,
      include: { _count: { select: { turns: true } } },
    });
  }
}
