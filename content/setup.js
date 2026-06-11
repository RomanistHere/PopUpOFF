let appState = {
	curMode: null,
};

const modes = {
	whitelist: (obj) => null,
	hardModeActive: (obj) => hardMode(obj),
	easyModeActive: (obj) => easyMode({ ...obj, positionCheck: positionCheckTypeI }),
	staticActive: (obj) => staticMode(obj),
};

const startMode = ({ curModeName, statsEnabled, shouldRestoreCont, staticSubMode }) => {
	// check if we switch from hard to easy one
	if (appState.curMode === "hardModeActive" || appState.curMode === "easyModeActive" || appState.curMode === "staticActive")
		restoreFixedElems();

	// start new mode and upd state
	const mode = modes[curModeName];
	appState = { ...appState, curMode: curModeName };
	mode({ statsEnabled, shouldRestoreCont, staticSubMode });
};

// initialize mode
const initMode = async () => {
	// check if script is inside the iframe
	if (window !== window.parent) return;

	let { statsEnabled, curAutoMode, staticSubMode, ignoredSelectors } = await getStorageData([
		"statsEnabled",
		"curAutoMode",
		"staticSubMode",
		"ignoredSelectors",
	]);
	let { restoreContActive } = await getStorageLocal("restoreContActive");
	const websites = await getWebsites();

	setUserIgnoredSelectors(ignoredSelectors);

	if (restoreContActive == null) {
		await setStorageLocal({ restoreContActive: [] });
		restoreContActive = [];
	}

	if (statsEnabled == null) {
		await setStorageData({ statsEnabled: false });
		statsEnabled = false;
	}

	// missing defaults (e.g. the background never ran on install) must not crash the page
	if (curAutoMode == null) curAutoMode = "whitelist";

	const fullWebsites = { ...defWebsites, ...websites };
	const pureUrl = getPureURL(window.location.href);
	const shouldRestoreCont = restoreContActive.includes(pureUrl);
	const curModeName = pureUrl in fullWebsites ? fullWebsites[pureUrl] : curAutoMode;

	startMode({ curModeName, statsEnabled, shouldRestoreCont, staticSubMode });
};

initMode();

const changeMode = async (request, sender, sendResponse) => {
	const oldMode = appState.curMode;
	const curModeName = request.activeMode;

	// shortcut pressed for the mode that is already active - nothing to do
	if (request.fromShortcut && oldMode === curModeName) {
		sendResponse({ closePopup: false });
		return;
	}

	// check stats and restore content
	const { statsEnabled, staticSubMode, ignoredSelectors } = await getStorageData([
		"statsEnabled",
		"staticSubMode",
		"ignoredSelectors"
	]);
	const { restoreContActive } = await getStorageLocal("restoreContActive");
	const pureUrl = getPureURL(window.location.href);
	const shouldRestoreCont = (restoreContActive || []).includes(pureUrl);

	setUserIgnoredSelectors(ignoredSelectors);

	domObserver = disconnectObservers(domObserver);

	startMode({ curModeName, statsEnabled, shouldRestoreCont, staticSubMode });
	modeChangedToBg();

	if (request.fromShortcut)
		createNotification(curModeName);

	if (curModeName === "whitelist") {
		if (shouldRestoreCont) {
			const newContActive = restoreContActive.filter(url => url !== pureUrl);
			chrome.storage.local.set({ restoreContActive: newContActive });
		}

		sendResponse({ closePopup: true });
		// window.location.reload()
	} else if (oldMode === "staticActive" && (curModeName === "easyModeActive" || curModeName === "hardModeActive")) {
		sendResponse({ closePopup: true });
	} else {
		sendResponse({ closePopup: false });
	}
};

// "change mode" listener from popup.js and bg.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// check if script is inside the iframe
	if (window !== window.parent) return true;

	changeMode(request, sender, sendResponse);

	return true;
});

// The keyboard shortcut is handled by the background script via the
// chrome.commands API (user-configurable in the browser's shortcut settings);
// it arrives here as a regular changeMode message with fromShortcut set.

// open option page programmatically from websites
document.addEventListener("openOptPage", e => {
	chrome.runtime.sendMessage({ openOptPage: true });
});

// send stats to website
const sendStats = async () => {
	const { stats } = await getStorageLocal("stats");
	// Firefox requires cloning the detail object into the page context (Xray vision)
	const detail = typeof cloneInto === "function" ? cloneInto(stats, document.defaultView) : stats;
	document.dispatchEvent(new CustomEvent("PopUpOFFStats", { detail }));
};

if (`${window.location.origin}${window.location.pathname}` === "https://popupoff.org/visualization") {
	document.addEventListener("showPopUpOFFStats", ({ detail }) => {
		if (detail === "letTheShowBegin") {
			sendStats();
			setInterval(sendStats, 2000);
		}
	});
}

// notification mechanics
let notifTimeout;
const textItems = {
	whitelist: "Turn OFF",
	hardModeActive: "Aggressive",
	staticActive: "Delicate",
	easyModeActive: "Moderate",
};

const createNotification = curMode => {
	const notification = document.createElement("span");
	notification.setAttribute("data-popupoff", "notification");
	const text = document.createTextNode(`✔ ${textItems[curMode]} mode activated`);
	notification.className = "PopUpOFF_notification";
	notification.appendChild(text);
	document.body.appendChild(notification);

	clearTimeout(notifTimeout);
	notifTimeout = setTimeout(() => {
		if (document.querySelector(".PopUpOFF_notification"))
			document.querySelector('[data-popupoff="notification"]').remove();
	}, 5000);
};
