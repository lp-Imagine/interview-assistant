import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { DocumentsService } from "./documents.service";
import { DocumentType } from "@prisma/client";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@Controller("documents")
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (_req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(
            Buffer.from(file.originalname, "latin1").toString("utf8"),
          );
          cb(null, uniqueSuffix + ext);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("type") type: DocumentType,
    @CurrentUser() user: { id: string; email: string },
  ) {
    const decodedName = Buffer.from(file.originalname, "latin1").toString(
      "utf8",
    );
    return this.documentsService.upload(user.id, type, decodedName, file.path);
  }

  @Get()
  findAll(@CurrentUser() user: { id: string; email: string }) {
    return this.documentsService.findAll(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.documentsService.findOne(id);
  }

  @Post("text")
  async createFromText(
    @Body("type") type: DocumentType,
    @Body("title") title: string,
    @Body("content") content: string,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.documentsService.createFromText(user.id, type, title, content);
  }

  @Post("url")
  async createFromUrl(
    @Body("type") type: DocumentType,
    @Body("title") title: string,
    @Body("url") url: string,
    @CurrentUser() user: { id: string; email: string },
  ) {
    return this.documentsService.createFromUrl(user.id, type, title, url);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.documentsService.remove(id);
  }
}
