import { test, expect } from "./extension.mjs";

test.describe("storage migration (2.1.4)", () => {
	test("moves per-site data from sync chunks into local storage", async ({ serviceWorker }) => {
		await serviceWorker.evaluate(async () => {
			// make the profile look like a pre-2.1.4 install
			await chrome.storage.local.remove(["websites", "restoreContActive", "stats"]);
			await chrome.storage.sync.set({
				websites1: { "a.example": "hardModeActive" },
				websites2: { "b.example": "easyModeActive" },
				websites3: { "c.example": "whitelist" },
				restoreContActive: ["a.example"],
				stats: { cleanedArea: 5, numbOfItems: 3, restored: 1 },
			});

			await globalThis.popupoffMigrateStorage();
		});

		const result = await serviceWorker.evaluate(async () => ({
			local: await chrome.storage.local.get(null),
			sync: await chrome.storage.sync.get(null),
		}));

		expect(result.local.websites).toEqual({
			"a.example": "hardModeActive",
			"b.example": "easyModeActive",
			"c.example": "whitelist",
		});
		expect(result.local.restoreContActive).toEqual(["a.example"]);
		expect(result.local.stats).toEqual({ cleanedArea: 5, numbOfItems: 3, restored: 1 });

		// the old sync keys are gone, freeing the user's sync quota
		expect(result.sync.websites1).toBeUndefined();
		expect(result.sync.websites2).toBeUndefined();
		expect(result.sync.websites3).toBeUndefined();
		expect(result.sync.restoreContActive).toBeUndefined();
		expect(result.sync.stats).toBeUndefined();
	});

	test("does not overwrite already migrated data", async ({ serviceWorker }) => {
		await serviceWorker.evaluate(async () => {
			await chrome.storage.local.set({ websites: { "kept.example": "easyModeActive" } });
			await chrome.storage.sync.set({ websites1: { "stale.example": "hardModeActive" } });

			await globalThis.popupoffMigrateStorage();
		});

		const websites = await serviceWorker.evaluate(async () => {
			const { websites } = await chrome.storage.local.get("websites");
			return websites;
		});

		expect(websites).toEqual({ "kept.example": "easyModeActive" });
	});
});
