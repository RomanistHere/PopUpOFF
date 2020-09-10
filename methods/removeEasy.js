<<<<<<< HEAD
var domObserver,domObserverLight,infiniteLoopPreventCounter=0,myTimer=0,wasNotStoped=!0,punishEasy=(e,t)=>{const o=(e,t)=>window.getComputedStyle(e,null).getPropertyValue(t),n=(e,t,o)=>e.style.setProperty(t,o,"important"),r=(e,t)=>!!e.includes(t),s=e=>{let t={...e};return isNaN(e.cleanedArea)&&(t={...m,cleanedArea:0}),isNaN(e.numbOfItems)&&(t={...m,numbOfItems:0}),isNaN(e.restored)&&(t={...m,restored:0}),t},i=e=>chrome.storage.sync.get(["stats"],t=>{const o=Math.round(e.cleanedArea/e.windowArea*10)/10;let n={cleanedArea:t.stats.cleanedArea+o,numbOfItems:t.stats.numbOfItems+e.numbOfItems,restored:t.stats.restored+e.restored};(isNaN(n.cleanedArea)||isNaN(n.numbOfItems)||isNaN(n.restored))&&(n=s(n)),chrome.storage.sync.set({stats:n})}),a=(e,t)=>{const o=e.offsetHeight*e.offsetWidth;return isNaN(o)?t:{...t,numbOfItems:t.numbOfItems+1,cleanedArea:t.cleanedArea+o}},d=e=>({...e,numbOfItems:e.numbOfItems+1});let m=e?{windowArea:window.innerHeight*window.innerWidth,cleanedArea:0,numbOfItems:0,restored:0}:null;const l=document.documentElement,c=document.body,u=c.getElementsByTagName("*"),b=()=>{"hidden"==o(l,"overflow-y")&&(n(l,"overflow-y","unset"),e&&(m=d(m))),"hidden"==o(c,"overflow-y")&&(n(c,"overflow-y","unset"),e&&(m=d(m)));const t=o(l,"position");"fixed"!=t&&"absolute"!=t||(n(l,"position","relative"),e&&(m=d(m)));const r=o(c,"position");"fixed"!=r&&"absolute"!=r||(n(c,"position","relative"),e&&(m=d(m)))},f=t=>{const r=o(t,"position");if("fixed"==r||"sticky"==r){if("notification"===t.getAttribute("data-PopUpOFF"))return;"none"!=o(t,"display")&&t.setAttribute("data-popupoffExtension","hello"),(t=>{const r=o(t,"top"),s=o(t,"height"),i=r.match(/[+-]?\d+(?:\.\d+)?/g)?Number(r.match(/[+-]?\d+(?:\.\d+)?/g)[0]):100,d=s.match(/[+-]?\d+(?:\.\d+)?/g)?Number(s.match(/[+-]?\d+(?:\.\d+)?/g)[0]):300;i>10?(e&&(m=a(t,m)),n(t,"display","none")):d+i>150&&(e&&(m=a(t,m)),n(t,"display","none"))})(t),(t=>{["policy","cookie","subscription","subscribe","off","sale","notification","notifications","updates","privacy","miss","turn off","turning off","disable","ad blocker","ad block","adblock","adblocker","advertising","bloqueador de anuncios"].some(e=>t.innerHTML.includes(e))&&(e&&(m=a(t,m)),n(t,"display","none"))})(t),(t=>{(["<nav","<header","search","ytmusic","searchbox","app-drawer"].some(e=>t.innerHTML.includes(e))||"NAV"==t.tagName||"HEADER"==t.tagName)&&(e&&(m={...m,numbOfItems:m.numbOfItems-1}),t.style.display=null)})(t)}"none"==o(t,"filter")&&"none"==o(t,"-webkit-filter")||(n(t,"filter","none"),n(t,"-webkit-filter","none"),e&&(m=a(t,m)))},p=e=>{[...e].map(f)},y=e=>{if(e instanceof HTMLElement&&(f(e),wasNotStoped)){const t=e.querySelectorAll("*");p(t)}},g=()=>{infiniteLoopPreventCounter=0,clearTimeout(myTimer),myTimer=0},h=e=>{y(e.target),[...e.addedNodes].map(e=>{"#text"!=e.nodeName&&"#comment"!=e.nodeName&&y(e)}),b()},v=()=>infiniteLoopPreventCounter>1e3?((()=>{try{domObserver.disconnect(),domObserver=!1,wasNotStoped&&setTimeout(()=>{const e=document.body.getElementsByTagName("*");w(e)},2e3),wasNotStoped=!1,domObserverLight.disconnect()}catch(e){}})(),!0):(infiniteLoopPreventCounter++,0===myTimer&&(myTimer=setTimeout(g,1e3)),!1),N=t=>{(e=>{e.target.style.removeProperty("height")})(t),"childList"===t.type&&t.removedNodes.length&&(t=>{const o=t.target,n=t.removedNodes.length;for(let e=0;e<n;e++){const n=t.removedNodes[e].cloneNode(!0);if(n instanceof Element&&"notification"===n.getAttribute("data-PopUpOFF"))return;o.appendChild(n)}o.style.removeProperty("height"),o.style.removeProperty("margin"),o.style.removeProperty("padding"),e&&(m={...m,restored:m.restored+1})})(t)},w=e=>{b(),p(e),domObserver||(domObserver=new MutationObserver(e=>{let o=[];const n=e.length;for(let s=0;s<n&&!v();s++){const n=e[s];if(t)N(n);else{if(r(o,n.target))continue;o=[...o,n.target]}h(n)}})),window.location.href.includes("pinterest")?((domObserverLight=new MutationObserver(e=>{e.map(b)})).observe(l,{attributes:!0}),domObserverLight.observe(c,{attributes:!0})):domObserver.observe(l,{childList:!0,subtree:!0,attributes:!0})};w(u),e&&(i(m),window.addEventListener("beforeunload",()=>{i(m)}))};chrome.storage.sync.get(["statsEnabled","restoreCont"],e=>{punishEasy(e.statsEnabled,e.restoreCont)});
=======
// Script can be injected few times in the same area
var domObserver
var domObserverLight

var infiniteLoopPreventCounter = 0
var myTimer = 0
var wasNotStoped = true

var punishEasy = (statsEnabled, shouldRestoreCont) => {
	// helper functions
	const getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
	const setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
	const checkIsInArr = (arr, item) => arr.includes(item) ? true : false
	const fixStats = stats => {
		let fixedStats = {...stats}
		if (isNaN(stats.cleanedArea))
			fixedStats = { ...state, cleanedArea: 0 }
		if (isNaN(stats.numbOfItems))
			fixedStats = { ...state, numbOfItems: 0 }
		if (isNaN(stats.restored))
			fixedStats = { ...state, restored: 0 }
		return fixedStats
	}
	const setNewData = state =>
		chrome.storage.sync.get(['stats'], resp => {
			// round to first decimal
			const screenValue = Math.round(state.cleanedArea/state.windowArea * 10) / 10
			let newStats = {
				cleanedArea: resp.stats.cleanedArea + screenValue,
				numbOfItems: resp.stats.numbOfItems + state.numbOfItems,
				restored: resp.stats.restored + state.restored
			}

			if (isNaN(newStats.cleanedArea) ||
				isNaN(newStats.numbOfItems) ||
				isNaN(newStats.restored))
					newStats = fixStats(newStats)

			chrome.storage.sync.set({ stats: newStats })
		})
	const addItemToStats = (element, state) => {
		const layoutArea = element.offsetHeight * element.offsetWidth

		return isNaN(layoutArea) ? state : {
			...state,
			numbOfItems: state.numbOfItems + 1,
			cleanedArea: state.cleanedArea + layoutArea
		}
	}
	const addCountToStats = (state) => {
		return { ...state, numbOfItems: state.numbOfItems + 1 }
	}

	// state
	let state = statsEnabled ? {
		windowArea: window.innerHeight * window.innerWidth,
		cleanedArea: 0,
		numbOfItems: 0,
		restored: 0
	} : null

	// unmutable
	const doc = document.documentElement
	const body = document.body
	const elems = body.getElementsByTagName("*")

	// methods
	const removeOverflow = () => {
	    if (getStyle(doc, 'overflow-y') == 'hidden') {
			setPropImp(doc, "overflow-y", "unset")
			if (statsEnabled) state = addCountToStats(state)
		}

		if (getStyle(body, 'overflow-y') == 'hidden') {
			setPropImp(body, "overflow-y", "unset")
			if (statsEnabled) state = addCountToStats(state)
		}

		const docPosStyle = getStyle(doc, 'position')
	    if ((docPosStyle == 'fixed') ||
	    	(docPosStyle == 'absolute')) {
			setPropImp(doc, "position", "relative")
			if (statsEnabled) state = addCountToStats(state)
		}

		const bodyPosStyle = getStyle(body, 'position')
		if ((bodyPosStyle == 'fixed') ||
	    	(bodyPosStyle == 'absolute')) {
			setPropImp(body, "position", "relative")
			if (statsEnabled) state = addCountToStats(state)
		}
	}
	const positionCheck = element => {
		// needs to get minus value for top value if it is
		const elemTopStyle = getStyle(element, 'top')
		const elemHeightStyle = getStyle(element, 'height')
		const ELEMENT_TOP = elemTopStyle.match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(elemTopStyle.match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							100
		const ELEMENT_HEIGHT = elemHeightStyle.match(/[+-]?\d+(?:\.\d+)?/g) ?
							Number(elemHeightStyle.match(/[+-]?\d+(?:\.\d+)?/g)[0]) :
							300

		if (ELEMENT_TOP > 10) {
			if (statsEnabled) state = addItemToStats(element, state)

			setPropImp(element, "display", "none")
		} else if ((ELEMENT_HEIGHT + ELEMENT_TOP) > 150) {
			if (statsEnabled) state = addItemToStats(element, state)

			setPropImp(element, "display", "none")
		}
	}
	const contentCheck = (element) => {
		const ARR_OF_ITEMS = ['policy', 'cookie', 'subscription', 'subscribe', 'off', 'sale', 'notification', 'notifications', 'updates', 'privacy', 'miss', 'turn off', 'turning off', 'disable', 'ad blocker', 'ad block', 'adblock', 'adblocker', 'advertising', 'bloqueador de anuncios']

	    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item))) {
			if (statsEnabled) state = addItemToStats(element, state)

			setPropImp(element, "display", "none")
	    }
	}
	const semanticCheck = (element) => {
	    const ARR_OF_ITEMS = ['<nav', '<header', 'search', 'ytmusic', 'searchbox', 'app-drawer']

	    if (ARR_OF_ITEMS.some(item => element.innerHTML.includes(item)) ||
			(element.tagName == "NAV") ||
			(element.tagName == "HEADER")) {
			if (statsEnabled) state = {...state, numbOfItems: state.numbOfItems - 1 }

	    	element.style.display = null
	    }
	}
	const checkElem = element => {
		const elemPosStyle = getStyle(element, 'position')
	    if ((elemPosStyle == 'fixed') ||
	    	(elemPosStyle == 'sticky')) {

	    	if (element.getAttribute('data-PopUpOFF') === 'notification')
	        	return

	    	if (getStyle(element, 'display') != 'none') {
	        	element.setAttribute('data-popupoffExtension', 'hello')
	        }

	    	positionCheck(element)
	    	contentCheck(element)
	    	semanticCheck(element)
	    }
	    if ((getStyle(element, 'filter') != 'none') ||
	    	(getStyle(element, '-webkit-filter') != 'none')) {
	    	setPropImp(element, "filter", "none")
	    	setPropImp(element, "-webkit-filter", "none")

			if (statsEnabled) state = addItemToStats(element, state)
	    }
	}
	const checkElems = elems => {
		const arr = [...elems]
		arr.map(checkElem)
	}
	const unhide = elem => {
		if (elem.innerHTML.length > 5)
			elem.classList.remove('hide')
	}
	const findHidden = () => {
		const hidden = [...doc.querySelectorAll('.hide')]
		hidden.map(unhide)
	}
	// watch DOM
	const checkElemWithSibl = (element) => {
		if (element instanceof HTMLElement) {
			// element itself
			checkElem(element)
			// all childs of element
			if (wasNotStoped) {
				const elems = element.querySelectorAll("*")
				checkElems(elems)
			}
		}
	}
	const resetLoopCounter = () => {
	    infiniteLoopPreventCounter = 0
		clearTimeout(myTimer)
	    myTimer = 0
	}
	const removeDomWatcher = () => {
		try {
			domObserver.disconnect()
			domObserver = false
			if (wasNotStoped) {
				setTimeout(() => {
					const newElems = document.body.getElementsByTagName("*")
					action(newElems)
				}, 2000)
			}
			wasNotStoped = false
			domObserverLight.disconnect()
		} catch (e) {
		}
	}
	const checkMutation = mutation => {
		checkElemWithSibl(mutation.target)
		const arr = [...mutation.addedNodes]
		arr.map(element => {
			if ((element.nodeName != '#text') && (element.nodeName != '#comment')) checkElemWithSibl(element)
		})
		removeOverflow()
	}
	const unsetHeight = mutation => {
		mutation.target.style.removeProperty("height")
	}
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1000) {
			removeDomWatcher()
			return true
		}
		infiniteLoopPreventCounter++
		if (myTimer === 0) {
			myTimer = setTimeout(resetLoopCounter, 1000)
		}
		return false
	}
	const restoreNode = mutation => {
		const target = mutation.target
		const length = mutation.removedNodes.length

		for (let i = 0; i < length; i++) {
			const removedNodeClone = mutation.removedNodes[i].cloneNode(true)
			if (removedNodeClone instanceof Element && removedNodeClone.getAttribute('data-PopUpOFF') === 'notification')
				return

			target.appendChild(removedNodeClone)
		}

		target.style.removeProperty("height")
		target.style.removeProperty("margin")
		target.style.removeProperty("padding")

		if (statsEnabled) state = { ...state, restored: state.restored + 1 }
	}
	const checkForRestore = mutation => {
		unsetHeight(mutation)

		if (mutation.type === 'childList' &&
		mutation.removedNodes.length) {
			restoreNode(mutation)
		}
	}
	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				let processedElems = []
				const len = mutations.length
				for (let i = 0; i < len; i++) {
					// disconnect if oversized
					const shouldStop = prevLoop()
					if (shouldStop)
						break

					const mutation = mutations[i]

					if (!shouldRestoreCont) {
						const isProcessed = checkIsInArr(processedElems, mutation.target)
						// skip if processed
						if (isProcessed)
							continue
						else
							processedElems = [...processedElems, mutation.target]
					} else {
						checkForRestore(mutation)
					}

					// check element and its siblings
					checkMutation(mutation)
				}
			})
		}

		if (window.location.href.includes('pinterest')) {
			// cant deal with this website, i guess there will be array of this-one-like websites or I find out another solution
			domObserverLight = new MutationObserver(mutation => {
				mutation.map(removeOverflow)
			})
			domObserverLight.observe(doc, {
				attributes: true
			})
			domObserverLight.observe(body, {
				attributes: true
			})
		} else {
			domObserver.observe(doc, {
				childList: true,
				subtree: true,
				attributes: true
			})
		}
	}

	const action = elems => {
		removeOverflow()
		checkElems(elems)
		if (shouldRestoreCont)
			findHidden()
		watchDOM()
	}

	// Let the hunt begin!
	action(elems)
	// statistics
	if (statsEnabled) {
		setNewData(state)
		window.addEventListener("beforeunload", () => { setNewData(state) })
	}
}

chrome.storage.sync.get(['statsEnabled', 'restoreCont'], resp => {
	punishEasy(resp.statsEnabled, resp.restoreCont)
})
>>>>>>> f1fff64... patch, add 'hide' class check from scratch
