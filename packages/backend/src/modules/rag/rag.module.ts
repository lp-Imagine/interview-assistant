import { Module } from "@nestjs/common";
import { RagService } from "./rag.service";
import { RagController } from "./rag.controller";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [RagController],
  providers: [RagService, PrismaService],
  exports: [RagService],
})
export class RagModule {}
