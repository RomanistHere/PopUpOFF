import {
	addClass,
	getStorageData,
	getStorageLocal,
	querySelector,
	querySelectorAll,
	removeClass,
	setStorageData,
	setStorageLocal,
} from "../constants/functions.js";

import "../constants/data.js";

const { defPreventContArr } = globalThis.popupoffData;

let state = {
	stats: true,
	ctxMenu: true,
};

// button checkmark -> cross animation
querySelectorAll(".options__btn").forEach(btn => {
	btn.addEventListener("click", function (e) {
		e.preventDefault();
		// cross/checkmark animation
		this.classList.add("options__btn-activate");
		setTimeout(() => {
			this.classList.toggle("options__btn-active");
		}, 300);
		setTimeout(() => {
			this.classList.remove("options__btn-activate");
		}, 310);
	});
});

// stats //
const secondsToHms = l => {
	const d = Number(l);
	const h = Math.floor(d / 3600);
	const m = Math.floor((d % 3600) / 60);
	const s = Math.floor((d % 3600) % 60);

	const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
	const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
	const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";

	return hDisplay + mDisplay + sDisplay;
};

const resetStats = async e => {
	if (e) e.preventDefault();
	await setStorageLocal({
		stats: {
			cleanedArea: 0,
			numbOfItems: 0,
			restored: 0,
		},
	});
	window.location.reload();
};

const initStats = async () => {
	const statsBtn = querySelector(".stats");
	const { statsEnabled } = await getStorageData("statsEnabled");
	const { stats } = await getStorageLocal("stats");

	if (statsEnabled) {
		try {
			const { cleanedArea, numbOfItems } = stats;

			addClass(statsBtn, "options__btn-active");
			state = { ...state, stats: true };
			querySelector(".statsCount").textContent = numbOfItems;
			if (cleanedArea > 0) {
				querySelector(".statsArea").textContent = parseFloat(parseFloat(cleanedArea).toFixed(1));
				querySelector(".statsTime").textContent = secondsToHms(cleanedArea * .3);
			}
		} catch (e) {
			console.log(e);
		}
	} else {
		removeClass(statsBtn, "options__btn-active");
		state = { ...state, stats: false };
	}

	statsBtn.addEventListener("click", async e => {
		e.preventDefault();
		if (!state.stats) {
			await setStorageData({ statsEnabled: true });
			removeClass(statsBtn, "options__btn-active");
			state = { ...state, stats: true };

			if (!stats) {
				await resetStats();
			}
		} else {
			await setStorageData({ statsEnabled: false });
			addClass(statsBtn, "options__btn-active");
			state = { ...state, stats: false };
		}
	});
};

// keyboard shortcut //
const initKeyboard = async () => {
	const inputs = querySelectorAll(".kbrd input");
	const { shortCutMode } = await getStorageData("shortCutMode");

	if (shortCutMode)
		querySelector(`.kbrd input[value=${shortCutMode}]`).checked = true;

	inputs.forEach(elem => {
		elem.addEventListener("change", async (e) => {
			const mode = e.target.value === "null" ? null : e.target.value;
			await setStorageData({ shortCutMode: mode });
		})
	});
};

// autmode //
const initAutoMode = async () => {
	const inputs = querySelectorAll(".auto input");
	const { curAutoMode } = await getStorageData("curAutoMode");

	if (curAutoMode)
		querySelector(`.auto input[value=${curAutoMode}]`).checked = true;

	inputs.forEach(elem => {
		elem.addEventListener("change", async (e) => {
			const mode = e.target.value === "null" ? null : e.target.value;
			await setStorageData({ curAutoMode: mode });
		})
	});
};

// resetting //
const initReset = async () => {
	// resetting //
	const resetButtons = querySelectorAll(".options__button");
	resetButtons.forEach(item =>
		item.addEventListener("click", e => {
			e.preventDefault();
			const label = e.currentTarget.getAttribute("data-label");

			if (label)
				firePopUp(label);
		})
	);

	const popup = querySelector(".popup");
	const popupCloseBtn = querySelector(".notDelete");
	const popupDeleteBtn = querySelector(".delete");

	popupCloseBtn.addEventListener("click", e => {
		e.preventDefault();

		popupDeleteBtn.removeEventListener("click", resetStats);
		popupDeleteBtn.removeEventListener("click", resetSettings);
		popupDeleteBtn.removeEventListener("click", resetAll);

		closePopUp();
	});

	const resetSettings = async e => {
		e.preventDefault();
		await setStorageData({
			statsEnabled: true,
			curAutoMode: "whitelist",
			staticSubMode: "relative",
			shortCutMode: null,
		});
		window.location.reload();
	};

	const resetAll = async e => {
		e.preventDefault();
		await setStorageData({
			statsEnabled: true,
			curAutoMode: "whitelist",
			staticSubMode: "relative",
			shortCutMode: null,
		});
		await setStorageLocal({
			stats: {
				cleanedArea: 0,
				numbOfItems: 0,
				restored: 0,
			},
			restoreContActive: [...defPreventContArr],
			websites: {},
		});
		window.location.reload();
	};

	const closePopUp = () => removeClass(popup, "popup-show");

	const firePopUp = label => {
		addClass(popup, "popup-show");

		if (label === "stats") popupDeleteBtn.addEventListener("click", resetStats);
		else if (label === "settings")
			popupDeleteBtn.addEventListener("click", resetSettings);
		else if (label === "all") popupDeleteBtn.addEventListener("click", resetAll);
	};
};

const initDelicate = async () => {
	const inputs = querySelectorAll(".delicate input");
	const { staticSubMode } = await getStorageData("staticSubMode");

	if (staticSubMode === "absolute")
		querySelector(`.delicate #absolute`).checked = true;
	else if (staticSubMode === "static")
		querySelector(`.delicate #static`).checked = true;

	inputs.forEach(elem => {
		elem.addEventListener("change", async (e) => {
			await setStorageData({ staticSubMode: e.target.value });
		})
	});
};

const initExportSettings = () => {
	const initExport = async () => {
		const syncData = await getStorageData(null);
		const localData = await getStorageLocal(null);
		const json = JSON.stringify({ format: 2, sync: syncData, local: localData });
		const blob = new Blob([new TextEncoder().encode(json)], {
			type: "application/json;charset=utf-8"
		});

		chrome.downloads.download({
			url: URL.createObjectURL(blob),
			filename: 'PopUpOFF_settings.json'
		});
	}

	const exportSettings = async () => {
		// a single direct request() resolves true right away when already granted and
		// keeps Firefox's "must be called from a user input handler" requirement happy
		const granted = await chrome.permissions.request({
			permissions: ["downloads"],
		});

		if (granted) {
			initExport();
		} else {
			alert("You can't export (download) settings without giving permissions first");
		}
	}

	querySelector(".exportBtn").addEventListener("click", async e => {
		e.preventDefault();
		await exportSettings();
	});

	// init import
	const input = querySelector(".importInput");

	const importJson = async (e) => {
		const file = input.files[0];
		const reader = new FileReader();

		reader.readAsText(file);

		reader.onload = async () => {
			const data = JSON.parse(reader.result);

			if (data && data.format === 2) {
				await setStorageData(data.sync || {});
				await setStorageLocal(data.local || {});
			} else {
				// legacy backups kept everything in one (sync) bag - split it up
				const { websites1, websites2, websites3, restoreContActive, stats, ...settings } = data;
				await setStorageData(settings);
				await setStorageLocal({
					websites: { ...websites1, ...websites2, ...websites3 },
					restoreContActive: restoreContActive != null ? restoreContActive : [],
					stats: stats != null ? stats : { cleanedArea: 0, numbOfItems: 0, restored: 0 },
				});
			}

			alert("Success! Update this page to see the changes.");

			input.value = '';
		};

		reader.onerror = () => {
			console.log(reader.error);
			alert("Couldn't read the file. Contact RomanistHere@pm.me for help");

			input.value = '';
		};
	};

	input.addEventListener("change", importJson, false);

	querySelector(".importBtn").addEventListener("click", async e => {
		e.preventDefault();
		input.click();
	});
};

const initCtxMenu = async () => {
	const ctxBtn = querySelector(".ctxMenu");
	const { ctxEnabled } = await getStorageData("ctxEnabled");

	if (ctxEnabled) {
		addClass(ctxBtn, "options__btn-active");
		state = { ...state, ctxMenu: true };
	} else {
		removeClass(ctxBtn, "options__btn-active");
		state = { ...state, ctxMenu: false };
	}

	ctxBtn.addEventListener("click", async e => {
		e.preventDefault();
		if (!state.ctxMenu) {
			chrome.runtime.sendMessage({ ctxEnabled: true });
			await setStorageData({ ctxEnabled: true });
			removeClass(ctxBtn, "options__btn-active");
			state = { ...state, ctxMenu: true };
		} else {
			chrome.runtime.sendMessage({ ctxEnabled: false });
			await setStorageData({ ctxEnabled: false });
			addClass(ctxBtn, "options__btn-active");
			state = { ...state, ctxMenu: false };
		}
	});
};

const initDonation = async () => {
	querySelector(".donationImage").src = chrome.runtime.getURL("/images/stop_ads.png");

	const { optBannerClicked } = await getStorageData(["optBannerClicked"]);
	if (!optBannerClicked) {
		removeClass(querySelector(".donation"), "hidden");
	}

	querySelectorAll(".donation__btns a").forEach(elem => elem.addEventListener("click", async () => {
		await setStorageData({ optBannerClicked: true });
	}));
}

initDonation();
initStats();
initKeyboard();
initAutoMode();
initReset();
initDelicate();
initExportSettings();
initCtxMenu();
