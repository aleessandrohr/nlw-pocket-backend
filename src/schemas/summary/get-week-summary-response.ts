import z from "zod";

export const getWeekSummaryResponseSchema = z.object({
	completed: z.number(),
	total: z.number().nullable(),
	goalsPerDay: z
		.record(
			z.string(),
			z.array(
				z.object({
					id: z.cuid2(),
					title: z.string(),
					isArchived: z.boolean(),
					completedAt: z.union([z.date(), z.string()]),
				})
			)
		)
		.nullable(),
});
