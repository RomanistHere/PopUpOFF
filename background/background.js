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
		storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'curAutoMode'], response => {
			if (response.curAutoMode !== undefined)
				return

			storageSet({
				hardModeActive: [...response.thisWebsiteWork],
				easyModeActive: [...response.thisWebsiteWorkEasy],
				whitelist: [...whitelistArr],
				restoreContActive: [...preventContArr],
				curAutoMode: 'easyModeActive',
				shortCutMode: 'hardModeActive',
			})
		})
    }
})

// handle tab switch(focus)
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.query({ 'active': true }, (info) => {
    	const url = info[0].url
	    if (url.includes('chrome://')) {
			chrome.browserAction.disable(activeInfo.tabId)
		}
    })
})

const setNewBadge = (url, tabID) =>
	storageGet(['hardModeActive', 'easyModeActive', 'curAutoMode', 'whitelist'], resp => {
		const { hardModeActive, easyModeActive, curAutoMode, whitelist } = resp
		let letter = null

		if (hardModeActive.includes(url)) {
			letter = 'A'
		} else if (easyModeActive.includes(url)) {
			letter = 'M'
		} else if (whitelist.includes(url) || curAutoMode === 'whitelist') {
			return
		} else if (curAutoMode === 'hardModeActive') {
			letter = 'A'
		} else if (curAutoMode === 'easyModeActive') {
			letter = 'M'
		}

		setBadgeText(letter)(tabID)
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

// add context menu with options
// chrome.contextMenus.removeAll()
// chrome.contextMenus.create({
// 	title: `Toggle PopUpOFF`,
// 	onclick: (obj, tabs) => {
// 		const pureUrl = getPureURL(tabs)
// 		const tabId = tabs.id
// 		const fakeShouldResp = () => null
// 		checkAndRunMode(tabId, pureUrl, fakeShouldResp)
// 	}
// })
