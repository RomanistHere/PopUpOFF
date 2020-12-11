// DOM searching
const querySelector = (selector) => document.querySelector(selector)
const querySelectorAll = (selector) => document.querySelectorAll(selector)
// Get root url of website
const getPureURL = ({ url }) => url.substring(url.lastIndexOf("//") + 2, url.indexOf("/", 8))
// DOM manipulating
const addClass = (node, className) => node.classList.add(className)
const removeClass = (node, className) => node.classList.remove(className)
const getAttr = (node, attrName) => node.getAttribute(attrName)
// Chrome store
const storageSet = (changes) => chrome.storage.sync.set(changes)
const storageGet = (request, f) => chrome.storage.sync.get(request, f)
// Browser actions. Badge - text at right bottom corner of extension's icon
const setBadgeText = (text) =>
	(tabID) => {
		chrome.browserAction.setBadgeText({
			text: text ? text : "",
			tabId: tabID ? tabID : null
		})
		chrome.browserAction.setBadgeBackgroundColor({ color: "#222831" })
	}

const nFormatter = (num, digits) => {
	const si = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "k" },
		{ value: 1E6, symbol: "M" },
		{ value: 1E9, symbol: "G" },
		{ value: 1E12, symbol: "T" },
		{ value: 1E15, symbol: "P" },
		{ value: 1E18, symbol: "E" }
	]
	const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
	let i
	for (i = si.length - 1; i > 0; i--) {
		if (num >= si[i].value) {
			break
		}
	}
	return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

const backupData = () =>
	storageGet(['websites', 'curAutoMode', 'stats', 'statsEnabled', 'restoreContActive', 'shortCutMode', 'autoModeAggr'], response => {
		storageSet({
			backupData: { ...response }
		})
	})

const debounce = (func, wait, immediate) => {
	var timeout
	return function() {
		var context = this, args = arguments
		var later = function() {
			timeout = null
			if (!immediate) func.apply(context, args)
		}
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

const arrayToObj = (arr, prop) =>
	arr.reduce((acc, value) => ({ ...acc, [value]: prop }), {})

export {
	querySelector,
	querySelectorAll,
	addClass,
	removeClass,
	getAttr,
	storageSet,
	storageGet,
	getPureURL,
	setBadgeText,
	nFormatter,
	backupData,
	debounce,
	arrayToObj
}
