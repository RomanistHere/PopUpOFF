// Script can be injected few times in the same area
var domObserver
var domObserverLight

var infiniteLoopPreventCounter = 0
var myTimer = 0
var wasNotStoped = true

var punishEasy = (statsEnabled, shouldRestoreCont) => {
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
	const positionCheck = element => {
		// needs to get minus value for top value if it is
		const elemTopStyle = getStyle(element, 'top')
		const elemHeightStyle = getStyle(element, 'height')
		const ELEMENT_TOP = elemTopStyle.match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(elemTopStyle.match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							100
		const ELEMENT_HEIGHT = elemHeightStyle.match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(elemHeightStyle.match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
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
		const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss', 'turn off', 'turning off', 'disable', 'ad blocker', 'ad block', 'adblock', 'adblocker', 'advertising', 'bloqueador de anuncios']

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
			if (statsEnabled) state = {...state, numbOfItems: parseFloat(state.numbOfItems) - 1 }

	    	element.style.display = null
	    }
	}
	const checkElem = element => {
		if ((element.nodeName == 'SCRIPT') ||
		(element.nodeName == 'HEAD') ||
		(element.nodeName == 'BODY') ||
		(element.nodeName == 'HTML') ||
		(element.nodeName == 'STYLE'))
			return

		const elemPosStyle = getStyle(element, 'position')
	    if ((elemPosStyle == 'fixed') ||
	    	(elemPosStyle == 'sticky')) {

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

		if (shouldRestoreCont) state = detectGrad(state, statsEnabled, element)
	}
	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1000) {
			removeDomWatcher(domObserver, wasNotStoped, body, domObserverLight, action)
			return true
		}
		infiniteLoopPreventCounter++
		if (myTimer === 0) {
			myTimer = setTimeout(() => resetLoopCounter(infiniteLoopPreventCounter, myTimer), 1000)
		}
		return false
	}
	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				state = watchMutations(mutations, shouldRestoreCont, statsEnabled, state, doc, body, prevLoop, checkElem)
			})
		}

		if (window.location.href.includes('pinterest')) {
			// cant deal with this website, i guess there will be array of this-one-like websites or I find out another solution
			domObserverLight = new MutationObserver(mutation => {
				mutation.map(item => {
					state = removeOverflow(statsEnabled, state, doc, body)
				})
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

	const action = elems => {
		state = removeOverflow(statsEnabled, state, doc, body)
		checkElems(elems, checkElem)
		if (shouldRestoreCont)
			state = findHidden(state, statsEnabled, doc)
		watchDOM()
	}

	// Let the hunt begin!
	action(elems)
	// statistics
	if (statsEnabled) {
		setNewData(state)
		if (!beforeUnloadAactive) {
			window.addEventListener("beforeunload", () => { setNewData(state) })
			beforeUnloadAactive = true
		}
	}
}

chrome.storage.sync.get(['statsEnabled', 'restoreCont'], resp => {
	punishEasy(resp.statsEnabled, resp.restoreCont)
})
