import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../config.ts';

// Описываем схему данных пользователя в токене
const JWTPayloadSchema = z.object({
  id: z.string(),   // Добавляем ID пользователя
  login: z.string(),
  iat: z.number().optional(), // Стандартное поле "issued at"
  exp: z.number().optional(), // Добавьте это!
});

export const verifyToken = (token: string) => {
  try {
    // 1. Декодируем (результат всё еще unknown)
    const rawPayload = jwt.verify(token, env.JWT_SECRET_KEY);
    // console.log('RAW PAYLOAD FROM JWT:', rawPayload); // <--- Что тут?
    // 2. Валидируем через Zod
    // Если в токене нет login или password, parse() выбросит ошибку
    return JWTPayloadSchema.parse(rawPayload);
  } catch (err) {
    return null;
  }
};

export const getUserIdFromHeader = (authHeader?: string): string | null => {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    try {
      const decoded = verifyToken(token);
      return decoded?.id || null;
    } catch (err) {
      console.error("JWT verification failed", err);
    }
  }
  return null;
};