var getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
var setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")

var removeFixedElems = () => {
	// find all fixed elements on page
	const $elems = document.body.getElementsByTagName("*")
	const LEN = $elems.length

	for (let i = 0; i < LEN; i++) {

	    if ((getStyle($elems[i], 'position') == 'fixed') || 
	    	(getStyle($elems[i], 'position') == 'sticky')) {
	    	if ($elems[i].getAttribute('data-PopUpOFF') === 'notification') 
	        	continue
	        
	    	if (getStyle($elems[i], 'display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        }
	    	positionCheck($elems[i])
	    	contentCheck($elems[i])
	    	semanticCheck($elems[i])
	    }
	    if ((getStyle($elems[i], 'filter') != 'none') ||
	    	(getStyle($elems[i], '-webkit-filter') != 'none')) {
	    	setPropImp($elems[i], "filter", "none")
	    	setPropImp($elems[i], "-webkit-filter", "none")
	    }
	}
}

var contentCheck = (element) => {
	const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
		setPropImp(element, "display", "none")
    }
}

var semanticCheck = (element) => {

    const ARR_OF_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item)) ||
		(element.tagName == "NAV") ||
		(element.tagName == "HEADER")) {
    	element.style.display = null
    }
}

var positionCheck = (element) => {
	// needs to get minus value for top value if it is
	const ELEMENT_TOP = getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(getStyle(element, 'top').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						100
	const ELEMENT_HEIGHT = getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g) ?
						Number(getStyle(element, 'height').match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
						300

	if (ELEMENT_TOP > 10) {
		setPropImp(element, "display", "none")
	} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {
		setPropImp(element, "display", "none")
	}
}

var removeOverflow = () => {
	const doc = document.documentElement
	const body = document.body

    if (getStyle(doc, 'overflow-y') == 'hidden') {
		setPropImp(doc, "overflow-y", "unset")
	}

	if (getStyle(body, 'overflow-y') == 'hidden') {
		setPropImp(body, "overflow-y", "unset")
	}

    if ((getStyle(doc, 'position') == 'fixed') ||
    	(getStyle(doc, 'position') == 'absolute')) {
		setPropImp(doc, "position", "relative")
	}

	if ((getStyle(body, 'position') == 'fixed') ||
    	(getStyle(body, 'position') == 'absolute')) {
		setPropImp(body, "position", "relative")
	}
}

removeOverflow()
removeFixedElems()