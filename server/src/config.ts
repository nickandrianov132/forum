import 'dotenv/config'; 
import { z } from 'zod';

const envSchema = z.object({
  JWT_SECRET_KEY: z.string().min(10, "to short secret"),
//   MONGO_URI: z.string().url(),
//   PORT: z.string().default("7000"),
});

// Парсим и экспортируем типизированный конфиг
export const env = envSchema.parse(process.env);