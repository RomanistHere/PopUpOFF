import { whitelistArr, preventContArr } from '../constants/data.js'
import {
	storageSet,
	storageGet,
	getPureURL,
	activateMode,
	activateHard,
	activateEasy,
	executeScript,
	setBadgeText,
	resetBadgeText,
	backupData
} from '../constants/functions.js'

// handle install
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == 'install') {
		// check is extension already in use at other device
		storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (response) => {
			if (!response.thisWebsiteWork || !response.thisWebsiteWorkEasy) {
				// set up start
				storageSet({
					// thisWebsiteWork: [],
					// thisWebsiteWorkEasy: [],
					// supervision: true,
					// restoreCont: false,
					tutorial: false,
					stats: {
						cleanedArea: 0,
						numbOfItems: 0,
						restored: 0
					},
					statsEnabled: true,
					backupData: {},
					hardModeActive: [],
					easyModeActive: [],
					whitelist: [...whitelistArr],
					restoreContActive: [...preventContArr],
					curAutoMode: 'easyModeActive',
					shortCutMode: 'hardModeActive',
				})

				// chrome.tabs.create({ url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html' })
			}
		})
    } else if (details.reason == 'update') {
    	// chrome.tabs.create({ url: 'https://romanisthere.github.io/apps/popupoff/updates/#2.0.0' })
		// backupData()

		// storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'curAutoMode'], response => {
		// 	if (response.curAutoMode !== undefined)
		// 		return
		//
		// 	storageSet({
		// 		hardModeActive: [...response.thisWebsiteWork],
		// 		easyModeActive: [...response.thisWebsiteWorkEasy],
		// 		whitelist: [...whitelistArr],
		// 		restoreContActive: [...preventContArr],
		// 		curAutoMode: 'easyModeActive',
		// 		shortCutMode: 'hardModeActive',
		// 	})
		// })
    }
})

// handle tab switch(focus)
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.query({ 'active': true }, (info) => {
    	const url = info[0].url
	    if (url.includes('chrome://')) {
			chrome.browserAction.disable(activeInfo.tabId)
		} else {
			const pureUrl = getPureURL(info[0])
			setNewBadge(pureUrl, activeInfo.tabId)
		}
    })
})

const setNewBadge = (url, tabID) =>
	storageGet(['hardModeActive', 'easyModeActive', 'curAutoMode', 'whitelist'], resp => {
		const { hardModeActive, easyModeActive, curAutoMode, whitelist } = resp
		let letter = ''

		if (hardModeActive.includes(url)) {
			letter = 'A'
		} else if (easyModeActive.includes(url)) {
			letter = 'M'
		} else if (whitelist.includes(url) || curAutoMode === 'whitelist') {
			letter = ''
		} else if (curAutoMode === 'hardModeActive') {
			letter = 'A'
		} else if (curAutoMode === 'easyModeActive') {
			letter = 'M'
		}

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
		return

	const { tab } = sender
	if (request.modeChanged) {
		// A - Agressive
		// M - Moderate
		const tabID = tab.id
		const pureUrl = getPureURL(sender)

		setNewBadge(pureUrl, tabID)
	}

	return true
})

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

const subMenu = [
	{
		title: `Agressive`,
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

const setNewMode = (newMode, url, tabID) => {
	storageGet(['hardModeActive', 'easyModeActive', 'whitelist'], resp => {
		console.log(resp)
		const { hardModeActive, easyModeActive, whitelist } = resp
		let letter = ''
		let newSet = {
			hardModeActive: [...hardModeActive],
			easyModeActive: [...easyModeActive],
			whitelist: [...whitelist]
		}

		if (hardModeActive.includes(url)) {
			if (newMode === 'hardModeActive') {
				return
			} else {
				newSet = { ...newSet, hardModeActive: hardModeActive.filter(item => item !== url) }
			}
		} else if (easyModeActive.includes(url)) {
			if (newMode === 'easyModeActive') {
				return
			} else {
				newSet = { ...newSet, easyModeActive: easyModeActive.filter(item => item !== url) }
			}
		} else if (whitelist.includes(url)) {
			if (newMode === 'whitelist') {
				return
			} else {
				newSet = { ...newSet, whitelist: whitelist.filter(item => item !== url) }
			}
		}

		if (newMode === 'hardModeActive') {
			newSet = { ...newSet, hardModeActive: [...hardModeActive, url] }
			letter = 'A'
		} else if (newMode === 'easyModeActive') {
			newSet = { ...newSet, easyModeActive: [...easyModeActive, url] }
			letter = 'M'
		} else if (newMode === 'whitelist') {
			newSet = { ...newSet, whitelist: [...whitelist, url] }
		}

		console.log(newSet)

		storageSet(newSet)
		setBadgeText(letter)(tabID)
	})
}

// add context menu with options
chrome.contextMenus.removeAll()
subMenu.map((item, index) => {
 	subMenuStore[Object.keys(subMenuStore)[index]] = chrome.contextMenus.create({
		title: item.title,
		type: 'checkbox',
		checked: item.mode === 'whitelist' ? true : false,
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

// chrome.contextMenus.create({ type: 'separator' })
