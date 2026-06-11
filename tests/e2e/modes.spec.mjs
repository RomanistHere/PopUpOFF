import { test, expect, setAutoMode } from "./extension.mjs";

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
