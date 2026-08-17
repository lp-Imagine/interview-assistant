#!/usr/bin/env bash
# ============================================================
# interview-assistant 服务器一键部署脚本（后端 + Postgres + Redis）
#
# 用法（在项目根目录执行）：
#   bash scripts/server-deploy.sh
#
# 前置要求：
#   - 服务器已装 Docker + docker compose
#   - 已创建 .env（参考 .env.example；至少填 DATABASE_URL、REDIS_HOST/PORT、
#     JWT_SECRET、OPENAI_API_KEY、CORS_ORIGINS）
#   - Node 18+（建议 20 LTS）
#
# 脚本做四件事：
#   1. docker compose up -d       起 Postgres(pgvector) + Redis
#   2. npm ci                     安装依赖
#   3. prisma migrate deploy      建表/迁移
#   4. 构建后端并用 pm2 守护启动
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

echo "==> [1/5] 检查 .env"
if [ ! -f .env ]; then
  echo "  未找到 .env，已从 .env.example 复制，请编辑后重跑！"
  cp .env.example .env
  echo "  必须修改：DATABASE_URL / REDIS_HOST / REDIS_PORT / JWT_SECRET / OPENAI_API_KEY / CORS_ORIGINS"
  exit 1
fi

echo "==> [2/5] 启动 Postgres + Redis (docker compose)"
docker compose up -d

echo "==> [3/5] 安装依赖 (npm ci)"
npm ci

echo "==> [4/5] 数据库迁移 (prisma migrate deploy)"
# 迁移需要 DATABASE_URL；若 .env 未加载则提示
set -a
# shellcheck disable=SC1091
source .env
set +a
npx prisma generate --schema packages/backend/prisma/schema.prisma
npx prisma migrate deploy --schema packages/backend/prisma/schema.prisma

echo "==> [5/5] 构建后端并启动 (pm2)"
npm run build:backend

if ! command -v pm2 >/dev/null 2>&1; then
  echo "  未安装 pm2，全局安装..."
  npm install -g pm2
fi

pm2 start "$ROOT/packages/backend/dist/main.js" \
  --name ai-interview-backend \
  --cwd "$ROOT" \
  --time || true
pm2 save

echo ""
echo "✅ 部署完成："
echo "   - Postgres : 127.0.0.1:${POSTGRES_PORT:-5433}"
echo "   - Redis    : 127.0.0.1:${REDIS_PORT:-6380}"
echo "   - 后端     : 127.0.0.1:3000 (pm2: ai-interview-backend)"
echo "   - 常用命令 : pm2 logs ai-interview-backend / pm2 restart ai-interview-backend"
echo ""
echo "  Nginx 反代（宝塔站点 interview.draftly.cn 配置文件加）："
echo '  location /api/ { proxy_pass http://127.0.0.1:3000; proxy_buffering off; proxy_read_timeout 600s; }'
