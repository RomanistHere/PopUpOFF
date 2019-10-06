import { 
	executeScript,
	storageSet,
	storageGet,
	getPureURL
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

// handle tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.getSelected(null, (tab) => {
	    const url = tab.url
	    if (url.includes("chrome://")) {
			chrome.browserAction.disable(activeInfo.tabId)
		}
   })
});

// handle tab update
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if ((changeInfo.status === 'complete') || (changeInfo.status === 'loading')) {
		const url = tab.url

		if (url.includes("chrome://")) {
			chrome.browserAction.disable(tabId)
		} else {
			const pureUrl = getPureURL({ url })
			storageGet(["thisWebsiteWork", "thisWebsiteWorkEasy"], (res) => {
				const arrOfSites = res.thisWebsiteWork
				const arrOfEasySites = res.thisWebsiteWorkEasy
				if (arrOfSites.includes(pureUrl)) {
					executeScript(tabId)('removeHard')
			    	executeScript(tabId)('watchDOM')
			    }
				if (arrOfEasySites.includes(pureUrl)) {
					executeScript(tabId)('removeEasy')
			    	executeScript(tabId)('watchDOMEasy')
			    }
			})
		}
	}	
})

chrome.runtime.onMessage.addListener(
  	function(request, sender, sendResponse) {
  		if (sender.tab) {
  			const pureUrl = getPureURL(sender)
  			if (request.hardMode) {
  				storageGet(["thisWebsiteWork", "thisWebsiteWorkEasy"], (res) => {
					const arrOfSites = res.thisWebsiteWork
					if (!arrOfSites.includes(pureUrl)) {
				    	const newArrOfSites = [...arrOfSites, pureUrl]
				        executeScript(sender.tab.id)('removeHard')
			    		executeScript(sender.tab.id)('watchDOM')
				        storageSet({ "thisWebsiteWork": newArrOfSites })
				    }
				})
  			}
  		}
});
