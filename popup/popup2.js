import {
	querySelector,
    querySelectorAll,
	addClass,
	removeClass,
    getAttr,
	storageSet,
	storageGet,
	executeScriptHere,
	getPureURL,
	setBadgeText,
	resetBadgeText,
	nFormatter,
	debounce
} from '../constants/functions.js'

let state = {
	curMode: null,
	isRestContActive: false,
	pureUrl: null,
}

// vizually set clicked button as active
const setNewBtn = (btns, newActBtn) => {
    btns.forEach(item => removeClass(item, 'desc-active'))
    addClass(newActBtn, 'desc-active')
}

// handle clicks on buttons
const buttons = querySelectorAll('.desc')
buttons.forEach(item => item.addEventListener('click', debounce(function(e) {
    e.preventDefault()

	const mode = getAttr(this, 'data-mode')

	if (state.curMode === mode)
		return

    setNewBtn(buttons, this)

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        // check website object. Change/add property
        storageGet(['websites'], resp => {
            const { websites } = resp
            const newUrl = getPureURL(tabs[0])

			newWebsites = { ...websites, [newUrl]: mode }

            storageSet({ websites: newWebsites })
        })

		// if whitelist just enabled and prevent content active -> remove prevent content (prevent content is not working in whitelist)
		if (mode === 'whitelist' && state.isRestContActive) {
			storageGet(['restoreContActive'], resp => {
				const { restoreContActive } = resp
				const newContActive = restoreContActive.filter(url => url !== state.pureUrl)
				storageSet({ restoreContActive: newContActive })
				state = { ...state, isRestContActive: false }
			})
		}

		state = { ...state, curMode: mode }
        // send msg to content script with new active mode
        chrome.tabs.sendMessage(tabs[0].id, { activeMode: mode }, resp => {
            if (resp && resp.closePopup === true) {
				chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
                window.close()
            }
        })
    })

    return false
}, 150)))

// stats update
const updStats = () => {
	storageGet(['stats'], res => {
		querySelector('.stats__elem').innerHTML = nFormatter(res.stats.numbOfItems, 1)
		querySelector('.stats__size').innerHTML = nFormatter(res.stats.cleanedArea, 1)
	})
}

// init popup state
const init = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        storageGet(['websites', 'curAutoMode', 'statsEnabled', 'stats', 'restoreContActive'], resp => {
			// set statistics
			if (resp.statsEnabled) {
				addClass(querySelector('.stats'), 'stats-show')
				// update statistic
				querySelector('.stats__elem').innerHTML = nFormatter(resp.stats.numbOfItems, 1)
				querySelector('.stats__size').innerHTML = nFormatter(resp.stats.cleanedArea, 1)
				setInterval(updStats, 1000)
			}

			// modes init
            const { restoreContActive, websites, curAutoMode } = resp
            const newUrl = getPureURL(tabs[0])
			state = { ...state, pureUrl: newUrl }

			// check restore content array and set btn
			if (restoreContActive.includes(newUrl)) {
				addClass(querySelector('.add_opt'), 'add_opt-active')
				state = { ...state, isRestContActive: true }
			}

			// if website is in one of arrays - set the proper mode
			let curModeName = curAutoMode

            if (newUrl in websites) {
				curModeName = websites[websites]
            }

			const actButton = querySelector(`[data-mode="${curModeName}"]`)
			state = { ...state, curMode: curModeName }
			setNewBtn(buttons, actButton)
        })
    })
}
init()

// prevent content

const prevContBtn = querySelector('.add_opt')
prevContBtn.addEventListener('click', debounce(function(e) {
	e.preventDefault()
	storageGet(['restoreContActive', 'websites'], resp => {
		const { restoreContActive, websites } = resp
		let newArr = []
		let newWebsites = {}

		// add/remove site to restore cotntent array
		if (state.isRestContActive) {
			newArr = restoreContActive.filter(url => url !== state.pureUrl)
			removeClass(this, 'add_opt-active')
		} else {
			newArr = [...newArr, state.pureUrl]
			addClass(this, 'add_opt-active')
		}

		// if whitelist activated, add website to easy mode (prevent content should not work in whitelist)
		if (state.curMode === 'whitelist') {
			newWebsites = {...websites, [state.pureUrl]: 'easyModeActive' }
			state = { ...state, curMode: 'easyModeActive' }
		}

		// set state
		storageSet({
			restoreContActive: newArr,
			websites: newWebsites
		})
		state = { ...state, isRestContActive: !state.isRestContActive }

		// reload current page and close popup if activated prevent content
		if (state.isRestContActive) {
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
				window.close()
		    })
		}
	})
}, 500))
