import js from "@eslint/js";
import globals from "globals";

// content scripts are plain (non-module) scripts sharing one global lexical scope,
// so symbols defined in one file are used in the others (load order: constants/data.js,
// content/helpers.js, content/modes.js, content/setup.js - see manifest.json)
const contentScriptGlobals = Object.fromEntries(
	[
		// constants/data.js
		"defWebsites",
		"defPreventContArr",
		"extensionUITokens",
		// content/helpers.js
		"pagehideActive",
		"isCSSAppended",
		"isSiteFixCSSAppended",
		"domObserver",
		"MUTATION_LIMIT",
		"infiniteLoopPreventCounter",
		"myTimer",
		"watcherPauseCount",
		"watcherResumeTimer",
		"getStyle",
		"setPropImp",
		"checkIsInArr",
		"getPureURL",
		"roundToTwo",
		"debounce",
		"getStorageData",
		"setStorageData",
		"getStorageLocal",
		"setStorageLocal",
		"setWebsites",
		"getWebsites",
		"disconnectObservers",
		"restoreFixedElems",
		"modeChangedToBg",
		"fixStats",
		"setNewData",
		"addCountToStats",
		"addItemToStats",
		"removeOverflow",
		"removeListeners",
		"checkElems",
		"unhide",
		"findHidden",
		"detectGrad",
		"additionalChecks",
		"isDecentElem",
		"isOtherExtensionUI",
		"extUIIframeSelector",
		"applySiteFixCSS",
		"videoCheck",
		"forbWordsEasy",
		"forbWords",
		"allowedWords",
		"contentEasyCheck",
		"contentCheck",
		"contentUnlockCheck",
		"positionCheckTypeI",
		"checkElemWithSibl",
		"pauseDomWatcher",
		"checkMutation",
		"unsetHeight",
		"checkToConvertToStatic",
		"restoreNode",
		"checkForRestore",
		"watchMutations",
		// content/modes.js
		"getInitialState",
		"hardMode",
		"easyMode",
		"staticMode",
		// content/setup.js
		"appState",
		"modes",
		"startMode",
		"initMode",
		"changeMode",
		"notifTimeout",
		"textItems",
		"createNotification",
		"sendStats",
	].map(name => [name, "writable"])
);

export default [
	{
		ignores: ["dist/", "node_modules/", "playwright-report/", "test-results/"],
	},
	js.configs.recommended,
	{
		rules: {
			"no-empty": ["error", { allowEmptyCatch: true }],
			"no-unused-vars": ["error", { args: "none" }],
		},
	},
	{
		// extension ES modules
		files: ["background/**/*.js", "constants/functions.js", "options/**/*.js", "popup/**/*.js"],
		languageOptions: {
			sourceType: "module",
			globals: { ...globals.browser, ...globals.webextensions },
		},
	},
	{
		// content scripts (and the shared data file they rely on) are classic scripts
		files: ["content/**/*.js", "constants/data.js"],
		languageOptions: {
			sourceType: "script",
			globals: {
				...globals.browser,
				...globals.webextensions,
				cloneInto: "readonly", // firefox-only
				...contentScriptGlobals,
			},
		},
		rules: {
			// definitions in one file are consumed by the next one
			"no-unused-vars": "off",
			// the globals above are defined by these very files
			"no-redeclare": ["error", { builtinGlobals: false }],
		},
	},
	{
		// node tooling: build script, tests, configs
		// (tests also reference browser globals inside page.evaluate callbacks)
		files: ["scripts/**/*.mjs", "tests/**/*.mjs", "*.config.js"],
		languageOptions: {
			sourceType: "module",
			globals: { ...globals.node, ...globals.browser, ...globals.webextensions },
		},
	},
];
