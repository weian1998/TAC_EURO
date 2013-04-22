/*
 * SageSalesLogixCommon
 * Copyright(c) 2009, Sage Software.
 * 
 * 
 */


function Cookie()
{this.defaultCookie="userprefs";}
function Cookie_getCookie(cookieName){var cookiestring=document.cookie;var cookies=cookiestring.split('; ');var search=(cookieName?cookieName:this.defaultCookie)+'=';for(var i=0;i<cookies.length;i++){if(cookies[i].indexOf(search)>-1){return unescape(cookies[i].split('=')[1]);}}
return'';}
function Cookie_setCookie(strPairs,cookieName){document.cookie=(cookieName?cookieName:this.defaultCookie)+"="+escape(strPairs);}
function Cookie_parseCookie(cookieName){var myCookie=this.getCookie((cookieName?cookieName:this.defaultCookie));if(myCookie){var pairs=myCookie.split("&");return pairs;}else{return new Array();}}
function Cookie_getCookieParm(parmName,cookieName){var parms=this.parseCookie(cookieName?cookieName:this.defaultCookie);var search=parmName+"=";for(var i=0;i<parms.length;i++){if(parms[i].indexOf(search)>-1){var vals=parms[i].split("=");return(vals[1]?vals[1]:"");}}
return"";}
function Cookie_setCookieParm(strVal,parmName,cookieName){var parms=this.parseCookie(cookieName?cookieName:this.defaultCookie);var pFound=false;var search=parmName+"=";for(var i=0;i<parms.length;i++){if(parms[i].indexOf(search)>-1){parms[i]=search+strVal;pFound=true;break;}}
if(pFound===false){parms[parms.length]=search+strVal;}
this.setCookie(parms.join("&"),(cookieName?cookieName:this.defaultCookie));}
function Cookie_delCookieParm(parmName,cookieName){var pairs=this.parseCookie((cookieName?cookieName:this.defaultCookie));var search=parmName+"=";var retpairs=new Array();for(var i=0;i<pairs.length;i++){if(pairs[i].indexOf(search)==-1){retpairs[retpairs.length]=pairs[i];}}
this.setCookie(retpairs.join("&"),(cookieName?cookieName:this.defaultCookie));}
Cookie.prototype.getCookie=Cookie_getCookie;Cookie.prototype.setCookie=Cookie_setCookie;Cookie.prototype.parseCookie=Cookie_parseCookie;Cookie.prototype.getCookieParm=Cookie_getCookieParm;Cookie.prototype.setCookieParm=Cookie_setCookieParm;Cookie.prototype.delCookieParm=Cookie_delCookieParm;var cookie=new Cookie();