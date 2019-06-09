'use strict';

function removeFixedElems() {
	document.documentElement.style.setProperty("overflow-y", "unset", "important")
	document.body.style.setProperty("overflow-y", "unset", "important")

	document.documentElement.style.setProperty("position", "relative", "important")
	document.body.style.setProperty("position", "relative", "important")

	// find all fixed elements on page
	const ELEMS = document.body.getElementsByTagName("*")
	const LEN = ELEMS.length

	for (let i = 0; i < LEN; i++) {

	    if ((window.getComputedStyle(ELEMS[i],null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle(ELEMS[i],null).getPropertyValue('position') == 'sticky')) {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	ELEMS[i].setAttribute('data-popupoffExtension', 'hello')
	        ELEMS[i].style.setProperty("display", "none", "important")
	    }
	    if (window.getComputedStyle(ELEMS[i],null).getPropertyValue('position') == 'absolute') {
	    	ELEMS[i].style.setProperty("display", "none", "important")
	    }
	}
}

removeFixedElems()