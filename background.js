"use strict";chrome.runtime.onInstalled.addListener(function(e){"install"==e.reason?(chrome.storage.sync.set({autoWork:!1}),chrome.storage.sync.set({autoWorkEasy:!1}),chrome.storage.sync.set({thisWebsiteWork:[]}),chrome.storage.sync.set({thisWebsiteWorkEasy:[]}),chrome.tabs.create({url:"https://romanisthere.github.io/PopUpOFF-Website/"})):"update"==e.reason&&(chrome.storage.sync.set({autoWork:!1}),chrome.storage.sync.set({autoWorkEasy:!1}))}),chrome.tabs.onActivated.addListener(function(e){chrome.tabs.getSelected(null,function(t){t.url.includes("chrome://")&&chrome.browserAction.disable(e.tabId)})}),chrome.tabs.onUpdated.addListener(function(e,t,s){if("complete"===t.status||"loading"===t.status){let t=s.url;t.includes("chrome://")?chrome.browserAction.disable(e):(chrome.storage.sync.get("thisWebsiteWork",function(s){let o=t.substring(t.lastIndexOf("//")+2,t.indexOf("/",8));s.thisWebsiteWork.includes(o)&&(chrome.tabs.executeScript(e,{file:"removeHard.js"}),chrome.tabs.executeScript(e,{file:"watchDOM.js"}))}),chrome.storage.sync.get("thisWebsiteWorkEasy",function(s){let o=t.substring(t.lastIndexOf("//")+2,t.indexOf("/",8));s.thisWebsiteWorkEasy.includes(o)&&(chrome.tabs.executeScript(e,{file:"removeEasy.js"}),chrome.tabs.executeScript(e,{file:"watchDOMEasy.js"}))}))}});
