import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import * as fs from "fs";
const pdfParse = require("pdf-parse");

const CHUNK_SIZE = 512;
const CHUNK_OVERLAP = 50;

const TECH_KEYWORDS = [
  "Redis",
  "Kafka",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Elasticsearch",
  "Spring",
  "Spring Boot",
  "MyBatis",
  "Hibernate",
  "Docker",
  "Kubernetes",
  "RabbitMQ",
  "RocketMQ",
  "Nginx",
  "Netty",
  "gRPC",
  "Dubbo",
  "ZooKeeper",
  "Jenkins",
  "GitLab CI",
  "GitHub Actions",
  "AWS",
  "阿里云",
  "腾讯云",
  "React",
  "Vue",
  "Angular",
  "Node.js",
  "TypeScript",
  "Python",
  "Go",
  "Java",
  "C++",
  "高并发",
  "分布式",
  "微服务",
  "缓存",
  "消息队列",
  "分布式事务",
  "秒杀",
  "JVM",
  "多线程",
  "设计模式",
  "DevOps",
  "CI/CD",
  "敏捷开发",
  "TDD",
  "DDD",
];

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private openai: any = null;

  constructor(private prisma: PrismaService) {}

  private getOpenAI() {
    if (!this.openai) {
      const OpenAI = require("openai").OpenAI;
      this.openai = new OpenAI({
        apiKey: process.env.EMBEDDING_API_KEY,
        baseURL: process.env.EMBEDDING_BASE_URL,
      });
    }
    return this.openai;
  }

  async processDocument(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException("Document not found");

    await this.prisma.document.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    try {
      // 1. Parse document text
      const text = await this.parseFile(doc.fileUrl);
      if (!text.trim()) throw new Error("Empty document content");

      // 2. Chunk the text
      const chunks = this.chunkText(text);

      // 3. Generate embeddings and store chunks
      const embeddings = await this.generateEmbeddings(chunks);
      await this.storeChunksWithEmbeddings(id, chunks, embeddings);

      // 4. Extract tech keywords
      const { techStack, keywords } = this.extractKeywords(text);

      // 5. Save analysis result
      await this.prisma.analysisResult.upsert({
        where: { documentId: id },
        create: {
          documentId: id,
          techStack,
          keywords,
          summary: text.slice(0, 200),
        },
        update: {
          techStack,
          keywords,
          summary: text.slice(0, 200),
        },
      });

      await this.prisma.document.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      this.logger.log(`Document ${id} processed: ${chunks.length} chunks`);
      return { id, status: "COMPLETED", chunkCount: chunks.length };
    } catch (err: any) {
      this.logger.error(`Failed to process document ${id}: ${err.message}`);
      await this.prisma.document.update({
        where: { id },
        data: { status: "FAILED" },
      });
      throw err;
    }
  }

  async getStatus(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { analysis: true },
    });
    if (!doc) throw new NotFoundException("Document not found");
    const chunkCount = await this.prisma.chunk.count({
      where: { documentId: id },
    });
    return { id, status: doc.status, chunkCount, analysis: doc.analysis };
  }

  async searchSimilar(query: string, limit = 5): Promise<string[]> {
    if (!query.trim()) return [];

    try {
      // Generate query embedding
      const [queryEmbedding] = await this.generateEmbeddings([query]);
      const embeddingStr = `[${queryEmbedding.join(",")}]`;

      // pgvector cosine similarity search (1 - cosine_distance)
      const result: any[] = await this.prisma.$queryRawUnsafe(
        `SELECT content, 1 - (embedding <=> $1::vector) AS similarity
         FROM "Chunk"
         WHERE embedding IS NOT NULL
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        embeddingStr,
        limit,
      );

      return result.map((r: any) => r.content);
    } catch (err: any) {
      // 本地无 pgvector 或向量不可用时降级：返回最近上传的 chunks
      this.logger.warn(
        `Vector search unavailable (${err.message}), falling back to recent chunks`,
      );
      const chunks = await this.prisma.chunk.findMany({
        orderBy: { chunkIndex: "asc" },
        take: limit,
      });
      return chunks.map((c: any) => c.content);
    }
  }

  private async parseFile(filePath: string): Promise<string> {
    const buffer = fs.readFileSync(filePath);
    let text: string;

    if (filePath.endsWith(".pdf")) {
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (filePath.endsWith(".docx")) {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      text = buffer.toString("utf-8");
    }

    return this.sanitizeText(text);
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/\x00/g, "") // null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // other control chars (keep \n \t \r)
      .trim();
  }

  private chunkText(text: string): string[] {
    // Simple sentence-aware chunking
    const sentences = text.split(/(?<=[。！？.!?\n])\s*/);
    const chunks: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if ((current + sentence).length > CHUNK_SIZE && current.length > 0) {
        chunks.push(current.trim());
        // Keep overlap
        const overlapWords = current.split("").slice(-CHUNK_OVERLAP).join("");
        current = overlapWords + sentence;
      } else {
        current += sentence;
      }
    }

    if (current.trim()) {
      chunks.push(current.trim());
    }

    return chunks.filter((c) => c.length > 10);
  }

  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const openai = this.getOpenAI();
    const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
    // 多模态向量模型（如 doubao-embedding-vision-*）走 /embeddings/multimodal，
    // 输入为 {type,text} 扁平项，且一次请求只返回一个向量，需逐条调用。
    const isMultimodal =
      process.env.EMBEDDING_ENDPOINT === "multimodal" ||
      /vision|multimodal/i.test(model);

    if (isMultimodal) {
      const baseUrl = (process.env.EMBEDDING_BASE_URL || "").replace(/\/$/, "");
      const headers = {
        Authorization: `Bearer ${process.env.EMBEDDING_API_KEY}`,
        "Content-Type": "application/json",
      };
      const allEmbeddings: number[][] = [];
      for (const text of texts) {
        const res = await fetch(`${baseUrl}/embeddings/multimodal`, {
          method: "POST",
          headers,
          body: JSON.stringify({ model, input: [{ type: "text", text }] }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(
            `Multimodal embedding failed (${res.status}): ${body}`,
          );
        }
        const json = await res.json();
        const emb = json?.data?.embedding;
        if (!Array.isArray(emb)) {
          throw new Error(
            `Multimodal embedding response missing data.embedding: ${JSON.stringify(json)}`,
          );
        }
        allEmbeddings.push(emb);
      }
      return allEmbeddings;
    }

    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await openai.embeddings.create({
        model,
        input: batch,
      });
      allEmbeddings.push(...response.data.map((d: any) => d.embedding));
    }

    return allEmbeddings;
  }

  private async storeChunksWithEmbeddings(
    documentId: string,
    texts: string[],
    embeddings: number[][],
  ) {
    // Delete existing chunks
    await this.prisma.chunk.deleteMany({ where: { documentId } });

    // 检测数据库是否支持 pgvector（本地开发库可能没有 vector 扩展）
    let vectorSupported = true;
    try {
      await this.prisma.$executeRawUnsafe(
        `SELECT embedding::vector FROM "Chunk" LIMIT 0`,
      );
    } catch {
      vectorSupported = false;
      this.logger.warn(
        "pgvector not available (Chunk.embedding), skipping vector storage",
      );
    }

    for (let i = 0; i < texts.length; i++) {
      const embeddingStr = `[${embeddings[i].join(",")}]`;

      // Insert chunk without embedding first
      const chunk = await this.prisma.chunk.create({
        data: {
          documentId,
          content: texts[i],
          chunkIndex: i,
        },
      });

      // Use raw SQL to set vector embedding (only when pgvector exists)
      if (vectorSupported) {
        try {
          await this.prisma.$executeRawUnsafe(
            `UPDATE "Chunk" SET embedding = $1::vector WHERE id = $2`,
            embeddingStr,
            chunk.id,
          );
        } catch (err: any) {
          this.logger.warn(
            `Failed to store embedding for chunk ${chunk.id}: ${err.message}`,
          );
        }
      }
    }
  }

  // Patterns needing word-boundary match (common words that cause false positives)
  private static BOUNDARY_PATTERNS: Map<string, RegExp> = new Map([
    ["React", /\bReact\b/i],
    ["Vue", /\bVue\b/i],
    ["Angular", /\bAngular\b/i],
    ["Spring", /\bSpring\b/i],
    ["Python", /\bPython\b/i],
    ["Java", /\bJava\b/i],
    ["Nginx", /\bNginx\b/i],
    ["AWS", /\bAWS\b/i],
    ["DevOps", /\bDevOps\b/i],
    ["CI/CD", /\bCI\/CD\b/],
    ["TDD", /\bTDD\b/],
    ["DDD", /\bDDD\b/],
    ["JVM", /\bJVM\b/],
    ["Go", /\bGo\b/],
    ["C++", /\bC\+\+\b/],
  ]);

  private matchKeyword(text: string, kw: string): boolean {
    const pattern = RagService.BOUNDARY_PATTERNS.get(kw);
    if (pattern) {
      return pattern.test(text);
    }
    // Safe substring match for unique names and Chinese terms
    return text.toLowerCase().includes(kw.toLowerCase());
  }

  private extractKeywords(text: string): {
    techStack: string[];
    keywords: string[];
  } {
    const techStack: string[] = [];
    const keywords: string[] = [];

    for (const kw of TECH_KEYWORDS) {
      if (!this.matchKeyword(text, kw)) continue;

      if (
        [
          "Redis",
          "Kafka",
          "MySQL",
          "MongoDB",
          "PostgreSQL",
          "RabbitMQ",
          "Docker",
          "Kubernetes",
          "Elasticsearch",
          "React",
          "Vue",
          "Angular",
          "Spring",
          "Node.js",
          "TypeScript",
          "Python",
          "Go",
          "Java",
        ].includes(kw)
      ) {
        techStack.push(kw);
      } else {
        keywords.push(kw);
      }
    }

    return { techStack, keywords };
  }
}
