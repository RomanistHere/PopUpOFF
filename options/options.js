'use strict';

let supervisionToggle = document.getElementById("supervisionToggle")

chrome.storage.sync.get("supervision", function(res) {
	if (res.supervision) {
		supervisionToggle.checked = true
	} else {
		document.querySelector('.supervisionText').textContent = 'ON'
		supervisionToggle.checked = false
	}
})

supervisionToggle.onchange = function(element) {
	if (supervisionToggle.checked) {
		chrome.storage.sync.set({"supervision": true})
		document.querySelector('.supervisionText').textContent = 'OFF'
	} else {
		chrome.storage.sync.set({"supervision": false})
		document.querySelector('.supervisionText').textContent = 'ON'
	}
}

let tutorialToggle = document.getElementById("tutorialToggle")

chrome.storage.sync.get("tutorial", function(res) {
	if (res.tutorial) {
		tutorialToggle.checked = true
	} else {
		tutorialToggle.checked = false
	}
})

tutorialToggle.onchange = function(element) {
	if (tutorialToggle.checked) {
		chrome.storage.sync.set({"tutorial": true})
	} else {
		chrome.storage.sync.set({"tutorial": false})
	}
}
