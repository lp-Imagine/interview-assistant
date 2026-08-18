import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RagService } from "../rag/rag.service";
import { QuestionCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  FUNDAMENTAL: "基础八股",
  PROJECT: "项目深挖",
  SCENARIO: "场景题",
  COMPREHENSIVE: "综合题",
};

interface GeneratedQuestion {
  category: QuestionCategory;
  title: string;
  frequency: string;
  insight: string;
}

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);
  private openai: any = null;

  constructor(
    private prisma: PrismaService,
    private ragService: RagService,
  ) {}

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

  async generateQuestions(userId: string, batchSize = 20) {
    const batchIndex = await this.getNextBatchIndex(userId);
    const context = await this.buildContext(userId);
    const existingTitles = await this.getExistingTitles(userId);

    const questions = await this.callLLMForQuestions(
      context,
      existingTitles,
      batchSize,
      batchIndex,
    );

    const created = await this.storeQuestions(userId, questions, batchIndex);

    return {
      questions: created,
      batchIndex,
      isComplete: questions.length < batchSize,
    };
  }

  async regenerateQuestions(userId: string, batchSize = 20) {
    await this.prisma.questionAnswer.deleteMany({
      where: { question: { userId } },
    });
    await this.prisma.question.deleteMany({ where: { userId } });

    const batchIndex = 1;
    const context = await this.buildContext(userId);
    const existingTitles: string[] = [];

    const questions = await this.callLLMForQuestions(
      context,
      existingTitles,
      batchSize,
      batchIndex,
    );
    const created = await this.storeQuestions(userId, questions, batchIndex);

    return {
      questions: created,
      batchIndex,
      isComplete: questions.length < batchSize,
    };
  }

  async continueGeneration(userId: string, batchSize = 20) {
    const batchIndex = await this.getNextBatchIndex(userId);
    const context = await this.buildContext(userId);
    const existingTitles = await this.getExistingTitles(userId);

    const questions = await this.callLLMForQuestions(
      context,
      existingTitles,
      batchSize,
      batchIndex,
    );
    const created = await this.storeQuestions(userId, questions, batchIndex);

    return {
      questions: created,
      batchIndex,
      isComplete: questions.length < batchSize,
    };
  }

  async findAll(
    userId: string,
    category?: string,
    search?: string,
    page = 1,
    pageSize = 20,
  ) {
    const where: any = { userId };
    if (category) where.category = category;
    if (search) where.title = { contains: search, mode: "insensitive" };

    const countWhere: any = { userId };
    if (search) countWhere.title = { contains: search, mode: "insensitive" };

    const [data, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: { answers: true },
      }),
      this.prisma.question.count({ where }),
    ]);

    const categoryRows = await this.prisma.question.groupBy({
      by: ["category"],
      where: countWhere,
      _count: { category: true },
    });

    const categoryCounts: Record<string, number> = {};
    for (const row of categoryRows) {
      categoryCounts[row.category] = row._count.category;
    }

    return { data, total, page, pageSize, categoryCounts };
  }

  private async buildContext(userId: string): Promise<string> {
    const docs = await this.prisma.document.findMany({
      where: { userId, status: "COMPLETED" },
      include: { analysis: true },
    });

    if (!docs.length) {
      return "暂无文档上下文，请基于常见技术栈生成通用高频面试题。";
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

    return parts.join("\n\n");
  }

  private async getExistingTitles(userId: string): Promise<string[]> {
    const questions = await this.prisma.question.findMany({
      where: { userId },
      select: { title: true },
    });
    return questions.map((q) => q.title);
  }

  private async callLLMForQuestions(
    context: string,
    existingTitles: string[],
    batchSize: number,
    batchIndex: number,
  ): Promise<GeneratedQuestion[]> {
    const model = process.env.LLM_MODEL || "deepseek-chat";

    // 未配置大模型密钥：直接走内置题库，避免 new OpenAI() 抛错导致 500
    if (!process.env.LLM_API_KEY) {
      this.logger.warn("LLM_API_KEY not set, using fallback question bank");
      return this.generateFallbackQuestions(
        context,
        existingTitles,
        batchSize,
        batchIndex,
      );
    }

    const openai = this.getOpenAI();

    const existingList = existingTitles.length
      ? `\n已生成的部分题目（仅作参考，请围绕不同角度出题，不要重复）：\n${existingTitles.slice(-20).join("\n")}`
      : "";

    const hasDocs = !context.includes("暂无文档上下文");

    // 从资料中尝试提取岗位信息，用于 prompt 定位
    const roleHint = this.extractRoleHint(context);

    const prompt = `你是资深面试官，拥有跨行业（互联网、金融、制造业、医疗、教育等）和跨岗位（前端、后端、算法、数据、产品、运维、测试等）的丰富面试经验。

根据以下资料，先推断候选人的目标岗位、职级和行业领域，再针对性地生成 ${batchSize} 道高质量面试题。

${context.slice(0, 6000)}
${existingList}

=== 整体策略 ===
1. 首先从资料中分析：候选人的目标岗位是什么？目标职级大概是？所在行业/业务领域？
2. 所有题目必须与目标岗位的核心能力要求对齐，禁止出与岗位无关的题
3. 题目难度和目标职级匹配：初级侧重基础掌握和执行力，中高级侧重原理深度和系统设计，资深侧重架构能力、技术规划和影响力
${roleHint}

=== 分类占比 ===
- 基础八股 25%（岗位核心知识体系）
- 项目深挖 40%（围绕简历项目经历追问）
- 场景题 20%（岗位相关的真实业务场景）
- 综合题 15%（系统设计、跨领域能力）

=== 各分类详细要求 ===

【基础八股】
- 八股题考察的是**纯粹的理论知识和原理理解**，不是项目经验。题目聚焦在"这个技术是什么/为什么/怎么实现的"，不需要候选人结合自身项目回答
- **先从资料中提取候选人简历上列出的专业技能/技术栈**，以这些技能为核心出题方向。例如简历写了"精通React、熟悉TypeScript"，就重点出React原理和TS类型系统的八股，而不是泛泛出所有前端知识点
- 然后再按该岗位的知识域拆分，查漏补缺确保覆盖面：
  * 前端岗示例：JS/TS语言特性(闭包/原型链/事件循环/泛型) → 框架原理(React Fiber/Vue响应式/虚拟DOM) → CSS/布局 → 浏览器(渲染流程/缓存策略/安全沙箱) → 工程化(Webpack打包/Vite HMR/Babel AST) → 网络(HTTP协议/DNS/CDN) → 性能优化(Core Web Vitals/Bundle拆分/懒加载)
  * 后端岗示例：语言特性(并发模型/内存模型/GC) → 框架原理(Spring IOC/中间件链) → 数据库(索引/事务/分库分表) → 分布式(一致性/消息队列/分布式锁) → 网络/协议(RPC/负载均衡) → 性能优化(缓存策略/池化)
  * 算法岗示例：ML基础(偏差方差/Bias-Variance) → DL原理(反向传播/注意力机制) → 模型优化(量化/剪枝/蒸馏) → 特征工程 → 模型评估与部署
  * 其他岗位同理，按知识域分层出题
- **题目里不要出现"你在项目中..."或"结合你的经验..."**，纯知识性追问即可
- 每条题目指向一个具体的技术点，不要出综合性的八股（比如"React全面考察"这种）
- 重点问：底层原理、核心机制、设计思想、与其他方案的对比、常见误区
- 好的八股示例："React的Fiber架构解决了什么问题？它是如何通过调度算法实现可中断渲染的？"
- 坏的八股示例："React 的核心工作原理是什么？在实际项目中有哪些最佳实践？"（太宽泛且混入了项目实践）

【项目深挖】
- **必须结合资料中提到的具体项目来出题**，不能出泛泛的"你做过什么项目"这类空洞问题
- 从资料中提取具体的项目名称、技术栈、业务场景，针对性地设计追问
- 覆盖维度：项目背景与职责、技术选型原因、难点与解决方案、效果度量、跨团队协作、项目复盘
- 还原真实面试官追问逻辑，要有递进式追问的思路
- 如果资料中项目信息不足，则基于资料中提到的技术栈/技能来构造有具体指向的假设性问题

【场景题】
- 给出完整业务场景描述和具体故障/需求/困境
- 场景必须与岗位所在行业和业务领域相关
- 考察问题拆解能力、方案设计能力、技术/业务落地能力，非纯理论

【综合题】
- 考察系统设计能力和技术/业务广度
- 题目应该让候选人展示跨模块、跨系统的整体思考能力
- 可以考察架构设计、技术选型权衡、团队协作流程等

=== 输出格式 ===
每道题输出 title（面试官提问话术，还原真实面试语气）、category（FUNDAMENTAL/PROJECT/SCENARIO/COMPREHENSIVE）、frequency（该题出现概率：高/中/低）、insight（考察点分析）。

返回纯 JSON 数组（不要 markdown 代码块）：
[
  {
    "category": "FUNDAMENTAL",
    "title": "React 的 Fiber 架构和之前的 Stack Reconciler 有什么本质区别？它是如何通过链表结构和调度优先级实现可中断渲染的？",
    "frequency": "高",
    "insight": "考察对React核心机制的深层理解、对框架设计思想的分析能力"
  },
  {
    "category": "PROJECT",
    "title": "你在XX项目中负责了哪些模块？最复杂的一个功能你是怎么设计和实现的？",
    "frequency": "高",
    "insight": "考察候选人对项目细节的熟悉度、技术方案设计能力、实际解决问题的思路"
  }
]`;

    try {
      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.88,
        max_tokens: 4000,
      });

      const content = response.choices[0].message.content.trim();
      // Strip markdown code fences before extraction
      const stripped = content
        .replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1")
        .trim();
      const jsonMatch = (stripped || content).match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        this.logger.error("Failed to parse LLM response: " + content);
        return this.generateFallbackQuestions(
          context,
          existingTitles,
          batchSize,
          batchIndex,
        );
      }

      let parsed: any[];
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseErr: any) {
        this.logger.error("LLM JSON parse failed: " + parseErr.message);
        return this.generateFallbackQuestions(
          context,
          existingTitles,
          batchSize,
          batchIndex,
        );
      }
      const existingSet = new Set(existingTitles);
      const result = parsed
        .map((item: any) => ({
          category: this.normalizeCategory(item.category),
          title: item.title,
          frequency: (["高", "中", "低"].includes(item.frequency)
            ? item.frequency
            : "中") as string,
          insight: item.insight || "",
        }))
        .filter((q: any) => !existingSet.has(q.title));

      // If LLM returned nothing useful, fall back
      if (!result.length) {
        return this.generateFallbackQuestions(
          context,
          existingTitles,
          batchSize,
          batchIndex,
        );
      }
      return result;
    } catch (err: any) {
      this.logger.error("LLM question generation failed: " + err.message);
      return this.generateFallbackQuestions(
        context,
        existingTitles,
        batchSize,
        batchIndex,
      );
    }
  }

  private normalizeCategory(raw: string): QuestionCategory {
    const s = (raw || "").trim().toUpperCase();
    if (["FUNDAMENTAL", "PROJECT", "SCENARIO", "COMPREHENSIVE"].includes(s)) {
      return s as QuestionCategory;
    }
    if (s.includes("八股") || s.includes("基础")) return "FUNDAMENTAL";
    if (s.includes("项目") || s.includes("深挖")) return "PROJECT";
    if (s.includes("场景")) return "SCENARIO";
    if (s.includes("综合")) return "COMPREHENSIVE";
    return "FUNDAMENTAL";
  }

  private extractRoleHint(context: string): string {
    // Try to detect role/industry from JD content
    const hasJD = context.includes("岗位JD");
    const hasResume = context.includes("简历");

    // Extract all potential tech/skill keywords for role inference
    const techPatterns: Record<string, string> = {
      frontend:
        "React|Vue|Angular|JavaScript|TypeScript|CSS|HTML|Webpack|Vite|小程序|H5|前端|Flutter|React Native",
      backend:
        "Java|Spring|Go|Python|Node\\.js|Rust|C\\+\\+|微服务|分布式|MySQL|PostgreSQL|Redis|Kafka|RabbitMQ|Docker|K8s|后端|API",
      algorithm:
        "机器学习|深度学习|NLP|CV|推荐系统|PyTorch|TensorFlow|Transformer|LLM|算法|模型",
      data: "数据分析|数据仓库|ETL|SQL|Hive|Spark|Flink|数据治理|BI|数仓|大数据",
      product: "产品经理|PRD|需求分析|用户研究|竞品分析|产品规划|A/B测试",
      devops:
        "DevOps|CI/CD|Jenkins|Docker|Kubernetes|运维|SRE|监控|告警|Terraform",
      mobile: "iOS|Android|Swift|Kotlin|Flutter|React Native|移动端|App",
      testing: "自动化测试|性能测试|测试用例|Selenium|JUnit|pytest|质量保障",
      security: "安全|渗透|WAF|SQL注入|XSS|加密|零信任|安全合规",
    };

    let detectedRole = "";
    let detectedTechs: string[] = [];

    for (const [role, pattern] of Object.entries(techPatterns)) {
      const regex = new RegExp(pattern, "gi");
      const matches = context.match(regex);
      if (matches && matches.length >= 2) {
        if (!detectedRole) detectedRole = role;
        detectedTechs.push(...matches);
      }
    }

    // Deduplicate
    detectedTechs = [...new Set(detectedTechs)].filter((t) => t.length > 1);

    if (!detectedRole && !detectedTechs.length) {
      return "";
    }

    const roleLabelMap: Record<string, string> = {
      frontend: "前端开发",
      backend: "后端开发",
      algorithm: "算法工程师",
      data: "数据工程师",
      product: "产品经理",
      devops: "运维/DevOps",
      mobile: "移动端开发",
      testing: "测试工程师",
      security: "安全工程师",
    };

    const roleLabel = detectedRole
      ? roleLabelMap[detectedRole] || detectedRole
      : "技术岗";

    return `\n=== 岗位推断 ===\n从资料分析，候选人目标岗位大概率是：**${roleLabel}**\n涉及技术/技能：${detectedTechs.slice(0, 15).join("、") || "从资料中提取"}\n请围绕${roleLabel}的核心能力要求设计题目。`;
  }

  private generateFallbackQuestions(
    context: string,
    existingTitles: string[],
    batchSize: number,
    batchIndex: number,
  ): GeneratedQuestion[] {
    // Extract tech stack from analysis results (more reliable than regex)
    const techStackPattern = /技术栈[：:]\s*([^\n]+)/g;
    let analysisTechs: string[] = [];
    let techMatch;
    while ((techMatch = techStackPattern.exec(context)) !== null) {
      analysisTechs.push(
        ...techMatch[1]
          .split(/[、,，]/)
          .map((t: string) => t.trim())
          .filter((t) => t.length > 1),
      );
    }
    analysisTechs = [...new Set(analysisTechs)];

    // Also extract Chinese domain keywords from analysis
    const cnPattern = /关键领域[：:]\s*([^\n]+)/;
    const cnMatch = context.match(cnPattern);
    const cnKeywords = cnMatch
      ? cnMatch[1].split("、").filter((k) => k.length > 1)
      : [];

    // Extract additional English tech terms from raw context
    const techPattern =
      /[A-Z][a-zA-Z0-9+#.]+|React|Vue|Angular|JavaScript|TypeScript|Node\.js|Webpack|Vite|CSS|HTML|MySQL|PostgreSQL|Redis|Docker|Kubernetes|Git|Python|Java|Go|Rust|Spring|Kafka|Spark|Flink|Hadoop|TensorFlow|PyTorch|SQL|Linux|AWS|Nginx|MongoDB|GraphQL|gRPC|Dubbo|Elasticsearch|Prometheus|Grafana/g;
    const regexTechs = context.match(techPattern) || [];

    // Merge: analysis techs first (higher priority), then regex techs
    const allTechs = [...analysisTechs, ...regexTechs];
    const uniqueTech = [...new Set(allTechs)].filter(
      (t) =>
        t.length > 2 &&
        ![
          "The",
          "And",
          "For",
          "This",
          "API",
          "URL",
          "HTTP",
          "HTTPS",
          "TCP",
          "UDP",
          "GET",
          "POST",
          "PUT",
          "XML",
          "JSON",
          "CSV",
          "YAML",
        ].includes(t),
    );

    // Build FUNDAMENTAL questions from tech terms with varied templates
    const fundamentalTemplates = [
      (t: string) => `${t} 的核心设计思想和底层实现原理是什么？`,
      (t: string) => `${t} 有哪些关键特性？它是如何解决之前技术方案痛点的？`,
      (t: string) => `详细解释一下 ${t} 的工作机制，以及它的核心算法/数据结构`,
      (t: string) =>
        `${t} 和其他同类方案（如果有的话）在架构和适用场景上有什么区别？`,
      (t: string) => `在 ${t} 中，有哪些容易被忽视的细节或常见理解误区？`,
      (t: string) =>
        `${t} 在面试中常被问到哪些方面？请挑一个最核心的点展开说说`,
      (t: string) =>
        `如何评估 ${t} 在一个项目中的适用性？选型时需要考虑哪些关键因素？`,
      (t: string) => `${t} 的性能优化方向有哪些？请结合具体场景说明`,
      (t: string) => `${t} 有哪些典型的反模式或常见错误用法？如何避免？`,
      (t: string) => `谈谈你对 ${t} 发展趋势的理解，以及它对行业的影响`,
    ];

    const fundamentalQuestions: GeneratedQuestion[] = uniqueTech
      .slice(0, 10)
      .map((tech, i) => ({
        category: "FUNDAMENTAL" as QuestionCategory,
        title: fundamentalTemplates[i % fundamentalTemplates.length](tech),
        frequency: "中" as const,
        insight: `考察${tech}的理解深度和实际应用能力`,
      }));

    // Add Chinese-domain questions if available
    for (const kw of cnKeywords.slice(0, 3)) {
      fundamentalQuestions.push({
        category: "FUNDAMENTAL" as QuestionCategory,
        title: `请详细解释一下${kw}相关的核心概念，以及在实际工作中你如何应用？`,
        frequency: "高" as const,
        insight: `考察候选人在${kw}领域的知识深度和实践经验`,
      });
    }

    // Generic PROJECT questions (role-agnostic, dive into actual project details)
    const projectQuestions: GeneratedQuestion[] = [
      {
        category: "PROJECT",
        title: "你在项目中遇到的最大技术挑战是什么？具体是怎么分析和解决的？",
        frequency: "高",
        insight: "考察问题解决能力、技术深度、复盘总结习惯",
      },
      {
        category: "PROJECT",
        title:
          "如果让你重新设计这个系统/项目，你会在架构设计、技术选型上做哪些不同的决策？为什么？",
        frequency: "高",
        insight: "考察技术视野、架构演进思考、经验总结能力",
      },
      {
        category: "PROJECT",
        title:
          "你在这个项目中做了哪些具体的优化工作？优化前指标是多少，优化后提升了多少？",
        frequency: "高",
        insight: "考察用数据驱动的性能/效率优化方法论",
      },
      {
        category: "PROJECT",
        title: "你在项目中是如何做技术选型的？有没有选型后发现问题调整的经历？",
        frequency: "高",
        insight: "考察技术判断力、决策框架、从失败中学习的能力",
      },
      {
        category: "PROJECT",
        title:
          "你在这个项目中推动过哪些技术改进或重构？推进过程中遇到了什么阻力？你是如何推动落地的？",
        frequency: "高",
        insight: "考察技术推动力、跨团队沟通、变革管理能力",
      },
      {
        category: "PROJECT",
        title:
          "你参与的项目中，线上出过最严重的事故是什么？复盘后做了哪些改进来防止再次发生？",
        frequency: "中",
        insight: "考察故障复盘能力、质量意识、系统稳定性思维",
      },
      {
        category: "PROJECT",
        title:
          "你负责的项目中，有没有因为方案设计不当导致后期返工的情况？你是如何提前识别和规避风险的？",
        frequency: "高",
        insight: "考察技术方案设计能力、风险预判、复盘习惯",
      },
      {
        category: "PROJECT",
        title:
          "你在项目中是如何平衡业务需求交付速度和工程质量/技术债务的？请举一个具体的例子",
        frequency: "高",
        insight: "考察工程权衡能力、业务理解、技术债务管理意识",
      },
    ];

    // Generic SCENARIO questions (role-agnostic)
    const scenarioQuestions: GeneratedQuestion[] = [
      {
        category: "SCENARIO",
        title:
          "线上系统突然出现大面积故障/性能退化，你作为值班负责人会怎么排查和应急处理？请描述完整的排查流程",
        frequency: "高",
        insight: "考察故障排查思路、应急响应能力、冷静分析能力",
      },
      {
        category: "SCENARIO",
        title:
          "业务方要求在很短的周期内上线一个复杂需求，资源有限，你会怎么评估、拆分和推动落地？",
        frequency: "高",
        insight: "考察项目管理能力、需求拆解思维、风险预估和沟通意识",
      },
      {
        category: "SCENARIO",
        title:
          "你发现团队维护的某个模块存在严重的设计缺陷，但重构成本很高且业务压力大，你会怎么处理？",
        frequency: "中",
        insight: "考察技术权衡能力、沟通说服力、渐进式改进的思路",
      },
      {
        category: "SCENARIO",
        title:
          "你设计的一个方案被同事/上级质疑有更好的替代方案，但你觉得自己的方案更合适，你会怎么沟通和决策？",
        frequency: "中",
        insight: "考察技术沟通能力、接受反馈的心态、决策能力",
      },
    ];

    // Generic COMPREHENSIVE questions (role-agnostic)
    const comprehensiveQuestions: GeneratedQuestion[] = [
      {
        category: "COMPREHENSIVE",
        title:
          "从零开始设计一个完整的业务系统，你会怎么进行需求分析、技术选型、架构设计和落地规划？",
        frequency: "中",
        insight: "考察系统设计全流程能力、技术广度、方案落地能力",
      },
      {
        category: "COMPREHENSIVE",
        title:
          "如何为团队搭建一套完善的质量保障体系（包括代码审查、自动化测试、监控告警、发布流程等）？",
        frequency: "中",
        insight: "考察工程化思维、质量意识、团队规范建设经验",
      },
      {
        category: "COMPREHENSIVE",
        title:
          "作为团队的技术负责人，你会如何制定技术规划、管理技术债务、推动技术创新？",
        frequency: "低",
        insight: "考察技术领导力、技术规划能力、团队建设能力",
      },
    ];

    // Vary fixed questions by batch to avoid exact duplicate detection
    const suffix = batchIndex > 1 ? " (第" + batchIndex + "批)" : "";
    const allQuestions: GeneratedQuestion[] = [
      ...fundamentalQuestions
        .slice(0, 5)
        .map((q) =>
          batchIndex > 1
            ? { ...q, title: q.title.replace(/([？?])$/, suffix + "$1") }
            : q,
        ),
      ...projectQuestions
        .slice(0, 8)
        .map((q) =>
          batchIndex > 1
            ? { ...q, title: q.title.replace(/([？?])$/, suffix + "$1") }
            : q,
        ),
      ...scenarioQuestions
        .slice(0, 4)
        .map((q) =>
          batchIndex > 1
            ? { ...q, title: q.title.replace(/([？?])$/, suffix + "$1") }
            : q,
        ),
      ...comprehensiveQuestions
        .slice(0, 3)
        .map((q) =>
          batchIndex > 1
            ? { ...q, title: q.title.replace(/([？?])$/, suffix + "$1") }
            : q,
        ),
    ];

    const available = allQuestions.filter(
      (q) => !existingTitles.includes(q.title),
    );

    // Fill up to batchSize with varied tech-based questions if needed
    const fillTemplates = [
      (t: string) => `请详细解释一下 ${t} 的底层原理和核心机制`,
      (t: string) => `${t} 在实际生产环境中应该如何配置和调优？`,
      (t: string) => `你在项目中使用 ${t} 时遇到过哪些坑？怎么解决的？`,
      (t: string) => `对比一下 ${t} 和其他可选方案的优劣`,
      (t: string) => `从零开始搭建 ${t} 相关的技术方案，你会如何设计？`,
    ];
    const questions: GeneratedQuestion[] = [...available];
    if (questions.length < batchSize && uniqueTech.length > 0) {
      for (
        let i = 0;
        i < batchSize - questions.length && i < uniqueTech.length;
        i++
      ) {
        const tech = uniqueTech[i];
        questions.push({
          category: "FUNDAMENTAL" as QuestionCategory,
          title: fillTemplates[i % fillTemplates.length](tech),
          frequency: "中" as const,
          insight: `考察${tech}的知识深度和理解水平`,
        });
      }
    }

    return questions.slice(0, batchSize);
  }

  private async storeQuestions(
    userId: string,
    questions: GeneratedQuestion[],
    batchIndex: number,
  ) {
    const created = await Promise.all(
      questions.map(async (q) => {
        const question = await this.prisma.question.create({
          data: {
            userId,
            category: q.category,
            title: q.title,
            frequency: q.frequency,
            batchIndex,
          },
        });

        // Also create a QuestionAnswer with the insight pre-filled
        if (q.insight) {
          await this.prisma.questionAnswer.create({
            data: {
              questionId: question.id,
              answer: "",
              insight: q.insight,
              followUps: [],
            },
          });
        }

        return question;
      }),
    );
    return created;
  }

  async clearAllQuestions(userId: string) {
    await this.prisma.questionAnswer.deleteMany({
      where: { question: { userId } },
    });
    await this.prisma.question.deleteMany({ where: { userId } });
    return { success: true };
  }

  async deleteQuestion(id: string) {
    await this.prisma.questionAnswer.deleteMany({ where: { questionId: id } });
    await this.prisma.question.delete({ where: { id } });
    return { success: true };
  }

  async saveFollowUpThreads(questionId: string, followUpThreads: any[]) {
    const existing = await this.prisma.questionAnswer.findFirst({
      where: { questionId },
    });

    if (existing) {
      await this.prisma.questionAnswer.update({
        where: { id: existing.id },
        data: { followUpThreads: followUpThreads as any },
      });
    } else {
      await this.prisma.questionAnswer.create({
        data: {
          questionId,
          answer: "",
          followUps: [],
          followUpThreads: followUpThreads as any,
        },
      });
    }

    return { success: true };
  }

  private async getNextBatchIndex(userId: string) {
    const last = await this.prisma.question.findFirst({
      where: { userId },
      orderBy: { batchIndex: "desc" },
      select: { batchIndex: true },
    });
    return last ? last.batchIndex + 1 : 1;
  }
}
