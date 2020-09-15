var removeFixedElems = (statsEnabled) => {
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
	const setNewData = state =>
		browser.storage.sync.get(['stats'], resp => {
			// round to first decimal
			const screenValue = Math.round(state.cleanedArea/state.windowArea * 10) / 10
			const newStats = {
				cleanedArea: resp.stats.cleanedArea + screenValue,
				numbOfItems: resp.stats.numbOfItems + state.numbOfItems
			}

			if (isNaN(newStats.cleanedArea) || isNaN(newStats.numbOfItems))
				return

			browser.storage.sync.set({ stats: newStats })
		})
	const addItemToStats = (element, state) => {
		const layoutArea = element.offsetHeight * element.offsetWidth

		return isNaN(layoutArea) ? state : {
			...state,
			numbOfItems: state.numbOfItems + 1,
			cleanedArea: state.cleanedArea + layoutArea
		}
	}

	let state = statsEnabled ? {
		windowArea: window.innerHeight * window.innerWidth,
		cleanedArea: 0,
		numbOfItems: 0
	} : null

	const doc = document.documentElement
	const body = document.body
	const elems = body.getElementsByTagName("*")

	const removeOverflow = () => {
		setPropImp(doc, "overflow-y", "unset")
		setPropImp(body, "overflow-y", "unset")

		setPropImp(doc, "position", "relative")
		setPropImp(body, "position", "relative")
	}

	const checkElem = elem => {
		if ((getStyle(elem, 'position') == 'fixed') ||
		    (getStyle(elem, 'position') == 'sticky')) {
		    // setting uniq data-atr to elems with display block as initial state to restore it later
		    elem.setAttribute('data-popupoffExtension', 'hello')
		    setPropImp(elem, "display", "none")

		    if (statsEnabled) state = addItemToStats(elem, state)
		}

		if ((getStyle(elem, 'filter') != 'none') ||
		    (getStyle(elem, '-webkit-filter') != 'none')) {
		    setPropImp(elem, "filter", "none")
		    setPropImp(elem, "-webkit-filter", "none")

		    if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
		}

		if (getStyle(elem, 'position') == 'absolute') {
		    setPropImp(elem, "display", "none")

		    if (statsEnabled) state = addItemToStats(elem, state)
		}
	}
	
	const checkElems = elems => {
		const arr = [...elems]
		arr.map(checkElem)
	}

	// remove
	removeOverflow()
	checkElems(elems)
	// stats
	if (statsEnabled) {
		setNewData(state)
		window.addEventListener("beforeunload", () => { setNewData(state) })
	}
}

browser.storage.sync.get(['statsEnabled'], resp => {
	removeFixedElems(resp.statsEnabled)
})
