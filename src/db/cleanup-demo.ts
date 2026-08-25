import { client } from "@/db";
import { deleteDemoData } from "@/functions/demo/delete-demo-data";

deleteDemoData()
	.catch(error => {
		console.error("failed to clean up demo users", error);
		process.exitCode = 1;
	})
	.finally(() => client.end());
