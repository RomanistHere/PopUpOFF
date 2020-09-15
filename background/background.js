import { ARR_OF_FORB_SITES } from '../constants/data.js'
import {
	storageSet,
	storageGet,
	getPureURL,
	activateMode,
	activateHard,
	activateEasy,
	executeScript,
	resetBadgeText
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
					tutorial: true,
					shortCutMode: false,
					stats: {
						cleanedArea: 0,
						numbOfItems: 0,
						restored: 0
					},
					statsEnabled: true,
					restoreCont: false
				})

				chrome.tabs.create({url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html#greetings-chrome'})
			}
		})
    } else if (details.reason == 'update') {
    	chrome.tabs.create({url: 'https://romanisthere.github.io/apps/popupoff/updates/#1.1.7'})
		storageGet('stats', (resp) => {
			let fixedStats = {}
			if (!resp.stats) {
				storageSet({
					stats: {
						cleanedArea: 0,
						numbOfItems: 0,
						restored: 0
					}
				})
			} else if (resp.stats.cleanedArea > 1000) {
				fixedStats = { ...resp.stats, cleanedArea: 50 }
			} else if (resp.stats.numbOfItems > 200000) {
				fixedStats = { ...resp.stats, numbOfItems: 10000 }
			} else if (resp.stats.restored > 100) {
				fixedStats = { ...resp.stats, restored: 20 }
			} else {
				return
			}
			storageSet({ stats: fixedStats })
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

// handle tab update(open, reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	// if ((changeInfo.status === 'complete') || (changeInfo.status === 'loading')) {
	if (changeInfo.status === 'loading') {
		const url = tab.url

		if (url.includes('chrome://')) {
			chrome.browserAction.disable(tabId)
		} else {
			const pureUrl = getPureURL({ url })
			storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (res) => {
				const arrOfSites = res.thisWebsiteWork
				const arrOfEasySites = res.thisWebsiteWorkEasy

				if (arrOfSites.includes(pureUrl)) {
			    	activateHard(tabId)
			    } else if (arrOfEasySites.includes(pureUrl)) {
			    	activateEasy(tabId)
			    }
			})
		}
	}
})

// messages from content script. Currently responsible for 'alt + x' key comb
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (sender.tab) {
		const tabId = sender.tab.id
		const pureUrl = getPureURL(sender)
		if (request.hardMode) {
			storageGet(['supervision', 'shortCutMode'], (res) => {
				const mode = res.shortCutMode
				if (res.supervision && ARR_OF_FORB_SITES.includes(pureUrl)) {
					sendResponse({ shouldShow: false })
				} else if (mode) {
					storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (res) => {
						// need to check both arrays
						const isHard = (mode == 'thisWebsiteWork') ? true : false
						const arrOfSites = res[isHard ? 'thisWebsiteWork' : 'thisWebsiteWorkEasy']
						const oppArrOfSites = res[isHard ? 'thisWebsiteWorkEasy' : 'thisWebsiteWork']

						if (!arrOfSites.includes(pureUrl)) {
							sendResponse({ shouldShow: true })

					    	const newArrOfSites = [...arrOfSites, pureUrl]
					        storageSet({ [mode]: newArrOfSites })

							activateMode(isHard)(tabId)
				    		if (oppArrOfSites.includes(pureUrl)) {
				    			// check if website is in opposite mode array
				    			const newOppArrOfSites = oppArrOfSites.filter(e => e !== pureUrl)
				    			storageSet({[isHard ? 'thisWebsiteWorkEasy' : 'thisWebsiteWork']: newOppArrOfSites})
				    		}
					    } else {
							sendResponse({ shouldShow: false })

							const newArrOfSites = arrOfSites.filter(e => e !== pureUrl)
							storageSet({[mode]: newArrOfSites})

							executeScript(tabId)('restore')
							resetBadgeText(tabId)
						}
					})
				}
			})
		} else if (request.openOptPage) {
			chrome.runtime.openOptionsPage()
		}
	}
	return true
})
