import "reflect-metadata";
import { json } from "express";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 语音识别录音（base64 JSON）可达数 MB，放宽 body 限制
  app.use(json({ limit: "12mb" }));
  // 生产用 CORS_ORIGINS 环境变量（逗号分隔）；本地开发默认 localhost:5173
  const corsOrigins = (
    process.env.CORS_ORIGINS ?? "http://localhost:5173,http://127.0.0.1:5173"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });
  app.setGlobalPrefix("api");
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(
    `Backend running on http://localhost:${port} (cors: ${corsOrigins.join(", ")})`,
  );
}
bootstrap();
