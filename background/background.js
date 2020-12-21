import {
	defWebsites,
	defPreventContArr
} from '../constants/data.js'

import {
	storageSet,
	storageGet,
	getPureURL,
	setBadgeText,
	splitIntoChunks,
	setWebsites,
	getWebsites,
	getStorageData,
	setStorageData,
	arrayToObj
} from '../constants/functions.js'

const websitesStore = {
	"blobs.app": "easyModeActive",
	"developer.chrome.com": "easyModeActive",
	"humanparts.medium.com": "hardModeActive",
	"medium.com": "hardModeActive",
	"news.google.com": "easyModeActive",
	"payment.webpay.by": "whitelist",
	"uxdesign.cc": "hardModeActive",
	"www.21vek.by": "whitelist",
	"www.designcareer.co": "hardModeActive",
	"www.educba.com": "hardModeActive",
	"www.portative.by": "hardModeActive",
	"www.stuff.co.nz": "hardModeActive",
	"www.youtube.com": "whitelist",
	"yandex.ru": "hardModeActive",
}

// handle install
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason == 'install') {
		// check is extension already in use at other device
		storageGet(['websites', 'curAutoMode'], response => {
			if (response.websites == null || response.curAutoMode == null) {
				// set up start
				storageSet({
					tutorial: true,
					update: false,
					stats: {
						cleanedArea: 0,
						numbOfItems: 0,
						restored: 0
					},
					statsEnabled: true,
					restoreContActive: [...defPreventContArr],
					curAutoMode: 'whitelist',
					shortCutMode: null,
					// shortCutMode: 'hardModeActive',
					// websites: {},
					websites1: {},
					websites2: {},
					websites3: {},
					autoModeAggr: 'typeI',
					preset: 'presetManual',
				})

				chrome.tabs.create({ url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html#2.0' })
			}
		})
    } else if (details.reason == 'update') {

		// storageGet(['websites1', 'websites2', 'websites3'], resp => {
		// 	const {websites1, websites2, websites3} = resp
		// 	const newWebs = {...websites1, ...websites2, ...websites3}
		// 	storageSet({
		// 		websites: newWebs
		// 	})
		// })

		// chrome.storage.sync.remove(['websites1', 'websites2', 'websites3'])

		try {
			const { websites } = await getStorageData('websites')
			// const websites = websitesStore
			if (websites != null) {
				console.log(websites)
				await setWebsites(websites)
				chrome.storage.sync.remove(['websites', 'backupData'])
			}
		} catch (e) {
			console.log('something happened')
			console.log(e)
		}

		// PRODUCTION UNMUTE //
		// chrome.storage.sync.remove(['thisWebsiteWork', 'thisWebsiteWorkEasy'])
		// storageGet(['websites'], response => {
		// 	let newWebsites = {}

			// if (response.websites) {
			// 	newWebsites = response.websites
			// 	const keys = Object.keys(defWebsites)
			// 	try {
			// 		keys.forEach(key => {
			// 			delete newWebsites[key]
			// 		})
			// 	} catch (e) {
			// 		console.log(e)
			// 	}
			// }
			//
			// storageSet({
			// 	websites: newWebsites
			// })
		// })

        chrome.storage.sync.get(null, resp => {
            console.log(resp)
        })

		setTimeout(function () {
			console.log('timeout')
			chrome.storage.sync.get(null, resp => {
	            console.log(resp)
	        })
		}, 2000);

		// storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'shortCutMode', 'restoreContActive', 'websites', 'curAutoMode', 'statsEnabled', 'autoModeAggr'], response => {
		// 	if (response.websites == null || response.restoreContActive == null || response.curAutoMode == null) {
		// 		if (response.thisWebsiteWork == null || response.thisWebsiteWorkEasy == null) {
		// 			response.thisWebsiteWork = []
		// 			response.thisWebsiteWorkEasy = []
		// 		}
		// 		// shortcut converting
		// 		// shortcut: false, "thisWebsiteWorkEasy", "thisWebsiteWork" -> null, 'easyModeActive', 'hardModeActive'
		// 		const { shortCutMode, thisWebsiteWork, thisWebsiteWorkEasy } = response
		// 		const newShortCut = (shortCutMode == 'thisWebsiteWorkEasy') ? 'easyModeActive' :
		// 							(shortCutMode == 'thisWebsiteWork') ? 'hardModeActive' : null
		//
		// 		// websites converting
		// 		const newWebsites = {
		// 			...websites,
		// 			...arrayToObj(thisWebsiteWorkEasy, 'easyModeActive'),
		// 			...arrayToObj(thisWebsiteWork, 'hardModeActive')
		// 		}
		//
		// 		const restCont = [...preventContArr]
		//
		// 		storageSet({
		// 			websites: newWebsites,
		// 			restoreContActive: restCont,
		// 			curAutoMode: 'whitelist',
		// 			autoModeAggr: 'typeIII',
		// 			shortCutMode: newShortCut,
		// 			tutorial: true,
		// 			update: true,
		// 		 	preset: 'presetManual',
		// 		})
		// 	}
		//
		// 	if (response.autoModeAggr == null) {
		// 		storageSet({ autoModeAggr: 'typeI' })
		// 	}
		//
		// 	if (response.statsEnabled == null) {
		// 		storageSet({ statsEnabled: false })
		// 	}
		//
		// 	if (typeof response.shortCutMode == 'undefined') {
		// 		storageSet({ shortCutMode: null })
		// 	}
		// })
    }
})

chrome.runtime.setUninstallURL("https://romanisthere.github.io/PopUpOFF-Website/pages/delete.html")

// handle tab switch(focus)
chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.query({ 'active': true }, info => {
    	const url = info[0].url
		// console.log(url)
		// console.log(url.length)
	    if (url.includes('chrome://') || url.includes('chrome-extension://') || url.length === 0) {
			// console.log('here')
			chrome.browserAction.disable(activeInfo.tabId)
		} else {
			const pureUrl = getPureURL(info[0])
			setNewBadge(pureUrl, activeInfo.tabId)
		}
    })
})

const letters = {
	'hardModeActive': 'A',
	'easyModeActive': 'M',
	'whitelist': ''
}

const setNewBadge = async (pureUrl, tabID) => {
	let { curAutoMode } = await getStorageData('curAutoMode')
	const websites = await getWebsites()

	console.log(websites)

	if (curAutoMode == null) {
		await setStorageData({ curAutoMode: 'easyModeActive' })
		curAutoMode = 'easyModeActive'
	}

	const fullWebsites = { ...defWebsites, ...websites }
	let curModeName = curAutoMode

	if (pureUrl in fullWebsites)
		curModeName = fullWebsites[pureUrl]

	const letter = letters[curModeName]

	setBadgeText(letter)(tabID)

	Object.keys(subMenuStore).forEach(key => {
		const menu = subMenuStore[key]

		chrome.contextMenus.update(menu, {
			type: 'checkbox',
			checked: (letter === 'A' && key === 'hardModeActive')
				|| (letter === 'M' && key === 'easyModeActive')
				|| (letter === '' && key === 'whitelist')
		})
	})
}

// handle mode changed from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (!sender.tab)
		return true

	if (request.modeChanged) {
		const tabID = sender.tab.id
		const pureUrl = getPureURL(sender)

		setNewBadge(pureUrl, tabID)
	}

	return true
})

// handle updating to set new badge and context menu
chrome.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
	if (changeInfo.status === 'loading') {
		const url = tab.url

		if (url.includes('chrome://') || url.includes('chrome-extension://')) {
			chrome.browserAction.disable(tabID)
		} else {
			const pureUrl = getPureURL({ url })

			setNewBadge(pureUrl, tabID)
		}
	}
})

// content menu (right click) mechanics
const subMenu = [
	{
		title: `Aggressive`,
		mode: 'hardModeActive'
	},{
		title: `Moderate`,
		mode: 'easyModeActive'
	},{
		title: `Dormant`,
		mode: 'whitelist'
	}
]

const subMenuStore = {
	hardModeActive: null,
	easyModeActive: null,
	whitelist: null,
}

const setNewMode = async (newMode, pureUrl, tabID) => {
	const websites = await getWebsites()
	console.log(websites)

	const fullWebsites = { ...defWebsites, ...websites }

	if (pureUrl in fullWebsites && fullWebsites[pureUrl] === newMode)
		return

	const newWebsites = { ...websites, [pureUrl]: newMode }
	const letter = letters[newMode]

	try {
		await setWebsites(newWebsites)
		setBadgeText(letter)(tabID)
	} catch (e) {
		console.log(e)
	}
}

// add context menu with options
chrome.contextMenus.removeAll()
subMenu.map((item, index) => {
 	subMenuStore[Object.keys(subMenuStore)[index]] = chrome.contextMenus.create({
		title: item.title,
		type: 'checkbox',
		// checked whitelist by default
		checked: item.mode === 'whitelist' ? true : false,
		// works for web pages only
		documentUrlPatterns: ["http://*/*", "https://*/*", "http://*/", "https://*/"],
		onclick: (obj, tabs) => {
			const pureUrl = getPureURL(tabs)
			const tabID = tabs.id
			const tabURL = tabs.url

			chrome.tabs.sendMessage(tabID, { activeMode: item.mode }, resp => {
	            // if (resp && resp.closePopup === true) {
				// 	chrome.tabs.update(tabID, { url: tabURL })
	            // }
	        })

			setNewMode(item.mode, pureUrl, tabID)
		}
	})
})
