var restoreFixedElems = () => {
	const ELEMS = document.querySelectorAll('[data-popupoffExtension]')
	const LEN = ELEMS.length

	const ARR_OF_CONTENT_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss', 'turn off', 'turning off', 'disable', 'ad blocker', 'ad block', 'adblock', 'adblocker']
	const ARR_OF_TAG_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

	try {
		if (domObserver) domObserver.disconnect()
		if (domObserverLight) domObserverLight.disconnect()
	} catch (e) {
		console.log(e)
	}

	for (let i=0; i<LEN; i++) {
		const element = ELEMS[i]

	    if (ARR_OF_CONTENT_ITEMS.some(item => element.innerHTML.includes(item))) {

	    } else {
	    	element.style.display = null
	    }

		const ELEMENT_TOP = window.getComputedStyle(element,null).getPropertyValue('top').match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(window.getComputedStyle(element,null).getPropertyValue('top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							100;
		const ELEMENT_HEIGHT = window.getComputedStyle(element,null).getPropertyValue('height').match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(window.getComputedStyle(element,null).getPropertyValue('height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							300;

		if (ELEMENT_TOP > 10) {
			element.style.setProperty("display", "none", "important")
		} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {
			element.style.setProperty("display", "none", "important")
		}

	    if (ARR_OF_TAG_ITEMS.some(item => element.innerHTML.includes(item)) ||
			(element.tagName == "NAV") ||
			(element.tagName == "HEADER")) {
	    	element.style.display = null
	    }
	}
}

chrome.storage.sync.get("autoWork", (res) => {
	// check if we gonna remove or restore elems
	if (res.autoWork) {

	} else {
		restoreFixedElems()
	}
})
