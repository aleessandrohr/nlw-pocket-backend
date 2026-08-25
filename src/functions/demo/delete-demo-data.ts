import { db } from "@/db";
import { sql } from "drizzle-orm";

// Remove todas as contas demo e seus dados em uma transação antes de criar outra.
export const deleteDemoData = async () => {
	await db.transaction(async tx => {
		await tx.execute(sql`
			DELETE FROM "goal_completions"
			WHERE "goal_id" IN (
				SELECT goals."id"
				FROM "goals" AS goals
				INNER JOIN "users" AS users ON users."id" = goals."user_id"
				WHERE users."is_demo" = true
			)
		`);

		await tx.execute(sql`
			DELETE FROM "goals"
			WHERE "user_id" IN (
				SELECT "id"
				FROM "users"
				WHERE "is_demo" = true
			)
		`);

		await tx.execute(sql`
			DELETE FROM "users"
			WHERE "is_demo" = true
		`);
	});
};
