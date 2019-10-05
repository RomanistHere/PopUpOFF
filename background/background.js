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
		storageGet("thisWebsiteWork", (response) => {
			if (!response.thisWebsiteWork) {
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
  //   	storageGet("thisWebsiteWork", (response) => {
		// 	console.log(response)
		// })
  //   	storageGet("thisWebsiteWorkEasy", (response) => {
		// 	console.log(response)
		// })
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

			storageGet("thisWebsiteWork", (res) => {
				const arrOfSites = res.thisWebsiteWork
				if (arrOfSites.includes(pureUrl)) {
					executeScript(tabId)('removeHard')
			    	executeScript(tabId)('watchDOM')
			    }
			})

			storageGet("thisWebsiteWorkEasy", (res) => {
				const arrOfSites = res.thisWebsiteWorkEasy
				if (arrOfSites.includes(pureUrl)) {
					executeScript(tabId)('removeEasy')
			    	executeScript(tabId)('watchDOMEasy')
			    }
			})
		}
	}	
})
