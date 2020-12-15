import {
	storageSet,
	storageGet,
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
const tutorialBtn = querySelector(".tutorial")

storageGet("tutorial", (res) => {
	if (res.tutorial) {
		addClass(tutorialBtn, 'options__btn-active')
		state = { ...state, tutorial: true }
	} else {
		removeClass(tutorialBtn, 'options__btn-active')
		state = { ...state, tutorial: false }
	}
})

tutorialBtn.addEventListener('click', function(e) {
	e.preventDefault()
	if (!state.tutorial) {
		storageSet({ "tutorial": true })
		removeClass(tutorialBtn, 'options__btn-active')
		state = { ...state, tutorial: true }
	} else {
		storageSet({ "tutorial": false })
		addClass(tutorialBtn, 'options__btn-active')
		state = { ...state, tutorial: false }
	}
})

// stats //
const statsBtn = querySelector(".stats")

storageGet("statsEnabled", (res) => {
	if (res.statsEnabled) {
		addClass(statsBtn, 'options__btn-active')
		state = { ...state, stats: true }
	} else {
		removeClass(statsBtn, 'options__btn-active')
		state = { ...state, stats: false }
	}
})

statsBtn.addEventListener('click', function(e) {
	e.preventDefault()
	if (!state.stats) {
		storageSet({ "statsEnabled": true })
		removeClass(statsBtn, 'options__btn-active')
		state = { ...state, stats: true }
	} else {
		storageSet({ "statsEnabled": false })
		addClass(statsBtn, 'options__btn-active')
		state = { ...state, stats: false }
	}
})

// keyboard //
const slider = querySelector('.shortcut .slider__input')
const sliderTextLeft = querySelector('.shortcut .slider__left')
const sliderTextRight = querySelector('.shortcut .slider__right')
const sliderTextCenterLeft = querySelector('.shortcut .slider__center-left')
const sliderTextCenterRight = querySelector('.shortcut .slider__center-right')
const sliderTextArr = querySelectorAll('.shortcut .slider__text')

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

slider.oninput = (e) => {
	const val = e.target.value

	sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
	addClass(sliderSetUp[val][1], 'slider__text-active')

	storageSet({ "shortCutMode": sliderSetUp[val][0] })

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

storageGet("shortCutMode", res => {
	const { shortCutMode } = res
	if (shortCutMode === null) {
		slider.value = 3
		addClass(sliderTextCenterRight, 'slider__text-active')
	} else {
		addClass(slider, 'slider__input-active')
    	sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    	slider.value = values[shortCutMode][0]
    	addClass(values[shortCutMode][1], 'slider__text-active')
	}
})

// autmode //
const sliderAuto = querySelector('.automode .slider__input')
const sliderTextLeftAuto = querySelector('.automode .slider__left')
const sliderTextRightAuto = querySelector('.automode .slider__right')
const sliderTextCenterAuto = querySelector('.automode .slider__center')
const sliderTextArrAuto = querySelectorAll('.automode .slider__text')

sliderTextArrAuto.forEach(item => item.addEventListener('click', (e) => {
	sliderAuto.value = e.target.dataset.value
	sliderAuto.dispatchEvent(new Event('input'))
}))

const sliderAutoSetUp = {
	1: ['easyModeActive', sliderTextLeftAuto],
	2: ['whitelist', sliderTextCenterAuto],
	3: ['hardModeActive', sliderTextRightAuto],
}

sliderAuto.oninput = (e) => {
	const val = e.target.value

	sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))
	addClass(sliderAutoSetUp[val][1], 'slider__text-active')

	storageSet({ "curAutoMode": sliderAutoSetUp[val][0] })

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

storageGet("curAutoMode", res => {
	const { curAutoMode } = res

	sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))
	sliderAuto.value = valuesAuto[curAutoMode][0]
	addClass(valuesAuto[curAutoMode][1], 'slider__text-active')

	if (res.curAutoMode !== 'whitelist') {
		addClass(sliderAuto, 'slider__input-active')
	}
})

// aggression //
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

sliderAggr.oninput = (e) => {
	const val = e.target.value

	sliderTextArrAggr.forEach(item => removeClass(item, 'slider__text-active'))
	addClass(sliderAggrSetUp[val][1], 'slider__text-active')

	storageSet({ "autoModeAggr": sliderAggrSetUp[val][0] })
	addClass(sliderAggr, 'slider__input-active')
}

const valuesAggr = {
	'typeI': [1, sliderTextLeftAggr],
	// 'typeII': [2, sliderTextCenterAggr],
	'typeIII': [2, sliderTextRightAggr]
}

// resetting //
storageGet("autoModeAggr", res => {
	const { autoModeAggr } = res

	sliderAggr.value = valuesAggr[autoModeAggr][0]
	addClass(valuesAggr[autoModeAggr][1], 'slider__text-active')
	addClass(sliderAggr, 'slider__input-active')
})

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

const resetStats = e => {
	e.preventDefault()
	storageSet({
		stats: {
			cleanedArea: 0,
			numbOfItems: 0,
			restored: 0
		}
	})
	window.location.reload()
}

const resetSettings = e => {
	e.preventDefault()
	storageSet({
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

const resetAll = e => {
	e.preventDefault()
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
		restoreContActive: [...defPreventContArr],
		curAutoMode: 'whitelist',
		shortCutMode: null,
		websites: {},
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
