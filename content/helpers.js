// "global" variables //
// event check
let beforeUnloadAactive = false
let isCSSAppended = false

// dom sobservers
let domObserver

// prevent infinite loop
let infiniteLoopPreventCounter = 0
let myTimer = 0
let wasNotStoped = true

// memoize for easy mode
const memoize = {}

// helpers
const getStyle = (elem, property) =>
    window.getComputedStyle(elem, null).getPropertyValue(property)

const setPropImp = (elem, prop, val) =>
    elem.style.setProperty(prop, val, "important")

const checkIsInArr = (arr, item) =>
    arr.includes(item) ? true : false

const getPureURL = url =>
    url.substring(url.lastIndexOf("//") + 2, url.indexOf("/", 8))

const roundToTwo = num =>
    +(Math.round(num + "e+2")  + "e-2")

const debounce = (func, wait, immediate) => {
	var timeout
	return function() {
		var context = this, args = arguments
		var later = function() {
			timeout = null
			if (!immediate) func.apply(context, args)
		}
		var callNow = immediate && !timeout
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
		if (callNow) func.apply(context, args)
	}
}

const disconnectObservers = domObserver => {
    try {
		if (domObserver) {
            domObserver.disconnect()
            domObserver = null
        }
	} catch (e) {
		// console.log(e)
	}
    return null
}

const restoreFixedElems = () => {
	const elems = document.querySelectorAll('[data-PopUpOFFBl]')
	elems.forEach(elem => elem.style.display = null)
}

const modeChangedToBg = () =>
    chrome.runtime.sendMessage({ modeChanged: true })

// stats
const fixStats = stats => {
    let fixedStats = { ...stats }
    if (isNaN(stats.cleanedArea))
        fixedStats = { ...stats, cleanedArea: 0 }
    if (isNaN(stats.numbOfItems))
        fixedStats = { ...stats, numbOfItems: 0 }
    if (isNaN(stats.restored))
        fixedStats = { ...stats, restored: 0 }
    return fixedStats
}

const setNewData = state =>
    chrome.storage.sync.get(['stats'], resp => {
        // round to first decimal
        const screenValue = roundToTwo(state.cleanedArea/state.windowArea)

        let newStats = {
            cleanedArea: parseFloat(resp.stats.cleanedArea) + parseFloat(isNaN(screenValue) ? 0 : screenValue),
            numbOfItems: parseFloat(resp.stats.numbOfItems) + parseFloat(state.numbOfItems),
            restored: parseFloat(resp.stats.restored) + parseFloat(state.restored)
        }

        if (isNaN(newStats.cleanedArea) ||
            isNaN(newStats.numbOfItems) ||
            isNaN(newStats.restored))
                newStats = fixStats(newStats)

        chrome.storage.sync.set({ stats: newStats })
    })

const addCountToStats = (state) => {
    return { ...state, numbOfItems: parseFloat(state.numbOfItems) + 1 }
}

const addItemToStats = (element, state) => {
    const layoutArea = element.offsetHeight * element.offsetWidth

    return isNaN(layoutArea) ? state : {
        ...state,
        numbOfItems: parseFloat(state.numbOfItems) + 1,
        cleanedArea: parseFloat(state.cleanedArea) + parseFloat(layoutArea)
    }
}

// methods
const removeOverflow = (statsEnabled, state, doc, body) => {
    if (getStyle(doc, 'overflow-y')) {
        setPropImp(doc, "overflow-y", "unset")
        if (statsEnabled) state = addCountToStats(state)
    }

    if (getStyle(body, 'overflow-y')) {
        setPropImp(body, "overflow-y", "unset")
        if (statsEnabled) state = addCountToStats(state)
    }

    const docPosStyle = getStyle(doc, 'position')
    if ((docPosStyle == 'fixed') ||
        (docPosStyle == 'absolute')) {
        setPropImp(doc, "min-height", "100vh")
        setPropImp(doc, "position", "relative")
        if (statsEnabled) state = addCountToStats(state)
    }

    const bodyPosStyle = getStyle(body, 'position')
    if ((bodyPosStyle== 'fixed') ||
        (bodyPosStyle == 'absolute')) {
        setPropImp(body, "position", "relative")
        setPropImp(body, "min-height", "100vh")
        if (statsEnabled) state = addCountToStats(state)
    }
    return state
}

const checkElems = (elems, checkElem) => {
    const arr = [...elems]
    arr.map(checkElem)
}

const unhide = (elem, statsEnabled, state) => {
    if (elem.innerHTML.length > 5) {
        elem.classList.remove('hide', 'height_0', 'not_scroll', 'paragraph--reduced', 'paragraph--dynamic', 'paragraph--faded', 'article-teaser-overflow')
        if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 }
    }
    return state
}

const findHidden = (state, statsEnabled, doc) => {
    // classes from different websites
    const hidden = [
        ...doc.querySelectorAll('.hide'),
        ...doc.querySelectorAll('.height_0'),
        ...doc.querySelectorAll('.not_scroll'),
        ...doc.querySelectorAll('.paragraph--faded'),
        ...doc.querySelectorAll('.paragraph--reduced'),
        ...doc.querySelectorAll('.paragraph--dynamic'),
        ...doc.querySelectorAll('.article-teaser-overflow'),
    ]
    hidden.map(elem => { state = unhide(elem, statsEnabled, state) })
    return state
}

const detectGrad = (state, statsEnabled, element) => {
    if (getStyle(element, 'background-image').includes('linear-gradient')) {
        setPropImp(element, "background-image", "unset")
        if (statsEnabled) state = addCountToStats(state)
    }

    if (getComputedStyle(element, '::before').getPropertyValue('background-image').includes('linear-gradient') ||
    getComputedStyle(element, '::after').getPropertyValue('background-image').includes('linear-gradient')) {
        if (!isCSSAppended) {
            document.head.insertAdjacentHTML("beforeend", `<style>.PopUpOFF-no_grad::after,.PopUpOFF-no_grad::before{background-image:unset!important}</style>`)
            isCSSAppended = true
        }
        element.classList.add('PopUpOFF-no_grad')
        if (statsEnabled) state = addCountToStats(state)
    }

    return state
}

const additionalChecks = (element, state, statsEnabled, shouldRestoreCont, checkElem) => {
    if ((getStyle(element, 'filter') != 'none') ||
        (getStyle(element, '-webkit-filter') != 'none')) {
        setPropImp(element, "filter", "none")
        setPropImp(element, "-webkit-filter", "none")

        if (statsEnabled) state = addItemToStats(element, state)
    }

    if (shouldRestoreCont) state = detectGrad(state, statsEnabled, element)

    if (element.shadowRoot)
        checkElemWithSibl(element.shadowRoot, checkElem)

    return state
}

const isDecentElem = element => {
    return ((element.nodeName == 'SCRIPT') ||
    (element.nodeName == 'HEAD') ||
    (element.nodeName == 'BODY') ||
    (element.nodeName == 'HTML') ||
    (element.nodeName == 'STYLE')) ? false : true
}

// watch DOM
const checkElemWithSibl = (element, checkElem) => {
    if (element instanceof HTMLElement) {
        // element itself
        checkElem(element)
        // all childs of element
        if (wasNotStoped) {
            const elems = element.querySelectorAll("*")
            checkElems(elems, checkElem)
        }
    } else if (element instanceof ShadowRoot) {
        const elems = element.querySelectorAll("*")
        checkElems(elems, checkElem)
    }
}

const resetLoopCounter = (infiniteLoopPreventCounter, myTimer) => {
    infiniteLoopPreventCounter = 0
    clearTimeout(myTimer)
    myTimer = 0
}

const removeDomWatcher = (domObserver, wasNotStoped, body, action) => {
    try {
        domObserver.disconnect()
        domObserver = false
        if (wasNotStoped) {
            setTimeout(() => {
                const newElems = body.getElementsByTagName("*")
                action(newElems)
            }, 2000)
        }
        wasNotStoped = false
    } catch (e) {
    }
}

const checkMutation = (mutation, statsEnabled, state, doc, body, checkElem) => {
    if ((mutation.target.nodeName == 'SCRIPT') ||
    (mutation.target.nodeName == 'HEAD') ||
    (mutation.target.nodeName == 'STYLE'))
        return state

    checkElemWithSibl(mutation.target, checkElem)
    const arr = [...mutation.addedNodes]
    arr.map(element => {
        if ((element.nodeName != '#text') &&
        (element.nodeName != '#comment') &&
        (element.nodeName != 'SCRIPT') &&
        (element.nodeName != 'HEAD') &&
        (element.nodeName != 'STYLE'))
            checkElemWithSibl(element, checkElem)
    })
    return removeOverflow(statsEnabled, state, doc, body)
}

const unsetHeight = ({ target }, statsEnabled, state) => {
    if (target.getAttribute('data-popupoffextension') === 'hello')
        return state

    if ((target.nodeName == 'SCRIPT') ||
    (target.nodeName == 'HEAD') ||
    (target.nodeName == 'STYLE'))
        return state

    if (getStyle(target, 'display') == 'none') {
        setPropImp(target, "display", "unset")
        if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 }
    }

    target.style.removeProperty("height")

    return state
}

const restoreNode = (mutation, statsEnabled, state) => {
    const target = mutation.target
    const length = mutation.removedNodes.length

    for (let i = 0; i < length; i++) {
        const removedNodeClone = mutation.removedNodes[i].cloneNode(true)
        if (removedNodeClone instanceof Element && removedNodeClone.getAttribute('data-PopUpOFF') === 'notification')
            return state

        target.appendChild(removedNodeClone)
    }

    target.style.removeProperty("height")
    target.style.removeProperty("margin")
    target.style.removeProperty("padding")

    if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 }

    return state
}

const checkForRestore = (mutation, statsEnabled, state) => {
    state = unsetHeight(mutation, statsEnabled, state)

    if (mutation.type === 'childList' &&
    mutation.removedNodes.length) {
        state = restoreNode(mutation, statsEnabled, state)
    }

    return state
}

const watchMutations = (mutations, shouldRestoreCont, statsEnabled, state, doc, body, prevLoop, checkElem) => {
    let processedElems = []
    const len = mutations.length
    for (let i = 0; i < len; i++) {
        // stop and disconnect if oversized
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
            state = checkForRestore(mutation, statsEnabled, state)
        }

        // check element and its siblings
        state = checkMutation(mutation, statsEnabled, state, doc, body, checkElem)
    }
    return state
}
