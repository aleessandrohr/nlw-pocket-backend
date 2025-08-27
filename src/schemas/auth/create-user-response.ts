import { z } from "zod";

export const createUserResponseSchema = z.object({
	id: z.cuid2(),
	name: z.string().min(3).max(255),
	email: z.email().max(256),
});
