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

	    	console.log(elems[i])
	    	console.log(window.getComputedStyle(elems[i],null).getPropertyValue('top'))
	    	console.log(window.getComputedStyle(elems[i],null).getPropertyValue('height'))

	    	checkAndRemove(elems[i])
	    }
	}
}

function checkAndRemove(element) {
	// needs to get minus value for top value if it is
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