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

const init = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        storageGet(['hardModeActive', 'easyModeActive', 'whitelist', 'curAutoMode'], resp => {
            const { hardModeActive, easyModeActive, whitelist, curAutoMode } = resp
            const newUrl = getPureURL(tabs[0])
            const modes = {
                'hardModeActive': hardModeActive,
                'easyModeActive': easyModeActive,
                'whitelist': whitelist,
            }

            for (let [key, value] of Object.entries(modes)) {
                if (value.includes(newUrl)) {
                    const actButton = querySelector(`[data-mode="${key}"]`)
                    setNewBtn(buttons, actButton)
                    return
                }
            }

            const actButton = querySelector(`[data-mode="${curAutoMode}"]`)
            setNewBtn(buttons, actButton)
        })
    })
}

init()
