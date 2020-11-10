let appState = {
	curMode: null
}

const modes = {
	whitelist: (arg1, arg2) => null,
	hardModeActive: (arg1, arg2) => hardMode(arg1, arg2),
	easyModeActive: (arg1, arg2) => autoMode(arg1, arg2),
	casualModeActive: (arg1, arg2) => casualMode(arg1, arg2),
}

const startMode = (curModeName, statsEnabled, shouldRestoreCont) => {
	// check if we switch from hard to easy one
	if ((curModeName === 'easyModeActive' || curModeName === 'casualModeActive') &&
		(appState.curMode === 'hardModeActive' || curModeName === 'easyModeActive'))
		restoreFixedElems()
	// start new mode and upd state
	const mode = modes[curModeName]
	appState = { ...appState, curMode: curModeName }
	mode(statsEnabled, shouldRestoreCont)
}

// initialize mode
chrome.storage.sync.get(['statsEnabled', 'websites', 'restoreContActive', 'curAutoMode'], resp => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return

	const { statsEnabled, restoreContActive, websites, curAutoMode } = resp
	const pureUrl = getPureURL(window.location.href)
	const shouldRestoreCont = restoreContActive.includes(pureUrl)

	let curModeName = curAutoMode

	if (pureUrl in websites)
		curModeName = websites[pureUrl]

	startMode(curModeName, statsEnabled, shouldRestoreCont)
})

// "change mode" listener from popup.js and bg.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return true

	const curModeName = request.activeMode
	// check stats and restore content
	chrome.storage.sync.get(['statsEnabled', 'restoreContActive'], resp => {
		const { statsEnabled, restoreContActive } = resp
		const pureUrl = getPureURL(window.location.href)
		const shouldRestoreCont = restoreContActive.includes(pureUrl)

		domObserver = disconnectObservers(domObserver)

		startMode(curModeName, statsEnabled, shouldRestoreCont)
		modeChangedToBg()

		if (curModeName === 'whitelist') {
			sendResponse({ closePopup: true })
			window.location.reload()
		}
	})

	return true
})

// shortcut (keycomb: "Alt + x") from browser listener
const keyDownCallBack = e => {
	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

	if ((e.altKey && e.which == 88) || (isMac && e.metaKey && e.shiftKey && e.which == 88)) {
		// needed shortcut pressed
		e.preventDefault()

		chrome.storage.sync.get(['shortCutMode', 'statsEnabled', 'restoreContActive', 'websites'], resp => {
			const { shortCutMode, statsEnabled, restoreContActive, websites } = resp

			if (appState.curMode === shortCutMode || shortCutMode === null)
				return

			const pureUrl = getPureURL(window.location.href)
			const shouldRestoreCont = restoreContActive.includes(pureUrl)

			const curModeName = shortCutMode
			domObserver = disconnectObservers(domObserver)

			if (pureUrl in websites && websites[pureUrl] === curModeName)
				return

			const newWebsites = { ...websites, [pureUrl]: curModeName }

			startMode(curModeName, statsEnabled, shouldRestoreCont)
			chrome.storage.sync.set({ websites: newWebsites })
			modeChangedToBg()
			createNotification(appState.curMode)

			if (curModeName === 'whitelist')
				window.location.reload()
		})
	}
}
document.onkeydown = debounce(keyDownCallBack, 100)

// open option page programmatically from websites
document.addEventListener('openOptPage', (e) => {
	chrome.runtime.sendMessage({ openOptPage: true })
})

// send stats to website
const sendStats = () =>
	chrome.storage.sync.get(['stats'], resp => {
		document.dispatchEvent(new CustomEvent('PopUpOFFStats', { detail: resp.stats }))
	})

if (window.location.href === 'https://romanisthere.github.io/secrets/') {
	document.addEventListener('showPopUpOFFStats', ({ detail }) => {
		if (detail === 'letTheShowBegin') {
			sendStats()
			setInterval(sendStats, 2000)
		}
	})
}

// notification mechanics
let notifTimeout
const textItems = {
	'whitelist': 'Dormant',
	'hardModeActive': 'Agressive',
	'easyModeActive': 'Moderate',
	'casualModeActive': 'Casual',
}

const createNotification = curMode => {
	const notification = document.createElement("span")
	notification.setAttribute('data-PopUpOFF', 'notification')
	const text = document.createTextNode(`✔ ${textItems[curMode]} mode activated`)
	notification.className = 'PopUpOFF_notification'
	notification.appendChild(text)
	document.body.appendChild(notification)

	clearTimeout(notifTimeout)
	notifTimeout = setTimeout(() => {
		if (document.querySelector('.PopUpOFF_notification'))
			document.querySelector('[data-PopUpOFF="notification"]').remove()
	}, 5000)
}
