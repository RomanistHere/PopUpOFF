let appState = {
	curMode: null
}
// initialize mode
chrome.storage.sync.get(['statsEnabled', 'hardModeActive', 'easyModeActive', 'whitelist', 'restoreContActive', 'curAutoMode'], resp => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return

	const { statsEnabled, restoreContActive, hardModeActive, whitelist, easyModeActive, curAutoMode } = resp
	const pureUrl = getPureURL(window.location.href)
	const shouldRestoreCont = restoreContActive.includes(pureUrl)

	// console.log(resp)
	// console.log(pureUrl)
	// console.log('hard: ', hardModeActive.includes(pureUrl))
	// console.log('whitelist: ', whitelist.includes(pureUrl))

	// check arrays with sites first of all
	if (whitelist.includes(pureUrl)) {
		appState = { ...appState, curMode: 'whitelist' }
		return
	}

	if (hardModeActive.includes(pureUrl)) {
		hardMode(statsEnabled, shouldRestoreCont)
		appState = { ...appState, curMode: 'hardModeActive' }
		return
	}

	if (easyModeActive.includes(pureUrl)) {
		autoMode(statsEnabled, shouldRestoreCont)
		appState = { ...appState, curMode: 'easyModeActive' }
		return
	}

	// if nothing check and automode
	if (curAutoMode === 'easyModeActive') {
		autoMode(statsEnabled, shouldRestoreCont)
		appState = { ...appState, curMode: 'easyModeActive' }
		return
	}

	if (curAutoMode === 'whitelist') {
		appState = { ...appState, curMode: 'whitelist' }
		return
	}

	if (curAutoMode === 'hardModeActive') {
		hardMode(statsEnabled, shouldRestoreCont)
		appState = { ...appState, curMode: 'hardModeActive' }
		return
	}

	autoMode(statsEnabled, restoreCont)
	appState = { ...appState, curMode: 'easyModeActive' }
})

// "change mode" listener from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	// check if script is inside the iframe
	if (window !== window.parent)
		return

	const { activeMode } = request
	// check stats and restore content
	chrome.storage.sync.get(['statsEnabled', 'restoreContActive'], resp => {
		const { statsEnabled, restoreContActive } = resp
		const pureUrl = getPureURL(window.location.href)
		const shouldRestoreCont = restoreContActive.includes(pureUrl)

	    if (activeMode === 'hardModeActive') {
			hardMode(statsEnabled, shouldRestoreCont)
			appState = { ...appState, curMode: 'hardModeActive' }
			return
		}

	    if (activeMode === 'easyModeActive') {
			autoMode(statsEnabled, shouldRestoreCont)
			appState = { ...appState, curMode: 'easyModeActive' }
			return
		}

	    if (activeMode === 'whitelist') {
			// reset
			appState = { ...appState, curMode: 'whitelist' }
			sendResponse({ closePopup: true })
			window.location.reload()
			return
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

		chrome.storage.sync.get(['hardModeActive', 'easyModeActive', 'whitelist', 'shortCutMode', 'statsEnabled', 'restoreContActive'], resp => {
			const { hardModeActive, easyModeActive, whitelist, shortCutMode, statsEnabled, restoreContActive } = resp

			if (appState.curMode === shortCutMode || shortCutMode === null)
				return

			const pureUrl = getPureURL(window.location.href)
			const shouldRestoreCont = restoreContActive.includes(pureUrl)
			let newSync = {
				hardModeActive: [],
				easyModeActive: [],
				whitelist: []
			}

			// remove previous one
			if (whitelist.includes(pureUrl) && appState.curMode !== 'whitelist') {
				newSync = { ...newSync, whitelist: whitelist.filter(url => url !== pureUrl) }
			}

			if (hardModeActive.includes(pureUrl) && appState.curMode !== 'hardModeActive') {
				newSync = { ...newSync, hardModeActive: hardModeActive.filter(url => url !== pureUrl) }
			}

			if (easyModeActive.includes(pureUrl) && appState.curMode !== 'easyModeActive') {
				newSync = { ...newSync, easyModeActive: easyModeActive.filter(url => url !== pureUrl) }
			}

			// activate new mode
			if (shortCutMode === 'whitelist') {
				newSync = { ...newSync, whitelist: [...whitelist, pureUrl] }
				appState = { ...appState, curMode: 'whitelist' }
			}

			if (shortCutMode === 'easyModeActive') {
				autoMode(statsEnabled, shouldRestoreCont)
				newSync = { ...newSync, easyModeActive: [...easyModeActive, pureUrl] }
				appState = { ...appState, curMode: 'easyModeActive' }
			}

			if (shortCutMode === 'hardModeActive') {
				hardMode(statsEnabled, shouldRestoreCont)
				newSync = { ...newSync, hardModeActive: [...hardModeActive, pureUrl] }
				appState = { ...appState, curMode: 'hardModeActive' }
			}

			chrome.storage.sync.set(newSync)
			createNotification(appState.curMode)
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

// const removeNotification = () => {
// 	const prevNotification = document.querySelector('.PopUpOFF_notification')
// 	if (prevNotification) {
// 		clearTimeout(notifTimeout)
// 		prevNotification.remove()
// 	}
// }
