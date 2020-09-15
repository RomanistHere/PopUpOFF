var removeFixedElems = (statsEnabled) => {
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
	const fixStats = stats => {
		let fixedStats = {...stats}
		if (isNaN(stats.cleanedArea))
			fixedStats = { ...state, cleanedArea: 0 }
		if (isNaN(stats.numbOfItems))
			fixedStats = { ...state, numbOfItems: 0 }
		if (isNaN(stats.restored))
			fixedStats = { ...state, restored: 0 }
		return fixedStats
	}
	const setNewData = state =>
		chrome.storage.sync.get(['stats'], resp => {
			// round to first decimal
			const screenValue = Math.round(state.cleanedArea/state.windowArea * 10) / 10
			let newStats = {
				cleanedArea: parseFloat(resp.stats.cleanedArea) + parseFloat(screenValue),
				numbOfItems: parseFloat(resp.stats.numbOfItems) + parseFloat(state.numbOfItems),
				restored: parseFloat(resp.stats.restored) + parseFloat(state.restored)
			}

			if (isNaN(newStats.cleanedArea) ||
				isNaN(newStats.numbOfItems) ||
				isNaN(newStats.restored))
					newStats = fixStats(newStats)

			chrome.storage.sync.set({ stats: newStats })
		})
	const addItemToStats = (element, state) => {
		const layoutArea = element.offsetHeight * element.offsetWidth

		return isNaN(layoutArea) ? state : {
			...state,
			numbOfItems: parseFloat(state.numbOfItems) + 1,
			cleanedArea: parseFloat(state.cleanedArea) + parseFloat(layoutArea)
		}
	}

	let state = statsEnabled ? {
		windowArea: parseFloat(window.innerHeight * window.innerWidth),
		cleanedArea: 0,
		numbOfItems: 0,
		restored: 0
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

		    if (statsEnabled) state = { ...state, numbOfItems: parseFloat(state.numbOfItems) + 1 }
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

chrome.storage.sync.get(['statsEnabled'], resp => {
	removeFixedElems(resp.statsEnabled)
})
