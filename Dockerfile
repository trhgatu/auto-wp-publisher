FROM node:20-alpine AS builder
RUN npm install -g pnpm turbo
WORKDIR /app
COPY . .
RUN turbo prune @repo/server --docker

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

RUN npm install -g prisma pnpm

COPY --from=installer /app .

EXPOSE 3000
EXPOSE 5555

# Lệnh chạy chính
CMD ["sh", "-c", "pnpm -F @repo/database db:deploy && node apps/server/dist/main"]