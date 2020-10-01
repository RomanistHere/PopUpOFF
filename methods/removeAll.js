var removeFixedElems = (statsEnabled) => {
	// state
	let state = statsEnabled ? {
		windowArea: parseFloat(window.innerHeight * window.innerWidth),
		cleanedArea: 0,
		numbOfItems: 0,
		restored: 0
	} : null

	// unmutable
	const doc = document.documentElement
	const body = document.body
	const elems = body.getElementsByTagName("*")

	// methods
	const checkElem = elem => {
		if (!isDecentElem(elem)) return

		const elemPosStyle = getStyle(elem, 'position')
		if ((elemPosStyle == 'fixed') ||
	    (elemPosStyle == 'sticky')) {
			if (statsEnabled) state = addItemToStats(elem, state)
		    // setting uniq data-atr to elems with display block as initial state to restore it later
		    elem.setAttribute('data-popupoffExtension', 'hello')
		    setPropImp(elem, "display", "none")
		}

		if (elemPosStyle == 'absolute') {
			if (statsEnabled) state = addItemToStats(elem, state)

		    setPropImp(elem, "display", "none")
		}

		state = additionalChecks(elem, state, statsEnabled, true, checkElem)
	}

	// remove
	state = removeOverflow(statsEnabled, state, doc, body)
	checkElems(elems, checkElem)
	// stats
	if (statsEnabled) {
		setNewData(state)
		if (!beforeUnloadAactive) {
			window.addEventListener("beforeunload", () => { setNewData(state) })
			beforeUnloadAactive = true
		}
	}
}

chrome.storage.sync.get(['statsEnabled'], resp => {
	removeFixedElems(resp.statsEnabled)
})
