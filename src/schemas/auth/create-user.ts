import { REGEX } from "@/config";
import z from "zod";

export const createUserSchema = z.object({
	name: z.string().trim().min(3).max(255),
	email: z.string().trim().toLowerCase().pipe(z.email().max(256)),
	password: z.string().min(8).max(256).regex(REGEX.password),
});
