// Script can be injected few times in the same area
var domObserver
var domObserverLight

var infiniteLoopPreventCounter = 0
var myTimer = 0
var wasNotStoped = true

var punish = (statsEnabled, shouldRestoreCont) => {
	// helper functions
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
	const checkIsInArr = (arr, item) => arr.includes(item) ? true : false
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
				cleanedArea: resp.stats.cleanedArea + screenValue,
				numbOfItems: resp.stats.numbOfItems + state.numbOfItems,
				restored: resp.stats.restored + state.restored
			}

			if (isNaN(newStats.cleanedArea) ||
				isNaN(newStats.numbOfItems) ||
				isNaN(newStats.restored))
					newStats = fixStats(newStats)

			chrome.storage.sync.set({ stats: newStats })
		})
	const addCountToStats = (state) => {
		return { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	// state
	let state = statsEnabled ? {
		windowArea: window.innerHeight * window.innerWidth,
		cleanedArea: 0,
		numbOfItems: 0,
		restored: 0
	} : null

	// unmutable
	const doc = document.documentElement
	const body = document.body
	const elems = body.getElementsByTagName("*")

	// methods
	const removeOverflow = () => {
		if (getStyle(doc, 'overflow-y')) {
			setPropImp(doc, "overflow-y", "unset")
			if (statsEnabled) state = addCountToStats(state)
		}

		if (getStyle(body, 'overflow-y')) {
			setPropImp(body, "overflow-y", "unset")
			if (statsEnabled) state = addCountToStats(state)
		}

		const docPosStyle = getStyle(doc, 'position')
	    if ((docPosStyle == 'fixed') ||
	    	(docPosStyle == 'absolute')) {
			setPropImp(doc, "position", "relative")
			if (statsEnabled) state = addCountToStats(state)
		}

		const bodyPosStyle = getStyle(body, 'position')
		if ((bodyPosStyle== 'fixed') ||
	    	(bodyPosStyle == 'absolute')) {
			setPropImp(body, "position", "relative")
			if (statsEnabled) state = addCountToStats(state)
		}
	}
	const checkElem = element => {
		const elemPosStyle = getStyle(element, 'position')
		if ((elemPosStyle == 'fixed') ||
	    	(elemPosStyle == 'sticky')) {

			if (element.getAttribute('data-PopUpOFF') === 'notification')
	        	return

	        if (getStyle(element, 'display') != 'none') {
	        	element.setAttribute('data-popupoffExtension', 'hello')
	        }

			if (statsEnabled) {
				const layoutArea = element.offsetHeight * element.offsetWidth
				state = isNaN(layoutArea) ? state : {
					...state,
					numbOfItems: state.numbOfItems + 1,
					cleanedArea: state.cleanedArea + layoutArea
				}
			}

	        setPropImp(element, "display", "none")
			setTimeout(() => element ? setPropImp(element, "display", "none") : false, 10)
	    }

	    if ((getStyle(element, 'filter') != 'none') ||
	    	(getStyle(element, '-webkit-filter') != 'none')) {
	    	setPropImp(element, "filter", "none")
	    	setPropImp(element, "-webkit-filter", "none")

			if (statsEnabled) state = addCountToStats(state)
	    }
	}
	const checkElems = elems => {
		const arr = [...elems]
		arr.map(checkElem)
	}
	// watch DOM
	const checkElemWithSibl = element => {
		if (element instanceof HTMLElement) {
			// element itself
			checkElem(element)
		    // all childs of element
			if (wasNotStoped) {
				const elems = element.querySelectorAll("*")
				checkElems(elems)
			}
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
			if (wasNotStoped) {
				setTimeout(() => {
					const newElems = document.body.getElementsByTagName("*")
					action(newElems)
				}, 2000)
			}
			wasNotStoped = false
			domObserverLight.disconnect()
		} catch (e) {
		}
	}
	const checkMutation = mutation => {
		checkElemWithSibl(mutation.target)
		const arr = [...mutation.addedNodes]
		arr.map(element => {
			if ((element.nodeName != '#text') && (element.nodeName != '#comment')) checkElemWithSibl(element)
		})
		removeOverflow()
	}
	const unsetHeight = mutation => {
		mutation.target.style.removeProperty("height")
	}
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1200) {
			removeDomWatcher()
			return true
		}
		infiniteLoopPreventCounter++
		if (myTimer === 0) {
			myTimer = setTimeout(resetLoopCounter, 1000)
		}
		return false
	}
	const restoreNode = mutation => {
		const target = mutation.target
		const length = mutation.removedNodes.length

		for (let i = 0; i < length; i++) {
			const removedNodeClone = mutation.removedNodes[i].cloneNode(true)
			if (removedNodeClone.getAttribute('data-PopUpOFF') === 'notification')
				return

			target.appendChild(removedNodeClone)
		}

		target.style.removeProperty("height")
		target.style.removeProperty("margin")
		target.style.removeProperty("padding")

		if (statsEnabled) state = { ...state, restored: state.restored + 1 }
	}
	const checkForRestore = mutation => {
		unsetHeight(mutation)

		if (mutation.type === 'childList' &&
		mutation.removedNodes.length) {
			restoreNode(mutation)
		}
	}
	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				let processedElems = []
				const len = mutations.length
				for (let i = 0; i < len; i++) {
					// stop and disconnect if oversized
					const shouldStop = prevLoop()
					if (shouldStop)
						break

					const mutation = mutations[i]

					if (!shouldRestoreCont) {
						const isProcessed = checkIsInArr(processedElems, mutation.target)
						// skip if processed
						if (isProcessed)
							continue
						else
							processedElems = [...processedElems, mutation.target]
					} else {
						checkForRestore(mutation)
					}

					// check element and its siblings
					checkMutation(mutation)
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

	const action = elems => {
		removeOverflow()
		checkElems(elems)
		watchDOM()
	}

	// Let the hunt begin!
	action(elems)
	// statistics
	if (statsEnabled) {
		setNewData(state)
		window.addEventListener("beforeunload", () => { setNewData(state) })
	}
}

chrome.storage.sync.get(['statsEnabled', 'restoreCont'], resp => {
	punish(resp.statsEnabled, resp.restoreCont)
})
