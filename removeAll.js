'use strict';

function removeFixedElems() {
	document.documentElement.style.setProperty("overflow-y", "auto", "important")
	document.body.style.setProperty("overflow-y", "auto", "important")

	document.documentElement.style.setProperty("position", "relative", "important")
	document.body.style.setProperty("position", "relative", "important")

	// find all fixed elements on page
	let elems = document.body.getElementsByTagName("*")
	let len = elems.length

	for (let i = 0; i < len; i++) {

	    if ((window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'sticky')) {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	elems[i].setAttribute('data-fixedElementWhoWasRemoveButCouldBeRestoredOneTime', 'UFoundMeHelloThere')
	        elems[i].style.setProperty("display", "none", "important")
	    }
	    if (window.getComputedStyle(elems[i],null).getPropertyValue('position') == 'absolute') {
	    	elems[i].style.setProperty("display", "none", "important")
	    }
	}
}

removeFixedElems()