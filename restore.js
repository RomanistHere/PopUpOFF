'use strict';

chrome.storage.sync.get("autoWorkEasy", function(res) {
	// check if we gonna remove or restore elems
	if (res.autoWorkEasy) {

	} else {
		chrome.storage.sync.get("autoWork", function(res) {
			if (res.autoWork) {
				
			} else {
				restoreFixedElems()
			}
		})
	}
})

// restore elems when turn off extension by uniq data-atr
function restoreFixedElems() {
	let elems = document.querySelectorAll('[data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime]')
	let len = elems.length

	for (let i=0; i<len; i++) {
        elems[i].style.display = null
	}
	
	if (dom_observer) {
		dom_observer.disconnect()
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}
}

	