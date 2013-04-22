/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        "Sage/MailMerge/Helper",
        "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function (Helper, declare) {
        // ReSharper restore InconsistentNaming
        var oMenuHelper = declare("Sage.MailMerge.MenuHelper", null, {
            _populateWriteMenu: function () {
                require(['Sage/MailMerge/Service'], function () {
                    var oService = Helper.GetMailMergeService();
                    if (oService) {
                        if (!oService.MenuPopulated) {
                            oService.PopulateWriteMenu();
                        }
                    }
                });
            },
            _getMenuInfo: function () {
                var info = { toolbar: null, menu: null };
                var oToolbar = dojo.byId("ToolBar");
                if (typeof oToolbar !== "undefined" && oToolbar !== null) {
                    info.toolbar = oToolbar;
                    for (var i = 0; i < oToolbar.children.length; i++) {
                        var oItem = oToolbar.children[i];
                        if (oItem.id == "mnuMailMerge") {
                            info.menu = oItem;
                            return info;
                        }
                    }
                }
                return info;
            },
            attachWriteMenuPopulator: function () {
                var info = this._getMenuInfo();
                if (info.menu !== null) {
                    /* This will cause the jscript/Sage/MailMerge/Service.js to load (if it hasn't been already) 
                    * and to generate the sub-menu items when the Write button is clicked. 
                    * The mail merge API must become fully available [before] the menu is renderd, 
                    * since part of its rendering takes place in the mail merge API (sub-menu items). */
                    dojo.connect(info.menu, "onclick", this._populateWriteMenu);
                }
            },
            removeWriteMenu: function () {
                var info = this._getMenuInfo();
                if (info.toolbar !== null && info.menu !== null) {
                    info.toolbar.removeChild(info.menu);
                }
            }
        });

        return oMenuHelper;
    }
);