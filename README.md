# [PopUpOFF](https://chrome.google.com/webstore/detail/popupoff-popup-blocker/ifnkdbpmgkdbfklnbfidaackdenlmhgh)
### [Here](https://romanisthere.github.io/PopUpOFF-Website/index.html#2.0) you can read information/guide for using it.
### [Follow](https://twitter.com/RomanistHere) updates to stay in touch.
#### It would interest me if I were you :)
# Mechanics
#### Remove
There are two modes removing fixed elements from the screen. Aggressive mode and Moderate one. Aggressive is plain and straight: loop (in future traverse) through all the elements on the page, find naughty ones (position: fixed/sticky), make some additional checks, remove it.

Moderate on the other hand was super hard to develop (it still is), because I want it to be default mode, that won't block anything but "bad" popups. There are, of course, "good" ones. Send a tweet? Login to a website? Display some important info? Yeah these are popups as well. I developed a very smart algorithm to detect badness of the given popup, but there is still room for growth. So if you find a website where PopUpOFF blocks something important or doesn't block something you expect it to block - please, let me know. RomanistHere@gmail.com or [Twitter](https://twitter.com/RomanistHere). It matters!</br></br>
#### Prevent
There is also [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) that allows PopUpOFF to check when some changes applied to the DOM. It re-checks added/changed elements with the algorithm to understand if it's a bad guy now. Made some interesting memoization with the WeakMap for Moderate mode.</br></br>
#### Tracking
Tracking is completely removed since 1.1.6</br></br>
#### Prevent paid content from hiding (Anti-paid) - since 1.1.6
Some newspapers are showing you an article you want to read and then remove half of it. Now it's in the past. There is an (experimental) option to prevent reduction of content after download. [More info here](https://romanisthere.github.io/posts/prev-cont-2/) </br></br>
#### [Changelog](https://romanisthere.github.io/apps/popupoff/updates/):
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
- release version - do not ask why</br></br>

I enjoy creating something valuable. It isn't perfect, it is probably never gonna be, still I'm here and I'm going to give another try. Thank you for your support. I sincerely believe we can make this world better.</br></br>
If you have something to say to me, offer, complaint or just thank you, write to me right here: RomanistHere@gmail.com </br></br>
Donate: https://www.donationalerts.com/r/romanisthere
