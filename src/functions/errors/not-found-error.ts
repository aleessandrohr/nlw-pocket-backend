import { AppError } from "./app-error";

export class NotFoundError extends AppError {
	constructor(resource = "resource", message = "not found") {
		super(`${resource} ${message}`, 404);
	}
}
