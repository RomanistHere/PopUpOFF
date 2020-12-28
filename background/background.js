import {
	defWebsites,
	defPreventContArr
} from '../constants/data.js'

import {
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
browser.runtime.onInstalled.addListener(async (details) => {
	const { previousVersion, reason } = details
    if (reason == 'install') {
		// check is extension already in use at other device
		const { curAutoMode } = await getStorageData('curAutoMode')

		if (curAutoMode == null) {
			// set up start
			await setStorageData({
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
				websites1: {},
				websites2: {},
				websites3: {},
				autoModeAggr: 'typeI',
				preset: 'presetManual',
			})

			chrome.tabs.create({ url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html#2.0' })
		}
    } else if (reason == 'update') {

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
			if (previousVersion === '2.0.2') {
				// 2.0.2
			} else if (websites != null) {
				// 2.0.0 - 2.0.1

				let newWebsites = { ...websites }
				const keys = Object.keys(defWebsites)
				try {
					keys.forEach(key => {
						if (newWebsites[key] === defWebsites[key]) {
							delete newWebsites[key]
						}
					})
				} catch (e) {
					console.log(e)
				}

				await setWebsites(newWebsites)
			} else {
				// before 2.0

				let { thisWebsiteWork, thisWebsiteWorkEasy, shortCutMode } = await getStorageData(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'shortCutMode'])

				if (thisWebsiteWork == null || thisWebsiteWorkEasy == null) {
					thisWebsiteWork = []
					thisWebsiteWorkEasy = []
				}
				// shortcut converting
				// shortcut: false, "thisWebsiteWorkEasy", "thisWebsiteWork" -> null, 'easyModeActive', 'hardModeActive'
				const newShortCut = (shortCutMode == 'thisWebsiteWorkEasy') ? 'easyModeActive' :
									(shortCutMode == 'thisWebsiteWork') ? 'hardModeActive' : null

				// websites converting
				const newWebsites = {
					...arrayToObj(thisWebsiteWorkEasy, 'easyModeActive'),
					...arrayToObj(thisWebsiteWork, 'hardModeActive')
				}

				await setWebsites(newWebsites)
				await setStorageData({
					restoreContActive: [...defPreventContArr],
					curAutoMode: 'whitelist',
					autoModeAggr: 'typeI',
					shortCutMode: newShortCut,
					tutorial: true,
					update: true,
				 	preset: 'presetManual',
				})
			}

			// remove old props
			chrome.storage.sync.remove(['websites', 'backupData', 'thisWebsiteWork', 'thisWebsiteWorkEasy', 'supervision', 'restoreCont'])
		} catch (e) {
			console.log('something happened')
			console.log(e)
		}

		// Detect if there are issue and fix
		const { shortCutMode, statsEnabled, autoModeAggr } = await getStorageData(['shortCutMode', 'statsEnabled', 'autoModeAggr'])

		if (autoModeAggr == null) {
			await setStorageData({ autoModeAggr: 'typeI' })
		}

		if (statsEnabled == null) {
			await setStorageData({ statsEnabled: false })
		}

		if (typeof shortCutMode == 'undefined') {
			await setStorageData({ shortCutMode: null })
		}

		// chrome.storage.sync.get(null, resp => {
		// 	console.log(resp)
		// })
    }
})

chrome.runtime.setUninstallURL("https://romanisthere.github.io/PopUpOFF-Website/pages/delete.html")

// handle tab switch(focus)
browser.tabs.onActivated.addListener(activeInfo => {
    browser.tabs.query({ 'active': true }, info => {
    	const url = info[0].url
	    if (url.includes('about:')) {
			browser.browserAction.disable(activeInfo.tabId)
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

		browser.contextMenus.update(menu, {
			type: 'checkbox',
			checked: (letter === 'A' && key === 'hardModeActive')
				|| (letter === 'M' && key === 'easyModeActive')
				|| (letter === '' && key === 'whitelist')
		})
	})
}

// handle mode changed from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
browser.tabs.onUpdated.addListener((tabID, changeInfo, tab) => {
	if (changeInfo.status === 'loading') {
		const url = tab.url

		if (url.includes('about:')) {
			browser.browserAction.disable(tabID)
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
browser.contextMenus.removeAll()
subMenu.map((item, index) => {
 	subMenuStore[Object.keys(subMenuStore)[index]] = browser.contextMenus.create({
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

			browser.tabs.sendMessage(tabID, { activeMode: item.mode }, resp => {
	            // if (resp && resp.closePopup === true) {
				// 	browser.tabs.update(tabID, { url: tabURL })
	            // }
	        })

			setNewMode(item.mode, pureUrl, tabID)
		}
	})
})
