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

document.addEventListener('openOptPage', (e) => {
	chrome.runtime.sendMessage({ openOptPage: true })
})

var createNotification = () => {
	const notification = document.createElement("span")
	notification.setAttribute('data-PopUpOFF', 'notification')
	const text = document.createTextNode("PopUpOFF activated")
	notification.className = 'PopUpOFF_notification'
	notification.appendChild(text)
	document.body.appendChild(notification)

	setTimeout(() => {
		document.querySelector('[data-PopUpOFF="notification"]').remove()
	}, 5000)
}

var keyDownCallBack = (e) => {
	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

	if ((e.altKey && e.which == 88) || (isMac && e.metaKey && e.shiftKey && e.which == 88)) {
		e.preventDefault()
		chrome.runtime.sendMessage({ hardMode: true }, (response) => {
			if (response.shouldShow)
				createNotification()
		})
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