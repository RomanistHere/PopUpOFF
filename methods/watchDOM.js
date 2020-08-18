// var dom_observer
// var dom_observer_new
//
// var infiniteLoopPreventCounter = 0
// var myTimer
// var wasNotStoped = true
//
// var removeDomWatcher = () => {
// 	if (dom_observer) {
// 		dom_observer.disconnect()
// 		dom_observer = false
// 		if (wasNotStoped) setTimeout(domWatcherHard, 3000);
// 		wasNotStoped = false
// 	}
//
// 	if (dom_observer_new) {
// 		dom_observer_new.disconnect()
// 	}
// }
//
// var resetLoopCounter = () => {
//     infiniteLoopPreventCounter = 0
//     myTimer = 0
// }
//
// var domWatcherHard = () => {
// 	if (!dom_observer) {
// 		dom_observer = new MutationObserver((mutation) => {
// 			for (let i = 0; i < mutation.length; i++){
// 				// console.log(mutation[i])
// 				if (mutation[i].removedNodes.length) {
// 					console.log(mutation[i])
// 					console.log(mutation[i].removedNodes[0].data)
// 				}
// 				// prevent inifnite looping
// 				if (infiniteLoopPreventCounter > 800) {
// 					removeDomWatcher()
// 					break
// 				}
// 				infiniteLoopPreventCounter++
// 				if (!myTimer) {
// 					myTimer = window.setTimeout(resetLoopCounter, 1000)
// 				}
// 				checkElemForPositionHard(mutation[i].target)
// 				mutation[i].addedNodes.forEach((element) => {
// 					if (element.nodeName != '#text') checkElemForPositionHard(element)
// 				})
// 				removeOverflow()
// 			}
// 		})
// 	}
//
// 	if (!dom_observer_new) {
// 		dom_observer_new = new MutationObserver((mutation) => {
// 			mutation.forEach((mutation) => {
// 				removeOverflow()
// 			})
// 		})
// 	}
//
// 	if (!window.location.href.includes('pinterest')) {
// 		dom_observer.observe(document.documentElement, {
// 			childList: true,
// 			subtree: true,
// 			attributes: true
// 		})
// 	} else {
// 		// cant deal with this website, i guess there will be array of this one-like websites or I find out another solution
// 		dom_observer_new.observe(document.documentElement, {
// 			attributes: true
// 		})
// 		dom_observer_new.observe(document.body, {
// 			attributes: true
// 		})
// 	}
// }
//
// domWatcherHard()
//
// var getStyle = ($elem, property) => window.getComputedStyle($elem, null).getPropertyValue(property)
// var setPropImp = ($elem, prop, val) => $elem.style.setProperty(prop, val, "important")
//
// var checkElem = ($element) => {
// 	if ((getStyle($element, 'position') == 'fixed') ||
//     	(getStyle($element, 'position') == 'sticky')) {
//         if (getStyle($element, 'display') != 'none') {
//         	// setting uniq data-atr to elems with display block as initial state to restore it later
//         	$element.setAttribute('data-popupoffExtension', 'hello')
//         }
//         setPropImp($element, "display", "none")
//     }
//
//     if ((getStyle($element, 'filter') != 'none') ||
//     	(getStyle($element, '-webkit-filter') != 'none')) {
//     	setPropImp($element, "filter", "none")
//     	setPropImp($element, "-webkit-filter", "none")
//     }
// }
//
// var checkElemForPositionHard = ($element) => {
// 	if ($element instanceof HTMLElement) {
// 		// element itself
// 		checkElem($element)
// 	    // all childs of element
// 		const $elems = $element.querySelectorAll("*")
// 		const LEN = $elems.length
//
// 		for (let i = 0; i < LEN; i++) {
// 		    checkElem($elems[i])
// 		}
// 	}
// }
//
// var removeOverflow = () => {
// 	const doc = document.documentElement
// 	const body = document.body
//
//     if (getStyle(doc, 'overflow-y') == 'hidden') {
// 		setPropImp(doc, "overflow-y", "unset")
// 	}
//
// 	if (getStyle(body, 'overflow-y') == 'hidden') {
// 		setPropImp(body, "overflow-y", "unset")
// 	}
//
//     if ((getStyle(doc, 'position') == 'fixed') ||
//     	(getStyle(doc, 'position') == 'absolute')) {
// 		setPropImp(doc, "position", "relative")
// 	}
//
// 	if ((getStyle(body, 'position') == 'fixed') ||
//     	(getStyle(body, 'position') == 'absolute')) {
// 		setPropImp(body, "position", "relative")
// 	}
// }
