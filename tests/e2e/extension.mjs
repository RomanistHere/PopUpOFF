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

		// wait until the background module finished evaluating: chrome.* already
		// works in the worker while the module body is still being executed
		await expect
			.poll(async () => {
				try {
					return await worker.evaluate(() => typeof globalThis.popupoffMigrateStorage);
				} catch {
					return "pending";
				}
			})
			.toBe("function");

		// Write the test defaults and verify they stick: on a fresh profile
		// onInstalled writes its own defaults concurrently and must not be allowed
		// to clobber ours after the test already changed them.
		await expect
			.poll(
				async () => {
					try {
						return await worker.evaluate(async () => {
							await chrome.storage.sync.set({
								ctxEnabled: true,
								statsEnabled: true,
								curAutoMode: "whitelist",
								staticSubMode: "relative",
								shortCutMode: null,
								ignoredSelectors: "",
							});
							await chrome.storage.local.set({
								websites: {},
								restoreContActive: [],
								stats: { cleanedArea: 0, numbOfItems: 0, restored: 0 },
							});
							await new Promise(resolve => setTimeout(resolve, 250));
							const { curAutoMode } = await chrome.storage.sync.get("curAutoMode");
							const { websites } = await chrome.storage.local.get("websites");
							return (
								curAutoMode === "whitelist" &&
								websites != null &&
								Object.keys(websites).length === 0
							);
						});
					} catch {
						return false;
					}
				},
				{ timeout: 10000 }
			)
			.toBe(true);

		await use(worker);
	},
});

// the mode every page falls back to when the site has no own setting
export const setAutoMode = (worker, mode) =>
	worker.evaluate(m => chrome.storage.sync.set({ curAutoMode: m }), mode);

// user-defined ignore selectors, as the options page textarea would save them
export const setIgnoredSelectors = (worker, value) =>
	worker.evaluate(v => chrome.storage.sync.set({ ignoredSelectors: v }), value);

// a per-site preference, as the popup/context menu/shortcut would save it
export const setWebsiteMode = (worker, host, mode) =>
	worker.evaluate(
		async ({ host, mode }) => {
			const { websites } = await chrome.storage.local.get("websites");
			await chrome.storage.local.set({
				websites: { ...(websites || {}), [host]: mode },
			});
		},
		{ host, mode }
	);

export { expect };
