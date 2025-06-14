export const logger = {
	info: (message: string, meta?: unknown) => {
		console.log(`[INFO] ${message}`, meta);
	},
	warn: (message: string, meta?: unknown) => {
		if (process.env.NODE_ENV === "development") {
			console.warn(`[WARN] ${message}`, meta);
		}
	},
	error: (message: string, error?: Error) => {
		console.error(`[ERROR] ${message}`, error);
	},
};
