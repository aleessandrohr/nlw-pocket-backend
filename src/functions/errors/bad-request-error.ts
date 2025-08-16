import { AppError } from "./app-error";

export class BadRequestError extends AppError {
	constructor(message = "invalid request") {
		super(message, 400);
	}
}
