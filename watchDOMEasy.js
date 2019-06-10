"use strict";var dom_observer,dom_observer_new,myTimer,infiniteLoopPreventCounter=0,wasNotStoped=!0;function removeDomWatcher(){dom_observer&&(dom_observer.disconnect(),dom_observer=!1,wasNotStoped&&setTimeout(domWatcherEasy,3e3),wasNotStoped=!1),dom_observer_new&&dom_observer_new.disconnect()}function resetLoopCounter(){infiniteLoopPreventCounter=0,myTimer=0}function domWatcherEasy(){dom_observer||(dom_observer=new MutationObserver(function(e){for(let t=0;t<e.length;t++){if(infiniteLoopPreventCounter>400){removeDomWatcher();break}infiniteLoopPreventCounter++,myTimer||(myTimer=window.setTimeout(resetLoopCounter,1e3)),checkElemForPositionEasy(e[t].target),e[t].addedNodes.forEach(function(e){"#text"!=e.nodeName&&checkElemForPositionEasy(e)}),removeOverflow()}})),dom_observer_new||(dom_observer_new=new MutationObserver(function(e){e.forEach(function(e){removeOverflow()})})),window.location.href.includes("pinterest")?(dom_observer_new.observe(document.documentElement,{attributes:!0}),dom_observer_new.observe(document.body,{attributes:!0})):dom_observer.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0})}function checkElemForPositionEasy(e){if(e instanceof HTMLElement){"fixed"!=window.getComputedStyle(e,null).getPropertyValue("position")&&"sticky"!=window.getComputedStyle(e,null).getPropertyValue("position")||("none"!=window.getComputedStyle(e,null).getPropertyValue("display")&&e.setAttribute("data-popupoffExtension","hello"),positionCheck(e),contentCheck(e),semanticCheck(e));const t=e.querySelectorAll("*"),o=t.length;for(let e=0;e<o;e++)"fixed"!=window.getComputedStyle(t[e],null).getPropertyValue("position")&&"sticky"!=window.getComputedStyle(t[e],null).getPropertyValue("position")||("none"!=window.getComputedStyle(t[e],null).getPropertyValue("display")&&t[e].setAttribute("data-popupoffExtension","hello"),positionCheck(t[e]),contentCheck(t[e]),semanticCheck(t[e]))}}function semanticCheck(e){(["<nav","<header","search","ytmusic","searchbox","app-drawer"].some(t=>e.innerHTML.includes(t))||"NAV"==e.tagName||"HEADER"==e.tagName)&&(e.style.display=null)}function contentCheck(e){["policy","cookie","subscription","subscribe","off","sale","notification","notifications","updates","privacy","miss"].some(t=>e.innerHTML.includes(t))&&e.style.setProperty("display","none","important")}function positionCheck(e){const t=window.getComputedStyle(e,null).getPropertyValue("top").match(/[+-]?\d+(?:\.\d+)?/g)?Number(window.getComputedStyle(e,null).getPropertyValue("top").match(/[+-]?\d+(?:\.\d+)?/g)[0]):100,o=window.getComputedStyle(e,null).getPropertyValue("height").match(/[+-]?\d+(?:\.\d+)?/g)?Number(window.getComputedStyle(e,null).getPropertyValue("height").match(/[+-]?\d+(?:\.\d+)?/g)[0]):300;t>10?e.style.setProperty("display","none","important"):o+t>150&&e.style.setProperty("display","none","important")}function removeOverflow(){"hidden"==window.getComputedStyle(document.documentElement,null).getPropertyValue("overflow-y")&&document.documentElement.style.setProperty("overflow-y","unset","important"),"hidden"==window.getComputedStyle(document.body,null).getPropertyValue("overflow-y")&&document.body.style.setProperty("overflow-y","unset","important"),"fixed"!=window.getComputedStyle(document.documentElement,null).getPropertyValue("position")&&"absolute"!=window.getComputedStyle(document.documentElement,null).getPropertyValue("position")||document.documentElement.style.setProperty("position","relative","important"),"fixed"!=window.getComputedStyle(document.body,null).getPropertyValue("position")&&"absolute"!=window.getComputedStyle(document.body,null).getPropertyValue("position")||document.body.style.setProperty("position","relative","important")}domWatcherEasy();
