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

    if (getStyle(doc, 'overflow-y') == 'hidden') {
		setPropImp(doc, "overflow-y", "unset")
		if (statsEnabled) state = { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	if (getStyle(body, 'overflow-y') == 'hidden') {
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

	const positionCheck = (element) => {
		// needs to get minus value for top value if it is
		const ELEMENT_TOP = getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							100
		const ELEMENT_HEIGHT = getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							300

		if (ELEMENT_TOP > 10) {
			if (statsEnabled) {
				const layoutArea = element.offsetHeight * element.offsetWidth
				state = {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
			}

			setPropImp(element, "display", "none")
		} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {
			if (statsEnabled) {
				const layoutArea = element.offsetHeight * element.offsetWidth
				state = {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
			}

			setPropImp(element, "display", "none")
		}
	}

	const contentCheck = (element) => {
		const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss', 'turn off', 'turning off', 'disable', 'ad blocker', 'ad block', 'adblock', 'adblocker']

	    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
			if (statsEnabled) {
				const layoutArea = element.offsetHeight * element.offsetWidth
				state = {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
			}

			setPropImp(element, "display", "none")
	    }
	}

	const semanticCheck = (element) => {
	    const ARR_OF_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

	    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item)) ||
			(element.tagName == "NAV") ||
			(element.tagName == "HEADER")) {
			if (statsEnabled) state = {...state, numbOfItems: state.numbOfItems - 1 }

	    	element.style.display = null
	    }
	}
	// find all fixed elements on page
	const $elems = document.body.getElementsByTagName("*")
	const LEN = $elems.length

	for (let i = 0; i < LEN; i++) {

	    if ((getStyle($elems[i], 'position') == 'fixed') ||
	    	(getStyle($elems[i], 'position') == 'sticky')) {
	    	if ($elems[i].getAttribute('data-PopUpOFF') === 'notification')
	        	continue

	    	if (getStyle($elems[i], 'display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        }
	    	positionCheck($elems[i])
	    	contentCheck($elems[i])
	    	semanticCheck($elems[i])
	    }
	    if ((getStyle($elems[i], 'filter') != 'none') ||
	    	(getStyle($elems[i], '-webkit-filter') != 'none')) {
	    	setPropImp($elems[i], "filter", "none")
	    	setPropImp($elems[i], "-webkit-filter", "none")
			if (statsEnabled) state.numbOfItems++
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
