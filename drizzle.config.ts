import { env } from "@/schemas/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./.migrations",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
});
