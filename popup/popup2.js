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
} from '../constants/functions.js'

let state = {
	curMode: null,
	isRestContActive: false,
	pureUrl: null,
}

// vizually set clicked button as active
const setNewBtn = (btns, newActBtn) => {
    btns.forEach(item => item.classList.remove('desc-active'))
    addClass(newActBtn, 'desc-active')
}

// handle clicks on buttons
const buttons = querySelectorAll('.desc')
buttons.forEach(item => item.addEventListener('click', function(e) {
    e.preventDefault()
    setNewBtn(buttons, this)

    const mode = getAttr(this, 'data-mode')

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

        // send msg to content script with new active mode
        chrome.tabs.sendMessage(tabs[0].id, { activeMode: mode }, resp => {
            if (resp.closePopup === true) {
                window.close()
            }
        })
    })

    return false
}))

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
			if (resp.statsEnabled) {
				addClass(querySelector('.stats'), 'stats-show')
				// update statistic
				querySelector('.stats__elem').innerHTML = nFormatter(resp.stats.numbOfItems, 1)
				querySelector('.stats__size').innerHTML = nFormatter(resp.stats.cleanedArea, 1)
				setInterval(updStats, 1000)
			}
			// mode init
            const { hardModeActive, easyModeActive, restoreContActive, whitelist, curAutoMode } = resp
            const newUrl = getPureURL(tabs[0])
			state = { ...state, pureUrl: newUrl }
            const modes = {
                'hardModeActive': hardModeActive,
                'easyModeActive': easyModeActive,
                'whitelist': whitelist,
            }

			if (restoreContActive.includes(newUrl)) {
				querySelector('.add_opt').classList.add('add_opt-active')
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
prevContBtn.addEventListener('click', function(e) {
	e.preventDefault()
	storageGet(['restoreContActive'], resp => {
		const { restoreContActive } = resp
		let newArr = []
		if (state.isRestContActive) {
			newArr = restoreContActive.filter(url => url !== state.pureUrl)
			this.classList.remove('add_opt-active')
		} else {
			newArr = [...newArr, state.pureUrl]
			this.classList.add('add_opt-active')
		}

		storageSet({ restoreContActive: newArr })
	})
})
