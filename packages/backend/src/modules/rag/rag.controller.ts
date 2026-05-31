import { Controller, Post, Get, Param } from "@nestjs/common";
import { RagService } from "./rag.service";

@Controller("documents")
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post("process/:id")
  process(@Param("id") id: string) {
    // Fire-and-forget: process asynchronously so the request doesn't timeout
    this.ragService.processDocument(id).catch((err) => {
      // Error already logged and status set to FAILED in service
    });
    return { id, status: "PROCESSING" };
  }

  @Get(":id/status")
  getStatus(@Param("id") id: string) {
    return this.ragService.getStatus(id);
  }
}
