# [PopUpOFF](https://chrome.google.com/webstore/detail/popupoff-popup-blocker/ifnkdbpmgkdbfklnbfidaackdenlmhgh)
### [Here](https://romanisthere.github.io/PopUpOFF-Website/) you can read information/guide for using it.
### I will describe developer things only below, if u're interested, welcome 
# Mechanics
#### Remove

Once you activate any mode, script find all DOM current elements for position fixed/sticky/absolute(only in 1 mode) - adds to them unique attribute if they not hidden, then hides them all. It also check body and html tags to "overflow: hidden" - this style blocking you from scrolling while popup opened - and resets.</br></br>

Easy mode has 3 step check for every fixed/sticky element - yeah, it's a little bit slowly:

- it checks for top position and height - if element is in valid range - it stays visible(headers, you know - they always at top. I wish all the developers used semantic in their work, this step would not be needed, as well as next one).
- after position check script checks for content, words like "cookie, email, addblock, etc."  and blocks please-disable-your-adblock ones. Even if it at the top of page(disguised header).
- third step checks element for tag, if it's header, nav, search, etc or it contains one of these tags, extension display it back. 

That's main difference between hard and easy mode. Easy one also giving up faster if page consisting from billions of appended elements due to possible lags. Detailed below.</br></br>

"I JUST WANT TO READ" removing absolute-positioned elements as well - during development I faced few sites, that use absolute-positioned popups with ads. Hello from 2k7. Otherwise no difference from "Hard mode".</br></br>

After all stuck elements removed, there is second part of cleaning starts to work:
#### Prevent
A lot of sites don't show you popups with spam from start. You would leave. But if you find any useful information first, you, probably, not. So part of popups can be appended to DOM, or styles can be changed dynamically. So there is MutationObserver API here. It allows you to track all DOM changes, including changing styles, new elements, event text change. Can't imagine where it could be used, except my case and, probably, when Chrome translating websites - I track it at my website, so content will always be displayed nice. </br></br>
So for every element, that changed in way, that could lead to showing you popup, got checked by same script, that used for "remove" part above. Different depended on mode. </br></br>
You could expect troubles with memory, but do not. It seems very okay. For websites, that use a lot of DOM-rebuilding, extension after few tries give up. I'm going to notify user about it in next releases, cause now it just stops to work. Can be restored by toggling mode again. </br></br>
#### Disable
Remember me added weird attribute at top of this story? When you disable mode after changes done, it will restore all hided elements. Also if you toggle easy-hard mode, headers will appear/disappear - it's on elements with this unique attributes. Do not need to reload page, as it is for most of ad blockers right now. I see my user experience better. </br></br>
#### Forbidden list of websites - since 1.1.1 
Main problem I faced with user feedback, that they would try PopUpOFF for websites like youtube. Why??? But after few accident, I forbid by default to use my extension there. You can read more about it and change it at options page.  </br></br>
#### Tutorial - since 1.1.1 
As far as I tracking through analytic, what modes my users use, I decided to add tutorial, and tell them, that I-just-want-to-read-stuff is for extreme cases, where other modes did not help. And most efficient one is "hard" one. I should rename it properly, but have no good ideas about it.</br></br>
#### Tracking
It's open source, so you can see what data I track. What mode you use, and what "forbidden" site you want to block down. Why??? So no personal data here. I will remove it all once I get all data I need to create very nice extension.</br></br>
#### Future
I want to implement automatic mode, based on user's list of blocked websites. So will be no reason to open extension and click some weird-named modes. But we need a lot of people here, so this data base will be uploading properly. But it's really far away right now.</br></br>
#### Changelog:
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
- fixed bug: wrong adress writing to storage

1.0.4
- remove "everywhere" mode due feedback
- element's check is tightened

1.0.3
- improve performance
- fix minor bugs

1.0.2
- release version - do not ask why</br></br>

There is nothing I can add to this description about technical part of mine project. I will work on it if someone will need it. I can't stand searching internet without my tool right now, though, it was worth it. </br></br>
If you have something to say to me, offer, complaint or just thank you, write to me right here: RomanistHere@gmail.com
