import { z } from "zod";

/**
 * Type-safe Environment Validation for IndieG
 * Enforces configuration contracts across Development, Preview, and Production.
 */
const envSchema = z.object({
    MODE: z.string().default("development"),
    DEV: z.boolean().default(true),
    PROD: z.boolean().default(false),
    VITE_API_BASE_URL: z.string().optional().default(""),
    VITE_R2_PUBLIC_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_R2_PUBLIC_URL: import.meta.env.VITE_R2_PUBLIC_URL,
});

export type AppEnv = z.infer<typeof envSchema>;
