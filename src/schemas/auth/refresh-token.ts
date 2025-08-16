import { z } from "zod";

export const refreshTokenSchema = z.object({
	userId: z.cuid2(),
});
