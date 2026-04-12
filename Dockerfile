FROM node:20-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN turbo prune @repo/server --docker

# Cứu folder migrations nếu turbo prune bỏ qua (đảm bảo file SQL có mặt trong image final)
COPY packages/database/prisma/migrations ./out/full/packages/database/prisma/migrations

FROM node:20-alpine AS installer
RUN npm install -g pnpm
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN pnpm -F @repo/database db:generate
RUN pnpm turbo run build --filter=@repo/server

FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g prisma pnpm tsx

COPY --from=installer /app .

EXPOSE 3000
EXPOSE 5555

# Force sync database (bỏ qua lịch sử migration bị lỗi trên production)
CMD ["sh", "-c", "cd packages/database && npx prisma db push --accept-data-loss && cd ../.. && node apps/server/dist/main"]