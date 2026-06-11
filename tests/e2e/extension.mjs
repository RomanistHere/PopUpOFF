// Shared Playwright fixtures: launches Chromium with the built extension loaded
// (run `npm run build` first - `npm test` does it automatically via pretest).
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test as base, chromium, expect } from "@playwright/test";

const extensionPath = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../dist/chrome"
);

export const test = base.extend({
	// eslint-disable-next-line no-empty-pattern
	context: async ({}, use) => {
		const launchOptions = {
			// extensions only work in Chromium's new headless mode
			channel: "chromium",
			args: [
				`--disable-extensions-except=${extensionPath}`,
				`--load-extension=${extensionPath}`,
			],
			viewport: { width: 1280, height: 720 },
			// the harness runs as root in some sandboxes; the extension tests don't need the chromium sandbox
			chromiumSandbox: false,
		};
		// sandboxed environments can point the tests at a pre-installed browser
		if (process.env.CHROMIUM_PATH) {
			launchOptions.executablePath = process.env.CHROMIUM_PATH;
			delete launchOptions.channel;
		}
		const context = await chromium.launchPersistentContext("", launchOptions);
		// keep tests hermetic: the extension opens its online tutorial on first install
		await context.route(/popupoff\.org/, route => route.abort());
		await use(context);
		await context.close();
	},
	serviceWorker: async ({ context }, use) => {
		let [worker] = context.serviceWorkers();
		if (!worker) worker = await context.waitForEvent("serviceworker");
		// Write the install defaults ourselves instead of relying on onInstalled timing.
		// This is idempotent with onInstalled (it skips its writes once curAutoMode is set)
		// and the poll also absorbs the moment right after spawn when the chrome.*
		// bindings are not available in the worker yet.
		await expect
			.poll(async () => {
				try {
					await worker.evaluate(() =>
						chrome.storage.sync.set({
							ctxEnabled: true,
							update: false,
							stats: { cleanedArea: 0, numbOfItems: 0, restored: 0 },
							statsEnabled: true,
							restoreContActive: [],
							curAutoMode: "whitelist",
							staticSubMode: "relative",
							shortCutMode: null,
							websites1: {},
							websites2: {},
							websites3: {},
						})
					);
					return true;
				} catch {
					return false;
				}
			})
			.toBe(true);
		await use(worker);
	},
});

// the mode every page falls back to when the site has no own setting
export const setAutoMode = (worker, mode) =>
	worker.evaluate(m => chrome.storage.sync.set({ curAutoMode: m }), mode);

export { expect };
