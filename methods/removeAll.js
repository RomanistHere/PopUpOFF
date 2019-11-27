var removeFixedElems = () => {
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")

	const doc = document.documentElement
	const body = document.body

	setPropImp(doc, "overflow-y", "unset")
	setPropImp(body, "overflow-y", "unset")

	setPropImp(doc, "position", "relative")
	setPropImp(body, "position", "relative")

	// find all fixed elements on page
	const $elems = body.getElementsByTagName("*")
	const LEN = $elems.length

	for (let i = 0; i < LEN; i++) {

	    if ((getStyle($elems[i], 'position') == 'fixed') || 
	    	(getStyle($elems[i], 'position') == 'sticky')) {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        setPropImp($elems[i], "display", "none")
	    }
	    if ((getStyle($elems[i], 'filter') != 'none') ||
	    	(getStyle($elems[i], '-webkit-filter') != 'none')) {
	    	setPropImp($elems[i], "filter", "none")
	    	setPropImp($elems[i], "-webkit-filter", "none")
	    }
	    if (getStyle($elems[i], 'position') == 'absolute') {
	    	setPropImp($elems[i], "display", "none")
	    }
	}
}

removeFixedElems()