var removeFixedElems = (statsEnabled) => {
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")

	let state = statsEnabled ? {
		windowArea: window.innerHeight * window.innerWidth,
		cleanedArea: 0,
		numbOfItems: 0
	} : null

	const doc = document.documentElement
	const body = document.body

	if (getStyle(doc, 'overflow-y')) {
		setPropImp(doc, "overflow-y", "unset")
		if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	if (getStyle(body, 'overflow-y')) {
		setPropImp(body, "overflow-y", "unset")
		if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	}

    if ((getStyle(doc, 'position') == 'fixed') ||
    	(getStyle(doc, 'position') == 'absolute')) {
		setPropImp(doc, "position", "relative")
		if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	if ((getStyle(body, 'position') == 'fixed') ||
    	(getStyle(body, 'position') == 'absolute')) {
		setPropImp(body, "position", "relative")
		if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	// find all fixed elements on page
	const $elems = body.getElementsByTagName("*")

	for (let i = 0; i < $elems.length; i++) {

	    if ((getStyle($elems[i], 'position') == 'fixed') ||
	    	(getStyle($elems[i], 'position') == 'sticky')) {

	    	if ($elems[i].getAttribute('data-PopUpOFF') === 'notification')
	        	continue

        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        if (getStyle($elems[i], 'display') != 'none')
	        	$elems[i].setAttribute('data-popupoffExtension', 'hello')

			if (statsEnabled) {
				const layoutArea = $elems[i].offsetHeight * $elems[i].offsetWidth
				state = {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
			}

	        setPropImp($elems[i], "display", "none")
	        setTimeout(() => $elems[i] ? setPropImp($elems[i], "display", "none") : false, 10)
	    }

	    if ((getStyle($elems[i], 'filter') != 'none') ||
	    	(getStyle($elems[i], '-webkit-filter') != 'none')) {
	    	setPropImp($elems[i], "filter", "none")
	    	setPropImp($elems[i], "-webkit-filter", "none")

			if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	    }
	}

	if (statsEnabled) {
		chrome.storage.sync.get(['stats'], resp => {
			const screenValue = Math.round(state.cleanedArea/state.windowArea * 10) / 10
			const newStats = {
				cleanedArea: resp.stats.cleanedArea + screenValue,
				numbOfItems: resp.stats.numbOfItems + state.numbOfItems
			}

			chrome.storage.sync.set({ stats: newStats })
		})
	}
}

chrome.storage.sync.get(['statsEnabled'], resp => {
	removeFixedElems(resp.statsEnabled)
})
