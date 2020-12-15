let appState = {
	curMode: null
}

const modes = {
	whitelist: (arg1, arg2) => null,
	hardModeActive: (arg1, arg2) => hardMode(arg1, arg2),
	easyModeActive_typeI: (arg1, arg2) => easyMode(arg1, arg2, positionCheckTypeI),
	easyModeActive_typeII: (arg1, arg2) => easyMode(arg1, arg2, positionCheckTypeII),
	easyModeActive_typeIII: (arg1, arg2) => easyMode(arg1, arg2, positionCheckTypeIII),
}

const startMode = (curModeName, statsEnabled, shouldRestoreCont, autoModeAggr) => {
	// check if we switch from hard to easy one
	if (appState.curMode === 'hardModeActive' || appState.curMode === 'easyModeActive')
		restoreFixedElems()
	// start new mode and upd state
	const mode = modes[curModeName === 'easyModeActive' ? `${curModeName}_${autoModeAggr}` : curModeName]
	appState = { ...appState, curMode: curModeName }
	mode(statsEnabled, shouldRestoreCont)
}

// initialize mode
chrome.storage.sync.get(['statsEnabled', 'websites', 'restoreContActive', 'curAutoMode', 'autoModeAggr'], resp => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return

	if (resp.restoreContActive == null) {
		chrome.storage.sync.set({ restoreContActive: [] })
		return
	}

	if (resp.autoModeAggr == null) {
		chrome.storage.sync.set({ autoModeAggr: 'typeI' })
		return
	}

	if (resp.statsEnabled == null) {
		chrome.storage.sync.set({ statsEnabled: false })
		return
	}

	const { statsEnabled, restoreContActive, websites, curAutoMode, autoModeAggr } = resp
	const fullWebsites = { ...defWebsites, ...websites }
	const pureUrl = getPureURL(window.location.href)
	const shouldRestoreCont = restoreContActive.includes(pureUrl)
	const curModeName = pureUrl in fullWebsites ? fullWebsites[pureUrl] : curAutoMode

	startMode(curModeName, statsEnabled, shouldRestoreCont, autoModeAggr)
})

// "change mode" listener from popup.js and bg.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return true

	const curModeName = request.activeMode
	// check stats and restore content
	chrome.storage.sync.get(['statsEnabled', 'restoreContActive', 'autoModeAggr'], resp => {
		const { statsEnabled, restoreContActive, autoModeAggr } = resp
		const pureUrl = getPureURL(window.location.href)
		const shouldRestoreCont = restoreContActive.includes(pureUrl)

		domObserver = disconnectObservers(domObserver)

		startMode(curModeName, statsEnabled, shouldRestoreCont, autoModeAggr)
		modeChangedToBg()

		if (curModeName === 'whitelist') {
			if (shouldRestoreCont) {
				const newContActive = restoreContActive.filter(url => url !== pureUrl)
				chrome.storage.sync.set({ restoreContActive: newContActive })
			}

			sendResponse({ closePopup: true })
			// window.location.reload()
		} else {
			sendResponse({ closePopup: false })
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

		chrome.storage.sync.get(['shortCutMode', 'statsEnabled', 'restoreContActive', 'websites', 'autoModeAggr'], resp => {
			const { shortCutMode, statsEnabled, restoreContActive, websites, autoModeAggr } = resp
			const fullWebsites = { ...defWebsites, ...websites }

			if (appState.curMode === shortCutMode || shortCutMode === null)
				return

			const pureUrl = getPureURL(window.location.href)
			const shouldRestoreCont = restoreContActive.includes(pureUrl)

			const curModeName = shortCutMode
			domObserver = disconnectObservers(domObserver)

			if (pureUrl in fullWebsites && fullWebsites[pureUrl] === curModeName)
				return

			const newWebsites = { ...websites, [pureUrl]: curModeName }

			startMode(curModeName, statsEnabled, shouldRestoreCont, autoModeAggr)
			chrome.storage.sync.set({ websites: newWebsites })
			modeChangedToBg()
			createNotification(appState.curMode)

			// if (curModeName === 'whitelist')
			// 	window.location.reload()
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
	'hardModeActive': 'Aggressive',
	'easyModeActive': 'Moderate',
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
