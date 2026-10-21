import { z } from 'zod';


export const banUserSchema = z.object({
    login: z.string().min(4, "Login must be at least 4 characters").max(20),
    reason: z.string().min(4, "Minimum resaon length is 4 characters").max(40),
    durationInDays: z.string().transform((val, ctx) => {
        const parsed = Number(val);
            if (isNaN(parsed)) {
                ctx.addIssue({
                code: "custom",
                message: "Not a valid number!",
                });
                return z.NEVER;
            }
        
        return parsed;
    })
})

export type BanUserFormData = z.infer<typeof banUserSchema>
