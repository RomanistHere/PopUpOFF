var removeFixedElems = (statsEnabled) => {
	let state = statsEnabled ? {
		windowArea: parseFloat(window.innerHeight * window.innerWidth),
		cleanedArea: 0,
		numbOfItems: 0,
		restored: 0
	} : null

	const doc = document.documentElement
	const body = document.body
	const elems = body.getElementsByTagName("*")

	const checkElem = elem => {
		if ((elem.nodeName == 'SCRIPT') ||
		(elem.nodeName == 'HEAD') ||
		(elem.nodeName == 'BODY') ||
		(elem.nodeName == 'HTML') ||
		(elem.nodeName == 'STYLE'))
			return

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

		if ((getStyle(elem, 'filter') != 'none') ||
		    (getStyle(elem, '-webkit-filter') != 'none')) {
		    setPropImp(elem, "filter", "none")
		    setPropImp(elem, "-webkit-filter", "none")

		    if (statsEnabled) state = addCountToStats(state)
		}

		if (elem.shadowRoot)
			checkElemWithSibl(elem.shadowRoot, checkElem)
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
