import { ARR_OF_FORB_SITES } from '../constants/data.js'
import { 
	executeScript,
	storageSet,
	storageGet,
	getPureURL,
	setBadgeText
} from '../constants/functions.js'

// handle install
chrome.runtime.onInstalled.addListener((details) => {
    if(details.reason == 'install') {
		// check is extension already in use at other device
		storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (response) => {
			if (!response.thisWebsiteWork || !response.thisWebsiteWorkEasy) {
				// set up start
				storageSet({
					'thisWebsiteWork': [],
					'thisWebsiteWorkEasy': [],
					'supervision': true,
					'tutorial': true,
					'shortCutMode': false,
				})

				chrome.tabs.create({url: 'https://romanisthere.github.io/PopUpOFF-Website/#greetings'})
			}
		})
    } else if(details.reason == 'update') {
    	
    }
})

// 1.1.4 only
// chrome.runtime.onStartup.addListener(() => {
// 	storageGet('showUpdMess', (response) => {
// 		if (response.showUpdMess) {
// 			storageSet({ showUpdMess: false })
// 			chrome.tabs.create({url: 'https://romanisthere.github.io/PopUpOFF-Website/pages/update.html'})
// 		}
// 	})
// })


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
	if ((changeInfo.status === 'complete') || (changeInfo.status === 'loading')) {
		const url = tab.url

		if (url.includes('chrome://')) {
			chrome.browserAction.disable(tabId)
		} else {
			const pureUrl = getPureURL({ url })
			storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (res) => {
				const arrOfSites = res.thisWebsiteWork
				const arrOfEasySites = res.thisWebsiteWorkEasy
				if (arrOfSites.includes(pureUrl)) {
			    	setBadgeText('H')(tabId)

					executeScript(tabId)('removeHard')
			    	executeScript(tabId)('watchDOM')
			    	executeScript(tabId)('showAll')
			    } else if (arrOfEasySites.includes(pureUrl)) {
			    	setBadgeText('E')(tabId)

					executeScript(tabId)('removeEasy')
			    	executeScript(tabId)('watchDOMEasy')
			    	executeScript(tabId)('showAll')
			    }
			})
		}
	}	
})

// messages handling. Currently responsible for 'alt + x' key comb
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (sender.tab) {
		const tabId = sender.tab.id
		const pureUrl = getPureURL(sender)
		if (request.hardMode) {
			storageGet(['supervision', 'shortCutMode'], (res) => {
				const mode = res.shortCutMode
				if (res.supervision && ARR_OF_FORB_SITES.includes(pureUrl)) {
					// do nothing
				} else if (mode) {
					storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy'], (res) => {
						// need to check both arrays
						const isHard = (mode == 'thisWebsiteWork') ? true : false
						const arrOfSites = res[isHard ? 'thisWebsiteWork' : 'thisWebsiteWorkEasy']
						const oppArrOfSites = res[isHard ? 'thisWebsiteWorkEasy' : 'thisWebsiteWork']

						if (!arrOfSites.includes(pureUrl)) {
					        setBadgeText(isHard ? 'H' : 'E')(tabId)
				    		
					    	const newArrOfSites = [...arrOfSites, pureUrl]
					        storageSet({ [mode]: newArrOfSites })

					        executeScript(tabId)(isHard ? 'removeHard' : 'removeEasy')
				    		executeScript(tabId)(isHard ? 'watchDOM' : 'watchDOMEasy')
				    		executeScript(tabId)('showAll')
				    		if (oppArrOfSites.includes(pureUrl)) {
				    			// check if website is in opposite mode array
				    			const newOppArrOfSites = oppArrOfSites.filter(e => e !== pureUrl)
				    			storageSet({[isHard ? 'thisWebsiteWorkEasy' : 'thisWebsiteWork']: newOppArrOfSites})
				    		}
					    }
					})
				}
			})
		} else if (request.openOptPage) {
			chrome.runtime.openOptionsPage()
		}
	}
})
