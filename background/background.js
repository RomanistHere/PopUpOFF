import {
	websites,
	preventContArr
} from '../constants/data.js'

import {
	storageSet,
	storageGet,
	getPureURL,
	setBadgeText,
	backupData
} from '../constants/functions.js'

// handle install
browser.runtime.onInstalled.addListener(details => {
    if (details.reason == 'install') {
		// check is extension already in use at other device
		storageGet(['websites', 'curAutoMode'], response => {
			if (!response.websites || !response.curAutoMode) {
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
					backupData: {},
					restoreContActive: [...preventContArr],
					curAutoMode: 'easyModeActive',
					shortCutMode: null,
					// shortCutMode: 'hardModeActive',
					websites: websites,
					autoModeAggr: 'typeI',
					preset: 'presetCasual',
				})

				browser.tabs.create({ url: 'https://romanisthere.github.io/PopUpOFF-Website/index.html#2.0' })
			}
		})
    } else if (details.reason == 'update') {
    	// browser.tabs.create({ url: 'https://romanisthere.github.io/apps/popupoff/updates/#2.0.0' })
		backupData()

		storageGet(['thisWebsiteWork', 'thisWebsiteWorkEasy', 'shortCutMode'], response => {
			// shortcut converting
			// shortcut: false, "thisWebsiteWorkEasy", "thisWebsiteWork" -> null, 'easyModeActive', 'hardModeActive'
			const { shortCutMode, thisWebsiteWork, thisWebsiteWorkEasy } = response
			const newShortCut = shortCutMode === 'thisWebsiteWorkEasy' ? 'easyModeActive' :
								shortCutMode === 'thisWebsiteWork' ? 'hardModeActive' : null

			// websites converting
			const newWebsites = {
				...websites,
				...arrayToObj(thisWebsiteWorkEasy, 'easyModeActive'),
				...arrayToObj(thisWebsiteWork, 'hardModeActive')
			}

			storageSet({
				websites: newWebsites,
				restoreContActive: [...preventContArr],
				curAutoMode: 'whitelist',
				autoModeAggr: 'typeIII',
				shortCutMode: newShortCut,
				tutorial: true,
				update: true,
			 	preset: 'presetManual',
			})
		})
    }
})

const arrayToObj = (arr, prop) =>
	arr.reduce((acc, value) => ({ ...acc, [value]: prop }), {})

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

const setNewBadge = (pureUrl, tabID) =>
	storageGet(['curAutoMode', 'websites'], resp => {
		const { websites, curAutoMode } = resp
		let curModeName = curAutoMode

		if (pureUrl in websites)
			curModeName = websites[pureUrl]

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
	})

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

const setNewMode = (newMode, pureUrl, tabID) => {
	storageGet(['websites'], resp => {
		const { websites } = resp

		if (pureUrl in websites && websites[pureUrl] === newMode)
			return

		const newWebsites = { ...websites, [pureUrl]: newMode }
		const letter = letters[newMode]

		storageSet({ websites: newWebsites })
		setBadgeText(letter)(tabID)
	})
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
	            if (resp && resp.closePopup === true) {
					browser.tabs.update(tabID, { url: tabURL })
	            }
	        })

			setNewMode(item.mode, pureUrl, tabID)
		}
	})
})
