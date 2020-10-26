// DOM searching
const querySelector = (selector) => document.querySelector(selector)
const querySelectorAll = (selector) => document.querySelectorAll(selector)
const isChecked = (node) => node.checked
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
const resetBadgeText = setBadgeText('')
// Curried execute script
const executeScript = (tabId) =>
	(methodName) =>
		chrome.tabs.executeScript(
			tabId,
		  	{file: 'methods/' + methodName + '.js'}
		)
const executeScriptHere = executeScript(null)

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

const activateMode = (isHard) =>
	(tabId) => {
		setBadgeText(isHard ? 'H' : 'E')(tabId)
		executeScript(tabId)(isHard ? 'removeHard' : 'removeEasy')
		executeScript(tabId)('showAll')
	}
const activateHard = activateMode(true)
const activateEasy = activateMode(false)

const backupData = () =>
	storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'stats'], response => {
		storageSet({
			backupData: {
				hard: response.thisWebsiteWork,
				easy: response.thisWebsiteWorkEasy,
				stats: response.stats
			}
		})
	})

export {
	querySelector,
	querySelectorAll,
	isChecked,
	addClass,
	removeClass,
	getAttr,
	storageSet,
	storageGet,
	executeScript,
	executeScriptHere,
	getPureURL,
	setBadgeText,
	resetBadgeText,
	nFormatter,
	activateMode,
	activateHard,
	activateEasy,
	backupData,
}
