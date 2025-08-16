import { AppError } from "./app-error";

export class ConflictError extends AppError {
	constructor(resource = "resource", message = "already exists") {
		super(`${resource} ${message}`, 409);
	}
}
