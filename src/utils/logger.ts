interface Log {
	type: string;
	message: string;
	time: Date;
}

interface LogWithData extends Log {
	data: string | number;
}

const getLog = (type: string, message: string) => {
	return JSON.stringify({
		type: type,
		message: message,
		time: new Date(),
	} as Log);
};

const getLogWithData = (
	type: string,
	message: string,
	data: string | number,
) => {
	return JSON.stringify({
		type: type,
		message: message,
		data: data,
		time: new Date(),
	} as LogWithData);
};

type Type = "warning" | "error";

function logger(type: Type, message: string): void;
function logger(
	type: Type,
	message: string,
	withData: true,
	data: string | number,
): void;
function logger(
	type: Type,
	message: string,
	withData?: boolean,
	data?: string | number,
): void {
	let log = "";

	if (withData && data) {
		log = getLogWithData(type, message, data);
	} else {
		log = getLog(type, message);
	}

	console.log(log);
}

export { logger };
