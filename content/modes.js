const hardMode = (statsEnabled, shouldRestoreCont) => {
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

	// methods
	const checkElem = element => {
		if (!isDecentElem(element)) return

		const elemPosStyle = getStyle(element, 'position')
		if ((elemPosStyle == 'fixed') ||
	    	(elemPosStyle == 'sticky')) {

			if (element.getAttribute('data-PopUpOFF') === 'notification')
	        	return

	        if (getStyle(element, 'display') != 'none') {
	        	element.setAttribute('data-PopUpOFFBl', 'bl')
	        }

			if (statsEnabled) state = addItemToStats(element, state)

	        setPropImp(element, "display", "none")
	    }

	    state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem)
	}

	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1200) {
			removeDomWatcher(domObserver, wasNotStoped, body, action)
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

		domObserver.observe(doc, {
			childList: true,
			subtree: true,
			attributes: true
		})
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

	// methods
	const videoCheck = element => {
		// traverse through the element and its children recursively till find <video> tag or block the element
		const nodeName = element.nodeName
		const childNodes = element.childNodes

		if (nodeName === 'APP-DRAWER' || nodeName === 'VIDEO')
			return false

		// contains shadow dom
		if (element.shadowRoot)
	        return videoCheck(element.shadowRoot)

		// is iframe
		if (element.contentDocument)
			return videoCheck(element.contentDocument)

		// check all the children
		for (let i = 0; i < childNodes.length; i++) {
			if (childNodes[i].nodeType == 1 && !videoCheck(childNodes[i]))
				return false
		}

		return true
	}

	const positionCheck = element => {
		if (element.offsetHeight === 0 || element.offsetWidth === 0) {
			// console.warn('Zero')
			return true
		}

        const layoutArea = element.offsetHeight * element.offsetWidth
		const screenValue = roundToTwo(layoutArea/state.windowArea)

		const offsetBot = window.innerHeight - (element.offsetTop + element.offsetHeight)

		// console.log(element)
		// console.log('elemOffsetTop', element.offsetTop)
		// console.log('elemOffsetLeft', element.offsetLeft)
		// console.log('elemOffsetBot', offsetBot)
        // console.log('elemOffsetWidth ', element.offsetWidth)
		// console.log('elemOffsetHeight', element.offsetHeight)
        // console.log('layoutArea ', layoutArea)
        // console.log('screenValue ', screenValue)

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

		if (element.offsetLeft <= 0 && element.offsetWidth <= 360) {
			// youtube/facebook sidebar
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

			const elemKey =`${element.offsetWidth}x${element.offsetHeight}`
			const memoized = elemKey in memoize
			const shouldRemove = memoized ? memoize[elemKey] : positionCheck(element)

            if (shouldRemove) {
                if (statsEnabled) state = addItemToStats(element, state)

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
			removeDomWatcher(domObserver, wasNotStoped, body, action)
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

		domObserver.observe(doc, {
			childList: true,
			subtree: true,
			attributes: true
		})
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
