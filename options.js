'use strict';

let supervisionToggle = document.getElementById("supervisionToggle");

chrome.storage.sync.get("supervision", function(res) {
	if (res.supervision) {
		supervisionToggle.checked = true
	} else {
		document.querySelector('.supervisionText').textContent = 'Enable'
		supervisionToggle.checked = false
	}
})

supervisionToggle.onchange = function(element) {
	if (supervisionToggle.checked) {
		chrome.storage.sync.set({"supervision": true})
		document.querySelector('.supervisionText').textContent = 'Disable'
	} else {
		chrome.storage.sync.set({"supervision": false})
		document.querySelector('.supervisionText').textContent = 'Enable'
	}
}
