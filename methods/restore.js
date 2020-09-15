// restore elems when turn off extension by uniq data-atr
var restoreFixedElems = () => {
	const elems = document.querySelectorAll('[data-popupoffExtension]')
	const arr = [...elems]

	try {
		if (domObserver) domObserver.disconnect()
		if (domObserverLight) domObserverLight.disconnect()
	} catch (e) {
		// console.log(e)
	}

	arr.map(elem => elem.style.display = null)
}

browser.storage.sync.get("autoWorkEasy", (res) => {
	// check if we gonna remove or restore elems
	if (res.autoWorkEasy) {

	} else {
		browser.storage.sync.get("autoWork", (res) => {
			if (res.autoWork) {

			} else {
				restoreFixedElems()
			}
		})
	}
})
