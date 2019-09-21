function removeFixedElems() {
	document.documentElement.style.setProperty("overflow-y", "unset", "important")
	document.body.style.setProperty("overflow-y", "unset", "important")

	document.documentElement.style.setProperty("position", "relative", "important")
	document.body.style.setProperty("position", "relative", "important")

	// find all fixed elements on page
	const $elems = document.body.getElementsByTagName("*")
	const LEN = $elems.length

	for (let i = 0; i < LEN; i++) {

	    if ((window.getComputedStyle($elems[i],null).getPropertyValue('position') == 'fixed') || 
	    	(window.getComputedStyle($elems[i],null).getPropertyValue('position') == 'sticky')) {
        	// setting uniq data-atr to elems with display block as initial state to restore it later
        	$elems[i].setAttribute('data-popupoffExtension', 'hello')
	        $elems[i].style.setProperty("display", "none", "important")
	    }
	    if ((window.getComputedStyle($elems[i],null).getPropertyValue('filter') != 'none') ||
	    	(window.getComputedStyle($elems[i],null).getPropertyValue('-webkit-filter') != 'none')) {
	    	$elems[i].style.setProperty("filter", "none", "important")
	    	$elems[i].style.setProperty("-webkit-filter", "none", "important")
	    }
	    if (window.getComputedStyle($elems[i],null).getPropertyValue('position') == 'absolute') {
	    	$elems[i].style.setProperty("display", "none", "important")
	    }
	}
}

removeFixedElems()