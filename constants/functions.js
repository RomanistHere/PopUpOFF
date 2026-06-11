// DOM searching
const querySelector = selector => document.querySelector(selector);
const querySelectorAll = selector => document.querySelectorAll(selector);
// Get root url of website
const getPureURL = ({ url }) => {
	try {
		return new URL(url).host;
	} catch {
		return "";
	}
};
// DOM manipulating
const addClass = (node, className) => node.classList.add(className);
const removeClass = (node, className) => node.classList.remove(className);
const getAttr = (node, attrName) => node.getAttribute(attrName);
// Browser actions. Badge - text at right bottom corner of extension's icon
const setBadgeText = text => tabID => {
	try {
		chrome.action.setBadgeText({
			text: text ? text : "",
			tabId: tabID ? tabID : null,
		});
		chrome.action.setBadgeBackgroundColor({ color: "#222831" });
	} catch (e) {
		console.log("Couldn't set badge");
		console.log(e);
	}
};

const nFormatter = (num, digits) => {
	const si = [
		{ value: 1, symbol: "" },
		{ value: 1e3, symbol: "k" },
		{ value: 1e6, symbol: "M" },
		{ value: 1e9, symbol: "G" },
		{ value: 1e12, symbol: "T" },
		{ value: 1e15, symbol: "P" },
		{ value: 1e18, symbol: "E" },
	];
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
	let i;
	for (i = si.length - 1; i > 0; i--) {
		if (num >= si[i].value) {
			break;
		}
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
};

const debounce = (func, wait, immediate) => {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

// Storage related methods
const arrayToObj = (arr, prop) =>
	arr.reduce((acc, value) => ({ ...acc, [value]: prop }), {});

const getStorageData = key =>
	new Promise((resolve, reject) =>
		chrome.storage.sync.get(key, result =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve(result)
		)
	);

const setStorageData = data =>
	new Promise((resolve, reject) =>
		chrome.storage.sync.set(data, () =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve()
		)
	);

const getStorageLocal = key =>
	new Promise((resolve, reject) =>
		chrome.storage.local.get(key, result =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve(result)
		)
	);

const setStorageLocal = data =>
	new Promise((resolve, reject) =>
		chrome.storage.local.set(data, () =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve()
		)
	);

// Per-site preferences live in storage.local: it has no meaningful size limit,
// unlike storage.sync whose 8KB-per-item quota broke saving altogether
// ("storage full") once users had collected a few hundred sites.
const setWebsites = websites => setStorageLocal({ websites: { ...websites } });

const getWebsites = async () => {
	try {
		const { websites } = await getStorageLocal("websites");
		return websites != null ? websites : {};
	} catch {
		return {};
	}
};

export {
	querySelector,
	querySelectorAll,
	addClass,
	removeClass,
	getAttr,
	getPureURL,
	setBadgeText,
	nFormatter,
	debounce,
	setWebsites,
	getWebsites,
	getStorageData,
	setStorageData,
	getStorageLocal,
	setStorageLocal,
	arrayToObj,
};
