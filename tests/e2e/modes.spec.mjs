import { test, expect, setAutoMode, setWebsiteMode, setIgnoredSelectors } from "./extension.mjs";

// the user-level contract: a fixed cookie wall usually locks scrolling,
// removing it must give scrolling back (fixture pages are 3000px tall).
// Scrolls like a user would - programmatic scrollTo works even with overflow:hidden.
const canScroll = async page => {
	await page.mouse.move(640, 400);
	await page.mouse.wheel(0, 500);
	await page.waitForTimeout(100);
	const scrolled = await page.evaluate(() => window.scrollY > 0);
	await page.evaluate(() => window.scrollTo(0, 0));
	return scrolled;
};

test.describe("default state (fresh install, automode off)", () => {
	test("leaves pages untouched", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "whitelist");
		await page.goto("/cookie-wall.html");

		await expect(page.locator("#overlay")).toBeVisible();
		// give the content script time to (wrongly) act, then re-check
		await page.waitForTimeout(700);
		await expect(page.locator("#overlay")).toBeVisible();
		expect(await canScroll(page)).toBe(false);
	});
});

test.describe("aggressive mode", () => {
	test("removes a full-page cookie wall and restores scrolling", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await page.goto("/cookie-wall.html");

		await expect(page.locator("#overlay")).toBeHidden();
		await expect.poll(() => canScroll(page)).toBe(true);
	});

	test("removes a sticky header", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await page.goto("/sticky-header.html");

		await expect(page.locator("#site-header")).toBeHidden();
	});

	test("removes a popup that appears after a delay", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await page.goto("/delayed-popup.html");

		await page.waitForFunction(() => window.__popupAdded === true);
		await expect(page.locator("#late")).toBeHidden();
	});
});

test.describe("moderate mode", () => {
	test("removes a full-page cookie wall and restores scrolling", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		await page.goto("/cookie-wall.html");

		await expect(page.locator("#overlay")).toBeHidden();
		await expect.poll(() => canScroll(page)).toBe(true);
	});

	test("keeps a legitimate sticky header", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		await page.goto("/sticky-header.html");

		await expect(page.locator("#site-header")).toBeVisible();
		// the initial pass runs at document_end; wait it out and re-check
		await page.waitForTimeout(700);
		await expect(page.locator("#site-header")).toBeVisible();
	});

	test("removes a popup that appears after a delay", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		await page.goto("/delayed-popup.html");

		await page.waitForFunction(() => window.__popupAdded === true);
		await expect(page.locator("#late")).toBeHidden();
	});
});

test.describe("delicate mode", () => {
	test("turns the overlay into a normally positioned element", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "staticActive");
		await page.goto("/cookie-wall.html");

		await expect
			.poll(() => page.evaluate(() => getComputedStyle(document.querySelector("#overlay")).position))
			.toBe("relative");
		await expect.poll(() => canScroll(page)).toBe(true);
	});
});

test.describe("per-site setting", () => {
	test("a site saved as aggressive gets cleaned while automode stays off", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "whitelist");
		await setWebsiteMode(serviceWorker, "127.0.0.1:8123", "hardModeActive");
		await page.goto("/cookie-wall.html");

		await expect(page.locator("#overlay")).toBeHidden();
	});
});

test.describe("other extensions' UI", () => {
	test("survives aggressive mode while the popup is still removed", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await page.goto("/extension-ui.html");

		await expect(page.locator("#overlay")).toBeHidden();
		await expect(page.locator("#by-token")).toBeVisible();
		await expect(page.locator("#by-iframe")).toBeVisible();
		await expect(page.locator("#by-attribute")).toBeVisible();
		// the ignored elements must keep their fixed position too
		expect(
			await page.evaluate(() => getComputedStyle(document.querySelector("#by-token")).position)
		).toBe("fixed");
		// the unprotected widgets are removed - only user selectors can save them
		await expect(page.locator("#user-widget")).toBeHidden();
		await expect(page.locator("#by-inner")).toBeHidden();
	});

	test("user-defined ignore selectors protect unknown widgets", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await setIgnoredSelectors(serviceWorker, "#user-widget\n.user-inner-thing");
		await page.goto("/extension-ui.html");

		await expect(page.locator("#overlay")).toBeHidden();
		// matched directly and via an inner element's selector
		await expect(page.locator("#user-widget")).toBeVisible();
		await expect(page.locator("#by-inner")).toBeVisible();
		expect(
			await page.evaluate(() => getComputedStyle(document.querySelector("#user-widget")).position)
		).toBe("fixed");
	});

	test("an invalid user selector is skipped without breaking the rest", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await setIgnoredSelectors(serviceWorker, "#user-widget\n)))not-a-selector(((");
		await page.goto("/extension-ui.html");

		await expect(page.locator("#overlay")).toBeHidden();
		await expect(page.locator("#user-widget")).toBeVisible();
	});

	test("survives delicate mode", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "staticActive");
		await page.goto("/extension-ui.html");

		await expect
			.poll(() => page.evaluate(() => getComputedStyle(document.querySelector("#overlay")).position))
			.toBe("relative");
		expect(
			await page.evaluate(() => getComputedStyle(document.querySelector("#by-token")).position)
		).toBe("fixed");
	});
});

test.describe("mutation-heavy pages", () => {
	test("watcher pauses under load but still catches a late popup", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await page.goto("/mutation-storm.html");

		await page.waitForFunction(() => window.__popupAdded === true);
		// the resume rescan runs after a backoff; allow for it
		await expect(page.locator("#late")).toBeHidden({ timeout: 10000 });
	});
});
