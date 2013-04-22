/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/* -------------------------------------------------------------------------                  
Sage SalesLogix Desktop Integration
Sage.MailMerge.Service and Sage.SelectEmailInfo
Copyright(c) 2010-2011, Sage Software                         
   
This service class is used to access mail merge services, including the
mail merge application programming interface.
------------------------------------------------------------------------- */

/*  Important: The COM event handlers (see ConnectEvents) do not have
    access to the instance of this class (i.e. [this.] will be *not* be
    an instance of Sage.MailMerge.Service (it wil be DispHTMLWindow2 in IE).
    This is because of the way the event handlers are called by Sage Gears.
    Use the following to gain access to the current instance of the
    MailMerge.Service within the event handlers:
    var oService = Helper.GetMailMergeService(); 
    Alternatively, you may access MailMerge.Service methods statically
    (where instance data is not required). */

// ReSharper disable InconsistentNaming

define([
        "Sage/Link",
        "Sage/MailMerge/Context",
        "Sage/MailMerge/Helper",
        "Sage/MailMerge/Lookup",
        "Sage/UI/Dialogs",
        "Sage/UI/MenuBar",
        "Sage/UI/MenuItem",
        "Sage/UI/PopupMenuBarItem",
        "Sage/Utility",
        "dijit/_Widget",
        "dijit/MenuSeparator",
        "dojo/i18n",
        "dojo/string",
        "dojox/json/ref",
        "dojox/validate/regexp",
        "dojo/_base/lang",
        "dojo/i18n!./nls/Service",
        "Sage/Services/ActivityService",
        "dojo/_base/declare"
    ],
    function (Link, Context, Helper, Lookup, Dialogs, MenuBar, MenuItem, PopupMenuBarItem, Utility,
        _Widget, MenuSeparator, i18n, dString, ref, regexp, dLang, nls, activityService, declare) {
        var oMailMergeService = declare("Sage.MailMerge.Service", [_Widget], {
            constructor: function () {
                this.inherited(arguments);
                this.__ExcelInstalled = null;
                this.__Initialized = false;
                this.__MailMerge = null;
                this.__MailMergeCookies = null;
                this.__MailMergeGUI = null;
                this.__ProgressDlg = null;
                this.__TemplateEditor = null;
                this.__MenuPopulated = false;
                this.LastReport = null;
            },
            postMixInProperties: function () {
                dLang.mixin(this, nls);
                this.inherited(arguments);
            },
            ConnectEvents: function (obj, which) {
                switch (which) {
                    case WhichEvents.weAddressLabels:
                        obj.OnPrint = this.HandleOnPrintAddressLabels;
                        obj.OnRequestCrystalReport = this.HandleOnRequestCrystalReport;
                        obj.OnRequestGroupInfoEx = this.HandleOnRequestGroupInfoEx;
                        obj.OnRequestGroups = this.HandleOnRequestGroups;
                        break;
                    case WhichEvents.weMailMergeEngine:
                        obj.OnCancel = this.HandleOnCancelMailMerge;
                        obj.OnCustomFieldName = this.HandleOnCustomFieldName;
                        obj.OnHideProgress = this.HandleOnHideProgress;
                        obj.OnOutputDebug = this.HandleOnOutputDebug;
                        obj.OnRequestCompleteFax = this.HandleOnRequestCompleteFax;
                        obj.OnRequestCompleteLetter = this.HandleOnRequestCompleteLetter;
                        obj.OnRequestCreateAdHocGroup = this.HandleOnRequestCreateAdHocGroup;
                        obj.OnRequestCrystalReport = this.HandleOnRequestCrystalReport;
                        obj.OnRequestData = this.HandleOnRequestData;
                        obj.OnRequestEditAfter = this.HandleOnRequestEditAfter;
                        obj.OnRequestEditDocument = this.HandleOnRequestEditDocument;
                        obj.OnRequestFaxOptions = this.HandleOnRequestFaxOptions;
                        obj.OnRequestFormat = this.HandleOnRequestFormat;
                        obj.OnRequestGroupInfoEx = this.HandleOnRequestGroupInfoEx;
                        obj.OnRequestPrintAddressLabels = this.HandleOnRequestPrintAddressLabels;
                        obj.OnRequestScheduleFollowUp = this.HandleOnRequestScheduleFollowUp;
                        obj.OnRequestSelectAddressType = this.HandleOnRequestSelectAddressType;
                        obj.OnRequestViewGroup = this.HandleOnRequestViewGroup;
                        obj.OnSelectPrinter = this.HandleOnSelectPrinter;
                        obj.OnShowProgress = this.HandleOnShowProgress;
                        break;
                    case WhichEvents.weMailMerge:
                        obj.OnMerge = this.HandleOnMerge;
                        obj.OnMergePreview = this.HandleOnPreview;
                        obj.OnRequestAlarmLeadInfo = this.HandleOnRequestAlarmLeadInfo;
                        obj.OnRequestCrystalReport = this.HandleOnRequestCrystalReport;
                        obj.OnRequestGroupInfoEx = this.HandleOnRequestGroupInfoEx;
                        obj.OnRequestGroups = this.HandleOnRequestGroups;
                        obj.OnRequestLeaders = this.HandleOnRequestUsers;
                        obj.OnRequestRebuildSchema = this.HandleOnRequestRebuildSchema;
                        break;
                    case WhichEvents.weProgressDlg:
                        obj.OnCancel = this.HandleOnCancelProgress;
                        break;
                    case WhichEvents.weTemplateEditor:
                        obj.OnRequestLeaders = this.HandleOnRequestUsers;
                        obj.OnRequestRebuildSchema = this.HandleOnRequestRebuildSchema;
                        obj.OnShowPreview = this.HandleOnPreview;
                        break;
                    default:
                        throw new Error(Helper.DesktopErrors().ConnectEventsError);
                }
            },
            HandleOnCancelProgress: function () {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("The user initiated a cancel request and will be prompted for verification (when [not] merging silently)."); /*DNL*/
                }
            },
            HandleOnMerge: function (slxDocument) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnMerge()"); /*DNL*/
                    try {
                        try {
                            oService.MergeFromSlxDocument(slxDocument, true);
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnMerge(): " + oService.FormatError(err)); /*DNL*/
                            oService.DisplayError(err);
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnMerge()"); /*DNL*/
                    }
                }
            },
            HandleOnPreview: function (tempFileName, entityId, showPreview, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnPreview()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "MergedFileName", ""); /*DNL*/
                            var oMailMergeEngine = oService.GetNewMailMergeEngine();
                            if (oMailMergeEngine.MergePreview(tempFileName, entityId, params)) {
                                if (showPreview) {
                                    var sFileName = oService.GetParamValue(params, "MergedFileName"); /*DNL*/
                                    var oTemplateEditor = oService.TemplateEditor();
                                    oTemplateEditor.CreateWindow();
                                    try {
                                        oService.SetDefaultProperties(oTemplateEditor, WhichProperties.wpTemplateEditor);
                                        oTemplateEditor.DisplayPreview(sFileName);
                                    }
                                    finally {
                                        oTemplateEditor.DestroyWindow();
                                    }
                                }
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnPreview(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.DisplayError(err);
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnPreview()"); /*DNL*/
                    }
                }
            },
            HandleOnPrintAddressLabels: function (
            // ReSharper disable UnusedParameter
                reportId, whereSql, sortFields, report, params) {
                // ReSharper restore UnusedParameter
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Deprecated: HandleOnPrintAddressLabels()"); /*DNL*/
                }
            },
            HandleOnRequestAlarmLeadInfo: function (userId, activityType, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestAlarmLeadInfo()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "Alarm", false); /*DNL*/
                            oService.SetParamValue(params, "Duration", 15); /*DNL*/
                            oService.SetParamValue(params, "Lead", AlarmLead.leadMinutes); /*DNL*/
                            var sCategory = "";
                            switch (activityType) {
                                case ActivityType.actMeeting:
                                    sCategory = "ActivityMeetingOptions"; /*DNL*/
                                    break;
                                case ActivityType.actPhoneCall:
                                    sCategory = "ActivityPhoneOptions"; /*DNL*/
                                    break;
                                case ActivityType.actToDo:
                                    sCategory = "ActivityToDoOptions"; /*DNL*/
                                    break;
                            }
                            var enLeadType = AlarmLead.leadMinutes;
                            var iDuration = 15;
                            var iAlarmLead = oService.GetUserPreference("AlarmLead", sCategory); /*DNL*/
                            if (isNaN(iAlarmLead)) {
                                iAlarmLead = 15;
                            }
                            if (iAlarmLead >= 0) {
                                switch (true) {
                                    case ((iAlarmLead >= 0) && (iAlarmLead <= 59)):
                                        enLeadType = AlarmLead.leadMinutes;
                                        iDuration = iAlarmLead;
                                        break;
                                    case ((iAlarmLead >= 60) && (iAlarmLead <= 1439)):
                                        enLeadType = AlarmLead.leadHours;
                                        iDuration = (Math.floor(iAlarmLead) / 60);
                                        break;
                                    default:
                                        enLeadType = AlarmLead.leadDays;
                                        iDuration = (Math.floor(iAlarmLead) / 1440);
                                }
                            }
                            var bAlarmEnabled = false;
                            var sAlarmEnabled = oService.GetUserPreference("AlarmEnabled", sCategory); /*DNL*/
                            if (sAlarmEnabled != null && sAlarmEnabled != "") {
                                sAlarmEnabled = sAlarmEnabled.toUpperCase();
                                if (sAlarmEnabled.charAt(0) == "T") {
                                    bAlarmEnabled = true;
                                }
                            }
                            oService.SetParamValue(params, "Success", true); /*DNL*/
                            oService.SetParamValue(params, "Alarm", bAlarmEnabled); /*DNL*/
                            oService.SetParamValue(params, "Duration", iDuration); /*DNL*/
                            oService.SetParamValue(params, "Lead", enLeadType); /*DNL*/
                        }
                        catch (err) {
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestAlarmLeadInfo()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestCrystalReport: function (
                reportId, sql, leftMargin, topMargin, sortFields, report, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestCrystalReport()"); /*DNL*/
                    try {
                        oService.SetParamValue(params, "Error", ""); /*DNL*/
                        oService.SetParamValue(params, "Success", false); /*DNL*/
                        if (!Helper.MailMergeInfoStore().RemoteInfo.UseActiveReporting) {
                            var oReport = new oService.MailMergeReport();
                            oReport.Id = reportId;
                            oReport.Sql = sql;
                            oService.LastReport = oReport;
                            var sUrl = dString.substitute("${0}/GetReport.aspx?isAL=T", [oService.GetClientPath()]);
                            window.open(sUrl, "AddressLabelViewer", "height=300,width=600,left=10,top=10,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,titlebar=no,toolbar=no");
                            oService.SetParamValue(params, "Success", true); /*DNL*/
                        }
                        else {
                            try {
                                var oSlxReportViewer = oService.NewActiveXObject("SLXCRV.CRViewer");
                                if (oSlxReportViewer.IsCrystalViewerInstalled() == false) {
                                    oService.SetParamValue(params, "Error", Helper.DesktopErrors().ReportViewerNotInstalled); /*DNL*/
                                    return;
                                }
                                if (oSlxReportViewer.IsCrystalReportsRunTimeInstalled() == false) {
                                    oService.SetParamValue(params, "Error", Helper.DesktopErrors().CrystalRuntimeError); /*DNL*/
                                    return;
                                }
                                var sConnectionString = Helper.MailMergeInfoStore().RemoteInfo.ConnectionString;
                                var sDataSource = Helper.MailMergeInfoStore().RemoteInfo.DataSource;
                                var sKeyField = "CONTACT.CONTACTID"; /*DNL*/
                                var sPassword = Helper.MailMergeInfoStore().Password;
                                var sPluginId = reportId;
                                var sRecordSelection = "";
                                var sSortDirections = "";
                                var sSortFields = "";
                                var sSqlSelect;
                                var sSqlWhere;
                                var sUserCode = Helper.MailMergeInfoStore().UserCode;
                                var bForceSql;
                                var bSsl = (window.parent.document.location.protocol.toUpperCase().indexOf("HTTPS") == -1 ? "0" : "1");
                                var iDatabaseServer = 0;
                                if (sql.toUpperCase().indexOf("SELECT ") == 0) { /*DNL*/
                                    sSqlSelect = sql;
                                    sSqlWhere = "";
                                    bForceSql = true;
                                }
                                else {
                                    sSqlSelect = "";
                                    sSqlWhere = sql;
                                    bForceSql = false;
                                }
                                if (oSlxReportViewer.ShowReport(sConnectionString, sDataSource, iDatabaseServer,
                                    bForceSql, bSsl, sKeyField, sPassword, sPluginId, sRecordSelection,
                                    sSortDirections, sSortFields, sSqlSelect, sSqlWhere, sUserCode)) {
                                    oService.SetParamValue(params, "Success", true); /*DNL*/
                                }
                            }
                            catch (err) {
                                var sError = oService.FormatError(err);
                                sError = dString.substitute("${0} ${1}", [Helper.DesktopErrors().ReportViewerError, sError]);
                                oService.SetParamValue(params, "Error", sError); /*DNL*/
                            }
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestCrystalReport()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestGroupInfoEx: function (groupId, useTableAlias, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestGroupInfoEx()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "AdHoc", false); /*DNL*/
                            oService.SetParamValue(params, "Empty", true); /*DNL*/
                            oService.SetParamValue(params, "Family", 0); /*DNL*/
                            oService.SetParamValue(params, "FromSQL", ""); /*DNL*/
                            oService.SetParamValue(params, "InClause", ""); /*DNL*/
                            oService.SetParamValue(params, "OrderBySQL", ""); /*DNL*/
                            oService.SetParamValue(params, "Parameters", ""); /*DNL*/
                            oService.SetParamValue(params, "SelectSQL", ""); /*DNL*/
                            oService.SetParamValue(params, "WhereSQL", ""); /*DNL*/

                            if (oService.HasParam(params, "Conditions")) { /*DNL*/
                                oService.SetParamValue(params, "Conditions", ""); /*DNL*/
                            }
                            if (oService.HasParam(params, "Layouts")) { /*DNL*/
                                oService.SetParamValue(params, "Layouts", ""); /*DNL*/
                            }
                            if (oService.HasParam(params, "Sorts")) { /*DNL*/
                                oService.SetParamValue(params, "Sorts", ""); /*DNL*/
                            }

                            var sUrl = oService.GetGroupManagerUrl() + "GetGroupXML&groupID=" + groupId;
                            var sXml = oService.GetFromServer(sUrl);
                            var oXmlReader = new Sage.SimpleXmlReader(sXml);

                            var oErrorNode = oXmlReader.selectSingleNode("SLXGroup/error");
                            if (oErrorNode != null) {
                                oService.SetParamValue(params, "Error", oXmlReader.getNodeText(oErrorNode)); /*DNL*/
                                oService.SetParamValue(params, "Success", false); /*DNL*/
                                return;
                            }

                            var i;
                            var sAlias, sDataPath, sOperator, sValue;
                            var sParameters = "";
                            var oParameters = oXmlReader.selectChildNodes("SLXGroup/parameters/parameter");
                            for (i = 0; i < oParameters.length; i++) {
                                var oParam = oParameters[i];
                                sDataPath = oXmlReader.selectSingleNodeText("datapath", oParam);
                                var sDataType = oXmlReader.selectSingleNodeText("fieldtype", oParam);
                                var sFieldName = oXmlReader.selectSingleNodeText("fieldname", oParam);
                                var sName = oXmlReader.selectSingleNodeText("name", oParam);
                                sOperator = oXmlReader.selectSingleNodeText("operator", oParam);
                                var sTableName = oXmlReader.selectSingleNodeText("tablename", oParam);
                                sValue = oXmlReader.selectSingleNodeText("value", oParam);
                                sParameters += "|" + sName + "|" + sValue + "|" + sDataType + "|" + sDataPath + "|" + sTableName + "|" + sFieldName + "|" + sOperator + "|\r\n";
                            }

                            var IDX_FAMILY = 3;
                            var sFamily = oXmlReader.selectSingleNode("SLXGroup/plugindata").attributes.item(IDX_FAMILY).nodeValue.toUpperCase();
                            /* 0 qtContact, 1 qtAccount, 2 qtOpportunity, 3 qtOther.
                            * The only groups used by mail merge are CONTACT, ACCOUNT, OPPORTUNITY, and LEAD. */
                            var iQueryType = 3; /* qtOther */
                            switch (sFamily) {
                                case "CONTACT":
                                    /*DNL*/
                                    iQueryType = 0;
                                    break;
                                case "ACCOUNT":
                                    /*DNL*/
                                    iQueryType = 1;
                                    break;
                                case "OPPORTUNITY":
                                    /*DNL*/
                                    iQueryType = 2;
                                    break;
                            }

                            var sFromSql = oXmlReader.selectSingleNodeText("SLXGroup/fromsql");
                            var sSelectSql = oService.GetMainTableAlias(sFromSql) + "." + sFamily + "ID";
                            var sWhereSql = oService.StripParameters(oXmlReader.selectSingleNodeText("SLXGroup/wheresql"), oXmlReader);
                            var sOrderBySql = oService.StripParameters(oXmlReader.selectSingleNodeText("SLXGroup/orderbysql"), oXmlReader);

                            var sConditions = "";
                            if (oService.HasParam(params, "Conditions")) { /*DNL*/
                                var oConditions = oXmlReader.selectChildNodes("SLXGroup/conditions/condition");
                                for (i = 0; i < oConditions.length; i++) {
                                    var oCond = oConditions[i];
                                    sAlias = oXmlReader.selectSingleNodeText("alias", oCond);
                                    var sCaseSens = oXmlReader.selectSingleNodeText("casesens", oCond);
                                    var sConnector = oXmlReader.selectSingleNodeText("connector", oCond);
                                    sDataPath = oXmlReader.selectSingleNodeText("datapath", oCond);
                                    var sFieldType = oXmlReader.selectSingleNodeText("fieldtype", oCond);
                                    var sIsLiteral = oXmlReader.selectSingleNodeText("isliteral", oCond);
                                    var sIsNegated = oXmlReader.selectSingleNodeText("isnegated", oCond);
                                    var sLeftParens = oXmlReader.selectSingleNodeText("leftparens", oCond);
                                    sOperator = oXmlReader.selectSingleNodeText("operator", oCond);
                                    var sRightParens = oXmlReader.selectSingleNodeText("rightparens", oCond);
                                    sValue = oXmlReader.selectSingleNodeText("value", oCond);
                                    /* Condition Terms: |DataPath|Alias|Condition|Value|AND/OR|Type|CS|(|)|IsLiteral|NOT| */
                                    sConditions += "|" + sDataPath + "|" + sAlias + "|" + sOperator + "|" + sValue +
                                        "|" + sConnector + "|" + sFieldType + "|" + sCaseSens + "|" + sLeftParens + "|" + sRightParens +
                                            "|" + sIsLiteral + "|" + sIsNegated + "|\r\n";
                                }
                            }

                            var sLayouts = "";
                            if (oService.HasParam(params, "Layouts")) { /*DNL*/
                                var oLayouts = oXmlReader.selectChildNodes("SLXGroup/layouts/layout");
                                for (i = 0; i < oLayouts.length; i++) {
                                    var oLayout = oLayouts[i];
                                    sAlias = oXmlReader.selectSingleNodeText("alias", oLayout);
                                    var sAlign = oXmlReader.selectSingleNodeText("align", oLayout);
                                    var sCaptAlign = oXmlReader.selectSingleNodeText("captalign", oLayout);
                                    var sCaption = oXmlReader.selectSingleNodeText("caption", oLayout);
                                    sDataPath = oXmlReader.selectSingleNodeText("datapath", oLayout);
                                    var sFormat = oXmlReader.selectSingleNodeText("format", oLayout);
                                    var sFormatString = oXmlReader.selectSingleNodeText("formatstring", oLayout);
                                    var sWidth = oXmlReader.selectSingleNodeText("width", oLayout);
                                    /* Layout Terms: |DataPath|Alias|Caption|Width|Format|FormatType|Alignment|CaptionAlignment| */
                                    sLayouts += "|" + sDataPath + "|" + sAlias + "|" + sCaption + "|" + sWidth + "|" + sFormatString +
                                        "|" + sFormat + "|" + sAlign + "|" + sCaptAlign + "|\r\n";
                                }
                            }

                            var sSorts = "";
                            if (oService.HasParam(params, "Sorts")) { /*DNL*/
                                var oSorts = oXmlReader.selectChildNodes("SLXGroup/sorts/sort");
                                for (i = 0; i < oSorts.length; i++) {
                                    var oSort = oSorts[i];
                                    sAlias = oXmlReader.selectSingleNodeText("alias", oSort);
                                    sDataPath = oXmlReader.selectSingleNodeText("datapath", oSort);
                                    var sSortOrder = oXmlReader.selectSingleNodeText("sortorder", oSort);
                                    /* Sort Terms: |DataPath|Alias|ASC/DESC| */
                                    sSorts += "|" + sDataPath + "|" + sAlias + "|" + sSortOrder + "|\r\n";
                                }
                            }

                            var bAdHoc = (oXmlReader.selectSingleNodeText("SLXGroup/adhocgroup") == "true"); /*DNL*/

                            oService.SetParamValue(params, "AdHoc", bAdHoc); /*DNL*/
                            oService.SetParamValue(params, "Empty", false); /*DNL*/
                            oService.SetParamValue(params, "Family", iQueryType); /*DNL*/
                            oService.SetParamValue(params, "FromSQL", sFromSql); /*DNL*/
                            oService.SetParamValue(params, "InClause", ""); /*DNL*/
                            oService.SetParamValue(params, "OrderBySQL", sOrderBySql); /*DNL*/
                            oService.SetParamValue(params, "Parameters", sParameters); /*DNL*/
                            oService.SetParamValue(params, "SelectSQL", sSelectSql); /*DNL*/
                            oService.SetParamValue(params, "WhereSQL", sWhereSql); /*DNL*/

                            /*oService.Debug("GroupXML: " + sXml);
                            oService.Debug("Family: " + iQueryType);
                            oService.Debug("SelectSQL: " + sSelectSql);
                            oService.Debug("FromSQL: " + sFromSql);
                            oService.Debug("WhereSQL: " + sWhereSql);
                            oService.Debug("OrderBySQL: " + sOrderBySql);
                            oService.Debug("Conditions: " + sConditions);
                            oService.Debug("Layouts: " + sLayouts);
                            oService.Debug("Sorts: " + sSorts);
                            oService.Debug("Parameters: " + sParameters);*/

                            if (oService.HasParam(params, "Conditions")) { /*DNL*/
                                oService.SetParamValue(params, "Conditions", sConditions); /*DNL*/
                            }
                            if (oService.HasParam(params, "Layouts")) { /*DNL*/
                                oService.SetParamValue(params, "Layouts", sLayouts); /*DNL*/
                            }
                            if (oService.HasParam(params, "Sorts")) { /*DNL*/
                                oService.SetParamValue(params, "Sorts", sSorts); /*DNL*/
                            }

                            oService.SetParamValue(params, "Success", true); /*DNL*/
                        }
                        catch (err) {
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestGroupInfoEx()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestGroups: function (userId, groups, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestGroups()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/

                            var sUrl = oService.GetGroupManagerUrl() + "GetAllGroups";
                            var sGroups = oService.GetFromServer(sUrl);
                            if (dojo.isString(sGroups) && sGroups !== "") {
                                var arrValues = sGroups.split("|");
                                var iRows = ((arrValues.length - 2) / 3);
                                var iColums = 3;

                                /* The "groups" parameter is an instance of SLXMMGUIW.MultidimensionalArray.
                                * Resize this array to pass back the group information. */
                                groups.Resize(iRows, iColums);

                                var x = 1; /* Skip the first value, which is the count. */
                                for (var i = 0; i < groups.RowCount; ++i) {
                                    groups.SetValue(i, 0, arrValues[x]);
                                    x++;
                                    groups.SetValue(i, 1, arrValues[x]);
                                    x++;
                                    groups.SetValue(i, 2, arrValues[x]);
                                    x++;
                                }
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in  HandleOnRequestGroups(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestGroups()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestUsers: function (userId, users, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestUsers()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/

                            var sUrl = oService.GetGroupManagerUrl() + "GetUsers";
                            var sUsers = oService.GetFromServer(sUrl);
                            if (dojo.isString(sUsers) && sUsers !== "") {
                                var arrValues = sUsers.split("|");
                                var iRows = ((arrValues.length - 2) / 3);
                                var iColums = 3;

                                /* The "users" parameter is an instance of SLXMMGUIW.MultidimensionalArray.
                                * Resize this array to pass back the user information. */
                                users.Resize(iRows, iColums);

                                var x = 1; /* Skip the first value, which is the count. */
                                for (var i = 0; i < users.RowCount; ++i) {
                                    users.SetValue(i, 0, arrValues[x]);
                                    x++;
                                    users.SetValue(i, 1, arrValues[x]);
                                    x++;
                                    users.SetValue(i, 2, arrValues[x]);
                                    x++;
                                }
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestUsers(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestUsers()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestRebuildSchema: function (params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestRebuildSchema()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            var sResult = oService.RebuildSchema();
                            if (sResult === "true") /*DNL*/
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            else
                                oService.SetParamValue(params, "Error", sResult); /*DNL*/
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestRebuildSchema(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestRebuildSchema()"); /*DNL*/
                    }
                }
            },
            HandleOnCancelMailMerge: function () {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("The user canceled the mail merge job."); /*DNL*/
                }
            },
            HandleOnCustomFieldName: function (
                fieldName, range, accountId, addressId, contactId, opportunityId, pluginId,
                userId, preview, mainTable, entityId, mailMergeId, oneOffTicketId, params) {
                /* fieldName      - The custom merge field name inserted using the Template Editor.
                range          - The Microsoft Word Range object. This is the object you work with to insert content into the Word document. This content will replace the custom merge field.
                accountId      - The AccountID for the Contact.
                addressId      - The AddressID for the Contact.
                contactId      - The ContactID for the Contact.
                opportunityId  - The OpportunityID associated with the Contact (if any).
                pluginId       - The PluginID of the Word Template being used.
                userId         - The UserID of the Mail Merge user (may or may not be the logged in user).
                preview        - This is True if the merge is for the Preivew used by both the Template Editor and the Select a Template or Manage Templates dialogs. When Preview is True the pluginId parameter is unavailable.
                entityId       - The ContactID if the mainTable is "CONTACT" or the LeadID if the mainTable is "LEAD".
                mailMergeId    - This is the mail merge job ID. This value will  be the same for each document processed in a multi-document mail merge job.
                mainTable      - This is the main table (i.e. "CONTACT" or "LEAD").
                oneOffTicketId - This is the TicketID of an "one-off" mail merge when that mail merge is launched from within the context of the Ticket view (or via the MergeFromPlugin. Note: It's also possible to use a :TicketID parameter in a SQL mail merge field, but only for one-off mail merges (not via the main mail merge dialog and not via the MergeFromFile API).
                params         - This contains the Error and Success parameters that are passed back to the mail merge engine (see SetParamValue below). */
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnCustomFieldName()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/

                            var wdTableFormat3DEffects1 = 32;
                            var wdAutoFitContent = 1;
                            var wdWord9TableBehavior = 1;

                            var sError;
                            /*var oTable;*/

                            switch (fieldName.toUpperCase()) {
                                /* This is an example only.*/ 
                                case "CUSTOMFIELDNAME_EXAMPLE_A":
                                    /*DNL*/
                                    range.InsertAfter("Last Name|First Name"); /*DNL*/
                                    range.InsertParagraphAfter();
                                    range.InsertAfter("Abbott|John"); /*DNL*/
                                    range.InsertParagraphAfter();
                                    range.InsertAfter("Balbo|Lou"); /*DNL*/
                                    range.InsertParagraphAfter();
                                    range.InsertAfter("Drew|Dean"); /*DNL*/
                                    range.InsertParagraphAfter();
                                    range.InsertAfter("Velazquez|Mike"); /*DNL*/
                                    range.InsertParagraphAfter();
                                    range.InsertAfter("Zessner|Louise"); /*DNL*/
                                    range.InsertParagraphAfter();

                                    var sSeparator = "|";
                                    var iNumRows = 6;
                                    var iNumColumns = 2;
                                    var iInitialColumnWidth = 100;
                                    var enFormat = wdTableFormat3DEffects1;
                                    var bApplyBorders = true;
                                    var bApplyShading = true;
                                    var bApplyFont = true;
                                    var bApplyColor = true;
                                    var bApplyHeadingRows = true;
                                    var bApplyLastRow = false;
                                    var bApplyFirstColumn = false;
                                    var bApplyLastColumn = false;
                                    var bAutoFit = true;
                                    var enAutoFitBehavior = wdAutoFitContent;
                                    var enDefaultTableBehavior = wdWord9TableBehavior;

                                    /*oTable = */range.ConvertToTable(sSeparator, iNumRows, iNumColumns, iInitialColumnWidth, enFormat, bApplyBorders,
                                        bApplyShading, bApplyFont, bApplyColor, bApplyHeadingRows, bApplyLastRow, bApplyFirstColumn,
                                        bApplyLastColumn, bAutoFit, enAutoFitBehavior, enDefaultTableBehavior);
                                    /* oTable...Do something with the Table object. */
                                    break;
                                /* This is an example only. */ 
                                case "CUSTOMFIELDNAME_EXAMPLE_B":
                                    /*DNL*/
                                    range.InsertParagraphAfter();
                                    range.InsertAfter("SalesLogix Mail Merge"); /*DNL*/
                                    range.Bold = true;
                                    break;
                                /* If the fieldName is not handled then pass back an error. */ 
                                default:
                                    sError = Helper.DesktopErrors().OnCustomFieldNameError;
                                    oService.SetParamValue(params, "Error", sError); /*DNL*/
                                    /*range.InsertAfter("FieldName=" + fieldName + "; AccountID=" + accountId + "; AddressID=" + addressId +
                                    "; ContactID=" + contactId + "; OpportunityID=" + opportunityId + "; PluginID=" + pluginId +
                                    "; UserID=" + userId + "; Preview=" + preview + "; OneOffTicketID=" + oneOffTicketId);*/
                                    return;
                            }
                            oService.SetParamValue(params, "Success", true); /*DNL*/
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnCustomFieldName(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnCustomFieldName()"); /*DNL*/
                    }
                }
            },
            HandleOnHideProgress: function () {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnHideProgress()"); /*DNL*/
                    try {
                        var oDialog = oService.ProgressDlg();
                        if (oDialog) {
                            oDialog.Hide();
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnHideProgress()"); /*DNL*/
                    }
                }
            },
            /* This event is called by the mail merge engine when the DebugMode DWORD registry
            * value is set to 1 in the following registry location:
            * HKEY_CURRENT_USER\Software\SalesLogix\MailMerge */
            HandleOnOutputDebug: function (msg) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug(msg, "MailMergeEngine"); /*DNL*/
                }
            },
            HandleOnRequestCompleteFax: function (
                type, entityId, historyId, opportunityId, notes, leader, mainTable, ticketId, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestCompleteFax()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            var oActivityService = Sage.Services.getService("ActivityService");
                            var args = oService.GetActivityInfo(type, entityId, historyId,
                                opportunityId, notes, leader, mainTable, ticketId, params);
                            var sType = "atFax";
                            args.Type = sType;
                            var fnHistoryExists = function (id) {
                                if (id == "")
                                    return false;
                                var sHistoryId = oService.GetSingleValue("HISTORYID", "HISTORY", "HISTORYID", id);
                                return (sHistoryId == id);
                            };
                            if (fnHistoryExists(historyId)) {
                                args.HistoryExists = true;
                                oActivityService.completeHistory(historyId);
                            } else {
                                oActivityService.completeNewActivity(sType, args);
                            }
                            oService.HookActivityDialog(historyId, args);
                            oService.SetParamValue(params, "Success", true); /*DNL*/
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestCompleteFax(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestCompleteFax()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestCompleteLetter: function (
                type, entityId, historyId, opportunityId, notes, leader, mainTable, ticketId, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestCompleteLetter()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            var oActivityService = Sage.Services.getService("ActivityService");
                            var args = oService.GetActivityInfo(type, entityId, historyId,
                                opportunityId, notes, leader, mainTable, ticketId, params);
                            var sType = "atDoc";
                            args.Type = sType;
                            var fnHistoryExists = function (id) {
                                if (id == "")
                                    return false;
                                var sHistoryId = oService.GetSingleValue("HISTORYID", "HISTORY", "HISTORYID", id);
                                return (sHistoryId == id);
                            };
                            if (fnHistoryExists(historyId)) {
                                args.HistoryExists = true;
                                oActivityService.completeHistory(historyId);
                            } else {
                                oActivityService.completeNewActivity(sType, args);
                            }
                            oService.HookActivityDialog(historyId, args);
                            oService.SetParamValue(params, "Success", true); /*DNL*/
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestCompleteLetter(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestCompleteLetter()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestCreateAdHocGroup: function (
                entityIds, groupName, mainTable, layoutId, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestCreateAdHocGroup()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "GroupID", ""); /*DNL*/
                            var oQuery = new Object();
                            oQuery.family = mainTable;
                            oQuery.name = groupName;
                            oQuery.ids = entityIds;
                            var sQuery = oService.SimpleUrlEncode(oQuery);
                            var sUrl = dString.substitute("${0}CreateAdHocGroup&${1}", [oService.GetGroupManagerUrl(), sQuery]);
                            var sGroupId = oService.GetFromServer(sUrl);
                            if (dojo.isString(sGroupId) && sGroupId !== "") {
                                oService.SetParamValue(params, "GroupID", sGroupId); /*DNL*/
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestCreateAdHocGroup(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestCreateAdHocGroup()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestData: function (
                userId, mainTable, addressField, criteria, opportunityDataPath, opportunityValue, sorts, layouts, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestData()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/

                            var sPost = "<slqueryrequest><layouts><![CDATA["; /*DNL*/
                            var i;
                            for (i = 0; i < layouts.RowCount; i++) {
                                if (i != 0) {
                                    sPost += ",";
                                }
                                // Temporarily replace commas with a placeholder: «¿»
                                // This is necessary because GetQueryData() splits the comma-delimited layouts,
                                // and the FormatString part of the layout may contain commas.
                                sPost += layouts.GetValue(i, 0).replace(/,/g, "«¿»");
                            }

                            sPost += "]]></layouts>"; /*DNL*/
                            sPost += "<maintable>" + mainTable + "</maintable>"; /*DNL*/
                            sPost += "<userid>" + userId + "</userid>"; /*DNL*/
                            sPost += "<addressfield><![CDATA[" + addressField + "]]></addressfield>"; /*DNL*/
                            sPost += "<criteria><![CDATA[" + criteria + "]]></criteria>"; /*DNL*/
                            sPost += "<sorts><![CDATA[" + sorts + "]]></sorts>"; /*DNL*/
                            sPost += "</slqueryrequest>"; /*DNL*/

                            var sUrl = oService.GetGroupManagerUrl() + "GetQueryData";
                            var sXml = oService.PostToServer(sUrl, sPost, true);
                            if (dojo.isString(sXml) && sXml !== "") {
                                var oXmlReader = new Sage.SimpleXmlReader(sXml);

                                var sData = oXmlReader.selectSingleNodeText("returndata/data");
                                oService.SetParamValue(params, "Data", sData); /*DNL*/

                                var oLayouts = oXmlReader.selectChildNodes("returndata/layouts/layout");
                                if (layouts.RowCount != oLayouts.length) {
                                    throw new Error(Helper.DesktopErrors().HandleOnRequestDataError);
                                }
                                for (i = 0; i < layouts.RowCount; i++) {
                                    var sLayout = oXmlReader.getNodeText(oLayouts[i]).replace(/«¿»/gi, ","); // Restore commas.
                                    layouts.SetValue(i, 0, sLayout);
                                }

                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestData(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestData()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestEditAfter: function (
                editInfos, mode, output, mainTable, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestEditAfter()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "Canceled", false); /*DNL*/
                            var oEditMergedDocs = oService.NewActiveXObject("SLXMMGUIW.EditMergedDocs");
                            oEditMergedDocs.CreateWindow();
                            try {
                                oService.SetDefaultProperties(oEditMergedDocs, WhichProperties.wpEditMergedDocs);
                                oEditMergedDocs.EditInfos = editInfos;
                                oEditMergedDocs.OutputTo = output;
                                oEditMergedDocs.OutputType = mode;
                                if (oEditMergedDocs.ShowModal() == ModalResult.resCancel) {
                                    oService.SetParamValue(params, "Canceled", true); /*DNL*/
                                }
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                            finally {
                                oEditMergedDocs.DestroyWindow();
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestEditAfter(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestEditAfter()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestEditDocument: function (
                editInfo, mode, type, mainTable, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestEditDocument()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.InitObjects();
                            var oTemplateEditor = oService.TemplateEditor();
                            oTemplateEditor.CreateWindow();
                            try {
                                oService.SetDefaultProperties(oTemplateEditor, WhichProperties.wpTemplateEditor);
                                /* params are updated in EditDocumentByEditInfo. */
                                oTemplateEditor.EditDocumentByEditInfo(editInfo, type, mode, params);
                            }
                            finally {
                                oTemplateEditor.DestroyWindow();
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestEditDocument(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestEditDocument()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestFaxOptions: function (
                toName, toNumber, faxProvider, mainTable, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestFaxOptions()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "Canceled", false); /*DNL*/
                            var oFaxOptionsDlg = oService.NewActiveXObject("SLXMMGUIW.fFaxOptions");
                            oFaxOptionsDlg.CreateWindow();
                            try {
                                var sCoverPage = oService.GetParamValue(params, "CoverPage"); /*DNL*/
                                var sSubject = oService.GetParamValue(params, "Subject"); /*DNL*/
                                oFaxOptionsDlg.CoverPage = (dojo.isString(sCoverPage)) ? sCoverPage : "";
                                oFaxOptionsDlg.FaxProvider = faxProvider;
                                oFaxOptionsDlg.Number = toNumber;
                                oFaxOptionsDlg.Subject = (dojo.isString(sSubject)) ? sSubject : "";
                                oFaxOptionsDlg.To_ = toName;
                                oFaxOptionsDlg.UserID = String(Helper.MailMergeInfoStore().UserId).trim();
                                var iModalResult = oFaxOptionsDlg.ShowModal();
                                switch (iModalResult) {
                                    case ModalResult.resOk:
                                        oService.SetParamValue(params, "BillingCode", oFaxOptionsDlg.BillingCode); /*DNL*/
                                        oService.SetParamValue(params, "ClientID", oFaxOptionsDlg.ClientID); /*DNL*/
                                        oService.SetParamValue(params, "CoverPage", oFaxOptionsDlg.CoverPage); /*DNL*/
                                        oService.SetParamValue(params, "DeliveryDateTime", oFaxOptionsDlg.DeliveryDate + oFaxOptionsDlg.DeliveryTime); /*DNL*/
                                        oService.SetParamValue(params, "DeliveryType", oFaxOptionsDlg.Delivery); /*DNL*/
                                        oService.SetParamValue(params, "JobOptions", oFaxOptionsDlg.FaxJobOptions); /*DNL*/
                                        oService.SetParamValue(params, "Keywords", oFaxOptionsDlg.Keywords); /*DNL*/
                                        oService.SetParamValue(params, "Message", oFaxOptionsDlg.MessageText); /*DNL*/
                                        oService.SetParamValue(params, "Priority", oFaxOptionsDlg.Priority); /*DNL*/
                                        oService.SetParamValue(params, "SendBy", oFaxOptionsDlg.SendBy); /*DNL*/
                                        oService.SetParamValue(params, "SendSecure", oFaxOptionsDlg.SendSecure); /*DNL*/
                                        oService.SetParamValue(params, "Subject", oFaxOptionsDlg.Subject); /*DNL*/
                                        oService.SetParamValue(params, "Success", true); /*DNL*/
                                        break;
                                    case ModalResult.resCancel:
                                        oService.SetParamValue(params, "Canceled", true); /*DNL*/
                                        oService.SetParamValue(params, "Success", true); /*DNL*/
                                        break;
                                }
                            }
                            finally {
                                oFaxOptionsDlg.DestroyWindow();
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestFaxOptions(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestFaxOptions()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestFormat: function (
                type, formatString, value, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestFormat()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "Result", ""); /*DNL*/
                            var oQuery = new Object();
                            oQuery.formatstring = formatString;
                            oQuery.type = type;
                            oQuery.val = value;
                            var sQuery = this.SimpleUrlEncode(oQuery);
                            var sUrl = dString.substitute("${0}slformat&${1}", [oService.GetInfoBrokerUrl(), sQuery]);
                            var sResult = oService.GetFromServer(sUrl);
                            if (dojo.isString(sResult) && sResult !== "") {
                                oService.SetParamValue(params, "Result", sResult); /*DNL*/
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestFormat(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestFormat()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestPrintAddressLabels: function (params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestPrintAddressLabels()"); /*DNL*/
                    try {
                        try {
                            var oContext = oService.GetContext();
                            if (oContext) {
                                oService.SetParamValue(params, "Error", ""); /*DNL*/
                                oService.SetParamValue(params, "Success", false); /*DNL*/
                                oService.InitObjects();
                                var oAddressLabels = oService.NewActiveXObject("SLXMMGUIW.AddressLabels");
                                oService.ConnectEvents(oAddressLabels, WhichEvents.weAddressLabels);
                                oAddressLabels.CreateWindow();
                                try {
                                    oService.SetDefaultProperties(oAddressLabels, WhichProperties.wpAddressLabels);
                                    oAddressLabels.ShowMergeWith = false;
                                    if (oContext.GroupCanBeMergedTo) {
                                        oAddressLabels.CurrentGroupID = oContext.GroupId;
                                        oAddressLabels.CurrentGroupType = oContext.GroupTableName;
                                        oAddressLabels.CurrentGroupName = (oContext.GroupName != "") ? oContext.GroupName : Helper.MailMergeInfoStore().Resources.NoGroup;
                                    }
                                    if (oContext.EntityIsContact || oContext.EntityIsLead) {
                                        oAddressLabels.CurrentEntityID = oContext.IsDetailMode ? oContext.EntityId : "";
                                        oAddressLabels.CurrentEntityName = oContext.IsDetailMode ? oContext.EntityDescription : (oContext.EntityIsLead ? Helper.MailMergeInfoStore().Resources.NoLead : Helper.MailMergeInfoStore().Resources.NoContact);
                                        oAddressLabels.CurrentEntityType = oContext.EntityDisplayName;
                                    }
                                    var iModalResult = oAddressLabels.ShowModal();
                                    switch (iModalResult) {
                                        case ModalResult.resOk:
                                            /* An event handler is used to handle report generation. */
                                            break;
                                        case ModalResult.resCancel:
                                            oService.SetParamValue(params, "Canceled", true); /*DNL*/
                                            break;
                                    }
                                    oService.SetParamValue(params, "Success", true); /*DNL*/
                                }
                                finally {
                                    oAddressLabels.DestroyWindow();
                                }
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestPrintAddressLabels(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }

                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestPrintAddressLabels()"); /*DNL*/
                    }
                }
            },
            /* This will only happen for a sales process. */
            HandleOnRequestScheduleFollowUp: function (
                followUp, accountId, accountName, entityId, entityName,
                opportunityId, opportunityName, mainTable, ticketId, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestScheduleFollowUp()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            var oActivityService = Sage.Services.getService("ActivityService");
                            var sUserId = String(Helper.MailMergeInfoStore().UserId).trim();
                            var fnGetTicketNumber = function (id) {
                                if (id == "")
                                    return "";
                                return oService.GetSingleValue("TICKETNUMBER", "TICKET", "TICKETID", id);
                            };
                            var sTicketNumber = fnGetTicketNumber(ticketId);
                            var sActivityType = "atAppointment";
                            switch (followUp) {
                                case FollowUp.fuPhoneCall:
                                    sActivityType = "atPhoneCall";
                                    break;
                                case FollowUp.fuToDo:
                                    sActivityType = "atToDo";
                                    break;
                            }
                            var args = {
                                "Type": sActivityType,
                                "ContactId": entityId,
                                "ContactName": entityName,
                                "AccountId": accountId,
                                "AccountName": accountName,
                                "OpportunityId": opportunityId,
                                "OpportunityName": opportunityName,
                                "TicketId": ticketId,
                                "TicketNumber": sTicketNumber,
                                "LeadId": "",
                                "LeadName": "",
                                "Leader": { "$key": sUserId }
                            };
                            if (typeof console !== "undefined") {
                                console.debug("HandleOnRequestScheduleFollowUp(): %o", args);
                            }
                            oActivityService.scheduleActivity(args);
                            oService.SetParamValue(params, "Success", true); /*DNL*/
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestScheduleFollowUp(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestScheduleFollowUp()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestSelectAddressType: function (params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestSelectAddressType()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "Canceled", false); /*DNL*/
                            oService.SetParamValue(params, "AddressType", 0); /*DNL*/
                            oService.SetParamValue(params, "OtherAddressID", ""); /*DNL*/
                            oService.SetParamValue(params, "OtherAddressText", ""); /*DNL*/
                            var oSelectAddressType = oService.NewActiveXObject("SLXMMGUIW.SelectAddressType");
                            oSelectAddressType.CreateWindow();
                            try {
                                oService.SetDefaultProperties(oSelectAddressType, WhichProperties.wpSelectAddressType);
                                var iModalResult = oSelectAddressType.ShowModal();
                                switch (iModalResult) {
                                    case ModalResult.resOk:
                                        oService.SetParamValue(params, "AddressType", oSelectAddressType.SelectedAddressType); /*DNL*/
                                        oService.SetParamValue(params, "OtherAddressID", oSelectAddressType.OtherAddressID); /*DNL*/
                                        oService.SetParamValue(params, "OtherAddressText", oSelectAddressType.OtherAddressText); /*DNL*/
                                        break;
                                    case ModalResult.resCancel:
                                        oService.SetParamValue(params, "Canceled", true); /*DNL*/
                                        break;
                                }
                                oService.SetParamValue(params, "Success", true); /*DNL*/

                            }
                            finally {
                                oSelectAddressType.DestroyWindow();
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestSelectAddressType(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestSelectAddressType()"); /*DNL*/
                    }
                }
            },
            HandleOnRequestViewGroup: function (groupId, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnRequestViewGroup()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            var oContext = oService.GetContext();
                            if (oContext) {
                                var sEntity = (oContext.EntityIsLead) ? "Lead" : "Contact"; /*DNL*/
                                var sUrl = dString.substitute("${0}/${1}.aspx?gid=${2}&modeid=list", [oService.GetClientPath(), sEntity, groupId]);
                                window.setTimeout(dString.substitute("window.location='${0}';", [sUrl]), 1500);
                                oService.SetParamValue(params, "Success", true); /*DNL*/
                            }
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnRequestViewGroup(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnRequestViewGroup()"); /*DNL*/
                    }
                }
            },
            /* Used for Sales Processes only. */
            HandleOnSelectPrinter: function (caption, params) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    oService.Debug("Entering HandleOnSelectPrinter()"); /*DNL*/
                    try {
                        try {
                            oService.SetParamValue(params, "Error", ""); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                            oService.SetParamValue(params, "Canceled", false); /*DNL*/
                            oService.SetParamValue(params, "Printer", ""); /*DNL*/
                            var arrResult = oService.SelectPrinter(caption);
                            oService.SetParamValue(params, "Canceled", arrResult[PrinterResult.prCanceled]); /*DNL*/
                            oService.SetParamValue(params, "Printer", arrResult[PrinterResult.prPrinterName]); /*DNL*/
                            oService.SetParamValue(params, "Success", arrResult[PrinterResult.prSuccess]); /*DNL*/
                        }
                        catch (err) {
                            oService.Debug("ERROR in HandleOnSelectPrinter(): " + oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                            oService.SetParamValue(params, "Success", false); /*DNL*/
                        }
                    }
                    finally {
                        oService.Debug("Exiting HandleOnSelectPrinter()"); /*DNL*/
                    }
                }
            },
            HandleOnShowProgress: function (
                message1, message2, message3, progressHandlerWnd, progressMax,
                progressPosition, progressTotalPosition, enableCancel, showProgress) {
                var oService = Helper.GetMailMergeService();
                if (oService) {
                    var oDialog = oService.ProgressDlg();
                    if (oDialog) {
                        oDialog.OwnerWnd = progressHandlerWnd;
                        oDialog.Message1 = message1;
                        oDialog.Message2 = message2;
                        oDialog.Message3 = message3;
                        oDialog.ProgressHandlerWnd = progressHandlerWnd;
                        oDialog.ProgressMax = progressMax;
                        oDialog.ProgressPosition = progressPosition;
                        oDialog.ProgressTotalPosition = progressTotalPosition;
                        oDialog.EnableCancel = enableCancel;
                        oDialog.ShowProgress = showProgress;
                        oDialog.Show();
                    }
                }
            },
            AddCookies: function (obj) {
                /* This will add the X-Sage-SalesLogix-Cookies header value.
                * These values are used by Firefox for HTTP authentication
                * within the mail merge ActiveX controls. Internet Explorer
                * adds these cookies to the HTTP request automatically.
                * These values [cannot] be used as-is to set the header value
                * and they can only be understood and processed by the ActiveX. */
                if (!dojo.isIE) {
                    if (typeof obj.AddCookie == "function" && typeof obj.ClearCookies == "function") {
                        var oCookies = this.GetCookies();
                        if (oCookies != null) {
                            obj.ClearCookies();
                            if (dojo.isString(oCookies.SessionId) && oCookies.SessionId !== "") {
                                obj.AddCookie("ASP.NET_SessionId", oCookies.SessionId); /*DNL*/
                            }
                            if (dojo.isString(oCookies.SlxAuth) && oCookies.SlxAuth !== "") {
                                obj.AddCookie(".SLXAUTH", oCookies.SlxAuth); /*DNL*/
                            }
                            if (dojo.isString(oCookies.SlxWeb) && oCookies.SlxWeb !== "") {
                                obj.AddCookie("slxweb", oCookies.SlxWeb); /*DNL*/
                            }
                            if (dojo.isString(oCookies.LogonUser) && oCookies.LogonUser !== "") {
                                obj.AddCookie(".LOGON_USER", oCookies.LogonUser); /*DNL*/
                            }
                            if (dojo.isString(oCookies.UserName) && oCookies.UserName !== "") {
                                obj.AddCookie("X-UserName:" + oCookies.UserName, oCookies.UserValue); /*DNL*/
                            }
                        }
                    }
                }
            },
            AddNewSubMenuItem: function (menu, pluginId, caption, url, enabled) {
                var oTargetMenu = this.GetMruMenu(menu);
                if (oTargetMenu && oTargetMenu.popup) {
                    var oSubMenuItems = oTargetMenu.popup.getChildren();
                    if (oSubMenuItems) {
                        if (oSubMenuItems.length == 1) {
                            oTargetMenu.popup.addChild(new MenuSeparator({}));
                        }
                        var sUrl = url;
                        if (typeof sUrl === "undefined") {
                            var sWriteAction = "javascript:Sage.MailMerge.Helper.ExecuteWriteAction(WriteAction.waWrite${0}Using, '${1}')";
                            var arrAction = ["Email", "Fax", "Letter"]; /*DNL*/
                            sUrl = dString.substitute(sWriteAction, [arrAction[menu], pluginId]);
                        }
                        var bEnabled = true;
                        if (typeof enabled === "boolean") {
                            bEnabled = enabled;
                        }
                        var oMenuItem = new MenuItem({
                            label: caption,
                            ref: sUrl,
                            onClick: function () {
                                window.location.href = this.ref;
                            }
                        });
                        oMenuItem.disabled = !bEnabled;
                        oTargetMenu.popup.addChild(oMenuItem);
                    }
                }
            },
            CloseMenus: function () {
                /* No longer required; dojo menus close ok when focus changes. */
            },
            Debug: function (msg, source) {
                var sMsg;
                if (typeof source === "undefined") {
                    /* The msg is from the MailMerge.Service. */
                    var dtNow = new Date();
                    var sDateTime = this.MailMergeGUI().DateTimeToStr(dtNow);
                    sMsg = dString.substitute("MailMerge.Service: ${0} : ${1}", [sDateTime, msg]); /*DNL*/
                }
                else {
                    /* The msg is from the MailMergeEngine (or other source). */
                    sMsg = dString.substitute("${0}: ${1}", [source, msg]);
                }
                this.MailMergeGUI().Debug(sMsg);
                try {
                    if (window.console) {
                        console.log(sMsg);
                    }
                }
                catch (e) {
                }
            },
            DisplayError: function (errobj) {
                var sError = this.FormatError(errobj);
                this.ShowError(sError);
            },
            ExcelInstalled: function () {
                if (this.__ExcelInstalled == null) {
                    try {
                        var oExcelApp = this.NewActiveXObject("Excel.Application");
                        this.__ExcelInstalled = true;
                        try {
                            oExcelApp.Quit();
                            // ReSharper disable AssignedValueIsNeverUsed
                            oExcelApp = null;
                            // ReSharper restore AssignedValueIsNeverUsed
                        }
                        catch (e) {
                        }
                    }
                    catch (err) {
                        this.__ExcelInstalled = false;
                    }
                }
                return this.__ExcelInstalled;
            },
            ExportToExcel: function (groupId, useGroupContext) {
                try {
                    this.CloseMenus();
                    if (!this.ExcelInstalled()) {
                        throw new Error(Helper.DesktopErrors().ExcelNotInstalled || "Excel not installed.");
                    }
                    require(['Sage/Groups/ExcelExport'], function () {
                        var oExcelExport = new Sage.Groups.ExcelExport(groupId, useGroupContext);
                        oExcelExport.Execute();
                    });
                }
                catch (err) {
                    var sXtraMsg = "";
                    if (Helper.IsSageGearsObjectError(err)) {
                        sXtraMsg = Helper.DesktopErrors().SageGearsObjectError;
                    }
                    var sError = (typeof err.toMessage === "function") ? err.toMessage(sXtraMsg, Helper.MailMergeInfoStore().ShowJavaScriptStack) : err.message;
                    Dialogs.showError(dString.substitute(Helper.DesktopErrors().ExportToExcelError, [sError]));
                }
            },
            FindParamValue: function (params, name) {
                if (params.Exists(name)) {
                    return true;
                }
                return false;
            },
            FormatError: function (errobj) {
                if (errobj) {
                    var sError = (typeof errobj.toMessage === "function") ? errobj.toMessage(Helper.DesktopErrors().UnexpectedError, Helper.MailMergeInfoStore().ShowJavaScriptStack) : errobj.message;
                    return sError;
                }
                return null;
            },
            FulfillLitRequest: function (litReqId) {
                var lrResult = [false, false, ""];
                try {
                    var sUrl = dString.substitute("${0}/SlxLitRequest.aspx?method=GetLitReqInfo&litReqId=${1}", [this.GetClientPath(), litReqId]);
                    var sResult = this.GetFromServer(sUrl);
                    if (dojo.isString(sResult) && sResult !== "") {
                        var arrLitReqInfo = sResult.split("|");
                        if (dojo.isArray(arrLitReqInfo) && arrLitReqInfo.length == 6) {
                            var i;
                            var bCanceled, bSuccess;
                            var sUserId = String(arrLitReqInfo[0]).trim();
                            var sSendVia = arrLitReqInfo[1];
                            var sCoverId = arrLitReqInfo[2];
                            var sCoverName = arrLitReqInfo[3];
                            var sContactId = arrLitReqInfo[4];
                            var iPrintOption = Number(arrLitReqInfo[5]);
                            sUrl = dString.substitute("${0}/SlxLitRequest.aspx?method=GetLiteratureList&litReqId=${1}", [this.GetClientPath(), litReqId]);
                            sResult = this.GetFromServer(sUrl);
                            if (dojo.isString(sResult) && sResult !== "") {
                                var arrLiterature;
                                var bSendViaEmail = false;
                                var arrLiteratureItems = sResult.split("|");
                                if (dojo.isArray(arrLiteratureItems)) {
                                    arrLiterature = new Array(arrLiteratureItems.length);
                                    for (i = 0; i < arrLiterature.length; i++) {
                                        arrLiterature[i] = new Array(2);
                                    }
                                    for (i = 0; i < arrLiteratureItems.length; i++) {
                                        var arrLiteraturePair = arrLiteratureItems[i].split("=");
                                        if (dojo.isArray(arrLiteraturePair) && (arrLiteraturePair.length == 2)) {
                                            arrLiterature[i][0] = arrLiteraturePair[0]; /* Name */
                                            arrLiterature[i][1] = arrLiteraturePair[1]; /* Count */
                                        }
                                    }
                                    var bPrintLiterature = true;
                                    switch (iPrintOption) {
                                        case PrintOption.poWithCoverLetter:
                                        case PrintOption.poOnlyCoverLetter:
                                            if (dojo.isString(sSendVia)) {
                                                /* Look for both localized and non-localized values. */
                                                var arrEmailStrings = [
                                                    Helper.MailMergeInfoStore().Resources.SendViaEmail1,
                                                    Helper.MailMergeInfoStore().Resources.SendViaEmail2,
                                                    "EMAIL", /*DNL*/
                                                    "E-MAIL"]; /*DNL*/
                                                var oRegExp = new RegExp(sSendVia, "i");
                                                for (i = 0; i < arrEmailStrings.length; i++) {
                                                    var sMatch = String(arrEmailStrings[i]).match(oRegExp);
                                                    if (sMatch != null) {
                                                        /* This is an e-mail mail merge; the user does not have to select a printer. */
                                                        bSendViaEmail = true;
                                                        bPrintLiterature = false;
                                                        break;
                                                    }
                                                }
                                            }
                                            break;
                                    }
                                    var sPrinterName = "";
                                    /* Get the printer name, if necessary. */
                                    if (bPrintLiterature) {
                                        var oContext = this.GetContext();
                                        if (oContext) {
                                            var LITREQUESTPRINTER = "LitRequestPrinterName"; /*DNL*/
                                            var sLitRequestPrinter = oContext.GetClientContext(LITREQUESTPRINTER, true);
                                            if (dojo.isString(sLitRequestPrinter) && sLitRequestPrinter !== "") {
                                                sPrinterName = sLitRequestPrinter;
                                            }
                                            else {
                                                var arrPrinterResult = this.SelectPrinter(Helper.MailMergeInfoStore().Resources.SelectPrinter);
                                                if (dojo.isArray(arrPrinterResult)) {
                                                    bCanceled = arrPrinterResult[PrinterResult.prCanceled];
                                                    bSuccess = arrPrinterResult[PrinterResult.prSuccess];
                                                    if (bCanceled) {
                                                        lrResult[LitReqResult.lrCanceled] = true;
                                                        return lrResult;
                                                    }
                                                    else {
                                                        if (bSuccess) {
                                                            sPrinterName = arrPrinterResult[PrinterResult.prPrinterName];
                                                            oContext.SetClientContext(LITREQUESTPRINTER, sPrinterName);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                        if (dojo.isString(sPrinterName) && sPrinterName === "") {
                                            lrResult[LitReqResult.lrError] = Helper.DesktopErrors().PrinterNameError;
                                            return lrResult;
                                        }
                                    } /* end if (bPrintLiterature) {} */
                                    /* Is a mail merge required? */
                                    if (iPrintOption != PrintOption.poOnlyAttachmentList) {
                                        var oQuery = new Object();
                                        oQuery.coverId = sCoverId;
                                        oQuery.coverName = sCoverName;
                                        oQuery.userId = sUserId;
                                        var sQuery = this.SimpleUrlEncode(oQuery);
                                        sUrl = dString.substitute("${0}/SlxLitRequest.aspx?method=GetPluginId&${1}", [this.GetClientPath(), sQuery]);
                                        var sPluginId = this.GetFromServer(sUrl);
                                        this.Debug("FulfillLitRequest: COVERID = " + sCoverId + "; PLUGINID = " + sPluginId); /*DNL*/
                                        if (sPluginId == "") {
                                            lrResult[LitReqResult.lrError] = dString.substitute(Helper.DesktopErrors().LitRequestTemplateError, [sCoverName, sUserId]);
                                            return lrResult;
                                        }
                                        var oMailMergeInfo = new this.MailMergeInformation();
                                        oMailMergeInfo.BaseTable = "CONTACT"; /*DNL*/
                                        oMailMergeInfo.DoHistory = false;
                                        oMailMergeInfo.EditAfter = false;
                                        oMailMergeInfo.EditBefore = false;
                                        oMailMergeInfo.EntityIds = sContactId;
                                        oMailMergeInfo.MergeAsUserId = sUserId;
                                        oMailMergeInfo.MergeSilently = false;
                                        oMailMergeInfo.MergeWith = MergeWith.withEntityIds;
                                        oMailMergeInfo.TemplatePluginId = sPluginId;
                                        if (bSendViaEmail) {
                                            oMailMergeInfo.OutputTo = OutputType.otEmail;
                                            oMailMergeInfo.UseTemplateDocProperties = true;
                                        }
                                        else {
                                            oMailMergeInfo.OutputTo = OutputType.otPrinter;
                                            oMailMergeInfo.PrinterName = sPrinterName;
                                        }
                                        for (i = 0; i < arrLiterature.length; i++) {
                                            var sName = arrLiterature[i][0];
                                            var iCount = arrLiterature[i][1];
                                            oMailMergeInfo.AddEnclosure(iCount, sName);
                                        }
                                        var arrEngineResult = oMailMergeInfo.ExecuteMailMerge(true);
                                        bCanceled = arrEngineResult[EngineResult.erCanceled];
                                        if (bCanceled) {
                                            lrResult[LitReqResult.lrCanceled] = true;
                                            return lrResult;
                                        }
                                        bSuccess = arrEngineResult[EngineResult.erSuccess];
                                        if (!bSuccess) {
                                            var sError = arrEngineResult[EngineResult.erError];
                                            if (sError == "") {
                                                sError = Helper.DesktopErrors().UnknownEngineError;
                                            }
                                            lrResult[LitReqResult.lrError] = sError;
                                            return lrResult;
                                        }
                                    }
                                    /* Do we need to print the attachment list using Microsoft Word? */
                                    if (iPrintOption == PrintOption.poOnSeparatePage || iPrintOption == PrintOption.poOnlyAttachmentList) {
                                        var oWordApp = this.NewActiveXObject("Word.Application");
                                        oWordApp.Visible = false;
                                        oWordApp.DisplayAlerts = false;
                                        oWordApp.Documents.Add();
                                        oWordApp.Selection.TypeText(Helper.MailMergeInfoStore().Resources.Enclosure);
                                        oWordApp.Selection.TypeParagraph();
                                        oWordApp.Selection.TypeParagraph();
                                        for (i = 0; i < arrLiterature.length; i++) {
                                            var sEnclosure = dString.substitute("(${0}) ${1}", [arrLiterature[i][1], arrLiterature[i][0]]);
                                            oWordApp.Selection.TypeText(sEnclosure);
                                            oWordApp.Selection.TypeParagraph();
                                        }
                                        var sDefaultPrinter = oWordApp.ActivePrinter;
                                        var bResetToDefault = false;
                                        sPrinterName = this.MailMergeGUI().GetPrinterNameWithPort(sPrinterName);
                                        if (sPrinterName.toUpperCase() != sDefaultPrinter.toUpperCase()) {
                                            oWordApp.ActivePrinter = sPrinterName;
                                            bResetToDefault = true;
                                        }
                                        oWordApp.Options.PrintBackground = false;
                                        oWordApp.ActiveDocument.PrintOut();
                                        if (bResetToDefault) {
                                            if (oWordApp.ActivePrinter != sDefaultPrinter) {
                                                oWordApp.ActivePrinter = sDefaultPrinter;
                                            }
                                        }
                                        var iSaveChanges = 0; /* wdDoNotSaveChanges */
                                        var iOriginalFormat = 1; /* wdOriginalDocumentFormat */
                                        var bRouteDocument = false;
                                        oWordApp.Quit(iSaveChanges, iOriginalFormat, bRouteDocument);
                                    }
                                    lrResult[LitReqResult.lrSuccess] = true;
                                    lrResult[LitReqResult.lrEntityId] = sContactId;
                                }
                                else {
                                    lrResult[LitReqResult.lrError] = Helper.DesktopErrors().LitRequestLiteratureError;
                                }
                            }
                            else {
                                lrResult[LitReqResult.lrError] = Helper.DesktopErrors().LitRequestLiteratureItemsError;
                            }
                        }
                        else {
                            lrResult[LitReqResult.lrError] = Helper.DesktopErrors().LitRequestInfoError;
                        }
                    }
                    else {
                        lrResult[LitReqResult.lrError] = Helper.DesktopErrors().LitRequestInfoEmptyError;
                    }
                }
                catch (err) {
                    lrResult[LitReqResult.lrError] = this.FormatError(err);
                }
                return lrResult;
            },
            GetActivityInfo: function (type, entityId, historyId, opportunityId, notes, leader, mainTable, ticketId, params) {
                var self = this;
                var fnGetAccountId = function (id) {
                    return self.GetSingleValue("ACCOUNTID", "CONTACT", "CONTACTID", id);
                };
                var fnGetAccountName = function (id) {
                    return self.GetSingleValue("ACCOUNT", "CONTACT", "CONTACTID", id);
                };
                var fnGetContactName = function (id) {
                    return self.GetSingleValue("NAMELF", "CONTACT", "CONTACTID", id);
                };
                var fnGetOpportunityName = function (id) {
                    if (id == "")
                        return null;
                    return self.GetSingleValue("DESCRIPTION", "OPPORTUNITY", "OPPORTUNITYID", id);
                };
                var fnGetTicketNumber = function (id) {
                    if (id == "")
                        return null;
                    return self.GetSingleValue("TICKETNUMBER", "TICKET", "TICKETID", id);
                };
                var fnGetLeadName = function (id) {
                    return self.GetSingleValue("LEADNAMELF", "LEAD", "LEADID", id);
                };
                var fnGetLeadCompanyName = function (id) {
                    return self.GetSingleValue("COMPANY", "LEAD", "LEADID", id);
                };
                var sMainTable = mainTable.toUpperCase();
                var bContact = (sMainTable == "CONTACT");
                var sContactId = (bContact) ? entityId : null;
                var sContactName = (bContact) ? fnGetContactName(entityId) : null;
                var sAccountId = (bContact) ? fnGetAccountId(entityId) : null;
                var sAccountName = (bContact) ? fnGetAccountName(entityId) : fnGetLeadCompanyName(entityId);
                var sOpportunityName = fnGetOpportunityName(opportunityId);
                var sTicketNumber = fnGetTicketNumber(ticketId);
                var sLeadId = (!bContact) ? entityId : null;
                var sLeadName = (!bContact) ? fnGetLeadName(entityId) : null;
                var sRegarding = this.GetParamValue(params, "Regarding");
                var args = {
                    "AllowEdit": true,
                    "ContactId": sContactId,
                    "ContactName": sContactName,
                    "AccountId": sAccountId,
                    "AccountName": sAccountName,
                    "HistoryExists": false,
                    "OpportunityId": opportunityId,
                    "OpportunityName": sOpportunityName,
                    "TicketId": ticketId,
                    "TicketNumber": sTicketNumber,
                    "LeadId": sLeadId,
                    "LeadName": sLeadName,
                    "Timeless": true,
                    "Leader": { "$key": leader, "$descriptor": self.TranslateUserId(leader, true) },
                    "Description": sRegarding,
                    "Notes": notes,
                    "LongNotes": notes,
                    "MailMergeTempHistoryId": historyId
                };
                if (typeof console !== "undefined") {
                    console.debug("GetActivityInfo(): %o", args);
                }
                return args;
            },
            GetClientPath: function () {
                var sLocation = String(window.location);
                var iIndex = sLocation.lastIndexOf("/");
                if (iIndex != -1) {
                    return sLocation.substring(0, iIndex);
                }
                throw new Error(Helper.DesktopErrors().GetClientPathError);
            },
            GetConnectionString: function () {
                return this.GetClientPath() + "/SLXMailMergeServer.ashx";
            },
            GetCookies: function () {
                if (!dojo.isIE) {
                    if (this.__MailMergeCookies != null)
                        return this.__MailMergeCookies;
                    var sPath = this.GetClientPath();
                    if (sPath != null) {
                        var sUrl = dString.substitute("${0}/SLXMailMergeClient.ashx?method=GetHttpInfo", [sPath]);
                        var sResponse = this.GetFromServer(sUrl);
                        if (dojo.isString(sResponse) && sResponse !== "") {
                            var oCookies = ref.fromJson(sResponse);
                            if (oCookies != null) {
                                this.__MailMergeCookies = oCookies;
                                return this.__MailMergeCookies;
                            }
                        }
                    }
                }
                return null;
            },
            GetFromServer: function (url) {
                var sResponse = "";
                var self = this;
                dojo.xhrGet({
                    url: url,
                    preventCache: true,
                    handleAs: "text",
                    sync: true,
                    load: function (data) {
                        sResponse = data;
                        if ((sResponse.indexOf("Error") > -1) && (sResponse.indexOf("Error") < 3)) { /*DNL*/
                            self.ShowError(sResponse);
                            sResponse = "";
                        }
                    },
                    error: function (error, ioargs) {
                        Utility.ErrorHandler.handleHttpError(error, ioargs);
                    }
                });
                return sResponse;
            },
            GetContext: function () {
                if (Sage && Sage.Services) {
                    return Sage.Services.getService("MailMergeContextService");
                }
                return null;
            },
            GetEntityId: function (onComplete) {
                var oContext = this.GetContext();
                if (oContext) {
                    oContext.Refresh();

                    if ((oContext.EntityIsLead || oContext.EntityIsContact) & oContext.IsDetailMode) {
                        if (typeof onComplete === "function") {
                            onComplete(true);
                        }
                        return;
                    }

                    var sContactId;
                    var sEntityDescription;
                    var sUrl;
                    var self = this;

                    var fnShowLookup = function (options, lookupCallback) {
                        var oLookup;
                        var fnOnSelect = function (items) {
                            oLookup.destroy();
                            if (dojo.isArray(items)) {
                                var sResult = items[0].$key;
                                if (dojo.isString(sResult)) {
                                    if (typeof lookupCallback === "function") {
                                        lookupCallback(sResult);
                                    }
                                }
                            }
                        };
                        var fnOnCancel = function () {
                            oLookup.destroy();
                        };
                        var oLookupOptions = {
                            onSelect: fnOnSelect,
                            onCancel: fnOnCancel,
                            maintable: options.maintable || "CONTACT",
                            seedProperty: options.seedProperty || "",
                            seedValue: options.seedValue || "",
                            initializeLookup: true,
                            preFilters: [],
                            title: options.title || self.selectContactCaption,
                            isListView: options.isListView || false,
                            modal: true
                        };
                        oLookup = dijit.byId("LookupMailMergeEntity");
                        if (oLookup) {
                            oLookup.destroyRecursive();
                        }
                        oLookup = new Lookup(oLookupOptions);
                        oLookup.show();
                    };

                    /* If the current entity is an Account, Opportunity, or Ticket then grab a Contact if no more than one exists. */
                    if ((oContext.EntityIsAccount || oContext.EntityIsOpportunity || oContext.EntityIsTicket) & oContext.IsDetailMode) {
                        sUrl = dString.substitute("${0}getconid&id=${1}&singleonly=true", [this.GetInfoBrokerUrl(), oContext.EntityId]);
                        sContactId = this.GetFromServer(sUrl);
                        if (sContactId != "") {
                            var sAccountId = oContext.EntityIsAccount ? oContext.EntityId : "";
                            var sOpportunityId = oContext.EntityIsOpportunity ? oContext.EntityId : "";
                            var sTicketId = oContext.EntityIsTicket ? oContext.EntityId : "";
                            sUrl = dString.substitute("${0}getconname&id=${1}", [this.GetInfoBrokerUrl(), sContactId]);
                            sEntityDescription = this.GetFromServer(sUrl);
                            oContext.SetDetailContext(sContactId, "CONTACT", sEntityDescription, sAccountId, sOpportunityId, sTicketId); /*DNL*/
                            if (typeof onComplete === "function") {
                                onComplete(true);
                            }
                            return;
                        }
                    }
                    /* Are we on an Account with more than one Contact? */
                    if (oContext.EntityIsAccount & oContext.IsDetailMode) {
                        var fnHandleAccountDetail = function (id) {
                            sUrl = dString.substitute("${0}getconname&id=${1}", [self.GetInfoBrokerUrl(), id]);
                            sEntityDescription = self.GetFromServer(sUrl);
                            oContext.SetDetailContext(id, "CONTACT", sEntityDescription, oContext.EntityId, null, null); /*DNL*/
                            if (typeof onComplete === "function") {
                                onComplete(true);
                            }
                        };
                        fnShowLookup({ maintable: "CONTACT", seedProperty: "Account.Id", seedValue: oContext.EntityId, title: this.selectContactCaption, isListView: false }, fnHandleAccountDetail);
                        return;
                    }
                    /* Are we on an Opportunity with more than one Contact? */
                    if (oContext.EntityIsOpportunity & oContext.IsDetailMode) {
                        var fnHandleOpportunityDetail = function (id) {
                            sUrl = dString.substitute("${0}getconid&id=${1}", [self.GetInfoBrokerUrl(), id]);
                            sContactId = self.GetFromServer(sUrl);
                            if (sContactId != "") {
                                sUrl = dString.substitute("${0}getconname&id=${1}", [self.GetInfoBrokerUrl(), sContactId]);
                                sEntityDescription = self.GetFromServer(sUrl);
                                oContext.SetDetailContext(sContactId, "CONTACT", sEntityDescription, null, oContext.EntityId, null); /*DNL*/
                                if (typeof onComplete === "function") {
                                    onComplete(true);
                                }
                            }
                        };
                        fnShowLookup({ maintable: "OPPORTUNITY", seedProperty: "Opportunity.Id", seedValue: oContext.EntityId, title: this.selectOppContactCaption, isListView: false }, fnHandleOpportunityDetail);
                        return;
                    }
                    /* Are we on a list view? */
                    if (!oContext.EntityIsOpportunity) {
                        var opt = { maintable: "CONTACT", title: this.selectContactCaption, isListView: true };
                        if (oContext.EntityIsLead) {
                            opt.maintable = "LEAD";
                            opt.title = this.selectLeadCaption;
                        }
                        var fnHandleListView = function (id) {
                            var sEntityTableName = oContext.EntityIsLead ? "LEAD" : "CONTACT"; /*DNL*/
                            sUrl = dString.substitute("${0}${1}&id=${2}", [self.GetInfoBrokerUrl(), oContext.EntityIsLead ? "getleadname" : "getconname", id]);
                            sEntityDescription = self.GetFromServer(sUrl);
                            oContext.SetDetailContext(id, sEntityTableName, sEntityDescription, null, null, null);
                            if (typeof onComplete === "function") {
                                onComplete(true);
                            }
                        };
                        fnShowLookup(opt, fnHandleListView);
                        return;
                    }
                    else {
                        var fnHandleOpportunityListView = function (id) {
                            sUrl = dString.substitute("${0}getconid&id=${1}", [self.GetInfoBrokerUrl(), id]);
                            sContactId = self.GetFromServer(sUrl);
                            if (sContactId != "") {
                                sUrl = dString.substitute("${0}getconname&id=${1}", [self.GetInfoBrokerUrl(), sContactId]);
                                sEntityDescription = self.GetFromServer(sUrl);
                                oContext.SetDetailContext(sContactId, "CONTACT", sEntityDescription, null, oContext.EntityId, null); /*DNL*/
                                if (typeof onComplete === "function") {
                                    onComplete(true);
                                }
                            }
                        };
                        fnShowLookup({ maintable: "OPPORTUNITY", title: this.selectOppContactCaption, isListView: true }, fnHandleOpportunityListView);
                        return;
                    }
                }
                if (typeof onComplete === "function") {
                    onComplete(false);
                }
            },
            GetMainTableAlias: function (fromSql) {
                var sSql = String(fromSql);
                var iPosition = sSql.indexOf(" ");
                if (iPosition != -1) {
                    var iLength = sSql.length;
                    var sAlias = sSql.substring(iPosition + 1, iLength);
                    iPosition = sAlias.indexOf(" ");
                    if (iPosition != -1) {
                        sAlias = sAlias.substring(0, iPosition);
                    }
                    return sAlias.trim();
                }
                throw new Error(Helper.DesktopErrors().GetMainTableAliasError);
            },
            GetMenuByCaption: function (caption) {
                var oToolbar = dijit.byId("ToolBar");
                if (oToolbar) {
                    var oMenuBarItems = oToolbar.getChildren();
                    if (oMenuBarItems) {
                        var sWriteMenuLabel = Helper.MailMergeInfoStore().Resources.Write;
                        for (var i = 0; i < oMenuBarItems.length; i++) {
                            if (oMenuBarItems[i].label == sWriteMenuLabel) {
                                var oWriteMenu = oMenuBarItems[i];
                                if (oWriteMenu.popup) {
                                    var oWriteMenuItems = oWriteMenu.popup.getChildren();
                                    if (oWriteMenuItems) {
                                        for (var x = 0; x < oWriteMenuItems.length; x++) {
                                            var oTargetMenu = oWriteMenuItems[x];
                                            if (oTargetMenu.label == caption) {
                                                return oTargetMenu;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return null;
            },
            GetMruMenu: function (menu) {
                var arrMenuLabels = new Array(3);
                arrMenuLabels[0] = Helper.MailMergeInfoStore().Resources.EmailUsingTemplate;
                arrMenuLabels[1] = Helper.MailMergeInfoStore().Resources.FaxUsingTemplate;
                arrMenuLabels[2] = Helper.MailMergeInfoStore().Resources.LetterUsingTemplate;
                var sMenuLabel = arrMenuLabels[menu];
                return this.GetMenuByCaption(sMenuLabel);
            },
            GetNewMailMergeEngine: function () {
                this.Debug("Entering GetNewMailMergeEngine()"); /*DNL*/
                try {
                    var oMailMergeEngine = this.NewActiveXObject("SLXMMEngineW.MailMergeEngine");
                    this.ConnectEvents(oMailMergeEngine, WhichEvents.weMailMergeEngine);
                    this.SetDefaultProperties(oMailMergeEngine, WhichProperties.wpMailMergeEngine);
                    return oMailMergeEngine;
                }
                finally {
                    this.Debug("Exiting GetNewMailMergeEngine()"); /*DNL*/
                }
            },
            GetGroupManagerUrl: function () {
                return this.GetClientPath() + "/SLXGroupManager.aspx?action=";
            },
            GetInfoBrokerUrl: function () {
                return this.GetClientPath() + "/SLXInfoBroker.aspx?info=";
            },
            GetNullDate: function () {
                var dDate = new Date();
                dDate.setYear(1899);
                dDate.setMonth(11);
                dDate.setDate(30);
                dDate.setHours(0);
                dDate.setMinutes(0);
                dDate.setSeconds(0);
                dDate.setMilliseconds(0);
                return dDate;
            },
            GetParamValue: function (params, name) {
                if (params.Exists(name)) {
                    var oParam = params.Find(name);
                    if (oParam != null) {
                        return oParam.Value;
                    }
                }
                return null;
            },
            GetPersonalDataPath: function () {
                return this.MailMergeGUI().GetPersonalDataPath();
            },
            GetReportingEnabled: function () {
                var sUrl = this.GetReportingUrl();
                return ((dojo.isString(sUrl) && sUrl !== "") || Helper.MailMergeInfoStore().RemoteInfo.UseActiveReporting);
            },
            GetReportingUrl: function () {
                var oContext = this.GetContext();
                if (oContext) {
                    /* Data from ServiceHosts.xml is loaded into the client context within ServiceHostsModule.cs. */
                    var SLXWEBRPT = "SLXWEBRPT"; /*DNL*/
                    if (oContext.HasClientContext(SLXWEBRPT, true)) {
                        var sReportingUrl = oContext.GetClientContext(SLXWEBRPT, true);
                        if (dojo.isString(sReportingUrl) && sReportingUrl !== "") {
                            var sLastChar = sReportingUrl.charAt(sReportingUrl.length - 1);
                            if (sLastChar == "/") {
                                sReportingUrl = sReportingUrl.substring(0, sReportingUrl.length - 1);
                            }
                            return dString.substitute("${0}/SLXWebReportingServer.ashx?method=GenerateReport", [sReportingUrl]);
                        }
                    }
                }
                return "";
            },
            GetScheduleFollowUpUrl: function (followUpInfo) {
                if (followUpInfo != null) {
                    var args = new Object();
                    args["type"] = followUpInfo.FollowUpType;
                    args["historyid"] = followUpInfo.HistoryId;
                    args["carryovernotes"] = followUpInfo.CarryOverNotes;
                    args["aid"] = followUpInfo.AccountId;
                    args["cid"] = followUpInfo.ContactId;
                    args["oid"] = followUpInfo.OpportunityId;
                    args["tid"] = followUpInfo.TicketId;
                    args["lid"] = followUpInfo.LeadId;
                    var sUrl = dString.substitute("javascript:Sage.Link.scheduleActivity(${0});", [Sys.Serialization.JavaScriptSerializer.serialize(args)]);
                    return sUrl;
                }
                return null;
            },
            GetSingleValue: function (fieldName, tableName, keyField, keyValue) {
                var sUrl = dString.substitute("${0}GetSingleValue&item=${1}&entity=${2}&idfield=${3}&id=${4}",
                    [this.GetInfoBrokerUrl(), fieldName, tableName, keyField, keyValue]);
                var sResult = this.GetFromServer(sUrl);
                return sResult;
            },
            GetUserPreference: function (name, category) {
                var sUrl = dString.substitute("${0}userpref&prefname=${1}&prefcategory=${2}", [this.GetInfoBrokerUrl(), name, category]);
                return this.GetFromServer(sUrl);
            },
            HasParam: function (params, name) {
                if (params) {
                    var oParam = params.IndexOf(name);
                    if (oParam) {
                        return true;
                    }
                }
                return false;
            },
            HookActivityDialog: function (historyId, info) {
                var oDialog = dijit.byId("activityEditor");
                if (oDialog) {
                    var bCreated = false;
                    var hOnCancelClick = null;
                    var hOnCancel = null;
                    var self = this;
                    var oData =
                    {
                        "Canceled": false,
                        "Description":
                            {
                                "Original": "",
                                "Current": ""
                            },
                        "HistoryId":
                            {
                                "Original": "",
                                "Current": ""
                            },
                        "OpportunityId": "",
                        "TicketId": ""
                    };
                    var hHistoryCreate = dojo.subscribe("/entity/history/create", function (hist, scope) {
                        if (typeof scope !== 'undefined' && scope && scope === self) {
                            /*
                            The /entity/history/create event is published via Sage.MailMerge.Service.MergeFromSlxDocument().
                            Make sure the event is not being published from there.
                            */
                            return;
                        }
                        fnDisconnect();
                        if (bCreated) {
                            return;
                        }
                        bCreated = true;
                        var sOpportunityId = "";
                        var sTicketId = "";
                        var sNewHistoryId = "";
                        var sNewDescription = info.Description;
                        if (typeof hist === "object") {
                            sNewHistoryId = hist.$key || "";
                            sNewDescription = hist.Description || sNewDescription;
                            sOpportunityId = hist.OpportunityId || "";
                            sTicketId = hist.TicketId || "";
                        }
                        else if (dojo.isString(hist) && hist.length == 12) {
                            sNewHistoryId = hist;
                            sNewDescription = self.GetSingleValue("DESCRIPTION", "HISTORY", "HISTORYID", sNewHistoryId);
                            sOpportunityId = self.GetSingleValue("OPPORTUNITYID", "HISTORY", "HISTORYID", sNewHistoryId);
                            sTicketId = self.GetSingleValue("TICKETID", "HISTORY", "HISTORYID", sNewHistoryId);
                        }
                        oData.Description.Original = info.Description;
                        oData.Description.Current = sNewDescription;
                        oData.HistoryId.Original = historyId;
                        oData.HistoryId.Current = sNewHistoryId;
                        oData.OpportunityId = sOpportunityId;
                        oData.TicketId = sTicketId;
                        self.UpdateAttachmentRecord(oData);
                    });
                    var hAttachmentCreate = dojo.subscribe("/entity/attachment/create", function (attachment, scope) {
                        if (typeof scope !== 'undefined' && scope && scope === self) {
                            /*
                            The /entity/attachment/create event is published via Sage.MailMerge.Service.MergeFromSlxDocument().
                            Make sure the event is not being published from there.
                            */
                            return;
                        }
                        var oSDataService = Sage.Data.SDataServiceRegistry.getSDataService("system");
                        var oUpdate = new Sage.SData.Client.SDataSingleResourceRequest(oSDataService);
                        oUpdate.setResourceKind("attachments");
                        oUpdate.setResourceSelector("'" + attachment.$key + "'");
                        var data = {
                            "$key": attachment.$key,
                            "$etag": attachment.$etag,
                            "accountId": info.AccountId,
                            "contactId": info.ContactId,
                            "opportunityId": info.OpportunityId,
                            "leadId": info.LeadId,
                            "ticketId": info.TicketId,
                            "historyId": info.MailMergeTempHistoryId
                        };
                        oUpdate.update(data, {
                            success: function (entry) {
                                dojo.publish("/entity/attachment/update", entry);
                                if (typeof console !== "undefined") {
                                    console.debug("The attachment was updated: %o", entry);
                                }
                            },
                            failure: function (xhr, sdata) {
                                Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: self.errorAttachmentUpdate });
                            }
                        });
                    });
                    var fnDisconnect = function () {
                        if (hOnCancel != null)
                            dojo.disconnect(hOnCancel);
                        if (hOnCancelClick != null)
                            dojo.disconnect(hOnCancelClick);
                        if (hHistoryCreate != null)
                            dojo.unsubscribe(hHistoryCreate);
                        if (hAttachmentCreate != null)
                            dojo.unsubscribe(hAttachmentCreate);
                    };
                    var fnHandleCancel = function () {
                        oData.Canceled = true;
                        oData.HistoryId.Original = historyId;
                        self.UpdateAttachmentRecord(oData);
                    };
                    hOnCancelClick = dojo.connect(oDialog, "_cancelClick", function () {
                        fnDisconnect();
                        fnHandleCancel();
                    });
                    hOnCancel = dojo.connect(oDialog._dialog, "onHide", function () {
                        fnDisconnect();
                        if (!bCreated)
                            fnHandleCancel();
                    });
                }
            },
            InitObjects: function () {
                if (this.__Initialized == false) {
                    /* This is important in order to get all of the events sinked. */
                    this.MailMerge();
                    this.MailMergeGUI();
                    this.ProgressDlg();
                    this.TemplateEditor();
                    this.__Initialized = true;
                }
            },
            IsJson: function (json) {
                var arrResult = [false, null];
                try {
                    var obj = ref.fromJson(json);
                    arrResult[JsonResult.jrIsJson] = true;
                    arrResult[JsonResult.jrObject] = obj;
                }
                catch (e) {
                    arrResult[JsonResult.jrIsJson] = false;
                    arrResult[JsonResult.jrObject] = null;
                }
                return arrResult;
            },
            MailMerge: function () {
                if (this.__MailMerge == null) {
                    this.__MailMerge = this.NewActiveXObject("SLXMMGUIW.MailMerge");
                    this.ConnectEvents(this.__MailMerge, WhichEvents.weMailMerge);
                }
                return this.__MailMerge;
            },
            MailMergeGUI: function () {
                if (this.__MailMergeGUI == null) {
                    this.__MailMergeGUI = this.NewActiveXObject("SLXMMGUIW.MailMergeGUI");
                    this.__MailMergeGUI.TransportType = TransportType.transHTTP;
                    this.__MailMergeGUI.ConnectionString = this.GetConnectionString();
                    this.__MailMergeGUI.UserID = String(Helper.MailMergeInfoStore().UserId).trim();
                    /* Used by GetWebWriteMenu(), MRUItemExists(), and MRUPluginExists(). */
                    this.__MailMergeGUI.FaxProvider = Helper.MailMergeInfoStore().FaxProvider;
                    this.AddCookies(this.__MailMergeGUI);
                }
                return this.__MailMergeGUI;
            },
            MergeFromPlugin: function (
                pluginId, mode, entityId, opportunityId, ticketId) {
                this.Debug("Entering MergeFromPlugin()"); /*DNL*/
                try {
                    try {
                        this.InitObjects();
                        var sEntityId = (dojo.isString(entityId)) ? entityId : "";
                        var sOpportunityId = (dojo.isString(opportunityId)) ? opportunityId : "";
                        var sPluginId = (dojo.isString(pluginId)) ? pluginId : "";
                        var sTicketId = (dojo.isString(ticketId)) ? ticketId : "";
                        var oMailMergeEngine = this.GetNewMailMergeEngine();
                        return oMailMergeEngine.MergeFromPlugin(sPluginId, mode, sEntityId, sOpportunityId, sTicketId);
                    }
                    catch (err) {
                        this.Debug("ERROR in MergeFromPlugin(): " + this.FormatError(err)); /*DNL*/
                        this.DisplayError(err);
                    }
                }
                finally {
                    this.Debug("Exiting MergeFromPlugin()"); /*DNL*/
                }
                return false;
            },
            MergeFromSlxDocument: function (slxDocument, alwaysDisplayErrors) {
                this.Debug("Entering MergeFromSlxDocument()"); /*DNL*/
                try {
                    var sError;
                    var arrResult = [false, false, ""];
                    try {
                        this.InitObjects();
                        var oMailMergeEngine = this.GetNewMailMergeEngine();
                        oMailMergeEngine.MergeSilently = slxDocument.MailMergeInformation.MergeSilently;
                        var bDoAttachments = slxDocument.MailMergeInformation.DoAttachments;
                        var bDoHistory = slxDocument.MailMergeInformation.DoHistory;
                        var bSuccess = oMailMergeEngine.Merge(slxDocument);

                        arrResult[EngineResult.erSuccess] = bSuccess;
                        arrResult[EngineResult.erCanceled] = oMailMergeEngine.Canceled;

                        /* Did the mail merge job fail? */
                        if (!bSuccess) {

                            /* Check the Errors collection */
                            if (oMailMergeEngine.Errors.Count > 0) {
                                for (var i = 0; i < oMailMergeEngine.Errors.Count; i++) {
                                    /* Important: oMailMergeEngine.Errors.GetItem(i).Message does [not] work.
                                    * Neither does accessing any default property (where the dispid is 0),
                                    * such as oMailMergeEngine.Errors(i).Message. */
                                    var oError = oMailMergeEngine.Errors.GetItem(i);
                                    if (oError) {
                                        if (oError.Source != "")
                                            sError = dString.substitute(Helper.DesktopErrors().EngineErrorFmt1, [Helper.DesktopErrors().MailMergeEngineError, oError.Message, oError.Source, oError.ErrorCode]);
                                        else
                                            sError = dString.substitute(Helper.DesktopErrors().EngineErrorFmt2, [Helper.DesktopErrors().MailMergeEngineError, oError.Message, oError.ErrorCode]);
                                        if (arrResult[EngineResult.erError] == "") {
                                            arrResult[EngineResult.erError] = sError;
                                        }
                                        else {
                                            arrResult[EngineResult.erError] = arrResult[EngineResult.erError] + "; " + sError;
                                        }
                                        /* Is this a silent mail merge job? */
                                        if (oMailMergeEngine.MergeSilently && alwaysDisplayErrors) {
                                            this.ShowError(sError);
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            if (bDoHistory) {
                                dojo.publish("/entity/history/create", [null, this]);
                            }
                            if (bDoAttachments) {
                                dojo.publish("/entity/attachment/create", [null, this]);
                            }
                        }
                    }
                    catch (err) {
                        sError = this.FormatError(err);
                        arrResult[EngineResult.erError] = sError;
                        this.Debug("ERROR in MergeFromSlxDocument(): " + sError); /*DNL*/
                        this.DisplayError(err);
                    }
                    return arrResult;
                }
                finally {
                    this.Debug("Exiting MergeFromSlxDocument()"); /*DNL*/
                }
            },
            NewActiveXObject: function (progid) {
                if (Sage && Sage.gears && Sage.gears.factory) {
                    var oComFactory = Sage.gears.factory.create("com.factory");
                    var oActiveX = oComFactory.newActiveXObject(progid);
                    return oActiveX;
                }
                if (!Sage.gears || !Sage.gears.factory)
                    throw new Error(Helper.DesktopErrors().DesktopHelperUnavailable);
                else
                    throw new Error(Helper.DesktopErrors().NewActiveXObjectError);
            },
            OpenDialog: function (url, width, height) {
                var bUseSlxShowModalDialog = false;
                var sProcessName = String(this.MailMergeGUI().ProcessName).toUpperCase();
                if (dojo.isFF && (sProcessName == "FIREFOX.EXE")) { /*DNL*/
                    var iProcessMajorVersion = this.MailMergeGUI().ProcessMajorVersion;
                    var iProcessMinorVersion = this.MailMergeGUI().ProcessMinorVersion;
                    bUseSlxShowModalDialog = !((iProcessMajorVersion == 3 && iProcessMinorVersion >= 5) || (iProcessMajorVersion > 3));
                }
                else {
                    if (!dojo.isIE && !(sProcessName == "IEXPLORE.EXE")) { /*DNL*/
                        bUseSlxShowModalDialog = true;
                    }
                }
                if (!bUseSlxShowModalDialog) {
                    /* Logic to determine the dialogLeft and dialogTop for [visually] centering the dialog (center:yes does [not] work in FF). */
                    var iBrowserHeightOffset = (dojo.isIE) ? 25 : 75;
                    var iWidth = this.MailMergeGUI().WorkAreaWidth;
                    var iHeight = this.MailMergeGUI().WorkAreaHeight;
                    if (iWidth == -1 || iWidth > screen.availWidth) {
                        iWidth = screen.availWidth;
                    }
                    if (iHeight == -1 || iHeight > screen.availHeight) {
                        iHeight = screen.availHeight;
                    }
                    var iLeft = ((iWidth - width) / 2);
                    var iOffset = ((iHeight - (height + iBrowserHeightOffset)) / 10);
                    var iTop = ((iHeight - (height + iBrowserHeightOffset)) / 2) - iOffset;
                    if (iLeft < 0 || width > iWidth) iLeft = 0;
                    if (iTop < 0 || (height + iBrowserHeightOffset) > iHeight) iTop = 0;
                    if (iTop > (iHeight - (height + iBrowserHeightOffset))) {
                        iTop = ((iHeight - height) / 2);
                    }
                    var sFeatures = dString.substitute("scroll:no;status:no;resizable:yes;dialogLeft:${0}px;dialogTop:${1}px;dialogWidth:${2}px;dialogHeight:${3}px;edge:sunken;help:no", [iLeft, iTop, width, height]);
                    var sReturnValue = showModalDialog(url, window, sFeatures);
                    if (dojo.isString(sReturnValue) && sReturnValue !== "") {
                        return sReturnValue;
                    }
                    return "";
                }
                else {
                    var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
                    oParams.AddNameValuePair("Error", ""); /*DNL*/
                    oParams.AddNameValuePair("Success", false); /*DNL*/
                    oParams.AddNameValuePair("Result", ""); /*DNL*/
                    var iModalResult = this.MailMergeGUI().ShowModalDialog(url, width, height, oParams);
                    var bSuccess = oParams.Find("Success").Value; /*DNL*/
                    if (bSuccess) {
                        if (iModalResult == ModalResult.resOk) {
                            var sResult = oParams.Find("Result").Value; /*DNL*/
                            if (dojo.isString(sResult) && sResult !== "") {
                                return sResult;
                            }
                        }
                    }
                    else {
                        var sError = oParams.Find("Error").Value; /*DNL*/
                        if (dojo.isString(sError) && sError !== "") {
                            sError = Helper.DesktopErrors().OpenDialogError;
                        }
                        this.ShowError(this.FormatError(new Error(sError)));
                    }
                    return "";
                }
            },
            PopulateWriteMenu: function () {
                try {
                    if (this.__MenuPopulated) return;

                    var IDX_CAPTION = 1;
                    var IDX_URL = 4;
                    var IDX_ENABLE = 5;

                    var oContext = this.GetContext();
                    if (oContext) {
                        oContext.Refresh();
                        var sSiteCode = Helper.MailMergeInfoStore().SiteCode;
                        var sUserId = String(Helper.MailMergeInfoStore().UserId).trim();
                        var sXml = this.MailMergeGUI().GetWebWriteMenu(sSiteCode, sUserId, Helper.MailMergeInfoStore().Templates.MaxRecentlyUsedTemplates, (oContext.EntityIsLead) ? "LEAD" : "CONTACT"); /*DNL*/
                        if (dojo.isString(sXml) && sXml !== "") {
                            var oXmlReader = new Sage.SimpleXmlReader(sXml);
                            for (var iMenuId = MenuIdentifier.miEmail; iMenuId <= MenuIdentifier.miFax; iMenuId++) {
                                var oSubMenuItems = oXmlReader.selectChildNodes("Menu/MenuItems/MenuItem[@MenuID=\"" + iMenuId + "\"]/SubMenuItem");
                                if (oSubMenuItems != null) {
                                    for (var iSubMenuItem = 0; iSubMenuItem < oSubMenuItems.length - 2; iSubMenuItem++) {
                                        var iMruMenu = 0;
                                        switch (iMenuId) {
                                            case MenuIdentifier.miFax:
                                                iMruMenu = 1;
                                                break;
                                            case MenuIdentifier.miLetter:
                                                iMruMenu = 2;
                                                break;
                                        }
                                        var oMenuItem = oSubMenuItems[iSubMenuItem];
                                        var sCaption = oMenuItem.attributes.item(IDX_CAPTION).nodeValue;
                                        var sUrl = "javascript:";
                                        sUrl += oMenuItem.attributes.item(IDX_URL).nodeValue;
                                        var sEnable = oMenuItem.attributes.item(IDX_ENABLE).nodeValue;
                                        var bEnable = (sEnable === "true"); /*DNL*/
                                        this.AddNewSubMenuItem(iMruMenu, "", sCaption, sUrl, bEnable);
                                    }
                                }
                            }
                            this.__MenuPopulated = true;
                        }
                    }
                    var sAddressLabels = Helper.MailMergeInfoStore().Resources.AddressLabels;
                    var oAddressMenu = this.GetMenuByCaption(sAddressLabels);
                    if (oAddressMenu) {
                        oAddressMenu.disabled = !this.GetReportingEnabled();
                    }
                }
                catch (err) {
                    var sXtraMsg = "";
                    if (Helper.IsSageGearsObjectError(err)) {
                        sXtraMsg = Helper.DesktopErrors().SageGearsObjectError;
                    }
                    var sError = (typeof err.toMessage === "function") ? err.toMessage(sXtraMsg, Helper.MailMergeInfoStore().ShowJavaScriptStack) : err.message;
                    Dialogs.showError(dString.substitute(Helper.DesktopErrors().PopulateWriteMenuError, [sError]));
                }
            },
            PostToServer: function (url, data, isXml) {
                var sResponse = "";
                var self = this;
                var xhrPostOptions = {
                    url: url,
                    preventCache: true,
                    postData: data,
                    handleAs: "text",
                    sync: true,
                    load: function (response) {
                        sResponse = response;
                        if ((sResponse.indexOf("Error") > -1) && (sResponse.indexOf("Error") < 3)) { /*DNL*/
                            self.ShowError(sResponse);
                            sResponse = "";
                        }
                    },
                    error: function (error, ioargs) {
                        Utility.ErrorHandler.handleHttpError(error, ioargs);
                    }
                };
                if (typeof isXml === "boolean" && isXml) {
                    xhrPostOptions.headers = { "Content-Type": "application/xml" };
                }
                dojo.rawXhrPost(xhrPostOptions);
                return sResponse;
            },
            ProgressDlg: function () {
                if (this.__ProgressDlg == null) {
                    this.__ProgressDlg = this.NewActiveXObject("SLXMMGUIW.ProgressDlg");
                    this.ConnectEvents(this.__ProgressDlg, WhichEvents.weProgressDlg);
                }
                return this.__ProgressDlg;
            },
            RebuildSchema: function () {
                var sUrl = this.GetGroupManagerUrl() + "RebuildXMLSchema";
                var sResult = Sage.MailMerge.Service.prototype.GetFromServer(sUrl);
                return sResult;
            },
            SetDefaultProperties: function (obj, which) {
                this.AddCookies(obj);
                obj.TransportType = TransportType.transHTTP;
                obj.ConnectionString = this.GetConnectionString();
                obj.UserID = String(Helper.MailMergeInfoStore().UserId).trim();
                if (which != WhichProperties.wpAddressLabels &&
                    which != WhichProperties.wpSelectAddressType) {
                    obj.AttachmentPath = Helper.MailMergeInfoStore().AttachmentPath;
                    obj.BaseKeyCode = (Helper.MailMergeInfoStore().RemoteInfo.Remote) ? Helper.MailMergeInfoStore().RemoteInfo.BaseKeyCode : "";
                    obj.EmailSystem = EmailSystem.emailOutlook;
                    obj.LibraryPath = Helper.MailMergeInfoStore().LibraryPath;
                    obj.Remote = Helper.MailMergeInfoStore().RemoteInfo.Remote;
                    obj.SiteCode = Helper.MailMergeInfoStore().SiteCode;
                }
                switch (which) {
                    case WhichProperties.wpAddressLabels:
                        break;
                    case WhichProperties.wpMailMerge:
                        obj.UserNameLF = Helper.MailMergeInfoStore().UserNameLF;
                        break;
                    case WhichProperties.wpTemplateEditor:
                        obj.ShowPreviewButton = true;
                        break;
                }
                if (which == WhichProperties.wpMailMerge ||
                    which == WhichProperties.wpTemplateEditor) {
                    obj.BaseEMailPluginID = Helper.MailMergeInfoStore().Templates.DefaultMemoTemplateId;
                    obj.BaseFAXPluginID = Helper.MailMergeInfoStore().Templates.DefaultFaxTemplateId;
                    obj.BaseLetterPluginID = Helper.MailMergeInfoStore().Templates.DefaultLetterTemplateId;
                }
                if (which == WhichProperties.wpMailMerge ||
                    which == WhichProperties.wpMailMergeEngine) {
                    obj.AddressLabelsEnabled = this.GetReportingEnabled();
                    obj.BaseCurrencySymbol = Helper.MailMergeInfoStore().BaseCurrency;
                    obj.MultiCurrency = Helper.MailMergeInfoStore().MultiCurrency;
                }
                if (which != WhichProperties.wpMailMergeEngine) {
                    obj.UserName = Helper.MailMergeInfoStore().UserNameLF;
                }
            },
            SelectEmailNames: function (selectEmailInfo, maxTo, statusText) {
                if (typeof selectEmailInfo === "object") {
                    var oSelectEmailNames = this.NewActiveXObject("SLXMMGUIW.SelectEmailNames");
                    oSelectEmailNames.CreateWindow();
                    try {
                        oSelectEmailNames.MaxTo = maxTo;
                        var i;
                        var oRecipient;
                        for (i = 0; i < selectEmailInfo.Recipients.length; i++) {
                            oRecipient = selectEmailInfo.Recipients[i];
                            oSelectEmailNames.AddContactInfo(
                                oRecipient.AccountId,
                                oRecipient.AccountName,
                                oRecipient.ContactId, // or LeadId
                                oRecipient.EmailAddress,
                                oRecipient.FirstName,
                                oRecipient.LastName,
                                oRecipient.OpportunityId,
                                oRecipient.OpportunityName,
                                oRecipient.IsTo);
                        }
                        if (dojo.isString(statusText)) {
                            oSelectEmailNames.StatusText = statusText;
                        }
                        var iModalResult = oSelectEmailNames.ShowModal();
                        if (iModalResult == ModalResult.resOk) {
                            var oSelectedInfo = new Sage.SelectEmailInfo();
                            for (i = 0; i < oSelectEmailNames.Recipients.Count; i++) {
                                oRecipient = oSelectEmailNames.Recipients.GetItem(i);
                                oSelectedInfo.AddInfo(
                                    oRecipient.AccountID,
                                    oRecipient.AccountName,
                                    oRecipient.ContactID, // or LeadId
                                    oRecipient.EmailAddress,
                                    oRecipient.FirstName,
                                    oRecipient.LastName,
                                    oRecipient.OpportunityID,
                                    oRecipient.OpportunityName,
                                    (oRecipient.Type_ == RecipientType.rtTo),
                                    oRecipient.Type_);
                            }
                            return oSelectedInfo;
                        }
                    }
                    finally {
                        oSelectEmailNames.DestroyWindow();
                    }
                }
                return null;
            },
            SelectFolder: function (caption, title, folder) {
                var arrResult = [false, ""];
                var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair("Selection", folder); /*DNL*/
                var bSelected = this.MailMergeGUI().SelectFolder(caption, title, oParams);
                if (bSelected) {
                    arrResult[SelectFolderResult.srSelected] = true;
                    arrResult[SelectFolderResult.srFolder] = this.GetParamValue(oParams, "Selection"); /*DNL*/
                }
                return arrResult;
            },
            SelectPrinter: function (caption) {
                var arrResult = ["", false, false];
                var oSelectPrinter = this.NewActiveXObject("SLXMMGUIW.SelectPrinter");
                oSelectPrinter.CreateWindow(0);
                try {
                    oSelectPrinter.Caption = caption;
                    var iModalResult = oSelectPrinter.ShowModal();
                    switch (iModalResult) {
                        case ModalResult.resOk:
                            arrResult[PrinterResult.prPrinterName] = oSelectPrinter.SelectedPrinter;
                            arrResult[PrinterResult.prSuccess] = true;
                            break;
                        case ModalResult.resCancel:
                            arrResult[PrinterResult.prCanceled] = true;
                            break;
                    }
                }
                finally {
                    oSelectPrinter.DestroyWindow();
                }
                return arrResult;
            },
            SelectTemplate: function () {
                return this.WriteTemplates(false);
            },
            SetParamValue: function (params, name, value) {
                if (params.Exists(name)) {
                    var oParam = params.Find(name);
                    if (oParam != null) {
                        oParam.Value = value;
                        return true;
                    }
                }
                return false;
            },
            ShowAndThenThrowError: function (errobj, message, title) {
                try {
                    this.ShowError(message, title);
                }
                finally {
                    throw errobj;
                }
            },
            ShowError: function (message, title) {
                var sTitle = (typeof title !== "undefined") ? title : Helper.MailMergeInfoStore().Resources.SalesLogixMailMerge;
                try {
                    this.MailMergeGUI().ShowError(sTitle, message);
                }
                catch (e) {
                    Dialogs.showError(message, sTitle);
                }
            },
            ShowMailMergeDialog: function (pluginId) {
                var oContext = this.GetContext();
                if (oContext) {
                    oContext.Refresh();
                    this.InitObjects();
                    var oMailMerge = this.MailMerge();
                    oMailMerge.CreateWindow();
                    try {
                        this.SetDefaultProperties(oMailMerge, WhichProperties.wpMailMerge);
                        if (oContext.GroupCanBeMergedTo) {
                            oMailMerge.CurrentGroupID = oContext.GroupId;
                            oMailMerge.CurrentGroupType = oContext.GroupTableName;
                            oMailMerge.CurrentGroupName = (oContext.GroupName != "") ? oContext.GroupName : Helper.MailMergeInfoStore().Resources.NoGroup;
                        }
                        if (oContext.EntityIsContact || oContext.EntityIsLead) {
                            oMailMerge.CurrentEntityID = oContext.IsDetailMode ? oContext.EntityId : "";
                            oMailMerge.CurrentEntityName = oContext.IsDetailMode ? oContext.EntityDescription : oContext.EntityIsLead ? Helper.MailMergeInfoStore().Resources.NoLead : Helper.MailMergeInfoStore().Resources.NoContact;
                            oMailMerge.CurrentEntityType = oContext.EntityDisplayName;
                        }
                        oMailMerge.CurrentAccountID = oContext.EntityIsAccount ? oContext.EntityId : "";
                        oMailMerge.CurrentAccountName = oContext.EntityIsAccount ? oContext.EntityDescription : "";
                        oMailMerge.CurrentOpportunityID = oContext.EntityIsOpportunity ? oContext.EntityId : "";
                        oMailMerge.CurrentOpportunityName = oContext.EntityIsOpportunity ? oContext.EntityDescription : "";
                        if (pluginId == null) {
                            oMailMerge.ShowModal();
                        }
                        else {
                            var sType = "";
                            var sEntityId = "";
                            var sEntityIdType = "";
                            var sTemplate = pluginId; /* sTemplate accepts either a plugin id or family:name */
                            var sRegarding = "";
                            var bRecordHistory = false;
                            oMailMerge.CreateDocument(sType, sEntityId, sEntityIdType, sTemplate, sRegarding, bRecordHistory);
                        }
                    }
                    finally {
                        oMailMerge.DestroyWindow();
                    }
                }
            },
            ShowMessage: function (message, title) {
                var sTitle = (typeof title !== "undefined") ? title : Helper.MailMergeInfoStore().Resources.SalesLogixMailMerge;
                try {
                    this.MailMergeGUI().ShowMessage(sTitle, message);
                }
                catch (e) {
                    Dialogs.showInfo(message, sTitle);
                }
            },
            SimpleUrlEncode: function (object) {
                var arrParams = [];
                var sName;
                for (sName in object) {
                    arrParams.push(encodeURIComponent(sName) + "=" + encodeURIComponent(String(object[sName])));
                }
                return arrParams.join('&');
            },
            StripParameters: function (sql, xmlReader) {
                var oParameters = xmlReader.selectChildNodes("SLXGroup/parameters/parameter");
                var oConditions = xmlReader.selectChildNodes("SLXGroup/conditions/condition");
                var sResult = String(sql);
                if (sResult.toUpperCase().indexOf(":NOW") != -1) {
                    var dtNow = new Date();
                    /* The SLXOLEDB provider will [not] convert ISO DateTime strings to UTC when the value
                    is used in a sub query, so convert it to UTC for the local time zone. */
                    var dtUTC = this.MailMergeGUI().LocalToUTC(dtNow);
                    sResult = sResult.replace(/:NOW/gi, dString.substitute("'${0}'", [this.MailMergeGUI().DateToISO(dtUTC)]));
                }
                if (sResult.toUpperCase().indexOf(":USERID") != -1) {
                    sResult = sResult.replace(/:USERID/gi, dString.substitute("'${0}'", [String(Helper.MailMergeInfoStore().UserId).trim()]));
                }
                for (var i = 0; i < oParameters.length; i++) {
                    var oParam = oParameters[i];
                    var sParamName = xmlReader.selectSingleNodeText("name", oParam);
                    var sOperator = "";
                    for (var x = 0; x < oConditions.length; x++) {
                        var oCond = oConditions[x];
                        var sConditionParamName = xmlReader.selectSingleNodeText("value", oCond);
                        sConditionParamName = sConditionParamName.replace(/:/gi, "");
                        sParamName = sParamName.replace(/:/gi, "");
                        if (sConditionParamName.toUpperCase() == sParamName.toUpperCase()) {
                            sOperator = xmlReader.selectSingleNodeText("operator", oCond);
                            break;
                        }
                    }
                    var sDataType = xmlReader.selectSingleNodeText("datatype", oParam);
                    var bIsInClause = (String(sOperator).toUpperCase().trim() == "IN"); /*DNL*/
                    var bIsNumber = (String(sDataType).toUpperCase().trim() == "NUMBER"); /*DNL*/
                    sParamName = ":" + xmlReader.selectSingleNodeText("name", oParam);
                    var oRegExp = new RegExp(sParamName, "i");
                    if (!bIsInClause) {
                        sResult = sResult.replace(oRegExp, "?");
                    }
                    else {
                        var sValue = xmlReader.selectSingleNodeText("value", oParam);
                        if (!bIsInClause && !bIsNumber) {
                            /* Quote the value plus double-up single quotes if they exist in the value. */
                            sValue = dString.substitute("'${0}'", [String(sValue).replace(/'/gi, "''")]);
                        }
                        sResult = sResult.replace(oRegExp, sValue);
                    }
                }
                return sResult;
            },
            TemplateEditor: function () {
                if (this.__TemplateEditor == null) {
                    this.__TemplateEditor = this.NewActiveXObject("SLXMMGUIW.TemplateEditor");
                    this.ConnectEvents(this.__TemplateEditor, WhichEvents.weTemplateEditor);
                }
                return this.__TemplateEditor;
            },
            TranslateUserId: function (userId, lastFirst) {
                var sField = "USERNAME"; /*DNL*/
                if (typeof lastFirst === "boolean" && lastFirst) {
                    sField = "UNAMELF"; /*DNL*/
                }
                var sResult = this.GetSingleValue(sField, "USERINFO", "USERID", userId); /*DNL*/
                if (sField == "UNAMELF" && dojo.isString(sResult) && sResult.trim().match(",$") == ",") {
                    sResult = sResult.trim();
                    sResult = sResult.substr(0, sResult.length - 1);
                }
                return sResult;
            },
            UpdateAttachmentRecord: function (attachmentInfo) {
                var oInfo = {
                    "Canceled": false,
                    "Description":
                        {
                            "Original": "",
                            "Current": ""
                        },
                    "HistoryId":
                        {
                            "Original": "",
                            "Current": ""
                        },
                    "OpportunityId": "",
                    "TicketId": ""
                };
                dojo.mixin(oInfo, attachmentInfo);
                var fnGetValidDescription = function () {
                    var sDescription = oInfo.Description.Current;
                    if (dojo.isString(oInfo.Description.Original) && dojo.isString(oInfo.Description.Current)) {
                        // Description.Original is the mail merge template name by default.
                        // The description of the attachment should be in the form: ${TemplateName} (${Regarding})
                        sDescription = dString.substitute("${0} (${1})", [oInfo.Description.Original, oInfo.Description.Current]);
                    }
                    return sDescription;
                };
                var self = this;
                var oSDataService = Sage.Data.SDataServiceRegistry.getSDataService("system");
                var oRequest = new Sage.SData.Client.SDataResourceCollectionRequest(oSDataService);
                oRequest.setResourceKind("attachments");
                var sWhere = dString.substitute("historyId eq '${0}'", [oInfo.HistoryId.Original]);
                oRequest.setQueryArg("where", sWhere);
                oRequest.setQueryArg("orderby", "createDate");
                oRequest.read({
                    success: function (entry) {
                        var attachments = entry["$resources"] || [];
                        var iFinishedCount = 0;
                        dojo.forEach(attachments, function (item, idx) {
                            if (idx == 0 && !oInfo.Canceled && (oInfo.Description.Original !== oInfo.Description.Current)) {
                                item.description = fnGetValidDescription();
                            }
                            if (!oInfo.Canceled) {
                                item.historyId = oInfo.HistoryId.Current;
                                item.opportunityId = oInfo.OpportunityId;
                                item.ticketId = oInfo.TicketId;
                            }
                            else {
                                item.historyId = null;
                            }
                            var oUpdate = new Sage.SData.Client.SDataSingleResourceRequest(oSDataService);
                            oUpdate.setResourceKind("attachments");
                            oUpdate.setResourceSelector("'" + item.$key + "'");
                            oUpdate.update(item, {
                                success: function (attachment) {
                                    dojo.publish("/entity/attachment/update", attachment);
                                    if (typeof console !== "undefined") {
                                        console.debug("The attachment was updated: %o", attachment);
                                    }
                                    iFinishedCount++;
                                    if (iFinishedCount == attachments.length) {
                                        self.UpdateHistoryRecord(oInfo.HistoryId.Current);
                                    }
                                },
                                failure: function (xhr, sdata) {
                                    Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: self.errorAttachmentUpdate, logError: true });
                                }
                            });
                        });
                    },
                    failure: function () {
                        if (typeof console !== "undefined") {
                            console.warn("Unable to retrieve the Attachment record for updating");
                        }
                    }
                });
            },
            UpdateHistoryRecord: function (historyId) {
                var self = this;
                var oSDataService = Sage.Data.SDataServiceRegistry.getSDataService("system");
                var oRequest = new Sage.SData.Client.SDataResourceCollectionRequest(oSDataService);
                oRequest.setResourceKind("attachments");
                var sWhere = dString.substitute("historyId eq '${0}'", [historyId]);
                oRequest.setQueryArg("where", sWhere);
                oRequest.read({
                    scope: this,
                    success: function (data) {
                        var attachments = data["$resources"] || [];
                        var oSDataDynamicService = Sage.Data.SDataServiceRegistry.getSDataService("dynamic");
                        var oUpdate = new Sage.SData.Client.SDataSingleResourceRequest(oSDataDynamicService);
                        oUpdate.setResourceKind("history");
                        oUpdate.setResourceSelector("'" + historyId + "'");
                        var update = {
                            "$key": historyId,
                            "attachment": (attachments.length > 0) ? true : false,
                            "attachmentCount": attachments.length
                        };
                        oUpdate.update(update, {
                            scope: this,
                            success: function (entry) {
                                dojo.publish("/entity/history/change", entry);
                                if (typeof console !== "undefined") {
                                    console.debug("The history was updated: %o", entry);
                                }
                            },
                            failure: function (xhr, sdata) {
                                if (xhr && xhr.status && xhr.status === 410) {
                                    // Gone (410). The user canceled the Complete Activity dialog or the history never existed.
                                    return;
                                }
                                Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: self.errorHistoryUpdate, logError: true });
                            }
                        });
                    },
                    failure: function () {
                        if (typeof console !== "undefined") {
                            console.warn("Unable to retrieve the Attachment record(s) for updating History.");
                        }
                    }
                });
            },
            UpdateWriteMenu: function (templateName, pluginId, mainTable, menu) {
                try {
                    var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
                    oParams.AddNameValuePair("Error", ""); /*DNL*/
                    oParams.AddNameValuePair("Success", false); /*DNL*/
                    this.AddNewSubMenuItem(menu, pluginId, templateName);
                    this.MailMergeGUI().WriteMRU(Helper.MailMergeInfoStore().SiteCode, String(Helper.MailMergeInfoStore().UserId).trim(), templateName, mainTable, pluginId, menu, oParams);
                }
                catch (err) {
                    this.Debug("Error in UpdateWriteMenu(): " + this.FormatError(err)); /*DNL*/
                }
            },
            UserCanMergeAsUser: function (mergeAsUserId) {
                if (dojo.isString(mergeAsUserId) && mergeAsUserId === "") return false;
                if (!dojo.isString(mergeAsUserId)) return false;
                var sUserId = String(Helper.MailMergeInfoStore().UserId).trim();
                var sMergeAsUserId = String(mergeAsUserId).trim();
                if (sMergeAsUserId.toUpperCase() != sUserId.toUpperCase()) {
                    var sUrl = dString.substitute("${0}/SLXMailMergeClient.ashx?method=UserCanMergeAsUser&mergeAsUserId=${1}", [this.GetClientPath(), sMergeAsUserId]);
                    var sResult = this.GetFromServer(sUrl);
                    if (sResult !== "T") {
                        return false;
                    }
                }
                return true;
            },
            WriteAddressLabels: function () {
                var oContext = this.GetContext();
                if (oContext) {
                    oContext.Refresh();
                    this.InitObjects();
                    this.CloseMenus();
                    var oAddressLabels = this.NewActiveXObject("SLXMMGUIW.AddressLabels");
                    this.ConnectEvents(oAddressLabels, WhichEvents.weAddressLabels);
                    oAddressLabels.CreateWindow();
                    try {
                        this.SetDefaultProperties(oAddressLabels, WhichProperties.wpAddressLabels);
                        if (oContext.GroupCanBeMergedTo) {
                            oAddressLabels.CurrentGroupID = oContext.GroupId;
                            oAddressLabels.CurrentGroupType = oContext.GroupTableName;
                            oAddressLabels.CurrentGroupName = (oContext.GroupName != "") ? oContext.GroupName : Helper.MailMergeInfoStore().Resources.NoGroup;
                        }
                        if (oContext.EntityIsContact || oContext.EntityIsLead) {
                            oAddressLabels.CurrentEntityID = oContext.IsDetailMode ? oContext.EntityId : "";
                            oAddressLabels.CurrentEntityName = oContext.IsDetailMode ? oContext.EntityDescription : (oContext.EntityIsLead ? Helper.MailMergeInfoStore().Resources.NoLead : Helper.MailMergeInfoStore().Resources.NoContact);
                            oAddressLabels.CurrentEntityType = oContext.EntityDisplayName;
                        }
                        if (oAddressLabels.ShowModal() == ModalResult.resOk) {
                            /* An event handler is used to handle report generation. */
                        }
                    }
                    finally {
                        oAddressLabels.DestroyWindow();
                    }
                }
            },
            WriteEmail: function (subject, body, nameOrder, emailField) {
                this.InitObjects();
                this.CloseMenus();
                var self = this;
                var fnWriteEmailCallback = function (result) {
                    if (typeof result === "boolean" && result) {
                        var oContext = self.GetContext();
                        if (oContext) {
                            var sUrl = self.GetInfoBrokerUrl() + "GetSingleValue&item={0}&entity=" + oContext.EntityTableName + "&idfield=" + oContext.EntityKeyField + "&id=" + oContext.EntityId; /*DNL*/
                            if (self.GetFromServer(dString.substitute(sUrl, ["donotsolicit"])) == "T") { /*DNL*/
                                self.ShowMessage(Helper.MailMergeInfoStore().Resources.DoNotSolicit);
                            }
                            if (self.GetFromServer(dString.substitute(sUrl, ["donotemail"])) == "T") { /*DNL*/
                                self.ShowMessage(Helper.MailMergeInfoStore().Resources.DoNotEmail);
                                return;
                            }
                            try {
                                var iNameOrder = 0; // 0 = FirstLast; 1 = LastFirst. 
                                if (typeof nameOrder !== "undefined") {
                                    if (!isNaN(nameOrder)) {
                                        if (Number(nameOrder) == 1)
                                            iNameOrder = 1;
                                    }
                                }
                                var sSubject = (dojo.isString(subject)) ? subject : "";
                                // Note: body can be plain text or HTML (e.g. <HTML>Hello <B>World</B></HTML>).
                                var sBody = (dojo.isString(body)) ? body : "";
                                var sEmailField = "EMAIL";
                                if (dojo.isString(emailField) && oContext.EntityIsContact) {
                                    sEmailField = emailField.toUpperCase();
                                    switch (sEmailField) {
                                        case "SECONDARYEMAIL", "EMAIL3":
                                            break;
                                        default:
                                            sEmailField = "EMAIL";
                                            break;
                                    }
                                }
                                self.MailMergeGUI().WriteEmail(oContext.EntityTableName, oContext.EntityId, sSubject, sBody, iNameOrder, sEmailField);
                            }
                            catch (err) {
                                self.DisplayError(err);
                            }
                        }
                    }
                };
                this.GetEntityId(fnWriteEmailCallback);
            },
            WriteEmailToCurrentSelection: function (subject, body, nameOrder, emailField) {
                Sage.Utility.writeEmailToGroupSelection(subject, body, nameOrder, emailField);
            },
            WriteEmailUsing: function (pluginId) {
                this.WriteUsing(pluginId, MergeMode.mmEmail);
            },
            WriteEmailUsingMoreTemplates: function () {
                this.WriteUsingMoreTemplates(MergeMode.mmEmail);
            },
            WriteFaxUsing: function (pluginId) {
                this.WriteUsing(pluginId, MergeMode.mmFax);
            },
            WriteFaxUsingMoreTemplates: function () {
                this.WriteUsingMoreTemplates(MergeMode.mmFax);
            },
            WriteLetterUsing: function (pluginId) {
                this.WriteUsing(pluginId, MergeMode.mmLetter);
            },
            WriteLetterUsingMoreTemplates: function () {
                this.WriteUsingMoreTemplates(MergeMode.mmLetter);
            },
            WriteMailMerge: function () {
                this.CloseMenus();
                this.ShowMailMergeDialog(null);
            },
            WriteTemplates: function (manage) {
                var arrResult = ["", "", "", "", false, false];
                var oContext = this.GetContext();
                if (oContext) {
                    oContext.Refresh();
                    this.InitObjects();
                    this.CloseMenus();
                    var oTemplateEditor = this.TemplateEditor();
                    oTemplateEditor.CreateWindow();
                    try {
                        this.SetDefaultProperties(oTemplateEditor, WhichProperties.wpTemplateEditor);
                        if (oContext.EntityIsContact || oContext.EntityIsLead) {
                            oTemplateEditor.CurrentEntityID = oContext.EntityId;
                            oTemplateEditor.CurrentEntityName = oContext.EntityDescription;
                            oTemplateEditor.CurrentEntityType = oContext.EntityTableName;
                        }
                        else {
                            oTemplateEditor.CurrentEntityType = "CONTACT"; /*DNL*/
                        }
                        oTemplateEditor.ShowAllTemplates = manage;
                        oTemplateEditor.Manage = manage;
                        var iModalResult = oTemplateEditor.ShowModal();
                        switch (iModalResult) {
                            case ModalResult.resOk:
                                arrResult[TemplatesResult.trPluginId] = oTemplateEditor.SelectedTemplatePluginID;
                                arrResult[TemplatesResult.trPluginName] = oTemplateEditor.SelectedTemplateName;
                                arrResult[TemplatesResult.trPluginFamily] = oTemplateEditor.SelectedTemplateFamily;
                                arrResult[TemplatesResult.trPluginMainTable] = oTemplateEditor.SelectedTemplateMainTable;
                                arrResult[TemplatesResult.trSuccess] = true;
                                break;
                            case ModalResult.resCancel:
                                arrResult[TemplatesResult.trCanceled] = true;
                                break;
                            case ModalResult.resAbort:
                                this.ShowMailMergeDialog(oTemplateEditor.SelectedTemplatePluginID);
                                arrResult[TemplatesResult.trSuccess] = true;
                                break;
                        }
                    }
                    finally {
                        oTemplateEditor.DestroyWindow();
                    }
                }
                return arrResult;
            },
            WriteUsing: function (pluginId, mergeMode) {
                this.InitObjects();
                this.CloseMenus();
                var self = this;
                var fnWriteUsingCallback = function (result) {
                    if (typeof result === "boolean" && result) {
                        var oContext = self.GetContext();
                        if (oContext) {
                            self.MergeFromPlugin(pluginId, mergeMode, oContext.EntityId,
                                oContext.DetailOpportunityId, oContext.DetailTicketId);
                        }
                    }
                };
                this.GetEntityId(fnWriteUsingCallback);
            },
            WriteUsingMoreTemplates: function (mergeMode) {
                var oContext = this.GetContext();
                if (oContext) {
                    oContext.Refresh();
                    this.InitObjects();
                    this.CloseMenus();
                    var arrResult = this.WriteTemplates(false);
                    if (dojo.isArray(arrResult)) {
                        var bCanceled = arrResult[TemplatesResult.trCanceled];
                        var bSuccess = arrResult[TemplatesResult.trSuccess];
                        if (bCanceled || !bSuccess) {
                            return;
                        }
                        var iMruMenu = MruMenu.mmLetter;
                        switch (mergeMode) {
                            case MergeMode.mmEmail:
                                iMruMenu = MruMenu.mmEmail;
                                break;
                            case MergeMode.mmFax:
                                iMruMenu = MruMenu.mmFax;
                                break;
                            case MergeMode.mmLetter:
                                iMruMenu = MruMenu.mmLetter;
                                break;
                        }
                        var sPluginId = arrResult[TemplatesResult.trPluginId];
                        var sPluginName = arrResult[TemplatesResult.trPluginName];
                        var sPluginMainTable = arrResult[TemplatesResult.trPluginMainTable];
                        var oMailMergeGUI = this.MailMergeGUI();
                        var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
                        oParams.AddNameValuePair("Error", ""); /*DNL*/
                        oParams.AddNameValuePair("Success", false); /*DNL*/
                        var bExists = oMailMergeGUI.MRUItemExists(Helper.MailMergeInfoStore().SiteCode, String(Helper.MailMergeInfoStore().UserId).trim(), sPluginId, iMruMenu, oParams);
                        if (bExists) {
                            this.UpdateWriteMenu(sPluginName, sPluginId, sPluginMainTable, iMruMenu);
                        }
                        else {
                            var sQuestion = "";
                            switch (mergeMode) {
                                case MergeMode.mmEmail:
                                    sQuestion = Helper.MailMergeInfoStore().Resources.EmailAddTemplateToMenuPrompt.replace("%s", sPluginName);
                                    break;
                                case MergeMode.mmFax:
                                    sQuestion = Helper.MailMergeInfoStore().Resources.FaxAddTemplateToMenuPrompt.replace("%s", sPluginName);
                                    break;
                                case MergeMode.mmLetter:
                                    sQuestion = Helper.MailMergeInfoStore().Resources.LetterAddTemplateToMenuPrompt.replace("%s", sPluginName);
                                    break;
                            }
                            var iModalResult = oMailMergeGUI.ConfirmMessage(Helper.MailMergeInfoStore().Resources.AddTemplateToMenu, sQuestion);
                            if (iModalResult == ModalResult.resYes) {
                                this.UpdateWriteMenu(sPluginName, sPluginId, sPluginMainTable, iMruMenu);
                            }
                        }
                        var self = this;
                        var fnCallback = function (result) {
                            if (typeof result === "boolean" && result) {
                                self.MergeFromPlugin(sPluginId, mergeMode, oContext.EntityId,
                                    oContext.DetailOpportunityId, oContext.DetailTicketId);
                            }
                        };
                        this.GetEntityId(fnCallback);
                    }
                }
            }
        });

        Sage.MailMerge.Service.prototype.MailMergeAttachment = function () {
            this.AttachmentType = AttachmentType.atTempAttachment;
            this.FileId = "";
            this.FileName = "";
            this.FullPath = "";
            this.PluginAttachId = "";
        };

        Sage.MailMerge.Service.prototype.MailMergeEnclosure = function () {
            this.Count = 0;
            this.Name = "";
        };

        Sage.MailMerge.Service.prototype.MailMergeInformation = function () {
            this.Owner = Helper.GetMailMergeService();
            var dtDateTime = this.Owner.GetNullDate();

            this.AccountId = "";
            this.AccountName = "";
            this.AlwaysDisplayErrors = true;
            this.Attachments = [];
            this.BaseCurrencySymbol = Helper.MailMergeInfoStore().BaseCurrency;
            this.BaseTable = "CONTACT"; /*DNL*/
            this.ConnectionString = this.Owner.GetConnectionString();
            this.ContactIds = "";
            this.CurrentContactId = "";
            this.CurrentContactName = "";
            this.CurrentEntityId = "";
            this.CurrentEntityName = "";
            this.DoAttachments = false;
            this.DoHistory = true;
            this.DoNotSolicit = true;
            this.DoPrintLabels = false;
            this.DoScheduleFollowUp = false;
            this.EditAfter = false;
            this.EditBefore = false;
            this.EmailBCC = "";
            this.EmailCC = "";
            this.EmailFormat = EmailFormat.formatHTML;
            this.EmailFrom = "";
            this.EmailSaveCopy = true;
            this.EmailSubject = "";
            this.Enclosures = [];
            this.EntityIds = "";
            this.ExtEntityName = "";
            this.FaxBillingCode = "";
            this.FaxClientCode = "";
            this.FaxCoverPage = "";
            this.FaxDate = dtDateTime;
            this.FaxDelivery = FaxDelivery.delivASAP;
            this.FaxJobOptions = "";
            this.FaxKeywords = "";
            this.FaxMessage = "";
            this.FaxPriority = FaxPriority.priNormal;
            this.FaxSendBy = "";
            this.FaxSendSecure = false;
            this.FaxSubject = "";
            this.FileDirectory = "";
            this.GroupFamily = GroupFamily.famContact;
            this.GroupId = "";
            this.GroupName = "";
            this.HistoryInfoCategory = "";
            this.HistoryInfoNotes = "";
            this.HistoryInfoRegarding = "";
            this.HistoryInfoResult = "";
            this.LabelId = "";
            this.LabelPrinter = "";
            this.MapiProfileName = this.Owner.MailMergeGUI().GetDefaultProfileName();
            this.MergeAsUserId = "";
            this.MergeSilently = false;
            this.MergeWith = MergeWith.withEntityIds;
            this.MultiCurrency = false;
            this.OpportunityId = "";
            this.OpportunityName = "";
            this.OutputTo = OutputType.otEmail;
            this.OverrideAttachments = false;
            this.PrinterName = this.Owner.MailMergeGUI().GetDefaultPrinterName();
            this.PromptFaxCoverPage = false;
            this.PromptFollowUpActivity = false;
            this.PromptHistory = false;
            this.PromptPrinter = false;
            this.PromptScheduleActivity = false;
            this.RunAs = RunAs.raNormal;
            this.ScheduleFollowUpAlarmTime = dtDateTime;
            this.ScheduleFollowUpCarryOverNotes = false;
            this.ScheduleFollowUpCategory = "";
            this.ScheduleFollowUpDuration = 0;
            this.ScheduleFollowUpNotes = "";
            this.ScheduleFollowUpPriority = "";
            this.ScheduleFollowUpRegarding = "";
            this.ScheduleFollowUpSetAlarm = false;
            this.ScheduleFollowUpStartDate = dtDateTime;
            this.ScheduleFollowUpTimeless = false;
            this.ScheduleFollowUpType = FollowUp.fuNone;
            this.ScheduleFollowUpUserId = "";
            this.TemplatePluginId = "";
            this.TemplatePluginName = "";
            this.TransportType = TransportType.transHTTP; /* <-- This is the *only* TransportType supported. */
            this.UserId = String(Helper.MailMergeInfoStore().UserId).trim();
            this.UserName = Helper.MailMergeInfoStore().UserNameLF;
            this.UseTemplateDocProperties = false;
        };

        Sage.MailMerge.Service.prototype.MailMergeInformation.prototype.AddAttachment = function (
            attachmentType, fileId, fileName, fullPath, pluginAttachId) {
            var attachment = new Sage.MailMerge.Service.prototype.MailMergeAttachment();
            attachment.AttachmentType = attachmentType;
            attachment.FileId = fileId;
            attachment.FileName = fileName;
            attachment.FullPath = fullPath;
            attachment.PluginAttachId = pluginAttachId;
            this.Attachments.push(attachment);
        };

        Sage.MailMerge.Service.prototype.MailMergeInformation.prototype.AddEnclosure = function (count, name) {
            var enclosure = new Sage.MailMerge.Service.prototype.MailMergeEnclosure();
            enclosure.Count = count;
            enclosure.Name = name;
            this.Enclosures.push(enclosure);
        };

        Sage.MailMerge.Service.prototype.MailMergeInformation.prototype.ExecuteMailMerge = function (isLitRequest) {
            try {
                var arrResult = [false, false, ""];
                var sUserId = String(Helper.MailMergeInfoStore().UserId).trim();
                if (dojo.isString(this.MergeAsUserId) && this.MergeAsUserId !== "") {
                    var bIsLitRequest = (typeof isLitRequest === "boolean" && isLitRequest);
                    var sMergeAsUserId = String(this.MergeAsUserId).trim();
                    if (!bIsLitRequest) {
                        if (!this.Owner.UserCanMergeAsUser(sMergeAsUserId)) {
                            arrResult[EngineResult.erError] = dString.substitute(Helper.DesktopErrors().MailMergeSecurity, [this.Owner.TranslateUserId(sMergeAsUserId)]);
                            return arrResult;
                        }
                    }
                    sUserId = sMergeAsUserId;
                }
                var sFileName = this.Owner.MailMergeGUI().GetNewMailMergeDocumentFileName(sUserId);
                if (sFileName == "") {
                    throw new Error(Helper.DesktopErrors().DocumentFileNameError);
                }
                var oSlxDocument = this.Owner.NewActiveXObject("SLXDocW.SLXDocument");
                if (oSlxDocument.CreateNew(sFileName)) {
                    var oMailMergeInfo = oSlxDocument.MailMergeInformation;
                    oMailMergeInfo.TransportType = this.TransportType;
                    oMailMergeInfo.ConnectionString = this.ConnectionString;
                    oMailMergeInfo.AccountID = this.AccountId;
                    oMailMergeInfo.AccountName = this.AccountName;
                    oMailMergeInfo.BaseCurrencySymbol = this.BaseCurrencySymbol;
                    oMailMergeInfo.BaseTable = this.BaseTable;
                    oMailMergeInfo.ContactIDs = this.ContactIds;
                    oMailMergeInfo.CurrentContactID = this.CurrentContactId;
                    oMailMergeInfo.CurrentContactName = this.CurrentContactName;
                    oMailMergeInfo.CurrentEntityID = this.CurrentEntityId;
                    oMailMergeInfo.CurrentEntityName = this.CurrentEntityName;
                    oMailMergeInfo.DoAttachments = this.DoAttachments;
                    oMailMergeInfo.DoHistory = this.DoHistory;
                    oMailMergeInfo.DoNotSolicit = this.DoNotSolicit;
                    oMailMergeInfo.DoPrintLabels = this.DoPrintLabels;
                    oMailMergeInfo.DoScheduleFollowUp = this.DoScheduleFollowUp;
                    oMailMergeInfo.EditAfter = this.EditAfter;
                    oMailMergeInfo.EditBefore = this.EditBefore;
                    oMailMergeInfo.EmailBCC = this.EmailBCC;
                    oMailMergeInfo.EmailCC = this.EmailCC;
                    oMailMergeInfo.EmailFormat = this.EmailFormat;
                    oMailMergeInfo.EmailFrom = this.EmailFrom;
                    oMailMergeInfo.EmailSaveCopy = this.EmailSaveCopy;
                    oMailMergeInfo.EmailSubject = this.EmailSubject;
                    oMailMergeInfo.EntityIDs = this.EntityIds;
                    oMailMergeInfo.ExtEntityName = this.ExtEntityName;
                    oMailMergeInfo.FaxBillingCode = this.FaxBillingCode;
                    oMailMergeInfo.FaxClientCode = this.FaxClientCode;
                    oMailMergeInfo.FaxCoverPage = this.FaxCoverPage;
                    oMailMergeInfo.FaxDate = this.FaxDate;
                    oMailMergeInfo.FaxDelivery = this.FaxDelivery;
                    oMailMergeInfo.FaxJobOptions = this.FaxJobOptions;
                    oMailMergeInfo.FaxKeywords = this.FaxKeywords;
                    oMailMergeInfo.FaxMessage = this.FaxMessage;
                    oMailMergeInfo.FaxPriority = this.FaxPriority;
                    oMailMergeInfo.FaxSendBy = this.FaxSendBy;
                    oMailMergeInfo.FaxSendSecure = this.FaxSendSecure;
                    oMailMergeInfo.FaxSubject = this.FaxSubject;
                    oMailMergeInfo.FileDirectory = this.FileDirectory;
                    oMailMergeInfo.GroupFamily = this.GroupFamily;
                    oMailMergeInfo.GroupID = this.GroupId;
                    oMailMergeInfo.GroupName = this.GroupName;
                    oMailMergeInfo.HistoryInfoCategory = this.HistoryInfoCategory;
                    oMailMergeInfo.HistoryInfoNotes = this.HistoryInfoNotes;
                    oMailMergeInfo.HistoryInfoRegarding = this.HistoryInfoRegarding;
                    oMailMergeInfo.HistoryInfoResult = this.HistoryInfoResult;
                    oMailMergeInfo.LabelID = this.LabelId;
                    oMailMergeInfo.LabelPrinter = this.LabelPrinter;
                    oMailMergeInfo.MAPIProfileName = this.MapiProfileName;
                    oMailMergeInfo.MergeAsUserID = this.MergeAsUserId;
                    oMailMergeInfo.MergeSilently = this.MergeSilently;
                    oMailMergeInfo.MergeWith = this.MergeWith;
                    oMailMergeInfo.MultiCurrency = this.MultiCurrency;
                    oMailMergeInfo.OpportunityID = this.OpportunityId;
                    oMailMergeInfo.OpportunityName = this.OpportunityName;
                    oMailMergeInfo.OutputTo = this.OutputTo;
                    oMailMergeInfo.OverrideAttachments = (this.Attachments.length != 0); /* this.OverrideAttachments; */
                    oMailMergeInfo.PrinterName = this.PrinterName;
                    oMailMergeInfo.PromptFaxCoverPage = this.PromptFaxCoverPage;
                    oMailMergeInfo.PromptFollowUpActivity = this.PromptFollowUpActivity;
                    oMailMergeInfo.PromptHistory = this.PromptHistory;
                    oMailMergeInfo.PromptPrinter = this.PromptPrinter;
                    oMailMergeInfo.PromptScheduleActivity = this.PromptScheduleActivity;
                    oMailMergeInfo.RunAs = this.RunAs;
                    oMailMergeInfo.ScheduleFollowUpAlarmTime = this.ScheduleFollowUpAlarmTime;
                    oMailMergeInfo.ScheduleFollowUpCarryOverNotes = this.ScheduleFollowUpCarryOverNotes;
                    oMailMergeInfo.ScheduleFollowUpCategory = this.ScheduleFollowUpCategory;
                    oMailMergeInfo.ScheduleFollowUpDuration = this.ScheduleFollowUpDuration;
                    oMailMergeInfo.ScheduleFollowUpNotes = this.ScheduleFollowUpNotes;
                    oMailMergeInfo.ScheduleFollowUpPriority = this.ScheduleFollowUpPriority;
                    oMailMergeInfo.ScheduleFollowUpRegarding = this.ScheduleFollowUpRegarding;
                    oMailMergeInfo.ScheduleFollowUpSetAlarm = this.ScheduleFollowUpSetAlarm;
                    oMailMergeInfo.ScheduleFollowUpStartDate = this.ScheduleFollowUpStartDate;
                    oMailMergeInfo.ScheduleFollowUpTimeless = this.ScheduleFollowUpTimeless;
                    oMailMergeInfo.ScheduleFollowUpType = this.ScheduleFollowUpType;
                    oMailMergeInfo.ScheduleFollowUpUserID = this.ScheduleFollowUpUserId;
                    oMailMergeInfo.TemplatePluginID = this.TemplatePluginId;
                    oMailMergeInfo.TemplatePluginName = this.TemplatePluginName;
                    oMailMergeInfo.UserID = this.UserId;
                    oMailMergeInfo.UserName = this.UserName;
                    oMailMergeInfo.UseTemplateDocProperties = this.UseTemplateDocProperties;

                    var i;
                    for (i = 0; i < this.Attachments.length; i++) {
                        var oAttachment = this.Attachments[i];
                        oSlxDocument.AddAttachment(oAttachment.AttachmentType, oAttachment.FileId,
                            oAttachment.FileName, oAttachment.FullPath, oAttachment.PluginAttachId);
                    }

                    for (i = 0; i < this.Enclosures.length; i++) {
                        var oEnclosure = this.Enclosures[i];
                        oSlxDocument.AddEnclosure(oEnclosure.Count, oEnclosure.Name);
                    }

                    var oSummaryInfo = oSlxDocument.SummaryInformation;
                    oSummaryInfo.Author = "Sage.MailMerge.Service"; /*DNL*/
                    oSummaryInfo.Title = "SalesLogix Document Description"; /*DNL*/

                    oSlxDocument.Commit();

                    return this.Owner.MergeFromSlxDocument(oSlxDocument, this.AlwaysDisplayErrors);

                }
                else {
                    throw new Error(Helper.DesktopErrors().CreateNewError);
                }
            }
            catch (err) {
                var sError = this.Owner.FormatError(err);
                sError = dString.substitute("${0} ${1}", [Helper.DesktopErrors().ExecuteMailMergeError, sError]);
                // ReSharper disable UsageOfPossiblyUnassignedValue
                arrResult[EngineResult.erError] = sError;
                // ReSharper restore UsageOfPossiblyUnassignedValue
                this.Owner.ShowAndThenThrowError(err, sError);
                return null;
            }
        };

        Sage.MailMerge.Service.prototype.MailMergeInformation.prototype.ToJson = function () {
            return ref.toJson(this);
        };

        Sage.MailMerge.Service.prototype.MailMergeReport = function () {
            this.Owner = Helper.GetMailMergeService();
            this.Id = "";
            this.Path = this.Owner.GetReportingUrl();
            this.Pwd = Helper.MailMergeInfoStore().Password;
            this.Sql = "";
            this.UserName = Helper.MailMergeInfoStore().UserCode;
        };

        Sage.SelectEmailInfo = function () {
            this.Recipients = [];
        };

        Sage.SelectEmailInfo.prototype.AddInfo = function (accountId, accountName, contactId,
            emailAddress, firstName, lastName, opportuntiyId, opportunityName, isTo, type) {
            var oRecipient = new this.Recipient();
            oRecipient.AccountId = accountId;
            oRecipient.AccountName = accountName;
            oRecipient.ContactId = contactId; // Also used for LeadId
            oRecipient.EmailAddress = emailAddress;
            oRecipient.FirstName = firstName;
            oRecipient.LastName = lastName;
            oRecipient.OpportunityId = opportuntiyId;
            oRecipient.OpportunityName = opportunityName;
            oRecipient.IsTo = isTo;
            oRecipient.Type = (typeof type != "undefined") ? type : null;
            this.Recipients.push(oRecipient);
        };

        Sage.SelectEmailInfo.prototype.Recipient = function () {
            this.AccountId = null;
            this.AccountName = null;
            this.ContactId = null; // Also used for LeadId
            this.EmailAddress = null;
            this.FirstName = null;
            this.LastName = null;
            this.OpportunityId = null;
            this.OpportunityName = null;
            this.IsTo = false;
            this.Type = null;
        };

        window.ActivityType = {
            actMeeting: 0,
            actPhoneCall: 1,
            actToDo: 2
        };

        window.AddressType = {
            astPrimary: 0,
            astShip: 1,
            astOther: 2
        };

        window.AlarmLead = {
            leadMinutes: 0,
            leadHours: 1,
            leadDays: 2
        };

        window.AttachmentType = {
            atRegularAttachment: 0,
            atLibraryAttachment: 1,
            atTempAttachment: 2
        };

        window.EditMode = {
            emEditBefore: 0,
            emEditAfter: 1
        };

        window.EmailFormat = {
            formatHTML: 0,
            formatPlainText: 1
        };

        window.EmailSystem = {
            emailNone: 0,
            emailOutlook: 2
        };

        window.EngineResult = {
            erCanceled: 0,
            erSuccess: 1,
            erError: 2
        };

        window.FaxDelivery = {
            delivASAP: 0,
            delivDateTime: 1,
            delivOffPeak: 2,
            delivHold: 3
        };

        window.FaxPriority = {
            priHigh: 0,
            priNormal: 1,
            priLow: 2
        };

        window.FollowUp = {
            fuNone: 0,
            fuMeeting: 1,
            fuPhoneCall: 2,
            fuToDo: 3
        };

        window.GroupFamily = {
            famContact: 0,
            famAccount: 1,
            famOpportunity: 2,
            famOther: 3
        };

        window.JsonResult = {
            jrIsJson: 0,
            jrObject: 1
        };

        window.LitReqResult = {
            lrCanceled: 0,
            lrSuccess: 1,
            lrError: 2,
            lrEntityId: 3
        };

        window.MaxTo = {
            maxOne: 0,
            maxNoMax: 1
        };

        window.MergeMode = {
            mmEmail: 0,
            mmFax: 1,
            mmLetter: 2
        };

        window.MenuIdentifier = {
            miEmail: 500,
            miLetter: 501,
            miFax: 502
        };

        window.MergeWith = {
            withCurrentEntity: 0,
            withCurrentGroup: 1,
            withSpecificGroup: 2,
            withAccount: 3,
            withOpportunity: 4,
            withEntityIds: 5
        };

        window.ModalResult = {
            resNone: 0,
            resOk: 1,
            resCancel: 2,
            resAbort: 3,
            resRetry: 4,
            resIgnore: 5,
            resYes: 6,
            resNo: 7
        };

        window.MruMenu = {
            mmEmail: 0,
            mmFax: 1,
            mmLetter: 2
        };

        /* NOTE: SLXMMGUIW.cOutputType is TemplateType in this script.
        * OutputType is equivalent to SLXMMEngineW.OutputType. */
        window.OutputType = {
            otPrinter: 0,
            otFile: 1,
            otEmail: 2,
            otFax: 3
        };

        /* PrintOption for literature requests. */
        window.PrintOption = {
            poWithCoverLetter: 0,
            poOnSeparatePage: 1,
            poOnlyAttachmentList: 2,
            poOnlyCoverLetter: 3
        };

        window.PrinterResult = {
            prPrinterName: 0,
            prCanceled: 1,
            prSuccess: 2
        };

        window.RecipientType = {
            rtTo: 0,
            rtCC: 1,
            rtBCC: 2
        };

        window.RunAs = {
            raNormal: 0,
            raSalesProcess: 2
        };

        window.SelectFolderResult = {
            srSelected: 0,
            srFolder: 1
        };

        /* NOTE: SLXMMGUIW.cOutputType is TemplateType in this script.
        *  OutputType above is equivalent to SLXMMEngineW.OutputType. */
        window.TemplateType = {
            ttEmail: 0,
            ttFax: 1,
            ttLetter: 2
        };

        window.TemplatesResult = {
            trPluginId: 0,
            trPluginName: 1,
            trPluginFamily: 2,
            trPluginMainTable: 3,
            trCanceled: 4,
            trSuccess: 5
        };

        window.TransportType = {
            transHTTP: 0
        };

        window.WhichEvents = {
            weAddressLabels: 0,
            weMailMerge: 1,
            weMailMergeEngine: 2,
            weProgressDlg: 3,
            weTemplateEditor: 4
        };

        window.WhichProperties = {
            wpAddressLabels: 0,
            wpEditMergedDocs: 1,
            wpMailMerge: 2,
            wpMailMergeEngine: 3,
            wpTemplateEditor: 4,
            wpSelectAddressType: 5
        };

        var isWindows = (navigator.userAgent.indexOf("Win") != -1);
        if (isWindows && Sage && Sage.Services) {
            if (!Sage.gears) {
                if (typeof initGears == "function") {
                    initGears();
                }
            }
            if (Sage.gears && Sage.gears.factory) {
                if (!Sage.Services.hasService("MailMergeService")) {
                    Sage.Services.addService("MailMergeService", new Sage.MailMerge.Service());
                }
            }
        }

        return oMailMergeService;
    }
);