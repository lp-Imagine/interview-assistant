import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookmarksController } from "./bookmarks.controller";
import { BookmarksService } from "./bookmarks.service";

@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService, PrismaService],
})
export class BookmarksModule {}
