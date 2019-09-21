chrome.storage.sync.get("autoWork", function(res) {
	// check if we gonna remove or restore elems
	if (res.autoWork) {

	} else {
		restoreFixedElems()
	}
})

// restore elems when turn off extension by uniq data-atr
function restoreFixedElems() {
	const ELEMS = document.querySelectorAll('[data-popupoffExtension]')
	const LEN = ELEMS.length

	const ARR_OF_CONTENT_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss']
	const ARR_OF_TAG_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

	for (let i=0; i<LEN; i++) {
		const element = ELEMS[i]    	

	    if (ARR_OF_CONTENT_ITEMS.some(item => element.innerHTML.includes(item))) {
			
	    } else {
	    	element.style.display = null
	    }

	    //

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

		//    	

	    if (ARR_OF_TAG_ITEMS.some(item => element.innerHTML.includes(item)) ||
			(element.tagName == "NAV") ||
			(element.tagName == "HEADER")) {
	    	element.style.display = null
	    }
	}

	if (dom_observer) {
		dom_observer.disconnect()
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}
}

	