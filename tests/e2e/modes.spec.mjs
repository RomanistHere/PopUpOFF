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

test.describe("moderate mode - language-independent signals", () => {
	test("removes modals recognizable only by markup or z-index, keeps a plain widget", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		await page.goto("/centered-modal.html");

		// no English keywords anywhere: aria-modal and the spam z-index decide
		await expect(page.locator("#aria-newsletter")).toBeHidden();
		await expect(page.locator("#spam-z")).toBeHidden();
		await expect(page.locator("#plain-widget")).toBeVisible();
		// give the watcher time to (wrongly) act on the widget, then re-check
		await page.waitForTimeout(700);
		await expect(page.locator("#plain-widget")).toBeVisible();
	});

	test("catches the same modal on a large screen where its relative size is tiny", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		// a 600x400 modal is only ~6% of this viewport - the old viewport-relative
		// buckets classified it as a harmless side widget
		await page.setViewportSize({ width: 2560, height: 1440 });
		await page.goto("/centered-modal.html");

		await expect(page.locator("#aria-newsletter")).toBeHidden();
		await expect(page.locator("#spam-z")).toBeHidden();
		await expect(page.locator("#plain-widget")).toBeVisible();
		await page.waitForTimeout(700);
		await expect(page.locator("#plain-widget")).toBeVisible();
	});

	test("keeps a modal the user opened themselves", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		await page.goto("/dialog-after-click.html");

		// let the initial sweep finish, then act like a user
		await page.waitForTimeout(700);
		await page.click("#open-login");
		await expect(page.locator("#login")).toBeVisible();
		// the mutation watcher had time to (wrongly) remove it - re-check
		await page.waitForTimeout(800);
		await expect(page.locator("#login")).toBeVisible();
		expect(await page.evaluate(() => document.querySelector("#login").open)).toBe(true);
		// outlive both verification passes too - escalation must spare it
		await page.waitForTimeout(2600);
		await expect(page.locator("#login")).toBeVisible();
	});
});

test.describe("sweep verification", () => {
	for (const [name, mode] of [
		["aggressive", "hardModeActive"],
		["moderate", "easyModeActive"],
	]) {
		test(`${name} mode restores the app wrapper it blanked the page with`, async ({ serviceWorker, page }) => {
			await setAutoMode(serviceWorker, mode);
			await page.goto("/verify-blank.html");

			// the sweep hides the fixed app wrapper (page goes blank);
			// the verification pass notices the text loss and brings it back
			await expect(page.locator("#app")).toBeVisible({ timeout: 4000 });
			// the actual popup stays gone
			await expect(page.locator("#cookie-banner")).toBeHidden();
			// and the restore sticks: the wrapper is opted out of future passes
			await page.waitForTimeout(600);
			await expect(page.locator("#app")).toBeVisible();
		});
	}

	test("moderate escalates on a wall it kept once it provably blocks reading", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "easyModeActive");
		await page.goto("/verify-escalation.html");

		// no known words, no modal markup, sane z-index: the classifier keeps it...
		await expect(page.locator("#wall")).toBeVisible();
		// ...until the verification pass sees it owning the center of a page
		// with real content behind it
		await expect(page.locator("#wall")).toBeHidden({ timeout: 5000 });
	});
});

test.describe("native modal dialogs", () => {
	for (const [name, mode] of [
		["aggressive", "hardModeActive"],
		["moderate", "easyModeActive"],
	]) {
		test(`${name} mode closes a showModal() dialog so the page stops being inert`, async ({ serviceWorker, page }) => {
			await setAutoMode(serviceWorker, mode);
			await page.goto("/dialog-modal.html");

			await expect(page.locator("#consent")).toBeHidden();
			// close() must have run: otherwise the dialog stays in the top layer
			// and the whole page remains inert (unclickable) although invisible
			expect(await page.evaluate(() => document.querySelector("#consent").open)).toBe(false);
			await page.click("#probe");
			expect(await page.evaluate(() => window.__probeClicked)).toBe(true);
		});
	}
});

test.describe("wrapper scroll locks", () => {
	for (const [name, mode] of [
		["aggressive", "hardModeActive"],
		["moderate", "easyModeActive"],
	]) {
		test(`${name} mode releases a scroll lock sitting on a page wrapper`, async ({ serviceWorker, page }) => {
			await setAutoMode(serviceWorker, mode);
			await page.goto("/wrapper-scroll-lock.html");

			await expect(page.locator("#overlay")).toBeHidden();
			await expect.poll(() => canScroll(page)).toBe(true);
		});
	}

	test("leaves a legitimate app shell untouched", async ({ serviceWorker, page }) => {
		await setAutoMode(serviceWorker, "hardModeActive");
		await page.goto("/app-shell.html");

		// no popup was acted on, so the shell's own overflow must survive
		await page.waitForTimeout(700);
		expect(
			await page.evaluate(() => getComputedStyle(document.querySelector("#shell")).overflowY)
		).toBe("hidden");
	});
});
