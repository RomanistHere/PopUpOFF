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

#### Prevent

There is also [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) that allows PopUpOFF to check when some changes applied to the DOM. It re-checks added/changed elements with the algorithm to understand if it's a bad guy now. Made some interesting memoization with the WeakMap for Moderate mode.

#### Tracking

Tracking is completely removed since 1.1.6

#### Prevent paid content from hiding (Anti-paid) - since 1.1.6

Some newspapers are showing you an article you want to read and then remove half of it. Now it's in the past. There is an (experimental) option to prevent reduction of content after download. [More info here](https://romanisthere.github.io/posts/prev-cont-2/)

#### Move popups to the top/bottom of the page instead of removing (Delicate) - since 2.1.0

Changes `position: fixed` to `position: absolute/static/relative` based on an option parameter. If you want to keep popups on the page, just don't want them to block the view. Overlays are usually moved to the top or the bottom of the pages as a result. Experimental.

# Development

#### [Changelog](https://popupoff.org/changelog):

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
