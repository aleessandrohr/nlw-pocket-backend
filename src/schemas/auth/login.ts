import { createUserSchema } from "@/schemas/auth/create-user";

export const loginSchema = createUserSchema.pick({
	email: true,
	password: true,
});
