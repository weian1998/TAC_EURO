/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define(
    [
        "Sage/UI/Dialogs",
        "dijit/_Widget",
        "dojo/i18n",
        "dojo/string",
        "dojo/_base/lang",
        "dojo/i18n!./nls/Helper"
    ],
// ReSharper disable InconsistentNaming
    function (Dialogs, _Widget, i18n, dString, dLang, nls) {
        // ReSharper restore InconsistentNaming
        Sage.namespace("MailMerge.Helper");
        dojo.mixin(Sage.MailMerge.Helper, {
            desktopErrorsStore: null,
            infoStore: null,
            DesktopErrors: function () {
                if (this.desktopErrorsStore != null) {
                    return this.desktopErrorsStore;
                } else {
                    var sPath = Sage.MailMerge.Loader.prototype.GetClientPath();
                    if (sPath != null) {
                        var sUrl = dString.substitute("${0}/SLXMailMergeClient.ashx?method=GetDesktopErrors", [sPath]);
                        var oDesktopErrors = this.GetMailMergeLoader().DecodeMailMergeJsonFromUrl(sUrl);
                        if (oDesktopErrors != null) {
                            this.desktopErrorsStore = oDesktopErrors;
                            return this.desktopErrorsStore;
                        }
                    }
                }
                return null;
            },
            /* This function is called by the menu items of the Write menu. */
            ExecuteWriteAction: function (writeAction, param) {
                try {
                    require(['Sage/MailMerge/Service'], function () {
                        var oService = Sage.MailMerge.Helper.GetMailMergeService();
                        if (oService) {
                            switch (writeAction) {
                                case WriteAction.waWriteAddressLabels:
                                    oService.WriteAddressLabels();
                                    break;
                                case WriteAction.waWriteEmail:
                                    oService.WriteEmail();
                                    break;
                                case WriteAction.waWriteEmailUsing:
                                    oService.WriteEmailUsing(param);
                                    break;
                                case WriteAction.waWriteEmailUsingMore:
                                    oService.WriteEmailUsingMoreTemplates();
                                    break;
                                case WriteAction.waWriteFaxUsing:
                                    oService.WriteFaxUsing(param);
                                    break;
                                case WriteAction.waWriteFaxUsingMore:
                                    oService.WriteFaxUsingMoreTemplates();
                                    break;
                                case WriteAction.waWriteLetterUsing:
                                    oService.WriteLetterUsing(param);
                                    break;
                                case WriteAction.waWriteLetterUsingMore:
                                    oService.WriteLetterUsingMoreTemplates();
                                    break;
                                case WriteAction.waWriteMailMerge:
                                    oService.WriteMailMerge();
                                    break;
                                case WriteAction.waWriteTemplates:
                                    oService.WriteTemplates(true);
                                    break;
                            }
                        }
                    });
                } catch (err) {
                    var sXtraMsg = "";
                    if (this.IsSageGearsObjectError(err)) {
                        sXtraMsg = this.DesktopErrors().SageGearsObjectError;
                    }
                    var sError = (dojo.isFunction(err.toMessage)) ? err.toMessage(sXtraMsg, this.MailMergeInfoStore().ShowJavaScriptStack) : err.message;
                    Dialogs.showError(dString.substitute(this.DesktopErrors().WriteActionError, [sError]));
                }
            },
            GetDesktopService: function(showLoadError) {
                return this.GetMailMergeService(showLoadError);
            },
            GetMailMergeLoader: function () {
                if (Sage.Services.hasService("MailMergeServiceLoader")) {
                    return Sage.Services.getService("MailMergeServiceLoader");
                }
                return null;
            },
            GetMailMergeService: function (showLoadError) {
                var bShowError = true;
                if (typeof showLoadError === "boolean") {
                    bShowError = showLoadError;
                }
                if (Sage && Sage.Services && Sage.gears && Sage.gears.factory && Sage.Services.hasService("MailMergeService")) {
                    return Sage.Services.getService("MailMergeService");
                } else {
                    if (bShowError) {
                        Dialogs.showError(dString.substitute("${0} ${1}", [this.DesktopErrors().MailMergeServiceLoad, this.DesktopErrors().SageGearsObjectError]));
                    }
                }
                return null;
            },
            IsSageGearsObjectError: function (err) {
                if (err) {
                    var sNonLocalizedError = "The specified class name cannot be mapped to a COM object"; //DNL
                    var sLocalizedError = this.DesktopErrors().SageGearsClassError;
                    if ((dojo.isIE && (err.number == -2146827287)) || (err.message.indexOf(sNonLocalizedError) != -1) || (err.message.indexOf(sLocalizedError) != -1)) {
                        return true;
                    }
                }
                return false;
            },
            MailMergeInfoStore: function () {
                if (this.infoStore != null) {
                    return this.infoStore;
                } else {
                    var sPath = Sage.MailMerge.Loader.prototype.GetClientPath();
                    if (sPath != null) {
                        var sUrl = dString.substitute("${0}/SLXMailMergeClient.ashx?method=GetInfoStore", [sPath]);
                        var oMailMergeObject = this.GetMailMergeLoader().DecodeMailMergeJsonFromUrl(sUrl);
                        if (oMailMergeObject != null) {
                            this.infoStore = oMailMergeObject;
                            return this.infoStore;
                        }
                    }
                }
                return null;
            }
        });

        dLang.mixin(Sage.MailMerge.Helper, nls);

        window.WriteAction = {
            waWriteAddressLabels: 0,
            waWriteEmail: 1,
            waWriteEmailUsing: 2,
            waWriteEmailUsingMore: 3,
            waWriteFaxUsing: 4,
            waWriteFaxUsingMore: 5,
            waWriteLetterUsing: 6,
            waWriteLetterUsingMore: 7,
            waWriteMailMerge: 8,
            waWriteTemplates: 9
        };

        return Sage.MailMerge.Helper;
    }
);

