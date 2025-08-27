import z from "zod";

const envSchema = z.object({
	PORT: z.string().transform(Number),
	DATABASE_URL: z.url(),
	FRONTEND_URL: z.url(),
	JWT_SECRET: z.string(),
	COOKIE_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
