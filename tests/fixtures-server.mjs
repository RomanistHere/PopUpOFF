// Minimal static server for the test fixture pages. Started by Playwright (see playwright.config.js).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "fixtures");
const port = Number(process.env.FIXTURES_PORT) || 8123;

http.createServer((req, res) => {
	const urlPath = new URL(req.url, "http://localhost").pathname;
	const filePath = path.resolve(root, "." + urlPath);

	if (!filePath.startsWith(root + path.sep) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
		res.writeHead(404);
		res.end("not found");
		return;
	}

	res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
	res.end(fs.readFileSync(filePath));
}).listen(port, () => console.log(`fixtures server listening on http://127.0.0.1:${port}`));
