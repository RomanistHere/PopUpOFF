import { ARR_OF_FORB_SITES, emailUrl } from '../constants/data.js'
import {
	querySelector,
	isChecked,
	addClass,
	removeClass,
	storageSet,
	storageGet,
	executeScriptHere,
	getPureURL,
	setBadgeText,
	resetBadgeText,
	nFormatter,
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
	    return false
	}
	querySelector('.tutorial_link-finish').onclick = () => {
	    passTutorial()
	    return false
	}
	querySelector('.tutorial_to_options').onclick = () => {
		chrome.runtime.openOptionsPage()
		passTutorial()
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
}

const showMessage = (className) => {
	addClass(querySelector(className), 'message-visible')
	if (className == '.message_forb') {
		querySelector('.message_forb__link').onclick = () => {
	        chrome.runtime.openOptionsPage()
	        removeClass(querySelector(className), 'message-visible')
			return false
		}
	} else if (className == '.message_reload') {
		querySelector('.message_reload__link').onclick = () => {
		    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		        chrome.tabs.update(tabs[0].id, {url: tabs[0].url})
		        removeClass(querySelector(className), 'message-visible')
		    })
		    return false
		}
	} else if (className == '.message_upd') {

	}
}

const initToggler = (chInput, otherInput, curMode, otherMode, selector1, selector2, easy) => {
	chInput.onchange = (element) => {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			// grab pure url
		    const newUrl = getPureURL(tabs[0])
		    const tabID = tabs[0].id
			// check if we're not available to use mode here
			if (IS_SUPERVISION_ACTIVE && ARR_OF_FORB_SITES.includes(newUrl)) {
				chInput.checked = false
				showMessage('.message_forb')
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
							removeClass(querySelector(selector1), 'desc-active')
						}
						easy ? setBadgeText('E')(tabID) : setBadgeText('H')(tabID)
						// execute methods
						executeScriptHere(easy ? 'removeEasy' : 'removeHard')
						executeScriptHere('showAll')
						// set up back
						const newArrOfSites = [...curArrOfSites, newUrl]
				        storageSet({[curMode]: newArrOfSites})
						// visual
						addClass(querySelector(selector2), 'desc-active')
					} else {
						if (!isChecked(toggleThisPageInp)) {
					        executeScriptHere('restore')
					        resetBadgeText(tabID)
						}
						// set up back
						const newArrOfSites = curArrOfSites.filter(e => e !== newUrl)
						storageSet({[curMode]: newArrOfSites})
						// visual
						removeClass(querySelector(selector2), 'desc-active')
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
	'.desc-easy',
	'.desc-hard',
	false
)

// easy mode this site
initToggler(
	toggleEasyInpThisWebSite,
	toggleThisWebSiteInp,
	'thisWebsiteWorkEasy',
	'thisWebsiteWork',
	'.desc-hard',
	'.desc-easy',
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
		} else {
			if (isChecked(toggleThisPageInp)) {
		        executeScriptHere('removeAll')
		        executeScriptHere('showAll')
		        // sending message to content.js to store is input checked or not to show it when popup open
			    chrome.tabs.sendMessage(
			        tabs[0].id,
			        {
			        	method: "setStatusThisPage",
			        	thisPageOn: true
			        }
			    )
				addClass(querySelector('.desc-read'), 'desc-active')
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
				removeClass(querySelector('.desc-read'), 'desc-active')
		    }
		}
    })
}

const updStats = () => {
	storageGet(["stats"], res => {
		querySelector('.stats__elem').innerHTML = nFormatter(res.stats.numbOfItems, 1)
		querySelector('.stats__size').innerHTML = nFormatter(res.stats.cleanedArea, 1)
	})
}

// inits input states for every popup opening
const initState = () => {
	storageGet(["tutorial", "showUpdMess", "statsEnabled", "stats"], res => {
		// if tutorial haven't passed run it
		if (res.tutorial) initTutorial()
		// show stats
		if (res.statsEnabled) {
			addClass(querySelector('.stats'), 'stats-show')
			// update statistic
			querySelector('.stats__elem').innerHTML = nFormatter(res.stats.numbOfItems, 1)
			querySelector('.stats__size').innerHTML = nFormatter(res.stats.cleanedArea, 1)
			setInterval(updStats, 1000)
		}
	})

	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		let isFirstModeAct = false
	    const newUrl = getPureURL(tabs[0])

		storageGet("supervision", res => {
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
		storageGet("thisWebsiteWork", res => {
			const blockedSitesArr = res.thisWebsiteWork

			if (blockedSitesArr.includes(newUrl)) {
				querySelector("#toggleThisWebSiteInp").checked = true
				addClass(querySelector('.desc-hard'), 'desc-active')
				isFirstModeAct = true
			}
		})
		// easy mode this website input state
		storageGet("thisWebsiteWorkEasy", res => {
			const blockedSitesArr = res.thisWebsiteWorkEasy

			if (blockedSitesArr.includes(newUrl) && !isFirstModeAct) {
				querySelector("#toggleEasyInpThisWebSite").checked = true
				addClass(querySelector('.desc-easy'), 'desc-active')
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
