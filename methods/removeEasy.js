var domObserver,domObserverLight,infiniteLoopPreventCounter=0,myTimer=0,wasNotStoped=!0,punishEasy=(e,t)=>{const o=(e,t)=>window.getComputedStyle(e,null).getPropertyValue(t),n=(e,t,o)=>e.style.setProperty(t,o,"important"),r=(e,t)=>!!e.includes(t),s=e=>{let t={...e};return isNaN(e.cleanedArea)&&(t={...m,cleanedArea:0}),isNaN(e.numbOfItems)&&(t={...m,numbOfItems:0}),isNaN(e.restored)&&(t={...m,restored:0}),t},i=e=>chrome.storage.sync.get(["stats"],t=>{const o=Math.round(e.cleanedArea/e.windowArea*10)/10;let n={cleanedArea:t.stats.cleanedArea+o,numbOfItems:t.stats.numbOfItems+e.numbOfItems,restored:t.stats.restored+e.restored};(isNaN(n.cleanedArea)||isNaN(n.numbOfItems)||isNaN(n.restored))&&(n=s(n)),chrome.storage.sync.set({stats:n})}),a=(e,t)=>{const o=e.offsetHeight*e.offsetWidth;return isNaN(o)?t:{...t,numbOfItems:t.numbOfItems+1,cleanedArea:t.cleanedArea+o}},d=e=>({...e,numbOfItems:e.numbOfItems+1});let m=e?{windowArea:window.innerHeight*window.innerWidth,cleanedArea:0,numbOfItems:0,restored:0}:null;const l=document.documentElement,c=document.body,u=c.getElementsByTagName("*"),b=()=>{"hidden"==o(l,"overflow-y")&&(n(l,"overflow-y","unset"),e&&(m=d(m))),"hidden"==o(c,"overflow-y")&&(n(c,"overflow-y","unset"),e&&(m=d(m)));const t=o(l,"position");"fixed"!=t&&"absolute"!=t||(n(l,"position","relative"),e&&(m=d(m)));const r=o(c,"position");"fixed"!=r&&"absolute"!=r||(n(c,"position","relative"),e&&(m=d(m)))},f=t=>{const r=o(t,"position");if("fixed"==r||"sticky"==r){if("notification"===t.getAttribute("data-PopUpOFF"))return;"none"!=o(t,"display")&&t.setAttribute("data-popupoffExtension","hello"),(t=>{const r=o(t,"top"),s=o(t,"height"),i=r.match(/[+-]?\d+(?:\.\d+)?/g)?Number(r.match(/[+-]?\d+(?:\.\d+)?/g)[0]):100,d=s.match(/[+-]?\d+(?:\.\d+)?/g)?Number(s.match(/[+-]?\d+(?:\.\d+)?/g)[0]):300;i>10?(e&&(m=a(t,m)),n(t,"display","none")):d+i>150&&(e&&(m=a(t,m)),n(t,"display","none"))})(t),(t=>{["policy","cookie","subscription","subscribe","off","sale","notification","notifications","updates","privacy","miss","turn off","turning off","disable","ad blocker","ad block","adblock","adblocker","advertising","bloqueador de anuncios"].some(e=>t.innerHTML.includes(e))&&(e&&(m=a(t,m)),n(t,"display","none"))})(t),(t=>{(["<nav","<header","search","ytmusic","searchbox","app-drawer"].some(e=>t.innerHTML.includes(e))||"NAV"==t.tagName||"HEADER"==t.tagName)&&(e&&(m={...m,numbOfItems:m.numbOfItems-1}),t.style.display=null)})(t)}"none"==o(t,"filter")&&"none"==o(t,"-webkit-filter")||(n(t,"filter","none"),n(t,"-webkit-filter","none"),e&&(m=a(t,m)))},p=e=>{[...e].map(f)},y=e=>{if(e instanceof HTMLElement&&(f(e),wasNotStoped)){const t=e.querySelectorAll("*");p(t)}},g=()=>{infiniteLoopPreventCounter=0,clearTimeout(myTimer),myTimer=0},h=e=>{y(e.target),[...e.addedNodes].map(e=>{"#text"!=e.nodeName&&"#comment"!=e.nodeName&&y(e)}),b()},v=()=>infiniteLoopPreventCounter>1e3?((()=>{try{domObserver.disconnect(),domObserver=!1,wasNotStoped&&setTimeout(()=>{const e=document.body.getElementsByTagName("*");w(e)},2e3),wasNotStoped=!1,domObserverLight.disconnect()}catch(e){}})(),!0):(infiniteLoopPreventCounter++,0===myTimer&&(myTimer=setTimeout(g,1e3)),!1),N=t=>{(e=>{e.target.style.removeProperty("height")})(t),"childList"===t.type&&t.removedNodes.length&&(t=>{const o=t.target;t.removedNodes.forEach(e=>{const t=e.cloneNode(!0);o.appendChild(t)}),o.style.removeProperty("height"),o.style.removeProperty("margin"),o.style.removeProperty("padding"),e&&(m={...m,restored:m.restored+1})})(t)},w=e=>{b(),p(e),domObserver||(domObserver=new MutationObserver(e=>{let o=[];const n=e.length;for(let s=0;s<n&&!v();s++){const n=e[s];if(t)N(n);else{if(r(o,n.target))continue;o=[...o,n.target]}h(n)}})),window.location.href.includes("pinterest")?((domObserverLight=new MutationObserver(e=>{e.map(b)})).observe(l,{attributes:!0}),domObserverLight.observe(c,{attributes:!0})):domObserver.observe(l,{childList:!0,subtree:!0,attributes:!0})};w(u),e&&(i(m),window.addEventListener("beforeunload",()=>{i(m)}))};chrome.storage.sync.get(["statsEnabled","restoreCont"],e=>{punishEasy(e.statsEnabled,e.restoreCont)});
