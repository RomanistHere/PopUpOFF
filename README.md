# [PopUpOFF](https://chrome.google.com/webstore/detail/popupoff-popup-blocker/ifnkdbpmgkdbfklnbfidaackdenlmhgh)
### [Here](https://romanisthere.github.io/PopUpOFF-Website/) you can read information/guide for using it.
### I will describe developer things only below, if u're interested, welcome 
# Mechanics
Main mechanic of this extension is to find all elements in DOM, check its style for position: fixed or sticky, if its positive and displayed on page right now (not display:none), remove it. I'm adding for these elements special data-attribute, so user can reset most of changes by just turning mode off. Do not need to reload page, as it is for most of ad blockers right now. I see my user experience better. </br></br>
Easy mode checks fixed elements for including tags like header or nav, so if fixed element is nav, or containing nav, it will not be blocked. </br></br>
Hard mode removes absolute elements as well. During development I faced websites where popups is just absolute-positioned elements in top of page, so my extension didnt work for them:(</br></br>
It removes overflow from body and html tags by setting "overflow: auto !important" in every mode.</br></br>
These things are done after user enable any mode, or after page load, if any of mode for this page are working right now. But it is not enough, some of sites adding popups or bars after user loaded page, part of it after user scroll to given point or number of seconds. So I have to check it. Lucky, there is MutationObserver API. You dont expect it work so good. But it is really nice. Even with browser perfomance. </br></br>
One thing I did not take into account, If website using same mechanics for ulpoading content (I dont really imagine why would anyone do it) it will be looping hard. So it is first thing i will provide in next update. - Fixed at 1.0.3</br></br>
There is nothing I can add to this description about technical part of mine project. I will work on it if someone will need it. I cant stand searching internet right now though, so it was worth it. </br></br>
If you have something to say to me, offer, complaint or just thank you, write to me right here: RomanistHere@gmail.com
# Story time
I was afraid about google will not allow me to block "cookie policy" popups. They probably haven't checked it yet, or it is okay. But currently my extension passed google's tests before publicating, so I hope it's fine. </br></br>
I was afraid by perfomance issues as well. After I read articles about MutationObserver, I wasn't expecting something good so far. But it seems for all sites I have tested PopUpOFF on so far pretty nice. </br></br>
One more thing I want to share about is sites where my extension break all down. It's usually some "advanced" websites, that have no annoying ads or popups, but probably users of mine extension will not get full idea right and will use it everywhere. </br></br>
I going to change "everywhere" mods with auto-mode synced with server so it checks site for popups existing at database and then enable or disable PopUpOFF here. But it's solving problem just partly. I can create array of websites where it will not work, so website will be just good, but this array is gonna be so BIG, and it could crash whole perfomance down... I have not resolved this thing out yet, so any opinion will be appreciated.</br></br>
Shortly, people I did share the whole development with: 
* Me
* I
* Myself
* [This guy](https://github.com/RomanistHere)
It was fun weekends with you I will never forget.
