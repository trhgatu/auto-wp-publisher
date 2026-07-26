import { z } from 'zod';

/**
 * Central schema for every environment variable the server relies on.
 *
 * Validated once at bootstrap through `ConfigModule.forRoot({ validate })`.
 * A missing or malformed variable fails fast with a readable report instead
 * of surfacing as an obscure runtime error deep inside a request.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Database
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),

  // Redis / BullMQ
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Auth
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters')
    .optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // CORS — comma-separated list of allowed origins, or "*" for all.
  CORS_ORIGINS: z.string().default('*'),

  // Rate limiting
  RATE_LIMIT_TTL: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  // Third-party integrations (optional so local dev can boot without them)
  GEMINI_API_KEY: z.string().optional(),
  WP_API_URL: z.string().url().optional(),
  WP_USERNAME: z.string().optional(),
  WP_APP_PASSWORD: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validation hook passed to NestJS `ConfigModule`.
 * Throws a single aggregated error listing every invalid variable.
 */
export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map(
        (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
      )
      .join('\n');
    throw new Error(
      `❌ Invalid environment variables:\n${issues}\n\n` +
        'Check your .env against apps/server/.env.example.',
    );
  }

  return parsed.data;
}
