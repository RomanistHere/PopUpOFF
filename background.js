'use strict';

const ARR_OF_FORB_SITES = [
	'music.youtube.com',
	'www.youtube.com',
	'www.linkedin.com',
	'twitter.com',
	'www.facebook.com',
	'www.google.com',
	'www.reddit.com',
	'www.instagram.com',
	'www.baidu.com',
	'www.amazon.com',
	'vk.com',
	'www.pinterest.com',
	'trello.com',
	'calendar.google.com',
]

// handle install
chrome.runtime.onInstalled.addListener(function(details){
	//call a function to handle a first install
    if(details.reason == "install"){
        // always on mode set
		chrome.storage.sync.set({"autoWork": false})
        // always on easy mode set
		chrome.storage.sync.set({"autoWorkEasy": false})
		// on for this website mode set
		chrome.storage.sync.set({"thisWebsiteWork": []})
		// on for this website easy mode set
		chrome.storage.sync.set({"thisWebsiteWorkEasy": []})

		// since 1.1.1 - add supervision and tutorial
		chrome.storage.sync.set({"supervision": true})
		chrome.storage.sync.set({"tutorial": true})

		// open website
		chrome.tabs.create({url: "https://romanisthere.github.io/PopUpOFF-Website/#greetings"})

    } else if(details.reason == "update"){

    }
})

// handle tab switch
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.getSelected(null,function(tab) {
	    const url = tab.url
	    if (url.includes("chrome://")) {
			chrome.browserAction.disable(activeInfo.tabId)
		}
   })
});

// handle tab update
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if ((changeInfo.status === 'complete') || (changeInfo.status === 'loading')) {
		const url = tab.url
		if (url.includes("chrome://")) {
			chrome.browserAction.disable(tabId)
		} else {
			chrome.storage.sync.get("thisWebsiteWork", function(res) {
			    const newUrl = url.substring(
				    url.lastIndexOf("//") + 2, 
				    url.indexOf("/", 8)
				)

				const arrOfSites = res.thisWebsiteWork
				if (arrOfSites.includes(newUrl)) {
					chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'removeHard.js'}
			        )
			    	chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'watchDOM.js'}
			        )
			    }
			})
			chrome.storage.sync.get("thisWebsiteWorkEasy", function(res) {
			    const newUrl = url.substring(
				    url.lastIndexOf("//") + 2, 
				    url.indexOf("/", 8)
				)

				const arrOfSites = res.thisWebsiteWorkEasy
				if (arrOfSites.includes(newUrl)) {
					chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'removeEasy.js'}
			        )
			    	chrome.tabs.executeScript(
			        	tabId,
			          	{file: 'watchDOMEasy.js'}
			        )
			    }
			})
		}
	}	
})
