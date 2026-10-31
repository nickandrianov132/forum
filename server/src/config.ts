import 'dotenv/config'; 
import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET_KEY: z.string().min(10, "to short secret"),
  JWT_REFRESH_SECRET: z.string().min(10, "to short secret"),
  MONGO_URI: z.string().url().default("mongodb://127.0.0.1:27017"),
  PORT: z.coerce.number().default(7000),
  RENDER_EXTERNAL_URL: z.string().default(""),
  REDIS_URL: z.string().url().default("redis://127.0.0.1:6379")
});

// Парсим и экспортируем типизированный конфиг
export const env = envSchema.parse(process.env);