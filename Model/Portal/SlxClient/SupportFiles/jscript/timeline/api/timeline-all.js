﻿if (typeof SimileAjax == "undefined") {
    var SimileAjax = {
        loaded:                 false,
        loadingScriptsCount:    0,
        error:                  null,
        params:                 { bundle:"true" }
    };
    
    SimileAjax.Platform = new Object();
        /*
            HACK: We need these 2 things here because we cannot simply append
            a <script> element containing code that accesses SimileAjax.Platform
            to initialize it because IE executes that <script> code first
            before it loads ajax.js and platform.js.
        */
        
    var getHead = function(doc) {
        return doc.getElementsByTagName("head")[0];
    };
    
    SimileAjax.findScript = function(doc, substring) {
        var heads = doc.documentElement.getElementsByTagName("head");
        for (var h = 0; h < heads.length; h++) {
            var node = heads[h].firstChild;
            while (node != null) {
                if (node.nodeType == 1 && node.tagName.toLowerCase() == "script") {
                    var url = node.src;
                    var i = url.indexOf(substring);
                    if (i >= 0) {
                        return url;
                    }
                }
                node = node.nextSibling;
            }
        }
        return null;
    };
    SimileAjax.includeJavascriptFile = function(doc, url, onerror, charset) {
        onerror = onerror || "";
        if (doc.body == null) {
            try {
                var q = "'" + onerror.replace( /'/g, '&apos' ) + "'"; // "
                doc.write("<script src='" + url + "' onerror="+ q +
                          (charset ? " charset='"+ charset +"'" : "") +
                          " type='text/javascript'>"+ onerror + "</script>");
                return;
            } catch (e) {
                // fall through
            }
        }

        var script = doc.createElement("script");
        if (onerror) {
            try { script.innerHTML = onerror; } catch(e) {}
            script.setAttribute("onerror", onerror);
        }
        if (charset) {
            script.setAttribute("charset", charset);
        }
        script.type = "text/javascript";
        script.language = "JavaScript";
        script.src = url;
        return getHead(doc).appendChild(script);
    };
    SimileAjax.includeJavascriptFiles = function(doc, urlPrefix, filenames) {
        for (var i = 0; i < filenames.length; i++) {
            SimileAjax.includeJavascriptFile(doc, urlPrefix + filenames[i]);
        }
        SimileAjax.loadingScriptsCount += filenames.length;
        SimileAjax.includeJavascriptFile(doc, SimileAjax.urlPrefix + "scripts/signal.js?" + filenames.length);
    };
    SimileAjax.includeCssFile = function(doc, url) {
        if (doc.body == null) {
            try {
                doc.write("<link rel='stylesheet' href='" + url + "' type='text/css'/>");
                return;
            } catch (e) {
                // fall through
            }
        }
        
        var link = doc.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("type", "text/css");
        link.setAttribute("href", url);
        getHead(doc).appendChild(link);
    };
    SimileAjax.includeCssFiles = function(doc, urlPrefix, filenames) {
        for (var i = 0; i < filenames.length; i++) {
            SimileAjax.includeCssFile(doc, urlPrefix + filenames[i]);
        }
    };
    
    /**
     * Append into urls each string in suffixes after prefixing it with urlPrefix.
     * @param {Array} urls
     * @param {String} urlPrefix
     * @param {Array} suffixes
     */
    SimileAjax.prefixURLs = function(urls, urlPrefix, suffixes) {
        for (var i = 0; i < suffixes.length; i++) {
            urls.push(urlPrefix + suffixes[i]);
        }
    };

    /**
     * Parse out the query parameters from a URL
     * @param {String} url    the url to parse, or location.href if undefined
     * @param {Object} to     optional object to extend with the parameters
     * @param {Object} types  optional object mapping keys to value types
     *        (String, Number, Boolean or Array, String by default)
     * @return a key/value Object whose keys are the query parameter names
     * @type Object
     */
    SimileAjax.parseURLParameters = function(url, to, types) {
        to = to || {};
        types = types || {};
        
        if (typeof url == "undefined") {
            url = location.href;
        }
        var q = url.indexOf("?");
        if (q < 0) {
            return to;
        }
        url = (url+"#").slice(q+1, url.indexOf("#")); // toss the URL fragment
        
        var params = url.split("&"), param, parsed = {};
        var decode = window.decodeURIComponent || unescape;
        for (var i = 0; param = params[i]; i++) {
            var eq = param.indexOf("=");
            var name = decode(param.slice(0,eq));
            var old = parsed[name];
            if (typeof old == "undefined") {
                old = [];
            } else if (!(old instanceof Array)) {
                old = [old];
            }
            parsed[name] = old.concat(decode(param.slice(eq+1)));
        }
        for (var i in parsed) {
            if (!parsed.hasOwnProperty(i)) continue;
            var type = types[i] || String;
            var data = parsed[i];
            if (!(data instanceof Array)) {
                data = [data];
            }
            if (type === Boolean && data[0] == "false") {
                to[i] = false; // because Boolean("false") === true
            } else {
                to[i] = type.apply(this, data);
            }
        }
        return to;
    };
    if (typeof SimileAjax_urlPrefix == "string") {
        SimileAjax.urlPrefix = SimileAjax_urlPrefix;
    } else {
        var url = SimileAjax.findScript(document, "timeline-all-min.js");
        if (url == null) {
            SimileAjax.error = new Error("Failed to derive URL prefix for Simile Ajax API code files");
        }

        SimileAjax.urlPrefix = url.substr(0, url.indexOf("timeline-all-min.js"));
    }

    SimileAjax.loaded = true;
}

/* platform.js */
SimileAjax.Platform.os={isMac:false,isWin:false,isWin32:false,isUnix:false};
SimileAjax.Platform.browser={isIE:false,isNetscape:false,isMozilla:false,isFirefox:false,isOpera:false,isSafari:false,majorVersion:0,minorVersion:0};
(function(){var C=navigator.appName.toLowerCase();
var A=navigator.userAgent.toLowerCase();
SimileAjax.Platform.os.isMac=(A.indexOf("mac")!=-1);
SimileAjax.Platform.os.isWin=(A.indexOf("win")!=-1);
SimileAjax.Platform.os.isWin32=SimileAjax.Platform.isWin&&(A.indexOf("95")!=-1||A.indexOf("98")!=-1||A.indexOf("nt")!=-1||A.indexOf("win32")!=-1||A.indexOf("32bit")!=-1);
SimileAjax.Platform.os.isUnix=(A.indexOf("x11")!=-1);
SimileAjax.Platform.browser.isIE=(C.indexOf("microsoft")!=-1);
SimileAjax.Platform.browser.isNetscape=(C.indexOf("netscape")!=-1);
SimileAjax.Platform.browser.isMozilla=(A.indexOf("mozilla")!=-1);
SimileAjax.Platform.browser.isFirefox=(A.indexOf("firefox")!=-1);
SimileAjax.Platform.browser.isOpera=(C.indexOf("opera")!=-1);
SimileAjax.Platform.browser.isSafari=(C.indexOf("safari")!=-1);
var E=function(G){var F=G.split(".");
SimileAjax.Platform.browser.majorVersion=parseInt(F[0]);
SimileAjax.Platform.browser.minorVersion=parseInt(F[1]);
};
var B=function(H,G,I){var F=H.indexOf(G,I);
return F>=0?F:H.length;
};
if(SimileAjax.Platform.browser.isMozilla){var D=A.indexOf("mozilla/");
if(D>=0){E(A.substring(D+8,B(A," ",D)));
}}if(SimileAjax.Platform.browser.isIE){var D=A.indexOf("msie ");
if(D>=0){E(A.substring(D+5,B(A,";",D)));
}}if(SimileAjax.Platform.browser.isNetscape){var D=A.indexOf("rv:");
if(D>=0){E(A.substring(D+3,B(A,")",D)));
}}if(SimileAjax.Platform.browser.isFirefox){var D=A.indexOf("firefox/");
if(D>=0){E(A.substring(D+8,B(A," ",D)));
}}if(!("localeCompare" in String.prototype)){String.prototype.localeCompare=function(F){if(this<F){return -1;
}else{if(this>F){return 1;
}else{return 0;
}}};
}})();
SimileAjax.Platform.getDefaultLocale=function(){return SimileAjax.Platform.clientLocale;
};


/* ajax.js */
SimileAjax.ListenerQueue=function(A){this._listeners=[];
this._wildcardHandlerName=A;
};
SimileAjax.ListenerQueue.prototype.add=function(A){this._listeners.push(A);
};
SimileAjax.ListenerQueue.prototype.remove=function(C){var B=this._listeners;
for(var A=0;
A<B.length;
A++){if(B[A]==C){B.splice(A,1);
break;
}}};
SimileAjax.ListenerQueue.prototype.fire=function(B,A){var D=[].concat(this._listeners);
for(var C=0;
C<D.length;
C++){var E=D[C];
if(B in E){try{E[B].apply(E,A);
}catch(F){SimileAjax.Debug.exception("Error firing event of name "+B,F);
}}else{if(this._wildcardHandlerName!=null&&this._wildcardHandlerName in E){try{E[this._wildcardHandlerName].apply(E,[B]);
}catch(F){SimileAjax.Debug.exception("Error firing event of name "+B+" to wildcard handler",F);
}}}}};


/* data-structure.js */
SimileAjax.Set=function(A){this._hash={};
this._count=0;
if(A instanceof Array){for(var B=0;
B<A.length;
B++){this.add(A[B]);
}}else{if(A instanceof SimileAjax.Set){this.addSet(A);
}}};
SimileAjax.Set.prototype.add=function(A){if(!(A in this._hash)){this._hash[A]=true;
this._count++;
return true;
}return false;
};
SimileAjax.Set.prototype.addSet=function(B){for(var A in B._hash){this.add(A);
}};
SimileAjax.Set.prototype.remove=function(A){if(A in this._hash){delete this._hash[A];
this._count--;
return true;
}return false;
};
SimileAjax.Set.prototype.removeSet=function(B){for(var A in B._hash){this.remove(A);
}};
SimileAjax.Set.prototype.retainSet=function(B){for(var A in this._hash){if(!B.contains(A)){delete this._hash[A];
this._count--;
}}};
SimileAjax.Set.prototype.contains=function(A){return(A in this._hash);
};
SimileAjax.Set.prototype.size=function(){return this._count;
};
SimileAjax.Set.prototype.toArray=function(){var A=[];
for(var B in this._hash){A.push(B);
}return A;
};
SimileAjax.Set.prototype.visit=function(A){for(var B in this._hash){if(A(B)==true){break;
}}};
SimileAjax.SortedArray=function(B,A){this._a=(A instanceof Array)?A:[];
this._compare=B;
};
SimileAjax.SortedArray.prototype.add=function(C){var A=this;
var B=this.find(function(D){return A._compare(D,C);
});
if(B<this._a.length){this._a.splice(B,0,C);
}else{this._a.push(C);
}};
SimileAjax.SortedArray.prototype.remove=function(C){var A=this;
var B=this.find(function(D){return A._compare(D,C);
});
while(B<this._a.length&&this._compare(this._a[B],C)==0){if(this._a[B]==C){this._a.splice(B,1);
return true;
}else{B++;
}}return false;
};
SimileAjax.SortedArray.prototype.removeAll=function(){this._a=[];
};
SimileAjax.SortedArray.prototype.elementAt=function(A){return this._a[A];
};
SimileAjax.SortedArray.prototype.length=function(){return this._a.length;
};
SimileAjax.SortedArray.prototype.find=function(D){var B=0;
var A=this._a.length;
while(B<A){var C=Math.floor((B+A)/2);
var E=D(this._a[C]);
if(C==B){return E<0?B+1:B;
}else{if(E<0){B=C;
}else{A=C;
}}}return B;
};
SimileAjax.SortedArray.prototype.getFirst=function(){return(this._a.length>0)?this._a[0]:null;
};
SimileAjax.SortedArray.prototype.getLast=function(){return(this._a.length>0)?this._a[this._a.length-1]:null;
};
SimileAjax.EventIndex=function(B){var A=this;
this._unit=(B!=null)?B:SimileAjax.NativeDateUnit;
this._events=new SimileAjax.SortedArray(function(D,C){return A._unit.compare(D.getStart(),C.getStart());
});
this._idToEvent={};
this._indexed=true;
};
SimileAjax.EventIndex.prototype.getUnit=function(){return this._unit;
};
SimileAjax.EventIndex.prototype.getEvent=function(A){return this._idToEvent[A];
};
SimileAjax.EventIndex.prototype.add=function(A){this._events.add(A);
this._idToEvent[A.getID()]=A;
this._indexed=false;
};
SimileAjax.EventIndex.prototype.removeAll=function(){this._events.removeAll();
this._idToEvent={};
this._indexed=false;
};
SimileAjax.EventIndex.prototype.getCount=function(){return this._events.length();
};
SimileAjax.EventIndex.prototype.getIterator=function(A,B){if(!this._indexed){this._index();
}return new SimileAjax.EventIndex._Iterator(this._events,A,B,this._unit);
};
SimileAjax.EventIndex.prototype.getReverseIterator=function(A,B){if(!this._indexed){this._index();
}return new SimileAjax.EventIndex._ReverseIterator(this._events,A,B,this._unit);
};
SimileAjax.EventIndex.prototype.getAllIterator=function(){return new SimileAjax.EventIndex._AllIterator(this._events);
};
SimileAjax.EventIndex.prototype.getEarliestDate=function(){var A=this._events.getFirst();
return(A==null)?null:A.getStart();
};
SimileAjax.EventIndex.prototype.getLatestDate=function(){var A=this._events.getLast();
if(A==null){return null;
}if(!this._indexed){this._index();
}var C=A._earliestOverlapIndex;
var B=this._events.elementAt(C).getEnd();
for(var D=C+1;
D<this._events.length();
D++){B=this._unit.later(B,this._events.elementAt(D).getEnd());
}return B;
};
SimileAjax.EventIndex.prototype._index=function(){var D=this._events.length();
for(var E=0;
E<D;
E++){var C=this._events.elementAt(E);
C._earliestOverlapIndex=E;
}var G=1;
for(var E=0;
E<D;
E++){var C=this._events.elementAt(E);
var B=C.getEnd();
G=Math.max(G,E+1);
while(G<D){var A=this._events.elementAt(G);
var F=A.getStart();
if(this._unit.compare(F,B)<0){A._earliestOverlapIndex=E;
G++;
}else{break;
}}}this._indexed=true;
};
SimileAjax.EventIndex._Iterator=function(B,A,D,C){this._events=B;
this._startDate=A;
this._endDate=D;
this._unit=C;
this._currentIndex=B.find(function(E){return C.compare(E.getStart(),A);
});
if(this._currentIndex-1>=0){this._currentIndex=this._events.elementAt(this._currentIndex-1)._earliestOverlapIndex;
}this._currentIndex--;
this._maxIndex=B.find(function(E){return C.compare(E.getStart(),D);
});
this._hasNext=false;
this._next=null;
this._findNext();
};
SimileAjax.EventIndex._Iterator.prototype={hasNext:function(){return this._hasNext;
},next:function(){if(this._hasNext){var A=this._next;
this._findNext();
return A;
}else{return null;
}},_findNext:function(){var B=this._unit;
while((++this._currentIndex)<this._maxIndex){var A=this._events.elementAt(this._currentIndex);
if(B.compare(A.getStart(),this._endDate)<0&&B.compare(A.getEnd(),this._startDate)>0){this._next=A;
this._hasNext=true;
return ;
}}this._next=null;
this._hasNext=false;
}};
SimileAjax.EventIndex._ReverseIterator=function(B,A,D,C){this._events=B;
this._startDate=A;
this._endDate=D;
this._unit=C;
this._minIndex=B.find(function(E){return C.compare(E.getStart(),A);
});
if(this._minIndex-1>=0){this._minIndex=this._events.elementAt(this._minIndex-1)._earliestOverlapIndex;
}this._maxIndex=B.find(function(E){return C.compare(E.getStart(),D);
});
this._currentIndex=this._maxIndex;
this._hasNext=false;
this._next=null;
this._findNext();
};
SimileAjax.EventIndex._ReverseIterator.prototype={hasNext:function(){return this._hasNext;
},next:function(){if(this._hasNext){var A=this._next;
this._findNext();
return A;
}else{return null;
}},_findNext:function(){var B=this._unit;
while((--this._currentIndex)>=this._minIndex){var A=this._events.elementAt(this._currentIndex);
if(B.compare(A.getStart(),this._endDate)<0&&B.compare(A.getEnd(),this._startDate)>0){this._next=A;
this._hasNext=true;
return ;
}}this._next=null;
this._hasNext=false;
}};
SimileAjax.EventIndex._AllIterator=function(A){this._events=A;
this._index=0;
};
SimileAjax.EventIndex._AllIterator.prototype={hasNext:function(){return this._index<this._events.length();
},next:function(){return this._index<this._events.length()?this._events.elementAt(this._index++):null;
}};


/* date-time.js */
SimileAjax.DateTime=new Object();
SimileAjax.DateTime.MILLISECOND=0;
SimileAjax.DateTime.SECOND=1;
SimileAjax.DateTime.MINUTE=2;
SimileAjax.DateTime.HOUR=3;
SimileAjax.DateTime.DAY=4;
SimileAjax.DateTime.WEEK=5;
SimileAjax.DateTime.MONTH=6;
SimileAjax.DateTime.YEAR=7;
SimileAjax.DateTime.DECADE=8;
SimileAjax.DateTime.CENTURY=9;
SimileAjax.DateTime.MILLENNIUM=10;
SimileAjax.DateTime.EPOCH=-1;
SimileAjax.DateTime.ERA=-2;
SimileAjax.DateTime.gregorianUnitLengths=[];
(function(){var B=SimileAjax.DateTime;
var A=B.gregorianUnitLengths;
A[B.MILLISECOND]=1;
A[B.SECOND]=1000;
A[B.MINUTE]=A[B.SECOND]*60;
A[B.HOUR]=A[B.MINUTE]*60;
A[B.DAY]=A[B.HOUR]*24;
A[B.WEEK]=A[B.DAY]*7;
A[B.MONTH]=A[B.DAY]*31;
A[B.YEAR]=A[B.DAY]*365;
A[B.DECADE]=A[B.YEAR]*10;
A[B.CENTURY]=A[B.YEAR]*100;
A[B.MILLENNIUM]=A[B.YEAR]*1000;
})();
SimileAjax.DateTime._dateRegexp=new RegExp("^(-?)([0-9]{4})("+["(-?([0-9]{2})(-?([0-9]{2}))?)","(-?([0-9]{3}))","(-?W([0-9]{2})(-?([1-7]))?)"].join("|")+")?$");
SimileAjax.DateTime._timezoneRegexp=new RegExp("Z|(([-+])([0-9]{2})(:?([0-9]{2}))?)$");
SimileAjax.DateTime._timeRegexp=new RegExp("^([0-9]{2})(:?([0-9]{2})(:?([0-9]{2})(.([0-9]+))?)?)?$");
SimileAjax.DateTime.setIso8601Date=function(H,F){var I=F.match(SimileAjax.DateTime._dateRegexp);
if(!I){throw new Error("Invalid date string: "+F);
}var B=(I[1]=="-")?-1:1;
var J=B*I[2];
var G=I[5];
var C=I[7];
var E=I[9];
var A=I[11];
var M=(I[13])?I[13]:1;
H.setUTCFullYear(J);
if(E){H.setUTCMonth(0);
H.setUTCDate(Number(E));
}else{if(A){H.setUTCMonth(0);
H.setUTCDate(1);
var L=H.getUTCDay();
var K=(L)?L:7;
var D=Number(M)+(7*Number(A));
if(K<=4){H.setUTCDate(D+1-K);
}else{H.setUTCDate(D+8-K);
}}else{if(G){H.setUTCDate(1);
H.setUTCMonth(G-1);
}if(C){H.setUTCDate(C);
}}}return H;
};
SimileAjax.DateTime.setIso8601Time=function(F,C){var G=C.match(SimileAjax.DateTime._timeRegexp);
if(!G){SimileAjax.Debug.warn("Invalid time string: "+C);
return false;
}var A=G[1];
var E=Number((G[3])?G[3]:0);
var D=(G[5])?G[5]:0;
var B=G[7]?(Number("0."+G[7])*1000):0;
F.setUTCHours(A);
F.setUTCMinutes(E);
F.setUTCSeconds(D);
F.setUTCMilliseconds(B);
return F;
};
SimileAjax.DateTime.timezoneOffset=new Date().getTimezoneOffset();
SimileAjax.DateTime.setIso8601=function(B,A){var D=null;
var E=(A.indexOf("T")==-1)?A.split(" "):A.split("T");
SimileAjax.DateTime.setIso8601Date(B,E[0]);
if(E.length==2){var C=E[1].match(SimileAjax.DateTime._timezoneRegexp);
if(C){if(C[0]=="Z"){D=0;
}else{D=(Number(C[3])*60)+Number(C[5]);
D*=((C[2]=="-")?1:-1);
}E[1]=E[1].substr(0,E[1].length-C[0].length);
}SimileAjax.DateTime.setIso8601Time(B,E[1]);
}if(D==null){D=B.getTimezoneOffset();
}B.setTime(B.getTime()+D*60000);
return B;
};
SimileAjax.DateTime.parseIso8601DateTime=function(A){try{return SimileAjax.DateTime.setIso8601(new Date(0),A);
}catch(B){return null;
}};
SimileAjax.DateTime.parseGregorianDateTime=function(G){if(G==null){return null;
}else{if(G instanceof Date){return G;
}}var B=G.toString();
if(B.length>0&&B.length<8){var C=B.indexOf(" ");
if(C>0){var A=parseInt(B.substr(0,C));
var E=B.substr(C+1);
if(E.toLowerCase()=="bc"){A=1-A;
}}else{var A=parseInt(B);
}var F=new Date(0);
F.setUTCFullYear(A);
return F;
}try{return new Date(Date.parse(B));
}catch(D){return null;
}};
SimileAjax.DateTime.roundDownToInterval=function(B,G,J,K,A){var D=J*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR];
var I=new Date(B.getTime()+D);
var E=function(L){L.setUTCMilliseconds(0);
L.setUTCSeconds(0);
L.setUTCMinutes(0);
L.setUTCHours(0);
};
var C=function(L){E(L);
L.setUTCDate(1);
L.setUTCMonth(0);
};
switch(G){case SimileAjax.DateTime.MILLISECOND:var H=I.getUTCMilliseconds();
I.setUTCMilliseconds(H-(H%K));
break;
case SimileAjax.DateTime.SECOND:I.setUTCMilliseconds(0);
var H=I.getUTCSeconds();
I.setUTCSeconds(H-(H%K));
break;
case SimileAjax.DateTime.MINUTE:I.setUTCMilliseconds(0);
I.setUTCSeconds(0);
var H=I.getUTCMinutes();
I.setTime(I.getTime()-(H%K)*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.MINUTE]);
break;
case SimileAjax.DateTime.HOUR:I.setUTCMilliseconds(0);
I.setUTCSeconds(0);
I.setUTCMinutes(0);
var H=I.getUTCHours();
I.setUTCHours(H-(H%K));
break;
case SimileAjax.DateTime.DAY:E(I);
break;
case SimileAjax.DateTime.WEEK:E(I);
var F=(I.getUTCDay()+7-A)%7;
I.setTime(I.getTime()-F*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.DAY]);
break;
case SimileAjax.DateTime.MONTH:E(I);
I.setUTCDate(1);
var H=I.getUTCMonth();
I.setUTCMonth(H-(H%K));
break;
case SimileAjax.DateTime.YEAR:C(I);
var H=I.getUTCFullYear();
I.setUTCFullYear(H-(H%K));
break;
case SimileAjax.DateTime.DECADE:C(I);
I.setUTCFullYear(Math.floor(I.getUTCFullYear()/10)*10);
break;
case SimileAjax.DateTime.CENTURY:C(I);
I.setUTCFullYear(Math.floor(I.getUTCFullYear()/100)*100);
break;
case SimileAjax.DateTime.MILLENNIUM:C(I);
I.setUTCFullYear(Math.floor(I.getUTCFullYear()/1000)*1000);
break;
}B.setTime(I.getTime()-D);
};
SimileAjax.DateTime.roundUpToInterval=function(D,F,C,A,B){var E=D.getTime();
SimileAjax.DateTime.roundDownToInterval(D,F,C,A,B);
if(D.getTime()<E){D.setTime(D.getTime()+SimileAjax.DateTime.gregorianUnitLengths[F]*A);
}};
SimileAjax.DateTime.incrementByInterval=function(B,E,A){A=(typeof A=="undefined")?0:A;
var D=A*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR];
var C=new Date(B.getTime()+D);
switch(E){case SimileAjax.DateTime.MILLISECOND:C.setTime(C.getTime()+1);
break;
case SimileAjax.DateTime.SECOND:C.setTime(C.getTime()+1000);
break;
case SimileAjax.DateTime.MINUTE:C.setTime(C.getTime()+SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.MINUTE]);
break;
case SimileAjax.DateTime.HOUR:C.setTime(C.getTime()+SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR]);
break;
case SimileAjax.DateTime.DAY:C.setUTCDate(C.getUTCDate()+1);
break;
case SimileAjax.DateTime.WEEK:C.setUTCDate(C.getUTCDate()+7);
break;
case SimileAjax.DateTime.MONTH:C.setUTCMonth(C.getUTCMonth()+1);
break;
case SimileAjax.DateTime.YEAR:C.setUTCFullYear(C.getUTCFullYear()+1);
break;
case SimileAjax.DateTime.DECADE:C.setUTCFullYear(C.getUTCFullYear()+10);
break;
case SimileAjax.DateTime.CENTURY:C.setUTCFullYear(C.getUTCFullYear()+100);
break;
case SimileAjax.DateTime.MILLENNIUM:C.setUTCFullYear(C.getUTCFullYear()+1000);
break;
}B.setTime(C.getTime()-D);
};
SimileAjax.DateTime.removeTimeZoneOffset=function(B,A){return new Date(B.getTime()+A*SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.HOUR]);
};
SimileAjax.DateTime.getTimezone=function(){var A=new Date().getTimezoneOffset();
return A/-60;
};


/* debug.js */
SimileAjax.Debug={silent:false};
SimileAjax.Debug.log=function(B){var A;
if("console" in window&&"log" in window.console){A=function(C){console.log(C);
};
}else{A=function(C){if(!SimileAjax.Debug.silent){alert(C);
}};
}SimileAjax.Debug.log=A;
A(B);
};
SimileAjax.Debug.warn=function(B){var A;
if("console" in window&&"warn" in window.console){A=function(C){console.warn(C);
};
}else{A=function(C){if(!SimileAjax.Debug.silent){alert(C);
}};
}SimileAjax.Debug.warn=A;
A(B);
};
SimileAjax.Debug.exception=function(B,D){var A,C=SimileAjax.parseURLParameters();
if(C.errors=="throw"||SimileAjax.params.errors=="throw"){A=function(F,E){throw (F);
};
}else{if("console" in window&&"error" in window.console){A=function(F,E){if(E!=null){console.error(E+" %o",F);
}else{console.error(F);
}throw (F);
};
}else{A=function(F,E){if(!SimileAjax.Debug.silent){alert("Caught exception: "+E+"\n\nDetails: "+(typeof F == "string" ?F:F.description));
}throw (F);
};
}}SimileAjax.Debug.exception=A;
A(B,D);
};
SimileAjax.Debug.objectToString=function(A){return SimileAjax.Debug._objectToString(A,"");
};
SimileAjax.Debug._objectToString=function(D,A){var C=A+" ";
if(typeof D=="object"){var B="{";
for(E in D){B+=C+E+": "+SimileAjax.Debug._objectToString(D[E],C)+"\n";
}B+=A+"}";
return B;
}else{if(typeof D=="array"){var B="[";
for(var E=0;
E<D.length;
E++){B+=SimileAjax.Debug._objectToString(D[E],C)+"\n";
}B+=A+"]";
return B;
}else{return D;
}}};


/* dom.js */
SimileAjax.DOM=new Object();
SimileAjax.DOM.registerEventWithObject=function(C,A,D,B){SimileAjax.DOM.registerEvent(C,A,function(F,E,G){return D[B].call(D,F,E,G);
});
};
SimileAjax.DOM.registerEvent=function(C,B,D){var A=function(E){E=(E)?E:((event)?event:null);
if(E){var F=(E.target)?E.target:((E.srcElement)?E.srcElement:null);
if(F){F=(F.nodeType==1||F.nodeType==9)?F:F.parentNode;
}return D(C,E,F);
}return true;
};
if(SimileAjax.Platform.browser.isIE){C.attachEvent("on"+B,A);
}else{C.addEventListener(B,A,false);
}};
SimileAjax.DOM.getPageCoordinates=function(B){var E=0;
var D=0;
if(B.nodeType!=1){B=B.parentNode;
}var C=B;
while(C!=null){E+=C.offsetLeft;
D+=C.offsetTop;
C=C.offsetParent;
}var A=document.body;
while(B!=null&&B!=A){if("scrollLeft" in B){E-=B.scrollLeft;
D-=B.scrollTop;
}B=B.parentNode;
}return{left:E,top:D};
};
SimileAjax.DOM.getSize=function(B){var A=this.getStyle(B,"width");
var C=this.getStyle(B,"height");
if(A.indexOf("px")>-1){A=A.replace("px","");
}if(C.indexOf("px")>-1){C=C.replace("px","");
}return{w:A,h:C};
};
SimileAjax.DOM.getStyle=function(B,A){if(B.currentStyle){var C=B.currentStyle[A];
}else{if(window.getComputedStyle){var C=document.defaultView.getComputedStyle(B,null).getPropertyValue(A);
}else{var C="";
}}return C;
};
SimileAjax.DOM.getEventRelativeCoordinates=function(A,B){if(SimileAjax.Platform.browser.isIE){return{x:A.offsetX,y:A.offsetY};
}else{var C=SimileAjax.DOM.getPageCoordinates(B);
return{x:A.pageX-C.left,y:A.pageY-C.top};
}};
SimileAjax.DOM.getEventPageCoordinates=function(A){if(SimileAjax.Platform.browser.isIE){return{x:A.clientX+document.body.scrollLeft,y:A.clientY+document.body.scrollTop};
}else{return{x:A.pageX,y:A.pageY};
}};
SimileAjax.DOM.hittest=function(A,C,B){return SimileAjax.DOM._hittest(document.body,A,C,B);
};
SimileAjax.DOM._hittest=function(C,L,K,H){var M=C.childNodes;
outer:for(var G=0;
G<M.length;
G++){var A=M[G];
for(var F=0;
F<H.length;
F++){if(A==H[F]){continue outer;
}}if(A.offsetWidth==0&&A.offsetHeight==0){var B=SimileAjax.DOM._hittest(A,L,K,H);
if(B!=A){return B;
}}else{var J=0;
var E=0;
var D=A;
while(D){J+=D.offsetTop;
E+=D.offsetLeft;
D=D.offsetParent;
}if(E<=L&&J<=K&&(L-E)<A.offsetWidth&&(K-J)<A.offsetHeight){return SimileAjax.DOM._hittest(A,L,K,H);
}else{if(A.nodeType==1&&A.tagName=="TR"){var I=SimileAjax.DOM._hittest(A,L,K,H);
if(I!=A){return I;
}}}}}return C;
};
SimileAjax.DOM.cancelEvent=function(A){A.returnValue=false;
A.cancelBubble=true;
if("preventDefault" in A){A.preventDefault();
}};
SimileAjax.DOM.appendClassName=function(C,D){var B=C.className.split(" ");
for(var A=0;
A<B.length;
A++){if(B[A]==D){return ;
}}B.push(D);
C.className=B.join(" ");
};
SimileAjax.DOM.createInputElement=function(A){var B=document.createElement("div");
B.innerHTML="<input type='"+A+"' />";
return B.firstChild;
};
SimileAjax.DOM.createDOMFromTemplate=function(B){var A={};
A.elmt=SimileAjax.DOM._createDOMFromTemplate(B,A,null);
return A;
};
SimileAjax.DOM._createDOMFromTemplate=function(A,I,E){if(A==null){return null;
}else{if(typeof A!="object"){var D=document.createTextNode(A);
if(E!=null){E.appendChild(D);
}return D;
}else{var C=null;
if("tag" in A){var J=A.tag;
if(E!=null){if(J=="tr"){C=E.insertRow(E.rows.length);
}else{if(J=="td"){C=E.insertCell(E.cells.length);
}}}if(C==null){C=J=="input"?SimileAjax.DOM.createInputElement(A.type):document.createElement(J);
if(E!=null){E.appendChild(C);
}}}else{C=A.elmt;
if(E!=null){E.appendChild(C);
}}for(var B in A){var G=A[B];
if(B=="field"){I[G]=C;
}else{if(B=="className"){C.className=G;
}else{if(B=="id"){C.id=G;
}else{if(B=="title"){C.title=G;
}else{if(B=="type"&&C.tagName=="input"){}else{if(B=="style"){for(n in G){var H=G[n];
if(n=="float"){n=SimileAjax.Platform.browser.isIE?"styleFloat":"cssFloat";
}C.style[n]=H;
}}else{if(B=="children"){for(var F=0;
F<G.length;
F++){SimileAjax.DOM._createDOMFromTemplate(G[F],I,C);
}}else{if(B!="tag"&&B!="elmt"){C.setAttribute(B,G);
}}}}}}}}}return C;
}}};
SimileAjax.DOM._cachedParent=null;
SimileAjax.DOM.createElementFromString=function(A){if(SimileAjax.DOM._cachedParent==null){SimileAjax.DOM._cachedParent=document.createElement("div");
}SimileAjax.DOM._cachedParent.innerHTML=A;
return SimileAjax.DOM._cachedParent.firstChild;
};
SimileAjax.DOM.createDOMFromString=function(A,C,D){var B=typeof A=="string"?document.createElement(A):A;
B.innerHTML=C;
var E={elmt:B};
SimileAjax.DOM._processDOMChildrenConstructedFromString(E,B,D!=null?D:{});
return E;
};
SimileAjax.DOM._processDOMConstructedFromString=function(D,A,B){var E=A.id;
if(E!=null&&E.length>0){A.removeAttribute("id");
if(E in B){var C=A.parentNode;
C.insertBefore(B[E],A);
C.removeChild(A);
D[E]=B[E];
return ;
}else{D[E]=A;
}}if(A.hasChildNodes()){SimileAjax.DOM._processDOMChildrenConstructedFromString(D,A,B);
}};
SimileAjax.DOM._processDOMChildrenConstructedFromString=function(E,B,D){var C=B.firstChild;
while(C!=null){var A=C.nextSibling;
if(C.nodeType==1){SimileAjax.DOM._processDOMConstructedFromString(E,C,D);
}C=A;
}};


/* graphics.js */
SimileAjax.Graphics=new Object();
SimileAjax.Graphics.pngIsTranslucent=(!SimileAjax.Platform.browser.isIE)||(SimileAjax.Platform.browser.majorVersion>6);
SimileAjax.Graphics._createTranslucentImage1=function(A,C){var B=document.createElement("img");
B.setAttribute("src",A);
if(C!=null){B.style.verticalAlign=C;
}return B;
};
SimileAjax.Graphics._createTranslucentImage2=function(A,C){var B=document.createElement("img");
B.style.width="1px";
B.style.height="1px";
B.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+A+"', sizingMethod='image')";
B.style.verticalAlign=(C!=null)?C:"middle";
return B;
};
SimileAjax.Graphics.createTranslucentImage=SimileAjax.Graphics.pngIsTranslucent?SimileAjax.Graphics._createTranslucentImage1:SimileAjax.Graphics._createTranslucentImage2;
SimileAjax.Graphics._createTranslucentImageHTML1=function(A,B){return'<img src="'+A+'"'+(B!=null?' style="vertical-align: '+B+';"':"")+" />";
};
SimileAjax.Graphics._createTranslucentImageHTML2=function(A,C){var B="width: 1px; height: 1px; filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+A+"', sizingMethod='image');"+(C!=null?" vertical-align: "+C+";":"");
return"<img src='"+A+"' style=\""+B+'" />';
};
SimileAjax.Graphics.createTranslucentImageHTML=SimileAjax.Graphics.pngIsTranslucent?SimileAjax.Graphics._createTranslucentImageHTML1:SimileAjax.Graphics._createTranslucentImageHTML2;
SimileAjax.Graphics.setOpacity=function(B,A){if(SimileAjax.Platform.browser.isIE){B.style.filter="progid:DXImageTransform.Microsoft.Alpha(Style=0,Opacity="+A+")";
}else{var C=(A/100).toString();
B.style.opacity=C;
B.style.MozOpacity=C;
}};
SimileAjax.Graphics._bubbleMargins={top:33,bottom:42,left:33,right:40};
SimileAjax.Graphics._arrowOffsets={top:0,bottom:9,left:1,right:8};
SimileAjax.Graphics._bubblePadding=15;
SimileAjax.Graphics._bubblePointOffset=6;
SimileAjax.Graphics._halfArrowWidth=18;
SimileAjax.Graphics.createBubbleForContentAndPoint=function(E,D,C,A,B){if(typeof A!="number"){A=300;
}E.style.position="absolute";
E.style.left="-5000px";
E.style.top="0px";
E.style.width=A+"px";
document.body.appendChild(E);
window.setTimeout(function(){var H=E.scrollWidth+10;
var F=E.scrollHeight+10;
var G=SimileAjax.Graphics.createBubbleForPoint(D,C,H,F,B);
document.body.removeChild(E);
E.style.position="static";
E.style.left="";
E.style.top="";
E.style.width=H+"px";
G.content.appendChild(E);
},200);
};
SimileAjax.Graphics.createBubbleForPoint=function(C,B,N,R,F){function T(){if(typeof window.innerHeight=="number"){return{w:window.innerWidth,h:window.innerHeight};
}else{if(document.documentElement&&document.documentElement.clientHeight){return{w:document.documentElement.clientWidth,h:document.documentElement.clientHeight};
}else{if(document.body&&document.body.clientHeight){return{w:document.body.clientWidth,h:document.body.clientHeight};
}}}}var L=function(){if(!M._closed){document.body.removeChild(M._div);
M._doc=null;
M._div=null;
M._content=null;
M._closed=true;
}};
var M={_closed:false};
var O=T();
var H=O.w;
var G=O.h;
var D=SimileAjax.Graphics._bubbleMargins;
N=parseInt(N,10);
R=parseInt(R,10);
var P=D.left+N+D.right;
var U=D.top+R+D.bottom;
var Q=SimileAjax.Graphics.pngIsTranslucent;
var J=SimileAjax.urlPrefix;
var A=function(Z,Y,a,X){Z.style.position="absolute";
Z.style.width=a+"px";
Z.style.height=X+"px";
if(Q){Z.style.background="url("+Y+")";
}else{Z.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+Y+"', sizingMethod='crop')";
}};
var K=document.createElement("div");
K.style.width=P+"px";
K.style.height=U+"px";
K.style.position="absolute";
K.style.zIndex=1000;
var W=SimileAjax.WindowManager.pushLayer(L,true,K);
M._div=K;
M.close=function(){SimileAjax.WindowManager.popLayer(W);
};
var I=document.createElement("div");
I.style.width="100%";
I.style.height="100%";
I.style.position="relative";
K.appendChild(I);
var S=function(Z,c,b,a,Y){var X=document.createElement("div");
X.style.left=c+"px";
X.style.top=b+"px";
A(X,Z,a,Y);
I.appendChild(X);
};
S(J+"images/bubble-top-left.png",0,0,D.left,D.top);
S(J+"images/bubble-top.png",D.left,0,N,D.top);
S(J+"images/bubble-top-right.png",D.left+N,0,D.right,D.top);
S(J+"images/bubble-left.png",0,D.top,D.left,R);
S(J+"images/bubble-right.png",D.left+N,D.top,D.right,R);
S(J+"images/bubble-bottom-left.png",0,D.top+R,D.left,D.bottom);
S(J+"images/bubble-bottom.png",D.left,D.top+R,N,D.bottom);
S(J+"images/bubble-bottom-right.png",D.left+N,D.top+R,D.right,D.bottom);
var V=document.createElement("div");
V.style.left=(P-D.right+SimileAjax.Graphics._bubblePadding-16-2)+"px";
V.style.top=(D.top-SimileAjax.Graphics._bubblePadding+1)+"px";
V.style.cursor="pointer";
A(V,J+"images/close-button.png",16,16);
SimileAjax.WindowManager.registerEventWithObject(V,"click",M,"close");
I.appendChild(V);
var E=document.createElement("div");
E.style.position="absolute";
E.style.left=D.left+"px";
E.style.top=D.top+"px";
E.style.width=N+"px";
E.style.height=R+"px";
E.style.overflow="auto";
E.style.background="white";
I.appendChild(E);
M.content=E;
(function(){if(C-SimileAjax.Graphics._halfArrowWidth-SimileAjax.Graphics._bubblePadding>0&&C+SimileAjax.Graphics._halfArrowWidth+SimileAjax.Graphics._bubblePadding<H){var Z=C-Math.round(N/2)-D.left;
Z=C<(H/2)?Math.max(Z,-(D.left-SimileAjax.Graphics._bubblePadding)):Math.min(Z,H+(D.right-SimileAjax.Graphics._bubblePadding)-P);
if((F&&F=="top")||(!F&&(B-SimileAjax.Graphics._bubblePointOffset-U>0))){var X=document.createElement("div");
X.style.left=(C-SimileAjax.Graphics._halfArrowWidth-Z)+"px";
X.style.top=(D.top+R)+"px";
A(X,J+"images/bubble-bottom-arrow.png",37,D.bottom);
I.appendChild(X);
K.style.left=Z+"px";
K.style.top=(B-SimileAjax.Graphics._bubblePointOffset-U+SimileAjax.Graphics._arrowOffsets.bottom)+"px";
return ;
}else{if((F&&F=="bottom")||(!F&&(B+SimileAjax.Graphics._bubblePointOffset+U<G))){var X=document.createElement("div");
X.style.left=(C-SimileAjax.Graphics._halfArrowWidth-Z)+"px";
X.style.top="0px";
A(X,J+"images/bubble-top-arrow.png",37,D.top);
I.appendChild(X);
K.style.left=Z+"px";
K.style.top=(B+SimileAjax.Graphics._bubblePointOffset-SimileAjax.Graphics._arrowOffsets.top)+"px";
return ;
}}}var Y=B-Math.round(R/2)-D.top;
Y=B<(G/2)?Math.max(Y,-(D.top-SimileAjax.Graphics._bubblePadding)):Math.min(Y,G+(D.bottom-SimileAjax.Graphics._bubblePadding)-U);
if((F&&F=="left")||(!F&&(C-SimileAjax.Graphics._bubblePointOffset-P>0))){var X=document.createElement("div");
X.style.left=(D.left+N)+"px";
X.style.top=(B-SimileAjax.Graphics._halfArrowWidth-Y)+"px";
A(X,J+"images/bubble-right-arrow.png",D.right,37);
I.appendChild(X);
K.style.left=(C-SimileAjax.Graphics._bubblePointOffset-P+SimileAjax.Graphics._arrowOffsets.right)+"px";
K.style.top=Y+"px";
}else{if((F&&F=="right")||(!F&&(C-SimileAjax.Graphics._bubblePointOffset-P<H))){var X=document.createElement("div");
X.style.left="0px";
X.style.top=(B-SimileAjax.Graphics._halfArrowWidth-Y)+"px";
A(X,J+"images/bubble-left-arrow.png",D.left,37);
I.appendChild(X);
K.style.left=(C+SimileAjax.Graphics._bubblePointOffset-SimileAjax.Graphics._arrowOffsets.left)+"px";
K.style.top=Y+"px";
}}})();
document.body.appendChild(K);
return M;
};
SimileAjax.Graphics.createMessageBubble=function(H){var G=H.createElement("div");
if(SimileAjax.Graphics.pngIsTranslucent){var I=H.createElement("div");
I.style.height="33px";
I.style.background="url("+SimileAjax.urlPrefix+"images/message-top-left.png) top left no-repeat";
I.style.paddingLeft="44px";
G.appendChild(I);
var C=H.createElement("div");
C.style.height="33px";
C.style.background="url("+SimileAjax.urlPrefix+"images/message-top-right.png) top right no-repeat";
I.appendChild(C);
var F=H.createElement("div");
F.style.background="url("+SimileAjax.urlPrefix+"images/message-left.png) top left repeat-y";
F.style.paddingLeft="44px";
G.appendChild(F);
var A=H.createElement("div");
A.style.background="url("+SimileAjax.urlPrefix+"images/message-right.png) top right repeat-y";
A.style.paddingRight="44px";
F.appendChild(A);
var D=H.createElement("div");
A.appendChild(D);
var B=H.createElement("div");
B.style.height="55px";
B.style.background="url("+SimileAjax.urlPrefix+"images/message-bottom-left.png) bottom left no-repeat";
B.style.paddingLeft="44px";
G.appendChild(B);
var E=H.createElement("div");
E.style.height="55px";
E.style.background="url("+SimileAjax.urlPrefix+"images/message-bottom-right.png) bottom right no-repeat";
B.appendChild(E);
}else{G.style.border="2px solid #7777AA";
G.style.padding="20px";
G.style.background="white";
SimileAjax.Graphics.setOpacity(G,90);
var D=H.createElement("div");
G.appendChild(D);
}return{containerDiv:G,contentDiv:D};
};
SimileAjax.Graphics.createAnimation=function(B,E,D,C,A){return new SimileAjax.Graphics._Animation(B,E,D,C,A);
};
SimileAjax.Graphics._Animation=function(B,E,D,C,A){this.f=B;
this.cont=(typeof A=="function")?A:function(){};
this.from=E;
this.to=D;
this.current=E;
this.duration=C;
this.start=new Date().getTime();
this.timePassed=0;
};
SimileAjax.Graphics._Animation.prototype.run=function(){var A=this;
window.setTimeout(function(){A.step();
},50);
};
SimileAjax.Graphics._Animation.prototype.step=function(){this.timePassed+=50;
var B=this.timePassed/this.duration;
var A=-Math.cos(B*Math.PI)/2+0.5;
var D=A*(this.to-this.from)+this.from;
try{this.f(D,D-this.current);
}catch(C){}this.current=D;
if(this.timePassed<this.duration){this.run();
}else{this.f(this.to,0);
this["cont"]();
}};
SimileAjax.Graphics.createStructuredDataCopyButton=function(F,D,A,E){var G=document.createElement("div");
G.style.position="relative";
G.style.display="inline";
G.style.width=D+"px";
G.style.height=A+"px";
G.style.overflow="hidden";
G.style.margin="2px";
if(SimileAjax.Graphics.pngIsTranslucent){G.style.background="url("+F+") no-repeat";
}else{G.style.filter="progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+F+"', sizingMethod='image')";
}var C;
if(SimileAjax.Platform.browser.isIE){C="filter:alpha(opacity=0)";
}else{C="opacity: 0";
}G.innerHTML="<textarea rows='1' autocomplete='off' value='none' style='"+C+"' />";
var B=G.firstChild;
B.style.width=D+"px";
B.style.height=A+"px";
B.onmousedown=function(H){H=(H)?H:((event)?event:null);
if(H.button==2){B.value=E();
B.select();
}};
return G;
};
SimileAjax.Graphics.getFontRenderingContext=function(A,B){return new SimileAjax.Graphics._FontRenderingContext(A,B);
};
SimileAjax.Graphics._FontRenderingContext=function(A,B){this._elmt=A;
this._elmt.style.visibility="hidden";
if(typeof B=="string"){this._elmt.style.width=B;
}else{if(typeof B=="number"){this._elmt.style.width=B+"px";
}}};
SimileAjax.Graphics._FontRenderingContext.prototype.dispose=function(){this._elmt=null;
};
SimileAjax.Graphics._FontRenderingContext.prototype.update=function(){this._elmt.innerHTML="A";
this._lineHeight=this._elmt.offsetHeight;
};
SimileAjax.Graphics._FontRenderingContext.prototype.computeSize=function(A){this._elmt.innerHTML=A;
return{width:this._elmt.offsetWidth,height:this._elmt.offsetHeight};
};
SimileAjax.Graphics._FontRenderingContext.prototype.getLineHeight=function(){return this._lineHeight;
};


/* history.js */
SimileAjax.History={maxHistoryLength:10,historyFile:SimileAjax.urlPrefix+"content/history.html",enabled:true,_initialized:false,_listeners:new SimileAjax.ListenerQueue(),_actions:[],_baseIndex:0,_currentIndex:0,_plainDocumentTitle:document.title};
SimileAjax.History.formatHistoryEntryTitle=function(A){return SimileAjax.History._plainDocumentTitle+" {"+A+"}";
};
SimileAjax.History.initialize=function(){if(SimileAjax.History._initialized){return ;
}if(SimileAjax.History.enabled){var A=document.createElement("iframe");
A.id="simile-ajax-history";
A.style.position="absolute";
A.style.width="10px";
A.style.height="10px";
A.style.top="0px";
A.style.left="0px";
A.style.visibility="hidden";
A.src=SimileAjax.History.historyFile+"?0";
document.body.appendChild(A);

SimileAjax.DOM.registerEvent(A,"load",SimileAjax.History._handleIFrameOnLoad);
SimileAjax.History._iframe=A;
}SimileAjax.History._initialized=true;
};
SimileAjax.History.addListener=function(A){SimileAjax.History.initialize();
SimileAjax.History._listeners.add(A);
};
SimileAjax.History.removeListener=function(A){SimileAjax.History.initialize();
SimileAjax.History._listeners.remove(A);
};
SimileAjax.History.addAction=function(A){SimileAjax.History.initialize();
SimileAjax.History._listeners.fire("onBeforePerform",[A]);
window.setTimeout(function(){try{A.perform();
SimileAjax.History._listeners.fire("onAfterPerform",[A]);
if(SimileAjax.History.enabled){SimileAjax.History._actions=SimileAjax.History._actions.slice(0,SimileAjax.History._currentIndex-SimileAjax.History._baseIndex);
SimileAjax.History._actions.push(A);
SimileAjax.History._currentIndex++;
var C=SimileAjax.History._actions.length-SimileAjax.History.maxHistoryLength;
if(C>0){SimileAjax.History._actions=SimileAjax.History._actions.slice(C);
SimileAjax.History._baseIndex+=C;
}try{SimileAjax.History._iframe.contentWindow.location.search="?"+SimileAjax.History._currentIndex;
}catch(B){var D=SimileAjax.History.formatHistoryEntryTitle(A.label);
document.title=D;
}}}catch(B){SimileAjax.Debug.exception(B,"Error adding action {"+A.label+"} to history");
}},0);
};
SimileAjax.History.addLengthyAction=function(C,A,B){SimileAjax.History.addAction({perform:C,undo:A,label:B,uiLayer:SimileAjax.WindowManager.getBaseLayer(),lengthy:true});
};
SimileAjax.History._handleIFrameOnLoad=function(){try{var B=SimileAjax.History._iframe.contentWindow.location.search;
var F=(B.length==0)?0:Math.max(0,parseInt(B.substr(1)));
var E=function(){var G=F-SimileAjax.History._currentIndex;
SimileAjax.History._currentIndex+=G;
SimileAjax.History._baseIndex+=G;
SimileAjax.History._iframe.contentWindow.location.search="?"+F;
};
if(F<SimileAjax.History._currentIndex){SimileAjax.History._listeners.fire("onBeforeUndoSeveral",[]);
window.setTimeout(function(){while(SimileAjax.History._currentIndex>F&&SimileAjax.History._currentIndex>SimileAjax.History._baseIndex){SimileAjax.History._currentIndex--;
var G=SimileAjax.History._actions[SimileAjax.History._currentIndex-SimileAjax.History._baseIndex];
try{G.undo();
}catch(H){SimileAjax.Debug.exception(H,"History: Failed to undo action {"+G.label+"}");
}}SimileAjax.History._listeners.fire("onAfterUndoSeveral",[]);
E();
},0);
}else{if(F>SimileAjax.History._currentIndex){SimileAjax.History._listeners.fire("onBeforeRedoSeveral",[]);
window.setTimeout(function(){while(SimileAjax.History._currentIndex<F&&SimileAjax.History._currentIndex-SimileAjax.History._baseIndex<SimileAjax.History._actions.length){var G=SimileAjax.History._actions[SimileAjax.History._currentIndex-SimileAjax.History._baseIndex];
try{G.perform();
}catch(H){SimileAjax.Debug.exception(H,"History: Failed to redo action {"+G.label+"}");
}SimileAjax.History._currentIndex++;
}SimileAjax.History._listeners.fire("onAfterRedoSeveral",[]);
E();
},0);
}else{var A=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex-1;
var D=(A>=0&&A<SimileAjax.History._actions.length)?SimileAjax.History.formatHistoryEntryTitle(SimileAjax.History._actions[A].label):SimileAjax.History._plainDocumentTitle;
SimileAjax.History._iframe.contentWindow.document.title=D;
document.title=D;
}}}catch(C){}};
SimileAjax.History.getNextUndoAction=function(){try{var A=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex-1;
return SimileAjax.History._actions[A];
}catch(B){return null;
}};
SimileAjax.History.getNextRedoAction=function(){try{var A=SimileAjax.History._currentIndex-SimileAjax.History._baseIndex;
return SimileAjax.History._actions[A];
}catch(B){return null;
}};


/* html.js */
SimileAjax.HTML=new Object();
SimileAjax.HTML._e2uHash={};
(function(){var A=SimileAjax.HTML._e2uHash;
A["nbsp"]="\u00A0[space]";
A["iexcl"]="\u00A1";
A["cent"]="\u00A2";
A["pound"]="\u00A3";
A["curren"]="\u00A4";
A["yen"]="\u00A5";
A["brvbar"]="\u00A6";
A["sect"]="\u00A7";
A["uml"]="\u00A8";
A["copy"]="\u00A9";
A["ordf"]="\u00AA";
A["laquo"]="\u00AB";
A["not"]="\u00AC";
A["shy"]="\u00AD";
A["reg"]="\u00AE";
A["macr"]="\u00AF";
A["deg"]="\u00B0";
A["plusmn"]="\u00B1";
A["sup2"]="\u00B2";
A["sup3"]="\u00B3";
A["acute"]="\u00B4";
A["micro"]="\u00B5";
A["para"]="\u00B6";
A["middot"]="\u00B7";
A["cedil"]="\u00B8";
A["sup1"]="\u00B9";
A["ordm"]="\u00BA";
A["raquo"]="\u00BB";
A["frac14"]="\u00BC";
A["frac12"]="\u00BD";
A["frac34"]="\u00BE";
A["iquest"]="\u00BF";
A["Agrave"]="\u00C0";
A["Aacute"]="\u00C1";
A["Acirc"]="\u00C2";
A["Atilde"]="\u00C3";
A["Auml"]="\u00C4";
A["Aring"]="\u00C5";
A["AElig"]="\u00C6";
A["Ccedil"]="\u00C7";
A["Egrave"]="\u00C8";
A["Eacute"]="\u00C9";
A["Ecirc"]="\u00CA";
A["Euml"]="\u00CB";
A["Igrave"]="\u00CC";
A["Iacute"]="\u00CD";
A["Icirc"]="\u00CE";
A["Iuml"]="\u00CF";
A["ETH"]="\u00D0";
A["Ntilde"]="\u00D1";
A["Ograve"]="\u00D2";
A["Oacute"]="\u00D3";
A["Ocirc"]="\u00D4";
A["Otilde"]="\u00D5";
A["Ouml"]="\u00D6";
A["times"]="\u00D7";
A["Oslash"]="\u00D8";
A["Ugrave"]="\u00D9";
A["Uacute"]="\u00DA";
A["Ucirc"]="\u00DB";
A["Uuml"]="\u00DC";
A["Yacute"]="\u00DD";
A["THORN"]="\u00DE";
A["szlig"]="\u00DF";
A["agrave"]="\u00E0";
A["aacute"]="\u00E1";
A["acirc"]="\u00E2";
A["atilde"]="\u00E3";
A["auml"]="\u00E4";
A["aring"]="\u00E5";
A["aelig"]="\u00E6";
A["ccedil"]="\u00E7";
A["egrave"]="\u00E8";
A["eacute"]="\u00E9";
A["ecirc"]="\u00EA";
A["euml"]="\u00EB";
A["igrave"]="\u00EC";
A["iacute"]="\u00ED";
A["icirc"]="\u00EE";
A["iuml"]="\u00EF";
A["eth"]="\u00F0";
A["ntilde"]="\u00F1";
A["ograve"]="\u00F2";
A["oacute"]="\u00F3";
A["ocirc"]="\u00F4";
A["otilde"]="\u00F5";
A["ouml"]="\u00F6";
A["divide"]="\u00F7";
A["oslash"]="\u00F8";
A["ugrave"]="\u00F9";
A["uacute"]="\u00FA";
A["ucirc"]="\u00FB";
A["uuml"]="\u00FC";
A["yacute"]="\u00FD";
A["thorn"]="\u00FE";
A["yuml"]="\u00FF";
A["quot"]="\u0022";
A["amp"]="\u0026";
A["lt"]="\u003C";
A["gt"]="\u003E";
A["OElig"]="";
A["oelig"]="\u0153";
A["Scaron"]="\u0160";
A["scaron"]="\u0161";
A["Yuml"]="\u0178";
A["circ"]="\u02C6";
A["tilde"]="\u02DC";
A["ensp"]="\u2002";
A["emsp"]="\u2003";
A["thinsp"]="\u2009";
A["zwnj"]="\u200C";
A["zwj"]="\u200D";
A["lrm"]="\u200E";
A["rlm"]="\u200F";
A["ndash"]="\u2013";
A["mdash"]="\u2014";
A["lsquo"]="\u2018";
A["rsquo"]="\u2019";
A["sbquo"]="\u201A";
A["ldquo"]="\u201C";
A["rdquo"]="\u201D";
A["bdquo"]="\u201E";
A["dagger"]="\u2020";
A["Dagger"]="\u2021";
A["permil"]="\u2030";
A["lsaquo"]="\u2039";
A["rsaquo"]="\u203A";
A["euro"]="\u20AC";
A["fnof"]="\u0192";
A["Alpha"]="\u0391";
A["Beta"]="\u0392";
A["Gamma"]="\u0393";
A["Delta"]="\u0394";
A["Epsilon"]="\u0395";
A["Zeta"]="\u0396";
A["Eta"]="\u0397";
A["Theta"]="\u0398";
A["Iota"]="\u0399";
A["Kappa"]="\u039A";
A["Lambda"]="\u039B";
A["Mu"]="\u039C";
A["Nu"]="\u039D";
A["Xi"]="\u039E";
A["Omicron"]="\u039F";
A["Pi"]="\u03A0";
A["Rho"]="\u03A1";
A["Sigma"]="\u03A3";
A["Tau"]="\u03A4";
A["Upsilon"]="\u03A5";
A["Phi"]="\u03A6";
A["Chi"]="\u03A7";
A["Psi"]="\u03A8";
A["Omega"]="\u03A9";
A["alpha"]="\u03B1";
A["beta"]="\u03B2";
A["gamma"]="\u03B3";
A["delta"]="\u03B4";
A["epsilon"]="\u03B5";
A["zeta"]="\u03B6";
A["eta"]="\u03B7";
A["theta"]="\u03B8";
A["iota"]="\u03B9";
A["kappa"]="\u03BA";
A["lambda"]="\u03BB";
A["mu"]="\u03BC";
A["nu"]="\u03BD";
A["xi"]="\u03BE";
A["omicron"]="\u03BF";
A["pi"]="\u03C0";
A["rho"]="\u03C1";
A["sigmaf"]="\u03C2";
A["sigma"]="\u03C3";
A["tau"]="\u03C4";
A["upsilon"]="\u03C5";
A["phi"]="\u03C6";
A["chi"]="\u03C7";
A["psi"]="\u03C8";
A["omega"]="\u03C9";
A["thetasym"]="\u03D1";
A["upsih"]="\u03D2";
A["piv"]="\u03D6";
A["bull"]="\u2022";
A["hellip"]="\u2026";
A["prime"]="\u2032";
A["Prime"]="\u2033";
A["oline"]="\u203E";
A["frasl"]="\u2044";
A["weierp"]="\u2118";
A["image"]="\u2111";
A["real"]="\u211C";
A["trade"]="\u2122";
A["alefsym"]="\u2135";
A["larr"]="\u2190";
A["uarr"]="\u2191";
A["rarr"]="\u2192";
A["darr"]="\u2193";
A["harr"]="\u2194";
A["crarr"]="\u21B5";
A["lArr"]="\u21D0";
A["uArr"]="\u21D1";
A["rArr"]="\u21D2";
A["dArr"]="\u21D3";
A["hArr"]="\u21D4";
A["forall"]="\u2200";
A["part"]="\u2202";
A["exist"]="\u2203";
A["empty"]="\u2205";
A["nabla"]="\u2207";
A["isin"]="\u2208";
A["notin"]="\u2209";
A["ni"]="\u220B";
A["prod"]="\u220F";
A["sum"]="\u2211";
A["minus"]="\u2212";
A["lowast"]="\u2217";
A["radic"]="\u221A";
A["prop"]="\u221D";
A["infin"]="\u221E";
A["ang"]="\u2220";
A["and"]="\u2227";
A["or"]="\u2228";
A["cap"]="\u2229";
A["cup"]="\u222A";
A["int"]="\u222B";
A["there4"]="\u2234";
A["sim"]="\u223C";
A["cong"]="\u2245";
A["asymp"]="\u2248";
A["ne"]="\u2260";
A["equiv"]="\u2261";
A["le"]="\u2264";
A["ge"]="\u2265";
A["sub"]="\u2282";
A["sup"]="\u2283";
A["nsub"]="\u2284";
A["sube"]="\u2286";
A["supe"]="\u2287";
A["oplus"]="\u2295";
A["otimes"]="\u2297";
A["perp"]="\u22A5";
A["sdot"]="\u22C5";
A["lceil"]="\u2308";
A["rceil"]="\u2309";
A["lfloor"]="\u230A";
A["rfloor"]="\u230B";
A["lang"]="\u2329";
A["rang"]="\u232A";
A["loz"]="\u25CA";
A["spades"]="\u2660";
A["clubs"]="\u2663";
A["hearts"]="\u2665";
A["diams"]="\u2666";
})();
SimileAjax.HTML.deEntify=function(C){var D=SimileAjax.HTML._e2uHash;
var B=/&(\w+?);/;
while(B.test(C)){var A=C.match(B);
C=C.replace(B,D[A[1]]);
}return C;
};


/* jquery-1.2.1.js */
(function(){if(typeof jQuery!="undefined"){var _jQuery=jQuery;
}var jQuery=window.jQuery=function(selector,context){return this instanceof jQuery?this.init(selector,context):new jQuery(selector,context);
};
if(typeof $!="undefined"){var _$=$;
}window.$=jQuery;
var quickExpr=/^[^<]*(<(.|\s)+>)[^>]*$|^#(\w+)$/;
jQuery.fn=jQuery.prototype={init:function(selector,context){selector=selector||document;
if(typeof selector=="string"){var m=quickExpr.exec(selector);
if(m&&(m[1]||!context)){if(m[1]){selector=jQuery.clean([m[1]],context);
}else{var tmp=document.getElementById(m[3]);
if(tmp){if(tmp.id!=m[3]){return jQuery().find(selector);
}else{this[0]=tmp;
this.length=1;
return this;
}}else{selector=[];
}}}else{return new jQuery(context).find(selector);
}}else{if(jQuery.isFunction(selector)){return new jQuery(document)[jQuery.fn.ready?"ready":"load"](selector);
}}return this.setArray(selector.constructor==Array&&selector||(selector.jquery||selector.length&&selector!=window&&!selector.nodeType&&selector[0]!=undefined&&selector[0].nodeType)&&jQuery.makeArray(selector)||[selector]);
},jquery:"1.2.1",size:function(){return this.length;
},length:0,get:function(num){return num==undefined?jQuery.makeArray(this):this[num];
},pushStack:function(a){var ret=jQuery(a);
ret.prevObject=this;
return ret;
},setArray:function(a){this.length=0;
Array.prototype.push.apply(this,a);
return this;
},each:function(fn,args){return jQuery.each(this,fn,args);
},index:function(obj){var pos=-1;
this.each(function(i){if(this==obj){pos=i;
}});
return pos;
},attr:function(key,value,type){var obj=key;
if(key.constructor==String){if(value==undefined){return this.length&&jQuery[type||"attr"](this[0],key)||undefined;
}else{obj={};
obj[key]=value;
}}return this.each(function(index){for(var prop in obj){jQuery.attr(type?this.style:this,prop,jQuery.prop(this,obj[prop],type,index,prop));
}});
},css:function(key,value){return this.attr(key,value,"curCSS");
},text:function(e){if(typeof e!="object"&&e!=null){return this.empty().append(document.createTextNode(e));
}var t="";
jQuery.each(e||this,function(){jQuery.each(this.childNodes,function(){if(this.nodeType!=8){t+=this.nodeType!=1?this.nodeValue:jQuery.fn.text([this]);
}});
});
return t;
},wrapAll:function(html){if(this[0]){jQuery(html,this[0].ownerDocument).clone().insertBefore(this[0]).map(function(){var elem=this;
while(elem.firstChild){elem=elem.firstChild;
}return elem;
}).append(this);
}return this;
},wrapInner:function(html){return this.each(function(){jQuery(this).contents().wrapAll(html);
});
},wrap:function(html){return this.each(function(){jQuery(this).wrapAll(html);
});
},append:function(){return this.domManip(arguments,true,1,function(a){this.appendChild(a);
});
},prepend:function(){return this.domManip(arguments,true,-1,function(a){this.insertBefore(a,this.firstChild);
});
},before:function(){return this.domManip(arguments,false,1,function(a){this.parentNode.insertBefore(a,this);
});
},after:function(){return this.domManip(arguments,false,-1,function(a){this.parentNode.insertBefore(a,this.nextSibling);
});
},end:function(){return this.prevObject||jQuery([]);
},find:function(t){var data=jQuery.map(this,function(a){return jQuery.find(t,a);
});
return this.pushStack(/[^+>] [^+>]/.test(t)||t.indexOf("..")>-1?jQuery.unique(data):data);
},clone:function(events){var ret=this.map(function(){return this.outerHTML?jQuery(this.outerHTML)[0]:this.cloneNode(true);
});
var clone=ret.find("*").andSelf().each(function(){if(this[expando]!=undefined){this[expando]=null;
}});
if(events===true){this.find("*").andSelf().each(function(i){var events=jQuery.data(this,"events");
for(var type in events){for(var handler in events[type]){jQuery.event.add(clone[i],type,events[type][handler],events[type][handler].data);
}}});
}return ret;
},filter:function(t){return this.pushStack(jQuery.isFunction(t)&&jQuery.grep(this,function(el,index){return t.apply(el,[index]);
})||jQuery.multiFilter(t,this));
},not:function(t){return this.pushStack(t.constructor==String&&jQuery.multiFilter(t,this,true)||jQuery.grep(this,function(a){return(t.constructor==Array||t.jquery)?jQuery.inArray(a,t)<0:a!=t;
}));
},add:function(t){return this.pushStack(jQuery.merge(this.get(),t.constructor==String?jQuery(t).get():t.length!=undefined&&(!t.nodeName||jQuery.nodeName(t,"form"))?t:[t]));
},is:function(expr){return expr?jQuery.multiFilter(expr,this).length>0:false;
},hasClass:function(expr){return this.is("."+expr);
},val:function(val){if(val==undefined){if(this.length){var elem=this[0];
if(jQuery.nodeName(elem,"select")){var index=elem.selectedIndex,a=[],options=elem.options,one=elem.type=="select-one";
if(index<0){return null;
}for(var i=one?index:0,max=one?index+1:options.length;
i<max;
i++){var option=options[i];
if(option.selected){var val=jQuery.browser.msie&&!option.attributes["value"].specified?option.text:option.value;
if(one){return val;
}a.push(val);
}}return a;
}else{return this[0].value.replace(/\r/g,"");
}}}else{return this.each(function(){if(val.constructor==Array&&/radio|checkbox/.test(this.type)){this.checked=(jQuery.inArray(this.value,val)>=0||jQuery.inArray(this.name,val)>=0);
}else{if(jQuery.nodeName(this,"select")){var tmp=val.constructor==Array?val:[val];
jQuery("option",this).each(function(){this.selected=(jQuery.inArray(this.value,tmp)>=0||jQuery.inArray(this.text,tmp)>=0);
});
if(!tmp.length){this.selectedIndex=-1;
}}else{this.value=val;
}}});
}},html:function(val){return val==undefined?(this.length?this[0].innerHTML:null):this.empty().append(val);
},replaceWith:function(val){return this.after(val).remove();
},eq:function(i){return this.slice(i,i+1);
},slice:function(){return this.pushStack(Array.prototype.slice.apply(this,arguments));
},map:function(fn){return this.pushStack(jQuery.map(this,function(elem,i){return fn.call(elem,i,elem);
}));
},andSelf:function(){return this.add(this.prevObject);
},domManip:function(args,table,dir,fn){var clone=this.length>1,a;
return this.each(function(){if(!a){a=jQuery.clean(args,this.ownerDocument);
if(dir<0){a.reverse();
}}var obj=this;
if(table&&jQuery.nodeName(this,"table")&&jQuery.nodeName(a[0],"tr")){obj=this.getElementsByTagName("tbody")[0]||this.appendChild(document.createElement("tbody"));
}jQuery.each(a,function(){var elem=clone?this.cloneNode(true):this;
if(!evalScript(0,elem)){fn.call(obj,elem);
}});
});
}};
function evalScript(i,elem){var script=jQuery.nodeName(elem,"script");
if(script){if(elem.src){jQuery.ajax({url:elem.src,async:false,dataType:"script"});
}else{jQuery.globalEval(elem.text||elem.textContent||elem.innerHTML||"");
}if(elem.parentNode){elem.parentNode.removeChild(elem);
}}else{if(elem.nodeType==1){jQuery("script",elem).each(evalScript);
}}return script;
}jQuery.extend=jQuery.fn.extend=function(){var target=arguments[0]||{},a=1,al=arguments.length,deep=false;
if(target.constructor==Boolean){deep=target;
target=arguments[1]||{};
}if(al==1){target=this;
a=0;
}var prop;
for(;
a<al;
a++){if((prop=arguments[a])!=null){for(var i in prop){if(target==prop[i]){continue;
}if(deep&&typeof prop[i]=="object"&&target[i]){jQuery.extend(target[i],prop[i]);
}else{if(prop[i]!=undefined){target[i]=prop[i];
}}}}}return target;
};
var expando="jQuery"+(new Date()).getTime(),uuid=0,win={};
jQuery.extend({noConflict:function(deep){window.$=_$;
if(deep){window.jQuery=_jQuery;
}return jQuery;
},isFunction:function(fn){return !!fn&&typeof fn!="string"&&!fn.nodeName&&fn.constructor!=Array&&/function/i.test(fn+"");
},isXMLDoc:function(elem){return elem.documentElement&&!elem.body||elem.tagName&&elem.ownerDocument&&!elem.ownerDocument.body;
},globalEval:function(data){data=jQuery.trim(data);
if(data){if(window.execScript){window.execScript(data);
}else{if(jQuery.browser.safari){window.setTimeout(data,0);
}else{eval.call(window,data);
}}}},nodeName:function(elem,name){return elem.nodeName&&elem.nodeName.toUpperCase()==name.toUpperCase();
},cache:{},data:function(elem,name,data){elem=elem==window?win:elem;
var id=elem[expando];
if(!id){id=elem[expando]=++uuid;
}if(name&&!jQuery.cache[id]){jQuery.cache[id]={};
}if(data!=undefined){jQuery.cache[id][name]=data;
}return name?jQuery.cache[id][name]:id;
},removeData:function(elem,name){elem=elem==window?win:elem;
var id=elem[expando];
if(name){if(jQuery.cache[id]){delete jQuery.cache[id][name];
name="";
for(name in jQuery.cache[id]){break;
}if(!name){jQuery.removeData(elem);
}}}else{try{delete elem[expando];
}catch(e){if(elem.removeAttribute){elem.removeAttribute(expando);
}}delete jQuery.cache[id];
}},each:function(obj,fn,args){if(args){if(obj.length==undefined){for(var i in obj){fn.apply(obj[i],args);
}}else{for(var i=0,ol=obj.length;
i<ol;
i++){if(fn.apply(obj[i],args)===false){break;
}}}}else{if(obj.length==undefined){for(var i in obj){fn.call(obj[i],i,obj[i]);
}}else{for(var i=0,ol=obj.length,val=obj[0];
i<ol&&fn.call(val,i,val)!==false;
val=obj[++i]){}}}return obj;
},prop:function(elem,value,type,index,prop){if(jQuery.isFunction(value)){value=value.call(elem,[index]);
}var exclude=/z-?index|font-?weight|opacity|zoom|line-?height/i;
return value&&value.constructor==Number&&type=="curCSS"&&!exclude.test(prop)?value+"px":value;
},className:{add:function(elem,c){jQuery.each((c||"").split(/\s+/),function(i,cur){if(!jQuery.className.has(elem.className,cur)){elem.className+=(elem.className?" ":"")+cur;
}});
},remove:function(elem,c){elem.className=c!=undefined?jQuery.grep(elem.className.split(/\s+/),function(cur){return !jQuery.className.has(c,cur);
}).join(" "):"";
},has:function(t,c){return jQuery.inArray(c,(t.className||t).toString().split(/\s+/))>-1;
}},swap:function(e,o,f){for(var i in o){e.style["old"+i]=e.style[i];
e.style[i]=o[i];
}f.apply(e,[]);
for(var i in o){e.style[i]=e.style["old"+i];
}},css:function(e,p){if(p=="height"||p=="width"){var old={},oHeight,oWidth,d=["Top","Bottom","Right","Left"];
jQuery.each(d,function(){old["padding"+this]=0;
old["border"+this+"Width"]=0;
});
jQuery.swap(e,old,function(){if(jQuery(e).is(":visible")){oHeight=e.offsetHeight;
oWidth=e.offsetWidth;
}else{e=jQuery(e.cloneNode(true)).find(":radio").removeAttr("checked").end().css({visibility:"hidden",position:"absolute",display:"block",right:"0",left:"0"}).appendTo(e.parentNode)[0];
var parPos=jQuery.css(e.parentNode,"position")||"static";
if(parPos=="static"){e.parentNode.style.position="relative";
}oHeight=e.clientHeight;
oWidth=e.clientWidth;
if(parPos=="static"){e.parentNode.style.position="static";
}e.parentNode.removeChild(e);
}});
return p=="height"?oHeight:oWidth;
}return jQuery.curCSS(e,p);
},curCSS:function(elem,prop,force){var ret,stack=[],swap=[];
function color(a){if(!jQuery.browser.safari){return false;
}var ret=document.defaultView.getComputedStyle(a,null);
return !ret||ret.getPropertyValue("color")=="";
}if(prop=="opacity"&&jQuery.browser.msie){ret=jQuery.attr(elem.style,"opacity");
return ret==""?"1":ret;
}if(prop.match(/float/i)){prop=styleFloat;
}if(!force&&elem.style[prop]){ret=elem.style[prop];
}else{if(document.defaultView&&document.defaultView.getComputedStyle){if(prop.match(/float/i)){prop="float";
}prop=prop.replace(/([A-Z])/g,"-$1").toLowerCase();
var cur=document.defaultView.getComputedStyle(elem,null);
if(cur&&!color(elem)){ret=cur.getPropertyValue(prop);
}else{for(var a=elem;
a&&color(a);
a=a.parentNode){stack.unshift(a);
}for(a=0;
a<stack.length;
a++){if(color(stack[a])){swap[a]=stack[a].style.display;
stack[a].style.display="block";
}}ret=prop=="display"&&swap[stack.length-1]!=null?"none":document.defaultView.getComputedStyle(elem,null).getPropertyValue(prop)||"";
for(a=0;
a<swap.length;
a++){if(swap[a]!=null){stack[a].style.display=swap[a];
}}}if(prop=="opacity"&&ret==""){ret="1";
}}else{if(elem.currentStyle){var newProp=prop.replace(/\-(\w)/g,function(m,c){return c.toUpperCase();
});
ret=elem.currentStyle[prop]||elem.currentStyle[newProp];
if(!/^\d+(px)?$/i.test(ret)&&/^\d/.test(ret)){var style=elem.style.left;
var runtimeStyle=elem.runtimeStyle.left;
elem.runtimeStyle.left=elem.currentStyle.left;
elem.style.left=ret||0;
ret=elem.style.pixelLeft+"px";
elem.style.left=style;
elem.runtimeStyle.left=runtimeStyle;
}}}}return ret;
},clean:function(a,doc){var r=[];
doc=doc||document;
jQuery.each(a,function(i,arg){if(!arg){return ;
}if(arg.constructor==Number){arg=arg.toString();
}if(typeof arg=="string"){arg=arg.replace(/(<(\w+)[^>]*?)\/>/g,function(m,all,tag){return tag.match(/^(abbr|br|col|img|input|link|meta|param|hr|area)$/i)?m:all+"></"+tag+">";
});
var s=jQuery.trim(arg).toLowerCase(),div=doc.createElement("div"),tb=[];
var wrap=!s.indexOf("<opt")&&[1,"<select>","</select>"]||!s.indexOf("<leg")&&[1,"<fieldset>","</fieldset>"]||s.match(/^<(thead|tbody|tfoot|colg|cap)/)&&[1,"<table>","</table>"]||!s.indexOf("<tr")&&[2,"<table><tbody>","</tbody></table>"]||(!s.indexOf("<td")||!s.indexOf("<th"))&&[3,"<table><tbody><tr>","</tr></tbody></table>"]||!s.indexOf("<col")&&[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"]||jQuery.browser.msie&&[1,"div<div>","</div>"]||[0,"",""];
div.innerHTML=wrap[1]+arg+wrap[2];
while(wrap[0]--){div=div.lastChild;
}if(jQuery.browser.msie){if(!s.indexOf("<table")&&s.indexOf("<tbody")<0){tb=div.firstChild&&div.firstChild.childNodes;
}else{if(wrap[1]=="<table>"&&s.indexOf("<tbody")<0){tb=div.childNodes;
}}for(var n=tb.length-1;
n>=0;
--n){if(jQuery.nodeName(tb[n],"tbody")&&!tb[n].childNodes.length){tb[n].parentNode.removeChild(tb[n]);
}}if(/^\s/.test(arg)){div.insertBefore(doc.createTextNode(arg.match(/^\s*/)[0]),div.firstChild);
}}arg=jQuery.makeArray(div.childNodes);
}if(0===arg.length&&(!jQuery.nodeName(arg,"form")&&!jQuery.nodeName(arg,"select"))){return ;
}if(arg[0]==undefined||jQuery.nodeName(arg,"form")||arg.options){r.push(arg);
}else{r=jQuery.merge(r,arg);
}});
return r;
},attr:function(elem,name,value){var fix=jQuery.isXMLDoc(elem)?{}:jQuery.props;
if(name=="selected"&&jQuery.browser.safari){elem.parentNode.selectedIndex;
}if(fix[name]){if(value!=undefined){elem[fix[name]]=value;
}return elem[fix[name]];
}else{if(jQuery.browser.msie&&name=="style"){return jQuery.attr(elem.style,"cssText",value);
}else{if(value==undefined&&jQuery.browser.msie&&jQuery.nodeName(elem,"form")&&(name=="action"||name=="method")){return elem.getAttributeNode(name).nodeValue;
}else{if(elem.tagName){if(value!=undefined){if(name=="type"&&jQuery.nodeName(elem,"input")&&elem.parentNode){throw"type property can't be changed";
}elem.setAttribute(name,value);
}if(jQuery.browser.msie&&/href|src/.test(name)&&!jQuery.isXMLDoc(elem)){return elem.getAttribute(name,2);
}return elem.getAttribute(name);
}else{if(name=="opacity"&&jQuery.browser.msie){if(value!=undefined){elem.zoom=1;
elem.filter=(elem.filter||"").replace(/alpha\([^)]*\)/,"")+(parseFloat(value).toString()=="NaN"?"":"alpha(opacity="+value*100+")");
}return elem.filter?(parseFloat(elem.filter.match(/opacity=([^)]*)/)[1])/100).toString():"";
}name=name.replace(/-([a-z])/ig,function(z,b){return b.toUpperCase();
});
if(value!=undefined){elem[name]=value;
}return elem[name];
}}}}},trim:function(t){return(t||"").replace(/^\s+|\s+$/g,"");
},makeArray:function(a){var r=[];
if(typeof a!="array"){for(var i=0,al=a.length;
i<al;
i++){r.push(a[i]);
}}else{r=a.slice(0);
}return r;
},inArray:function(b,a){for(var i=0,al=a.length;
i<al;
i++){if(a[i]==b){return i;
}}return -1;
},merge:function(first,second){if(jQuery.browser.msie){for(var i=0;
second[i];
i++){if(second[i].nodeType!=8){first.push(second[i]);
}}}else{for(var i=0;
second[i];
i++){first.push(second[i]);
}}return first;
},unique:function(first){var r=[],done={};
try{for(var i=0,fl=first.length;
i<fl;
i++){var id=jQuery.data(first[i]);
if(!done[id]){done[id]=true;
r.push(first[i]);
}}}catch(e){r=first;
}return r;
},grep:function(elems,fn,inv){if(typeof fn=="string"){fn=eval("false||function(a,i){return "+fn+"}");
}var result=[];
for(var i=0,el=elems.length;
i<el;
i++){if(!inv&&fn(elems[i],i)||inv&&!fn(elems[i],i)){result.push(elems[i]);
}}return result;
},map:function(elems,fn){if(typeof fn=="string"){fn=eval("false||function(a){return "+fn+"}");
}var result=[];
for(var i=0,el=elems.length;
i<el;
i++){var val=fn(elems[i],i);
if(val!==null&&val!=undefined){if(val.constructor!=Array){val=[val];
}result=result.concat(val);
}}return result;
}});
var userAgent=navigator.userAgent.toLowerCase();
jQuery.browser={version:(userAgent.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[])[1],safari:/webkit/.test(userAgent),opera:/opera/.test(userAgent),msie:/msie/.test(userAgent)&&!/opera/.test(userAgent),mozilla:/mozilla/.test(userAgent)&&!/(compatible|webkit)/.test(userAgent)};
var styleFloat=jQuery.browser.msie?"styleFloat":"cssFloat";
jQuery.extend({boxModel:!jQuery.browser.msie||document.compatMode=="CSS1Compat",styleFloat:jQuery.browser.msie?"styleFloat":"cssFloat",props:{"for":"htmlFor","class":"className","float":styleFloat,cssFloat:styleFloat,styleFloat:styleFloat,innerHTML:"innerHTML",className:"className",value:"value",disabled:"disabled",checked:"checked",readonly:"readOnly",selected:"selected",maxlength:"maxLength"}});
jQuery.each({parent:"a.parentNode",parents:"jQuery.dir(a,'parentNode')",next:"jQuery.nth(a,2,'nextSibling')",prev:"jQuery.nth(a,2,'previousSibling')",nextAll:"jQuery.dir(a,'nextSibling')",prevAll:"jQuery.dir(a,'previousSibling')",siblings:"jQuery.sibling(a.parentNode.firstChild,a)",children:"jQuery.sibling(a.firstChild)",contents:"jQuery.nodeName(a,'iframe')?a.contentDocument||a.contentWindow.document:jQuery.makeArray(a.childNodes)"},function(i,n){jQuery.fn[i]=function(a){var ret=jQuery.map(this,n);
if(a&&typeof a=="string"){ret=jQuery.multiFilter(a,ret);
}return this.pushStack(jQuery.unique(ret));
};
});
jQuery.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(i,n){jQuery.fn[i]=function(){var a=arguments;
return this.each(function(){for(var j=0,al=a.length;
j<al;
j++){jQuery(a[j])[n](this);
}});
};
});
jQuery.each({removeAttr:function(key){jQuery.attr(this,key,"");
this.removeAttribute(key);
},addClass:function(c){jQuery.className.add(this,c);
},removeClass:function(c){jQuery.className.remove(this,c);
},toggleClass:function(c){jQuery.className[jQuery.className.has(this,c)?"remove":"add"](this,c);
},remove:function(a){if(!a||jQuery.filter(a,[this]).r.length){jQuery.removeData(this);
this.parentNode.removeChild(this);
}},empty:function(){jQuery("*",this).each(function(){jQuery.removeData(this);
});
while(this.firstChild){this.removeChild(this.firstChild);
}}},function(i,n){jQuery.fn[i]=function(){return this.each(n,arguments);
};
});
jQuery.each(["Height","Width"],function(i,name){var n=name.toLowerCase();
jQuery.fn[n]=function(h){return this[0]==window?jQuery.browser.safari&&self["inner"+name]||jQuery.boxModel&&Math.max(document.documentElement["client"+name],document.body["client"+name])||document.body["client"+name]:this[0]==document?Math.max(document.body["scroll"+name],document.body["offset"+name]):h==undefined?(this.length?jQuery.css(this[0],n):null):this.css(n,h.constructor==String?h:h+"px");
};
});
var chars=jQuery.browser.safari&&parseInt(jQuery.browser.version)<417?"(?:[\\w*_-]|\\\\.)":"(?:[\\w\u0128-\uFFFF*_-]|\\\\.)",quickChild=new RegExp("^>\\s*("+chars+"+)"),quickID=new RegExp("^("+chars+"+)(#)("+chars+"+)"),quickClass=new RegExp("^([#.]?)("+chars+"*)");
jQuery.extend({expr:{"":"m[2]=='*'||jQuery.nodeName(a,m[2])","#":"a.getAttribute('id')==m[2]",":":{lt:"i<m[3]-0",gt:"i>m[3]-0",nth:"m[3]-0==i",eq:"m[3]-0==i",first:"i==0",last:"i==r.length-1",even:"i%2==0",odd:"i%2","first-child":"a.parentNode.getElementsByTagName('*')[0]==a","last-child":"jQuery.nth(a.parentNode.lastChild,1,'previousSibling')==a","only-child":"!jQuery.nth(a.parentNode.lastChild,2,'previousSibling')",parent:"a.firstChild",empty:"!a.firstChild",contains:"(a.textContent||a.innerText||jQuery(a).text()||'').indexOf(m[3])>=0",visible:'"hidden"!=a.type&&jQuery.css(a,"display")!="none"&&jQuery.css(a,"visibility")!="hidden"',hidden:'"hidden"==a.type||jQuery.css(a,"display")=="none"||jQuery.css(a,"visibility")=="hidden"',enabled:"!a.disabled",disabled:"a.disabled",checked:"a.checked",selected:"a.selected||jQuery.attr(a,'selected')",text:"'text'==a.type",radio:"'radio'==a.type",checkbox:"'checkbox'==a.type",file:"'file'==a.type",password:"'password'==a.type",submit:"'submit'==a.type",image:"'image'==a.type",reset:"'reset'==a.type",button:'"button"==a.type||jQuery.nodeName(a,"button")',input:"/input|select|textarea|button/i.test(a.nodeName)",has:"jQuery.find(m[3],a).length",header:"/h\\d/i.test(a.nodeName)",animated:"jQuery.grep(jQuery.timers,function(fn){return a==fn.elem;}).length"}},parse:[/^(\[) *@?([\w-]+) *([!*$^~=]*) *('?"?)(.*?)\4 *\]/,/^(:)([\w-]+)\("?'?(.*?(\(.*?\))?[^(]*?)"?'?\)/,new RegExp("^([:.#]*)("+chars+"+)")],multiFilter:function(expr,elems,not){var old,cur=[];
while(expr&&expr!=old){old=expr;
var f=jQuery.filter(expr,elems,not);
expr=f.t.replace(/^\s*,\s*/,"");
cur=not?elems=f.r:jQuery.merge(cur,f.r);
}return cur;
},find:function(t,context){if(typeof t!="string"){return[t];
}if(context&&!context.nodeType){context=null;
}context=context||document;
var ret=[context],done=[],last;
while(t&&last!=t){var r=[];
last=t;
t=jQuery.trim(t);
var foundToken=false;
var re=quickChild;
var m=re.exec(t);
if(m){var nodeName=m[1].toUpperCase();
for(var i=0;
ret[i];
i++){for(var c=ret[i].firstChild;
c;
c=c.nextSibling){if(c.nodeType==1&&(nodeName=="*"||c.nodeName.toUpperCase()==nodeName.toUpperCase())){r.push(c);
}}}ret=r;
t=t.replace(re,"");
if(t.indexOf(" ")==0){continue;
}foundToken=true;
}else{re=/^([>+~])\s*(\w*)/i;
if((m=re.exec(t))!=null){r=[];
var nodeName=m[2],merge={};
m=m[1];
for(var j=0,rl=ret.length;
j<rl;
j++){var n=m=="~"||m=="+"?ret[j].nextSibling:ret[j].firstChild;
for(;
n;
n=n.nextSibling){if(n.nodeType==1){var id=jQuery.data(n);
if(m=="~"&&merge[id]){break;
}if(!nodeName||n.nodeName.toUpperCase()==nodeName.toUpperCase()){if(m=="~"){merge[id]=true;
}r.push(n);
}if(m=="+"){break;
}}}}ret=r;
t=jQuery.trim(t.replace(re,""));
foundToken=true;
}}if(t&&!foundToken){if(!t.indexOf(",")){if(context==ret[0]){ret.shift();
}done=jQuery.merge(done,ret);
r=ret=[context];
t=" "+t.substr(1,t.length);
}else{var re2=quickID;
var m=re2.exec(t);
if(m){m=[0,m[2],m[3],m[1]];
}else{re2=quickClass;
m=re2.exec(t);
}m[2]=m[2].replace(/\\/g,"");
var elem=ret[ret.length-1];
if(m[1]=="#"&&elem&&elem.getElementById&&!jQuery.isXMLDoc(elem)){var oid=elem.getElementById(m[2]);
if((jQuery.browser.msie||jQuery.browser.opera)&&oid&&typeof oid.id=="string"&&oid.id!=m[2]){oid=jQuery('[@id="'+m[2]+'"]',elem)[0];
}ret=r=oid&&(!m[3]||jQuery.nodeName(oid,m[3]))?[oid]:[];
}else{for(var i=0;
ret[i];
i++){var tag=m[1]=="#"&&m[3]?m[3]:m[1]!=""||m[0]==""?"*":m[2];
if(tag=="*"&&ret[i].nodeName.toLowerCase()=="object"){tag="param";
}r=jQuery.merge(r,ret[i].getElementsByTagName(tag));
}if(m[1]=="."){r=jQuery.classFilter(r,m[2]);
}if(m[1]=="#"){var tmp=[];
for(var i=0;
r[i];
i++){if(r[i].getAttribute("id")==m[2]){tmp=[r[i]];
break;
}}r=tmp;
}ret=r;
}t=t.replace(re2,"");
}}if(t){var val=jQuery.filter(t,r);
ret=r=val.r;
t=jQuery.trim(val.t);
}}if(t){ret=[];
}if(ret&&context==ret[0]){ret.shift();
}done=jQuery.merge(done,ret);
return done;
},classFilter:function(r,m,not){m=" "+m+" ";
var tmp=[];
for(var i=0;
r[i];
i++){var pass=(" "+r[i].className+" ").indexOf(m)>=0;
if(!not&&pass||not&&!pass){tmp.push(r[i]);
}}return tmp;
},filter:function(t,r,not){var last;
while(t&&t!=last){last=t;
var p=jQuery.parse,m;
for(var i=0;
p[i];
i++){m=p[i].exec(t);
if(m){t=t.substring(m[0].length);
m[2]=m[2].replace(/\\/g,"");
break;
}}if(!m){break;
}if(m[1]==":"&&m[2]=="not"){r=jQuery.filter(m[3],r,true).r;
}else{if(m[1]=="."){r=jQuery.classFilter(r,m[2],not);
}else{if(m[1]=="["){var tmp=[],type=m[3];
for(var i=0,rl=r.length;
i<rl;
i++){var a=r[i],z=a[jQuery.props[m[2]]||m[2]];
if(z==null||/href|src|selected/.test(m[2])){z=jQuery.attr(a,m[2])||"";
}if((type==""&&!!z||type=="="&&z==m[5]||type=="!="&&z!=m[5]||type=="^="&&z&&!z.indexOf(m[5])||type=="$="&&z.substr(z.length-m[5].length)==m[5]||(type=="*="||type=="~=")&&z.indexOf(m[5])>=0)^not){tmp.push(a);
}}r=tmp;
}else{if(m[1]==":"&&m[2]=="nth-child"){var merge={},tmp=[],test=/(\d*)n\+?(\d*)/.exec(m[3]=="even"&&"2n"||m[3]=="odd"&&"2n+1"||!/\D/.test(m[3])&&"n+"+m[3]||m[3]),first=(test[1]||1)-0,last=test[2]-0;
for(var i=0,rl=r.length;
i<rl;
i++){var node=r[i],parentNode=node.parentNode,id=jQuery.data(parentNode);
if(!merge[id]){var c=1;
for(var n=parentNode.firstChild;
n;
n=n.nextSibling){if(n.nodeType==1){n.nodeIndex=c++;
}}merge[id]=true;
}var add=false;
if(first==1){if(last==0||node.nodeIndex==last){add=true;
}}else{if((node.nodeIndex+last)%first==0){add=true;
}}if(add^not){tmp.push(node);
}}r=tmp;
}else{var f=jQuery.expr[m[1]];
if(typeof f!="string"){f=jQuery.expr[m[1]][m[2]];
}f=eval("false||function(a,i){return "+f+"}");
r=jQuery.grep(r,f,not);
}}}}}return{r:r,t:t};
},dir:function(elem,dir){var matched=[];
var cur=elem[dir];
while(cur&&cur!=document){if(cur.nodeType==1){matched.push(cur);
}cur=cur[dir];
}return matched;
},nth:function(cur,result,dir,elem){result=result||1;
var num=0;
for(;
cur;
cur=cur[dir]){if(cur.nodeType==1&&++num==result){break;
}}return cur;
},sibling:function(n,elem){var r=[];
for(;
n;
n=n.nextSibling){if(n.nodeType==1&&(!elem||n!=elem)){r.push(n);
}}return r;
}});
jQuery.event={add:function(element,type,handler,data){if(jQuery.browser.msie&&element.setInterval!=undefined){element=window;
}if(!handler.guid){handler.guid=this.guid++;
}if(data!=undefined){var fn=handler;
handler=function(){return fn.apply(this,arguments);
};
handler.data=data;
handler.guid=fn.guid;
}var parts=type.split(".");
type=parts[0];
handler.type=parts[1];
var events=jQuery.data(element,"events")||jQuery.data(element,"events",{});
var handle=jQuery.data(element,"handle",function(){var val;
if(typeof jQuery=="undefined"||jQuery.event.triggered){return val;
}val=jQuery.event.handle.apply(element,arguments);
return val;
});
var handlers=events[type];
if(!handlers){handlers=events[type]={};
if(element.addEventListener){element.addEventListener(type,handle,false);
}else{element.attachEvent("on"+type,handle);
}}handlers[handler.guid]=handler;
this.global[type]=true;
},guid:1,global:{},remove:function(element,type,handler){var events=jQuery.data(element,"events"),ret,index;
if(typeof type=="string"){var parts=type.split(".");
type=parts[0];
}if(events){if(type&&type.type){handler=type.handler;
type=type.type;
}if(!type){for(type in events){this.remove(element,type);
}}else{if(events[type]){if(handler){delete events[type][handler.guid];
}else{for(handler in events[type]){if(!parts[1]||events[type][handler].type==parts[1]){delete events[type][handler];
}}}for(ret in events[type]){break;
}if(!ret){if(element.removeEventListener){element.removeEventListener(type,jQuery.data(element,"handle"),false);
}else{element.detachEvent("on"+type,jQuery.data(element,"handle"));
}ret=null;
delete events[type];
}}}for(ret in events){break;
}if(!ret){jQuery.removeData(element,"events");
jQuery.removeData(element,"handle");
}}},trigger:function(type,data,element,donative,extra){data=jQuery.makeArray(data||[]);
if(!element){if(this.global[type]){jQuery("*").add([window,document]).trigger(type,data);
}}else{var val,ret,fn=jQuery.isFunction(element[type]||null),evt=!data[0]||!data[0].preventDefault;
if(evt){data.unshift(this.fix({type:type,target:element}));
}data[0].type=type;
if(jQuery.isFunction(jQuery.data(element,"handle"))){val=jQuery.data(element,"handle").apply(element,data);
}if(!fn&&element["on"+type]&&element["on"+type].apply(element,data)===false){val=false;
}if(evt){data.shift();
}if(extra&&extra.apply(element,data)===false){val=false;
}if(fn&&donative!==false&&val!==false&&!(jQuery.nodeName(element,"a")&&type=="click")){this.triggered=true;
element[type]();
}this.triggered=false;
}return val;
},handle:function(event){var val;
event=jQuery.event.fix(event||window.event||{});
var parts=event.type.split(".");
event.type=parts[0];
var c=jQuery.data(this,"events")&&jQuery.data(this,"events")[event.type],args=Array.prototype.slice.call(arguments,1);
args.unshift(event);
for(var j in c){args[0].handler=c[j];
args[0].data=c[j].data;
if(!parts[1]||c[j].type==parts[1]){var tmp=c[j].apply(this,args);
if(val!==false){val=tmp;
}if(tmp===false){event.preventDefault();
event.stopPropagation();
}}}if(jQuery.browser.msie){event.target=event.preventDefault=event.stopPropagation=event.handler=event.data=null;
}return val;
},fix:function(event){var originalEvent=event;
event=jQuery.extend({},originalEvent);
event.preventDefault=function(){if(originalEvent.preventDefault){originalEvent.preventDefault();
}originalEvent.returnValue=false;
};
event.stopPropagation=function(){if(originalEvent.stopPropagation){originalEvent.stopPropagation();
}originalEvent.cancelBubble=true;
};
if(!event.target&&event.srcElement){event.target=event.srcElement;
}if(jQuery.browser.safari&&event.target.nodeType==3){event.target=originalEvent.target.parentNode;
}if(!event.relatedTarget&&event.fromElement){event.relatedTarget=event.fromElement==event.target?event.toElement:event.fromElement;
}if(event.pageX==null&&event.clientX!=null){var e=document.documentElement,b=document.body;
event.pageX=event.clientX+(e&&e.scrollLeft||b.scrollLeft||0);
event.pageY=event.clientY+(e&&e.scrollTop||b.scrollTop||0);
}if(!event.which&&(event.charCode||event.keyCode)){event.which=event.charCode||event.keyCode;
}if(!event.metaKey&&event.ctrlKey){event.metaKey=event.ctrlKey;
}if(!event.which&&event.button){event.which=(event.button&1?1:(event.button&2?3:(event.button&4?2:0)));
}return event;
}};
jQuery.fn.extend({bind:function(type,data,fn){return type=="unload"?this.one(type,data,fn):this.each(function(){jQuery.event.add(this,type,fn||data,fn&&data);
});
},one:function(type,data,fn){return this.each(function(){jQuery.event.add(this,type,function(event){jQuery(this).unbind(event);
return(fn||data).apply(this,arguments);
},fn&&data);
});
},unbind:function(type,fn){return this.each(function(){jQuery.event.remove(this,type,fn);
});
},trigger:function(type,data,fn){return this.each(function(){jQuery.event.trigger(type,data,this,true,fn);
});
},triggerHandler:function(type,data,fn){if(this[0]){return jQuery.event.trigger(type,data,this[0],false,fn);
}},toggle:function(){var a=arguments;
return this.click(function(e){this.lastToggle=0==this.lastToggle?1:0;
e.preventDefault();
return a[this.lastToggle].apply(this,[e])||false;
});
},hover:function(f,g){function handleHover(e){var p=e.relatedTarget;
while(p&&p!=this){try{p=p.parentNode;
}catch(e){p=this;
}}if(p==this){return false;
}return(e.type=="mouseover"?f:g).apply(this,[e]);
}return this.mouseover(handleHover).mouseout(handleHover);
},ready:function(f){bindReady();
if(jQuery.isReady){f.apply(document,[jQuery]);
}else{jQuery.readyList.push(function(){return f.apply(this,[jQuery]);
});
}return this;
}});
jQuery.extend({isReady:false,readyList:[],ready:function(){if(!jQuery.isReady){jQuery.isReady=true;
if(jQuery.readyList){jQuery.each(jQuery.readyList,function(){this.apply(document);
});
jQuery.readyList=null;
}if(jQuery.browser.mozilla||jQuery.browser.opera){document.removeEventListener("DOMContentLoaded",jQuery.ready,false);
}if(!window.frames.length){jQuery(window).load(function(){jQuery("#__ie_init").remove();
});
}}}});
jQuery.each(("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,change,select,submit,keydown,keypress,keyup,error").split(","),function(i,o){jQuery.fn[o]=function(f){return f?this.bind(o,f):this.trigger(o);
};
});
var readyBound=false;
function bindReady(){if(readyBound){return ;
}readyBound=true;
if(jQuery.browser.mozilla||jQuery.browser.opera){document.addEventListener("DOMContentLoaded",jQuery.ready,false);
}else{if(jQuery.browser.msie){document.write("<script id=__ie_init defer=true src=//:><\/script>");
var script=document.getElementById("__ie_init");
if(script){script.onreadystatechange=function(){if(this.readyState!="complete"){return ;
}jQuery.ready();
};
}script=null;
}else{if(jQuery.browser.safari){jQuery.safariTimer=setInterval(function(){if(document.readyState=="loaded"||document.readyState=="complete"){clearInterval(jQuery.safariTimer);
jQuery.safariTimer=null;
jQuery.ready();
}},10);
}}}jQuery.event.add(window,"load",jQuery.ready);
}jQuery.fn.extend({load:function(url,params,callback){if(jQuery.isFunction(url)){return this.bind("load",url);
}var off=url.indexOf(" ");
if(off>=0){var selector=url.slice(off,url.length);
url=url.slice(0,off);
}callback=callback||function(){};
var type="GET";
if(params){if(jQuery.isFunction(params)){callback=params;
params=null;
}else{params=jQuery.param(params);
type="POST";
}}var self=this;
jQuery.ajax({url:url,type:type,data:params,complete:function(res,status){if(status=="success"||status=="notmodified"){self.html(selector?jQuery("<div/>").append(res.responseText.replace(/<script(.|\s)*?\/script>/g,"")).find(selector):res.responseText);
}setTimeout(function(){self.each(callback,[res.responseText,status,res]);
},13);
}});
return this;
},serialize:function(){return jQuery.param(this.serializeArray());
},serializeArray:function(){return this.map(function(){return jQuery.nodeName(this,"form")?jQuery.makeArray(this.elements):this;
}).filter(function(){return this.name&&!this.disabled&&(this.checked||/select|textarea/i.test(this.nodeName)||/text|hidden|password/i.test(this.type));
}).map(function(i,elem){var val=jQuery(this).val();
return val==null?null:val.constructor==Array?jQuery.map(val,function(val,i){return{name:elem.name,value:val};
}):{name:elem.name,value:val};
}).get();
}});
jQuery.each("ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","),function(i,o){jQuery.fn[o]=function(f){return this.bind(o,f);
};
});
var jsc=(new Date).getTime();
jQuery.extend({get:function(url,data,callback,type){if(jQuery.isFunction(data)){callback=data;
data=null;
}return jQuery.ajax({type:"GET",url:url,data:data,success:callback,dataType:type});
},getScript:function(url,callback){return jQuery.get(url,null,callback,"script");
},getJSON:function(url,data,callback){return jQuery.get(url,data,callback,"json");
},post:function(url,data,callback,type){if(jQuery.isFunction(data)){callback=data;
data={};
}return jQuery.ajax({type:"POST",url:url,data:data,success:callback,dataType:type});
},ajaxSetup:function(settings){jQuery.extend(jQuery.ajaxSettings,settings);
},ajaxSettings:{global:true,type:"GET",timeout:0,contentType:"application/x-www-form-urlencoded",processData:true,async:true,data:null},lastModified:{},ajax:function(s){var jsonp,jsre=/=(\?|%3F)/g,status,data;
s=jQuery.extend(true,s,jQuery.extend(true,{},jQuery.ajaxSettings,s));
if(s.data&&s.processData&&typeof s.data!="string"){s.data=jQuery.param(s.data);
}if(s.dataType=="jsonp"){if(s.type.toLowerCase()=="get"){if(!s.url.match(jsre)){s.url+=(s.url.match(/\?/)?"&":"?")+(s.jsonp||"callback")+"=?";
}}else{if(!s.data||!s.data.match(jsre)){s.data=(s.data?s.data+"&":"")+(s.jsonp||"callback")+"=?";
}}s.dataType="json";
}if(s.dataType=="json"&&(s.data&&s.data.match(jsre)||s.url.match(jsre))){jsonp="jsonp"+jsc++;
if(s.data){s.data=s.data.replace(jsre,"="+jsonp);
}s.url=s.url.replace(jsre,"="+jsonp);
s.dataType="script";
window[jsonp]=function(tmp){data=tmp;
success();
complete();
window[jsonp]=undefined;
try{delete window[jsonp];
}catch(e){}};
}if(s.dataType=="script"&&s.cache==null){s.cache=false;
}if(s.cache===false&&s.type.toLowerCase()=="get"){s.url+=(s.url.match(/\?/)?"&":"?")+"_="+(new Date()).getTime();
}if(s.data&&s.type.toLowerCase()=="get"){s.url+=(s.url.match(/\?/)?"&":"?")+s.data;
s.data=null;
}if(s.global&&!jQuery.active++){jQuery.event.trigger("ajaxStart");
}if(!s.url.indexOf("http")&&s.dataType=="script"){var head=document.getElementsByTagName("head")[0];
var script=document.createElement("script");
script.src=s.url;
if(!jsonp&&(s.success||s.complete)){var done=false;
script.onload=script.onreadystatechange=function(){if(!done&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){done=true;
success();
complete();
head.removeChild(script);
}};
}head.appendChild(script);
return ;
}var requestDone=false;
var xml=window.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest();
xml.open(s.type,s.url,s.async);
if(s.data){xml.setRequestHeader("Content-Type",s.contentType);
}if(s.ifModified){xml.setRequestHeader("If-Modified-Since",jQuery.lastModified[s.url]||"Thu, 01 Jan 1970 00:00:00 GMT");
}xml.setRequestHeader("X-Requested-With","XMLHttpRequest");
if(s.beforeSend){s.beforeSend(xml);
}if(s.global){jQuery.event.trigger("ajaxSend",[xml,s]);
}var onreadystatechange=function(isTimeout){if(!requestDone&&xml&&(xml.readyState==4||isTimeout=="timeout")){requestDone=true;
if(ival){clearInterval(ival);
ival=null;
}status=isTimeout=="timeout"&&"timeout"||!jQuery.httpSuccess(xml)&&"error"||s.ifModified&&jQuery.httpNotModified(xml,s.url)&&"notmodified"||"success";
if(status=="success"){try{data=jQuery.httpData(xml,s.dataType);
}catch(e){status="parsererror";
}}if(status=="success"){var modRes;
try{modRes=xml.getResponseHeader("Last-Modified");
}catch(e){}if(s.ifModified&&modRes){jQuery.lastModified[s.url]=modRes;
}if(!jsonp){success();
}}else{jQuery.handleError(s,xml,status);
}complete();
if(s.async){xml=null;
}}};
if(s.async){var ival=setInterval(onreadystatechange,13);
if(s.timeout>0){setTimeout(function(){if(xml){xml.abort();
if(!requestDone){onreadystatechange("timeout");
}}},s.timeout);
}}try{xml.send(s.data);
}catch(e){jQuery.handleError(s,xml,null,e);
}if(!s.async){onreadystatechange();
}return xml;
function success(){if(s.success){s.success(data,status);
}if(s.global){jQuery.event.trigger("ajaxSuccess",[xml,s]);
}}function complete(){if(s.complete){s.complete(xml,status);
}if(s.global){jQuery.event.trigger("ajaxComplete",[xml,s]);
}if(s.global&&!--jQuery.active){jQuery.event.trigger("ajaxStop");
}}},handleError:function(s,xml,status,e){if(s.error){s.error(xml,status,e);
}if(s.global){jQuery.event.trigger("ajaxError",[xml,s,e]);
}},active:0,httpSuccess:function(r){try{return !r.status&&location.protocol=="file:"||(r.status>=200&&r.status<300)||r.status==304||jQuery.browser.safari&&r.status==undefined;
}catch(e){}return false;
},httpNotModified:function(xml,url){try{var xmlRes=xml.getResponseHeader("Last-Modified");
return xml.status==304||xmlRes==jQuery.lastModified[url]||jQuery.browser.safari&&xml.status==undefined;
}catch(e){}return false;
},httpData:function(r,type){var ct=r.getResponseHeader("content-type");
var xml=type=="xml"||!type&&ct&&ct.indexOf("xml")>=0;
var data=xml?r.responseXML:r.responseText;
if(xml&&data.documentElement.tagName=="parsererror"){throw"parsererror";
}if(type=="script"){jQuery.globalEval(data);
}if(type=="json"){data=eval("("+data+")");
}return data;
},param:function(a){var s=[];
if(a.constructor==Array||a.jquery){jQuery.each(a,function(){s.push(encodeURIComponent(this.name)+"="+encodeURIComponent(this.value));
});
}else{for(var j in a){if(a[j]&&a[j].constructor==Array){jQuery.each(a[j],function(){s.push(encodeURIComponent(j)+"="+encodeURIComponent(this));
});
}else{s.push(encodeURIComponent(j)+"="+encodeURIComponent(a[j]));
}}}return s.join("&").replace(/%20/g,"+");
}});
jQuery.fn.extend({show:function(speed,callback){return speed?this.animate({height:"show",width:"show",opacity:"show"},speed,callback):this.filter(":hidden").each(function(){this.style.display=this.oldblock?this.oldblock:"";
if(jQuery.css(this,"display")=="none"){this.style.display="block";
}}).end();
},hide:function(speed,callback){return speed?this.animate({height:"hide",width:"hide",opacity:"hide"},speed,callback):this.filter(":visible").each(function(){this.oldblock=this.oldblock||jQuery.css(this,"display");
if(this.oldblock=="none"){this.oldblock="block";
}this.style.display="none";
}).end();
},_toggle:jQuery.fn.toggle,toggle:function(fn,fn2){return jQuery.isFunction(fn)&&jQuery.isFunction(fn2)?this._toggle(fn,fn2):fn?this.animate({height:"toggle",width:"toggle",opacity:"toggle"},fn,fn2):this.each(function(){jQuery(this)[jQuery(this).is(":hidden")?"show":"hide"]();
});
},slideDown:function(speed,callback){return this.animate({height:"show"},speed,callback);
},slideUp:function(speed,callback){return this.animate({height:"hide"},speed,callback);
},slideToggle:function(speed,callback){return this.animate({height:"toggle"},speed,callback);
},fadeIn:function(speed,callback){return this.animate({opacity:"show"},speed,callback);
},fadeOut:function(speed,callback){return this.animate({opacity:"hide"},speed,callback);
},fadeTo:function(speed,to,callback){return this.animate({opacity:to},speed,callback);
},animate:function(prop,speed,easing,callback){var opt=jQuery.speed(speed,easing,callback);
return this[opt.queue===false?"each":"queue"](function(){opt=jQuery.extend({},opt);
var hidden=jQuery(this).is(":hidden"),self=this;
for(var p in prop){if(prop[p]=="hide"&&hidden||prop[p]=="show"&&!hidden){return jQuery.isFunction(opt.complete)&&opt.complete.apply(this);
}if(p=="height"||p=="width"){opt.display=jQuery.css(this,"display");
opt.overflow=this.style.overflow;
}}if(opt.overflow!=null){this.style.overflow="hidden";
}opt.curAnim=jQuery.extend({},prop);
jQuery.each(prop,function(name,val){var e=new jQuery.fx(self,opt,name);
if(/toggle|show|hide/.test(val)){e[val=="toggle"?hidden?"show":"hide":val](prop);
}else{var parts=val.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),start=e.cur(true)||0;
if(parts){var end=parseFloat(parts[2]),unit=parts[3]||"px";
if(unit!="px"){self.style[name]=(end||1)+unit;
start=((end||1)/e.cur(true))*start;
self.style[name]=start+unit;
}if(parts[1]){end=((parts[1]=="-="?-1:1)*end)+start;
}e.custom(start,end,unit);
}else{e.custom(start,val,"");
}}});
return true;
});
},queue:function(type,fn){if(jQuery.isFunction(type)){fn=type;
type="fx";
}if(!type||(typeof type=="string"&&!fn)){return queue(this[0],type);
}return this.each(function(){if(fn.constructor==Array){queue(this,type,fn);
}else{queue(this,type).push(fn);
if(queue(this,type).length==1){fn.apply(this);
}}});
},stop:function(){var timers=jQuery.timers;
return this.each(function(){for(var i=0;
i<timers.length;
i++){if(timers[i].elem==this){timers.splice(i--,1);
}}}).dequeue();
}});
var queue=function(elem,type,array){if(!elem){return ;
}var q=jQuery.data(elem,type+"queue");
if(!q||array){q=jQuery.data(elem,type+"queue",array?jQuery.makeArray(array):[]);
}return q;
};
jQuery.fn.dequeue=function(type){type=type||"fx";
return this.each(function(){var q=queue(this,type);
q.shift();
if(q.length){q[0].apply(this);
}});
};
jQuery.extend({speed:function(speed,easing,fn){var opt=speed&&speed.constructor==Object?speed:{complete:fn||!fn&&easing||jQuery.isFunction(speed)&&speed,duration:speed,easing:fn&&easing||easing&&easing.constructor!=Function&&easing};
opt.duration=(opt.duration&&opt.duration.constructor==Number?opt.duration:{slow:600,fast:200}[opt.duration])||400;
opt.old=opt.complete;
opt.complete=function(){jQuery(this).dequeue();
if(jQuery.isFunction(opt.old)){opt.old.apply(this);
}};
return opt;
},easing:{linear:function(p,n,firstNum,diff){return firstNum+diff*p;
},swing:function(p,n,firstNum,diff){return((-Math.cos(p*Math.PI)/2)+0.5)*diff+firstNum;
}},timers:[],fx:function(elem,options,prop){this.options=options;
this.elem=elem;
this.prop=prop;
if(!options.orig){options.orig={};
}}});
jQuery.fx.prototype={update:function(){if(this.options.step){this.options.step.apply(this.elem,[this.now,this]);
}(jQuery.fx.step[this.prop]||jQuery.fx.step._default)(this);
if(this.prop=="height"||this.prop=="width"){this.elem.style.display="block";
}},cur:function(force){if(this.elem[this.prop]!=null&&this.elem.style[this.prop]==null){return this.elem[this.prop];
}var r=parseFloat(jQuery.curCSS(this.elem,this.prop,force));
return r&&r>-10000?r:parseFloat(jQuery.css(this.elem,this.prop))||0;
},custom:function(from,to,unit){this.startTime=(new Date()).getTime();
this.start=from;
this.end=to;
this.unit=unit||this.unit||"px";
this.now=this.start;
this.pos=this.state=0;
this.update();
var self=this;
function t(){return self.step();
}t.elem=this.elem;
jQuery.timers.push(t);
if(jQuery.timers.length==1){var timer=setInterval(function(){var timers=jQuery.timers;
for(var i=0;
i<timers.length;
i++){if(!timers[i]()){timers.splice(i--,1);
}}if(!timers.length){clearInterval(timer);
}},13);
}},show:function(){this.options.orig[this.prop]=jQuery.attr(this.elem.style,this.prop);
this.options.show=true;
this.custom(0,this.cur());
if(this.prop=="width"||this.prop=="height"){this.elem.style[this.prop]="1px";
}jQuery(this.elem).show();
},hide:function(){this.options.orig[this.prop]=jQuery.attr(this.elem.style,this.prop);
this.options.hide=true;
this.custom(this.cur(),0);
},step:function(){var t=(new Date()).getTime();
if(t>this.options.duration+this.startTime){this.now=this.end;
this.pos=this.state=1;
this.update();
this.options.curAnim[this.prop]=true;
var done=true;
for(var i in this.options.curAnim){if(this.options.curAnim[i]!==true){done=false;
}}if(done){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;
this.elem.style.display=this.options.display;
if(jQuery.css(this.elem,"display")=="none"){this.elem.style.display="block";
}}if(this.options.hide){this.elem.style.display="none";
}if(this.options.hide||this.options.show){for(var p in this.options.curAnim){jQuery.attr(this.elem.style,p,this.options.orig[p]);
}}}if(done&&jQuery.isFunction(this.options.complete)){this.options.complete.apply(this.elem);
}return false;
}else{var n=t-this.startTime;
this.state=n/this.options.duration;
this.pos=jQuery.easing[this.options.easing||(jQuery.easing.swing?"swing":"linear")](this.state,n,0,1,this.options.duration);
this.now=this.start+((this.end-this.start)*this.pos);
this.update();
}return true;
}};
jQuery.fx.step={scrollLeft:function(fx){fx.elem.scrollLeft=fx.now;
},scrollTop:function(fx){fx.elem.scrollTop=fx.now;
},opacity:function(fx){jQuery.attr(fx.elem.style,"opacity",fx.now);
},_default:function(fx){fx.elem.style[fx.prop]=fx.now+fx.unit;
}};
jQuery.fn.offset=function(){var left=0,top=0,elem=this[0],results;
if(elem){with(jQuery.browser){var absolute=jQuery.css(elem,"position")=="absolute",parent=elem.parentNode,offsetParent=elem.offsetParent,doc=elem.ownerDocument,safari2=safari&&parseInt(version)<522;
if(elem.getBoundingClientRect){box=elem.getBoundingClientRect();
add(box.left+Math.max(doc.documentElement.scrollLeft,doc.body.scrollLeft),box.top+Math.max(doc.documentElement.scrollTop,doc.body.scrollTop));
if(msie){var border=jQuery("html").css("borderWidth");
border=(border=="medium"||jQuery.boxModel&&parseInt(version)>=7)&&2||border;
add(-border,-border);
}}else{add(elem.offsetLeft,elem.offsetTop);
while(offsetParent){add(offsetParent.offsetLeft,offsetParent.offsetTop);
if(mozilla&&/^t[d|h]$/i.test(parent.tagName)||!safari2){border(offsetParent);
}if(safari2&&!absolute&&jQuery.css(offsetParent,"position")=="absolute"){absolute=true;
}offsetParent=offsetParent.offsetParent;
}while(parent.tagName&&!/^body|html$/i.test(parent.tagName)){if(!/^inline|table-row.*$/i.test(jQuery.css(parent,"display"))){add(-parent.scrollLeft,-parent.scrollTop);
}if(mozilla&&jQuery.css(parent,"overflow")!="visible"){border(parent);
}parent=parent.parentNode;
}if(safari2&&absolute){add(-doc.body.offsetLeft,-doc.body.offsetTop);
}}results={top:top,left:left};
}}return results;
function border(elem){add(jQuery.css(elem,"borderLeftWidth"),jQuery.css(elem,"borderTopWidth"));
}function add(l,t){left+=parseInt(l)||0;
top+=parseInt(t)||0;
}};
})();


/* json.js */
SimileAjax.JSON=new Object();
(function(){var m={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"};
var s={array:function(x){var a=["["],b,f,i,l=x.length,v;
for(i=0;
i<l;
i+=1){v=x[i];
f=s[typeof v];
if(f){v=f(v);
if(typeof v=="string"){if(b){a[a.length]=",";
}a[a.length]=v;
b=true;
}}}a[a.length]="]";
return a.join("");
},"boolean":function(x){return String(x);
},"null":function(x){return"null";
},number:function(x){return isFinite(x)?String(x):"null";
},object:function(x){if(x){if(x instanceof Array){return s.array(x);
}var a=["{"],b,f,i,v;
for(i in x){v=x[i];
f=s[typeof v];
if(f){v=f(v);
if(typeof v=="string"){if(b){a[a.length]=",";
}a.push(s.string(i),":",v);
b=true;
}}}a[a.length]="}";
return a.join("");
}return"null";
},string:function(x){if(/["\\\x00-\x1f]/.test(x)){x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){var c=m[b];
if(c){return c;
}c=b.charCodeAt();
return"\\u00"+Math.floor(c/16).toString(16)+(c%16).toString(16);
});
}return'"'+x+'"';
}};
SimileAjax.JSON.toJSONString=function(o){if(o instanceof Object){return s.object(o);
}else{if(o instanceof Array){return s.array(o);
}else{return o.toString();
}}};
SimileAjax.JSON.parseJSON=function(){try{return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(this.replace(/"(\\.|[^"\\])*"/g,"")))&&eval("("+this+")");
}catch(e){return false;
}};
})();


/* string.js */
String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"");
};
String.prototype.startsWith=function(A){return this.length>=A.length&&this.substr(0,A.length)==A;
};
String.prototype.endsWith=function(A){return this.length>=A.length&&this.substr(this.length-A.length)==A;
};
String.substitute=function(B,D){var A="";
var F=0;
while(F<B.length-1){var C=B.indexOf("%",F);
if(C<0||C==B.length-1){break;
}else{if(C>F&&B.charAt(C-1)=="\\"){A+=B.substring(F,C-1)+"%";
F=C+1;
}else{var E=parseInt(B.charAt(C+1));
if(isNaN(E)||E>=D.length){A+=B.substring(F,C+2);
}else{A+=B.substring(F,C)+D[E].toString();
}F=C+2;
}}}if(F<B.length){A+=B.substring(F);
}return A;
};


/* units.js */
SimileAjax.NativeDateUnit=new Object();
SimileAjax.NativeDateUnit.makeDefaultValue=function(){return new Date();
};
SimileAjax.NativeDateUnit.cloneValue=function(A){return new Date(A.getTime());
};
SimileAjax.NativeDateUnit.getParser=function(A){if(typeof A=="string"){A=A.toLowerCase();
}return(A=="iso8601"||A=="iso 8601")?SimileAjax.DateTime.parseIso8601DateTime:SimileAjax.DateTime.parseGregorianDateTime;
};
SimileAjax.NativeDateUnit.parseFromObject=function(A){return SimileAjax.DateTime.parseGregorianDateTime(A);
};
SimileAjax.NativeDateUnit.toNumber=function(A){return A.getTime();
};
SimileAjax.NativeDateUnit.fromNumber=function(A){return new Date(A);
};
SimileAjax.NativeDateUnit.compare=function(D,C){var B,A;
if(typeof D=="object"){B=D.getTime();
}else{B=Number(D);
}if(typeof C=="object"){A=C.getTime();
}else{A=Number(C);
}return B-A;
};
SimileAjax.NativeDateUnit.earlier=function(B,A){return SimileAjax.NativeDateUnit.compare(B,A)<0?B:A;
};
SimileAjax.NativeDateUnit.later=function(B,A){return SimileAjax.NativeDateUnit.compare(B,A)>0?B:A;
};
SimileAjax.NativeDateUnit.change=function(A,B){return new Date(A.getTime()+B);
};


/* window-manager.js */
SimileAjax.WindowManager={_initialized:false,_listeners:[],_draggedElement:null,_draggedElementCallback:null,_dropTargetHighlightElement:null,_lastCoords:null,_ghostCoords:null,_draggingMode:"",_dragging:false,_layers:[]};
SimileAjax.WindowManager.initialize=function(){if(SimileAjax.WindowManager._initialized){return ;
}SimileAjax.DOM.registerEvent(document.body,"mousedown",SimileAjax.WindowManager._onBodyMouseDown);
SimileAjax.DOM.registerEvent(document.body,"mousemove",SimileAjax.WindowManager._onBodyMouseMove);
SimileAjax.DOM.registerEvent(document.body,"mouseup",SimileAjax.WindowManager._onBodyMouseUp);
SimileAjax.DOM.registerEvent(document,"keydown",SimileAjax.WindowManager._onBodyKeyDown);
SimileAjax.DOM.registerEvent(document,"keyup",SimileAjax.WindowManager._onBodyKeyUp);
SimileAjax.WindowManager._layers.push({index:0});
SimileAjax.WindowManager._historyListener={onBeforeUndoSeveral:function(){},onAfterUndoSeveral:function(){},onBeforeUndo:function(){},onAfterUndo:function(){},onBeforeRedoSeveral:function(){},onAfterRedoSeveral:function(){},onBeforeRedo:function(){},onAfterRedo:function(){}};
SimileAjax.History.addListener(SimileAjax.WindowManager._historyListener);
SimileAjax.WindowManager._initialized=true;
};
SimileAjax.WindowManager.getBaseLayer=function(){SimileAjax.WindowManager.initialize();
return SimileAjax.WindowManager._layers[0];
};
SimileAjax.WindowManager.getHighestLayer=function(){SimileAjax.WindowManager.initialize();
return SimileAjax.WindowManager._layers[SimileAjax.WindowManager._layers.length-1];
};
SimileAjax.WindowManager.registerEventWithObject=function(D,A,E,B,C){SimileAjax.WindowManager.registerEvent(D,A,function(G,F,H){return E[B].call(E,G,F,H);
},C);
};
SimileAjax.WindowManager.registerEvent=function(D,B,E,C){if(C==null){C=SimileAjax.WindowManager.getHighestLayer();
}var A=function(G,F,I){if(SimileAjax.WindowManager._canProcessEventAtLayer(C)){SimileAjax.WindowManager._popToLayer(C.index);
try{E(G,F,I);
}catch(H){SimileAjax.Debug.exception(H);
}}SimileAjax.DOM.cancelEvent(F);
return false;
};
SimileAjax.DOM.registerEvent(D,B,A);
};
SimileAjax.WindowManager.pushLayer=function(C,D,B){var A={onPop:C,index:SimileAjax.WindowManager._layers.length,ephemeral:(D),elmt:B};
SimileAjax.WindowManager._layers.push(A);
return A;
};
SimileAjax.WindowManager.popLayer=function(B){for(var A=1;
A<SimileAjax.WindowManager._layers.length;
A++){if(SimileAjax.WindowManager._layers[A]==B){SimileAjax.WindowManager._popToLayer(A-1);
break;
}}};
SimileAjax.WindowManager.popAllLayers=function(){SimileAjax.WindowManager._popToLayer(0);
};
SimileAjax.WindowManager.registerForDragging=function(B,C,A){SimileAjax.WindowManager.registerEvent(B,"mousedown",function(E,D,F){SimileAjax.WindowManager._handleMouseDown(E,D,C);
},A);
};
SimileAjax.WindowManager._popToLayer=function(C){while(C+1<SimileAjax.WindowManager._layers.length){try{var A=SimileAjax.WindowManager._layers.pop();
if(A.onPop!=null){A.onPop();
}}catch(B){}}};
SimileAjax.WindowManager._canProcessEventAtLayer=function(B){if(B.index==(SimileAjax.WindowManager._layers.length-1)){return true;
}for(var A=B.index+1;
A<SimileAjax.WindowManager._layers.length;
A++){if(!SimileAjax.WindowManager._layers[A].ephemeral){return false;
}}return true;
};
SimileAjax.WindowManager.cancelPopups=function(A){var F=(A)?SimileAjax.DOM.getEventPageCoordinates(A):{x:-1,y:-1};
var E=SimileAjax.WindowManager._layers.length-1;
while(E>0&&SimileAjax.WindowManager._layers[E].ephemeral){var D=SimileAjax.WindowManager._layers[E];
if(D.elmt!=null){var C=D.elmt;
var B=SimileAjax.DOM.getPageCoordinates(C);
if(F.x>=B.left&&F.x<(B.left+C.offsetWidth)&&F.y>=B.top&&F.y<(B.top+C.offsetHeight)){break;
}}E--;
}SimileAjax.WindowManager._popToLayer(E);
};
SimileAjax.WindowManager._onBodyMouseDown=function(B,A,C){if(!("eventPhase" in A)||A.eventPhase==A.BUBBLING_PHASE){SimileAjax.WindowManager.cancelPopups(A);
}};
SimileAjax.WindowManager._handleMouseDown=function(B,A,C){SimileAjax.WindowManager._draggedElement=B;
SimileAjax.WindowManager._draggedElementCallback=C;
SimileAjax.WindowManager._lastCoords={x:A.clientX,y:A.clientY};
SimileAjax.DOM.cancelEvent(A);
return false;
};
SimileAjax.WindowManager._onBodyKeyDown=function(C,A,D){if(SimileAjax.WindowManager._dragging){if(A.keyCode==27){SimileAjax.WindowManager._cancelDragging();
}else{if((A.keyCode==17||A.keyCode==16)&&SimileAjax.WindowManager._draggingMode!="copy"){SimileAjax.WindowManager._draggingMode="copy";
var B=SimileAjax.Graphics.createTranslucentImage(SimileAjax.urlPrefix+"images/copy.png");
B.style.position="absolute";
B.style.left=(SimileAjax.WindowManager._ghostCoords.left-16)+"px";
B.style.top=(SimileAjax.WindowManager._ghostCoords.top)+"px";
document.body.appendChild(B);
SimileAjax.WindowManager._draggingModeIndicatorElmt=B;
}}}};
SimileAjax.WindowManager._onBodyKeyUp=function(B,A,C){if(SimileAjax.WindowManager._dragging){if(A.keyCode==17||A.keyCode==16){SimileAjax.WindowManager._draggingMode="";
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt);
SimileAjax.WindowManager._draggingModeIndicatorElmt=null;
}}}};
SimileAjax.WindowManager._onBodyMouseMove=function(A,N,H){if(SimileAjax.WindowManager._draggedElement!=null){var P=SimileAjax.WindowManager._draggedElementCallback;
var E=SimileAjax.WindowManager._lastCoords;
var M=N.clientX-E.x;
var J=N.clientY-E.y;
if(!SimileAjax.WindowManager._dragging){if(Math.abs(M)>5||Math.abs(J)>5){try{if("onDragStart" in P){P.onDragStart();
}if("ghost" in P&&P.ghost){var K=SimileAjax.WindowManager._draggedElement;
SimileAjax.WindowManager._ghostCoords=SimileAjax.DOM.getPageCoordinates(K);
SimileAjax.WindowManager._ghostCoords.left+=M;
SimileAjax.WindowManager._ghostCoords.top+=J;
var O=K.cloneNode(true);
O.style.position="absolute";
O.style.left=SimileAjax.WindowManager._ghostCoords.left+"px";
O.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
O.style.zIndex=1000;
SimileAjax.Graphics.setOpacity(O,50);
document.body.appendChild(O);
P._ghostElmt=O;
}SimileAjax.WindowManager._dragging=true;
SimileAjax.WindowManager._lastCoords={x:N.clientX,y:N.clientY};
document.body.focus();
}catch(G){SimileAjax.Debug.exception("WindowManager: Error handling mouse down",G);
SimileAjax.WindowManager._cancelDragging();
}}}else{try{SimileAjax.WindowManager._lastCoords={x:N.clientX,y:N.clientY};
if("onDragBy" in P){P.onDragBy(M,J);
}if("_ghostElmt" in P){var O=P._ghostElmt;
SimileAjax.WindowManager._ghostCoords.left+=M;
SimileAjax.WindowManager._ghostCoords.top+=J;
O.style.left=SimileAjax.WindowManager._ghostCoords.left+"px";
O.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){var I=SimileAjax.WindowManager._draggingModeIndicatorElmt;
I.style.left=(SimileAjax.WindowManager._ghostCoords.left-16)+"px";
I.style.top=SimileAjax.WindowManager._ghostCoords.top+"px";
}if("droppable" in P&&P.droppable){var L=SimileAjax.DOM.getEventPageCoordinates(N);
var H=SimileAjax.DOM.hittest(L.x,L.y,[SimileAjax.WindowManager._ghostElmt,SimileAjax.WindowManager._dropTargetHighlightElement]);
H=SimileAjax.WindowManager._findDropTarget(H);
if(H!=SimileAjax.WindowManager._potentialDropTarget){if(SimileAjax.WindowManager._dropTargetHighlightElement!=null){document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement);
SimileAjax.WindowManager._dropTargetHighlightElement=null;
SimileAjax.WindowManager._potentialDropTarget=null;
}var F=false;
if(H!=null){if((!("canDropOn" in P)||P.canDropOn(H))&&(!("canDrop" in H)||H.canDrop(SimileAjax.WindowManager._draggedElement))){F=true;
}}if(F){var C=4;
var D=SimileAjax.DOM.getPageCoordinates(H);
var B=document.createElement("div");
B.style.border=C+"px solid yellow";
B.style.backgroundColor="yellow";
B.style.position="absolute";
B.style.left=D.left+"px";
B.style.top=D.top+"px";
B.style.width=(H.offsetWidth-C*2)+"px";
B.style.height=(H.offsetHeight-C*2)+"px";
SimileAjax.Graphics.setOpacity(B,30);
document.body.appendChild(B);
SimileAjax.WindowManager._potentialDropTarget=H;
SimileAjax.WindowManager._dropTargetHighlightElement=B;
}}}}}catch(G){SimileAjax.Debug.exception("WindowManager: Error handling mouse move",G);
SimileAjax.WindowManager._cancelDragging();
}}SimileAjax.DOM.cancelEvent(N);
return false;
}};
SimileAjax.WindowManager._onBodyMouseUp=function(B,A,C){if(SimileAjax.WindowManager._draggedElement!=null){try{if(SimileAjax.WindowManager._dragging){var E=SimileAjax.WindowManager._draggedElementCallback;
if("onDragEnd" in E){E.onDragEnd();
}if("droppable" in E&&E.droppable){var D=false;
var C=SimileAjax.WindowManager._potentialDropTarget;
if(C!=null){if((!("canDropOn" in E)||E.canDropOn(C))&&(!("canDrop" in C)||C.canDrop(SimileAjax.WindowManager._draggedElement))){if("onDropOn" in E){E.onDropOn(C);
}C.ondrop(SimileAjax.WindowManager._draggedElement,SimileAjax.WindowManager._draggingMode);
D=true;
}}if(!D){}}}}finally{SimileAjax.WindowManager._cancelDragging();
}SimileAjax.DOM.cancelEvent(A);
return false;
}};
SimileAjax.WindowManager._cancelDragging=function(){var B=SimileAjax.WindowManager._draggedElementCallback;
if("_ghostElmt" in B){var A=B._ghostElmt;
document.body.removeChild(A);
delete B._ghostElmt;
}if(SimileAjax.WindowManager._dropTargetHighlightElement!=null){document.body.removeChild(SimileAjax.WindowManager._dropTargetHighlightElement);
SimileAjax.WindowManager._dropTargetHighlightElement=null;
}if(SimileAjax.WindowManager._draggingModeIndicatorElmt!=null){document.body.removeChild(SimileAjax.WindowManager._draggingModeIndicatorElmt);
SimileAjax.WindowManager._draggingModeIndicatorElmt=null;
}SimileAjax.WindowManager._draggedElement=null;
SimileAjax.WindowManager._draggedElementCallback=null;
SimileAjax.WindowManager._potentialDropTarget=null;
SimileAjax.WindowManager._dropTargetHighlightElement=null;
SimileAjax.WindowManager._lastCoords=null;
SimileAjax.WindowManager._ghostCoords=null;
SimileAjax.WindowManager._draggingMode="";
SimileAjax.WindowManager._dragging=false;
};
SimileAjax.WindowManager._findDropTarget=function(A){while(A!=null){if("ondrop" in A&&(typeof A.ondrop)=="function"){break;
}A=A.parentNode;
}return A;
};


/* xmlhttp.js */
SimileAjax.XmlHttp=new Object();
SimileAjax.XmlHttp._onReadyStateChange=function(A,D,B){
    switch(A.readyState)
        {case 4:try{
            if(A.status==0||A.status==200){
                if(typeof B=='function'){B(A);
                }}else{if(D){D(A.statusText,A.status,A);
            }}}catch(C){SimileAjax.Debug.exception("XmlHttp: Error handling onReadyStateChange",C);
        }break;
    }};
SimileAjax.XmlHttp._createRequest=function(){if(SimileAjax.Platform.browser.isIE){var A=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"];
for(var B=0;
B<A.length;
B++){try{var C=A[B];
var D=function(){return new ActiveXObject(C);
};
var F=D();
SimileAjax.XmlHttp._createRequest=D;
return F;
}catch(E){}}}try{var D=function(){return new XMLHttpRequest();
};
var F=D();
SimileAjax.XmlHttp._createRequest=D;
return F;
}catch(E){throw new Error("Failed to create an XMLHttpRequest object");
}};
SimileAjax.XmlHttp.get=function(A,D,C){var B=SimileAjax.XmlHttp._createRequest();
B.open("GET",A,true);
B.onreadystatechange=function(){SimileAjax.XmlHttp._onReadyStateChange(B,D,C);
};
B.send(null);
};
SimileAjax.XmlHttp.post=function(B,A,E,D){var C=SimileAjax.XmlHttp._createRequest();
C.open("POST",B,true);
C.onreadystatechange=function(){SimileAjax.XmlHttp._onReadyStateChange(C,E,D);
};
C.send(A);
};
SimileAjax.XmlHttp._forceXML=function(A){try{A.overrideMimeType("text/xml");
}catch(B){A.setrequestheader("Content-Type","text/xml");
}};

//timelineapi
    var useLocalResources = false;
    var ClientLocaleFromServer = '';
    
    var loadMe = function() {
        if ("Timeline" in window) {
            return;
        }
        
        window.Timeline = new Object();
        window.Timeline.DateTime = window.SimileAjax.DateTime; // for backward compatibility
    
        var bundle = true;
        var javascriptFiles = [
            "timeline.js",
            "themes.js",
            "ethers.js",
            "ether-painters.js",
            "labellers.js",
            "sources.js",
            "original-painter.js",
            "detailed-painter.js",
            "overview-painter.js",
            "decorators.js",
            "units.js"
        ];
        var cssFiles = [
            "timeline.css",
            "ethers.css",
            "events.css"
        ];
        
        var localizedJavascriptFiles = [
            "l10n-bundle.js"
        ];
        var localizedCssFiles = [
        ];
        
        // ISO-639 language codes, ISO-3166 country codes (2 characters)
        var supportedLocales = [
            "cs",       // Czech
            "de",       // German
            "en",       // English
            "es",       // Spanish
            "fr",       // French
            "it",       // Italian
            "ru",       // Russian
            "se",       // Swedish
            "vi",       // Vietnamese
            "zh"        // Chinese
        ];
        
        try {
            var desiredLocales = [ "en" ];
            var defaultServerLocale = "en";
            
            var parseURLParameters = function(parameters) {
                var params = parameters.split("&");
                for (var p = 0; p < params.length; p++) {
                    var pair = params[p].split("=");
                    if (pair[0] == "locales") {
                        desiredLocales = desiredLocales.concat(pair[1].split(","));
                    } else if (pair[0] == "defaultLocale") {
                        defaultServerLocale = pair[1];
                    } else if (pair[0] == "bundle") {
                        bundle = pair[1] != "false";
                    } else if (pair[0] == "clientlocale") {
                        ClientLocaleFromServer = pair[1];
                    }
                }
            };
            
            (function() {
                if (typeof Timeline_urlPrefix == "string") {
                    Timeline.urlPrefix = Timeline_urlPrefix;
                    if (typeof Timeline_parameters == "string") {
                        parseURLParameters(Timeline_parameters);
                    }
                } else {
                    var heads = document.documentElement.getElementsByTagName("head");
                    for (var h = 0; h < heads.length; h++) {
                        var scripts = heads[h].getElementsByTagName("script");
                        for (var s = 0; s < scripts.length; s++) {
                            var url = scripts[s].src;
                            var i = url.indexOf("timeline-all-min.js");  //url.indexOf("timeline-api.js");
                            if (i >= 0) {
                                Timeline.urlPrefix = url.substr(0, i);
                                var q = url.indexOf("?");
                                if (q > 0) {
                                    parseURLParameters(url.substr(q + 1));
                                }
                                return;
                            }
                        }
                    }
                    throw new Error("Failed to derive URL prefix for Timeline API code files");
                }
            })();
            
            var includeJavascriptFiles = function(urlPrefix, filenames) {
                SimileAjax.includeJavascriptFiles(document, urlPrefix, filenames);
            }
            var includeCssFiles = function(urlPrefix, filenames) {
                SimileAjax.includeCssFiles(document, urlPrefix, filenames);
            }
            
            /*
             *  Include non-localized files
             */
            if (bundle) {
                //includeJavascriptFiles(Timeline.urlPrefix, [ "timeline-bundle.js" ]);
                includeCssFiles(Timeline.urlPrefix, [ "timeline-bundle.css" ]);
            } else {
                //includeJavascriptFiles(Timeline.urlPrefix + "scripts/", javascriptFiles);
                includeCssFiles(Timeline.urlPrefix + "styles/", cssFiles);
            }
            
            /*
             *  Include localized files
             */
            var loadLocale = [];
            loadLocale[defaultServerLocale] = true;
            
            var tryExactLocale = function(locale) {
                for (var l = 0; l < supportedLocales.length; l++) {
                    if (locale == supportedLocales[l]) {
                        loadLocale[locale] = true;
                        return true;
                    }
                }
                return false;
            }
            var tryLocale = function(locale) {
                if (tryExactLocale(locale)) {
                    return locale;
                }
                
                var dash = locale.indexOf("-");
                if (dash > 0 && tryExactLocale(locale.substr(0, dash))) {
                    return locale.substr(0, dash);
                }
                
                return null;
            }
            
            for (var l = 0; l < desiredLocales.length; l++) {
                tryLocale(desiredLocales[l]);
            }
            
            var defaultClientLocale = defaultServerLocale;
            var defaultClientLocales = (ClientLocaleFromServer + ";" + ("language" in navigator ? navigator.language : navigator.browserLanguage)).split(";");
            for (var l = 0; l < defaultClientLocales.length; l++) {
                var locale = tryLocale(defaultClientLocales[l]);
                if (locale != null) {
                    defaultClientLocale = locale;
                    break;
                }
            }
            
            for (var l = 0; l < supportedLocales.length; l++) {
                var locale = supportedLocales[l];
                if (loadLocale[locale]) {
                    includeJavascriptFiles(Timeline.urlPrefix + "scripts/l10n/" + locale + "/", localizedJavascriptFiles);
                    includeCssFiles(Timeline.urlPrefix + "styles/l10n/" + locale + "/", localizedCssFiles);
                }
            }
            
            Timeline.serverLocale = defaultServerLocale;
            Timeline.clientLocale = defaultClientLocale;
        } catch (e) {
            alert(e);
        }
    };
loadMe();

//timeline bundle


/* decorators.js */



Timeline.SpanHighlightDecorator=function(params){
this._unit=("unit"in params)?params.unit:SimileAjax.NativeDateUnit;
this._startDate=(typeof params.startDate=="string")?
this._unit.parseFromObject(params.startDate):params.startDate;
this._endDate=(typeof params.endDate=="string")?
this._unit.parseFromObject(params.endDate):params.endDate;
this._startLabel=params.startLabel;
this._endLabel=params.endLabel;
this._color=params.color;
this._opacity=("opacity"in params)?params.opacity:100;
};

Timeline.SpanHighlightDecorator.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._layerDiv=null;
};

Timeline.SpanHighlightDecorator.prototype.paint=function(){
if(this._layerDiv!=null){
this._band.removeLayerDiv(this._layerDiv);
}
this._layerDiv=this._band.createLayerDiv(10);
this._layerDiv.setAttribute("name","span-highlight-decorator");
this._layerDiv.style.display="none";

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

if(this._unit.compare(this._startDate,maxDate)<0&&
this._unit.compare(this._endDate,minDate)>0){

minDate=this._unit.later(minDate,this._startDate);
maxDate=this._unit.earlier(maxDate,this._endDate);

var minPixel=this._band.dateToPixelOffset(minDate);
var maxPixel=this._band.dateToPixelOffset(maxDate);

var doc=this._timeline.getDocument();

var createTable=function(){
var table=doc.createElement("table");
table.insertRow(0).insertCell(0);
return table;
};

var div=doc.createElement("div");
div.style.position="absolute";
div.style.overflow="hidden";
div.style.background=this._color;
if(this._opacity<100){
SimileAjax.Graphics.setOpacity(div,this._opacity);
}
this._layerDiv.appendChild(div);

var tableStartLabel=createTable();
tableStartLabel.style.position="absolute";
tableStartLabel.style.overflow="hidden";
tableStartLabel.style.fontSize="200%";
tableStartLabel.style.fontWeight="bold";
tableStartLabel.style.color=this._color;
tableStartLabel.rows[0].cells[0].innerHTML=this._startLabel;
this._layerDiv.appendChild(tableStartLabel);

var tableEndLabel=createTable();
tableEndLabel.style.position="absolute";
tableEndLabel.style.overflow="hidden";
tableEndLabel.style.fontSize="200%";
tableEndLabel.style.fontWeight="bold";
tableEndLabel.style.color=this._color;
tableEndLabel.rows[0].cells[0].innerHTML=this._endLabel;
this._layerDiv.appendChild(tableEndLabel);

if(this._timeline.isHorizontal()){
div.style.left=minPixel+"px";
div.style.width=(maxPixel-minPixel)+"px";
div.style.top="0px";
div.style.height="100%";

tableStartLabel.style.right=(this._band.getTotalViewLength()-minPixel)+"px";
tableStartLabel.style.width=(this._startLabel.length)+"em";
tableStartLabel.style.top="0px";
tableStartLabel.style.height="100%";
tableStartLabel.style.textAlign="right";
tableStartLabel.rows[0].style.verticalAlign="top";

tableEndLabel.style.left=maxPixel+"px";
tableEndLabel.style.width=(this._endLabel.length)+"em";
tableEndLabel.style.top="0px";
tableEndLabel.style.height="100%";
tableEndLabel.rows[0].style.verticalAlign="top";
}else{
div.style.top=minPixel+"px";
div.style.height=(maxPixel-minPixel)+"px";
div.style.left="0px";
div.style.width="100%";

tableStartLabel.style.bottom=minPixel+"px";
tableStartLabel.style.height="1.5px";
tableStartLabel.style.left="0px";
tableStartLabel.style.width="100%";

tableEndLabel.style.top=maxPixel+"px";
tableEndLabel.style.height="1.5px";
tableEndLabel.style.left="0px";
tableEndLabel.style.width="100%";
}
}
this._layerDiv.style.display="block";
};

Timeline.SpanHighlightDecorator.prototype.softPaint=function(){
};



Timeline.PointHighlightDecorator=function(params){
this._unit=("unit"in params)?params.unit:SimileAjax.NativeDateUnit;
this._date=(typeof params.date=="string")?
this._unit.parseFromObject(params.date):params.date;
this._width=("width"in params)?params.width:10;
this._color=params.color;
this._opacity=("opacity"in params)?params.opacity:100;
};

Timeline.PointHighlightDecorator.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._layerDiv=null;
};

Timeline.PointHighlightDecorator.prototype.paint=function(){
if(this._layerDiv!=null){
this._band.removeLayerDiv(this._layerDiv);
}
this._layerDiv=this._band.createLayerDiv(10);
this._layerDiv.setAttribute("name","span-highlight-decorator");
this._layerDiv.style.display="none";

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

if(this._unit.compare(this._date,maxDate)<0&&
this._unit.compare(this._date,minDate)>0){

var pixel=this._band.dateToPixelOffset(this._date);
var minPixel=pixel-Math.round(this._width/2);

var doc=this._timeline.getDocument();

var div=doc.createElement("div");
div.style.position="absolute";
div.style.overflow="hidden";
div.style.background=this._color;
if(this._opacity<100){
SimileAjax.Graphics.setOpacity(div,this._opacity);
}
this._layerDiv.appendChild(div);

if(this._timeline.isHorizontal()){
div.style.left=minPixel+"px";
div.style.width=this._width+"px";
div.style.top="0px";
div.style.height="100%";
}else{
div.style.top=minPixel+"px";
div.style.height=this._width+"px";
div.style.left="0px";
div.style.width="100%";
}
}
this._layerDiv.style.display="block";
};

Timeline.PointHighlightDecorator.prototype.softPaint=function(){
};


/* detailed-painter.js */



Timeline.DetailedEventPainter=function(params){
this._params=params;
this._onSelectListeners=[];

this._filterMatcher=null;
this._highlightMatcher=null;
this._frc=null;

this._eventIdToElmt={};
};

Timeline.DetailedEventPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._backLayer=null;
this._eventLayer=null;
this._lineLayer=null;
this._highlightLayer=null;

this._eventIdToElmt=null;
};

Timeline.DetailedEventPainter.prototype.addOnSelectListener=function(listener){
this._onSelectListeners.push(listener);
};

Timeline.DetailedEventPainter.prototype.removeOnSelectListener=function(listener){
for(var i=0;i<this._onSelectListeners.length;i++){
if(this._onSelectListeners[i]==listener){
this._onSelectListeners.splice(i,1);
break;
}
}
};

Timeline.DetailedEventPainter.prototype.getFilterMatcher=function(){
return this._filterMatcher;
};

Timeline.DetailedEventPainter.prototype.setFilterMatcher=function(filterMatcher){
this._filterMatcher=filterMatcher;
};

Timeline.DetailedEventPainter.prototype.getHighlightMatcher=function(){
return this._highlightMatcher;
};

Timeline.DetailedEventPainter.prototype.setHighlightMatcher=function(highlightMatcher){
this._highlightMatcher=highlightMatcher;
};

Timeline.DetailedEventPainter.prototype.paint=function(){
var eventSource=this._band.getEventSource();
if(eventSource==null){
return;
}

this._eventIdToElmt={};
this._prepareForPainting();

var eventTheme=this._params.theme.event;
var trackHeight=Math.max(eventTheme.track.height,this._frc.getLineHeight());
var metrics={
trackOffset:Math.round(this._band.getViewWidth()/2-trackHeight/2),
trackHeight:trackHeight,
trackGap:eventTheme.track.gap,
trackIncrement:trackHeight+eventTheme.track.gap,
icon:eventTheme.instant.icon,
iconWidth:eventTheme.instant.iconWidth,
iconHeight:eventTheme.instant.iconHeight,
labelWidth:eventTheme.label.width
}

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

var filterMatcher=(this._filterMatcher!=null)?
this._filterMatcher:
function(evt){return true;};
var highlightMatcher=(this._highlightMatcher!=null)?
this._highlightMatcher:
function(evt){return-1;};

var iterator=eventSource.getEventReverseIterator(minDate,maxDate);
while(iterator.hasNext()){
var evt=iterator.next();
if(filterMatcher(evt)){
this.paintEvent(evt,metrics,this._params.theme,highlightMatcher(evt));
}
}

this._highlightLayer.style.display="block";
this._lineLayer.style.display="block";
this._eventLayer.style.display="block";
};

Timeline.DetailedEventPainter.prototype.softPaint=function(){
};

Timeline.DetailedEventPainter.prototype._prepareForPainting=function(){
var band=this._band;

if(this._backLayer==null){
this._backLayer=this._band.createLayerDiv(0,"timeline-band-events");
this._backLayer.style.visibility="hidden";

var eventLabelPrototype=document.createElement("span");
eventLabelPrototype.className="timeline-event-label";
this._backLayer.appendChild(eventLabelPrototype);
this._frc=SimileAjax.Graphics.getFontRenderingContext(eventLabelPrototype);
}
this._frc.update();
this._lowerTracks=[];
this._upperTracks=[];

if(this._highlightLayer!=null){
band.removeLayerDiv(this._highlightLayer);
}
this._highlightLayer=band.createLayerDiv(105,"timeline-band-highlights");
this._highlightLayer.style.display="none";

if(this._lineLayer!=null){
band.removeLayerDiv(this._lineLayer);
}
this._lineLayer=band.createLayerDiv(110,"timeline-band-lines");
this._lineLayer.style.display="none";

if(this._eventLayer!=null){
band.removeLayerDiv(this._eventLayer);
}
this._eventLayer=band.createLayerDiv(110,"timeline-band-events");
this._eventLayer.style.display="none";
};

Timeline.DetailedEventPainter.prototype.paintEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isInstant()){
this.paintInstantEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintDurationEvent(evt,metrics,theme,highlightIndex);
}
};

Timeline.DetailedEventPainter.prototype.paintInstantEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isImprecise()){
this.paintImpreciseInstantEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintPreciseInstantEvent(evt,metrics,theme,highlightIndex);
}
}

Timeline.DetailedEventPainter.prototype.paintDurationEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isImprecise()){
this.paintImpreciseDurationEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintPreciseDurationEvent(evt,metrics,theme,highlightIndex);
}
}

Timeline.DetailedEventPainter.prototype.paintPreciseInstantEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var iconRightEdge=Math.round(startPixel+metrics.iconWidth/2);
var iconLeftEdge=Math.round(startPixel-metrics.iconWidth/2);

var labelSize=this._frc.computeSize(text);
var iconTrack=this._findFreeTrackForSolid(iconRightEdge,startPixel);
var iconElmtData=this._paintEventIcon(evt,iconTrack,iconLeftEdge,metrics,theme);

var labelLeft=iconRightEdge+theme.event.label.offsetFromLine;
var labelTrack=iconTrack;

var iconTrackData=this._getTrackData(iconTrack);
if(Math.min(iconTrackData.solid,iconTrackData.text)>=labelLeft+labelSize.width){
iconTrackData.solid=iconLeftEdge;
iconTrackData.text=labelLeft;
}else{
iconTrackData.solid=iconLeftEdge;

labelLeft=startPixel+theme.event.label.offsetFromLine;
labelTrack=this._findFreeTrackForText(iconTrack,labelLeft+labelSize.width,function(t){t.line=startPixel-2;});
this._getTrackData(labelTrack).text=iconLeftEdge;

this._paintEventLine(evt,startPixel,iconTrack,labelTrack,metrics,theme);
}

var labelTop=Math.round(
metrics.trackOffset+labelTrack*metrics.trackIncrement+
metrics.trackHeight/2-labelSize.height/2);

var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickInstantEvent(iconElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(iconElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,iconElmtData,theme);

this._eventIdToElmt[evt.getID()]=iconElmtData.elmt;
};

Timeline.DetailedEventPainter.prototype.paintImpreciseInstantEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var endDate=evt.getEnd();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var endPixel=Math.round(this._band.dateToPixelOffset(endDate));

var iconRightEdge=Math.round(startPixel+metrics.iconWidth/2);
var iconLeftEdge=Math.round(startPixel-metrics.iconWidth/2);

var labelSize=this._frc.computeSize(text);
var iconTrack=this._findFreeTrackForSolid(endPixel,startPixel);

var tapeElmtData=this._paintEventTape(evt,iconTrack,startPixel,endPixel,
theme.event.instant.impreciseColor,theme.event.instant.impreciseOpacity,metrics,theme);
var iconElmtData=this._paintEventIcon(evt,iconTrack,iconLeftEdge,metrics,theme);

var iconTrackData=this._getTrackData(iconTrack);
iconTrackData.solid=iconLeftEdge;

var labelLeft=iconRightEdge+theme.event.label.offsetFromLine;
var labelRight=labelLeft+labelSize.width;
var labelTrack;
if(labelRight<endPixel){
labelTrack=iconTrack;
}else{
labelLeft=startPixel+theme.event.label.offsetFromLine;
labelRight=labelLeft+labelSize.width;

labelTrack=this._findFreeTrackForText(iconTrack,labelRight,function(t){t.line=startPixel-2;});
this._getTrackData(labelTrack).text=iconLeftEdge;

this._paintEventLine(evt,startPixel,iconTrack,labelTrack,metrics,theme);
}
var labelTop=Math.round(
metrics.trackOffset+labelTrack*metrics.trackIncrement+
metrics.trackHeight/2-labelSize.height/2);

var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickInstantEvent(iconElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(iconElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(tapeElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,iconElmtData,theme);

this._eventIdToElmt[evt.getID()]=iconElmtData.elmt;
};

Timeline.DetailedEventPainter.prototype.paintPreciseDurationEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var endDate=evt.getEnd();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var endPixel=Math.round(this._band.dateToPixelOffset(endDate));

var labelSize=this._frc.computeSize(text);
var tapeTrack=this._findFreeTrackForSolid(endPixel);
var color=evt.getColor();
color=color!=null?color:theme.event.duration.color;

var tapeElmtData=this._paintEventTape(evt,tapeTrack,startPixel,endPixel,color,100,metrics,theme);

var tapeTrackData=this._getTrackData(tapeTrack);
tapeTrackData.solid=startPixel;

var labelLeft=startPixel+theme.event.label.offsetFromLine;
var labelTrack=this._findFreeTrackForText(tapeTrack,labelLeft+labelSize.width,function(t){t.line=startPixel-2;});
this._getTrackData(labelTrack).text=startPixel-2;

this._paintEventLine(evt,startPixel,tapeTrack,labelTrack,metrics,theme);

var labelTop=Math.round(
metrics.trackOffset+labelTrack*metrics.trackIncrement+
metrics.trackHeight/2-labelSize.height/2);

var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickDurationEvent(tapeElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(tapeElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,tapeElmtData,theme);

this._eventIdToElmt[evt.getID()]=tapeElmtData.elmt;
};

Timeline.DetailedEventPainter.prototype.paintImpreciseDurationEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var latestStartDate=evt.getLatestStart();
var endDate=evt.getEnd();
var earliestEndDate=evt.getEarliestEnd();

var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var latestStartPixel=Math.round(this._band.dateToPixelOffset(latestStartDate));
var endPixel=Math.round(this._band.dateToPixelOffset(endDate));
var earliestEndPixel=Math.round(this._band.dateToPixelOffset(earliestEndDate));

var labelSize=this._frc.computeSize(text);
var tapeTrack=this._findFreeTrackForSolid(endPixel);
var color=evt.getColor();
color=color!=null?color:theme.event.duration.color;

var impreciseTapeElmtData=this._paintEventTape(evt,tapeTrack,startPixel,endPixel,
theme.event.duration.impreciseColor,theme.event.duration.impreciseOpacity,metrics,theme);
var tapeElmtData=this._paintEventTape(evt,tapeTrack,latestStartPixel,earliestEndPixel,color,100,metrics,theme);

var tapeTrackData=this._getTrackData(tapeTrack);
tapeTrackData.solid=startPixel;

var labelLeft=latestStartPixel+theme.event.label.offsetFromLine;
var labelTrack=this._findFreeTrackForText(tapeTrack,labelLeft+labelSize.width,function(t){t.line=latestStartPixel-2;});
this._getTrackData(labelTrack).text=latestStartPixel-2;

this._paintEventLine(evt,latestStartPixel,tapeTrack,labelTrack,metrics,theme);

var labelTop=Math.round(
metrics.trackOffset+labelTrack*metrics.trackIncrement+
metrics.trackHeight/2-labelSize.height/2);

var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickDurationEvent(tapeElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(tapeElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,tapeElmtData,theme);

this._eventIdToElmt[evt.getID()]=tapeElmtData.elmt;
};

Timeline.DetailedEventPainter.prototype._findFreeTrackForSolid=function(solidEdge,softEdge){
for(var i=0;true;i++){
if(i<this._lowerTracks.length){
var t=this._lowerTracks[i];
if(Math.min(t.solid,t.text)>solidEdge&&(!(softEdge)||t.line>softEdge)){
return i;
}
}else{
this._lowerTracks.push({
solid:Number.POSITIVE_INFINITY,
text:Number.POSITIVE_INFINITY,
line:Number.POSITIVE_INFINITY
});

return i;
}

if(i<this._upperTracks.length){
var t=this._upperTracks[i];
if(Math.min(t.solid,t.text)>solidEdge&&(!(softEdge)||t.line>softEdge)){
return-1-i;
}
}else{
this._upperTracks.push({
solid:Number.POSITIVE_INFINITY,
text:Number.POSITIVE_INFINITY,
line:Number.POSITIVE_INFINITY
});

return-1-i;
}
}
};

Timeline.DetailedEventPainter.prototype._findFreeTrackForText=function(fromTrack,edge,occupiedTrackVisitor){
var extendUp;
var index;
var firstIndex;
var result;

if(fromTrack<0){
extendUp=true;
firstIndex=-fromTrack;

index=this._findFreeUpperTrackForText(firstIndex,edge);
result=-1-index;
}else if(fromTrack>0){
extendUp=false;
firstIndex=fromTrack+1;

index=this._findFreeLowerTrackForText(firstIndex,edge);
result=index;
}else{
var upIndex=this._findFreeUpperTrackForText(0,edge);
var downIndex=this._findFreeLowerTrackForText(1,edge);

if(downIndex-1<=upIndex){
extendUp=false;
firstIndex=1;
index=downIndex;
result=index;
}else{
extendUp=true;
firstIndex=0;
index=upIndex;
result=-1-index;
}
}

if(extendUp){
if(index==this._upperTracks.length){
this._upperTracks.push({
solid:Number.POSITIVE_INFINITY,
text:Number.POSITIVE_INFINITY,
line:Number.POSITIVE_INFINITY
});
}
for(var i=firstIndex;i<index;i++){
occupiedTrackVisitor(this._upperTracks[i]);
}
}else{
if(index==this._lowerTracks.length){
this._lowerTracks.push({
solid:Number.POSITIVE_INFINITY,
text:Number.POSITIVE_INFINITY,
line:Number.POSITIVE_INFINITY
});
}
for(var i=firstIndex;i<index;i++){
occupiedTrackVisitor(this._lowerTracks[i]);
}
}
return result;
};

Timeline.DetailedEventPainter.prototype._findFreeLowerTrackForText=function(index,edge){
for(;index<this._lowerTracks.length;index++){
var t=this._lowerTracks[index];
if(Math.min(t.solid,t.text)>=edge){
break;
}
}
return index;
};

Timeline.DetailedEventPainter.prototype._findFreeUpperTrackForText=function(index,edge){
for(;index<this._upperTracks.length;index++){
var t=this._upperTracks[index];
if(Math.min(t.solid,t.text)>=edge){
break;
}
}
return index;
};

Timeline.DetailedEventPainter.prototype._getTrackData=function(index){
return(index<0)?this._upperTracks[-index-1]:this._lowerTracks[index];
};

Timeline.DetailedEventPainter.prototype._paintEventLine=function(evt,left,startTrack,endTrack,metrics,theme){
var top=Math.round(metrics.trackOffset+startTrack*metrics.trackIncrement+metrics.trackHeight/2);
var height=Math.round(Math.abs(endTrack-startTrack)*metrics.trackIncrement);

var lineStyle="1px solid "+theme.event.label.lineColor;
var lineDiv=this._timeline.getDocument().createElement("div");
lineDiv.style.position="absolute";
lineDiv.style.left=left+"px";
lineDiv.style.width=theme.event.label.offsetFromLine+"px";
lineDiv.style.height=height+"px";
if(startTrack>endTrack){
lineDiv.style.top=(top-height)+"px";
lineDiv.style.borderTop=lineStyle;
}else{
lineDiv.style.top=top+"px";
lineDiv.style.borderBottom=lineStyle;
}
lineDiv.style.borderLeft=lineStyle;
this._lineLayer.appendChild(lineDiv);
};

Timeline.DetailedEventPainter.prototype._paintEventIcon=function(evt,iconTrack,left,metrics,theme){
var icon=evt.getIcon();
icon=icon!=null?icon:metrics.icon;

var middle=metrics.trackOffset+iconTrack*metrics.trackIncrement+metrics.trackHeight/2;
var top=Math.round(middle-metrics.iconHeight/2);

var img=SimileAjax.Graphics.createTranslucentImage(icon);
var iconDiv=this._timeline.getDocument().createElement("div");
iconDiv.style.position="absolute";
iconDiv.style.left=left+"px";
iconDiv.style.top=top+"px";
iconDiv.appendChild(img);
iconDiv.style.cursor="pointer";
this._eventLayer.appendChild(iconDiv);

return{
left:left,
top:top,
width:metrics.iconWidth,
height:metrics.iconHeight,
elmt:iconDiv
};
};

Timeline.DetailedEventPainter.prototype._paintEventLabel=function(evt,text,left,top,width,height,theme){
var doc=this._timeline.getDocument();

var labelBackgroundDiv=doc.createElement("div");
labelBackgroundDiv.style.position="absolute";
labelBackgroundDiv.style.left=left+"px";
labelBackgroundDiv.style.width=width+"px";
labelBackgroundDiv.style.top=top+"px";
labelBackgroundDiv.style.height=height+"px";
labelBackgroundDiv.style.backgroundColor=theme.event.label.backgroundColor;
SimileAjax.Graphics.setOpacity(labelBackgroundDiv,theme.event.label.backgroundOpacity);
this._eventLayer.appendChild(labelBackgroundDiv);

var labelDiv=doc.createElement("div");
labelDiv.style.position="absolute";
labelDiv.style.left=left+"px";
labelDiv.style.width=width+"px";
labelDiv.style.top=top+"px";
labelDiv.innerHTML=text;
labelDiv.style.cursor="pointer";

var color=evt.getTextColor();
if(color==null){
color=evt.getColor();
}
if(color!=null){
labelDiv.style.color=color;
}

this._eventLayer.appendChild(labelDiv);

return{
left:left,
top:top,
width:width,
height:height,
elmt:labelDiv
};
};

Timeline.DetailedEventPainter.prototype._paintEventTape=function(
evt,iconTrack,startPixel,endPixel,color,opacity,metrics,theme){

var tapeWidth=endPixel-startPixel;
var tapeHeight=theme.event.tape.height;
var middle=metrics.trackOffset+iconTrack*metrics.trackIncrement+metrics.trackHeight/2;
var top=Math.round(middle-tapeHeight/2);

var tapeDiv=this._timeline.getDocument().createElement("div");
tapeDiv.style.position="absolute";
tapeDiv.style.left=startPixel+"px";
tapeDiv.style.width=tapeWidth+"px";
tapeDiv.style.top=top+"px";
tapeDiv.style.height=tapeHeight+"px";
tapeDiv.style.backgroundColor=color;
tapeDiv.style.overflow="hidden";
tapeDiv.style.cursor="pointer";
SimileAjax.Graphics.setOpacity(tapeDiv,opacity);

this._eventLayer.appendChild(tapeDiv);

return{
left:startPixel,
top:top,
width:tapeWidth,
height:tapeHeight,
elmt:tapeDiv
};
}

Timeline.DetailedEventPainter.prototype._createHighlightDiv=function(highlightIndex,dimensions,theme){
if(highlightIndex>=0){
var doc=this._timeline.getDocument();
var eventTheme=theme.event;

var color=eventTheme.highlightColors[Math.min(highlightIndex,eventTheme.highlightColors.length-1)];

var div=doc.createElement("div");
div.style.position="absolute";
div.style.overflow="hidden";
div.style.left=(dimensions.left-2)+"px";
div.style.width=(dimensions.width+4)+"px";
div.style.top=(dimensions.top-2)+"px";
div.style.height=(dimensions.height+4)+"px";
div.style.background=color;

this._highlightLayer.appendChild(div);
}
};

Timeline.DetailedEventPainter.prototype._onClickInstantEvent=function(icon,domEvt,evt){
var c=SimileAjax.DOM.getPageCoordinates(icon);
this._showBubble(
c.left+Math.ceil(icon.offsetWidth/2),
c.top+Math.ceil(icon.offsetHeight/2),
evt
);
this._fireOnSelect(evt.getID());

domEvt.cancelBubble=true;
SimileAjax.DOM.cancelEvent(domEvt);
return false;
};

Timeline.DetailedEventPainter.prototype._onClickDurationEvent=function(target,domEvt,evt){
if("pageX"in domEvt){
var x=domEvt.pageX;
var y=domEvt.pageY;
}else{
var c=SimileAjax.DOM.getPageCoordinates(target);
var x=domEvt.offsetX+c.left;
var y=domEvt.offsetY+c.top;
}
this._showBubble(x,y,evt);
this._fireOnSelect(evt.getID());

domEvt.cancelBubble=true;
SimileAjax.DOM.cancelEvent(domEvt);
return false;
};

Timeline.DetailedEventPainter.prototype.showBubble=function(evt){
var elmt=this._eventIdToElmt[evt.getID()];
if(elmt){
var c=SimileAjax.DOM.getPageCoordinates(elmt);
this._showBubble(c.left+elmt.offsetWidth/2,c.top+elmt.offsetHeight/2,evt);
}
};

Timeline.DetailedEventPainter.prototype._showBubble=function(x,y,evt){
var div=document.createElement("div");
evt.fillInfoBubble(div,this._params.theme,this._band.getLabeller());

SimileAjax.WindowManager.cancelPopups();
SimileAjax.Graphics.createBubbleForContentAndPoint(div,x,y,this._params.theme.event.bubble.width);
};

Timeline.DetailedEventPainter.prototype._fireOnSelect=function(eventID){
for(var i=0;i<this._onSelectListeners.length;i++){
this._onSelectListeners[i](eventID);
}
};


/* ether-painters.js */



Timeline.GregorianEtherPainter=function(params){
this._params=params;
this._theme=params.theme;
this._unit=params.unit;
this._multiple=("multiple"in params)?params.multiple:1;
};

Timeline.GregorianEtherPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._backgroundLayer=band.createLayerDiv(0);
this._backgroundLayer.setAttribute("name","ether-background");
this._backgroundLayer.style.background=this._theme.ether.backgroundColors[band.getIndex()%4];

this._markerLayer=null;
this._lineLayer=null;

var align=("align"in this._params&&this._params.align!=undefined)?this._params.align:
this._theme.ether.interval.marker[timeline.isHorizontal()?"hAlign":"vAlign"];
var showLine=("showLine"in this._params)?this._params.showLine:
this._theme.ether.interval.line.show;

this._intervalMarkerLayout=new Timeline.EtherIntervalMarkerLayout(
this._timeline,this._band,this._theme,align,showLine);

this._highlight=new Timeline.EtherHighlight(
this._timeline,this._band,this._theme,this._backgroundLayer);
}

Timeline.GregorianEtherPainter.prototype.setHighlight=function(startDate,endDate){
this._highlight.position(startDate,endDate);
}

Timeline.GregorianEtherPainter.prototype.paint=function(){
if(this._markerLayer){
this._band.removeLayerDiv(this._markerLayer);
}
this._markerLayer=this._band.createLayerDiv(100);
this._markerLayer.setAttribute("name","ether-markers");
this._markerLayer.style.display="none";

if(this._lineLayer){
this._band.removeLayerDiv(this._lineLayer);
}
this._lineLayer=this._band.createLayerDiv(1);
this._lineLayer.setAttribute("name","ether-lines");
this._lineLayer.style.display="none";

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

var timeZone=this._band.getTimeZone();
var labeller=this._band.getLabeller();

SimileAjax.DateTime.roundDownToInterval(minDate,this._unit,timeZone,this._multiple,this._theme.firstDayOfWeek);

var p=this;
var incrementDate=function(date){
for(var i=0;i<p._multiple;i++){
SimileAjax.DateTime.incrementByInterval(date,p._unit);
}
};

while(minDate.getTime()<maxDate.getTime()){
this._intervalMarkerLayout.createIntervalMarker(
minDate,labeller,this._unit,this._markerLayer,this._lineLayer);

incrementDate(minDate);
}
this._markerLayer.style.display="block";
this._lineLayer.style.display="block";
};

Timeline.GregorianEtherPainter.prototype.softPaint=function(){
};



Timeline.HotZoneGregorianEtherPainter=function(params){
this._params=params;
this._theme=params.theme;

this._zones=[{
startTime:Number.NEGATIVE_INFINITY,
endTime:Number.POSITIVE_INFINITY,
unit:params.unit,
multiple:1
}];
for(var i=0;i<params.zones.length;i++){
var zone=params.zones[i];
var zoneStart=SimileAjax.DateTime.parseGregorianDateTime(zone.start).getTime();
var zoneEnd=SimileAjax.DateTime.parseGregorianDateTime(zone.end).getTime();

for(var j=0;j<this._zones.length&&zoneEnd>zoneStart;j++){
var zone2=this._zones[j];

if(zoneStart<zone2.endTime){
if(zoneStart>zone2.startTime){
this._zones.splice(j,0,{
startTime:zone2.startTime,
endTime:zoneStart,
unit:zone2.unit,
multiple:zone2.multiple
});
j++;

zone2.startTime=zoneStart;
}

if(zoneEnd<zone2.endTime){
this._zones.splice(j,0,{
startTime:zoneStart,
endTime:zoneEnd,
unit:zone.unit,
multiple:(zone.multiple)?zone.multiple:1
});
j++;

zone2.startTime=zoneEnd;
zoneStart=zoneEnd;
}else{
zone2.multiple=zone.multiple;
zone2.unit=zone.unit;
zoneStart=zone2.endTime;
}
}
}
}
};

Timeline.HotZoneGregorianEtherPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._backgroundLayer=band.createLayerDiv(0);
this._backgroundLayer.setAttribute("name","ether-background");
this._backgroundLayer.style.background=this._theme.ether.backgroundColors[band.getIndex()%4];

this._markerLayer=null;
this._lineLayer=null;

var align=("align"in this._params&&this._params.align!=undefined)?this._params.align:
this._theme.ether.interval.marker[timeline.isHorizontal()?"hAlign":"vAlign"];
var showLine=("showLine"in this._params)?this._params.showLine:
this._theme.ether.interval.line.show;

this._intervalMarkerLayout=new Timeline.EtherIntervalMarkerLayout(
this._timeline,this._band,this._theme,align,showLine);

this._highlight=new Timeline.EtherHighlight(
this._timeline,this._band,this._theme,this._backgroundLayer);
}

Timeline.HotZoneGregorianEtherPainter.prototype.setHighlight=function(startDate,endDate){
this._highlight.position(startDate,endDate);
}

Timeline.HotZoneGregorianEtherPainter.prototype.paint=function(){
if(this._markerLayer){
this._band.removeLayerDiv(this._markerLayer);
}
this._markerLayer=this._band.createLayerDiv(100);
this._markerLayer.setAttribute("name","ether-markers");
this._markerLayer.style.display="none";

if(this._lineLayer){
this._band.removeLayerDiv(this._lineLayer);
}
this._lineLayer=this._band.createLayerDiv(1);
this._lineLayer.setAttribute("name","ether-lines");
this._lineLayer.style.display="none";

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

var timeZone=this._band.getTimeZone();
var labeller=this._band.getLabeller();

var p=this;
var incrementDate=function(date,zone){
for(var i=0;i<zone.multiple;i++){
SimileAjax.DateTime.incrementByInterval(date,zone.unit);
}
};

var zStart=0;
while(zStart<this._zones.length){
if(minDate.getTime()<this._zones[zStart].endTime){
break;
}
zStart++;
}
var zEnd=this._zones.length-1;
while(zEnd>=0){
if(maxDate.getTime()>this._zones[zEnd].startTime){
break;
}
zEnd--;
}

for(var z=zStart;z<=zEnd;z++){
var zone=this._zones[z];

var minDate2=new Date(Math.max(minDate.getTime(),zone.startTime));
var maxDate2=new Date(Math.min(maxDate.getTime(),zone.endTime));

SimileAjax.DateTime.roundDownToInterval(minDate2,zone.unit,timeZone,zone.multiple,this._theme.firstDayOfWeek);
SimileAjax.DateTime.roundUpToInterval(maxDate2,zone.unit,timeZone,zone.multiple,this._theme.firstDayOfWeek);

while(minDate2.getTime()<maxDate2.getTime()){
this._intervalMarkerLayout.createIntervalMarker(
minDate2,labeller,zone.unit,this._markerLayer,this._lineLayer);

incrementDate(minDate2,zone);
}
}
this._markerLayer.style.display="block";
this._lineLayer.style.display="block";
};

Timeline.HotZoneGregorianEtherPainter.prototype.softPaint=function(){
};



Timeline.YearCountEtherPainter=function(params){
this._params=params;
this._theme=params.theme;
this._startDate=SimileAjax.DateTime.parseGregorianDateTime(params.startDate);
this._multiple=("multiple"in params)?params.multiple:1;
};

Timeline.YearCountEtherPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._backgroundLayer=band.createLayerDiv(0);
this._backgroundLayer.setAttribute("name","ether-background");
this._backgroundLayer.style.background=this._theme.ether.backgroundColors[band.getIndex()%4];

this._markerLayer=null;
this._lineLayer=null;

var align=("align"in this._params)?this._params.align:
this._theme.ether.interval.marker[timeline.isHorizontal()?"hAlign":"vAlign"];
var showLine=("showLine"in this._params)?this._params.showLine:
this._theme.ether.interval.line.show;

this._intervalMarkerLayout=new Timeline.EtherIntervalMarkerLayout(
this._timeline,this._band,this._theme,align,showLine);

this._highlight=new Timeline.EtherHighlight(
this._timeline,this._band,this._theme,this._backgroundLayer);
};

Timeline.YearCountEtherPainter.prototype.setHighlight=function(startDate,endDate){
this._highlight.position(startDate,endDate);
};

Timeline.YearCountEtherPainter.prototype.paint=function(){
if(this._markerLayer){
this._band.removeLayerDiv(this._markerLayer);
}
this._markerLayer=this._band.createLayerDiv(100);
this._markerLayer.setAttribute("name","ether-markers");
this._markerLayer.style.display="none";

if(this._lineLayer){
this._band.removeLayerDiv(this._lineLayer);
}
this._lineLayer=this._band.createLayerDiv(1);
this._lineLayer.setAttribute("name","ether-lines");
this._lineLayer.style.display="none";

var minDate=new Date(this._startDate.getTime());
var maxDate=this._band.getMaxDate();
var yearDiff=this._band.getMinDate().getUTCFullYear()-this._startDate.getUTCFullYear();
minDate.setUTCFullYear(this._band.getMinDate().getUTCFullYear()-yearDiff%this._multiple);

var p=this;
var incrementDate=function(date){
for(var i=0;i<p._multiple;i++){
SimileAjax.DateTime.incrementByInterval(date,SimileAjax.DateTime.YEAR);
}
};
var labeller={
labelInterval:function(date,intervalUnit){
var diff=date.getUTCFullYear()-p._startDate.getUTCFullYear();
return{
text:diff,
emphasized:diff==0
};
}
};

while(minDate.getTime()<maxDate.getTime()){
this._intervalMarkerLayout.createIntervalMarker(
minDate,labeller,SimileAjax.DateTime.YEAR,this._markerLayer,this._lineLayer);

incrementDate(minDate);
}
this._markerLayer.style.display="block";
this._lineLayer.style.display="block";
};

Timeline.YearCountEtherPainter.prototype.softPaint=function(){
};



Timeline.QuarterlyEtherPainter=function(params){
this._params=params;
this._theme=params.theme;
this._startDate=SimileAjax.DateTime.parseGregorianDateTime(params.startDate);
};

Timeline.QuarterlyEtherPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._backgroundLayer=band.createLayerDiv(0);
this._backgroundLayer.setAttribute("name","ether-background");
this._backgroundLayer.style.background=this._theme.ether.backgroundColors[band.getIndex()%4];

this._markerLayer=null;
this._lineLayer=null;

var align=("align"in this._params)?this._params.align:
this._theme.ether.interval.marker[timeline.isHorizontal()?"hAlign":"vAlign"];
var showLine=("showLine"in this._params)?this._params.showLine:
this._theme.ether.interval.line.show;

this._intervalMarkerLayout=new Timeline.EtherIntervalMarkerLayout(
this._timeline,this._band,this._theme,align,showLine);

this._highlight=new Timeline.EtherHighlight(
this._timeline,this._band,this._theme,this._backgroundLayer);
};

Timeline.QuarterlyEtherPainter.prototype.setHighlight=function(startDate,endDate){
this._highlight.position(startDate,endDate);
};

Timeline.QuarterlyEtherPainter.prototype.paint=function(){
if(this._markerLayer){
this._band.removeLayerDiv(this._markerLayer);
}
this._markerLayer=this._band.createLayerDiv(100);
this._markerLayer.setAttribute("name","ether-markers");
this._markerLayer.style.display="none";

if(this._lineLayer){
this._band.removeLayerDiv(this._lineLayer);
}
this._lineLayer=this._band.createLayerDiv(1);
this._lineLayer.setAttribute("name","ether-lines");
this._lineLayer.style.display="none";

var minDate=new Date(0);
var maxDate=this._band.getMaxDate();

minDate.setUTCFullYear(Math.max(this._startDate.getUTCFullYear(),this._band.getMinDate().getUTCFullYear()));
minDate.setUTCMonth(this._startDate.getUTCMonth());

var p=this;
var incrementDate=function(date){
date.setUTCMonth(date.getUTCMonth()+3);
};
var labeller={
labelInterval:function(date,intervalUnit){
var quarters=(4+(date.getUTCMonth()-p._startDate.getUTCMonth())/3)%4;
if(quarters!=0){
return{text:"Q"+(quarters+1),emphasized:false};
}else{
return{text:"Y"+(date.getUTCFullYear()-p._startDate.getUTCFullYear()+1),emphasized:true};
}
}
};

while(minDate.getTime()<maxDate.getTime()){
this._intervalMarkerLayout.createIntervalMarker(
minDate,labeller,SimileAjax.DateTime.YEAR,this._markerLayer,this._lineLayer);

incrementDate(minDate);
}
this._markerLayer.style.display="block";
this._lineLayer.style.display="block";
};

Timeline.QuarterlyEtherPainter.prototype.softPaint=function(){
};



Timeline.EtherIntervalMarkerLayout=function(timeline,band,theme,align,showLine){
var horizontal=timeline.isHorizontal();
if(horizontal){
if(align=="Top"){
this.positionDiv=function(div,offset){
div.style.left=offset+"px";
div.style.top="0px";
};
}else{
this.positionDiv=function(div,offset){
div.style.left=offset+"px";
div.style.bottom="0px";
};
}
}else{
if(align=="Left"){
this.positionDiv=function(div,offset){
div.style.top=offset+"px";
div.style.left="0px";
};
}else{
this.positionDiv=function(div,offset){
div.style.top=offset+"px";
div.style.right="0px";
};
}
}

var markerTheme=theme.ether.interval.marker;
var lineTheme=theme.ether.interval.line;
var weekendTheme=theme.ether.interval.weekend;

var stylePrefix=(horizontal?"h":"v")+align;
var labelStyler=markerTheme[stylePrefix+"Styler"];
var emphasizedLabelStyler=markerTheme[stylePrefix+"EmphasizedStyler"];
var day=SimileAjax.DateTime.gregorianUnitLengths[SimileAjax.DateTime.DAY];

this.createIntervalMarker=function(date,labeller,unit,markerDiv,lineDiv){
var offset=Math.round(band.dateToPixelOffset(date));

if(showLine&&unit!=SimileAjax.DateTime.WEEK){
var divLine=timeline.getDocument().createElement("div");
divLine.style.position="absolute";

if(lineTheme.opacity<100){
SimileAjax.Graphics.setOpacity(divLine,lineTheme.opacity);
}

if(horizontal){
divLine.style.borderLeft="1px solid "+lineTheme.color;
divLine.style.left=offset+"px";
divLine.style.width="1px";
divLine.style.top="0px";
divLine.style.height="100%";
}else{
divLine.style.borderTop="1px solid "+lineTheme.color;
divLine.style.top=offset+"px";
divLine.style.height="1px";
divLine.style.left="0px";
divLine.style.width="100%";
}
lineDiv.appendChild(divLine);
}
if(unit==SimileAjax.DateTime.WEEK){
var firstDayOfWeek=theme.firstDayOfWeek;

var saturday=new Date(date.getTime()+(6-firstDayOfWeek-7)*day);
var monday=new Date(saturday.getTime()+2*day);

var saturdayPixel=Math.round(band.dateToPixelOffset(saturday));
var mondayPixel=Math.round(band.dateToPixelOffset(monday));
var length=Math.max(1,mondayPixel-saturdayPixel);

var divWeekend=timeline.getDocument().createElement("div");
divWeekend.style.position="absolute";

divWeekend.style.background=weekendTheme.color;
if(weekendTheme.opacity<100){
SimileAjax.Graphics.setOpacity(divWeekend,weekendTheme.opacity);
}

if(horizontal){
divWeekend.style.left=saturdayPixel+"px";
divWeekend.style.width=length+"px";
divWeekend.style.top="0px";
divWeekend.style.height="100%";
}else{
divWeekend.style.top=saturdayPixel+"px";
divWeekend.style.height=length+"px";
divWeekend.style.left="0px";
divWeekend.style.width="100%";
}
lineDiv.appendChild(divWeekend);
}

var label=labeller.labelInterval(date,unit);

var div=timeline.getDocument().createElement("div");
div.innerHTML=label.text;
div.style.position="absolute";
(label.emphasized?emphasizedLabelStyler:labelStyler)(div);

this.positionDiv(div,offset);
markerDiv.appendChild(div);

return div;
};
};



Timeline.EtherHighlight=function(timeline,band,theme,backgroundLayer){
var horizontal=timeline.isHorizontal();

this._highlightDiv=null;
this._createHighlightDiv=function(){
if(this._highlightDiv==null){
this._highlightDiv=timeline.getDocument().createElement("div");
this._highlightDiv.setAttribute("name","ether-highlight");
this._highlightDiv.style.position="absolute";
this._highlightDiv.style.background=theme.ether.highlightColor;

var opacity=theme.ether.highlightOpacity;
if(opacity<100){
SimileAjax.Graphics.setOpacity(this._highlightDiv,opacity);
}

backgroundLayer.appendChild(this._highlightDiv);
}
}

this.position=function(startDate,endDate){
this._createHighlightDiv();

var startPixel=Math.round(band.dateToPixelOffset(startDate));
var endPixel=Math.round(band.dateToPixelOffset(endDate));
var length=Math.max(endPixel-startPixel,3);
if(horizontal){
this._highlightDiv.style.left=startPixel+"px";
this._highlightDiv.style.width=length+"px";
this._highlightDiv.style.top="2px";
this._highlightDiv.style.height=((band.getViewWidth()>4)?band.getViewWidth()-4:0)+"px";
}else{
this._highlightDiv.style.top=startPixel+"px";
this._highlightDiv.style.height=length+"px";
this._highlightDiv.style.left="2px";
this._highlightDiv.style.width=((band.getViewWidth()>4)?band.getViewWidth()-4:0)+"px";
}
}
};



/* ethers.js */



Timeline.LinearEther=function(params){
this._params=params;
this._interval=params.interval;
this._pixelsPerInterval=params.pixelsPerInterval;
};

Timeline.LinearEther.prototype.initialize=function(timeline){
this._timeline=timeline;
this._unit=timeline.getUnit();

if("startsOn"in this._params){
this._start=this._unit.parseFromObject(this._params.startsOn);
}else if("endsOn"in this._params){
this._start=this._unit.parseFromObject(this._params.endsOn);
this.shiftPixels(-this._timeline.getPixelLength());
}else if("centersOn"in this._params){
this._start=this._unit.parseFromObject(this._params.centersOn);
this.shiftPixels(-this._timeline.getPixelLength()/2);
}else{
this._start=this._unit.makeDefaultValue();
this.shiftPixels(-this._timeline.getPixelLength()/2);
}
};

Timeline.LinearEther.prototype.setDate=function(date){
this._start=this._unit.cloneValue(date);
};

Timeline.LinearEther.prototype.shiftPixels=function(pixels){
var numeric=this._interval*pixels/this._pixelsPerInterval;
this._start=this._unit.change(this._start,numeric);
};

Timeline.LinearEther.prototype.dateToPixelOffset=function(date){
var numeric=this._unit.compare(date,this._start);
return this._pixelsPerInterval*numeric/this._interval;
};

Timeline.LinearEther.prototype.pixelOffsetToDate=function(pixels){
var numeric=pixels*this._interval/this._pixelsPerInterval;
return this._unit.change(this._start,numeric);
};



Timeline.HotZoneEther=function(params){
this._params=params;
this._interval=params.interval;
this._pixelsPerInterval=params.pixelsPerInterval;
};

Timeline.HotZoneEther.prototype.initialize=function(timeline){
this._timeline=timeline;
this._unit=timeline.getUnit();

this._zones=[{
startTime:Number.NEGATIVE_INFINITY,
endTime:Number.POSITIVE_INFINITY,
magnify:1
}];
var params=this._params;
for(var i=0;i<params.zones.length;i++){
var zone=params.zones[i];
var zoneStart=this._unit.parseFromObject(zone.start);
var zoneEnd=this._unit.parseFromObject(zone.end);

for(var j=0;j<this._zones.length&&this._unit.compare(zoneEnd,zoneStart)>0;j++){
var zone2=this._zones[j];

if(this._unit.compare(zoneStart,zone2.endTime)<0){
if(this._unit.compare(zoneStart,zone2.startTime)>0){
this._zones.splice(j,0,{
startTime:zone2.startTime,
endTime:zoneStart,
magnify:zone2.magnify
});
j++;

zone2.startTime=zoneStart;
}

if(this._unit.compare(zoneEnd,zone2.endTime)<0){
this._zones.splice(j,0,{
startTime:zoneStart,
endTime:zoneEnd,
magnify:zone.magnify*zone2.magnify
});
j++;

zone2.startTime=zoneEnd;
zoneStart=zoneEnd;
}else{
zone2.magnify*=zone.magnify;
zoneStart=zone2.endTime;
}
}
}
}

if("startsOn"in this._params){
this._start=this._unit.parseFromObject(this._params.startsOn);
}else if("endsOn"in this._params){
this._start=this._unit.parseFromObject(this._params.endsOn);
this.shiftPixels(-this._timeline.getPixelLength());
}else if("centersOn"in this._params){
this._start=this._unit.parseFromObject(this._params.centersOn);
this.shiftPixels(-this._timeline.getPixelLength()/2);
}else{
this._start=this._unit.makeDefaultValue();
this.shiftPixels(-this._timeline.getPixelLength()/2);
}
};

Timeline.HotZoneEther.prototype.setDate=function(date){
this._start=this._unit.cloneValue(date);
};

Timeline.HotZoneEther.prototype.shiftPixels=function(pixels){
this._start=this.pixelOffsetToDate(pixels);
};

Timeline.HotZoneEther.prototype.dateToPixelOffset=function(date){
return this._dateDiffToPixelOffset(this._start,date);
};

Timeline.HotZoneEther.prototype.pixelOffsetToDate=function(pixels){
return this._pixelOffsetToDate(pixels,this._start);
};

Timeline.HotZoneEther.prototype._dateDiffToPixelOffset=function(fromDate,toDate){
var scale=this._getScale();
var fromTime=fromDate;
var toTime=toDate;

var pixels=0;
if(this._unit.compare(fromTime,toTime)<0){
var z=0;
while(z<this._zones.length){
if(this._unit.compare(fromTime,this._zones[z].endTime)<0){
break;
}
z++;
}

while(this._unit.compare(fromTime,toTime)<0){
var zone=this._zones[z];
var toTime2=this._unit.earlier(toTime,zone.endTime);

pixels+=(this._unit.compare(toTime2,fromTime)/(scale/zone.magnify));

fromTime=toTime2;
z++;
}
}else{
var z=this._zones.length-1;
while(z>=0){
if(this._unit.compare(fromTime,this._zones[z].startTime)>0){
break;
}
z--;
}

while(this._unit.compare(fromTime,toTime)>0){
var zone=this._zones[z];
var toTime2=this._unit.later(toTime,zone.startTime);

pixels+=(this._unit.compare(toTime2,fromTime)/(scale/zone.magnify));

fromTime=toTime2;
z--;
}
}
return pixels;
};

Timeline.HotZoneEther.prototype._pixelOffsetToDate=function(pixels,fromDate){
var scale=this._getScale();
var time=fromDate;
if(pixels>0){
var z=0;
while(z<this._zones.length){
if(this._unit.compare(time,this._zones[z].endTime)<0){
break;
}
z++;
}

while(pixels>0){
var zone=this._zones[z];
var scale2=scale/zone.magnify;

if(zone.endTime==Number.POSITIVE_INFINITY){
time=this._unit.change(time,pixels*scale2);
pixels=0;
}else{
var pixels2=this._unit.compare(zone.endTime,time)/scale2;
if(pixels2>pixels){
time=this._unit.change(time,pixels*scale2);
pixels=0;
}else{
time=zone.endTime;
pixels-=pixels2;
}
}
z++;
}
}else{
var z=this._zones.length-1;
while(z>=0){
if(this._unit.compare(time,this._zones[z].startTime)>0){
break;
}
z--;
}

pixels=-pixels;
while(pixels>0){
var zone=this._zones[z];
var scale2=scale/zone.magnify;

if(zone.startTime==Number.NEGATIVE_INFINITY){
time=this._unit.change(time,-pixels*scale2);
pixels=0;
}else{
var pixels2=this._unit.compare(time,zone.startTime)/scale2;
if(pixels2>pixels){
time=this._unit.change(time,-pixels*scale2);
pixels=0;
}else{
time=zone.startTime;
pixels-=pixels2;
}
}
z--;
}
}
return time;
};

Timeline.HotZoneEther.prototype._getScale=function(){
return this._interval/this._pixelsPerInterval;
};


/* labellers.js */



Timeline.GregorianDateLabeller=function(locale,timeZone){
this._locale=locale;
this._timeZone=timeZone;
};

Timeline.GregorianDateLabeller.monthNames=[];
Timeline.GregorianDateLabeller.dayNames=[];
Timeline.GregorianDateLabeller.labelIntervalFunctions=[];

Timeline.GregorianDateLabeller.getMonthName=function(month,locale){
return Timeline.GregorianDateLabeller.monthNames[locale][month];
};

Timeline.GregorianDateLabeller.prototype.labelInterval=function(date,intervalUnit){
var f=Timeline.GregorianDateLabeller.labelIntervalFunctions[this._locale];
if(f==null){
f=Timeline.GregorianDateLabeller.prototype.defaultLabelInterval;
}
return f.call(this,date,intervalUnit);
};

Timeline.GregorianDateLabeller.prototype.GMTToLocalDate=function(date){
return new Date(date.getTime() - (date.getTimezoneOffset()*60*1000));
}
Timeline.GregorianDateLabeller.prototype.labelPrecise=function(date, timeless){
var d=date; //this.GMTToLocalDate(date);
return (timeless) ? d.toDateString() : d.toLocaleString();
};

Timeline.GregorianDateLabeller.prototype.defaultLabelInterval=function(date,intervalUnit){
var text;
var emphasized=false;

date=SimileAjax.DateTime.removeTimeZoneOffset(date,this._timeZone);

switch(intervalUnit){
case SimileAjax.DateTime.MILLISECOND:
text=date.getUTCMilliseconds();
break;
case SimileAjax.DateTime.SECOND:
text=date.getUTCSeconds();
break;
case SimileAjax.DateTime.MINUTE:
var m=date.getUTCMinutes();
if(m==0){
text=date.getUTCHours()+":00";
emphasized=true;
}else{
text=m;
}
break;
case SimileAjax.DateTime.HOUR:
text=date.getUTCHours()+"hr";
break;
case SimileAjax.DateTime.DAY:
text=Timeline.GregorianDateLabeller.getMonthName(date.getUTCMonth(),this._locale)+" "+date.getUTCDate();
break;
case SimileAjax.DateTime.WEEK:
text=Timeline.GregorianDateLabeller.getMonthName(date.getUTCMonth(),this._locale)+" "+date.getUTCDate();
break;
case SimileAjax.DateTime.MONTH:
var m=date.getUTCMonth();
if(m!=0){
text=Timeline.GregorianDateLabeller.getMonthName(m,this._locale);
break;
}
case SimileAjax.DateTime.YEAR:
case SimileAjax.DateTime.DECADE:
case SimileAjax.DateTime.CENTURY:
case SimileAjax.DateTime.MILLENNIUM:
var y=date.getUTCFullYear();
if(y>0){
text=date.getUTCFullYear();
}else{
text=(1-y)+"BC";
}
emphasized=
(intervalUnit==SimileAjax.DateTime.MONTH)||
(intervalUnit==SimileAjax.DateTime.DECADE&&y%100==0)||
(intervalUnit==SimileAjax.DateTime.CENTURY&&y%1000==0);
break;
default:
text=date.toUTCString();
}
return{text:text,emphasized:emphasized};
}



/* original-painter.js */



Timeline.OriginalEventPainter=function(params){
this._params=params;
this._onSelectListeners=[];

this._filterMatcher=null;
this._highlightMatcher=null;
this._frc=null;

this._eventIdToElmt={};
};

Timeline.OriginalEventPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._backLayer=null;
this._eventLayer=null;
this._lineLayer=null;
this._highlightLayer=null;

this._eventIdToElmt=null;
};

Timeline.OriginalEventPainter.prototype.addOnSelectListener=function(listener){
this._onSelectListeners.push(listener);
};

Timeline.OriginalEventPainter.prototype.removeOnSelectListener=function(listener){
for(var i=0;i<this._onSelectListeners.length;i++){
if(this._onSelectListeners[i]==listener){
this._onSelectListeners.splice(i,1);
break;
}
}
};

Timeline.OriginalEventPainter.prototype.getFilterMatcher=function(){
return this._filterMatcher;
};

Timeline.OriginalEventPainter.prototype.setFilterMatcher=function(filterMatcher){
this._filterMatcher=filterMatcher;
};

Timeline.OriginalEventPainter.prototype.getHighlightMatcher=function(){
return this._highlightMatcher;
};

Timeline.OriginalEventPainter.prototype.setHighlightMatcher=function(highlightMatcher){
this._highlightMatcher=highlightMatcher;
};

Timeline.OriginalEventPainter.prototype.paint=function(){
var eventSource=this._band.getEventSource();
if(eventSource==null){
return;
}

this._eventIdToElmt={};
this._prepareForPainting();

var eventTheme=this._params.theme.event;
var trackHeight=Math.max(eventTheme.track.height,eventTheme.tape.height+this._frc.getLineHeight());
var metrics={
trackOffset:eventTheme.track.gap,
trackHeight:trackHeight,
trackGap:eventTheme.track.gap,
trackIncrement:trackHeight+eventTheme.track.gap,
icon:eventTheme.instant.icon,
iconWidth:eventTheme.instant.iconWidth,
iconHeight:eventTheme.instant.iconHeight,
labelWidth:eventTheme.label.width
}

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

var filterMatcher=(this._filterMatcher!=null)?
this._filterMatcher:
function(evt){return true;};
var highlightMatcher=(this._highlightMatcher!=null)?
this._highlightMatcher:
function(evt){return-1;};

var iterator=eventSource.getEventReverseIterator(minDate,maxDate);
while(iterator.hasNext()){
var evt=iterator.next();
if(filterMatcher(evt)){
this.paintEvent(evt,metrics,this._params.theme,highlightMatcher(evt));
}
}

this._highlightLayer.style.display="block";
this._lineLayer.style.display="block";
this._eventLayer.style.display="block";
};

Timeline.OriginalEventPainter.prototype.softPaint=function(){
};

Timeline.OriginalEventPainter.prototype._prepareForPainting=function(){
var band=this._band;

if(this._backLayer==null){
this._backLayer=this._band.createLayerDiv(0,"timeline-band-events");
this._backLayer.style.visibility="hidden";

var eventLabelPrototype=document.createElement("span");
eventLabelPrototype.className="timeline-event-label";
this._backLayer.appendChild(eventLabelPrototype);
this._frc=SimileAjax.Graphics.getFontRenderingContext(eventLabelPrototype);
}
this._frc.update();
this._tracks=[];

if(this._highlightLayer!=null){
band.removeLayerDiv(this._highlightLayer);
}
this._highlightLayer=band.createLayerDiv(105,"timeline-band-highlights");
this._highlightLayer.style.display="none";

if(this._lineLayer!=null){
band.removeLayerDiv(this._lineLayer);
}
this._lineLayer=band.createLayerDiv(110,"timeline-band-lines");
this._lineLayer.style.display="none";

if(this._eventLayer!=null){
band.removeLayerDiv(this._eventLayer);
}
this._eventLayer=band.createLayerDiv(115,"timeline-band-events");
this._eventLayer.style.display="none";
};

Timeline.OriginalEventPainter.prototype.paintEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isInstant()){
this.paintInstantEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintDurationEvent(evt,metrics,theme,highlightIndex);
}
};

Timeline.OriginalEventPainter.prototype.paintInstantEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isImprecise()){
this.paintImpreciseInstantEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintPreciseInstantEvent(evt,metrics,theme,highlightIndex);
}
}

Timeline.OriginalEventPainter.prototype.paintDurationEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isImprecise()){
this.paintImpreciseDurationEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintPreciseDurationEvent(evt,metrics,theme,highlightIndex);
}
}

Timeline.OriginalEventPainter.prototype.paintPreciseInstantEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var iconRightEdge=Math.round(startPixel+metrics.iconWidth/2);
var iconLeftEdge=Math.round(startPixel-metrics.iconWidth/2);

var labelSize=this._frc.computeSize(text);
var labelLeft=iconRightEdge+theme.event.label.offsetFromLine;
var labelRight=labelLeft+labelSize.width;

var rightEdge=labelRight;
var track=this._findFreeTrack(rightEdge);

var labelTop=Math.round(
metrics.trackOffset+track*metrics.trackIncrement+
metrics.trackHeight/2-labelSize.height/2);

var iconElmtData=this._paintEventIcon(evt,track,iconLeftEdge,metrics,theme);
var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickInstantEvent(iconElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(iconElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,iconElmtData,theme);

this._eventIdToElmt[evt.getID()]=iconElmtData.elmt;
this._tracks[track]=iconLeftEdge;
};

Timeline.OriginalEventPainter.prototype.paintImpreciseInstantEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var endDate=evt.getEnd();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var endPixel=Math.round(this._band.dateToPixelOffset(endDate));

var iconRightEdge=Math.round(startPixel+metrics.iconWidth/2);
var iconLeftEdge=Math.round(startPixel-metrics.iconWidth/2);

var labelSize=this._frc.computeSize(text);
var labelLeft=iconRightEdge+theme.event.label.offsetFromLine;
var labelRight=labelLeft+labelSize.width;

var rightEdge=Math.max(labelRight,endPixel);
var track=this._findFreeTrack(rightEdge);
var labelTop=Math.round(
metrics.trackOffset+track*metrics.trackIncrement+
metrics.trackHeight/2-labelSize.height/2);

var iconElmtData=this._paintEventIcon(evt,track,iconLeftEdge,metrics,theme);
var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);
var tapeElmtData=this._paintEventTape(evt,track,startPixel,endPixel,
theme.event.instant.impreciseColor,theme.event.instant.impreciseOpacity,metrics,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickInstantEvent(iconElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(iconElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(tapeElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,iconElmtData,theme);

this._eventIdToElmt[evt.getID()]=iconElmtData.elmt;
this._tracks[track]=iconLeftEdge;
};

Timeline.OriginalEventPainter.prototype.paintPreciseDurationEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=String.format("<img src='{0}' /> {1}", evt.getIcon(), evt.getText());

var startDate=evt.getStart();
var endDate=evt.getEnd();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var endPixel=Math.round(this._band.dateToPixelOffset(endDate));

var labelSize=this._frc.computeSize(text);
var labelLeft=startPixel;
var labelRight=labelLeft+labelSize.width;

var rightEdge=Math.max(labelRight,endPixel);
var track=this._findFreeTrack(rightEdge);
var labelTop=Math.round(
metrics.trackOffset+track*metrics.trackIncrement+theme.event.tape.height);

var color=evt.getColor();
color=color!=null?color:theme.event.duration.color;

var tapeElmtData=this._paintEventTape(evt,track,startPixel,endPixel,color,100,metrics,theme);
var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickInstantEvent(tapeElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(tapeElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,tapeElmtData,theme);

this._eventIdToElmt[evt.getID()]=tapeElmtData.elmt;
this._tracks[track]=startPixel;
};

Timeline.OriginalEventPainter.prototype.paintImpreciseDurationEvent=function(evt,metrics,theme,highlightIndex){
var doc=this._timeline.getDocument();
var text=evt.getText();

var startDate=evt.getStart();
var latestStartDate=evt.getLatestStart();
var endDate=evt.getEnd();
var earliestEndDate=evt.getEarliestEnd();

var startPixel=Math.round(this._band.dateToPixelOffset(startDate));
var latestStartPixel=Math.round(this._band.dateToPixelOffset(latestStartDate));
var endPixel=Math.round(this._band.dateToPixelOffset(endDate));
var earliestEndPixel=Math.round(this._band.dateToPixelOffset(earliestEndDate));

var labelSize=this._frc.computeSize(text);
var labelLeft=latestStartPixel;
var labelRight=labelLeft+labelSize.width;

var rightEdge=Math.max(labelRight,endPixel);
var track=this._findFreeTrack(rightEdge);
var labelTop=Math.round(
metrics.trackOffset+track*metrics.trackIncrement+theme.event.tape.height);

var color=evt.getColor();
color=color!=null?color:theme.event.duration.color;

var impreciseTapeElmtData=this._paintEventTape(evt,track,startPixel,endPixel,
theme.event.duration.impreciseColor,theme.event.duration.impreciseOpacity,metrics,theme);
var tapeElmtData=this._paintEventTape(evt,track,latestStartPixel,earliestEndPixel,color,100,metrics,theme);

var labelElmtData=this._paintEventLabel(evt,text,labelLeft,labelTop,labelSize.width,labelSize.height,theme);

var self=this;
var clickHandler=function(elmt,domEvt,target){
return self._onClickInstantEvent(tapeElmtData.elmt,domEvt,evt);
};
SimileAjax.DOM.registerEvent(tapeElmtData.elmt,"mousedown",clickHandler);
SimileAjax.DOM.registerEvent(labelElmtData.elmt,"mousedown",clickHandler);

this._createHighlightDiv(highlightIndex,tapeElmtData,theme);

this._eventIdToElmt[evt.getID()]=tapeElmtData.elmt;
this._tracks[track]=startPixel;
};

Timeline.OriginalEventPainter.prototype._findFreeTrack=function(rightEdge){
for(var i=0;i<this._tracks.length;i++){
var t=this._tracks[i];
if(t>rightEdge){
break;
}
}
return i;
};

Timeline.OriginalEventPainter.prototype._paintEventIcon=function(evt,iconTrack,left,metrics,theme){
var icon=evt.getIcon();
icon=icon!=null?icon:metrics.icon;

var middle=metrics.trackOffset+iconTrack*metrics.trackIncrement+metrics.trackHeight/2;
var top=Math.round(middle-metrics.iconHeight/2);

var img=SimileAjax.Graphics.createTranslucentImage(icon);
var iconDiv=this._timeline.getDocument().createElement("div");
iconDiv.style.position="absolute";
iconDiv.style.left=left+"px";
iconDiv.style.top=top+"px";
iconDiv.appendChild(img);
iconDiv.style.cursor="pointer";
this._eventLayer.appendChild(iconDiv);

return{
left:left,
top:top,
width:metrics.iconWidth,
height:metrics.iconHeight,
elmt:iconDiv
};
};

Timeline.OriginalEventPainter.prototype._paintEventLabel=function(evt,text,left,top,width,height,theme){
var doc=this._timeline.getDocument();

var labelDiv=doc.createElement("div");
labelDiv.style.position="absolute";
labelDiv.style.left=left+"px";
labelDiv.style.width=(width+1)+"px"; // Add 1 for IE to prevent multi-line, as the width is 1 pixel short of containing all text
labelDiv.style.top=top+"px";
labelDiv.innerHTML=text;
labelDiv.style.cursor="pointer";

var color=evt.getTextColor();
if(color==null){
color=evt.getColor();
}
if(color!=null){
labelDiv.style.color=color;
}

this._eventLayer.appendChild(labelDiv);

return{
left:left,
top:top,
width:width,
height:height,
elmt:labelDiv
};
};

Timeline.OriginalEventPainter.prototype._paintEventTape=function(
evt,iconTrack,startPixel,endPixel,color,opacity,metrics,theme){

var tapeWidth=(endPixel-startPixel > 0) ? endPixel-startPixel : 0;
var tapeHeight=theme.event.tape.height;
var top=metrics.trackOffset+iconTrack*metrics.trackIncrement;

var tapeDiv=this._timeline.getDocument().createElement("div");
tapeDiv.style.position="absolute";
tapeDiv.style.left=startPixel+"px";
tapeDiv.style.width=tapeWidth+"px";
tapeDiv.style.top=top+"px";
tapeDiv.style.height=tapeHeight+"px";
tapeDiv.style.backgroundColor=color;
tapeDiv.style.overflow="hidden";
tapeDiv.style.cursor="pointer";
SimileAjax.Graphics.setOpacity(tapeDiv,opacity);

this._eventLayer.appendChild(tapeDiv);

return{
left:startPixel,
top:top,
width:tapeWidth,
height:tapeHeight,
elmt:tapeDiv
};
}

Timeline.OriginalEventPainter.prototype._createHighlightDiv=function(highlightIndex,dimensions,theme){
if(highlightIndex>=0){
var doc=this._timeline.getDocument();
var eventTheme=theme.event;

var color=eventTheme.highlightColors[Math.min(highlightIndex,eventTheme.highlightColors.length-1)];

var div=doc.createElement("div");
div.style.position="absolute";
div.style.overflow="hidden";
div.style.left=(dimensions.left-2)+"px";
div.style.width=(dimensions.width+4)+"px";
div.style.top=(dimensions.top-2)+"px";
div.style.height=(dimensions.height+4)+"px";
div.style.background=color;

this._highlightLayer.appendChild(div);
}
};

Timeline.OriginalEventPainter.prototype._onClickInstantEvent=function(icon,domEvt,evt){
var c=SimileAjax.DOM.getPageCoordinates(icon);
this._showBubble(
c.left+Math.ceil(icon.offsetWidth/2),
c.top+Math.ceil(icon.offsetHeight/2),
evt
);
this._fireOnSelect(evt.getID());

domEvt.cancelBubble=true;
SimileAjax.DOM.cancelEvent(domEvt);
return false;
};

Timeline.OriginalEventPainter.prototype._onClickDurationEvent=function(target,domEvt,evt){
if("pageX"in domEvt){
var x=domEvt.pageX;
var y=domEvt.pageY;
}else{
var c=SimileAjax.DOM.getPageCoordinates(target);
var x=domEvt.offsetX+c.left;
var y=domEvt.offsetY+c.top;
}
this._showBubble(x,y,evt);
this._fireOnSelect(evt.getID());

domEvt.cancelBubble=true;
SimileAjax.DOM.cancelEvent(domEvt);
return false;
};

Timeline.OriginalEventPainter.prototype.showBubble=function(evt){
var elmt=this._eventIdToElmt[evt.getID()];
if(elmt){
var c=SimileAjax.DOM.getPageCoordinates(elmt);
this._showBubble(c.left+elmt.offsetWidth/2,c.top+elmt.offsetHeight/2,evt);
}
};

Timeline.OriginalEventPainter.prototype._showBubble=function(x,y,evt){
var div=document.createElement("div");
evt.fillInfoBubble(div,this._params.theme,this._band.getLabeller());

SimileAjax.WindowManager.cancelPopups();
SimileAjax.Graphics.createBubbleForContentAndPoint(div,x,y,this._params.theme.event.bubble.width);
};

Timeline.OriginalEventPainter.prototype._fireOnSelect=function(eventID){
for(var i=0;i<this._onSelectListeners.length;i++){
this._onSelectListeners[i](eventID);
}
};


/* overview-painter.js */



Timeline.OverviewEventPainter=function(params){
this._params=params;
this._onSelectListeners=[];

this._filterMatcher=null;
this._highlightMatcher=null;
};

Timeline.OverviewEventPainter.prototype.initialize=function(band,timeline){
this._band=band;
this._timeline=timeline;

this._eventLayer=null;
this._highlightLayer=null;
};

Timeline.OverviewEventPainter.prototype.addOnSelectListener=function(listener){
this._onSelectListeners.push(listener);
};

Timeline.OverviewEventPainter.prototype.removeOnSelectListener=function(listener){
for(var i=0;i<this._onSelectListeners.length;i++){
if(this._onSelectListeners[i]==listener){
this._onSelectListeners.splice(i,1);
break;
}
}
};

Timeline.OverviewEventPainter.prototype.getFilterMatcher=function(){
return this._filterMatcher;
};

Timeline.OverviewEventPainter.prototype.setFilterMatcher=function(filterMatcher){
this._filterMatcher=filterMatcher;
};

Timeline.OverviewEventPainter.prototype.getHighlightMatcher=function(){
return this._highlightMatcher;
};

Timeline.OverviewEventPainter.prototype.setHighlightMatcher=function(highlightMatcher){
this._highlightMatcher=highlightMatcher;
};

Timeline.OverviewEventPainter.prototype.paint=function(){
var eventSource=this._band.getEventSource();
if(eventSource==null){
return;
}

this._prepareForPainting();

var eventTheme=this._params.theme.event;
var metrics={
trackOffset:eventTheme.overviewTrack.offset,
trackHeight:eventTheme.overviewTrack.height,
trackGap:eventTheme.overviewTrack.gap,
trackIncrement:eventTheme.overviewTrack.height+eventTheme.overviewTrack.gap
}

var minDate=this._band.getMinDate();
var maxDate=this._band.getMaxDate();

var filterMatcher=(this._filterMatcher!=null)?
this._filterMatcher:
function(evt){return true;};
var highlightMatcher=(this._highlightMatcher!=null)?
this._highlightMatcher:
function(evt){return-1;};

var iterator=eventSource.getEventReverseIterator(minDate,maxDate);
while(iterator.hasNext()){
var evt=iterator.next();
if(filterMatcher(evt)){
this.paintEvent(evt,metrics,this._params.theme,highlightMatcher(evt));
}
}

this._highlightLayer.style.display="block";
this._eventLayer.style.display="block";
};

Timeline.OverviewEventPainter.prototype.softPaint=function(){
};

Timeline.OverviewEventPainter.prototype._prepareForPainting=function(){
var band=this._band;

this._tracks=[];

if(this._highlightLayer!=null){
band.removeLayerDiv(this._highlightLayer);
}
this._highlightLayer=band.createLayerDiv(105,"timeline-band-highlights");
this._highlightLayer.style.display="none";

if(this._eventLayer!=null){
band.removeLayerDiv(this._eventLayer);
}
this._eventLayer=band.createLayerDiv(110,"timeline-band-events");
this._eventLayer.style.display="none";
};

Timeline.OverviewEventPainter.prototype.paintEvent=function(evt,metrics,theme,highlightIndex){
if(evt.isInstant()){
this.paintInstantEvent(evt,metrics,theme,highlightIndex);
}else{
this.paintDurationEvent(evt,metrics,theme,highlightIndex);
}
};

Timeline.OverviewEventPainter.prototype.paintInstantEvent=function(evt,metrics,theme,highlightIndex){
var startDate=evt.getStart();
var startPixel=Math.round(this._band.dateToPixelOffset(startDate));

var color=evt.getColor();
color=color!=null?color:theme.event.duration.color;

var tickElmtData=this._paintEventTick(evt,startPixel,color,100,metrics,theme);

this._createHighlightDiv(highlightIndex,tickElmtData,theme);
};

Timeline.OverviewEventPainter.prototype.paintDurationEvent=function(evt,metrics,theme,highlightIndex){
var latestStartDate=evt.getLatestStart();
var earliestEndDate=evt.getEarliestEnd();

var latestStartPixel=Math.round(this._band.dateToPixelOffset(latestStartDate));
var earliestEndPixel=Math.round(this._band.dateToPixelOffset(earliestEndDate));

var tapeTrack=0;
for(;tapeTrack<this._tracks.length;tapeTrack++){
if(earliestEndPixel<this._tracks[tapeTrack]){
break;
}
}
this._tracks[tapeTrack]=earliestEndPixel;

var color=evt.getColor();
color=color!=null?color:theme.event.duration.color;

var tapeElmtData=this._paintEventTape(evt,tapeTrack,latestStartPixel,earliestEndPixel,color,100,metrics,theme);

this._createHighlightDiv(highlightIndex,tapeElmtData,theme);
};

Timeline.OverviewEventPainter.prototype._paintEventTape=function(
evt,track,left,right,color,opacity,metrics,theme){

var top=metrics.trackOffset+track*metrics.trackIncrement;
var width=right-left;
var height=metrics.trackHeight;

var tapeDiv=this._timeline.getDocument().createElement("div");
tapeDiv.style.position="absolute";
tapeDiv.style.left=left+"px";
tapeDiv.style.width=width+"px";
tapeDiv.style.top=top+"px";
tapeDiv.style.height=height+"px";
tapeDiv.style.backgroundColor=color;
tapeDiv.style.overflow="hidden";
SimileAjax.Graphics.setOpacity(tapeDiv,opacity);

this._eventLayer.appendChild(tapeDiv);

return{
left:left,
top:top,
width:width,
height:height,
elmt:tapeDiv
};
}

Timeline.OverviewEventPainter.prototype._paintEventTick=function(
evt,left,color,opacity,metrics,theme){

var height=theme.event.overviewTrack.tickHeight;
var top=metrics.trackOffset-height;
var width=1;

var tickDiv=this._timeline.getDocument().createElement("div");
tickDiv.style.position="absolute";
tickDiv.style.left=left+"px";
tickDiv.style.width=width+"px";
tickDiv.style.top=top+"px";
tickDiv.style.height=height+"px";
tickDiv.style.backgroundColor=color;
tickDiv.style.overflow="hidden";
SimileAjax.Graphics.setOpacity(tickDiv,opacity);

this._eventLayer.appendChild(tickDiv);

return{
left:left,
top:top,
width:width,
height:height,
elmt:tickDiv
};
}

Timeline.OverviewEventPainter.prototype._createHighlightDiv=function(highlightIndex,dimensions,theme){
if(highlightIndex>=0){
var doc=this._timeline.getDocument();
var eventTheme=theme.event;

var color=eventTheme.highlightColors[Math.min(highlightIndex,eventTheme.highlightColors.length-1)];

var div=doc.createElement("div");
div.style.position="absolute";
div.style.overflow="hidden";
div.style.left=(dimensions.left-1)+"px";
div.style.width=(dimensions.width+2)+"px";
div.style.top=(dimensions.top-1)+"px";
div.style.height=(dimensions.height+2)+"px";
div.style.background=color;

this._highlightLayer.appendChild(div);
}
};

Timeline.OverviewEventPainter.prototype.showBubble=function(evt){

};


/* sources.js */




Timeline.DefaultEventSource=function(eventIndex){
this._events=(eventIndex instanceof Object)?eventIndex:new SimileAjax.EventIndex();
this._listeners=[];
};

Timeline.DefaultEventSource.prototype.addListener=function(listener){
this._listeners.push(listener);
};

Timeline.DefaultEventSource.prototype.removeListener=function(listener){
for(var i=0;i<this._listeners.length;i++){
if(this._listeners[i]==listener){
this._listeners.splice(i,1);
break;
}
}
};

Timeline.DefaultEventSource.prototype.loadXML=function(xml,url){
var base=this._getBaseURL(url);

var wikiURL=xml.documentElement.getAttribute("wiki-url");
var wikiSection=xml.documentElement.getAttribute("wiki-section");

var dateTimeFormat=xml.documentElement.getAttribute("date-time-format");
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

var node=xml.documentElement.firstChild;
var added=false;
while(node!=null){
if(node.nodeType==1){
var description="";
if(node.firstChild!=null&&((node.firstChild.nodeType==3)||(node.firstChild.nodeType==4))){
description=node.firstChild.nodeValue;
}
var evt=new Timeline.DefaultEventSource.Event(
node.getAttribute("id"),
parseDateTimeFunction(node.getAttribute("start")),
parseDateTimeFunction(node.getAttribute("end")),
parseDateTimeFunction(node.getAttribute("latestStart")),
parseDateTimeFunction(node.getAttribute("earliestEnd")),
node.getAttribute("isDuration")!="true",
node.getAttribute("title"),
description,
this._resolveRelativeURL(node.getAttribute("image"),base),
this._resolveRelativeURL(node.getAttribute("link"),base),
this._resolveRelativeURL(node.getAttribute("icon"),base),
node.getAttribute("color"),
node.getAttribute("textColor")
);
evt._node=node;
evt.getProperty=function(name){
return this._node.getAttribute(name);
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);

added=true;
}
node=node.nextSibling;
}

if(added){
this._fire("onAddMany",[]);
}
if (Timeline_RecalculateHeight) Timeline_RecalculateHeight();
};


Timeline.DefaultEventSource.prototype.loadJSON=function(data,url){
var base=this._getBaseURL(url);
var added=false;
if(data&&data.events){
var wikiURL=("wikiURL"in data)?data.wikiURL:null;
var wikiSection=("wikiSection"in data)?data.wikiSection:null;

var dateTimeFormat=("dateTimeFormat"in data)?data.dateTimeFormat:null;
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

for(var i=0;i<data.events.length;i++){
var event=data.events[i];
var evt=new Timeline.DefaultEventSource.Event(
("id"in event)?event.id:undefined,
parseDateTimeFunction(event.start),
parseDateTimeFunction(event.end),
parseDateTimeFunction(event.latestStart),
parseDateTimeFunction(event.earliestEnd),
event.isDuration||false,
event.title,
event.description,
this._resolveRelativeURL(event.image,base),
this._resolveRelativeURL(event.link,base),
this._resolveRelativeURL(event.icon,base),
event.color,
event.textColor
);
evt._obj=event;
evt.getProperty=function(name){
return this._obj[name];
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);
added=true;
}
}

if(added){
this._fire("onAddMany",[]);
}
};


Timeline.DefaultEventSource.prototype.loadSPARQL=function(xml,url){
var base=this._getBaseURL(url);

var dateTimeFormat='iso8601';
var parseDateTimeFunction=this._events.getUnit().getParser(dateTimeFormat);

if(xml==null){
return;
}


var node=xml.documentElement.firstChild;
while(node!=null&&(node.nodeType!=1||node.nodeName!='results')){
node=node.nextSibling;
}

var wikiURL=null;
var wikiSection=null;
if(node!=null){
wikiURL=node.getAttribute("wiki-url");
wikiSection=node.getAttribute("wiki-section");

node=node.firstChild;
}

var added=false;
while(node!=null){
if(node.nodeType==1){
var bindings={};
var binding=node.firstChild;
while(binding!=null){
if(binding.nodeType==1&&
binding.firstChild!=null&&
binding.firstChild.nodeType==1&&
binding.firstChild.firstChild!=null&&
binding.firstChild.firstChild.nodeType==3){
bindings[binding.getAttribute('name')]=binding.firstChild.firstChild.nodeValue;
}
binding=binding.nextSibling;
}

if(bindings["start"]==null&&bindings["date"]!=null){
bindings["start"]=bindings["date"];
}

var evt=new Timeline.DefaultEventSource.Event(
bindings["id"],
parseDateTimeFunction(bindings["start"]),
parseDateTimeFunction(bindings["end"]),
parseDateTimeFunction(bindings["latestStart"]),
parseDateTimeFunction(bindings["earliestEnd"]),
bindings["isDuration"]!="true",
bindings["title"],
bindings["description"],
this._resolveRelativeURL(bindings["image"],base),
this._resolveRelativeURL(bindings["link"],base),
this._resolveRelativeURL(bindings["icon"],base),
bindings["color"],
bindings["textColor"]
);
evt._bindings=bindings;
evt.getProperty=function(name){
return this._bindings[name];
};
evt.setWikiInfo(wikiURL,wikiSection);

this._events.add(evt);
added=true;
}
node=node.nextSibling;
}

if(added){
this._fire("onAddMany",[]);
}
};

Timeline.DefaultEventSource.prototype.add=function(evt){
this._events.add(evt);
this._fire("onAddOne",[evt]);
};

Timeline.DefaultEventSource.prototype.addMany=function(events){
for(var i=0;i<events.length;i++){
this._events.add(events[i]);
}
this._fire("onAddMany",[]);
};

Timeline.DefaultEventSource.prototype.clear=function(){
this._events.removeAll();
this._fire("onClear",[]);
};

Timeline.DefaultEventSource.prototype.getEvent=function(id){
return this._events.getEvent(id);
};

Timeline.DefaultEventSource.prototype.getEventIterator=function(startDate,endDate){
return this._events.getIterator(startDate,endDate);
};

Timeline.DefaultEventSource.prototype.getEventReverseIterator=function(startDate,endDate){
return this._events.getReverseIterator(startDate,endDate);
};

Timeline.DefaultEventSource.prototype.getAllEventIterator=function(){
return this._events.getAllIterator();
};

Timeline.DefaultEventSource.prototype.getCount=function(){
return this._events.getCount();
};

Timeline.DefaultEventSource.prototype.getEarliestDate=function(){
return this._events.getEarliestDate();
};

Timeline.DefaultEventSource.prototype.getLatestDate=function(){
return this._events.getLatestDate();
};

Timeline.DefaultEventSource.prototype._fire=function(handlerName,args){
for(var i=0;i<this._listeners.length;i++){
var listener=this._listeners[i];
if(handlerName in listener){
try{
listener[handlerName].apply(listener,args);
}catch(e){
SimileAjax.Debug.exception(e);
}
}
}
};

Timeline.DefaultEventSource.prototype._getBaseURL=function(url){
if(url.indexOf("://")<0){
var url2=this._getBaseURL(document.location.href);
if(url.substr(0,1)=="/"){
url=url2.substr(0,url2.indexOf("/",url2.indexOf("://")+3))+url;
}else{
url=url2+url;
}
}

var i=url.lastIndexOf("/");
if(i<0){
return"";
}else{
return url.substr(0,i+1);
}
};

Timeline.DefaultEventSource.prototype._resolveRelativeURL=function(url,base){
if(url==null||url==""){
return url;
}else if(url.indexOf("://")>0){
return url;
}else if(url.indexOf("javascript:")>=0){
return url;
}else if(url.substr(0,1)=="/"){
return base.substr(0,base.indexOf("/",base.indexOf("://")+3))+url;
}else{
return base+url;
}
};


Timeline.DefaultEventSource.Event=function(
id,
start,end,latestStart,earliestEnd,instant,
text,description,image,link,
icon,color,textColor){

id=(id)?id.trim():"";
this._id=id.length>0?id:("e"+Math.floor(Math.random()*1000000));

this._instant=instant||(end==null);

if ((!start) || (isNaN(new Date(start).getYear())) || (start == null))  {
    throw String.format("Error creating event: no valid startdate.\n{0}\n{1}", text, description);
};
this._start=start;
this._end=(end!=null)?end:start;

this._latestStart=(latestStart!=null)?latestStart:(instant?this._end:this._start);
this._earliestEnd=(earliestEnd!=null)?earliestEnd:(instant?this._start:this._end);

this._text=SimileAjax.HTML.deEntify(text);
this._description=SimileAjax.HTML.deEntify(description);
this._image=(image!=null&&image!="")?image:null;
this._link=(link!=null&&link!="")?link:null;

this._icon=(icon!=null&&icon!="")?icon:null;
this._color=(color!=null&&color!="")?color:null;
this._textColor=(textColor!=null&&textColor!="")?textColor:null;

this._wikiURL=null;
this._wikiSection=null;
};

Timeline.DefaultEventSource.Event.prototype={
getID:function(){return this._id;},

isInstant:function(){return this._instant;},
isImprecise:function(){return this._start!=this._latestStart||this._end!=this._earliestEnd;},

getStart:function(){return this._start;},
getEnd:function(){return this._end;},
getLatestStart:function(){return this._latestStart;},
getEarliestEnd:function(){return this._earliestEnd;},

getText:function(){return this._text;},
getDescription:function(){return this._description;},
getImage:function(){return this._image;},
getLink:function(){return this._link;},

getIcon:function(){return this._icon;},
getColor:function(){return this._color;},
getTextColor:function(){return this._textColor;},

getProperty:function(name){return null;},

getWikiURL:function(){return this._wikiURL;},
getWikiSection:function(){return this._wikiSection;},
setWikiInfo:function(wikiURL,wikiSection){
this._wikiURL=wikiURL;
this._wikiSection=wikiSection;
},

fillDescription:function(elmt){
elmt.innerHTML=this._description;
},
fillWikiInfo:function(elmt){
if(this._wikiURL!=null&&this._wikiSection!=null){
var wikiID=this.getProperty("wikiID");
if(wikiID==null||wikiID.length==0){
wikiID=this.getText();
}
wikiID=wikiID.replace(/\s/g,"_");

var url=this._wikiURL+this._wikiSection.replace(/\s/g,"_")+"/"+wikiID;
var a=document.createElement("a");
a.href=url;
a.target="new";
a.innerHTML=Timeline.strings[Timeline.clientLocale].wikiLinkLabel;

elmt.appendChild(document.createTextNode("["));
elmt.appendChild(a);
elmt.appendChild(document.createTextNode("]"));
}else{
elmt.style.display="none";
}
},
fillTime:function(elmt,labeller){
if(this._instant){
if(this.isImprecise()){
if(this._start-this._end==1000){
    elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start, true)))
}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
}}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
}
}else{
if(this.isImprecise()){
elmt.appendChild(elmt.ownerDocument.createTextNode(
labeller.labelPrecise(this._start)+" ~ "+labeller.labelPrecise(this._latestStart)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(
labeller.labelPrecise(this._earliestEnd)+" ~ "+labeller.labelPrecise(this._end)));
}else{
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._start)));
elmt.appendChild(elmt.ownerDocument.createElement("br"));
elmt.appendChild(elmt.ownerDocument.createTextNode(labeller.labelPrecise(this._end)));
}
}
},
fillInfoBubble:function(elmt,theme,labeller){
var doc=elmt.ownerDocument;

var title=this.getText();
var link=this.getLink();
var image=this.getImage();

if(image!=null){
var img=doc.createElement("img");
img.src=image;

theme.event.bubble.imageStyler(img);
elmt.appendChild(img);
}

var divTitle=doc.createElement("div");
var textTitle=doc.createTextNode(title);
if(link!=null){
var a=doc.createElement("a");
a.href=link;
a.appendChild(textTitle);
divTitle.appendChild(a);
}else{
divTitle.appendChild(textTitle);
}
theme.event.bubble.titleStyler(divTitle);
elmt.appendChild(divTitle);

var divBody=doc.createElement("div");
this.fillDescription(divBody);
theme.event.bubble.bodyStyler(divBody);
elmt.appendChild(divBody);

var divTime=doc.createElement("div");
this.fillTime(divTime,labeller);
theme.event.bubble.timeStyler(divTime);
elmt.appendChild(divTime);

var divWiki=doc.createElement("div");
this.fillWikiInfo(divWiki);
theme.event.bubble.wikiStyler(divWiki);
elmt.appendChild(divWiki);
}
};

/* themes.js */




Timeline.ClassicTheme=new Object();

Timeline.ClassicTheme.implementations=[];

Timeline.ClassicTheme.create=function(locale){
if(locale==null){
locale=Timeline.getDefaultLocale();
}

var f=Timeline.ClassicTheme.implementations[locale];
if(f==null){
f=Timeline.ClassicTheme._Impl;
}
return new f();
};

Timeline.ClassicTheme._Impl=function(){
this.firstDayOfWeek=0;

this.ether={
backgroundColors:[
"#EEE",
"#DDD",
"#CCC",
"#AAA"
],
highlightColor:"white",
highlightOpacity:50,
interval:{
line:{
show:true,
color:"#aaa",
opacity:25
},
weekend:{
color:"#FFFFE0",
opacity:30
},
marker:{
hAlign:"Bottom",
hBottomStyler:function(elmt){
elmt.className="timeline-ether-marker-bottom";
},
hBottomEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-bottom-emphasized";
},
hTopStyler:function(elmt){
elmt.className="timeline-ether-marker-top";
},
hTopEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-top-emphasized";
},

vAlign:"Right",
vRightStyler:function(elmt){
elmt.className="timeline-ether-marker-right";
},
vRightEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-right-emphasized";
},
vLeftStyler:function(elmt){
elmt.className="timeline-ether-marker-left";
},
vLeftEmphasizedStyler:function(elmt){
elmt.className="timeline-ether-marker-left-emphasized";
}
}
}
};

this.event={
track:{
height:10,
gap:2
},
overviewTrack:{
offset:20,
tickHeight:6,
height:2,
gap:1
},
tape:{
height:4
},
instant:{
icon:Timeline.urlPrefix+"images/dull-blue-circle.png",
iconWidth:16,
iconHeight:16,
color:"#58A0DC",
impreciseColor:"#58A0DC",
impreciseOpacity:20
},
duration:{
color:"#58A0DC",
impreciseColor:"#58A0DC",
impreciseOpacity:20
},
label:{
backgroundColor:"white",
backgroundOpacity:50,
lineColor:"#58A0DC",
offsetFromLine:3
},
highlightColors:[
"#FFFF00",
"#FFC000",
"#FF0000",
"#0000FF"
],
bubble:{
width:250,
height:125,
titleStyler:function(elmt){
elmt.className="timeline-event-bubble-title";
},
bodyStyler:function(elmt){
elmt.className="timeline-event-bubble-body";
},
imageStyler:function(elmt){
elmt.className="timeline-event-bubble-image";
},
wikiStyler:function(elmt){
elmt.className="timeline-event-bubble-wiki";
},
timeStyler:function(elmt){
elmt.className="timeline-event-bubble-time";
}
}
};
};

/* timeline.js */



Timeline.strings={};

Timeline.getDefaultLocale=function(){
return Timeline.clientLocale;
};

Timeline.create=function(elmt,bandInfos,orientation,unit){
return new Timeline._Impl(elmt,bandInfos,orientation,unit);
};

Timeline.HORIZONTAL=0;
Timeline.VERTICAL=1;

Timeline._defaultTheme=null;

Timeline.createBandInfo=function(params){
var theme=("theme"in params)?params.theme:Timeline.getDefaultTheme();

var eventSource=("eventSource"in params)?params.eventSource:null;

var ether=new Timeline.LinearEther({
centersOn:("date"in params)?params.date:new Date(),
interval:SimileAjax.DateTime.gregorianUnitLengths[params.intervalUnit],
pixelsPerInterval:params.intervalPixels
});

var etherPainter=new Timeline.GregorianEtherPainter({
unit:params.intervalUnit,
multiple:("multiple"in params)?params.multiple:1,
theme:theme,
align:("align"in params)?params.align:undefined
});

var eventPainterParams={
showText:("showEventText"in params)?params.showEventText:true,
theme:theme
};
if("trackHeight"in params){
eventPainterParams.trackHeight=params.trackHeight;
}
if("trackGap"in params){
eventPainterParams.trackGap=params.trackGap;
}

var layout=("overview"in params&&params.overview)?"overview":("layout"in params?params.layout:"original");
var eventPainter;
switch(layout){
case"overview":
eventPainter=new Timeline.OverviewEventPainter(eventPainterParams);
break;
case"detailed":
eventPainter=new Timeline.DetailedEventPainter(eventPainterParams);
break;
default:
eventPainter=new Timeline.OriginalEventPainter(eventPainterParams);
}

return{
width:params.width,
eventSource:eventSource,
timeZone:("timeZone"in params)?params.timeZone:0,
ether:ether,
etherPainter:etherPainter,
eventPainter:eventPainter
};
};

Timeline.createHotZoneBandInfo=function(params){
var theme=("theme"in params)?params.theme:Timeline.getDefaultTheme();

var eventSource=("eventSource"in params)?params.eventSource:null;

var ether=new Timeline.HotZoneEther({
centersOn:("date"in params)?params.date:new Date(),
interval:SimileAjax.DateTime.gregorianUnitLengths[params.intervalUnit],
pixelsPerInterval:params.intervalPixels,
zones:params.zones
});

var etherPainter=new Timeline.HotZoneGregorianEtherPainter({
unit:params.intervalUnit,
zones:params.zones,
theme:theme,
align:("align"in params)?params.align:undefined
});

var eventPainterParams={
showText:("showEventText"in params)?params.showEventText:true,
theme:theme
};
if("trackHeight"in params){
eventPainterParams.trackHeight=params.trackHeight;
}
if("trackGap"in params){
eventPainterParams.trackGap=params.trackGap;
}

var layout=("overview"in params&&params.overview)?"overview":("layout"in params?params.layout:"original");
var eventPainter;
switch(layout){
case"overview":
eventPainter=new Timeline.OverviewEventPainter(eventPainterParams);
break;
case"detailed":
eventPainter=new Timeline.DetailedEventPainter(eventPainterParams);
break;
default:
eventPainter=new Timeline.OriginalEventPainter(eventPainterParams);
}

return{
width:params.width,
eventSource:eventSource,
timeZone:("timeZone"in params)?params.timeZone:0,
ether:ether,
etherPainter:etherPainter,
eventPainter:eventPainter
};
};

Timeline.getDefaultTheme=function(){
if(Timeline._defaultTheme==null){
Timeline._defaultTheme=Timeline.ClassicTheme.create(Timeline.getDefaultLocale());
}
return Timeline._defaultTheme;
};

Timeline.setDefaultTheme=function(theme){
Timeline._defaultTheme=theme;
};

Timeline.loadXML=function(url,f){
var fError=function(statusText,status,xmlhttp){
alert("Failed to load data xml from "+url+"\n"+statusText);
};
var fDone=function(xmlhttp){
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
f(xml,url);
};
SimileAjax.XmlHttp.get(url,fError,fDone);
};


Timeline.loadJSON=function(url,f){
var fError=function(statusText,status,xmlhttp){
alert("Failed to load json data from "+url+"\n"+statusText);
};
var fDone=function(xmlhttp){
f(eval('('+xmlhttp.responseText+')'),url);
};
SimileAjax.XmlHttp.get(url,fError,fDone);
};


Timeline._Impl=function(elmt,bandInfos,orientation,unit){
SimileAjax.WindowManager.initialize();

this._containerDiv=elmt;

this._bandInfos=bandInfos;
this._orientation=orientation==null?Timeline.HORIZONTAL:orientation;
this._unit=(unit!=null)?unit:SimileAjax.NativeDateUnit;

this._initialize();
};

Timeline._Impl.prototype.dispose=function(){
for(var i=0;i<this._bands.length;i++){
this._bands[i].dispose();
}
this._bands=null;
this._bandInfos=null;
this._containerDiv.innerHTML="";
};

Timeline._Impl.prototype.getBandCount=function(){
return this._bands.length;
};

Timeline._Impl.prototype.getBand=function(index){
return this._bands[index];
};

Timeline._Impl.prototype.layout=function(){
this._distributeWidths();
};

Timeline._Impl.prototype.paint=function(){
for(var i=0;i<this._bands.length;i++){
this._bands[i].paint();
}
};

Timeline._Impl.prototype.getDocument=function(){
return this._containerDiv.ownerDocument;
};

Timeline._Impl.prototype.addDiv=function(div){
this._containerDiv.appendChild(div);
};

Timeline._Impl.prototype.removeDiv=function(div){
this._containerDiv.removeChild(div);
};

Timeline._Impl.prototype.isHorizontal=function(){
return this._orientation==Timeline.HORIZONTAL;
};

Timeline._Impl.prototype.isVertical=function(){
return this._orientation==Timeline.VERTICAL;
};

Timeline._Impl.prototype.getPixelLength=function(){
return this._orientation==Timeline.HORIZONTAL?
this._containerDiv.offsetWidth:this._containerDiv.offsetHeight;
};

Timeline._Impl.prototype.getPixelWidth=function(){
return this._orientation==Timeline.VERTICAL?
this._containerDiv.offsetWidth:this._containerDiv.offsetHeight;
};

Timeline._Impl.prototype.getUnit=function(){
return this._unit;
};

Timeline._Impl.prototype.loadXML=function(url,f){
var tl=this;


var fError=function(statusText,status,xmlhttp){
alert("Failed to load data xml from "+url+"\n"+statusText);
tl.hideLoadingMessage();
};
var fDone=function(xmlhttp){
try{
var xml=xmlhttp.responseXML;
if(!xml.documentElement&&xmlhttp.responseStream){
xml.load(xmlhttp.responseStream);
}
f(xml,url);
}finally{
tl.hideLoadingMessage();
}
};

this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(url,fError,fDone);},0);
};

Timeline._Impl.prototype.loadJSON=function(url,f){
var tl=this;


var fError=function(statusText,status,xmlhttp){
alert("Failed to load json data from "+url+"\n"+statusText);
tl.hideLoadingMessage();
};
var fDone=function(xmlhttp){
try{
f(eval('('+xmlhttp.responseText+')'),url);
}finally{
tl.hideLoadingMessage();
}
};

this.showLoadingMessage();
window.setTimeout(function(){SimileAjax.XmlHttp.get(url,fError,fDone);},0);
};

Timeline._Impl.prototype._initialize=function(){
var containerDiv=this._containerDiv;
var doc=containerDiv.ownerDocument;

containerDiv.className=
containerDiv.className.split(" ").concat("timeline-container").join(" ");

while(containerDiv.firstChild){
containerDiv.removeChild(containerDiv.firstChild);
}


//var elmtCopyright=SimileAjax.Graphics.createTranslucentImage(Timeline.urlPrefix+(this.isHorizontal()?"images/copyright-vertical.png":"images/copyright.png"));
//elmtCopyright.className="timeline-copyright";
//elmtCopyright.title="Timeline (c) SIMILE - http://simile.mit.edu/timeline/";
//SimileAjax.DOM.registerEvent(elmtCopyright,"click",function(){window.location="http://simile.mit.edu/timeline/";});
//containerDiv.appendChild(elmtCopyright);


this._bands=[];
for(var i=0;i<this._bandInfos.length;i++){
var band=new Timeline._Band(this,this._bandInfos[i],i);
this._bands.push(band);
}
this._distributeWidths();


for(var i=0;i<this._bandInfos.length;i++){
var bandInfo=this._bandInfos[i];
if("syncWith"in bandInfo){
this._bands[i].setSyncWithBand(
this._bands[bandInfo.syncWith],
("highlight"in bandInfo)?bandInfo.highlight:false
);
}
}


var message=SimileAjax.Graphics.createMessageBubble(doc);
message.containerDiv.className="timeline-message-container";
containerDiv.appendChild(message.containerDiv);

message.contentDiv.className="timeline-message";
message.contentDiv.innerHTML="<img src='"+Timeline.urlPrefix+"images/progress-running.gif' /> Loading...";

this.showLoadingMessage=function(){message.containerDiv.style.display="block";};
this.hideLoadingMessage=function(){message.containerDiv.style.display="none";};
};

Timeline._Impl.prototype._distributeWidths=function(){
var length=this.getPixelLength();
var width=this.getPixelWidth();
var cumulativeWidth=0;

for(var i=0;i<this._bands.length;i++){
var band=this._bands[i];
var bandInfos=this._bandInfos[i];
var widthString=bandInfos.width;

var x=widthString.indexOf("%");
if(x>0){
var percent=parseInt(widthString.substr(0,x));
var bandWidth=percent*width/100;
}else{
var bandWidth=parseInt(widthString);
}

band.setBandShiftAndWidth(cumulativeWidth,bandWidth);
band.setViewLength(length);

cumulativeWidth+=bandWidth;
}
};


Timeline._Band=function(timeline,bandInfo,index){
this._timeline=timeline;
this._bandInfo=bandInfo;
this._index=index;

this._locale=("locale"in bandInfo)?bandInfo.locale:Timeline.getDefaultLocale();
this._timeZone=("timeZone"in bandInfo)?bandInfo.timeZone:0;
this._labeller=("labeller"in bandInfo)?bandInfo.labeller:
(("createLabeller"in timeline.getUnit())?
timeline.getUnit().createLabeller(this._locale,this._timeZone):
new Timeline.GregorianDateLabeller(this._locale,this._timeZone));

this._dragging=false;
this._changing=false;
this._originalScrollSpeed=5;
this._scrollSpeed=this._originalScrollSpeed;
this._onScrollListeners=[];

var b=this;
this._syncWithBand=null;
this._syncWithBandHandler=function(band){
b._onHighlightBandScroll();
};
this._selectorListener=function(band){
b._onHighlightBandScroll();
};


var inputDiv=this._timeline.getDocument().createElement("div");
inputDiv.className="timeline-band-input";
this._timeline.addDiv(inputDiv);

this._keyboardInput=document.createElement("input");
this._keyboardInput.type="text";
inputDiv.appendChild(this._keyboardInput);
SimileAjax.DOM.registerEventWithObject(this._keyboardInput,"keydown",this,"_onKeyDown");
SimileAjax.DOM.registerEventWithObject(this._keyboardInput,"keyup",this,"_onKeyUp");


this._div=this._timeline.getDocument().createElement("div");
this._div.className="timeline-band timeline-band-"+index;
this._timeline.addDiv(this._div);

SimileAjax.DOM.registerEventWithObject(this._div,"mousedown",this,"_onMouseDown");
SimileAjax.DOM.registerEventWithObject(this._div,"mousemove",this,"_onMouseMove");
SimileAjax.DOM.registerEventWithObject(this._div,"mouseup",this,"_onMouseUp");
SimileAjax.DOM.registerEventWithObject(this._div,"mouseout",this,"_onMouseOut");
SimileAjax.DOM.registerEventWithObject(this._div,"dblclick",this,"_onDblClick");


this._innerDiv=this._timeline.getDocument().createElement("div");
this._innerDiv.className="timeline-band-inner";
this._div.appendChild(this._innerDiv);


this._ether=bandInfo.ether;
bandInfo.ether.initialize(timeline);

this._etherPainter=bandInfo.etherPainter;
bandInfo.etherPainter.initialize(this,timeline);

this._eventSource=bandInfo.eventSource;
if(this._eventSource){
this._eventListener={
onAddMany:function(){b._onAddMany();},
onClear:function(){b._onClear();}
}
this._eventSource.addListener(this._eventListener);
}

this._eventPainter=bandInfo.eventPainter;
bandInfo.eventPainter.initialize(this,timeline);

this._decorators=("decorators"in bandInfo)?bandInfo.decorators:[];
for(var i=0;i<this._decorators.length;i++){
this._decorators[i].initialize(this,timeline);
}
};

Timeline._Band.SCROLL_MULTIPLES=5;

Timeline._Band.prototype.dispose=function(){
this.closeBubble();

if(this._eventSource){
this._eventSource.removeListener(this._eventListener);
this._eventListener=null;
this._eventSource=null;
}

this._timeline=null;
this._bandInfo=null;

this._labeller=null;
this._ether=null;
this._etherPainter=null;
this._eventPainter=null;
this._decorators=null;

this._onScrollListeners=null;
this._syncWithBandHandler=null;
this._selectorListener=null;

this._div=null;
this._innerDiv=null;
this._keyboardInput=null;
};

Timeline._Band.prototype.addOnScrollListener=function(listener){
this._onScrollListeners.push(listener);
};

Timeline._Band.prototype.removeOnScrollListener=function(listener){
for(var i=0;i<this._onScrollListeners.length;i++){
if(this._onScrollListeners[i]==listener){
this._onScrollListeners.splice(i,1);
break;
}
}
};

Timeline._Band.prototype.setSyncWithBand=function(band,highlight){
if(this._syncWithBand){
this._syncWithBand.removeOnScrollListener(this._syncWithBandHandler);
}

this._syncWithBand=band;
this._syncWithBand.addOnScrollListener(this._syncWithBandHandler);
this._highlight=highlight;
this._positionHighlight();
};

Timeline._Band.prototype.getLocale=function(){
return this._locale;
};

Timeline._Band.prototype.getTimeZone=function(){
return this._timeZone;
};

Timeline._Band.prototype.getLabeller=function(){
return this._labeller;
};

Timeline._Band.prototype.getIndex=function(){
return this._index;
};

Timeline._Band.prototype.getEther=function(){
return this._ether;
};

Timeline._Band.prototype.getEtherPainter=function(){
return this._etherPainter;
};

Timeline._Band.prototype.getEventSource=function(){
return this._eventSource;
};

Timeline._Band.prototype.getEventPainter=function(){
return this._eventPainter;
};

Timeline._Band.prototype.layout=function(){
this.paint();
};

Timeline._Band.prototype.paint=function(){
this._etherPainter.paint();
this._paintDecorators();
this._paintEvents();
};

Timeline._Band.prototype.softLayout=function(){
this.softPaint();
};

Timeline._Band.prototype.softPaint=function(){
this._etherPainter.softPaint();
this._softPaintDecorators();
this._softPaintEvents();
};

Timeline._Band.prototype.setBandShiftAndWidth=function(shift,width){
var inputDiv=this._keyboardInput.parentNode;
var middle=shift+Math.floor(width/2);
if(this._timeline.isHorizontal()){
this._div.style.top=shift+"px";
this._div.style.height=width+"px";

inputDiv.style.top=middle+"px";
inputDiv.style.left="-1em";
}else{
this._div.style.left=shift+"px";
this._div.style.width=width+"px";

inputDiv.style.left=middle+"px";
inputDiv.style.top="-1em";
}
};

Timeline._Band.prototype.getViewWidth=function(){
if(this._timeline.isHorizontal()){
return this._div.offsetHeight;
}else{
return this._div.offsetWidth;
}
};

Timeline._Band.prototype.setViewLength=function(length){
this._viewLength=length;
this._recenterDiv();
this._onChanging();
};

Timeline._Band.prototype.getViewLength=function(){
return this._viewLength;
};

Timeline._Band.prototype.getTotalViewLength=function(){
return Timeline._Band.SCROLL_MULTIPLES*this._viewLength;
};

Timeline._Band.prototype.getViewOffset=function(){
return this._viewOffset;
};

Timeline._Band.prototype.getMinDate=function(){
return this._ether.pixelOffsetToDate(this._viewOffset);
};

Timeline._Band.prototype.getMaxDate=function(){
return this._ether.pixelOffsetToDate(this._viewOffset+Timeline._Band.SCROLL_MULTIPLES*this._viewLength);
};

Timeline._Band.prototype.getMinVisibleDate=function(){
return this._ether.pixelOffsetToDate(0);
};

Timeline._Band.prototype.getMaxVisibleDate=function(){
return this._ether.pixelOffsetToDate(this._viewLength);
};

Timeline._Band.prototype.getCenterVisibleDate=function(){
return this._ether.pixelOffsetToDate(this._viewLength/2);
};

Timeline._Band.prototype.setMinVisibleDate=function(date){
if(!this._changing){
this._moveEther(Math.round(-this._ether.dateToPixelOffset(date)));
}
};

Timeline._Band.prototype.setMaxVisibleDate=function(date){
if(!this._changing){
this._moveEther(Math.round(this._viewLength-this._ether.dateToPixelOffset(date)));
}
};

Timeline._Band.prototype.setCenterVisibleDate=function(date){
if(!this._changing){
this._moveEther(Math.round(this._viewLength/2-this._ether.dateToPixelOffset(date)));
}
};

Timeline._Band.prototype.dateToPixelOffset=function(date){
return this._ether.dateToPixelOffset(date)-this._viewOffset;
};

Timeline._Band.prototype.pixelOffsetToDate=function(pixels){
return this._ether.pixelOffsetToDate(pixels+this._viewOffset);
};

Timeline._Band.prototype.createLayerDiv=function(zIndex,className){
var div=this._timeline.getDocument().createElement("div");
div.className="timeline-band-layer"+(typeof className=="string"?(" "+className):"");
div.style.zIndex=zIndex;
this._innerDiv.appendChild(div);

var innerDiv=this._timeline.getDocument().createElement("div");
innerDiv.className="timeline-band-layer-inner";
if(SimileAjax.Platform.browser.isIE){
innerDiv.style.cursor="move";
}else{
innerDiv.style.cursor="-moz-grab";
}
div.appendChild(innerDiv);

return innerDiv;
};

Timeline._Band.prototype.removeLayerDiv=function(div){
this._innerDiv.removeChild(div.parentNode);
};

Timeline._Band.prototype.scrollToCenter=function(date,f){
var pixelOffset=this._ether.dateToPixelOffset(date);
if(pixelOffset<-this._viewLength/2){
this.setCenterVisibleDate(this.pixelOffsetToDate(pixelOffset+this._viewLength));
}else if(pixelOffset>3*this._viewLength/2){
this.setCenterVisibleDate(this.pixelOffsetToDate(pixelOffset-this._viewLength));
}
this._autoScroll(Math.round(this._viewLength/2-this._ether.dateToPixelOffset(date)),f);
};

Timeline._Band.prototype.showBubbleForEvent=function(eventID){
var evt=this.getEventSource().getEvent(eventID);
if(evt){
var self=this;
this.scrollToCenter(evt.getStart(),function(){
self._eventPainter.showBubble(evt);
});
}
};

Timeline._Band.prototype._onMouseDown=function(innerFrame,evt,target){
this.closeBubble();

this._dragging=true;
this._dragX=evt.clientX;
this._dragY=evt.clientY;
};

Timeline._Band.prototype._onMouseMove=function(innerFrame,evt,target){
if(this._dragging){
var diffX=evt.clientX-this._dragX;
var diffY=evt.clientY-this._dragY;

this._dragX=evt.clientX;
this._dragY=evt.clientY;

this._moveEther(this._timeline.isHorizontal()?diffX:diffY);
this._positionHighlight();
}
};

Timeline._Band.prototype._onMouseUp=function(innerFrame,evt,target){
this._dragging=false;
this._keyboardInput.focus();
};

Timeline._Band.prototype._onMouseOut=function(innerFrame,evt,target){
var coords=SimileAjax.DOM.getEventRelativeCoordinates(evt,innerFrame);
coords.x+=this._viewOffset;
if(coords.x<0||coords.x>innerFrame.offsetWidth||
coords.y<0||coords.y>innerFrame.offsetHeight){
this._dragging=false;
}
};

Timeline._Band.prototype._onDblClick=function(innerFrame,evt,target){
var coords=SimileAjax.DOM.getEventRelativeCoordinates(evt,innerFrame);
var distance=coords.x-(this._viewLength/2-this._viewOffset);

this._autoScroll(-distance);
};

Timeline._Band.prototype._onKeyDown=function(keyboardInput,evt,target){
if(!this._dragging){
switch(evt.keyCode){
case 27:
break;
case 37:
case 38:
this._scrollSpeed=Math.min(50,Math.abs(this._scrollSpeed*1.05));
this._moveEther(this._scrollSpeed);
break;
case 39:
case 40:
this._scrollSpeed=-Math.min(50,Math.abs(this._scrollSpeed*1.05));
this._moveEther(this._scrollSpeed);
break;
default:
return true;
}
this.closeBubble();

SimileAjax.DOM.cancelEvent(evt);
return false;
}
return true;
};

Timeline._Band.prototype._onKeyUp=function(keyboardInput,evt,target){
if(!this._dragging){
this._scrollSpeed=this._originalScrollSpeed;

switch(evt.keyCode){
case 35:
this.setCenterVisibleDate(this._eventSource.getLatestDate());
break;
case 36:
this.setCenterVisibleDate(this._eventSource.getEarliestDate());
break;
case 33:
this._autoScroll(this._timeline.getPixelLength());
break;
case 34:
this._autoScroll(-this._timeline.getPixelLength());
break;
default:
return true;
}

this.closeBubble();

SimileAjax.DOM.cancelEvent(evt);
return false;
}
return true;
};

Timeline._Band.prototype._autoScroll=function(distance,f){
var b=this;
var a=SimileAjax.Graphics.createAnimation(
function(abs,diff){
b._moveEther(diff);
},
0,
distance,
1000,
f
);
a.run();
};

Timeline._Band.prototype._moveEther=function(shift){
this.closeBubble();

this._viewOffset+=shift;
this._ether.shiftPixels(-shift);
if(this._timeline.isHorizontal()){
this._div.style.left=this._viewOffset+"px";
}else{
this._div.style.top=this._viewOffset+"px";
}

if(this._viewOffset>-this._viewLength*0.5||
this._viewOffset<-this._viewLength*(Timeline._Band.SCROLL_MULTIPLES-1.5)){

this._recenterDiv();
}else{
this.softLayout();
}

this._onChanging();
}

Timeline._Band.prototype._onChanging=function(){
this._changing=true;

this._fireOnScroll();
this._setSyncWithBandDate();

this._changing=false;
};

Timeline._Band.prototype._fireOnScroll=function(){
for(var i=0;i<this._onScrollListeners.length;i++){
this._onScrollListeners[i](this);
}
};

Timeline._Band.prototype._setSyncWithBandDate=function(){
if(this._syncWithBand){
var centerDate=this._ether.pixelOffsetToDate(this.getViewLength()/2);
this._syncWithBand.setCenterVisibleDate(centerDate);
}
};

Timeline._Band.prototype._onHighlightBandScroll=function(){
if(this._syncWithBand){
var centerDate=this._syncWithBand.getCenterVisibleDate();
var centerPixelOffset=this._ether.dateToPixelOffset(centerDate);

this._moveEther(Math.round(this._viewLength/2-centerPixelOffset));

if(this._highlight){
this._etherPainter.setHighlight(
this._syncWithBand.getMinVisibleDate(),
this._syncWithBand.getMaxVisibleDate());
}
}
};

Timeline._Band.prototype._onAddMany=function(){
this._paintEvents();
};

Timeline._Band.prototype._onClear=function(){
this._paintEvents();
};

Timeline._Band.prototype._positionHighlight=function(){
if(this._syncWithBand){
var startDate=this._syncWithBand.getMinVisibleDate();
var endDate=this._syncWithBand.getMaxVisibleDate();

if(this._highlight){
this._etherPainter.setHighlight(startDate,endDate);
}
}
};

Timeline._Band.prototype._recenterDiv=function(){
this._viewOffset=-this._viewLength*(Timeline._Band.SCROLL_MULTIPLES-1)/2;
if(this._timeline.isHorizontal()){
this._div.style.left=this._viewOffset+"px";
this._div.style.width=(Timeline._Band.SCROLL_MULTIPLES*this._viewLength)+"px";
}else{
this._div.style.top=this._viewOffset+"px";
this._div.style.height=(Timeline._Band.SCROLL_MULTIPLES*this._viewLength)+"px";
}
this.layout();
};

Timeline._Band.prototype._paintEvents=function(){
this._eventPainter.paint();
};

Timeline._Band.prototype._softPaintEvents=function(){
this._eventPainter.softPaint();
};

Timeline._Band.prototype._paintDecorators=function(){
for(var i=0;i<this._decorators.length;i++){
this._decorators[i].paint();
}
};

Timeline._Band.prototype._softPaintDecorators=function(){
for(var i=0;i<this._decorators.length;i++){
this._decorators[i].softPaint();
}
};

Timeline._Band.prototype.closeBubble=function(){
SimileAjax.WindowManager.cancelPopups();
};


/* units.js */





Timeline.NativeDateUnit=new Object();

Timeline.NativeDateUnit.createLabeller=function(locale,timeZone){
return new Timeline.GregorianDateLabeller(locale,timeZone);
};


Timeline.NativeDateUnit.makeDefaultValue=function(){
return new Date();
};

Timeline.NativeDateUnit.cloneValue=function(v){
return new Date(v.getTime());
};

Timeline.NativeDateUnit.getParser=function(format){
if(typeof format=="string"){
format=format.toLowerCase();
}
return(format=="iso8601"||format=="iso 8601")?

Timeline.DateTime.parseIso8601DateTime:

Timeline.DateTime.parseGregorianDateTime;

};

Timeline.NativeDateUnit.parseFromObject=function(o){
return Timeline.DateTime.parseGregorianDateTime(o);
};


Timeline.NativeDateUnit.toNumber=function(v){
return v.getTime();
};

Timeline.NativeDateUnit.fromNumber=function(n){
return new Date(n);
};

Timeline.NativeDateUnit.compare=function(v1,v2){
var n1,n2;
if(typeof v1=="object"){
n1=v1.getTime();
}else{
n1=Number(v1);
}
if(typeof v2=="object"){
n2=v2.getTime();
}else{
n2=Number(v2);
}

return n1-n2;
};

Timeline.NativeDateUnit.earlier=function(v1,v2){
return Timeline.NativeDateUnit.compare(v1,v2)<0?v1:v2;
};

Timeline.NativeDateUnit.later=function(v1,v2){
return Timeline.NativeDateUnit.compare(v1,v2)>0?v1:v2;
};

Timeline.NativeDateUnit.change=function(v,n){
return new Date(v.getTime()+n);
};

