import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(4, "Min length 4 characters").max(20),
    slug: z.string().min(4, "Min length 4 characters").max(20),
    description: z.string().optional()
})

export type CategoryFormData = z.infer<typeof categorySchema>