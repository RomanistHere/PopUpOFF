import {
	storageSet,
	storageGet,
	querySelector,
	querySelectorAll,
	addClass,
	removeClass
} from '../constants/functions.js'

let state = {
	tutorial: false,
	stats: true,
}

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
const sliderTextCenter = querySelector('.shortcut .slider__center')
const sliderTextArr = querySelectorAll('.shortcut .slider__text')

sliderTextArr.forEach(item => item.addEventListener('click', (e) => {
	slider.value = e.target.dataset.value
	slider.dispatchEvent(new Event('input'))
}))

slider.oninput = (e) => {
  if(e.target.value == 2) {
  	// vizual
    removeClass(slider, 'slider__input-active')
    addClass(sliderTextCenter, 'slider__text-active')
    sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    storageSet({ "shortCutMode": "whitelist" })
  } else {
    addClass(slider, 'slider__input-active')
    sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    if (e.target.value == 1) {
    	addClass(sliderTextLeft, 'slider__text-active')
    	storageSet({ "shortCutMode": "easyModeActive" })
    } else {
    	addClass(sliderTextRight, 'slider__text-active')
    	storageSet({ "shortCutMode": "hardModeActive" })
    }
  }
}

storageGet("shortCutMode", res => {
	if (res.shortCutMode === 'whitelist') {
		slider.value = 2
	} else {
		addClass(slider, 'slider__input-active')
    	sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    	slider.value = (res.shortCutMode === 'easyModeActive') ? 1 : 3
    	addClass((res.shortCutMode === 'easyModeActive') ? sliderTextLeft : sliderTextRight, 'slider__text-active')
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

sliderAuto.oninput = (e) => {
  if(e.target.value == 2) {
  	// vizual
    removeClass(sliderAuto, 'slider__input-active')
    addClass(sliderTextCenterAuto, 'slider__text-active')
    sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))

    storageSet({ "curAutoMode": "whitelist" })
  } else {
    addClass(sliderAuto, 'slider__input-active')
    sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))

    if (e.target.value == 1) {
    	addClass(sliderTextLeftAuto, 'slider__text-active')
    	storageSet({ "curAutoMode": "easyModeActive" })
    } else {
    	addClass(sliderTextRightAuto, 'slider__text-active')
    	storageSet({ "curAutoMode": "hardModeActive" })
    }
  }
}

storageGet("curAutoMode", res => {
	if (res.curAutoMode === 'whitelist') {
		sliderAuto.value = 2
	} else {
		addClass(sliderAuto, 'slider__input-active')
    	sliderTextArrAuto.forEach(item => removeClass(item, 'slider__text-active'))

    	sliderAuto.value = (res.curAutoMode === 'easyModeActive') ? 1 : 3
    	addClass((res.curAutoMode === 'easyModeActive') ? sliderTextLeftAuto : sliderTextRightAuto, 'slider__text-active')
	}
})
