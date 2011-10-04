/*
 * Sage SalesLogix Mail Merge
 * Copyright(c) 2010, Sage Software.
 * 
 * 
 */



var WriteAction = {
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

Sage.MailMergeServiceLoader = function() {
    this.ready = false;
};

Sage.MailMergeServiceLoader.prototype.AddAsScriptElement = function(src) {
    var oScript = document.createElement("script");
    oScript.setAttribute("id", "sage_mailmerge_script");
    oScript.type = "text/javascript";
    oScript.language = "JavaScript";
    oScript.src = src;
    var oHead = document.getElementsByTagName("head");
    if (oHead && oHead.length > 0) {
        oHead[0].appendChild(oScript);
        return true;
    }
    return false;
};

Sage.MailMergeServiceLoader.prototype.DownloadScript = function(src) {
    var sPath = this.GetClientPath();
    if (sPath != null) {
        var sUrl = String.format("{0}/{1}", sPath, src);
        var oXmlHttp = this.GetHttpRequest();
        if (oXmlHttp != null) {
            try {
                oXmlHttp.open("GET", sUrl, false);
                oXmlHttp.send(null);
                if (!oXmlHttp.getResponseHeader("Date")) {
                    var oCachedXmlHttp = oXmlHttp;
                    var sLastModified = oCachedXmlHttp.getResponseHeader("Last-Modified") || "Thu, 01 Jan 1970 00:00:00 GMT";
                    oXmlHttp = this.GetHttpRequest();
                    oXmlHttp.open("GET", sUrl, false);
                    oXmlHttp.setRequestHeader("If-Modified-Since", sLastModified);
                    oXmlHttp.send(null);
                }
                return oXmlHttp.status;
            }
            catch (err) {
            }
        }
    }
    return 0;
};

Sage.MailMergeServiceLoader.prototype.GetClientPath = function() {
    var sLocation = String(window.location);
    var iIndex = sLocation.lastIndexOf("/");
    if (iIndex != -1) {
        return sLocation.substring(0, iIndex);
    }
    return null;
};

Sage.MailMergeServiceLoader.prototype.GetHttpRequest = function() {
    return (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
};

Sage.MailMergeServiceLoader.prototype.LoadMailMerge = function() {
    var NOTFOUND = 404;
    
    if (!this.MailMergeScriptExists()) {
        var bIsDebuggingEnabled = MailMergeInfoStore().IsDebuggingEnabled;
        var sDebug = (bIsDebuggingEnabled) ? "-debug" : "";
        var sScript = "jscript/sage-mailmerge/sage-mailmerge{0}.js";
        var sSource = String.format(sScript, sDebug);
        var iStatusCode = this.DownloadScript(sSource);
        if (iStatusCode == NOTFOUND) {
            if (bIsDebuggingEnabled) {
                
                sSource = String.format(sScript, "");
                iStatusCode = this.DownloadScript(sSource);
                
            }
        }
        if (document.body == null) {
            try {
                var sUrl = String.format("<script id='sage_mailmerge_script' src='{0}' type='text/javascript'><" + "/script>", sSource);
                document.write(sUrl);
            } catch (err) {
                if (!this.AddAsScriptElement(sSource)) {
                    throw new Error(String.format(DesktopErrors().AddScriptFailed, sSource));
                }
            }
        } else {
            if (!this.AddAsScriptElement(sSource)) {
                throw new Error(String.format(DesktopErrors().AddScriptFailed, sSource));
            }
        }
    }
    this.ready = (this.MailMergeScriptExists());
};

Sage.MailMergeServiceLoader.prototype.MailMergeScriptExists = function() {
    var oScript = $get("sage_mailmerge_script");
    return (oScript != null);
};

var AttachWriteMenuPopulator_Count = 0;

function AttachWriteMenuPopulator() {
    if (typeof ToolBarMenuData != "undefined") {
        var oToolbar = Ext.ComponentMgr.get("maintoolbar");
        if (oToolbar) {
            var sPath = Sage.MailMergeServiceLoader.prototype.GetClientPath();
            if (sPath != null) {
                var sUrl = String.format("{0}/SLXMailMergeClient.ashx?method=GetResource&id=0", sPath);
                var oMailMergeResource = DecodeMailMergeJsonFromUrl(sUrl);
                if (oMailMergeResource != null) {
                    var sWrite = oMailMergeResource.Write;                    
                    for (var i = 0; i < oToolbar.items.length; i++) {
                        var oItem = oToolbar.items.items[i];
                        if (oItem.text == sWrite) {
                            if (oItem.menu.items.items.length > 0) {
                                
                                oItem.menu.items.items[0].addListener("beforerender", PopulateWriteMenu);
                            }
                            return;
                        }
                    }
                }
            }
        }
    }
    
    if (AttachWriteMenuPopulator_Count == 0) {
        AttachWriteMenuPopulator_Count++;
        window.setTimeout("AttachWriteMenuPopulator();", 500);
    }
}

function DecodeMailMergeJsonFromUrl(url) {
    var oXmlHttp = Sage.MailMergeServiceLoader.prototype.GetHttpRequest();
    if (oXmlHttp != null) {
        oXmlHttp.open("GET", url, false);
        oXmlHttp.send(null);
        var sContentType = oXmlHttp.getResponseHeader("Content-Type");
        if (sContentType.indexOf("application/json") != -1) {
            var sJsonResponse = oXmlHttp.responseText;
            if (!Ext.isEmpty(sJsonResponse)) {
                sJsonResponse = sJsonResponse.replace(/":null/gi, "\":\"\"");
                var oMailMergeObject = Ext.util.JSON.decode(sJsonResponse);
                if (oMailMergeObject != null) {
                    return oMailMergeObject;
                }
            }
        }
    }
    Ext.Msg.show({ title: "Sage SalesLogix", msg: "The call to DecodeMailMergeJsonFromUrl() failed.", buttons: Ext.Msg.OK, icon: Ext.MessageBox.ERROR });   
    return null;
}

var gDesktopErrors = null;

function DesktopErrors() {
    if (gDesktopErrors != null) {
        return gDesktopErrors;
    }
    else {
        var sPath = Sage.MailMergeServiceLoader.prototype.GetClientPath();
        if (sPath != null) {
            var sUrl = String.format("{0}/SLXMailMergeClient.ashx?method=GetDesktopErrors", sPath);
            var oDesktopErrors = DecodeMailMergeJsonFromUrl(sUrl);
            if (oDesktopErrors != null) {
                gDesktopErrors = oDesktopErrors;
                return gDesktopErrors;
            }
        }
    }
    Ext.Msg.show({ title: "Sage SalesLogix", msg: "The call to DesktopErrors() failed.", buttons: Ext.Msg.OK, icon: Ext.MessageBox.ERROR }); 
    return null;
}


function ExecuteWriteAction(writeAction, param) {
    try {
        var oService = GetMailMergeService();
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
    }
    catch (err) {
        var sXtraMsg = "";
        if (IsSageGearsObjectError(err)) {
            sXtraMsg = DesktopErrors().SageGearsObjectError;
        }
        var sError = (Ext.isFunction(err.toMessage)) ? err.toMessage(sXtraMsg, MailMergeInfoStore().ShowJavaScriptStack) : err.message;
        Ext.Msg.show({
            title: "Sage SalesLogix",
            msg: String.format(DesktopErrors().WriteActionError, sError),
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    }
}

function GetMailMergeService(showServiceLoadError) {
    
    if (Sage && Sage.Services && Sage.gears && Sage.gears.factory) {
        if (Sage.Services.hasService("MailMergeService")) {
            return Sage.Services.getService("MailMergeService");
        }
        else {
            try {
                if (LoadMailMerge()) {
                    var oService = Sage.Services.getService("MailMergeService");
                    if (oService) {
                        return oService;
                    }
                    else {
                        var oComFactory = Sage.gears.factory.create("com.factory");
                        var oMailMergeGUI = oComFactory.newActiveXObject("SLXMMGUIW.MailMergeGUI");
                        var iStartTickCount = oMailMergeGUI.GetTickCount();
                        var iCurrentTickCount = iStartTickCount;
                        var iMaxTimeout = (1 * 1000 * 15); 
                        while (oService == null) {
                            oService = Sage.Services.getService("MailMergeService");
                            oMailMergeGUI.ProcessMessages();
                            oMailMergeGUI.Sleep(50);
                            iCurrentTickCount = oMailMergeGUI.GetTickCount();
                            if ((iCurrentTickCount - iStartTickCount) > iMaxTimeout) {
                                Ext.Msg.show({
                                    title: "Sage SalesLogix",
                                    msg: DesktopErrors().TimedOutWaiting,
                                    buttons: Ext.Msg.OK,
                                    icon: Ext.MessageBox.ERROR
                                });
                                return null;
                            }
                        }
                        return oService;
                    }
                }
            }
            catch (err) {
                var sXtraMsg = "";
                if (IsSageGearsObjectError(err)) {
                    sXtraMsg = DesktopErrors().SageGearsObjectError;
                }
                var sError = (Ext.isFunction(err.toMessage)) ? err.toMessage(sXtraMsg, MailMergeInfoStore().ShowJavaScriptStack) : err.message;
                Ext.Msg.show({
                    title: "Sage SalesLogix",
                    msg: String.format(DesktopErrors().GetMailMergeServiceError, sError),
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        }
    }
    else {
        var bShowError = true;
        if (typeof showServiceLoadError !== "undefined" &&
            Ext.isBoolean(showServiceLoadError) && (showServiceLoadError == false)) {
            bShowError = false;
        }
        if (bShowError) {
            Ext.Msg.show({
                title: "Sage SalesLogix",
                msg: String.format("{0} {1}", DesktopErrors().MailMergeServiceLoad, DesktopErrors().SageGearsObjectError),
                buttons: Ext.Msg.OK,
                icon: Ext.MessageBox.ERROR
            });
        }        
    }
    return null;
}

function InitMailMergeServiceLoader() {
    if (Ext.isWindows && Sage && Sage.Services) {
        if (!Sage.gears) {
            if (typeof initGears === "function") {
                initGears();
            }
        }
        if (Sage.gears && Sage.gears.factory) {
            if (!Sage.Services.hasService("MailMergeServiceLoader")) {
                Sage.Services.addService("MailMergeServiceLoader", new Sage.MailMergeServiceLoader());
            }
            AttachWriteMenuPopulator();
            return;
        }
    }
    try {
        if (!Sage.gears) {
            if (window.console) {
                console.log("Sage.gears was [not] found."); 
            }
        }
        if (Sage.gears && !Sage.gears.factory) {
            if (window.console) {
                console.log("Sage.gears.factory was [not] found."); 
            }
        }
    } catch (e) {
    }
    RemoveWriteMenu();
}

function IsSageGearsObjectError(err) {
    if (err) {
        var NON_LOCALIZED_SAGEGEARSCLASSERROR = "The specified class name cannot be mapped to a COM object"; //DNL
        var LOCALIZED_SAGEGEARSCLASSERROR = DesktopErrors().SageGearsClassError;
        if ((Ext.isIE && (err.number == -2146827287)) || (err.message.indexOf(NON_LOCALIZED_SAGEGEARSCLASSERROR) != -1) || (err.message.indexOf(LOCALIZED_SAGEGEARSCLASSERROR) != -1)) {
            return true;
        }
    }
    return false;
}

function LoadMailMerge() {
    if (Sage && Sage.Services && Sage.Services.hasService("MailMergeServiceLoader")) {
        var oService = Sage.Services.getService("MailMergeServiceLoader");
        if (oService) {
            if (!oService.ready) {
                oService.LoadMailMerge();
            }
            return oService.ready;
        }
    }
    return false;
}

var gMailMergeInfoStore = null;

function MailMergeInfoStore() {
    if (gMailMergeInfoStore != null) {
        return gMailMergeInfoStore;
    }
    else {        
        var sPath = Sage.MailMergeServiceLoader.prototype.GetClientPath();
        if (sPath != null) {
            var sUrl = String.format("{0}/SLXMailMergeClient.ashx?method=GetInfoStore", sPath);
            var oMailMergeObject = DecodeMailMergeJsonFromUrl(sUrl);
            if (oMailMergeObject != null) {
                gMailMergeInfoStore = oMailMergeObject;
                return gMailMergeInfoStore;
            }
        }
    }
    Ext.Msg.show({ title: "Sage SalesLogix", msg: "The call to MailMergeInfoStore() failed.", buttons: Ext.Msg.OK, icon: Ext.MessageBox.ERROR }); 
    return null;    
}

function PopulateWriteMenu() {
    var oService = GetMailMergeService();
    if (oService) {
        if (!oService.MenuPopulated) {
            oService.PopulateWriteMenu();
        }
    }
}

var RemoveWriteMenu_Count = 0;

function RemoveWriteMenu() {
    if (typeof ToolBarMenuData != "undefined") {
        var oToolbar = Ext.ComponentMgr.get("maintoolbar");
        if (oToolbar) {
            var sPath = Sage.MailMergeServiceLoader.prototype.GetClientPath();
            if (sPath != null) {
                var sUrl = String.format("{0}/SLXMailMergeClient.ashx?method=GetResource&id=0", sPath);
                var oMailMergeResource = DecodeMailMergeJsonFromUrl(sUrl);
                if (oMailMergeResource != null) {
                    var sWrite = oMailMergeResource.Write;
                    for (var i = 0; i < oToolbar.items.length; i++) {
                        var oItem = oToolbar.items.items[i];
                        if (oItem.text == sWrite) {
                            oItem.hide();
                            return;
                        }
                    }
                }
            }
        }
    }
    
    if (RemoveWriteMenu_Count == 0) {
        RemoveWriteMenu_Count++;
        window.setTimeout("RemoveWriteMenu();", 500);
    }
}

YAHOO.util.Event.addListener(window, "load", InitMailMergeServiceLoader);
