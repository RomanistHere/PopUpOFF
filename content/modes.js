const getInitialState = statsEnabled => {
	return statsEnabled
		? {
				windowArea: parseFloat(window.innerHeight * window.innerWidth),
				cleanedArea: 0,
				numbOfItems: 0,
				restored: 0,
		  }
		: {
				windowArea: parseFloat(window.innerHeight * window.innerWidth),
		  };
};

const hardMode = ({ statsEnabled, shouldRestoreCont }) => {
	// state
	let state = getInitialState(statsEnabled);

	// unmutable
	const doc = document.documentElement;
	const body = document.body;
	const elems = body.getElementsByTagName("*");

	// methods
	const checkElem = element => {
		if (!isDecentElem(element))
			return;

		const elemPosStyle = getStyle(element, "position");
		if (elemPosStyle === "fixed" || elemPosStyle === "sticky") {
			const isFixed = checkToConvertToStatic({ elem: element });
			if (isFixed)
				return;

			if (element.getAttribute("data-popupoff") === "notification")
				return;

			if (getStyle(element, "display") !== "none")
				element.setAttribute("data-popupoff", "bl");

			if (statsEnabled) state = addItemToStats(element, state);

			setPropImp(element, "display", "none");
		}

		state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem);
	};

	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1600) {
			wasNotStoped = removeDomWatcher(domObserver, wasNotStoped, body, action);
			return true;
		}
		infiniteLoopPreventCounter++;
		if (myTimer === 0) {
			myTimer = setTimeout(() => {
				infiniteLoopPreventCounter = 0;
				clearTimeout(myTimer);
				myTimer = 0;
			}, 1000);
		}
		return false;
	};

	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				state = watchMutations(
					mutations,
					shouldRestoreCont,
					statsEnabled,
					state,
					doc,
					body,
					prevLoop,
					checkElem
				);
			});
		}

		domObserver.observe(doc, {
			childList: true,
			subtree: true,
			attributes: true,
		});
	};

	const action = elems => {
		state = removeOverflow(statsEnabled, state, doc, body);
		checkElems(elems, checkElem);
		removeListeners();
		if (shouldRestoreCont) state = findHidden(state, statsEnabled, doc);
		watchDOM();
	};

	// Let the hunt begin!
	action(elems);
	// statistics
	if (statsEnabled) {
		setNewData(state);
		if (!beforeUnloadAactive) {
			window.addEventListener("beforeunload", () => {
				setNewData(state);
			});
			beforeUnloadAactive = true;
		}
	}
};

const easyMode = ({ statsEnabled, shouldRestoreCont, positionCheck }) => {
	// state
	let state = getInitialState(statsEnabled);
	// unmutable
	const doc = document.documentElement;
	const body = document.body;
	const elems = body.getElementsByTagName("*");
	const memoize = new WeakMap();

	const checkElem = element => {
		if (!isDecentElem(element))
			return;

		const elemPosStyle = getStyle(element, "position");
		if (elemPosStyle === "fixed" || elemPosStyle === "sticky") {
			const isFixed = checkToConvertToStatic({ elem: element });
			if (isFixed)
				return;

			if (element.getAttribute("data-popupoff") === "notification")
				return;

			const memoized = memoize.has(element);
			const { shouldRemove, shouldMemo } = memoized
				? { shouldRemove: memoize.get(element), shouldMemo: false }
				: positionCheck(element, state.windowArea);

			if (shouldRemove) {
				if (statsEnabled)
					state = addItemToStats(element, state);

				if (getStyle(element, "display") !== "none")
					element.setAttribute("data-popupoff", "bl");

				setPropImp(element, "display", "none");
			}

			if (!memoized && shouldMemo)
				memoize.set(element, shouldRemove);
		}

		state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem);
	};
	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1200) {
			wasNotStoped = removeDomWatcher(domObserver, wasNotStoped, body, action);
			return true;
		}
		infiniteLoopPreventCounter++;
		if (myTimer === 0) {
			myTimer = setTimeout(() => {
				infiniteLoopPreventCounter = 0;
				clearTimeout(myTimer);
				myTimer = 0;
			}, 1000);
		}
		return false;
	};

	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				state = watchMutations(
					mutations,
					shouldRestoreCont,
					statsEnabled,
					state,
					doc,
					body,
					prevLoop,
					checkElem,
					memoize
				);
			});
		}

		domObserver.observe(doc, {
			childList: true,
			subtree: true,
			attributes: true,
		});
	};

	const action = elems => {
		state = removeOverflow(statsEnabled, state, doc, body);
		checkElems(elems, checkElem);
		removeListeners();
		if (shouldRestoreCont) state = findHidden(state, statsEnabled, doc);
		watchDOM();
	};

	// Let the hunt begin!
	action(elems);
	// statistics
	if (statsEnabled) {
		setNewData(state);
		if (!beforeUnloadAactive) {
			window.addEventListener("beforeunload", () => {
				setNewData(state);
			});
			beforeUnloadAactive = true;
		}
	}
};

const staticMode = ({ statsEnabled, shouldRestoreCont, staticSubMode }) => {
	// state
	let state = getInitialState(statsEnabled);

	// unmutable
	const doc = document.documentElement;
	const body = document.body;
	const elems = body.getElementsByTagName("*");

	// methods
	const checkElem = element => {
		if (!isDecentElem(element))
			return;

		const elemPosStyle = getStyle(element, "position");

		if (elemPosStyle === "fixed" || elemPosStyle === "sticky") {
			if (element.getAttribute("data-popupoff") === "notification")
				return;

			if (getStyle(element, "display") !== "none")
				element.setAttribute("data-popupoff", "st");

			if (statsEnabled) state = addItemToStats(element, state);

			setPropImp(element, "position", staticSubMode || "relative");
		}
	};

	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > 1500) {
			wasNotStoped = removeDomWatcher(domObserver, wasNotStoped, body, action);
			return true;
		}
		infiniteLoopPreventCounter++;
		if (myTimer === 0) {
			myTimer = setTimeout(() => {
				infiniteLoopPreventCounter = 0;
				clearTimeout(myTimer);
				myTimer = 0;
			}, 1000);
		}
		return false;
	};

	const watchDOM = () => {
		if (!domObserver) {
			domObserver = new MutationObserver(mutations => {
				state = watchMutations(
					mutations,
					shouldRestoreCont,
					statsEnabled,
					state,
					doc,
					body,
					prevLoop,
					checkElem
				);
			});
		}

		domObserver.observe(doc, {
			childList: true,
			subtree: true,
			attributes: true,
		});
	};

	const action = elems => {
		state = removeOverflow(statsEnabled, state, doc, body);
		checkElems(elems, checkElem);
		removeListeners();
		if (shouldRestoreCont) state = findHidden(state, statsEnabled, doc);
		watchDOM();
	};

	// Let the hunt begin!
	action(elems);
	// statistics
	if (statsEnabled) {
		setNewData(state);
		if (!beforeUnloadAactive) {
			window.addEventListener("beforeunload", () => {
				setNewData(state);
			});
			beforeUnloadAactive = true;
		}
	}
};
