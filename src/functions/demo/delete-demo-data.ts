import { db } from "@/db";
import { sql } from "drizzle-orm";

// Remove somente contas demo expiradas e seus dados em uma transação.
export const deleteDemoData = async () => {
	await db.transaction(async tx => {
		await tx.execute(sql`
			DELETE FROM "goal_completions"
			WHERE "goal_id" IN (
				SELECT goals."id"
				FROM "goals" AS goals
				INNER JOIN "users" AS users ON users."id" = goals."user_id"
				WHERE users."is_demo" = true
					AND (
						users."demo_expires_at" IS NULL
						OR users."demo_expires_at" <= NOW()
					)
			)
		`);

		await tx.execute(sql`
			DELETE FROM "goals"
			WHERE "user_id" IN (
				SELECT "id"
				FROM "users"
				WHERE "is_demo" = true
					AND (
						"demo_expires_at" IS NULL
						OR "demo_expires_at" <= NOW()
					)
			)
		`);

		await tx.execute(sql`
			DELETE FROM "users"
			WHERE "is_demo" = true
				AND (
					"demo_expires_at" IS NULL
					OR "demo_expires_at" <= NOW()
				)
		`);
	});
};
