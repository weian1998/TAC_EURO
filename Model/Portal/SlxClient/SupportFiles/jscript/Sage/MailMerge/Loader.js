/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/*  ------------------------------------------------------------------------                 
Sage SalesLogix Desktop Integration
Sage.MailMerge.Loader 
Copyright(c) 2010-2011, Sage Software                  
   
This service class is used to set up mail merge and to load the mail
merge service on demand.
------------------------------------------------------------------------ */

define([
        "Sage/Utility/ErrorHandler",
        "Sage/MailMerge/Helper",
        "Sage/MailMerge/MenuHelper",
        "Sage/UI/Dialogs",
        "dijit/_Widget",
        "dojo/i18n",
        "dojo/string",
        "dojox/json/ref",
        "dojo/_base/lang",
        "dojo/i18n!./nls/Loader",
        "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function(ErrorHandler, Helper, MenuHelper, Dialogs, _Widget, i18n, dString, ref, dLang, nls, declare) {
        // ReSharper restore InconsistentNaming
        var oMailMergeLoader = declare("Sage.MailMerge.Loader", [_Widget], {
            constructor: function () {
                this.inherited(arguments);
            },
            postMixInProperties: function () {
                dLang.mixin(this, nls);
                this.inherited(arguments);
            },
            DecodeMailMergeJsonFromUrl: function (url) {
                var oMailMergeObject = null;
                dojo.xhrGet({
                    url: url,
                    preventCache: true,
                    handleAs: "text",
                    sync: true,
                    load: function (data) {
                        if (data && dojo.isString(data) && data !== "") {
                            var sJsonResponse = data.replace(/":null/gi, "\":\"\"");
                            oMailMergeObject = ref.fromJson(sJsonResponse);
                        }
                    },
                    error: function (error, ioargs) {
                        ErrorHandler.handleHttpError(error, ioargs);
                    }
                });
                return oMailMergeObject;
            },
            GetClientPath: function () {
                var sLocation = String(window.location);
                var iIndex = sLocation.lastIndexOf("/");
                if (iIndex != -1) {
                    return sLocation.substring(0, iIndex);
                }
                return null;
            }
        });

        /* Maintain backward compatability. */
        window.ExecuteWriteAction = function (writeAction, param) {
            Helper.ExecuteWriteAction(writeAction, param);
        };

        /* Maintain backward compatability. */
        window.GetMailMergeService = function (showLoadError) {
            if (typeof console !== "undefined") {
                console.warn("Use Sage.MailMerge.Helper.GetMailMergeService() instead of window.GetMailMergeService(). Note: window.GetMailMergeService() will be deprecated.");
            }
            return Helper.GetMailMergeService(showLoadError);
        };

        window.GetDesktopService = function (showLoadError) {
            return Helper.GetMailMergeService(showLoadError);
        };

        if (!Sage.Services.hasService("MailMergeServiceLoader")) {
            Sage.Services.addService("MailMergeServiceLoader", new Sage.MailMerge.Loader());
        }

        var bRemoveMenu = true;
        var oMenuHelper = new MenuHelper();
        var isWindows = (navigator.userAgent.indexOf("Win") != -1);
        if (isWindows && Sage && Sage.Services) {
            if (!Sage.gears) {
                if (typeof initGears === "function") {
                    initGears();
                }
            }
            if (Sage.gears && Sage.gears.factory) {
                dojo.addOnLoad(function () {
                    oMenuHelper.attachWriteMenuPopulator();
                });
                bRemoveMenu = false;
            }
        }

        if (bRemoveMenu) {
            try {
                if (!Sage.gears) {
                    if (window.console) {
                        console.debug("Sage.gears was [not] found."); /*DNL*/
                    }
                }
                if (Sage.gears && !Sage.gears.factory) {
                    if (window.console) {
                        console.debug("Sage.gears.factory was [not] found."); /*DNL*/
                    }
                }
            } catch (e) {
            }
            dojo.addOnLoad(function () {
                oMenuHelper.removeWriteMenu();
            });
        }

        return oMailMergeLoader;
    }
);