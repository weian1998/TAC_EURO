/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
// ReSharper disable UnusedParameter

define([
    "Sage/UI/Dialogs",
    "dijit/_Widget",
    "dojo/i18n",
    "dojo/string",
    "dojo/_base/lang",
    "dojo/i18n!./nls/Service",
    "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function (Dialogs, _Widget, i18n, dString, dLang, nls, declare) {
        // ReSharper restore InconsistentNaming
        //dojo.requireLocalization("Sage.Reporting", "Service");
        var oReportingService = declare("Sage.Reporting.Service", [_Widget], {
            defaultDetailReports: null,
            defaultReport: null,
            reportingInfo: null,
            reportJob: null,
            reportsHttpHandler: "SLXReportManager.aspx?method=",
            constructor: function () {
                this.inherited(arguments);
                this.defaultDetailReports = null;
                this.defaultReport = null;
                this.reportingInfo = null;
                this.reportJob = null;
            },
            postMixInProperties: function () {
                dLang.mixin(this, nls);
                this.inherited(arguments);
            },
            _initReportingInfo: function () {
                if (this.reportingInfo == null) {
                    var self = this;
                    dojo.xhrGet({
                        url: "SLXReportsHelper.ashx?method=GetReportingInfo",
                        handleAs: "json",
                        preventCache: true,
                        sync: true,
                        load: function (info, ioargs) {
                            if (dojo.isObject(info) && typeof info.IsDebuggingEnabled !== "undefined") {
                                self.reportingInfo = info;
                            }
                        },
                        error: function (response, ioargs) {
                            if (typeof console !== "undefined") {
                                var sMsg = dString.substitute("${0} ${1} (${2})", [self.reportingInfoError, ioargs.xhr.statusText, ioargs.xhr.status]);
                                console.error("Error: %o; ioargs: %o", sMsg, ioargs); //DNL
                                console.debug("The built-in reporting information will be used."); //DNL
                            }
                            self.reportingInfo = { "IsDebuggingEnabled": false, "RemoteInfo": { "Arg1": "", "Arg2": "", "Arg3": "", "Arg4": "", "Arg5": 0, "Remote": false, "UseActiveReporting": false} };
                        }
                    });
                }
            },
            _initReports: function () {
                if (this.defaultDetailReports == null) {
                    var self = this;
                    dojo.xhrGet({
                        url: "slxdata.ashx/slx/crm/-/useroptions/Reporting/DefaultDetailReports",
                        handleAs: "json",
                        preventCache: true,
                        sync: true,
                        load: function (option, ioargs) {
                            if (dojo.isObject(option) && typeof option.optionValue !== "undefined" && option.optionValue != "") {
                                var obj = dojo.fromJson(option.optionValue);
                                if (obj && typeof obj.defaultDetailReports !== "undefined" && dojo.isArray(obj.defaultDetailReports)) {
                                    dojo.mixin(self, obj);
                                }
                            }
                        },
                        error: function (response, ioargs) {
                            if (typeof console !== "undefined") {
                                console.debug("Error in _initReports()"); //DNL
                                console.error(ioargs);
                                console.debug("The built-in default reports will be used."); //DNL
                            }
                        }
                    });
                }
                if (this.defaultDetailReports == null) {
                    this.defaultDetailReports = [
                        {
                            "maintable": "ACCOUNT",
                            "family": "Account",
                            "name": "Account Detail"
                        },
                        {
                            "maintable": "CONTACT",
                            "family": "Contact",
                            "name": "Contact Detail"
                        },
                        {
                            "maintable": "OPPORTUNITY",
                            "family": "Opportunity",
                            "name": "Opportunity Detail"
                        },
                        {
                            "maintable": "DEFECT",
                            "family": "Defect",
                            "name": "Support Defect"
                        },
                        {
                            "maintable": "TICKET",
                            "family": "Ticket",
                            "name": "Support Ticket"
                        },
                        {
                            "maintable": "SALESORDER",
                            "family": "Sales Order",
                            "name": "Sales Order Detail"
                        }
                    ];
                }
            },
            _resetReportJob: function (reportid, keyfield, wsql, sqlqry) {
                var oReportJob = this.newReportJob();
                oReportJob.keyfield = keyfield || "";
                oReportJob.pluginid = reportid || "";
                oReportJob.rsf = "";
                oReportJob.sortdirections = "";
                oReportJob.sortfields = "";
                oReportJob.sqlqry = sqlqry || "";
                oReportJob.wsql = wsql || "";
                this.reportJob = oReportJob;
            },
            _showReport: function () {
                if (!this.isValidString(this.getReportingUrl()) && !this.useActiveReporting()) {
                    Dialogs.showError(this.getDisplayError(this.invalidReportingServerError));
                    return;
                }
                if (!this.useActiveReporting()) {
                    var sToolbar = (this.isDebuggingEnabled()) ? "yes" : "no";
                    var iWidth = 800;
                    var iHeight = 600;
                    var sUrl = dString.substitute("location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,titlebar=no,toolbar=${options.toolbar},width=${options.width},height=${options.height}",
                        { options: { "toolbar": sToolbar, "width": iWidth, "height": iHeight} });
                    window.open("ShowReport.aspx", "ShowReportViewer", sUrl);
                } else {
                    if (Sage && !Sage.gears) {
                        if (typeof initGears === "function") {
                            initGears();
                        }
                    }

                    if (!Sage || !Sage.gears || !Sage.gears.factory) {
                        Dialogs.showError(this.getDisplayError(this.sageGearsError));
                        return;
                    }

                    var oSlxReportViewer;
                    try {
                        var oComFactory = Sage.gears.factory.create("com.factory");
                        oSlxReportViewer = oComFactory.newActiveXObject("SLXCRV.CRViewer");
                    } catch (err) {
                        Dialogs.showError(this.getDisplayError(this.crystalActiveXViewerUnavailable + " " + err.message));
                        return;
                    }

                    if (oSlxReportViewer.IsCrystalViewerInstalled() == false) {
                        Dialogs.showError(this.getDisplayError(this.crystalActiveXViewerNotInstalled));
                        return;
                    }

                    if (oSlxReportViewer.IsCrystalReportsRunTimeInstalled() == false) {
                        Dialogs.showError(this.getDisplayError(this.crystalActiveXDesignerNotInstalled));
                        return;
                    }

                    oSlxReportViewer.ShowReport(
                        this.reportingInfo.RemoteInfo.Arg1,
                        this.reportingInfo.RemoteInfo.Arg2,
                        this.reportingInfo.RemoteInfo.Arg5,
                        false,
                        this.reportJob.ss,
                        this.reportJob.keyfield,
                        this.reportingInfo.RemoteInfo.Arg3,
                        this.reportJob.pluginid,
                        this.reportJob.rsf,
                        this.reportJob.sortdirections,
                        this.reportJob.sortfields,
                        this.reportJob.sqlqry,
                        this.reportJob.wsql,
                        this.reportingInfo.RemoteInfo.Arg4
                    );
                }
            },
            checkReporting: function (showError) {
                if (!this.isValidString(this.getReportingUrl()) && !this.useActiveReporting()) {
                    if (typeof showError === "boolean" && showError) {
                        Dialogs.showError(this.getDisplayError(this.invalidReportingServerError));
                    }
                    return false;
                }
                return true;
            },
            getAccountReport: function () {
                return this.getReport("ACCOUNT");
            },
            getContactReport: function () {
                return this.getReport("CONTACT");
            },
            getCurrentContext: function () {
                var result = { "tablename": "", "entityid": "" };
                if (Sage.Services.hasService("ClientEntityContext")) {
                    var oService = Sage.Services.getService("ClientEntityContext");
                    if (!oService) return result;
                    var oContext = oService.getContext();
                    /* NOTE: The EntityTableName property is [not] always defined for ClientEntityContext (depends on context). */
                    if (!oContext || typeof oContext.EntityTableName === "undefined") return result;
                    result.tablename = oContext.EntityTableName.toUpperCase();
                    result.entityid = oContext.EntityId;
                }
                return result;
            },
            getCurrentReport: function () {
                var oContext = this.getCurrentContext();
                if (oContext.tablename == "" || oContext.entityid == "") return null;
                switch (oContext.tablename) {
                    case "ACCOUNT":
                        return this.getAccountReport();
                    case "CONTACT":
                        return this.getContactReport();
                    case "OPPORTUNITY":
                        return this.getOpportunityReport();
                    case "DEFECT":
                        return this.getDefectReport();
                    case "SALESORDER":
                        return this.getSalesOrderReport();
                    case "TICKET":
                        return this.getTicketReport();
                    default:
                        return this.getDefaultReport();
                }
            },
            getDefaultReport: function () {
                return this.defaultReport;
            },
            getDefectReport: function () {
                return this.getReport("DEFECT");
            },
            getDisplayError: function (msg) {
                return dString.substitute("${0} ${1}", [this.reportCannotBeShownError, msg]);
            },
            getOpportunityReport: function () {
                return this.getReport("OPPORTUNITY");
            },
            getReport: function (maintable) {
                this._initReports();
                var result = null;
                if (this.isValidString(maintable) && dojo.isObject(this.defaultDetailReports)) {
                    dojo.some(this.defaultDetailReports, function (report) {
                        if (report.maintable.toUpperCase() == maintable.toUpperCase()) {
                            var sReport = dString.substitute("${0}:${1}", [report.family, report.name]);
                            result = sReport;
                            return true;
                        } else {
                            return false;
                        }
                    });
                }
                return result;
            },
            getReportFilters: function (reportId, onSuccess, onError) {
                dojo.xhrGet({
                    url: dString.substitute("${0}reportfilterlist&reportid=${1}", [this.reportsHttpHandler, reportId]),
                    preventCache: true,
                    handleAs: "text",
                    sync: false,
                    load: function (response, ioargs) {
                        onSuccess(response);
                    },
                    error: function (response, ioargs) {
                        if (typeof onError === "function") {
                            onError(response);
                            return;
                        }
                        Dialogs.showError(response.statusText);
                    }
                });
            },
            getReportId: function (value) {
                var result = null;
                if (this.isValidString(value)) {
                    /* Do we have a FAMILY:NAME value? */
                    if (value.indexOf(":") != -1) {
                        dojo.xhrGet({
                            url: "SLXReportsHelper.ashx?method=GetReportId&report=" + encodeURIComponent(value),
                            handleAs: "text",
                            preventCache: true,
                            sync: true,
                            load: function (data, ioargs) {
                                result = data;
                            },
                            error: function (response, ioargs) {
                                if (typeof console !== "undefined") {
                                    console.error(ioargs);
                                }
                            }
                        });
                    } else {
                        /* Does it look like we already have a plugin ID? */
                        if (value.length == 12) {
                            result = value;
                        }
                    }
                }
                return result;
            },
            getReportingUrl: function () {
                if (Sage.Services.hasService("ClientContextService")) {
                    var oService = Sage.Services.getService("ClientContextService");
                    if (oService) {
                        /* Data from ServiceHosts.xml is loaded into the client context within ServiceHostsModule.cs. */
                        var sSlxWebRpt = "SLXWEBRPT"; /*DNL*/
                        if (oService.containsKeyEx(sSlxWebRpt, true)) {
                            var sUrl = oService.getValueEx(sSlxWebRpt, true);
                            if (this.isValidString(sUrl)) {
                                var sLastChar = sUrl.charAt(sUrl.length - 1);
                                if (sLastChar == "/") {
                                    sUrl = sUrl.substring(0, sUrl.length - 1);
                                }
                                return dString.substitute("${0}/SLXWebReportingServer.ashx?method=GenerateReport", [sUrl]);
                            }
                        }
                    }
                }
                return null;
            },
            getSalesOrderReport: function () {
                return this.getReport("SALESORDER");
            },
            getTicketReport: function () {
                return this.getReport("TICKET");
            },
            isDebuggingEnabled: function () {
                this._initReportingInfo();
                if (this.reportingInfo) {
                    return this.reportingInfo.IsDebuggingEnabled;
                }
                return false;
            },
            isValidString: function (s) {
                return dojo.isString(s) && s != "";
            },
            newReportJob: function () {
                var ss = "0";
                var sUrl = this.getReportingUrl();
                if (this.isValidString(sUrl)) {
                    ss = sUrl.toUpperCase().indexOf("HTTPS") == -1 ? "0" : "1";
                }
                var result = {
                    "keyfield": "",
                    "pluginid": "",
                    "rsf": "",
                    "sortdirections": "",
                    "sortfields": "",
                    "sqlqry": "",
                    "ss": ss,
                    "url": sUrl,
                    "wsql": ""
                };
                return result;
            },
            parseReport: function (value) {
                if (this.isValidString(value)) {
                    var arrValues = value.split(":");
                    if (dojo.isArray(arrValues) && arrValues.length == 2) {
                        return { "family": arrValues[0], "name": arrValues[1] };
                    }
                }
                return null;
            },
            saveDefaultReports: function (onSuccess, onError) {
                if (dojo.isObject(this.defaultDetailReports)) {
                    var oUserOptions = Sage.Services.getService("UserOptions");
                    if (oUserOptions) {
                        var fnSuccess = function (response) {
                            if (typeof onSuccess === "function") {
                                onSuccess(response);
                            }
                        };
                        var fnError = function (response) {
                            if (typeof console !== "undefined") {
                                console.error("saveDefaultReports: %o", response);
                            }
                            if (typeof onError === "function") {
                                onError(response);
                            }
                        };
                        var oDefaultReports = { "defaultDetailReports": this.defaultDetailReports };
                        var sDefaultReports = dojo.toJson(oDefaultReports);
                        if (typeof console !== "undefined") {
                            console.debug("sDefaultReports: %o", sDefaultReports);
                        }
                        oUserOptions.set("DefaultDetailReports", "Reporting", sDefaultReports, fnSuccess, fnError);
                    }
                }
            },
            setAccountReport: function (value) {
                this.setReport(value, "ACCOUNT");
            },
            setContactReport: function (value) {
                this.setReport(value, "CONTACT");
            },
            setDefaultReport: function (value) {
                this.defaultReport = value;
            },
            setDefectReport: function (value) {
                this.setReport(value, "DEFECT");
            },
            setOpportunityReport: function (value) {
                this.setReport(value, "OPPORTUNITY");
            },
            setReport: function (value, maintable) {
                var report = this.parseReport(value);
                if (report != null) {
                    var sMainTable = maintable || report.family.toUpperCase();
                    this.setReportEx(sMainTable, report.family, report.name);
                }
            },
            setReportEx: function (maintable, family, name) {
                this._initReports();
                if (this.isValidString(maintable) && this.isValidString(family) && this.isValidString(name) && dojo.isObject(this.defaultDetailReports)) {
                    var bFound = dojo.some(this.defaultDetailReports, function (report) {
                        if (report.maintable.toUpperCase() == maintable.toUpperCase()) {
                            report.family = family;
                            report.name = name;
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if (!bFound) {
                        // Not found?                    
                        var oReport = { "maintable": maintable, "family": family, "name": name };
                        this.defaultDetailReports.push(oReport);
                    }
                }
            },
            setReportJob: function (reportId, tableName, entityId) {
                var sWSql;
                var sKeyField = tableName + "." + tableName + "ID";
                var sSqlQry = "SELECT " + sKeyField + " FROM " + tableName;
                if (entityId.indexOf(",") == -1) {
                    sWSql = "(" + sKeyField + " = '" + entityId + "')";
                } else {
                    var arrIds = entityId.split(",");
                    var sIds = "'" + arrIds.join("','") + "'";
                    sWSql = "(" + sKeyField + " IN (" + sIds + "))";
                }
                this._resetReportJob(reportId, sKeyField, sWSql, sSqlQry);
            },
            setSalesOrderReport: function (report) {
                this.setReport(value, "SALESORDER");
            },
            setTicketReport: function (value) {
                this.setReport(value, "TICKET");
            },
            showDefaultReport: function () {
                var sDetailReport = this.getCurrentReport();
                if (this.isValidString(sDetailReport)) {
                    this.showReportViewerInContext(this.getReportId(sDetailReport));
                } else {
                    Dialogs.showError(this.getDisplayError(this.noDefaultReportError));
                }
            },
            showReport: function (reportNameOrId, tableName, entityId) {
                this.showReportViewer(this.getReportId(reportNameOrId), tableName, entityId);
            },
            showReportEx: function (reportJob) {
                this.reportJob = reportJob;
                this._showReport();
            },
            showReportById: function (reportId) {
                this.showReportViewerInContext(reportId);
            },
            showReportByName: function (reportName) {
                this.showReportViewerInContext(this.getReportId(reportName));
            },
            showReportViewer: function (reportId, tableName, entityId) {
                if (typeof console !== "undefined") {
                    console.debug("showReportViewer(reportId=%o, tableName=%o, entityId=%o)", reportId, tableName, entityId);
                }
                if (!this.isValidString(reportId)) {
                    Dialogs.showError(this.getDisplayError(this.invalidReportPluginError));
                    return;
                }
                if (!this.isValidString(tableName)) {
                    Dialogs.showError(this.getDisplayError(this.invalidTableNameError));
                    return;
                }
                if (!this.isValidString(entityId)) {
                    Dialogs.showError(this.getDisplayError(this.invalidEntityError));
                    return;
                }
                this.setReportJob(reportId, tableName, entityId);
                this._showReport();
            },
            showReportViewerInContext: function (reportId) {
                var oContext = this.getCurrentContext();
                if (typeof console !== "undefined") {
                    console.debug("showReportViewerInContext(%o): oContext = %o", reportId, oContext);
                }
                this.showReportViewer(reportId, oContext.tablename, oContext.entityid);
            },
            useActiveReporting: function () {
                this._initReportingInfo();
                if (this.reportingInfo) {
                    return (this.reportingInfo.RemoteInfo.Remote && this.reportingInfo.RemoteInfo.UseActiveReporting);
                }
                return false;
            }
        });

        if (!Sage.Services.hasService("ReportingService")) {
            Sage.Services.addService("ReportingService", new Sage.Reporting.Service());
        }

        return oReportingService;
    }
);
