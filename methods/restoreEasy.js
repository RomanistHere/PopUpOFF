var restoreFixedElems=()=>{const e=document.querySelectorAll("[data-popupoffExtension]"),t=e.length,o=["policy","cookie","subscription","subscribe","off","sale","notification","notifications","updates","privacy","miss","turn off","turning off","disable","ad blocker","ad block","adblock","adblocker"],r=["<nav","<header","search","ytmusic","searchbox","app-drawer"];try{domObserver&&domObserver.disconnect(),domObserverLight&&domObserverLight.disconnect()}catch(e){console.log(e)}for(let l=0;l<t;l++){const t=e[l];o.some(e=>t.innerHTML.includes(e))||(t.style.display=null);const n=window.getComputedStyle(t,null).getPropertyValue("top").match(/[+-]?\d+(?:\.\d+)?/g)?Number(window.getComputedStyle(t,null).getPropertyValue("top").match(/[+-]?\d+(?:\.\d+)?/g)[0]):100,s=window.getComputedStyle(t,null).getPropertyValue("height").match(/[+-]?\d+(?:\.\d+)?/g)?Number(window.getComputedStyle(t,null).getPropertyValue("height").match(/[+-]?\d+(?:\.\d+)?/g)[0]):300;n>10?t.style.setProperty("display","none","important"):s+n>150&&t.style.setProperty("display","none","important"),(r.some(e=>t.innerHTML.includes(e))||"NAV"==t.tagName||"HEADER"==t.tagName)&&(t.style.display=null)}};chrome.storage.sync.get("autoWork",e=>{e.autoWork||restoreFixedElems()});
