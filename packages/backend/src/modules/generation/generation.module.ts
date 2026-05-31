import { Module } from "@nestjs/common";
import { GenerationService } from "./generation.service";
import { GenerationController } from "./generation.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { RagModule } from "../rag/rag.module";

@Module({
  imports: [RagModule],
  controllers: [GenerationController],
  providers: [GenerationService, PrismaService],
})
export class GenerationModule {}
