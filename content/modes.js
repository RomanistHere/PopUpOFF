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

	        if (getStyle(element, 'display') != 'none')
	        	element.setAttribute('data-PopUpOFFBl', 'bl')

			if (statsEnabled) state = addItemToStats(element, state)

	        setPropImp(element, "display", "none")
	    }

	    state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem)
	}

	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1200) {
			wasNotStoped = removeDomWatcher(domObserver, wasNotStoped, body, action)
			return true
		}
		infiniteLoopPreventCounter++
		if (myTimer === 0) {
			myTimer = setTimeout(() => {
				infiniteLoopPreventCounter = 0
			    clearTimeout(myTimer)
			    myTimer = 0
			}, 1000)
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
		removeListeners()
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

const easyMode = (statsEnabled, shouldRestoreCont, positionCheck) => {
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
	const memoize = new WeakMap()

	const checkElem = element => {
		if (!isDecentElem(element)) return

		const elemPosStyle = getStyle(element, 'position')
	    if ((elemPosStyle == 'fixed') ||
	    	(elemPosStyle == 'sticky')) {

	    	if (element.getAttribute('data-PopUpOFF') === 'notification')
	        	return

			if (getStyle(element, 'display') != 'none')
	        	element.setAttribute('data-PopUpOFFBl', 'bl')

			const memoized = memoize.has(element)
			const { shouldRemove, shouldMemo } = memoized
				? { shouldRemove: memoize.get(element), shouldMemo: false }
				: positionCheck(element, state.windowArea)

            if (shouldRemove) {
                if (statsEnabled) state = addItemToStats(element, state)

                setPropImp(element, "display", "none")
            }

			if (!memoized && shouldMemo)
				memoize.set(element, shouldRemove)
	    }

	    state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem)
	}
	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1000) {
			wasNotStoped = removeDomWatcher(domObserver, wasNotStoped, body, action)
			return true
		}
		infiniteLoopPreventCounter++
		if (myTimer === 0) {
			myTimer = setTimeout(() => {
				infiniteLoopPreventCounter = 0
			    clearTimeout(myTimer)
			    myTimer = 0
			}, 1000)
		}
		return false
	}

	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				state = watchMutations(mutations, shouldRestoreCont, statsEnabled, state, doc, body, prevLoop, checkElem, memoize)
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
		removeListeners()
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

// const easyMode = (statsEnabled, shouldRestoreCont, positionCheck) => {
// 	// state
// 	let state = statsEnabled
// 		? {
// 			windowArea: parseFloat(window.innerHeight * window.innerWidth),
// 			cleanedArea: 0,
// 			numbOfItems: 0,
// 			restored: 0
// 		}
// 		: {
// 			windowArea: parseFloat(window.innerHeight * window.innerWidth)
// 		}
// 	// unmutable
// 	const doc = document.documentElement
// 	const body = document.body
// 	const memoize = new WeakMap()
//
// 	const watchDOM = () => {
// 		if (!domObserver) {
// 			domObserver = new MutationObserver(mutations => {
// 				const len = mutations.length
// 			    for (let i = 0; i < len; i++) {
// 					const mutation = mutations[i]
// 					const elem = mutation.target
//
// 					check(elem)
// 				}
// 			})
// 		}
//
// 		domObserver.observe(doc, {
// 			childList: true,
// 			subtree: true,
// 			attributes: true
// 		})
// 	}
//
// 	const check = element => {
// 		console.log(element.nodeName)
// 		const childNodes = element.childNodes
// 		const elemPosStyle = getStyle(element, 'position')
//
// 	    if ((elemPosStyle == 'fixed') ||
// 	    	(elemPosStyle == 'sticky')) {
//
// 	    	if (element.getAttribute('data-PopUpOFF') === 'notification')
// 	        	return false
//
// 			if (getStyle(element, 'display') != 'none')
// 	        	element.setAttribute('data-PopUpOFFBl', 'bl')
//
// 			const memoized = memoize.has(element)
// 			const { shouldRemove, shouldMemo } = memoized
// 				? { shouldRemove: memoize.get(element), shouldMemo: false }
// 				: positionCheck(element, state.windowArea)
//
// 			if (!memoized && shouldMemo)
// 				memoize.set(element, shouldRemove)
//
//             if (shouldRemove) {
//                 if (statsEnabled) state = addItemToStats(element, state)
//
//                 setPropImp(element, "display", "none")
//
// 				return false
//             }
// 	    }
//
// 		if (element.contentDocument || element.nodeName === 'IFRAME') {
// 			console.log('IFRAME')
// 			console.log(element)
// 			try {
// 				const innerDoc = element.contentDocument || element.contentWindow.document
// 				console.log(innerDoc.querySelector('body'))
// 		        return check(innerDoc.querySelector('body'))
// 			} catch (e) {
// 				console.log(e)
// 				setPropImp(element, "display", "none")
// 			}
// 		}
//
// 		if (element.shadowRoot) {
// 			console.log('ShadowRoot')
// 			console.log(element)
// 			console.log(element.shadowRoot)
// 	        return check(element.shadowRoot)
// 		}
//
// 		// check all the children
// 		for (let i = 0; i < childNodes.length; i++) {
// 			childNodes[i].nodeType == 1 && !check(childNodes[i])
// 		}
//
// 		return true
// 	}
//
// 	const action = () => {
// 		state = removeOverflow(statsEnabled, state, doc, body)
// 		check(body)
// 		removeListeners()
// 		// if (shouldRestoreCont)
// 		// 	state = findHidden(state, statsEnabled, doc)
// 		// watchDOM()
// 	}
//
// 	// Let the hunt begin!
// 	action()
// }
