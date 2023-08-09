import { defWebsites, defPreventContArr } from "../constants/data.js";

import {
	getPureURL,
	setBadgeText,
	setWebsites,
	getWebsites,
	getStorageData,
	setStorageData,
} from "../constants/functions.js";

// handle install
chrome.runtime.onInstalled.addListener(async details => {
	const { previousVersion, reason } = details;
	if (reason === "install") {
		// check is extension already in use at other device
		const { curAutoMode } = await getStorageData("curAutoMode");

		if (curAutoMode == null) {
			// set up start
			await setStorageData({
				ctxEnabled: true,
				update: false,
				stats: {
					cleanedArea: 0,
					numbOfItems: 0,
					restored: 0,
				},
				statsEnabled: true,
				restoreContActive: [...defPreventContArr],
				curAutoMode: "whitelist",
				staticSubMode: "relative",
				shortCutMode: null,
				websites1: {},
				websites2: {},
				websites3: {},
			});

			addCtxMenu();

			chrome.tabs.create({ url: "https://popupoff.org/tutorial?source=chrome" })
		}
	} else if (reason === "update") {
		try {
			const { websites } = await getStorageData("websites");
			if (previousVersion === "2.0.3") {
				// 2.0.3
			} else if (previousVersion === "2.0.2") {
				// 2.0.2
				chrome.storage.sync.remove(["autoModeAggr"]);
			}
		} catch (e) {
			console.log("something went wrong");
			console.log(e);
		}
	}
});

chrome.runtime.setUninstallURL("https://popupoff.org/why-delete?source=chrome")

// handle tab switch(focus)
chrome.tabs.onActivated.addListener(activeInfo => {
	chrome.tabs.query({ active: true }, info => {
		const url = info[0].url;
		if (url.includes("chrome://") || url.includes("chrome-extension://")) {
			setBadgeText(null)(activeInfo.tabId);
			chrome.action.disable(activeInfo.tabId);
		} else {
			const pureUrl = getPureURL(info[0]);
			setNewBadge(pureUrl, activeInfo.tabId);
		}
	});
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
		const url = tab.url;

		if (url.includes("chrome://") || url.includes("chrome-extension://")) {
			setBadgeText(null)(tabID);
			chrome.action.disable(tabID);
		} else {
			const pureUrl = getPureURL({ url });
			setNewBadge(pureUrl, tabID);
		}
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
					documentUrlPatterns: ["http://*/*", "https://*/*", "http://*/", "https://*/"],
				});
			});
		});

		chrome.contextMenus.onClicked.addListener((info, tab) => {
			const tabID = tab.id;
			const tabURL = tab.url;
			const pureUrl = getPureURL({ url: tabURL });

			chrome.tabs.sendMessage(tabID, { activeMode: info.menuItemId }, resp => {
				// if (resp && resp.closePopup === true) {
				// 	chrome.tabs.update(tabID, { url: tabURL })
				// }
			});

			setNewMode(info.menuItemId, pureUrl, tabID);
		});
	} catch (e) {
		console.log("Couldn't create context menu");
		console.log(e);
	}
}

const initCtxMenu = async () => {
	chrome.contextMenus.removeAll();
	const { ctxEnabled } = await getStorageData("ctxEnabled");

	if (ctxEnabled) {
		addCtxMenu();
	}
}

initCtxMenu();
