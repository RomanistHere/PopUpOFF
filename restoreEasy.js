'use strict';

chrome.storage.sync.get("autoWork", function(res) {
	// check if we gonna remove or restore elems
	if (res.autoWork) {

	} else {
		restoreFixedElems()
	}
})

// restore elems when turn off extension by uniq data-atr
function restoreFixedElems() {
	let elems = document.querySelectorAll('[data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime]')
	let len = elems.length

	for (let i=0; i<len; i++) {
        
        if ((elems[i].innerHTML.includes('<nav')) || 
        	(elems[i].innerHTML.includes('<header')) ||
        	(elems[i].innerHTML.includes('search')) ||
        	(elems[i].innerHTML.includes('ytmusic')) ||
        	(elems[i].tagName == "NAV") ||
        	(elems[i].tagName == "HEADER")) {
        	elems[i].style.display = null
        } else {

        }
	}

	if (dom_observer) {
		dom_observer.disconnect()
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}
}

	