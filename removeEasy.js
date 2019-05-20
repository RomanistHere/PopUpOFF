'use strict';

removeOverflow()
removeFixedElems()

function removeFixedElems() {
	// find all fixed elements on page
	let elems = document.body.getElementsByTagName("*")
	let len = elems.length

	for (let i = 0; i < len; i++) {

	    if ((window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'sticky')) {

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

function removeOverflow() {
    if (window.getComputedStyle(document.documentElement, null).getPropertyValue('overflow-y') == 'hidden') {
		document.documentElement.style.setProperty("overflow-y", "unset", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('overflow-y') == 'hidden') {
		document.body.style.setProperty("overflow-y", "unset", "important")
	}

    if (window.getComputedStyle(document.documentElement, null).getPropertyValue('position') == 'fixed') {
		document.documentElement.style.setProperty("position", "relative", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('position') == 'fixed') {
		document.body.style.setProperty("position", "relative", "important")
	}
}