import {
	websites,
	preventContArr
} from '../constants/data.js'

import {
	querySelector,
    querySelectorAll,
	addClass,
	removeClass,
    getAttr,
	storageSet,
	storageGet,
	getPureURL,
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

    browser.tabs.query({ active: true, currentWindow: true }, tabs => {
        // check website object. Change/add property
        storageGet(['websites'], resp => {
            const { websites } = resp
            const pureUrl = getPureURL(tabs[0])

			const newWebsites = { ...websites, [pureUrl]: mode }

            storageSet({ websites: newWebsites })
        })

		// if whitelist just enabled and prevent content active -> remove prevent content (prevent content is not working in whitelist)
		if (mode === 'whitelist' && state.isRestContActive)
			state = { ...state, isRestContActive: false }

		state = { ...state, curMode: mode }
        // send msg to content script with new active mode
        browser.tabs.sendMessage(tabs[0].id, { activeMode: mode }, resp => {
            if (resp && resp.closePopup === true) {
				browser.tabs.update(tabs[0].id, { url: tabs[0].url })
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

// setup tutorial screen
const initTutorial = (updated = false) => {
	const tutorialWrap = querySelector('.tutorial')
	const tutorialRead = querySelector('.tutorial__read')
	const tutorialSkip = querySelector('.tutorial__skip')
	const tutorialSetup = querySelector('.tutorial__setup')
	if (updated === true)
		querySelector('.tutorial__head').textContent='Automode!'
	// open tutorial
 	removeClass(tutorialWrap, 'tutorial-non')

	// one-click setup
	tutorialSetup.addEventListener('click', e => {
		e.preventDefault()
		addClass(tutorialWrap, 'tutorial-setup')

		querySelectorAll('.setings__btn').forEach(elem => elem.addEventListener('click', function() {
			const preset = getAttr(this, 'data-preset')
			const curAutoMode = preset === 'presetManual' ? 'whitelist' : 'easyModeActive'
			const autoModeAggr = preset === 'presetManual' ? 'typeIII' : 'typeI'

			storageSet({
				curAutoMode: curAutoMode,
				autoModeAggr: autoModeAggr,
			})

			setTimeout(() => { removeClass(tutorialWrap, 'tutorial-setup') }, 300)
		}))
	})

	// open the link
	tutorialRead.addEventListener('click', () => {
		storageSet({
			tutorial: false,
			update: false
		})
		window.close()
	})

	// close tutorial
	tutorialSkip.addEventListener('click', e => {
		e.preventDefault()
		storageSet({
			tutorial: false,
			update: false
		})
		addClass(tutorialWrap, 'tutorial-hide')
		setTimeout(() => { addClass(tutorialWrap, 'tutorial-non') }, 500)
	})
}

// init popup state
const init = () => {
    browser.tabs.query({ active: true, currentWindow: true }, tabs => {
        storageGet(['update', 'tutorial', 'websites', 'curAutoMode', 'statsEnabled', 'stats', 'restoreContActive'], resp => {
			// setup tutorial
			if (resp.tutorial)
				initTutorial(resp.update)

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
            const pureUrl = getPureURL(tabs[0])
			state = { ...state, pureUrl: pureUrl }

			// check restore content array and set btn
			if (restoreContActive.includes(pureUrl)) {
				addClass(querySelector('.add_opt'), 'add_opt-active')
				state = { ...state, isRestContActive: true }
			}

			// if website is in one of arrays - set the proper mode
			let curModeName = curAutoMode

            if (pureUrl in websites) {
				curModeName = websites[pureUrl]
            }

			const actButton = querySelector(`[data-mode='${curModeName}']`)
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
		let newWebsites = {...websites}

		// add/remove site to restore cotntent array
		if (state.isRestContActive) {
			newArr = restoreContActive.filter(url => url !== state.pureUrl)
			removeClass(this, 'add_opt-active')
		} else {
			newArr = [...restoreContActive, state.pureUrl]
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
			browser.tabs.query({active: true, currentWindow: true}, tabs => {
		        browser.tabs.update(tabs[0].id, { url: tabs[0].url })
				window.close()
		    })
		}
	})
}, 500))
