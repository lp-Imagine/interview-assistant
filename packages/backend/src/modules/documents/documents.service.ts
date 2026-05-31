import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { DocumentType } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(private prisma: PrismaService) {}

  async upload(
    userId: string,
    type: DocumentType,
    fileName: string,
    fileUrl: string,
  ) {
    return this.prisma.document.create({
      data: { userId, type, fileName, fileUrl },
    });
  }

  async createFromText(
    userId: string,
    type: DocumentType,
    title: string,
    content: string,
  ) {
    if (!title?.trim()) throw new BadRequestException("Title is required");
    if (!content?.trim()) throw new BadRequestException("Content is required");

    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const safeName = title.replace(/[^a-zA-Z一-龥\d_-]/g, "_").slice(0, 50);
    const filename = `text-${safeName}-${Date.now()}.txt`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, content, "utf-8");

    return this.prisma.document.create({
      data: { userId, type, fileName: title, fileUrl: filePath },
    });
  }

  async createFromUrl(
    userId: string,
    type: DocumentType,
    title: string,
    url: string,
  ) {
    if (!title?.trim()) throw new BadRequestException("Title is required");
    if (!url?.trim()) throw new BadRequestException("URL is required");

    let content: string;
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(30000),
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      content = await response.text();
    } catch (err: any) {
      this.logger.error(`Failed to fetch URL: ${err.message}`);
      throw new BadRequestException(`无法读取链接内容: ${err.message}`);
    }

    if (!content?.trim()) throw new BadRequestException("链接内容为空");

    // Strip HTML tags if content looks like HTML
    const lower = content.slice(0, 1000).toLowerCase();
    if (
      lower.includes("<html") ||
      lower.includes("<!doctype") ||
      lower.includes("<head") ||
      lower.includes("<body")
    ) {
      content = content
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "\n")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }

    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const safeName = title.replace(/[^a-zA-Z一-龥\d_-]/g, "_").slice(0, 50);
    const filename = `url-${safeName}-${Date.now()}.txt`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, content, "utf-8");

    return this.prisma.document.create({
      data: { userId, type, fileName: title, fileUrl: filePath },
    });
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      include: { analysis: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: { analysis: true, chunks: true },
    });
    if (!doc) throw new NotFoundException("Document not found");
    return doc;
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundException("Document not found");

    // Delete physical file
    try {
      if (fs.existsSync(doc.fileUrl)) {
        fs.unlinkSync(doc.fileUrl);
      }
    } catch (err) {
      this.logger.warn(`Failed to delete file: ${doc.fileUrl}`);
    }

    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }
}
