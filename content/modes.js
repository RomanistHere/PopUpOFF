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
	// how much text the page had before anything was touched - the blank-page
	// check compares against this after the sweep
	const initialTextLength = (body.innerText || "").length;

	// methods
	const checkElem = (element, pre) => {
		if (!isDecentElem(element))
			return;

		const elemPosStyle = pre ? pre.pos : getStyle(element, "position");
		if (elemPosStyle === "fixed" || elemPosStyle === "sticky") {
			if (element.getAttribute("data-popupoff") === "notification" || isIgnoredElem(element))
				return;

			const isFixed = checkToConvertToStatic({ elem: element });
			if (isFixed)
				return;

			if ((pre ? pre.disp : getStyle(element, "display")) !== "none")
				element.setAttribute("data-popupoff", "bl");

			if (statsEnabled) state = addItemToStats(element, state);

			releaseTopLayer(element);
			popupsActedOn = true;
			setPropImp(element, "display", "none");
		}

		state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem, pre);
	};

	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > MUTATION_LIMIT) {
			pauseDomWatcher(domObserver, () => action(body.getElementsByTagName("*")));
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
		state = unlockScrollContainers(statsEnabled, state, doc, body);
		scheduleVerify(() => {
			state = verifySweep(state, statsEnabled, doc, body, {
				undoBlank: true,
				initialTextLength,
			});
		});
		watchDOM();
	};

	// Let the hunt begin!
	action(elems);
	// statistics
	if (statsEnabled) {
		setNewData(state);
		if (!pagehideActive) {
			// pagehide instead of beforeunload: a beforeunload listener disables
			// the back/forward cache for every page the extension runs on
			window.addEventListener("pagehide", () => {
				setNewData(state);
			});
			pagehideActive = true;
		}
	}
};

const easyMode = ({ statsEnabled, shouldRestoreCont, positionCheck }) => {
	// the heuristic spares modals invoked by a click/keypress - track those
	trackUserGestures();
	// state
	let state = getInitialState(statsEnabled);
	// unmutable
	const doc = document.documentElement;
	const body = document.body;
	const elems = body.getElementsByTagName("*");
	const memoize = new WeakMap();
	// how much text the page had before anything was touched - the blank-page
	// check compares against this after the sweep
	const initialTextLength = (body.innerText || "").length;

	const checkElem = (element, pre) => {
		if (!isDecentElem(element))
			return;

		const elemPosStyle = pre ? pre.pos : getStyle(element, "position");
		if (elemPosStyle === "fixed" || elemPosStyle === "sticky") {
			if (element.getAttribute("data-popupoff") === "notification" || isIgnoredElem(element))
				return;

			const isFixed = checkToConvertToStatic({ elem: element });
			if (isFixed)
				return;

			const memoized = memoize.has(element);
			const { shouldRemove, shouldMemo } = memoized
				? { shouldRemove: memoize.get(element), shouldMemo: false }
				: positionCheck(element, state.windowArea);

			// remember what showed up on the user's own action: the verification
			// pass must never escalate on an invited modal
			if (!memoized && wasRecentGesture()) userInvokedElems.add(element);

			if (shouldRemove) {
				if (statsEnabled)
					state = addItemToStats(element, state);

				if ((pre ? pre.disp : getStyle(element, "display")) !== "none")
					element.setAttribute("data-popupoff", "bl");

				releaseTopLayer(element);
				popupsActedOn = true;
				setPropImp(element, "display", "none");
			}

			if (!memoized && shouldMemo)
				memoize.set(element, shouldRemove);
		}

		state = additionalChecks(element, state, statsEnabled, shouldRestoreCont, checkElem, pre);
	};
	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > MUTATION_LIMIT) {
			pauseDomWatcher(domObserver, () => action(body.getElementsByTagName("*")));
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
		state = unlockScrollContainers(statsEnabled, state, doc, body);
		scheduleVerify(() => {
			state = verifySweep(state, statsEnabled, doc, body, {
				undoBlank: true,
				escalate: true,
				initialTextLength,
			});
		});
		watchDOM();
	};

	// Let the hunt begin!
	action(elems);
	// statistics
	if (statsEnabled) {
		setNewData(state);
		if (!pagehideActive) {
			// pagehide instead of beforeunload: a beforeunload listener disables
			// the back/forward cache for every page the extension runs on
			window.addEventListener("pagehide", () => {
				setNewData(state);
			});
			pagehideActive = true;
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
	const checkElem = (element, pre) => {
		if (!isDecentElem(element))
			return;

		const elemPosStyle = pre ? pre.pos : getStyle(element, "position");

		if (elemPosStyle === "fixed" || elemPosStyle === "sticky") {
			if (element.getAttribute("data-popupoff") === "notification" || isIgnoredElem(element))
				return;

			if ((pre ? pre.disp : getStyle(element, "display")) !== "none")
				element.setAttribute("data-popupoff", "st");

			if (statsEnabled) state = addItemToStats(element, state);

			// a repositioned showModal() dialog would keep the page inert:
			// leave the top layer, then reopen it as a plain in-flow dialog
			if (element.nodeName === "DIALOG" && element.open) {
				try {
					element.close();
					element.setAttribute("open", "");
				} catch {
					// dialog may be detached already
				}
			}

			popupsActedOn = true;
			setPropImp(element, "position", staticSubMode || "relative");
		}
	};

	// watch DOM
	const prevLoop = () => {
		if (infiniteLoopPreventCounter > MUTATION_LIMIT) {
			pauseDomWatcher(domObserver, () => action(body.getElementsByTagName("*")));
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
		state = unlockScrollContainers(statsEnabled, state, doc, body);
		watchDOM();
	};

	// Let the hunt begin!
	action(elems);
	// statistics
	if (statsEnabled) {
		setNewData(state);
		if (!pagehideActive) {
			// pagehide instead of beforeunload: a beforeunload listener disables
			// the back/forward cache for every page the extension runs on
			window.addEventListener("pagehide", () => {
				setNewData(state);
			});
			pagehideActive = true;
		}
	}
};
