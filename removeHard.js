'use strict';

function removeFixedElems() {
	if (window.getComputedStyle(document.documentElement, null).getPropertyValue('overflow-y')) {
		document.documentElement.style.setProperty("overflow-y", "unset", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('overflow-y')) {
		document.body.style.setProperty("overflow-y", "unset", "important")
	}

    if (window.getComputedStyle(document.documentElement, null).getPropertyValue('position') == 'fixed') {
		document.documentElement.style.setProperty("position", "relative", "important")
	}

	if (window.getComputedStyle(document.body, null).getPropertyValue('position') == 'fixed') {
		document.body.style.setProperty("position", "relative", "important")
	}

	// find all fixed elements on page
	let elems = document.body.getElementsByTagName("*")
	let len = elems.length

	for (let i=0; i<len; i++) {

	    if ((window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'sticky')) {
	        if (window.getComputedStyle(elems[i],null).getPropertyValue('display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	elems[i].setAttribute('data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime', 'UFoundMeHelloThere')
	        }
	        // elems[i].style.display = "none"
	        elems[i].style.setProperty("display", "none", "important")
	    }

	}
}

removeFixedElems()
