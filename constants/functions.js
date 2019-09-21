// DOM searching
const querySelector = (selector) => document.querySelector(selector)
const isChecked = (node) => node.checked
// Get root url of website
const getPureURL = (tabObj) => tabObj.url.substring(tabObj.url.lastIndexOf("//") + 2, tabObj.url.indexOf("/", 8))
// DOM manipulating
const addClass = (node, className) => node.classList.add(className)
const removeClass = (node, className) => node.classList.remove(className)
// Chrome store
const storageSet = (changes) => chrome.storage.sync.set(changes)
const storageGet = (request, f) => chrome.storage.sync.get(request, f)

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
	executeScriptHere,
	getPureURL,
}