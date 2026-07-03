# PopUpOFF BROWSER EXTENSION

- Download for:
  - [Chrome / Chromium](https://chrome.google.com/webstore/detail/popupoff-popup-blocker/ifnkdbpmgkdbfklnbfidaackdenlmhgh)
  - [Firefox](https://addons.mozilla.org/en-GB/firefox/addon/popupoff/)
  - [Opera](https://addons.opera.com/en-gb/extensions/details/popupoff-popup-and-overlay-blocker/)
  - [Edge](https://microsoftedge.microsoft.com/addons/detail/popupoff-popup-and-over/elacdkdmimelpnkbccdanmnabhajdccm)
- [Website](http://popupoff.org/)
- [Twitter](https://twitter.com/RomanistHere)
- [Support project / Donate](https://popupoff.org/#donate)

# Mechanics

#### Remove

There are two modes removing fixed elements from the screen. Aggressive mode and Moderate one. Aggressive is plain and straight: loop (in future traverse) through all the elements on the page, find naughty ones (position: fixed/sticky), make some additional checks, remove it.

Moderate on the other hand was super hard to develop (it still is), because I want it to be default mode, that won't block anything but "bad" popups. There are, of course, "good" ones. Send a tweet? Login to a website? Display some important info? Yeah these are popups as well. I developed a very smart algorithm to detect badness of the given popup, but there is still room for growth. So if you find a website where PopUpOFF blocks something important or doesn't block something you expect it to block - please, let me know. [RomanistHere@pm.me](mailto:RomanistHere@pm.me) or [Twitter](https://twitter.com/RomanistHere). It matters!

The Moderate heuristic classifies each fixed element by viewport-true geometry (`getBoundingClientRect`), absolute size and centering, then decides the ambiguous cases by content: visible text matched against known phrases, consent-manager iframes, and language-independent modal markup (`<dialog>`, `aria-modal`, `role="dialog"`, extreme z-index). Modals that appear right after the user's own click or keypress are considered invited and left alone. Native `showModal()` dialogs are closed (not just hidden) so the page doesn't stay inert, and scroll locks sitting on page wrappers (`#app { height: 100vh; overflow: hidden }`) are released once a popup was actually removed.

#### Prevent

There is also [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) that allows PopUpOFF to check when some changes applied to the DOM. It re-checks added/changed elements with the algorithm to understand if it's a bad guy now. Made some interesting memoization with the WeakMap for Moderate mode.

#### Tracking

Tracking is completely removed since 1.1.6

#### Prevent paid content from hiding (Anti-paid) - since 1.1.6

Some newspapers are showing you an article you want to read and then remove half of it. Now it's in the past. There is an (experimental) option to prevent reduction of content after download. [More info here](https://romanisthere.github.io/posts/prev-cont-2/)

#### Move popups to the top/bottom of the page instead of removing (Delicate) - since 2.1.0

Changes `position: fixed` to `position: absolute/static/relative` based on an option parameter. If you want to keep popups on the page, just don't want them to block the view. Overlays are usually moved to the top or the bottom of the pages as a result. Experimental.

# Development

Requirements: Node.js 22+

```bash
npm ci                # install tooling
npm run lint          # eslint over the whole codebase
npm run build         # builds dist/chrome and dist/firefox
npm run lint:firefox  # addons-linter (web-ext) over the firefox build
npm test              # builds, then runs the Playwright end-to-end tests
```

Versioning, packaging, store uploads and the release checklist are documented in [RELEASING.md](RELEASING.md).

#### Structure

- The repository root is the extension source; the root `manifest.json` is the Chrome one.
- `scripts/build.mjs` produces both browser builds in `dist/`. The Firefox build is derived from the same source: event-page background instead of a service worker, the published AMO id, `all_frames` content scripts and `source=firefox` link params. The old separate `firefox` branch is superseded by this.
- `constants/data.js` is the single source of truth for the default website lists. It is loaded both as the first content script and as a side-effect import from the ES modules (background, popup, options).

#### Testing

To try it in a browser, load `dist/chrome` (or the repo root) via `chrome://extensions` → Load unpacked, or run `npx web-ext run --source-dir dist/firefox` for Firefox.

End-to-end tests live in `tests/e2e` and run against small fixture pages in `tests/fixtures` (cookie wall, sticky header, delayed popup). When changing the heuristics, add a fixture page encoding the new case so regressions get caught. In sandboxes that can't download browsers, point the tests at an existing binary: `CHROMIUM_PATH=/path/to/chrome npm test`.

#### [Changelog](https://popupoff.org/changelog):

Unreleased

- Moderate mode detects popups by language-independent signals - dialog markup (`aria-modal`, `role="dialog"`, native `<dialog>`) and stacking-war z-indexes - so non-English cookie walls and newsletter modals are caught; modals opened by the user's own click or keypress stay untouched
- Moderate mode judges mid-page elements by absolute size and centering: the same popup is now caught on large monitors where its share of the screen is small; geometry is measured viewport-true, fixing misclassification inside transformed containers
- Word matching runs on the visible text instead of raw markup (fewer false hits on class names and inline scripts) and recognizes consent-manager iframes by their src
- Popups built on `showModal()` dialogs are properly closed instead of just hidden - previously the page could stay inert (unclickable) after removal; open popovers are closed as well
- Scroll locks sitting on a page wrapper (`#app { height: 100vh; overflow: hidden }`) are released after a popup was removed; only `<html>`/`<body>` locks were handled before, leaving some pages frozen

2.1.4

- Per-site settings and stats moved to local storage: fixes "storage full" errors and removes the cap on saved websites (existing data migrates automatically; settings export/import understands both old and new backups)
- UI injected by other extensions (password managers, PrintFriendly, Print Edit WE, Tridactyl, Pocket, Simple Translate...) is no longer treated as a popup; any extension can also opt out explicitly with a data-popupoff-ignore attribute on its elements
- New "Ignored elements" setting: add your own CSS selectors (one per line) and PopUpOFF will never hide or move anything matching them - covers whatever the built-in list misses
- The keyboard shortcut now uses the browser's commands API: the combination is changeable in the browser's shortcut settings and no longer misfires on Alt+Shift+X
- Popups injected after a delay on busy pages are caught again: the mutation watcher pauses under heavy load and rescans on resume instead of switching off for good
- "Turn OFF" no longer applies any global CSS - pages are left fully untouched
- Dropped the "tabs" permission, removing the "Read your browsing history" install warning - it was never needed
- Stats bookkeeping no longer disables the browser's back/forward cache (faster back-button navigation everywhere)
- Fixed the toolbar button staying disabled after visiting browser pages, the badge reading the wrong window's tab, and duplicated context-menu handlers
- One source for Chrome and Firefox: the Firefox build is now generated, manifest v3, with a working event-page background

2.1.1 - 2.1.3

- Minor fixes, for firefox mainly
- Source added to links

2.1.0

- Delicate mode
- Import/export settings
- Context menu is optional
- Antipaid improved
- Removed possibility to adjust strictness of Moderate mode
- Dormant renamed to "Turn OFF" for clarity
- Dedicated tutorial page on install (on new website)
- Settings icon to access settings from popup
- Other minor changes and improvements

2.0.2

- Improvements in Moderate mode
- Improvements in anti-paid
- Added "reset to default" buttons
- Added info at the options page
- Changes in storing of the websites
- Removed auto reload when activate Dormant mode
- Add quiz on uninstall

2.0.0 - 2.0.1

- Redesign (of everything)
- Mass refactorings
- Automode (finally!)
- Other fixes and improvements

1.1.9 - 1.1.10

- some minor improvements and fixes (I forgot to write the updates back these days so I don't remember, nothing interesting, I guess)

1.1.8

- fix issues
- minor improvements
- recognize and remove gradient overlays
- update tutorial

1.1.7

- instructions link updated
- prevent paid content improved
- stats fixed

1.1.6

- new (experimental) feature: prevent paid content from hiding
- new feature: collect and display stats
- remove all tracking and analytics systems
- activate/deactivate on shortcut (Alt + x)
- changes in design and performance

1.1.5

- add notification after activating from keyboard shortcut
- add Google services to list of forbidden websites

1.1.4

- add smart recognizing for hidden content
- show 1.1.3 update on browser startup

1.1.3

- add icon displaying active mode
- add keyboard shortcut "Alt + x"(Cmd + shift + x for Mac) activating chosen within options page mode
- refactor code, improve performance, restructure
- fix bug with multiple browsers used for a single account

1.1.2

- add blur detection and removing to each mode

1.1.1

- add tutorial
- add developer's supervision - list of websites where user can't use extension by default settings
- add options page with opportunity to disable supervision and repeat tutorial
- add messages in popup - reload button and link to options page

1.1.0

- rework of easy mode. 3 steps check - position -> content -> semantic
- prevent script from executing if there are problems with memory
- improve performance
- fixed bug: after enable "easy" mode activated "hard" one
- fixed bug: wrong address writing to storage

1.0.4

- remove "everywhere" mode due feedback
- element's check is tightened

1.0.3

- improve performance
- fix minor bugs

1.0.2

- release version - do not ask why there's no 1.0.0

I enjoy creating something valuable. It isn't perfect, it's probably never meant to be, still I'm here, and I'm going to give yet another try. Thank you for your support. I sincerely believe we can make this world better.

If you have something to say to me, offer, complaint or just thank you, write to me right here: [RomanistHere@pm.me](mailto:romanisthere@pm.me)

[Support project / Donate](https://popupoff.org/#donate)
