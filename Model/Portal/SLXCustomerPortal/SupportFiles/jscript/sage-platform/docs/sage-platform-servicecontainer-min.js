/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


window.Sage=window.Sage||{};window.Sage.__namespace=true;Sage.apply=function(a,b,c){var n,o;if(a&&c){for(n in c){a[n]=c[n];}}
if(a&&b){for(o in b){a[o]=b[o];}}
return a;};Sage.count=1;Sage.guid=function(str){return this.stringBuild(str,this.count++);};Sage.stringBuild=function(){return Array.prototype.slice.call(arguments,0).join('');};Sage.ns=Sage.namespace=function(ns){if(!ns||!ns.length){return null;}
var levels=ns.split(".");var nsobj=Sage;for(var i=(levels[0]=="Sage")?1:0;i<levels.length;++i){nsobj[levels[i]]=nsobj[levels[i]]||{};nsobj=nsobj[levels[i]];}
return nsobj;};Sage.createNamespace=function(ns){if(!ns||!ns.length){return null;}
var levels=ns.split(".");window[levels[0]]=window[levels[0]]||{};var nsobj=window[levels[0]];for(var i=1;i<levels.length;++i){nsobj[levels[i]]=nsobj[levels[i]]||{};nsobj=nsobj[levels[i]];}
return nsobj;};Sage.extend=function(subclass,superclass){var f=function(){};f.prototype=superclass.prototype;subclass.prototype=new f();subclass.prototype.constructor=subclass;subclass.superclass=superclass.prototype;if(superclass.prototype.constructor==Object.prototype.constructor){superclass.prototype.constructor=superclass;}};(function(S){var INITIALIZING=false,OVERRIDE=/xyz/.test(function(){xyz;})?/\bbase\b/:/.*/;S.Class=function(){};S.Class.define=function(prop){var base=this.prototype;INITIALIZING=true;var prototype=new this();INITIALIZING=false;var wrap=function(name,fn){return function(){var tmp=this.base;this.base=base[name];var ret=fn.apply(this,arguments);this.base=tmp;return ret;};};var hidden=['constructor'],i=0,name;for(name in prop){prototype[name]=typeof prop[name]==="function"&&typeof base[name]==="function"&&OVERRIDE.test(prop[name])?wrap(name,prop[name]):prop[name];}
while(name=hidden[i++])
if(prop[name]!=base[name])
prototype[name]=typeof prop[name]==="function"&&typeof base[name]==="function"&&OVERRIDE.test(prop[name])?wrap(name,prop[name]):prop[name];function Class(){if(!INITIALIZING&&this.constructor){this.constructor.apply(this,arguments);}}
Class.prototype=prototype;Class.constructor=Class;Class.define=arguments.callee;Class.extend=Class.define;return Class;};var SLICE=Array.prototype.slice,TRUE=true,FALSE=false,WIN=window,FILTER=/^(?:scope|delay|buffer|single)$/,EACH=S.each;TARGETED=function(f,o,scope){return function(){if(o.target===arguments[0]){f.apply(scope,SLICE.call(arguments,0));}};},BUFFERED=function(f,o,l,scope){l.task=new S.Utility.Deferred();return function(){l.task.delay(o.buffer,f,scope,SLICE.call(arguments,0));};},SINGLE=function(f,ev,fn,scope){return function(){ev.removeListener(fn,scope);return f.apply(scope,arguments);};},DELAYED=function(f,o,l,scope){return function(){var task=new S.Utility.Deferred();if(!l.tasks){l.tasks=[];}
l.tasks.push(task);task.delay(o.delay||10,f,scope,SLICE.call(arguments,0));};};S.namespace('Utility');S.Utility.Event=Sage.Class.define({constructor:function(obj,name){this.name=name;this.obj=obj;this.listeners=[];},addListener:function(fn,scope,options){var that=this,l;scope=scope||that.obj;if(!that.isListening(fn,scope)){l=that.createListener(fn,scope,options);if(that.firing){that.listeners=that.listeners.slice(0);}
that.listeners.push(l);}},createListener:function(fn,scope,o){o=o||{};scope=scope||this.obj;var l={fn:fn,scope:scope,options:o},h=fn;if(o.target){h=TARGETED(h,o,scope);}
if(o.delay){h=DELAYED(h,o,l,scope);}
if(o.single){h=SINGLE(h,this,fn,scope);}
if(o.buffer){h=BUFFERED(h,o,l,scope);}
l.fireFn=h;return l;},findListener:function(fn,scope){var list=this.listeners,i=list.length,l;scope=scope||this.obj;while(i--){l=list[i];if(l){if(l.fn===fn&&l.scope===scope){return i;}}}
return-1;},isListening:function(fn,scope){return this.findListener(fn,scope)!==-1;},removeListener:function(fn,scope){var that=this,index,l,k,result=FALSE;if((index=that.findListener(fn,scope))!==-1){if(that.firing){that.listeners=that.listeners.slice(0);}
l=that.listeners[index];if(l.task){l.task.cancel();delete l.task;}
k=l.tasks&&l.tasks.length;if(k){while(k--){l.tasks[k].cancel();}
delete l.tasks;}
that.listeners.splice(index,1);result=TRUE;}
return result;},clearListeners:function(){var that=this,l=that.listeners,i=l.length;while(i--){that.removeListener(l[i].fn,l[i].scope);}},fire:function(){var that=this,listeners=that.listeners,len=listeners.length,i=0,l,args;if(len>0){that.firing=TRUE;args=SLICE.call(arguments,0);for(;i<len;i++){l=listeners[i];if(l&&l.fireFn.apply(l.scope||that.obj||WIN,args)===FALSE){return(that.firing=FALSE);}}}
that.firing=FALSE;return TRUE;}});S.Evented=S.Class.define({constructor:function(config){var that=this,e=that.events;if(config&&config.listeners){that.addListener(config.listeners);}
that.events=e||{};},fireEvent:function(){var that=this,args=SLICE.call(arguments,0),eventName=args[0].toLowerCase(),result=TRUE,current=this.events[eventName],b,c,q=that.eventQueue||[];if(that.eventsSuspended===TRUE){q.push(args);}
if(typeof current==='object'){if(current.bubble){if(current.fire.apply(current,args.slice(1))===FALSE){return FALSE;}
b=that.getBubbleTarget&&that.getBubbleTarget();if(b&&b.enableBubble){c=b.events[eventName];if(!c||typeof c!=='object'||!c.bubble){b.enableBubble(eventName);}
return b.fireEvent.apply(b,args);}}else{args.shift();result=current.fire.apply(current,args);}}
return result;},addListener:function(eventName,fn,scope,o){var that=this,e,oe,ce;if(typeof eventName==='object'){o=eventName;for(e in o){oe=o[e];if(!FILTER.test(e)){that.addListener(e,oe.fn||oe,oe.scope||o.scope,oe.fn?oe:o);}}}else{eventName=eventName.toLowerCase();ce=that.events[eventName]||TRUE;if(typeof ce==='boolean'){that.events[eventName]=ce=new S.Utility.Event(that,eventName);}
ce.addListener(fn,scope,typeof o==='object'?o:{});}},removeListener:function(eventName,fn,scope){var ce=this.events[eventName.toLowerCase()];if(typeof ce==='object'){ce.removeListener(fn,scope);}},purgeListeners:function(){var events=this.events,evt,key;for(key in events){evt=events[key];if(typeof evt==='object'){evt.clearListeners();}}},addEvents:function(o){var that=this,arg,i;that.events=that.events||{};if(typeof o==='string'){arg=arguments;i=arg.length;while(i--){that.events[arg[i]]=that.events[arg[i]]||TRUE;}}else{Sage.apply(that.events,o);}},hasListener:function(eventName){var e=this.events[eventName.toLowerCase()];return typeof e==='object'&&e.listeners.length>0;},suspendEvents:function(queueSuspended){this.eventsSuspended=TRUE;if(queueSuspended&&!this.eventQueue){this.eventQueue=[];}},resumeEvents:function(){var that=this,queued=that.eventQueue||[];that.eventsSuspended=FALSE;delete that.eventQueue;EACH(queued,function(e){that.fireEvent.apply(that,e);});}});S.Evented.prototype.on=S.Evented.prototype.addListener;S.Evented.prototype.un=S.Evented.prototype.removeListener;S.isArray=function(arr){return Object.prototype.toString.call(arr)==="[object Array]";};}(Sage));Sage.ServiceContainer=function(){_services=[];};Sage.ServiceContainer.prototype={addService:function(name,service){if(name&&service){if(!this.hasService(name)){var innerService={};innerService.key=name;innerService.service=service;_services.push(innerService);return service;}
else{throw"Service already exists: "+name;}}},removeService:function(name){for(i=0;i<_services.length;i++){if(_services[i].key===name){_services.splice(i,1);}}},getService:function(name){if(name){for(i=0;i<_services.length;i++){if(_services[i].key===name)
return _services[i].service;}}
return null;},hasService:function(name){if(name){for(i=0;i<_services.length;i++){if(_services[i].key===name)
return true;}}
return false;}}
Sage.Services=new Sage.ServiceContainer();