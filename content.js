"use strict";var thisPageOn=!1;chrome.runtime.onMessage.addListener(function(e,t,s){return"getStatusThisPage"===e.method&&s(thisPageOn),"setStatusThisPage"===e.method&&(thisPageOn=e.thisPageOn),!0});
