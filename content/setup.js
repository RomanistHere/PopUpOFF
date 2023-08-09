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
	let { statsEnabled, restoreContActive, curAutoMode, staticSubMode } = await getStorageData([
		"statsEnabled",
		"restoreContActive",
		"curAutoMode",
		"staticSubMode",
	]);
	const websites = await getWebsites();
	// check if script is inside the iframe
	if (window !== window.parent) return;

	if (restoreContActive == null) {
		await setStorageData({ restoreContActive: [] });
		restoreContActive = [];
	}

	if (statsEnabled == null) {
		await setStorageData({ statsEnabled: false });
		statsEnabled = false;
	}

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
	// check stats and restore content
	const { statsEnabled, restoreContActive, staticSubMode } = await getStorageData([
		"statsEnabled",
		"restoreContActive",
		"staticSubMode"
	]);
	const pureUrl = getPureURL(window.location.href);
	const shouldRestoreCont = restoreContActive.includes(pureUrl);

	domObserver = disconnectObservers(domObserver);

	startMode({ curModeName, statsEnabled, shouldRestoreCont, staticSubMode });
	modeChangedToBg();

	if (curModeName === "whitelist") {
		if (shouldRestoreCont) {
			const newContActive = restoreContActive.filter(url => url !== pureUrl);
			chrome.storage.sync.set({ restoreContActive: newContActive });
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

// shortcut (keycomb: "Alt + x") from browser listener
const keyDownCallBack = async e => {
	const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

	if (
		(e.altKey && e.which == 88) ||
		(isMac && e.metaKey && e.shiftKey && e.which == 88)
	) {
		// needed shortcut pressed
		e.preventDefault();

		const { statsEnabled, restoreContActive, shortCutMode, staticSubMode } = await getStorageData([
			"statsEnabled",
			"restoreContActive",
			"shortCutMode",
			"staticSubMode",
		]);
		const websites = await getWebsites();
		const fullWebsites = { ...defWebsites, ...websites };

		if (appState.curMode === shortCutMode || shortCutMode === null) return;

		const pureUrl = getPureURL(window.location.href);
		const shouldRestoreCont = restoreContActive.includes(pureUrl);

		const curModeName = shortCutMode;
		domObserver = disconnectObservers(domObserver);

		if (pureUrl in fullWebsites && fullWebsites[pureUrl] === curModeName) return;

		const newWebsites = { ...websites, [pureUrl]: curModeName };

		startMode({ curModeName, statsEnabled, shouldRestoreCont, staticSubMode });
		try {
			await setWebsites(newWebsites);
			modeChangedToBg();
			createNotification(appState.curMode);
		} catch (e) {
			console.log(e);
		}

		// if (curModeName === 'whitelist')
		// 	window.location.reload()
	}
};
document.onkeydown = debounce(keyDownCallBack, 100);

// open option page programmatically from websites
document.addEventListener("openOptPage", e => {
	chrome.runtime.sendMessage({ openOptPage: true });
});

// send stats to website
const sendStats = async () => {
	const { stats } = await getStorageData("stats");
	document.dispatchEvent(new CustomEvent("PopUpOFFStats", { detail: stats }));
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
