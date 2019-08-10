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
		if (wasNotStoped) setTimeout(domWatcherHard, 3000);
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

function domWatcherHard() {
	if (!dom_observer) {
		dom_observer = new MutationObserver(function(mutation) {
			for (let i = 0; i < mutation.length; i++){
				// prevent inifnite looping
				if (infiniteLoopPreventCounter > 800) {
					removeDomWatcher()
					break
				}
				infiniteLoopPreventCounter++
				if (!myTimer) {
					myTimer = window.setTimeout(resetLoopCounter, 1000)
				}

				checkElemForPositionHard(mutation[i].target)
				mutation[i].addedNodes.forEach(function(element) {
					if (element.nodeName != '#text') checkElemForPositionHard(element)
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

domWatcherHard()

function checkElemForPositionHard($element) {
	if ($element instanceof HTMLElement) {
		// element itself
		if ((window.getComputedStyle($element, null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle($element, null).getPropertyValue('position') == 'sticky')) {
	        if (window.getComputedStyle($element, null).getPropertyValue('display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	$element.setAttribute('data-popupoffExtension', 'hello')
	        }
	        $element.style.setProperty("display", "none", "important")
	    }

	    if ((window.getComputedStyle($element,null).getPropertyValue('filter') != 'none') ||
	    	(window.getComputedStyle($element,null).getPropertyValue('-webkit-filter') != 'none')) {
	    	$element.style.setProperty("filter", "none", "important")
	    	$element.style.setProperty("-webkit-filter", "none", "important")
	    }
	    // all childs of element
		const $elems = $element.querySelectorAll("*")
		const LEN = $elems.length

		for (let i=0; i<LEN; i++) {

		    if ((window.getComputedStyle($elems[i], null).getPropertyValue('position') == 'fixed') || 
		    	(window.getComputedStyle($elems[i], null).getPropertyValue('position') == 'sticky')) {
		        if (window.getComputedStyle($elems[i], null).getPropertyValue('display') != 'none') {
		        	// setting uniq data-atr to elems with display block as initial state to restore it later
		        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
		        }
		        $elems[i].style.setProperty("display", "none", "important")
		    }

		    if ((window.getComputedStyle($elems[i],null).getPropertyValue('filter') != 'none') ||
		    	(window.getComputedStyle($elems[i],null).getPropertyValue('-webkit-filter') != 'none')) {
		    	$elems[i].style.setProperty("filter", "none", "important")
		    	$elems[i].style.setProperty("-webkit-filter", "none", "important")
		    }

		}
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