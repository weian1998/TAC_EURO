/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       "dijit/layout/ScrollingTabController",
       "dojo/i18n",
       "dijit/Menu",
       "dijit/MenuItem",
       "dijit/MenuSeparator",
       'dojo/i18n!./nls/DashboardTabController',
       'dojo/i18n!../nls/Boolean',
       'dojo/_base/declare'
],
function (scrollingTabController, i18n, menu, menuItem, MenuSeparator, nlsTabController, nlsBoolean, declare) {
    //dojo.requireLocalization("dijit", "common");
    var _tabButton = declare("dijit.layout._TabButton", dijit.layout._ScrollingTabControllerButton, {
        // summary:
        //		A tab (the thing you click to select a pane).
        // description:
        //		Contains the title of the pane, and optionally a close-button to destroy the pane.
        //		This is an internal widget and should not be instantiated directly.
        // tags:
        //		private
        
        // baseClass: String
        //		The CSS class applied to the domNode.
        baseClass: "dijitTab",
        
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.UI.Dashboard", "DashboardTabController"));
            dojo.mixin(this, i18n.getLocalization("Sage.UI", "Boolean"));
        },

        postCreate: function () {
            this.inherited(arguments);
            dojo.setSelectable(this.containerNode, false);
        },
        
        _setCloseButtonAttr: function (disp) {            
            var _nlsResources = i18n.getLocalization("dijit", "common");
            if (disp) {
                if (this.closeNode) {
                    dojo.attr(this.closeNode, "title", _nlsResources.itemClose);
                }
                // add context menu onto title button
                this._closeMenu = new menu({
                    id: this.id + "_Menu",
                    dir: this.dir,
                    targetNodeIds: [this.domNode]
                });

                this._closeMenu.addChild(new menuItem({
                    label: this.newTabText,  //'New Tab'
                    dir: this.dir,
                    id: this._closeMenu.id + '_New',
                    onClick: function () {
                        // get the dashboard
                        var db = dijit.byId('Dashboard');
                        db._createPage(true, db.newTabText); //'New Tab'
                    }
                }));

                this._closeMenu.addChild(new menuItem({
                    label: this.addContentText, // 'Add Content'
                    dir: this.dir,
                    id: this._closeMenu.id + '_AddContent',
                    onClick: dojo.hitch(this, function () {
                        // get the id of the page for this tab
                        var id = this.id.replace('Dashboard_tablist_', '');
                        var d = dijit.byId(id);
                        // go to the popup
                        d._newWidgetMenu();
                    })
                }));

                this._closeMenu.addChild(new menuItem({
                    label: this.editOptionsText,  // 'Edit Options'
                    dir: this.dir,
                    id: this._closeMenu.id + '_Edit',
                    onClick: dojo.hitch(this, function () {
                        // get the id of the page for this tab
                        var id = this.id.replace('Dashboard_tablist_', '');
                        var d = dijit.byId(id);
                        // go to the popup
                        d._editOptionsMenu();
                    })
                }));

                this._closeMenu.addChild(new menuItem({
                    label: this.shareTabText, //'Share Tab'
                    dir: this.dir,
                    id: this._closeMenu.id + '_Share',
                    onClick: dojo.hitch(this, function () {
                        // get the id of the page for this tab
                        var id = this.id.replace('Dashboard_tablist_', '');
                        var d = dijit.byId(id);
                        d._releaseManager.page = d;
                        // go to the popup
                        d._releaseManager.share();
                    })
                }));

                this._closeMenu.addChild(new menuItem({
                    label: this.hideTabText, //'Hide Tab'
                    dir: this.dir,
                    id: this._closeMenu.id + '_Hide',
                    onClick: dojo.hitch(this, function () {
                        // get the id of the page for this tab
                        var id = this.id.replace('Dashboard_tablist_', '');
                        // the tab
                        var d = dijit.byId(id);
                        // the dashboard
                        var db = dijit.byId('Dashboard');
                        // send the actual dijit instance of the tab to db
                        db._hidePage(d);
                    })
                }));

                this._closeMenu.addChild(new menuItem({
                    label: this.copyTabText, // 'Copy Tab'
                    dir: this.dir,
                    id: this._closeMenu.id + '_Copy',
                    onClick: dojo.hitch(this, function () {
                        // get the id of the page for this tab
                        var id = this.id.replace('Dashboard_tablist_', '');
                        // the tab
                        var d = dijit.byId(id);
                        // the dashboard
                        var db = dijit.byId('Dashboard');
                        // send the actual dijit instance of the tab to db
                        db._copyPage(d);
                    })
                }));

                this._closeMenu.addChild(new menuItem({
                    label: this.showTabText, // 'Show Tab'
                    dir: this.dir,
                    id: this._closeMenu.id + '_Show',
                    onClick: dojo.hitch(this, function () {
                        var d = dijit.byId('Dashboard');
                        d._showTabMenu();
                    })
                }));

                var id = this.id.replace('Dashboard_tablist_', '');
                var d = dijit.byId(id);
                if(d.permission) {
                    this._closeMenu.addChild(new menuItem({
                        label: this.deleteTabText, //"Delete Tab"
                        dir: this.dir,
                        id: this._closeMenu.id + '_Delete',
                        onClick: dojo.hitch(this, function () {
                            var id = this.id.replace('Dashboard_tablist_', '');
                            var d = dijit.byId(id);
                            
                            var fn = function (ans) {
                                if (ans) {
                                    if(d.permission) {
                                        dojo.publish(
                                            // send a ref to the actual page dijit
                                            '/ui/dashboard/pageDelete', [d]);
                                    }
                                    else {
                                        var opts = {
                                            title: d.resources.errorText,
                                            query: d.resources.permissionErrorText,
                                            yesText: d.resources.okButton,
                                            style: {width: '350px'},
                                            align: 'right'
                                        }
                                    
                                        Sage.UI.Dialogs.raiseQueryDialogExt(opts);
                                    }
                                }
                            };
                            
                            var opts = {
                                    title: this.deleteTabText,
                                    query: this.deleteTabConfirmText,
                                    callbackFn: fn,
                                    yesText: this.yesText,
                                    noText: this.noText,
                                    style: {width: '350px'},
                                    align: 'right'
                                }
                            // we need a confirm
                            Sage.UI.Dialogs.raiseQueryDialogExt(opts);
                        })
                    }));
                }
                
                this._closeMenu.addChild(new MenuSeparator());
                
                this._closeMenu.addChild(new menuItem({
                    label: this.helpText, // 'Help'
                    dir: this.dir, // ...?
                    id: this._closeMenu.id + '_Help',
                    onClick: dojo.hitch(this, function() {
                        Sage.Utility.openHelp('Working_with_the_Dashboard', 'MCWebHelp');
                    })
                }));

            } else {
                if (this._closeMenu) {
                    this._closeMenu.destroyRecursive();
                    delete this._closeMenu;
                }
            }
        },
        _setLabelAttr: function (/*String*/content) {
            // summary:
            //		Hook for attr('label', ...) to work.
            // description:
            //		takes an HTML string.
            //		Inherited ToggleButton implementation will Set the label (text) of the button; 
            //		Need to set the alt attribute of icon on tab buttons if no label displayed
            this.inherited(arguments);
            if (this.showLabel === false && !this.params.title) {
                this.iconNode.alt = dojo.trim(this.containerNode.innerText || this.containerNode.textContent || '');
            }
        },

        destroy: function () {
            if (this._closeMenu) {
                this._closeMenu.destroyRecursive();
                delete this._closeMenu;
            }
            this.inherited(arguments);
        }
    });

    var widget = declare("Sage.UI.Dashboard.DashboardTabController", scrollingTabController, {
        // summary:
        // 		Set of tabs (the things with titles and a close button, that you click to show a tab panel).
        //		Used internally by `dijit.layout.TabContainer`.
        // description:
        //		Lets the user select the currently shown pane in a TabContainer or StackContainer.
        //		TabController also monitors the TabContainer, and whenever a pane is
        //		added or deleted updates itself accordingly.
        // tags:
        //		private

        // tabPosition: String
        //		Defines where tabs go relative to the content.
        //		"top", "bottom", "left-h", "right-h"
        tabPosition: "top",
        
        // buttonWidget: String
        //		The name of the tab widget to create to correspond to each page
        buttonWidget: "dijit.layout._TabButton",
        
        addChild: function() {
            this.inherited(arguments);
            
            if(!this.perfomedHeightResizing) {
                this.perfomedHeightResizing = true;
                dojo.style(this.containerNode, 'height', '37px');
                dojo.style(this.containerNode, 'top', '4px');
            }
        },

        _rectifyRtlTabList: function () {
            // summary:
            //		For left/right TabContainer when page is RTL mode, rectify the width of all tabs to be equal, otherwise the tab widths are different in IE

            if (0 >= this.tabPosition.indexOf('-h')) { return; }
            if (!this.pane2button) { return; }

            var maxWidth = 0;
            for (var pane in this.pane2button) {
                var ow = this.pane2button[pane].innerDiv.scrollWidth;
                maxWidth = Math.max(maxWidth, ow);
            }
            //unify the length of all the tabs
            for (pane in this.pane2button) {
                this.pane2button[pane].innerDiv.style.width = maxWidth + 'px';
            }
        }
    });

    return widget;
});