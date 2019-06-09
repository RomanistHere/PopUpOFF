'use strict';

var dom_observer
var dom_observer_new 

var infiniteLoopPreventCounter = 0
var myTimer
var wasNotStoped = true

function removeDomWatcher() {
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

function resetLoopCounter() {
    infiniteLoopPreventCounter = 0
    myTimer = 0
}

function domWatcherEasy() {
	if (!dom_observer) {
		dom_observer = new MutationObserver(function(mutation) {
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
				mutation[i].addedNodes.forEach(function(element) {
					if (element.nodeName != '#text') checkElemForPositionEasy(element)
				})
				removeOverflow()
			}
		})
	}

	if (!dom_observer_new) {
		dom_observer_new = new MutationObserver(function(mutation) {
			mutation.forEach(function(mutation) {
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

function checkElemForPositionEasy(element) {
	if (element instanceof HTMLElement) {
		// element itself
		if ((window.getComputedStyle(element, null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle(element, null).getPropertyValue('position') == 'sticky')) {
			if (window.getComputedStyle(element, null).getPropertyValue('display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	element.setAttribute('data-popupoffExtension', 'hello')
	        }
			positionCheck(element)
	    	contentCheck(element)
	    	semanticCheck(element)
	    }
		// all childs of element
		const ELEMS = element.querySelectorAll("*")
		const LEN = ELEMS.length

		for (let i=0; i<LEN; i++) {
		    if ((window.getComputedStyle(ELEMS[i], null).getPropertyValue('position') == 'fixed') || 
		    	(window.getComputedStyle(ELEMS[i], null).getPropertyValue('position') == 'sticky')) {
		    	if (window.getComputedStyle(ELEMS[i], null).getPropertyValue('display') != 'none') {
		        	// setting uniq data-atr to elems with display block as initial state to restore it later
		        	ELEMS[i].setAttribute('data-popupoffExtension', 'hello')
		        }
		    	positionCheck(ELEMS[i])
		    	contentCheck(ELEMS[i])
		    	semanticCheck(ELEMS[i])

		    }
		}
	}
}

function semanticCheck(element) {
    const ARR_OF_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item)) ||
		(element.tagName == "NAV") ||
		(element.tagName == "HEADER")) {
    	element.style.display = null
    }
}

function contentCheck(element) {
	const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
		element.style.setProperty("display", "none", "important")
    }
}

function positionCheck(element) {
	// needs to get minus value for top value if it is
	const ELEMENT_TOP = window.getComputedStyle(element,null).getPropertyValue('top').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(window.getComputedStyle(element,null).getPropertyValue('top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						100;
	const ELEMENT_HEIGHT = window.getComputedStyle(element,null).getPropertyValue('height').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(window.getComputedStyle(element,null).getPropertyValue('height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						300;

	if (ELEMENT_TOP > 10) {

		element.style.setProperty("display", "none", "important")

	} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {

		element.style.setProperty("display", "none", "important")

	}
}

function removeOverflow() {
    if (window.getComputedStyle(document.documentElement, null).getPropertyValue('overflow-y') == 'hidden') {
		document.documentElement.style.setProperty("overflow-y", "unset", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('overflow-y') == 'hidden') {
		document.body.style.setProperty("overflow-y", "unset", "important")
	}

    if ((window.getComputedStyle(document.documentElement, null).getPropertyValue('position') == 'fixed') ||
    	(window.getComputedStyle(document.documentElement, null).getPropertyValue('position') == 'absolute')) {
		document.documentElement.style.setProperty("position", "relative", "important")
	}

	if ((window.getComputedStyle(document.body, null).getPropertyValue('position') == 'fixed') ||
    	(window.getComputedStyle(document.body, null).getPropertyValue('position') == 'absolute')) {
		document.body.style.setProperty("position", "relative", "important")
	}
}