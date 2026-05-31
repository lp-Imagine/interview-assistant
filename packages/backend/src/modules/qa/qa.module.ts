import { Module } from "@nestjs/common";
import { QaService } from "./qa.service";
import { QaController } from "./qa.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { RagModule } from "../rag/rag.module";

@Module({
  imports: [RagModule],
  controllers: [QaController],
  providers: [QaService, PrismaService],
})
export class QaModule {}
