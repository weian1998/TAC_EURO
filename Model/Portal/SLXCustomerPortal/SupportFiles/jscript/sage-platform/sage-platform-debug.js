/*
 * SagePlatform
 * Copyright(c) 2009, Sage Software.
 */


window.Sage = window.Sage || {};
window.Sage.__namespace = true; //allows child namespaces to be registered via Type.registerNamespace(...)

Sage.apply = function(a, b, c) {
    var n,o;
    if (a && c) {for(n in c) {a[n] = c[n];}}
    if (a && b) {for(o in b) {a[o] = b[o];}}
    return a;
};

Sage.count = 1;
 //so that dynamically generated elements can get a 
 //unique number appended to their name, ie 'wgt1', 'wgt2'...
 //@param str a string passed in to which a number will be appended
Sage.guid = function(str) {
    return this.stringBuild(str, this.count++);
};

// <n> number of string arguments pushed into
// an array and returned joined with no delimiting.
Sage.stringBuild = function() {
    return Array.prototype.slice.call(arguments, 0).join('');
};


 
Sage.ns = Sage.namespace = function(ns) {
    if (!ns || !ns.length) {
        return null;
    }

    var levels = ns.split(".");
    var nsobj = Sage;

    // Sage is implied, so it is ignored if it is included
    for (var i=(levels[0] == "Sage") ? 1 : 0; i<levels.length; ++i) {
        nsobj[levels[i]] = nsobj[levels[i]] || {};
        nsobj = nsobj[levels[i]];
    }

    return nsobj;
};


Sage.createNamespace = function(ns) {
    if (!ns || !ns.length) {
        return null;
    }

    var levels = ns.split(".");
    window[levels[0]] = window[levels[0]] || {};
    var nsobj = window[levels[0]];

    // Sage is implied, so it is ignored if it is included
    for (var i=1; i<levels.length; ++i) {
        nsobj[levels[i]] = nsobj[levels[i]] || {};
        nsobj = nsobj[levels[i]];
    }

    return nsobj;
};

Sage.extend = function(subclass, superclass) {
    var f = function() {};
    f.prototype = superclass.prototype;
    subclass.prototype = new f();
    subclass.prototype.constructor = subclass;
    subclass.superclass = superclass.prototype;
    if (superclass.prototype.constructor == Object.prototype.constructor) {
        superclass.prototype.constructor = superclass;
    }
};

(function(S) {
    var INITIALIZING = false,
    OVERRIDE = /xyz/.test(function(){xyz;}) ? /\bbase\b/ : /.*/;
    // The base Class placeholder
    S.Class = function(){};
    // Create a new Class that inherits from this class
    S.Class.define = function(prop) {
        var base = this.prototype;
        // Instantiate a base class (but only create the instance)
        INITIALIZING = true;
        var prototype = new this();
        INITIALIZING = false;

        var wrap = function(name, fn) {
            return function() {
                var tmp = this.base;
                // Add a new .base() method that is the same method
                // but on the base class
                this.base = base[name];
                // The method only need to be bound temporarily, so we
                // remove it when we're done executing
                var ret = fn.apply(this, arguments);
                this.base = tmp;
                return ret;
            };
        };

        // Copy the properties over onto the new prototype
        var hidden = ['constructor'],
            i = 0,
            name;

        for (name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === "function" &&
            typeof base[name] === "function" &&
            OVERRIDE.test(prop[name]) ? wrap(name, prop[name]) : prop[name];
        }

        while (name = hidden[i++])
            if (prop[name] != base[name])
                prototype[name] = typeof prop[name] === "function" &&
                    typeof base[name] === "function" &&
                    OVERRIDE.test(prop[name]) ? wrap(name, prop[name]) : prop[name];

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the initialize method
            if ( !INITIALIZING && this.constructor ) {
                this.constructor.apply(this, arguments);
            }
        }
        // Populate the constructed prototype object
        Class.prototype = prototype;
        // Enforce the constructor to be what we expect
        Class.constructor = Class;
        // And make this class 'define-able'
        Class.define = arguments.callee;
        Class.extend = Class.define; // sounds better for inherited classes
        return Class;
    };
        
    var SLICE = Array.prototype.slice,
        TRUE = true, FALSE = false,
        //WIN = S.config.win,
        WIN = window,
        FILTER = /^(?:scope|delay|buffer|single)$/,
        EACH = S.each;
        TARGETED = function(f,o,scope) {
            return function() {
                if(o.target === arguments[0]){
                    f.apply(scope, SLICE.call(arguments, 0));
                }
            };
        },
        BUFFERED = function(f,o,l,scope) {
            l.task = new S.Utility.Deferred();
            return function(){
                l.task.delay(o.buffer, f, scope, SLICE.call(arguments, 0));
            };
        },
        SINGLE = function(f,ev,fn,scope) {
            return function(){
                ev.removeListener(fn, scope);
                return f.apply(scope, arguments);
            };
        },
        DELAYED = function(f,o,l,scope) {
            return function() {
                var task = new S.Utility.Deferred();
                if(!l.tasks) {
                    l.tasks = [];
                }
                l.tasks.push(task);
                task.delay(o.delay || 10, f, scope, SLICE.call(arguments, 0));
            };
        };        
        
        
        
        
        
    // place the Event class in Utility
    S.namespace('Utility');
    
    S.Utility.Event = Sage.Class.define({
        constructor: function(obj, name) {
            this.name = name;
            this.obj = obj;
            this.listeners = [];
        },
        addListener: function(fn, scope, options){
            var that = this,l;
            scope = scope || that.obj;
            if(!that.isListening(fn, scope)) {
                l = that.createListener(fn, scope, options);
                if(that.firing) {
                    that.listeners = that.listeners.slice(0);
                }
                that.listeners.push(l);
            }
        },
        createListener: function(fn, scope, o) {
            o = o || {}; 
            scope = scope || this.obj;
            var l = {
                fn: fn,
                scope: scope,
                options: o
            }, h = fn;
            if(o.target){
                h = TARGETED(h, o, scope);
            }
            if(o.delay){
                h = DELAYED(h, o, l, scope);
            }
            if(o.single){
                h = SINGLE(h, this, fn, scope);
            }
            if(o.buffer){
                h = BUFFERED(h, o, l, scope);
            }
            l.fireFn = h;
            return l;
        },
        findListener: function(fn, scope){
            var list = this.listeners,
            i = list.length,l;
            scope = scope || this.obj;
            while(i--) {
                l = list[i];
                if(l) {
                    if(l.fn === fn && l.scope === scope){
                        return i;
                    }
                }
            }
            return -1;
        },
        isListening: function(fn, scope){
            return this.findListener(fn, scope) !== -1;
        },
        removeListener: function(fn, scope){
            var that = this, index, l, k,
            result = FALSE;
            if((index = that.findListener(fn, scope)) !== -1) {
                if (that.firing) {
                    that.listeners = that.listeners.slice(0);
                }
                l = that.listeners[index];
                if(l.task) {
                    l.task.cancel();
                    delete l.task;
                }
                k = l.tasks && l.tasks.length;
                if(k) {
                    while(k--) {
                        l.tasks[k].cancel();
                    }
                    delete l.tasks;
                }
                that.listeners.splice(index, 1);
                result = TRUE;
            }
            return result;
        },
        // Iterate to stop any buffered/delayed events
        clearListeners: function() {
            var that = this,
            l = that.listeners,
            i = l.length;
            while(i--) {
                that.removeListener(l[i].fn, l[i].scope);
            }
        },
        fire: function(){
            var that = this,
            listeners = that.listeners,
            len = listeners.length,
            i = 0, l, args;
            if(len > 0) {
                that.firing = TRUE;
                args = SLICE.call(arguments, 0);
                for (; i < len; i++) {
                    l = listeners[i];
                    if(l && l.fireFn.apply(l.scope || that.obj || 
                        WIN, args) === FALSE) {
                        return (that.firing = FALSE);
                    }
                }
            }
            that.firing = FALSE;
            return TRUE;
        }
    }); // end S.Event class   
     
    S.Evented = S.Class.define({
        constructor: function(config) {
            var that = this,
            e = that.events;
            if(config && config.listeners) {
                that.addListener(config.listeners);
            }
            that.events = e || {};
        },
        fireEvent: function() {
            var that = this,
            args = SLICE.call(arguments, 0),
            eventName = args[0].toLowerCase(),
            result = TRUE,
            current = this.events[eventName],
            b,c,
            q = that.eventQueue || [];
            // TODO: evaluate use of deferring events
            if (that.eventsSuspended === TRUE) {
                q.push(args);
            }
            if (typeof current === 'object') {
                if(current.bubble) {
                    if(current.fire.apply(current, args.slice(1)) === FALSE) {
                        return FALSE;
                    }
                    b = that.getBubbleTarget && that.getBubbleTarget();
                    if(b && b.enableBubble) {
                        c = b.events[eventName];
                        if(!c || typeof c !== 'object' || !c.bubble) {
                            b.enableBubble(eventName);
                        }
                        return b.fireEvent.apply(b, args);
                    }
                } else {
                    // remove the event name
                    args.shift();
                    result = current.fire.apply(current, args);
                }
            }
            return result;
        },
        addListener : function(eventName, fn, scope, o){
            var that = this, e, oe, ce;
            if (typeof eventName === 'object') {
                o = eventName;
                for (e in o){
                    oe = o[e];
                    if (!FILTER.test(e)) {
                        that.addListener(e, oe.fn || oe, oe.scope ||
                            o.scope, oe.fn ? oe : o);
                    }
                }
            } else {
                eventName = eventName.toLowerCase();
                ce = that.events[eventName] || TRUE;
                if (typeof ce === 'boolean') {
                    that.events[eventName] = ce = new S.Utility.Event(that, eventName);
                }
                ce.addListener(fn, scope, typeof o === 'object' ? o : {});
            }
        },
        removeListener : function(eventName, fn, scope) {
            var ce = this.events[eventName.toLowerCase()];
            if (typeof ce === 'object') {
                ce.removeListener(fn, scope);
            }
        },
        purgeListeners : function(){
            var events = this.events,evt,key;
            for(key in events) {
                evt = events[key];
                if(typeof evt === 'object') {
                    evt.clearListeners();
                }
            }
        },
        addEvents : function(o){
            var that = this, arg, i;
            that.events = that.events || {};
            if (typeof o === 'string') {
                arg = arguments;
                i = arg.length;
                while(i--) {
                    that.events[arg[i]] = that.events[arg[i]] || TRUE;
                }
            } else {
                Sage.apply(that.events, o);
            }
        },
        hasListener : function(eventName){
            var e = this.events[eventName.toLowerCase()];
            return typeof e === 'object' && e.listeners.length > 0;
        },
        suspendEvents : function(queueSuspended){
            this.eventsSuspended = TRUE;
            if(queueSuspended && !this.eventQueue){
                this.eventQueue = [];
            }
        },
        resumeEvents : function(){
            var that = this,
            queued = that.eventQueue || [];
            that.eventsSuspended = FALSE;
            delete that.eventQueue;
            // use jquery's each method
            EACH(queued, function(e) {
                that.fireEvent.apply(that, e);
            });
        }
    }); //end S.Evented

    S.Evented.prototype.on = S.Evented.prototype.addListener;
    S.Evented.prototype.un = S.Evented.prototype.removeListener; 
    
    S.isArray = function(arr) {
        return Object.prototype.toString.call(arr) === "[object Array]";
    };
}(Sage));

Sage.ServiceContainer = function(){
    _services = [];
};
Sage.ServiceContainer.prototype = {
    addService: function(name, service){
        if(name && service){
            if(!this.hasService(name)){
                var innerService = {};
                innerService.key = name;
                innerService.service = service;
                _services.push(innerService);
                return service;
            }
            else{
                throw "Service already exists: " + name;
            }
        }
    },
    removeService: function(name){
        for(i=0;i<_services.length;i++){
            if(_services[i].key === name){
                _services.splice(i, 1);
            }
        }
    },
    getService: function(name){
        if(name){
            for(i=0;i<_services.length;i++){
                if(_services[i].key === name)
                    return _services[i].service;
            }
        }
        return null;
    },
    hasService: function(name){
        if(name){
            for(i=0;i<_services.length;i++){
                if(_services[i].key === name)
                    return true;
            }
        }
        return false;
    }
}

Sage.Services = new Sage.ServiceContainer();
// Copyright 2007, Google Inc.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//  3. Neither the name of Google Inc. nor the names of its contributors may be
//     used to endorse or promote products derived from this software without
//     specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Sets up google.gears.*, which is *the only* supported way to access Gears.
//
// Circumvent this file at your own risk!
//
// In the future, Gears may automatically define google.gears.* without this
// file. Gears may use these objects to transparently fix bugs and compatibility
// issues. Applications that use the code below will continue to work seamlessly
// when that happens.

if (!window.Sage) {
    Sage = {};
}
Sage.OnGearsInitialized = [];
Sage.installDesktopFeatures = function() {
    top.location = "Libraries/DesktopIntegration/SlxDesktopIntegrationSetup.exe";
}
//(function() {
function initGears() {
  // We are already defined. Hooray!
  if (window.Sage && Sage.gears) {
    return;
  }

  var factory = null;

  // Firefox
  if (typeof SageGearsFactory != 'undefined') {
    factory = new SageGearsFactory();
  } else {
    // IE
    try {
      factory = new ActiveXObject('SageGears.Factory');
      // privateSetGlobalObject is only required and supported on IE Mobile on
      // WinCE.
      if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
        factory.privateSetGlobalObject(this);
      }
    } catch (e) {
      // Safari
      if ((typeof navigator.mimeTypes != 'undefined')
           && navigator.mimeTypes["application/x-googlegears"]) {
        factory = document.createElement("object");
        factory.style.display = "none";
        factory.width = 0;
        factory.height = 0;
        factory.type = "application/x-googlegears";
        document.documentElement.appendChild(factory);
        if(factory && (typeof factory.create == 'undefined')) {
          // If NP_Initialize() returns an error, factory will still be created.
          // We need to make sure this case doesn't cause Gears to appear to
          // have been initialized.
          factory = null;
        }
      }
    }
  }

  // !Do not! define any objects if Gears is not installed. This mimics the
  // behavior of Gears defining the objects in the future.
  if (!factory) {
    return;
  }

  // Now set up the objects, being careful not to overwrite anything.
  //
  // Note: In Internet Explorer for Windows Mobile, you can't add properties to
  // the window object. However, global objects are automatically added as
  // properties of the window object in all browsers.


  if (!Sage.gears) {
    Sage.gears = {factory: factory};
    if (Sage.OnGearsInitialized) {
        for (var i = 0; i < Sage.OnGearsInitialized.length; i++) {
            Sage.OnGearsInitialized[i]();
        }
    }
  }
}//)();

// class used for watching bound data fields and notifying the user that they have dirty data
ClientBindingManagerService = function () {
    this._WatchChanges = true;
    this._PageExitWarningMessage = "";
    this._ShowWarningOnPageExit = false;
    this._SkipCheck = false;
    //this flag tracks the dirty status of controls that were databound on the server
    this._CurrentEntityIsDirty = false;
    this._SaveBtnID = "";
    this._MsgDisplayID = "";
    this._entityTransactionID = "";
    this._IgnoreDirtyFlag = false;
    //this keeps track of any Ajax controls that also may have dirty data in them...
    this._DirtyAjaxItems = [];
    this._listeners = {};
    this._listeners[ClientBindingManagerService.ON_SAVE] = [];
    positionDirtyDataMessage();
};

ClientBindingManagerService.ON_SAVE = 'onsave';

$(document).ready(function() {
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(positionDirtyDataMessage);
});

function positionDirtyDataMessage() {
    if ($('#PageTitle').get().length > 0) {
        $('#PageTitle').after($('.dirtyDataMessage').replaceWith(''))
        $('.dirtyDataMessage').css('top', $('#PageTitle').position().top);
        $('.dirtyDataMessage').css('left', $('#PageTitle').outerWidth());
    }
}


ClientBindingManagerService.prototype.addListener = function (event, listener, scope) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push({ listener: listener, scope: scope });
};

ClientBindingManagerService.prototype.removeListener = function (event, listener) {
    this._listeners[event] = this._listeners[event] || [];
    for (var i = 0; i < this._listeners[event].length; i++)
        if (this._listeners[event][i].listener == listener)
            break;

    this._listeners[event].splice(i, 1);
};

ClientBindingManagerService.prototype.onSave = function () {
    for (var i = 0; i < this._listeners[ClientBindingManagerService.ON_SAVE].length; i++) {
        var fn = this._listeners[ClientBindingManagerService.ON_SAVE][i].listener;
        var scope = this._listeners[ClientBindingManagerService.ON_SAVE][i].scope || this;
        if (typeof fn === "function") {
            fn.call(scope);
        }
    }
}

ClientBindingManagerService.prototype.SetShowWarningOnPageExit = function(showMsg) {
    this._ShowWarningOnPageExit = (showMsg);
    if (this._ShowWarningOnPageExit) {
        window.onbeforeunload = this.onExit;
    }
};

ClientBindingManagerService.prototype.onExit = function(e) {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        if (mgr._ShowWarningOnPageExit) {
            if (mgr._SkipCheck) {
                //_SkipCheck = false;
                return;
            }
            var hdd = mgr.hasDirtyData();
            if (hdd && (mgr._IgnoreDirtyFlag == false)) {
                window.setTimeout(function() {
                    hideRequestIndicator(null, { });
                }, 1000);
                if (window.event) {
                    window.event.returnValue = mgr._PageExitWarningMessage;
                } else {
                    return mgr._PageExitWarningMessage;
                }
            }
        }
    }
    return;
};


ClientBindingManagerService.prototype.canChangeEntityContext = function() {
    if ((this._WatchChanges) && (this.hasDirtyData()) && (this._ShowWarningOnPageExit)) {
        if (confirm(this._PageExitWarningMessage)) {
            this.clearDirtyStatus();
            return true;
        } else {
            return false;
        }
    }
    return true;
};

ClientBindingManagerService.prototype.hasDirtyData = function () {
    return (this._CurrentEntityIsDirty || (this._DirtyAjaxItems && this._DirtyAjaxItems.length > 0));
}

ClientBindingManagerService.prototype.markDirty = function(e) {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        if (mgr._WatchChanges) {
            mgr._CurrentEntityIsDirty = true;
            positionDirtyDataMessage();
            if(mgr._IgnoreDirtyFlag == false){
              $("#" + mgr._MsgDisplayID).show();
            }
        }
    }
};

ClientBindingManagerService.prototype.addDirtyAjaxItem = function (itemId) {
    //make sure we don't already know about this one...
    var len = this._DirtyAjaxItems.length;
    for (var i = 0; i < len; i++) {
        if (this._DirtyAjaxItems[i] === itemId) {
            return;
        }
    }
    this._DirtyAjaxItems.push(itemId);
    //show the message without marking _CurrentEntityIsDirty so it can be tracked separately.
    if (this._WatchChanges) {
        positionDirtyDataMessage();
        if (this._IgnoreDirtyFlag == false) {
            $("#" + this._MsgDisplayID).show();
        }
    }
}

ClientBindingManagerService.prototype.clearDirtyAjaxItem = function (itemId) {
    var len = this._DirtyAjaxItems.length;
    for (var i = 0; i < len; i++) {
        if (this._DirtyAjaxItems[i] === itemId) {
            this._DirtyAjaxItems.splice(i, 1);
            //return;
        }
    }
    if (!this.hasDirtyData()) {
        $("#" + this._MsgDisplayID).hide();
    }
}

ClientBindingManagerService.prototype.clearDirtyStatus = function() {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        mgr._CurrentEntityIsDirty = false;
        $("#" + mgr._MsgDisplayID).hide();
    }
};

function notifyIsSaving() {
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(handleEndSaveRequest);
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        mgr.clearDirtyStatus();
        mgr.onSave();
    }
};

function handleEndSaveRequest(sender, args) {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        if (!args.get_error()) {
            mgr.clearDirtyStatus();
        } else {
            mgr.markDirty();
        }
        Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(handleEndSaveRequest);
    }
};

ClientBindingManagerService.prototype.saveForm = function() {
    var btn = $get(this._SaveBtnID);
    if (btn) {
        if ((btn.tagName.toLowerCase() == "input") && (btn.type == "image")) {
            notifyIsSaving();
            Sys.WebForms.PageRequestManager.getInstance()._doPostBack(btn.name, null);
        } else if (btn.onClick) {
            notifyIsSaving();
            btn.onClick();
        }
    }
};

ClientBindingManagerService.prototype.registerResetBtn = function(elemID) {
    if (elemID) {
        var btn = $get(elemID);
        if (btn) {
            $addHandler(btn, "click", this.resetCurrentEntity);
        }
    }
};

ClientBindingManagerService.prototype.registerSaveBtn = function(elemID) {
    if (elemID) {
        var btn = $get(elemID);
        if (btn) {
            $addHandler(btn, "click", notifyIsSaving);
            if (this._SaveBtnID == "") {
                this._SaveBtnID = elemID;
            }
        }
    }
};

ClientBindingManagerService.prototype.registerDialogCancelBtn = function(elemID) {
    if (elemID) {
        var btn = $get(elemID);
        if (btn) {
            $addHandler(btn, "click", this.rollbackCurrentTransaction);
        }
    }
};

ClientBindingManagerService.prototype.registerBoundControls = function(controlList) {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        if ((mgr._WatchChanges) && (controlList)) {
            var ctrlIDs = controlList.split(",");
            var elem;
            for (var i = 0; i < ctrlIDs.length; i++) {
                elem = $get(ctrlIDs[i]);
                if (elem) {
                    // check here for attribute saying it is a container - if it is, recurse children looking for the correct one(s)...
                    if (elem.attributes["slxcompositecontrol"]) {
                        mgr.findChildControls(elem);
                    } else {
                        mgr.attachChangeHandler(elem);
                    }
                    //if (mgr._ShowWarningOnPageExit) {
                    //    mgr.registerPostBackWarningExceptions(elem);  //if this is a control that contains a link we want to allow it to do its thing without prompting the user
                    //}
                }
            }
        }
        mgr.findWarningExceptions();
    }
};

ClientBindingManagerService.prototype.findChildControls = function(elem) {
    if ((elem) && (elem.attributes) && (elem.attributes["slxchangehook"]) && (!elem.attributes["slxcompositecontrol"])) {
        //alert("found a changehook: \nID: " + elem.id + "\nname: " + elem.name + "\nelem: " + elem);
        this.attachChangeHandler(elem);
    } else {
        if (elem.childNodes) {
            for (var n = 0; n < elem.childNodes.length; n++) {
                this.findChildControls(elem.childNodes[n]);
            }
        }
    }
};

ClientBindingManagerService.prototype.setControlFocus = function(ctrlid) {
    trySelect = function(elem) {
        if ((typeof (elem.select) == "function") || (typeof (elem.select) == "object")) {
            elem.select();
            return true;
        }
        return false;
    };
    var elem = $("#" + ctrlid)[0];
    if (elem) {
        if (trySelect(elem)) { return; }
        elem = $("#" + ctrlid + " TEXTAREA")[0];
        if ((elem) && (trySelect(elem))) { return; }
        elem = $("#" + ctrlid + " INPUT")[0];
        if ((elem) && (trySelect(elem))) { return; }
        elem = $("#" + ctrlid + " SELECT")[0];
        if ((elem) && (trySelect(elem))) { return; }
    }
};

ClientBindingManagerService.prototype.attachChangeHandler = function(elem) {
    if (elem) {
        if ((elem.tagName == "A") || ((elem.tagName == "INPUT") && ((elem.type == "button") || (elem.type == "image") || (elem.type == "submit")))) {
            this.registerChildPostBackWarningExceptions(elem);
        } else {
            try { $removeHandler(elem, "change", this.markDirty); } catch (e) { }
            $addHandler(elem, "change", this.markDirty);
        }
    }
};

ClientBindingManagerService.prototype.registerPostBackWarningExceptions = function(elem) {
    if (elem) {
        elems = $("a,input[type='INPUT'],input[type='BUTTON'],input[type='IMAGE'],input[type='SUBMIT']", elem).get();
        for(var i = 0; i < elems.length; i++) {
            this.registerChildPostBackWarningExceptions(elems[i]);
        }
    }
}
ClientBindingManagerService.prototype.findWarningExceptions = function() {
    var elems = $("span[slxcompositecontrol], div[slxcompositecontrol]").get();
    for(var i = 0; i < elems.length; i++) {
        this.registerPostBackWarningExceptions(elems[i]);
    }
}

ClientBindingManagerService.prototype.registerChildPostBackWarningExceptions = function(elem) {
    if (elem) {
        if ($(elem).hasClass("leavesPage")) {
            return;
        }
        if ((elem.tagName == "A") || ((elem.tagName == "INPUT") && ((elem.type == "button") || (elem.type == "image") || (elem.type == "submit")))) {
            try { $removeHandler(elem, "click", this.skipWarning); } catch (e) { }
            $addHandler(elem, "click", this.skipWarning);
        }
    }
};

ClientBindingManagerService.prototype.turnOffWarnings = function() {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        mgr._SkipCheck = true;
        var x = window.setTimeout(function() {var mgr = Sage.Services.getService("ClientBindingManagerService"); if (mgr) { mgr._SkipCheck = true }}, 500);  //just in case there is a timer waiting to turn it back on
    }
};

ClientBindingManagerService.prototype.resumeWarning = function() {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        mgr._SkipCheck = false;
    }
};

ClientBindingManagerService.prototype.skipWarning = function() {
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        mgr._SkipCheck = true;
        var x = window.setTimeout(function() {var mgr = Sage.Services.getService("ClientBindingManagerService"); if (mgr) { mgr._SkipCheck = false }}, 500);
    }
};

ClientBindingManagerService.prototype.resetCurrentEntity = function() {
    doFormReset();
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        var contextservice = Sage.Services.getService("ClientContextService");
        if (contextservice) {
            if (contextservice.containsKey("ResetCurrentEntity")) {
                contextservice.setValue("ResetCurrentEntity", "true");
            } else {
                contextservice.add("ResetCurrentEntity", "true");
            }
        }
        mgr.clearDirtyStatus();
    }
};

ClientBindingManagerService.prototype.rollbackCurrentTransaction = function() {
    doSectionReset("dialog");
    var mgr = Sage.Services.getService("ClientBindingManagerService");
    if (mgr) {
        //alert("rolling back current transaction... " + mgr._entityTransactionID);
        var contextservice = Sage.Services.getService("ClientContextService");
        if (contextservice) {
            if (contextservice.containsKey("RollbackEntityTransaction")) {
                contextservice.setValue("RollbackEntityTransaction", mgr._entityTransactionID);
            } else {
                contextservice.add("RollbackEntityTransaction", mgr._entityTransactionID);
            }
        }
    }
};

function doFormReset() {
    if (document.all) {
        doSectionReset("main");
        doSectionReset("tabs");
        doSectionReset("dialog");
    } else {
        document.forms[0].reset();
    }
};

function doSectionReset(sectionId) {
    function getElements(sectionId, tagName) {
        if ((sectionId == "main") && (document.all.MainContent)) {
            return document.all.MainContent.getElementsByTagName(tagName);
        } else if ((sectionId == "tabs") && (document.all.ctl00_TabControl)) {
            return document.all.ctl00_TabControl.getElementsByTagName(tagName);
        } else if (document.all.ctl00_DialogWorkspace) {
            return document.all.ctl00_DialogWorkspace.getElementsByTagName(tagName);
        } 
        return new Array();
    }
    if (document.all) {
        var elem;
        var elems = getElements(sectionId, "INPUT");
        for (var i = 0; i < elems.length; i++) {
            elem = elems[i];
            if ((elem.type == "checkbox") || (elem.type == "radio")) {
                if (elem.checked != elem.defaultChecked) {
                    elem.checked = elem.defaultChecked;
                }
            } else {
                if (elem.value != elem.defaultValue) {
                    elem.value = elem.defaultValue;
                }
            }
        }
        elems = getElements(sectionId, "TEXTAREA");
        for (var i = 0; i < elems.length; i++) {
            elem = elems[i];
            if (elem.value != elem.defaultValue) {
                elem.value = elem.defaultValue;
            }
        }
        elems = getElements(sectionId, "SELECT");
        for (var i = 0; i < elems.length; i++) {
            elem = elems[i];
            for (var k = 0; k < elem.options.length; k++) {
                elem.options[k].selected = elem.options[k].defaultSelected;
            }
        }
    } else {
        document.forms[0].reset();
    }
};

//var mgr = Sage.Services.getService("ClientBindingManagerService");
//if (mgr) { mgr.rollbackCurrentTransaction(); }

ClientBindingManagerService.prototype.setCurrentTransaction = function(transaction) {
    this._entityTransactionID = transaction;
};

function clearReset() {
    //alert("clearing reset");
    if (Sage.Services) {
        var contextservice = Sage.Services.getService("ClientContextService");
        if (contextservice) {
            if (contextservice.containsKey("ResetCurrentEntity")) {
                contextservice.remove("ResetCurrentEntity");
            }
            if (contextservice.containsKey("RollbackEntityTransaction")) {
                contextservice.remove("RollbackEntityTransaction");
                //alert(contextservice.containsKey("RollbackEntityTransaction"));
            }
        }
    }
};

Sage.Services.addService("ClientBindingManagerService", new ClientBindingManagerService());

Sage.ClientContextService = function(contextDataFieldId){
    this.contextDataFieldId = contextDataFieldId;
    _items = [];
    _watches = [];
    
    //Internal Helper Methods
    _toItemLiteral = function(key, value){
        var newItem = {};
        newItem.itemKey = key;
        newItem.itemVal = value;
        return newItem;
    };
    _indexOf = function(key){
        for(i=0;i<_items.length;i++){
            if(_items[i].itemKey == key){
                return i;
            }
        }
        return -1;
    };
    _indexOfNoCase = function(key) {
        for (i = 0; i < _items.length; i++) {
            if (_items[i].itemKey.toUpperCase() == key.toUpperCase()) {
                return i;
            }
        }
        return -1;
    };    
    
    _throwKeyNotFound = function(key){
        throw "Entry Not Found: " + key;
    };
    _throwDuplicateKey = function(key){
        throw "Entry Already Exists: " + key;
    }
    this.load();
}
Sage.ClientContextService.prototype = {
    add: function(key, value) {
        if (_indexOf(key) === -1) {
            var lit = _toItemLiteral(key, value);
            _items.push(lit);
            this.save();
        }
        else
            _throwDuplicateKey(key);
    },
    remove: function(key) {
        var index = _indexOf(key);
        if (index !== -1) {
            _items.splice(index, 1);
            this.save();
        }
    },
    setValue: function(key, value) {
        var index = _indexOf(key);
        if (index !== -1) {
            _items[index].itemVal = value;
            this.save();
        }
        else {
            _throwKeyNotFound(key);
        }
    },
    getValue: function(key) {
        var index = _indexOf(key);
        //alert(index);
        if (index !== -1) {
            return _items[index].itemVal;
        }
        else {
            _throwKeyNotFound(key);
        }
    },
    getValueEx: function(key, nocase) {
        var index;
        if (nocase)
            index = _indexOfNoCase(key);
        else
            index = _indexOf(key);
        //alert(index);
        if (index !== -1) {
            return _items[index].itemVal;
        }
        else {
            _throwKeyNotFound(key);
        }
    },
    clear: function() {
        _items = [];
        this.save();
    },
    containsKey: function(key) {
        return (_indexOf(key) !== -1);
    },
    containsKeyEx: function(key, nocase) {
        if (nocase)
            return (_indexOfNoCase(key) !== -1);
        else
            return (_indexOf(key) !== -1);
    },
    getCount: function() {
        return _items.length;
    },
    hasKeys: function() {
        return _items.length === 0;
    },
    getKeys: function() {
        var keyRes = [];
        for (i = 0; i < _items.length; i++) {
            keyRes.push(_items[i].itemKey);
        }
        return keyRes;
    },
    valueAt: function(index) {
        if (_items[index]) {
            return _items[index].itemVal;
        }
        else {
            return null;
        }
    },
    keyAt: function(index) {
        this.load();
        if (_items[index])
            return _items[index].itemKey;
        else
            return null;
    },
    getValues: function() {
        var valRes = [];
        for (i = 0; i < _items.length; i++) {
            valRes.push(_items[i].itemVal);
        }
        return valRes;
    },
    save: function(hours) {
        var data = document.getElementById(this.contextDataFieldId);
        if (data) {
            //alert("saving to: " + data.id);
            data.value = this.toString();
        }
        else {
            alert("can't find context data field");
        }
    },
    updateFromServer: function (newContext) {
        if (newContext) {
            this.fromString(newContext);
        }
    },
    load: function() {
        var data = document.getElementById(this.contextDataFieldId);
        if (data) {
            if (data.value) {
                //alert("loading from: " + data.id);
                this.fromString(data.value);
            }
        }
        else {
            alert("can't find context data field");
        }
    },
    toString: function() {
        var str = "";
        for (i = 0; i < _items.length; i++) {
            str += _items[i].itemKey + "=" + escape(_items[i].itemVal);
            if (i !== _items.length - 1)
                str += "&";
        }
        return str;
    },
    fromString: function(qString) {
        _items = [];
        if (qString != "") {
            var items = qString.split("&");
            for (i = 0; i < items.length; i++) {
                var pair = items[i].split("=");
                _items.push(_toItemLiteral(pair[0], unescape(pair[1])));
            }
        }
        this.save();
    }
}

//Sage.Services.addService("ClientContextService", new Sage.ClientContextService());


Sage.ClientEntityContextService = function () {
    this.emptyContext = { "EntityId": "", "EntityType": "", "Description": "", "EntityTableName": "" };
    this._context = false;
    this.hasClearListener = false;
}

Sage.ClientEntityContextService.prototype.getContext = function () {
    if ((Sage.Data) && (Sage.Data.EntityContextStore)) {
        return Sage.Data.EntityContextStore;
    }
    return this.emptyContext;
}

Sage.ClientEntityContextService.prototype.setContext = function (obj) {
    if (typeof dojo !== 'undefined') {
        Sage.Data.EntityContextStore = dojo.mixin(this.emptyContext, obj);
    } else {
        Sage.Data.EntityContextStore.EntityId = obj.EntityId || '';
        Sage.Data.EntityContextStore.EntityType = obj.EntityType || '';
        Sage.Data.EntityContextStore.Description = obj.Description || '';
        Sage.Data.EntityContextStore.EntityTableName = obj.EntityTableName || '';
    }
}

//function setCurentEntityContext(entityid, previousEntityid, clientPosition) {
Sage.ClientEntityContextService.prototype.navigateSLXGroupEntity = function (toEntityId, previousEntityid, clientPosition) {
    if (Sage.Services) {
        var mgr = Sage.Services.getService("ClientBindingManagerService");
        if ((mgr) && (!mgr.canChangeEntityContext())) { return false; }

        var contextservice = Sage.Services.getService("ClientContextService");
        if (contextservice.containsKey("ClientEntityId")) {
            contextservice.setValue("ClientEntityId", toEntityId);
        } else {
            contextservice.add("ClientEntityId", toEntityId);
        }
        previousEntityid = (previousEntityid) ? previousEntityid : Sage.Data.EntityContextStore.EntityId;
        if (contextservice.containsKey("PreviousEntityId")) {
            contextservice.setValue("PreviousEntityId", previousEntityid);
        } else {
            contextservice.add("PreviousEntityId", previousEntityid);
        }
        if (clientPosition) {
            if (contextservice.containsKey("ClientEntityPosition")) {
                contextservice.setValue("ClientEntityPosition", clientPosition);
            } else {
                contextservice.add("ClientEntityPosition", clientPosition);
            }
        }
        //wire up cleanup service...
        if (!this.hasClearListener) {
            Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(function () {
                if (Sage.Services) {
                    var contextservice = Sage.Services.getService("ClientContextService");
                    if (contextservice.containsKey("PreviousEntityId")) {
                        contextservice.remove("PreviousEntityId");
                    }
                }
            });
            this.hasClearListener = true;
        }
        //set current state for things that load earlier in the response than the new full context.
        Sage.Data.EntityContextStore.EntityId = toEntityId;
        Sage.Data.EntityContextStore.Description = '';

    }
    if (window.TabControl) {
        var tState = TabControl.getState();
        if (tState) {
            tState.clearUpdatedTabs();
            TabControl.updateStateProxy();
        }
    }
    return true;
}

Sage.Services.addService("ClientEntityContext", new Sage.ClientEntityContextService());
Sage.WebClientMessageService = function(options) {
   
};

Sage.WebClientMessageService.prototype.hideClientMessage = function() {	
	Ext.Msg.hide();
};

Sage.WebClientMessageService.prototype.showClientMessage = function(title, msg, fn, scope) { 
	if (typeof title === "object")
	    return Ext.Msg.alert(title);	    	
	
	var o = {
	    title: (typeof msg === "string") ? title : Sage.WebClientMessageService.Resources.DefaultDialogMessageTitle,
	    msg: (typeof msg === "string") ? msg : title,
	    buttons: Ext.Msg.OK,
	    fn: fn,
	    scope: scope
	};
	
    Ext.Msg.show(o);
};

Sage.WebClientMessageService.prototype.showClientError = function (title, msg, fn, scope) {
    if (typeof title === "object")
        return Ext.Msg.alert(title);

    var o = {
        title: (typeof msg === "string") ? title : Sage.WebClientMessageService.Resources.DefaultDialogMessageTitle,
        msg: (typeof msg === "string") ? msg : title,
        buttons: Ext.Msg.OK,
        icon: Ext.MessageBox.ERROR,
        fn: fn,
        scope: scope
    };

    Ext.Msg.show(o);
};

Sage.Services.addService("WebClientMessageService", new Sage.WebClientMessageService());



function setupPortal() {
    Ext.get("MainWorkArea").setStyle("display", "none");
    slxDashboard = new Sage.SalesLogix.Dashboard(userDashboardOptions);
    slxDashboard.init();
};


if (typeof Sys !== "undefined") {
    Type.registerNamespace("Sage.SalesLogix");
}
else {
    Ext.namespace("Sage.SalesLogix");
}


Sage.SalesLogix.Dashboard = function(options) {
    this._options = options || { curportal: 0 };
    this._options.dirty = false;
    this._removed = {};
    this.defaultPageString = '{"?xml":{"@version":"1.0","@encoding":"utf-8"},"Dashboard":{"@title":"{0}","@name":"{0}","@family":"System","@isHidden":"false","style":null,"Columns":{"Column":[{"@width":0.49,"Widgets":{"Widget":[]}},{"@width":0.49,"Widgets":{"Widget":[]}}]}}}';
}

//Sage.SalesLogix.Dashboard.refreshWidget = function(name) {
//    var code = String.format("if (typeof {0} != 'undefined') {0}();", name + "_refresh");
//    eval(code);
//}
//Sage.SalesLogix.Dashboard.editWidget = function(name) {
//    var code = String.format("if (typeof {0} != 'undefined') {0}();", name + "_edit");
//    eval(code);
//}

Sage.SalesLogix.Dashboard.prototype.init = function () {
    var thisDashboard = this;
    var pages = new Array();
    var hiddenPages = new Array();
    for (var k = 0; k < DashboardPages.length; k++) {
        var pageObject = new Sage.SalesLogix.DashboardPage(DashboardPages[k], k, thisDashboard);
        pageObject.id = "portal_panel_" + k;
        pageObject.dashboardPagesIndex = k;
        if (pageObject.name === this._options.defpage) {
            this._options.curportal = k;
        }
        pages.push(pageObject);
        //if ($.inArray(pageObject.name, this._options.hiddenPages) > -1) {
        if (this._options.hiddenPages.indexOf(pageObject.name) > -1) {
            hiddenPages.push(pageObject.id);
        }
    }
    if (this._options.curportal > DashboardPages.length - 1) {
        this._options.curportal = 0;
    }
    var curDashboard = this;
    var centerpanel = mainViewport.findById("center_panel_center");
    var panel = this._tabPanel = new Ext.TabPanel({
        border: false,
        enableTabScroll: true,
        id: "dashboard_panel"
    });
    for (var i = 0; i < pages.length; i++) {
        try {
            pages[i].title = Sage.Analytics.localize(pages[i].title);
            panel.add(pages[i]);
        } catch (e) {
            if (window.console) {
                console.log("failed to load page " + i + " " + e);
            }
        }
    }
    panel.on("contextmenu", function (tabpanel, tab, e) {
        var portalNum = parseInt(tab.id.match(/\d+$/), 10);
        pages[portalNum].createTabContextMenu(portalNum).showAt(e.getXY());
    });
    panel.on("tabchange", function (tabpanel, tab) {
        if (tab) { //hide fires this event with a null tab
            var dp = mainViewport.findById("dashboard_panel");
            dp.setWidth(dp.getSize().width - 1); //firing resize without changing anything doesn't recalc
            dp.setWidth(dp.getSize().width + 1);
            if (thisDashboard._options.curportal != tab.pageNumber) {
                thisDashboard._options.curportal = tab.pageNumber;
                thisDashboard._options.dirty = true;
            }
            tab.loadWidgets();
        }
    });
    $(window).bind("beforeunload", function () {
        thisDashboard.updateUserOptions();
    });
    centerpanel.add(panel);
    mainViewport.doLayout();
    this.ActivateVisible(this._options.curportal);
    for (var i = 0; i < hiddenPages.length; i++) {
        panel.hideTabStripItem(hiddenPages[i]);
    }
    panel.doLayout();
    if (typeof idRefreshAndCloseButtons != "undefined") {
        idRefreshAndCloseButtons();
    }
}

Sage.SalesLogix.Dashboard.prototype.updateUserOptions = function() {
    if (this._options.dirty) {
        this._options.dirty = false;
        $.ajax({
            type: "PUT",
            contentType: "application/json; charset=utf-8",
            url: String.format("slxdata.ashx/slx/crm/-/dashboard/useroption?name=Options&category=Dashboard&data={0}", Ext.util.JSON.encode(this._options)),
            dataType: "json",
            error: function(request, status, error) {
            },
            success: function(data, status) {
            }
        });
    }
}

Sage.SalesLogix.Dashboard.prototype.getAvailableContent = function(portalNum) {
    return DashboardWidgetsList;
}

Sage.SalesLogix.Dashboard.prototype.deletePortal = function(portalNum) {
    var panel = mainViewport.findById("dashboard_panel");
    var tab = panel.findById("portal_panel_" + portalNum);
    if (tab) {
        panel.remove(tab);
        DashboardPages.splice(portalNum, 1);
        if (tab.name === this._options.defpage) {
            this._options.defpage = '';
        }
        this.ActivateVisible();
    }
}

Sage.SalesLogix.Dashboard.prototype.ActivateVisible = function(index) {
    if ((index) && (index < this._tabPanel.items.length) && (index >= 0)) {
        if (this._options.hiddenPages.indexOf(this._tabPanel.items.items[index].name) == -1) {
            this._tabPanel.activate(this._tabPanel.items.items[index]);
            return;
        }
    }
    for (var i = 0; i < this._tabPanel.items.length; i++) {
        var tabname = this._tabPanel.items.items[i].name;
        if (this._options.hiddenPages.indexOf(tabname) == -1) {
            this._tabPanel.activate(this._tabPanel.items.items[i]);
            return;
        }
    }
    //if none visible, add an empty
    var DefaultPageString = String.format(this.defaultPageString, "Default");
    this._options.hiddenPages.remove("Default");
    DashboardPages.remove(DefaultPageString);
    DashboardPages.push(DefaultPageString);
    mainViewport.findById("center_panel_center").removeAll();
    slxDashboard = new Sage.SalesLogix.Dashboard(this._options);
    slxDashboard.init();
}


function setUpDashboardPanels() {
    Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
    mainViewport = new Ext.FormViewport({
        layout: "border",
        autoShow: false,
        border: false,
        bufferResize: true,
        items: [
            {
                region: "north",
                id: "north_panel",
                height: 62,
                title: false,
                collapsible: false,
                border: false,
                contentEl: "north_panel_content"
            }, {
                region: "south",
                id: "south_panel",
                height: 20,
                collapsible: false,
                border: false,
                contentEl: "south_panel_content"
            }, {
                region: "west",
                id: "west_panel",
                stateId: "west_panel",
                border: false,
                split: true,
                width: 150,
                collapsible: true,
                collapseMode: 'mini',
                margins: "0 0 0 0",
                cmargins: "0 0 0 0",
                layout: 'accordion',
                sequence: true,
                defaults: {
                    stateEvents: ["collapse", "expand"],
                    getState: function() {
                        return { collapsed: this.collapsed };
                    }
                },
                animCollapse: false,
                animFloat: false,
                layoutConfig: {
                    animate: false,
                    hideCollapseTool: true
                },
                header: false
            }, {
                region: "center",
                id: "center_panel",
                applyTo: "center_panel",
                collapsible: false,
                border: false,
                margins: "6 6 6 6",
                cmargins: "0 0 0 0",
                layout: "border",
                items: [{
                    region: "center",
                    id: "center_panel_center",
                    applyTo: "center_panel_center",
                    border: false,
                    collapsible: false,
                    margins: "0 0 0 0",
                    autoScroll: false,
                    layout: "fit"
}]
}]
    });
}

function setNavState() {
    for (var i = 0; i < NavBar_Menus.length; i++) {
        var item = mainViewport.findById('nav_bar_menu_' + i);
        if (item) item.saveState();
    }
}


Sage.SalesLogix.userNotify = function (msg) {
    if ($('#PageTitle').get().length > 0) {
        var notifyElem = $("#userNotify").get(0);
        if (notifyElem) {
            $('#userNotify').html(msg);
            $('#userNotify').css('display', 'inline');
        } else {
            $('#PageTitle').after('<div id="userNotify" style="display:inline;" class="sage-saleslogix-usernotify" >' + msg + '</div>')
        }
        $('#userNotify').css('top', $('#PageTitle').position().top);
        $('#userNotify').css('left', $('#PageTitle').outerWidth());
        window.setTimeout(function() { $('#userNotify').fadeOut(); }, 5000);
    }
}

function promoteGroupToDashboard() {
    var template = '<Widget name="Group List" family="System"><options><name>Group List</name><title>{0}</title><family>System</family><groupfamily>{1}</groupfamily><groupname>{2}</groupname><groupid>{3}</groupid><limit>{4}</limit><subtitle></subtitle><datasource>slxdata.ashx/slx/crm/-/groups?family={5}&amp;name={6}&amp;format=json&amp;meta=true&amp;start=0&amp;limit={4}</datasource><entity>{8}</entity><visiblerows>{7}</visiblerows></options></Widget>';

    var win = new Ext.Window({ title: MasterPageLinks.PromoteTitle,
        width: 215,
        height: 375,
        autoScroll: true,
        buttons: [
            {
                text: MasterPageLinks.OK,
                handler: function (t, e) {
                    var cgi = getCurrentGroupInfo();
                    var page = Ext.getCmp('PagesGrid').getSelectionModel().getSelected();
                    if (page) {
                        var widgetstring = String.format(template, cgi.DisplayName, "Sage.Entity.Interfaces.I" + cgi.Family, cgi.Name, cgi.Id, 10,
                            $('<div/>').text(cgi.Family).html(), $('<div/>').text(cgi.Name).html(), 10, cgi.Entity);
                        $.ajax({
                            type: "POST",
                            url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?action=addwidget&name={0}&family={1}",
                                page.data.Name,
                                page.data.Family
                            ),
                            data: widgetstring,
                            processData: false,
                            error: function (request, status, error) {
                                Ext.Msg.alert(MasterPageLinks.Warning, request.responseText);
                            },
                            success: function (data, status) {
                            if (data != "Success") {
                                Ext.Msg.alert(MasterPageLinks.Warning, data);
                                return;
                            }
                                Sage.SalesLogix.userNotify(String.format(MasterPageLinks.PromotionNotification, page.data.Name, cgi.DisplayName));
                                if (typeof callback === "function") callback(data, status);
                            }
                        });
                    }
                    win.close();
                }
            }, {
                text: MasterPageLinks.MailMergeView_Cancel,
                handler: function (t, e) {
                    win.close();
                }
            }
        ],
        items: [{ xtype: 'label',
            style: "padding:6px",
            text: MasterPageLinks.PromoteDescription
        }],
        tools: [{ id: 'help',
            handler: function (evt, toolEl, panel) {
                window.open('help/WebClient_CSH.htm#taskpanecommontasks', "MCWebHelp");
            }
        }]
    });

    $.ajax({
        type: "GET",
        url: "slxdata.ashx/slx/crm/-/dashboard/page",
        cache: false,
        error: function(request, status, error) {
            Ext.Msg.alert(MasterPageLinks.Warning, request.responseText);
        },
        success: function(data, status) {
            var storedata = {};
            storedata.items = Sys.Serialization.JavaScriptSerializer.deserialize(data);
            var grid = new Ext.grid.GridPanel({
                store: new Ext.data.JsonStore({
                    autoDestroy: true,
                    fields: ['Name', 'Family'],
                    root: 'items',
                    data: storedata
                }),
                colModel: new Ext.grid.ColumnModel({
                    defaults: {
                        width: 180,
                        sortable: false
                    },
                    columns: [
                        { header: MasterPageLinks.PromotePageColumnHeader, dataIndex: 'Name' }
                    ]
                }),
                sm: new Ext.grid.RowSelectionModel({ singleSelect: true }),
                width: 200,
                height: 250,
                border: false,
                frame: true,
                id: 'PagesGrid'
            });
            win.add(grid);
            win.show();
        }
    });

}

Sage.AspWindow = Ext.extend(Ext.Window, {  //Ext 3.1 doesn't render controls in a window into form,
    initComponent: function() {             //this changes it to render them to the first (hopefully only) form, so postbacks work
        Sage.AspWindow.superclass.initComponent.call(this);
    },
    show: function(C, A, B) {
        if (!this.rendered)
            this.render(Ext.get(document.forms[0]));
        Sage.AspWindow.superclass.show.call(this, C, A, B);
    }
});

Ext.reg('AspWindow', Sage.AspWindow);


Sage.DialogWorkspace = function(options) {
    this._initialized = false;
    this._id = options.id;
    this._clientId = options.clientId;
    this._stateClientId = options.stateClientId;
    this._panelClientId = options.panelClientId;
    this._contentClientId = options.contentClientId;
    this._context = null;
    this._dialog = null;
    this._dialogPanel = null;
    this._closedOnServerSide = false;
    this._dialogInfo = {};
    this.addEvents(
        'open',
        'close'
    );

    Sage.DialogWorkspace.__instances[this._clientId] = this;
    Sage.DialogWorkspace.__initRequestManagerEvents();
};
Ext.extend(Sage.DialogWorkspace, Ext.util.Observable);
Sage.DialogWorkspace.__maskCount = 0;
Sage.DialogWorkspace.__instances = {};
Sage.DialogWorkspace.__requestManagerEventsInitialized = false;
Sage.DialogWorkspace.__initRequestManagerEvents = function() {
    if (Sage.DialogWorkspace.__requestManagerEventsInitialized)
        return;

    var contains = function(a, b) {
        if (!a || !b)
            return false;
        else
            return a.contains ? (a != b && a.contains(b)) : (!!(a.compareDocumentPosition(b) & 16));
    };

    var prm = Sys.WebForms.PageRequestManager.getInstance();
    prm.add_beginRequest(function(sender, args) {
        var element = args.get_postBackElement();
        if (element) {
            for (var id in Sage.DialogWorkspace.__instances) {
                var instance = Sage.DialogWorkspace.__instances[id];
                if (instance._context && contains(instance._context, element)) {
                    instance.disable();
                }
            }
        }

        
    });
    prm.add_pageLoaded(function(sender, args) {
        var panels = args.get_panelsUpdated();
        if (panels) {
            for (var id in Sage.DialogWorkspace.__instances) {
                for (var i = 0; i < panels.length; i++) {
                    var instance = Sage.DialogWorkspace.__instances[id];
                    if (contains(panels[i], document.getElementById(instance._stateClientId))) {
                        instance.enable();
                        instance.handleEvents();
                        break;
                    }
                }
            }
        }
    });

    //empty all state passing fields
    //have to do this here instead of in handleEvents() due to something causing
    //the original value to be reset after the pageLoaded() event
    prm.add_endRequest(function(sender, args) {
        for (var id in Sage.DialogWorkspace.__instances) {
            var instance = Sage.DialogWorkspace.__instances[id];
            instance.clearState();
            instance.enable(); 
        }

        
    });

    Sage.DialogWorkspace.__requestManagerEventsInitialized = true;
};

Sage.DialogWorkspace.requestMask = function() {
    Sage.DialogWorkspace.__maskCount = Sage.DialogWorkspace.__maskCount + 1
};

Sage.DialogWorkspace.prototype.init = function() {
    this.initContext();
    this.initDialog();

    $("#" + this._contentClientId).show();

    this.handleEvents();
};

Sage.DialogWorkspace.prototype.clearState = function() {
    $("#" + this._stateClientId).val("");
};

Sage.DialogWorkspace.prototype.disable = function() {
    if (!this._dialog)
        return;

    if (!this._dialog.isVisible())
        return;

    this._dialog.disable();
};

Sage.DialogWorkspace.prototype.enable = function() {
    if (!this._dialog)
        return;

    if (!this._dialog.isVisible())
        return;

    this._dialog.enable();
};

Sage.DialogWorkspace.prototype.show = function(o) {
    if (typeof o === "string")
        o = { id: o }

    o.event = "open";
    o.from = o.from || "client";

    var value = Sys.Serialization.JavaScriptSerializer.serialize(o);
    $("#" + this._stateClientId).val(value);
    __doPostBack(this._stateClientId, '');
};

Sage.DialogWorkspace.prototype.initContext = function() {
    this._context = document.getElementById(this._clientId);
};

Sage.DialogWorkspace.prototype.initDialog = function() {
    var self = this;
    var content = new Ext.Panel({
        cls: "dialog-workspace-content-panel",
        id: this._contentClientId + "_panel",
        contentEl: this._contentClientId,
        border: false,
        allowDomMove: false,
        stateful: false
    });
    var wrapper = new Ext.Panel({
        id: this._clientId + "_wrapper",
        cls: "dialog-workspace-wrapper",
        autoScroll: true,
        border: false,
        items: [content]
    });
    var dialog = new Sage.AspWindow({
        id: this._clientId + "_window",
        tools: [{
            id: "help",
            handler: function() {
                if (self._dialogInfo.help && self._dialogInfo.help.url)
                    window.open(self._dialogInfo.help.url, (self._dialogInfo.help.target || "help"));
            }
}],
            items: [wrapper],
            layout: "fit",
            closeAction: "hide",
            cls: "dialog-workspace",
            plain: true,
            stateful: false,
            constrain: true,
            //allowDomMove: false,
            modal: true
        });

        dialog.on('show', function(panel) {
            if (self._dialogInfo.help && self._dialogInfo.help.url)
                panel.tools["help"].show();
            else
                panel.tools["help"].hide();

            self.fireEvent('open', this);
        });

        dialog.on('beforehide', function(panel) {
            if (self._closedOnServerSide)
                return;

            var evt = {
                event: "close",
                id: self._dialogInfo.id
            };

            var bindingManager = Sage.Services.getService('ClientBindingManagerService');
            if (bindingManager)
                bindingManager.rollbackCurrentTransaction();

            self._dialogInfo = {};

            var value = Sys.Serialization.JavaScriptSerializer.serialize(evt);
            $("#" + self._stateClientId).val(value);

            Sage.DialogWorkspace.requestMask();

            __doPostBack(self._stateClientId, '');

            return false;
        });

        dialog.on('hide', function(panel) {
            self.fireEvent('close', this);
            
        });

        dialog.on('resize', function(window, width, height) {
            if (Ext.isString(dialog.layout)) {  // in ext3.2 resize may be called before afterrender, so we need the layout object here
                dialog.layout = new Ext.Container.LAYOUTS[dialog.layout.toLowerCase()](dialog.layoutConfig || {});
                dialog.setLayout(dialog.layout);
            }
            dialog.doLayout();
        });

        this._dialogPanel = content;
        this._dialog = dialog;
    };

    Sage.DialogWorkspace.prototype.fitToViewport = function(size) {
        var win = {
            width: $(window).width(),
            height: $(window).height()
        };
        var el = {
            width: $(".dialog-workspace-content").width(),
            height: $(".dialog-workspace-content").height()
        };
        var frame = {
            width: 0, //this._dialog.getFrameWidth(), 
            height: 0 //this._dialog.getFrameHeight()
        };

        if (el.width <= 0 || el.height <= 0)
            el = { width: 0, height: 0 };

        var out = {
            width: (size.width + frame.width),
            
            
            height: (size.height + frame.height),
            left: false,
            top: false,
            scroll: false
        };

        if (out.height > win.height) {
            out.height = win.height;
            out.top = 0;
            out.scroll = true; //can add adjustment to width for scroll here if necessary        
        }

        if (out.width > win.width) {
            out.width = win.width;
            out.left = 0;
        }

        return out;
    };

    Sage.DialogWorkspace.prototype.handleEvents = function () {
        //alert($("#" + this._stateClientId).val());   

        var value = $("#" + this._stateClientId).val();
        var evt = {};
        if (value)
            evt = eval("(" + value + ")");

        //clear event
        $("#" + this._stateClientId).val("");

        switch (evt.event) {
            case "open":
                if (this._dialog) {
                    this._dialogInfo = evt;

                    this._dialog.setTitle(this._dialogInfo.title);

                    var size = this.fitToViewport({ width: evt.width, height: evt.height });

                    this._dialog.setSize(size.width, size.height);

                    if (size.scroll)
                        this._dialog.addClass("dialog-workspace-scroll");
                    else
                        this._dialog.removeClass("dialog-workspace-scroll");

                    this._dialog.doLayout();
                    this._dialog.show();

                    if (evt.centerDialog) {
                        this._dialog.center();
                        if (this._dialog.getPosition()[1] < 0)
                            this._dialog.setPosition(this._dialog.getPosition()[0], 20);
                    } else
                        this._dialog.setPosition(evt.left, evt.top);
                }
                break;
            case "close":
                if (this._dialog) {
                    this._closedOnServerSide = true;
                    if (this._dialog.rendered) this._dialog.hide();
                    this._dialogInfo = {};
                    this._closedOnServerSide = false;
                }
                if (this.onClose) {
                    for (var i = 0; i < this.onClose.length; i++) {
                        this.onClose[i]();
                    }
                }
                break;
        }
    };
Sage.ContentPane = function(toggleBtn, contentArea, attr) {
	this.contentArea = contentArea;
	this.toggleButton = toggleBtn;
	this.state = "open";
	this.minImg = attr.minImg;
	this.maxImg = attr.maxImg
	this.minText = attr.minText;
	this.maxText = attr.maxText;
	var elem = YAHOO.util.Dom.get(toggleBtn);
	YAHOO.util.Event.removeListener(toggleBtn, 'click');
	YAHOO.util.Event.addListener(toggleBtn, 'click', this.toggle, this, true);
	YAHOO.util.Dom.setStyle(toggleBtn, "cursor", "pointer");
		
	if (typeof(cookie) != "undefined") {
		var st = cookie.getCookieParm(this.contentArea, "MainContentState");
		if (st) {
			if (st == "closed") {
				this.close();
			}
		}
	}
}

Sage.ContentPane.prototype.setState = function(state) {
	this.state = state;
	if (typeof(cookie) != "undefined") {
		cookie.setCookieParm(this.state, this.contentArea, "MainContentState");
	}
}

Sage.ContentPane.prototype.toggle = function() {
	if (this.state == "open") {
		this.close();
	} else {
		this.open();
	}
}

Sage.ContentPane.prototype.close = function() {
    
	YAHOO.util.Dom.setStyle(this.contentArea + "_inner", "display", "none");
	this.setState("closed");
	var elem = document.getElementById(this.toggleButton);
	if (elem) {
		elem.src = this.maxImg;
		elem.alt = this.maxText;
		elem.title = this.maxText;
	}
}

Sage.ContentPane.prototype.open = function() {
    
	YAHOO.util.Dom.setStyle(this.contentArea + "_inner", "display", "block");
	this.setState("open");
	var elem = document.getElementById(this.toggleButton);
	if (elem) {
		elem.src = this.minImg;
		elem.alt = this.minText;
		elem.title = this.minText;
	}
}

Sage.ContentPaneAttr = function() {
	this.minImg = "";
	this.maxImg = "";
	this.minText = "";
	this.maxText = "";
}

var imgCollapse = new Image();
imgCollapse.src = "images/collapsedark.gif";
var imgExpand = new Image();
imgExpand.src = "images/expanddark.gif";

function toggleSmartPartVisiblity(contentID, img){
    var content = document.getElementById(contentID);
    if(content.style.display =="none"){
        content.style.display = "block";
    }
    else{
        content.style.display = "none";
    }
    if(img.src == imgCollapse.src){
        img.src = imgExpand.src;
    }
    else{
        img.src = imgCollapse.src;
    }
}



Sage.TabWorkspaceState = function(state) {
    this._state = state;
    this._wasTabUpdated = new Object;
    this._hiddenTabs = new Object;      
    this._collections = ['MiddleTabs', 'MainTabs', 'MoreTabs'];
    this._collectionActiveRef = {'MainTabs' : 'ActiveMainTab', 'MoreTabs' : 'ActiveMoreTab'};
    
    //sync the dictionary with the list
    for (var i = 0; i < this._state.UpdatedTabs.length; i++)
        this._wasTabUpdated[this._state.UpdatedTabs[i]] = true;
    
    for (var i = 0; i < this._state.HiddenTabs.length; i++)
        this._hiddenTabs[this._state.HiddenTabs[i]] = true;    
        
};

Sage.TabWorkspaceState.MIDDLE_TABS = 'MiddleTabs';
Sage.TabWorkspaceState.MAIN_TABS = 'MainTabs';
Sage.TabWorkspaceState.MORE_TABS = 'MoreTabs';

Sage.TabWorkspaceState.deserialize = function(value) {    
    try
    {
        var state = Sys.Serialization.JavaScriptSerializer.deserialize(value);
        return new Sage.TabWorkspaceState(state);
    }
    catch (e)
    {
        return null;
    }
};

Sage.TabWorkspaceState.prototype.serialize = function() {
    return Sys.Serialization.JavaScriptSerializer.serialize(this._state);
};

Sage.TabWorkspaceState.prototype.getObject = function() {
    return this._state;
};

Sage.TabWorkspaceState.prototype.getSectionFor = function(target) {
    if (this.isMiddleTab(target))
        return Sage.TabWorkspaceState.MIDDLE_TABS;
    if (this.isMainTab(target))
        return Sage.TabWorkspaceState.MAIN_TABS;
    if (this.isMoreTab(target))
        return Sage.TabWorkspaceState.MORE_TABS;
    return false;
};

Sage.TabWorkspaceState.prototype._isTab = function(collection, target) {
    if (typeof this._state[collection] != "object")
        return;
        
    for (var i in this._state[collection])
        if (this._state[collection][i] == target)
            return true;
    return false;
};

Sage.TabWorkspaceState.prototype._removeFromTabs = function(collection, target) {
    if (typeof this._state[collection] != "object")
        return;
        
    var result = [];
    jQuery.each(this._state[collection], function(i, value) {
        if (value != target)
            result.push(value);
    });
    this._state[collection] = result;
    
    //if the collection is question has an active reference, and that value is set to the target, set it to null
    if (typeof this._collectionActiveRef[collection] != 'undefined')
        if (this._state[this._collectionActiveRef[collection]] == target)
            this._state[this._collectionActiveRef[collection]] = null;
};

Sage.TabWorkspaceState.prototype._addToTabs = function(collection, target, at, step) {
    if (typeof this._state[collection] != "object")
        return;
        
    //remove it from the other collections
    for (var other in this._collections)
        if (other != collection)
            this._removeFromTabs(this._collections[other], target);
        
    if (typeof at != 'undefined')
    {
        if (typeof at == 'number')
        {
            this._state[collection].splice(at, 0, target);
        }
        else
        {
            var insertAt = this._state[collection].length;
            jQuery.each(this._state[collection], function(i, value) {
                if (value == at)
                {
                    insertAt = i;
                    return false;
                }
            });
            
            if (typeof step == 'number')
                insertAt = insertAt + step;
            
            this._state[collection].splice(insertAt, 0, target);
        }
    }
    else
    {
        this._state[collection].push(target);
    }
};

Sage.TabWorkspaceState.prototype.isMiddleTab = function(target) { 
    return this._isTab(Sage.TabWorkspaceState.MIDDLE_TABS, target); 
};

Sage.TabWorkspaceState.prototype.removeFromMiddleTabs = function(target) { 
    this._removeFromTabs(Sage.TabWorkspaceState.MIDDLE_TABS, target); 
};

Sage.TabWorkspaceState.prototype.addToMiddleTabs = function(target, at, step) { 
    this._addToTabs(Sage.TabWorkspaceState.MIDDLE_TABS, target, at, step); 
};

Sage.TabWorkspaceState.prototype.isMainTab = function(target) { 
    return this._isTab(Sage.TabWorkspaceState.MAIN_TABS, target);
};

Sage.TabWorkspaceState.prototype.isTabVisible = function (tabId) {
    if (this.isMiddleTab(tabId)) {
        return true;
    } else if (this.isMainTab(tabId)) {
        return (this._state.ActiveMainTab === tabId);
    } else if (this.isMoreTab(tabId)) {
        return (this._state.ActiveMoreTab === tabId && (this.isMiddleTab(Sage.TabWorkspace.MORE_TAB_ID) || (this._state.ActiveMainTab === Sage.TabWorkspace.MORE_TAB_ID)));
    }
};

Sage.TabWorkspaceState.prototype.removeFromMainTabs = function(target) { 
    this._removeFromTabs(Sage.TabWorkspaceState.MAIN_TABS, target); 
};

Sage.TabWorkspaceState.prototype.addToMainTabs = function(target, at, step) { 
    this._addToTabs(Sage.TabWorkspaceState.MAIN_TABS, target, at, step); 
};

Sage.TabWorkspaceState.prototype.setActiveMainTab = function(target) { 
    this._state.ActiveMainTab = target; 
};

Sage.TabWorkspaceState.prototype.getActiveMainTab = function() { 
    return this._state.ActiveMainTab; 
};

Sage.TabWorkspaceState.prototype.isMoreTab = function(target) { 
    return this._isTab(Sage.TabWorkspaceState.MORE_TABS, target); 
};

Sage.TabWorkspaceState.prototype.removeFromMoreTabs = function(target) { 
    this._removeFromTabs(Sage.TabWorkspaceState.MORE_TABS, target); 
};

Sage.TabWorkspaceState.prototype.addToMoreTabs = function(target, at, step) { 
    this._addToTabs(Sage.TabWorkspaceState.MORE_TABS, target, at, step); 
};

Sage.TabWorkspaceState.prototype.setActiveMoreTab = function(target) { 
    this._state.ActiveMoreTab = target; 
};

Sage.TabWorkspaceState.prototype.getActiveMoreTab = function() { 
    return this._state.ActiveMoreTab; 
};

Sage.TabWorkspaceState.prototype.getMainTabs = function() {
    return this._state.MainTabs;
};

Sage.TabWorkspaceState.prototype.getMoreTabs = function() {
    return this._state.MoreTabs;
};

Sage.TabWorkspaceState.prototype.getMiddleTabs = function() {
    return this._state.MiddleTabs;
};

Sage.TabWorkspaceState.prototype.getUpdatedTabs = function() {
    return this._state.UpdatedTabs;
};

Sage.TabWorkspaceState.prototype.markTabUpdated = function(target) {
    if (this._wasTabUpdated[target])
        return;
         
    this._wasTabUpdated[target] = true;
    this._state.UpdatedTabs.push(target);
};

Sage.TabWorkspaceState.prototype.wasTabUpdated = function(target) {
    return this._wasTabUpdated[target];
};

Sage.TabWorkspaceState.prototype.clearUpdatedTabs = function() {
    this._wasTabUpdated = new Object;
    this._state.UpdatedTabs = [];
};

Sage.TabWorkspaceState.prototype.getHiddenTabs = function() {
    return this._state.HiddenTabs;
};
Sage.TabWorkspaceState.prototype.InHideMode = function() {
    return this._state.InHideMode;
};
Sage.TabWorkspace = function(config) {
    this._id = config.id;
    this._clientId = config.clientId;
    this._afterPostBackActions = [];       
    this._info = config.info;
    this._state = new Sage.TabWorkspaceState(config.state);            
    this._textSelectionDisabled = false;      
    this._debug = false;     
    this._regions = {}; 
    this._middleRegionDropTolerance = 20;
    this._offsetParent = false;
    this._offsetParentScroll = -1;
    
    this.compileInfoLookups();
    
    Sage.TabWorkspace.superclass.constructor.apply(this);
    
    this.addEvents(
        'maintabchange',
        'moretabchange'        
    );
};

Ext.extend(Sage.TabWorkspace, Ext.util.Observable);

Sage.TabWorkspace.MORE_TAB_ID = "More";
Sage.TabWorkspace.MAIN_AREA = "main";
Sage.TabWorkspace.MORE_AREA = "more";
Sage.TabWorkspace.MIDDLE_AREA = "middle";

Sage.TabWorkspace.prototype.compileInfoLookups = function() {
    this._info._byId = new Object;
    this._info._byElementId = new Object;
    this._info._byDropTargetId = new Object;
    this._info._byButtonId = new Object;
    this._info._byMoreButtonId = new Object;
    for (var i = 0; i < this._info.Tabs.length; i++)
    {
        this._info._byId[this._info.Tabs[i].Id] = this._info.Tabs[i];
        this._info._byElementId[this._info.Tabs[i].ElementId] = this._info.Tabs[i];
        this._info._byDropTargetId[this._info.Tabs[i].DropTargetId] = this._info.Tabs[i];
        this._info._byButtonId[this._info.Tabs[i].ButtonId] = this._info.Tabs[i];
        this._info._byMoreButtonId[this._info.Tabs[i].MoreButtonId] = this._info.Tabs[i];
    }
};

Sage.TabWorkspace.prototype.getInfoFor = function(tab) { return this._info._byId[tab]; };
Sage.TabWorkspace.prototype.getInfoForTab = function(tabId) { return this._info._byId[tabId]; };
Sage.TabWorkspace.prototype.getInfoForTabElement = function(elementId) { return this._info._byElementId[elementId]; };
Sage.TabWorkspace.prototype.getInfoForTabDropTarget = function(dropTargetId) { return this._info._byDropTargetId[dropTargetId]; };
Sage.TabWorkspace.prototype.getInfoForTabButton = function(buttonId) { return this._info._byButtonId[buttonId]; };
Sage.TabWorkspace.prototype.getInfoForTabMoreButton = function(buttonId) { return this._info._byMoreButtonId[buttonId]; };
Sage.TabWorkspace.prototype.getStateProxyTriggerId = function() { return this._info.ProxyTriggerId; };
Sage.TabWorkspace.prototype.getStateProxyPayloadId = function() { return this._info.ProxyPayloadId; };
Sage.TabWorkspace.prototype.getDragHelperContainerId = function() { return this._info.DragHelperContainerId; };
Sage.TabWorkspace.prototype.getUseUIStateService = function() { return this._info.UseUIStateService; };
Sage.TabWorkspace.prototype.getUIStateServiceKey = function() { return this._info.UIStateServiceKey; };
Sage.TabWorkspace.prototype.getUIStateServiceProxyType = function() { return this._info.UIStateServiceProxyType; };
Sage.TabWorkspace.prototype.getAllDropTargets = function() { return this._allDropTargets; };
Sage.TabWorkspace.prototype.getAllMainButtons = function() { return this._allMainButtons; };
Sage.TabWorkspace.prototype.getAllMoreButtons = function() { return this._allMoreButtons; };

Sage.TabWorkspace.prototype.getElement = function() {
    if (document.getElementById)
        return document.getElementById(this._clientId);
    return null;
};

Sage.TabWorkspace.prototype.getContext = function() { return this._context; };
Sage.TabWorkspace.prototype.getState = function() { return this._state; };
Sage.TabWorkspace.prototype.setState = function(state) { this._state = state; };

Sage.TabWorkspace.prototype.resetState = function(state)
{
	if (typeof state === "undefined")
	{
		var stateProxy = $("#" + this.getStateProxyPayloadId(), this.getContext()).val();
		if (stateProxy == "")
		{
			this.setState(this.getState());
		}
		else
		{
			this.setState(Sage.TabWorkspaceState.deserialize(stateProxy)); 
		} 
	}
	else if (typeof state === "string")
	{
		this.setState(Sage.TabWorkspaceState.deserialize(state));
	}
	this.logDebug("Reset state...");
};

Sage.TabWorkspace.prototype.logDebug = function(text) {
    if (this._debug)
    {
        var pad = function(value, length) {
            value = value.toString();
            while (value.length < length)
                value = "0" + value;
            return value;
        };
        var date = new Date();
        var dateString = pad(date.getHours(),2) + ":" + pad(date.getMinutes(),2) + ":" + pad(date.getSeconds(),2) + "." + pad(date.getMilliseconds(),3);
        $("#debug_log").append(dateString + " - " + text + "<br />");
    }
};

Sage.TabWorkspace.prototype.registerAfterPostBackAction = function(action) {
    this._afterPostBackActions.push(action);
};

Sage.TabWorkspace.prototype.init = function() { 
    this.logDebug("[enter] init"); 
    
    //cache common lookups               
    if (document.getElementById)
        this._context = document.getElementById(this._clientId);    
        
    if (this._context)
        this._offsetParent = $(this._context).offsetParent();
    
    this._allDropTargets = $("div.tws-drop-target", this._context);
    this._allMainButtons = $("li.tws-tab-button", this._context);
    this._allMoreButtons = $("li.tws-more-tab-button", this._context);
    this._mainButtonContainer = $("div.tws-main-tab-buttons", this._context);
    this._mainButtonContainerRegion = this.createRegionsFrom(this._mainButtonContainer)[0];
    this._moreButtonContainer = $("div.tws-more-tab-buttons-container", this._context);
    this._moreButtonContainerRegion = this.createRegionsFrom(this._moreButtonContainer)[0];
    
    this.getState().clearUpdatedTabs();
    for (var i = 0; i < this.getState().getMiddleTabs().length; i++)
        this.getState().markTabUpdated(this.getState().getMiddleTabs()[i]);
        
    if (this.getState().getActiveMainTab())
        this.getState().markTabUpdated(this.getState().getActiveMainTab());         
    
    if (this.getState().getActiveMainTab() == Sage.TabWorkspace.MORE_TAB_ID) 
        if (this.getState().getActiveMoreTab())
            this.getState().markTabUpdated(this.getState().getActiveMoreTab());
        
    //store the helper height & width   
    this._dragHelperHeight = $(".tws-tab-drag-helper", this.getContext()).height();
    this._dragHelperWidth = $(".tws-tab-drag-helper", this.getContext()).width();  
        
    this.logDebug("[enter] initEvents");
    this.initEvents();
    this.logDebug("[leave] initEvents");
    this.logDebug("[enter] initDragDrop");
    this.initDragDrop();
    this.logDebug("[leave] initDragDrop");
    this.logDebug("[leave] init");
    this.hideTabs();
};

Sage.TabWorkspace.prototype.initEvents = function() {
    var self = this; //since jQuery overrides "this" in the closure        
    
    //setup the update events
    //will need to refactor this to use add_endRequest instead
    var prm = Sys.WebForms.PageRequestManager.getInstance();
    prm.add_endRequest(function(sender, args) {  
        self.setupAllTabElementDraggables();
        self.hideTabs();
    });   
    
    prm.add_beginRequest(function(sender, args) {
        self.cleanupAllTabElementDraggables();
    });
};

Sage.TabWorkspace.prototype.hideTabs = function() 
{
     if(!this.getState().InHideMode())
     {
        return;
     } 
     for (var i = 0; i < this.getState().getMiddleTabs().length; i++)
     {
        var tab =this.getState().getMiddleTabs()[i];                
        this.unHideTab(tab);       
     } 
     
     for (var i = 0; i < this.getState().getMoreTabs().length; i++)
     {
        var tab =this.getState().getMoreTabs()[i];                
        this.unHideTab(tab);       
     } 
     
     for (var i = 0; i < this.getState().getMainTabs().length; i++)
     {
        var tab =this.getState().getMainTabs()[i];                
        this.unHideTab(tab);       
     } 
          
     for (var i = 0; i < this.getState().getHiddenTabs().length; i++)
     {
        var tab =this.getState().getHiddenTabs()[i];                
        this.hideTab(tab);       
     }
};

Sage.TabWorkspace.prototype.hideTab = function(tab) {
    this.logDebug("[enter] hideTab");
    if (typeof tab === "string")
        tab = this.getInfoFor(tab);
       
    if(tab == null){return;}
            
    switch (this.getState().getSectionFor(tab.Id))
    {
        case Sage.TabWorkspaceState.MAIN_TABS:                   
            
            $("#" + tab.ButtonId, this.getContext()).hide(); 
            $("#" + tab.ElementId, this.getContext()).hide();
            break;
            
        case Sage.TabWorkspaceState.MORE_TABS:
              
            $("#" + tab.MoreButtonId, this.getContext()).hide();
            $("#" + tab.ElementId, this.getContext()).hide();
            break;
            
        case Sage.TabWorkspaceState.MIDDLE_TABS:                 
            $("#" + tab.ElementId, this.getContext()).hide();
            break;
     }  
     
};

Sage.TabWorkspace.prototype.unHideTab = function(tab) {
    this.logDebug("[enter] hideTab");
    if (typeof tab === "string")
        tab = this.getInfoFor(tab);
    
    if(tab == null){return;}
       
    switch (this.getState().getSectionFor(tab.Id))
    {
        case Sage.TabWorkspaceState.MAIN_TABS:                   
            
            $("#" + tab.ButtonId, this.getContext()).show();
            if (this.getState().getActiveMainTab() == tab.Id)
            {
               $("#" + tab.ElementId, this.getContext()).show();       
            }
            
            break;
            
        case Sage.TabWorkspaceState.MORE_TABS:
                    
            $("#" + tab.MoreButtonId, this.getContext()).show();
            if (this.getState().getActiveMoreTab() == tab.Id)
            {
               $("#" + tab.ElementId, this.getContext()).show();       
            }
            break;
            
        case Sage.TabWorkspaceState.MIDDLE_TABS:                 
                        
             $("#" + tab.ElementId, this.getContext()).show();          
                              
            break;
     }  
     
};


Sage.TabWorkspace.prototype.disablePageTextSelection = function() {
    if (jQuery.browser.msie)
    {
        if (!this._textSelectionDisabled)
        {                
            this._oldBodyOnDrag = document.body.ondrag;
            this._oldBodyOnSelectStart = document.body.onselectstart;
            
            document.body.ondrag = function () { return false; };
            document.body.onselectstart = function () { return false; };
            
            this._textSelectionDisabled = true;
        }
    }
};

Sage.TabWorkspace.prototype.enablePageTextSelection = function() {
    if (jQuery.browser.msie)
    {
        if (this._textSelectionDisabled)
        {        
            document.body.ondrag = this._oldBodyOnDrag;
            document.body.onselectstart = this._oldBodyOnSelectStart;
            
            this._textSelectionDisabled = false;
        }
    }
};

Sage.TabWorkspace.prototype.setDragDropHelperText = function(helper, text) {
    if (typeof text != "string")
        return;
            
    $(".tws-drag-helper-text", helper).html(text);
}

Sage.TabWorkspace.prototype.setupTabElementDraggable = function(tab) {
    var self = this;
        
    var $query;      
    if (typeof tab == 'string')
        $query = $("#" + this.getInfoFor(tab).ElementId, this.getContext());
    else if (typeof target == 'object')
        $query = tab.ElementId;
        
    if ($query.is(".ui-draggable"))
        return;
           
    if (typeof tab === "string")
        this.logDebug("Setting up tab element draggable for " + tab + ".");
    else
        this.logDebug("Setting up tab element draggable for " + tab.Id + ".");
            
    $query.draggable({        
        handle : ".tws-tab-view-header",
        cursor : "move",
        cursorAt : { top : self._dragHelperHeight / 2, left : self._dragHelperWidth / 2 },
        zIndex : 15000,  
        delay: 50,    
        opacity : 0.5,
        scroll: true,
        refreshPositions: true,
        appendTo : "#" + self.getDragHelperContainerId(),
        helper : function() {             
            return self.createDraggableHelper(); 
        },
        start : function(e, ui) {        
            this._context = self.getInfoForTabElement(this.id);
            this._overDraggable = false;
            
            $(ui.helper).data("over", 0);
            
            self.disablePageTextSelection();                          
            self.setDragDropHelperText(ui.helper, this._context.Name);     
        },
        stop : function(e, ui) {
            self.enablePageTextSelection();
        }
    });
};

Sage.TabWorkspace.prototype.cleanupTabElementDraggable = function(tab) {
    var $query;      
    if (typeof tab == 'string')
        $query = $("#" + this.getInfoFor(tab).ElementId, this.getContext());
    else if (typeof target == 'object')
        $query = tab.ElementId;
    
    if (!$query.is(".ui-draggable"))
            return;
            
    if (typeof tab === "string")
        this.logDebug("Cleaning up tab element draggable for " + tab + ".");
    else
        this.logDebug("Cleaning up tab element draggable for " + tab.Id + ".");
    
    $query.draggable("destroy");                        
};

Sage.TabWorkspace.prototype.setupAllTabElementDraggables = function() {
    for (var i = 0; i < this.getState().getMiddleTabs().length; i++)
        this.setupTabElementDraggable(this.getState().getMiddleTabs()[i]);
        
    if (this.getState().getActiveMainTab() && this.getState().getActiveMainTab() != Sage.TabWorkspace.MORE_TAB_ID)
        this.setupTabElementDraggable(this.getState().getActiveMainTab());
    
    if (this.getState().getActiveMoreTab())
        this.setupTabElementDraggable(this.getState().getActiveMoreTab());   
};

Sage.TabWorkspace.prototype.cleanupAllTabElementDraggables = function() {
    //only updated tabs should have tab element draggables
    for (var i = 0; i < this.getState().getUpdatedTabs().length; i++)
        this.cleanupTabElementDraggable(this.getState().getUpdatedTabs()[i]);
};

Sage.TabWorkspace.prototype.createMainInsertMarker = function(el, at) {          
    if (el)
    {
        var marker = $("<div class=\"tws-insert-button-marker\"></div>").css({ top: (at.top - 24) + "px", left: (at.left - 12) + "px" });
        $("div.tws-main-tab-buttons", this.getContext()).append(marker);
        el._marker = marker;
    }
};

Sage.TabWorkspace.prototype.cleanupMainInsertMarker = function(el) {
    if (el && el._marker)
    {
        el._marker.remove();
        el._marker = null;
    }
};

Sage.TabWorkspace.prototype.createMoreInsertMarker = function(el, at) {          
    if (el)
    {
        var marker = $("<div class=\"tws-insert-button-marker\"></div>").css({ top : (at.top - 12) + "px" });
        $("div.tws-more-tab-buttons-container", this.getContext()).append(marker);
        el._marker = marker;
    }
};

Sage.TabWorkspace.prototype.cleanupMoreInsertMarker = function(el) {
    if (el && el._marker)
    {
        el._marker.remove();
        el._marker = null;
    }
};

Sage.TabWorkspace.prototype.getContextFromUI = function(ui) {    
    return ui.draggable.get(0)._context;  
};

Sage.TabWorkspace.prototype.getRegions = function(area) {
    return this._regions[area];
};

Sage.TabWorkspace.prototype.createRegionsFrom = function(list) {
    var regions = [];
    list.each(function() {
        var el = $(this);
        regions.push({ 
            x: el.offset().left,
            y: el.offset().top,
            width: el.width(),
            height: el.height(),
            el: this
        });
    });
    
    return regions;
};

Sage.TabWorkspace.prototype.testRegions = function(regions, pos, test) {
    var list = (typeof regions === "string") ? this._regions[regions] : regions;
    if (list && list.length && typeof test === "function")
    {
        for (var i = 0; i < list.length; i++)
        {
            if (test(list[i], pos))
                return list[i].el;
        }
    }
    
    return null;
};

Sage.TabWorkspace.prototype.setDroppableOn = function(draggable, id, droppable) {
    if (typeof draggable._droppables === "undefined")
        draggable._droppables = {};
        
    draggable._droppables[id] = droppable;
};

Sage.TabWorkspace.prototype.getDroppableFrom = function(draggable, id) {
    if (draggable._droppables)
        return draggable._droppables[id];
};

Sage.TabWorkspace.prototype.updateOffsetParentScroll = function() {
    this._offsetParentScroll = $(this._offsetParent).scrollTop();
};

Sage.TabWorkspace.prototype.shouldUpdateRegions = function() {
    if (this._offsetParent) 
    {
        if (this._offsetParentScroll != $(this._offsetParent).scrollTop())
        {
            this._offsetParentScroll = $(this._offsetParent).scrollTop();
            return true;
        }
    }
    
    return false;
};

Sage.TabWorkspace.prototype.initDragDrop = function() {
    var self = this;    
    
    
    
    
    $("div.tws-middle-section", this.getContext()).droppable({
        
        accept : ".tws-tab-button,.tws-more-tab-button,.tws-tab-element",
        tolerance : "pointer",
        activate : function(e, ui) {
            self.logDebug("Activate MiddleSection");
            
            //add our instance to the draggable
            self.setDroppableOn(ui.draggable.get(0), Sage.TabWorkspace.MIDDLE_AREA, ui.options);
                        
            self._allDropTargets.filter("div.tws-middle-section div.tws-drop-target").addClass("tws-drop-target-active");
        },    
        deactivate : function(e, ui) {
            self.logDebug("De-Activate MiddleSection");
                        
            self._allDropTargets.filter("div.tws-middle-section div.tws-drop-target").removeClass("tws-drop-target-active");
            
            ui.draggable.unbind('drag', ui.options.track);             
            ui.options._targets = null;
            ui.options._current = null;            
        },
        over : function(e, ui) {
            self.logDebug("Over MiddleSection");
                        
            var regions = self.createRegionsFrom(self.getAllDropTargets().filter(":visible"));
            var draggable = ui.draggable.get(0);
            var pos = { y: e.pageY, x: e.pageX };  
            var el = self.testRegions(regions, pos, function(r, p) { return (p.y > (r.y - self._middleRegionDropTolerance) && p.y <= (r.y + r.height + self._middleRegionDropTolerance)) });
            
            if (el)
            {
                $(el).addClass("tws-drop-target-hover");                 
                $(ui.helper).data("over", $(ui.helper).data("over") + 1);     
                $(ui.helper).addClass("tws-drag-helper-valid");                                   
            }

            ui.options._targets = regions;
            ui.options._currentTarget = (el) ? el : null;
            ui.draggable.bind('drag', ui.options.track);
        },
        out : function(e, ui) {
            self.logDebug("Out MiddleSection");
            
            var draggable = ui.draggable.get(0);
            
            self._allDropTargets.removeClass("tws-drop-target-hover");
            
            $(ui.helper).data("over", $(ui.helper).data("over") - 1);
            if ($(ui.helper).data("over") <= 0)
            {
                $(ui.helper).data("over", 0);            
                $(ui.helper).removeClass("tws-drag-helper-valid"); 
            }
                                                                        
            ui.draggable.unbind('drag', ui.options.track);
            ui.options._targets = null;
            ui.options._currentTarget = null;
        },
        drop : function(e, ui) {
            self.logDebug("Drop MiddleSection");
            
            var context = self.getContextFromUI(ui);    
            var target = ui.options._currentTarget;
 
            self._allDropTargets.removeClass("tws-drop-target-hover");            
            $(ui.helper).removeClass("tws-drag-helper-valid");
            
            if (target)           
                self.dropToMiddleSection(context, target);                
        },
        track : function(e, ui) {          
            var draggable = this;
            var droppable = self.getDroppableFrom(draggable, Sage.TabWorkspace.MIDDLE_AREA);
            var pos = { y: e.pageY, x: e.pageX };
            var el = self.testRegions(droppable._targets, pos, function(r, p) { return (p.y > (r.y - self._middleRegionDropTolerance) && p.y <= (r.y + r.height + self._middleRegionDropTolerance)) });

            if (droppable._currentTarget != el)
            {
                var last = droppable._currentTarget;
                if (last) 
                {
                    $(ui.helper).removeClass("tws-drag-helper-valid");
                    $(last).removeClass("tws-drop-target-hover");
                }
                    
                if (el)                                
                {
                    $(ui.helper).addClass("tws-drag-helper-valid");
                    $(el).addClass("tws-drop-target-hover");
                }
                
                droppable._currentTarget = el;
            }
        }
    });
    
    
    
    
    $("div.tws-main-tab-buttons", this.getContext()).droppable({
        accept : ".tws-tab-button,.tws-more-tab-button,.tws-tab-element",                      
        tolerance : "pointer",
        activate : function(e, ui) {
            self.logDebug("Activate MainButtonBar");
            
            //not functional in ui 1.5 - is there an equivalent and is it needed?    
            //ui.instance.proportions.width = ui.instance.element.width();
            //ui.instance.proportions.height = ui.instance.element.height(); 
            
            self.updateMainAreaRegions(); 
            
            self.setDroppableOn(ui.draggable.get(0), Sage.TabWorkspace.MAIN_AREA, ui.options);                        
        },
        deactivate : function(e, ui) {
            self.logDebug("De-Activate MainButtonBar");
            
            self.cleanupMainInsertMarker(ui.draggable.get(0));
            
            ui.draggable.unbind('drag', ui.options.track);
            ui.options._targets = null;
            ui.options._currentTarget = null;            
        },
        over : function(e, ui) {      
            self.logDebug("Over main button bar event occured for " + self.getContextFromUI(ui).Id);                                             
            
            $(ui.helper).data("over", $(ui.helper).data("over") + 1);     
            $(ui.helper).addClass("tws-drag-helper-valid");   
            
            var regions = self.getRegions(Sage.TabWorkspace.MAIN_AREA);
            var pos = { y: e.pageY, x: e.pageX };  
            var el = self.testRegions(regions, pos, function(r, p) {
                return (p.x > r.x && p.x <= (r.x + r.width) &&
                        p.y > r.y && p.y <= (r.y + r.height));
            });
            var position = {};
                if (el)
                    position = $(el, self.getContext()).position();
                else
                    position = $(".tws-tab-button-tail", self.getContext()).position();                        
            
            self.cleanupMainInsertMarker(ui.draggable.get(0)); 
            self.createMainInsertMarker(ui.draggable.get(0), position);
            
            ui.options._targets = regions;
            ui.options._currentTarget = null;
            ui.draggable.bind('drag', ui.options.track);
        },
        out : function(e, ui) {
            self.logDebug("Out MainButtonBar");
            
            $(ui.helper).data("over", $(ui.helper).data("over") - 1);
            if ($(ui.helper).data("over") <= 0)
            {
                $(ui.helper).data("over", 0);     
                $(ui.helper).removeClass("tws-drag-helper-valid"); 
            }
            
            self.cleanupMainInsertMarker(ui.draggable.get(0));           
                                    
            ui.draggable.unbind('drag', ui.options.track);
            ui.options._targets = null;
            ui.options._currentTarget = null;
        },
        drop : function(e, ui) {    
            self.logDebug("Drop to main event occured for " + self.getContextFromUI(ui).Id);   
            
            var context = self.getContextFromUI(ui);    
            var target = (ui.options._currentTarget) ? ui.options._currentTarget : this;                                                                     
            self.dropToMainSection(context, target);
        },        
        track : function(e, ui) {            
            var draggable = this;
            var droppable = self.getDroppableFrom(draggable, Sage.TabWorkspace.MAIN_AREA);
            var pos = { y: e.pageY, x: e.pageX };  
            var el = self.testRegions(droppable._targets, pos, function(r, p) {
                return (p.x > r.x && p.x <= (r.x + r.width) &&
                        p.y > r.y && p.y <= (r.y + r.height));
            });
           
            if (droppable._currentTarget != el)
            {
                droppable._currentTarget = el;
                
                var position = {};
                if (el)
                    position = $(droppable._currentTarget, self.getContext()).position();
                else
                    position = $(".tws-tab-button-tail", self.getContext()).position();
                
                self.cleanupMainInsertMarker(draggable); 
                self.createMainInsertMarker(draggable, position);
            }            
        }     
    });        
    
    
    
    
    $(".tws-more-tab-buttons", this.getContext()).droppable({
        accept : ".tws-tab-button:not(#show_More),.tws-more-tab-button,.tws-tab-element:not(#element_More)",            
        tolerance : "pointer",
        activate : function(e, ui) {
            self.logDebug("Activate MoreButtonBar");                       
            
            //fix for jQuery 1.5 and size of initially hidden droppables             
                     
            //not functional in ui 1.5 - is there an equivalent and is it needed?    
            //ui.instance.proportions.width = ui.instance.element.width();
            //ui.instance.proportions.height = ui.instance.element.height(); 
            
            self.updateMoreAreaRegions(); 
            
            self.setDroppableOn(ui.draggable.get(0), Sage.TabWorkspace.MORE_AREA, ui.options);
        },
        deactivate : function(e, ui) {
            self.cleanupMoreInsertMarker(ui);    
            
            ui.draggable.unbind('drag', ui.options.track);
            ui.options._targets = null;
            ui.options._currentTarget = null; 
        },
        over : function(e, ui) {
            self.logDebug("Over more button bar event occured for " + self.getContextFromUI(ui).Id);                                             
            
            $(ui.helper).data("over", $(ui.helper).data("over") + 1);     
            $(ui.helper).addClass("tws-drag-helper-valid");   
            
            var regions = self.getRegions(Sage.TabWorkspace.MORE_AREA);
            var pos = { y: e.pageY, x: e.pageX };  
            var el = self.testRegions(regions, pos, function(r, p) { return (p.y > r.y && p.y <= (r.y + r.height)) }); 
            var position = {};
                if (el)
                    position = $(el, self.getContext()).position();
                else
                    position = $(".tws-more-tab-button-tail", self.getContext()).position();
            
            self.cleanupMoreInsertMarker(ui.draggable.get(0)); 
            self.createMoreInsertMarker(ui.draggable.get(0), position); 
            
            ui.options._targets = regions;
            ui.options._currentTarget = null;
            ui.draggable.bind('drag', ui.options.track);                     
        },
        out : function(e, ui) {
            $(ui.helper).data("over", $(ui.helper).data("over") - 1);
            if ($(ui.helper).data("over") <= 0)
            {
                $(ui.helper).data("over", 0);     
                $(ui.helper).removeClass("tws-drag-helper-valid"); 
            }  
            
            self.cleanupMoreInsertMarker(ui.draggable.get(0)); 
            
            ui.draggable.unbind('drag', ui.options.track);
            ui.options._targets = null;
            ui.options._currentTarget = null;                      
        },
        drop : function(e, ui) {    
            self.logDebug("Drop to more event occured for " + self.getContextFromUI(ui).Id);
            
            var context = self.getContextFromUI(ui);    
            var target = (ui.options._currentTarget) ? ui.options._currentTarget : this;                                                                                                   
            self.dropToMoreSection(context, target);
        },          
        track : function(e, ui) {            
            var draggable = this; 
            var droppable = self.getDroppableFrom(draggable, Sage.TabWorkspace.MORE_AREA);
            var pos = { y: e.pageY, x: e.pageX };  
            var el = self.testRegions(droppable._targets, pos, function(r, p) { return (p.y > r.y && p.y <= (r.y + r.height)) }); 
                       
            if (droppable._currentTarget != el)
            {
                droppable._currentTarget = el;
                
                var position = {};
                if (el)
                    position = $(droppable._currentTarget, self.getContext()).position();
                else
                    position = $(".tws-more-tab-button-tail", self.getContext()).position();
                
                self.cleanupMoreInsertMarker(draggable); 
                self.createMoreInsertMarker(draggable, position);
            }            
        }  
    });
    
    
    
        
    $("li.tws-tab-button:not(li.tws-tab-button-tail)", this.getContext()).draggable({
        cursor : "move",
        cursorAt : { top : self._dragHelperHeight / 2, left : self._dragHelperWidth / 2 },
        zIndex : 15000,       
        appendTo : "#" + self.getDragHelperContainerId(),
        //refreshPositions : true,
        opacity: 0.5,
        delay: 50,    
        scroll: true,
        refreshPositions: true,
        helper : function() {             
            return self.createDraggableHelper(); 
        },
        start : function(e, ui) {  
            this._context = self.getInfoForTabButton(this.id);
            this._overDraggable = false;
            
            $(ui.helper).data("over", 0);
            
            self.disablePageTextSelection();            
            self.setDragDropHelperText(ui.helper, this._context.Name);  
        },
        stop : function(e, ui) {
            self.enablePageTextSelection();
        }
    });
    
    
    
    
    $("li.tws-more-tab-button:not(li.tws-more-tab-button-tail)", this.getContext()).draggable({
        cursor : "move",
        cursorAt : { top : self._dragHelperHeight / 2, left : self._dragHelperWidth / 2 },
        zIndex : 15000,     
        //refreshPositions : true,  
        opacity: 0.5,  
        delay: 50,   
        scroll: true,
        refreshPositions: true,
        appendTo : "#" + self.getDragHelperContainerId(),
        helper : function() {             
            return self.createDraggableHelper(); 
        },
        start : function(e, ui) {  
            this._context = self.getInfoForTabMoreButton(this.id);
            this._overDraggable = false;
            
            $(ui.helper).data("over", 0);
            
            self.disablePageTextSelection();            
            self.setDragDropHelperText(ui.helper, this._context.Name);  
        },
        stop : function(e, ui) {
            self.enablePageTextSelection();
        }
    });       
    
    $("li.tws-tab-button:not(li.tws-tab-button-tail)", this.getContext()).click(function(e) {
        var tab = self.getInfoForTabButton($(this).attr("id"));
        
        self.logDebug("Click event occured for " + tab.Id);
        
        self.showMainTab(tab.Id);
        
        if (e.ctrlKey)
            this.forceUpdateFor(tab.Id);
    });  
    
    $("li.tws-more-tab-button:not(li.tws-more-tab-button-tail)", this.getContext()).click(function(e) {
        var tab = self.getInfoForTabMoreButton($(this).attr("id"));
        
        self.logDebug("Click event occured for " + tab.Id);
        
        self.showMoreTab(tab.Id);
        
        if (e.ctrlKey)
            this.forceUpdateFor(tab.Id);    
    });     
    
    this.updateAllRegions();
    this.setupAllTabElementDraggables();   
};

Sage.TabWorkspace.prototype.createDraggableHelper = function() {
    return $("<div class='tws-tab-drag-helper'><div class='tws-drag-helper-icon' /><div class='tws-drag-helper-text' /></div>");
};

Sage.TabWorkspace.prototype.showMainTab = function(tab, triggerUpdate) { 
    this.logDebug("[enter] showMainTab");
    
    if (typeof tab === "string")
        tab = this.getInfoFor(tab);
        
    var previousMainTabId = this.getState().getActiveMainTab();
    
    //if we are already the active main tab, we do not have to do anything
    if (this.getState().getActiveMainTab() == tab.Id)
    {
        //still optionally trigger an update
        if (typeof triggerUpdate == 'undefined' || triggerUpdate)
            this.triggerUpdateFor(tab.Id); 
        return;
    }
                
    //change state
    this.getState().setActiveMainTab(tab.Id);
      
    
    
    this.showMainTabDom(tab);
    
    if (tab.Id == Sage.TabWorkspace.MORE_TAB_ID)
        if (this.getState().getActiveMoreTab())
            this.showMoreTabDom(this.getState().getActiveMoreTab());
   
    if (typeof triggerUpdate == 'undefined' || triggerUpdate)
            this.triggerUpdateFor(tab.Id);     
            
    this.fireEvent('maintabchange', tab.Id, tab);     
};

Sage.TabWorkspace.prototype.showMainTabDom = function(tab) {
    
    if (typeof tab === "string")
        tab = this.getInfoFor(tab);
        
    $(".tws-main-tab-content > .tws-tab-element", this.getContext()).hide();
    $("#" + tab.ElementId, this.getContext()).show();
    $(".tws-main-tab-buttons .tws-tab-button", this.getContext()).removeClass("tws-active-tab-button"); 
    $("#" + tab.ButtonId, this.getContext()).addClass("tws-active-tab-button");
};

Sage.TabWorkspace.prototype.showMoreTab = function(tab, triggerUpdate) {
    this.logDebug("[enter] showMoreTab");
    
    if (typeof tab === "string")
        tab = this.getInfoFor(tab);
    
    if (this.getState().getActiveMoreTab() == tab.Id)
    {
        //still optionally trigger an update
        if (typeof triggerUpdate == 'undefined' || triggerUpdate)
            this.triggerUpdateFor(tab.Id); 
        return;   
    }
    
    this.getState().setActiveMoreTab(tab.Id);
    
    
    
    this.showMoreTabDom(tab);
    
    if (typeof triggerUpdate == 'undefined' || triggerUpdate)
            this.triggerUpdateFor(tab.Id); 
            
    this.fireEvent('moretabchange', tab.Id, tab);
};

Sage.TabWorkspace.prototype.showMoreTabDom = function(tab) {
    if (typeof tab === "string")
        tab = this.getInfoFor(tab);
    
    $(".tws-more-tab-content .tws-tab-element", this.getContext()).hide();
    $("#" + tab.ElementId, this.getContext()).show();
    $(".tws-more-tab-buttons .tws-more-tab-button", this.getContext()).removeClass("tws-active-more-tab-button");
    $("#" + tab.MoreButtonId, this.getContext()).addClass("tws-active-more-tab-button");
};

Sage.TabWorkspace.prototype.dropToMainSection = function(tab, target) {   
    
    
    this.logDebug("[enter] dropToMainSection");
      
    //determine the drop position via ui.droppable
    var $location;
    if ($(target).is(".tws-main-tab-buttons"))    
        $location = $(".tws-tab-button-tail", this.getContext());    
    else    
        $location = $(target, this.getContext());
                             
    switch (this.getState().getSectionFor(tab.Id))
    {
        case Sage.TabWorkspaceState.MAIN_TABS:                   
            $location.before($("#" + tab.ButtonId, this.getContext()));
            break;
            
        case Sage.TabWorkspaceState.MORE_TABS:
            $("#" + tab.MoreButtonId, this.getContext()).hide();
            $location.before($("#" + tab.ButtonId, this.getContext()).show());            
            
            //move the tab element
            $(".tws-main-tab-content", this.getContext()).append($("#" + tab.ElementId));
            //move the drop target
            $(".tws-main-tab-content", this.getContext()).append($("#" + tab.DropTargetId));
            break;
            
        case Sage.TabWorkspaceState.MIDDLE_TABS:                 
            $location.before($("#" + tab.ButtonId, this.getContext()).show());
            
            //move the tab element
            $(".tws-main-tab-content", this.getContext()).append($("#" + tab.ElementId));
            //move the drop target
            $(".tws-main-tab-content", this.getContext()).append($("#" + tab.DropTargetId));
            
            break;
    }
       
    //add this tab to the main tabs
    if ($location.is(".tws-tab-button-tail"))
        this.getState().addToMainTabs(tab.Id);
    else
        this.getState().addToMainTabs(tab.Id, this.getInfoForTabButton($location.attr("id")).Id, 0);    
        
    //show this main tab
    this.showMainTab(tab.Id);
};

Sage.TabWorkspace.prototype.dropToMoreSection = function(tab, target) {   
    
    
    this.logDebug("[enter] dropToMoreSection"); 
  
    //determine the drop position via ui.droppable
    var $location;
    if ($(target).is(".tws-more-tab-buttons"))    
        $location = $(".tws-more-tab-button-tail", this.getContext());    
    else    
        $location = $(target, this.getContext());
                             
    switch (this.getState().getSectionFor(tab.Id))
    {
        case Sage.TabWorkspaceState.MAIN_TABS:                   
            $("#" + tab.ButtonId, this.getContext()).hide();
            $location.before($("#" + tab.MoreButtonId, this.getContext()).show());            
            
            //move the tab element
            $(".tws-more-tab-element .tws-more-tab-content-fixer", this.getContext()).before($("#" + tab.ElementId));
            //move the drop target
            $(".tws-more-tab-element .tws-more-tab-content-fixer", this.getContext()).before($("#" + tab.DropTargetId));
            break;
            
        case Sage.TabWorkspaceState.MORE_TABS:
            $location.before($("#" + tab.MoreButtonId, this.getContext()));
            break;
            
        case Sage.TabWorkspaceState.MIDDLE_TABS:                 
            $location.before($("#" + tab.MoreButtonId, this.getContext()).show());
                        
            //move the tab element
            $(".tws-more-tab-element .tws-more-tab-content-fixer", this.getContext()).before($("#" + tab.ElementId));
            //move the drop target
            $(".tws-more-tab-element .tws-more-tab-content-fixer", this.getContext()).before($("#" + tab.DropTargetId));                        
            break;
    }
       
    //add this tab to the main tabs
    if ($location.is(".tws-more-tab-button-tail"))
        this.getState().addToMoreTabs(tab.Id);
    else
        this.getState().addToMoreTabs(tab.Id, this.getInfoForTabMoreButton($location.attr("id")).Id, 0);    
        
    //show this main tab
    this.showMoreTab(tab.Id);
};

Sage.TabWorkspace.prototype.dropToMiddleSection = function(tab, target) {   
    
    
    this.logDebug("[enter] dropToMiddleSection");
     
    var tabsToUpdate = [];
    
    //dropped to it's own drop target
    if (tab.DropTargetId == target.id)
        return;
             
    switch (this.getState().getSectionFor(tab.Id))
    {
        case Sage.TabWorkspaceState.MAIN_TABS:
            //are we the last main tab? if so, do nothing
            if (this.getState().getMainTabs().length == 1)
                return;
                
            //are we the current active main tab?
            if (this.getState().getActiveMainTab() == tab.Id)
            {
                var $newActiveTab = $("#" + tab.ButtonId, this.getContext()).prev(".tws-tab-button:visible:not(.tws-tab-button-tail)");
                if ($newActiveTab.length <= 0)
                    $newActiveTab = $("#" + tab.ButtonId, this.getContext()).next(".tws-tab-button:visible:not(.tws-tab-button-tail)");
                    
                if ($newActiveTab.length > 0)
                {
                    var newActiveTabId = this.getInfoForTabButton($newActiveTab.attr("id")).Id;
                    this.showMainTab(newActiveTabId, false); //do not trigger an update
                    tabsToUpdate.push(newActiveTabId);
                }                               
            }                      
            
            $("#" + tab.ButtonId, this.getContext()).hide();   
                
            //move the old drop target
            $(target).after($("#" + tab.DropTargetId, this.getContext()));    
            //show and move the tab element
            $(target).after($("#" + tab.ElementId, this.getContext()).show());
            
            tabsToUpdate.push(tab.Id);     
            break;
            
        case Sage.TabWorkspaceState.MORE_TABS:
            //are we the current active more tab?
            if (this.getState().getActiveMoreTab() == tab.Id)
            {
                //TODO: should we make a new more tab active?
            }
            
            $("#" + tab.MoreButtonId, this.getContext()).hide();
            
            //move the old drop target
            $(target).after($("#" + tab.DropTargetId, this.getContext()));    
            //show and move the tab element
            $(target).after($("#" + tab.ElementId, this.getContext()).show());
            
            tabsToUpdate.push(tab.Id);
            break;
            
        case Sage.TabWorkspaceState.MIDDLE_TABS:
            //move the old drop target
            $(target).after($("#" + tab.DropTargetId, this.getContext()));    
            //show and move the tab element
            $(target).after($("#" + tab.ElementId, this.getContext()).show());
            
            tabsToUpdate.push(tab.Id);
            break;
    }     
    
    //update state  
    if ($(target).hasClass("tws-middle-drop-target"))
        this.getState().addToMiddleTabs(tab.Id, 0); //first
    else  
        this.getState().addToMiddleTabs(tab.Id, this.getInfoForTabDropTarget(target.id).Id, 1);              
                    
    this.triggerUpdateFor(tabsToUpdate);
};

Sage.TabWorkspace.prototype.deriveStateFromMarkup = function() {
    var self = this;
    var state = { 
        MiddleTabs : [],
        MainTabs : [],
        MoreTabs : []        
    };
    
    $(".tws-middle-section .tws-tab-element", this.getContext()).each(function() {
        state.MiddleTabs.push(self.getInfoForTabElement($(this).attr("id")).Id);
    });
    
    $(".tws-main-section .tws-main-tab-buttons .tws-tab-button:visible", this.getContext()).each(function() { 
        var tab = self.getInfoForTabButton($(this).attr("id"));
        state.MainTabs.push(tab.Id);
        
        if ($(this).hasClass("tws-active-tab-button", this.getContext()))
            state.ActiveMainTab = tab.Id;
    });
    
    return state;
};


Sage.TabWorkspace.prototype.updateVisibleDroppables = function() {
    this.logDebug("[enter] enableAllVisibleDroppables");
    
    $("div.tws-drop-target:visible", this.getContext()).droppable("enable");   
    
    //fix for jQuery 1.5 and size of initially hidden droppables
    $.ui.ddmanager.prepareOffsets();

    this.logDebug("[leave] enableAllVisibleDroppables");
};

Sage.TabWorkspace.prototype.updateAllRegions = function() {
    this.updateMainAreaRegions();
    this.updateMoreAreaRegions();
    this.updateMiddleAreaRegions();
};

Sage.TabWorkspace.prototype.updateMainAreaRegions = function() { 
    //validate the container region and the area region list
    var region = this.createRegionsFrom(this._mainButtonContainer)[0];
        
    this._regions[Sage.TabWorkspace.MAIN_AREA] = this.createRegionsFrom(this._allMainButtons.filter(":visible")); 
    this._mainButtonContainerRegion = region;
};
Sage.TabWorkspace.prototype.updateMoreAreaRegions = function() {
    //validate the container region and the area region list
    var region = this.createRegionsFrom(this._moreButtonContainer)[0];
         
    this._regions[Sage.TabWorkspace.MORE_AREA] = this.createRegionsFrom(this._allMoreButtons.filter(":visible")); 
    this._moreButtonContainerRegion = region;
};
Sage.TabWorkspace.prototype.updateMiddleAreaRegions = function() { 
    this._regions[Sage.TabWorkspace.MIDDLE_AREA] = this.createRegionsFrom(this._allDropTargets.filter(":visible")); 
};

Sage.TabWorkspace.prototype.updateContextualFeedback = function() {
    
    if (this.getState().getMoreTabs().length <= 0)
        $(".tws-more-tab-message", this.getContext()).empty().append(TabWorkspaceResource.More_Tab_Empty_Message).show();
    else if (this.getState().getActiveMoreTab() == null) 
        $(".tws-more-tab-message", this.getContext()).empty().append(TabWorkspaceResource.More_Tab_No_Selection_Message).show();
    else
        $(".tws-more-tab-message", this.getContext()).hide();
        
    
    if (this.getState().getMiddleTabs().length <= 0)
    {
        $(".tws-middle-section", this.getContext()).addClass("tws-middle-section-empty");
        $(".tws-middle-drop-target span", this.getContext()).empty().append(TabWorkspaceResource.Middle_Pane_Empty_Drop_Target_Message);
    }
    else
    {
        $(".tws-middle-section", this.getContext()).removeClass("tws-middle-section-empty");
        $(".tws-middle-drop-target span", this.getContext()).empty().append(TabWorkspaceResource.Middle_Pane_Drop_Target_Message);
    }
};

Sage.TabWorkspace.prototype.updateStateProxy = function() {
    var serializedState = this.getState().serialize();
    $("#" + this.getStateProxyPayloadId()).val(serializedState);
}

Sage.TabWorkspace.prototype.triggerUpdateFor = function(tabs, data) {

    this.updateContextualFeedback();
    this.updateAllRegions(); 
    
    var tabsToUpdate = [];
    var shouldSendState = false;
    var stateSent = false;
    var self = this;
    
    if (typeof tabs == 'string')
    {
        //check to see if we need to update the tab.  never update the more tab, but do send state.
        if (tabs == Sage.TabWorkspace.MORE_TAB_ID)
        {
            //if we are the more tab, see if we need to update the active more tab
            var activeMoreTab = this.getState().getActiveMoreTab();
            if (activeMoreTab && !this.getState().wasTabUpdated(activeMoreTab))
            {
                this.getState().markTabUpdated(activeMoreTab);
                tabsToUpdate.push(activeMoreTab);
            }
            else
            {
                shouldSendState = true;
            }
        }
        else
        {        
            if (!this.getState().wasTabUpdated(tabs) && (tabs != Sage.TabWorkspace.MORE_TAB_ID))        
            {            
                //mark the tab as updated so when the state gets sent the server knows the control is "active"
                this.getState().markTabUpdated(tabs); 
                tabsToUpdate.push(tabs);            
            }
            else
            {
                shouldSendState = true;
            }
        }
    }
    else
    {
        for (var i = 0; i < tabs.length; i++)
        {
            //check to see if we need to update the tab.  never update the more tab, but do send state.
            if (tabs[i] == Sage.TabWorkspace.MORE_TAB_ID)
            {
                //if we are the more tab, see if we need to update the active more tab
                var activeMoreTab = this.getState().getActiveMoreTab();
                if (activeMoreTab && !this.getState().wasTabUpdated(activeMoreTab))
                {
                    this.getState().markTabUpdated(activeMoreTab);
                    tabsToUpdate.push(activeMoreTab);
                }
                else
                {
                    shouldSendState = true;
                }
            }
            else 
            {
                if (!this.getState().wasTabUpdated(tabs[i]) && (tabs[i] != Sage.TabWorkspace.MORE_TAB_ID))
                {
                    //mark the tab as updated so when the state gets sent the server knows the control is "active"
                    this.getState().markTabUpdated(tabs[i]); 
                    tabsToUpdate.push(tabs[i]);
                }
                else
                {
                    shouldSendState = true;
                }
            }
        }
    }
                
    if (typeof tabs == 'string')
        this.logDebug("Update requested for: " + tabs);
    else
        this.logDebug("Updates requested for: " + tabs.join(", "));
    
    var serializedState = this.getState().serialize();
    $("#" + this.getStateProxyPayloadId()).val(serializedState);
                            
    for (var i = 0; i < tabsToUpdate.length; i++)
    {
        this.logDebug("Triggering update for " + tabsToUpdate[i]);
    
        tab = tabsToUpdate[i];                                        
        //this.cleanupTabElement(tab);        
        
        $("#" + this.getInfoFor(tab).UpdatePayloadId).val(serializedState);
        __doPostBack(this.getInfoFor(tab).UpdateTriggerId, "");
        
        stateSent = true;              
    }
    
    var forceProxyCall = false;
    if (shouldSendState && !stateSent && this.getUseUIStateService())
    {    
        this.logDebug("Sending state update via UIStateService.");
                
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "UIStateService.asmx/StoreTabWorkspaceState",
            data: Ext.util.JSON.encode({
                key: this.getUIStateServiceKey(),
                state: this.getState().getObject()
            }),
            dataType: "json",
            error: function (request, status, error) {
                self.logDebug("State update via UIStateService failed.");   
                self.logDebug("Sending state update via proxy.");
                        
                $("#" + self.getStateProxyPayloadId()).val(serializedState);
                __doPostBack(self.getStateProxyTriggerId(), ""); 
                
                stateSent = true;     
            },
            success: function(data, status) {
                stateSent = true;            
            }
        });
    }
    
    //if the state needs to be sent, and hasn't been, and the UI state service us not being used, or has failed
    //send it via the proxy
    if (shouldSendState && !stateSent && (!this.getUseUIStateService() || forceProxyCall))
    {
        this.logDebug("Sending state update via proxy.");
        
        //$("#" + this.getStateProxyPayloadId()).val(serializedState);
        __doPostBack(this.getStateProxyTriggerId(), "");
        
        stateSent = true;
    }    
};

Sage.Analytics = {
    //our colors
    colorPalette: {
        'blue 0': 'dfe8f6', //widget bg color. will not be returned in getColors()
        'blue 6': '00a1de',
        'green 3': 'c1d59f',
        'pink 5': 'a44e81',
        'orange 2': 'f8d6aa',
        'blue 4': '55c0e9',
        'green 6': '69923a',
        'pink 2': 'e2afcd',
        'orange 7': 'af6200',
        'blue 3': '80d0ef',
        'green 8': '35491d',
        'pink 4': 'c55e9b',
        'orange 3': 'f4c180',
        'blue 7': '0079a7',
        'green 5': '86a85c',
        'pink 8': '421f34',
        'orange 6': 'e98300',
        'blue 2': 'aae0f4',
        'green 7': '4f6e2c',
        'pink 3': 'd486b4',
        'orange 8': '754200',
        'blue 5': '2bb1e4',
        'green 2': 'd6e3bf',
        'pink 6': '833f67',
        'orange 5': 'ed982b',
        'blue 8': '00516f',
        'green 4': 'a4bf7d',
        'pink 7': '632f4e',
        'orange 4': 'f0ac55'
    },

    //method used by individual widgets display() methods
    //to dictate differential inheritance
    //@param base is the base type used for the new object
    createObject: function (base) {
        var O = function () { };
        O.prototype = base;
        return new O();
    },
    now: function () {
        var minutes, value = new Date(),
        renderer = Ext.util.Format.dateRenderer(ConvertToPhpDateTimeFormat(getContextByKey('userDateFmtStr') +
            " " + getContextByKey('userTimeFmtStr')));
        return renderer(value);
    },
    //create a function to return an array object
    //populated with the color items in our palette
    //@param num is the number of colors you want back (in an array)
    getColors: function (num) {

        if (!num) { return; }

        var lookupLg = ['blue 6', 'green 3', 'pink 5', 'orange 2', 'blue 4', 'green 6',
            'pink 2', 'orange 7', 'blue 3', 'green 8', 'pink 4', 'orange 3',
            'blue 7', 'green 5', 'pink 8', 'orange 6', 'blue 2', 'green 7',
            'pink 3', 'orange 8', 'blue 5', 'green 2', 'pink 6', 'orange 5',
            'blue 8', 'green 4', 'pink 7', 'orange 4'],

        lookupSm = ['green 5', 'blue 3', 'green 7', 'blue 6',
            'green 3', 'blue 7'],
        ret = [], i, j;

        //the palette for num <= 6 is different than a larger set.
        if (num <= 6) {
            for (i = 0; i < num; i++) {
                ret[i] = Sage.Analytics.colorPalette[lookupSm[i]];
            }
        }
        else {
            for (j = 0; j < num; j++) {
                ret[j] = Sage.Analytics.colorPalette[lookupLg[j]];
            }
        }
        return ret;
    },

    //looping template functions need to get a single color at a time
    //by passing in an Int
    //@param idx the index passed in by the looping function
    getColor: function (idx) {
        var lookup = ['blue 6', 'green 3', 'pink 5', 'orange 2', 'blue 4', 'green 6',
            'pink 2', 'orange 7', 'blue 3', 'green 8', 'pink 4', 'orange 3',
            'blue 7', 'green 5', 'pink 8', 'orange 6', 'blue 2', 'green 7',
            'pink 3', 'orange 8', 'blue 5', 'green 2', 'pink 6', 'orange 5',
            'blue 8', 'green 4', 'pink 7', 'orange 4'];
        return Sage.Analytics.colorPalette[lookup[idx]];
    },
    //an incremental counter used by generateString()
    counter: 1,
    //so that dynamically generated elements can get a 
    //unique number appended to their name, ie 'wgt1', 'wgt2'...
    //@param str a string passed in to which a number will be appended
    generateString: function (str) {
        return str + Sage.Analytics.counter++;
    },
    //objects methods will return various repetitive html/javascript elements
    //for our widget types
    markup: {
        //@param ttl is the title for the editor window
        //@param editorFields is an object containing the fields on the editor
        //@param scope is 'this' from the editor's perspective
        //@param ok is an optional callback function for custom fields
        //to fire when the OK button is pressed
        //@param urls is an object containing urls for data call
        //any/all of these will be in the init object
        editorWindow: function (init) {
            var $items = [], prop, cust,
            //hoist the most referred to...
            editorFields = init.editorFields,
            urls = init.urls,
            scope = init.scope;
            //generate the markup for the items array
            for (prop in editorFields) {
                if (editorFields.hasOwnProperty(prop)) {
                    switch (prop) {
                        case 'entityField':
                            //entityField requires a different signature
                            $items.push(this[prop](editorFields[prop], editorFields.groupField,
                                editorFields.dimensionField, editorFields.metricField,
                                urls.group, urls.dimension, urls.metric, scope));
                            break;
                        case 'customFields':
                            for (cust in editorFields.customFields) {
                                if (editorFields.customFields.hasOwnProperty(cust)) {
                                    // note scope not needed as callbacks defined in the widget
                                    $items.push(this.customField(editorFields.customFields[cust]));
                                }
                            }
                            break;
                        //radioNames should set disabled state of truncate fields  
                        case 'radioNames':
                            $items.push(this[prop](editorFields[prop], editorFields.radioTruncate,
                                editorFields.truncField, scope));
                            break;
                        case 'radioTruncate':
                            $items.push(this[prop](editorFields[prop],
                                editorFields.truncField, scope));
                            break;
                        default:
                            $items.push(this[prop](editorFields[prop], scope));
                    }
                }
            }
            //send the window back to editor()
            return new Ext.Window({
                id: scope.config.editorWindow,
                title: init.title,
                tools: [{
                    id: 'help',
                    handler: function () {
                        window.open(String.format(getContextByKey('WebHelpUrlFmt'), 'Using_Widgets'), 'MCWebHelp');
                    }
                }],
                width: init.width || 500,
                //IE8 is wrapping labels in ext 2.* radiogroups. This will adjust for that
                //until a better fix is found
                height: init.height || (function () {
                    return Ext.isIE8 ? 400 : 350;
                } ()),
                layout: init.layout || 'fit',
                closeAction: init.closeAction || 'close',
                items: new Ext.FormPanel({
                    labelAlign: init.labelAlign || 'left',
                    labelWidth: init.labelWidth || 125,
                    layout: 'form',
                    border: init.border || false,
                    style: init.style || 'padding:5px',
                    items: $items,
                    buttons: [{
                        text: 'OK',
                        handler: function () {
                            //if OK callback exists, call it and return
                            if (init.ok && typeof (init.ok) === 'function') {
                                return init.ok(scope);
                            }
                            //get references to the required fields
                            var win = Ext.getCmp(scope.config.editorWindow),
                            eField = Ext.getCmp(editorFields.entityField),
                            gField = Ext.getCmp(editorFields.groupField),
                            dField = Ext.getCmp(editorFields.dimensionField),
                            mField = Ext.getCmp(editorFields.metricField),
                            callWidget = Ext.getCmp(scope.config.panel), //return focus here
                            att, prop, uri = [], flag = true;
                            //set the flag if needed fields are blank
                            if (!eField.validate() || !gField.validate() ||
                                !dField.validate() || !mField.validate()) {
                                flag = false;
                            }
                            //get the input VALUE of present fields
                            if (editorFields.titleField) { scope.config.title = Ext.getCmp(editorFields.titleField).getValue(); }
                            if (editorFields.captionField) { scope.config.subtitle = Ext.getCmp(editorFields.captionField).getValue(); }
                            if (editorFields.xAxisField) { scope.config.xAxisName = Ext.getCmp(editorFields.xAxisField).getValue(); }
                            if (editorFields.yAxisField) { scope.config.yAxisName = Ext.getCmp(editorFields.yAxisField).getValue(); }
                            if (editorFields.goalField) { scope.config.goal = Ext.getCmp(editorFields.goalField).getValue(); }
                            if (editorFields.truncField) { scope.config.truncNum = Ext.getCmp(editorFields.truncField).getValue(); }

                            //assemble the url ['datasource'] to call for the data
                            uri.push('slxdata.ashx/slx/crm/-/analytics?');
                            if (scope.config.entity) { uri.push('entity=', encodeURI(scope.config.entity), '&'); }
                            if (scope.config.groupname) { uri.push('groupname=', encodeURI(scope.config.groupname), '&'); }
                            if (scope.config.dimension) { uri.push('dimension=', encodeURI(scope.config.dimension), '&'); }
                            if (scope.config.metric) { uri.push('metric=', encodeURI(scope.config.metric), '&'); }
                            if (scope.config.limit) { uri.push('limit=', encodeURI(scope.config.limit), '&'); }
                            //for pie...
                            if (scope.config.combineother === 'true') {
                                uri.push('combineother=true');
                            }
                            //check for user overrides here
                            for (prop in scope.definition.qsParams) {
                                if (scope.definition.qsParams.hasOwnProperty(prop)) {
                                    uri.push('&', prop, '=', encodeURI(scope.definition.qsParams[prop]));
                                }
                            }
                            //join the finished datasource
                            scope.config.datasource = uri.join('');
                            //call to init() for changes if required fields aren't blank
                            if (flag) {
                                //keep the _options object up to date for persisting
                                //the reverse of the setData for-in loop
                                for (att in scope.config) {
                                    //filter out unwanted...
                                    if (scope.config.hasOwnProperty(att)) {
                                        if (!scope.definition.filterList[att]) {
                                            scope._options[att] = scope.config[att];
                                        }
                                    }
                                }
                                scope.config.edited = true;
                                //save the page
                                scope.fireEvent('persist');
                                //redraw
                                scope.init();
                                //close the editor
                                win.close();
                                //return focus to the calling widget panel
                                callWidget.focus();
                            }
                            //when the if() is skipped the first offending field will be shown
                        },
                        scope: scope
                    },
                    {
                        text: Sage.Analytics.WidgetResource.cancel,
                        handler: function () {
                            var win = Ext.getCmp(scope.config.editorWindow),
                            callWidget = Ext.getCmp(scope.config.panel);
                            win.close();
                            callWidget.focus();
                        }
                    }] //end buttons              
                })
            });
        },
        titleField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblTitle,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.title) {
                                txtField.setRawValue(scope.config.title);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end titlefield
        //allow for user defined field types
        //@param obj is an object containing
        //setup info for the custom field being made
        customField: function (obj) {
            var ret = {}, prop;
            for (prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    ret[prop] = obj[prop];
                }
            }
            return ret;
        }, //end custom field
        entityField: function (id, gcid, dcid, mcid, groupListURL, dimensionURL, metricURL, scope) {
            return {
                id: id,
                xtype: 'combo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblEntity,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyEntity,
                store: new Ext.data.JsonStore({
                    autoLoad: true,
                    url: 'slxdata.ashx/slx/crm/-/groups/context/entityList?filter=analytics',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['fullName', 'displayName'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var ent, win = Ext.getCmp(scope.config.editorWindow),
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets 
                                len = records.length, i;
                                win.el.unmask();
                                ent = scope.config.entity;
                                if (ent) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.fullName === ent) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, ent);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'fullName',
                displayField: 'displayName',
                mode: 'local',
                listeners: {
                    'change': function (combo, newVal, oldVal) {
                        var entityName = newVal.replace("Sage.Entity.Interfaces.I", ""),
                        grpCombo = Ext.getCmp(gcid),
                        gstore = grpCombo.getStore(),
                        dimensionCombo = Ext.getCmp(dcid),
                        dstore = dimensionCombo.getStore(),
                        metricCombo = Ext.getCmp(mcid),
                        mstore = metricCombo.getStore();
                        gstore.proxy.conn.url = String.format(groupListURL, entityName);
                        gstore.load();
                        dstore.proxy.conn.url = String.format(dimensionURL, entityName);
                        dstore.load();
                        mstore.proxy.conn.url = String.format(metricURL, entityName);
                        mstore.load();
                    },
                    'select': {
                        fn: function (combo, record, index) {
                            var gCombo = Ext.getCmp(gcid),
                            dCombo = Ext.getCmp(dcid),
                            mCombo = Ext.getCmp(mcid);
                            scope.config.entity = record.get(combo.valueField);
                            gCombo.setValue('');
                            dCombo.setValue('');
                            mCombo.setValue('');
                        },
                        scope: scope
                    } //end select
                } //end ecid listeners
            };
        }, //end entityfield
        groupField: function (id, scope) {
            return {
                id: id,
                xtype: 'combo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblGroup,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyGroup,
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/groups/context/grouplist/Account',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['groupId', 'groupName', 'displayName', 'isAdHoc'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var grp,
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets 
                                len = records.length, i;
                                grp = scope._options.groupname;
                                if (grp) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.groupName === grp) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, grp);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'groupName',
                displayField: 'displayName',
                mode: 'local',
                listeners: {
                    'select': {
                        fn: function (combo, record, index) {
                            //the VALUES will be stored not the display names
                            scope.config.groupname = Ext.util.Format.htmlEncode(record.get(combo.valueField));
                            scope.config.groupid = record.get('groupId');
                        },
                        scope: scope
                    }
                } //end listeners
            };
        }, //end groupfield
        dimensionField: function (id, scope) {
            return {
                id: id,
                xtype: 'tooltipcombo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblDimension,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyDimension,
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/analytics/dimension/Opportunity',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['name', 'displayName', 'analyticsDescription'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var dim,
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets
                                len = records.length, i;
                                dim = scope._options.dimension;
                                if (dim) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.name === dim) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, dim);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'name',
                displayField: 'displayName',
                tooltipField: 'analyticsDescription',
                mode: 'local',
                tipDisplayMode: 'inline',
                listeners: {
                    'select': {
                        fn: function (combo, record, index) {
                            //the VALUES will be stored not the display names
                            scope.config.dimension = record.get(combo.valueField);
                        },
                        scope: scope
                    }
                }
            };
        }, //end dimensionField
        metricField: function (id, scope) {
            return {
                id: id,
                xtype: 'tooltipcombo',
                forceSelection: true,
                triggerAction: 'all',
                fieldLabel: Sage.Analytics.WidgetResource.lblMetric,
                anchor: '97%',
                allowBlank: false,
                emptyText: Sage.Analytics.WidgetResource.emptyMetric,
                store: new Ext.data.JsonStore({
                    autoLoad: false,
                    url: 'slxdata.ashx/slx/crm/-/analytics/metric/Opportunity',
                    root: 'items',
                    totalProperty: 'total_count',
                    fields: ['name', 'displayName', 'analyticsDescription'],
                    listeners: {
                        'load': {
                            fn: function ($this, records, options) {
                                //is there data for entity here?
                                var met,
                                //get a ref to the combo box
                                combo = Ext.getCmp(id),
                                //the @len var will save lookup time for large datasets 
                                len = records.length, i;
                                met = scope._options.metric;
                                if (met) {
                                    //iterate over records[].data and locate entity k:v
                                    for (i = 0; i < len; i++) {
                                        if (records[i].data.name === met) {
                                            //set the display name of the matching fullname
                                            combo.el.removeClass('x-form-empty-field');
                                            combo.setRawValue(records[i].data.displayName);
                                            combo.fireEvent('change', combo, met);
                                        }
                                    }
                                }
                            },
                            scope: scope
                        }
                    }
                }),
                valueField: 'name',
                displayField: 'displayName',
                tooltipField: 'analyticsDescription',
                mode: 'local',
                tipDisplayMode: 'inline',
                listeners: {
                    'select': {
                        fn: function (combo, record, index) {
                            //the VALUES will be stored not the display names
                            scope.config.metric = record.get(combo.valueField);
                        },
                        scope: scope
                    }
                }
            };
        }, //end metricfield
        captionField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblCaption,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.subtitle) {
                                txtField.setRawValue(scope.config.subtitle);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end captionfield
        xAxisField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblXaxis,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.xAxisName) {
                                txtField.setRawValue(scope.config.xAxisName);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end xAxis
        yAxisField: function (id, scope) {
            return {
                id: id,
                xtype: 'textfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblYaxis,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.yAxisName) {
                                txtField.setRawValue(scope.config.yAxisName);
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end yaxis
        goalField: function (id, scope) {
            return {
                id: id,
                xtype: 'numberfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblGoal,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.goal) {
                                txtField.setRawValue(scope.config.goal);
                            }
                        }
                    },
                    scope: scope
                }
            };
        }, //end goalField
        truncField: function (id, scope) {
            return {
                id: id,
                xtype: 'numberfield',
                fieldLabel: Sage.Analytics.WidgetResource.lblMaxLength,
                anchor: '97%',
                listeners: {
                    'render': {
                        fn: function () {
                            //need a ref to the textfield
                            var txtField = Ext.getCmp(id);
                            //check if a title exists
                            if (scope.config.truncNum) {
                                txtField.setRawValue(scope.config.truncNum);
                            }
                        }
                    },
                    scope: scope
                }
            };
        }, //end goalField
        radioNames: function (id, rdo, txt, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblNames,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdLabels', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdLabels', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.showLabels = checked.inputValue;
                            var rdoTrunc = Ext.getCmp(rdo),
                            txtTrunc = Ext.getCmp(txt);
                            if (checked.inputValue === 'true') {
                                rdoTrunc.enable();
                                txtTrunc.enable();
                            } else {
                                rdoTrunc.disable();
                                txtTrunc.disable();
                            }
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id),
                            rdoTrunc = Ext.getCmp(rdo),
                            txtTrunc = Ext.getCmp(txt);
                            if (scope._options.showLabels === 'true') {
                                rdoGroup.setValue([true, false]);
                                if (rdoTrunc.disabled) { rdoTrunc.enable(); }
                                if (txtTrunc.disabled) { txtTrunc.enable(); }
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                                if (!rdoTrunc.disabled) { rdoTrunc.disable(); }
                                if (!txtTrunc.disabled) { txtTrunc.disable(); }
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end radioNames
        radioTruncate: function (id, txt, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblTruncate,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdTrunc', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdTrunc', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            var txtTrunc = Ext.getCmp(txt);
                            scope.config.truncLabels = checked.inputValue;
                            if (checked.inputValue === 'true') {
                                txtTrunc.enable();
                            } else {
                                txtTrunc.disable();
                            }
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id),
                            txtTrunc = Ext.getCmp(txt);
                            if (scope._options.truncLabels === 'true') {
                                rdoGroup.setValue([true, false]);
                                txtTrunc.enable();
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                                txtTrunc.disable();
                            }
                        },
                        scope: scope
                    }
                }
            };
        }, //end radioTrunc
        radioSlices: function (id, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblSlices,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.five, name: 'rdSlices', inputValue: '5' },
                    { boxLabel: Sage.Analytics.WidgetResource.ten, name: 'rdSlices', inputValue: '10' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.limit = checked.inputValue;
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id);
                            rdoGroup.setValue(scope._options.limit);
                        },
                        scope: scope
                    }
                } //end listeners
            };
        }, //end radioSlices
        radioOther: function (id, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblOther,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdOther', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdOther', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.combineother = checked.inputValue;
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id);
                            if (scope.config.combineother === 'true') {
                                rdoGroup.setValue([true, false]);
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                            }
                        },
                        scope: scope
                    }
                } //end listeners
            };
        },
        radioLegend: function (id, scope) {
            return {
                xtype: 'radiogroup',
                id: id,
                fieldLabel: Sage.Analytics.WidgetResource.lblLegend,
                items: [
                    { boxLabel: Sage.Analytics.WidgetResource.yes, name: 'rdLegend', inputValue: 'true' },
                    { boxLabel: Sage.Analytics.WidgetResource.no, name: 'rdLegend', inputValue: 'false' }
                ],
                listeners: {
                    'change': {
                        fn: function ($this, checked, loaded) {
                            scope.config.showLegend = checked.inputValue;
                        },
                        scope: scope
                    },
                    'render': {
                        fn: function () {
                            var rdoGroup = Ext.getCmp(id);
                            if (scope.config.showLegend === 'true') {
                                rdoGroup.setValue([true, false]);
                            }
                            else {
                                rdoGroup.setValue([false, true]);
                            }
                        },
                        scope: scope
                    }
                } //end listeners
            };
        } //end radiolegend
    }, //end markup object
    //@param coll is either an array of strings or a single string
    //@param num is the max length desired for the string(s)
    //return it/them at max length with '...'
    truncate: function (val, num) {
        var i = 0, len = val.length, res = [];
        //num needs to be an int
        if (typeof num === 'string') {
            num = parseInt(num, 10);
        }
        //we might just be truncating a string, not an array of them
        if (typeof val === 'string') {
            //don't slice and append to strings smaller than num
            return val.length > num ? val.slice(0, num) + '...' : val;
        }
        //good browsers will provide higher-order functions (fast)
        if (val.map && typeof val.map === 'function') {
            //map calls the anon func with val[i], i, and val
            return val.map(function (v, i, c) {
                return v.length > num ? v.slice(0, num) + '...' : v;
            });
        }
        //fallback for IE
        else {
            for (i; i < len; i++) {
                res.push(val[i].slice(0, num) + '...');
            }
            return res;
        }
    }, //end truncate
    //return a localized value if it exists
    localize: function (val) {
        function keyify(key) {
            return key ? key.replace(/[^a-zA-Z0-9]/g, '_') : "";
        }
        return Sage.Analytics.WidgetResource[keyify(val)] ? Sage.Analytics.WidgetResource[keyify(val)] : val;
    }, //end localize
    //stored definitions of widgets 
    WidgetDefinitions: {}
};  //end Sage.Analytics

Sage.TaskPaneItem = function(workspace, options) {
    this._workspace = workspace;
    this._options = options;
    this._events = {};
};

Sage.TaskPaneItem.prototype.getWorkspace = function() { return this._workspace; };
Sage.TaskPaneItem.prototype.getId = function() { return this._options.Id; };
Sage.TaskPaneItem.prototype.getClientId = function() { return this._options.ClientId; };
Sage.TaskPaneItem.prototype.getTitle = function() { return this._options.Title; };
Sage.TaskPaneItem.prototype.getDescription = function() { return this._options.Description; };
Sage.TaskPaneItem.prototype.getIsCollapsed = function() { return this._options.IsCollapsed; };
Sage.TaskPaneItem.prototype.setIsCollapsed = function(v) { this._options.IsCollapsed = v; };
Sage.TaskPaneItem.prototype.getElement = function() { return document.getElementById(this.getClientId()); };
Sage.TaskPaneItem.prototype.addListener = function(event, listener, context) {
    this._events[event] = this._events[event] || [];
    this._events[event].push({
        listener: listener,
        context: context
    });
};
Sage.TaskPaneItem.prototype.removeListener = function(event, listener, context) {
    if (this._events[event])
    {
        if (listener) 
        {
            for (var i = 0; i < this._events[event].length; i++)
                if (this._events[event][i].listener == listener)
                    break;
                
            this._listeners[event].splice(i, 1); //remove first
        }
        else
            this._listeners[event] = []; //remove all
    }    
};
Sage.TaskPaneItem.prototype.purgeListeners = function() {
    this._events = {};
};
Sage.TaskPaneItem.prototype.fireEvent = function(event, args) {
    if (this._events[event])
        for (var i = 0; i < this._events[event].length; i++)
            this._events[event][i].listener.apply(this._events[event][i].context || this._events[event][i].listener, args);  
};
Sage.TaskPaneItem.prototype.toggle = function() {
    var collapsed = this.getIsCollapsed();
    
    if (collapsed)
    {    
        $(this.getElement())
            .removeClass("task-pane-item-collapsed")
            .find(".task-pane-item-toggler")
            .attr("title", TaskPaneResources.Minimize)
            .find("img")
            .attr("src", this.getWorkspace().getOptions().MinimizeImage);               
        collapsed = false;
    }
    else
    {
        $(this.getElement())
            .addClass("task-pane-item-collapsed")
            .find(".task-pane-item-toggler")
            .attr("title", TaskPaneResources.Maximize)
            .find("img")
            .attr("src", this.getWorkspace().getOptions().MaximizeImage);
        collapsed = true;
    }
    
    this.fireEvent("toggled", [this, {collapsed: collapsed}]);
    
    //TODO: notify workspace of state change
    this.setIsCollapsed(collapsed);
    this.getWorkspace().persistState();
};

Sage.TaskPaneWorkspace = function(options) {
    this._options = options;  
    this._cache = {};
    this._items = [];    
    this._lookup = {
        byId: {},
        byClientId: {}
    };
    
    for (var i = 0; i < options.Items.length; i++)
    {
        var item = new Sage.TaskPaneItem(this, options.Items[i]);  
        this._lookup.byId[item.getId()] = item;
        this._lookup.byClientId[item.getClientId()] = item;
        
        this._items.push(item);
    }
    
    Sage.TaskPaneWorkspace.registerInstance({id: options.Id, clientId: options.ClientId}, this);
};

Sage.TaskPaneWorkspace.__instances = {byId: {}, byClientId: {}}; 
Sage.TaskPaneWorkspace.registerInstance = function(options, instance) { 
    Sage.TaskPaneWorkspace.__instances.byId[options.id] = instance;
    Sage.TaskPaneWorkspace.__instances.byClientId[options.clientId] = instance;   
}; 

Sage.TaskPaneWorkspace.getInstance = function(id) {
    return Sage.TaskPaneWorkspace.__instances.byId[id];  
};

Sage.TaskPaneWorkspace.getInstanceFromClientId = function(clientId) {
    return Sage.TaskPaneWorkspace.__instances.byClientId[clientId];
};

Sage.TaskPaneWorkspace.prototype.getId = function() { return this._options.Id; };
Sage.TaskPaneWorkspace.prototype.getClientId = function() { return this._options.ClientId; };
Sage.TaskPaneWorkspace.prototype.getUIStateServiceKey = function() { return this._options.UIStateServiceKey; };
Sage.TaskPaneWorkspace.prototype.getUIStateServiceProxyType = function() { return this._options.UIStateServiceProxyType; };
Sage.TaskPaneWorkspace.prototype.getOptions = function() { return this._options; };
Sage.TaskPaneWorkspace.prototype.getContext = function() { return this._context; };
Sage.TaskPaneWorkspace.prototype.getCache = function() { return this._cache; };
Sage.TaskPaneWorkspace.prototype.getItems = function() { return this._items; };
Sage.TaskPaneWorkspace.prototype.getItem = function(id) { return this._lookup.byId[id]; };
Sage.TaskPaneWorkspace.prototype.getItemFromClientId = function(id) { return this._lookup.byClientId[id]; };

Sage.TaskPaneWorkspace.prototype.initRequestManagerEvents = function() {
    var prm = Sys.WebForms.PageRequestManager.getInstance();
    prm.add_pageLoading(function(sender, args) {
        var panels = args.get_panelsUpdating();
        if (panels)
        {            
            for (var i = 0; i < panels.length; i++)
            {
                var $parent = $(panels[i]).parent(".task-pane");
                if ($parent.length > 0)
                {
                    var id = $parent.attr("id");
                    var instance = Sage.TaskPaneWorkspace.getInstanceFromClientId(id);
                    if (instance)
                    {
                        instance.purgeListeners();                        
                    }       
                }
            }            
        }
    });
    prm.add_pageLoaded(function(sender, args) {        
        var panels = args.get_panelsUpdated();
        if (panels)
        {            
            for (var i = 0; i < panels.length; i++)
            {
                var $parent = $(panels[i]).parent(".task-pane");
                if ($parent.length > 0)
                {
                    var id = $parent.attr("id");
                    var instance = Sage.TaskPaneWorkspace.getInstanceFromClientId(id);
                    if (instance)
                    {
                        instance.initContext();
                        instance.initCaches();
                        instance.initInteractions();
                        instance.updateVisualStyles();
                    }       
                }
            }            
        }
    });   
};

Sage.TaskPaneWorkspace.prototype.init = function() {
    var self = this;
    
    this.initRequestManagerEvents();
    this.initContext();
    this.initCaches();
    this.initInteractions();
        
    this.updateVisualStyles();  
};

Sage.TaskPaneWorkspace.prototype.purgeListeners = function() {
    for (var i = 0; i < this._items.length; i++)
        this._items[i].purgeListeners();
};

Sage.TaskPaneWorkspace.prototype.initContext = function() {
    if (document.getElementById)
        this._context = document.getElementById(this.getClientId());
};

Sage.TaskPaneWorkspace.prototype.initCaches = function() {
    this._cache.items = $(".task-pane-item:not(.ui-sortable-helper)", this._context);
    this._cache.headers = $(".task-pane-item-header:not(.ui-sortable-helper)", this._context);
};

Sage.TaskPaneWorkspace.prototype.initInteractions = function() {
    var self = this;
    
    jQuery.each(this.getItems(), function() {
        $(this.getElement()).find(".task-pane-item-toggler").bind("click", this, function(e) {
            e.data.toggle();
        });    
    });   
    
    
    var container = this.getOptions().SortDragContainer || $(this._context).parent().attr("id");    
    if (container)
        container = "#" + container;          
    else
        container = "parent";  
            
    if (this.getItems().length > 0)
    {
        $(".task-pane-item-container", this._context).sortable({
            axis: "y",
            items: ".task-pane-item",
            handle: ".task-pane-item-handle",
            revert: false,
            containment: container,
            helper: function(e, el) {
                var handle = $(el).find(".task-pane-item-handle");
                var clone = handle.clone()
                    .addClass("task-pane-drag-helper")
                    .css("width", handle.width() + "px");
                
                return clone.get(0);
            },
            delay: 50,
            scroll: true,
            update: function(e, ui) {
                self.initCaches(); //re-sync caches
                self.updateVisualStyles();
                self.persistState();
            }
        });
    }
};

Sage.TaskPaneWorkspace.prototype.updateVisualStyles = function() {
    //set first & last styling
    this._cache.items.removeClass("task-pane-item-first task-pane-item-last");
    this._cache.items.filter(":first").addClass("task-pane-item-first");
    this._cache.items.filter(":last").addClass("task-pane-item-last");
};

Sage.TaskPaneWorkspace.prototype.buildState = function() {
    var self = this;
    var state = {
        Order: [],
        Collapsed: []
    };
    this._cache.items.each(function() {
        var item = self.getItemFromClientId(this.id); 
        
        state.Order.push(item.getId());
        if ($(this).hasClass("task-pane-item-collapsed"))  
            state.Collapsed.push(item.getId());       
    });
    
    return state;
};

Sage.TaskPaneWorkspace.prototype.persistState = function() {
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "UIStateService.asmx/StoreTaskPaneWorkspaceState",
        data: Ext.util.JSON.encode({
            key: this.getUIStateServiceKey(),
            state: this.buildState()
        }),
        dataType: "json",
        error: function (request, status, error) {            
        },
        success: function(data, status) {            
        }
    });
};


Sage.SalesLogix.DashboardPage = Ext.extend(function (options, pageNum, dashboard) {
    var self = this;
    this.cellCount = 0;
    this.pageNumber = pageNum;
    this.dashboard = dashboard;
    this.dirty = false;
    function addCol(c) {
        function addCell(widget, col) {
            var cell = self.createCellObject(widget['@family'], widget['@name'], self.pageNumber, col);
            cell.widgetObject._options = widget['options'];
            return cell;
        }
        var col = self.createColumnObject(c['@width']);
        if (c.Widgets != null) {
            if (Ext.isArray(c.Widgets.Widget)) {
                for (var i = 0; i < c.Widgets.Widget.length; i++)
                    col.items.push(addCell(c.Widgets.Widget[i], col));
            } else {
                col.items.push(addCell(c.Widgets.Widget, col));
            }
        }
        return col;
    }

    if (typeof options.Columns === 'undefined') {
        options = Sys.Serialization.JavaScriptSerializer.deserialize(options).Dashboard;
    }
    this._options = options;
    this._columns = [];
    if (Ext.isArray(options.Columns.Column)) {
        for (var idx = 0; idx < options.Columns.Column.length; idx++) {
            var c = options.Columns.Column[idx];
            this._columns.push(addCol(c));
        }
    } else {
        this._columns.push(addCol(options.Columns.Column));
    }
    this.items = this._columns;
    this.title = options['@title'];
    this.name = options['@name'];
    this.family = options['@family'];
},
    {
        xtype: 'portal',
        region: 'center',
        margins: '35 5 5 0',
        border: false,
        visible: true,
        listeners: {
            drop: function () {
                AutoLogout.resetTimer();
                this.dirty = true;
                this.save();
            }
        },

        createColumnObject: function (width) {
            return { columnWidth: parseFloat(width) > 1 ? parseFloat(width) / 100 : parseFloat(width),
                style: 'padding:10px 0px 10px 10px',
                items: []
            }
        },

        createCellObject: function (family, name, portalNum, column) {
            var currentDashboardPage = this;
            var id = String.format("cell_{0}_page_{1}_display", ++this.cellCount, portalNum);
            var cell = {
                id: id,
                stateful: false,
                cls: 'sage-widget-panel',
                title: name + (this.cellCount),
                tools: [
                    { id: 'refresh',
                        handler: function (e, target, panel) {
                            panel.widgetObject.refresh();
                        },
                        qtip: DashboardResource.Refresh
                    },
                    { id: 'gear',
                        qtip: 'Edit',
                        handler: function (e, target, panel) {
                            //pass the widget a unique id for the editor window
                            panel.widgetObject.editor(Sage.Analytics.generateString('dwEditor'));
                        }
                    },
                    { id: 'close',
                        qtip: DashboardResource.Close,
                        handler: function (e, target, panel) {
                            panel.ownerCt.remove(panel, false);
                            panel.hide();
                            currentDashboardPage.dirty = true;
                            currentDashboardPage.save();
                        }
                    }
                ],
                collapsible: false,
                style: 'padding:0px 0px 10px 0px',
                location: { dashboard: portalNum, cellitem: id },
                autoDestroy: false,
                bbar: []
            };
            var widgetObject = new Sage.Analytics.DashboardWidget({ name: name, family: family, cell: cell,
                listeners: {
                    afterdisplay: function () {
                        mainViewport.findById("center_panel_center").doLayout();
                    },
                    persist: function () {
                        if (this.config.edited) { currentDashboardPage.dirty = true; }
                        currentDashboardPage.save();
                    }
                } //end listeners
            });
            cell.widgetObject = widgetObject;
            return cell;
        },

        init: function () { },

        loadWidgets: function () {
            var panel = mainViewport.findById("portal_panel_" + this.dashboardPagesIndex);
            var curcols = panel.items.items;
            for (var i = 0; i < curcols.length; i++) {
                if (curcols[i].items) {
                    for (var j = 0; j < curcols[i].items.items.length; j++) {
                        if (!curcols[i].items.items[j].widgetObject.config.loaded) {
                            curcols[i].items.items[j].widgetObject.init();
                        }
                    }
                }
            }
        },

        toSerializeableObject: function () {
            var pageObject = DashboardPages[this.dashboardPagesIndex];
            if (typeof pageObject.Dashboard === 'undefined') {
                pageObject = Sys.Serialization.JavaScriptSerializer.deserialize(pageObject);
            }
            pageObject.Dashboard['@title'] = this.title;
            var curcols = mainViewport.findById("portal_panel_" + this.dashboardPagesIndex).items.items;
            for (var i = 0; i < curcols.length; i++) {
                if (i === pageObject.Dashboard.Columns.Column.length)
                    pageObject.Dashboard.Columns.Column.push({});
                pageObject.Dashboard.Columns.Column[i]['@width'] = curcols[i].columnWidth;
                pageObject.Dashboard.Columns.Column[i].Widgets = {};
                pageObject.Dashboard.Columns.Column[i].Widgets.Widget = [];
                if (curcols[i].items) {
                    for (var j = 0; j < curcols[i].items.items.length; j++) {
                        var widget = curcols[i].items.items[j].widgetObject;
                        var newobj = {};
                        newobj["@name"] = widget.config.name;
                        newobj["@family"] = widget.config.family;
                        newobj["options"] = widget._options;
                        delete newobj["options"].cell;
                        pageObject.Dashboard.Columns.Column[i].Widgets.Widget.push(newobj);
                    }
                }
            }
            while (curcols.length < pageObject.Dashboard.Columns.Column.length) {
                pageObject.Dashboard.Columns.Column.remove(pageObject.Dashboard.Columns.Column.length - 1);
            }
            return pageObject;
        },

        save: function (callback) {
            var self = this;
            if (!self.dirty) {
                if (typeof callback === "function") callback();
                return;
            }
            self.dirty = false;
            var thisPageSerialized = Sys.Serialization.JavaScriptSerializer.serialize(this.toSerializeableObject());
            for (var i = 0; i < DashboardPages.length; i++) {
                if (Sys.Serialization.JavaScriptSerializer.deserialize(DashboardPages[i]).Dashboard["@name"] == self.name) {
                    DashboardPages[i] = thisPageSerialized;
                    break;
                }
            }
            $.ajax({
                type: "POST",
                    url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?name={0}&family={1}", this.name, this.family),
                    data: thisPageSerialized,
                    processData: false,
                error: function (request, status, error) {
                    Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                },
                success: function (data, status) {
                        if (data != "Success") {
                            Ext.Msg.confirm(DashboardResource.Warning, data + "<br>" + DashboardResource.PersonalCopy,
                            function (btn) {
                                if (btn == 'yes') {
                                    self.createCopy();
                                }
                            }
                        );
                        return;
                    }
                    if (typeof callback === "function") callback(data, status);
                }
            });
        },

        share: function (callback) {
            var self = this;
            this.save(function () {
                var win = new Ext.Window({ title: DashboardResource.Share,
                    width: parseInt(DashboardResource.Popup_Width),
                    height: parseInt(DashboardResource.Popup_Height),
                    layout: 'fit',
                    autoScroll: true,
                    tools: [{ id: 'help',
                        handler: function (evt, toolEl, panel) {
                            window.open('help/WebClient_CSH.htm#Working_with_the_Dashboard', "MCWebHelp");
                        }
                    }],
                    buttons: [
                                {
                                    text: DashboardResource.Ok,
                                    handler: function (t, e) {
                                        var ownerarray = [];  //self.shareOwners.split(',');
                                        var items = Ext.getCmp('ReleasedGrid').store.data.items;
                                        for (var i = 0; i < items.length; i++) {
                                            ownerarray.push(items[i].data.Id);
                                        }
                                        if (ownerarray.length == 0) ownerarray.push("unrelease");
                                        $.ajax({
                                            type: "POST",
                                            url: String.format("slxdata.ashx/slx/crm/-/dashboard/release?name={0}&family={1}",
                                                self.name,
                                                self.family),
                                            data: Sys.Serialization.JavaScriptSerializer.serialize(ownerarray),
                                            processData: false,
                                            error: function (request, status, error) {
                                                Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                                            },
                                            success: function (data, status) {
                                                if (data != "Success") {
                                                    Ext.Msg.alert(DashboardResource.Warning, data);
                                                    return;
                                                }
                                                if (typeof callback === "function") callback(data, status);
                                            }
                                        });
                                        win.close();
                                    }
                                }, {
                                    text: DashboardResource.Cancel,
                                    handler: function (t, e) {
                                        win.close();
                                    }
                                }
                            ]
                });

                $.ajax({
                    type: "GET",
                    url: "slxdata.ashx/slx/crm/-/dashboard/release",
                    cache: false,
                    data: { name: self.name,
                        family: self.family
                    },
                    error: function (request, status, error) {
                        Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                    },
                    success: function (data, status) {
                        var storedata = {};
                        //var res = Ext.DomQuery.select("string", data)[0].textContent || Ext.DomQuery.select("string", data)[0].text;
                        storedata.items = Sys.Serialization.JavaScriptSerializer.deserialize(data);
                        var grid = new Ext.grid.GridPanel({
                            buttonAlign: 'center',
                            store: new Ext.data.JsonStore({
                                autoDestroy: true,
                                fields: ['Id', 'Text'],
                                root: 'items',
                                data: storedata
                            }),
                            colModel: new Ext.grid.ColumnModel({
                                defaults: {
                                    //width: 120,
                                    sortable: false
                                },
                                columns: [
                                    { header: Sage.Analytics.WidgetResource.releasedTo, dataIndex: 'Text' }
                                ]
                            }),
                            sm: new Ext.grid.RowSelectionModel({ singleSelect: false }),
                            //width: 140,
                            //height: 250,
                            frame: true,
                            id: 'ReleasedGrid',
                            buttons: [{
                                text: Sage.Analytics.WidgetResource.everyone,
                                handler: function () {
                                    var grid = Ext.getCmp('ReleasedGrid');
                                    var found = false;
                                    for (var i = 0; i < grid.store.data.items.length; i++) {
                                        if (grid.store.data.items[i].data.Id === "SYST00000001") found = true;
                                    }
                                    if (!found) {
                                        var rec = new grid.store.recordType({ "Id": "SYST00000001", "Text": "Everyone" });
                                        grid.store.add(rec);
                                    }
                                }
                            },
                                {
                                    text: Sage.Analytics.WidgetResource.add,
                                    handler: function () {
                                        var vURL = 'OwnerAssign.aspx';
                                        window.open(vURL, "OwnerAssign", "resizable=yes,centerscreen=yes,width=500,height=450,status=no,toolbar=no,scrollbars=yes");
                                    }
                                },
                                {
                                    text: Sage.Analytics.WidgetResource.remove,
                                    handler: function () {
                                        var grid = Ext.getCmp('ReleasedGrid');
                                        var selected = grid.getSelectionModel().getSelections();
                                        for (var i = 0; i < selected.length; i++) {
                                            grid.store.remove(selected[i]);
                                        }
                                    }
                                }
                            ]
                        });
                        win.add(grid);
                        win.show();
                    }
                });
            });
        },

        createCopy: function () {
            var self = this;
            Ext.Msg.prompt(DashboardResource.Copy_Tab, String.format('{0}:', DashboardResource.Name), function (btn, text) {
                if ((btn == 'ok') && (text.length > 0)) {
                    text = Ext.util.Format.htmlEncode(text);
                    var pageObject = self.toSerializeableObject();
                    pageObject.Dashboard['@name'] = text;
                    pageObject.Dashboard['@title'] = text;
                    DashboardPages.push(Sys.Serialization.JavaScriptSerializer.serialize(pageObject));
                    mainViewport.findById("center_panel_center").removeAll();
                    slxDashboard = new Sage.SalesLogix.Dashboard(self.dashboard._options);
                    slxDashboard.init();
                    mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).dirty = true;
                    mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).save();
                    mainViewport.findById("dashboard_panel").activate("portal_panel_" + (DashboardPages.length - 1));
                }
            });
        },

        createTabContextMenu: function (portalNum) {
            var currentDashboardPage = this;
            var tcmenu = new Ext.menu.Menu({ items: [
                new Ext.menu.Item({
                    text: DashboardResource.New_Tab,
                    icon: false,
                    handler: function () {
                        Ext.Msg.prompt(DashboardResource.New_Tab, String.format('{0}:', DashboardResource.Name), function (btn, text) {
                            if ((btn == 'ok') && (text.length > 0)) {
                                text = Ext.util.Format.htmlEncode(text);
                                var DefaultPageString = String.format(currentDashboardPage.dashboard.defaultPageString, text);
                                DashboardPages.push(DefaultPageString);
                                mainViewport.findById("center_panel_center").removeAll();
                                slxDashboard = new Sage.SalesLogix.Dashboard(currentDashboardPage.dashboard._options);
                                slxDashboard.init();
                                mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).dirty = true;
                                mainViewport.findById("portal_panel_" + (DashboardPages.length - 1)).save();
                                mainViewport.findById("dashboard_panel").activate("portal_panel_" + (DashboardPages.length - 1));
                            }
                        });
                    }
                }),
                new Ext.menu.Item({
                    text: DashboardResource.Copy_Tab,
                    handler: function () {
                        currentDashboardPage.createCopy();
                    }
                }),
                new Ext.menu.Item({ text: DashboardResource.Add_Content, handler: function () {
                    var win = new Ext.Window({ title: DashboardResource.Add_New_Content,
                        width: parseInt(DashboardResource.Popup_Width),
                        height: parseInt(DashboardResource.Popup_Height),
                        layout: 'fit',
                        margins: { top: 10 },
                        buttons: [
                            {
                                text: DashboardResource.Cancel, handler: function (t, e) {
                                    currentDashboardPage.save();
                                    win.close();
                                }
                            }
                        ],
                        tools: [{ id: 'help',
                            handler: function (evt, toolEl, panel) {
                                window.open('help/WebClient_CSH.htm#Introducing_Widgets', "MCWebHelp");
                            }
                        }]
                    });
                    if (DashboardWidgetsList.length == 0) {
                        win.add(new Ext.Panel({ html: String.format("<p>{0}</p>", DashboardResource.NoUnusedContent) }));
                    } else {
                        var scrollpanel = new Ext.Panel({  //without a separate panel ie7 won't scroll
                            autoScroll: true,
                            layout: 'anchor',
                            layoutConfig: { defaultAnchor: '-25' },
                            border: false
                        });
                        win.add(scrollpanel);
                    }
                    for (var widgetid in DashboardWidgetsList) {
                        if (widgetid === 'Default') continue;
                        // Default Widget is a stub example for creating new widgets.  
                        // Click New and copy this content into a new editor to customize.  
                        // Default Widgets do not appear as an item in the client dashboard Add Content menu.

                        scrollpanel.add(new Ext.Panel({
                            cls: 'addContentPanels', //for styling
                            margins: { top: 10 },
                            border: false,
                            layout: 'anchor',
                            layoutConfig: { defaultAnchor: '100% 100%' },
                            items: [
                                { xtype: 'label',
                                    text: Sage.Analytics.localize(widgetid),
                                    style: "margin-left:18px;margin-top:16px;display:block;font-weight:bold"
                                },
                                { xtype: 'label',
                                    text: Sage.Analytics.localize(DashboardWidgetsList[widgetid])
                                    , style: "margin-left: 18px; display: block"
                                },
                                { xtype: 'button',
                                    text: DashboardResource.Add,
                                    name: widgetid,
                                    style: "margin-left: 18px;",
                                    listeners: { click: function (t, checked) {
                                        cell = currentDashboardPage.createCellObject(t.family, t.name, portalNum, 0);
                                        mainViewport.findById("portal_panel_" + portalNum).items.items[0].add(cell);
                                        mainViewport.findById("center_panel_center").doLayout();
                                        cell.widgetObject.init(true);
                                        currentDashboardPage.dirty = true;
                                        currentDashboardPage.save();
                                        win.close(); //close the add content menu after button push
                                    }
                                    }
                                }
                                ]
                        }));
                    }
                    if (typeof idPopupWindow != "undefined") {
                        win.on("show", function () { idPopupWindow(); });
                    }
                    win.show();
                }
                }),
                new Ext.menu.Item({ text: DashboardResource.Hide,
                    handler: function () {
                        mainViewport.findById("dashboard_panel").hideTabStripItem(portalNum);
                        currentDashboardPage.dashboard._options.hiddenPages.push(currentDashboardPage.name);
                        if (currentDashboardPage.name === currentDashboardPage.dashboard._options.defpage) {
                            currentDashboardPage.dashboard._options.defpage = '';
                        }
                        currentDashboardPage.dashboard._options.dirty = true;
                        currentDashboardPage.dashboard.ActivateVisible();
                    }
                }),
                new Ext.menu.Item({ text: DashboardResource.Show, handler: function () {
                    var win = new Ext.Window({ title: DashboardResource.Show,
                        width: parseInt(DashboardResource.Popup_Width),
                        height: parseInt(DashboardResource.Popup_Height),
                        buttons: [
                            { text: DashboardResource.Ok, handler: function (t, e) { win.close(); } }
                        ]
                    });
                    for (var i = 0; i < currentDashboardPage.dashboard._options.hiddenPages.length; i++) {
                        var newPanel = new Ext.Panel({ border: false, style: 'padding:10px' }); //was hbox
                        newPanel.add(new Ext.Button({
                            text: DashboardResource.Show,
                            name: currentDashboardPage.dashboard._options.hiddenPages[i],
                            panel: newPanel,
                            style: 'display:inline'
                        })).on("click", function (b) {
                            currentDashboardPage.dashboard._options.hiddenPages.remove(b.name);
                            currentDashboardPage.dashboard._options.dirty = true;
                            var panel = mainViewport.findById("dashboard_panel");
                            var tabid = "";
                            for (var i = 0; i < panel.items.items.length; i++) {
                                if (panel.items.items[i].name === b.name)
                                    tabid = panel.items.items[i].id;
                            }
                            mainViewport.findById("dashboard_panel").unhideTabStripItem(tabid);
                            win.remove(b.panel);
                        });
                        newPanel.add(new Ext.form.Label({ text: currentDashboardPage.dashboard._options.hiddenPages[i],
                            margins: "5",
                            style: 'display:inline;margin-left:10px'
                        }));
                        win.add(newPanel);
                    }
                    win.show();
                }
                }),
                new Ext.menu.Item({
                    text: DashboardResource.Delete_Tab,
                    handler: function () {
                        var confirm = Ext.Msg.confirm(DashboardResource.Delete_Tab, DashboardResource.ConfirmDelete, function (result) {
                            if (result == "yes") {
                                $.ajax({
                                    type: "DELETE",
                                    url: String.format("slxdata.ashx/slx/crm/-/dashboard/page?name={0}&family={1}",
                                        currentDashboardPage.name,
                                        currentDashboardPage.family),
                                    error: function (request, status, error) {
                                        Ext.Msg.alert(DashboardResource.Warning, request.responseText);
                                    },
                                    success: function (data, status) {
                                        if (data != "Success") {
                                            Ext.Msg.alert(DashboardResource.Warning, data);
                                            return;
                                        }
                                        currentDashboardPage.dashboard.deletePortal(portalNum);
                                    }
                                });
                            }
                        });
                    }
                }),
                 new Ext.menu.Item({ text: DashboardResource.Edit_Options, handler: function () {
                     var opWin = new Ext.Window({ title: DashboardResource.Edit_Options,
                         width: parseInt(DashboardResource.Popup_Width),
                         height: parseInt(DashboardResource.Popup_Height),
                         buttons:
                            [{ text: DashboardResource.Ok, handler: function (t, e) {
                                if ($("#PortalName")[0].value.length > 0) {
                                    var newName = Ext.util.Format.htmlEncode($("#PortalName")[0].value);
                                    if (currentDashboardPage.name != newName) {
                                        currentDashboardPage.name = newName;
                                    }
                                    var newTitle = Ext.util.Format.htmlEncode($("#PortalName")[0].value);
                                    if (currentDashboardPage.title != newTitle) {
                                        currentDashboardPage.title = newTitle;
                                        mainViewport.findById("portal_panel_" + portalNum).setTitle(newTitle);
                                    }
                                }
                                var dp = mainViewport.findById("dashboard_panel");
                                dp.setWidth(dp.getSize().width - 1); //firing resize without changing anything doesn't recalc
                                dp.setWidth(dp.getSize().width + 1);
                                opWin.close();
                                currentDashboardPage.save();
                                currentDashboardPage.dashboard.updateUserOptions();
                            }
                            }
                        ]
                     });
                     opWin.add(new Ext.Panel({
                         style: 'margin: 15px 5px;',
                         //layout: 'hbox',
                         items: [{ xtype: 'label',
                             text: DashboardResource.Title + ':  ',
                             border: false,
                             style: 'line-height: 22px'
                         },
                         { xtype: 'textfield',
                             id: "PortalName",
                             value: currentDashboardPage.title,
                             border: false,
                             listeners: { 'blur': function (t) {
                                 if (t.el.dom.value != currentDashboardPage.title)
                                     currentDashboardPage.dirty = true;
                             }
                             }
                         }
                         ],
                         border: false
                     }));
                     opWin.add(new Ext.Panel({
                         html: String.format("<div style='margin: 5px 5px'>{0}:</div>", DashboardResource.ChooseTemplate)
                        , border: false
                     }));

                     var layouts = [
                       { name: DashboardResource.TwoColSplit, layout: [.49, .49], imgUrl: 'images/icons/2col.gif' },
                     //{ name: DashboardResource.ThreeCol, layout: [.33, .33, .34], imgUrl: 'images/icons/3col.gif' },
                       {name: DashboardResource.TwoColLeft, layout: [.65, .33], imgUrl: 'images/icons/2col_bigL.gif' },
                       { name: DashboardResource.TwoColRight, layout: [.33, .65], imgUrl: 'images/icons/2col_bigR.gif' }
                     //{ name: DashboardResource.OneCol, layout: [.99], imgUrl: 'images/icons/1col.gif' }
                     ];
                     for (var i = 0; i < layouts.length; i++) {
                         var isCurLayout = layouts[i].layout.length === currentDashboardPage.items.length;
                         if (isCurLayout) {
                             for (var j = 0; j < layouts[i].layout.length; j++) {
                                 if (layouts[i].layout[j] != currentDashboardPage.items[j].columnWidth) {
                                     isCurLayout = false;
                                 }
                             }
                         }
                         opWin.add(new Ext.form.Radio({ boxLabel: String.format("<img src='{1}'> {0}", layouts[i].name, layouts[i].imgUrl),
                             name: "Layout",
                             id: String.format("layout_{0}_id", i),
                             layout: layouts[i].layout,
                             style: { marginLeft: '15px' },
                             boxMinHeight: '34px',
                             checked: isCurLayout
                         })).on("check", function (t, checked) {
                             if (checked) {
                                 if (t.layout[0] != currentDashboardPage.items[0].columnWidth) currentDashboardPage.dirty = true;
                                 var curcols = mainViewport.findById("portal_panel_" + currentDashboardPage.pageNumber).items.items;
                                 for (var j = 0; j < t.layout.length; j++) {
                                     if (curcols.length > j) {
                                         curcols[j].columnWidth = t.layout[j];
                                     } else {
                                         mainViewport.findById("portal_panel_" + currentDashboardPage.pageNumber).add(currentDashboardPage.createColumnObject(t.layout[j]));
                                     }
                                 }
                                 while (curcols.length > t.layout.length) {
                                     mainViewport.findById("portal_panel_" + currentDashboardPage.pageNumber).remove(currentDashboardPage.items.length - 1);
                                 }
                                 currentDashboardPage.items = curcols;
                                 mainViewport.findById("center_panel_center").doLayout(true);
                             }
                         });
                     }
                     var makeDefPanel = new Ext.Panel({ //needed for ie7 to align correctly
                         style: { marginTop: '20px', marginLeft: '5px' },
                         border: false
                     });
                     makeDefPanel.add(new Ext.form.Checkbox({ boxLabel: DashboardResource.Make_Default,
                         boxLabelStyle: { marginTop: '20px' },
                         checked: (currentDashboardPage.dashboard._options.defpage == currentDashboardPage.name)
                     })).on("check", function (t, checked) {
                         if (checked != currentDashboardPage.dashboard._options.defpage == currentDashboardPage.name) currentDashboardPage.dashboard._options.dirty = true;
                         if (checked) {
                             currentDashboardPage.dashboard._options.defpage = currentDashboardPage.name;
                         } else {
                             currentDashboardPage.dashboard._options.defpage = '';
                         }
                     });
                     opWin.add(makeDefPanel);

                     if (typeof idPopupWindow != "undefined") {
                         opWin.on("show", function () { idPopupWindow(); });
                     }
                     opWin.show();
                 }
                 }),
                new Ext.menu.Item({ text: DashboardResource.Share, handler: function () {
                    currentDashboardPage.share();
                }
                }),
                new Ext.menu.Separator(),
                new Ext.menu.Item({ text: DashboardResource.Help, handler: function () {
                    window.open('help/WebClient_CSH.htm#Working_with_the_Dashboard', "MCWebHelp");
                }
                })

                ]
            });

            if (typeof idMenuItems != "undefined") {
                tcmenu.on("show", function () { idMenuItems(); });
            }
            return tcmenu;
        }
    }
);


function ShareGroup_CallBack(ownerResultXML) {
    if (ownerResultXML) {
        var xmlDoc = getXMLDoc(ownerResultXML);
        var list = xmlDoc.documentElement.childNodes;
        var grid = Ext.getCmp('ReleasedGrid');
        for (var i = 0; i < list.length; i++) {
            var found = false;
            var val = getNodeText(list[i].getElementsByTagName("value")[0]);
            var name = getNodeText(list[i].getElementsByTagName("name")[0]);
            for (var i = 0; i < grid.store.data.items.length; i++) {
                if (grid.store.data.items[i].data.Id === val) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                var rec = new grid.store.recordType({ "Id": val, "Text": name });
                grid.store.add(rec);
            }
        }
    }
}



 
Ext.Container.prototype.bufferResize = false;
Ext.ux.Portal = Ext.extend(Ext.Panel, {
    layout: 'column',
    autoScroll: true,
    cls: 'x-portal',
    defaultType: 'portalcolumn',

    initComponent: function() {
        Ext.ux.Portal.superclass.initComponent.call(this);
        this.addEvents({
            validatedrop: true,
            beforedragover: true,
            dragover: true,
            beforedrop: true,
            drop: true
        });
    },

    initEvents: function() {
        Ext.ux.Portal.superclass.initEvents.call(this);
        this.dd = new Ext.ux.Portal.DropZone(this, this.dropConfig);
    }
});

Ext.reg('portal', Ext.ux.Portal);


Ext.ux.Portal.DropZone = function(portal, cfg) {
    this.portal = portal;
    Ext.dd.ScrollManager.register(portal.body);
    Ext.ux.Portal.DropZone.superclass.constructor.call(this, portal.bwrap.dom, cfg);
    portal.body.ddScrollConfig = this.ddScrollConfig;
};

Ext.extend(Ext.ux.Portal.DropZone, Ext.dd.DropZone, {   //Ext.dd.DropTarget
    ddScrollConfig: {
        vthresh: 50,
        hthresh: -1,
        animate: true,
        increment: 200
    },

    createEvent: function(dd, e, data, col, c, pos) {
        return {
            portal: this.portal,
            panel: data.panel,
            columnIndex: col,
            column: c,
            position: pos,
            data: data,
            source: dd,
            rawEvent: e,
            status: this.dropAllowed
        };
    },

    notifyOver: function(dd, e, data) {
        var xy = e.getXY(), portal = this.portal, px = dd.proxy;

        // case column widths
        if (!this.grid) {
            this.grid = this.getGrid();
        }

        // handle case scroll where scrollbars appear during drag
        var cw = portal.body.dom.clientWidth;
        if (!this.lastCW) {
            this.lastCW = cw;
        } else if (this.lastCW != cw) {
            this.lastCW = cw;
            portal.doLayout();
            this.grid = this.getGrid();
        }

        // determine column
        var col = 0, xs = this.grid.columnX, cmatch = false;
        for (var len = xs.length; col < len; col++) {
            if (xy[0] < (xs[col].x + xs[col].w)) {
                cmatch = true;
                break;
            }
        }
        // no match, fix last index
        if (!cmatch) {
            col--;
        }

        // find insert position
        var p, match = false, pos = 0,
            c = portal.items.itemAt(col),
            items = c.items.items;

        for (var len = items.length; pos < len; pos++) {
            p = items[pos];
            var h = p.el.getHeight();
            if (h !== 0 && (p.el.getY() + (h / 2)) > xy[1]) {
                match = true;
                break;
            }
        }

        var overEvent = this.createEvent(dd, e, data, col, c,
                match && p ? pos : c.items.getCount());

        if (portal.fireEvent('validatedrop', overEvent) !== false &&
           portal.fireEvent('beforedragover', overEvent) !== false) {

            // make sure proxy width is fluid
            px.getProxy().setWidth('auto');

            if (p) {
                px.moveProxy(p.el.dom.parentNode, match ? p.el.dom : null);
            } else {
                px.moveProxy(c.el.dom, null);
            }

            this.lastPos = { c: c, col: col, p: match && p ? pos : false };
            this.scrollPos = portal.body.getScroll();

            portal.fireEvent('dragover', overEvent);

            return overEvent.status; ;
        } else {
            return overEvent.status;
        }

    },

    notifyOut: function() {
        delete this.grid;
    },

    notifyDrop: function(dd, e, data) {
        delete this.grid;
        if (!this.lastPos) {
            return;
        }
        var c = this.lastPos.c, col = this.lastPos.col, pos = this.lastPos.p;

        var dropEvent = this.createEvent(dd, e, data, col, c,
            pos !== false ? pos : c.items.getCount());

        if (this.portal.fireEvent('validatedrop', dropEvent) !== false &&
           this.portal.fireEvent('beforedrop', dropEvent) !== false) {

            dd.proxy.getProxy().remove();
            dd.panel.el.dom.parentNode.removeChild(dd.panel.el.dom);

            if (pos !== false) {
                c.insert(pos, dd.panel);
            } else {
                c.add(dd.panel);
            }

            c.doLayout();

            this.portal.fireEvent('drop', dropEvent);

            // scroll position is lost on drop, fix it
            var st = this.scrollPos.top;
            if (st) {
                var d = this.portal.body.dom;
                setTimeout(function() {
                    d.scrollTop = st;
                }, 10);
            }

        }
        delete this.lastPos;
    },

    // internal cache of body and column coords
    getGrid: function() {
        var box = this.portal.bwrap.getBox();
        box.columnX = [];
        this.portal.items.each(function(c) {
            box.columnX.push({ x: c.el.getX(), w: c.el.getWidth() });
        });
        return box;
    }
});


Ext.ux.PortalColumn = Ext.extend(Ext.Container, {
    layout: 'anchor',
    autoEl: 'div',
    defaultType: 'portlet',
    cls: 'x-portal-column'
});
Ext.reg('portalcolumn', Ext.ux.PortalColumn);

Ext.ux.Portlet = Ext.extend(Ext.Panel, {
    anchor: '100%',
    frame: true,
    collapsible: true,
    draggable: true,
    cls: 'x-portlet'
});
Ext.reg('portlet', Ext.ux.Portlet);


//A FUNCTIONAL CONSTRUCTOR FOR WIDGET OBJECTS
Sage.Analytics.DashboardWidget = Ext.extend(Ext.util.Observable, {
    constructor: function (options) {
        this.config = {};
        //append the values from options
        this.config.name = options.name || '';
        this.config.family = options.family || '';
        this.config.cell = options.cell;
        this.config.panel = options.cell.id;
        this.guid = Sage.Analytics.generateString('wgt');
        this._options = options || {};
        this.listeners = options.listeners;
        this.addEvents({
            "afterdisplay": true,
            "persist": true
        });
        Sage.Analytics.DashboardWidget.superclass.constructor.call(this, options);
    },
    //what to call if no global widgetdefinition exists for a widget name
    getWidgetDefinition: function (forceEditor) {
        var that = this;
        $.ajax({
            type: "GET",
            url: "slxdata.ashx/slx/crm/-/dashboard/widget",
            data: { name: this.config.name,
                family: this.config.family
            },
            dataType: "xml",
            error: function (request, status, error) {
            },
            success: function (data, status) {
                var res = {};
                if (Ext.isIE) {
                    res.html = data.selectSingleNode("Module/Content").text;
                    res.title = data.selectSingleNode("Module/ModulePrefs").attributes.getNamedItem('title').text;
                } else {
                    res.html = data.evaluate("Module/Content", data, null, XPathResult.ANY_TYPE, null).iterateNext().textContent;
                    res.title = data.evaluate("Module/ModulePrefs", data, null, XPathResult.ANY_TYPE, null).iterateNext().attributes.title.textContent;
                }
                Sage.Analytics.WidgetDefinitions[that.config.name] = Sys.Serialization.JavaScriptSerializer.deserialize(res.html);
                Sage.Analytics.WidgetDefinitions[that.config.name].title = res.title;
                that.load(false, (forceEditor === true));
            }
        });
    }, //end getWidgetDefinition
    //check for the existance of the widget type in the widgetdefinitions global object
    //go get a def from the db if not
    init: function (forceEditor) {
        if (!Sage.Analytics.WidgetDefinitions[this.config.name]) {
            this.getWidgetDefinition((forceEditor === true));
        } else {
            this.load(false, (forceEditor === true));
        }
    }, //end init
    //the display logic for widgets
    load: function (simple, forceEditor) {
        //where am I?
        var panel = Ext.ComponentMgr.get(this.config.panel), $getData;
        //short-circuit for simple redraws
        if (simple) {
            return this.definition.html(this.config, panel);
        }
        //set loading here
        if (!this.config.loaded || !this.definition.isStatic) {
            if (panel.body) {
                panel.body.dom.innerHTML = '<div style="padding:10px;"><div class="loading-indicator">' +
                    Sage.Analytics.WidgetResource.loading + '</div></div>';
            }
        }
        if (!this.config.defined && Sage.Analytics.WidgetDefinitions[this.config.name]) {
            this.config.defined = true;
            if (this.config.defined && !this.definition) {
                //we have a definition, but not defined yet...
                //DO NOT put the definition in the config
                this.definition =
                    Sage.Analytics.createObject(Sage.Analytics.WidgetDefinitions[this.config.name]);
                //hoist the editor up to 'this'
                this.editor = this.definition.editor;
                if (typeof (this.editor) !== 'function') {
                    this.editor = function () { this.fireEvent('persist'); };
                }
            }
        }
        if (!this.definition.isStatic) {
            //I am not a static widget, therefore I will have, or need, a datasource
            if ((!this._options.datasource) || (forceEditor === true)) {
                //I am a new widget in need of a datasource
                this.editor(Sage.Analytics.generateString('dwEditor')); //callback here? scope issues if yes
            }
            //I am a saved widget or I am being edited
            if (this._options.datasource) {
                $getData = this.setData();
                //hand off to the widget def to render itself
                $getData(panel, this.config, this.definition);
            }
        }
        else {
            //a static widget, display it
            this.setData();
            //is panel avail?
            if (panel) {
                //should static widgets respond to resize?
                panel.update(this.definition.html(this.config, panel), false);
                this.config.loaded = true;
                panel.setTitle(Sage.Analytics.localize(this.config.title) || '');
                this.fireEvent("afterdisplay");
                if (forceEditor === true) {
                    this.editor(Sage.Analytics.generateString('dwEditor'));
                }
            }
        }
    }, //end load
    //many checks for existing data as a widget may pass thru here in various states.
    //i.e. on creation or after being edited etc...
    //the method sets various attributes in preping a widget for display
    setData: function () {
        var self = this;
        //set the name and family if init() didn't
        if (this.config.name === '') { this.config.name = this.definition.name; }
        if (this.config.family === '') { this.config.family = this.definition.family; }
        //set the data from a persisted object
        var att;
        //set all ._options to config
        for (att in this._options) {
            //filter out unwanted...
            if (att && this._options.hasOwnProperty(att)) {
                this.config[att] = this._options[att];
            }
        }
        if (this.config.datasource) {
            var getData = function (panel, config, def, $resize) {
                $.ajax({
                    dataType: 'json',
                    cache: false,
                    url: config.datasource,
                    success: function (data) {
                        //the template will need the returned object
                        config.data = data;
                        if (panel) {
                            //hand off to widget def to render itself
                            def.html(config, panel);
                        }
                        self.fireEvent("afterdisplay");
                    },
                    error: function (a, b, c) {
                        var markup = '<div class="widget-exception">' +
                        Sage.Analytics.WidgetResource.noData + '</div>';
                        panel.removeAll(true);
                        panel.setTitle('');
                        panel.body.dom.innerHTML = '';
                        panel.add({
                            cls: 'sage-widget-no-border',
                            html: markup
                        });
                        panel.doLayout();
                        if (panel.getInnerWidth()) {
                            panel.body.setStyle('width', panel.getInnerWidth() - 2);
                        }
                    }
                }); //end .ajax 
            }; //end var getdata
            return getData;
        }
    }, //end setData
    //refresh action for all widgets
    refresh: function (simple) { //the 'simple' arg will only be true in calls to refresh which do not require a data refresh
        this.load(simple);
    }
}); //end dashboardwidget object

Sage.UserOptionsService = {
    optionUrlFmt : "slxdata.ashx/slx/crm/-/useroptions/{0}/{1}",
    getCommonOption : function(name, category, callback) {
        $.ajax({
            url : String.format(Sage.UserOptionsService.optionUrlFmt, category, name),
            type : "GET",
            cache : false,
            contentType : "application/json",
            datatype : "json",
            success: function(resp) {
                callback(Sys.Serialization.JavaScriptSerializer.deserialize(resp));
            }
        });
    }
};
Sage.RoleSecurityService = function (actionList) {
    this._actionList = actionList;
    // Implement callback when SData call is finished
    //this._consumerCallback = {};
    this._userID = "";
    this._actionName = "";
}

Sage.RoleSecurityService.prototype.hasAccess = function (actionName) { // callback
    // this._consumerCallback = callback;
    this._actionName = actionName;
    this._userID = Sage.Utility.getClientContextByKey('userID');
    var rval = false;

    //If the current user is Administrator, then return true always.
    if (dojo.trim(this._userID.toUpperCase()) === 'ADMIN') {
        rval = true;
    }
    else {
        var aLen = this._actionList.length;
        for (var i = 0; i < aLen; i++) {
            if (this._actionList[i].toUpperCase() === this._actionName.toUpperCase()) {
                rval = true;
                break;
            }
        }
    }
    //this._consumerCallback(rval);  
    return rval;
}

Sage.IntegrationContractService = function () {
    this.isIntegrationEnabled = false;
    this.localAppId = "";
    var data = document.getElementById("__IntegrationContractService");
    if (typeof data !== "undefined" && data != null) {
        var obj = dojo.fromJson(data.value);
        this.isIntegrationEnabled = obj.IsIntegrationEnabled;
        this.localAppId = obj.LocalAppId;
        this.isMultiCurrencyEnabled = obj.IsMultiCurrencyEnabled;
        this.accountingSystemHandlesSO = obj.AccountingSystemHandlesSO;
    }
}

Sage.IntegrationContractService.prototype.getCurrentOperatingCompanyId = function () {
    var service = Sage.Services.getService("ClientEntityContext");
    if (typeof service !== "undefined" && service != null) {
        var context = service.getContext();
        var dtNow = new Date();
        var sUrl = dojo.replace("slxdata.ashx/slx/crm/-/context/getcurrentoperatingcompanyid?time={0}&entityType={1}&entityId={2}",
            [encodeURIComponent(dtNow.getTime().toString()), encodeURIComponent(context.EntityType), encodeURIComponent(context.EntityId)]);
        var response = $.ajax({
            async: false,
            url: sUrl,
            dataType: 'json',
            error: function (error) {
                Ext.Msg.show({ title: "Sage SalesLogix", msg: error.StatusText, buttons: Ext.Msg.OK, icon: Ext.MessageBox.ERROR });
                return "";
            }
        });
        var obj = dojo.fromJson(response.responseText);
        return obj.id;
    }
    return "";
}

function isIntegrationContractEnabled() {
    var service = Sage.Services.getService("IntegrationContractService");
    if (service != null && typeof service !== "undefined") {
        return service.isIntegrationEnabled;
    }
    return false;
}

function isMultiCurrencyEnabled() {
    var service = Sage.Services.getService("IntegrationContractService");
    if (service != null && typeof service !== "undefined") {
        return service.isMultiCurrencyEnabled;
    }
    return false; 
}

function accountingSystemHandlesSO() {
    var service = Sage.Services.getService("IntegrationContractService");
    if (service != null && typeof service !== "undefined") {
        return service.accountingSystemHandlesSO;
    }
    return false;
}
