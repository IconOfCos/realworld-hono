import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseConfig } from "../../shared/config/database.js";
import * as schema from "./schema.js";

export const sql = postgres(databaseConfig.url, {
	max: databaseConfig.maxConnections,
	idle_timeout: databaseConfig.idleTimeout,
	connect_timeout: databaseConfig.connectTimeout,
	transform: {
		undefined: null,
	},
});

export const db = drizzle(sql, { schema });

export async function testConnection(): Promise<boolean> {
	try {
		await sql`SELECT 1`;
		return true;
	} catch (error) {
		console.error("Database connection failed:", error);
		return false;
	}
}

export async function closeConnection(): Promise<void> {
	await sql.end();
}
