"use strict";var thisPageOn=!1;chrome.runtime.onMessage.addListener(function(e,t,s){"getStatusThisPage"===e.method&&s(thisPageOn),"setStatusThisPage"===e.method&&(thisPageOn=e.thisPageOn)});
