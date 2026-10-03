import { z } from 'zod'

export const regSchema = z.object({
  login: z.string().min(4, "Login must be at least 4 characters").max(20),
  password: z.string().min(4, "Password must be at least 4 characters").max(14),
  email: z.email("Invalid email address"),
  // Валидируем, что это объект File, пришедший из браузера
  avatar: z
    .url("Invalid avatar URL")
    .optional()
    .or(z.literal("").transform(() => undefined))
});

export type RegistrationFormData = z.infer<typeof regSchema>