import z from "zod";

export const goalIdParamsSchema = z.object({
	goalId: z.cuid2(),
});
