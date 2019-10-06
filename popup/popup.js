import { ARR_OF_FORB_SITES } from '../constants/data.js'
import { 
	querySelector,
	isChecked,
	addClass,
	removeClass,
	storageSet,
	storageGet,
	executeScriptHere,
	getPureURL,
} from '../constants/functions.js'

let IS_SUPERVISION_ACTIVE

const toggleThisWebSiteInp = querySelector('#toggleThisWebSiteInp')
const toggleEasyInpThisWebSite = querySelector('#toggleEasyInpThisWebSite')

const initTutorial = () => {
	const $tutorialClass = querySelector('.tutorial')
	const $tutorialNextLinkClass = querySelector('.tutorial__next')

	const passTutorial = () => {
		addClass($tutorialClass, 'tutorial-hid')
		querySelector('.insturctions').textContent="Instructions"
		setTimeout(() => {
			addClass($tutorialClass, 'tutorial-non')
		}, 1000)
		storageSet({"tutorial": false})
	}

	querySelector('.insturctions').textContent="Tutorial"
	removeClass($tutorialClass, 'tutorial-non')

	querySelector('.tutorial__agree').onclick = () => {
		addClass($tutorialClass, 'tutorial-transp')
		addClass($tutorialClass, 'tutorial-step_1')
	    return false
	}
	querySelector('.tutorial__skip').onclick = () => {
	    passTutorial()
	    _gaq.push(['_trackEvent', 'tutorial', 'skip'])
	    return false
	}
	querySelector('.tutorial_link-finish').onclick = () => {
	    passTutorial()
	    _gaq.push(['_trackEvent', 'tutorial', 'pass'])
	    return false
	}

    // waiting for refactor
	$tutorialNextLinkClass.onclick = () => {
	  	addClass($tutorialClass, 'tutorial-step_2')

	  	$tutorialNextLinkClass.onclick = () => {
	  		addClass($tutorialClass, 'tutorial-step_3')

	  		$tutorialNextLinkClass.onclick = () => {
	  			addClass($tutorialClass, 'tutorial-step_4')

	  			$tutorialNextLinkClass.onclick = () => {
	  				removeClass($tutorialClass, 'tutorial-transp')
	  				addClass($tutorialClass, 'tutorial-finish')
	  				return false
	  			}

	  			return false
	  		}

	  		return false
	  	}

	  	return false
	}

	querySelector('.tutorial__contact').onclick = () => {
		const emailUrl = 'mailto:romanisthere@gmail.com'
	    chrome.tabs.update({ url: emailUrl })
	    return false
	}
	_gaq.push(['_trackEvent', 'tutorial', 'init'])
}

const showMessage = (className) => {
	addClass(querySelector(className), 'message-visible')
	if (className == '.message_forb') {
		querySelector('.message_forb__link').onclick = () => {
		    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		        chrome.runtime.openOptionsPage()
		        removeClass(querySelector(className), 'message-visible')
		    })
			_gaq.push(['_trackEvent', 'forbid_link', 'clicked'])
		}
	} else {
		querySelector('.message_reload__link').onclick = () => {
		    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
		        removeClass(querySelector(className), 'message-visible')
		    })
		}
	}		
}

const initToggler = (chInput, otherInput, curMode, otherMode, selector1, selector2, easy) => {
	chInput.onchange = (element) => {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			// grab pure url
		    const newUrl = getPureURL(tabs[0])
			// check if we're not available to use mode here
			if (IS_SUPERVISION_ACTIVE && ARR_OF_FORB_SITES.includes(newUrl)) {
				chInput.checked = false
				showMessage('.message_forb')
				_gaq.push(['_trackEvent', 'forb_site', newUrl])
			} else {
				storageGet(curMode, (res) => {
					// arr of urls where mode is activated now
					const curArrOfSites = res[curMode]
					// if we toggled on
					if (isChecked(chInput)) {
						// if paired mode active
						if (isChecked(toggleThisWebSiteInp)) {
					        if (easy) executeScriptHere('restoreEasy') 
							// set up back
							storageGet(otherMode, (res) => {
								const curEasyArr = res[otherMode]
								const newEasyArr = curEasyArr.filter(e => e !== newUrl)
								storageSet({[otherMode]: newEasyArr})
							})
							// visual
							otherInput.checked = false
							querySelector(selector1).textContent="on"
						}
						// execute methods
						executeScriptHere(easy ? 'removeEasy' : 'removeHard')
						executeScriptHere(easy ? 'watchDOMEasy' : 'watchDOM')
						// set up back
						const newArrOfSites = [...curArrOfSites, newUrl]
				        storageSet({[curMode]: newArrOfSites})
						// visual
						querySelector(selector2).textContent="off"
						_gaq.push(['_trackEvent', chInput, 'on'])
					} else {
						if (!isChecked(toggleThisPageInp)) {
					        executeScriptHere('restore')
						}
						// set up back
						const newArrOfSites = curArrOfSites.filter(e => e !== newUrl)
						storageSet({[curMode]: newArrOfSites})
						// visual
						querySelector(selector2).textContent="on"
						_gaq.push(['_trackEvent', chInput, 'off'])
					}
				})
			}
		})
	}
}

// hard mode this site
initToggler(
	toggleThisWebSiteInp,
	toggleEasyInpThisWebSite,
	'thisWebsiteWork', 
	'thisWebsiteWorkEasy',
	'#textOnOffEasyModeThisWEbsite',
	'#textOnOffSite',
	false
)

// easy mode this site
initToggler(
	toggleEasyInpThisWebSite,
	toggleThisWebSiteInp,
	'thisWebsiteWorkEasy', 
	'thisWebsiteWork',
	'#textOnOffSite',
	'#textOnOffEasyModeThisWEbsite',
	true
)

// I JUST WANT TO READ
const toggleThisPageInp = querySelector('#toggleThisPageInp')

toggleThisPageInp.onchange = (element) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
	    const newUrl = getPureURL(tabs[0])
		if (IS_SUPERVISION_ACTIVE && ARR_OF_FORB_SITES.includes(newUrl)) {
			toggleThisPageInp.checked = false
			showMessage('.message_forb')
			_gaq.push(['_trackEvent', 'forb_site', newUrl])
		} else {
			if (isChecked(toggleThisPageInp)) {
		        executeScriptHere('removeAll')
		        executeScriptHere('watchDOM')
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
			    if (!isChecked(toggleThisWebSiteInp)) {
				  	executeScriptHere('restoreEasy')
			    }
			    if (!isChecked(toggleThisWebSiteInp) &&
			    	!isChecked(toggleEasyInpThisWebSite)) {
			    	executeScriptHere('restore')
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
const initState = () => {
	storageGet("tutorial", (res) => {
		// if tutorial haven't passed run it
		if (res.tutorial) initTutorial()
	})

	chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		let isFirstModeAct = false
	    const newUrl = getPureURL(tabs[0])

		storageGet("supervision", (res) => {
			if (res.supervision) {
				// variable to check if site forbidden on click
				IS_SUPERVISION_ACTIVE = true
				if (ARR_OF_FORB_SITES.includes(newUrl)) {
					// set frozen state(no hovers) on popup if it opened at forbidden site
					addClass(querySelector('.PopUpOFF'), 'PopUpOFF-forb_site')
				}
			} else IS_SUPERVISION_ACTIVE = false
		})
		// hard mode this website input state
		storageGet("thisWebsiteWork", (res) => {		
			const blockedSitesArr = res.thisWebsiteWork

			if (blockedSitesArr.includes(newUrl)) {
				querySelector("#toggleThisWebSiteInp").checked = true
				querySelector('#textOnOffSite').textContent="off"
				isFirstModeAct = true
			} 
		})
		// easy mode this website input state
		storageGet("thisWebsiteWorkEasy", (res) => {
			const blockedSitesArr = res.thisWebsiteWorkEasy

			if (blockedSitesArr.includes(newUrl) && !isFirstModeAct) {
				querySelector("#toggleEasyInpThisWebSite").checked = true
				querySelector('#textOnOffEasyModeThisWEbsite').textContent="off"
			} 
		})
		// I JUST WANT TO READ input state
		chrome.tabs.sendMessage(
	        tabs[0].id,
	        {method: "getStatusThisPage"},
	        (response) => {
	        	if (response) {
			  		querySelector("#toggleThisPageInp").checked = true
			  	}
	        }
	    )			
    })
}

initState()


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

document.getElementsByClassName('insturctions')[0].addEventListener('click', () => {
	_gaq.push(['_trackEvent', 'instructions', 'clicked'])
})
