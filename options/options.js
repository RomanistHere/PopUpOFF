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
	} else {
		querySelector('.supervisionText').textContent = 'ON'
		supervisionToggle.checked = false
	}
})

supervisionToggle.onchange = (element) => {
	if (supervisionToggle.checked) {
		storageSet({"supervision": true})
		querySelector('.supervisionText').textContent = 'OFF'
	} else {
		storageSet({"supervision": false})
		querySelector('.supervisionText').textContent = 'ON'
	}
}

const tutorialToggle = querySelector("#tutorialToggle")

storageGet("tutorial", (res) => {
	if (res.tutorial) {
		tutorialToggle.checked = true
	} else {
		tutorialToggle.checked = false
	}
})

tutorialToggle.onchange = (element) => {
	if (tutorialToggle.checked) {
		storageSet({"tutorial": true})
	} else {
		storageSet({"tutorial": false})
	}
}

const slider = querySelector('.slider__input')
const sliderTextLeft = querySelector('.slider__left')
const sliderTextRight = querySelector('.slider__right')
const sliderTextCenter = querySelector('.slider__center')
const sliderTextArr = document.querySelectorAll('.slider__text')

slider.oninput = (e) => {
  if(e.target.value == 2) {
    removeClass(slider, 'slider__input-active')
    sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
    addClass(sliderTextCenter, 'slider__text-active')
  } else {
    sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
    addClass(slider, 'slider__input-active')
    e.target.value == 1 ? 
      addClass(sliderTextLeft, 'slider__text-active') :
      addClass(sliderTextRight, 'slider__text-active')
  }
}