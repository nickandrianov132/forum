import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env } from '../config.ts';

// Описываем схему данных пользователя в токене
const JWTPayloadSchema = z.object({
  id: z.string(),   // Добавляем ID пользователя
  login: z.string(),
  role: z.string(),
  iat: z.number().optional(), // Стандартное поле "issued at"
  exp: z.number().optional(), 
});

export const verifyToken = (token: string) => {
  try {
    // 1. Декодируем 
    const rawPayload = jwt.verify(token, env.JWT_SECRET_KEY);
    // 2. Валидируем через Zod
    // Если в токене нет login или password, parse() выбросит ошибку
    return JWTPayloadSchema.parse(rawPayload);
  } catch (err) {
    return null;
  }
};

type TUser = {
  id: string
  role: string
}

export const getUserFromHeader = (authHeader?: string): TUser  | null => {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (!token) return null;
    try {
      const decoded = verifyToken(token);
      if (!decoded) return null;
      
      return {
        id: decoded.id,
        role: decoded.role
      };
    } catch (err) {
      console.error("JWT verification failed", err);
      return null;
    }
  }
  return null;
};