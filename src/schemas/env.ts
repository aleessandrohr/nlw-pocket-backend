import z from "zod";

const secretSchema = z.string().min(1);

const envSchema = z.object({
	PORT: z.string().transform(Number),
	HOST: z.string().default("0.0.0.0"),
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),
	TRUST_PROXY: z
		.enum(["true", "false"])
		.default("false")
		.transform(value => value === "true"),
	DATABASE_URL: z.url(),
	FRONTEND_URL: z.url(),
	JWT_SECRET: secretSchema,
	COOKIE_SECRET: secretSchema,
});

export const env = envSchema.parse(process.env);

// Exige entropia mínima em produção sem impedir os valores simples do ambiente local.
if (env.NODE_ENV === "production") {
	const minimumSecretLength = 32;

	if (env.JWT_SECRET.length < minimumSecretLength) {
		throw new Error(
			"JWT_SECRET must have at least 32 characters in production"
		);
	}

	if (env.COOKIE_SECRET.length < minimumSecretLength) {
		throw new Error(
			"COOKIE_SECRET must have at least 32 characters in production"
		);
	}
}
