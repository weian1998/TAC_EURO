/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/dom',
       'dojo/dom-style',
       'dojo/dom-construct',
       'dijit/Dialog',
       'dojo/NodeList-manipulate',
       'dojo/_base/declare',
       'Sage/UI/Controls/_DialogHelpIconMixin',
       'dojo/query'
],
function (dom, domStyle, construct, Dialog, manipulate, declare, _DialogHelpIconMixin, query) {
    return declare('Sage.Workspaces.Dialog', [Dialog, _DialogHelpIconMixin], {
        constructor: function (options, srcNodeRef) {
            this._initialized = false;
            this._clientId = options.clientId;
            this._stateClientId = options.stateClientId;
            this._panelClientId = options.panelClientId;
            this._contentClientId = options.contentClientId;
            this._context = null;
            this._dialog = null;
            this._dialogPanel = null;
            this._closedOnServerSide = false;
            this._dialogInfo = {};
            this.closable = true;
            this._width = 200;
            this._height = 500;
            this._toolbarId = this._clientId + '_' + this._clientId + '_toolbar';

            if (this._clientId) {
                this.statics.__instances[this._clientId] = this;
                this.statics.__initRequestManagerEvents();
            }

            this.inherited(arguments);
        },
        init: function () {
            this._context = dom.byId(this._clientId);
            dom.byId(this._contentClientId).style.display = "";
            this.handleEvents();
        },
        clearState: function () {
            var stateNode = dom.byId(this._stateClientId);
            stateNode.value = '';
        },
        disable: function () {
            if (!this.open) {
                return;
            }
            this.hide();
        },
        enable: function () {
            if (this.open) {
                return;
            }
            this.show();
        },
        show_: function (evt) {
            var title, width, height;
            if (typeof evt === 'string') {
                evt = { id: evt };
            }
            evt.event = 'open';
            evt.from = evt.from || 'client';
            title = evt.title || '';
            this.set('title', title);
            var help = evt.help;
            if (help) {
                this.createHelpIcon(help.url, help.target);
            }

            width = evt.width || 500;
            domStyle.set(this.domNode, 'width', width + 'px');

            height = evt.height || 200;
            //set the height position on the content pane and not the dijitDialog so that scroll bars when applicable do not scroll the title pane as well
            query('.dijitDialogPaneContent').style({
                'height': height + 'px',
                'overflow': 'auto'
            });
            
            var value = Sys.Serialization.JavaScriptSerializer.serialize(evt);
            var stateNode = dom.byId(this._stateClientId);
            stateNode.value = value;

            var toolbar = dojo.byId(this._toolbarId);
            if (toolbar) {
                if (this.helpIcon) {
                    dojo.place(toolbar, this.helpIcon, 'before');
                }
            }
        },
        setSize: function (width, height) {
            this._width = width || this._width || 500;
            domStyle.set(this.domNode, 'width', this._width + 'px');

            this._height = height || this._height || 200;
            domStyle.set(this.domNode, 'height', this._height + 'px');
        },
        fitToViewport: function () {
        },
        handleEvents: function () {
            var stateNode = dom.byId(this._stateClientId);
            var value = stateNode.value;
            var evt = {};
            if (value) {
                evt = eval('(' + value + ')');
            }

            //clear event
            stateNode.value = '';
            switch (evt.event) {
                case "open":
                    this._dialogInfo = evt;
                    this.title = this._dialogInfo.title;
                    this.show_(evt);
                    this.enable();
                    break;
                case "close":
                    if (this.open) {
                        this._closedOnServerSide = false;
                        this.hide_();
                        this.disable();
                        this._dialogInfo = {};
                        this._closedOnServerSide = true;
                    }
                    break;
            }
        },
        hide: function (evt) {
            // Destroy the dom for the toolbar, otherwise the old
            // toolbar will continue to appear when reopened
            if (this._toolbarId) {
                construct.destroy(this._toolbarId);
            }

            // srcElement check is for Chrome, as originalTarget doesn't exist
            if (evt && ((evt.originalTarget && evt.originalTarget.className.indexOf('dijitDialogCloseIcon') > -1)
                || (evt.srcElement && evt.srcElement.className.indexOf('dijitDialogCloseIcon') > -1))) {
                var bindingManager = Sage.Services.getService('ClientBindingManagerService');
                if (bindingManager) {
                    bindingManager.rollbackCurrentTransaction();
                }
                dom.byId(this._stateClientId).value = "{\"event\":\"close\",\"id\":\"" + this._dialogInfo.id + "\"}";
                __doPostBack(this._stateClientId, '');
            }
            this.inherited(arguments);
        },
        hide_: function (evt) {
            if (this._closedOnServerSide) {
                return;
            }

            var evt = {
                event: "close",
                id: this._dialogInfo.id
            };

            var bindingManager = Sage.Services.getService('ClientBindingManagerService');
            if (bindingManager) {
                bindingManager.rollbackCurrentTransaction();
            }

            var value = Sys.Serialization.JavaScriptSerializer.serialize(evt);
            dom.byId(this._stateClientId).value = value;
            __doPostBack(this._stateClientId, '');
        },
        // Legacy static methods
        statics: {
            __instances: {},
            __requestManagerEventsInitialized: false,
            __initRequestManagerEvents: function () {
                // this is the 'statics' object
                var self = this; // preserve our context for the PageRequestManager calls

                if (self.__requestManagerEventsInitialized) {
                    return;
                }

                var contains = function (a, b) {
                    if (!a || !b) {
                        return false;
                    } else {
                        return a.contains ? (a != b && a.contains(b)) : (!!(a.compareDocumentPosition(b) & 16));
                    }
                };

                var prm = Sys.WebForms.PageRequestManager.getInstance();

                prm.add_pageLoaded(function (sender, args) {
                    var panels = args.get_panelsUpdated();
                    if (panels) {
                        for (var id in self.__instances) {
                            for (var i = 0; i < panels.length; i++) {
                                var instance = self.__instances[id];
                                if (contains(panels[i], document.getElementById(instance._stateClientId))) {
                                    instance.handleEvents();
                                    break;
                                }
                            }
                        }
                    }
                });

                prm.add_endRequest(function (sender, args) {
                    for (var id in self.__instances) {
                        var instance = self.__instances[id];
                        instance.clearState();
                    }
                });

                self.__requestManagerEventsInitialized = true;
            }
        }
    });
});

