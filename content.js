'use strict';

// local variable for state of current page (do not work after reload)
var	thisPageOn = false

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
	if (msg.method === "getStatusThisPage") {
		response(thisPageOn)
	}
	if (msg.method === "setStatusThisPage") {
		thisPageOn = msg.thisPageOn
	}
	return true
})
