import { createGoal } from "@/functions/goals/create-goal";
import { createGoalSchema } from "@/schemas/goals/create-goal";
import { createGoalResponseSchema } from "@/schemas/goals/create-goal-response";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/goal",
		{
			schema: {
				body: createGoalSchema,
				summary: "Criar meta",
				description: "Criar meta",
				tags: ["goals", "public"],
				response: {
					201: createGoalResponseSchema,
				},
			},
		},
		async (request, reply) => {
			const { title, desiredWeeklyFrequency } = request.body;

			const { goal } = await createGoal({
				title,
				desiredWeeklyFrequency,
			});

			return reply.status(201).send(goal);
		}
	);
};
