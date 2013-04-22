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