var domObserver
var domObserverLight

var infiniteLoopPreventCounter = 0
var myTimer = 0
var wasNotStoped = true

const memoize = {}
// setInterval(() => {
// 	console.log(memoize)
// }, 5000)

const autoMode = (statsEnabled, shouldRestoreCont) => {
	// state
	let state = statsEnabled
		? {
			windowArea: parseFloat(window.innerHeight * window.innerWidth),
			cleanedArea: 0,
			numbOfItems: 0,
			restored: 0
		}
		: {
			windowArea: parseFloat(window.innerHeight * window.innerWidth)
		}

	// unmutable
	const doc = document.documentElement
	const body = document.body
	const elems = body.getElementsByTagName("*")

	const videoCheck = element => true

	// methods
	const positionCheck = element => {
		if (element.offsetHeight === 0 || element.offsetWidth === 0) {
			// console.warn('Zero')
			return true
		}

        const layoutArea = element.offsetHeight * element.offsetWidth
		const screenValue = roundToTwo(layoutArea/state.windowArea)

		const offsetBot = window.innerHeight - (element.offsetTop + element.offsetHeight)

		console.log(element)
		console.log('elemOffsetTop', element.offsetTop)
		// console.log('elemOffsetLeft', element.offsetLeft)
		// console.log('elemOffsetBot', offsetBot)
        console.log('elemOffsetWidth ', element.offsetWidth)
		// console.log('elemOffsetHeight', element.offsetHeight)
        // console.log('layoutArea ', layoutArea)
        console.log('screenValue ', screenValue)

		if (screenValue >= .98) {
			// case 1: overlay on the whole screen - should block
			// case 2: video in full screen mode - should not
			// console.warn('Full screen!')
			return videoCheck(element)
		}

		if (element.offsetTop <= 70 && element.offsetHeight <= 200 && element.offsetWidth > 640) {
			// it's a header!
			// console.warn('Header!')
			return false
		}

		if (element.offsetLeft <= 0 && element.offsetWidth <= 300) {
			// youtube sidebar
			// console.warn('SideBar!')
			return false
		}

		if (screenValue < .98 && screenValue >= .1) {
			// overlays
			// console.warn('Overlay')
			return true
		}

		if (screenValue <= .03 && element.offsetTop > 100) {
			// buttons and side/social menus
			// console.warn('Super small')
			return false
		}

		if (element.offsetHeight >= 160 && element.offsetWidth >= 300) {
			// scrolling videos in the articles
			// console.warn('Scrolling video!')
			return true
		}

		if (offsetBot <= 100) {
			// bottom notification
			// console.warn('Bottom notification')
			return true
		}

		if (screenValue <= .1 && element.offsetTop > 100) {
			// buttons and side/social menus
			// console.warn('nothing special')
			return false
		}

        return true
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
			const elemKey =`${element.offsetWidth}x${element.offsetHeight}`
			const memoized = elemKey in memoize
			const shouldRemove = memoized ? memoize[elemKey] : positionCheck(element)

            if (shouldRemove) {
                // if (statsEnabled) state = addItemToStats(element, state)

                setPropImp(element, "display", "none")
            }

			if (!memoized)
				memoize[elemKey] = shouldRemove
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

chrome.storage.sync.get(['statsEnabled', 'hardModeActive', 'easyModeActive', 'whitelist', 'restoreContActive', 'curAutoMode'], resp => {
	const { statsEnabled, restoreContActive, hardModeActive, whitelist, easyModeActive, curAutoMode } = resp
	const pureUrl = getPureURL(window.location.href)
	const shouldRestoreCont = restoreContActive.includes(pureUrl)
	console.log(resp)
	console.log(pureUrl)
	console.log('hard: ', hardModeActive.includes(pureUrl))
	console.log('whitelist: ', whitelist.includes(pureUrl))

	// check arrays with sites first of all
	if (whitelist.includes(pureUrl))
		return

	if (hardModeActive.includes(pureUrl)) {
		hardMode(statsEnabled, shouldRestoreCont)
		return
	}

	if (easyModeActive.includes(pureUrl)) {
		autoMode(statsEnabled, shouldRestoreCont)
		return
	}

	// if nothing check and automode
	if (curAutoMode === 'easyModeActive') {
		autoMode(statsEnabled, shouldRestoreCont)
		return
	}

	if (curAutoMode === 'whitelist')
		return

	if (curAutoMode === 'hardModeActive') {
		hardMode(statsEnabled, shouldRestoreCont)
		return
	}

	autoMode(statsEnabled, restoreCont)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// "change mode" listener from popup.js
	const { activeMode } = request
	// check stats and restore content
	chrome.storage.sync.get(['statsEnabled', 'restoreContActive'], resp => {
		const { statsEnabled, restoreContActive } = resp
		const pureUrl = getPureURL(window.location.href)
		const shouldRestoreCont = restoreContActive.includes(pureUrl)

	    if (activeMode === 'hardModeActive') {
			hardMode(statsEnabled, shouldRestoreCont)
			return
		}

	    if (activeMode === 'easyModeActive') {
			autoMode(statsEnabled, shouldRestoreCont)
			return
		}

	    if (activeMode === 'whitelist') {
			// reset
			sendResponse({ closePopup: true })
			window.location.reload()
			return
		}
	})
})
