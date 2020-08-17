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

	setPropImp(doc, "overflow-y", "unset")
	setPropImp(body, "overflow-y", "unset")

	setPropImp(doc, "position", "relative")
	setPropImp(body, "position", "relative")

	// find all fixed elements on page
	const $elems = body.getElementsByTagName("*")
	const LEN = $elems.length

	for (let i = 0; i < LEN; i++) {

	    if ((getStyle($elems[i], 'position') == 'fixed') ||
	    	(getStyle($elems[i], 'position') == 'sticky')) {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        setPropImp($elems[i], "display", "none")

			if (statsEnabled) {
				const layoutArea = $elems[i].offsetHeight * $elems[i].offsetWidth
				state = {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
			}
	    }

	    if ((getStyle($elems[i], 'filter') != 'none') ||
	    	(getStyle($elems[i], '-webkit-filter') != 'none')) {
	    	setPropImp($elems[i], "filter", "none")
	    	setPropImp($elems[i], "-webkit-filter", "none")

			if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	    }

	    if (getStyle($elems[i], 'position') == 'absolute') {
	    	setPropImp($elems[i], "display", "none")

			if (statsEnabled) {
				const layoutArea = $elems[i].offsetHeight * $elems[i].offsetWidth
				state = {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
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
}

chrome.storage.sync.get(['statsEnabled'], resp => {
	removeFixedElems(resp.statsEnabled)
})
