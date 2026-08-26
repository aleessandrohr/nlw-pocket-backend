import { client } from "@/db";
import { deleteDemoData } from "@/functions/demo/delete-demo-data";

deleteDemoData()
	.catch(() => {
		console.error("failed to clean up demo users");
		process.exitCode = 1;
	})
	.finally(() => client.end());
