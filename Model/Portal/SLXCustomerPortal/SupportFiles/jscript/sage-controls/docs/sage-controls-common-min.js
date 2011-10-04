/*
 * Sage SalesLogix Web Controls
 * Copyright(c) 2009, Sage Software.
 */


if(typeof Sys!=="undefined")
{Type.registerNamespace("Sage.SalesLogix.Controls");Type.registerNamespace("Sage.SalesLogix.Controls.Resources");Type.registerNamespace("Resources");}
else
{Ext.namespace("Sage.SalesLogix.Controls");Ext.namespace("Sage.SalesLogix.Controls.Resources");Sage.__namespace=true;Sage.SalesLogix.__namespace=true;Sage.SalesLogix.Controls.__namespace=true;Sage.SalesLogix.Controls.Resources.__namespace=true;}
if(typeof(Sage)!="undefined"){Sage.SyncExec=function(){this._functionList=[];var self=this;var prm=Sys.WebForms.PageRequestManager.getInstance();prm.add_endRequest(function(sender,args){self.onEndRequest();});};Sage.SyncExec.prototype.onEndRequest=function(){var functionsToCall=this._functionList;this._functionList=[];for(var i=0;i<functionsToCall.length;i++)
functionsToCall[i]();};Sage.SyncExec.prototype.tryCall=function(functionToCall){var prm=Sys.WebForms.PageRequestManager.getInstance();this._functionList.push(functionToCall);};Sage.SyncExec.call=function(functionToCall){if(typeof Sage.SyncExec._instance=="undefined")
Sage.SyncExec._instance=new Sage.SyncExec();Sage.SyncExec._instance.tryCall(functionToCall);};Sage.SalesLogix.Controls.maximizeDecimalDigit=function(value,decimalDigits,decimalSeparator){var dif;var retVal=value;if(typeof decimalDigits==='undefined'){decimalDigits=Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalDigits;}
if(typeof decimalSeparator==='undefined'){decimalSeparator=Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator;}
var intDecimalDigits=parseInt(decimalDigits);if(intDecimalDigits>0&&value.lastIndexOf(decimalSeparator)==-1&&value.length>0){retVal=[value,decimalSeparator].join('');}
var restriction=retVal.lastIndexOf(decimalSeparator)+1+intDecimalDigits;if(retVal.lastIndexOf(decimalSeparator)>-1){diff=restriction-retVal.length;if(diff>0){for(var i=0;i<diff;i++){retVal+='0';}}}
return retVal;}
Sage.SalesLogix.Controls.restrictDecimalDigit=function(value,decimalDigits,decimalSep){var dif;var retVal=value;var intDecimalDigits=parseInt(decimalDigits);var restriction=value.lastIndexOf(decimalSep)+1+intDecimalDigits;if(intDecimalDigits==0){restriction--;}
if(value.lastIndexOf(decimalSep)>-1){retVal=value.substr(0,restriction);}
return retVal;}
Sage.SalesLogix.Controls.formatNumber=function(num,type,decimalDigits,warningMsg){warningMsg=(warningMsg)?warningMsg:'';var decSep,groupSep,negSign,groupDigits;var cultureOptions=Sys.CultureInfo.CurrentCulture.numberFormat;negSign=cultureOptions.NegativeSign;switch(type){case'currency':groupSep=cultureOptions.CurrencyGroupSeparator;decSep=cultureOptions.CurrencyDecimalSeparator;decimalDigits=(typeof decimalDigits!=='undefined')?decimalDigits:cultureOptions.CurrencyDecimalDigits;groupDigits=cultureOptions.CurrencyGroupSizes[0];break;case'percent':groupSep=cultureOptions.PercentGroupSeparator;decSep=cultureOptions.PercentDecimalSeparator;decimalDigits=(typeof decimalDigits!=='undefined')?decimalDigits:cultureOptions.PercentDecimalDigits;groupDigits=cultureOptions.PercentGroupSizes[0];break;default:groupSep=cultureOptions.NumberGroupSeparator;decSep=cultureOptions.NumberDecimalSeparator;decimalDigits=(typeof decimalDigits!=='undefined')?decimalDigits:cultureOptions.NumberDecimalDigits;groupDigits=cultureOptions.NumberGroupSizes[0];break;}
var x=new RegExp('['+groupSep+']','g');num=num.replace(x,'');if((num.indexOf(decSep)>-1)&&(num.indexOf(decSep)<num.lastIndexOf(decSep))){var firstHalf=num.substr(0,num.indexOf('.')+1);var lastHalf=num.substr(num.indexOf('.')+1).replace(/\./g,'')
num=firstHalf+lastHalf;}
var parts=num.split(decSep);for(i=0;i<parts.length;i++){if(isNaN(parts[i])){alert(parts[i]+" "+warningMsg);return false;}}
var result="";if(num!=""){num=Sage.SalesLogix.Controls.restrictDecimalDigit(num,decimalDigits,decSep);var pos=num.indexOf(decSep)==-1?num.length:num.indexOf(decSep);if((decimalDigits>0)&&(num.indexOf(decSep)>-1)){result=num.substr(pos);}
while(pos-groupDigits>0){result=groupSep+num.substr(pos-groupDigits,groupDigits)+result;pos=pos-groupDigits;}
if(pos>0){result=num.substr(0,pos)+result;}}
if(type=='percent'&&result){result=[result,' ',cultureOptions.PercentSymbol].join("");}
return result;}}
function IsAllowedNavigationKey(charCode){return(charCode==8||charCode==9||charCode==46||charCode==37||charCode==39);}
function RestrictToNumeric(e,groupSeparator,decimalSeparator){if(navigator.userAgent.indexOf("Firefox")>=0){if(e.keyCode&&IsAllowedNavigationKey(e.keyCode))return true;}
var code=e.charCode||e.keyCode;return((code>=48&&code<=57)||code==groupSeparator||code==decimalSeparator);}
function GetResourceValue(resource,defval){var val=resource;if((val==null)||(val.length==0)){val=defval;}
return val;}
var JSON;if(!JSON){JSON={};}
(function(){"use strict";function f(n){return n<10?'0'+n:n;}
if(typeof Date.prototype.toJSON!=='function'){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf();};}
var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4);})+'"':'"'+string+'"';}
function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==='object'&&typeof value.toJSON==='function'){value=value.toJSON(key);}
if(typeof rep==='function'){value=rep.call(holder,key,value);}
switch(typeof value){case'string':return quote(value);case'number':return isFinite(value)?String(value):'null';case'boolean':case'null':return String(value);case'object':if(!value){return'null';}
gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==='[object Array]'){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||'null';}
v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']';gap=mind;return v;}
if(rep&&typeof rep==='object'){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==='string'){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?': ':':')+v);}}}}
v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}';gap=mind;return v;}}
if(typeof JSON.stringify!=='function'){JSON.stringify=function(value,replacer,space){var i;gap='';indent='';if(typeof space==='number'){for(i=0;i<space;i+=1){indent+=' ';}}else if(typeof space==='string'){indent=space;}
rep=replacer;if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')){throw new Error('JSON.stringify');}
return str('',{'':value});};}
if(typeof JSON.parse!=='function'){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==='object'){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v;}else{delete value[k];}}}}
return reviver.call(holder,key,value);}
text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return'\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);});}
if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,'@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']').replace(/(?:^|:|,)(?:\s*\[)+/g,''))){j=eval('('+text+')');return typeof reviver==='function'?walk({'':j},''):j;}
throw new SyntaxError('JSON.parse');};}}());