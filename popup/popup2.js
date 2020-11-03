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
        // check website in dif modes
        storageGet(['hardModeActive', 'easyModeActive', 'whitelist'], resp => {
			// can be active only one from 3
            const { hardModeActive, easyModeActive, whitelist } = resp
            const newUrl = getPureURL(tabs[0])
            const modes = {
                'hardModeActive': hardModeActive,
                'easyModeActive': easyModeActive,
                'whitelist': whitelist,
            }

            for (let [key, value] of Object.entries(modes)) {
                if (key === mode)
                    modes[key] = [...value, newUrl]
                else
                    modes[key] = value.filter(url => url !== newUrl)
            }

            storageSet(modes)
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
        storageGet(['hardModeActive', 'easyModeActive', 'whitelist', 'curAutoMode', 'statsEnabled', 'stats', 'restoreContActive'], resp => {
			// set statistics
			if (resp.statsEnabled) {
				addClass(querySelector('.stats'), 'stats-show')
				// update statistic
				querySelector('.stats__elem').innerHTML = nFormatter(resp.stats.numbOfItems, 1)
				querySelector('.stats__size').innerHTML = nFormatter(resp.stats.cleanedArea, 1)
				setInterval(updStats, 1000)
			}

			// modes init
            const { hardModeActive, easyModeActive, restoreContActive, whitelist, curAutoMode } = resp
            const newUrl = getPureURL(tabs[0])
			state = { ...state, pureUrl: newUrl }
            const modes = {
                'hardModeActive': hardModeActive,
                'easyModeActive': easyModeActive,
                'whitelist': whitelist,
            }

			// check restore content array and set btn
			if (restoreContActive.includes(newUrl)) {
				addClass(querySelector('.add_opt'), 'add_opt-active')
				state = { ...state, isRestContActive: true }
			}

			// if website is in one of arrays - set the proper mode
            for (let [key, value] of Object.entries(modes)) {
                if (value.includes(newUrl)) {
                    const actButton = querySelector(`[data-mode="${key}"]`)
					state = { ...state, curMode: key }
                    setNewBtn(buttons, actButton)
                    break
                }
            }

			// otherwise enable automatic one
			if (state.curMode === null) {
				const actButton = querySelector(`[data-mode="${curAutoMode}"]`)
				state = { ...state, curMode: curAutoMode }
	            setNewBtn(buttons, actButton)
			}

			console.log(state)
        })
    })
}
init()

// prevent content

const prevContBtn = querySelector('.add_opt')
prevContBtn.addEventListener('click', debounce(function(e) {
	e.preventDefault()
	storageGet(['restoreContActive', 'easyModeActive', 'whitelist'], resp => {
		const { restoreContActive, easyModeActive, whitelist } = resp
		let newArr = []
		let newEasyMode = []
		let newWhitelist = []

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
			newEasyMode = [...easyModeActive, state.pureUrl]
			state = { ...state, curMode: 'easyModeActive' }
			if (whitelist.includes(state.pureUrl))
				newWhitelist = whitelist.filter(url => url !== state.pureUrl)
		}

		// set state
		storageSet({
			restoreContActive: newArr,
			easyModeActive: newEasyMode,
			whitelist: newWhitelist
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
