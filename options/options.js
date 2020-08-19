import {
	storageSet,
	storageGet,
	querySelector,
	addClass,
	removeClass
} from '../constants/functions.js'

const supervisionToggle = querySelector("#supervisionToggle")

storageGet("supervision", (res) => {
	if (res.supervision) {
		supervisionToggle.checked = true
		addClass(querySelector('.desc-supervision'), 'desc-active')
	} else {
		supervisionToggle.checked = false
	}
})

supervisionToggle.onchange = (element) => {
	if (supervisionToggle.checked) {
		storageSet({ "supervision": true })
		addClass(querySelector('.desc-supervision'), 'desc-active')
	} else {
		storageSet({ "supervision": false })
		removeClass(querySelector('.desc-supervision'), 'desc-active')
	}
}

const tutorialToggle = querySelector("#tutorialToggle")

storageGet("tutorial", (res) => {
	if (res.tutorial) {
		addClass(querySelector('.desc-tutorial'), 'desc-active')
		tutorialToggle.checked = true
	} else {
		tutorialToggle.checked = false
	}
})

tutorialToggle.onchange = (element) => {
	if (tutorialToggle.checked) {
		storageSet({ "tutorial": true })
		addClass(querySelector('.desc-tutorial'), 'desc-active')
	} else {
		storageSet({ "tutorial": false })
		removeClass(querySelector('.desc-tutorial'), 'desc-active')
	}
}

const slider = querySelector('.slider__input')
const sliderTextLeft = querySelector('.slider__left')
const sliderTextRight = querySelector('.slider__right')
const sliderTextCenter = querySelector('.slider__center')
const sliderTextArr = document.querySelectorAll('.slider__text')

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

    storageSet({ "shortCutMode": false })
  } else {
    addClass(slider, 'slider__input-active')
    sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    if (e.target.value == 1) {
    	addClass(sliderTextLeft, 'slider__text-active')
    	storageSet({ "shortCutMode": "thisWebsiteWorkEasy" })
    } else {
    	addClass(sliderTextRight, 'slider__text-active')
    	storageSet({ "shortCutMode": "thisWebsiteWork" })
    }
  }
}

storageGet("shortCutMode", (res) => {
	if (!res.shortCutMode) {
		slider.value = 2
	} else {
		addClass(slider, 'slider__input-active')
    	sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))

    	slider.value = (res.shortCutMode == 'thisWebsiteWorkEasy') ? 1 : 3
    	addClass((res.shortCutMode == 'thisWebsiteWorkEasy') ? sliderTextLeft : sliderTextRight, 'slider__text-active')
	}
})
