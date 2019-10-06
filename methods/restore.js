// restore elems when turn off extension by uniq data-atr
var restoreFixedElems = () => {
	const ELEMS = document.querySelectorAll('[data-popupoffExtension]')
	const LEN = ELEMS.length

	for (let i=0; i<LEN; i++) {
        ELEMS[i].style.display = null
	}
	
	if (dom_observer) {
		dom_observer.disconnect()
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}
}

chrome.storage.sync.get("autoWorkEasy", (res) => {
	// check if we gonna remove or restore elems
	if (res.autoWorkEasy) {

	} else {
		chrome.storage.sync.get("autoWork", (res) => {
			if (res.autoWork) {
				
			} else {
				restoreFixedElems()
			}
		})
	}
})

	