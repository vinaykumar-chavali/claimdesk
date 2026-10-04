import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.string().default('4000'),
  NODE_ENV: z.string().default('development'),
  DATABASE_URL: z.string().optional(),
  DATABASE_ENGINE: z.string().default('auto'),
  JWT_SECRET: z.string().default('claimdesk_jwt_secret_production_key_2026_super_secure_32char'),
  ML_SERVICE_URL: z.string().default('http://localhost:8000/analyze'),
  UPLOAD_DIR: z.string().default('uploads'),
  CORS_ORIGIN: z.string().default('*')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Environment variable warning:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : {
  PORT: process.env.PORT || '4000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  DATABASE_ENGINE: process.env.DATABASE_ENGINE || 'auto',
  JWT_SECRET: process.env.JWT_SECRET || 'claimdesk_jwt_secret_production_key_2026_super_secure_32char',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000/analyze',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

