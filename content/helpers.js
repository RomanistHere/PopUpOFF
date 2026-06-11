// defWebsites is provided by constants/data.js, loaded right before this file (see manifest.json)

// "global" variables //
// event check
let pagehideActive = false;
let isCSSAppended = false;
let isSiteFixCSSAppended = false;

// dom sobservers
let domObserver;

// mutation watcher throttling
const MUTATION_LIMIT = 1500;
let infiniteLoopPreventCounter = 0;
let myTimer = 0;
let watcherPauseCount = 0;
let watcherResumeTimer = 0;

// helpers
const getStyle = (elem, property) =>
	window.getComputedStyle(elem, null).getPropertyValue(property);

const setPropImp = (elem, prop, val) => elem.style.setProperty(prop, val, "important");

const checkIsInArr = (arr, item) => (arr.includes(item) ? true : false);

const getPureURL = url => {
	try {
		return new URL(url).host;
	} catch {
		return "";
	}
};

const roundToTwo = num => +(Math.round(num + "e+2") + "e-2");

const debounce = (func, wait, immediate) => {
	var timeout;
	return function () {
		var context = this,
			args = arguments;
		var later = function () {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

const getStorageData = key =>
	new Promise((resolve, reject) =>
		chrome.storage.sync.get(key, result =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve(result)
		)
	);

const setStorageData = data =>
	new Promise((resolve, reject) =>
		chrome.storage.sync.set(data, () =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve()
		)
	);

const getStorageLocal = key =>
	new Promise((resolve, reject) =>
		chrome.storage.local.get(key, result =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve(result)
		)
	);

const setStorageLocal = data =>
	new Promise((resolve, reject) =>
		chrome.storage.local.set(data, () =>
			chrome.runtime.lastError
				? reject(Error(chrome.runtime.lastError.message))
				: resolve()
		)
	);

// Per-site preferences live in storage.local: it has no meaningful size limit,
// unlike storage.sync whose 8KB-per-item quota broke saving altogether
// ("storage full") once users had collected a few hundred sites.
const setWebsites = websites => setStorageLocal({ websites: { ...websites } });

const getWebsites = async () => {
	try {
		const { websites } = await getStorageLocal("websites");
		return websites != null ? websites : {};
	} catch {
		return {};
	}
};

const disconnectObservers = domObserver => {
	try {
		clearTimeout(watcherResumeTimer);
		watcherResumeTimer = 0;
		if (domObserver) {
			domObserver.disconnect();
			domObserver = null;
		}
	} catch {
		// console.log(e)
	}
	return null;
};

const restoreFixedElems = () => {
	const elems = document.querySelectorAll("[data-popupoff]");
	elems.forEach(elem => {
		if (elem.getAttribute("data-popupoff") === "bl") {
			elem.style.display = null;
		} else if (elem.getAttribute("data-popupoff") === "st") {
			elem.style.setProperty("position", "absolute");
		}
		elem.removeAttribute("data-popupoff");
	});
};

const modeChangedToBg = () => chrome.runtime.sendMessage({ modeChanged: true });

// stats
const fixStats = stats => {
	let fixedStats = { ...stats };
	if (isNaN(stats.cleanedArea)) fixedStats = { ...stats, cleanedArea: 0 };
	if (isNaN(stats.numbOfItems)) fixedStats = { ...stats, numbOfItems: 0 };
	if (isNaN(stats.restored)) fixedStats = { ...stats, restored: 0 };
	return fixedStats;
};

const setNewData = state =>
	chrome.storage.local.get(["stats"], resp => {
		const oldStats = resp.stats != null
			? resp.stats
			: { cleanedArea: 0, numbOfItems: 0, restored: 0 };
		// round to first decimal
		const screenValue = roundToTwo(state.cleanedArea / state.windowArea);

		let newStats = {
			cleanedArea:
				parseFloat(oldStats.cleanedArea) +
				parseFloat(isNaN(screenValue) ? 0 : screenValue),
			numbOfItems: parseFloat(oldStats.numbOfItems) + parseFloat(state.numbOfItems),
			restored: parseFloat(oldStats.restored) + parseFloat(state.restored),
		};

		if (
			isNaN(newStats.cleanedArea) ||
			isNaN(newStats.numbOfItems) ||
			isNaN(newStats.restored)
		)
			newStats = fixStats(newStats);

		chrome.storage.local.set({ stats: newStats });
	});

const addCountToStats = state => {
	return { ...state, numbOfItems: parseFloat(state.numbOfItems) + 1 };
};

const addItemToStats = (element, state) => {
	const { width, height } = element.getBoundingClientRect();
	const layoutArea = width * height;

	return isNaN(layoutArea)
		? state
		: {
				...state,
				numbOfItems:
					layoutArea > 10000 ? parseFloat(state.numbOfItems) + 1 : state.numbOfItems,
				cleanedArea: parseFloat(state.cleanedArea) + layoutArea / 2,
		  };
};

// UI injected by other browser extensions must never be treated as a popup:
// match tag/id/class against known extension tokens, honor an explicit
// data-popupoff-ignore attribute and skip anything embedding an extension page.
// Users can extend this with their own CSS selectors on the options page.
const extUIIframeSelector =
	'iframe[src^="chrome-extension://"], iframe[src^="moz-extension://"]';

// user-defined CSS selectors (options page), parsed one per line
let userIgnoredSelectors = [];

const setUserIgnoredSelectors = raw => {
	userIgnoredSelectors = (raw || "")
		.split("\n")
		.map(line => line.trim())
		.filter(line => line.length > 0);
};

const matchesUserIgnored = element => {
	for (const selector of userIgnoredSelectors) {
		try {
			// forgiving on purpose: the selector may target the fixed element
			// itself, one of its ancestors or something inside it
			if (element.closest(selector) || element.querySelector(selector)) return true;
		} catch {
			// invalid selector - skip it
		}
	}
	return false;
};

const isIgnoredElem = element => {
	if (element.hasAttribute("data-popupoff-ignore")) return true;

	const haystack =
		`${element.nodeName} ${element.id} ${element.getAttribute("class") || ""}`.toLowerCase();
	if (extensionUITokens.some(token => haystack.includes(token))) return true;

	if (matchesUserIgnored(element)) return true;

	try {
		if (element.matches(extUIIframeSelector) || element.querySelector(extUIIframeSelector))
			return true;
	} catch {
		// non-element nodes
	}

	return false;
};

// Arc Publishing sites keep the page at opacity 0 until their consent script runs;
// applied only while a mode is active so "Turn OFF" leaves pages truly untouched
const applySiteFixCSS = () => {
	if (isSiteFixCSSAppended) return;
	document.head.insertAdjacentHTML(
		"beforeend",
		`<style>div[id="fusion-app"]{opacity:1!important}</style>`
	);
	isSiteFixCSSAppended = true;
};

// methods
const removeOverflow = (statsEnabled, state, doc, body) => {
	applySiteFixCSS();
	const overFlowDoc = getStyle(doc, "overflow-y");
	const overFlowBody = getStyle(body, "overflow-y");
	const docPosStyle = getStyle(doc, "position");
	const bodyPosStyle = getStyle(body, "position");

	if (overFlowDoc !== "visible" && overFlowDoc !== "unset" && overFlowDoc !== "auto") {
		setPropImp(doc, "overflow-y", "unset");
		if (statsEnabled) state = addCountToStats(state);
	}

	if (overFlowBody !== "visible" && overFlowBody !== "unset" && overFlowBody !== "auto") {
		setPropImp(body, "overflow-y", "unset");
		if (statsEnabled) state = addCountToStats(state);
	}

	if (docPosStyle === "fixed" || docPosStyle === "absolute") {
		setPropImp(doc, "min-height", "100vh");
		setPropImp(doc, "position", "relative");
		if (statsEnabled) state = addCountToStats(state);
	}

	if (bodyPosStyle === "fixed" || bodyPosStyle === "absolute") {
		setPropImp(body, "position", "relative");
		setPropImp(body, "min-height", "100vh");
		if (statsEnabled) state = addCountToStats(state);
	}

	return state;
};

const removeListeners = () => {
	if (window.location.href.includes("glassdoor")) {
		window.addEventListener(
			"scroll",
			e => {
				e.stopPropagation();
			},
			true
		);
	}
};

const checkElems = (elems, checkElem) => {
	const arr = [...elems];
	arr.map(checkElem);
};

const unhide = (elem, statsEnabled, state) => {
	if (elem.innerHTML.length > 5) {
		elem.classList.remove(
			"hide",
			"height_0",
			"not_scroll",
			"excerpt-cropped",
			"paragraph--reduced",
			"paragraph--dynamic",
			"paragraph--faded",
			"article-teaser-overflow",
			"editor-description__wrapper--cropped",
		);
		if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 };
	}
	return state;
};

const findHidden = (state, statsEnabled, doc) => {
	// classes from different websites
	const hidden = [
		...doc.querySelectorAll(".hide"),
		...doc.querySelectorAll(".height_0"),
		...doc.querySelectorAll(".not_scroll"),
		...doc.querySelectorAll(".excerpt-cropped"),
		...doc.querySelectorAll(".paragraph--faded"),
		...doc.querySelectorAll(".paragraph--reduced"),
		...doc.querySelectorAll(".paragraph--dynamic"),
		...doc.querySelectorAll(".article-teaser-overflow"),
		...doc.querySelectorAll(".editor-description__wrapper--cropped"),
	];
	hidden.map(elem => {
		state = unhide(elem, statsEnabled, state);
	});
	// custom ID theguardian
	try {
		document.querySelector("#sign-in-gate").remove();
	} catch (e) {}

	return state;
};

const detectGrad = (state, statsEnabled, element) => {
	if (getStyle(element, "background-image").includes("linear-gradient")) {
		setPropImp(element, "background-image", "unset");
		if (statsEnabled) state = addCountToStats(state);
	}

	if (
		getComputedStyle(element, "::before")
			.getPropertyValue("background-image")
			.includes("linear-gradient") ||
		getComputedStyle(element, "::after")
			.getPropertyValue("background-image")
			.includes("linear-gradient")
	) {
		if (!isCSSAppended) {
			document.head.insertAdjacentHTML(
				"beforeend",
				`<style>.PopUpOFF-no_grad::after,.PopUpOFF-no_grad::before{background-image:unset!important}</style>`
			);
			isCSSAppended = true;
		}
		element.classList.add("PopUpOFF-no_grad");
		if (statsEnabled) state = addCountToStats(state);
	}

	return state;
};

const additionalChecks = (element, state, statsEnabled, shouldRestoreCont, checkElem) => {
	if (getStyle(element, "filter") !== "none" || getStyle(element, "-webkit-filter") !== "none") {
		setPropImp(element, "filter", "none");
		setPropImp(element, "-webkit-filter", "none");

		if (statsEnabled) state = addItemToStats(element, state);
	}

	if (shouldRestoreCont) state = detectGrad(state, statsEnabled, element);

	if (element.shadowRoot) checkElemWithSibl(element.shadowRoot, checkElem);

	return state;
};

const isDecentElem = element =>
	!(
		element.nodeName === "SCRIPT" ||
		element.nodeName === "HEAD" ||
		element.nodeName === "BODY" ||
		element.nodeName === "HTML" ||
		element.nodeName === "STYLE"
	);

const videoCheck = element => {
	// traverse through the element and its children recursively till find <video> tag or block the element
	const nodeName = element.nodeName;
	const childNodes = element.childNodes;
	// console.log(nodeName)

	if (nodeName === "APP-DRAWER") {
		return false;
	}

	if (window.location.href.includes("www.youtube") || window.location.href.includes("www.google")) {
		return true;
	}

	if (
		nodeName === "VIDEO" ||
		nodeName === "IMG" ||
		nodeName === "FORM" ||
		nodeName === "BUTTON" ||
		nodeName === "INPUT" ||
		nodeName === "IFRAME"
	)
		return false;

	// contains shadow dom
	if (element.shadowRoot) return videoCheck(element.shadowRoot);

	// is iframe
	if (element.contentDocument) return videoCheck(element.contentDocument);

	// check all the children
	for (let i = 0; i < childNodes.length; i++) {
		if (childNodes[i].nodeType == 1 && !videoCheck(childNodes[i])) return false;
	}

	return true;
};

const forbWordsEasy = [
	"cookie",
	"privacy",
	"adblock",
	"ad block",
	"blocker",
	"ever miss",
	"t miss",
	"our privacy",
	"theguardian",
	"bloqueador de anuncios",
	"to continue us",
	"mited acces",
	"lusive acces",
	"left this mon",
	"be the fir",
	"ble notif",
	"s the time",
	"ur newslet",
	"gister for fre",
	"nload free",
	"nload your free",
	"gn to youtube",
	"ble deal",
	"started for fre",
	"it's free",
	"free trial",
	"tart fre",
	"advertisement",
	"//consent.",
	"ign in to youtub",
];

const forbWords = [
	...forbWordsEasy,
	"policy",
	"subscri",
	"sale",
	"updates",
	"member",
	"value",
	"advertis",
	"подписаться",
	"install",
];

const allowedWords = [
	"sign in",
	"language",
	"basket",
	"delivery",
	"price",
	"google meet",
	"корзина",
	"resume",
	"apply",
	"drive",
];

const contentEasyCheck = element => {
	const textCont = element.innerHTML.toLowerCase();
	return forbWordsEasy.some(v => textCont.includes(v));
};

const contentCheck = element => {
	const textCont = element.innerHTML.toLowerCase();

	// console.log('contentCheck(should block): ', forbWords.some(v => textCont.includes(v)))
	return forbWords.some(v => textCont.includes(v));
};

const contentUnlockCheck = element => {
	const textCont = element.innerHTML.toLowerCase();

	const shouldNotBlock = allowedWords.some(v => textCont.includes(v));
	// console.log('contentUnlockCheck(should block): ', !shouldNotBlock)
	return !shouldNotBlock;
};

const positionCheckTypeI = (element, windowArea) => {
	if (element.offsetHeight === 0 || element.offsetWidth === 0) {
		if (contentEasyCheck(element))
			return { shouldRemove: true, shouldMemo: true };
		else
			return { shouldRemove: true, shouldMemo: false };
	}

	const layoutArea = element.offsetHeight * element.offsetWidth;
	const screenValue = roundToTwo(layoutArea / windowArea);
	const offsetBot = window.innerHeight - (element.offsetTop + element.offsetHeight);

	if (screenValue >= 0.98) {
		// case 1: overlay on the whole screen - should block
		// case 2: video in full screen mode - should not
		return {
			shouldRemove: contentEasyCheck(element) || videoCheck(element),
			shouldMemo: true,
		};
	}

	if (
		element.offsetTop <= 100 &&
		element.offsetHeight <= 250 &&
		element.offsetWidth > 640
	) {
		// popular notification
		if (element.id === "onesignal-slidedown-container")
			return { shouldRemove: true, shouldMemo: true };

		// it's a header!
		return { shouldRemove: false, shouldMemo: true };
	}

	if (element.offsetLeft <= 0 && element.offsetWidth <= 360 && screenValue >= 0.1) {
		// youtube/facebook sidebar
		return { shouldRemove: false, shouldMemo: true };
	}

	if (screenValue < 0.98 && screenValue >= 0.1) {
		// overlays
		return { shouldRemove: contentEasyCheck(element), shouldMemo: true };
	}

	if (screenValue <= 0.02 && element.offsetTop > 100) {
		// buttons and side/social menus
		return { shouldRemove: false, shouldMemo: true };
	}

	if (offsetBot <= 212) {
		// bottom notification
		return { shouldRemove: contentEasyCheck(element), shouldMemo: true };
	}

	if (screenValue <= 0.1 && element.offsetTop > 100) {
		// buttons and side/social menus
		return { shouldRemove: false, shouldMemo: true };
	}

	return { shouldRemove: false, shouldMemo: false };
};

// watch DOM
const checkElemWithSibl = (element, checkElem) => {
	if (element instanceof HTMLElement) {
		// element itself
		checkElem(element);
		// all childs of element
		const elems = element.querySelectorAll("*");
		checkElems(elems, checkElem);
	} else if (element instanceof ShadowRoot) {
		const elems = element.querySelectorAll("*");
		checkElems(elems, checkElem);
	}
};

// Pages mutating too heavily used to get their watcher disconnected for good,
// letting any popup injected afterwards through (issue #48). Instead, pause with
// a growing backoff and resume with a full rescan that catches everything that
// appeared in between.
const pauseDomWatcher = (observer, resume) => {
	try {
		observer.disconnect();
	} catch {
		// observer may already be gone
	}

	const delay = Math.min(2000 * 2 ** watcherPauseCount, 30000);
	watcherPauseCount++;

	clearTimeout(watcherResumeTimer);
	watcherResumeTimer = setTimeout(() => {
		infiniteLoopPreventCounter = 0;
		resume();
	}, delay);
};

const checkMutation = (mutation, statsEnabled, state, doc, body, checkElem) => {
	if (
		mutation.target.nodeName === "SCRIPT" ||
		mutation.target.nodeName === "HEAD" ||
		mutation.target.nodeName === "STYLE"
	)
		return state;

	checkElemWithSibl(mutation.target, checkElem);
	const arr = [...mutation.addedNodes];
	arr.map(element => {
		if (
			element.nodeName !== "#text" &&
			element.nodeName !== "#comment" &&
			element.nodeName !== "SCRIPT" &&
			element.nodeName !== "HEAD" &&
			element.nodeName !== "STYLE"
		)
			checkElemWithSibl(element, checkElem);
	});
	return removeOverflow(statsEnabled, state, doc, body);
};

const unsetHeight = ({ target }, statsEnabled, state, memoize = new WeakMap()) => {
	if (target.getAttribute("data-popupoffextension") === "hello") return state;

	if (
		target.nodeName === "SCRIPT" ||
		target.nodeName === "HEAD" ||
		target.nodeName === "STYLE"
	)
		return state;

	if (!memoize.has(target) && getStyle(target, "display") === "none") {
		setPropImp(target, "display", "unset");
		if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 };
	}

	target.style.removeProperty("height");

	return state;
};

const checkToConvertToStatic = ({ elem }) => {
	if (getStyle(elem, "overflow") === "hidden") {
		const { width, height, top, left } = elem.getBoundingClientRect();
		if (width > 0 && height > 0 && top === 0 && left === 0) {
			setPropImp(elem, "position", "static");
			elem.setAttribute("data-popupoff", "st");
			return true;
		}
	}
};

const restoreNode = (mutation, statsEnabled, state) => {
	const target = mutation.target;
	const length = mutation.removedNodes.length;

	for (let i = 0; i < length; i++) {
		const removedNodeClone = mutation.removedNodes[i].cloneNode(true);
		if (
			removedNodeClone instanceof Element &&
			removedNodeClone.getAttribute("data-popupoff") === "notification"
		)
			return state;

		target.appendChild(removedNodeClone);
	}

	target.style.removeProperty("height");
	target.style.removeProperty("margin");
	target.style.removeProperty("padding");

	if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 };

	return state;
};

const checkForRestore = (mutation, statsEnabled, state, memoize) => {
	state = unsetHeight(mutation, statsEnabled, state, memoize);

	if (mutation.type === "childList" && mutation.removedNodes.length) {
		state = restoreNode(mutation, statsEnabled, state);
	}

	return state;
};

const watchMutations = (
	mutations,
	shouldRestoreCont,
	statsEnabled,
	state,
	doc,
	body,
	prevLoop,
	checkElem,
	memoize
) => {
	let processedElems = [];
	const len = mutations.length;
	for (let i = 0; i < len; i++) {
		// stop and disconnect if oversized
		const shouldStop = prevLoop();
		if (shouldStop) break;

		const mutation = mutations[i];

		if (mutation.attributeName === "data-popupoff") continue;

		if (!shouldRestoreCont) {
			const isProcessed = checkIsInArr(processedElems, mutation.target);
			// skip if processed
			if (isProcessed) continue;
			else processedElems = [...processedElems, mutation.target];
		} else {
			state = checkForRestore(mutation, statsEnabled, state, memoize);
		}

		// check element and its siblings
		state = checkMutation(mutation, statsEnabled, state, doc, body, checkElem);
	}
	return state;
};

// archieved //

// const positionCheckTypeII = (element, windowArea) => {
//     if (element.offsetHeight === 0 || element.offsetWidth === 0) {
//         if (contentCheck(element))
//             return { shouldRemove: true, shouldMemo: true }
//         else
//             return { shouldRemove: false, shouldMemo: false }
//     }
//
//     const layoutArea = element.offsetHeight * element.offsetWidth
//     const screenValue = roundToTwo(layoutArea/windowArea)
//     const offsetBot = window.innerHeight - (element.offsetTop + element.offsetHeight)
//
//     // console.log(element)
//     // console.log('elemOffsetTop', element.offsetTop)
//     // console.log('elemOffsetLeft', element.offsetLeft)
//     // console.log('elemOffsetBot', offsetBot)
//     // console.log('elemOffsetWidth ', element.offsetWidth)
//     // console.log('elemOffsetHeight', element.offsetHeight)
//     // console.log('layoutArea ', layoutArea)
//     // console.log('screenValue ', screenValue)
//
//     if (screenValue >= .98) {
//         // case 1: overlay on the whole screen - should block
//         // case 2: video in full screen mode - should not
//         console.warn('Full screen!')
//         return { shouldRemove: contentUnlockCheck(element) && (videoCheck(element) || contentCheck(element)), shouldMemo: true }
//     }
//
//     if (element.offsetTop <= 70 && element.offsetHeight <= 200 && element.offsetWidth > 640) {
//         // popular notification
//         if (element.id === 'onesignal-slidedown-container')
//             return { shouldRemove: true, shouldMemo: true }
//
//         // it's a header!
//         console.warn('Header!')
//         return { shouldRemove: false, shouldMemo: true }
//     }
//
//     if (element.offsetLeft <= 0 && element.offsetWidth <= 360 && screenValue >= .1) {
//         // youtube/facebook sidebar
//         console.warn('SideBar!')
//         return { shouldRemove: false, shouldMemo: true }
//     }
//
//     if (screenValue < .98 && screenValue >= .1) {
//         // overlays
//         console.warn('Overlay')
//         return { shouldRemove: contentUnlockCheck(element) && contentCheck(element), shouldMemo: true }
//     }
//
//     if (offsetBot <= 212) {
//         // bottom notification
//         console.warn('Bottom notification')
//         return { shouldRemove: contentUnlockCheck(element) && contentCheck(element), shouldMemo: true }
//     }
//
//     if (screenValue <= .03 && element.offsetTop > 100) {
//         // buttons and side/social menus
//         console.warn('Super small')
//         return { shouldRemove: false, shouldMemo: true }
//     }
//
//     if (screenValue <= .1 && element.offsetTop > 100) {
//         // buttons and side/social menus
//         console.warn('nothing special')
//         return { shouldRemove: false, shouldMemo: true }
//     }
//
//     return { shouldRemove: true, shouldMemo: false }
// }

// const positionCheckTypeIII = (element, windowArea) => {
// 	if (element.offsetHeight === 0 || element.offsetWidth === 0) {
// 		if (contentEasyCheck(element))
// 			return { shouldRemove: true, shouldMemo: true }
// 		else
// 			return { shouldRemove: true, shouldMemo: false }
// 	}
//
// 	const layoutArea = element.offsetHeight * element.offsetWidth
// 	const screenValue = roundToTwo(layoutArea/windowArea)
// 	const offsetBot = window.innerHeight - (element.offsetTop + element.offsetHeight)
//
// 	if (screenValue >= .98) {
// 		// case 1: overlay on the whole screen - should block
// 		// case 2: video in full screen mode - should not
// 		return { shouldRemove: videoCheck(element), shouldMemo: true }
// 	}
//
// 	if (element.offsetTop <= 70 && element.offsetHeight <= 200 && element.offsetWidth > 640) {
// 		// popular notification
// 		if (element.id === 'onesignal-slidedown-container')
// 			return { shouldRemove: true, shouldMemo: true }
//
// 		// it's a header!
// 		return { shouldRemove: false, shouldMemo: true }
// 	}
//
// 	if (element.offsetLeft <= 0 && element.offsetWidth <= 360) {
// 		// youtube/facebook sidebar
// 		return { shouldRemove: false, shouldMemo: true }
// 	}
//
// 	if (screenValue < .98 && screenValue >= .1) {
// 		// overlays
// 		return { shouldRemove: true, shouldMemo: true }
// 	}
//
// 	if (screenValue <= .03 && element.offsetTop > 100) {
// 		// buttons and side/social menus
// 		return { shouldRemove: false, shouldMemo: true }
// 	}
//
// 	if (element.offsetHeight >= 160 && element.offsetWidth >= 300) {
// 		// scrolling videos in the articles
// 		return { shouldRemove: true, shouldMemo: true }
// 	}
//
// 	if (offsetBot <= 212) {
// 		// bottom notification
// 		return { shouldRemove: true, shouldMemo: true }
// 	}
//
// 	if (screenValue <= .1 && element.offsetTop > 100) {
// 		// buttons and side/social menus
// 		return { shouldRemove: false, shouldMemo: true }
// 	}
//
// 	return { shouldRemove: true, shouldMemo: false }
// }
