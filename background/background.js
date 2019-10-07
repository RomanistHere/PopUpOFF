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
				// console.log(res)
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
chrome.runtime.onMessage.addListener(
  	function(request, sender, sendResponse) {
  		if (sender.tab) {
  			const pureUrl = getPureURL(sender)
  			if (request.hardMode) {
				storageGet("supervision", (res) => {
					if (res.supervision && ARR_OF_FORB_SITES.includes(pureUrl)) {
						// do nothing
					} else {
						storageGet(["thisWebsiteWork", "thisWebsiteWorkEasy"], (res) => {
							const arrOfSites = res.thisWebsiteWork
							if (!arrOfSites.includes(pureUrl)) {
						        setBadgeText("H")(sender.tab.id)
					    		
						    	const newArrOfSites = [...arrOfSites, pureUrl]
						        storageSet({ "thisWebsiteWork": newArrOfSites })

						        executeScript(sender.tab.id)('removeHard')
					    		executeScript(sender.tab.id)('watchDOM')
						    }
						})
					}
				})
  			}
  		}
})
