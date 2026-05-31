import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from "@nestjs/common";
import { GenerationService } from "./generation.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("generation")
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Patch("questions/:id/threads")
  saveThreads(
    @Param("id") id: string,
    @Body("followUpThreads") followUpThreads: any[],
  ) {
    return this.generationService.saveFollowUpThreads(id, followUpThreads);
  }

  @Post("questions")
  generate(
    @Body("batchSize") batchSize: number | undefined,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.generationService.generateQuestions(user.id, batchSize);
  }

  @Post("questions/regenerate")
  regenerate(
    @Body("batchSize") batchSize: number | undefined,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.generationService.regenerateQuestions(user.id, batchSize);
  }

  @Post("questions/continue")
  continue(
    @Body("batchSize") batchSize: number | undefined,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.generationService.continueGeneration(user.id, batchSize);
  }

  @Get("questions")
  findAll(
    @Query("category") category: string | undefined,
    @Query("search") search: string | undefined,
    @Query("page") page: string | undefined,
    @Query("pageSize") pageSize: string | undefined,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.generationService.findAll(
      user.id,
      category,
      search,
      page ? parseInt(page) : 1,
      pageSize ? parseInt(pageSize) : 20,
    );
  }

  @Delete("questions")
  clearAll(@CurrentUser() user: { id: string; email: string }) {
    return this.generationService.clearAllQuestions(user.id);
  }

  @Delete("questions/:id")
  delete(@Param("id") id: string) {
    return this.generationService.deleteQuestion(id);
  }
}
