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
const initMode = async () => {
	let { statsEnabled, restoreContActive, curAutoMode, autoModeAggr } = await getStorageData(['statsEnabled', 'restoreContActive', 'curAutoMode', 'autoModeAggr'])
	const websites = await getWebsites()
	// check if script is inside the iframe
	if (window !== window.parent)
		return

	if (restoreContActive == null) {
		await setStorageData({ restoreContActive: [] })
		restoreContActive = []
	}

	if (autoModeAggr == null) {
		await setStorageData({ autoModeAggr: 'typeI' })
		autoModeAggr = 'typeI'
	}

	if (statsEnabled == null) {
		await setStorageData({ statsEnabled: false })
		statsEnabled = false
	}

	const fullWebsites = { ...defWebsites, ...websites }
	const pureUrl = getPureURL(window.location.href)
	const shouldRestoreCont = restoreContActive.includes(pureUrl)
	const curModeName = pureUrl in fullWebsites ? fullWebsites[pureUrl] : curAutoMode

	startMode(curModeName, statsEnabled, shouldRestoreCont, autoModeAggr)
}

initMode()

const changeMode = async (request, sender, sendResponse) => {
	const curModeName = request.activeMode
	// check stats and restore content
	const { statsEnabled, restoreContActive, autoModeAggr } = await getStorageData(['statsEnabled', 'restoreContActive', 'autoModeAggr'])
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
}

// "change mode" listener from popup.js and bg.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return true

	changeMode(request, sender, sendResponse)

	return true
})

// shortcut (keycomb: "Alt + x") from browser listener
const keyDownCallBack = async (e) => {
	const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

	if ((e.altKey && e.which == 88) || (isMac && e.metaKey && e.shiftKey && e.which == 88)) {
		// needed shortcut pressed
		e.preventDefault()

		const { statsEnabled, restoreContActive, shortCutMode, autoModeAggr } = await getStorageData(['statsEnabled', 'restoreContActive', 'shortCutMode', 'autoModeAggr'])
		const websites = await getWebsites()
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
		try {
			await setWebsites(newWebsites)
			modeChangedToBg()
			createNotification(appState.curMode)
		} catch (e) {
			console.log(e)
		}

		// if (curModeName === 'whitelist')
		// 	window.location.reload()
	}
}
document.onkeydown = debounce(keyDownCallBack, 100)

// open option page programmatically from websites
document.addEventListener('openOptPage', (e) => {
	browser.runtime.sendMessage({ openOptPage: true })
})

// send stats to website
const sendStats = async () => {
	const { stats } = await getStorageData('stats')
	const clonedDetail = cloneInto(stats, document.defaultView)
	document.dispatchEvent(new CustomEvent('PopUpOFFStats', { detail: clonedDetail }))
}

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
