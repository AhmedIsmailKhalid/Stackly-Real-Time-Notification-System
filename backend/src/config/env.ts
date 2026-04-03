import { z } from 'zod';

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8080').transform(Number),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  FRONTEND_URL: z.string().url(),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(_parsed.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const env = _parsed.data;
export type Env = typeof env;