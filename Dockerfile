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

# Debug: Liệt kê file và chạy migration
CMD ["sh", "-c", "ls -R packages/database/prisma && cd packages/database && npx prisma migrate deploy && cd ../.. && node apps/server/dist/main"]