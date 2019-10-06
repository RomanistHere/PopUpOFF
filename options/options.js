import { 
	storageSet,
	storageGet,
	querySelector,
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
