import { defWebsites, defPreventContArr } from "../constants/data.js";

import {
	querySelector,
	querySelectorAll,
	addClass,
	removeClass,
	getAttr,
	setWebsites,
	getWebsites,
	getStorageData,
	setStorageData,
	getPureURL,
	nFormatter,
	debounce,
} from "../constants/functions.js";

let state = {
	curMode: null,
	isRestContActive: false,
	pureUrl: null,
};

// vizually set clicked button as active
const setNewBtn = (btns, newActBtn) => {
	btns.forEach(item => removeClass(item, "desc-active"));
	addClass(newActBtn, "desc-active");
};

const reloadPage = (id, url) => {
	chrome.tabs.update(id, { url: url });
	window.close();
};

const showReloadPopUp = ({ id, url }) => {
	const popupReloadBtn = querySelector(".popup_reload");
	popupReloadBtn.addEventListener("click", e => {
		e.preventDefault();
		reloadPage(id, url);
	});

	const popupReload = querySelector(".popup");
	addClass(popupReload, "popup-show");
	setTimeout(() => {
		removeClass(popupReload, "popup-show");
		addClass(popupReload, "popup-fade");
	}, 2000);
	setTimeout(() => {
		removeClass(popupReload, "popup-fade");
	}, 3000);
};

// handle clicks on buttons
const buttons = querySelectorAll(".desc");
buttons.forEach(item =>
	item.addEventListener(
		"click",
		debounce(function (e) {
			e.preventDefault();

			const mode = getAttr(this, "data-mode");

			if (state.curMode === mode) return;

			setNewBtn(buttons, this);

			chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
				// check website object. Change/add property
				const websites = await getWebsites();
				const pureUrl = getPureURL(tabs[0]);

				const newWebsites = { ...websites, [pureUrl]: mode };
				try {
					await setWebsites(newWebsites);
				} catch (e) {
					console.log(e);
				}

				// if whitelist just enabled and prevent content active -> remove prevent content (prevent content is not working in whitelist)
				if (mode === "whitelist" && state.isRestContActive)
					state = { ...state, isRestContActive: false };

				state = { ...state, curMode: mode };
				// send msg to content script with new active mode
				chrome.tabs.sendMessage(tabs[0].id, { activeMode: mode }, resp => {
					if (resp && resp.closePopup === true) {
						showReloadPopUp(tabs[0]);
					}
				});
			});

			return false;
		}, 150)
	)
);

// stats update
const updStats = async () => {
	const { stats } = await getStorageData("stats");

	querySelector(".stats__elem").innerHTML = nFormatter(stats.numbOfItems, 1);
	querySelector(".stats__size").innerHTML = nFormatter(stats.cleanedArea, 1);
};

// setup tutorial screen
const initTutorial = (updated = false) => {
	const tutorialWrap = querySelector(".tutorial");
	const tutorialRead = querySelector(".tutorial__read");
	const tutorialSkip = querySelector(".tutorial__skip");
	const tutorialSetup = querySelector(".tutorial__setup");
	if (updated === true) querySelector(".tutorial__head").textContent = "Automode!";
	// open tutorial
	removeClass(tutorialWrap, "tutorial-non");

	// one-click setup
	tutorialSetup.addEventListener("click", e => {
		e.preventDefault();
		addClass(tutorialWrap, "tutorial-setup");

		querySelectorAll(".setings__btn").forEach(elem =>
			elem.addEventListener("click", async function () {
				const preset = getAttr(this, "data-preset");
				const curAutoMode = preset === "presetManual" ? "whitelist" : "easyModeActive";

				await setStorageData({
					curAutoMode: curAutoMode,
				});

				setTimeout(() => {
					removeClass(tutorialWrap, "tutorial-setup");
				}, 300);
			})
		);
	});

	// open the link
	tutorialRead.addEventListener("click", async () => {
		await setStorageData({
			tutorial: false,
			update: false,
		});
		window.close();
	});

	// close tutorial
	tutorialSkip.addEventListener("click", async e => {
		e.preventDefault();
		await setStorageData({
			tutorial: false,
			update: false,
		});
		addClass(tutorialWrap, "tutorial-hide");
		setTimeout(() => {
			addClass(tutorialWrap, "tutorial-non");
		}, 500);
	});
};

// init popup state
const init = () => {
	chrome.tabs.query({ active: true, currentWindow: true }, async tabs => {
		const { statsEnabled, restoreContActive, curAutoMode, stats, update, tutorial } =
			await getStorageData([
				"update",
				"tutorial",
				"curAutoMode",
				"statsEnabled",
				"stats",
				"restoreContActive",
			]);
		const websites = await getWebsites();

		// setup tutorial
		if (tutorial) initTutorial(update);

		// set statistics
		if (statsEnabled) {
			addClass(querySelector(".stats"), "stats-show");
			// update statistic
			querySelector(".stats__elem").innerHTML = nFormatter(stats.numbOfItems, 1);
			querySelector(".stats__size").innerHTML = nFormatter(stats.cleanedArea, 1);
			setInterval(updStats, 1000);
		}

		// modes init
		const pureUrl = getPureURL(tabs[0]);
		state = { ...state, pureUrl: pureUrl };

		// check restore content array and set btn
		if (restoreContActive.includes(pureUrl)) {
			addClass(querySelector(".add_opt"), "add_opt-active");
			state = { ...state, isRestContActive: true };
		}

		// if website is in one of arrays - set the proper mode
		let curModeName = curAutoMode;
		const fullWebsites = { ...defWebsites, ...websites };

		if (pureUrl in fullWebsites) {
			curModeName = fullWebsites[pureUrl];
		}

		const actButton = querySelector(`[data-mode='${curModeName}']`);
		state = { ...state, curMode: curModeName };
		setNewBtn(buttons, actButton);
	});
};
init();

// prevent content
const prevContBtn = querySelector(".add_opt");
prevContBtn.addEventListener(
	"click",
	debounce(async function (e) {
		e.preventDefault();
		const { restoreContActive } = await getStorageData(["restoreContActive"]);
		const websites = await getWebsites();
		let newArr = [];
		let newWebsites = { ...websites };

		// add/remove site to restore content array
		if (state.isRestContActive) {
			newArr = restoreContActive.filter(url => url !== state.pureUrl);
			removeClass(this, "add_opt-active");
		} else {
			newArr = [...restoreContActive, state.pureUrl];
			addClass(this, "add_opt-active");
		}

		// if whitelist activated, add website to easy mode (prevent content should not work in whitelist)
		if (state.curMode === "whitelist") {
			newWebsites = { ...websites, [state.pureUrl]: "easyModeActive" };
			state = { ...state, curMode: "easyModeActive" };
		}

		// set state
		try {
			await setWebsites(newWebsites);
			await setStorageData({ restoreContActive: newArr });
			state = { ...state, isRestContActive: !state.isRestContActive };
		} catch (e) {
			console.log(e);
		}

		// reload current page and close popup if activated prevent content
		if (state.isRestContActive) {
			chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
				chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
				window.close();
			});
		}
	}, 500)
);
