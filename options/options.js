import {
	getStorageData,
	setStorageData,
	querySelector,
	querySelectorAll,
	addClass,
	removeClass
} from '../constants/functions.js'

import { defPreventContArr } from '../constants/data.js'

let state = {
	tutorial: false,
	stats: true,
}

// button checkmark -> cross animation
querySelectorAll('.options__btn').forEach(btn => {
	btn.addEventListener('click', function(e) {
		e.preventDefault()
		// cross/checkmark animation
		this.classList.add('options__btn-activate')
		setTimeout(() => {
			this.classList.toggle('options__btn-active')
		}, 300)
		setTimeout(() => {
			this.classList.remove('options__btn-activate')
		}, 310)
	})
})

// tutorial //
const initTutorial = async () => {
	const tutorialBtn = querySelector(".tutorial")
	const { tutorial } = await getStorageData('tutorial')

	if (tutorial) {
		addClass(tutorialBtn, 'options__btn-active')
		state = { ...state, tutorial: true }
	} else {
		removeClass(tutorialBtn, 'options__btn-active')
		state = { ...state, tutorial: false }
	}

	tutorialBtn.addEventListener('click', async (e) => {
		e.preventDefault()
		if (!state.tutorial) {
			await setStorageData({ "tutorial": true })
			removeClass(tutorialBtn, 'options__btn-active')
			state = { ...state, tutorial: true }
		} else {
			await setStorageData({ "tutorial": false })
			addClass(tutorialBtn, 'options__btn-active')
			state = { ...state, tutorial: false }
		}
	})
}

// stats //
const initStats = async () => {
	const statsBtn = querySelector(".stats")
	const { statsEnabled } = await getStorageData('statsEnabled')

	if (statsEnabled) {
		addClass(statsBtn, 'options__btn-active')
		state = { ...state, stats: true }
	} else {
		removeClass(statsBtn, 'options__btn-active')
		state = { ...state, stats: false }
	}

	statsBtn.addEventListener('click', async (e) => {
		e.preventDefault()
		if (!state.stats) {
			await setStorageData({ "statsEnabled": true })
			removeClass(statsBtn, 'options__btn-active')
			state = { ...state, stats: true }
		} else {
			await setStorageData({ "statsEnabled": false })
			addClass(statsBtn, 'options__btn-active')
			state = { ...state, stats: false }
		}
	})
}

// keyboard shortcut //
const initKeyboard = async () => {
	const slider = querySelector('.shortcut .slider__input')
	const sliderTextLeft = querySelector('.shortcut .slider__left')
	const sliderTextRight = querySelector('.shortcut .slider__right')
	const sliderTextCenterLeft = querySelector('.shortcut .slider__center-left')
	const sliderTextCenterRight = querySelector('.shortcut .slider__center-right')
	const sliderTextArr = querySelectorAll('.shortcut .slider__text')
	const { shortCutMode } = await getStorageData('shortCutMode')

	sliderTextArr.forEach(item => item.addEventListener('click', (e) => {
		slider.value = e.target.dataset.value
		slider.dispatchEvent(new Event('input'))
	}))

	const sliderSetUp = {
		1: ['easyModeActive', sliderTextLeft],
		2: ['whitelist', sliderTextCenterLeft],
		3: [null, sliderTextCenterRight],
		4: ['hardModeActive', sliderTextRight],
	}

	slider.oninput = async (e) => {
		const val = e.target.value

		sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
		addClass(sliderSetUp[val][1], 'slider__text-active')

		await setStorageData({ "shortCutMode": sliderSetUp[val][0] })

		if (val == 3) {
			removeClass(slider, 'slider__input-active')
		} else {
			addClass(slider, 'slider__input-active')
		}
	}

	const values = {
		'easyModeActive': [1, sliderTextLeft],
		'whitelist': [2, sliderTextCenterLeft],
		'hardModeActive': [4, sliderTextRight]
	}

	if (shortCutMode === null) {
		slider.value = 3
		addClass(sliderTextCenterRight, 'slider__text-active')
	} else {
		addClass(slider, 'slider__input-active')
    	sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    	slider.value = values[shortCutMode][0]
    	addClass(values[shortCutMode][1], 'slider__text-active')
	}
}

// autmode //
const initAutoMode = async () => {
	const sliderAuto = querySelector('.automode .slider__input')
	const sliderTextLeftAuto = querySelector('.automode .slider__left')
	const sliderTextRightAuto = querySelector('.automode .slider__right')
	const sliderTextCenterAuto = querySelector('.automode .slider__center')
	const sliderTextArrAuto = querySelectorAll('.automode .slider__text')
	const { curAutoMode } = await getStorageData('curAutoMode')

	sliderTextArrAuto.forEach(item => item.addEventListener('click', (e) => {
		sliderAuto.value = e.target.dataset.value
		sliderAuto.dispatchEvent(new Event('input'))
	}))

	const sliderAutoSetUp = {
		1: ['easyModeActive', sliderTextLeftAuto],
		2: ['whitelist', sliderTextCenterAuto],
		3: ['hardModeActive', sliderTextRightAuto],
	}

	sliderAuto.oninput = async (e) => {
		const val = e.target.value

		sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))
		addClass(sliderAutoSetUp[val][1], 'slider__text-active')

		await setStorageData({ "curAutoMode": sliderAutoSetUp[val][0] })

		if (val == 2) {
			removeClass(sliderAuto, 'slider__input-active')
		} else {
			addClass(sliderAuto, 'slider__input-active')
		}
	}

	const valuesAuto = {
		'easyModeActive': [1, sliderTextLeftAuto],
		'whitelist': [2, sliderTextCenterAuto],
		'hardModeActive': [3, sliderTextRightAuto]
	}

	sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))
	sliderAuto.value = valuesAuto[curAutoMode][0]
	addClass(valuesAuto[curAutoMode][1], 'slider__text-active')

	if (curAutoMode !== 'whitelist') {
		addClass(sliderAuto, 'slider__input-active')
	}
}

// aggression and resetting //
const initAggrAndRes = async () => {
	const sliderAggr = querySelector('.aggression .slider__input')
	const sliderTextLeftAggr = querySelector('.aggression .slider__left')
	const sliderTextRightAggr = querySelector('.aggression .slider__right')
	// const sliderTextCenterAggr = querySelector('.aggression .slider__center')
	const sliderTextArrAggr = querySelectorAll('.aggression .slider__text')

	sliderTextArrAggr.forEach(item => item.addEventListener('click', (e) => {
		sliderAggr.value = e.target.dataset.value
		sliderAggr.dispatchEvent(new Event('input'))
	}))

	const sliderAggrSetUp = {
		1: ['typeI', sliderTextLeftAggr],
		// 2: ['typeII', sliderTextCenterAggr],
		2: ['typeIII', sliderTextRightAggr],
	}

	sliderAggr.oninput = async (e) => {
		const val = e.target.value

		sliderTextArrAggr.forEach(item => removeClass(item, 'slider__text-active'))
		addClass(sliderAggrSetUp[val][1], 'slider__text-active')

		await setStorageData({ "autoModeAggr": sliderAggrSetUp[val][0] })
		addClass(sliderAggr, 'slider__input-active')
	}

	const valuesAggr = {
		'typeI': [1, sliderTextLeftAggr],
		// 'typeII': [2, sliderTextCenterAggr],
		'typeIII': [2, sliderTextRightAggr]
	}

	// resetting //
	const { autoModeAggr } = await getStorageData('autoModeAggr')
	sliderAggr.value = valuesAggr[autoModeAggr][0]
	addClass(valuesAggr[autoModeAggr][1], 'slider__text-active')
	addClass(sliderAggr, 'slider__input-active')

	const resetButtons = querySelectorAll('.options__button')
	resetButtons.forEach(item => item.addEventListener('click', (e) => {
		e.preventDefault()
		const label = e.currentTarget.getAttribute('data-label')

		firePopUp(label)
	}))

	const popup = querySelector('.popup')
	const popupCloseBtn = querySelector('.notDelete')
	const popupDeleteBtn = querySelector('.delete')

	popupCloseBtn.addEventListener('click', e => {
		e.preventDefault()

		popupDeleteBtn.removeEventListener('click', resetStats)
		popupDeleteBtn.removeEventListener('click', resetSettings)
		popupDeleteBtn.removeEventListener('click', resetAll)

		closePopUp()
	})

	const resetStats = async (e) => {
		e.preventDefault()
		await setStorageData({
			stats: {
				cleanedArea: 0,
				numbOfItems: 0,
				restored: 0
			}
		})
		window.location.reload()
	}

	const resetSettings = async (e) => {
		e.preventDefault()
		await setStorageData({
			tutorial: true,
			update: false,
			statsEnabled: true,
			backupData: {},
			curAutoMode: 'whitelist',
			shortCutMode: null,
			autoModeAggr: 'typeI',
			preset: 'presetManual',
		})
		window.location.reload()
	}

	const resetAll = async (e) => {
		e.preventDefault()
		await setStorageData({
			tutorial: true,
			update: false,
			stats: {
				cleanedArea: 0,
				numbOfItems: 0,
				restored: 0
			},
			statsEnabled: true,
			backupData: {},
			restoreContActive: [...defPreventContArr],
			curAutoMode: 'whitelist',
			shortCutMode: null,
			websites1: {},
			websites2: {},
			websites3: {},
			autoModeAggr: 'typeI',
			preset: 'presetManual',
		})
		window.location.reload()
	}

	const closePopUp = () =>
		removeClass(popup, 'popup-show')

	const firePopUp = label => {
		addClass(popup, 'popup-show')

		if (label === 'stats')
			popupDeleteBtn.addEventListener('click', resetStats)
		else if (label === 'settings')
			popupDeleteBtn.addEventListener('click', resetSettings)
		else if (label === 'all')
			popupDeleteBtn.addEventListener('click', resetAll)
	}
}

initTutorial()
initStats()
initKeyboard()
initAutoMode()
initAggrAndRes()
