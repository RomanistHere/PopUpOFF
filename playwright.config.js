import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests/e2e",
	timeout: 30_000,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
	webServer: {
		command: "node tests/fixtures-server.mjs",
		url: "http://127.0.0.1:8123/cookie-wall.html",
		reuseExistingServer: !process.env.CI,
	},
	use: {
		baseURL: "http://127.0.0.1:8123",
	},
});
