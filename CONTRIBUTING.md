# Contributing to Auto WP Publisher

Thanks for taking the time to contribute! This document describes the workflow
and conventions used in this monorepo.

## Prerequisites

- **Node.js** `>= 20` (see `.nvmrc` — run `nvm use`)
- **pnpm** `9.x` (`corepack enable` then `corepack prepare pnpm@9 --activate`)
- **Docker** (optional, for the local Postgres + Redis stack)

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env      # then fill in real values

# 3. Generate the Prisma client
pnpm db:generate

# 4. Start everything in dev mode
pnpm dev
# ...or bring up the full stack with Docker:
pnpm docker:dev
```

The API runs at `http://localhost:3000/api/v1` with Swagger docs at
`http://localhost:3000/api/v1/docs` and a health probe at `/health`.

## Project layout

```
apps/
  server/     NestJS API — DDD + CQRS, organized by bounded context
  web/        React 19 + Vite + Ant Design SPA
packages/
  database/   Prisma schema, migrations and generated client
  shared/     Cross-cutting types shared by apps
  ui/         Shared React components
  eslint-config, typescript-config
```

## Development workflow

1. Branch off `main` using a descriptive name, e.g. `feat/bulk-import` or
   `fix/dashboard-total`.
2. Make your changes with tests where it makes sense.
3. Run the checks locally before pushing:

   ```bash
   pnpm lint          # ESLint across the workspace
   pnpm check-types   # TypeScript type checking
   pnpm test          # Unit tests
   pnpm build         # Ensure everything builds
   ```

4. Open a pull request against `main` and fill in the PR template.

Husky runs `lint-staged` on commit and validates your commit message on
`commit-msg`, so formatting and commit style are enforced automatically.

## Commit conventions

Commits **must** follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<optional scope>): <subject>
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`.

Examples:

```
feat(server): add rate limiting to the public API
fix(web): correct dashboard total calculation
docs: document environment variables
```

## Coding standards

- TypeScript everywhere; keep the build strict and warning-free.
- Backend follows Domain-Driven Design — respect the `domain`, `application`
  and `infrastructure` layering within each bounded context.
- Prefer small, focused pull requests.
- Never commit secrets. See [SECURITY.md](./SECURITY.md).
