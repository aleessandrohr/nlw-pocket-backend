import z from "zod";

export const completionIdParamsSchema = z.object({
	completionId: z.cuid2(),
});
