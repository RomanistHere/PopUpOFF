import {
	storageSet,
	storageGet,
	querySelector,
	querySelectorAll,
	addClass,
	removeClass
} from '../constants/functions.js'

querySelectorAll('.options__btn').forEach(btn => {
	btn.addEventListener('click', function(e) {
		e.preventDefault()
		this.classList.add('options__btn-activate')
		setTimeout(() => {
			this.classList.toggle('options__btn-active')
		}, 300)
		setTimeout(() => {
			this.classList.remove('options__btn-activate')
		}, 310)
	})
})

// // supervision //
// const supervisionToggle = querySelector("#supervisionToggle")
//
// storageGet("supervision", (res) => {
// 	if (res.supervision) {
// 		supervisionToggle.checked = true
// 		addClass(querySelector('.desc-supervision'), 'desc-active')
// 	} else {
// 		supervisionToggle.checked = false
// 	}
// })
//
// supervisionToggle.onchange = (element) => {
// 	if (supervisionToggle.checked) {
// 		storageSet({ "supervision": true })
// 		addClass(querySelector('.desc-supervision'), 'desc-active')
// 	} else {
// 		storageSet({ "supervision": false })
// 		removeClass(querySelector('.desc-supervision'), 'desc-active')
// 	}
// }
//
// // tutorial //
// const tutorialToggle = querySelector("#tutorialToggle")
//
// storageGet("tutorial", (res) => {
// 	if (res.tutorial) {
// 		addClass(querySelector('.desc-tutorial'), 'desc-active')
// 		tutorialToggle.checked = true
// 	} else {
// 		tutorialToggle.checked = false
// 	}
// })
//
// tutorialToggle.onchange = (element) => {
// 	if (tutorialToggle.checked) {
// 		storageSet({ "tutorial": true })
// 		addClass(querySelector('.desc-tutorial'), 'desc-active')
// 	} else {
// 		storageSet({ "tutorial": false })
// 		removeClass(querySelector('.desc-tutorial'), 'desc-active')
// 	}
// }
//
// // stats //
// const statsToggle = querySelector("#statsToggle")
//
// storageGet("statsEnabled", (res) => {
// 	if (res.statsEnabled) {
// 		addClass(querySelector('.desc-stats'), 'desc-active')
// 		statsToggle.checked = true
// 	} else {
// 		statsToggle.checked = false
// 	}
// })
//
// statsToggle.onchange = (element) => {
// 	if (statsToggle.checked) {
// 		storageSet({ "statsEnabled": true })
// 		addClass(querySelector('.desc-stats'), 'desc-active')
// 	} else {
// 		storageSet({ "statsEnabled": false })
// 		removeClass(querySelector('.desc-stats'), 'desc-active')
// 	}
// }
//
// // prevent content //
// const prevContToggle = querySelector("#prevContToggle")
//
// storageGet("restoreCont", (res) => {
// 	if (res.restoreCont) {
// 		addClass(querySelector('.desc-prevCont'), 'desc-active')
// 		prevContToggle.checked = true
// 	} else {
// 		prevContToggle.checked = false
// 	}
// })
//
// prevContToggle.onchange = (element) => {
// 	if (prevContToggle.checked) {
// 		storageSet({ "restoreCont": true })
// 		addClass(querySelector('.desc-prevCont'), 'desc-active')
// 	} else {
// 		storageSet({ "restoreCont": false })
// 		removeClass(querySelector('.desc-prevCont'), 'desc-active')
// 	}
// }
//
// // slider //
// const slider = querySelector('.slider__input')
// const sliderTextLeft = querySelector('.slider__left')
// const sliderTextRight = querySelector('.slider__right')
// const sliderTextCenter = querySelector('.slider__center')
// const sliderTextArr = document.querySelectorAll('.slider__text')
//
// sliderTextArr.forEach(item => item.addEventListener('click', (e) => {
// 	slider.value = e.target.dataset.value
// 	slider.dispatchEvent(new Event('input'))
// }))
//
// slider.oninput = (e) => {
//   if(e.target.value == 2) {
//   	// vizual
//     removeClass(slider, 'slider__input-active')
//     addClass(sliderTextCenter, 'slider__text-active')
//     sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
//
//     storageSet({ "shortCutMode": false })
//   } else {
//     addClass(slider, 'slider__input-active')
//     sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
//
//     if (e.target.value == 1) {
//     	addClass(sliderTextLeft, 'slider__text-active')
//     	storageSet({ "shortCutMode": "thisWebsiteWorkEasy" })
//     } else {
//     	addClass(sliderTextRight, 'slider__text-active')
//     	storageSet({ "shortCutMode": "thisWebsiteWork" })
//     }
//   }
// }
//
// storageGet("shortCutMode", (res) => {
// 	if (!res.shortCutMode) {
// 		slider.value = 2
// 	} else {
// 		addClass(slider, 'slider__input-active')
//     	sliderTextArr.forEach(item => removeClass(item, 'slider__text-active'))
//
//     	slider.value = (res.shortCutMode == 'thisWebsiteWorkEasy') ? 1 : 3
//     	addClass((res.shortCutMode == 'thisWebsiteWorkEasy') ? sliderTextLeft : sliderTextRight, 'slider__text-active')
// 	}
// })
