var domObserver
var domObserverLight

var infiniteLoopPreventCounter = 0
var myTimer = 0
var wasNotStoped = true

const autoMode = (statsEnabled, shouldRestoreCont) => {
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
        console.log(element.nodeName)
        // memoize layoutArea and screenValue
        const layoutArea = element.offsetHeight * element.offsetWidth
        const screenValue = Math.round(layoutArea/state.windowArea * 10) / 10
        const elemTopStyle = getStyle(element, 'top')
		const elemBotStyle = getStyle(element, 'bottom')
        const elemWidthStyle = getStyle(element, 'width')
		const elemHeightStyle = getStyle(element, 'height')
        console.log('elemTopStyle ', elemTopStyle)
        console.log('elemBotStyle ', elemBotStyle)
        console.log('elemWidthStyle ', elemWidthStyle)
		console.log('elemHeightStyle ', elemHeightStyle)
        console.log('layoutArea ', layoutArea)
        console.log('screenValue ', screenValue)

        // if (screenValue >= .2)
            // return true
        // else if ()
        // position from bottom


        return false
	}
	const checkElem = element => {
		if (!isDecentElem(element)) return

		const elemPosStyle = getStyle(element, 'position')
	    if ((elemPosStyle == 'fixed') ||
	    	(elemPosStyle == 'sticky')) {

	    	if (element.getAttribute('data-PopUpOFF') === 'notification')
	        	return

	    	// if (getStyle(element, 'display') != 'none') {
	        // 	element.setAttribute('data-popupoffExtension', 'hello')
	        // }

	    	const shouldRemove = positionCheck(element)
            if (shouldRemove) {
                // if (statsEnabled) state = addItemToStats(element, state)

                setPropImp(element, "display", "none")
            }
	    }

	    state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem)
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
		// state = removeOverflow(statsEnabled, state, doc, body)
		checkElems(elems, checkElem)
		// if (shouldRestoreCont)
		// 	state = findHidden(state, statsEnabled, doc)
		watchDOM()
	}

	// Let the hunt begin!
	action(elems)
	// statistics
	// if (statsEnabled) {
	// 	setNewData(state)
	// 	if (!beforeUnloadAactive) {
	// 		window.addEventListener("beforeunload", () => { setNewData(state) })
	// 		beforeUnloadAactive = true
	// 	}
	// }
}

chrome.storage.sync.get(['statsEnabled', 'restoreCont'], resp => {
	autoMode(resp.statsEnabled, resp.restoreCont)
})
