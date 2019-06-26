'use strict';

// // hard mode everywhere
// let toggleEverywhereInp = document.getElementById('toggleEverywhereInp')

// toggleEverywhereInp.onchange = function(element) {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     	// if on
// 		if (toggleEverywhereInp.checked) {
// 			// if paired mode was on turn it off
// 	        if (toggleEasyInp.checked) {
// 	        	// visual part
// 	        	toggleEasyInp.checked = false
// 	        	document.getElementById('textOnOffEasyMode').textContent="on"
// 	        	// do magic
// 	        	chrome.tabs.executeScript(
// 		        	tabs[0].id,
// 		          	{file: 'restore.js'}
// 		        )
// 		        // set mode
// 	        	chrome.storage.sync.set({"autoWorkEasy": false})
// 	        }
// 	        // do magic
// 			chrome.tabs.executeScript(
// 	        	tabs[0].id,
// 	          	{file: 'removeHard.js'}
// 	        )
// 	    	chrome.tabs.executeScript(
// 	        	tabs[0].id,
// 	          	{file: 'watchDOM.js'}
// 	        )
// 	        // set mode 
// 	        chrome.storage.sync.set({"autoWork": true})
// 	        document.getElementById('textOnOff').textContent="off"	
// 	        // analysis
// 	        _gaq.push(['_trackEvent', 'toggleEverywhereInp', 'on'])
// 		} else {
// 			// do magic
// 			chrome.tabs.executeScript(
// 	        	tabs[0].id,
// 	          	{file: 'restore.js'}
// 	        )
// 	        // set mode
// 	        chrome.storage.sync.set({"autoWork": false})
//     		document.getElementById('textOnOff').textContent="on"
//     		// analysis
// 			_gaq.push(['_trackEvent', 'toggleEverywhereInp', 'off'])
// 		}
//     })
// }

// // easy mode everywhere
// let toggleEasyInp = document.getElementById('toggleEasyInp')

// toggleEasyInp.onchange = function(element) {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//     	// if on
// 		if (toggleEasyInp.checked) {
// 			// if paired mode was on turn it off
// 	        if (toggleEverywhereInp.checked) {
// 	        	// visual part
// 	        	toggleEverywhereInp.checked = false
// 	        	document.getElementById('textOnOff').textContent="on"
// 	        	// do magic
// 	        	chrome.tabs.executeScript(
// 		        	null,
// 		          	{file: 'restoreEasy.js'}
// 		        )
// 		        // set mode
// 	        	chrome.storage.sync.set({"autoWork": false})
// 	        }
// 	        // do magic
// 			chrome.tabs.executeScript(
// 	        	null,
// 	          	{file: 'removeEasy.js'}
// 	        )
// 	    	chrome.tabs.executeScript(
// 	        	null,
// 	          	{file: 'watchDOM.js'}
// 	        )
// 	        // set mode 
// 	        chrome.storage.sync.set({"autoWorkEasy": true})
// 	        document.getElementById('textOnOffEasyMode').textContent="off"	
// 	        // analysis
// 	        _gaq.push(['_trackEvent', 'toggleEasyInp', 'on'])
// 		} else {
// 			// do magic
// 			chrome.tabs.executeScript(
// 	        	null,
// 	          	{file: 'restore.js'}
// 	        )
// 	        // set mode
// 	        chrome.storage.sync.set({"autoWorkEasy": false})
//     		document.getElementById('textOnOffEasyMode').textContent="on"
//     		// analysis
// 			_gaq.push(['_trackEvent', 'toggleEasyInp', 'off'])
// 		}
//     })
// }

const ARR_OF_FORB_SITES = [
	'music.youtube.com',
	'www.youtube.com',
	'www.linkedin.com',
	'twitter.com',
	'www.facebook.com',
	'www.google.com',
	'www.reddit.com',
	'www.instagram.com',
	'www.baidu.com',
	'www.amazon.com',
	'vk.com',
	'www.pinterest.com',
	'trello.com',
	'calendar.google.com',
]
var IS_SUPERVISION_ACTIVE

// hard mode this site
let toggleThisWebSiteInp = document.getElementById('toggleThisWebSiteInp')

toggleThisWebSiteInp.onchange = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		let url = tabs[0].url
	    let newUrl = tabs[0].url.substring(
		    url.lastIndexOf("//") + 2, 
		    url.indexOf("/", 8)
		)
		if (IS_SUPERVISION_ACTIVE && ARR_OF_FORB_SITES.includes(newUrl)) {
			toggleThisWebSiteInp.checked = false
			showMessage('.message_forb')
			_gaq.push(['_trackEvent', 'forb_site', newUrl])
		} else {
			chrome.storage.sync.get("thisWebsiteWork", function(res) {		
				let arrOfSites = res.thisWebsiteWork

				if (toggleThisWebSiteInp.checked) {
					// if paired mode active
					if (toggleEasyInpThisWebSite.checked) {
						// visual
						toggleEasyInpThisWebSite.checked = false
						document.getElementById('textOnOffEasyModeThisWEbsite').textContent="on"
				        // setting up
				        chrome.storage.sync.get("thisWebsiteWorkEasy", function(res) {
				        	arrOfSites = res.thisWebsiteWorkEasy
							arrOfSites = arrOfSites.filter(e => e !== newUrl)
							chrome.storage.sync.set({"thisWebsiteWorkEasy": arrOfSites})
						})
						chrome.tabs.executeScript(
				        	null,
				          	{file: 'removeHard.js'}
				        )
					}

					chrome.tabs.executeScript(
			        	null,
			          	{file: 'removeHard.js'}
			        )
			    	chrome.tabs.executeScript(
			        	null,
			          	{file: 'watchDOM.js'}
			        )
					// set up back
					arrOfSites.push(newUrl)
			        chrome.storage.sync.set({"thisWebsiteWork": arrOfSites})					
					// visual
					document.getElementById('textOnOffSite').textContent="off"
					_gaq.push(['_trackEvent', 'toggleThisWebSiteInp', 'on'])
				} else {
					if (!toggleThisPageInp.checked) {
						chrome.tabs.executeScript(
				        	null,
				          	{file: 'restore.js'}
				        )
					}					
					// set up back
					arrOfSites = arrOfSites.filter(e => e !== newUrl)
					chrome.storage.sync.set({"thisWebsiteWork": arrOfSites})
					// visual
					document.getElementById('textOnOffSite').textContent="on"
					_gaq.push(['_trackEvent', 'toggleThisWebSiteInp', 'off'])
				}
			})
		}			
	})
}

// easy mode this site
let toggleEasyInpThisWebSite = document.getElementById('toggleEasyInpThisWebSite')

toggleEasyInpThisWebSite.onchange = function(element) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		let url = tabs[0].url
	    let newUrl = tabs[0].url.substring(
		    url.lastIndexOf("//") + 2, 
		    url.indexOf("/", 8)
		)
		if (IS_SUPERVISION_ACTIVE && ARR_OF_FORB_SITES.includes(newUrl)) {
			toggleEasyInpThisWebSite.checked = false
			showMessage('.message_forb')
			_gaq.push(['_trackEvent', 'forb_site', newUrl])
		} else {
			chrome.storage.sync.get("thisWebsiteWorkEasy", function(res) {
			
				let arrOfSites = res.thisWebsiteWorkEasy

				if (toggleEasyInpThisWebSite.checked) {
					// if paired mode active
					if (toggleThisWebSiteInp.checked) {
						chrome.tabs.executeScript(
				        	null,
				          	{file: 'restoreEasy.js'}
				        )
						// set up back
						chrome.storage.sync.get("thisWebsiteWork", function(res) {
							arrOfSites = res.thisWebsiteWork
							arrOfSites = arrOfSites.filter(e => e !== newUrl)
							chrome.storage.sync.set({"thisWebsiteWork": arrOfSites})
						})
						// visual
						toggleThisWebSiteInp.checked = false
						document.getElementById('textOnOffSite').textContent="on"
					}

					chrome.tabs.executeScript(
			        	null,
			          	{file: 'removeEasy.js'}
			        )
			    	chrome.tabs.executeScript(
			        	null,
			          	{file: 'watchDOMEasy.js'}
			        )
					// set up back
					arrOfSites.push(newUrl)
			        chrome.storage.sync.set({"thisWebsiteWorkEasy": arrOfSites})					
					// visual
					document.getElementById('textOnOffEasyModeThisWEbsite').textContent="off"
					_gaq.push(['_trackEvent', 'toggleEasyInpThisWebSite', 'on'])
				} else {
					if (!toggleThisPageInp.checked) {
						chrome.tabs.executeScript(
				        	null,
				          	{file: 'restore.js'}
				        )
					}
					// set up back
					arrOfSites = arrOfSites.filter(e => e !== newUrl)
					chrome.storage.sync.set({"thisWebsiteWorkEasy": arrOfSites})
					// visual
					document.getElementById('textOnOffEasyModeThisWEbsite').textContent="on"
					_gaq.push(['_trackEvent', 'toggleEasyInpThisWebSite', 'off'])
				}
			})
		}
	})
}

// I JUST WANT TO READ
let toggleThisPageInp = document.getElementById('toggleThisPageInp')

toggleThisPageInp.onchange = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	let url = tabs[0].url
	    let newUrl = tabs[0].url.substring(
		    url.lastIndexOf("//") + 2, 
		    url.indexOf("/", 8)
		)
		if (IS_SUPERVISION_ACTIVE && ARR_OF_FORB_SITES.includes(newUrl)) {
			toggleThisPageInp.checked = false
			showMessage('.message_forb')
			_gaq.push(['_trackEvent', 'forb_site', newUrl])
		} else {
			if (toggleThisPageInp.checked) {
		    	chrome.tabs.executeScript(
			      	null,
			      	{file: 'removeAll.js'}
			  	)
			  	chrome.tabs.executeScript(
		        	null,
		          	{file: 'watchDOM.js'}
		        )
		        // sending message to content.js to store is input checked or not to show it when popup open
			    chrome.tabs.sendMessage(
			        tabs[0].id,
			        {
			        	method: "setStatusThisPage", 
			        	thisPageOn: true
			        }
			    )
			    _gaq.push(['_trackEvent', 'toggleThisPageInp', 'on'])
		    } else {
			    // if (!toggleEverywhereInp.checked &&
			    // 	!toggleThisWebSiteInp.checked) {
			    if (!toggleThisWebSiteInp.checked) {
			    	chrome.tabs.executeScript(
				      	null,
				      	{file: 'restoreEasy.js'}
				  	)
			    }
			    // if (!toggleEasyInp.checked &&
			    // 	!toggleEverywhereInp.checked &&
			    // 	!toggleThisWebSiteInp.checked &&
			    // 	!toggleEasyInpThisWebSite.checked) {
			    if (!toggleThisWebSiteInp.checked &&
			    	!toggleEasyInpThisWebSite.checked) {
			    	chrome.tabs.executeScript(
				      	null,
				      	{file: 'restore.js'}
				  	)
			    }
			    showMessage('.message_reload')
			    chrome.tabs.sendMessage(
			        tabs[0].id,
			        {
			        	method: "setStatusThisPage", 
			        	thisPageOn: false
			        }
			    )
			    _gaq.push(['_trackEvent', 'toggleThisPageInp', 'off'])
		    }
		}
    })
}

// inits input states for every popup opening
function initState() {
	// hard mode everywhere input state
	// chrome.storage.sync.get("autoWork", function(res) {
	// 	if (res.autoWork) {
	// 		document.getElementById("toggleEverywhereInp").checked = true
	// 		document.getElementById('textOnOff').textContent="off"
	// 	}
	// })

	// // easy mode everywhere input state
	// chrome.storage.sync.get("autoWorkEasy", function(res) {
	// 	if (res.autoWorkEasy) {
	// 		document.getElementById("toggleEasyInp").checked = true
	// 		document.getElementById('textOnOffEasyMode').textContent="off"
	// 	}
	// })

	chrome.storage.sync.get("supervision", function(res) {
		if (res.supervision) IS_SUPERVISION_ACTIVE = true
		else IS_SUPERVISION_ACTIVE = false
	})

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		let isFirstModeAct = false;
		let url = tabs[0].url
	    let newUrl = tabs[0].url.substring(
		    url.lastIndexOf("//") + 2, 
		    url.indexOf("/", 8)
		)
		// hard mode this website input state
		chrome.storage.sync.get("thisWebsiteWork", function(res) {		
			let blockedSitesArr = res.thisWebsiteWork

			if (blockedSitesArr.includes(newUrl)) {
				document.getElementById("toggleThisWebSiteInp").checked = true
				document.getElementById('textOnOffSite').textContent="off"
				isFirstModeAct = true;
			} 
		})
		// easy mode this website input state
		chrome.storage.sync.get("thisWebsiteWorkEasy", function(res) {
			let blockedSitesArr = res.thisWebsiteWorkEasy

			if (blockedSitesArr.includes(newUrl) && !isFirstModeAct) {
				document.getElementById("toggleEasyInpThisWebSite").checked = true
				document.getElementById('textOnOffEasyModeThisWEbsite').textContent="off"
			} 
		})
		// I JUST WANT TO READ input state
		chrome.tabs.sendMessage(
	        tabs[0].id,
	        {method: "getStatusThisPage"},
	        function (response) {
	        	console.log(response)
	        	if (response) {
			  		document.getElementById("toggleThisPageInp").checked = true
			  	}
	        }
	    )			
    })
}

initState()

// message with reload
function showMessage(className) {
	document.querySelector(className).classList.add('message-visible')
	if (className == '.message_forb') {
		document.querySelector('.message__link').onclick = function() {
		    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		        // chrome.tabs.create({url: 'chrome://extensions/?options=' + chrome.runtime.id})
		        chrome.runtime.openOptionsPage()
		        document.querySelector(className).classList.remove('message-visible')
		    })
		    document.getElementsByClassName('insturctions')[0].addEventListener('click', function(){
				_gaq.push(['_trackEvent', 'forbid_link', 'clicked'])
			})
		}
	} else {
		document.querySelector('.message_reload__link').onclick = function() {
		    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
		        document.querySelector(className).classList.remove('message-visible')
		    })
		}
	}		
}

function initTutorial() {
  document.querySelector('.tutorial__agree').onclick = function() {
    document.querySelector('.tutorial').classList.add('tutorial-transp')
    document.querySelector('.tutorial').classList.add('tutorial-step_1')

    // document.querySelectorAll('.tutorial__layout').forEach(el => el.classList.add('active'))
    return false
  }
  document.querySelector('.tutorial__skip').onclick = function() {
    document.querySelector('.tutorial').classList.add('tutorial-hid')
    // chrome.storage.sync.set({"tutorial": false})
    return false
  }
  document.querySelector('.tutorial_link-finish').onclick = function() {
    document.querySelector('.tutorial').classList.add('tutorial-hid')
    // chrome.storage.sync.set({"tutorial": false})
    return false
  }
  // sorry for this
  document.querySelector('.tutorial__next').onclick = function() {
    document.querySelector('.tutorial').classList.add('tutorial-step_2')

    document.querySelector('.tutorial__next').onclick = function() {
      document.querySelector('.tutorial').classList.add('tutorial-step_3')

      document.querySelector('.tutorial__next').onclick = function() {
        document.querySelector('.tutorial').classList.add('tutorial-step_4')

        document.querySelector('.tutorial__next').onclick = function() {
          document.querySelector('.tutorial').classList.remove('tutorial-transp')
          document.querySelector('.tutorial').classList.add('tutorial-finish')
          return false
        }

        return false
      }

      return false
    }

    return false
  }
}

initTutorial()


// ga
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-138501898-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();

document.getElementsByClassName('insturctions')[0].addEventListener('click', function(){
	_gaq.push(['_trackEvent', 'instructions', 'clicked'])
})
