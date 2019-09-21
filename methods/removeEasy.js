removeOverflow()
removeFixedElems()

function removeFixedElems() {
	// find all fixed elements on page
	const $elems = document.body.getElementsByTagName("*")
	const LEN = $elems.length

	for (let i = 0; i < LEN; i++) {

	    if ((window.getComputedStyle($elems[i],null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle($elems[i],null).getPropertyValue('position') == 'sticky')) {
	    	if (window.getComputedStyle($elems[i], null).getPropertyValue('display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        }
	    	positionCheck($elems[i])
	    	contentCheck($elems[i])
	    	semanticCheck($elems[i])
	    }
	    if ((window.getComputedStyle($elems[i],null).getPropertyValue('filter') != 'none') ||
	    	(window.getComputedStyle($elems[i],null).getPropertyValue('-webkit-filter') != 'none')) {
	    	$elems[i].style.setProperty("filter", "none", "important")
	    	$elems[i].style.setProperty("-webkit-filter", "none", "important")
	    }
	}
}

function contentCheck(element) {
	const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
		element.style.setProperty("display", "none", "important")
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

function positionCheck(element) {
	// needs to get minus value for top value if it is
	const ELEMENT_TOP = window.getComputedStyle(element,null).getPropertyValue('top').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(window.getComputedStyle(element,null).getPropertyValue('top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						100
	const ELEMENT_HEIGHT = window.getComputedStyle(element,null).getPropertyValue('height').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(window.getComputedStyle(element,null).getPropertyValue('height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						300

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