var getStyle=(e,t)=>window.getComputedStyle(e,null).getPropertyValue(t),setPropImp=(e,t,o)=>e.style.setProperty(t,o,"important"),removeFixedElems=()=>{const e=document.body.getElementsByTagName("*"),t=e.length;for(let o=0;o<t;o++){if("fixed"==getStyle(e[o],"position")||"sticky"==getStyle(e[o],"position")){if("notification"===e[o].getAttribute("data-PopUpOFF"))continue;"none"!=getStyle(e[o],"display")&&e[o].setAttribute("data-popupoffExtension","hello"),positionCheck(e[o]),contentCheck(e[o]),semanticCheck(e[o])}"none"==getStyle(e[o],"filter")&&"none"==getStyle(e[o],"-webkit-filter")||(setPropImp(e[o],"filter","none"),setPropImp(e[o],"-webkit-filter","none"))}},contentCheck=e=>{["policy","cookie","subscription","subscribe","off","sale","notification","notifications","updates","privacy","miss"].some(t=>e.innerHTML.includes(t))&&setPropImp(e,"display","none")},semanticCheck=e=>{(["<nav","<header","search","ytmusic","searchbox","app-drawer"].some(t=>e.innerHTML.includes(t))||"NAV"==e.tagName||"HEADER"==e.tagName)&&(e.style.display=null)},positionCheck=e=>{const t=getStyle(e,"top").match(/[+-]?\d+(?:\.\d+)?/g)?Number(getStyle(e,"top").match(/[+-]?\d+(?:\.\d+)?/g)[0]):100,o=getStyle(e,"height").match(/[+-]?\d+(?:\.\d+)?/g)?Number(getStyle(e,"height").match(/[+-]?\d+(?:\.\d+)?/g)[0]):300;t>10?setPropImp(e,"display","none"):o+t>150&&setPropImp(e,"display","none")},removeOverflow=()=>{const e=document.documentElement,t=document.body;"hidden"==getStyle(e,"overflow-y")&&setPropImp(e,"overflow-y","unset"),"hidden"==getStyle(t,"overflow-y")&&setPropImp(t,"overflow-y","unset"),"fixed"!=getStyle(e,"position")&&"absolute"!=getStyle(e,"position")||setPropImp(e,"position","relative"),"fixed"!=getStyle(t,"position")&&"absolute"!=getStyle(t,"position")||setPropImp(t,"position","relative")};removeOverflow(),removeFixedElems();