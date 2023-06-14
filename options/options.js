import {
	getStorageData,
	setStorageData,
	querySelector,
	querySelectorAll,
	addClass,
	removeClass,
} from "../constants/functions.js";

import { defPreventContArr } from "../constants/data.js";

let state = {
	tutorial: false,
	stats: true,
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

// tutorial //
const initTutorial = async () => {
	const tutorialBtn = querySelector(".tutorial");
	const { tutorial } = await getStorageData("tutorial");

	if (tutorial) {
		addClass(tutorialBtn, "options__btn-active");
		state = { ...state, tutorial: true };
	} else {
		removeClass(tutorialBtn, "options__btn-active");
		state = { ...state, tutorial: false };
	}

	tutorialBtn.addEventListener("click", async e => {
		e.preventDefault();
		if (!state.tutorial) {
			await setStorageData({ tutorial: true });
			removeClass(tutorialBtn, "options__btn-active");
			state = { ...state, tutorial: true };
		} else {
			await setStorageData({ tutorial: false });
			addClass(tutorialBtn, "options__btn-active");
			state = { ...state, tutorial: false };
		}
	});
};

// stats //
const initStats = async () => {
	const statsBtn = querySelector(".stats");
	const { statsEnabled } = await getStorageData("statsEnabled");

	if (statsEnabled) {
		addClass(statsBtn, "options__btn-active");
		state = { ...state, stats: true };
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

	const resetStats = async e => {
		e.preventDefault();
		await setStorageData({
			stats: {
				cleanedArea: 0,
				numbOfItems: 0,
				restored: 0,
			},
		});
		window.location.reload();
	};

	const resetSettings = async e => {
		e.preventDefault();
		await setStorageData({
			tutorial: true,
			update: false,
			statsEnabled: true,
			backupData: {},
			curAutoMode: "whitelist",
			shortCutMode: null,
			preset: "presetManual",
		});
		window.location.reload();
	};

	const resetAll = async e => {
		e.preventDefault();
		await setStorageData({
			tutorial: true,
			update: false,
			stats: {
				cleanedArea: 0,
				numbOfItems: 0,
				restored: 0,
			},
			statsEnabled: true,
			backupData: {},
			restoreContActive: [...defPreventContArr],
			curAutoMode: "whitelist",
			shortCutMode: null,
			websites1: {},
			websites2: {},
			websites3: {},
			preset: "presetManual",
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

const initStationary = async () => {
	const inputs = querySelectorAll(".stationary input");
	const { staticSubMode } = await getStorageData("staticSubMode");

	if (staticSubMode === "absolute")
		querySelector(`.stationary #absolute`).checked = true;

	inputs.forEach(elem => {
		elem.addEventListener("change", async (e) => {
			await setStorageData({ staticSubMode: e.target.value });
		})
	});
};

initTutorial();
initStats();
initKeyboard();
initAutoMode();
initReset();
initStationary();
