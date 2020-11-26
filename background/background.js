import {
	websites,
	preventContArr
} from '../constants/data.js'

import {
	storageSet,
	storageGet,
	getPureURL,
	setBadgeText,
	backupData,
	arrayToObj
} from '../constants/functions.js'

// handle install
chrome.runtime.onInstalled.addListener(details => {
    if (details.reason == 'install') {
		// check is extension already in use at other device
		storageGet(['websites', 'curAutoMode'], response => {
			if (response.websites == null || response.curAutoMode == null) {
				// set up start
				storageSet({
					tutorial: true,
					update: false,
					stats: {
						cleanedArea: 0,
						numbOfItems: 0,
						restored: 0
					},
					statsEnabled: true,
					backupData: {},
					restoreContActive: [...preventContArr],
					curAutoMode: 'easyModeActive',
					shortCutMode: null,
					// shortCutMode: 'hardModeActive',
					websites: websites,
					autoModeAggr: 'typeI',
					preset: 'presetCasual',
				})

				chrome.tabs.create({ url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html#2.0' })
			}
		})
    } else if (details.reason == 'update') {
    	// chrome.tabs.create({ url: 'https://romanisthere.github.io/apps/popupoff/updates/#2.0.0' })
		// backupData()

		storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'shortCutMode', 'restoreContActive', 'websites', 'curAutoMode', 'statsEnabled', 'autoModeAggr'], response => {
			if (response.websites == null || response.restoreContActive == null || response.curAutoMode == null) {
				if (response.thisWebsiteWork == null || response.thisWebsiteWorkEasy == null) {
					response.thisWebsiteWork = []
					response.thisWebsiteWorkEasy = []
				}
				// shortcut converting
				// shortcut: false, "thisWebsiteWorkEasy", "thisWebsiteWork" -> null, 'easyModeActive', 'hardModeActive'
				const { shortCutMode, thisWebsiteWork, thisWebsiteWorkEasy } = response
				const newShortCut = (shortCutMode == 'thisWebsiteWorkEasy') ? 'easyModeActive' :
									(shortCutMode == 'thisWebsiteWork') ? 'hardModeActive' : null

				// websites converting
				const newWebsites = {
					...websites,
					...arrayToObj(thisWebsiteWorkEasy, 'easyModeActive'),
					...arrayToObj(thisWebsiteWork, 'hardModeActive')
				}

				const restCont = [...preventContArr]

				storageSet({
					websites: newWebsites,
					restoreContActive: restCont,
					curAutoMode: 'whitelist',
					autoModeAggr: 'typeIII',
					shortCutMode: newShortCut,
					tutorial: true,
					update: true,
				 	preset: 'presetManual',
				})
			}

			if (response.autoModeAggr == null) {
				storageSet({ autoModeAggr: 'typeI' })
			}

			if (response.statsEnabled == null) {
				storageSet({ statsEnabled: false })
			}

			if (typeof response.shortCutMode == 'undefined') {
				storageSet({ shortCutMode: null })
			}
		})
    }
})

// handle tab switch(focus)
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.query({ 'active': true }, info => {
    	const url = info[0].url
	    if (url.includes('chrome://')) {
			chrome.browserAction.disable(activeInfo.tabId)
		} else {
			const pureUrl = getPureURL(info[0])
			setNewBadge(pureUrl, activeInfo.tabId)
		}
    })
})

const letters = {
	'hardModeActive': 'A',
	'easyModeActive': 'M',
	'whitelist': ''
}

const setNewBadge = (pureUrl, tabID) =>
	storageGet(['curAutoMode', 'websites'], resp => {
		if (resp.curAutoMode == null) {
			storageSet({ curAutoMode: 'easyModeActive' })
			return
		}

		if (resp.websites == null) {
			storageSet({ websites: {} })
			return
		}

		const { websites, curAutoMode } = resp
		let curModeName = curAutoMode

		if (pureUrl in websites)
			curModeName = websites[pureUrl]

		const letter = letters[curModeName]

		setBadgeText(letter)(tabID)

		Object.keys(subMenuStore).forEach(key => {
			const menu = subMenuStore[key]

			chrome.contextMenus.update(menu, {
				type: 'checkbox',
				checked: (letter === 'A' && key === 'hardModeActive')
					|| (letter === 'M' && key === 'easyModeActive')
					|| (letter === '' && key === 'whitelist')
			})
		})
	})

// handle mode changed from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!sender.tab)
		return true

	if (request.modeChanged) {
		const tabID = sender.tab.id
		const pureUrl = getPureURL(sender)

		setNewBadge(pureUrl, tabID)
	}

	return true
})

// handle updating to set new badge and context menu
chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
	if (changeInfo.status === 'loading') {
		const url = tab.url

		if (url.includes('chrome://')) {
			chrome.browserAction.disable(tabID)
		} else {
			const pureUrl = getPureURL({ url })

			setNewBadge(pureUrl, tabID)
		}
	}
})

// content menu (right click) mechanics
const subMenu = [
	{
		title: `Aggressive`,
		mode: 'hardModeActive'
	},{
		title: `Moderate`,
		mode: 'easyModeActive'
	},{
		title: `Dormant`,
		mode: 'whitelist'
	}
]

const subMenuStore = {
	hardModeActive: null,
	easyModeActive: null,
	whitelist: null,
}

const setNewMode = (newMode, pureUrl, tabID) => {
	storageGet(['websites'], resp => {
		const { websites } = resp

		if (pureUrl in websites && websites[pureUrl] === newMode)
			return

		const newWebsites = { ...websites, [pureUrl]: newMode }
		const letter = letters[newMode]

		storageSet({ websites: newWebsites })
		setBadgeText(letter)(tabID)
	})
}

// add context menu with options
chrome.contextMenus.removeAll()
subMenu.map((item, index) => {
 	subMenuStore[Object.keys(subMenuStore)[index]] = chrome.contextMenus.create({
		title: item.title,
		type: 'checkbox',
		// checked whitelist by default
		checked: item.mode === 'whitelist' ? true : false,
		// works for web pages only
		documentUrlPatterns: ["http://*/*", "https://*/*", "http://*/", "https://*/"],
		onclick: (obj, tabs) => {
			const pureUrl = getPureURL(tabs)
			const tabID = tabs.id
			const tabURL = tabs.url

			chrome.tabs.sendMessage(tabID, { activeMode: item.mode }, resp => {
	            if (resp && resp.closePopup === true) {
					chrome.tabs.update(tabID, { url: tabURL })
	            }
	        })

			setNewMode(item.mode, pureUrl, tabID)
		}
	})
})
