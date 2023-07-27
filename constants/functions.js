// DOM searching
const querySelector = selector => document.querySelector(selector);
const querySelectorAll = selector => document.querySelectorAll(selector);
// Get root url of website
const getPureURL = ({ url }) =>
	url.substring(url.lastIndexOf("//") + 2, url.indexOf("/", 8));
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

const splitIntoChunks = obj => {
	let obj1 = {};
	let obj2 = {};
	let obj3 = {};

	const keys = Object.keys(obj);
	const keysLength = keys.length;
	let k = 0;

	for (let i = 0; i < keysLength; i++) {
		const key = keys[i];
		if (k === 0) {
			obj1 = { ...obj1, [key]: obj[key] };
			k++;
		} else if (k === 1) {
			obj2 = { ...obj2, [key]: obj[key] };
			k++;
		} else if (k === 2) {
			obj3 = { ...obj3, [key]: obj[key] };
			k = 0;
		}
	}

	return {
		obj1: obj1,
		obj2: obj2,
		obj3: obj3,
	};
};

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

const setWebsites = async obj => {
	const { obj1, obj2, obj3 } = obj
		? splitIntoChunks(obj)
		: { obj1: {}, obj2: {}, obj3: {} };

	// console.table(obj)
	// console.table(obj1)
	// console.table(obj2)
	// console.table(obj3)

	// console.log('st length: ', Object.keys(obj).length)
	// console.log(Object.keys(obj1).length)
	// console.log(Object.keys(obj2).length)
	// console.log(Object.keys(obj3).length)
	// console.log('fin length: ', Object.keys(obj1).length + Object.keys(obj2).length + Object.keys(obj3).length)

	return setStorageData({
		websites1: { ...obj1 },
		websites2: { ...obj2 },
		websites3: { ...obj3 },
	});
};

const getWebsites = async () => {
	try {
		const { websites1, websites2, websites3 } = await getStorageData([
			"websites1",
			"websites2",
			"websites3",
		]);
		const websites = { ...websites1, ...websites2, ...websites3 };
		return websites;
	} catch (e) {
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
	splitIntoChunks,
	setWebsites,
	getWebsites,
	getStorageData,
	setStorageData,
	arrayToObj,
};
