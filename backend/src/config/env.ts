import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().optional(),
  DATABASE_ENGINE: z.enum(['postgres', 'sqlite', 'auto']).default('auto'),
  JWT_SECRET: z.string().min(10).default('supersecretjwtkey_for_dev_only'),
  ML_SERVICE_URL: z.string().default('http://localhost:8000/analyze'),
  UPLOAD_DIR: z.string().default('uploads'),
  CORS_ORIGIN: z.string().default('*')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
