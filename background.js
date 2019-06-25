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

		// 1.1.1 - add supervision
		chrome.storage.sync.set({"supervision": true})

		// open website
		chrome.tabs.create({url: "https://romanisthere.github.io/PopUpOFF-Website/"})

    } else if(details.reason == "update"){
    	// 1.0.4 everywhere modes disabled temporairly
        chrome.storage.sync.set({"autoWork": false})
        chrome.storage.sync.set({"autoWorkEasy": false})
        // 1.1.1
        chrome.storage.sync.set({"supervision": true})
    	chrome.storage.sync.get("thisWebsiteWork", function(res){
        	const ARR_OF_SITES = res.thisWebsiteWork
        	const UPD_ARR_OF_SITES = ARR_OF_SITES.filter( el => !ARR_OF_FORB_SITES.includes( el ) )
        	chrome.storage.sync.set({"thisWebsiteWork": UPD_ARR_OF_SITES})
        })
        chrome.storage.sync.get("thisWebsiteWorkEasy", function(res){
        	const ARR_OF_SITES = res.thisWebsiteWorkEasy
        	const UPD_ARR_OF_SITES = ARR_OF_SITES.filter( el => !ARR_OF_FORB_SITES.includes( el ) )
        	chrome.storage.sync.set({"thisWebsiteWorkEasy": UPD_ARR_OF_SITES})
        })
    }
})

// handle tab switch
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.getSelected(null,function(tab) {
	    let url = tab.url
	    if (url.includes("chrome://")) {
			chrome.browserAction.disable(activeInfo.tabId)
		}
   })
});

// chrome.webNavigation.onCompleted.addListener(function(callback) {
// 	console.log('onCompleded')
// 	console.log(callback)
// })

// chrome.webNavigation.onHistoryStateUpdated.addListener(function(callback) {
// 	console.log('onHistoryStateUpdated')
// 	console.log(callback)
// })

// chrome.webNavigation.onCommitted.addListener(callback => {
// 	console.log('onCommitted')
// 	console.log(callback)	
// })

// chrome.webNavigation.onDOMContentLoaded.addListener(callback => {
// 	console.log('onDOMContentLoaded ')
// 	console.log(callback)	
// })

// handle tab update
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if ((changeInfo.status === 'complete') || (changeInfo.status === 'loading')) {
		let url = tab.url
		if (url.includes("chrome://")) {
			chrome.browserAction.disable(tabId)
		} else {
			// check for active modes		
			// chrome.storage.sync.get("autoWork", function(res) {
			// 	if (res.autoWork) {
			//     	chrome.tabs.executeScript(
			//         	tabId,
			//           	{file: 'removeHard.js'}
			//         )
			//     	chrome.tabs.executeScript(
			//         	tabId,
			//           	{file: 'watchDOM.js'}
			//         )
			//     }
			// })		
			// chrome.storage.sync.get("autoWorkEasy", function(res) {
			// 	if (res.autoWorkEasy) {
			//     	chrome.tabs.executeScript(
			//         	tabId,
			//           	{file: 'removeEasy.js'}
			//         )
			//     	chrome.tabs.executeScript(
			//         	tabId,
			//           	{file: 'watchDOMEasy.js'}
			//         )
			//     }
			// })
			chrome.storage.sync.get("thisWebsiteWork", function(res) {
			    let newUrl = url.substring(
				    url.lastIndexOf("//") + 2, 
				    url.indexOf("/", 8)
				)

				let arrOfSites = res.thisWebsiteWork
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
			    let newUrl = url.substring(
				    url.lastIndexOf("//") + 2, 
				    url.indexOf("/", 8)
				)

				let arrOfSites = res.thisWebsiteWorkEasy
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
	// console.log(changeInfo)
	
})
