import z from "zod";
import { createUserSchema } from "../auth/create-user";

export const getProfileResponseSchema = createUserSchema
	.pick({
		name: true,
		email: true,
	})
	.extend({
		id: z.cuid2(),
		isDemo: z.boolean(),
		demoExpiresAt: z.date().nullable(),
		updatedAt: z.date(),
		createdAt: z.date(),
	});
