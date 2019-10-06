// DOM searching
const querySelector = (selector) => document.querySelector(selector)
const isChecked = (node) => node.checked
// Get root url of website
const getPureURL = ({ url }) => url.substring(url.lastIndexOf("//") + 2, url.indexOf("/", 8))
// DOM manipulating
const addClass = (node, className) => node.classList.add(className)
const removeClass = (node, className) => node.classList.remove(className)
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

export {
	querySelector,
	isChecked,
	addClass,
	removeClass,
	storageSet,
	storageGet,
	executeScript,
	executeScriptHere,
	getPureURL,
	setBadgeText,
	resetBadgeText,
}