import { z } from 'zod';

export const unbanUserSchema = z.object({
    login: z.string().min(4, "Login must be at least 4 characters").max(20)
})

export type UnbanFormData = z.infer<typeof unbanUserSchema>