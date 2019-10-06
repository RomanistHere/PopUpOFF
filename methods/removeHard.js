function removeFixedElems() {
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")

	const doc = document.documentElement
	const body = document.body

	if (getStyle(doc, 'overflow-y')) {
		setPropImp(doc, "overflow-y", "unset")
	}

	if (getStyle(body, 'overflow-y')) {
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

	// find all fixed elements on page
	const $elems = body.getElementsByTagName("*")

	for (let i = 0; i < $elems.length; i++) {
		
	    if ((getStyle($elems[i], 'position') == 'fixed') || 
	    	(getStyle($elems[i], 'position') == 'sticky')) {
	        if (getStyle($elems[i], 'display') != 'none') {
	        	// setting uniq data-atr to elems with display block as initial state to restore it later
	        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        }
	        setPropImp($elems[i], "display", "none")
	        setTimeout(() => $elems[i] ? setPropImp($elems[i], "display", "none") : false, 10)
	    }

	    if ((getStyle($elems[i], 'filter') != 'none') ||
	    	(getStyle($elems[i], '-webkit-filter') != 'none')) {
	    	setPropImp($elems[i], "filter", "none")
	    	setPropImp($elems[i], "-webkit-filter", "none")
	    }

	}
}

removeFixedElems()