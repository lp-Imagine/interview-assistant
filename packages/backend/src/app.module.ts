import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PrismaService } from "./prisma/prisma.service";
import { DocumentsModule } from "./modules/documents/documents.module";
import { RagModule } from "./modules/rag/rag.module";
import { GenerationModule } from "./modules/generation/generation.module";
import { QaModule } from "./modules/qa/qa.module";
import { BookmarksModule } from "./modules/bookmarks/bookmarks.module";
import { AuthModule } from "./modules/auth/auth.module";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";

@Module({
  imports: [
    AuthModule,
    DocumentsModule,
    RagModule,
    GenerationModule,
    QaModule,
    BookmarksModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
