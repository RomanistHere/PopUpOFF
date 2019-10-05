// handle install
chrome.runtime.onInstalled.addListener((details) => {
    if(details.reason == "install") {
		// check is extension already in use at other device
		chrome.storage.sync.get("thisWebsiteWork", (response) => {
			if (!response.thisWebsiteWork) {
				// set up start
				chrome.storage.sync.set({ "thisWebsiteWork": [] })
				chrome.storage.sync.set({ "thisWebsiteWorkEasy": [] })

				chrome.tabs.create({url: "https://romanisthere.github.io/PopUpOFF-Website/#greetings"})

				// since 1.1.1 - add supervision and tutorial
				chrome.storage.sync.set({"supervision": true})
				chrome.storage.sync.set({"tutorial": true})
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
			chrome.storage.sync.get("thisWebsiteWork", (res) => {
			    const newUrl = url.substring(
				    url.lastIndexOf("//") + 2, 
				    url.indexOf("/", 8)
				)

				const arrOfSites = res.thisWebsiteWork
				if (arrOfSites.includes(newUrl)) {
					chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'methods/removeHard.js'}
			        )
			    	chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'methods/watchDOM.js'}
			        )
			    }
			})
			chrome.storage.sync.get("thisWebsiteWorkEasy", (res) => {
			    const newUrl = url.substring(
				    url.lastIndexOf("//") + 2, 
				    url.indexOf("/", 8)
				)

				const arrOfSites = res.thisWebsiteWorkEasy
				if (arrOfSites.includes(newUrl)) {
					chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'methods/removeEasy.js'}
			        )
			    	chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'methods/watchDOMEasy.js'}
			        )
			    }
			})
		}
	}	
})
