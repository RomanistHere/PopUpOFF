import { ARR_OF_FORB_SITES } from '../constants/data.js'
import {
	storageSet,
	storageGet,
	getPureURL,
	activateMode,
	activateHard,
	activateEasy,
	executeScript,
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
					thisWebsiteWork: [],
					thisWebsiteWorkEasy: [],
					supervision: true,
					tutorial: false,
					shortCutMode: false,
					stats: {
						cleanedArea: 0,
						numbOfItems: 0,
						restored: 0
					},
					statsEnabled: true,
					restoreCont: false,
					backupData: {}
				})

				chrome.tabs.create({url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html'})
			}
		})
    } else if (details.reason == 'update') {
    	// chrome.tabs.create({url: 'https://romanisthere.github.io/apps/popupoff/updates/#2.0.0'})
		backupData()
		storageSet({
			hardModeActive: [],
			easyModeActive: [],
			whitelist: ['www.healthline.com', 'www.jamieoliver.com'],
			restoreContActive: [],
			curAutoMode: 'easyModeActive'
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

// const checkAndRunMode = (tabId, pureUrl, sendResponse) => {
// 	storageGet(['supervision', 'shortCutMode'], (res) => {
// 		const mode = res.shortCutMode
// 		if (res.supervision && ARR_OF_FORB_SITES.includes(pureUrl)) {
// 			sendResponse({ shouldShow: false })
// 		} else if (mode) {
// 			storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (res) => {
// 				// need to check both arrays
// 				const isHard = (mode == 'thisWebsiteWork') ? true : false
// 				const arrOfSites = res[isHard ? 'thisWebsiteWork' : 'thisWebsiteWorkEasy']
// 				const oppArrOfSites = res[isHard ? 'thisWebsiteWorkEasy' : 'thisWebsiteWork']
//
// 				if (!arrOfSites.includes(pureUrl)) {
// 					sendResponse({ shouldShow: true })
//
// 					const newArrOfSites = [...arrOfSites, pureUrl]
// 					storageSet({ [mode]: newArrOfSites })
//
// 					activateMode(isHard)(tabId)
// 					if (oppArrOfSites.includes(pureUrl)) {
// 						// check if website is in opposite mode array
// 						const newOppArrOfSites = oppArrOfSites.filter(e => e !== pureUrl)
// 						storageSet({[isHard ? 'thisWebsiteWorkEasy' : 'thisWebsiteWork']: newOppArrOfSites})
// 					}
// 				} else {
// 					sendResponse({ shouldShow: false })
//
// 					const newArrOfSites = arrOfSites.filter(e => e !== pureUrl)
// 					storageSet({[mode]: newArrOfSites})
//
// 					executeScript(tabId)('restore')
// 					resetBadgeText(tabId)
// 				}
// 			})
// 		}
// 	})
// }

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

// messages from content script. Currently responsible for 'alt + x' key comb
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
// 	if (sender.tab) {
// 		const tabId = sender.tab.id
// 		const pureUrl = getPureURL(sender)
// 		if (request.hardMode) {
// 			checkAndRunMode(tabId, pureUrl, sendResponse)
// 		} else if (request.openOptPage) {
// 			chrome.runtime.openOptionsPage()
// 		}
// 	}
// 	return true
// })
