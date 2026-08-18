#!/usr/bin/env bash
# ============================================================
# interview-assistant 一键更新脚本（前端 + 后端）
#
# 用法（在项目根目录执行）：
#   bash scripts/server-update.sh
#
# 流程：
#   1. git pull                    拉取最新代码
#   2. npm ci                      安装依赖（含新增依赖）
#   3. 检测 Prisma schema 是否变化   变了才 db push 建表
#   4. 构建前端 → 拷贝到站点根目录
#   5. 构建后端 → pm2 restart
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"
SCHEMA="packages/backend/prisma/schema.prisma"
# 前端站点根目录（宝塔建站目录），可用环境变量覆盖
SITE_ROOT="${SITE_ROOT:-/www/wwwroot/interview.draftly.cn}"

echo "==> [1/7] 拉取最新代码"
git pull

echo "==> [2/7] 安装依赖 (npm ci)"
npm ci

# 记录更新前后的 schema 是否变化（决定是否需要建表）
SCHEMA_CHANGED=false
if git diff --quiet HEAD@{1} HEAD -- "$SCHEMA" 2>/dev/null; then
  :
else
  SCHEMA_CHANGED=true
fi

echo "==> [3/7] 数据库迁移（仅在 schema 变化时执行）"
set -a
# shellcheck disable=SC1091
source .env
set +a
if [ "$SCHEMA_CHANGED" = "true" ]; then
  docker exec -i "${DB_CONTAINER:-ai-interview-db}" psql -U postgres \
    -d "${POSTGRES_DB:-ai_interview}" -c "CREATE EXTENSION IF NOT EXISTS vector;" >/dev/null
  npx prisma db push --schema "$SCHEMA" --accept-data-loss
  echo "  ✅ schema 已同步"
else
  echo "  schema 无变化，跳过"
fi

echo "==> [4/7] 生成 Prisma Client（npm ci 后类型需与 schema 同步）"
npx prisma generate --schema "$SCHEMA"

echo "==> [5/7] 构建前端并部署到站点"
npm run build:frontend 2>/dev/null || (cd packages/frontend && npx vite build)
mkdir -p "$SITE_ROOT"
cp -r packages/frontend/dist/. "$SITE_ROOT/"
echo "  前端已更新: $SITE_ROOT"

echo "==> [6/7] 构建后端"
npm run build:backend

echo "==> [7/7] 重启后端"
pm2 restart ai-interview-backend --update-env || true
pm2 save

echo ""
echo "✅ 更新完成"
echo "   - 前端 : https://interview.draftly.cn（浏览器强刷 Cmd+Shift+R 看最新）"
echo "   - 后端 : pm2 logs ai-interview-backend 查看日志"
echo ""
echo "⚠️ 注意：若 .env 有新增配置项（新功能需要），先手动编辑 .env 再跑本脚本"
