var thisPageOn=!1;chrome.runtime.onMessage.addListener((e,t,o)=>("getStatusThisPage"===e.method&&o(thisPageOn),"setStatusThisPage"===e.method&&(thisPageOn=e.thisPageOn),!0)),document.addEventListener("openOptPage",e=>{chrome.runtime.sendMessage({openOptPage:!0})});const sendStats=()=>chrome.storage.sync.get(["stats"],e=>{document.dispatchEvent(new CustomEvent("PopUpOFFStats",{detail:e.stats}))});"https://romanisthere.github.io/secrets/"===window.location.href&&document.addEventListener("showPopUpOFFStats",({detail:e})=>{"letTheShowBegin"===e&&(sendStats(),setInterval(sendStats,2e3))});const createNotification=()=>{const e=document.createElement("span");e.setAttribute("data-PopUpOFF","notification");const t=document.createTextNode("PopUpOFF activated");e.className="PopUpOFF_notification",e.appendChild(t),document.body.appendChild(e),setTimeout(()=>{document.querySelector(".PopUpOFF_notification")&&document.querySelector('[data-PopUpOFF="notification"]').remove()},5e3)},removeNotification=()=>{const e=document.querySelector(".PopUpOFF_notification");e&&e.remove()},keyDownCallBack=e=>{const t=navigator.platform.toUpperCase().indexOf("MAC")>=0;(e.altKey&&88==e.which||t&&e.metaKey&&e.shiftKey&&88==e.which)&&(e.preventDefault(),chrome.runtime.sendMessage({hardMode:!0},e=>{e.shouldShow?createNotification():removeNotification()}))},debounce=(e,t,o)=>{var n;return function(){var a=this,i=arguments,s=o&&!n;clearTimeout(n),n=setTimeout(function(){n=null,o||e.apply(a,i)},t),s&&e.apply(a,i)}};document.onkeydown=debounce(keyDownCallBack,100);
