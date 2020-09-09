// local variable for state of current page (do not work after reload)
var	thisPageOn = false

browser.runtime.onMessage.addListener((msg, sender, response) => {
	if (msg.method === "getStatusThisPage") {
		response(thisPageOn)
	}
	if (msg.method === "setStatusThisPage") {
		thisPageOn = msg.thisPageOn
	}
	return true
})

document.addEventListener('openOptPage', (e) => {
	browser.runtime.sendMessage({ openOptPage: true })
})

const sendStats = () =>
	browser.storage.sync.get(['stats'], resp => {
		const clonedDetail = cloneInto(resp.stats, document.defaultView)
		document.dispatchEvent(new CustomEvent('PopUpOFFStats', { detail: clonedDetail }))
	})

if (window.location.href === 'https://romanisthere.github.io/secrets/') {
	document.addEventListener('showPopUpOFFStats', ({ detail }) => {
		if (detail === 'letTheShowBegin') {
			sendStats()
			setInterval(sendStats, 2000)
		}
	})
}

let notifTimeout

const createNotification = () => {
	const notification = document.createElement("span")
	notification.setAttribute('data-PopUpOFF', 'notification')
	const text = document.createTextNode("PopUpOFF activated")
	notification.className = 'PopUpOFF_notification'
	notification.appendChild(text)
	document.body.appendChild(notification)

	clearTimeout(notifTimeout)
	notifTimeout = setTimeout(() => {
		if (document.querySelector('.PopUpOFF_notification'))
			document.querySelector('[data-PopUpOFF="notification"]').remove()
	}, 5000)
}

const removeNotification = () => {
	const prevNotification = document.querySelector('.PopUpOFF_notification')
	if (prevNotification) {
		clearTimeout(notifTimeout)
		prevNotification.remove()
	}
}

const keyDownCallBack = (e) => {
	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

	if ((e.altKey && e.which == 88) || (isMac && e.metaKey && e.shiftKey && e.which == 88)) {
		e.preventDefault()
		browser.runtime.sendMessage({ hardMode: true }, (response) => {
			if (response.shouldShow)
				createNotification()
			else
				removeNotification()
		})
	}
}

const debounce = (func, wait, immediate) => {
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
