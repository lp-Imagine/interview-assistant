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
# 脚本做的事：
#   1. docker compose up -d          起 Postgres(pgvector) + Redis
#   2. 启用 vector 扩展 + 建表        有 migrations 用 migrate deploy；
#                                    没有（初始部署）用 db push --accept-data-loss
#   3. npm ci                        安装依赖
#   4. 构建后端并用 pm2 守护启动      默认端口 3100（避开 Draftly 等的 3000）
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SCHEMA="packages/backend/prisma/schema.prisma"
DB_CONTAINER="${DB_CONTAINER:-ai-interview-db}"

echo "==> [1/6] 检查 .env"
if [ ! -f .env ]; then
  echo "  未找到 .env，已从 .env.example 复制，请编辑后重跑！"
  cp .env.example .env
  echo "  必须修改：DATABASE_URL / REDIS_HOST / REDIS_PORT / JWT_SECRET / OPENAI_API_KEY / CORS_ORIGINS"
  exit 1
fi
set -a
# shellcheck disable=SC1091
source .env
set +a

echo "==> [2/6] 启动 Postgres + Redis (docker compose)"
docker compose up -d

# 等数据库容器就绪（最多 30s）
echo "==> [3/6] 启用 pgvector 扩展并建表"
for i in $(seq 1 15); do
  if docker exec -i "$DB_CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
docker exec -i "$DB_CONTAINER" psql -U postgres -d "${POSTGRES_DB:-ai_interview}" \
  -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null

# 有 migrations 目录 → migrate deploy；否则初始部署 → db push（空库，--accept-data-loss 安全）
if [ -d "packages/backend/prisma/migrations" ]; then
  npx prisma migrate deploy --schema "$SCHEMA"
else
  npx prisma db push --schema "$SCHEMA" --accept-data-loss
fi

echo "==> [4/6] 安装依赖 (npm ci)"
npm ci

echo "==> [5/6] 构建后端"
npm run build:backend

echo "==> [6/6] 启动后端 (pm2, 端口 ${PORT:-3100})"
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
echo "   - 后端     : 127.0.0.1:${PORT:-3100} (pm2: ai-interview-backend)"
echo "   - 常用命令 : pm2 logs ai-interview-backend / pm2 restart ai-interview-backend"
echo ""
echo "  Nginx 反代（宝塔站点 interview.draftly.cn 配置文件加，注意端口）："
echo "  location /api/ { proxy_pass http://127.0.0.1:${PORT:-3100}; proxy_buffering off; proxy_read_timeout 600s; }"
