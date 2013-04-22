
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
    this._services = [];
};
Sage.ServiceContainer.prototype = {
    addService: function(name, service) {
        if (name && service) {
            if (!this.hasService(name)) {
                var innerService = { };
                innerService.key = name;
                innerService.service = service;
                this._services.push(innerService);
                return service;
            } else {
                throw "Service already exists: " + name;
            }
        }
        return false;
    },
    removeService: function(name) {
        for (var i = 0; i < this._services.length; i++) {
            if (this._services[i].key === name) {
                this._services.splice(i, 1);
            }
        }
    },
    getService: function(name) {
        if (name) {
            for (var i = 0; i < this._services.length; i++) {
                if (this._services[i].key === name)
                    return this._services[i].service;
            }
        }
        return null;
    },
    hasService: function(name) {
        if (name) {
            for (var i = 0; i < this._services.length; i++) {
                if (this._services[i].key === name)
                    return true;
            }
        }
        return false;
    }
};
Sage.Services = new Sage.ServiceContainer();






document.onkeypress = function (evt) {
    evt = (evt) ? evt : ((event) ? event : null);
    var node = (evt.target) ? evt.target : ((evt.srcElement) ? evt.srcElement : null);
    if ((evt.keyCode === 13) && (node.type === "text")) { return false; }
    return true;
};
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

require([
    'dojo/dom'
], function (dom) {
    // TODO: Make this an AMD module
    Sage.ContentPane = function (toggleBtn, contentArea, attr) {
        this.contentArea = contentArea;
        this.toggleButton = toggleBtn;
        this.state = "open";
        this.minText = attr.minText;
        this.maxText = attr.maxText;
        this.minClass = attr.minClass;
        this.maxClass = attr.maxClass;
        this.baseClass = "Global_Images icon16x16";

        var elem = dom.byId(toggleBtn);
        if (!elem) {
            return;
        }
        //Use the ObjectConnectionService to manage dojo connections.
        var ocService = Sage.Services.getService('ObjectConnectionService');
        //Make sure there are no dangling connections.
        ocService.disconnect(toggleBtn);
        //Make the connection and add it to the service for later use.
        ocService.add(dojo.connect(elem, 'onclick', this, function () {
            this.toggle();
            //This model goes go hell when we have mutiple smartparts in the mainContentDetails sapce.
            //Sage.ContentPane is only ever used by mainContentDetails.  If that ever changes, this will need to be refactored.
            dojo.publish(['Sage/events/mainContentDetails/toggleSplitter'].join(''), this);
        },
            true), toggleBtn);
        dojo.subscribe(['Sage/events/mainContentDetails/splitterToggled'].join(''), this, "toggle");
        dojo.subscribe(['Sage/events/mainContentDetails/splitterMinSize'].join(''), this, function() {
            this.setState('closed');
            var elem = document.getElementById(this.toggleButton);
            if (elem) {
                elem.className = this.baseClass + " " + this.maxClass;
                elem.title = this.maxText;
            }
        });
        dojo.subscribe(['Sage/events/mainContentDetails/splitterMovedNotMin'].join(''), this, function() {
            this.setState('open');
            var elem = document.getElementById(this.toggleButton);
            if (elem) {
                elem.className = this.baseClass + " " + this.minClass;
                elem.title = this.minText;
            }
        });

        dojo.style(toggleBtn, "cursor", "pointer");

        if (typeof (cookie) != "undefined") {
            var st = cookie.getCookieParm(this.contentArea, "MainContentState");
            if (st) {
                if (st == "closed") {
                    this.close();
                }
            }
        }
    };

    Sage.ContentPane.prototype.setState = function(state) {
        this.state = state;
        if (typeof(cookie) != "undefined") {
            cookie.setCookieParm(this.state, this.contentArea, "MainContentState");
        }
    };

    Sage.ContentPane.prototype.toggle = function() {
        if (this.state == "open") {
            this.close();
        } else {
            this.open();
        }
        setTimeout(function() {
            // Tab content might need to be resized for the border line to
            // reset the height properly (otherwise content can overflow)
            // *Doesn't appear to work outside of a timeout*
            var tabContent = dijit.byId('tabContent');
            if(tabContent) {
                tabContent.resize();
            }
        }, 1);
    };

    Sage.ContentPane.prototype.close = function () {
        var mainContent = dijit.byId('mainContentDetails');
        if(!mainContent || !mainContent.splitter) {
            dojo.style(this.contentArea + "_inner", "display", "none");
        }
        
        this.setState("closed");
        var elem = document.getElementById(this.toggleButton);
        if (elem) {
            elem.className = this.baseClass + " " + this.maxClass;
            elem.title = this.maxText;
        }
        
    };

    Sage.ContentPane.prototype.open = function () {
        var mainContent = dijit.byId('mainContentDetails');
        if(!mainContent || !mainContent.splitter) {
            dojo.style(this.contentArea + "_inner", "display", "block");
        }
        
        this.setState("open");
        var elem = document.getElementById(this.toggleButton);
        if (elem) {
            elem.className = this.baseClass + " " + this.minClass;
            elem.title = this.minText;
        }
    };

    Sage.ContentPaneAttr = function() {
        this.minText = "";
        this.maxText = "";
        this.minClass = "";
        this.maxClass = "";
    };
});

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

    require([
        'dojo/aspect',
        'dojo/ready',
        'dojo/_base/lang',
        'dijit/registry',
        'dojo/dom-style',
        'dojo/query',
        'dojo/_base/array'
    ], function (
        aspect,
        ready,
        lang,
        registry,
        domStyle,
        query,
        array
    ){
    Sage.TabWorkspaceState = function (state) {
        this._state = state;
        this._wasTabUpdated = new Object;
        this._hiddenTabs = new Object;
        this._collections = ['MiddleTabs', 'MainTabs', 'MoreTabs'];
        this._collectionActiveRef = { 'MainTabs': 'ActiveMainTab', 'MoreTabs': 'ActiveMoreTab' };

        //sync the dictionary with the list
        for (var i = 0; i < this._state.UpdatedTabs.length; i++)
            this._wasTabUpdated[this._state.UpdatedTabs[i]] = true;

        for (var i = 0; i < this._state.HiddenTabs.length; i++)
            this._hiddenTabs[this._state.HiddenTabs[i]] = true;

    };

    Sage.TabWorkspaceState.MIDDLE_TABS = 'MiddleTabs';
    Sage.TabWorkspaceState.MAIN_TABS = 'MainTabs';
    Sage.TabWorkspaceState.MORE_TABS = 'MoreTabs';

    Sage.TabWorkspaceState.deserialize = function (value) {
        try {
            var state = Sys.Serialization.JavaScriptSerializer.deserialize(value);
            return new Sage.TabWorkspaceState(state);
        }
        catch (e) {
            return null;
        }
    };

    Sage.TabWorkspaceState.prototype.serialize = function () {
        return Sys.Serialization.JavaScriptSerializer.serialize(this._state);
    };

    Sage.TabWorkspaceState.prototype.getObject = function () {
        return this._state;
    };

    Sage.TabWorkspaceState.prototype.getSectionFor = function (target) {
        if (this.isMiddleTab(target))
            return Sage.TabWorkspaceState.MIDDLE_TABS;
        if (this.isMainTab(target))
            return Sage.TabWorkspaceState.MAIN_TABS;
        if (this.isMoreTab(target))
            return Sage.TabWorkspaceState.MORE_TABS;
        return false;
    };

    Sage.TabWorkspaceState.prototype.isTabVisible = function (target) {
        if (this.isMiddleTab(target)) {
            return true;
        }
        var tws = TabControl,
        tabInfo = tws.getInfoForTab(target),
        elem = $('#' + tabInfo.ElementId).get(0),
        s = elem.style;
        if (typeof elem === 'undefined') {
            return false;
        }
        if (this.isMainTab(target)) {
            return (s.display !== 'none');
        }
        if (this.isMoreTab(target)) {
            var moretabelem = $('#element_More').get(0),
            morestyle = moretabelem.style;
            return ((s.display !== 'none') && (morestyle.display !== 'none'));
        }
    };
    Sage.TabWorkspaceState.prototype._isTab = function (collection, target) {
        if (typeof this._state[collection] != "object")
            return;

        for (var i in this._state[collection])
            if (this._state[collection][i] == target)
                return true;
        return false;
    };

    Sage.TabWorkspaceState.prototype._removeFromTabs = function (collection, target) {
        if (typeof this._state[collection] != "object")
            return;

        var result = [];
        jQuery.each(this._state[collection], function (i, value) {
            if (value != target)
                result.push(value);
        });
        this._state[collection] = result;

        //if the collection is question has an active reference, and that value is set to the target, set it to null
        if (typeof this._collectionActiveRef[collection] != 'undefined')
            if (this._state[this._collectionActiveRef[collection]] == target)
                this._state[this._collectionActiveRef[collection]] = null;
    };

    Sage.TabWorkspaceState.prototype._addToTabs = function (collection, target, at, step) {
        if (typeof this._state[collection] != "object")
            return;

        //remove it from the other collections
        for (var other in this._collections)
            if (other != collection)
                this._removeFromTabs(this._collections[other], target);

        if (typeof at != 'undefined') {
            if (typeof at == 'number') {
                this._state[collection].splice(at, 0, target);
            }
            else {
                var insertAt = this._state[collection].length;
                jQuery.each(this._state[collection], function (i, value) {
                    if (value == at) {
                        insertAt = i;
                        return false;
                    }
                });

                if (typeof step == 'number')
                    insertAt = insertAt + step;

                this._state[collection].splice(insertAt, 0, target);
            }
        }
        else {
            this._state[collection].push(target);
        }
    };

    Sage.TabWorkspaceState.prototype.isMiddleTab = function (target) {
        return this._isTab(Sage.TabWorkspaceState.MIDDLE_TABS, target);
    };

    Sage.TabWorkspaceState.prototype.removeFromMiddleTabs = function (target) {
        this._removeFromTabs(Sage.TabWorkspaceState.MIDDLE_TABS, target);
    };

    Sage.TabWorkspaceState.prototype.addToMiddleTabs = function (target, at, step) {
        this._addToTabs(Sage.TabWorkspaceState.MIDDLE_TABS, target, at, step);
    };

    Sage.TabWorkspaceState.prototype.isMainTab = function (target) {
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

    Sage.TabWorkspaceState.prototype.removeFromMainTabs = function (target) {
        this._removeFromTabs(Sage.TabWorkspaceState.MAIN_TABS, target);
    };

    Sage.TabWorkspaceState.prototype.addToMainTabs = function (target, at, step) {
        this._addToTabs(Sage.TabWorkspaceState.MAIN_TABS, target, at, step);
    };

    Sage.TabWorkspaceState.prototype.setActiveMainTab = function (target) {
        this._state.ActiveMainTab = target;
    };

    Sage.TabWorkspaceState.prototype.getActiveMainTab = function () {
        return this._state.ActiveMainTab;
    };

    Sage.TabWorkspaceState.prototype.isMoreTab = function (target) {
        return this._isTab(Sage.TabWorkspaceState.MORE_TABS, target);
    };

    Sage.TabWorkspaceState.prototype.removeFromMoreTabs = function (target) {
        this._removeFromTabs(Sage.TabWorkspaceState.MORE_TABS, target);
    };

    Sage.TabWorkspaceState.prototype.addToMoreTabs = function (target, at, step) {
        this._addToTabs(Sage.TabWorkspaceState.MORE_TABS, target, at, step);
    };

    Sage.TabWorkspaceState.prototype.setActiveMoreTab = function (target) {
        this._state.ActiveMoreTab = target;
    };

    Sage.TabWorkspaceState.prototype.getActiveMoreTab = function () {
        return this._state.ActiveMoreTab;
    };

    Sage.TabWorkspaceState.prototype.getMainTabs = function () {
        return this._state.MainTabs;
    };

    Sage.TabWorkspaceState.prototype.getMoreTabs = function () {
        return this._state.MoreTabs;
    };

    Sage.TabWorkspaceState.prototype.getMiddleTabs = function () {
        return this._state.MiddleTabs;
    };

    Sage.TabWorkspaceState.prototype.getUpdatedTabs = function () {
        return this._state.UpdatedTabs;
    };

    Sage.TabWorkspaceState.prototype.markTabUpdated = function (target) {
        if (this._wasTabUpdated[target])
            return;

        this._wasTabUpdated[target] = true;
        this._state.UpdatedTabs.push(target);
    };

    Sage.TabWorkspaceState.prototype.wasTabUpdated = function (target) {
        return this._wasTabUpdated[target];
    };

    Sage.TabWorkspaceState.prototype.clearUpdatedTabs = function () {
        this._wasTabUpdated = new Object;
        this._state.UpdatedTabs = [];
    };

    Sage.TabWorkspaceState.prototype.getHiddenTabs = function () {
        return this._state.HiddenTabs;
    };
    Sage.TabWorkspaceState.prototype.InHideMode = function () {
        return this._state.InHideMode;
    };
    Sage.TabWorkspace = function (config) {
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
        var self = (TabControl) ? TabControl : this;
        ready(lang.hitch(self, function () {
            // These dual refresh calls are not a typo.  The dijit.layout.ContentPane
            // is not affectively determining all of it's layout information on the
            // first pass through resize.  Calling resize twice effectively renders
            // the grid to fill it's container.
            // - KBailes 3-28-12
            var localTC = registry.byId('tabContent');

            aspect.after(localTC, 'resize', lang.hitch(this, '_resize'));
            aspect.after(this, 'dropToMiddleSection', lang.hitch(this, '_resize'));

            aspect.after(this, 'dropToMoreSection', function () {
                localTC.resize(); localTC.resize();
            });
            aspect.after(this, 'dropToMainSection', function () {
                localTC.resize(); localTC.resize();
            });
            aspect.after(this, 'onReOpenTab', function () {
                localTC.resize(); localTC.resize();
            });
        }));
    };

    Sage.TabWorkspace.MORE_TAB_ID = "More";
    Sage.TabWorkspace.MAIN_AREA = "main";
    Sage.TabWorkspace.MORE_AREA = "more";
    Sage.TabWorkspace.MIDDLE_AREA = "middle";
    Sage.TabWorkspace.prototype._resize = function () {
        TabControl.setViewBodyHeight();
    };
    Sage.TabWorkspace.prototype.setViewBodyHeight = function () {
        // Height of the entire tab workspace.
        var tabContentHeight,
        // Current state of the tab workspace.
            tabState,
        // Current active tab in the main tab area.
            activeMainTab,
        // Query for finding the element with the View Body (tws-tab-view-body) class.
            viewBodyQuery,
        // View Body element.
            viewBody,
        // Query for finding the element with the View Header(tws-tab-view-header) class.
            viewHeaderQuery,
        // View Header element.
            viewHeader,
        // Middle Section (tws-middle-section) element.
            middleSection,
        // Main Tab Button (tws-main-tab-buttons) element.
            mainTabButtons,
        // The calculated height of middleSection + mainTabButtons + viewHeader.
            tabContentTop,
        // The calculated height of tabContentHeight - tabContentTop - 24 //adjust for padding.
            tabContentBottom,
        // The final height to be applied to the View Body (tws-tab-view-body) element.
            viewBodyHeight,
        // Query for finding the Middle area elements with the View Body(tws-tab-view-body) class.
            middleTabItemQuery,
        // The Middle area elements containing a View Body.
            middleTabItemViewBody,
        // Adjust height for padding in specific area.
            adjustForPadding,
        // Minimum height for the grid container.  Main and Middle areas are the same.  
        // More Area is variable based on the number of buttons.       
            minHeight = 250;
        tabState = this.getState();
        tabContentHeight = registry.byId('tabContent').h;
        //Resize for Active Main and More Tab Areas
        //Get current tab
        activeMainTab = tabState._state.ActiveMainTab;
        if (activeMainTab) {
            // More Tab Area settings.
            if (activeMainTab === Sage.TabWorkspace.MORE_TAB_ID && tabState._state.ActiveMoreTab) {
                activeMainTab = tabState._state.ActiveMoreTab;
                adjustForPadding = 50;
            }
            // Main Tab Area settings.
            else {
                adjustForPadding = 25;
            }
            viewBodyQuery = ['#', 'element_', activeMainTab, ' .tws-tab-view-body'].join('');
            viewBody = query(viewBodyQuery)[0];
            viewHeaderQuery = ['#', 'element_', activeMainTab, ' .tws-tab-view-header'].join('');
            viewHeader = query(viewHeaderQuery)[0];
            middleSection = query('.tws-middle-section')[0];
            mainTabButtons = query('.tws-main-tab-buttons')[0];
            // Calculate the top of the Tab Worksapce
            tabContentTop = middleSection.clientHeight + mainTabButtons.clientHeight + viewHeader.clientHeight;
            // Calculate the bottom of the Tab Workspace
            tabContentBottom = tabContentHeight - tabContentTop - adjustForPadding;
            // Set the View Body height considering a minimum height.
            viewBodyHeight = (tabContentBottom < minHeight) ? [minHeight, 'px'].join('') : [tabContentBottom, 'px'].join('');
            if (viewBody) {
                domStyle.set(viewBody, 'height', viewBodyHeight);
            }
        }
        //Resize for Middle Tabs.  Fixed with no resizing.  
        array.forEach(tabState._state.MiddleTabs, function (entry) {
            middleTabItemQuery = ['#', 'element_', entry, ' .tws-tab-view-body'].join('');
            // Get the View Body element for all tabs in the Middle area.
            middleTabItemViewBody = query(middleTabItemQuery)[0];
            if (middleTabItemViewBody.clientHeight < minHeight) {
                domStyle.set(middleTabItemViewBody, 'height', [minHeight, 'px'].join(''));
            }
        });
    };

    Sage.TabWorkspace.prototype.compileInfoLookups = function () {
        this._info._byId = new Object;
        this._info._byElementId = new Object;
        this._info._byDropTargetId = new Object;
        this._info._byButtonId = new Object;
        this._info._byMoreButtonId = new Object;
        for (var i = 0; i < this._info.Tabs.length; i++) {
            this._info._byId[this._info.Tabs[i].Id] = this._info.Tabs[i];
            this._info._byElementId[this._info.Tabs[i].ElementId] = this._info.Tabs[i];
            this._info._byDropTargetId[this._info.Tabs[i].DropTargetId] = this._info.Tabs[i];
            this._info._byButtonId[this._info.Tabs[i].ButtonId] = this._info.Tabs[i];
            this._info._byMoreButtonId[this._info.Tabs[i].MoreButtonId] = this._info.Tabs[i];
        }
    };

    Sage.TabWorkspace.prototype.getInfoFor = function (tab) { return this._info._byId[tab]; };
    Sage.TabWorkspace.prototype.getInfoForTab = function (tabId) { return this._info._byId[tabId]; };
    Sage.TabWorkspace.prototype.getInfoForTabElement = function (elementId) { return this._info._byElementId[elementId]; };
    Sage.TabWorkspace.prototype.getInfoForTabDropTarget = function (dropTargetId) { return this._info._byDropTargetId[dropTargetId]; };
    Sage.TabWorkspace.prototype.getInfoForTabButton = function (buttonId) { return this._info._byButtonId[buttonId]; };
    Sage.TabWorkspace.prototype.getInfoForTabMoreButton = function (buttonId) { return this._info._byMoreButtonId[buttonId]; };
    Sage.TabWorkspace.prototype.getStateProxyTriggerId = function () { return this._info.ProxyTriggerId; };
    Sage.TabWorkspace.prototype.getStateProxyPayloadId = function () { return this._info.ProxyPayloadId; };
    Sage.TabWorkspace.prototype.getDragHelperContainerId = function () { return this._info.DragHelperContainerId; };
    Sage.TabWorkspace.prototype.getUseUIStateService = function () { return this._info.UseUIStateService; };
    Sage.TabWorkspace.prototype.getUIStateServiceKey = function () { return this._info.UIStateServiceKey; };
    Sage.TabWorkspace.prototype.getUIStateServiceProxyType = function () { return this._info.UIStateServiceProxyType; };
    Sage.TabWorkspace.prototype.getAllDropTargets = function () { return this._allDropTargets; };
    Sage.TabWorkspace.prototype.getAllMainButtons = function () { return this._allMainButtons; };
    Sage.TabWorkspace.prototype.getAllMoreButtons = function () { return this._allMoreButtons; };

    Sage.TabWorkspace.prototype.getElement = function () {
        if (document.getElementById)
            return document.getElementById(this._clientId);
        return null;
    };

    Sage.TabWorkspace.prototype.getContext = function () { return this._context; };
    Sage.TabWorkspace.prototype.getState = function () { return this._state; };
    Sage.TabWorkspace.prototype.setState = function (state) { this._state = state; };

    Sage.TabWorkspace.prototype.resetState = function (state) {
        if (typeof state === "undefined") {
            var stateProxy = $("#" + this.getStateProxyPayloadId(), this.getContext()).val();
            if (stateProxy == "") {
                this.setState(this.getState());
            }
            else {
                this.setState(Sage.TabWorkspaceState.deserialize(stateProxy));
            }
        }
        else if (typeof state === "string") {
            this.setState(Sage.TabWorkspaceState.deserialize(state));
        }
        this.logDebug("Reset state...");
    };

    Sage.TabWorkspace.prototype.logDebug = function (text) {
        if (this._debug) {
            var pad = function (value, length) {
                value = value.toString();
                while (value.length < length)
                    value = "0" + value;
                return value;
            };
            var date = new Date();
            var dateString = pad(date.getHours(), 2) + ":" + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2) + "." + pad(date.getMilliseconds(), 3);
            $("#debug_log").append(dateString + " - " + text + "<br />");
        }
    };

    Sage.TabWorkspace.prototype.registerAfterPostBackAction = function (action) {
        this._afterPostBackActions.push(action);
    };

    Sage.TabWorkspace.prototype.init = function () {
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

    Sage.TabWorkspace.prototype.initEvents = function () {
        var self = this; //since jQuery overrides "this" in the closure        

        //setup the update events
        //will need to refactor this to use add_endRequest instead
        var prm = Sys.WebForms.PageRequestManager.getInstance();
        prm.add_endRequest(function (sender, args) {
            self.setupAllTabElementDraggables();
            self.hideTabs();
        });

        prm.add_beginRequest(function (sender, args) {
            self.cleanupAllTabElementDraggables();
        });
    };

    Sage.TabWorkspace.prototype.hideTabs = function () {
        if (!this.getState().InHideMode()) {
            return;
        }
        for (var i = 0; i < this.getState().getMiddleTabs().length; i++) {
            var tab = this.getState().getMiddleTabs()[i];
            this.unHideTab(tab);
        }

        for (var i = 0; i < this.getState().getMoreTabs().length; i++) {
            var tab = this.getState().getMoreTabs()[i];
            this.unHideTab(tab);
        }

        for (var i = 0; i < this.getState().getMainTabs().length; i++) {
            var tab = this.getState().getMainTabs()[i];
            this.unHideTab(tab);
        }

        for (var i = 0; i < this.getState().getHiddenTabs().length; i++) {
            var tab = this.getState().getHiddenTabs()[i];
            this.hideTab(tab);
        }
    };

    Sage.TabWorkspace.prototype.hideTab = function (tab) {
        this.logDebug("[enter] hideTab");
        if (typeof tab === "string")
            tab = this.getInfoFor(tab);

        if (tab == null) { return; }

        switch (this.getState().getSectionFor(tab.Id)) {
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

    Sage.TabWorkspace.prototype.unHideTab = function (tab) {
        this.logDebug("[enter] hideTab");
        if (typeof tab === "string")
            tab = this.getInfoFor(tab);

        if (tab == null) { return; }

        switch (this.getState().getSectionFor(tab.Id)) {
            case Sage.TabWorkspaceState.MAIN_TABS:

                $("#" + tab.ButtonId, this.getContext()).show();
                if (this.getState().getActiveMainTab() == tab.Id) {
                    $("#" + tab.ElementId, this.getContext()).show();
                }

                break;

            case Sage.TabWorkspaceState.MORE_TABS:

                $("#" + tab.MoreButtonId, this.getContext()).show();
                if (this.getState().getActiveMoreTab() == tab.Id) {
                    $("#" + tab.ElementId, this.getContext()).show();
                }
                break;

            case Sage.TabWorkspaceState.MIDDLE_TABS:

                $("#" + tab.ElementId, this.getContext()).show();

                break;
        }

    };


    Sage.TabWorkspace.prototype.disablePageTextSelection = function () {
        if (jQuery.browser.msie) {
            if (!this._textSelectionDisabled) {
                this._oldBodyOnDrag = document.body.ondrag;
                this._oldBodyOnSelectStart = document.body.onselectstart;

                document.body.ondrag = function () { return false; };
                document.body.onselectstart = function () { return false; };

                this._textSelectionDisabled = true;
            }
        }
    };

    Sage.TabWorkspace.prototype.enablePageTextSelection = function () {
        if (jQuery.browser.msie) {
            if (this._textSelectionDisabled) {
                document.body.ondrag = this._oldBodyOnDrag;
                document.body.onselectstart = this._oldBodyOnSelectStart;

                this._textSelectionDisabled = false;
            }
        }
    };

    Sage.TabWorkspace.prototype.setDragDropHelperText = function (helper, text) {
        if (typeof text != "string")
            return;

        $(".tws-drag-helper-text", helper).html(text);
    };
    Sage.TabWorkspace.prototype.setupTabElementDraggable = function (tab) {
        var self = this;

        var $query;
        if (typeof tab == 'string') {
            tab = this.getInfoFor(tab);
            if (tab == null) { return; }
            $query = $("#" + tab.ElementId, this.getContext());
        }
        else if (typeof target == 'object')
            $query = tab.ElementId;

        if ($query.is(".ui-draggable"))
            return;

        if (typeof tab === "string")
            this.logDebug("Setting up tab element draggable for " + tab + ".");
        else
            this.logDebug("Setting up tab element draggable for " + tab.Id + ".");

        $query.draggable({
            handle: ".tws-tab-view-header",
            cursor: "move",
            cursorAt: { top: self._dragHelperHeight / 2, left: self._dragHelperWidth / 2 },
            zIndex: 15000,
            delay: 50,
            opacity: 0.5,
            scroll: true,
            refreshPositions: true,
            appendTo: "#" + self.getDragHelperContainerId(),
            helper: function () {
                return self.createDraggableHelper();
            },
            start: function (e, ui) {
                this._context = self.getInfoForTabElement(this.id);
                this._overDraggable = false;

                $(ui.helper).data("over", 0);

                self.disablePageTextSelection();
                self.setDragDropHelperText(ui.helper, this._context.Name);
            },
            stop: function (e, ui) {
                self.enablePageTextSelection();
            }
        });
    };

    Sage.TabWorkspace.prototype.cleanupTabElementDraggable = function (tab) {
        var $query;
        if (typeof tab == 'string') {
            tab = this.getInfoFor(tab);
            if (tab == null) { return; }
            $query = $("#" + tab.ElementId, this.getContext());
        }
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

    Sage.TabWorkspace.prototype.setupAllTabElementDraggables = function () {
        for (var i = 0; i < this.getState().getMiddleTabs().length; i++)
            this.setupTabElementDraggable(this.getState().getMiddleTabs()[i]);

        if (this.getState().getActiveMainTab() && this.getState().getActiveMainTab() != Sage.TabWorkspace.MORE_TAB_ID)
            this.setupTabElementDraggable(this.getState().getActiveMainTab());

        if (this.getState().getActiveMoreTab())
            this.setupTabElementDraggable(this.getState().getActiveMoreTab());
    };

    Sage.TabWorkspace.prototype.cleanupAllTabElementDraggables = function () {
        //only updated tabs should have tab element draggables
        for (var i = 0; i < this.getState().getUpdatedTabs().length; i++)
            this.cleanupTabElementDraggable(this.getState().getUpdatedTabs()[i]);
    };

    Sage.TabWorkspace.prototype.createMainInsertMarker = function (el, at) {
        if (el) {
            var marker = $("<div class=\"tws-insert-button-marker Global_Images icon_insert-arrow-down16x16 \"></div>").css({ top: (at.top - 10) + "px", left: (at.left - 8) + "px" });
            $("div.tws-main-tab-buttons", this.getContext()).append(marker);
            el._marker = marker;
        }
    };

    Sage.TabWorkspace.prototype.cleanupMainInsertMarker = function (el) {
        if (el && el._marker) {
            el._marker.remove();
            el._marker = null;
        }
    };

    Sage.TabWorkspace.prototype.createMoreInsertMarker = function (el, at) {
        if (el) {
            var marker = $("<div class=\"tws-insert-button-marker Global_Images icon_insert-arrow-left16x16\"></div>").css({ top: (at.top - 8) + "px" });
            $("div.tws-more-tab-buttons-container", this.getContext()).append(marker);
            el._marker = marker;
        }
    };

    Sage.TabWorkspace.prototype.cleanupMoreInsertMarker = function (el) {
        if (el && el._marker) {
            el._marker.remove();
            el._marker = null;
        }
    };

    Sage.TabWorkspace.prototype.getContextFromUI = function (ui) {
        return ui.draggable.get(0)._context;
    };

    Sage.TabWorkspace.prototype.getRegions = function (area) {
        return this._regions[area];
    };

    Sage.TabWorkspace.prototype.createRegionsFrom = function (list) {
        var regions = [];
        list.each(function () {
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

    Sage.TabWorkspace.prototype.testRegions = function (regions, pos, test) {
        var list = (typeof regions === "string") ? this._regions[regions] : regions;
        if (list && list.length && typeof test === "function") {
            for (var i = 0; i < list.length; i++) {
                if (test(list[i], pos))
                    return list[i].el;
            }
        }

        return null;
    };

    Sage.TabWorkspace.prototype.setDroppableOn = function (draggable, id, droppable) {
        if (typeof draggable._droppables === "undefined")
            draggable._droppables = {};

        draggable._droppables[id] = droppable;
    };

    Sage.TabWorkspace.prototype.getDroppableFrom = function (draggable, id) {
        if (draggable._droppables)
            return draggable._droppables[id];
    };

    Sage.TabWorkspace.prototype.updateOffsetParentScroll = function () {
        this._offsetParentScroll = $(this._offsetParent).scrollTop();
    };

    Sage.TabWorkspace.prototype.shouldUpdateRegions = function () {
        if (this._offsetParent) {
            if (this._offsetParentScroll != $(this._offsetParent).scrollTop()) {
                this._offsetParentScroll = $(this._offsetParent).scrollTop();
                return true;
            }
        }

        return false;
    };

    Sage.TabWorkspace.prototype.initDragDrop = function () {
        var self = this;

        
        
        
        $("div.tws-middle-section", this.getContext()).droppable({
            
            accept: ".tws-tab-button,.tws-more-tab-button,.tws-tab-element",
            tolerance: "pointer",
            activate: function (e, ui) {
                self.logDebug("Activate MiddleSection");

                //add our instance to the draggable
                self.setDroppableOn(ui.draggable.get(0), Sage.TabWorkspace.MIDDLE_AREA, ui.options);

                self._allDropTargets.filter("div.tws-middle-section div.tws-drop-target").addClass("tws-drop-target-active");
            },
            deactivate: function (e, ui) {
                self.logDebug("De-Activate MiddleSection");

                self._allDropTargets.filter("div.tws-middle-section div.tws-drop-target").removeClass("tws-drop-target-active");

                ui.draggable.unbind('drag', ui.options.track);
                ui.options._targets = null;
                ui.options._current = null;
            },
            over: function (e, ui) {
                self.logDebug("Over MiddleSection");

                var regions = self.createRegionsFrom(self.getAllDropTargets().filter(":visible"));
                var draggable = ui.draggable.get(0);
                var pos = { y: e.pageY, x: e.pageX };
                var el = self.testRegions(regions, pos, function (r, p) { return (p.y > (r.y - self._middleRegionDropTolerance) && p.y <= (r.y + r.height + self._middleRegionDropTolerance)); });

                if (el) {
                    $(el).addClass("tws-drop-target-hover");
                    $(ui.helper).data("over", $(ui.helper).data("over") + 1);
                    $(ui.helper).addClass("tws-drag-helper-valid");
                    $('.tws-drag-helper-icon', ui.helper).addClass('icon_ok16x16');
                    $('.tws-drag-helper-icon', ui.helper).removeClass('icon_no16x16');
                }

                ui.options._targets = regions;
                ui.options._currentTarget = (el) ? el : null;
                ui.draggable.bind('drag', ui.options.track);
            },
            out: function (e, ui) {
                self.logDebug("Out MiddleSection");

                var draggable = ui.draggable.get(0);

                self._allDropTargets.removeClass("tws-drop-target-hover");

                $(ui.helper).data("over", $(ui.helper).data("over") - 1);
                if ($(ui.helper).data("over") <= 0) {
                    $(ui.helper).data("over", 0);
                    $(ui.helper).removeClass("tws-drag-helper-valid");
                    $('.tws-drag-helper-icon', ui.helper).removeClass('icon_ok16x16');
                    $('.tws-drag-helper-icon', ui.helper).addClass('icon_no16x16');
                }

                ui.draggable.unbind('drag', ui.options.track);
                ui.options._targets = null;
                ui.options._currentTarget = null;
            },
            drop: function (e, ui) {
                self.logDebug("Drop MiddleSection");

                var context = self.getContextFromUI(ui);
                var target = ui.options._currentTarget;

                self._allDropTargets.removeClass("tws-drop-target-hover");
                $(ui.helper).removeClass("tws-drag-helper-valid");
                $('.tws-drag-helper-icon', ui.helper).removeClass('icon_ok16x16');
                $('.tws-drag-helper-icon', ui.helper).addClass('icon_no16x16');
                if (target)
                    self.dropToMiddleSection(context, target);
            },
            track: function (e, ui) {
                var draggable = this;
                var droppable = self.getDroppableFrom(draggable, Sage.TabWorkspace.MIDDLE_AREA);
                var pos = { y: e.pageY, x: e.pageX };
                var el = self.testRegions(droppable._targets, pos, function (r, p) { return (p.y > (r.y - self._middleRegionDropTolerance) && p.y <= (r.y + r.height + self._middleRegionDropTolerance)); });

                if (droppable._currentTarget != el) {
                    var last = droppable._currentTarget;
                    if (last) {
                        $(ui.helper).removeClass("tws-drag-helper-valid");
                        $('.tws-drag-helper-icon', ui.helper).removeClass('icon_ok16x16');
                        $('.tws-drag-helper-icon', ui.helper).addClass('icon_no16x16');
                        $(last).removeClass("tws-drop-target-hover");
                    }

                    if (el) {
                        $(ui.helper).addClass("tws-drag-helper-valid");
                        $('.tws-drag-helper-icon', ui.helper).addClass('icon_ok16x16');
                        $('.tws-drag-helper-icon', ui.helper).removeClass('icon_no16x16');
                        $(el).addClass("tws-drop-target-hover");
                    }

                    droppable._currentTarget = el;
                }
            }
        });

        
        
        
        $("div.tws-main-tab-buttons", this.getContext()).droppable({
            accept: ".tws-tab-button,.tws-more-tab-button,.tws-tab-element",
            tolerance: "pointer",
            activate: function (e, ui) {
                self.logDebug("Activate MainButtonBar");

                //not functional in ui 1.5 - is there an equivalent and is it needed?    
                //ui.instance.proportions.width = ui.instance.element.width();
                //ui.instance.proportions.height = ui.instance.element.height(); 

                self.updateMainAreaRegions();

                self.setDroppableOn(ui.draggable.get(0), Sage.TabWorkspace.MAIN_AREA, ui.options);
            },
            deactivate: function (e, ui) {
                self.logDebug("De-Activate MainButtonBar");

                self.cleanupMainInsertMarker(ui.draggable.get(0));

                ui.draggable.unbind('drag', ui.options.track);
                ui.options._targets = null;
                ui.options._currentTarget = null;
            },
            over: function (e, ui) {
                self.logDebug("Over main button bar event occured for " + self.getContextFromUI(ui).Id);

                $(ui.helper).data("over", $(ui.helper).data("over") + 1);
                $(ui.helper).addClass("tws-drag-helper-valid");
                $('.tws-drag-helper-icon', ui.helper).addClass('icon_ok16x16');
                $('.tws-drag-helper-icon', ui.helper).removeClass('icon_no16x16');
                
                var regions = self.getRegions(Sage.TabWorkspace.MAIN_AREA);
                var pos = { y: e.pageY, x: e.pageX };
                var el = self.testRegions(regions, pos, function (r, p) {
                    return (p.x > r.x && p.x <= (r.x + r.width));
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
            out: function (e, ui) {
                self.logDebug("Out MainButtonBar");

                $(ui.helper).data("over", $(ui.helper).data("over") - 1);
                if ($(ui.helper).data("over") <= 0) {
                    $(ui.helper).data("over", 0);
                    $(ui.helper).removeClass("tws-drag-helper-valid");
                    $('.tws-drag-helper-icon', ui.helper).removeClass('icon_ok16x16');
                    $('.tws-drag-helper-icon', ui.helper).addClass('icon_no16x16');
                }

                self.cleanupMainInsertMarker(ui.draggable.get(0));

                ui.draggable.unbind('drag', ui.options.track);
                ui.options._targets = null;
                ui.options._currentTarget = null;
            },
            drop: function (e, ui) {
                self.logDebug("Drop to main event occured for " + self.getContextFromUI(ui).Id);

                var context = self.getContextFromUI(ui);
                var target = (ui.options._currentTarget) ? ui.options._currentTarget : this;
                self.dropToMainSection(context, target);
            },
            track: function (e, ui) {
                var draggable = this;
                var droppable = self.getDroppableFrom(draggable, Sage.TabWorkspace.MAIN_AREA);
                var pos = { y: e.pageY, x: e.pageX };
                var el = self.testRegions(droppable._targets, pos, function (r, p) {
                    return (p.x > r.x && p.x <= (r.x + r.width));
                });

                if (droppable._currentTarget != el) {
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
            accept: ".tws-tab-button:not(#show_More),.tws-more-tab-button,.tws-tab-element:not(#element_More)",
            tolerance: "pointer",
            activate: function (e, ui) {
                self.logDebug("Activate MoreButtonBar");

                //fix for jQuery 1.5 and size of initially hidden droppables             

                //not functional in ui 1.5 - is there an equivalent and is it needed?    
                //ui.instance.proportions.width = ui.instance.element.width();
                //ui.instance.proportions.height = ui.instance.element.height(); 

                self.updateMoreAreaRegions();

                self.setDroppableOn(ui.draggable.get(0), Sage.TabWorkspace.MORE_AREA, ui.options);
            },
            deactivate: function (e, ui) {
                self.cleanupMoreInsertMarker(ui);

                ui.draggable.unbind('drag', ui.options.track);
                ui.options._targets = null;
                ui.options._currentTarget = null;
            },
            over: function (e, ui) {
                self.logDebug("Over more button bar event occured for " + self.getContextFromUI(ui).Id);

                $(ui.helper).data("over", $(ui.helper).data("over") + 1);
                $(ui.helper).addClass("tws-drag-helper-valid");
                $('.tws-drag-helper-icon', ui.helper).addClass('icon_ok16x16');
                $('.tws-drag-helper-icon', ui.helper).removeClass('icon_no16x16');


                var regions = self.getRegions(Sage.TabWorkspace.MORE_AREA);
                var pos = { y: e.pageY, x: e.pageX };
                var el = self.testRegions(regions, pos, function (r, p) { return (p.y > r.y && p.y <= (r.y + r.height)); });
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
            out: function (e, ui) {
                $(ui.helper).data("over", $(ui.helper).data("over") - 1);
                if ($(ui.helper).data("over") <= 0) {
                    $(ui.helper).data("over", 0);
                    $(ui.helper).removeClass("tws-drag-helper-valid");
                    $('.tws-drag-helper-icon', ui.helper).removeClass('icon_ok16x16');
                    $('.tws-drag-helper-icon', ui.helper).addClass('icon_no16x16');
                }

                self.cleanupMoreInsertMarker(ui.draggable.get(0));

                ui.draggable.unbind('drag', ui.options.track);
                ui.options._targets = null;
                ui.options._currentTarget = null;
            },
            drop: function (e, ui) {
                self.logDebug("Drop to more event occured for " + self.getContextFromUI(ui).Id);

                var context = self.getContextFromUI(ui);
                var target = (ui.options._currentTarget) ? ui.options._currentTarget : this;
                self.dropToMoreSection(context, target);
            },
            track: function (e, ui) {
                var draggable = this;
                var droppable = self.getDroppableFrom(draggable, Sage.TabWorkspace.MORE_AREA);
                var pos = { y: e.pageY, x: e.pageX };
                var el = self.testRegions(droppable._targets, pos, function (r, p) { return (p.y > r.y && p.y <= (r.y + r.height)); });

                if (droppable._currentTarget != el) {
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
            cursor: "move",
            cursorAt: { top: self._dragHelperHeight / 2, left: self._dragHelperWidth / 2 },
            zIndex: 15000,
            appendTo: "#" + self.getDragHelperContainerId(),
            //refreshPositions : true,
            opacity: 0.5,
            delay: 50,
            scroll: true,
            refreshPositions: true,
            helper: function () {
                return self.createDraggableHelper();
            },
            start: function (e, ui) {
                this._context = self.getInfoForTabButton(this.id);
                this._overDraggable = false;

                $(ui.helper).data("over", 0);

                self.disablePageTextSelection();
                self.setDragDropHelperText(ui.helper, this._context.Name);
            },
            stop: function (e, ui) {
                self.enablePageTextSelection();
            }
        });

        
        
        
        $("li.tws-more-tab-button:not(li.tws-more-tab-button-tail)", this.getContext()).draggable({
            cursor: "move",
            cursorAt: { top: self._dragHelperHeight / 2, left: self._dragHelperWidth / 2 },
            zIndex: 15000,
            //refreshPositions : true,  
            opacity: 0.5,
            delay: 50,
            scroll: true,
            refreshPositions: true,
            appendTo: "#" + self.getDragHelperContainerId(),
            helper: function () {
                return self.createDraggableHelper();
            },
            start: function (e, ui) {
                this._context = self.getInfoForTabMoreButton(this.id);
                this._overDraggable = false;

                $(ui.helper).data("over", 0);

                self.disablePageTextSelection();
                self.setDragDropHelperText(ui.helper, this._context.Name);
            },
            stop: function (e, ui) {
                self.enablePageTextSelection();
            }
        });

        $("li.tws-tab-button:not(li.tws-tab-button-tail)", this.getContext()).click(function (e) {
            var tab = self.getInfoForTabButton($(this).attr("id"));

            self.logDebug("Click event occured for " + tab.Id);

            self.showMainTab(tab.Id);

            if (e.ctrlKey)
                this.forceUpdateFor(tab.Id);
        });

        $("li.tws-more-tab-button:not(li.tws-more-tab-button-tail)", this.getContext()).click(function (e) {
            var tab = self.getInfoForTabMoreButton($(this).attr("id"));

            self.logDebug("Click event occured for " + tab.Id);

            self.showMoreTab(tab.Id);

            if (e.ctrlKey)
                this.forceUpdateFor(tab.Id);
        });

        this.updateAllRegions();
        this.setupAllTabElementDraggables();
    };

    Sage.TabWorkspace.prototype.createDraggableHelper = function () {
        return $("<div class='tws-tab-drag-helper'><div class='tws-drag-helper-icon Global_Images icon_no16x16' /><div class='tws-drag-helper-text' /></div>");
    };

    Sage.TabWorkspace.prototype.showMainTab = function (tab, triggerUpdate) {
        this.logDebug("[enter] showMainTab");

        if (typeof tab === "string")
            tab = this.getInfoFor(tab);

        var previousMainTabId = this.getState().getActiveMainTab();

        //if we are already the active main tab, we do not have to do anything
        if (this.getState().getActiveMainTab() == tab.Id) {
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
    };

    Sage.TabWorkspace.prototype.showMainTabDom = function (tab) {

        if (typeof tab === "string")
            tab = this.getInfoFor(tab);

        $(".tws-main-tab-content > .tws-tab-element", this.getContext()).hide();
        $("#" + tab.ElementId, this.getContext()).show();
        $(".tws-main-tab-buttons .tws-tab-button", this.getContext()).removeClass("tws-active-tab-button");
        $("#" + tab.ButtonId, this.getContext()).addClass("tws-active-tab-button");
    };

    Sage.TabWorkspace.prototype.showMoreTab = function (tab, triggerUpdate) {
        this.logDebug("[enter] showMoreTab");

        if (typeof tab === "string")
            tab = this.getInfoFor(tab);

        if (this.getState().getActiveMoreTab() == tab.Id) {
            //still optionally trigger an update
            if (typeof triggerUpdate == 'undefined' || triggerUpdate)
                this.triggerUpdateFor(tab.Id);
            return;
        }

        this.getState().setActiveMoreTab(tab.Id);

        

        this.showMoreTabDom(tab);

        if (typeof triggerUpdate == 'undefined' || triggerUpdate)
            this.triggerUpdateFor(tab.Id);
    };

    Sage.TabWorkspace.prototype.showMoreTabDom = function (tab) {
        if (typeof tab === "string")
            tab = this.getInfoFor(tab);

        $(".tws-more-tab-content .tws-tab-element", this.getContext()).hide();
        $("#" + tab.ElementId, this.getContext()).show();
        $(".tws-more-tab-buttons .tws-more-tab-button", this.getContext()).removeClass("tws-active-more-tab-button");
        $("#" + tab.MoreButtonId, this.getContext()).addClass("tws-active-more-tab-button");
    };

    Sage.TabWorkspace.prototype.dropToMainSection = function (tab, target) {
        

        this.logDebug("[enter] dropToMainSection");

        //determine the drop position via ui.droppable
        var $location;
        if ($(target).is(".tws-main-tab-buttons"))
            $location = $(".tws-tab-button-tail", this.getContext());
        else
            $location = $(target, this.getContext());

        switch (this.getState().getSectionFor(tab.Id)) {
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

    Sage.TabWorkspace.prototype.dropToMoreSection = function (tab, target) {
        

        this.logDebug("[enter] dropToMoreSection");

        //determine the drop position via ui.droppable
        var $location;
        if ($(target).is(".tws-more-tab-buttons"))
            $location = $(".tws-more-tab-button-tail", this.getContext());
        else
            $location = $(target, this.getContext());

        switch (this.getState().getSectionFor(tab.Id)) {
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

    Sage.TabWorkspace.prototype.dropToMiddleSection = function (tab, target) {
        

        this.logDebug("[enter] dropToMiddleSection");

        var tabsToUpdate = [];

        //dropped to it's own drop target
        if (tab.DropTargetId == target.id)
            return;

        switch (this.getState().getSectionFor(tab.Id)) {
            case Sage.TabWorkspaceState.MAIN_TABS:
                //are we the last main tab? if so, do nothing
                if (this.getState().getMainTabs().length == 1)
                    return;

                //are we the current active main tab?
                if (this.getState().getActiveMainTab() == tab.Id) {
                    var $newActiveTab = $("#" + tab.ButtonId, this.getContext()).prev(".tws-tab-button:visible:not(.tws-tab-button-tail)");
                    if ($newActiveTab.length <= 0)
                        $newActiveTab = $("#" + tab.ButtonId, this.getContext()).next(".tws-tab-button:visible:not(.tws-tab-button-tail)");

                    if ($newActiveTab.length > 0) {
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
                if (this.getState().getActiveMoreTab() == tab.Id) {
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

    Sage.TabWorkspace.prototype.deriveStateFromMarkup = function () {
        var self = this;
        var state = {
            MiddleTabs: [],
            MainTabs: [],
            MoreTabs: []
        };

        $(".tws-middle-section .tws-tab-element", this.getContext()).each(function () {
            state.MiddleTabs.push(self.getInfoForTabElement($(this).attr("id")).Id);
        });

        $(".tws-main-section .tws-main-tab-buttons .tws-tab-button:visible", this.getContext()).each(function () {
            var tab = self.getInfoForTabButton($(this).attr("id"));
            state.MainTabs.push(tab.Id);

            if ($(this).hasClass("tws-active-tab-button", this.getContext()))
                state.ActiveMainTab = tab.Id;
        });

        return state;
    };


    Sage.TabWorkspace.prototype.updateVisibleDroppables = function () {
        this.logDebug("[enter] enableAllVisibleDroppables");

        $("div.tws-drop-target:visible", this.getContext()).droppable("enable");

        //fix for jQuery 1.5 and size of initially hidden droppables
        $.ui.ddmanager.prepareOffsets();

        this.logDebug("[leave] enableAllVisibleDroppables");
    };

    Sage.TabWorkspace.prototype.updateAllRegions = function () {
        this.updateMainAreaRegions();
        this.updateMoreAreaRegions();
        this.updateMiddleAreaRegions();
    };

    Sage.TabWorkspace.prototype.updateMainAreaRegions = function () {
        //validate the container region and the area region list
        var region = this.createRegionsFrom(this._mainButtonContainer)[0];
        
        this._regions[Sage.TabWorkspace.MAIN_AREA] = this.createRegionsFrom(this._allMainButtons.filter(":visible"));
        this._mainButtonContainerRegion = region;
    };
    Sage.TabWorkspace.prototype.updateMoreAreaRegions = function () {
        //validate the container region and the area region list
        var region = this.createRegionsFrom(this._moreButtonContainer)[0];
        
        this._regions[Sage.TabWorkspace.MORE_AREA] = this.createRegionsFrom(this._allMoreButtons.filter(":visible"));
        this._moreButtonContainerRegion = region;
    };
    Sage.TabWorkspace.prototype.updateMiddleAreaRegions = function () {
        this._regions[Sage.TabWorkspace.MIDDLE_AREA] = this.createRegionsFrom(this._allDropTargets.filter(":visible"));
    };

    Sage.TabWorkspace.prototype.updateContextualFeedback = function () {
        
        if (this.getState().getMoreTabs().length <= 0)
            $(".tws-more-tab-message", this.getContext()).empty().append(TabWorkspaceResource.More_Tab_Empty_Message).show();
        else if (this.getState().getActiveMoreTab() == null)
            $(".tws-more-tab-message", this.getContext()).empty().append(TabWorkspaceResource.More_Tab_No_Selection_Message).show();
        else
            $(".tws-more-tab-message", this.getContext()).hide();

        
        if (this.getState().getMiddleTabs().length <= 0) {
            $(".tws-middle-section", this.getContext()).addClass("tws-middle-section-empty");
            $(".tws-middle-drop-target span", this.getContext()).empty().append(TabWorkspaceResource.Middle_Pane_Empty_Drop_Target_Message);
        }
        else {
            $(".tws-middle-section", this.getContext()).removeClass("tws-middle-section-empty");
            $(".tws-middle-drop-target span", this.getContext()).empty().append(TabWorkspaceResource.Middle_Pane_Drop_Target_Message);
        }
    };

    Sage.TabWorkspace.prototype.updateStateProxy = function () {
        var serializedState = this.getState().serialize();
        $("#" + this.getStateProxyPayloadId()).val(serializedState);
    };

    Sage.TabWorkspace.prototype.onReOpenTab = function() { };

    Sage.TabWorkspace.prototype.triggerUpdateFor = function (tabs, data) {

        this.updateContextualFeedback();
        this.updateAllRegions();

        var tabsToUpdate = [];
        var shouldSendState = false;
        var stateSent = false;
        var self = this;

        if (typeof tabs == 'string') {
            //check to see if we need to update the tab.  never update the more tab, but do send state.
            if (tabs == Sage.TabWorkspace.MORE_TAB_ID) {
                //if we are the more tab, see if we need to update the active more tab
                var activeMoreTab = this.getState().getActiveMoreTab();
                if (activeMoreTab && !this.getState().wasTabUpdated(activeMoreTab)) {
                    this.getState().markTabUpdated(activeMoreTab);
                    tabsToUpdate.push(activeMoreTab);
                }
                else {
                    shouldSendState = true;
                }
            }
            else {
                if (!this.getState().wasTabUpdated(tabs) && (tabs != Sage.TabWorkspace.MORE_TAB_ID)) {
                    //mark the tab as updated so when the state gets sent the server knows the control is "active"
                    this.getState().markTabUpdated(tabs);
                    tabsToUpdate.push(tabs);
                }
                else {
                    shouldSendState = true;
                }
            }
        }
        else {
            for (var i = 0; i < tabs.length; i++) {
                //check to see if we need to update the tab.  never update the more tab, but do send state.
                if (tabs[i] == Sage.TabWorkspace.MORE_TAB_ID) {
                    //if we are the more tab, see if we need to update the active more tab
                    var activeMoreTab = this.getState().getActiveMoreTab();
                    if (activeMoreTab && !this.getState().wasTabUpdated(activeMoreTab)) {
                        this.getState().markTabUpdated(activeMoreTab);
                        tabsToUpdate.push(activeMoreTab);
                    }
                    else {
                        shouldSendState = true;
                    }
                }
                else {
                    if (!this.getState().wasTabUpdated(tabs[i]) && (tabs[i] != Sage.TabWorkspace.MORE_TAB_ID)) {
                        //mark the tab as updated so when the state gets sent the server knows the control is "active"
                        this.getState().markTabUpdated(tabs[i]);
                        tabsToUpdate.push(tabs[i]);
                    }
                    else {
                        if(this.getState().isMiddleTab(tabs[i])) {
                            // Override the height of the middle section to 'auto' if it is more than just a grid,
                            // otherwise the height of this content may overlap the tabs section
                            var middleSectionDiv = $('.tws-middle-section .tws-tab-view-body .formtable');
                            if(middleSectionDiv.length > 0) {
                                $('.tws-middle-section .tws-tab-view-body')[0].style.height = 'auto';
                            }
                        }
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

        for (var i = 0; i < tabsToUpdate.length; i++) {
            this.logDebug("Triggering update for " + tabsToUpdate[i]);

            tab = tabsToUpdate[i];
            //this.cleanupTabElement(tab);        

            $("#" + this.getInfoFor(tab).UpdatePayloadId).val(serializedState);
            __doPostBack(this.getInfoFor(tab).UpdateTriggerId, "");

            stateSent = true;
        }

        if (tabsToUpdate.length === 0) {
            this.onReOpenTab();
        }

        var forceProxyCall = false;
        if (shouldSendState && !stateSent && this.getUseUIStateService()) {
            this.logDebug("Sending state update via proxy.");
            __doPostBack(this.getStateProxyTriggerId(), "");
            stateSent = true;
        }
    };

});
//Manage the instances of dojo object connections
//This service is for non-dojo nodes.  Use this in order to leverage dojo.connect to replace YAHOO.util.Event
Sage.ObjectConnectionService = function () {
    //TODO: Test multiple listeners.  Likely need to convert to an array and update usages.
    this.objectConnections = {};
    this.add = function (conn, id) {
        this.objectConnections[id] = conn;
    };
    this.remove = function (id) {
        delete this.objectConnections[id];
    };
    this.disconnect = function (id) {
        dojo.disconnect(this.objectConnections[id]);
    };
    this.disconnectAll = function () {
        for (var i in this.objectConnections) {
            dojo.disconnect(this.objectConnections[i]);
        }
    };
    this.removeAll = function() {
        for (var i in this.objectConnections) {
            delete this.objectConnections[i];
        }
    };
};

Sage.Services.addService("ObjectConnectionService", new Sage.ObjectConnectionService());
Sage.IntegrationContractService = function () {
    this.isIntegrationEnabled = false;
    this.localAppId = "";
    var data = dojo.byId("__IntegrationContractService");
    if (data) {
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
        var response = dojo.xhrGet({
            url: sUrl,
            handleAs: 'json',
            error: function (error) {
                console.error(error);
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
require([
        'dojo/dnd/Moveable',
        'dojo/dom',
        'dojo/on',
        'dojo/query',
        'dojo/dom-class',
        'dojo/dom-style',
        'dojo/dom-geometry',
        'dojo/_base/lang'
    ], function(
        Moveable,
        dom,
        on,
        query,
        domClass,
        domStyle,
        domGeom,
        lang
    ){

    String.prototype.trim = function() {
        return this.replace( /^\s+|\s+$/g , '');
    };

    window.slxdatagrid = function(gridID) {
        this.gridID = gridID;
        this.containerId = gridID + '_container';
        this.expandAllCell = null;
        this.expandable = false;
        this.table = null;
        this.expandclassname = 'slxgridrowexpand';
        this.expandnoiconclassname = 'slxgridrowexpandnoicon';
        this.collapseclassname = 'slxgridrowcollapse';
        this.collapsenoiconclassname = 'slxgridrowcollapsenoicon';
        this.contentdivclassname = 'cellcontents';
        this.pagerclassname = 'gridPager';
        this.collapsedheight = '16px';
        this.wids = [];
        this.key = '';
        this.expandHandle = null;

        this.__idIndexer = 0;
        this.HeaderRow = null;
        var tbl = dom.byId(gridID);
        if (tbl) {
            this.table = tbl;
            if (tbl.getAttribute('key')) {
                this.key = tbl.getAttribute('key');
            }

            if ((tbl.rows.length > 0) && (tbl.rows[0].cells.length > 0)) {
                var cell = (domClass.contains(tbl.rows[0], this.pagerclassname)) ?
                    tbl.rows[1].cells[0] : tbl.rows[0].cells[0];

                this.expandable = (domClass.contains(cell, this.expandclassname) ||
                    domClass.contains(cell, this.expandnoiconclassname) ||
                        domClass.contains(cell, this.collapseclassname) ||
                            domClass.contains(cell, this.collapsenoiconclassname));
                // set up listeners for click events on row expanders
                if (this.expandable) {
                    this.expandAllCell = cell;
                    if (this.expandHandle) {
                        this.expandHandle.remove();
                    }

                    this.expandHandle = on(cell, 'click', lang.hitch(this, this.expandCollapseAll), true);
                }
            }

            this.setHeaderRow();
            this.initColWidths();
            this.setSortIDs();
            this.attachResizeEvent();

        }
    };

    slxdatagrid.prototype.GridKey = function() {
        return this.gridID + this.key;
    };

    slxdatagrid.prototype.dispose = function() {
        this.table = null;
        this.expandAllCell = null;
    };

    slxdatagrid.prototype.getColIndexStart = function() {
        return (this.expandable) ? 1 : 0;
    };

    slxdatagrid.prototype.setSortIDs = function() {
        if ((this.table.rows.length > 0) && (this.HeaderRow)) {
            var idx = (this.table.id.lastIndexOf('_') > 0) ? this.table.id.lastIndexOf('_') + 1 : 0;
            var idRoot = this.table.id.substring(idx);
            for (var i = 0; i < this.HeaderRow.cells.length; i++) {
                var links = query('A', dom.byId(this.HeaderRow.cells[i]));
                for (var j = 0; j < links.length; j++) {
                    links[j].id = idRoot + this.__idIndexer++;
                }
            }
        }
    };

    // ----------------------- row expand/collapse section---------------------------------------------------------------- //
    slxdatagrid.prototype.expandCollapseAll = function () {
        var i;
        if (domClass.contains(this.expandAllCell, this.expandclassname)) {
            //expand all
            for (i = 1; i < this.table.rows.length; i++) {
                this.expandRow(this.table.rows[i]);
            }

            domClass.remove(this.expandAllCell, this.expandclassname);
            domClass.add(this.expandAllCell, this.collapseclassname);
        } else if (domClass.contains(this.expandAllCell, this.collapseclassname)) {
            //collapse all
            for (i = 1; i < this.table.rows.length; i++) {
                this.collapseRow(this.table.rows[i]);
            }

            domClass.remove(this.expandAllCell, this.collapseclassname);
            domClass.add(this.expandAllCell, this.expandclassname);
        }
    };

    function expandCollapseRow() {
        var row = this.gridobj.getRow(this.idx);
        this.gridobj.toggleRow(row);
    }

    slxdatagrid.prototype.toggleRow = function(row) {
        if (row) {
            if (domClass.contains(row.cells[0], this.expandclassname) ||
                domClass.contains(row.cells[0], this.expandnoiconclassname)) {
                this.expandRow(row);
            } else if (domClass.contains(row.cells[0], this.collapseclassname) ||
                domClass.contains(row.cells[0], this.collapsenoiconclassname)) {
                this.collapseRow(row);
            }
        }
    };

    slxdatagrid.prototype.expandRow = function(row) {

        if (row) {
            var cell = row.cells[0];
            if (domClass.contains(cell, this.collapseclassname) || (!domClass.contains(cell, this.expandclassname) && !domClass.contains(cell, this.expandnoiconclassname))) {
                return;
            }

            var collapseH = this.collapsedheight.replace('px', '');

            for (var i = this.getColIndexStart(); i < row.cells.length; i++) {
                cell = row.cells[i];
                if (cell.childNodes[0]) {
                    if (domClass.contains(cell.childNodes[0], this.contentdivclassname)) {
                        if (cell.childNodes[0].scrollHeight > collapseH) {
                            domStyle.set(cell.childNodes[0], 'height', '100%');
                        }
                    }
                }
            }
            var expandoCell = row.cells[0];

            if (domClass.contains(expandoCell, this.expandclassname)) {
                domClass.remove(expandoCell, this.expandclassname);
                domClass.add(expandoCell, this.collapseclassname);
            } else {
                domClass.remove(expandoCell, this.expandnoiconclassname);
                domClass.add(expandoCell, this.collapsenoiconclassname);
            }
        }
    };

    slxdatagrid.prototype.collapseRow = function(row) {
        if (row) {
            var cell = row.cells[0];
            if (domClass.contains(cell, this.expandclassname) || (!domClass.contains(cell, this.collapseclassname) && !domClass.contains(cell, this.collapsenoiconclassname))) {
                return;
            }
            var collapseH = this.collapsedheight.replace('px', '');
            var setH = collapseH;
            for (var i = this.getColIndexStart(); i < row.cells.length; i++) {
                cell = row.cells[i];
                if (cell.childNodes[0]) {
                    if (domClass.contains(cell.childNodes[0], this.contentdivclassname)) {
                        setH = (collapseH < cell.childNodes[0].scrollHeight) ? collapseH : cell.childNodes[0].scrollHeight;
                        domStyle.set(cell.childNodes[0], 'height', setH + 'px');
                    }
                }
            }

            var expandoCell = row.cells[0];

            if (domClass.contains(expandoCell, this.collapseclassname)) {
                domClass.remove(expandoCell, this.collapseclassname);
                domClass.add(expandoCell, this.expandclassname);
            } else {
                domClass.remove(expandoCell, this.collapsenoiconclassname);
                domClass.add(expandoCell, this.expandnoiconclassname);
            }
        }
    };

    slxdatagrid.prototype.getRow = function(idx) {
        if ((this.table) && (this.table.rows.length > idx)) {
            return this.table.rows[idx];
        }
        return null;
    };

    // ----------------------- end row expand/collapse section---------------------------------------------------------------- //

    // ----------------------- start column resize section-------------------------------------------------------------------- //

    // ------------remembering column widths...

    slxdatagrid.prototype.initColWidths = function() {
        if (this.HeaderRow) {
            if (this.getWidthsFromCookie()) {
                if (this.expandable) {
                    this.setWidth(0, '20', false);
                }
                for (var i = this.getColIndexStart(); i < this.HeaderRow.cells.length; i++) {
                    this.setWidth(i, this.wids[i], false);
                }
            } else {
                this.fillSpace();
            }
        }
    };

    slxdatagrid.prototype.fillSpace = function() {
        if (this.HeaderRow) {
            if (this.expandable) {
                this.setWidth(0, '20', false);
            }

            var cont = dom.byId(this.containerId);
            var container = this.getRegion(cont);
            var containerW = container.right - container.left;

            var tbl = this.getRegion(this.table);
            this.doResize();
            var spaceWidth = container.right - tbl.right;

            var divCols = this.HeaderRow.cells.length;
            if (this.expandable) {
                divCols--;
            }

            var increaseBy = Math.round(spaceWidth / divCols);
            increaseBy--;
            this.getCurrentWidths();
            var start = (this.expandable) ? 1 : 0;
            if (increaseBy > 3) {
                for (var i = start; i < this.HeaderRow.cells.length; i++) {
                    var newtableregion = this.getRegion(this.table);
                    if (newtableregion.right > container.right - increaseBy) {
                        increaseBy = container.right - newtableregion.right - 2;
                    }
                    if (newtableregion.right > container.right - 4) {
                        return;
                    }
                    var newWidth = this.wids[i] + increaseBy;
                    if (this.wids[i]) {
                        this.setWidth(i, newWidth, false);
                        //did we grow too big?
                        //this takes care of IE6
                        if (cont.scrollWidth > containerW) {
                            this.setWidth(i, newWidth - (cont.scrollWidth - containerW), false);
                            return;
                        }
                        //now to take care of FireFox and IE7
                        newtableregion = this.getRegion(this.table);
                        var tblWidth = newtableregion.right - newtableregion.left - 2;
                        if (tblWidth >= containerW) {
                            var newNewWidth = newWidth - (tblWidth - containerW + 5);
                            this.setWidth(i, newNewWidth, false);
                            return;
                        }
                    }
                }
            }
        }
    };

    slxdatagrid.prototype.getCurrentWidths = function() {
        if (this.HeaderRow) {
            this.wids = [];
            for (var i = 0; i < this.HeaderRow.cells.length; i++) {
                this.wids.push(this.getColumnWidth(i));
            }
        }
    };

    slxdatagrid.prototype.getColumnWidth = function(colIndex) {
        if (this.HeaderRow) {
            if (this.HeaderRow.cells[colIndex]) {
                var region = this.getRegion(this.HeaderRow.cells[colIndex]);
                return region.right - region.left;
            }
        }
        return 0;
    };

    slxdatagrid.prototype.getRegion = function(node) {
        var pos = domGeom.position(node, true);

        // Transform our position object into what the old YAHOO.util.Region object looked like
        var results = {
            bottom: pos.y - pos.h,
            left: pos.x,
            right: pos.x + pos.w,
            top: pos.y
        };

        return results;
    };

    slxdatagrid.prototype.getWidthsFromCookie = function () {
        var widthcookie =  cookie.getCookie('GRIDCW');
        if (widthcookie) {
            var grids = widthcookie.split('||');
            for (var i = 0; i < grids.length; i++) {
                var widthdef = grids[i].split('!');
                if (widthdef[0] == this.GridKey()) {
                    if (widthdef[1]) {
                        this.wids = widthdef[1].split(':');
                        return true;
                    }
                }
            }
        }
        //if we get here, it means we don't have the widths in the cookie
        //this.getCurrentWidths(); // add the current widths to the wids array.
        return false;
    };

    slxdatagrid.prototype.setWidthsToCookie = function() {
        this.getCurrentWidths(); // make sure the wids array is up-to-date.
        var widthcookie = cookie.getCookie('GRIDCW');
        if (widthcookie) {
            var grids = widthcookie.split('||');
            widthcookie = '';
            var needtoadd = true;
            for (var i = 0; i < grids.length; i++) {
                var widthdef = grids[i].split('!');
                if (widthdef[0] == this.GridKey()) {
                    widthdef[1] = this.generateWidthCookieString();
                    needtoadd = false;
                }
                widthcookie += (i > 0) ? '||' : '';
                widthcookie += widthdef[0] + '!' + widthdef[1];
            }
            if (needtoadd) {
                widthcookie += (widthcookie !== '') ? '||' : '';
                widthcookie += this.GridKey() + '!' + this.generateWidthCookieString();
            }
        } else {
            widthcookie = this.GridKey() + '!' + this.generateWidthCookieString();
        }
        document.cookie = 'GRIDCW=' + widthcookie;
    };

    slxdatagrid.prototype.generateWidthCookieString = function() {
        var str = '';
        for (var i = 0; i < this.wids.length; i++) {
            str += (i > 0) ? ':' : '';
            var num = this.wids[i];
            num = Math.round(num);
            str += num;
        }

        return str;
    };

    slxdatagrid.prototype.setWidth = function(colIdx, width, persist) {
        if (!isNaN(width)) {
            width = width + 'px';
        }

        if (this.HeaderRow) {
            for (var r = 0; r < this.table.rows.length; r++) {
                if (this.table.rows[r].cells[colIdx]) {
                    var cell = dom.byId(this.table.rows[r].cells[colIdx]);
                    cell.style.width = width;
                    cell.style.position = '';
                }
            }

            if (persist) {
                this.setWidthsToCookie();
            }
        }
    };

    slxdatagrid.prototype.setHeaderRow = function() {
        for (var r = 0; r < this.table.rows.length; r++) {
            if (this.table.rows[r].getAttribute('HeaderRow')) {
                this.HeaderRow = this.table.rows[r];
                return;
            }
        }
    };

    slxdatagrid.prototype.doResize = function() {
        var cont = dom.byId(this.containerId);
        var container = this.getRegion(cont);

        var tbl = this.getRegion(this.table);

        if ((tbl.right - tbl.left) > (container.right - container.left)) {
            if (cont.style.height === '') {
                var tblheight = tbl.bottom - tbl.top;
                dom.byId(this.containerId).style.height = (tblheight + 20) + 'px';
            }
        }
    };

    slxdatagrid.prototype.attachResizeEvent = function() {
        var viewport = window['mainViewport'];
        var panel = (viewport ? viewport.findById('center_panel_center') : false);

        if (panel) {
            panel.on('resize', function(panel, adjWidth, adjHeight, width, height) {
                this.doResize();
            }, this);
        }
    };

    slxdatagridcolumn = function(headerColId, datagrid, colIdx) {
        if (headerColId) {
            this.datagrid = datagrid;
            this.colIndex = colIdx;
            this.headerColId = headerColId;
            this.handleElId = headerColId;
            this.isMoving = false;

            var node = dom.byId(headerColId);
            if (node) {
                this.domNode = node;
                this.position = domGeom.position(this.domNode);

                this.moveable = new Moveable(node);

                // dojo drag events
                this.onMoveHandle = this.moveable.on('Move', lang.hitch(this, this.onMove));
                this.onFirstMoveHandle = this.moveable.on('FirstMove', lang.hitch(this, this.onFirstMove));
                this.onMoveStopHandle = this.moveable.on('MoveStop', lang.hitch(this, this.onMoveStop));

                // dom mouse events
                this.onmouseoverHandle = on(node, 'mouseover', lang.hitch(this, this.onmouseover));
                this.onmouseoutHandle = on(node, 'mouseout', lang.hitch(this, this.onmouseout));
            }
        }
    };

    slxdatagridcolumn.prototype.refreshPosition = function() {
        var node = dom.byId(this.headerColId);
        if (node) {
            this.domNode = node;
            this.position = domGeom.position(this.domNode);
        }
    };

    slxdatagridcolumn.prototype.dispose = function() {
        this.datagrid = null;
        this.onMoveHandle.remove();
        this.onFirstMoveHandle.remove();
        this.onMoveStopHandle.remove();
        this.onmouseoverHandle.remove();
        this.onmouseoutHandle.remove();

        this.moveable.destroy();
    };

    slxdatagridcolumn.prototype.onFirstMove = function(mover, e) {
        this.startWidth = mover.node.offsetWidth;
        this.startPosX = e.clientX;
        this.startTop = mover.node.style.top;
        this.startLeft = mover.node.style.left;
    };

    slxdatagridcolumn.prototype.onMove = function(mover, leftTop, e) {
        this.isMoving = true;

        // Lock in left/top positions
        mover.node.style.top = this.startTop;
        mover.node.style.left = this.startLeft;

        var newWidth = e.clientX - this.position.x;
        newWidth = newWidth * 1.1;
        domStyle.set(mover.node, 'width', (newWidth + 'px'));

        this.datagrid.setWidth(this.colIndex, mover.node.style.width, true);
        this.refreshPosition();

        this.isMoving = false;
    };

    slxdatagridcolumn.prototype.onMoveStop = function() {
        this.isMoving = false;
    };

    slxdatagridcolumn.prototype.onmouseover = function(e) {
        if (!this.isMoving && this.isDraggableRegion(e.clientX)) {
            this.domNode.style.cursor = 'col-resize';
        } else {
            this.domNode.style.cursor = '';
        }
    };

    slxdatagridcolumn.prototype.isDraggableRegion = function(clientX) {
        this.refreshPosition();

        var rightPos = this.position.x + this.position.w;
        var padding = 6;

        // We must fall in between the rows
        if (clientX > (rightPos - padding) && clientX < (rightPos + padding)) {
            return true;
        }

        return false;
    };

    slxdatagridcolumn.prototype.onmouseout = function() {
        this.domNode.style.cursor = '';
    };
});
var resizeTimerID = null;
function Timeline_onResize() {
    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            tl.layout();
        }, 500);
    }
}

function Timeline_init(timeline_object, tab) {
    var method = timeline_object.onLoad;
    var delay = 750;
    $("#show_"+tab).click(function(){window.setTimeout(method, delay);});
    $("#more_" + tab).click(function () { window.setTimeout(method, delay); });

    if ($("#more_"+tab).length > 0) {
        $("#show_More").click(function(){window.setTimeout(method, delay);});
    }

    $(".tws-main-tab-buttons").click(function() { closeTimelineBubble(); });
    $(".tws-more-tab-buttons-container").click(function () { closeTimelineBubble(); });

    if (document.body.addEventListener) {
        document.body.addEventListener('onresize', Timeline_onResize, false);
    }  else if (document.body.attachEvent) {
        document.body.attachEvent('onresize', Timeline_onResize);
    }

//    var svc = Sage.Services.getService("GroupManagerService");  
//    if (svc) {
//        svc.addListener(Sage.GroupManagerService.CURRENT_GROUP_POSITION_CHANGED, function(sender, evt) {
//            method();
//        });
    //    }
    dojo.subscribe('/group/context/changed', timeline_object, timeline_object.onLoad);

    if (document.getElementById(timeline_object.ParentElement) != null) {
        if (document.getElementById(timeline_object.ParentElement).hasChildNodes()) {
            method();
        } else {
            window.setTimeout(method, delay);
        }
    }
}

function closeTimelineBubble() {
    //Use the Timeline's ajax wrapper to find and close the bubble popup.
    SimileAjax.WindowManager.popAllLayers();    
}

function Timeline_RecalculateHeight() {
    $("div.timeline-container").each(function (i, elem) {
        var container = elem;
        if (container.hasChildNodes() && (container.clientHeight > 0)) {
            var largest = (container.clientHeight > 0) ? container.clientHeight - 55 : 300 - 55;
            var changed = false;
            var bands = $(".timeline-band-0 .timeline-band-events .timeline-band-layer-inner");
            for (var i = 0; i < bands.length; i++) {
                var div = bands[i];
                if (div && (div.lastChild)) {
                    for (var j = 0; j < div.childNodes.length; j++) {
                        if (div.childNodes[j].offsetTop > largest) {
                            largest = div.childNodes[j].offsetTop;
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                var navbandheight = $(".timeline-band-1")[0].style.height;
                container.style.height = parseInt(largest + parseInt(navbandheight, 10) + 30, 10) + "px";
                $(".timeline-band-0")[0].style.height = parseInt(largest + 30, 10) + "px";
                $(".timeline-band-1")[0].style.top = parseInt(largest + 30, 10) + "px";
                $(".timeline-band-1")[0].style.height = navbandheight;
                if (container.parent) {
                    container.parent.style.height = container.style.height;
                }
            }

            window.setTimeout(function () { Timeline_RecalculateHeight(); }, 2000);
        }
    });
}

function Timeline_IEFix() {
    var divs = $(".timeline-band-layer-inner div");
    if (divs) {
        divs.each(function(i, el) {
            if(el.innerHTML !== '') {
                $(el).width('auto');
            }
        });
    }
}

function Timeline_GetMashupData(mashupName, queryName, timeLine, eventSource) {
    dojo.require('Sage.Utility');
    var service = Sage.Utility.getSDataService('mashups');
    var request = new Sage.SData.Client.SDataNamedQueryRequest(service);
    var clientService = Sage.Services.getService("ClientEntityContext");
    var clientContext = clientService.getContext();
    var entityId = clientContext.EntityId;

    request.setApplicationName('$app');
    request.setResourceKind('mashups');
    request.uri.setCollectionPredicate("'" + mashupName + "'");
    request.setQueryName('execute');
    request.setQueryArg('_resultName', queryName);
    request.setQueryArg('_EntityId', entityId);

    request.read({
        success: function (data) {
            var events = [];
            var json = {
                events: []
            };

            var item;
            var len = data.$resources.length;
            for (var i = 0; i < len; i++) {
                item = data.$resources[i];
                json.events.push({
                    start: Sage.Utility.Convert.toDateFromString(item.Start),
                    end: Sage.Utility.Convert.toDateFromString(item.End),
                    title: item.Title,
                    description: item.Description,
                    isDuration: true,
                    link: item.Link,
                    icon: item.Icon,
                    color: item.Color,
                    image: item.Thumbnail
                });
            }

            eventSource.loadJSON(json, document.location.href);
            if (dojo.isIE === 9) {
                Timeline_IEFix();
                $(".timeline-container").mousedown(function() {
                    Timeline_IEFix();
                });
                $(".timeline-container").mouseup(function() {
                    Timeline_IEFix();
                });
            }
        },
        failure: function (data) {
        }
    });
}

 
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
};
// ========================================================================
//  XML.ObjTree -- XML source code from/to JavaScript object like E4X
// ========================================================================

if ( typeof(XML) == 'undefined' ) XML = function() {};

//  constructor

XML.ObjTree = function () {
    return this;
};

//  class variables

XML.ObjTree.VERSION = "0.24";

//  object prototype

XML.ObjTree.prototype.xmlDecl = '<?xml version="1.0" encoding="UTF-8" ?>\n';
XML.ObjTree.prototype.attr_prefix = '-';
XML.ObjTree.prototype.overrideMimeType = 'text/xml';

//  method: parseXML( xmlsource )

XML.ObjTree.prototype.parseXML = function ( xml ) {
    var root;
    if ( window.DOMParser ) {
        var xmldom = new DOMParser();
//      xmldom.async = false;           // DOMParser is always sync-mode
        var dom = xmldom.parseFromString( xml, "application/xml" );
        if ( ! dom ) return;
        root = dom.documentElement;
    } else if ( window.ActiveXObject ) {
        xmldom = new ActiveXObject('Microsoft.XMLDOM');
        xmldom.async = false;
        xmldom.loadXML( xml );
        root = xmldom.documentElement;
    }
    if ( ! root ) return;
    return this.parseDOM( root );
};

//  method: parseHTTP( url, options, callback )

XML.ObjTree.prototype.parseHTTP = function ( url, options, callback ) {
    var myopt = {};
    for( var key in options ) {
        myopt[key] = options[key];                  // copy object
    }
    if ( ! myopt.method ) {
        if ( typeof(myopt.postBody) == "undefined" &&
             typeof(myopt.postbody) == "undefined" &&
             typeof(myopt.parameters) == "undefined" ) {
            myopt.method = "get";
        } else {
            myopt.method = "post";
        }
    }
    if ( callback ) {
        myopt.asynchronous = true;                  // async-mode
        var __this = this;
        var __func = callback;
        var __save = myopt.onComplete;
        myopt.onComplete = function ( trans ) {
            var tree;
            if ( trans && trans.responseXML && trans.responseXML.documentElement ) {
                tree = __this.parseDOM( trans.responseXML.documentElement );
            } else if ( trans && trans.responseText ) {
                tree = __this.parseXML( trans.responseText );
            }
            __func( tree, trans );
            if ( __save ) __save( trans );
        };
    } else {
        myopt.asynchronous = false;                 // sync-mode
    }
    var trans;
    if ( typeof(HTTP) != "undefined" && HTTP.Request ) {
        myopt.uri = url;
        var req = new HTTP.Request( myopt );        // JSAN
        if ( req ) trans = req.transport;
    } else if ( typeof(Ajax) != "undefined" && Ajax.Request ) {
        var req = new Ajax.Request( url, myopt );   // ptorotype.js
        if ( req ) trans = req.transport;
    }
//  if ( trans && typeof(trans.overrideMimeType) != "undefined" ) {
//      trans.overrideMimeType( this.overrideMimeType );
//  }
    if ( callback ) return trans;
    if ( trans && trans.responseXML && trans.responseXML.documentElement ) {
        return this.parseDOM( trans.responseXML.documentElement );
    } else if ( trans && trans.responseText ) {
        return this.parseXML( trans.responseText );
    }
}

//  method: parseDOM( documentroot )

XML.ObjTree.prototype.parseDOM = function ( root ) {
    if ( ! root ) return;

    this.__force_array = {};
    if ( this.force_array ) {
        for( var i=0; i<this.force_array.length; i++ ) {
            this.__force_array[this.force_array[i]] = 1;
        }
    }

    var json = this.parseElement( root );   // parse root node
    if ( this.__force_array[root.nodeName] ) {
        json = [ json ];
    }
    if ( root.nodeType != 11 ) {            // DOCUMENT_FRAGMENT_NODE
        var tmp = {};
        tmp[root.nodeName] = json;          // root nodeName
        json = tmp;
    }
    return json;
};

//  method: parseElement( element )

XML.ObjTree.prototype.parseElement = function ( elem ) {
    //  COMMENT_NODE
    if ( elem.nodeType == 7 ) {
        return;
    }

    //  TEXT_NODE CDATA_SECTION_NODE
    if ( elem.nodeType == 3 || elem.nodeType == 4 ) {
        var bool = elem.nodeValue.match( /[^\x00-\x20]/ );
        if ( bool == null ) return;     // ignore white spaces
        return elem.nodeValue;
    }

    var retval;
    var cnt = {};

    //  parse attributes
    if ( elem.attributes && elem.attributes.length ) {
        retval = {};
        for ( var i=0; i<elem.attributes.length; i++ ) {
            var key = elem.attributes[i].nodeName;
            if ( typeof(key) != "string" ) continue;
            var val = elem.attributes[i].nodeValue;
            if ( ! val ) continue;
            key = this.attr_prefix + key;
            if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
            cnt[key] ++;
            this.addNode( retval, key, cnt[key], val );
        }
    }

    //  parse child nodes (recursive)
    if ( elem.childNodes && elem.childNodes.length ) {
        var textonly = true;
        if ( retval ) textonly = false;        // some attributes exists
        for ( var i=0; i<elem.childNodes.length && textonly; i++ ) {
            var ntype = elem.childNodes[i].nodeType;
            if ( ntype == 3 || ntype == 4 ) continue;
            textonly = false;
        }
        if ( textonly ) {
            if ( ! retval ) retval = "";
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if ( ! retval ) retval = {};
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                var key = elem.childNodes[i].nodeName;
                if ( typeof(key) != "string" ) continue;
                var val = this.parseElement( elem.childNodes[i] );
                if ( ! val ) continue;
                if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
                cnt[key] ++;
                this.addNode( retval, key, cnt[key], val );
            }
        }
    }
    return retval;
};

//  method: addNode( hash, key, count, value )

XML.ObjTree.prototype.addNode = function ( hash, key, cnts, val ) {
    if ( this.__force_array[key] ) {
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else if ( cnts == 1 ) {                   // 1st sibling
        hash[key] = val;
    } else if ( cnts == 2 ) {                   // 2nd sibling
        hash[key] = [ hash[key], val ];
    } else {                                    // 3rd sibling and more
        hash[key][hash[key].length] = val;
    }
};

//  method: writeXML( tree )

XML.ObjTree.prototype.writeXML = function ( tree ) {
    var xml = this.hash_to_xml( null, tree );
    return this.xmlDecl + xml;
};

//  method: hash_to_xml( tagName, tree )

XML.ObjTree.prototype.hash_to_xml = function ( name, tree ) {
    var elem = [];
    var attr = [];
    for( var key in tree ) {
        if ( ! tree.hasOwnProperty(key) ) continue;
        var val = tree[key];
        if ( key.charAt(0) != this.attr_prefix ) {
            if ( typeof(val) == "undefined" || val == null ) {
                elem[elem.length] = "<"+key+" />";
            } else if ( typeof(val) == "object" && val.constructor == Array ) {
                elem[elem.length] = this.array_to_xml( key, val );
            } else if ( typeof(val) == "object" ) {
                elem[elem.length] = this.hash_to_xml( key, val );
            } else {
                elem[elem.length] = this.scalar_to_xml( key, val );
            }
        } else {
            attr[attr.length] = " "+(key.substring(1))+'="'+(this.xml_escape( val ))+'"';
        }
    }
    var jattr = attr.join("");
    var jelem = elem.join("");
    if ( typeof(name) == "undefined" || name == null ) {
        // no tag
    } else if ( elem.length > 0 ) {
        if ( jelem.match( /\n/ )) {
            jelem = "<"+name+jattr+">\n"+jelem+"</"+name+">\n";
        } else {
            jelem = "<"+name+jattr+">"  +jelem+"</"+name+">\n";
        }
    } else {
        jelem = "<"+name+jattr+" />\n";
    }
    return jelem;
};

//  method: array_to_xml( tagName, array )

XML.ObjTree.prototype.array_to_xml = function ( name, array ) {
    var out = [];
    for( var i=0; i<array.length; i++ ) {
        var val = array[i];
        if ( typeof(val) == "undefined" || val == null ) {
            out[out.length] = "<"+name+" />";
        } else if ( typeof(val) == "object" && val.constructor == Array ) {
            out[out.length] = this.array_to_xml( name, val );
        } else if ( typeof(val) == "object" ) {
            out[out.length] = this.hash_to_xml( name, val );
        } else {
            out[out.length] = this.scalar_to_xml( name, val );
        }
    }
    return out.join("");
};

//  method: scalar_to_xml( tagName, text )

XML.ObjTree.prototype.scalar_to_xml = function ( name, text ) {
    if ( name == "#text" ) {
        return this.xml_escape(text);
    } else {
        return "<"+name+">"+this.xml_escape(text)+"</"+name+">\n";
    }
};

//  method: xml_escape( text )

XML.ObjTree.prototype.xml_escape = function ( text ) {
    return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};




(function(){var d=Sage,a=Sage.namespace("Sage.SData.Client.Ajax");var f=function(g){return((g>=200&&g<300)||g===304)};var b=function(k,j){if(k.readyState==4){if(f(k.status)){if(j.success){j.success.call(j.scope||this,k,j)}}else{if(k.status===0){var i=false;try{i=(k.statusText==="")}catch(g){i=true}if(i){var h=j.aborted||j.failure;if(h){h.call(j.scope||this,k,j)}}else{if(j.failure){j.failure.call(j.scope||this,k,j)}}}else{if(j.failure){j.failure.call(j.scope||this,k,j)}}}}};var c=function(h,g){h.onreadystatechange=function(){b.call(h,h,g)}};var e=function(h){var g=[];for(var i in h){g.push(encodeURIComponent(i)+"="+encodeURIComponent(h[i]))}return g.join("&")};Sage.apply(Sage.SData.Client.Ajax,{request:function(j){var j=d.apply({},j);j.params=d.apply({},j.params);j.headers=d.apply({},j.headers);if(j.cache!==false){j.params[j.cacheParam||"_t"]=(new Date()).getTime()}j.method=j.method||"GET";var g=e(j.params);if(g){j.url=j.url+(/\?/.test(j.url)?"&":"?")+g}var i=new XMLHttpRequest();if(j.user){i.open(j.method,j.url,j.async!==false,j.user,j.password);i.withCredentials=true}else{i.open(j.method,j.url,j.async!==false)}try{i.setRequestHeader("Accept",j.accept||"*).join(";"+f+",")+";"+f}return e},executeRequest:function(f,e,g){if(this.json){f.setQueryArg("format","json")}var h=b.apply({async:e.async,headers:{},method:"GET",url:f.build()},{scope:this,success:function(i,j){var k=this.processFeed(i);this.fireEvent("requestcomplete",f,j,k);if(e.success){e.success.call(e.scope||this,k)}},failure:function(i,j){this.fireEvent("requestexception",f,j,i);if(e.failure){e.failure.call(e.scope||this,i,j)}},aborted:function(i,j){this.fireEvent("requestaborted",f,j,i);if(e.aborted){e.aborted.call(e.scope||this,i,j)}}},g);b.apply(h.headers,this.createHeadersForRequest(f),f.completeHeaders);if(f.extendedHeaders.Accept){h.headers.Accept=this.extendAcceptRequestHeader(h.headers.Accept,f.extendedHeaders.Accept)}if(this.userName&&this.useCredentialedRequest){h.user=this.userName;h.password=this.password}this.fireEvent("beforerequest",f,h);if(typeof h.result!=="undefined"){if(e.success){e.success.call(e.scope||this,h.result)}return}return d.Ajax.request(h)},abortRequest:function(e){d.Ajax.cancel(e)},readFeed:function(f,e){e=e||{};if(this.batchScope){this.batchScope.add({url:f.build(),method:"GET"});return}var g={headers:{Accept:this.json?"application/json,**"}};if(e.httpMethodOverride){if(this.json){f.setQueryArg("format","json")}g.headers["X-HTTP-Method-Override"]="GET";g.method="POST";g.body=f.build();g.url=f.build(true)}return this.executeRequest(f,e,g)},readEntry:function(f,e){e=e||{};if(this.batchScope){this.batchScope.add({url:f.build(),method:"GET"});return}var g=b.apply({},{success:function(i){var h=i["$resources"][0]||false;if(e.success){e.success.call(e.scope||this,h)}}},e);return this.executeRequest(f,g,{headers:{Accept:this.json?"application/json,**"}})},createEntry:function(h,g,f){f=f||{};if(this.batchScope){this.batchScope.add({url:h.build(),entry:g,method:"POST"});return}var j=b.apply({},{success:function(l){var k=l["$resources"][0]||false;if(f.success){f.success.call(f.scope||this,k)}}},f);var i=b.apply({},{method:"POST"});if(this.isJsonEnabled()){b.apply(i,{body:JSON.stringify(g),headers:{"Content-Type":"application/json"}})}else{var e=new XML.ObjTree();e.attr_prefix="@";b.apply(i,{body:e.writeXML(this.formatEntry(g)),headers:{"Content-Type":"application/atom+xml;type=entry",Accept:"application/atom+xml;type=entry,**";i.body=e.writeXML(this.formatEntry(g))}return this.executeRequest(h,k,i)},deleteEntry:function(g,f,e){e=e||{};if(this.batchScope){this.batchScope.add({url:g.build(),method:"DELETE",etag:!(e&&e.ignoreETag)&&f["$etag"]});return}var i={},h={method:"DELETE",headers:i};if(f["$etag"]&&!(e&&e.ignoreETag)){i["If-Match"]=f["$etag"]}return this.executeRequest(g,e,h)},executeServiceOperation:function(h,g,f){var j=b.apply({},{success:function(m){var l=m["$resources"][0]||false,k=l&&l.response,o=k&&k["$resources"],n=o&&o[0];if(n&&n["$name"]){l.response={};l.response[n["$name"]]=n}if(f.success){f.success.call(f.scope||this,l)}}},f);var i=b.apply({},{method:"POST"});if(this.isJsonEnabled()){b.apply(i,{body:JSON.stringify(g),headers:{"Content-Type":"application/json"}})}else{var e=new XML.ObjTree();e.attr_prefix="@";b.apply(i,{body:e.writeXML(this.formatEntry(g)),headers:{"Content-Type":"application/atom+xml;type=entry",Accept:"application/atom+xml;type=entry,**"}})}return this.executeRequest(e,n,j)},parseFeedXml:function(f){var e=new XML.ObjTree();e.attr_prefix="@";return e.parseXML(f)},isIncludedReference:function(f,e,g){return g.hasOwnProperty("@sdata:key")},isIncludedCollection:function(h,f,i){if(i.hasOwnProperty("@sdata:key")){return false}if(i.hasOwnProperty("@sdata:uri")||i.hasOwnProperty("@sdata:url")){return true}var j,g;for(var e in i){if(e[0]==="@"){continue}j=i[e];break}if(j){if(b.isArray(j)){g=j[0]}else{g=j}if(g&&g.hasOwnProperty("@sdata:key")){return true}}return false},convertEntity:function(j,e,g,f){f=f||{};f["$name"]=e;f["$key"]=g["@sdata:key"];f["$url"]=g["@sdata:uri"];f["$uuid"]=g["@sdata:uuid"];for(var m in g){if(m[0]==="@"){continue}var n=c.exec(m),h=n?n[1]:false,i=n?n[2]:m,k=g[m];if(typeof k==="object"){if(k.hasOwnProperty("@xsi:nil")){var l=null}else{if(this.isIncludedReference(h,i,k)){var l=this.convertEntity(h,i,k)}else{if(this.isIncludedCollection(h,i,k)){var l=this.convertEntityCollection(h,i,k)}else{l=this.convertCustomEntityProperty(h,i,k)}}}k=l}f[i]=k}return f},convertEntityCollection:function(k,e,g){for(var n in g){if(n[0]==="@"){continue}var o=c.exec(n),h=o?o[1]:false,j=o?o[2]:n,l=g[n];if(b.isArray(l)){var m=[];for(var f=0;f<l.length;f++){m.push(this.convertEntity(k,j,l[f]))}return{"$resources":m}}else{return{"$resources":[this.convertEntity(k,j,l)]}}break}return null},convertCustomEntityProperty:function(f,e,g){return g},formatEntity:function(g,f,i){i=i||{};if(f["$key"]){i["@sdata:key"]=f["$key"]}for(var e in f){if(e[0]==="$"){continue}var h=f[e];if(h==null){h={"@xsi:nil":"true"}}else{if(typeof h==="object"&&h.hasOwnProperty("$resources")){h=this.formatEntityCollection(g,h)}else{if(typeof h==="object"){h=this.formatEntity(g,h)}}}i[e]=h}return i},formatEntityCollection:function(h,k){var e={};for(var g=0;g<k["$resources"].length;g++){var j=k["$resources"][g],f=j["$name"],l=(e[f]=e[f]||[]);l.push(this.formatEntity(h,k["$resources"][g]))}return e},convertEntry:function(j){var e={};e["$descriptor"]=j.title;e["$etag"]=j["http:etag"];e["$httpStatus"]=j["http:httpStatus"];var l=j["sdata:payload"];for(var h in l){if(l.hasOwnProperty(h)==false){continue}var k=h.split(":"),i,g,f=l[h];if(k.length==2){i=k[0];g=k[1]}else{if(k.length<2){i=false;g=h}else{continue}}this.convertEntity(i,g,f,e)}return e},formatEntry:function(f,g){var e={};if(!g){e["@xmlns:sdata"]="http://schemas.sage.com/sdata/2008/1";e["@xmlns:xsi"]="http://www.w3.org/2001/XMLSchema-instance";e["@xmlns:http"]="http://schemas.sage.com/sdata/http/2008/1";e["@xmlns"]="http://www.w3.org/2005/Atom"}if(f["$httpMethod"]){e["http:httpMethod"]=f["$httpMethod"]}if(f["$ifMatch"]){e["http:ifMatch"]=f["$ifMatch"]}if(f["$etag"]){e["http:etag"]=f["$etag"]}if(f["$url"]){e.id=f["$url"]}e["sdata:payload"]={};e["sdata:payload"][f["$name"]]={"@xmlns":"http://schemas.sage.com/dynamic/2007"};this.formatEntity(false,f,e["sdata:payload"][f["$name"]]);return{entry:e}},convertFeed:function(g){var e={};if(g["opensearch:totalResults"]){e["$totalResults"]=parseInt(g["opensearch:totalResults"])}if(g["opensearch:startIndex"]){e["$startIndex"]=parseInt(g["opensearch:startIndex"])}if(g["opensearch:itemsPerPage"]){e["$itemsPerPage"]=parseInt(g["opensearch:itemsPerPage"])}if(g.link){e["$link"]={};for(var f=0;f<g.link.length;f++){e["$link"][g.link[f]["@rel"]]=g.link[f]["@href"]}if(e["$link"]["self"]){e["$url"]=e["$link"]["self"]}}e["$resources"]=[];if(b.isArray(g.entry)){for(var f=0;f<g.entry.length;f++){e["$resources"].push(this.convertEntry(g.entry[f]))}}else{if(typeof g.entry==="object"){e["$resources"].push(this.convertEntry(g.entry))}}return e},formatFeed:function(g){var e={};e["@xmlns:sdata"]="http://schemas.sage.com/sdata/2008/1";e["@xmlns:xsi"]="http://www.w3.org/2001/XMLSchema-instance";e["@xmlns:http"]="http://schemas.sage.com/sdata/http/2008/1";e["@xmlns"]="http://www.w3.org/2005/Atom";if(g["$url"]){e.id=g["$url"]}e.entry=[];for(var f=0;f<g["$resources"].length;f++){e.entry.push(this.formatEntry(g["$resources"][f],true)["entry"])}return{feed:e}},processFeed:function(e){if(!e.responseText){return null}var g=e.getResponseHeader&&e.getResponseHeader("Content-Type");if((g==="application/json")||(!g&&this.isJsonEnabled())){var f=JSON.parse(e.responseText);if(f.hasOwnProperty("$resources")){return f}else{return{"$resources":[f]}}}else{var f=this.parseFeedXml(e.responseText);if(f.hasOwnProperty("feed")){return this.convertFeed(f.feed)}else{if(f.hasOwnProperty("entry")){return{"$resources":[this.convertEntry(f.entry)]}}else{return false}}}}})})();

(function(r){var q=/^\s+|\s+$/g,p=/(,)/,i=/'/g,h=/\n/g,k=/&/g,m=/</g,l=/>/g,j=/"/g,c={},e={},g="is,ie".split(p).length!=3,a={tags:{begin:"{%",end:"%}"},allowWith:false},d=function(b,c,d){if(d)for(var a in d)b[a]=d[a];if(c)for(var a in c)b[a]=c[a];return b},n=function(a){return typeof a!=="string"?a:a.replace(k,"&amp;").replace(m,"&lt;").replace(l,"&gt;").replace(j,"&quot;")},o=function(a){return a.replace(i,"\\'").replace(h,"\\n")},t=function(a){return a.replace(q,"")},s=function(b,m){var f=m.tags.begin,h=m.tags.end;if(!g){var l=f+h,n=e[l]||(e[l]=new RegExp(f+"(.*?)"+h));return b.split(n)}var j=0,k=0,a=[];while((j=b.indexOf(f,k))!=-1&&(k=b.indexOf(h,j))!=-1){a[a.length]=j;a[a.length]=k}for(var d=[],i=0,c=0;c<a.length;c++){d[d.length]=b.substr(i,a[c]-i);i=a[c]+(c%2?h.length:f.length)}d.push(b.substr(i));return d},f=function(f,i){if(f.join)f=f.join("");if(c[f])return c[f];for(var i=d({},i,a),b=s(f,i),e=1;e<b.length;e+=2)if(b[e].length>0){var j=b[e].charAt(0),g=b[e].substr(1);switch(j){case"=":b[e]="__r.push("+g+");";break;case":":b[e]="__r.push(__s.encode("+g+"));";break;case"!":b[e]="__r.push("+t(g)+".apply(__v, __c));"}}for(var e=0;e<b.length;e+=2)b[e]="__r.push('"+o(b[e])+"');";b.unshift("var __r = [], $ = __v, $$ = __c, __s = Simplate;",a.allowWith?"with ($ || {}) {":"");b.push(a.allowWith?"}":"","return __r.join('');");var h;try{h=new Function("__v, __c",b.join(""))}catch(k){h=function(){return k.message}}return c[f]=h},b=function(a,b){this.fn=f(a,b)};d(b,{options:a,encode:n,make:f});d(b.prototype,{apply:function(b,a){return this.fn.call(a||this,b,a||b)}});r.Simplate=b})(window)

dhtmlx=function(a){for(var b in a)dhtmlx[b]=a[b];return dhtmlx};
dhtmlx.extend_api=function(a,b,c){var d=window[a];if(d)window[a]=function(a){if(a&&typeof a=="object"&&!a.tagName&&!(a instanceof Array)){var c=d.apply(this,b._init?b._init(a):arguments),g;for(g in dhtmlx)if(b[g])this[b[g]](dhtmlx[g]);for(g in a)if(b[g])this[b[g]](a[g]);else g.indexOf("on")==0&&this.attachEvent(g,a[g])}else c=d.apply(this,arguments);b._patch&&b._patch(this);return c||this},window[a].prototype=d.prototype,c&&dhtmlXHeir(window[a].prototype,c)};
dhtmlxAjax={get:function(a,b){var c=new dtmlXMLLoaderObject(!0);c.async=arguments.length<3;c.waitCall=b;c.loadXML(a);return c},post:function(a,b,c){var d=new dtmlXMLLoaderObject(!0);d.async=arguments.length<4;d.waitCall=c;d.loadXML(a,!0,b);return d},getSync:function(a){return this.get(a,null,!0)},postSync:function(a,b){return this.post(a,b,null,!0)}};
function dtmlXMLLoaderObject(a,b,c,d){this.xmlDoc="";this.async=typeof c!="undefined"?c:!0;this.onloadAction=a||null;this.mainObject=b||null;this.waitCall=null;this.rSeed=d||!1;return this}
dtmlXMLLoaderObject.prototype.waitLoadFunction=function(a){var b=!0;return this.check=function(){if(a&&a.onloadAction!=null&&(!a.xmlDoc.readyState||a.xmlDoc.readyState==4)&&b){b=!1;if(typeof a.onloadAction=="function")a.onloadAction(a.mainObject,null,null,null,a);if(a.waitCall)a.waitCall.call(this,a),a.waitCall=null}}};
dtmlXMLLoaderObject.prototype.getXMLTopNode=function(a,b){if(this.xmlDoc.responseXML){var c=this.xmlDoc.responseXML.getElementsByTagName(a);c.length==0&&a.indexOf(":")!=-1&&(c=this.xmlDoc.responseXML.getElementsByTagName(a.split(":")[1]));var d=c[0]}else d=this.xmlDoc.documentElement;if(d)return this._retry=!1,d;if(_isIE&&!this._retry){var e=this.xmlDoc.responseText,b=this.xmlDoc;this._retry=!0;this.xmlDoc=new ActiveXObject("Microsoft.XMLDOM");this.xmlDoc.async=!1;this.xmlDoc.loadXML(e);return this.getXMLTopNode(a,
b)}dhtmlxError.throwError("LoadXML","Incorrect XML",[b||this.xmlDoc,this.mainObject]);return document.createElement("DIV")};dtmlXMLLoaderObject.prototype.loadXMLString=function(a){try{var b=new DOMParser;this.xmlDoc=b.parseFromString(a,"text/xml")}catch(c){this.xmlDoc=new ActiveXObject("Microsoft.XMLDOM"),this.xmlDoc.async=this.async,this.xmlDoc.loadXML(a)}this.onloadAction(this.mainObject,null,null,null,this);if(this.waitCall)this.waitCall(),this.waitCall=null};
dtmlXMLLoaderObject.prototype.loadXML=function(a,b,c,d){this.rSeed&&(a+=(a.indexOf("?")!=-1?"&":"?")+"a_dhx_rSeed="+(new Date).valueOf());this.filePath=a;this.xmlDoc=!_isIE&&window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");if(this.async)this.xmlDoc.onreadystatechange=new this.waitLoadFunction(this);this.xmlDoc.open(b?"POST":"GET",a,this.async);d?(this.xmlDoc.setRequestHeader("User-Agent","dhtmlxRPC v0.1 ("+navigator.userAgent+")"),this.xmlDoc.setRequestHeader("Content-type",
"text/xml")):b&&this.xmlDoc.setRequestHeader("Content-type","application/x-www-form-urlencoded");this.xmlDoc.setRequestHeader("X-Requested-With","XMLHttpRequest");this.xmlDoc.send(c);this.async||(new this.waitLoadFunction(this))()};dtmlXMLLoaderObject.prototype.destructor=function(){return this.xmlDoc=this.mainObject=this.onloadAction=null};
dtmlXMLLoaderObject.prototype.xmlNodeToJSON=function(a){for(var b={},c=0;c<a.attributes.length;c++)b[a.attributes[c].name]=a.attributes[c].value;b._tagvalue=a.firstChild?a.firstChild.nodeValue:"";for(c=0;c<a.childNodes.length;c++){var d=a.childNodes[c].tagName;d&&(b[d]||(b[d]=[]),b[d].push(this.xmlNodeToJSON(a.childNodes[c])))}return b};function callerFunction(a,b){return this.handler=function(c){if(!c)c=window.event;a(c,b);return!0}}function getAbsoluteLeft(a){return getOffset(a).left}
function getAbsoluteTop(a){return getOffset(a).top}function getOffsetSum(a){for(var b=0,c=0;a;)b+=parseInt(a.offsetTop),c+=parseInt(a.offsetLeft),a=a.offsetParent;return{top:b,left:c}}
function getOffsetRect(a){var b=a.getBoundingClientRect(),c=document.body,d=document.documentElement,e=window.pageYOffset||d.scrollTop||c.scrollTop,f=window.pageXOffset||d.scrollLeft||c.scrollLeft,g=d.clientTop||c.clientTop||0,h=d.clientLeft||c.clientLeft||0,i=b.top+e-g,k=b.left+f-h;return{top:Math.round(i),left:Math.round(k)}}function getOffset(a){return a.getBoundingClientRect&&!_isChrome?getOffsetRect(a):getOffsetSum(a)}
function convertStringToBoolean(a){typeof a=="string"&&(a=a.toLowerCase());switch(a){case "1":case "true":case "yes":case "y":case 1:case !0:return!0;default:return!1}}function getUrlSymbol(a){return a.indexOf("?")!=-1?"&":"?"}function dhtmlDragAndDropObject(){if(window.dhtmlDragAndDrop)return window.dhtmlDragAndDrop;this.dragStartObject=this.dragStartNode=this.dragNode=this.lastLanding=0;this.tempDOMM=this.tempDOMU=null;this.waitDrag=0;window.dhtmlDragAndDrop=this;return this}
dhtmlDragAndDropObject.prototype.removeDraggableItem=function(a){a.onmousedown=null;a.dragStarter=null;a.dragLanding=null};dhtmlDragAndDropObject.prototype.addDraggableItem=function(a,b){a.onmousedown=this.preCreateDragCopy;a.dragStarter=b;this.addDragLanding(a,b)};dhtmlDragAndDropObject.prototype.addDragLanding=function(a,b){a.dragLanding=b};
dhtmlDragAndDropObject.prototype.preCreateDragCopy=function(a){if(!((a||event)&&(a||event).button==2)){if(window.dhtmlDragAndDrop.waitDrag)return window.dhtmlDragAndDrop.waitDrag=0,document.body.onmouseup=window.dhtmlDragAndDrop.tempDOMU,document.body.onmousemove=window.dhtmlDragAndDrop.tempDOMM,!1;window.dhtmlDragAndDrop.waitDrag=1;window.dhtmlDragAndDrop.tempDOMU=document.body.onmouseup;window.dhtmlDragAndDrop.tempDOMM=document.body.onmousemove;window.dhtmlDragAndDrop.dragStartNode=this;window.dhtmlDragAndDrop.dragStartObject=
this.dragStarter;document.body.onmouseup=window.dhtmlDragAndDrop.preCreateDragCopy;document.body.onmousemove=window.dhtmlDragAndDrop.callDrag;window.dhtmlDragAndDrop.downtime=(new Date).valueOf();a&&a.preventDefault&&a.preventDefault();return!1}};
dhtmlDragAndDropObject.prototype.callDrag=function(a){if(!a)a=window.event;dragger=window.dhtmlDragAndDrop;if(!((new Date).valueOf()-dragger.downtime<100)){if(a.button==0&&_isIE)return dragger.stopDrag();if(!dragger.dragNode&&dragger.waitDrag){dragger.dragNode=dragger.dragStartObject._createDragNode(dragger.dragStartNode,a);if(!dragger.dragNode)return dragger.stopDrag();dragger.dragNode.onselectstart=function(){return!1};dragger.gldragNode=dragger.dragNode;document.body.appendChild(dragger.dragNode);
document.body.onmouseup=dragger.stopDrag;dragger.waitDrag=0;dragger.dragNode.pWindow=window;dragger.initFrameRoute()}if(dragger.dragNode.parentNode!=window.document.body){var b=dragger.gldragNode;if(dragger.gldragNode.old)b=dragger.gldragNode.old;b.parentNode.removeChild(b);var c=dragger.dragNode.pWindow;if(_isIE){var d=document.createElement("Div");d.innerHTML=dragger.dragNode.outerHTML;dragger.dragNode=d.childNodes[0]}else dragger.dragNode=dragger.dragNode.cloneNode(!0);dragger.dragNode.pWindow=
window;dragger.gldragNode.old=dragger.dragNode;document.body.appendChild(dragger.dragNode);c.dhtmlDragAndDrop.dragNode=dragger.dragNode}dragger.dragNode.style.left=a.clientX+15+(dragger.fx?dragger.fx*-1:0)+(document.body.scrollLeft||document.documentElement.scrollLeft)+"px";dragger.dragNode.style.top=a.clientY+3+(dragger.fy?dragger.fy*-1:0)+(document.body.scrollTop||document.documentElement.scrollTop)+"px";var e=a.srcElement?a.srcElement:a.target;dragger.checkLanding(e,a)}};
dhtmlDragAndDropObject.prototype.calculateFramePosition=function(a){if(window.name){for(var b=parent.frames[window.name].frameElement.offsetParent,c=0,d=0;b;)c+=b.offsetLeft,d+=b.offsetTop,b=b.offsetParent;if(parent.dhtmlDragAndDrop){var e=parent.dhtmlDragAndDrop.calculateFramePosition(1);c+=e.split("_")[0]*1;d+=e.split("_")[1]*1}if(a)return c+"_"+d;else this.fx=c;this.fy=d}return"0_0"};
dhtmlDragAndDropObject.prototype.checkLanding=function(a,b){a&&a.dragLanding?(this.lastLanding&&this.lastLanding.dragLanding._dragOut(this.lastLanding),this.lastLanding=a,this.lastLanding=this.lastLanding.dragLanding._dragIn(this.lastLanding,this.dragStartNode,b.clientX,b.clientY,b),this.lastLanding_scr=_isIE?b.srcElement:b.target):a&&a.tagName!="BODY"?this.checkLanding(a.parentNode,b):(this.lastLanding&&this.lastLanding.dragLanding._dragOut(this.lastLanding,b.clientX,b.clientY,b),this.lastLanding=
0,this._onNotFound&&this._onNotFound())};
dhtmlDragAndDropObject.prototype.stopDrag=function(a,b){dragger=window.dhtmlDragAndDrop;if(!b){dragger.stopFrameRoute();var c=dragger.lastLanding;dragger.lastLanding=null;c&&c.dragLanding._drag(dragger.dragStartNode,dragger.dragStartObject,c,_isIE?event.srcElement:a.target)}dragger.lastLanding=null;dragger.dragNode&&dragger.dragNode.parentNode==document.body&&dragger.dragNode.parentNode.removeChild(dragger.dragNode);dragger.dragNode=0;dragger.gldragNode=0;dragger.fx=0;dragger.fy=0;dragger.dragStartNode=
0;dragger.dragStartObject=0;document.body.onmouseup=dragger.tempDOMU;document.body.onmousemove=dragger.tempDOMM;dragger.tempDOMU=null;dragger.tempDOMM=null;dragger.waitDrag=0};dhtmlDragAndDropObject.prototype.stopFrameRoute=function(a){a&&window.dhtmlDragAndDrop.stopDrag(1,1);for(var b=0;b<window.frames.length;b++)try{window.frames[b]!=a&&window.frames[b].dhtmlDragAndDrop&&window.frames[b].dhtmlDragAndDrop.stopFrameRoute(window)}catch(c){}try{parent.dhtmlDragAndDrop&&parent!=window&&parent!=a&&parent.dhtmlDragAndDrop.stopFrameRoute(window)}catch(d){}};
dhtmlDragAndDropObject.prototype.initFrameRoute=function(a,b){if(a)window.dhtmlDragAndDrop.preCreateDragCopy({}),window.dhtmlDragAndDrop.dragStartNode=a.dhtmlDragAndDrop.dragStartNode,window.dhtmlDragAndDrop.dragStartObject=a.dhtmlDragAndDrop.dragStartObject,window.dhtmlDragAndDrop.dragNode=a.dhtmlDragAndDrop.dragNode,window.dhtmlDragAndDrop.gldragNode=a.dhtmlDragAndDrop.dragNode,window.document.body.onmouseup=window.dhtmlDragAndDrop.stopDrag,window.waitDrag=0,!_isIE&&b&&(!_isFF||w<1.8)&&window.dhtmlDragAndDrop.calculateFramePosition();
try{parent.dhtmlDragAndDrop&&parent!=window&&parent!=a&&parent.dhtmlDragAndDrop.initFrameRoute(window)}catch(c){}for(var d=0;d<window.frames.length;d++)try{window.frames[d]!=a&&window.frames[d].dhtmlDragAndDrop&&window.frames[d].dhtmlDragAndDrop.initFrameRoute(window,!a||b?1:0)}catch(e){}};w=_OperaRv=x=_isChrome=_isMacOS=_isKHTML=_isOpera=_isIE=_isFF=!1;navigator.userAgent.indexOf("Macintosh")!=-1&&(_isMacOS=!0);navigator.userAgent.toLowerCase().indexOf("chrome")>-1&&(_isChrome=!0);
if(navigator.userAgent.indexOf("Safari")!=-1||navigator.userAgent.indexOf("Konqueror")!=-1){var x=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Safari")+7,5));if(x>525){_isFF=!0;var w=1.9}else _isKHTML=!0}else navigator.userAgent.indexOf("Opera")!=-1?(_isOpera=!0,_OperaRv=parseFloat(navigator.userAgent.substr(navigator.userAgent.indexOf("Opera")+6,3))):navigator.appName.indexOf("Microsoft")!=-1?(_isIE=!0,navigator.appVersion.indexOf("MSIE 8.0")!=-1&&document.compatMode!="BackCompat"&&
(_isIE=8)):(_isFF=!0,w=parseFloat(navigator.userAgent.split("rv:")[1]));
dtmlXMLLoaderObject.prototype.doXPath=function(a,b,c,d){if(_isKHTML||!_isIE&&!window.XPathResult)return this.doXPathOpera(a,b);if(_isIE)return b||(b=this.xmlDoc.nodeName?this.xmlDoc:this.xmlDoc.responseXML),b||dhtmlxError.throwError("LoadXML","Incorrect XML",[b||this.xmlDoc,this.mainObject]),c!=null&&b.setProperty("SelectionNamespaces","xmlns:xsl='"+c+"'"),d=="single"?b.selectSingleNode(a):b.selectNodes(a)||[];else{var e=b;b||(b=this.xmlDoc.nodeName?this.xmlDoc:this.xmlDoc.responseXML);b||dhtmlxError.throwError("LoadXML",
"Incorrect XML",[b||this.xmlDoc,this.mainObject]);b.nodeName.indexOf("document")!=-1?e=b:(e=b,b=b.ownerDocument);var f=XPathResult.ANY_TYPE;if(d=="single")f=XPathResult.FIRST_ORDERED_NODE_TYPE;var g=[],h=b.evaluate(a,e,function(){return c},f,null);if(f==XPathResult.FIRST_ORDERED_NODE_TYPE)return h.singleNodeValue;for(var i=h.iterateNext();i;)g[g.length]=i,i=h.iterateNext();return g}};function z(){if(!this.catches)this.catches=[];return this}z.prototype.catchError=function(a,b){this.catches[a]=b};
z.prototype.throwError=function(a,b,c){if(this.catches[a])return this.catches[a](a,b,c);if(this.catches.ALL)return this.catches.ALL(a,b,c);alert("Error type: "+a+"\nDescription: "+b);return null};window.dhtmlxError=new z;
dtmlXMLLoaderObject.prototype.doXPathOpera=function(a,b){var c=a.replace(/[\/]+/gi,"/").split("/"),d=null,e=1;if(!c.length)return[];if(c[0]==".")d=[b];else if(c[0]=="")d=(this.xmlDoc.responseXML||this.xmlDoc).getElementsByTagName(c[e].replace(/\[[^\]]*\]/g,"")),e++;else return[];for(;e<c.length;e++)d=this._getAllNamedChilds(d,c[e]);c[e-1].indexOf("[")!=-1&&(d=this._filterXPath(d,c[e-1]));return d};
dtmlXMLLoaderObject.prototype._filterXPath=function(a,b){for(var c=[],b=b.replace(/[^\[]*\[\@/g,"").replace(/[\[\]\@]*/g,""),d=0;d<a.length;d++)a[d].getAttribute(b)&&(c[c.length]=a[d]);return c};
dtmlXMLLoaderObject.prototype._getAllNamedChilds=function(a,b){var c=[];_isKHTML&&(b=b.toUpperCase());for(var d=0;d<a.length;d++)for(var e=0;e<a[d].childNodes.length;e++)_isKHTML?a[d].childNodes[e].tagName&&a[d].childNodes[e].tagName.toUpperCase()==b&&(c[c.length]=a[d].childNodes[e]):a[d].childNodes[e].tagName==b&&(c[c.length]=a[d].childNodes[e]);return c};function dhtmlXHeir(a,b){for(var c in b)typeof b[c]=="function"&&(a[c]=b[c]);return a}
function dhtmlxEvent(a,b,c){a.addEventListener?a.addEventListener(b,c,!1):a.attachEvent&&a.attachEvent("on"+b,c)}dtmlXMLLoaderObject.prototype.xslDoc=null;dtmlXMLLoaderObject.prototype.setXSLParamValue=function(a,b,c){if(!c)c=this.xslDoc;if(c.responseXML)c=c.responseXML;var d=this.doXPath("/xsl:stylesheet/xsl:variable[@name='"+a+"']",c,"http://www.w3.org/1999/XSL/Transform","single");if(d!=null)d.firstChild.nodeValue=b};
dtmlXMLLoaderObject.prototype.doXSLTransToObject=function(a,b){if(!a)a=this.xslDoc;if(a.responseXML)a=a.responseXML;if(!b)b=this.xmlDoc;if(b.responseXML)b=b.responseXML;if(_isIE){d=new ActiveXObject("Msxml2.DOMDocument.3.0");try{b.transformNodeToObject(a,d)}catch(c){d=b.transformNode(a)}}else{if(!this.XSLProcessor)this.XSLProcessor=new XSLTProcessor,this.XSLProcessor.importStylesheet(a);var d=this.XSLProcessor.transformToDocument(b)}return d};
dtmlXMLLoaderObject.prototype.doXSLTransToString=function(a,b){var c=this.doXSLTransToObject(a,b);return typeof c=="string"?c:this.doSerialization(c)};dtmlXMLLoaderObject.prototype.doSerialization=function(a){if(!a)a=this.xmlDoc;if(a.responseXML)a=a.responseXML;if(_isIE)return a.xml;else{var b=new XMLSerializer;return b.serializeToString(a)}};
dhtmlxEventable=function(a){a.dhx_SeverCatcherPath="";a.attachEvent=function(a,c,d){a="ev_"+a.toLowerCase();this[a]||(this[a]=new this.eventCatcher(d||this));return a+":"+this[a].addEvent(c)};a.callEvent=function(a,c){a="ev_"+a.toLowerCase();return this[a]?this[a].apply(this,c):!0};a.checkEvent=function(a){return!!this["ev_"+a.toLowerCase()]};a.eventCatcher=function(a){var c=[],d=function(){for(var d=!0,f=0;f<c.length;f++)if(c[f]!=null)var g=c[f].apply(a,arguments),d=d&&g;return d};d.addEvent=function(a){typeof a!=
"function"&&(a=eval(a));return a?c.push(a)-1:!1};d.removeEvent=function(a){c[a]=null};return d};a.detachEvent=function(a){if(a!=!1){var c=a.split(":");this[c[0]].removeEvent(c[1])}};a.detachAllEvents=function(){for(var a in this)a.indexOf("ev_")==0&&delete this[a]}};
function dataProcessor(a){this.serverProcessor=a;this.action_param="!nativeeditor_status";this.object=null;this.updatedRows=[];this.autoUpdate=!0;this.updateMode="cell";this._tMode="GET";this.post_delim="_";this._waitMode=0;this._in_progress={};this._invalid={};this.mandatoryFields=[];this.messages=[];this.styles={updated:"font-weight:bold;",inserted:"font-weight:bold;",deleted:"text-decoration : line-through;",invalid:"background-color:FFE0E0;",invalid_cell:"border-bottom:2px solid red;",clear:"font-weight:normal;text-decoration:none;"};
this.enableUTFencoding(!0);dhtmlxEventable(this);return this}
dataProcessor.prototype={setTransactionMode:function(a,b){this._tMode=a;this._tSend=b},escape:function(a){return this._utf?encodeURIComponent(a):escape(a)},enableUTFencoding:function(a){this._utf=convertStringToBoolean(a)},setDataColumns:function(a){this._columns=typeof a=="string"?a.split(","):a},getSyncState:function(){return!this.updatedRows.length},enableDataNames:function(a){this._endnm=convertStringToBoolean(a)},enablePartialDataSend:function(a){this._changed=convertStringToBoolean(a)},setUpdateMode:function(a,
b){this.autoUpdate=a=="cell";this.updateMode=a;this.dnd=b},ignore:function(a,b){this._silent_mode=!0;a.call(b||window);this._silent_mode=!1},setUpdated:function(a,b,c){if(!this._silent_mode){var d=this.findRow(a),c=c||"updated",e=this.obj.getUserData(a,this.action_param);e&&c=="updated"&&(c=e);b?(this.set_invalid(a,!1),this.updatedRows[d]=a,this.obj.setUserData(a,this.action_param,c),this._in_progress[a]&&(this._in_progress[a]="wait")):this.is_invalid(a)||(this.updatedRows.splice(d,1),this.obj.setUserData(a,
this.action_param,""));b||this._clearUpdateFlag(a);this.markRow(a,b,c);b&&this.autoUpdate&&this.sendData(a)}},_clearUpdateFlag:function(){},markRow:function(a,b,c){var d="",e=this.is_invalid(a);e&&(d=this.styles[e],b=!0);if(this.callEvent("onRowMark",[a,b,c,e])&&(d=this.styles[b?c:"clear"]+d,this.obj[this._methods[0]](a,d),e&&e.details)){d+=this.styles[e+"_cell"];for(var f=0;f<e.details.length;f++)if(e.details[f])this.obj[this._methods[1]](a,f,d)}},getState:function(a){return this.obj.getUserData(a,
this.action_param)},is_invalid:function(a){return this._invalid[a]},set_invalid:function(a,b,c){c&&(b={value:b,details:c,toString:function(){return this.value.toString()}});this._invalid[a]=b},checkBeforeUpdate:function(){return!0},sendData:function(a){if(!this._waitMode||!(this.obj.mytype=="tree"||this.obj._h2)){this.obj.editStop&&this.obj.editStop();if(typeof a=="undefined"||this._tSend)return this.sendAllData();if(this._in_progress[a])return!1;this.messages=[];if(!this.checkBeforeUpdate(a)&&this.callEvent("onValidatationError",
[a,this.messages]))return!1;this._beforeSendData(this._getRowData(a),a)}},_beforeSendData:function(a,b){if(!this.callEvent("onBeforeUpdate",[b,this.getState(b),a]))return!1;this._sendData(a,b)},serialize:function(a,b){if(typeof a=="string")return a;if(typeof b!="undefined")return this.serialize_one(a,"");else{var c=[],d=[],e;for(e in a)a.hasOwnProperty(e)&&(c.push(this.serialize_one(a[e],e+this.post_delim)),d.push(e));c.push("ids="+this.escape(d.join(",")));return c.join("&")}},serialize_one:function(a,
b){if(typeof a=="string")return a;var c=[],d;for(d in a)a.hasOwnProperty(d)&&c.push(this.escape((b||"")+d)+"="+this.escape(a[d]));return c.join("&")},_sendData:function(a,b){if(a){if(!this.callEvent("onBeforeDataSending",b?[b,this.getState(b),a]:[null,null,a]))return!1;b&&(this._in_progress[b]=(new Date).valueOf());var c=new dtmlXMLLoaderObject(this.afterUpdate,this,!0),d=this.serverProcessor+(this._user?getUrlSymbol(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+this.obj.getUserData(0,
"version")].join("&"):"");this._tMode!="POST"?c.loadXML(d+(d.indexOf("?")!=-1?"&":"?")+this.serialize(a,b)):c.loadXML(d,!0,this.serialize(a,b));this._waitMode++}},sendAllData:function(){if(this.updatedRows.length){this.messages=[];for(var a=!0,b=0;b<this.updatedRows.length;b++)a&=this.checkBeforeUpdate(this.updatedRows[b]);if(!a&&!this.callEvent("onValidatationError",["",this.messages]))return!1;if(this._tSend)this._sendData(this._getAllData());else for(b=0;b<this.updatedRows.length;b++)if(!this._in_progress[this.updatedRows[b]]&&
!this.is_invalid(this.updatedRows[b])&&(this._beforeSendData(this._getRowData(this.updatedRows[b]),this.updatedRows[b]),this._waitMode&&(this.obj.mytype=="tree"||this.obj._h2)))break}},_getAllData:function(){for(var a={},b=!1,c=0;c<this.updatedRows.length;c++){var d=this.updatedRows[c];!this._in_progress[d]&&!this.is_invalid(d)&&this.callEvent("onBeforeUpdate",[d,this.getState(d)])&&(a[d]=this._getRowData(d,d+this.post_delim),b=!0,this._in_progress[d]=(new Date).valueOf())}return b?a:null},setVerificator:function(a,
b){this.mandatoryFields[a]=b||function(a){return a!=""}},clearVerificator:function(a){this.mandatoryFields[a]=!1},findRow:function(a){for(var b=0,b=0;b<this.updatedRows.length;b++)if(a==this.updatedRows[b])break;return b},defineAction:function(a,b){if(!this._uActions)this._uActions=[];this._uActions[a]=b},afterUpdateCallback:function(a,b,c,d){var e=a,f=c!="error"&&c!="invalid";f||this.set_invalid(a,c);if(this._uActions&&this._uActions[c]&&!this._uActions[c](d))return delete this._in_progress[e];this._in_progress[e]!=
"wait"&&this.setUpdated(a,!1);var g=a;switch(c){case "update":case "updated":case "inserted":case "insert":b!=a&&(this.obj[this._methods[2]](a,b),a=b);break;case "delete":case "deleted":return this.obj.setUserData(a,this.action_param,"true_deleted"),this.obj[this._methods[3]](a),delete this._in_progress[e],this.callEvent("onAfterUpdate",[a,c,b,d])}this._in_progress[e]!="wait"?(f&&this.obj.setUserData(a,this.action_param,""),delete this._in_progress[e]):(delete this._in_progress[e],this.setUpdated(b,
!0,this.obj.getUserData(a,this.action_param)));this.callEvent("onAfterUpdate",[a,c,b,d])},afterUpdate:function(a,b,c,d,e){e.getXMLTopNode("data");if(e.xmlDoc.responseXML){for(var f=e.doXPath("//data/action"),g=0;g<f.length;g++){var h=f[g],i=h.getAttribute("type"),k=h.getAttribute("sid"),j=h.getAttribute("tid");a.afterUpdateCallback(k,j,i,h)}a.finalizeUpdate()}},finalizeUpdate:function(){this._waitMode&&this._waitMode--;(this.obj.mytype=="tree"||this.obj._h2)&&this.updatedRows.length&&this.sendData();
this.callEvent("onAfterUpdateFinish",[]);this.updatedRows.length||this.callEvent("onFullSync",[])},init:function(a){this.obj=a;this.obj._dp_init&&this.obj._dp_init(this)},setOnAfterUpdate:function(a){this.attachEvent("onAfterUpdate",a)},enableDebug:function(){},setOnBeforeUpdateHandler:function(a){this.attachEvent("onBeforeDataSending",a)},setAutoUpdate:function(a,b){a=a||2E3;this._user=b||(new Date).valueOf();this._need_update=!1;this._loader=null;this._update_busy=!1;this.attachEvent("onAfterUpdate",
function(a,b,c,g){this.afterAutoUpdate(a,b,c,g)});this.attachEvent("onFullSync",function(){this.fullSync()});var c=this;window.setInterval(function(){c.loadUpdate()},a)},afterAutoUpdate:function(a,b){return b=="collision"?(this._need_update=!0,!1):!0},fullSync:function(){if(this._need_update==!0)this._need_update=!1,this.loadUpdate();return!0},getUpdates:function(a,b){if(this._update_busy)return!1;else this._update_busy=!0;this._loader=this._loader||new dtmlXMLLoaderObject(!0);this._loader.async=
!0;this._loader.waitCall=b;this._loader.loadXML(a)},_v:function(a){return a.firstChild?a.firstChild.nodeValue:""},_a:function(a){for(var b=[],c=0;c<a.length;c++)b[c]=this._v(a[c]);return b},loadUpdate:function(){var a=this,b=this.obj.getUserData(0,"version"),c=this.serverProcessor+getUrlSymbol(this.serverProcessor)+["dhx_user="+this._user,"dhx_version="+b].join("&"),c=c.replace("editing=true&","");this.getUpdates(c,function(){var b=a._loader.doXPath("//userdata");a.obj.setUserData(0,"version",a._v(b[0]));
var c=a._loader.doXPath("//update");if(c.length){a._silent_mode=!0;for(var f=0;f<c.length;f++){var g=c[f].getAttribute("status"),h=c[f].getAttribute("id"),i=c[f].getAttribute("parent");switch(g){case "inserted":a.callEvent("insertCallback",[c[f],h,i]);break;case "updated":a.callEvent("updateCallback",[c[f],h,i]);break;case "deleted":a.callEvent("deleteCallback",[c[f],h,i])}}a._silent_mode=!1}a._update_busy=!1;a=null})}};
if(window.dhtmlXGridObject)dhtmlXGridObject.prototype._init_point_connector=dhtmlXGridObject.prototype._init_point,dhtmlXGridObject.prototype._init_point=function(){var a=function(a){a=a.replace(/(\?|\&)connector[^\f]*/g,"");return a+(a.indexOf("?")!=-1?"&":"?")+"connector=true"+(this.hdr.rows.length>0?"&dhx_no_header=1":"")},b=function(b){return a.call(this,b)+(this._connector_sorting||"")+(this._connector_filter||"")},c=function(a,c,d){this._connector_sorting="&dhx_sort["+c+"]="+d;return b.call(this,
a)},d=function(a,c,d){for(var h=0;h<c.length;h++)c[h]="dhx_filter["+c[h]+"]="+encodeURIComponent(d[h]);this._connector_filter="&"+c.join("&");return b.call(this,a)};this.attachEvent("onCollectValues",function(a){return this._con_f_used[a]?typeof this._con_f_used[a]=="object"?this._con_f_used[a]:!1:!0});this.attachEvent("onDynXLS",function(){this.xmlFileUrl=b.call(this,this.xmlFileUrl);return!0});this.attachEvent("onBeforeSorting",function(a,b,d){if(b=="connector"){var h=this;this.clearAndLoad(c.call(this,
this.xmlFileUrl,a,d),function(){h.setSortImgState(!0,a,d)});return!1}return!0});this.attachEvent("onFilterStart",function(a,b){return this._con_f_used.length?(this.clearAndLoad(d.call(this,this.xmlFileUrl,a,b)),!1):!0});this.attachEvent("onXLE",function(){});this._init_point_connector&&this._init_point_connector()},dhtmlXGridObject.prototype._con_f_used=[],dhtmlXGridObject.prototype._in_header_connector_text_filter=function(a,b){this._con_f_used[b]||(this._con_f_used[b]=1);return this._in_header_text_filter(a,
b)},dhtmlXGridObject.prototype._in_header_connector_select_filter=function(a,b){this._con_f_used[b]||(this._con_f_used[b]=2);return this._in_header_select_filter(a,b)},dhtmlXGridObject.prototype.load_connector=dhtmlXGridObject.prototype.load,dhtmlXGridObject.prototype.load=function(a,b,c){if(!this._colls_loaded&&this.cellType){for(var d=[],e=0;e<this.cellType.length;e++)(this.cellType[e].indexOf("co")==0||this._con_f_used[e]==2)&&d.push(e);d.length&&(arguments[0]+=(arguments[0].indexOf("?")!=-1?"&":
"?")+"connector=true&dhx_colls="+d.join(","))}return this.load_connector.apply(this,arguments)},dhtmlXGridObject.prototype._parseHead_connector=dhtmlXGridObject.prototype._parseHead,dhtmlXGridObject.prototype._parseHead=function(a,b,c){this._parseHead_connector.apply(this,arguments);if(!this._colls_loaded){for(var d=this.xmlLoader.doXPath("./coll_options",arguments[0]),e=0;e<d.length;e++){var f=d[e].getAttribute("for"),g=[],h=null;this.cellType[f]=="combo"&&(h=this.getColumnCombo(f));this.cellType[f].indexOf("co")==
0&&(h=this.getCombo(f));for(var i=this.xmlLoader.doXPath("./item",d[e]),k=0;k<i.length;k++){var j=i[k].getAttribute("value");if(h){var l=i[k].getAttribute("label")||j;h.addOption?h.addOption([[j,l]]):h.put(j,l);g[g.length]=l}else g[g.length]=j}this._con_f_used[f*1]&&(this._con_f_used[f*1]=g)}this._colls_loaded=!0}};
if(window.dataProcessor)dataProcessor.prototype.init_original=dataProcessor.prototype.init,dataProcessor.prototype.init=function(a){this.init_original(a);a._dataprocessor=this;this.setTransactionMode("POST",!0);this.serverProcessor+=(this.serverProcessor.indexOf("?")!=-1?"&":"?")+"editing=true"};dhtmlxError.catchError("LoadXML",function(a,b,c){c[0].status!=0&&alert(c[0].responseText)});window.dhtmlXScheduler=window.scheduler={version:3};dhtmlxEventable(scheduler);
scheduler.init=function(a,b,c){b=b||new Date;c=c||"week";scheduler.date.init();this._obj=typeof a=="string"?document.getElementById(a):a;this._els=[];this._scroll=!0;this._quirks=_isIE&&document.compatMode=="BackCompat";this._quirks7=_isIE&&navigator.appVersion.indexOf("MSIE 8")==-1;this.get_elements();this.init_templates();this.set_actions();dhtmlxEvent(window,"resize",function(){window.clearTimeout(scheduler._resize_timer);scheduler._resize_timer=window.setTimeout(function(){scheduler.callEvent("onSchedulerResize",
[])&&scheduler.update_view()},100)});this.set_sizes();scheduler.callEvent("onSchedulerReady",[]);this.setCurrentView(b,c)};scheduler.xy={nav_height:22,min_event_height:40,scale_width:50,bar_height:20,scroll_width:18,scale_height:20,month_scale_height:20,menu_width:25,margin_top:0,margin_left:0,editor_width:140};scheduler.keys={edit_save:13,edit_cancel:27};
scheduler.set_sizes=function(){var a=this._x=this._obj.clientWidth-this.xy.margin_left,b=this._y=this._obj.clientHeight-this.xy.margin_top,c=this._table_view?0:this.xy.scale_width+this.xy.scroll_width,d=this._table_view?-1:this.xy.scale_width;this.set_xy(this._els.dhx_cal_navline[0],a,this.xy.nav_height,0,0);this.set_xy(this._els.dhx_cal_header[0],a-c,this.xy.scale_height,d,this.xy.nav_height+(this._quirks?-1:1));var e=this._els.dhx_cal_navline[0].offsetHeight;if(e>0)this.xy.nav_height=e;var f=this.xy.scale_height+
this.xy.nav_height+(this._quirks?-2:0);this.set_xy(this._els.dhx_cal_data[0],a,b-(f+2),0,f+2)};scheduler.set_xy=function(a,b,c,d,e){a.style.width=Math.max(0,b)+"px";a.style.height=Math.max(0,c)+"px";if(arguments.length>3)a.style.left=d+"px",a.style.top=e+"px"};
scheduler.get_elements=function(){for(var a=this._obj.getElementsByTagName("DIV"),b=0;b<a.length;b++){var c=a[b].className;this._els[c]||(this._els[c]=[]);this._els[c].push(a[b]);var d=scheduler.locale.labels[a[b].getAttribute("name")||c];if(d)a[b].innerHTML=d}};
scheduler.set_actions=function(){for(var a in this._els)if(this._click[a])for(var b=0;b<this._els[a].length;b++)this._els[a][b].onclick=scheduler._click[a];this._obj.onselectstart=function(){return!1};this._obj.onmousemove=function(a){scheduler._on_mouse_move(a||event)};this._obj.onmousedown=function(a){scheduler._on_mouse_down(a||event)};this._obj.onmouseup=function(a){scheduler._on_mouse_up(a||event)};this._obj.ondblclick=function(a){scheduler._on_dbl_click(a||event)}};
scheduler.select=function(a){if(!this._table_view&&this.getEvent(a)._timed&&this._select_id!=a)this.editStop(!1),this.unselect(),this._select_id=a,this.updateEvent(a)};scheduler.unselect=function(a){if(!(a&&a!=this._select_id)){var b=this._select_id;this._select_id=null;b&&this.updateEvent(b)}};scheduler.getState=function(){return{mode:this._mode,date:this._date,min_date:this._min_date,max_date:this._max_date,editor_id:this._edit_id,lightbox_id:this._lightbox_id,new_event:this._new_event}};
scheduler._click={dhx_cal_data:function(a){var b=a?a.target:event.srcElement,c=scheduler._locate_event(b),a=a||event;if(!(c&&!scheduler.callEvent("onClick",[c,a])||scheduler.config.readonly))if(c){scheduler.select(c);var d=b.className;if(d.indexOf("_icon")!=-1)scheduler._click.buttons[d.split(" ")[1].replace("icon_","")](c)}else scheduler._close_not_saved()},dhx_cal_prev_button:function(){scheduler._click.dhx_cal_next_button(0,-1)},dhx_cal_next_button:function(a,b){scheduler.setCurrentView(scheduler.date.add(scheduler.date[scheduler._mode+
"_start"](scheduler._date),b||1,scheduler._mode))},dhx_cal_today_button:function(){scheduler.setCurrentView(new Date)},dhx_cal_tab:function(){var a=this.getAttribute("name"),b=a.substring(0,a.search("_tab"));scheduler.setCurrentView(scheduler._date,b)},buttons:{"delete":function(a){var b=scheduler.locale.labels.confirm_deleting;(!b||confirm(b))&&scheduler.deleteEvent(a)},edit:function(a){scheduler.edit(a)},save:function(){scheduler.editStop(!0)},details:function(a){scheduler.showLightbox(a)},cancel:function(){scheduler.editStop(!1)}}};
scheduler.addEventNow=function(a,b,c){var d={};a&&a.constructor.toString().match(/object/i)!==null&&(d=a,a=null);var e=(this.config.event_duration||this.config.time_step)*6E4;a||(a=Math.round((new Date).valueOf()/e)*e);var f=new Date(a);if(!b){var g=this.config.first_hour;g>f.getHours()&&(f.setHours(g),a=f.valueOf());b=a+e}var h=new Date(b);f.valueOf()==h.valueOf()&&h.setTime(h.valueOf()+e);d.start_date=d.start_date||f;d.end_date=d.end_date||h;d.text=d.text||this.locale.labels.new_event;d.id=this._drag_id=
this.uid();this._drag_mode="new-size";this._loading=!0;this.addEvent(d);this.callEvent("onEventCreated",[this._drag_id,c]);this._loading=!1;this._drag_event={};this._on_mouse_up(c)};
scheduler._on_dbl_click=function(a,b){b=b||a.target||a.srcElement;if(!this.config.readonly){var c=b.className.split(" ")[0];switch(c){case "dhx_scale_holder":case "dhx_scale_holder_now":case "dhx_month_body":case "dhx_wa_day_data":if(!scheduler.config.dblclick_create)break;var d=this._mouse_coords(a),e=this._min_date.valueOf()+(d.y*this.config.time_step+(this._table_view?0:d.x)*1440)*6E4,e=this._correct_shift(e);this.addEventNow(e,null,a);break;case "dhx_body":case "dhx_wa_ev_body":case "dhx_cal_event_line":case "dhx_cal_event_clear":var f=
this._locate_event(b);if(!this.callEvent("onDblClick",[f,a]))break;this.config.details_on_dblclick||this._table_view||!this.getEvent(f)._timed?this.showLightbox(f):this.edit(f);break;case "":if(b.parentNode)return scheduler._on_dbl_click(a,b.parentNode);default:var g=this["dblclick_"+c];g&&g.call(this,a)}}};
scheduler._mouse_coords=function(a){var b,c=document.body,d=document.documentElement;b=a.pageX||a.pageY?{x:a.pageX,y:a.pageY}:{x:a.clientX+(c.scrollLeft||d.scrollLeft||0)-c.clientLeft,y:a.clientY+(c.scrollTop||d.scrollTop||0)-c.clientTop};b.x-=getAbsoluteLeft(this._obj)+(this._table_view?0:this.xy.scale_width);b.y-=getAbsoluteTop(this._obj)+this.xy.nav_height+(this._dy_shift||0)+this.xy.scale_height-this._els.dhx_cal_data[0].scrollTop;b.ev=a;var e=this["mouse_"+this._mode];if(e)return e.call(this,
b);if(this._table_view){for(var f=0,f=1;f<this._colsS.heights.length;f++)if(this._colsS.heights[f]>b.y)break;b.y=(Math.max(0,Math.ceil(b.x/this._cols[0])-1)+Math.max(0,f-1)*7)*1440/this.config.time_step;b.x=0}else b.x=Math.max(0,Math.ceil(b.x/this._cols[0])-1),b.y=Math.max(0,Math.ceil(b.y*60/(this.config.time_step*this.config.hour_size_px))-1)+this.config.first_hour*(60/this.config.time_step);return b};
scheduler._close_not_saved=function(){if((new Date).valueOf()-(scheduler._new_event||0)>500&&scheduler._edit_id){var a=scheduler.locale.labels.confirm_closing;(!a||confirm(a))&&scheduler.editStop(scheduler.config.positive_closing)}};scheduler._correct_shift=function(a,b){return a-=((new Date(scheduler._min_date)).getTimezoneOffset()-(new Date(a)).getTimezoneOffset())*6E4*(b?-1:1)};
scheduler._on_mouse_move=function(a){if(this._drag_mode){var b=this._mouse_coords(a);if(!this._drag_pos||b.custom||this._drag_pos.x!=b.x||this._drag_pos.y!=b.y){this._edit_id!=this._drag_id&&this._close_not_saved();this._drag_pos=b;if(this._drag_mode=="create"){this._close_not_saved();this._loading=!0;var c=this._min_date.valueOf()+(b.y*this.config.time_step+(this._table_view?0:b.x)*1440)*6E4,c=this._correct_shift(c);if(!this._drag_start){this._drag_start=c;return}var d=c;if(d==this._drag_start)return;
this._drag_id=this.uid();this.addEvent(new Date(this._drag_start),new Date(d),this.locale.labels.new_event,this._drag_id,b.fields);this.callEvent("onEventCreated",[this._drag_id,a]);this._loading=!1;this._drag_mode="new-size"}var e=this.getEvent(this._drag_id);if(this._drag_mode=="move")c=this._min_date.valueOf()+(b.y*this.config.time_step+b.x*1440)*6E4,!b.custom&&this._table_view&&(c+=this.date.time_part(e.start_date)*1E3),c=this._correct_shift(c),d=e.end_date.valueOf()-(e.start_date.valueOf()-c);
else{c=e.start_date.valueOf();if(this._table_view)d=this._min_date.valueOf()+b.y*this.config.time_step*6E4+(b.custom?0:864E5),this._mode=="month"&&(d=this._correct_shift(d,!1));else if(d=this.date.date_part(new Date(e.end_date)).valueOf()+b.y*this.config.time_step*6E4,this._els.dhx_cal_data[0].style.cursor="s-resize",this._mode=="week"||this._mode=="day")d=this._correct_shift(d);if(this._drag_mode=="new-size")if(d<=this._drag_start)var f=b.shift||(this._table_view&&!b.custom?864E5:0),c=d-(b.shift?
0:f),d=this._drag_start+(f||this.config.time_step*6E4);else c=this._drag_start;else d<=c&&(d=c+this.config.time_step*6E4)}var g=new Date(d-1),h=new Date(c);if(this._table_view||g.getDate()==h.getDate()&&g.getHours()<this.config.last_hour||scheduler._wa&&scheduler._wa._dnd)e.start_date=h,e.end_date=new Date(d),this.config.update_render?this.update_view():this.updateEvent(this._drag_id);this._table_view&&this.for_rendered(this._drag_id,function(a){a.className+=" dhx_in_move"})}}else if(scheduler.checkEvent("onMouseMove")){var i=
this._locate_event(a.target||a.srcElement);this.callEvent("onMouseMove",[i,a])}};scheduler._on_mouse_context=function(a,b){return this.callEvent("onContextMenu",[this._locate_event(b),a])};
scheduler._on_mouse_down=function(a,b){if(!this.config.readonly&&!this._drag_mode){b=b||a.target||a.srcElement;if(a.button==2||a.ctrlKey)return this._on_mouse_context(a,b);switch(b.className.split(" ")[0]){case "dhx_cal_event_line":case "dhx_cal_event_clear":if(this._table_view)this._drag_mode="move";break;case "dhx_header":case "dhx_title":case "dhx_wa_ev_body":this._drag_mode="move";break;case "dhx_footer":this._drag_mode="resize";break;case "dhx_scale_holder":case "dhx_scale_holder_now":case "dhx_month_body":case "dhx_matrix_cell":this._drag_mode=
"create";break;case "":if(b.parentNode)return scheduler._on_mouse_down(a,b.parentNode);default:this._drag_id=this._drag_mode=null}if(this._drag_mode){var c=this._locate_event(b);!this.config["drag_"+this._drag_mode]||!this.callEvent("onBeforeDrag",[c,this._drag_mode,a])?this._drag_mode=this._drag_id=0:(this._drag_id=c,this._drag_event=scheduler._lame_copy({},this._copy_event(this.getEvent(this._drag_id)||{})))}this._drag_start=null}};
scheduler._on_mouse_up=function(a){if(this._drag_mode&&this._drag_id){this._els.dhx_cal_data[0].style.cursor="default";var b=this.getEvent(this._drag_id);if(this._drag_event._dhx_changed||!this._drag_event.start_date||b.start_date.valueOf()!=this._drag_event.start_date.valueOf()||b.end_date.valueOf()!=this._drag_event.end_date.valueOf()){var c=this._drag_mode=="new-size";if(this.callEvent("onBeforeEventChanged",[b,a,c]))if(c&&this.config.edit_on_create){this.unselect();this._new_event=new Date;if(this._table_view||
this.config.details_on_create)return this._drag_mode=null,this.showLightbox(this._drag_id);this._drag_pos=!0;this._select_id=this._edit_id=this._drag_id}else this._new_event||this.callEvent(c?"onEventAdded":"onEventChanged",[this._drag_id,this.getEvent(this._drag_id)]);else c?this.deleteEvent(b.id,!0):(this._drag_event._dhx_changed=!1,scheduler._lame_copy(b,this._drag_event),this.updateEvent(b.id))}this._drag_pos&&this.render_view_data()}this._drag_pos=this._drag_mode=null};
scheduler.update_view=function(){this._reset_scale();if(this._load_mode&&this._load())return this._render_wait=!0;this.render_view_data()};
scheduler.setCurrentView=function(a,b){a=a||this._date;b=b||this._mode;if(this.callEvent("onBeforeViewChange",[this._mode,this._date,b,a])){var c="dhx_cal_data",d=this._mode==b&&this.config.preserve_scroll?this._els[c][0].scrollTop:!1;if(this[this._mode+"_view"]&&b&&this._mode!=b)this[this._mode+"_view"](!1);this._close_not_saved();var e="dhx_multi_day";this._els[e]&&(this._els[e][0].parentNode.removeChild(this._els[e][0]),this._els[e]=null);this._mode=b;this._date=a;this._table_view=this._mode==
"month";for(var f=this._els.dhx_cal_tab,g=0;g<f.length;g++)f[g].className="dhx_cal_tab"+(f[g].getAttribute("name")==this._mode+"_tab"?" active":"");var h=this[this._mode+"_view"];h?h(!0):this.update_view();if(typeof d=="number")this._els[c][0].scrollTop=d;this.callEvent("onViewChange",[this._mode,this._date])}};
scheduler._render_x_header=function(a,b,c,d){var e=document.createElement("DIV");e.className="dhx_scale_bar";this.set_xy(e,this._cols[a]-1,this.xy.scale_height-2,b,0);e.innerHTML=this.templates[this._mode+"_scale_date"](c,this._mode);d.appendChild(e)};
scheduler._reset_scale=function(){if(this.templates[this._mode+"_date"]){var a=this._els.dhx_cal_header[0],b=this._els.dhx_cal_data[0],c=this.config;a.innerHTML="";b.scrollTop=0;b.innerHTML="";var d=(c.readonly||!c.drag_resize?" dhx_resize_denied":"")+(c.readonly||!c.drag_move?" dhx_move_denied":"");if(d)b.className="dhx_cal_data"+d;this._cols=[];this._colsS={height:0};this._dy_shift=0;this.set_sizes();var e=parseInt(a.style.width),f=0,g,h,i,k;h=this.date[this._mode+"_start"](new Date(this._date.valueOf()));
g=i=this._table_view?scheduler.date.week_start(h):h;k=this.date.date_part(new Date);var j=scheduler.date.add(h,1,this._mode),l=7;if(!this._table_view){var o=this.date["get_"+this._mode+"_end"];o&&(j=o(h));l=Math.round((j.valueOf()-h.valueOf())/864E5)}this._min_date=g;this._els.dhx_cal_date[0].innerHTML=this.templates[this._mode+"_date"](h,j,this._mode);for(var m=0;m<l;m++){this._cols[m]=Math.floor(e/(l-m));this._render_x_header(m,f,g,a);if(!this._table_view){var n=document.createElement("DIV"),p=
"dhx_scale_holder";g.valueOf()==k.valueOf()&&(p="dhx_scale_holder_now");n.className=p+" "+this.templates.week_date_class(g,k);this.set_xy(n,this._cols[m]-1,c.hour_size_px*(c.last_hour-c.first_hour),f+this.xy.scale_width+1,0);b.appendChild(n);this.callEvent("onScaleAdd",[n,g])}g=this.date.add(g,1,"day");e-=this._cols[m];f+=this._cols[m];this._colsS[m]=(this._cols[m-1]||0)+(this._colsS[m-1]||(this._table_view?0:this.xy.scale_width+2));this._colsS.col_length=l+1}this._max_date=g;this._colsS[l]=this._cols[l-
1]+this._colsS[l-1];if(this._table_view)this._reset_month_scale(b,h,i);else{this._reset_hours_scale(b,h,i);if(c.multi_day){var q="dhx_multi_day";this._els[q]&&(this._els[q][0].parentNode.removeChild(this._els[q][0]),this._els[q]=null);var v=this._els.dhx_cal_navline[0],s=v.offsetHeight+this._els.dhx_cal_header[0].offsetHeight+1,r=document.createElement("DIV");r.className=q;r.style.visibility="hidden";this.set_xy(r,this._colsS[this._colsS.col_length-1]+this.xy.scroll_width,0,0,s);b.parentNode.insertBefore(r,
b);var u=r.cloneNode(!0);u.className=q+"_icon";u.style.visibility="hidden";this.set_xy(u,this.xy.scale_width,0,0,s);r.appendChild(u);this._els[q]=[r,u];this._els[q][0].onclick=this._click.dhx_cal_data}if(this.config.mark_now){var t=new Date;if(t<this._max_date&&t>this._min_date&&t.getHours()>=this.config.first_hour&&t.getHours()<this.config.last_hour){var A=this.locate_holder_day(t),B=t.getHours()*60+t.getMinutes(),y=document.createElement("DIV");y.className="dhx_now_time";y.style.top=Math.round((B*
6E4-this.config.first_hour*36E5)*this.config.hour_size_px/36E5)%(this.config.hour_size_px*24)+1+"px";b.childNodes[A].appendChild(y)}}}}};
scheduler._reset_hours_scale=function(a){var b=document.createElement("DIV");b.className="dhx_scale_holder";for(var c=new Date(1980,1,1,this.config.first_hour,0,0),d=this.config.first_hour*1;d<this.config.last_hour;d++){var e=document.createElement("DIV");e.className="dhx_scale_hour";e.style.height=this.config.hour_size_px-(this._quirks?0:1)+"px";e.style.width=this.xy.scale_width+"px";e.innerHTML=scheduler.templates.hour_scale(c);b.appendChild(e);c=this.date.add(c,1,"hour")}a.appendChild(b);if(this.config.scroll_hour)a.scrollTop=
this.config.hour_size_px*(this.config.scroll_hour-this.config.first_hour)};
scheduler._reset_month_scale=function(a,b,c){var d=scheduler.date.add(b,1,"month"),e=new Date;this.date.date_part(e);this.date.date_part(c);var f=Math.ceil(Math.round((d.valueOf()-c.valueOf())/864E5)/7),g=[],h=Math.floor(a.clientHeight/f)-22;this._colsS.height=h+22;for(var i=this._colsS.heights=[],k=0;k<=7;k++)g[k]=" style='height:"+h+"px; width:"+((this._cols[k]||0)-1)+"px;' ";var j=0;this._min_date=c;for(var l="<table cellpadding='0' cellspacing='0'>",k=0;k<f;k++){l+="<tr>";for(var o=0;o<7;o++){l+=
"<td";var m="";c<b?m="dhx_before":c>=d?m="dhx_after":c.valueOf()==e.valueOf()&&(m="dhx_now");l+=" class='"+m+" "+this.templates.month_date_class(c,e)+"' ";l+="><div class='dhx_month_head'>"+this.templates.month_day(c)+"</div><div class='dhx_month_body' "+g[o]+"></div></td>";c=this.date.add(c,1,"day")}l+="</tr>";i[k]=j;j+=this._colsS.height}l+="</table>";this._max_date=c;a.innerHTML=l;return c};
scheduler.getLabel=function(a,b){for(var c=this.config.lightbox.sections,d=0;d<c.length;d++)if(c[d].map_to==a)for(var e=c[d].options,f=0;f<e.length;f++)if(e[f].key==b)return e[f].label;return""};scheduler.updateCollection=function(a,b){var c=scheduler.serverList(a);if(!c)return!1;c.splice(0,c.length);c.push.apply(c,b||[]);scheduler.callEvent("onOptionsLoad",[]);scheduler.resetLightbox();return!0};scheduler._lame_copy=function(a,b){for(var c in b)a[c]=b[c];return a};
scheduler.date={init:function(){for(var a=scheduler.locale.date.month_short,b=scheduler.locale.date.month_short_hash={},c=0;c<a.length;c++)b[a[c]]=c;a=scheduler.locale.date.month_full;b=scheduler.locale.date.month_full_hash={};for(c=0;c<a.length;c++)b[a[c]]=c},date_part:function(a){a.setHours(0);a.setMinutes(0);a.setSeconds(0);a.setMilliseconds(0);return a},time_part:function(a){return(a.valueOf()/1E3-a.getTimezoneOffset()*60)%86400},week_start:function(a){var b=a.getDay();scheduler.config.start_on_monday&&
(b===0?b=6:b--);return this.date_part(this.add(a,-1*b,"day"))},month_start:function(a){a.setDate(1);return this.date_part(a)},year_start:function(a){a.setMonth(0);return this.month_start(a)},day_start:function(a){return this.date_part(a)},add:function(a,b,c){var d=new Date(a.valueOf());switch(c){case "day":d.setDate(d.getDate()+b);if(a.getDate()==d.getDate()&&b){do d.setTime(d.getTime()+36E5);while(a.getDate()==d.getDate())}break;case "week":d.setDate(d.getDate()+7*b);break;case "month":d.setMonth(d.getMonth()+
b);break;case "year":d.setYear(d.getFullYear()+b);break;case "hour":d.setHours(d.getHours()+b);break;case "minute":d.setMinutes(d.getMinutes()+b);break;default:return scheduler.date["add_"+c](a,b,c)}return d},to_fixed:function(a){return a<10?"0"+a:a},copy:function(a){return new Date(a.valueOf())},date_to_str:function(a,b){a=a.replace(/%[a-zA-Z]/g,function(a){switch(a){case "%d":return'"+scheduler.date.to_fixed(date.getDate())+"';case "%m":return'"+scheduler.date.to_fixed((date.getMonth()+1))+"';case "%j":return'"+date.getDate()+"';
case "%n":return'"+(date.getMonth()+1)+"';case "%y":return'"+scheduler.date.to_fixed(date.getFullYear()%100)+"';case "%Y":return'"+date.getFullYear()+"';case "%D":return'"+scheduler.locale.date.day_short[date.getDay()]+"';case "%l":return'"+scheduler.locale.date.day_full[date.getDay()]+"';case "%M":return'"+scheduler.locale.date.month_short[date.getMonth()]+"';case "%F":return'"+scheduler.locale.date.month_full[date.getMonth()]+"';case "%h":return'"+scheduler.date.to_fixed((date.getHours()+11)%12+1)+"';
case "%g":return'"+((date.getHours()+11)%12+1)+"';case "%G":return'"+date.getHours()+"';case "%H":return'"+scheduler.date.to_fixed(date.getHours())+"';case "%i":return'"+scheduler.date.to_fixed(date.getMinutes())+"';case "%a":return'"+(date.getHours()>11?"pm":"am")+"';case "%A":return'"+(date.getHours()>11?"PM":"AM")+"';case "%s":return'"+scheduler.date.to_fixed(date.getSeconds())+"';case "%W":return'"+scheduler.date.to_fixed(scheduler.date.getISOWeek(date))+"';default:return a}});b&&(a=a.replace(/date\.get/g,
"date.getUTC"));return new Function("date",'return "'+a+'";')},str_to_date:function(a,b){for(var c="var temp=date.split(/[^0-9a-zA-Z]+/g);",d=a.match(/%[a-zA-Z]/g),e=0;e<d.length;e++)switch(d[e]){case "%j":case "%d":c+="set[2]=temp["+e+"]||1;";break;case "%n":case "%m":c+="set[1]=(temp["+e+"]||1)-1;";break;case "%y":c+="set[0]=temp["+e+"]*1+(temp["+e+"]>50?1900:2000);";break;case "%g":case "%G":case "%h":case "%H":c+="set[3]=temp["+e+"]||0;";break;case "%i":c+="set[4]=temp["+e+"]||0;";break;case "%Y":c+=
"set[0]=temp["+e+"]||0;";break;case "%a":case "%A":c+="set[3]=set[3]%12+((temp["+e+"]||'').toLowerCase()=='am'?0:12);";break;case "%s":c+="set[5]=temp["+e+"]||0;";break;case "%M":c+="set[1]=scheduler.locale.date.month_short_hash[temp["+e+"]]||0;";break;case "%F":c+="set[1]=scheduler.locale.date.month_full_hash[temp["+e+"]]||0;"}var f="set[0],set[1],set[2],set[3],set[4],set[5]";b&&(f=" Date.UTC("+f+")");return new Function("date","var set=[0,0,1,0,0,0]; "+c+" return new Date("+f+");")},getISOWeek:function(a){if(!a)return!1;
var b=a.getDay();b===0&&(b=7);var c=new Date(a.valueOf());c.setDate(a.getDate()+(4-b));var d=c.getFullYear(),e=Math.round((c.getTime()-(new Date(d,0,1)).getTime())/864E5),f=1+Math.floor(e/7);return f},getUTCISOWeek:function(a){return this.getISOWeek(a)}};
scheduler.locale={date:{month_full:"January,February,March,April,May,June,July,August,September,October,November,December".split(","),month_short:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),day_full:"Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),day_short:"Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(",")},labels:{dhx_cal_today_button:"Today",day_tab:"Day",week_tab:"Week",month_tab:"Month",new_event:"New event",icon_save:"Save",icon_cancel:"Cancel",icon_details:"Details",
icon_edit:"Edit",icon_delete:"Delete",confirm_closing:"",confirm_deleting:"Event will be deleted permanently, are you sure?",section_description:"Description",section_time:"Time period",full_day:"Full day",confirm_recurring:"Do you want to edit the whole set of repeated events?",section_recurring:"Repeat event",button_recurring:"Disabled",button_recurring_open:"Enabled",agenda_tab:"Agenda",date:"Date",description:"Description",year_tab:"Year",week_agenda_tab:"Agenda"}};
scheduler.config={default_date:"%j %M %Y",month_date:"%F %Y",load_date:"%Y-%m-%d",week_date:"%l",day_date:"%D, %F %j",hour_date:"%H:%i",month_day:"%d",xml_date:"%m/%d/%Y %H:%i",api_date:"%d-%m-%Y %H:%i",hour_size_px:42,time_step:5,start_on_monday:1,first_hour:0,last_hour:24,readonly:!1,drag_resize:1,drag_move:1,drag_create:1,dblclick_create:1,edit_on_create:1,details_on_create:0,click_form_details:0,cascade_event_display:!1,cascade_event_count:4,cascade_event_margin:30,drag_lightbox:!0,preserve_scroll:!0,
server_utc:!1,positive_closing:!1,icons_edit:["icon_save","icon_cancel"],icons_select:["icon_details","icon_edit","icon_delete"],buttons_left:["dhx_save_btn","dhx_cancel_btn"],buttons_right:["dhx_delete_btn"],lightbox:{sections:[{name:"description",height:200,map_to:"text",type:"textarea",focus:!0},{name:"time",height:72,type:"time",map_to:"auto"}]},repeat_date_of_end:"01.01.2010"};scheduler.templates={};
scheduler.init_templates=function(){var a=scheduler.date.date_to_str,b=scheduler.config,c=function(a,b){for(var c in b)a[c]||(a[c]=b[c])};c(scheduler.templates,{day_date:a(b.default_date),month_date:a(b.month_date),week_date:function(a,b){return scheduler.templates.day_date(a)+" &ndash; "+scheduler.templates.day_date(scheduler.date.add(b,-1,"day"))},day_scale_date:a(b.default_date),month_scale_date:a(b.week_date),week_scale_date:a(b.day_date),hour_scale:a(b.hour_date),time_picker:a(b.hour_date),event_date:a(b.hour_date),
month_day:a(b.month_day),xml_date:scheduler.date.str_to_date(b.xml_date,b.server_utc),load_format:a(b.load_date,b.server_utc),xml_format:a(b.xml_date,b.server_utc),api_date:scheduler.date.str_to_date(b.api_date),event_header:function(a,b){return scheduler.templates.event_date(a)+" - "+scheduler.templates.event_date(b)},event_text:function(a,b,c){return c.text},event_class:function(){return""},month_date_class:function(){return""},week_date_class:function(){return""},event_bar_date:function(a){return scheduler.templates.event_date(a)+
" "},event_bar_text:function(a,b,c){return c.text}});this.callEvent("onTemplatesReady",[])};scheduler.uid=function(){if(!this._seed)this._seed=(new Date).valueOf();return this._seed++};scheduler._events={};scheduler.clearAll=function(){this._events={};this._loaded={};this.clear_view()};
scheduler.addEvent=function(a,b,c,d,e){if(!arguments.length)return this.addEventNow();var f=a;if(arguments.length!=1)f=e||{},f.start_date=a,f.end_date=b,f.text=c,f.id=d;f.id=f.id||scheduler.uid();f.text=f.text||"";if(typeof f.start_date=="string")f.start_date=this.templates.api_date(f.start_date);if(typeof f.end_date=="string")f.end_date=this.templates.api_date(f.end_date);var g=(this.config.event_duration||this.config.time_step)*6E4;f.start_date.valueOf()==f.end_date.valueOf()&&f.end_date.setTime(f.end_date.valueOf()+
g);f._timed=this.is_one_day_event(f);var h=!this._events[f.id];this._events[f.id]=f;this.event_updated(f);this._loading||this.callEvent(h?"onEventAdded":"onEventChanged",[f.id,f])};scheduler.deleteEvent=function(a,b){var c=this._events[a];if(b||this.callEvent("onBeforeEventDelete",[a,c])&&this.callEvent("onConfirmedBeforeEventDelete",[a,c]))c&&(delete this._events[a],this.unselect(a),this.event_updated(c)),this.callEvent("onEventDeleted",[a])};scheduler.getEvent=function(a){return this._events[a]};
scheduler.setEvent=function(a,b){this._events[a]=b};scheduler.for_rendered=function(a,b){for(var c=this._rendered.length-1;c>=0;c--)this._rendered[c].getAttribute("event_id")==a&&b(this._rendered[c],c)};scheduler.changeEventId=function(a,b){if(a!=b){var c=this._events[a];if(c)c.id=b,this._events[b]=c,delete this._events[a];this.for_rendered(a,function(a){a.setAttribute("event_id",b)});if(this._select_id==a)this._select_id=b;if(this._edit_id==a)this._edit_id=b;this.callEvent("onEventIdChange",[a,b])}};
(function(){for(var a="text,Text,start_date,StartDate,end_date,EndDate".split(","),b=function(a){return function(b){return scheduler.getEvent(b)[a]}},c=function(a){return function(b,c){var d=scheduler.getEvent(b);d[a]=c;d._changed=!0;d._timed=this.is_one_day_event(d);scheduler.event_updated(d,!0)}},d=0;d<a.length;d+=2)scheduler["getEvent"+a[d+1]]=b(a[d]),scheduler["setEvent"+a[d+1]]=c(a[d])})();scheduler.event_updated=function(a){this.is_visible_events(a)?this.render_view_data():this.clear_event(a.id)};
scheduler.is_visible_events=function(a){return a.start_date<this._max_date&&this._min_date<a.end_date};scheduler.is_one_day_event=function(a){var b=a.end_date.getDate()-a.start_date.getDate();return b?(b<0&&(b=Math.ceil((a.end_date.valueOf()-a.start_date.valueOf())/864E5)),b==1&&!a.end_date.getHours()&&!a.end_date.getMinutes()&&(a.start_date.getHours()||a.start_date.getMinutes())):a.start_date.getMonth()==a.end_date.getMonth()&&a.start_date.getFullYear()==a.end_date.getFullYear()};
scheduler.get_visible_events=function(){var a=[],b=this["filter_"+this._mode],c;for(c in this._events)if(this.is_visible_events(this._events[c])&&(this._table_view||this.config.multi_day||this._events[c]._timed))(!b||b(c,this._events[c]))&&a.push(this._events[c]);return a};
scheduler.render_view_data=function(a,b){if(!a){if(this._not_render){this._render_wait=!0;return}this._render_wait=!1;this.clear_view();a=this.get_visible_events()}if(this.config.multi_day&&!this._table_view){for(var c=[],d=[],e=0;e<a.length;e++)a[e]._timed?c.push(a[e]):d.push(a[e]);this._rendered_location=this._els.dhx_multi_day[0];this._table_view=!0;this.render_data(d,b);this._table_view=!1;this._rendered_location=this._els.dhx_cal_data[0];this._table_view=!1;this.render_data(c,b)}else this._rendered_location=
this._els.dhx_cal_data[0],this.render_data(a,b)};scheduler.render_data=function(a,b){for(var a=this._pre_render_events(a,b),c=0;c<a.length;c++)this._table_view?this.render_event_bar(a[c]):this.render_event(a[c])};
scheduler._pre_render_events=function(a,b){var c=this.xy.bar_height,d=this._colsS.heights,e=this._colsS.heights=[0,0,0,0,0,0,0],f=this._els.dhx_cal_data[0],a=this._table_view?this._pre_render_events_table(a,b):this._pre_render_events_line(a,b);if(this._table_view)if(b)this._colsS.heights=d;else{var g=f.firstChild;if(g.rows){for(var h=0;h<g.rows.length;h++){e[h]++;if(e[h]*c>this._colsS.height-22){for(var i=g.rows[h].cells,k=0;k<i.length;k++)i[k].childNodes[1].style.height=e[h]*c+"px";e[h]=(e[h-1]||
0)+i[0].offsetHeight}e[h]=(e[h-1]||0)+g.rows[h].cells[0].offsetHeight}e.unshift(0);if(g.parentNode.offsetHeight<g.parentNode.scrollHeight&&!g._h_fix){for(h=0;h<g.rows.length;h++){var j=g.rows[h].cells[6].childNodes[0],l=j.offsetWidth-scheduler.xy.scroll_width+"px";j.style.width=l;j.nextSibling.style.width=l}g._h_fix=!0}}else if(!a.length&&this._els.dhx_multi_day[0].style.visibility=="visible"&&(e[0]=-1),a.length||e[0]==-1){var o=g.parentNode.childNodes,m=(e[0]+1)*c+1+"px";f.style.top=this._els.dhx_cal_navline[0].offsetHeight+
this._els.dhx_cal_header[0].offsetHeight+parseInt(m)+"px";f.style.height=this._obj.offsetHeight-parseInt(f.style.top)-(this.xy.margin_top||0)+"px";var n=this._els.dhx_multi_day[0];n.style.height=m;n.style.visibility=e[0]==-1?"hidden":"visible";n=this._els.dhx_multi_day[1];n.style.height=m;n.style.visibility=e[0]==-1?"hidden":"visible";n.className=e[0]?"dhx_multi_day_icon":"dhx_multi_day_icon_small";this._dy_shift=(e[0]+1)*c;e[0]=0}}return a};
scheduler._get_event_sday=function(a){return Math.floor((a.start_date.valueOf()-this._min_date.valueOf())/864E5)};
scheduler._pre_render_events_line=function(a,b){a.sort(function(a,b){return a.start_date.valueOf()==b.start_date.valueOf()?a.id>b.id?1:-1:a.start_date>b.start_date?1:-1});for(var c=[],d=[],e=0;e<a.length;e++){var f=a[e],g=f.start_date.getHours(),h=f.end_date.getHours();f._sday=this._get_event_sday(f);c[f._sday]||(c[f._sday]=[]);if(!b){f._inner=!1;for(var i=c[f._sday];i.length&&i[i.length-1].end_date<=f.start_date;)i.splice(i.length-1,1);for(var k=!1,j=0;j<i.length;j++)if(i[j].end_date.valueOf()<f.start_date.valueOf()){k=
!0;f._sorder=i[j]._sorder;i.splice(j,1);f._inner=!0;break}if(i.length)i[i.length-1]._inner=!0;if(!k)if(i.length)if(i.length<=i[i.length-1]._sorder){if(i[i.length-1]._sorder)for(j=0;j<i.length;j++){var l=!1;for(k=0;k<i.length;k++)if(i[k]._sorder==j){l=!0;break}if(!l){f._sorder=j;break}}else f._sorder=0;f._inner=!0}else{l=i[0]._sorder;for(j=1;j<i.length;j++)if(i[j]._sorder>l)l=i[j]._sorder;f._sorder=l+1;f._inner=!1}else f._sorder=0;i.push(f);i.length>(i.max_count||0)?(i.max_count=i.length,f._count=
i.length):f._count=f._count?f._count:1}if(g<this.config.first_hour||h>=this.config.last_hour)if(d.push(f),a[e]=f=this._copy_event(f),g<this.config.first_hour&&(f.start_date.setHours(this.config.first_hour),f.start_date.setMinutes(0)),h>=this.config.last_hour&&(f.end_date.setMinutes(0),f.end_date.setHours(this.config.last_hour)),f.start_date>f.end_date||g==this.config.last_hour)a.splice(e,1),e--}if(!b){for(e=0;e<a.length;e++)a[e]._count=c[a[e]._sday].max_count;for(e=0;e<d.length;e++)d[e]._count=c[d[e]._sday].max_count}return a};
scheduler._time_order=function(a){a.sort(function(a,c){return a.start_date.valueOf()==c.start_date.valueOf()?a._timed&&!c._timed?1:!a._timed&&c._timed?-1:a.id>c.id?1:-1:a.start_date>c.start_date?1:-1})};
scheduler._pre_render_events_table=function(a,b){this._time_order(a);for(var c=[],d=[[],[],[],[],[],[],[]],e=this._colsS.heights,f,g=this._cols.length,h=0;h<a.length;h++){var i=a[h],k=f||i.start_date,j=i.end_date;if(k<this._min_date)k=this._min_date;if(j>this._max_date)j=this._max_date;var l=this.locate_holder_day(k,!1,i);i._sday=l%g;var o=this.locate_holder_day(j,!0,i)||g;i._eday=o%g||g;i._length=o-l;i._sweek=Math.floor((this._correct_shift(k.valueOf(),1)-this._min_date.valueOf())/(864E5*g));var m=
d[i._sweek],n;for(n=0;n<m.length;n++)if(m[n]._eday<=i._sday)break;if(!i._sorder||!b)i._sorder=n;if(i._sday+i._length<=g)f=null,c.push(i),m[n]=i,e[i._sweek]=m.length-1;else{var p=this._copy_event(i);p._length=g-i._sday;p._eday=g;p._sday=i._sday;p._sweek=i._sweek;p._sorder=i._sorder;p.end_date=this.date.add(k,p._length,"day");c.push(p);m[n]=p;f=p.end_date;e[i._sweek]=m.length-1;h--}}return c};scheduler._copy_dummy=function(){this.start_date=new Date(this.start_date);this.end_date=new Date(this.end_date)};
scheduler._copy_event=function(a){this._copy_dummy.prototype=a;return new this._copy_dummy};scheduler._rendered=[];scheduler.clear_view=function(){for(var a=0;a<this._rendered.length;a++){var b=this._rendered[a];b.parentNode&&b.parentNode.removeChild(b)}this._rendered=[]};scheduler.updateEvent=function(a){var b=this.getEvent(a);this.clear_event(a);b&&this.is_visible_events(b)&&this.render_view_data([b],!0)};
scheduler.clear_event=function(a){this.for_rendered(a,function(a,c){a.parentNode&&a.parentNode.removeChild(a);scheduler._rendered.splice(c,1)})};
scheduler.render_event=function(a){var b=scheduler.xy.menu_width;if(!(a._sday<0)){var c=scheduler.locate_holder(a._sday);if(c){var d=a.start_date.getHours()*60+a.start_date.getMinutes(),e=a.end_date.getHours()*60+a.end_date.getMinutes()||scheduler.config.last_hour*60,f=Math.round((d*6E4-this.config.first_hour*36E5)*this.config.hour_size_px/36E5)%(this.config.hour_size_px*24)+1,g=Math.max(scheduler.xy.min_event_height,(e-d)*this.config.hour_size_px/60)+1,h=Math.floor((c.clientWidth-b)/a._count),i=
a._sorder*h+1;a._inner||(h*=a._count-a._sorder);if(this.config.cascade_event_display)var k=this.config.cascade_event_count,j=this.config.cascade_event_margin,i=a._sorder%k*j,l=a._inner?(a._count-a._sorder-1)%k*j/2:0,h=Math.floor(c.clientWidth-b-i-l);var o=this._render_v_bar(a.id,b+i,f,h,g,a._text_style,scheduler.templates.event_header(a.start_date,a.end_date,a),scheduler.templates.event_text(a.start_date,a.end_date,a));this._rendered.push(o);c.appendChild(o);i=i+parseInt(c.style.left,10)+b;if(this._edit_id==
a.id){o.style.zIndex=1;h=Math.max(h-4,scheduler.xy.editor_width);o=document.createElement("DIV");o.setAttribute("event_id",a.id);this.set_xy(o,h,g-20,i,f+14);o.className="dhx_cal_editor";var m=document.createElement("DIV");this.set_xy(m,h-6,g-26);m.style.cssText+=";margin:2px 2px 2px 2px;overflow:hidden;";o.appendChild(m);this._els.dhx_cal_data[0].appendChild(o);this._rendered.push(o);m.innerHTML="<textarea class='dhx_cal_editor'>"+a.text+"</textarea>";if(this._quirks7)m.firstChild.style.height=g-
12+"px";this._editor=m.firstChild;this._editor.onkeypress=function(a){if((a||event).shiftKey)return!0;var b=(a||event).keyCode;b==scheduler.keys.edit_save&&scheduler.editStop(!0);b==scheduler.keys.edit_cancel&&scheduler.editStop(!1)};this._editor.onselectstart=function(a){return(a||event).cancelBubble=!0};m.firstChild.focus();this._els.dhx_cal_data[0].scrollLeft=0;m.firstChild.select()}if(this._select_id==a.id){if(this.config.cascade_event_display&&this._drag_mode)o.style.zIndex=1;for(var n=this.config["icons_"+
(this._edit_id==a.id?"edit":"select")],p="",q=a.color?"background-color:"+a.color+";":"",v=a.textColor?"color:"+a.textColor+";":"",s=0;s<n.length;s++)p+="<div class='dhx_menu_icon "+n[s]+"' style='"+q+""+v+"' title='"+this.locale.labels[n[s]]+"'></div>";var r=this._render_v_bar(a.id,i-b+1,f,b,n.length*20+26,"","<div style='"+q+""+v+"' class='dhx_menu_head'></div>",p,!0);r.style.left=i-b+1;this._els.dhx_cal_data[0].appendChild(r);this._rendered.push(r)}}}};
scheduler._render_v_bar=function(a,b,c,d,e,f,g,h,i){var k=document.createElement("DIV"),j=this.getEvent(a),l="dhx_cal_event",o=scheduler.templates.event_class(j.start_date,j.end_date,j);o&&(l=l+" "+o);var m=j.color?"background-color:"+j.color+";":"",n=j.textColor?"color:"+j.textColor+";":"",p='<div event_id="'+a+'" class="'+l+'" style="position:absolute; top:'+c+"px; left:"+b+"px; width:"+(d-4)+"px; height:"+e+"px;"+(f||"")+'">';p+='<div class="dhx_header" style=" width:'+(d-6)+"px;"+m+'" >&nbsp;</div>';
p+='<div class="dhx_title" style="'+m+""+n+'">'+g+"</div>";p+='<div class="dhx_body" style=" width:'+(d-(this._quirks?4:14))+"px; height:"+(e-(this._quirks?20:30))+"px;"+m+""+n+'">'+h+"</div>";p+='<div class="dhx_footer" style=" width:'+(d-8)+"px;"+(i?" margin-top:-1px;":"")+""+m+""+n+'" ></div></div>';k.innerHTML=p;return k.firstChild};scheduler.locate_holder=function(a){return this._mode=="day"?this._els.dhx_cal_data[0].firstChild:this._els.dhx_cal_data[0].childNodes[a]};
scheduler.locate_holder_day=function(a,b){var c=Math.floor((this._correct_shift(a,1)-this._min_date)/864E5);b&&this.date.time_part(a)&&c++;return c};
scheduler.render_event_bar=function(a){var b=this._rendered_location,c=this._colsS[a._sday],d=this._colsS[a._eday];d==c&&(d=this._colsS[a._eday+1]);var e=this.xy.bar_height,f=this._colsS.heights[a._sweek]+(this._colsS.height?this.xy.month_scale_height+2:2)+a._sorder*e,g=document.createElement("DIV"),h=a._timed?"dhx_cal_event_clear":"dhx_cal_event_line",i=scheduler.templates.event_class(a.start_date,a.end_date,a);i&&(h=h+" "+i);var k=a.color?"background-color:"+a.color+";":"",j=a.textColor?"color:"+
a.textColor+";":"",l='<div event_id="'+a.id+'" class="'+h+'" style="position:absolute; top:'+f+"px; left:"+c+"px; width:"+(d-c-15)+"px;"+j+""+k+""+(a._text_style||"")+'">';a._timed&&(l+=scheduler.templates.event_bar_date(a.start_date,a.end_date,a));l+=scheduler.templates.event_bar_text(a.start_date,a.end_date,a)+"</div>";l+="</div>";g.innerHTML=l;this._rendered.push(g.firstChild);b.appendChild(g.firstChild)};
scheduler._locate_event=function(a){for(var b=null;a&&!b&&a.getAttribute;)b=a.getAttribute("event_id"),a=a.parentNode;return b};scheduler.edit=function(a){if(this._edit_id!=a)this.editStop(!1,a),this._edit_id=a,this.updateEvent(a)};scheduler.editStop=function(a,b){if(!(b&&this._edit_id==b)){var c=this.getEvent(this._edit_id);if(c){if(a)c.text=this._editor.value;this._editor=this._edit_id=null;this.updateEvent(c.id);this._edit_stop_event(c,a)}}};
scheduler._edit_stop_event=function(a,b){this._new_event?(b?this.callEvent("onEventAdded",[a.id,a]):this.deleteEvent(a.id,!0),this._new_event=null):b&&this.callEvent("onEventChanged",[a.id,a])};scheduler.getEvents=function(a,b){var c=[],d;for(d in this._events){var e=this._events[d];e&&e.start_date<b&&e.end_date>a&&c.push(e)}return c};scheduler._loaded={};
scheduler._load=function(a,b){a=a||this._load_url;a+=(a.indexOf("?")==-1?"?":"&")+"timeshift="+(new Date).getTimezoneOffset();this.config.prevent_cache&&(a+="&uid="+this.uid());var c,b=b||this._date;if(this._load_mode){for(var d=this.templates.load_format,b=this.date[this._load_mode+"_start"](new Date(b.valueOf()));b>this._min_date;)b=this.date.add(b,-1,this._load_mode);c=b;for(var e=!0;c<this._max_date;)c=this.date.add(c,1,this._load_mode),this._loaded[d(b)]&&e?b=this.date.add(b,1,this._load_mode):
e=!1;var f=c;do c=f,f=this.date.add(c,-1,this._load_mode);while(f>b&&this._loaded[d(f)]);if(c<=b)return!1;for(dhtmlxAjax.get(a+"&from="+d(b)+"&to="+d(c),function(a){scheduler.on_load(a)});b<c;)this._loaded[d(b)]=!0,b=this.date.add(b,1,this._load_mode)}else dhtmlxAjax.get(a,function(a){scheduler.on_load(a)});this.callEvent("onXLS",[]);return!0};
scheduler.on_load=function(a){this._loading=!0;var b;b=this._process?this[this._process].parse(a.xmlDoc.responseText):this._magic_parser(a);this._not_render=!0;for(var c=0;c<b.length;c++)this.callEvent("onEventLoading",[b[c]])&&this.addEvent(b[c]);this._not_render=!1;this._render_wait&&this.render_view_data();this._loading=!1;this._after_call&&this._after_call();this._after_call=null;this.callEvent("onXLE",[])};scheduler.json={};
scheduler.json.parse=function(a){if(typeof a=="string")eval("scheduler._temp = "+a+";"),a=scheduler._temp;for(var b=[],c=0;c<a.length;c++)a[c].start_date=scheduler.templates.xml_date(a[c].start_date),a[c].end_date=scheduler.templates.xml_date(a[c].end_date),b.push(a[c]);return b};scheduler.parse=function(a,b){this._process=b;this.on_load({xmlDoc:{responseText:a}})};scheduler.load=function(a,b,c){if(typeof b=="string")this._process=b,b=c;this._load_url=a;this._after_call=b;this._load(a,this._date)};
scheduler.setLoadMode=function(a){a=="all"&&(a="");this._load_mode=a};scheduler.refresh=function(){alert("not implemented")};scheduler.serverList=function(a,b){return b?this.serverList[a]=b.slice(0):this.serverList[a]=this.serverList[a]||[]};scheduler._userdata={};
scheduler._magic_parser=function(a){var b;if(!a.getXMLTopNode){var c=a.xmlDoc.responseText,a=new dtmlXMLLoaderObject(function(){});a.loadXMLString(c)}b=a.getXMLTopNode("data");if(b.tagName!="data")return[];for(var d=a.doXPath("//coll_options"),e=0;e<d.length;e++){var f=d[e].getAttribute("for"),g=this.serverList[f];if(g){g.splice(0,g.length);for(var h=a.doXPath(".//item",d[e]),i=0;i<h.length;i++){for(var k=h[i],j=k.attributes,l={key:h[i].getAttribute("value"),label:h[i].getAttribute("label")},o=0;o<
j.length;o++){var m=j[o];if(!(m.nodeName=="value"||m.nodeName=="label"))l[m.nodeName]=m.nodeValue}g.push(l)}}}d.length&&scheduler.callEvent("onOptionsLoad",[]);for(var n=a.doXPath("//userdata"),e=0;e<n.length;e++){var p=this.xmlNodeToJSON(n[e]);this._userdata[p.name]=p.text}var q=[];b=a.doXPath("//event");for(e=0;e<b.length;e++)q[e]=this.xmlNodeToJSON(b[e]),q[e].text=q[e].text||q[e]._tagvalue,q[e].start_date=this.templates.xml_date(q[e].start_date),q[e].end_date=this.templates.xml_date(q[e].end_date);
return q};scheduler.xmlNodeToJSON=function(a){for(var b={},c=0;c<a.attributes.length;c++)b[a.attributes[c].name]=a.attributes[c].value;for(c=0;c<a.childNodes.length;c++){var d=a.childNodes[c];d.nodeType==1&&(b[d.tagName]=d.firstChild?d.firstChild.nodeValue:"")}if(!b.text)b.text=a.firstChild?a.firstChild.nodeValue:"";return b};
scheduler.attachEvent("onXLS",function(){if(this.config.show_loading===!0){var a;a=this.config.show_loading=document.createElement("DIV");a.className="dhx_loading";a.style.left=Math.round((this._x-128)/2)+"px";a.style.top=Math.round((this._y-15)/2)+"px";this._obj.appendChild(a)}});scheduler.attachEvent("onXLE",function(){var a;if((a=this.config.show_loading)&&typeof a=="object")this._obj.removeChild(a),this.config.show_loading=!0});
scheduler.ical={parse:function(a){var b=a.match(RegExp(this.c_start+"[^\u000c]*"+this.c_end,""));if(b.length){b[0]=b[0].replace(/[\r\n]+(?=[a-z \t])/g," ");b[0]=b[0].replace(/\;[^:\r\n]*/g,"");for(var c=[],d,e=RegExp("(?:"+this.e_start+")([^\u000c]*?)(?:"+this.e_end+")","g");d=e.exec(b);){for(var f={},g,h=/[^\r\n]+[\r\n]+/g;g=h.exec(d[1]);)this.parse_param(g.toString(),f);if(f.uid&&!f.id)f.id=f.uid;c.push(f)}return c}},parse_param:function(a,b){var c=a.indexOf(":");if(c!=-1){var d=a.substr(0,c).toLowerCase(),
e=a.substr(c+1).replace(/\\\,/g,",").replace(/[\r\n]+$/,"");d=="summary"?d="text":d=="dtstart"?(d="start_date",e=this.parse_date(e,0,0)):d=="dtend"&&(d="end_date",e=b.start_date&&b.start_date.getHours()==0?this.parse_date(e,24,0):this.parse_date(e,23,59));b[d]=e}},parse_date:function(a,b,c){var d=a.split("T");d[1]&&(b=d[1].substr(0,2),c=d[1].substr(2,2));var e=d[0].substr(0,4),f=parseInt(d[0].substr(4,2),10)-1,g=d[0].substr(6,2);return scheduler.config.server_utc&&!d[1]?new Date(Date.UTC(e,f,g,b,
c)):new Date(e,f,g,b,c)},c_start:"BEGIN:VCALENDAR",e_start:"BEGIN:VEVENT",e_end:"END:VEVENT",c_end:"END:VCALENDAR"};scheduler.formSection=function(a){for(var b=this.config.lightbox.sections,c=0;c<b.length;c++)if(b[c].name==a)break;var d=b[c],e=document.getElementById(d.id).nextSibling;return{getValue:function(a){return scheduler.form_blocks[d.type].get_value(e,a||{},d)},setValue:function(a,b){return scheduler.form_blocks[d.type].set_value(e,a,b||{},d)}}};
scheduler.form_blocks={template:{render:function(a){var b=(a.height||"30")+"px";return"<div class='dhx_cal_ltext dhx_cal_template' style='height:"+b+";'></div>"},set_value:function(a,b){a.innerHTML=b||""},get_value:function(a){return a.innerHTML||""},focus:function(){}},textarea:{render:function(a){var b=(a.height||"130")+"px";return"<div class='dhx_cal_ltext' style='height:"+b+";'><textarea></textarea></div>"},set_value:function(a,b){a.firstChild.value=b||""},get_value:function(a){return a.firstChild.value},
focus:function(a){var b=a.firstChild;b.select();b.focus()}},select:{render:function(a){for(var b=(a.height||"23")+"px",c="<div class='dhx_cal_ltext' style='height:"+b+";'><select style='width:100%;'>",d=0;d<a.options.length;d++)c+="<option value='"+a.options[d].key+"'>"+a.options[d].label+"</option>";c+="</select></div>";return c},set_value:function(a,b){if(typeof b=="undefined")b=(a.firstChild.options[0]||{}).value;a.firstChild.value=b||""},get_value:function(a){return a.firstChild.value},focus:function(a){var b=
a.firstChild;b.select&&b.select();b.focus()}},time:{render:function(){var a=scheduler.config,b=this.date.date_part(new Date),c=1440,d=0;scheduler.config.limit_time_select&&(c=60*a.last_hour+1,d=60*a.first_hour,b.setHours(a.first_hour));for(var e="<select>",f=d,g=b.getDate();f<c;){var h=this.templates.time_picker(b);e+="<option value='"+f+"'>"+h+"</option>";b.setTime(b.valueOf()+this.config.time_step*6E4);var i=b.getDate()!=g?1:0,f=i*1440+b.getHours()*60+b.getMinutes()}e+="</select> <select>";for(f=
1;f<32;f++)e+="<option value='"+f+"'>"+f+"</option>";e+="</select> <select>";for(f=0;f<12;f++)e+="<option value='"+f+"'>"+this.locale.date.month_full[f]+"</option>";e+="</select> <select>";b=b.getFullYear()-5;for(f=0;f<10;f++)e+="<option value='"+(b+f)+"'>"+(b+f)+"</option>";e+="</select> ";return"<div style='height:30px;padding-top:0px;font-size:inherit;' class='dhx_section_time'>"+e+"<span style='font-weight:normal; font-size:10pt;'> &nbsp;&ndash;&nbsp; </span>"+e+"</div>"},set_value:function(a,
b,c){function d(a,b,c){a[b+0].value=Math.round((c.getHours()*60+c.getMinutes())/scheduler.config.time_step)*scheduler.config.time_step;a[b+1].value=c.getDate();a[b+2].value=c.getMonth();a[b+3].value=c.getFullYear()}var e=a.getElementsByTagName("select");if(scheduler.config.full_day){if(!a._full_day){var f="<label class='dhx_fullday'><input type='checkbox' name='full_day' value='true'> "+scheduler.locale.labels.full_day+"&nbsp;</label></input>";scheduler.config.wide_form||(f=a.previousSibling.innerHTML+
f);a.previousSibling.innerHTML=f;a._full_day=!0}var g=a.previousSibling.getElementsByTagName("input")[0],h=scheduler.date.time_part(c.start_date)===0&&scheduler.date.time_part(c.end_date)===0&&c.end_date.valueOf()-c.start_date.valueOf()<1728E5;g.checked=h;for(var i in e)e[i].disabled=g.checked;g.onclick=function(){if(g.checked){var a=new Date(c.start_date),b=new Date(c.end_date);scheduler.date.date_part(a);b=scheduler.date.add(a,1,"day")}for(var f in e)e[f].disabled=g.checked;d(e,0,a||c.start_date);
d(e,4,b||c.end_date)}}if(scheduler.config.auto_end_date&&scheduler.config.event_duration)for(var k=function(){c.start_date=new Date(e[3].value,e[2].value,e[1].value,0,e[0].value);c.end_date.setTime(c.start_date.getTime()+scheduler.config.event_duration*6E4);d(e,4,c.end_date)},j=0;j<4;j++)e[j].onchange=k;d(e,0,c.start_date);d(e,4,c.end_date)},get_value:function(a,b){s=a.getElementsByTagName("select");b.start_date=new Date(s[3].value,s[2].value,s[1].value,0,s[0].value);b.end_date=new Date(s[7].value,
s[6].value,s[5].value,0,s[4].value);if(b.end_date<=b.start_date)b.end_date=scheduler.date.add(b.start_date,scheduler.config.time_step,"minute")},focus:function(a){a.getElementsByTagName("select")[0].focus()}}};
scheduler.showCover=function(a){if(a){a.style.display="block";var b=window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop,c=window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft,d=window.innerHeight||document.documentElement.clientHeight;a.style.top=b?Math.round(b+Math.max((d-a.offsetHeight)/2,0))+"px":Math.round(Math.max((d-a.offsetHeight)/2,0)+9)+"px";a.style.left=document.documentElement.scrollWidth>document.body.offsetWidth?Math.round(c+(document.body.offsetWidth-
a.offsetWidth)/2)+"px":Math.round((document.body.offsetWidth-a.offsetWidth)/2)+"px"}this.show_cover()};scheduler.showLightbox=function(a){if(a&&this.callEvent("onBeforeLightbox",[a])){var b=this._get_lightbox();this.showCover(b);this._fill_lightbox(a,b);this.callEvent("onLightbox",[a])}};
scheduler._fill_lightbox=function(a,b){var c=this.getEvent(a),d=b.getElementsByTagName("span");scheduler.templates.lightbox_header?(d[1].innerHTML="",d[2].innerHTML=scheduler.templates.lightbox_header(c.start_date,c.end_date,c)):(d[1].innerHTML=this.templates.event_header(c.start_date,c.end_date,c),d[2].innerHTML=(this.templates.event_bar_text(c.start_date,c.end_date,c)||"").substr(0,70));for(var e=this.config.lightbox.sections,f=0;f<e.length;f++){var g=document.getElementById(e[f].id).nextSibling,
h=this.form_blocks[e[f].type];h.set_value.call(this,g,c[e[f].map_to],c,e[f]);e[f].focus&&h.focus.call(this,g)}scheduler._lightbox_id=a};scheduler._lightbox_out=function(a){for(var b=this.config.lightbox.sections,c=0;c<b.length;c++){var d=document.getElementById(b[c].id),d=d?d.nextSibling:d,e=this.form_blocks[b[c].type],f=e.get_value.call(this,d,a,b[c]);b[c].map_to!="auto"&&(a[b[c].map_to]=f)}return a};
scheduler._empty_lightbox=function(){var a=scheduler._lightbox_id,b=this.getEvent(a),c=this._get_lightbox();this._lightbox_out(b);b._timed=this.is_one_day_event(b);this.setEvent(b.id,b);this._edit_stop_event(b,!0);this.render_view_data()};scheduler.hide_lightbox=function(){this.hideCover(this._get_lightbox());this._lightbox_id=null;this.callEvent("onAfterLightbox",[])};scheduler.hideCover=function(a){if(a)a.style.display="none";this.hide_cover()};
scheduler.hide_cover=function(){this._cover&&this._cover.parentNode.removeChild(this._cover);this._cover=null};scheduler.show_cover=function(){this._cover=document.createElement("DIV");this._cover.className="dhx_cal_cover";var a=document.height!==void 0?document.height:document.body.offsetHeight,b=document.documentElement?document.documentElement.scrollHeight:0;this._cover.style.height=Math.max(a,b)+"px";document.body.appendChild(this._cover)};
scheduler.save_lightbox=function(){if(!this.checkEvent("onEventSave")||this.callEvent("onEventSave",[this._lightbox_id,this._lightbox_out({id:this._lightbox_id}),this._new_event]))this._empty_lightbox(),this.hide_lightbox()};scheduler.startLightbox=function(a,b){this._lightbox_id=a;this.showCover(b)};scheduler.endLightbox=function(a,b){this._edit_stop_event(scheduler.getEvent(this._lightbox_id),a);a&&scheduler.render_view_data();this.hideCover(b)};
scheduler.resetLightbox=function(){scheduler._lightbox&&scheduler._lightbox.parentNode.removeChild(scheduler._lightbox);scheduler._lightbox=null};scheduler.cancel_lightbox=function(){this.callEvent("onEventCancel",[this._lightbox_id,this._new_event]);this.endLightbox(!1);this.hide_lightbox()};
scheduler._init_lightbox_events=function(){this._get_lightbox().onclick=function(a){var b=a?a.target:event.srcElement;if(!b.className)b=b.previousSibling;if(b&&b.className)switch(b.className){case "dhx_save_btn":scheduler.save_lightbox();break;case "dhx_delete_btn":var c=scheduler.locale.labels.confirm_deleting;if(!c||confirm(c))scheduler.deleteEvent(scheduler._lightbox_id),scheduler._new_event=null,scheduler.hide_lightbox();break;case "dhx_cancel_btn":scheduler.cancel_lightbox();break;default:if(b.getAttribute("dhx_button"))scheduler.callEvent("onLightboxButton",
[b.className,b,a]);else if(b.className.indexOf("dhx_custom_button_")!=-1){var d=b.parentNode.getAttribute("index"),e=scheduler.form_blocks[scheduler.config.lightbox.sections[d].type],f=b.parentNode.parentNode;e.button_click(d,b,f,f.nextSibling)}}};this._get_lightbox().onkeydown=function(a){switch((a||event).keyCode){case scheduler.keys.edit_save:if((a||event).shiftKey)break;scheduler.save_lightbox();break;case scheduler.keys.edit_cancel:scheduler.cancel_lightbox()}}};
scheduler.setLightboxSize=function(){var a=this._lightbox;if(a){var b=a.childNodes[1];b.style.height="0px";b.style.height=b.scrollHeight+"px";a.style.height=b.scrollHeight+50+"px";b.style.height=b.scrollHeight+"px"}};scheduler._init_dnd_events=function(){dhtmlxEvent(document.body,"mousemove",scheduler._move_while_dnd);dhtmlxEvent(document.body,"mouseup",scheduler._finish_dnd);scheduler._init_dnd_events=function(){}};
scheduler._move_while_dnd=function(a){if(scheduler._dnd_start_lb){if(!document.dhx_unselectable)document.body.className+=" dhx_unselectable",document.dhx_unselectable=!0;var b=scheduler._get_lightbox(),c=a&&a.target?[a.pageX,a.pageY]:[event.clientX,event.clientY];b.style.top=scheduler._lb_start[1]+c[1]-scheduler._dnd_start_lb[1]+"px";b.style.left=scheduler._lb_start[0]+c[0]-scheduler._dnd_start_lb[0]+"px"}};
scheduler._ready_to_dnd=function(a){var b=scheduler._get_lightbox();scheduler._lb_start=[parseInt(b.style.left,10),parseInt(b.style.top,10)];scheduler._dnd_start_lb=a&&a.target?[a.pageX,a.pageY]:[event.clientX,event.clientY]};scheduler._finish_dnd=function(){if(scheduler._lb_start)scheduler._lb_start=scheduler._dnd_start_lb=!1,document.body.className=document.body.className.replace(" dhx_unselectable",""),document.dhx_unselectable=!1};
scheduler._get_lightbox=function(){if(!this._lightbox){var a=document.createElement("DIV");a.className="dhx_cal_light";scheduler.config.wide_form&&(a.className+=" dhx_cal_light_wide");scheduler.form_blocks.recurring&&(a.className+=" dhx_cal_light_rec");/msie|MSIE 6/.test(navigator.userAgent)&&(a.className+=" dhx_ie6");a.style.visibility="hidden";var b=this._lightbox_template,c=this.config.buttons_left;scheduler.locale.labels.dhx_save_btn=scheduler.locale.labels.icon_save;scheduler.locale.labels.dhx_cancel_btn=
scheduler.locale.labels.icon_cancel;scheduler.locale.labels.dhx_delete_btn=scheduler.locale.labels.icon_delete;for(var d=0;d<c.length;d++)b+="<div class='dhx_btn_set'><div dhx_button='1' class='"+c[d]+"'></div><div>"+scheduler.locale.labels[c[d]]+"</div></div>";c=this.config.buttons_right;for(d=0;d<c.length;d++)b+="<div class='dhx_btn_set' style='float:right;'><div dhx_button='1' class='"+c[d]+"'></div><div>"+scheduler.locale.labels[c[d]]+"</div></div>";b+="</div>";a.innerHTML=b;if(scheduler.config.drag_lightbox)a.firstChild.onmousedown=
scheduler._ready_to_dnd,a.firstChild.onselectstart=function(){return!1},a.firstChild.style.cursor="pointer",scheduler._init_dnd_events();document.body.insertBefore(a,document.body.firstChild);this._lightbox=a;for(var e=this.config.lightbox.sections,b="",d=0;d<e.length;d++){var f=this.form_blocks[e[d].type];if(f){e[d].id="area_"+this.uid();var g="";e[d].button&&(g="<div class='dhx_custom_button' index='"+d+"'><div class='dhx_custom_button_"+e[d].button+"'></div><div>"+this.locale.labels["button_"+
e[d].button]+"</div></div>");this.config.wide_form&&(b+="<div class='dhx_wrap_section'>");b+="<div id='"+e[d].id+"' class='dhx_cal_lsection'>"+g+this.locale.labels["section_"+e[d].name]+"</div>"+f.render.call(this,e[d]);b+="</div>"}}var h=a.getElementsByTagName("div");h[1].innerHTML=b;this.setLightboxSize();this._init_lightbox_events(this);a.style.display="none";a.style.visibility="visible"}return this._lightbox};scheduler._lightbox_template="<div class='dhx_cal_ltitle'><span class='dhx_mark'>&nbsp;</span><span class='dhx_time'></span><span class='dhx_title'></span></div><div class='dhx_cal_larea'></div>";
scheduler._dp_init=function(a){a._methods=["setEventTextStyle","","changeEventId","deleteEvent"];this.attachEvent("onEventAdded",function(b){!this._loading&&this.validId(b)&&a.setUpdated(b,!0,"inserted")});this.attachEvent("onConfirmedBeforeEventDelete",function(b){if(this.validId(b)){var c=a.getState(b);if(c=="inserted"||this._new_event)return a.setUpdated(b,!1),!0;if(c=="deleted")return!1;if(c=="true_deleted")return!0;a.setUpdated(b,!0,"deleted");return!1}});this.attachEvent("onEventChanged",function(b){!this._loading&&
this.validId(b)&&a.setUpdated(b,!0,"updated")});a._getRowData=function(a){var c=this.obj.getEvent(a),d={},e;for(e in c)e.indexOf("_")!=0&&(d[e]=c[e]&&c[e].getUTCFullYear?this.obj.templates.xml_format(c[e]):c[e]);return d};a._clearUpdateFlag=function(){};a.attachEvent("insertCallback",scheduler._update_callback);a.attachEvent("updateCallback",scheduler._update_callback);a.attachEvent("deleteCallback",function(a,c){this.obj.setUserData(c,this.action_param,"true_deleted");this.obj.deleteEvent(c)})};
scheduler.setUserData=function(a,b,c){a?this.getEvent(a)[b]=c:this._userdata[b]=c};scheduler.getUserData=function(a,b){return a?this.getEvent(a)[b]:this._userdata[b]};scheduler.setEventTextStyle=function(a,b){this.for_rendered(a,function(a){a.style.cssText+=";"+b});var c=this.getEvent(a);c._text_style=b;this.event_updated(c)};scheduler.validId=function(){return!0};
scheduler._update_callback=function(a){var b=scheduler.xmlNodeToJSON(a.firstChild);b.text=b.text||b._tagvalue;b.start_date=scheduler.templates.xml_date(b.start_date);b.end_date=scheduler.templates.xml_date(b.end_date);scheduler.addEvent(b)};


(function () {

    //=============================
    //SalesLogix 8.0 -Customization
    //=============================

    
    scheduler.templates.event_class = function (start, end, event) {
        var eventClass = "";
        if (event.current_event)
            eventClass = "currentEvent";

        return eventClass;
    };

    //===============
    //Default Customization
    //===============
    function B() {
        for (var a = scheduler.get_visible_events(), b = [], c = 0; c < this.y_unit.length; c++) b[c] = [];
        b[f] || (b[f] = []);
        for (c = 0; c < a.length; c++) {
            for (var f = this.order[a[c][this.y_property]], d = 0; this._trace_x[d + 1] && a[c].start_date >= this._trace_x[d + 1]; ) d++;
            for (; this._trace_x[d] && a[c].end_date > this._trace_x[d]; ) b[f][d] || (b[f][d] = []), b[f][d].push(a[c]), d++
        }
        return b
    }
    function v(a, b, c) {
        var f = 0,
            d = b ? a.end_date : a.start_date;
        if (d.valueOf() > scheduler._max_date.valueOf()) d = scheduler._max_date;
        var i = d - scheduler._min_date_timeline;
        if (i < 0) k = 0;
        else {
            var g = Math.round(i / (c * scheduler._cols[0]));
            if (g > scheduler._cols.length) g = scheduler._cols.length;
            for (var e = 0; e < g; e++) f += scheduler._cols[e];
            var j = scheduler.date.add(scheduler._min_date_timeline, scheduler.matrix[scheduler._mode].x_step * g, scheduler.matrix[scheduler._mode].x_unit),
                i = d - j,
                k = Math.floor(i / c)
        }
        f += b ? k - 14 : k + 1;
        return f
    }
    function C(a) {
        var b = "<table style='table-layout:fixed;' cellspacing='0' cellpadding='0'>",
            c = [];
        scheduler._load_mode && scheduler._load();
        if (this.render == "cell") c = B.call(this);
        else for (var f = scheduler.get_visible_events(), d = 0; d < f.length; d++) {
            var i = this.order[f[d][this.y_property]];
            c[i] || (c[i] = []);
            c[i].push(f[d])
        }
        for (var g = 0, e = 0; e < scheduler._cols.length; e++) g += scheduler._cols[e];
        var j = new Date;
        this._step = j = (scheduler.date.add(j, this.x_step * this.x_size, this.x_unit) - j) / g;
        this._summ = g;
        var k = scheduler._colsS.heights = [];
        this._events_height = {};
        for (e = 0; e < this.y_unit.length; e++) {
            var h = this._logic(this.render, this.y_unit[e], this);
            scheduler._merge(h, {
                height: this.dy
            });
            if (this.section_autoheight && this.y_unit.length * h.height < a.offsetHeight) h.height = Math.max(h.height, Math.floor((a.offsetHeight - 1) / this.y_unit.length));
            scheduler._merge(h, {
                tr_className: "",
                style_height: "height:" + h.height + "px;",
                style_width: "width:" + (this.dx - 1) + "px;",
                td_className: "dhx_matrix_scell" + (scheduler.templates[this.name + "_scaley_class"](this.y_unit[e].key, this.y_unit[e].label, this) ? " " + scheduler.templates[this.name + "_scaley_class"](this.y_unit[e].key, this.y_unit[e].label, this) : ""),
                td_content: scheduler.templates[this.name + "_scale_label"](this.y_unit[e].key, this.y_unit[e].label, this.y_unit[e]),
                summ_width: "width:" + g + "px;",
                table_className: ""
            });
            var o = "";
            if (c[e] && this.render != "cell") {
                c[e].sort(function (a, d) {
                    return a.start_date > d.start_date ? 1 : -1
                });
                for (var l = [], d = 0; d < c[e].length; d++) {
                    for (var m = c[e][d], n = 0; l[n] && l[n].end_date > m.start_date; ) n++;
                    l[n] = m;
                    o += scheduler.render_timeline_event.call(this, m, n)
                }
            }
            if (this.fit_events) {
                var w = this._events_height[this.y_unit[e].key] || 0;
                h.height = w > h.height ? w : h.height;
                h.style_height = "height:" + h.height + "px;"
            }
            b += "<tr class='" + h.tr_className + "' style='" + h.style_height + "'><td class='" + h.td_className + "' style='" + h.style_width + " height:" + (h.height - 1) + "px;'>" + h.td_content + "</td>";
            if (this.render == "cell") for (d = 0; d < scheduler._cols.length; d++) b += "<td class='dhx_matrix_cell " + scheduler.templates[this.name + "_cell_class"](c[e][d], this._trace_x[d], this.y_unit[e]) + "' style='width:" + (scheduler._cols[d] - 1) + "px'><div style='width:" + (scheduler._cols[d] - 1) + "px'>" + scheduler.templates[this.name + "_cell_value"](c[e][d]) + "</div></td>";
            else {
                b += "<td><div style='" + h.summ_width + " " + h.style_height + " position:relative;' class='dhx_matrix_line'>";
                b += o;
                b += "<table class='" + h.table_className + "' cellpadding='0' cellspacing='0' style='" + h.summ_width + " " + h.style_height + "' >";
                for (d = 0; d < scheduler._cols.length; d++) {
                    //var nextItem = this._trace_x[d + 1]; //d != scheduler._cols.length - 1 ? this._trace_x[d + 1] : false;
                    //b += "<td class='dhx_matrix_cell " + scheduler.templates[this.name + "_cell_class"](c[e], this._trace_x[d], this.y_unit[e], nextItem) + "' style='width:" + (scheduler._cols[d] - 1) + "px'><div style='width:" + (scheduler._cols[d] - 1) + "px'></div></td>";
                    b += "<td class='dhx_matrix_cell " + scheduler.templates[this.name + "_cell_class"](c[e], this._trace_x[d], this.y_unit[e]) + "' style='width:" + (scheduler._cols[d] - 1) + "px'><div style='width:" + (scheduler._cols[d] - 1) + "px'></div></td>";
                }
                b += "</table>";
                b += "</div></td>"
            }
            b += "</tr>"
        }
        b += "</table>";
        this._matrix = c;
        a.innerHTML = b;
        scheduler._rendered = [];
        for (var q = document.getElementsByTagName("DIV"), e = 0; e < q.length; e++) q[e].getAttribute("event_id") && scheduler._rendered.push(q[e]);
        for (e = 0; e < a.firstChild.rows.length; e++) k.push(a.firstChild.rows[e].offsetHeight)
    }
    function D(a) {
        var b = scheduler.xy.scale_height,
            c = this._header_resized || scheduler.xy.scale_height;
        scheduler._cols = [];
        scheduler._colsS = {
            height: 0
        };
        this._trace_x = [];
        var f = scheduler._x - this.dx - 18,
            d = [this.dx],
            i = scheduler._els.dhx_cal_header[0];
        i.style.width = d[0] + f + "px";
        for (var g = scheduler._min_date_timeline = scheduler._min_date, e = 0; e < this.x_size; e++) this._trace_x[e] = new Date(g), g = scheduler.date.add(g, this.x_step, this.x_unit), scheduler._cols[e] = Math.floor(f / (this.x_size - e)), f -= scheduler._cols[e], d[e + 1] = d[e] + scheduler._cols[e];
        a.innerHTML = "<div></div>";
        if (this.second_scale) {
            for (var j = this.second_scale.x_unit, k = [this._trace_x[0]], h = [], o = [this.dx, this.dx], l = 0, m = 0; m < this._trace_x.length; m++) {
                var n = this._trace_x[m],
                    w = E(j, n, k[l]);
                w && (++l, k[l] = n, o[l + 1] = o[l]);
                var q = l + 1;
                h[l] = scheduler._cols[m] + (h[l] || 0);
                o[q] += scheduler._cols[m]
            }
            a.innerHTML = "<div></div><div></div>";
            var p = a.firstChild;
            p.style.height = c + "px";
            var v = a.lastChild;
            v.style.position = "relative";
            for (var r = 0; r < k.length; r++) {
                var t = k[r],
                    u = scheduler.templates[this.name + "_second_scalex_class"](t),
                    x = document.createElement("DIV");
                x.className = "dhx_scale_bar dhx_second_scale_bar" + (u ? " " + u : "");
                scheduler.set_xy(x, h[r] - 1, c - 3, o[r], 0);
                x.innerHTML = scheduler.templates[this.name + "_second_scale_date"](t);
                p.appendChild(x)
            }
        }
        scheduler.xy.scale_height = c;
        for (var a = a.lastChild, s = 0; s < this._trace_x.length; s++) {
            g = this._trace_x[s];
            scheduler._render_x_header(s, d[s], g, a);
            var y = scheduler.templates[this.name + "_scalex_class"](g);
            y && (a.lastChild.className += " " + y)
        }
        scheduler.xy.scale_height = b;
        var z = this._trace_x;
        a.onclick = function (a) {
            var d = A(a);
            d && scheduler.callEvent("onXScaleClick", [d.x, z[d.x], a || event])
        };
        a.ondblclick = function (a) {
            var d = A(a);
            d && scheduler.callEvent("onXScaleDblClick", [d.x, z[d.x],
            a || event])
        }
    }
    function E(a, b, c) {
        switch (a) {
            case "day":
                return !(b.getDate() == c.getDate() && b.getMonth() == c.getMonth() && b.getFullYear() == c.getFullYear());
            case "week":
                return !(scheduler.date.getISOWeek(b) == scheduler.date.getISOWeek(c) && b.getFullYear() == c.getFullYear());
            case "month":
                return !(b.getMonth() == c.getMonth() && b.getFullYear() == c.getFullYear());
            case "year":
                return b.getFullYear() != c.getFullYear();
            default:
                return !1
        }
    }
    function p(a) {
        if (a) {
            scheduler.set_sizes();
            t();
            var b = scheduler._min_date;
            D.call(this, scheduler._els.dhx_cal_header[0]);
            C.call(this, scheduler._els.dhx_cal_data[0]);
            scheduler._min_date = b;
            scheduler._els.dhx_cal_date[0].innerHTML = scheduler.templates[this.name + "_date"](scheduler._min_date, scheduler._max_date);
            scheduler._table_view = !0
        }
    }
    function u() {
        if (scheduler._tooltip) scheduler._tooltip.style.display = "none", scheduler._tooltip.date = ""
    }
    function F(a, b, c) {
        if (a.render == "cell") {
            var f = b.x + "_" + b.y,
                d = a._matrix[b.y][b.x];
            if (!d) return u();
            d.sort(function (a, d) {
                return a.start_date > d.start_date ? 1 : -1
            });
            if (scheduler._tooltip) {
                if (scheduler._tooltip.date == f) return;
                scheduler._tooltip.innerHTML = ""
            } else {
                var i = scheduler._tooltip = document.createElement("DIV");
                i.className = "dhx_tooltip";
                document.body.appendChild(i);
                i.onclick = scheduler._click.dhx_cal_data
            }
            for (var g = "", e = 0; e < d.length; e++) {
                var j = d[e].color ? "background-color:" + d[e].color + ";" : "",
                    k = d[e].textColor ? "color:" + d[e].textColor + ";" : "";
                g += "<div class='dhx_tooltip_line' event_id='" + d[e].id + "' style='" + j + "" + k + "'>";
                g += "<div class='dhx_tooltip_date'>" + (d[e]._timed ? scheduler.templates.event_date(d[e].start_date) : "") + "</div>";
                g += "<div class='dhx_event_icon icon_details'>&nbsp;</div>";
                g += scheduler.templates[a.name + "_tooltip"](d[e].start_date, d[e].end_date, d[e]) + "</div>"
            }
            scheduler._tooltip.style.display = "";
            scheduler._tooltip.style.top = "0px";
            scheduler._tooltip.style.left = document.body.offsetWidth - c.left - scheduler._tooltip.offsetWidth < 0 ? c.left - scheduler._tooltip.offsetWidth + "px" : c.left + b.src.offsetWidth + "px";
            scheduler._tooltip.date = f;
            scheduler._tooltip.innerHTML = g;
            scheduler._tooltip.style.top = document.body.offsetHeight - c.top - scheduler._tooltip.offsetHeight < 0 ? c.top - scheduler._tooltip.offsetHeight + b.src.offsetHeight + "px" : c.top + "px"
        }
    }
    function t() {
        dhtmlxEvent(scheduler._els.dhx_cal_data[0], "mouseover", function (a) {
            var b = scheduler.matrix[scheduler._mode];
            if (b) {
                var c = scheduler._locate_cell_timeline(a),
                    a = a || event,
                    f = a.target || a.srcElement;
                if (c) return F(b, c, getOffset(c.src))
            }
            u()
        });
        t = function () { }
    }
    function G(a) {
        for (var b = a.parentNode.childNodes, c = 0; c < b.length; c++) if (b[c] == a) return c;
        return -1
    }
    function A(a) {
        for (var a = a || event,
        b = a.target ? a.target : a.srcElement; b && b.tagName != "DIV"; ) b = b.parentNode;
        if (b && b.tagName == "DIV") {
            var c = b.className.split(" ")[0];
            if (c == "dhx_scale_bar") return {
                x: G(b),
                y: -1,
                src: b,
                scale: !0
            }
        }
    }
    scheduler.matrix = {};
    scheduler._merge = function (a, b) {
        for (var c in b) typeof a[c] == "undefined" && (a[c] = b[c])
    };
    scheduler.createTimelineView = function (a) {
        scheduler._merge(a, {
            section_autoheight: !0,
            name: "matrix",
            x: "time",
            y: "time",
            x_step: 1,
            x_unit: "hour",
            y_unit: "day",
            y_step: 1,
            x_start: 0,
            x_size: 24,
            y_start: 0,
            y_size: 7,
            render: "cell",
            dx: 200,
            dy: 50,
            fit_events: !0,
            second_scale: !1,
            _logic: function (a, b, c) {
                var e = {};
                scheduler.checkEvent("onBeforeViewRender") && (e = scheduler.callEvent("onBeforeViewRender", [a, b, c]));
                return e
            }
        });
        scheduler.checkEvent("onTimelineCreated") && scheduler.callEvent("onTimelineCreated", [a]);
        var b = scheduler.render_data;
        scheduler.render_data = function (d, c) {
            if (this._mode == a.name) if (c) for (var f = 0; f < d.length; f++) this.clear_event(d[f]), this.render_timeline_event.call(this.matrix[this._mode], d[f], 0, !0);
            else p.call(a, !0);
            else return b.apply(this,
            arguments)
        };
        scheduler.matrix[a.name] = a;
        scheduler.templates[a.name + "_cell_value"] = function (a) {
            return a ? a.length : ""
        };
        scheduler.templates[a.name + "_cell_class"] = function (evs, current, y, next) {
            // if (evs && evs.length > 0) {
            //                var evStartTime = scheduler.config.currentEventStartTime; // evs[0].start_date;
            //                var evEndTime = scheduler.config.currentEventEndTime;// evs[0].end_date;
            //                if ((evStartTime.valueOf() >= current.valueOf() && evStartTime.valueOf() <= next.valueOf()) ||
            //                    (current.valueOf() > evStartTime.valueOf() && evEndTime.valueOf() > current.valueOf()) ) {
            //                    return "currentEvent";
            //                }
            //  }
            return "";
        };
        scheduler.templates[a.name + "_scalex_class"] = function () {
            return ""
        };
        scheduler.templates[a.name + "_second_scalex_class"] = function () {
            return ""
        };
        scheduler.templates[a.name + "_scaley_class"] = function () {
            return ""
        };
        scheduler.templates[a.name + "_scale_label"] = function (a, b) {
            return b
        };
        scheduler.templates[a.name + "_tooltip"] = function (a, b, c) {
            return c.text
        };
        scheduler.templates[a.name + "_date"] = function (a, b) {
            return scheduler.templates.day_date(a);
           // return a.getDay() == b.getDay() && b - a < 864E5 ? scheduler.templates.day_date(a) : scheduler.templates.week_date(a, b);
        };
        scheduler.templates[a.name + "_scale_date"] = scheduler.date.date_to_str(a.x_date || scheduler.config.hour_date);
        scheduler.templates[a.name + "_second_scale_date"] = scheduler.date.date_to_str(a.second_scale && a.second_scale.x_date ? a.second_scale.x_date : scheduler.config.hour_date);
        scheduler.date["add_" + a.name] = function (b, c) {
            return scheduler.date.add(b, (a.x_length || a.x_size) * c * a.x_step, a.x_unit)
        };
        scheduler.date[a.name + "_start"] = scheduler.date[a.x_unit + "_start"] || scheduler.date.day_start;
        scheduler.attachEvent("onSchedulerResize", function () {
            return this._mode == a.name ? (p.call(a, !0), !1) : !0
        });
        scheduler.attachEvent("onOptionsLoad", function () {
            a.order = {};
            scheduler.callEvent("onOptionsLoadStart", []);
            for (var b = 0; b < a.y_unit.length; b++) a.order[a.y_unit[b].key] = b;
            scheduler.callEvent("onOptionsLoadFinal", []);
            scheduler._date && a.name == scheduler._mode && scheduler.setCurrentView(scheduler._date,
            scheduler._mode)
        });
        scheduler.callEvent("onOptionsLoad", [a]);
        scheduler[a.name + "_view"] = function () {
            scheduler.renderMatrix.apply(a, arguments)
        };
        if (a.render != "cell") {
            var c = new Date,
                f = scheduler.date.add(c, a.x_step, a.x_unit).valueOf() - c.valueOf();
            scheduler["mouse_" + a.name] = function (b) {
                var c = this._drag_event;
                if (this._drag_id) c = this.getEvent(this._drag_id), this._drag_event._dhx_changed = !0;
                b.x -= a.dx;
                for (var g = 0, e = 0, j = 0; e < this._cols.length - 1; e++) if (g += this._cols[e], g > b.x) break;
                for (g = 0; j < this._colsS.heights.length; j++) if (g += this._colsS.heights[j], g > b.y) break;
                b.fields = {};
                a.y_unit[j] || (j = a.y_unit.length - 1);
                b.fields[a.y_property] = c[a.y_property] = a.y_unit[j].key;
                b.x = 0;
                this._drag_mode == "new-size" && c.start_date * 1 == this._drag_start * 1 && e++;
                var k = e >= a._trace_x.length ? scheduler.date.add(a._trace_x[a._trace_x.length - 1], a.x_step, a.x_unit) : a._trace_x[e];
                b.y = Math.round((k - this._min_date) / (6E4 * this.config.time_step));
                b.custom = !0;
                b.shift = f;
                return b
            }
        }
    };
    scheduler.render_timeline_event = function (a, b, c) {
        var f = v(a, !1, this._step),
            d = v(a, !0,
            this._step),
            i = scheduler.xy.bar_height,
            g = 2 + b * i,
            e = i + g - 2,
            j = a[this.y_property];
        if (!this._events_height[j] || this._events_height[j] < e) this._events_height[j] = e;
        var k = scheduler.templates.event_class(a.start_date, a.end_date, a),
            k = "dhx_cal_event_line " + (k || ""),
            h = a.color ? "background-color:" + a.color + ";" : "",
            o = a.textColor ? "color:" + a.textColor + ";" : "",
            l = '<div event_id="' + a.id + '" class="' + k + '" style="' + h + "" + o + "position:absolute; top:" + g + "px; left:" + f + "px; width:" + Math.max(0, d - f) + "px;" + (a._text_style || "") + '">' + scheduler.templates.event_bar_text(a.start_date,
            a.end_date, a) + "</div>";
        if (c) {
            var m = document.createElement("DIV");
            m.innerHTML = l;
            var n = this.order[j],
                p = scheduler._els.dhx_cal_data[0].firstChild.rows[n].cells[1].firstChild;
            scheduler._rendered.push(m.firstChild);
            p.appendChild(m.firstChild)
        } else return l
    };
    scheduler.renderMatrix = function (a) {
        scheduler._els.dhx_cal_data[0].scrollTop = 0;
        var b = scheduler.date[this.name + "_start"](scheduler._date);
        scheduler._min_date = scheduler.date.add(b, this.x_start * this.x_step, this.x_unit);
        scheduler._max_date = scheduler.date.add(scheduler._min_date,
        this.x_size * this.x_step, this.x_unit);
        scheduler._table_view = !0;
        if (this.second_scale) {
            if (a && !this._header_resized) this._header_resized = scheduler.xy.scale_height, scheduler.xy.scale_height *= 2, scheduler._els.dhx_cal_header[0].className += " dhx_second_cal_header";
            if (!a && this._header_resized) {
                scheduler.xy.scale_height /= 2;
                this._header_resized = !1;
                var c = scheduler._els.dhx_cal_header[0];
                c.className = c.className.replace(/ dhx_second_cal_header/gi, "")
            }
        }
        p.call(this, a)
    };
    scheduler._locate_cell_timeline = function (a) {
        for (var a = a || event, b = a.target ? a.target : a.srcElement; b && b.tagName != "TD"; ) b = b.parentNode;
        if (b && b.tagName == "TD") {
            var c = b.className.split(" ")[0];
            if (c == "dhx_matrix_cell") if (scheduler._isRender("cell")) return {
                x: b.cellIndex - 1,
                y: b.parentNode.rowIndex,
                src: b
            };
            else {
                for (var f = b.parentNode; f && f.tagName != "TD"; ) f = f.parentNode;
                return {
                    x: b.cellIndex,
                    y: f.parentNode.rowIndex,
                    src: b
                }
            } else if (c == "dhx_matrix_scell") return {
                x: -1,
                y: b.parentNode.rowIndex,
                src: b,
                scale: !0
            }
        }
        return !1
    };
    var H = scheduler._click.dhx_cal_data;
    scheduler._click.dhx_cal_data = function (a) {
        var b = H.apply(this, arguments),
            c = scheduler.matrix[scheduler._mode];
        if (c) {
            var f = scheduler._locate_cell_timeline(a);
            f && (f.scale ? scheduler.callEvent("onYScaleClick", [f.y, c.y_unit[f.y], a || event]) : scheduler.callEvent("onCellClick", [f.x, f.y, c._trace_x[f.x], (c._matrix[f.y] || {})[f.x] || [], a || event]))
        }
        return b
    };
    scheduler.dblclick_dhx_matrix_cell = function (a) {
        var b = scheduler.matrix[scheduler._mode];
        if (b) {
            var c = scheduler._locate_cell_timeline(a);
            c && (c.scale ? scheduler.callEvent("onYScaleDblClick", [c.y,
            b.y_unit[c.y], a || event]) : scheduler.callEvent("onCellDblClick", [c.x, c.y, b._trace_x[c.x], (b._matrix[c.y] || {})[c.x] || [], a || event]))
        }
    };
    scheduler.dblclick_dhx_matrix_scell = function (a) {
        return scheduler.dblclick_dhx_matrix_cell(a)
    };
    scheduler._isRender = function (a) {
        return scheduler.matrix[scheduler._mode] && scheduler.matrix[scheduler._mode].render == a
    };
    scheduler.attachEvent("onCellDblClick", function (a, b, c, f, d) {
        if (!(this.config.readonly || d.type == "dblclick" && !this.config.dblclick_create)) {
            var i = scheduler.matrix[scheduler._mode],
                g = {};
            g.start_date = i._trace_x[a];
            g.end_date = i._trace_x[a + 1] ? i._trace_x[a + 1] : scheduler.date.add(i._trace_x[a], i.x_step, i.x_unit);
            g[scheduler.matrix[scheduler._mode].y_property] = i.y_unit[b].key;
            scheduler.addEventNow(g, null, d)
        }
    });
    scheduler.attachEvent("onBeforeDrag", function () {
        return scheduler._isRender("cell") ? !1 : !0
    })
})();

if(typeof infosoftglobal == "undefined") var infosoftglobal = new Object();
if(typeof infosoftglobal.FusionChartsUtil == "undefined") infosoftglobal.FusionChartsUtil = new Object();
infosoftglobal.FusionCharts = function(swf, id, w, h, debugMode, registerWithJS, c, scaleMode, lang, detectFlashVersion, autoInstallRedirect){
	if (!document.getElementById) { return; }
	
	//Flag to see whether data has been set initially
	this.initialDataSet = false;
	
	//Create container objects
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	
	//Set attributes for the SWF
	if(swf) { this.setAttribute('swf', swf); }
	if(id) { this.setAttribute('id', id); }

	w=w.toString().replace(/\%$/,"%25");
	if(w) { this.setAttribute('width', w); }
	h=h.toString().replace(/\%$/,"%25");
	if(h) { this.setAttribute('height', h); }

	
	//Set background color
	if(c) { this.addParam('bgcolor', c); }
	
	//Set Quality	
	this.addParam('quality', 'high');

	//Render HTML OVER flash
	this.addParam('WMode', 'transparent');
	
	//Add scripting access parameter
	this.addParam('allowScriptAccess', 'always');
	
	//Pass width and height to be appended as chartWidth and chartHeight
	this.addVariable('chartWidth', w);
	this.addVariable('chartHeight', h);

	//Whether in debug mode
	debugMode = debugMode ? debugMode : 0;
	this.addVariable('debugMode', debugMode);
	//Pass DOM ID to Chart
	this.addVariable('DOMId', id);
	//Whether to registed with JavaScript
	registerWithJS = registerWithJS ? registerWithJS : 0;
	this.addVariable('registerWithJS', registerWithJS);
	
	//Scale Mode of chart
	scaleMode = scaleMode ? scaleMode : 'noScale';
	this.addVariable('scaleMode', scaleMode);
	
	//Application Message Language
	lang = lang ? lang : 'EN';
	this.addVariable('lang', lang);
	
	//Whether to auto detect and re-direct to Flash Player installation
	this.detectFlashVersion = detectFlashVersion?detectFlashVersion:1;
	this.autoInstallRedirect = autoInstallRedirect?autoInstallRedirect:1;
	
	//Ger Flash Player version 
	this.installedVer = infosoftglobal.FusionChartsUtil.getPlayerVersion();
	
	if (!window.opera && document.all && this.installedVer.major > 7) {
		// Only add the onunload cleanup if the Flash Player version supports External Interface and we are in IE
		infosoftglobal.FusionCharts.doPrepUnload = true;
	}
}

infosoftglobal.FusionCharts.prototype = {
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	getAttribute: function(name){
		return this.attributes[name];
	},
	addParam: function(name, value){
		this.params[name] = value;
	},
	getParams: function(){
		return this.params;
	},
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	getVariable: function(name){
		return this.variables[name];
	},
	getVariables: function(){
		return this.variables;
	},
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs.push(key +"="+ variables[key]);
		}
		return variablePairs;
	},
	getSWFHTML: function() {
		var swfNode = "";
		if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) { 
			// netscape plugin architecture			
			swfNode = '<embed type="application/x-shockwave-flash" src="'+ this.getAttribute('swf') +'" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'"  ';
			swfNode += ' id="'+ this.getAttribute('id') +'" name="'+ this.getAttribute('id') +'" ';
			var params = this.getParams();
			 for(var key in params){ swfNode += [key] +'="'+ params[key] +'" '; }
			var pairs = this.getVariablePairs().join("&");
			 if (pairs.length > 0){ swfNode += 'flashvars="'+ pairs +'"'; }
			swfNode += '/>';
		} else { // PC IE			
			swfNode = '<object id="'+ this.getAttribute('id') +'" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+ this.getAttribute('width') +'" height="'+ this.getAttribute('height') +'">';
			swfNode += '<param name="movie" value="'+ this.getAttribute('swf') +'" />';
			var params = this.getParams();
			for(var key in params) {
			 swfNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			var pairs = this.getVariablePairs().join("&");			
			if(pairs.length > 0) {swfNode += '<param name="flashvars" value="'+ pairs +'" />';}
			swfNode += "</object>";
		}
		return swfNode;
	},
	setDataURL: function(strDataURL){
		//This method sets the data URL for the chart.
		//If being set initially
		if (this.initialDataSet==false){
			this.addVariable('dataURL',strDataURL);
			//Update flag
			this.initialDataSet = true;
		}else{
			//Else, we update the chart data using External Interface
			//Get reference to chart object
			var chartObj = infosoftglobal.FusionChartsUtil.getChartObject(this.getAttribute('id'));
			
			if (!chartObj.setDataURL)
			{
				__flash__addCallback(chartObj, "setDataURL");
			}
			
			chartObj.setDataURL(strDataURL);
		}
	},
	//This function :
	//fixes the double quoted attributes to single quotes
	//Encodes all quotes inside attribute values
	//Encodes % to %25 and & to %26;
	encodeDataXML: function(strDataXML){
		
			var regExpReservedCharacters=["\\$","\\+"];
			var arrDQAtt=strDataXML.match(/=\s*\".*?\"/g);
			if (arrDQAtt){
				for(var i=0;i<arrDQAtt.length;i++){
					var repStr=arrDQAtt[i].replace(/^=\s*\"|\"$/g,"");
					repStr=repStr.replace(/\'/g,"%26apos;");
					var strTo=strDataXML.indexOf(arrDQAtt[i]);
					var repStrr="='"+repStr+"'";
					var strStart=strDataXML.substring(0,strTo);
					var strEnd=strDataXML.substring(strTo+arrDQAtt[i].length);
					var strDataXML=strStart+repStrr+strEnd;
				}
			}
			
			strDataXML=strDataXML.replace(/\"/g,"%26quot;");
			strDataXML=strDataXML.replace(/%(?![\da-f]{2}|[\da-f]{4})/ig,"%25");
			strDataXML=strDataXML.replace(/\&/g,"%26");

			return strDataXML;

	},
	setDataXML: function(strDataXML){
		//If being set initially
		if (this.initialDataSet==false){
			//This method sets the data XML for the chart INITIALLY.
			this.addVariable('dataXML',this.encodeDataXML(strDataXML));
			//Update flag
			this.initialDataSet = true;
		}else{
			//Else, we update the chart data using External Interface
			//Get reference to chart object
			var chartObj = infosoftglobal.FusionChartsUtil.getChartObject(this.getAttribute('id'));
			chartObj.setDataXML(strDataXML);
		}
	},
	setTransparent: function(isTransparent){
		//I don't think this is ever called, moved addparam to init -RR
	},
	
	render: function(elementId){
		//First check for installed version of Flash Player - we need a minimum of 6
		if((this.detectFlashVersion==1) && (this.installedVer.major < 6)){
			if (this.autoInstallRedirect==1){
				//If we can auto redirect to install the player?
				var installationConfirm = window.confirm("You need Adobe Flash Player 6 (or above) to view the charts. It is a free and lightweight installation from Adobe.com. Please click on Ok to install the same.");
				if (installationConfirm){
					window.location = "http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash";
				}else{
					return false;
				}
			}else{
				//Else, do not take an action. It means the developer has specified a message in the DIV (and probably a link).
				//So, expect the developers to provide a course of way to their end users.
				//window.alert("You need Adobe Flash Player 8 (or above) to view the charts. It is a free and lightweight installation from Adobe.com. ");
				return false;
			}			
		}else{
			//Render the chart
			var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
			n.innerHTML = this.getSWFHTML();
			
			//Added <FORM> compatibility
			//Check if it's added in Mozilla embed array or if already exits 
			if(!document.embeds[this.getAttribute('id')] && !window[this.getAttribute('id')])
		      	window[this.getAttribute('id')]=document.getElementById(this.getAttribute('id')); 
				//or else document.forms[formName/formIndex][chartId]			
			return true;		
		}
	}
}


infosoftglobal.FusionChartsUtil.getPlayerVersion = function(){
	var PlayerVersion = new infosoftglobal.PlayerVersion([0,0,0]);
	if(navigator.plugins && navigator.mimeTypes.length){
		var x = navigator.plugins["Shockwave Flash"];
		if(x && x.description) {
			PlayerVersion = new infosoftglobal.PlayerVersion(x.description.replace(/([a-zA-Z]|\s)+/, "").replace(/(\s+r|\s+b[0-9]+)/, ".").split("."));
		}
	}else if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0){ 
		//If Windows CE
		var axo = 1;
		var counter = 3;
		while(axo) {
			try {
				counter++;
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+ counter);
				PlayerVersion = new infosoftglobal.PlayerVersion([counter,0,0]);
			} catch (e) {
				axo = null;
			}
		}
	} else { 
		// Win IE (non mobile)
		// Do minor version lookup in IE, but avoid Flash Player 6 crashing issues
		try{
			var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
		}catch(e){
			try {
				var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
				PlayerVersion = new infosoftglobal.PlayerVersion([6,0,21]);
				axo.AllowScriptAccess = "always"; // error if player version < 6.0.47 (thanks to Michael Williams @ Adobe for this code)
			} catch(e) {
				if (PlayerVersion.major == 6) {
					return PlayerVersion;
				}
			}
			try {
				axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
			} catch(e) {}
		}
		if (axo != null) {
			PlayerVersion = new infosoftglobal.PlayerVersion(axo.GetVariable("$version").split(" ")[1].split(","));
		}
	}
	return PlayerVersion;
}
infosoftglobal.PlayerVersion = function(arrVersion){
	this.major = arrVersion[0] != null ? parseInt(arrVersion[0]) : 0;
	this.minor = arrVersion[1] != null ? parseInt(arrVersion[1]) : 0;
	this.rev = arrVersion[2] != null ? parseInt(arrVersion[2]) : 0;
}
// ------------ Fix for Out of Memory Bug in IE in FP9 ---------------//

infosoftglobal.FusionChartsUtil.cleanupSWFs = function() {
	var objects = document.getElementsByTagName("OBJECT");
	for (var i = objects.length - 1; i >= 0; i--) {
		objects[i].style.display = 'none';
		for (var x in objects[i]) {
			if (typeof objects[i][x] == 'function') {
				objects[i][x] = function(){};
			}
		}
	}
}
// Fixes bug in fp9
if (infosoftglobal.FusionCharts.doPrepUnload) {
	if (!infosoftglobal.unloadSet) {
		infosoftglobal.FusionChartsUtil.prepUnload = function() {
			__flash_unloadHandler = function(){};
			__flash_savedUnloadHandler = function(){};
			window.attachEvent("onunload", infosoftglobal.FusionChartsUtil.cleanupSWFs);
		}
		window.attachEvent("onbeforeunload", infosoftglobal.FusionChartsUtil.prepUnload);
		infosoftglobal.unloadSet = true;
	}
}

if (!document.getElementById && document.all) { document.getElementById = function(id) { return document.all[id]; }}

if (Array.prototype.push == null) { Array.prototype.push = function(item) { this[this.length] = item; return this.length; }}


infosoftglobal.FusionChartsUtil.getChartObject = function(id)
{
  var chartRef=null;
  if (navigator.appName.indexOf("Microsoft Internet")==-1) {
    if (document.embeds && document.embeds[id])
      chartRef = document.embeds[id]; 
	else
	chartRef  = window.document[id];
  }
  else {
    chartRef = window[id];
  }
  if (!chartRef)
	chartRef  = document.getElementById(id);
  
  return chartRef;
}

infosoftglobal.FusionChartsUtil.updateChartXML = function(chartId, strXML){
	//Get reference to chart object				
	var chartObj = infosoftglobal.FusionChartsUtil.getChartObject(chartId);		
	//Set dataURL to null
	chartObj.SetVariable("_root.dataURL","");
	//Set the flag
	chartObj.SetVariable("_root.isNewData","1");
	//Set the actual data
	chartObj.SetVariable("_root.newData",strXML);
	//Go to the required frame
	chartObj.TGotoLabel("/", "JavaScriptHandler"); 
}



var getChartFromId = infosoftglobal.FusionChartsUtil.getChartObject;
var updateChartXML = infosoftglobal.FusionChartsUtil.updateChartXML;
var FusionCharts = infosoftglobal.FusionCharts;
