// local variable for state of current page (do not work after reload)
var	thisPageOn = false

chrome.runtime.onMessage.addListener((msg, sender, response) => {
	if (msg.method === "getStatusThisPage") {
		response(thisPageOn)
	}
	if (msg.method === "setStatusThisPage") {
		thisPageOn = msg.thisPageOn
	}
	return true
})

var keyDownCallBack = (e) => {
	if (e.altKey && e.which == 88) {
		e.preventDefault()
		chrome.runtime.sendMessage({ hardMode: true })
	}
}

var debounce = (func, wait, immediate) => {
	var timeout
	return function() {
		var context = this, args = arguments
		var later = function() {
			timeout = null
			if (!immediate) func.apply(context, args)
		}
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

document.onkeydown = debounce(keyDownCallBack, 100)