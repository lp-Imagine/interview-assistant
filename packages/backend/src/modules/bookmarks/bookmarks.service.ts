import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      question: string;
      answer: string;
      structure?: Array<{ step: number; content: string }>;
      followUps?: string[];
      insight?: string;
      followUpThreads?: Array<{
        id: string;
        question: string;
        answer: string;
        isStreaming: boolean;
      }>;
    },
  ) {
    return this.prisma.bookmark.create({
      data: {
        userId,
        question: data.question,
        answer: data.answer,
        structure: (data.structure as any) ?? Prisma.JsonNull,
        followUps: data.followUps ?? [],
        insight: data.insight ?? null,
        followUpThreads: (data.followUpThreads as any) ?? Prisma.JsonNull,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.bookmark.deleteMany({
      where: { id, userId },
    });
  }
}
