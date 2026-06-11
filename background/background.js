import "../constants/data.js";

import {
	getPureURL,
	setBadgeText,
	setWebsites,
	getWebsites,
	getStorageData,
	setStorageData,
	getStorageLocal,
	setStorageLocal,
} from "../constants/functions.js";

const { defWebsites, defPreventContArr } = globalThis.popupoffData;

// 2.1.4: per-site data (websites, restoreContActive) and stats moved from
// storage.sync - whose 8KB-per-item quota made saving fail altogether for
// heavy users ("storage full") - into storage.local. Settings stay in sync.
const migrateStorage = async () => {
	const { websites } = await getStorageLocal("websites");
	if (websites != null) return; // already migrated

	const oldData = await getStorageData([
		"websites1",
		"websites2",
		"websites3",
		"restoreContActive",
		"stats",
	]);

	await setStorageLocal({
		websites: { ...oldData.websites1, ...oldData.websites2, ...oldData.websites3 },
		restoreContActive:
			oldData.restoreContActive != null
				? oldData.restoreContActive
				: [...defPreventContArr],
		stats:
			oldData.stats != null
				? oldData.stats
				: { cleanedArea: 0, numbOfItems: 0, restored: 0 },
	});

	await new Promise(resolve =>
		chrome.storage.sync.remove(
			["websites1", "websites2", "websites3", "restoreContActive", "stats"],
			resolve
		)
	);
};
// exposed for the end-to-end tests
globalThis.popupoffMigrateStorage = migrateStorage;

// handle install
chrome.runtime.onInstalled.addListener(async details => {
	const { reason } = details;
	if (reason === "install") {
		// check is extension already in use at other device
		const { curAutoMode } = await getStorageData("curAutoMode");

		if (curAutoMode == null) {
			// set up start
			await setStorageData({
				ctxEnabled: true,
				statsEnabled: true,
				curAutoMode: "whitelist",
				staticSubMode: "relative",
				shortCutMode: null,
			});
			await setStorageLocal({
				websites: {},
				restoreContActive: [...defPreventContArr],
				stats: {
					cleanedArea: 0,
					numbOfItems: 0,
					restored: 0,
				},
			});

			addCtxMenu();

			chrome.tabs.create({ url: "https://popupoff.org/tutorial?source=chrome" })
		} else {
			// synced settings from another device may predate the storage move
			await migrateStorage();
		}
	} else if (reason === "update") {
		try {
			await migrateStorage();
		} catch (e) {
			console.log("storage migration went wrong");
			console.log(e);
		}
	}
});

chrome.runtime.setUninstallURL("https://popupoff.org/why-delete?source=chrome")

// badge + availability for a tab; restricted pages (chrome://, about:, extension
// pages...) don't run content scripts, so the action is disabled there
const handleTabBadge = (url, tabID) => {
	if (url && /^https?:/.test(url)) {
		chrome.action.enable(tabID);
		setNewBadge(getPureURL({ url }), tabID);
	} else {
		setBadgeText(null)(tabID);
		chrome.action.disable(tabID);
	}
};

// handle tab switch(focus)
chrome.tabs.onActivated.addListener(async activeInfo => {
	try {
		const tab = await chrome.tabs.get(activeInfo.tabId);
		handleTabBadge(tab.url, activeInfo.tabId);
	} catch {
		// the tab can be gone before we get to it
	}
});

const letters = {
	hardModeActive: "A",
	easyModeActive: "M",
	staticActive: "D",
	whitelist: "",
};

const setNewBadge = async (pureUrl, tabID) => {
	let { curAutoMode, ctxEnabled } = await getStorageData([
		"ctxEnabled",
		"curAutoMode",
	]);
	const websites = await getWebsites();

	if (curAutoMode == null) {
		await setStorageData({ curAutoMode: "whitelist" });
		curAutoMode = "whitelist";
	}

	const fullWebsites = { ...defWebsites, ...websites };
	let curModeName = curAutoMode;

	if (pureUrl in fullWebsites)
		curModeName = fullWebsites[pureUrl];

	const letter = letters[curModeName];

	setBadgeText(letter)(tabID);

	if (ctxEnabled) {
		Object.keys(subMenuStore).forEach(key => {
			const menu = subMenuStore[key];

			try {
				chrome.contextMenus.update(menu, {
					type: "checkbox",
					checked:
						letter === "A" && key === "hardModeActive" ||
						letter === "D" && key === "staticActive" ||
						letter === "M" && key === "easyModeActive" ||
						letter === "" && key === "whitelist"
				});
			} catch (e) {
				console.log("Couldn't update context menu");
				console.log(e);
			}
		});
	}
};

// handle mode changed from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!sender.tab) return true;

	if (request.modeChanged) {
		const tabID = sender.tab.id;
		const pureUrl = getPureURL(sender);

		setNewBadge(pureUrl, tabID);
	} else if (request.openOptPage) {
		chrome.runtime.openOptionsPage();
	} else if (request.ctxEnabled === true) {
		addCtxMenu();
	} else if (request.ctxEnabled === false) {
		chrome.contextMenus.removeAll();
	}

	return true;
});

// handle updating to set new badge and context menu
chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
	if (changeInfo.status === "loading") {
		handleTabBadge(tab.url, tabID);
	}
});

// content menu (right click) mechanics
const subMenu = [
	{
		title: `Aggressive`,
		mode: "hardModeActive",
	},
	{
		title: `Moderate`,
		mode: "easyModeActive",
	},
	{
		title: `Delicate`,
		mode: "staticActive",
	},
	{
		title: `Turn OFF`,
		mode: "whitelist",
	},
];

const subMenuStore = {
	hardModeActive: null,
	easyModeActive: null,
	staticActive: null,
	whitelist: null,
};

const setNewMode = async (newMode, pureUrl, tabID) => {
	const websites = await getWebsites();

	const fullWebsites = { ...defWebsites, ...websites };

	if (pureUrl in fullWebsites && fullWebsites[pureUrl] === newMode) return;

	const newWebsites = { ...websites, [pureUrl]: newMode };
	const letter = letters[newMode];

	try {
		await setWebsites(newWebsites);
		setBadgeText(letter)(tabID);
	} catch (e) {
		console.log("Couldn't update badge");
		console.log(e);
	}
};

const addCtxMenu = () => {
	try {
		chrome.contextMenus.removeAll(() => {
			subMenu.map((item, index) => {
				subMenuStore[Object.keys(subMenuStore)[index]] = chrome.contextMenus.create({
					id: item.mode,
					title: item.title,
					type: "checkbox",
					// checked whitelist by default
					checked: item.mode === "whitelist",
					// works for web pages only
					documentUrlPatterns: ["http://*/*", "https://*/*"],
				});
			});
		});
	} catch (e) {
		console.log("Couldn't create context menu");
		console.log(e);
	}
}

// registered once at the top level: registering inside addCtxMenu used to stack
// a duplicate listener on every toggle of the option, and a click should also
// be able to wake the service worker
chrome.contextMenus.onClicked.addListener((info, tab) => {
	const tabID = tab.id;
	const pureUrl = getPureURL({ url: tab.url });

	chrome.tabs.sendMessage(tabID, { activeMode: info.menuItemId }, () => chrome.runtime.lastError);

	setNewMode(info.menuItemId, pureUrl, tabID);
});

// keyboard shortcut, configurable by the user in the browser's extension
// shortcut settings (chrome://extensions/shortcuts, about:addons on Firefox)
chrome.commands.onCommand.addListener(async (command, tab) => {
	if (command !== "apply-shortcut-mode") return;

	const { shortCutMode } = await getStorageData("shortCutMode");
	if (!shortCutMode) return;

	const activeTab =
		tab || (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
	if (!activeTab || !activeTab.url || !/^https?:/.test(activeTab.url)) return;

	const pureUrl = getPureURL({ url: activeTab.url });
	await setNewMode(shortCutMode, pureUrl, activeTab.id);
	chrome.tabs.sendMessage(
		activeTab.id,
		{ activeMode: shortCutMode, fromShortcut: true },
		() => chrome.runtime.lastError
	);
});

const initCtxMenu = async () => {
	chrome.contextMenus.removeAll();
	const { ctxEnabled } = await getStorageData("ctxEnabled");

	if (ctxEnabled) {
		addCtxMenu();
	}
}

initCtxMenu();
