'use strict';

var dom_observer
var dom_observer_new 

var infiniteLoopPreventCounter = 0
var myTimer

function removeDomWatcher() {
	if (dom_observer) {
		dom_observer.disconnect()
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}
}

var resetLoopCounter = function() {
    infiniteLoopPreventCounter = 0
    myTimer = 0
}

function domWatcherHard() {
	if (!dom_observer) {
		dom_observer = new MutationObserver(function(mutation) {
			// prevent inifnite looping
			if (infiniteLoopPreventCounter > 200) {
				removeDomWatcher()
			}
			infiniteLoopPreventCounter++
			if (!myTimer) {
				myTimer = window.setTimeout(resetLoopCounter, 1000)
			}

			mutation.forEach(function(mutation) {
				checkElemForPositionEasy(mutation.target)
				mutation.addedNodes.forEach(function(element) {
					if (element.nodeName != '#text') checkElemForPositionEasy(element)
				})
				removeOverflow()
			})				
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

function checkElemForPositionEasy(element) {
	if (element instanceof HTMLElement) {
		// element itself
		if ((window.getComputedStyle(element, null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle(element, null).getPropertyValue('position') == 'sticky')) {
			checkAndRemove(element)
	    }
		// all childs of element
		let elems = element.querySelectorAll("*")
		let len = elems.length

		for (let i=0; i<len; i++) {
		    if ((window.getComputedStyle(elems[i], null).getPropertyValue('position') == 'fixed') || 
		    	(window.getComputedStyle(elems[i], null).getPropertyValue('position') == 'sticky')) {

		    	checkAndRemove(elems[i])

		    }
		}
	}
}

function checkAndRemove(element) {
	console.log(element)
	let elementTop = window.getComputedStyle(element,null).getPropertyValue('top').match(/\d+/) ?
						Number(window.getComputedStyle(element,null).getPropertyValue('top').match(/\d+/)[0]) :
						100;
	let elementHeight = window.getComputedStyle(element,null).getPropertyValue('height').match(/\d+/) ?
						Number(window.getComputedStyle(element,null).getPropertyValue('height').match(/\d+/)[0]) :
						300;
	console.log(elementTop)
	console.log(elementHeight)

	if (elementTop > 10) {

		if (window.getComputedStyle(element,null).getPropertyValue('display') != 'none') {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	element.setAttribute('data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime', 'UFoundMeHelloThere')
        }

		element.style.setProperty("display", "none", "important")

	} else if ((elementHeight + elementTop) > 250) {

		if (window.getComputedStyle(element,null).getPropertyValue('display') != 'none') {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	element.setAttribute('data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime', 'UFoundMeHelloThere')
        }

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