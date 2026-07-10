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

// set once any mode hides, moves or converts a popup on this page; gates the
// scroll-lock wrapper release so untouched pages are never restyled
let popupsActedOn = false;
let lastUnlockCheck = 0;

// helpers
const getStyle = (elem, property) =>
	window.getComputedStyle(elem, null).getPropertyValue(property);

const setPropImp = (elem, prop, val) => elem.style.setProperty(prop, val, "important");

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
		clearVerifyTimers();
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

// Merely hiding a showModal() dialog leaves it in the top layer and keeps the
// whole page inert (unclickable); open popovers linger in the top layer too.
// Close them properly before hiding so the page becomes interactive again.
const releaseTopLayer = element => {
	try {
		if (element.nodeName === "DIALOG" && element.open) {
			element.close();
			return true;
		}
	} catch {
		// dialog may be detached already
	}

	try {
		if (element.matches("[popover]") && element.matches(":popover-open")) {
			element.hidePopover();
			return true;
		}
	} catch {
		// :popover-open unsupported means there are no popovers to close
	}

	return false;
};

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

// Popups usually lock scrolling on <html>/<body> (handled in removeOverflow),
// but many sites lock a full-page wrapper instead (#app { height: 100vh;
// overflow: hidden }), leaving the page frozen after the popup is gone.
// Only acts once a popup was actually hidden or moved: app shells (editors,
// chats) use the same pattern legitimately and must stay untouched - their
// wrappers don't overflow anyway, since inner panes scroll themselves.
const unlockScrollContainers = (statsEnabled, state, doc, body) => {
	if (!popupsActedOn) return state;

	// scrollHeight forces layout, don't hammer it on mutation-heavy pages
	const now = Date.now();
	if (now - lastUnlockCheck < 250) return state;
	lastUnlockCheck = now;

	// the page already scrolls - nothing is locked
	if (doc.scrollHeight > window.innerHeight + 60) return state;

	let current = body;
	for (let depth = 0; depth < 5; depth++) {
		let wrapper = null;
		for (const child of current.children) {
			if (!isDecentElem(child)) continue;
			const childPos = getStyle(child, "position");
			if (childPos === "fixed" || childPos === "sticky") continue;
			const rect = child.getBoundingClientRect();
			// the wrapper that visually is the page
			if (
				rect.height >= window.innerHeight * 0.85 &&
				rect.width >= window.innerWidth * 0.5
			) {
				wrapper = child;
				break;
			}
		}
		if (!wrapper) return state;

		const overflowY = getStyle(wrapper, "overflow-y");
		if (
			(overflowY === "hidden" || overflowY === "clip") &&
			wrapper.scrollHeight > wrapper.clientHeight + 100
		) {
			// the usual lock is a viewport-sized height cap plus hidden overflow;
			// releasing the cap lets the page grow while keeping the site's
			// overflow-x clipping (horizontal-scrollbar protection) intact
			setPropImp(wrapper, "height", "auto");
			setPropImp(wrapper, "max-height", "none");
			if (wrapper.scrollHeight > wrapper.clientHeight + 100)
				// height wasn't the constraint (e.g. inset-positioned wrapper):
				// release the clipping itself - both axes, or the visible/hidden
				// pair rule would just turn the wrapper into a scroll container
				setPropImp(wrapper, "overflow", "unset");
			if (statsEnabled) state = addCountToStats(state);
		}

		// keep walking down: nested wrappers can each carry their own lock
		current = wrapper;
	}

	return state;
};

// --- sweep verification: check the outcome after acting, not just act ---
// Two passes per sweep: one right after the page settles, one late enough to
// catch consent scripts injecting after load.
const VERIFY_FIRST_MS = 800;
const VERIFY_SECOND_MS = 3000;
let verifyTimers = [];

// elements classified while the user was interacting - never escalate on these
const userInvokedElems = new WeakSet();

const clearVerifyTimers = () => {
	verifyTimers.forEach(clearTimeout);
	verifyTimers = [];
};

const scheduleVerify = fn => {
	clearVerifyTimers();
	verifyTimers.push(setTimeout(fn, VERIFY_FIRST_MS));
	verifyTimers.push(setTimeout(fn, VERIFY_SECOND_MS));
};

const undoLargestHidden = () => {
	const hidden = [...document.querySelectorAll('[data-popupoff="bl"]')];
	if (!hidden.length) return false;
	// the app wrapper that blanks a page dwarfs any real popup in content size
	hidden.sort(
		(a, b) => b.getElementsByTagName("*").length - a.getElementsByTagName("*").length
	);
	const candidate = hidden[0];
	candidate.style.removeProperty("display");
	candidate.removeAttribute("data-popupoff");
	// the mutation watcher would hide it right back - opt it out for good
	candidate.setAttribute("data-popupoff-ignore", "");
	return true;
};

// Blank-page check: hiding a fixed app wrapper takes the whole page with it.
// If the text that was there before the sweep is gone afterwards, restore
// hidden elements (biggest first) until the content is back.
const verifyNotBlank = (state, statsEnabled, initialTextLength, body) => {
	// text-light pages (players, maps, galleries) can't be judged this way
	if (initialTextLength < 300) return state;
	for (let i = 0; i < 3; i++) {
		if ((body.innerText || "").length >= initialTextLength * 0.1) return state;
		if (!undoLargestHidden()) return state;
		if (statsEnabled) state = { ...state, restored: parseFloat(state.restored) + 1 };
	}
	return state;
};

// Which fixed element owns the center of the viewport? Resolved through
// elementFromPoint so stacking order is the browser's answer, not a guess.
const findCenterBlocker = doc => {
	const w = window.innerWidth;
	const h = window.innerHeight;
	const points = [
		[w / 2, h / 2],
		[w / 2, h * 0.3],
		[w / 2, h * 0.7],
		[w * 0.3, h / 2],
		[w * 0.7, h / 2],
	];
	const owners = new Map();
	for (const [x, y] of points) {
		let elem = document.elementFromPoint(x, y);
		// walk up to the fixed/sticky container owning this point
		while (elem && elem !== document.body && elem !== doc) {
			const pos = getStyle(elem, "position");
			if (pos === "fixed" || pos === "sticky") break;
			elem = elem.parentElement;
		}
		if (!elem || elem === document.body || elem === doc) continue;
		owners.set(elem, (owners.get(elem) || 0) + 1);
	}
	for (const [elem, count] of owners) {
		if (count >= 4) return elem;
	}
	return null;
};

// Escalation: the classifier kept everything it thought legitimate, yet
// something still blocks reading. Acts only on hard evidence, and never on
// anything the user invited or is interacting with.
const escalateOnBlocker = (state, statsEnabled, doc, body) => {
	// fullscreen video, or a user mid-interaction: off limits
	if (document.fullscreenElement || wasRecentGesture()) return state;
	// real content must exist behind the blocker: app pages (maps, editors)
	// are exactly viewport-sized and must never be "cleaned"
	if (Math.max(doc.scrollHeight, body.scrollHeight) < window.innerHeight * 1.5)
		return state;

	const blocker = findCenterBlocker(doc);
	if (!blocker) return state;
	if (blocker.getAttribute("data-popupoff") === "notification") return state;
	if (userInvokedElems.has(blocker)) return state;
	if (isIgnoredElem(blocker)) return state;
	if (blocker.querySelector("video")) return state; // theater-mode players
	try {
		// hover-opened UI (mega menus) lives only while hovered
		if (blocker.matches(":hover")) return state;
	} catch {
		// non-element nodes
	}

	const rect = blocker.getBoundingClientRect();
	if (rect.width * rect.height < window.innerWidth * window.innerHeight * 0.35)
		return state;

	if (getStyle(blocker, "display") !== "none")
		blocker.setAttribute("data-popupoff", "bl");
	if (statsEnabled) state = addItemToStats(blocker, state);
	releaseTopLayer(blocker);
	popupsActedOn = true;
	setPropImp(blocker, "display", "none");

	// walls usually come with a scroll lock - clean that up in the same pass
	state = removeOverflow(statsEnabled, state, doc, body);
	return unlockScrollContainers(statsEnabled, state, doc, body);
};

const verifySweep = (state, statsEnabled, doc, body, opts) => {
	// our own damage first: a blank page beats any popup concern
	if (opts.undoBlank)
		state = verifyNotBlank(state, statsEnabled, opts.initialTextLength, body);
	if (opts.escalate) state = escalateOnBlocker(state, statsEnabled, doc, body);
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
	// batch all computed-style reads before the checks run: the checks write
	// styles, and every write after a read forces a full style recalc - reading
	// everything up front cuts that to one recalc per sweep instead of per write
	const reads = arr.map(element => ({
		pos: getStyle(element, "position"),
		disp: getStyle(element, "display"),
		filter: getStyle(element, "filter"),
		webkitFilter: getStyle(element, "-webkit-filter"),
	}));
	arr.forEach((element, i) => checkElem(element, reads[i]));
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

const additionalChecks = (element, state, statsEnabled, shouldRestoreCont, checkElem, pre) => {
	const filterVal = pre ? pre.filter : getStyle(element, "filter");
	const webkitFilterVal = pre ? pre.webkitFilter : getStyle(element, "-webkit-filter");
	if (filterVal !== "none" || webkitFilterVal !== "none") {
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
	"the guardian",
];

// consent-manager iframes carry no readable text - recognize them by src
const consentIframeSelector = [
	'iframe[src*="consent"]',
	'iframe[src*="sourcepoint"]',
	'iframe[src*="privacy-mgmt"]',
	'iframe[src*="onetrust"]',
	'iframe[src*="cookielaw"]',
	'iframe[src*="cookiebot"]',
	'iframe[src*="didomi"]',
	'iframe[src*="quantcast"]',
	'iframe[src*="trustarc"]',
	'iframe[src*="usercentrics"]',
].join(",");

const getVisibleText = element => {
	// innerText skips <script>/<style> and hidden nodes, unlike innerHTML,
	// which also matched class names, URLs and inline JSON blobs
	const text = element.innerText != null ? element.innerText : element.textContent;
	return (text || "").toLowerCase();
};

const contentEasyCheck = element => {
	const ariaLabel = element.getAttribute("aria-label") || "";
	const textCont = `${ariaLabel.toLowerCase()} ${getVisibleText(element)}`;
	if (forbWordsEasy.some(v => textCont.includes(v))) return true;

	try {
		return (
			element.matches(consentIframeSelector) ||
			element.querySelector(consentIframeSelector) != null
		);
	} catch {
		return false;
	}
};

// User gesture tracking: a modal that shows up right after a click or
// keypress is user-invoked (login, search, menu) and must be left alone;
// one appearing out of nowhere (page load, timer, scroll) was not asked for.
const GESTURE_WINDOW_MS = 2500;
let lastGestureTime = 0;
let gestureTrackingActive = false;

const trackUserGestures = () => {
	if (gestureTrackingActive) return;
	gestureTrackingActive = true;
	const stamp = () => {
		lastGestureTime = Date.now();
	};
	window.addEventListener("pointerdown", stamp, true);
	window.addEventListener("keydown", stamp, true);
};

const wasRecentGesture = () => Date.now() - lastGestureTime < GESTURE_WINDOW_MS;

// language-independent modal fingerprints: proper dialog markup, or the
// absurd z-index spam overlays use to win the stacking war
const SPAM_Z_INDEX = 1000000;

const hasModalSignals = element => {
	if (element.nodeName === "DIALOG") return true;
	if (element.getAttribute("aria-modal") === "true") return true;

	const role = element.getAttribute("role");
	if (role === "dialog" || role === "alertdialog") return true;

	try {
		if (
			element.querySelector(
				'dialog[open], [aria-modal="true"], [role="dialog"], [role="alertdialog"]'
			)
		)
			return true;
	} catch {
		// non-element nodes
	}

	const zIndex = parseInt(getStyle(element, "z-index"), 10);
	return !isNaN(zIndex) && zIndex >= SPAM_Z_INDEX;
};

const unsolicitedModalCheck = element => !wasRecentGesture() && hasModalSignals(element);

const positionCheckTypeI = (element, windowArea) => {
	// getBoundingClientRect is viewport-true even inside transformed ancestors,
	// where offsetTop/offsetLeft are relative to the transformed parent
	const rect = element.getBoundingClientRect();

	if (rect.height === 0 || rect.width === 0) {
		if (contentEasyCheck(element))
			return { shouldRemove: true, shouldMemo: true };
		else
			return { shouldRemove: true, shouldMemo: false };
	}

	const layoutArea = rect.height * rect.width;
	const screenValue = roundToTwo(layoutArea / windowArea);
	const offsetBot = window.innerHeight - rect.bottom;

	if (screenValue >= 0.98) {
		// case 1: overlay on the whole screen - should block
		// case 2: video in full screen mode - should not
		return {
			shouldRemove:
				contentEasyCheck(element) ||
				unsolicitedModalCheck(element) ||
				videoCheck(element),
			shouldMemo: true,
		};
	}

	if (rect.top <= 100 && rect.height <= 250 && rect.width > 640) {
		// popular notification
		if (element.id === "onesignal-slidedown-container")
			return { shouldRemove: true, shouldMemo: true };

		// it's a header!
		return { shouldRemove: false, shouldMemo: true };
	}

	if (rect.left <= 0 && rect.width <= 360 && screenValue >= 0.1) {
		// youtube/facebook sidebar
		return { shouldRemove: false, shouldMemo: true };
	}

	if (screenValue < 0.98 && screenValue >= 0.1) {
		// overlays
		return {
			shouldRemove: contentEasyCheck(element) || unsolicitedModalCheck(element),
			shouldMemo: true,
		};
	}

	// screenValue is viewport-relative and shrinks on big monitors: a 600x400
	// newsletter modal covers 16% of a laptop screen but 3% of a 4K one, which
	// used to land it in the "small elements" bucket below. Judge mid-page
	// elements by absolute size and horizontal centering instead.
	const elemCenter = rect.left + rect.width / 2;
	if (
		rect.top > 100 &&
		rect.width >= 280 &&
		rect.height >= 180 &&
		Math.abs(elemCenter - window.innerWidth / 2) <= 48
	) {
		return {
			shouldRemove: contentEasyCheck(element) || unsolicitedModalCheck(element),
			shouldMemo: true,
		};
	}

	if (screenValue <= 0.02 && rect.top > 100) {
		// buttons and side/social menus
		return { shouldRemove: false, shouldMemo: true };
	}

	if (offsetBot <= 212) {
		// bottom notification
		return {
			shouldRemove: contentEasyCheck(element) || unsolicitedModalCheck(element),
			shouldMemo: true,
		};
	}

	if (screenValue <= 0.1 && rect.top > 100) {
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
	state = removeOverflow(statsEnabled, state, doc, body);
	return unlockScrollContainers(statsEnabled, state, doc, body);
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
			// the converted wrapper may itself be the scroll lock
			popupsActedOn = true;
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
	const processedElems = new Set();
	const len = mutations.length;
	for (let i = 0; i < len; i++) {
		// stop and disconnect if oversized
		const shouldStop = prevLoop();
		if (shouldStop) break;

		const mutation = mutations[i];

		if (mutation.attributeName === "data-popupoff") continue;

		if (!shouldRestoreCont) {
			// skip if processed
			if (processedElems.has(mutation.target)) continue;
			processedElems.add(mutation.target);
		} else {
			state = checkForRestore(mutation, statsEnabled, state, memoize);
		}

		// check element and its siblings
		state = checkMutation(mutation, statsEnabled, state, doc, body, checkElem);
	}
	return state;
};
