import { Controller, Post, Get, Delete, Body, Param } from "@nestjs/common";
import { BookmarksService } from "./bookmarks.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  create(
    @Body()
    body: {
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
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.bookmarksService.create(user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string; email: string }) {
    return this.bookmarksService.findAll(user.id);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.bookmarksService.remove(user.id, id);
  }
}
