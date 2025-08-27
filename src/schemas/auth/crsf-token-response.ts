import { z } from "zod";

export const crsfTokenResponseSchema = z.object({
	csrfToken: z.string(),
});
