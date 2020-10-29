// restore elems when turn off extension by uniq data-atr
var restoreFixedElems = () => {
	const elems = document.querySelectorAll('[data-PopUpOFFBl]')
	elems.forEach(elem => elem.style.display = null)

	try {
		if (domObserver) domObserver.disconnect()
		if (domObserverLight) domObserverLight.disconnect()
	} catch (e) {
		// console.log(e)
	}
}

restoreFixedElems()
