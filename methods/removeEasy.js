// I inject this script few times during the load of the page
var domObserver
var domObserverLight

var infiniteLoopPreventCounter = 0
var myTimer = 0
var wasNotStoped = true

var punishEasy = statsEnabled => {
	// helper functions
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
	const setNewData = state =>
		chrome.storage.sync.get(['stats'], resp => {
			// round to first decimal
			const screenValue = Math.round(state.cleanedArea/state.windowArea * 10) / 10
			const newStats = {
				cleanedArea: resp.stats.cleanedArea + screenValue,
				numbOfItems: resp.stats.numbOfItems + state.numbOfItems
			}

			chrome.storage.sync.set({ stats: newStats })
		})
	const addItemToStats = (element, state) => {
		const layoutArea = element.offsetHeight * element.offsetWidth
		return {
			...state,
			numbOfItems: state.numbOfItems + 1,
			cleanedArea: state.cleanedArea + layoutArea
		}
	}
	const addCountToStats = (state) => {
		return { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	// state
	let state = statsEnabled ? {
		windowArea: window.innerHeight * window.innerWidth,
		cleanedArea: 0,
		numbOfItems: 0
	} : null

	// unmutable
	const doc = document.documentElement
	const body = document.body
	const elems = document.body.getElementsByTagName("*")

	// methods
	const removeOverflow = () => {
	    if (getStyle(doc, 'overflow-y') == 'hidden') {
			setPropImp(doc, "overflow-y", "unset")
			if (statsEnabled) state = addCountToStats(state)
		}

		if (getStyle(body, 'overflow-y') == 'hidden') {
			setPropImp(body, "overflow-y", "unset")
			if (statsEnabled) state = addCountToStats(state)
		}

	    if ((getStyle(doc, 'position') == 'fixed') ||
	    	(getStyle(doc, 'position') == 'absolute')) {
			setPropImp(doc, "position", "relative")
			if (statsEnabled) state = addCountToStats(state)
		}

		if ((getStyle(body, 'position') == 'fixed') ||
	    	(getStyle(body, 'position') == 'absolute')) {
			setPropImp(body, "position", "relative")
			if (statsEnabled) state = addCountToStats(state)
		}
	}
	const positionCheck = element => {
		// needs to get minus value for top value if it is
		const ELEMENT_TOP = getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							100
		const ELEMENT_HEIGHT = getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							300

		if (ELEMENT_TOP > 10) {
			if (statsEnabled) state = addItemToStats(element, state)

			setPropImp(element, "display", "none")
		} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {
			if (statsEnabled) state = addItemToStats(element, state)

			setPropImp(element, "display", "none")
		}
	}
	const contentCheck = (element) => {
		const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss', 'turn off', 'turning off', 'disable', 'ad blocker', 'ad block', 'adblock', 'adblocker']

	    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
			if (statsEnabled) state = addItemToStats(element, state)

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
	const checkElem = element => {
	    if ((getStyle(element, 'position') == 'fixed') ||
	    	(getStyle(element, 'position') == 'sticky')) {

	    	if (element.getAttribute('data-PopUpOFF') === 'notification')
	        	return

	    	if (getStyle(element, 'display') != 'none') {
	        	element.setAttribute('data-popupoffExtension', 'hello')
	        }

	    	positionCheck(element)
	    	contentCheck(element)
	    	semanticCheck(element)
	    }
	    if ((getStyle(element, 'filter') != 'none') ||
	    	(getStyle(element, '-webkit-filter') != 'none')) {
	    	setPropImp(element, "filter", "none")
	    	setPropImp(element, "-webkit-filter", "none")

			if (statsEnabled) state = addItemToStats(element, state)
	    }
	}
	const checkElems = elems => {
		const arr = [...elems]
		arr.map(checkElem)
	}
	// watch DOM
	var checkElemWithSibl = (element) => {
		if (element instanceof HTMLElement) {
			// element itself
			checkElem(element)
			// all childs of element
			const elems = element.querySelectorAll("*")
			checkElems(elems)
		}
	}
	const resetLoopCounter = () => {
	    infiniteLoopPreventCounter = 0
		clearTimeout(myTimer)
	    myTimer = 0
	}
	const removeDomWatcher = () => {
		try {
			domObserver.disconnect()
			domObserver = false
			if (wasNotStoped) setTimeout(watchDOM, 3000)
			wasNotStoped = false
			domObserverLight.disconnect()
		} catch (e) {
		}
	}
	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver((mutation) => {
				for (let i = 0; i < mutation.length; i++){
					// prevent inifnite looping
					if (infiniteLoopPreventCounter > 600) {
						removeDomWatcher()
						break
					}
					infiniteLoopPreventCounter++
					if (myTimer === 0) {
						myTimer = setTimeout(resetLoopCounter, 1000)
					}

					// check element and its siblings
					checkElemWithSibl(mutation[i].target)
					const arr = [...mutation[i].addedNodes]
					arr.map(element => {
						if ((element.nodeName != '#text') && (element.nodeName != '#comment')) checkElemWithSibl(element)
					})
					removeOverflow()
				}
			})
		}

		if (window.location.href.includes('pinterest')) {
			// cant deal with this website, i guess there will be array of this-one-like websites or I find out another solution
			domObserverLight = new MutationObserver(mutation => {
				mutation.map(removeOverflow)
			})
			domObserverLight.observe(doc, {
				attributes: true
			})
			domObserverLight.observe(body, {
				attributes: true
			})
		} else {
			domObserver.observe(doc, {
				childList: true,
				subtree: true,
				attributes: true
			})
		}
	}

	// Let the hunt begin!
	removeOverflow()
	checkElems(elems)
	watchDOM()
	// statistics
	setNewData(state)
	window.addEventListener("beforeunload", () => { setNewData(state) })
}

chrome.storage.sync.get(['statsEnabled'], resp => {
	punishEasy(resp.statsEnabled)
})
