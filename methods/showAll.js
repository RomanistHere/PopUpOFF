var docHeight = document.documentElement.scrollHeight
var winHeight = window.innerHeight

var shouldShow = (docHeight, winHeight) => docHeight < (winHeight + 300)

var showAll = () => {
	const ELEMS = document.querySelectorAll('[data-popupoffExtension]')
	const LEN = ELEMS.length

	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
	const loopOver = () => {
		for (let i=0; i<LEN; i++) {
	        ELEMS[i].style.display = null
	        setPropImp(ELEMS[i], "position", "relative")
	        setPropImp(ELEMS[i], "left", "0")
	        setPropImp(ELEMS[i], "top", "0")
	        setPropImp(ELEMS[i], "right", "0")
	        setPropImp(ELEMS[i], "bottom", "0")
		}
	}

	if (dom_observer) {
		dom_observer.disconnect()
	}

	if (dom_observer_new) {
		dom_observer_new.disconnect()
	}

	setTimeout(() => loopOver(), 4)
	setTimeout(() => { if (shouldShow(document.documentElement.scrollHeight, window.innerHeight)) loopOver() }, 100)
}
// waiting for mor adequate condition:)
if (shouldShow(docHeight, winHeight)) showAll()