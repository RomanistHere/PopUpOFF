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
    if(details.reason == "install") {
		// check is extension already in use at other device
		storageGet(["thisWebsiteWork", "thisWebsiteWorkEasy"], (response) => {
			if (!response.thisWebsiteWork || !response.thisWebsiteWorkEasy) {
				// set up start
				storageSet({
					"thisWebsiteWork": [],
					"thisWebsiteWorkEasy": [],
					"supervision": true,
					"tutorial": true,
				})

				chrome.tabs.create({url: "https://romanisthere.github.io/PopUpOFF-Website/#greetings"})
			}
		})

    } else if(details.reason == "update") {
    	storageSet({ "shortCutMode": false })
    }
})

// handle tab switch(focus)
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.getSelected(null, (tab) => {
	    const url = tab.url
	    if (url.includes("chrome://")) {
			chrome.browserAction.disable(activeInfo.tabId)
		}
    })
})

// handle tab update(open, reload)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if ((changeInfo.status === 'complete') || (changeInfo.status === 'loading')) {
		const url = tab.url

		if (url.includes("chrome://")) {
			chrome.browserAction.disable(tabId)
		} else {
			const pureUrl = getPureURL({ url })
			storageGet(["thisWebsiteWork", "thisWebsiteWorkEasy"], (res) => {
				console.log(res)
				const arrOfSites = res.thisWebsiteWork
				const arrOfEasySites = res.thisWebsiteWorkEasy
				if (arrOfSites.includes(pureUrl)) {
			    	setBadgeText("H")(tabId)

					executeScript(tabId)('removeHard')
			    	executeScript(tabId)('watchDOM')
			    } else if (arrOfEasySites.includes(pureUrl)) {
			    	setBadgeText("E")(tabId)

					executeScript(tabId)('removeEasy')
			    	executeScript(tabId)('watchDOMEasy')
			    }
			})
		}
	}	
})

// messages handling. Currently responsible for "alt + x" key comb
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log(sender)
	if (sender.tab) {
		const tabId = sender.tab.id
		const pureUrl = getPureURL(sender)
		if (request.hardMode) {
			storageGet(["supervision", "shortCutMode"], (res) => {
				const mode = res.shortCutMode
				console.log(mode)
				if (res.supervision && ARR_OF_FORB_SITES.includes(pureUrl)) {
					// do nothing
				} else if (mode) {
					storageGet(["thisWebsiteWork", "thisWebsiteWorkEasy"], (res) => {
						// need to check both arrays
						console.log(res)
						const arrOfSites = res[mode]
						if (!arrOfSites.includes(pureUrl)) {
					        setBadgeText("H")(tabId)
				    		
					    	const newArrOfSites = [...arrOfSites, pureUrl]
					        storageSet({ [mode]: newArrOfSites })

					        executeScript(tabId)('removeHard')
				    		executeScript(tabId)('watchDOM')
					    }
					})
				}
			})
		}
	}
})