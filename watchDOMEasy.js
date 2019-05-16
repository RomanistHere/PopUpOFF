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
				checkElemForPositionHard(mutation.target)
				mutation.addedNodes.forEach(function(element) {
					if (element.nodeName != '#text') checkElemForPositionHard(element)
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
			attributes: true,
			attributeFilter: ['style']
		})
	} else {
		dom_observer_new.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['style']
		})
		dom_observer_new.observe(document.body, {
			attributes: true,
			attributeFilter: ['style']
		})
	}
}

domWatcherHard()

function checkElemForPositionHard(element) {
	if (element instanceof HTMLElement) {
		let elems = element.querySelectorAll("*")
		let len = elems.length

		for (let i=0; i<len; i++) {
		    if ((window.getComputedStyle(elems[i], null).getPropertyValue('position') == 'fixed') || 
		    	(window.getComputedStyle(elems[i], null).getPropertyValue('position') == 'sticky')) {

		    	if ((elems[i].innerHTML.includes('<nav')) || 
		        	(elems[i].innerHTML.includes('<header')) ||
		        	(elems[i].innerHTML.includes('search')) ||
		        	(elems[i].innerHTML.includes('ytmusic')) ||
		        	(elems[i].tagName == "NAV") ||
		        	(elems[i].tagName == "HEADER")) {
		        	// do nothink
		        } else {
		        	if (window.getComputedStyle(elems[i],null).getPropertyValue('display') != 'none') {
			        	// setting uniq data-atr to elems with display block as initial state to restore it later
			        	elems[i].setAttribute('data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime', 'UFoundMeHelloThere')
			        }
		        	// elems[i].style.display = "none"
		        	elems[i].style.setProperty("display", "none", "important")
		        }
		    }
		}
	}
}

function removeOverflow() {
    if (window.getComputedStyle(document.documentElement, null).getPropertyValue('overflow-y') == 'hidden') {
		document.documentElement.style.setProperty("overflow-y", "auto", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('overflow-y') == 'hidden') {
		document.body.style.setProperty("overflow-y", "auto", "important")
	}

    if (window.getComputedStyle(document.documentElement, null).getPropertyValue('position') == 'fixed') {
		document.documentElement.style.setProperty("position", "relative", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('position') == 'fixed') {
		document.body.style.setProperty("position", "relative", "important")
	}
}