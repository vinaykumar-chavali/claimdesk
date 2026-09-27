import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres_dev_123@db:5432/claimdesk'),
  JWT_SECRET: z.string().min(10).default('supersecretjwtkey_for_dev_only'),
  ML_SERVICE_URL: z.string().url().default('http://ml-service:8000/analyze'),
  UPLOAD_DIR: z.string().default('uploads')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
