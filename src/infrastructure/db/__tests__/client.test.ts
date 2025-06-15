import { describe, expect, it } from "vitest";

describe("データベースクライアント", () => {
	describe("モジュールエクスポート", () => {
		it("必要な関数がエクスポートされている", async () => {
			const { testConnection, closeConnection, db, sql } = await import("../client.js");

			expect(typeof testConnection).toBe("function");
			expect(typeof closeConnection).toBe("function");
			expect(db).toBeDefined();
			expect(sql).toBeDefined();
		});
	});
});
