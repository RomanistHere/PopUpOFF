var dom_observer
var dom_observer_new 

var infiniteLoopPreventCounter = 0
var myTimer
var wasNotStoped = true

var removeDomWatcher = () => {
	if (dom_observer) {
		dom_observer.disconnect()
		dom_observer = false
		if (wasNotStoped) setTimeout(domWatcherEasy, 3000);
		wasNotStoped = false
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}
}

var resetLoopCounter = () => {
    infiniteLoopPreventCounter = 0
    myTimer = 0
}

var domWatcherEasy = () => {
	if (!dom_observer) {
		dom_observer = new MutationObserver((mutation) => {
			for (let i = 0; i < mutation.length; i++){
				// prevent inifnite looping
				if (infiniteLoopPreventCounter > 400) {
					removeDomWatcher()
					break
				}
				infiniteLoopPreventCounter++
				if (!myTimer) {
					myTimer = window.setTimeout(resetLoopCounter, 1000)
				}

				checkElemForPositionEasy(mutation[i].target)
				mutation[i].addedNodes.forEach((element) => {
					if (element.nodeName != '#text') checkElemForPositionEasy(element)
				})
				removeOverflow()
			}
		})
	}

	if (!dom_observer_new) {
		dom_observer_new = new MutationObserver((mutation) => {
			mutation.forEach((mutation) => {
				removeOverflow()
			})
		})
	}

	if (!window.location.href.includes('pinterest')) {
		dom_observer.observe(document.documentElement, { 
			childList: true, 
			subtree: true, 
			attributes: true
		})
	} else {
		// cant deal with this website, i guess there will be array of this one-like websites or I find out another solution
		dom_observer_new.observe(document.documentElement, {
			attributes: true
		})
		dom_observer_new.observe(document.body, {
			attributes: true
		})
	}
}

domWatcherEasy()

var getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
var setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")

var checkElem = ($element) => {
	if ((getStyle($element, 'position') == 'fixed') || 
    	(getStyle($element, 'position') == 'sticky')) {
        if (getStyle($element, 'display') != 'none') {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	$element.setAttribute('data-popupoffExtension', 'hello')
        }
		positionCheck($element)
    	contentCheck($element)
    	semanticCheck($element)
    }

    if ((getStyle($element, 'filter') != 'none') ||
    	(getStyle($element, '-webkit-filter') != 'none')) {
    	setPropImp($element, "filter", "none")
    	setPropImp($element, "-webkit-filter", "none")
    }
}

var checkElemForPositionEasy = ($element) => {
	if ($element instanceof HTMLElement) {
		// element itself
		checkElem($element)
		// all childs of element
		const $elems = $element.querySelectorAll("*")
		const LEN = $elems.length

		for (let i=0; i<LEN; i++) {
		    checkElem($elems[i])
		}
	}
}

var semanticCheck = (element) => {
    const ARR_OF_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item)) ||
		(element.tagName == "NAV") ||
		(element.tagName == "HEADER")) {
    	element.style.display = null
    }
}

var contentCheck = (element) => {
	const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
		element.style.setProperty("display", "none", "important")
    }
}

var positionCheck = (element) => {
	// needs to get minus value for top value if it is
	const ELEMENT_TOP = getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						100;
	const ELEMENT_HEIGHT = getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						300;

	if (ELEMENT_TOP > 10) {

		element.style.setProperty("display", "none", "important")

	} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {

		element.style.setProperty("display", "none", "important")

	}
}

var removeOverflow = () => {
	const doc = document.documentElement
	const body = document.body

    if (getStyle(doc, 'overflow-y') == 'hidden') {
		setPropImp(doc, "overflow-y", "unset")
	}

	if (getStyle(body, 'overflow-y') == 'hidden') {
		setPropImp(body, "overflow-y", "unset")
	}

    if ((getStyle(doc, 'position') == 'fixed') ||
    	(getStyle(doc, 'position') == 'absolute')) {
		setPropImp(doc, "position", "relative")
	}

	if ((getStyle(body, 'position') == 'fixed') ||
    	(getStyle(body, 'position') == 'absolute')) {
		setPropImp(body, "position", "relative")
	}
}