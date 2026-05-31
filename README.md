# Interview AI — 智能面试准备助手

基于 AI 的面试准备平台，支持上传简历、职位描述、面经等文档，自动解析并生成针对性面试题目，通过流式 SSE 实时输出 AI 生成的答案与解题思路。

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia + Vue Router + Naive UI |
| 后端 | NestJS + TypeScript + Prisma + PostgreSQL + Redis |
| AI/LLM | OpenAI 兼容 API（GPT-4.1）+ text-embedding-3-small |
| 向量检索 | pgvector（PostgreSQL 扩展） |
| 文档解析 | pdf-parse + mammoth（PDF/DOCX/TXT） |
| 基础设施 | Docker Compose（PostgreSQL pgvector + Redis） |

## 项目结构

```
ai-interview/
├── packages/
│   ├── frontend/          # Vue 3 前端
│   │   └── src/
│   │       ├── api/       # API 请求层
│   │       ├── components/# 公共组件
│   │       ├── pages/     # 页面组件
│   │       ├── stores/    # Pinia 状态管理
│   │       ├── router/    # 路由配置
│   │       └── styles/    # 全局样式
│   ├── backend/           # NestJS 后端
│   │   └── src/
│   │       ├── modules/   # 业务模块
│   │       │   ├── auth/       # JWT 认证
│   │       │   ├── documents/  # 文档管理
│   │       │   ├── rag/        # 文档解析与向量检索
│   │       │   ├── generation/ # 题目生成
│   │       │   ├── qa/         # AI 问答（SSE 流式）
│   │       │   └── bookmarks/  # 收藏管理
│   │       └── prisma/   # 数据库服务
│   └── shared/            # 共享类型定义
```

## 功能概览

### 📂 文档管理
- 上传简历、JD、面经（支持 PDF/DOCX/TXT 文件及文本/URL 粘贴）
- 自动解析文档内容，提取技术栈与关键词
- 文档分块 + 向量嵌入 + pgvector 相似度检索

### 🎯 面试工作台
- AI 根据文档内容推断岗位、级别、领域
- 批量生成 20 道面试题目（基础 / 项目深挖 / 场景 / 综合四类）
- 支持重新生成、继续生成
- 题目搜索、分类筛选、分页浏览

### 💡 AI 答案流式输出
- SSE 实时流式输出，打字机动画效果
- 结构化答案：正文 + 思路拆解 + 追问 + 洞察
- 支持多轮追问（单个问题内上下文持续对话）
- 答案缓存，切换题目不丢失

### 💬 AI 问答
- 独立自由问答页面
- 聊天记录持久化
- 支持复制、下载 Markdown

### ⭐ 收藏
- 收藏优质问答，随时回顾
- 支持取消收藏

### 🔐 认证
- JWT 邮箱注册/登录
- 全局路由守卫，未登录自动跳转

## 本地运行

### 环境要求

- Node.js >= 18
- Docker Desktop（或本地 PostgreSQL + Redis）

### 启动步骤

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，填写 OPENAI_API_KEY 等

# 2. 启动依赖服务（PostgreSQL pgvector + Redis）
docker compose up -d

# 3. 安装依赖
npm install

# 4. 执行数据库迁移
npm run db:migrate

# 5. 启动后端（端口 3000）
npm run dev:backend

# 6. 另开终端，启动前端（端口 5173）
npm run dev:frontend
```

浏览器打开 `http://localhost:5173`，注册账号后即可使用。

### 其他命令

```bash
npm run build:frontend   # 构建前端
npm run build:backend    # 构建后端
npm run db:generate      # 重新生成 Prisma 客户端
npm run commit           # 交互式提交（commitizen）
```

## 环境变量

参考 `.env.example`：

| 变量 | 说明 | 默认值 |
|---|---|---|
| `DATABASE_URL` | PostgreSQL 连接串 | `postgresql://postgres:postgres@localhost:5432/interview` |
| `REDIS_HOST` | Redis 地址 | `localhost` |
| `REDIS_PORT` | Redis 端口 | `6379` |
| `JWT_SECRET` | JWT 签名密钥 | 开发环境有 fallback |
| `OPENAI_API_KEY` | OpenAI API Key | - |
| `OPENAI_BASE_URL` | API 代理地址 | `https://api.openai.com/v1` |
| `LLM_MODEL` | 大模型名称 | `gpt-4.1` |

