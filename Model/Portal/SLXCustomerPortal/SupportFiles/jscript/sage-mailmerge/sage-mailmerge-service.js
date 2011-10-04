/* -------------------------------------------------------------------------                  
                         Sage SalesLogix Mail Merge
                 Sage.MailMergeService, Sage.SelectEmailInfo,
                 Sage.CustomGroupExport, and Sage.ExcelExport.
                      Copyright(c) 2010, Sage Software                         
   
   This service class is used to access mail merge services, including the
   mail merge application programming interface.
   ------------------------------------------------------------------------- */

/*  Important: The COM event handlers (see ConnectEvents) do not have
    access to the instance of this class (i.e. [this.] will be *not* be
    an instance of Sage.MailMergeService (it wil be DispHTMLWindow2 in IE).
    This is because of the way the event handlers are called by Sage Gears.
    Use the following to gain access to the current instance of the
    MailMergeService within the event handlers:
    var oService = GetMailMergeService(); 
    Alternatively, you may access MailMergeService methods statically
    (where instance data is not required). */

var ActivityType = {
    actMeeting: 0,
    actPhoneCall: 1,
    actToDo: 2
};

var AddressType = {
    astPrimary: 0,
    astShip: 1,
    astOther: 2
};

var AlarmLead = {
    leadMinutes: 0,
    leadHours: 1,
    leadDays: 2
};
var AttachmentType = {
    atRegularAttachment: 0,
    atLibraryAttachment: 1,
    atTempAttachment: 2
};

var EditMode = {
    emEditBefore: 0,
    emEditAfter: 1
};
  
var EmailFormat = {
    formatHTML: 0,
    formatPlainText: 1
};

var EmailSystem = {
    emailNone: 0,
    emailOutlook: 2
};

var EngineResult = {
    erCanceled: 0,
    erSuccess: 1,
    erError: 2
};

var FaxDelivery = {
    delivASAP: 0,
    delivDateTime: 1,
    delivOffPeak: 2,
    delivHold: 3
};

var FaxPriority = {
    priHigh: 0,
    priNormal: 1,
    priLow: 2
};

var FollowUp = {
    fuNone: 0,
    fuMeeting: 1,
    fuPhoneCall: 2,
    fuToDo: 3
};

var GroupFamily = {
    famContact: 0,
    famAccount: 1,
    famOpportunity: 2,
    famOther: 3
};

var JsonResult = {
    jrIsJson: 0,
    jrObject: 1
};

var LitReqResult = {
    lrCanceled: 0,
    lrSuccess: 1,
    lrError: 2,
    lrEntityId: 3
};

var MaxTo = {
    maxOne: 0,
    maxNoMax: 1
};

var MergeMode = {
    mmEmail: 0,
    mmFax: 1,
    mmLetter: 2
};

var MenuIdentifier = {
    miEmail: 500,
    miLetter: 501,
    miFax: 502    
};

var MergeWith = {
    withCurrentEntity: 0,
    withCurrentGroup: 1,
    withSpecificGroup: 2,
    withAccount: 3,
    withOpportunity: 4,
    withEntityIds: 5
};

var ModalResult = {
    resNone: 0,
    resOk: 1,
    resCancel: 2,
    resAbort: 3,
    resRetry: 4,
    resIgnore: 5,
    resYes: 6,
    resNo: 7
};

var MruMenu = {
    mmEmail: 0,
    mmFax: 1,
    mmLetter: 2     
};

/* NOTE: SLXMMGUIW.cOutputType is TemplateType in this script.
 * OutputType is equivalent to SLXMMEngineW.OutputType. */
var OutputType = {
    otPrinter: 0,
    otFile: 1,
    otEmail: 2,
    otFax: 3
};

/* PrintOption for literature requests. */
var PrintOption = {
    poWithCoverLetter: 0,
    poOnSeparatePage: 1,
    poOnlyAttachmentList: 2,
    poOnlyCoverLetter: 3
};

var PrinterResult = {
    prPrinterName: 0,
    prCanceled: 1,
    prSuccess: 2
};

var RecipientType = {
    rtTo: 0,
    rtCC: 1,
    rtBCC: 2
};

var RunAs = {
    raNormal: 0,
    raSalesProcess: 2
};

var SelectFolderResult = {
    srSelected: 0,
    srFolder: 1
};

/* NOTE: SLXMMGUIW.cOutputType is TemplateType in this script.
 * var OutputType above is equivalent to SLXMMEngineW.OutputType. */
var TemplateType = {
    ttEmail: 0,
    ttFax: 1,
    ttLetter: 2
};

var TemplatesResult = {
    trPluginId: 0,
    trPluginName: 1,
    trPluginFamily: 2,
    trPluginMainTable: 3,
    trCanceled: 4,
    trSuccess: 5
};

var TransportType = {
    transHTTP: 0
};

var WhichEvents = {
    weAddressLabels: 0,
    weMailMerge: 1,
    weMailMergeEngine: 2,
    weProgressDlg: 3,
    weTemplateEditor: 4
};

var WhichProperties = {
    wpAddressLabels: 0,
    wpEditMergedDocs: 1,
    wpMailMerge: 2,
    wpMailMergeEngine: 3,
    wpTemplateEditor: 4,
    wpSelectAddressType: 5
};

/* Globals */
var gExcelInstalled = null;
var gInitialized = false;
var gMailMerge = null;
var gMailMergeCookies = null;
var gMailMergeGUI = null;
var gProgressDlg = null;
var gTemplateEditor = null;

Sage.MailMergeService = function() {
    this.LastReport = null;
    this.MenuPopulated = false;
};

Sage.MailMergeService.prototype.ConnectEvents = function(obj, which) {
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
            throw new Error(DesktopErrors().ConnectEventsError);
    }
};

Sage.MailMergeService.prototype.HandleOnCancelProgress = function() {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("The user initiated a cancel request and will be prompted for verification (when [not] merging silently)."); /*DNL*/
    }
};

Sage.MailMergeService.prototype.HandleOnMerge = function(slxDocument) {
    var oService = GetMailMergeService();
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
};

Sage.MailMergeService.prototype.HandleOnPreview = function(tempFileName, entityId, showPreview, params) {
    var oService = GetMailMergeService();
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
};

Sage.MailMergeService.prototype.HandleOnPrintAddressLabels = function(
    reportId, whereSql, sortFields, report, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Deprecated: HandleOnPrintAddressLabels()"); /*DNL*/
    }
};

Sage.MailMergeService.prototype.HandleOnRequestAlarmLeadInfo = function(userId, activityType, params) {
    var oService = GetMailMergeService();
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
            } catch (err) {
                oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
            }
        }
        finally {
            oService.Debug("Exiting HandleOnRequestAlarmLeadInfo()"); /*DNL*/
        }
    }
};

//TODO: Need to verify the [remote] reporting.
Sage.MailMergeService.prototype.HandleOnRequestCrystalReport = function(
    reportId, sql, leftMargin, topMargin, sortFields, report, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestCrystalReport()"); /*DNL*/
        try {
            oService.SetParamValue(params, "Error", ""); /*DNL*/
            oService.SetParamValue(params, "Success", false); /*DNL*/
            if (!MailMergeInfoStore().RemoteInfo.UseActiveReporting) {
                var oReport = new oService.MailMergeReport();
                oReport.Id = reportId;
                oReport.Sql = sql;
                oService.LastReport = oReport;
                var sUrl = String.format("{0}/GetReport.aspx?isAL=T", oService.GetClientPath());
                window.open(sUrl, "AddressLabelViewer", "height=300,width=600,left=10,top=10,location=no,menubar=no,resizable=yes,scrollbars=yes,status=no,titlebar=no,toolbar=no");
                oService.SetParamValue(params, "Success", true); /*DNL*/
            }
            else {
                try {
                    var oSlxReportViewer = oService.NewActiveXObject("SLXCRV.CRViewer");
                    if (oSlxReportViewer.IsCrystalViewerInstalled() == false) {
                        oService.SetParamValue(params, "Error", DesktopErrors().ReportViewerNotInstalled); /*DNL*/
                        return;
                    }
                    if (oSlxReportViewer.IsCrystalReportsRunTimeInstalled() == false) {
                        oService.SetParamValue(params, "Error", DesktopErrors().CrystalRuntimeError); /*DNL*/
                        return;
                    }
                    var sConnectionString = MailMergeInfoStore().RemoteInfo.ConnectionString;
                    var sDataSource = MailMergeInfoStore().RemoteInfo.DataSource;
                    var sKeyField = "CONTACT.CONTACTID"; /*DNL*/
                    var sPassword = MailMergeInfoStore().Password;
                    var sPluginId = reportId;
                    var sRecordSelection = "";
                    var sSortDirections = "";
                    var sSortFields = "";
                    var sSqlSelect = "";
                    var sSqlWhere = "";
                    var sUserCode = MailMergeInfoStore().UserCode;
                    var bForceSql = false;
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
                    sError = String.format("{0} {1}", DesktopErrors().ReportViewerError, sError);
                    oService.SetParamValue(params, "Error", sError); /*DNL*/
                }
            }
        }
        finally {
            oService.Debug("Exiting HandleOnRequestCrystalReport()"); /*DNL*/
        }
    }
};

Sage.MailMergeService.prototype.HandleOnRequestGroupInfoEx = function(groupId, useTableAlias, params) {
    var oService = GetMailMergeService();
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

                var sParameters = "";
                var oParameters = oXmlReader.selectChildNodes("SLXGroup/parameters/parameter"); 
                for (var i = 0; i < oParameters.length; i++) {
                    var oParam = oParameters[i];
                    var sDataPath = oXmlReader.selectSingleNodeText("datapath", oParam);
                    var sDataType = oXmlReader.selectSingleNodeText("fieldtype", oParam);
                    var sFieldName = oXmlReader.selectSingleNodeText("fieldname", oParam);
                    var sName = oXmlReader.selectSingleNodeText("name", oParam);
                    var sOperator = oXmlReader.selectSingleNodeText("operator", oParam);
                    var sTableName = oXmlReader.selectSingleNodeText("tablename", oParam);
                    var sValue = oXmlReader.selectSingleNodeText("value", oParam);
                    sParameters += "|" + sName + "|" + sValue + "|" + sDataType + "|" + sDataPath + "|" + sTableName + "|" + sFieldName + "|" + sOperator + "|\r\n";
                }

                var IDX_FAMILY = 3;
                var sFamily = oXmlReader.selectSingleNode("SLXGroup/plugindata").attributes.item(IDX_FAMILY).nodeValue.toUpperCase();
                /* 0 qtContact, 1 qtAccount, 2 qtOpportunity, 3 qtOther.
                 * The only groups used by mail merge are CONTACT, ACCOUNT, OPPORTUNITY, and LEAD. */
                var iQueryType = 3; /* qtOther */
                switch (sFamily) {
                    case "CONTACT": /*DNL*/
                        iQueryType = 0;
                        break;
                    case "ACCOUNT": /*DNL*/
                        iQueryType = 1;
                        break;
                    case "OPPORTUNITY": /*DNL*/
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
                    for (var i = 0; i < oConditions.length; i++) {
                        var oCond = oConditions[i];
                        var sAlias = oXmlReader.selectSingleNodeText("alias", oCond);
                        var sCaseSens = oXmlReader.selectSingleNodeText("casesens", oCond);
                        var sConnector = oXmlReader.selectSingleNodeText("connector", oCond);
                        var sDataPath = oXmlReader.selectSingleNodeText("datapath", oCond);
                        var sDisplayName = oXmlReader.selectSingleNodeText("displayname", oCond);
                        var sDisplayPath = oXmlReader.selectSingleNodeText("displaypath", oCond);
                        var sFieldType = oXmlReader.selectSingleNodeText("fieldtype", oCond);
                        var sFieldTypeName = "";
                        var sIsLiteral = oXmlReader.selectSingleNodeText("isliteral", oCond);
                        var sIsNegated = oXmlReader.selectSingleNodeText("isnegated", oCond);
                        var sLeftParens = oXmlReader.selectSingleNodeText("leftparens", oCond);
                        var sOperator = oXmlReader.selectSingleNodeText("operator", oCond);
                        var sRightParens = oXmlReader.selectSingleNodeText("rightparens", oCond);
                        var sValue = oXmlReader.selectSingleNodeText("value", oCond);
                        /* Condition Terms: |DataPath|Alias|Condition|Value|AND/OR|Type|CS|(|)|IsLiteral|NOT| */
                        sConditions += "|" + sDataPath + "|" + sAlias + "|" + sOperator + "|" + sValue +
                            "|" + sConnector + "|" + sFieldType + "|" + sCaseSens + "|" + sLeftParens + "|" + sRightParens +
                            "|" + sIsLiteral + "|" + sIsNegated + "|\r\n";
                    }
                }

                var sLayouts = "";
                if (oService.HasParam(params, "Layouts")) { /*DNL*/
                    var oLayouts = oXmlReader.selectChildNodes("SLXGroup/layouts/layout");
                    for (var i = 0; i < oLayouts.length; i++) {
                        var oLayout = oLayouts[i];
                        var bIsHidden = (oLayout.nodeName == "hiddenfield");
                        var sAlias = oXmlReader.selectSingleNodeText("alias", oLayout);
                        var sAlign = oXmlReader.selectSingleNodeText("align", oLayout);
                        var sCaptAlign = oXmlReader.selectSingleNodeText("captalign", oLayout);
                        var sCaption = oXmlReader.selectSingleNodeText("caption", oLayout);
                        var sDataPath = oXmlReader.selectSingleNodeText("datapath", oLayout);
                        var sDisplayName = oXmlReader.selectSingleNodeText("displayname", oLayout);
                        var sDisplayPath = oXmlReader.selectSingleNodeText("displaypath", oLayout);
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
                    for (var i = 0; i < oSorts.length; i++) {
                        var oSort = oSorts[i];
                        var sAlias = oXmlReader.selectSingleNodeText("alias", oSort);
                        var sDataPath = oXmlReader.selectSingleNodeText("datapath", oSort);
                        var sDisplayName = oXmlReader.selectSingleNodeText("displayname", oSort);
                        var sDisplayPath = oXmlReader.selectSingleNodeText("displaypath", oSort);
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
};

Sage.MailMergeService.prototype.HandleOnRequestGroups = function(userId, groups, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestGroups()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/

                var sUrl = oService.GetGroupManagerUrl() + "GetAllGroups";
                var sGroups = oService.GetFromServer(sUrl);
                if (!Ext.isEmpty(sGroups)) {
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
};

Sage.MailMergeService.prototype.HandleOnRequestUsers = function(userId, users, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestUsers()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/

                var sUrl = oService.GetGroupManagerUrl() + "GetUsers";
                var sUsers = oService.GetFromServer(sUrl);
                if (!Ext.isEmpty(sUsers)) {
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
};

Sage.MailMergeService.prototype.HandleOnRequestRebuildSchema = function(params) {
    var oService = GetMailMergeService();
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
};

Sage.MailMergeService.prototype.HandleOnCancelMailMerge = function() {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("The user canceled the mail merge job."); /*DNL*/
    }
};

Sage.MailMergeService.prototype.HandleOnCustomFieldName = function(
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
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnCustomFieldName()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/

                var wdTableFormat3DEffects1 = 32;
                var wdTableFormatProfessional = 37;
                var wdAutoFitContent = 1;
                var wdAutoFitWindow = 2;
                var wdWord8TableBehavior = 0;
                var wdWord9TableBehavior = 1;

                var sError;
                var oTable;

                switch (fieldName.toUpperCase()) {
                    /* This is an example only.*/ 
                    case "CUSTOMFIELDNAME_EXAMPLE_A": /*DNL*/
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

                        oTable = range.ConvertToTable(sSeparator, iNumRows, iNumColumns, iInitialColumnWidth, enFormat, bApplyBorders,
                            bApplyShading, bApplyFont, bApplyColor, bApplyHeadingRows, bApplyLastRow, bApplyFirstColumn,
                            bApplyLastColumn, bAutoFit, enAutoFitBehavior, enDefaultTableBehavior);
                        /* oTable...Do something with the Table object. */
                        break;
                    /* This is an example only. */ 
                    case "CUSTOMFIELDNAME_EXAMPLE_B": /*DNL*/
                        range.InsertParagraphAfter();
                        range.InsertAfter("SalesLogix Mail Merge"); /*DNL*/
                        range.Bold = true;
                        break;
                    /* If the fieldName is not handled then pass back an error. */ 
                    default:
                        sError = DesktopErrors().OnCustomFieldNameError;
                        oService.SetParamValue(params, "Error", sError); /*DNL*/
                        /*range.Text = "FieldName=" + fieldName + "; AccountID=" + accountId + "; AddressID=" + addressId +
                        "; ContactID=" + contactId + "; OpportunityID=" + opportunityId + "; PluginID=" + pluginId +
                        "; UserID=" + userId + "; Preview=" + preview + "; OneOffTicketID=" + oneOffTicketId;*/
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
};

Sage.MailMergeService.prototype.HandleOnHideProgress = function() {
    var oService = GetMailMergeService();
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
};

/* This event is called by the mail merge engine when the DebugMode DWORD registry
 * value is set to 1 in the following registry location:
 * HKEY_CURRENT_USER\Software\SalesLogix\MailMerge */
Sage.MailMergeService.prototype.HandleOnOutputDebug = function(msg) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug(msg, "MailMergeEngine"); /*DNL*/
    }
};

//TODO: Verify
Sage.MailMergeService.prototype.HandleOnRequestCompleteFax = function(
    type, entityId, historyId, opportunityId, notes, leader, mainTable, ticketId, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestCompleteFax()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
                var sRegarding = oService.GetParamValue(params, "Regarding"); /*DNL*/
                var oQuery = new Object();
                oQuery.historyid = historyId;
                oQuery.entityid = entityId;
                oQuery.ticketid = ticketId;
                oQuery.oppid = opportunityId;
                oQuery.mmtype = "fax"; /*DNL*/
                oQuery.maintable = mainTable;
                var sQuery = Ext.urlEncode(oQuery);
                var sUrl = oService.GetClientPath() + "/EmailPromptForHistory.aspx?" + sQuery;
                var sReturnValue = oService.OpenDialog(sUrl, 750, 580);
                if (sReturnValue != "") {
                    oService.SetParamValue(params, "Regarding", sReturnValue); /*DNL*/
                }
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
};

Sage.MailMergeService.prototype.HandleOnRequestCompleteLetter = function(
    type, entityId, historyId, opportunityId, notes, leader, mainTable, ticketId, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestCompleteLetter()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
                var sRegarding = oService.GetParamValue(params, "Regarding"); /*DNL*/
                var oQuery = new Object();
                oQuery.historyid = historyId;
                oQuery.entityid = entityId;
                oQuery.ticketid = ticketId;
                oQuery.oppid = opportunityId;
                oQuery.mmtype = "letter"; /*DNL*/
                oQuery.maintable = mainTable;
                var sQuery = Ext.urlEncode(oQuery);
                var sUrl = oService.GetClientPath() + "/EmailPromptForHistory.aspx?" + sQuery;
                var sReturnValue = oService.OpenDialog(sUrl, 750, 580);
                if (!Ext.isEmpty(sReturnValue)) {
                    oService.SetParamValue(params, "Regarding", sReturnValue); /*DNL*/
                }
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
};

Sage.MailMergeService.prototype.HandleOnRequestCreateAdHocGroup = function(
    entityIds, groupName, mainTable, layoutId, params) {
    var oService = GetMailMergeService();
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
                var sQuery = Ext.urlEncode(oQuery);
                var sUrl = String.format("{0}CreateAdHocGroup&{1}", oService.GetGroupManagerUrl(), sQuery);
                var sGroupId = oService.GetFromServer(sUrl);
                if (!Ext.isEmpty(sGroupId)) {
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
};

Sage.MailMergeService.prototype.HandleOnRequestData = function(
    userId, mainTable, addressField, criteria, opportunityDataPath, opportunityValue, sorts, layouts, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestData()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/

                var sPost = "<slqueryrequest><layouts><![CDATA["; /*DNL*/
                for (var i = 0; i < layouts.RowCount; i++) {
                    if (i != 0) {
                        sPost += ",";
                    }
                    sPost += layouts.GetValue(i, 0);
                }

                sPost += "]]></layouts>"; /*DNL*/
                sPost += "<maintable>" + mainTable + "</maintable>"; /*DNL*/
                sPost += "<userid>" + userId + "</userid>"; /*DNL*/
                sPost += "<addressfield><![CDATA[" + addressField + "]]></addressfield>"; /*DNL*/
                sPost += "<criteria><![CDATA[" + criteria + "]]></criteria>"; /*DNL*/
                sPost += "<sorts><![CDATA[" + sorts + "]]></sorts>"; /*DNL*/
                sPost += "</slqueryrequest>"; /*DNL*/

                var sUrl = oService.GetGroupManagerUrl() + "GetQueryData";
                var sXml = oService.PostToServer(sUrl, sPost);
                if (!Ext.isEmpty(sXml)) {
                    var oXmlReader = new Sage.SimpleXmlReader(sXml);

                    var sData = oXmlReader.selectSingleNodeText("returndata/data");
                    oService.SetParamValue(params, "Data", sData); /*DNL*/
                    var oLayouts = oXmlReader.selectChildNodes("returndata/layouts/layout");
                    if (layouts.RowCount != oLayouts.length) {
                        throw new Error(DesktopErrors().HandleOnRequestDataError);
                    }
                    for (var i = 0; i < layouts.RowCount; i++) {
                        var sLayout = oXmlReader.getNodeText(oLayouts[i]);
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
};

Sage.MailMergeService.prototype.HandleOnRequestEditAfter = function(
    editInfos, mode, output, mainTable, params) {
    var oService = GetMailMergeService();
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
};

Sage.MailMergeService.prototype.HandleOnRequestEditDocument = function(
    editInfo, mode, type, mainTable, params) {
    var oService = GetMailMergeService();
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
};

//TODO: Verify
Sage.MailMergeService.prototype.HandleOnRequestFaxOptions = function(
    toName, toNumber, faxProvider, mainTable, params) {
    var oService = GetMailMergeService();
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
                    oFaxOptionsDlg.CoverPage = (Ext.isString(sCoverPage)) ? sCoverPage : "";
                    oFaxOptionsDlg.FaxProvider = faxProvider;
                    oFaxOptionsDlg.Number = toNumber;
                    oFaxOptionsDlg.Subject = (Ext.isString(sSubject)) ? sSubject : "";
                    oFaxOptionsDlg.To_ = toName;
                    oFaxOptionsDlg.UserID = MailMergeInfoStore().UserId;
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
            } catch (err) {
                oService.Debug("ERROR in HandleOnRequestFaxOptions(): " + oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
            }
        }
        finally {
            oService.Debug("Exiting HandleOnRequestFaxOptions()"); /*DNL*/
        }
    }
};

Sage.MailMergeService.prototype.HandleOnRequestFormat = function(
    type, formatString, value, params) {
    var oService = GetMailMergeService();
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
                var sQuery = Ext.urlEncode(oQuery);
                var sUrl = String.format("{0}slformat&{1}", oService.GetInfoBrokerUrl(), sQuery);
                var sResult = oService.GetFromServer(sUrl);
                if (!Ext.isEmpty(sResult)) {
                    oService.SetParamValue(params, "Result", sResult); /*DNL*/
                    oService.SetParamValue(params, "Success", true); /*DNL*/
                }
            }
            catch (err) {
                oService.Debug("ERROR in HandleOnRequestFormat(): " + oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
            }
        } finally {
            oService.Debug("Exiting HandleOnRequestFormat()"); /*DNL*/
        }
    }
};

Sage.MailMergeService.prototype.HandleOnRequestPrintAddressLabels = function(params) {
    var oService = GetMailMergeService();
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
                            oAddressLabels.CurrentGroupName = (oContext.GroupName != "") ? oContext.GroupName : MailMergeInfoStore().Resources.NoGroup;
                        }
                        if (oContext.EntityIsContact || oContext.EntityIsLead) {
                            oAddressLabels.CurrentEntityID = oContext.IsDetailMode ? oContext.EntityId : "";
                            oAddressLabels.CurrentEntityName = oContext.IsDetailMode ? oContext.EntityDescription : (oContext.EntityIsLead ? MailMergeInfoStore().Resources.NoLead : MailMergeInfoStore().Resources.NoContact);
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

        } finally {
            oService.Debug("Exiting HandleOnRequestPrintAddressLabels()"); /*DNL*/
        }
    }
};

//TODO: Validate
/* This will only happen for a sales process. */
Sage.MailMergeService.prototype.HandleOnRequestScheduleFollowUp = function(
    followUp, accountId, accountName, entityId, entityName,
    opportunityId, opportunityName, mainTable, ticketId, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestScheduleFollowUp()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
                var oQuery = new Object();
                oQuery.conid = entityId;
                oQuery.accid = accountId;
                oQuery.oppid = opportunityId;
                oQuery.tickid = ticketId;
                var sQuery = Ext.urlEncode(oQuery);
                var sActivityType = "meet"; /*DNL*/
                switch (followUp) {
                    case FollowUp.fuPhoneCall:
                        sActivityType = "call"; /*DNL*/
                        break;
                    case FollowUp.fuToDo:
                        sActivityType = "todo"; /*DNL*/
                        break;
                }
                var sUrl = String.format("{0}/view?name=addactivity&acttype={1}&{2}", oService.GetClientPath(), sActivityType, sQuery);
                oService.OpenDialog(sUrl, 750, 660);
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
};

Sage.MailMergeService.prototype.HandleOnRequestSelectAddressType = function(params) {
    var oService = GetMailMergeService();
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
};

Sage.MailMergeService.prototype.HandleOnRequestViewGroup = function(groupId, params) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnRequestViewGroup()"); /*DNL*/
        try {
            try {
                oService.SetParamValue(params, "Error", ""); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
                var oContext = oService.GetContext();
                if (oContext) {
                    var sEntity = (oContext.EntityIsLead) ? "Lead" : "Contact"; /*DNL*/
                    var sUrl = String.format("{0}/{1}.aspx?gid={2}&modeid=list", oService.GetClientPath(), sEntity, groupId);
                    window.setTimeout("ShowMailMergeUrl('" + sUrl + "');", 1500);
                    oService.SetParamValue(params, "Success", true); /*DNL*/
                }
            } catch (err) {
                oService.Debug("ERROR in HandleOnRequestViewGroup(): " + oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
            }
        }
        finally {
            oService.Debug("Exiting HandleOnRequestViewGroup()"); /*DNL*/
        }
    }
};

/* Used for Sales Processes only. */
Sage.MailMergeService.prototype.HandleOnSelectPrinter = function(caption, params) {
    var oService = GetMailMergeService();
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
            } catch (err) {
                oService.Debug("ERROR in HandleOnSelectPrinter(): " + oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Error", oService.FormatError(err)); /*DNL*/
                oService.SetParamValue(params, "Success", false); /*DNL*/
            }
        }
        finally {
            oService.Debug("Exiting HandleOnSelectPrinter()"); /*DNL*/
        }
    }
};

Sage.MailMergeService.prototype.HandleOnShowProgress = function(
    message1, message2, message3, progressHandlerWnd, progressMax,
    progressPosition, progressTotalPosition, enableCancel, showProgress) {
    var oService = GetMailMergeService();
    if (oService) {
        oService.Debug("Entering HandleOnShowProgress()"); /*DNL*/
        try {
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
        finally {
            oService.Debug("Exiting HandleOnShowProgress()"); /*DNL*/
        }
    }
};

Sage.MailMergeService.prototype.AddCookies = function(obj) {
    /* This will add the X-Sage-SalesLogix-Cookies header value.
    * These values are used by Firefox for HTTP authentication
    * within the mail merge ActiveX controls. Internet Explorer
    * adds these cookies to the HTTP request automatically.
    * These values [cannot] be used as-is to set the header value
    * and they can only be understood and processed by the ActiveX. */
    if (!Ext.isIE) {
        if (typeof obj.AddCookie == "function" && typeof obj.ClearCookies == "function") {
            var oCookies = this.GetCookies();
            if (oCookies != null) {
                obj.ClearCookies();
                if (!Ext.isEmpty(oCookies.SessionId)) {
                    obj.AddCookie("ASP.NET_SessionId", oCookies.SessionId); /*DNL*/
                }
                if (!Ext.isEmpty(oCookies.SlxAuth)) {
                    obj.AddCookie(".SLXAUTH", oCookies.SlxAuth); /*DNL*/
                }
                if (!Ext.isEmpty(oCookies.SlxWeb)) {
                    obj.AddCookie("slxweb", oCookies.SlxWeb); /*DNL*/
                }
                if (!Ext.isEmpty(oCookies.LogonUser)) {
                    obj.AddCookie(".LOGON_USER", oCookies.LogonUser); /*DNL*/
                }
                if (!Ext.isEmpty(oCookies.UserName)) {
                    obj.AddCookie("X-UserName:" + oCookies.UserName, oCookies.UserValue); /*DNL*/
                }
            }
        }
    }
};

Sage.MailMergeService.prototype.AddNewSubMenuItem = function(menu, pluginId, caption) {
    var arrMenuId = [MenuIdentifier.miEmail, MenuIdentifier.miFax, MenuIdentifier.miLetter];
    var oMenu = Ext.ComponentMgr.get(arrMenuId[menu]).menu;
    if (oMenu) {
        if (oMenu.items.length == 1) {
            oMenu.addSeparator();
        }
        var arrAction = ["Email", "Fax", "Letter"]; /*DNL*/
        var sWriteAction = "javascript:ExecuteWriteAction(WriteAction.waWrite{0}Using, '{1}')";
        var sUrl = String.format(sWriteAction, arrAction[menu], pluginId);
        oMenu.add({ text: caption, href: sUrl, cls: "x-btn-text-icon", icon: "" });
    }
};

Sage.MailMergeService.prototype.CloseMenus = function() {
    try {
        Ext.menu.MenuMgr.hideAll();
    } catch (err) {
    }
};

Sage.MailMergeService.prototype.Debug = function(msg, source) {
    var sMsg;
    if (!Ext.isDefined(source)) {
        /* The msg is from the MailMergeService. */
        var dtNow = new Date();
        var sDateTime = this.MailMergeGUI().DateTimeToStr(dtNow);
        sMsg = String.format("MailMergeService: {0} : {1}", sDateTime, msg); /*DNL*/
    }
    else {
        /* The msg is from the MailMergeEngine (or other source). */
        sMsg = String.format("{0}: {1}", source, msg);
    }
    this.MailMergeGUI().Debug(sMsg);
    try {
    if (window.console) {
        console.log(sMsg);
    }
    } catch (e) {
    }
};

Sage.MailMergeService.prototype.DisplayError = function(errobj) {
    var sError = this.FormatError(errobj);
    this.ShowError(sError);
};

Sage.MailMergeService.prototype.ExcelInstalled = function() {
    if (gExcelInstalled == null) {
        try {
            var oExcelApp = this.NewActiveXObject("Excel.Application");
            gExcelInstalled = true;
            try {
                oExcelApp.Quit();
                oExcelApp == null;
            } catch (e) {
            }
        }
        catch (err) {
            gExcelInstalled = false;
        }
    }
    return gExcelInstalled;
};

Sage.MailMergeService.prototype.ExportToExcel = function(groupId, useGroupContext) {
    try {
        this.CloseMenus();
        if (!this.ExcelInstalled()) {
            throw new Error(DesktopErrors().ExcelNotInstalled || "Excel not installed.");
        }
        var oExcelExport = new Sage.ExcelExport(groupId, useGroupContext);
        oExcelExport.Execute();
    }
    catch (err) {
        var sXtraMsg = "";
        if (IsSageGearsObjectError(err)) {
            sXtraMsg = DesktopErrors().SageGearsObjectError;
        }
        var sError = (Ext.isFunction(err.toMessage)) ? err.toMessage(sXtraMsg, MailMergeInfoStore().ShowJavaScriptStack) : err.message;
        Ext.Msg.show({
            title: "Sage SalesLogix",
            msg: String.format(DesktopErrors().ExportToExcelError, sError),
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    }
};

Sage.MailMergeService.prototype.FindParamValue = function(params, name) {
    if (params.Exists(name)) {
        return true;
    }
    return false;
};

Sage.MailMergeService.prototype.FormatError = function(errobj) {
    if (errobj) {
        var sError = (Ext.isFunction(errobj.toMessage)) ? errobj.toMessage(DesktopErrors().UnexpectedError, MailMergeInfoStore().ShowJavaScriptStack) : errobj.message;
        return sError;
    }
    return null;
};

Sage.MailMergeService.prototype.FulfillLitRequest = function(litReqId) {
    var lrResult = [false, false, ""];
    try {
        var sUrl = String.format("{0}/SlxLitRequest.aspx?method=GetLitReqInfo&litReqId={1}", this.GetClientPath(), litReqId);
        var sResult = this.GetFromServer(sUrl);
        if (!Ext.isEmpty(sResult)) {
            var arrLitReqInfo = sResult.split("|");
            if (Ext.isArray(arrLitReqInfo) && arrLitReqInfo.length == 6) {
                var sUserId = String(arrLitReqInfo[0]).trim();
                if (!this.UserCanMergeAsUser(sUserId)) {
                    var sDescription = this.GetSingleValue("DESCRIPTION", "LITREQUEST", "LITREQID", litReqId); /*DNL*/
                    lrResult[LitReqResult.lrError] = String.format(DesktopErrors().LitRequestSecurity, sDescription, this.TranslateUserId(sUserId));
                    return lrResult;
                }
                var sSendVia = arrLitReqInfo[1];
                var sCoverId = arrLitReqInfo[2];
                var sCoverName = arrLitReqInfo[3];
                var sContactId = arrLitReqInfo[4];
                var iPrintOption = Number(arrLitReqInfo[5]);
                sUrl = String.format("{0}/SlxLitRequest.aspx?method=GetLiteratureList&litReqId={1}", this.GetClientPath(), litReqId);
                sResult = this.GetFromServer(sUrl);
                if (!Ext.isEmpty(sResult)) {
                    var arrLiterature = null;
                    var bSendViaEmail = false;
                    var arrLiteratureItems = sResult.split("|");
                    if (Ext.isArray(arrLiteratureItems)) {
                        arrLiterature = new Array(arrLiteratureItems.length);
                        for (var i = 0; i < arrLiterature.length; i++) {
                            arrLiterature[i] = new Array(2);
                        }
                        for (var i = 0; i < arrLiteratureItems.length; i++) {
                            var arrLiteraturePair = arrLiteratureItems[i].split("=");
                            if (Ext.isArray(arrLiteraturePair) && (arrLiteraturePair.length == 2)) {
                                arrLiterature[i][0] = arrLiteraturePair[0]; /* Name */
                                arrLiterature[i][1] = arrLiteraturePair[1]; /* Count */
                            }
                        }
                        var bPrintLiterature = true;
                        switch (iPrintOption) {
                            case PrintOption.poWithCoverLetter:
                            case PrintOption.poOnlyCoverLetter:
                                if (Ext.isString(sSendVia)) {
                                    /* Look for both localized and non-localized values. */
                                    var arrEmailStrings = [
                                        MailMergeInfoStore().Resources.SendViaEmail1,
                                        MailMergeInfoStore().Resources.SendViaEmail2,
                                        "EMAIL", /*DNL*/
                                        "E-MAIL"]; /*DNL*/
                                    var oRegExp = new RegExp(sSendVia, "i");
                                    for (var i = 0; i < arrEmailStrings.length; i++) {
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
                        /* Get the printer name, if necessary. */
                        if (bPrintLiterature) {
                            var oContext = this.GetContext();
                            if (oContext) {
                                var LITREQUESTPRINTER = "LitRequestPrinterName"; /*DNL*/
                                var sLitRequestPrinter = oContext.GetClientContext(LITREQUESTPRINTER, true);
                                if (!Ext.isEmpty(sLitRequestPrinter)) {
                                    sPrinterName = sLitRequestPrinter;
                                }
                                else {
                                    var arrPrinterResult = this.SelectPrinter(MailMergeInfoStore().Resources.SelectPrinter);
                                    if (Ext.isArray(arrPrinterResult)) {
                                        var bCanceled = arrPrinterResult[PrinterResult.prCanceled];
                                        var bSuccess = arrPrinterResult[PrinterResult.prSuccess];
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
                            if (Ext.isEmpty(sPrinterName)) {
                                lrResult[LitReqResult.lrError] = DesktopErrors().PrinterNameError;
                                return lrResult;
                            }
                        } /* end if (bPrintLiterature) {} */
                        /* Is a mail merge required? */
                        if (iPrintOption != PrintOption.poOnlyAttachmentList) {
                            var oQuery = new Object();
                            oQuery.coverId = sCoverId;
                            oQuery.coverName = sCoverName;
                            oQuery.userId = sUserId;
                            var sQuery = Ext.urlEncode(oQuery);
                            sUrl = String.format("{0}/SlxLitRequest.aspx?method=GetPluginId&{1}", this.GetClientPath(), sQuery);
                            var sPluginId = this.GetFromServer(sUrl);
                            this.Debug("FulfillLitRequest: COVERID = " + sCoverId + "; PLUGINID = " + sPluginId); /*DNL*/
                            if (Ext.isEmpty(sPluginId)) {
                                lrResult[LitReqResult.lrError] = String.format(DesktopErrors().LitRequestTemplateError, sCoverName, sUserId);
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
                            for (var i = 0; i < arrLiterature.length; i++) {
                                var sName = arrLiterature[i][0];
                                var iCount = arrLiterature[i][1];
                                oMailMergeInfo.AddEnclosure(iCount, sName);
                            }
                            var arrEngineResult = oMailMergeInfo.ExecuteMailMerge();
                            var bCanceled = arrEngineResult[EngineResult.erCanceled];
                            if (bCanceled) {
                                lrResult[LitReqResult.lrCanceled] = true;
                                return lrResult;
                            }
                            var bSuccess = arrEngineResult[EngineResult.erSuccess];
                            if (!bSuccess) {
                                var sError = arrEngineResult[EngineResult.erError];
                                if (Ext.isEmpty(sError)) {
                                    sError = DesktopErrors().UnknownEngineError;
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
                            oWordApp.Selection.TypeText(MailMergeInfoStore().Resources.Enclosure);
                            oWordApp.Selection.TypeParagraph();
                            oWordApp.Selection.TypeParagraph();
                            for (var i = 0; i < arrLiterature.length; i++) {
                                var sEnclosure = String.format("({0}) {1}", arrLiterature[i][1], arrLiterature[i][0]);
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
                        lrResult[LitReqResult.lrError] = DesktopErrors().LitRequestLiteratureError;
                    }
                }
                else {
                    lrResult[LitReqResult.lrError] = DesktopErrors().LitRequestLiteratureItemsError;
                }
            }
            else {
                lrResult[LitReqResult.lrError] = DesktopErrors().LitRequestInfoError;
            }
        }
        else {
            lrResult[LitReqResult.lrError] = DesktopErrors().LitRequestInfoEmptyError;
        }
    }
    catch (err) {
        lrResult[LitReqResult.lrError] = this.FormatError(err);
    }
    return lrResult;
};

Sage.MailMergeService.prototype.GetClientPath = function() {
    var sLocation = String(window.location);
    var iIndex = sLocation.lastIndexOf("/");
    if (iIndex != -1) {
        return sLocation.substring(0, iIndex);
    }
    throw new Error(DesktopErrors().GetClientPathError);
};

Sage.MailMergeService.prototype.GetConnectionString = function() {
    return this.GetClientPath() + "/SLXMailMergeServer.ashx";
};

Sage.MailMergeService.prototype.GetCookies = function() {
    if (!Ext.isIE) {
        if (gMailMergeCookies != null)
            return gMailMergeCookies;
        var sPath = this.GetClientPath();
        if (sPath != null) {
            var sUrl = String.format("{0}/SLXMailMergeClient.ashx?method=GetHttpInfo", sPath); 
            var oXmlHttp = this.GetHttpRequest();
            if (oXmlHttp != null) {
                oXmlHttp.open("GET", sUrl, false); 
                oXmlHttp.send(null);
                var sContentType = oXmlHttp.getResponseHeader("Content-Type");
                if (sContentType.indexOf("application/json") != -1) {
                    var sJsonResponse = oXmlHttp.responseText;
                    if (!Ext.isEmpty(sJsonResponse)) {
                        var oCookies = Ext.util.JSON.decode(sJsonResponse);
                        if (oCookies != null) {
                            gMailMergeCookies = oCookies;
                            return gMailMergeCookies;
                        }
                    }
                }
            }
        }
    }
    return null;
}

Sage.MailMergeService.prototype.GetFromServer = function(url) {
    var oXmlHttp = this.GetHttpRequest();
    oXmlHttp.open("GET", url, false);
    oXmlHttp.send(null);
    var sResponse = oXmlHttp.responseText;
    if ((sResponse.indexOf("Error") > -1) && (sResponse.indexOf("Error") < 3)) { /*DNL*/
        this.ShowError(sResponse);
        return "";
    }
    return sResponse;
};

Sage.MailMergeService.prototype.GetContext = function() {
    if (Sage && Sage.Services) {
        return Sage.Services.getService("MailMergeContextService");
    }
    return null;
};

Sage.MailMergeService.prototype.GetEntityId = function() {
    var oContext = this.GetContext();
    if (oContext) {
        oContext.Refresh();

        if ((oContext.EntityIsLead || oContext.EntityIsContact) & oContext.IsDetailMode) {
            return oContext.EntityId;
        }

        var sContactId;
        var sEntityId;
        var sEntityDescription;
        var sOppContactId;
        var sUrl;

        /* If the current entity is an Account, Opportunity, or Ticket then grab a Contact if no more than one exists. */
        if ((oContext.EntityIsAccount || oContext.EntityIsOpportunity || oContext.EntityIsTicket) & oContext.IsDetailMode) {
            sUrl = String.format("{0}getconid&id={1}&singleonly=true", this.GetInfoBrokerUrl(), oContext.EntityId);
            sContactId = this.GetFromServer(sUrl);
            if (sContactId != "") {
                var sAccountId = oContext.EntityIsAccount ? oContext.EntityId : "";
                var sOpportunityId = oContext.EntityIsOpportunity ? oContext.EntityId : "";
                var sTicketId = oContext.EntityIsTicket ? oContext.EntityId : "";
                sUrl = String.format("{0}getconname&id={1}", this.GetInfoBrokerUrl(), sContactId);
                sEntityDescription = this.GetFromServer(sUrl);
                oContext.SetDetailContext(sContactId, "CONTACT", sEntityDescription, sAccountId, sOpportunityId, sTicketId); /*DNL*/
                return sContactId;
            }
        }
        /* Are we on an Account with more than one Contact? */
        sUrl = String.format("{0}/SelectContactId.aspx", this.GetClientPath());
        if (oContext.EntityIsAccount & oContext.IsDetailMode) {
            sUrl += "?AccountId=" + oContext.EntityId;
            sContactId = this.OpenDialog(sUrl, 720, 540);
            if (sContactId != "") {
                sUrl = String.format("{0}getconname&id={1}", this.GetInfoBrokerUrl(), sContactId);
                sEntityDescription = this.GetFromServer(sUrl);
                oContext.SetDetailContext(sContactId, "CONTACT", sEntityDescription, oContext.EntityId, null, null); /*DNL*/
                return sContactId;
            }
            else {
                return "";
            }
        }
        /* Are we on an Opportunity with more than one Contact? */
        if (oContext.EntityIsOpportunity & oContext.IsDetailMode) {
            sUrl += "?OpportunityId=" + oContext.EntityId;
            sOppContactId = this.OpenDialog(sUrl, 720, 540);
            if (sOppContactId != "") {
                sUrl = String.format("{0}getconid&id={1}", this.GetInfoBrokerUrl(), sOppContactId);
                sContactId = this.GetFromServer(sUrl);
                if (sContactId != "") {
                    sUrl = String.format("{0}getconname&id={1}", this.GetInfoBrokerUrl(), sContactId);
                    sEntityDescription = this.GetFromServer(sUrl);
                    oContext.SetDetailContext(sContactId, "CONTACT", sEntityDescription, null, oContext.EntityId, null); /*DNL*/
                    return sContactId;
                }
                else {
                    return "";
                }
            }
            else {
                return "";
            }
        }
        /* Are we on a list view? */
        sUrl = String.format("{0}/{1}", this.GetClientPath(), oContext.EntityIsLead ? "SelectLeadId.aspx" : "SelectContactId.aspx");
        sEntityId = this.OpenDialog(sUrl, 720, 540);
        if (sEntityId != "") {
            var sEntityTableName = oContext.EntityIsLead ? "LEAD" : "CONTACT"; /*DNL*/
            sUrl = String.format("{0}{1}&id={2}", this.GetInfoBrokerUrl(), oContext.EntityIsLead ? "getleadname" : "getconname", sEntityId);
            sEntityDescription = this.GetFromServer(sUrl);
            oContext.SetDetailContext(sEntityId, sEntityTableName, sEntityDescription, null, null, null);
            return sEntityId;
        }
    }

    return "";
};

Sage.MailMergeService.prototype.GetHttpRequest = function() {
    return (window.ActiveXObject) ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
};

Sage.MailMergeService.prototype.GetMainTableAlias = function(fromSql) {
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
    throw new Error(DesktopErrors().GetMainTableAliasError);
};

Sage.MailMergeService.prototype.GetNewMailMergeEngine = function() {
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
};

Sage.MailMergeService.prototype.GetGroupManagerUrl = function() {
    return this.GetClientPath() + "/SLXGroupManager.aspx?action=";
};

Sage.MailMergeService.prototype.GetInfoBrokerUrl = function() {
    return this.GetClientPath() + "/SLXInfoBroker.aspx?info=";
};

Sage.MailMergeService.prototype.GetNullDate = function() {
    var dDate = new Date();
    dDate.setYear(1899);
    dDate.setMonth(11);
    dDate.setDate(30);
    dDate.setHours(0);
    dDate.setMinutes(0);
    dDate.setSeconds(0);
    dDate.setMilliseconds(0);
    return dDate;
};

Sage.MailMergeService.prototype.GetParamValue = function(params, name) {
    if (params.Exists(name)) {
        var oParam = params.Find(name);
        if (oParam != null) {
            return oParam.Value;
        }
    }
    return null;
};

Sage.MailMergeService.prototype.GetPersonalDataPath = function() {
    return this.MailMergeGUI().GetPersonalDataPath();
};

Sage.MailMergeService.prototype.GetReportingEnabled = function() {
    return ((!Ext.isEmpty(this.GetReportingUrl())) || MailMergeInfoStore().RemoteInfo.UseActiveReporting);
};

Sage.MailMergeService.prototype.GetReportingUrl = function() {
    var oContext = this.GetContext();
    if (oContext) {
        /* Data from ServiceHosts.xml is loaded into the client context within ServiceHostsModule.cs. */
        var SLXWEBRPT = "SLXWEBRPT"; /*DNL*/
        if (oContext.HasClientContext(SLXWEBRPT, true)) {
            var sReportingUrl = oContext.GetClientContext(SLXWEBRPT, true);
            if (!Ext.isEmpty(sReportingUrl)) {
                var sLastChar = sReportingUrl.charAt(sReportingUrl.length - 1);
                if (sLastChar == "/") {
                    sReportingUrl = sReportingUrl.substring(0, sReportingUrl.length - 1);
                }
                return String.format("{0}/SLXWebReportingServer.ashx?method=GenerateReport", sReportingUrl);
            }
        }
    }
    return "";
};

Sage.MailMergeService.prototype.GetScheduleFollowUpUrl = function(followUpInfo) {
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
        var sUrl = String.format("javascript:Link.scheduleActivity({0});",
            Sys.Serialization.JavaScriptSerializer.serialize(args));
        return sUrl;
    }
    return null;
};

Sage.MailMergeService.prototype.GetSingleValue = function(fieldName, tableName, keyField, keyValue) {
    var sUrl = String.format("{0}GetSingleValue&item={1}&entity={2}&idfield={3}&id={4}",
        this.GetInfoBrokerUrl(), fieldName, tableName, keyField, keyValue);
    var sResult = this.GetFromServer(sUrl);
    return sResult;
};

Sage.MailMergeService.prototype.GetUserPreference = function(name, category) {
    var sUrl = String.format("{0}userpref&prefname={1}&prefcategory={2}", this.GetInfoBrokerUrl(), name, category);
    return this.GetFromServer(sUrl);
};

Sage.MailMergeService.prototype.HandleScheduleFollowUpForCompleteActivity = function(url, json) {
    if (String(url).toUpperCase().indexOf("EMAILPROMPTFORHISTORY.ASPX") != -1) {
        var arrResult = this.IsJson(json);
        if (arrResult[JsonResult.jrIsJson] === true) {
            var oFollowUpInfo = arrResult[JsonResult.jrObject];
            if (oFollowUpInfo != null) {
                var sUrl = this.GetScheduleFollowUpUrl(oFollowUpInfo);
                if (sUrl != null) {
                    window.setTimeout("ShowMailMergeUrl('" + sUrl + "');", 1500);
                    return oFollowUpInfo.Regarding;
                }
            }
        }
    }
    return null;
};

Sage.MailMergeService.prototype.HasParam = function(params, name) {
    if (params) {
        var oParam = params.IndexOf(name);
        if (oParam) {
            return true;
        }
    }
    return false;
};

Sage.MailMergeService.prototype.InitObjects = function() {
    if (gInitialized == false) {
        /* This is important in order to get all of the events sinked. */
        this.MailMerge();
        this.MailMergeGUI();
        this.ProgressDlg();
        this.TemplateEditor();
        gInitialized = true;
    }
};

Sage.MailMergeService.prototype.IsJson = function(json) {
    var arrResult = [false, null];
    try {
        var obj = Ext.util.JSON.decode(json);
        arrResult[JsonResult.jrIsJson] = true;
        arrResult[JsonResult.jrObject] = obj;
    } catch (e) {
        arrResult[JsonResult.jrIsJson] = false;
        arrResult[JsonResult.jrObject] = null;
    }
    return arrResult;
};

Sage.MailMergeService.prototype.MailMerge = function() {
    if (gMailMerge == null) {
        gMailMerge = this.NewActiveXObject("SLXMMGUIW.MailMerge");
        this.ConnectEvents(gMailMerge, WhichEvents.weMailMerge);          
    }
    return gMailMerge;
};

Sage.MailMergeService.prototype.MailMergeGUI = function() {
    if (gMailMergeGUI == null) {
        gMailMergeGUI = this.NewActiveXObject("SLXMMGUIW.MailMergeGUI");
        gMailMergeGUI.TransportType = TransportType.transHTTP;
        gMailMergeGUI.ConnectionString = this.GetConnectionString();
        gMailMergeGUI.UserID = MailMergeInfoStore().UserId;
        /* Used by GetWebWriteMenu(), MRUItemExists(), and MRUPluginExists(). */
        gMailMergeGUI.FaxProvider = MailMergeInfoStore().FaxProvider;
        this.AddCookies(gMailMergeGUI);
    }
    return gMailMergeGUI;
};

Sage.MailMergeService.prototype.MergeFromPlugin = function(
    pluginId, mode, entityId, opportunityId, ticketId) {
    this.Debug("Entering MergeFromPlugin()"); /*DNL*/
    try {
        try {
            this.InitObjects();
            var sEntityId = (Ext.isEmpty(entityId)) ? "" : entityId;
            var sOpportunityId = (Ext.isEmpty(opportunityId)) ? "" : opportunityId;
            var sPluginId = (Ext.isEmpty(pluginId)) ? "" : pluginId;
            var sTicketId = (Ext.isEmpty(ticketId)) ? "" : ticketId;
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
};

Sage.MailMergeService.prototype.MergeFromSlxDocument = function(slxDocument, alwaysDisplayErrors) {
    this.Debug("Entering MergeFromSlxDocument()"); /*DNL*/
    try {
        var arrResult = [false, false, ""];
        try {
            this.InitObjects();
            var oMailMergeEngine = this.GetNewMailMergeEngine();
            oMailMergeEngine.MergeSilently = slxDocument.MailMergeInformation.MergeSilently;
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
                            var sError;
                            if (oError.Source != "")
                                sError = String.format(DesktopErrors().EngineErrorFmt1, DesktopErrors().MailMergeEngineError, oError.Message, oError.Source, oError.ErrorCode);
                            else
                                sError = String.format(DesktopErrors().EngineErrorFmt2, DesktopErrors().MailMergeEngineError, oError.Message, oError.ErrorCode);
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
        }
        catch (err) {
            var sError = this.FormatError(err);
            arrResult[EngineResult.erError] = sError;
            this.Debug("ERROR in MergeFromSlxDocument(): " + sError); /*DNL*/
            this.DisplayError(err);
        }
        return arrResult;
    }
    finally {
        this.Debug("Exiting MergeFromSlxDocument()"); /*DNL*/
    }
};

Sage.MailMergeService.prototype.NewActiveXObject = function(progid) {
    if (Sage && Sage.gears && Sage.gears.factory) {
        var oComFactory = Sage.gears.factory.create("com.factory");
        var oActiveX = oComFactory.newActiveXObject(progid);
        return oActiveX;
    }
    if (!Sage.gears || !Sage.gears.factory)
        throw new Error(DesktopErrors().DesktopHelperUnavailable);
    else
        throw new Error(DesktopErrors().NewActiveXObjectError);
};

Sage.MailMergeService.prototype.OpenDialog = function(url, width, height) {
    var bUseSlxShowModalDialog = false;
    var sProcessName = String(this.MailMergeGUI().ProcessName).toUpperCase();
    if (Ext.isGecko && (sProcessName == "FIREFOX.EXE")) { /*DNL*/
        var iProcessMajorVersion = this.MailMergeGUI().ProcessMajorVersion;
        var iProcessMinorVersion = this.MailMergeGUI().ProcessMinorVersion;
        bUseSlxShowModalDialog = !((iProcessMajorVersion == 3 && iProcessMinorVersion >= 5) || (iProcessMajorVersion > 3));
    }
    else {
        if (!Ext.isIE && !(sProcessName == "IEXPLORE.EXE")) { /*DNL*/
            bUseSlxShowModalDialog = true;
        }
    }
    if (!bUseSlxShowModalDialog) {
        /* Logic to determine the dialogLeft and dialogTop for [visually] centering the dialog (center:yes does [not] work in FF). */
        var iBrowserHeightOffset = (Ext.isIE) ? 25 : 75;
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
        var sFeatures = String.format("scroll:no;status:no;resizable:yes;dialogLeft:{0}px;dialogTop:{1}px;dialogWidth:{2}px;dialogHeight:{3}px;edge:sunken;help:no", iLeft, iTop, width, height);
        var sReturnValue = showModalDialog(url, window, sFeatures);
        if (!Ext.isEmpty(sReturnValue)) {
            var sRegarding = this.HandleScheduleFollowUpForCompleteActivity(url, sReturnValue);
            if (sRegarding != null) sReturnValue = sRegarding;
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
            if (iModalResult = ModalResult.resOk) {
                var sResult = oParams.Find("Result").Value; /*DNL*/
                if (!Ext.isEmpty(sResult)) {
                    var sRegarding = this.HandleScheduleFollowUpForCompleteActivity(url, sResult);
                    if (sRegarding != null) sResult = sRegarding;
                    return sResult;
                }
            }
        }
        else {
            var sError = oParams.Find("Error").Value; /*DNL*/
            if (Ext.isEmpty(sError)) {
                sError = DesktopErrors().OpenDialogError;
            }
            this.ShowError(this.FormatError(new Error(sError)));
        }
        return "";
    }
};

Sage.MailMergeService.prototype.PopulateWriteMenu = function() {
    try {
        if (this.MenuPopulated) return;

        var IDX_CAPTION = 1;
        var IDX_URL = 4;
        var IDX_ENABLE = 5;

        var oContext = this.GetContext();
        if (oContext) {
            oContext.Refresh();
            var sSiteCode = MailMergeInfoStore().SiteCode;
            var sUserId = MailMergeInfoStore().UserId;
            var sXml = this.MailMergeGUI().GetWebWriteMenu(sSiteCode, sUserId, MailMergeInfoStore().Templates.MaxRecentlyUsedTemplates, (oContext.EntityIsLead) ? "LEAD" : "CONTACT"); /*DNL*/
            if (!Ext.isEmpty(sXml)) {
                var oXmlReader = new Sage.SimpleXmlReader(sXml);
                for (var iMenuId = MenuIdentifier.miEmail; iMenuId <= MenuIdentifier.miFax; iMenuId++) {
                    var oSubMenuItems = oXmlReader.selectChildNodes("Menu/MenuItems/MenuItem[@MenuID=\"" + iMenuId + "\"]/SubMenuItem");
                    if (oSubMenuItems != null) {
                        for (var iSubMenuItem = 0; iSubMenuItem < oSubMenuItems.length - 2; iSubMenuItem++) {
                            var oMenu = Ext.ComponentMgr.get(iMenuId).menu;
                            if (oMenu) {
                                if (iSubMenuItem == 0) {
                                    /* Add a separator below the "More Templates..." menu item. */
                                    oMenu.addSeparator();
                                }
                                var oMenuItem = oSubMenuItems[iSubMenuItem];
                                var sCaption = oMenuItem.attributes.item(IDX_CAPTION).nodeValue;
                                var sUrl = "javascript:";
                                sUrl += oMenuItem.attributes.item(IDX_URL).nodeValue;
                                var sEnable = oMenuItem.attributes.item(IDX_ENABLE).nodeValue;
                                var bEnable = (sEnable === "true"); /*DNL*/
                                oMenu.add({ text: sCaption, href: sUrl, cls: "x-btn-text-icon", icon: "", enabled: bEnable });
                            }
                        }
                    }
                }
                this.MenuPopulated = true;
            }
        }
        var oAddressMenu = Ext.ComponentMgr.get("mnuAddressLabels");
        if (oAddressMenu) {
            oAddressMenu.disabled = !this.GetReportingEnabled();
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
            msg: String.format(DesktopErrors().PopulateWriteMenuError, sError),
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    }
};

Sage.MailMergeService.prototype.PostToServer = function(url, data) {
    var oXmlHttp = this.GetHttpRequest();
    oXmlHttp.open("POST", url, false);
    oXmlHttp.send(data);
    var sResponse = oXmlHttp.responseText;
    var iStatus = oXmlHttp.status;
    if ((sResponse.indexOf("Error") > -1) && (sResponse.indexOf("Error") < 3)) { /*DNL*/
        this.ShowError(sResponse);
        return "";
    }
    return sResponse;
};

Sage.MailMergeService.prototype.ProgressDlg = function() {
    if (gProgressDlg == null) {
        gProgressDlg = this.NewActiveXObject("SLXMMGUIW.ProgressDlg");
        this.ConnectEvents(gProgressDlg, WhichEvents.weProgressDlg);
    }
    return gProgressDlg;
};

Sage.MailMergeService.prototype.RebuildSchema = function() {
    var sUrl = this.GetGroupManagerUrl() + "RebuildXMLSchema";
    var sResult = Sage.MailMergeService.prototype.GetFromServer(sUrl);
    return sResult;
};

Sage.MailMergeService.prototype.SetDefaultProperties = function(obj, which) {
    this.AddCookies(obj);
    obj.TransportType = TransportType.transHTTP;
    obj.ConnectionString = this.GetConnectionString();
    obj.UserID = MailMergeInfoStore().UserId;
    if (which != WhichProperties.wpAddressLabels &&
        which != WhichProperties.wpSelectAddressType) {
        obj.AttachmentPath = MailMergeInfoStore().AttachmentPath;
        obj.BaseKeyCode = (MailMergeInfoStore().RemoteInfo.Remote) ? MailMergeInfoStore().RemoteInfo.BaseKeyCode : "";
        obj.EmailSystem = EmailSystem.emailOutlook;
        obj.LibraryPath = MailMergeInfoStore().LibraryPath;
        obj.Remote = MailMergeInfoStore().RemoteInfo.Remote;
        obj.SiteCode = MailMergeInfoStore().SiteCode;
    }
    switch (which) {
        case WhichProperties.wpAddressLabels:
            break;
        case WhichProperties.wpMailMerge:
            obj.UserNameLF = MailMergeInfoStore().UserNameLF;
            break;
        case WhichProperties.wpTemplateEditor:
            obj.ShowPreviewButton = true;
            break;
    }
    if (which == WhichProperties.wpMailMerge ||
        which == WhichProperties.wpTemplateEditor) {
        obj.BaseEMailPluginID = MailMergeInfoStore().Templates.DefaultMemoTemplateId;
        obj.BaseFAXPluginID = MailMergeInfoStore().Templates.DefaultFaxTemplateId;
        obj.BaseLetterPluginID = MailMergeInfoStore().Templates.DefaultLetterTemplateId;
    }
    if (which == WhichProperties.wpMailMerge ||
        which == WhichProperties.wpMailMergeEngine) {
        obj.AddressLabelsEnabled = this.GetReportingEnabled();
        obj.BaseCurrencySymbol = MailMergeInfoStore().BaseCurrency;
        obj.MultiCurrency = MailMergeInfoStore().MultiCurrency;
    }
    if (which != WhichProperties.wpMailMergeEngine) {
        obj.UserName = MailMergeInfoStore().UserNameLF;
    }
};

Sage.MailMergeService.prototype.SelectEmailNames = function(selectEmailInfo, maxTo) {
    if (Ext.isObject(selectEmailInfo)) {
        var oSelectEmailNames = this.NewActiveXObject("SLXMMGUIW.SelectEmailNames");
        oSelectEmailNames.CreateWindow();
        try {
            oSelectEmailNames.MaxTo = maxTo;
            for (var i = 0; i < selectEmailInfo.Recipients.length; i++) {
                var oRecipient = selectEmailInfo.Recipients[i];
                oSelectEmailNames.AddContactInfo(
                    oRecipient.AccountId,
                    oRecipient.AccountName,
                    oRecipient.ContactId,
                    oRecipient.EmailAddress,
                    oRecipient.FirstName,
                    oRecipient.LastName,
                    oRecipient.OpportunityId,
                    oRecipient.OpportunityName,
                    oRecipient.IsTo);
            }
            var iModalResult = oSelectEmailNames.ShowModal();
            if (iModalResult == ModalResult.resOk) {
                var oSelectedInfo = new Sage.SelectEmailInfo();
                for (var i = 0; i < oSelectEmailNames.Recipients.Count; i++) {
                    var oRecipient = oSelectEmailNames.Recipients.GetItem(i);
                    oSelectedInfo.AddInfo(
                        oRecipient.AccountID,
                        oRecipient.AccountName,
                        oRecipient.ContactID,
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
    };
    return null;
};

Sage.MailMergeService.prototype.SelectFolder = function(caption, title, folder) {
    var arrResult = [false, ""];
    var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
    oParams.AddNameValuePair("Selection", folder); /*DNL*/
    var bSelected = this.MailMergeGUI().SelectFolder(caption, title, oParams);
    if (bSelected) {
        arrResult[SelectFolderResult.srSelected] = true;
        arrResult[SelectFolderResult.srFolder] = this.GetParamValue(oParams, "Selection"); /*DNL*/
    }
    return arrResult;
};

Sage.MailMergeService.prototype.SelectPrinter = function(caption) {
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
};

Sage.MailMergeService.prototype.SelectTemplate = function() {
    return this.WriteTemplates(false);
};

Sage.MailMergeService.prototype.SetParamValue = function(params, name, value) {
    if (params.Exists(name)) {
        var oParam = params.Find(name);
        if (oParam != null) {
            oParam.Value = value;
            return true;
        }
    }
    return false;
};

Sage.MailMergeService.prototype.ShowAndThenThrowError = function(errobj, message, title) {
    try {
        this.ShowError(message, title);
    }
    finally {
        throw errobj;
    }
};

Sage.MailMergeService.prototype.ShowError = function(message, title) {
    var sTitle = (Ext.isDefined(title)) ? title : MailMergeInfoStore().Resources.SalesLogixMailMerge;
    try {
        this.MailMergeGUI().ShowError(sTitle, message);
    } catch (e) {
        Ext.Msg.show({
            title: sTitle,
            msg: message,
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
    }
};

Sage.MailMergeService.prototype.ShowMailMergeDialog = function(pluginId) {
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
                oMailMerge.CurrentGroupName = (oContext.GroupName != "") ? oContext.GroupName : MailMergeInfoStore().Resources.NoGroup;
            }         
            if (oContext.EntityIsContact || oContext.EntityIsLead) {
                oMailMerge.CurrentEntityID = oContext.IsDetailMode ? oContext.EntityId : "";
                oMailMerge.CurrentEntityName = oContext.IsDetailMode ? oContext.EntityDescription : oContext.EntityIsLead ? MailMergeInfoStore().Resources.NoLead : MailMergeInfoStore().Resources.NoContact;
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
};

Sage.MailMergeService.prototype.ShowMessage = function(message, title) {
    var sTitle = (Ext.isDefined(title)) ? title : MailMergeInfoStore().Resources.SalesLogixMailMerge;
    try {
        this.MailMergeGUI().ShowMessage(sTitle, message);
    }
    catch (e) {
        Ext.Msg.show({
            title: sTitle,
            msg: message,
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.INFO
        });
    }
};

Sage.MailMergeService.prototype.StripParameters = function(sql, xmlReader) {
    var oParameters = xmlReader.selectChildNodes("SLXGroup/parameters/parameter");
    var oConditions = xmlReader.selectChildNodes("SLXGroup/conditions/condition");
    var sResult = String(sql);
    if (sResult.toUpperCase().indexOf(":NOW") != -1) {
        var dtNow = new Date();
        /* The SLXOLEDB provider will [not] convert ISO DateTime strings to UTC when the value
        is used in a sub query, so convert it to UTC for the local time zone. */
        var dtUTC = this.MailMergeGUI().LocalToUTC(dtNow);
        sResult = sResult.replace(/:NOW/gi, String.format("'{0}'", this.MailMergeGUI().DateToISO(dtUTC)));
    }
    if (sResult.toUpperCase().indexOf(":USERID") != -1) {
        sResult = sResult.replace(/:USERID/gi, String.format("'{0}'", MailMergeInfoStore().UserId));
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
        var oRegExp = new RegExp(sParamName, "gi");
        if (!bIsInClause) {
            sResult = sResult.replace(oRegExp, "?");
        }
        else {
            var sValue = xmlReader.selectSingleNodeText("value", oParam);
            if (!bIsInClause && !bIsNumber) {
                /* Quote the value plus double-up single quotes if they exist in the value. */
                sValue = String.format("'{0}'", String(sValue).replace(/'/gi, "''"));
            }
            sResult = sResult.replace(oRegExp, sValue);
        }
    }
    return sResult;
};

Sage.MailMergeService.prototype.TemplateEditor = function() {
    if (gTemplateEditor == null) {
        gTemplateEditor = this.NewActiveXObject("SLXMMGUIW.TemplateEditor");
        this.ConnectEvents(gTemplateEditor, WhichEvents.weTemplateEditor);  
    }
    return gTemplateEditor;
};

Sage.MailMergeService.prototype.TranslateUserId = function(userId, lastFirst) {
    var sField = "USERNAME"; /*DNL*/
    if (typeof lastFirst != "undefined") {
        if (Ext.isBoolean(lastFirst)) {
            if (lastFirst) {
                sField = "USERNAMELF"; /*DNL*/
            }
        }
    }
    return this.GetSingleValue(sField, "USERINFO", "USERID", userId); /*DNL*/
};

Sage.MailMergeService.prototype.UpdateWriteMenu = function(templateName, pluginId, mainTable, menu) {
    try {
        var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
        oParams.AddNameValuePair("Error", ""); /*DNL*/
        oParams.AddNameValuePair("Success", false); /*DNL*/
        this.AddNewSubMenuItem(menu, pluginId, templateName);
        this.MailMergeGUI().WriteMRU(MailMergeInfoStore().SiteCode, MailMergeInfoStore().UserId, templateName, mainTable, pluginId, menu, oParams);
    }
    catch (err) {
        this.Debug("Error in UpdateWriteMenu(): " + this.FormatError(err)); /*DNL*/
    }
};

Sage.MailMergeService.prototype.UserCanMergeAsUser = function(mergeAsUserId) {
    if (Ext.isEmpty(mergeAsUserId)) return false;
    if (!Ext.isString(mergeAsUserId)) return false;
    var sUserId = String(MailMergeInfoStore().UserId).trim();
    var sMergeAsUserId = String(mergeAsUserId).trim();
    if (sMergeAsUserId.toUpperCase() != sUserId.toUpperCase()) {
        var sUrl = String.format("{0}/SLXMailMergeClient.ashx?method=UserCanMergeAsUser&mergeAsUserId={1}", this.GetClientPath(), sMergeAsUserId);
        var sResult = this.GetFromServer(sUrl);
        if (sResult !== "T") {
            return false;
        }
    }
    return true;
};

Sage.MailMergeService.prototype.WriteAddressLabels = function() {
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
                oAddressLabels.CurrentGroupName = (oContext.GroupName != "") ? oContext.GroupName : MailMergeInfoStore().Resources.NoGroup;
            }
            if (oContext.EntityIsContact || oContext.EntityIsLead) {
                oAddressLabels.CurrentEntityID = oContext.IsDetailMode ? oContext.EntityId : "";
                oAddressLabels.CurrentEntityName = oContext.IsDetailMode ? oContext.EntityDescription : (oContext.EntityIsLead ? MailMergeInfoStore().Resources.NoLead : MailMergeInfoStore().Resources.NoContact);
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
};

Sage.MailMergeService.prototype.WriteEmail = function() {
    this.InitObjects();
    this.CloseMenus();
    if (this.GetEntityId() != "") {
        var oContext = this.GetContext();
        if (oContext) {
            var sUrl = this.GetInfoBrokerUrl() + "GetSingleValue&item={0}&entity=" + oContext.EntityTableName + "&idfield=" + oContext.EntityKeyField + "&id=" + oContext.EntityId; /*DNL*/
            if (this.GetFromServer(String.format(sUrl, "donotsolicit")) == "T") { /*DNL*/
                this.ShowMessage(MailMergeInfoStore().Resources.DoNotSolicit);
                return;
            }
            if (this.GetFromServer(String.format(sUrl, "donotemail")) == "T") { /*DNL*/
                this.ShowMessage(MailMergeInfoStore().Resources.DoNotEmail);
                return;
            }
            try {
                var oMailMergeGUI = this.MailMergeGUI();
                oMailMergeGUI.WriteEmail(oContext.EntityTableName, oContext.EntityId);
            }
            catch (err) {
                this.DisplayError(err);
            }
        }
    }
};

Sage.MailMergeService.prototype.WriteEmailUsing = function(pluginId) {
    this.WriteUsing(pluginId, MergeMode.mmEmail);
};

Sage.MailMergeService.prototype.WriteEmailUsingMoreTemplates = function() {
    this.WriteUsingMoreTemplates(MergeMode.mmEmail);
};

Sage.MailMergeService.prototype.WriteFaxUsing = function(pluginId) {
    this.WriteUsing(pluginId, MergeMode.mmFax);
};

Sage.MailMergeService.prototype.WriteFaxUsingMoreTemplates = function() {
    this.WriteUsingMoreTemplates(MergeMode.mmFax);  
};

Sage.MailMergeService.prototype.WriteLetterUsing = function(pluginId) {
    this.WriteUsing(pluginId, MergeMode.mmLetter);
};

Sage.MailMergeService.prototype.WriteLetterUsingMoreTemplates = function() {
    this.WriteUsingMoreTemplates(MergeMode.mmLetter);
};

Sage.MailMergeService.prototype.WriteMailMerge = function() {
    this.CloseMenus();
    this.ShowMailMergeDialog(null);
};

Sage.MailMergeService.prototype.WriteTemplates = function(manage) {
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
};

Sage.MailMergeService.prototype.WriteUsing = function(pluginId, mergeMode) {
    this.InitObjects();
    this.CloseMenus();
    if (this.GetEntityId() != "") {
        var oContext = this.GetContext();
        if (oContext) {
            this.MergeFromPlugin(pluginId, mergeMode, oContext.EntityId,
                oContext.DetailOpportunityId, oContext.DetailTicketId);
        }
    }
};

Sage.MailMergeService.prototype.WriteUsingMoreTemplates = function(mergeMode) {
    var oContext = this.GetContext();
    if (oContext) {
        oContext.Refresh();
        this.InitObjects();
        this.CloseMenus();
        var arrResult = this.WriteTemplates(false);
        if (Ext.isArray(arrResult)) {
            var bCanceled = arrResult[TemplatesResult.trCanceled];
            var bSuccess = arrResult[TemplatesResult.trSuccess];
            if (bCanceled || !bSuccess) {
                return;
            }
            var iMruMenu;
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
            var sPluginFamily = arrResult[TemplatesResult.trPluginFamily];
            var sPluginMainTable = arrResult[TemplatesResult.trPluginMainTable];
            var oMailMergeGUI = this.MailMergeGUI();
            var oParams = this.NewActiveXObject("SLXMMEngineW.Params");
            oParams.AddNameValuePair("Error", ""); /*DNL*/
            oParams.AddNameValuePair("Success", false); /*DNL*/
            var bExists = oMailMergeGUI.MRUItemExists(MailMergeInfoStore().SiteCode, MailMergeInfoStore().UserId, sPluginId, iMruMenu, oParams);
            if (bExists) {
                this.UpdateWriteMenu(sPluginName, sPluginId, sPluginMainTable, iMruMenu);
            } else {
                var sQuestion;
                switch (mergeMode) {
                    case MergeMode.mmEmail:
                        sQuestion = MailMergeInfoStore().Resources.EmailAddTemplateToMenuPrompt.replace("%s", sPluginName);
                        break;
                    case MergeMode.mmFax:
                        sQuestion = MailMergeInfoStore().Resources.FaxAddTemplateToMenuPrompt.replace("%s", sPluginName);
                        break;
                    case MergeMode.mmLetter:
                        sQuestion = MailMergeInfoStore().Resources.LetterAddTemplateToMenuPrompt.replace("%s", sPluginName);
                        break;
                }
                var iModalResult = oMailMergeGUI.ConfirmMessage(MailMergeInfoStore().Resources.AddTemplateToMenu, sQuestion);
                if (iModalResult == ModalResult.resYes) {
                    this.UpdateWriteMenu(sPluginName, sPluginId, sPluginMainTable, iMruMenu);
                }
            }
            if (this.GetEntityId() != "") {
                this.MergeFromPlugin(sPluginId, mergeMode, oContext.EntityId,
                    oContext.DetailOpportunityId, oContext.DetailTicketId);
            }
        }
    }
};

Sage.MailMergeService.prototype.MailMergeAttachment = function() {
    this.AttachmentType = AttachmentType.atTempAttachment;
    this.FileId = "";
    this.FileName = "";
    this.FullPath = "";
    this.PluginAttachId = "";
};

Sage.MailMergeService.prototype.MailMergeEnclosure = function() {
    this.Count = 0;
    this.Name = "";
};

Sage.MailMergeService.prototype.MailMergeInformation = function() {
    this.Owner = GetMailMergeService();
    var dtDateTime = this.Owner.GetNullDate();

    this.AccountId = "";
    this.AccountName = "";
    this.AlwaysDisplayErrors = true;
    this.Attachments = [];
    this.BaseCurrencySymbol = MailMergeInfoStore().BaseCurrency;
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
    this.UserId = MailMergeInfoStore().UserId;
    this.UserName = MailMergeInfoStore().UserNameLF;
    this.UseTemplateDocProperties = false;
};

Sage.MailMergeService.prototype.MailMergeInformation.prototype.AddAttachment = function(
    attachmentType, fileId, fileName, fullPath, pluginAttachId) {
    var attachment = new Sage.MailMergeService.prototype.MailMergeAttachment();
    attachment.AttachmentType = attachmentType;
    attachment.FileId = fileId;
    attachment.FileName = fileName;
    attachment.FullPath = fullPath;
    attachment.PluginAttachId = pluginAttachId;
    this.Attachments.push(attachment);
};

Sage.MailMergeService.prototype.MailMergeInformation.prototype.AddEnclosure = function(count, name) {
    var enclosure = new Sage.MailMergeService.prototype.MailMergeEnclosure();
    enclosure.Count = count;
    enclosure.Name = name;
    this.Enclosures.push(enclosure);
};

Sage.MailMergeService.prototype.MailMergeInformation.prototype.ExecuteMailMerge = function() {
    try {
        var arrResult = [false, false, ""];
        var sUserId = String(MailMergeInfoStore().UserId).trim();
        if (!Ext.isEmpty(this.MergeAsUserId)) {
            var sMergeAsUserId = String(this.MergeAsUserId).trim();
            if (!this.Owner.UserCanMergeAsUser(sMergeAsUserId)) {
                arrResult[EngineResult.erError] = String.format(DesktopErrors().MailMergeSecurity, this.Owner.TranslateUserId(sMergeAsUserId));
                return arrResult;
            }
            sUserId = sMergeAsUserId;
        }
        var sFileName = this.Owner.MailMergeGUI().GetNewMailMergeDocumentFileName(sUserId);
        if (Ext.isEmpty(sFileName)) {
            throw new Error(DesktopErrors().DocumentFileNameError);
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

            for (var i = 0; i < this.Attachments.length; i++) {
                var oAttachment = this.Attachments[i];
                oSlxDocument.AddAttachment(oAttachment.AttachmentType, oAttachment.FileId,
                    oAttachment.FileName, oAttachment.FullPath, oAttachment.PluginAttachId);
            }

            for (var i = 0; i < this.Enclosures.length; i++) {
                var oEnclosure = this.Enclosures[i];
                oSlxDocument.AddEnclosure(oEnclosure.Count, oEnclosure.Name);
            }

            var oSummaryInfo = oSlxDocument.SummaryInformation;
            oSummaryInfo.Author = "Sage.MailMergeService"; /*DNL*/
            oSummaryInfo.Title = "SalesLogix Document Description"; /*DNL*/

            oSlxDocument.Commit();

            return this.Owner.MergeFromSlxDocument(oSlxDocument, this.AlwaysDisplayErrors);

        }
        else {
            throw new Error(DesktopErrors().CreateNewError);
        }
        return arrResult;
    }
    catch (err) {
        var sError = this.Owner.FormatError(err);
        sError = String.format("{0} {1}", DesktopErrors().ExecuteMailMergeError, sError);
        arrResult[EngineResult.erError] = sError;
        this.Owner.ShowAndThenThrowError(err, sError);
    }
};

Sage.MailMergeService.prototype.MailMergeInformation.prototype.ToJson = function() {
    return Ext.util.JSON.encode(this);
};

Sage.MailMergeService.prototype.MailMergeReport = function() {
    this.Owner = GetMailMergeService();
    this.Id = "";
    this.Path = this.Owner.GetReportingUrl();
    this.Pwd = MailMergeInfoStore().Password;
    this.Sql = "";
    this.UserName = MailMergeInfoStore().UserCode;
};

Sage.SelectEmailInfo = function() {
    this.Recipients = [];
};

Sage.SelectEmailInfo.prototype.AddInfo = function(accountId, accountName, contactId,
    emailAddress, firstName, lastName, opportuntiyId, opportunityName, isTo, type) {
    var oRecipient = new this.Recipient();
    oRecipient.AccountId = accountId;
    oRecipient.AccountName = accountName;
    oRecipient.ContactId = contactId;
    oRecipient.EmailAddress = emailAddress;
    oRecipient.FirstName = firstName;
    oRecipient.LastName = lastName;
    oRecipient.OpportunityId = opportuntiyId;
    oRecipient.OpportunityName = opportunityName;
    oRecipient.IsTo = isTo;
    oRecipient.Type = (typeof type != "undefined") ? type : null;
    this.Recipients.push(oRecipient);
};

Sage.SelectEmailInfo.prototype.Recipient = function() {
    this.AccountId = null;
    this.AccountName = null;
    this.ContactId = null;
    this.EmailAddress = null;
    this.FirstName = null;
    this.LastName = null;
    this.OpportunityId = null;
    this.OpportunityName = null;
    this.IsTo = false;
    this.Type = null;
};

/* ----------------------- Sage.CustomGroupExport -------------------------- */

Sage.CustomGroupExport = function(groupId, useGroupContext) {
    this.DataLoaded = false;
    this.GroupDatasetReader = new Sage.SimpleXmlReader();
    this.GroupId = null;
    this.GroupName = null;
    this.GroupReader = new Sage.SimpleXmlReader();
    this.GroupTable = null;
    if (Ext.isDefined(groupId)) {
        this.GroupId = groupId;
    }
    this.LastError = null;
    this.RaiseErrorWhenNoRecords = false;
    this.Service = Sage.Services.getService("MailMergeService");
    this.ShowProgress = true;
    this.UseGroupContext = null;
    this.WhichReader = {
        wrGroup: 0,
        wrGroupDataset: 1
    };
    if (this.Service == null) {
        throw new Error(DesktopErrors().DesktopServiceHelperError);
    }
    if (Ext.isBoolean(useGroupContext)) {
        this.UseGroupContext = useGroupContext;
    }
    if (Ext.isBoolean(this.UseGroupContext) && this.UseGroupContext) {
        this.LoadGroupContext();
    }
};

Sage.CustomGroupExport.prototype.CleanGroupName = function(groupName) {
    var result = String(groupName);
    var oRegExp = new RegExp('[/:"*?<>|\r\n]+', "g");
    result = result.replace(oRegExp, "");
    return result;
};

Sage.CustomGroupExport.prototype.Execute = function() {
    if (Ext.isEmpty(this.GroupId)) {
        throw new Error(DesktopErrors().InvalidGroupId);
    }
   
};

Sage.CustomGroupExport.prototype.GetGroupDatasetNodeText = function(path, node) {
    var sText = this.GetNodeText(this.WhichReader.wrGroupDataset, path, node);
    return sText;
};

Sage.CustomGroupExport.prototype.GetGroupNodeText = function(path, node) {
    var sText = this.GetNodeText(this.WhichReader.wrGroup, path, node);
    return sText;
};

Sage.CustomGroupExport.prototype.GetNodeText = function(which, path, node) {
    var oNode;
    var sText;
    switch (which) {
        case this.WhichReader.wrGroup:
            oNode = this.GroupReader.selectSingleNode(path, node);
            if (oNode) {
                sText = this.GroupReader.getNodeText(oNode);
                return sText;
            }
            break;
        case this.WhichReader.wrGroupDataset:
            oNode = this.GroupDatasetReader.selectSingleNode(path, node);
            if (oNode) {
                sText = this.GroupDatasetReader.getNodeText(oNode);
                return sText;
            }
            break;
    }
    return "";
};

Sage.CustomGroupExport.prototype.HideProgress = function() {
    if (this.ShowProgress) {
        Ext.MessageBox.hide();
    }
};

Sage.CustomGroupExport.prototype.LoadGroupContext = function() {
    this.GroupId = null;
    this.GroupName = null;
    this.GroupTable = null;
    var oContext = this.Service.GetContext();
    if (oContext) {
        oContext.Refresh();
        this.GroupId = oContext.GroupId;
        this.GroupName = oContext.GroupName;
        this.GroupTable = oContext.GroupTableName;
        return;
    }
    throw new Error(DesktopErrors().ClientGroupContextError);
};

Sage.CustomGroupExport.prototype.LoadGroupData = function() {
    var sDatasetXml = this.Service.GetFromServer(String.format("{0}/SLXGroupManager.aspx?action=GetGroupDataTableAsXML&gid={1}", this.Service.GetClientPath(), this.GroupId));
    if (Ext.isEmpty(sDatasetXml)) {
        throw new Error(String.format(DesktopErrors().GroupManagerError, "GetGroupDataTableAsXML", this.GroupId)); /*DNL*/
    }
    var sGroupXml = this.Service.GetFromServer(String.format("{0}/SLXGroupManager.aspx?action=GetGroupXML&groupid={1}", this.Service.GetClientPath(), this.GroupId));
    if (Ext.isEmpty(sGroupXml)) {
        throw new Error(String.format(DesktopErrors().GroupManagerError, "GetGroupXML", this.GroupId)); /*DNL*/
    }
    this.GroupDatasetReader.loadXml(sDatasetXml);
    this.GroupReader.loadXml(sGroupXml);
    this.DataLoaded = true;
};

Sage.CustomGroupExport.prototype.SageGearsFactoryAvailable = function() {
    return (Sage && Sage.gears && Sage.gears.factory);
};

Sage.CustomGroupExport.prototype.UpdateProgress = function(percent, msg) {
    if (this.ShowProgress) {
        Ext.MessageBox.updateProgress(percent / 100, msg);
    }
};

/* -------------------------- Sage.ExcelExport ----------------------------- */

Sage.ExcelExport = Ext.extend(Sage.CustomGroupExport, {
    constructor: function(groupId, useGroupContext) {
        this.constructor.superclass.constructor.apply(this, arguments);
        this.ColumnCount = null;
        this.EndingRow = null;
        this.ExcelApp = null;
        this.FileName = null;
        this.GroupSheet = null;
        this.LayoutSheet = null;
        this.LCID = this.Service.MailMergeGUI().UserDefaultLCID;
        this.ShowExcelAfterExport = true;
        this.StartingColumn = null;
        this.StartingRow = null;
        this.TotalRecords = null;
        this.WorkBook = null;
    },
    Execute: function() {
        this.constructor.superclass.Execute.apply(this, arguments);
        return this.DoExport();
    },
    LoadGroupData: function() {
        this.constructor.superclass.LoadGroupData.apply(this, arguments);
        this.ClearVars(true);
    }
});

Sage.ExcelExport.prototype.ClearVars = function(quit) {
    /* Note: do [not] clear this.FileName or this.LastError. */
    this.ColumnCount = null;
    this.EndingRow = null;
    this.GroupSheet = null;
    this.LayoutSheet = null;
    this.ShowExcelAfterExport = true;
    this.StartingColumn = null;
    this.StartingRow = null;
    this.TotalRecords = null;
    if (Ext.isBoolean(quit) && quit) {
        if (this.WorkBook != null) {
            try {
            } catch (e) {
                this.WorkBook.Close();
            }
            this.WorkBook = null;
        }
        if (this.ExcelApp != null) {
            try {
                this.ExcelApp.Quit();
            } catch (e) {
            }
            this.ExcelApp = null;
        }
    }
    else {
        this.WorkBook = null;
        this.ExcelApp = null;
    }
};

Sage.ExcelExport.prototype.DoExport = function() {
    if (!this.SageGearsFactoryAvailable) {
        throw new Error(DesktopErrors().DesktopHelperUnavailable);
    }
    if (this.ShowProgress) {
        Ext.MessageBox.show({
            title: "Sage SalesLogix",
            msg: MailMergeInfoStore().Resources.ExportPleaseWait,
            progressText: MailMergeInfoStore().Resources.ExportProcessing,
            width: 325,
            progress: true,
            closable: true
        });
    }
    if (!this.DataLoaded) {
        this.UpdateProgress(5, MailMergeInfoStore().Resources.ExportLoadingData);
        this.Service.MailMergeGUI().ProcessMessages();
        this.LoadGroupData();
    }
    if (this.InnerExportGroup()) {
        if (this.ExportGroup()) {
            return true;
        }
    }
    if (this.LastError != null) {
        this.HideProgress();
        throw this.LastError;
    }
    return false;
};

Sage.ExcelExport.prototype.ExportGroup = function() {
    /* Constants for enum Constants */
    var xlAutomatic = -4105;
    var xlDouble = -4119;
    var xlNone = -4142;

    /* Constants for enum XlBordersIndex */
    var xlInsideHorizontal = 12;
    var xlInsideVertical = 11;
    var xlDiagonalDown = 5;
    var xlDiagonalUp = 6;
    var xlEdgeBottom = 9;
    var xlEdgeLeft = 7;
    var xlEdgeRight = 10;
    var xlEdgeTop = 8;

    /* Constants for enum XlLineStyle */
    var xlContinuous = 1;

    /* Constants for enum XlBorderWeight */
    var xlThin = 2;
    var xlThick = 4;

    /* Constants for enum XlPivotTableSourceType */
    var xlDatabase = 1;

    /* Constants for enum XlPivotFieldOrientation */
    var xlHidden = 0;
    var xlRowField = 1;
    var xlColumnField = 2;
    var xlPageField = 3;
    var xlDataField = 4;

    /* Constants for enum XlConsolidationFunction */
    var xlSum = -4157;
    var xlCount = -4112;
    var xlAverage = -4106;

    /* Constants for enum XlCalculation */
    var xlCalculationAutomatic = 4294963191;

    /* Constants for enum XlApplicationInternational */
    var xlYearCode = 19;
    var xlMonthCode = 20;
    var xlDayCode = 21;

    try {
        try {

            var bCreatePivot = false;

            this.UpdateProgress(80, MailMergeInfoStore().Resources.ExportFormattingWorksheet);

            /* Format the heading. */
            var oCellStart = this.GroupSheet.Cells.Item(this.StartingRow - 1, this.StartingColumn);
            var oCellEnd = this.GroupSheet.Cells.Item(this.StartingRow - 1, this.ColumnCount - (this.StartingColumn - 1));

            this.GroupSheet.Range(oCellStart, oCellEnd).Select();
            this.ExcelApp.ActiveWindow.SplitRow = 1;
            this.ExcelApp.ActiveWindow.FreezePanes = true;

            this.GroupSheet.Range(oCellStart, oCellEnd).Font.Bold = true;

            with (this.GroupSheet.Range(oCellStart, oCellEnd)) {
                Borders.Item(xlDiagonalDown).LineStyle = xlNone;
                Borders.Item(xlDiagonalUp).LineStyle = xlNone;
                Borders.Item(xlEdgeLeft).LineStyle = xlNone;
            }

            with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeTop)) {
                LineStyle = xlContinuous;
                Weight = xlThin;
                ColorIndex = xlAutomatic;
            }

            with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeLeft)) {
                LineStyle = xlContinuous;
                Weight = xlThin;
                ColorIndex = xlAutomatic;
            }

            with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeBottom)) {
                LineStyle = xlContinuous;
                Weight = xlThick;
                ColorIndex = xlAutomatic;
            }

            this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeRight).LineStyle = xlNone;
            this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlInsideVertical).LineStyle = xlNone;
            this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlInsideHorizontal).LineStyle = xlNone;
            this.GroupSheet.Range("A1").Select();

            /* Set the total records && format the last row. */
            this.GroupSheet.Cells.Item(this.EndingRow + 1, this.StartingColumn).Value = "=ROWS(A" + this.StartingRow + ":A" + this.EndingRow + ")"; /*DNL*/
            this.GroupSheet.Cells.Item(this.EndingRow + 1, this.StartingColumn).Font.Bold = true;

            oCellStart = this.GroupSheet.Cells.Item(this.EndingRow + 1, this.StartingColumn);
            oCellEnd = this.GroupSheet.Cells.Item(this.EndingRow + 1, this.ColumnCount - (this.StartingColumn - 1));

            with (this.GroupSheet.Range(oCellStart, oCellEnd).Borders.Item(xlEdgeTop)) {
                LineStyle = xlDouble;
                Weight = xlThin;
                ColorIndex = xlAutomatic;
            }

            /* Format the Data for each column from format in Layout Sheet. */
            var sColumnFormat;
            var sColumnName;
            var sColumnName2;
            var sColumnFormatString;
            sColumnFormat = "";

            this.UpdateProgress(83, MailMergeInfoStore().Resources.ExportFormattingColumns);

            for (var i = 1; i < this.ColumnCount + 1; i++) {
                this.UpdateProgress((85 + i), MailMergeInfoStore().Resources.ExportFormattingColumns);
                this.Service.MailMergeGUI().ProcessMessages();
                sColumnName = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 2).Value);
                sColumnFormat = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 3).Value);
                sColumnName2 = String(this.GroupSheet.Cells.Item(this.StartingRow - 1, i).Value);
                sColumnFormatString = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 4).Value);
                if (sColumnName.toUpperCase() == sColumnName2.toUpperCase()) {
                    switch (sColumnFormat.toUpperCase()) {
                        case "CURRENCY": /*DNL*/
                        case "FIXED": /*DNL*/
                            if (sColumnFormatString != "%2.0f%%") {
                                this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow + 1, i)).NumberFormat = "#,##0.00";
                                this.GroupSheet.Cells.Item(this.EndingRow + 1, i).Font.Bold = true;
                                /* Bug in Excel 2003 where data dumped into spreedsheet is formated as text, although we change the format type of the column,
                                * the value itself remains text. This will convert each value in every cell to a number. */
                                if (Number(this.ExcelApp.Version) < 12) {
                                    var oCells = this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow + 1, i));
                                    /* This takes a very long time to process. */
                                    for (var x = 1; x < oCells.Count + 1; x++) {
                                        oCells.Item(x).Value = Number(oCells.Item(x).Value);
                                    }
                                }
                                /* Create Total at the bottom Row. */
                                try {
                                    this.GroupSheet.Cells.Item(this.EndingRow + 1, i).FormulaR1C1 = "=SUM(R[-" + this.EndingRow + "]C:R[-1]C)"; /*DNL*/
                                    bCreatePivot = true;
                                } catch (e) {
                                    if (window.console) console.log(e.message);
                                }
                            }
                            break;
                        case "INTEGER": /*DNL*/
                            bCreatePivot = true;
                            break;
                        case "PHONE": /*DNL*/
                            xlCellValue = 1;
                            xlBetween = 1;
                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).NumberFormat = "##########################";
                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).HorizontalAlignment = 2;
                            this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).FormatConditions.Add(xlCellValue, xlBetween, 999999999, 10000000000);

                            /* The FormatCondition.NumberFormat property is only available beginning with Excel 2007. */
                            if (Number(this.ExcelApp.Version) >= 12) {
                                this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).FormatConditions.Item(1).NumberFormat = "(###) ###-####";
                            } else {
                                this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).NumberFormat = "[<=9999999]###-####;(###) ###-####";
                            }
                            break;
                        case "DATETIME": /*DNL*/
                            try {
                                var format = this.Service.MailMergeGUI().GetFormatSetting(7);
                                var sYearCode = this.Service.MailMergeGUI().GetExcelInternationalValue(this.ExcelApp, xlYearCode);
                                var sMonthCode = this.Service.MailMergeGUI().GetExcelInternationalValue(this.ExcelApp, xlMonthCode);
                                var sDayCode = this.Service.MailMergeGUI().GetExcelInternationalValue(this.ExcelApp, xlDayCode);
                                format = format.replace(/y/g, sYearCode || "y");
                                format = format.replace(/M/g, sMonthCode || "M");
                                format = format.replace(/d/g, sDayCode || "d");
                                this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow, i), this.GroupSheet.Cells.Item(this.EndingRow, i)).NumberFormatLocal = format;
                            } catch (e) {
                                if (window.console) {
                                    console.log(e.message);
                                }
                            }
                            break;
                    }
                }
            }
            var oPivotTable;
            var oPivotSheet;
            /* Create the pivot table if set from above. */
            if (bCreatePivot) {
                this.UpdateProgress(95, MailMergeInfoStore().Resources.ExportPivotTable);
                var sPivotSourceName = "DataList"; /*DNL*/
                var sPivotTableName = "GroupPivotTable"; /*DNL*/
                this.WorkBook.Names.Add(sPivotSourceName, this.GroupSheet.Range(this.GroupSheet.Cells.Item(this.StartingRow - 1, this.StartingColumn), this.GroupSheet.Cells.Item(this.EndingRow, (1 + (this.ColumnCount - this.StartingColumn)))));
                this.LayoutSheet.Activate();

                oPivotTable = this.Service.MailMergeGUI().PivotCachesAdd(this.WorkBook, sPivotSourceName, sPivotTableName);
                oPivotSheet = this.WorkBook.Sheets.Item(2);
                oPivotSheet.Name = this.GroupSheet.Name + " Pivot"; /*DNL*/

                this.GroupSheet.Activate();

                /* Add fields to the pivot table. */
                /* First row is a pivot row. */
                oPivotTable.PivotFields(this.GroupSheet.Cells.Item(this.StartingRow - 1, this.StartingColumn).Value).Orientation = xlRowField;
                sColumnFormat = "";
                var iDataFields = 0;
                for (var i = 1; i < this.ColumnCount + 1; i++) {
                    sColumnName = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 2).Value);
                    sColumnFormat = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 3).Value);
                    sColumnName2 = String(this.GroupSheet.Cells.Item(this.StartingRow - 1, i).Value);
                    sColumnFormatString = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 4).Value);
                    if (sColumnName.toUpperCase() == sColumnName2.toUpperCase()) {
                        switch (String(sColumnFormat).toUpperCase()) {
                            case "CURRENCY": /*DNL*/
                            case "FIXED": /*DNL*/
                                if (sColumnFormatString != "%2.0f%%") { /* This is to exclude percent columns. */
                                    iDataFields++;
                                    oPivotTable.PivotFields(sColumnName2).Orientation = xlDataField;
                                    oPivotTable.DataFields.Item(iDataFields).Function = xlSum;
                                    oPivotTable.DataFields.Item(iDataFields).NumberFormat = "#,##0.00";
                                }
                                break;
                            case "INTEGER": /*DNL*/
                                iDataFields++;
                                oPivotTable.PivotFields(sColumnName2).Orientation = xlDataField;
                                oPivotTable.DataFields.Item(iDataFields).Function = xlSum;
                                oPivotTable.DataFields.Item(iDataFields).NumberFormat = "#,##0";
                                break;
                            case "OWNER": /*DNL*/
                                if (i != 1) {
                                    oPivotTable.PivotFields(sColumnName2).Orientation = xlPageField;
                                }
                                break;
                            case "USER": /*DNL*/
                                if (i != 1) {
                                    oPivotTable.PivotFields(sColumnName2).Orientation = xlPageField;
                                }
                                break;
                        }

                    }
                }
                if (iDataFields > 1) {
                    oPivotTable.PivotFields("Data").Orientation = xlColumnField; /*DNL*/
                    oPivotTable.DataLabelRange.Font.Bold = true;
                }
            }

            this.UpdateProgress(98, MailMergeInfoStore().Resources.ExportSaving);

            /* Let Excel define the extension (.xls [or] .xlsx). */
            this.FileName = String.format("{0}\\{1} ({2})", this.Service.GetPersonalDataPath(), this.CleanGroupName(this.GroupName), String(this.Service.MailMergeGUI().DateToISO(new Date())).replace(/:/g, "")); /*DNL*/
            this.WorkBook.SaveAs(this.FileName);
            this.FileName = this.WorkBook.FullName; /* <-- This FileName will contain the file extension. */

            this.UpdateProgress(100, MailMergeInfoStore().Resources.ExportFinished);

            if (this.ShowExcelAfterExport) {
                this.ExcelApp.UserControl = true;
                this.LayoutSheet.Visible = false;
                this.ExcelApp.ScreenUpdating = true;
                this.ExcelApp.Calculation[this.LCID] = xlCalculationAutomatic;
                this.ExcelApp.Visible = true;
                this.ExcelApp.DisplayAlerts = true;
            }

            oCellStart = null;
            oCellEnd = null;
            oPivotSheet = null;
            oPivotTable = null;

            this.HideProgress();

            return true;
        }
        finally {
            var bQuit = false;
            try {
                if (this.ExcelApp != null && !this.ExcelApp.Visible) {
                    bQuit = true;
                }
            } catch (e) {
                bQuit = true;
            }
            this.ClearVars(bQuit);
        }
    }
    catch (err) {
        this.LastError = err;
    }
    return false;
};

Sage.ExcelExport.prototype.GetColumnCharacters = function(number) {
    var result = null;
    var iNumber = Number(number);
    if (iNumber < 1) {
        result = "A";
    } else {
        if (iNumber > 702) {
            result = "ZZ";
        } else {
            if (iNumber > 26) {
                if ((iNumber % 26) == 0) {
                    result = String.fromCharCode(64 + (iNumber / 26) - 1) + String.fromCharCode(64 + 26);
                } else {
                    result = String.fromCharCode(64 + (iNumber / 26)) + String.fromCharCode(64 + (iNumber % 26));
                }
            } else {
                result = String.fromCharCode(64 + iNumber);
            }
        }
    }
    return result;
};

Sage.ExcelExport.prototype.InnerExportGroup = function() {
    try {

        /* Constants for enum XlWBATemplate */
        var xlWBATWorksheet = -4167;

        /* Constants for enum XlCalculation */
        var xlCalculationManual = 4294963161;

        var IDX_NAME = 1;

        if (this.GroupName == null || this.GroupTable == null) {
            this.GroupName = this.GroupReader.selectSingleNode("//SLXGroup/plugindata").attributes.item(IDX_NAME).nodeValue;
            this.GroupTable = this.GroupReader.selectSingleNodeText("//SLXGroup/maintable");
        }

        var oDataset = this.GroupDatasetReader.selectChildNodes("//NewDataSet/Table");

        var iRecordCount = 0;
        if (oDataset != null) {
            iRecordCount = oDataset.length;
        }

        if (iRecordCount == 0) {
            var sMsg = String.format(DesktopErrors().GroupEmptyError, this.GroupName, this.GroupId);
            if (!this.RaiseErrorWhenNoRecords) {
                this.HideProgress();
                Ext.Msg.show({
                    title: "Sage SalesLogix",
                    msg: sMsg,
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.INFO
                });
                return false;
            }
            else {
                throw new Error(sMsg);
            }
        }

        this.UpdateProgress(10, MailMergeInfoStore().Resources.ExportStartingExcel);

        this.ExcelApp = this.NewActiveXObject("Excel.Application");
        this.ExcelApp.Visible = false;
        this.ExcelApp.ScreenUpdating = false;
        this.ExcelApp.DisplayAlerts = false;

        this.UpdateProgress(15, MailMergeInfoStore().Resources.ExportCreatingWorksheet);

        this.WorkBook = this.ExcelApp.Workbooks.Add(xlWBATWorksheet);
        this.ExcelApp.Calculation[this.LCID] = xlCalculationManual;
        this.ExcelApp.CalculateBeforeSave = true;

        this.LayoutSheet = this.WorkBook.ActiveSheet;
        this.LayoutSheet.Name = "Layout"; /*DNL*/
        this.GroupSheet = this.WorkBook.Sheets.Add();
        this.GroupSheet.Name = this.GroupName;
        this.GroupSheet.Activate();

        this.LayoutSheet.Cells.Item(3, 2).Value = "ColName:"; /*DNL*/
        this.LayoutSheet.Cells.Item(3, 3).Value = "ColType:"; /*DNL*/

        var iColumns = 0;

        var oLayouts = this.GroupReader.selectChildNodes("//SLXGroup/layouts/layout");
        for (var i = 0; i < oLayouts.length; i++) {
            var oLayoutNode = oLayouts[i];
            if (this.GetGroupNodeText("width", oLayoutNode) != "0" && this.GetGroupNodeText("visible", oLayoutNode) != "F") {
                iColumns++;
                var sCaption = this.GetGroupNodeText("caption", oLayoutNode);
                if (sCaption == "") {
                    this.GroupSheet.Cells.Item(1, iColumns).Value = "unknown -" + iColumns; /*DNL*/
                    this.LayoutSheet.Cells.Item(iColumns + 3, 2).Value = "unknown -" + iColumns; /*DNL*/
                }
                else {
                    this.GroupSheet.Cells.Item(1, iColumns).Value = sCaption;
                    this.LayoutSheet.Cells.Item(iColumns + 3, 2).Value = sCaption;
                }
                this.LayoutSheet.Cells.Item(iColumns + 3, 3).Value = this.GetGroupNodeText("format", oLayoutNode);
                this.LayoutSheet.Cells.Item(iColumns + 3, 4).Value = this.GetGroupNodeText("formatstring", oLayoutNode);
            }
            oLayoutNode = null;
        }

        var iColumnCount = iColumns;
        var iRecord = 0;
        var iColumn = 0;

        var oArray = this.NewActiveXObject("SLXMMGUIW.MultidimensionalArray");
        oArray.Resize(iRecordCount, iColumnCount);

        var iProgressPosition = 20;
        this.UpdateProgress(iProgressPosition, MailMergeInfoStore().Resources.ExportProcessingData);

        var iStep = Math.round(iRecordCount / 54);
        if (iStep == 0) iStep = 1;
        var iStepPosition = 0;

        for (var i = 0; i < oDataset.length; i++) {
            var oRecordNode = oDataset[i];
            iColumn = 0;
            for (var x = 0; x < oLayouts.length; x++) {
                var oLayoutNode = oLayouts[x];
                if (this.GetGroupNodeText("width", oLayoutNode) != "0" && this.GetGroupNodeText("visible", oLayoutNode) != "F") {
                    var sAlias = String(this.GetGroupNodeText("alias", oLayoutNode));
                    var sFormat = String(this.GetGroupNodeText("format", oLayoutNode));
                    var sValue;
                    switch (sFormat.toUpperCase()) {
                        case "PHONE": /*DNL*/
                            sValue = this.GetGroupDatasetNodeText(sAlias, oRecordNode);
                            oArray.SetValue(i, iColumn, sValue);
                            break;
                        case "USER": /*DNL*/
                            sValue = this.GetGroupDatasetNodeText(sAlias + "NAME", oRecordNode); /*DNL*/
                            oArray.SetValue(i, iColumn, sValue);
                            break;
                        case "OWNER": /*DNL*/
                            sValue = this.GetGroupDatasetNodeText(sAlias + "NAME", oRecordNode); /*DNL*/
                            oArray.SetValue(i, iColumn, sValue);
                            break;
                        case "DATETIME": /*DNL*/
                            sValue = this.GetGroupDatasetNodeText(sAlias, oRecordNode);
                            sValue = String(sValue).substring(0, 16);
                            sValue = String(sValue).replace(/T/, " ");
                            oArray.SetValue(i, iColumn, sValue);
                            break;
                        default:
                            sValue = this.GetGroupDatasetNodeText(sAlias, oRecordNode);
                            oArray.SetValue(i, iColumn, sValue);
                            break;
                    }
                    iColumn++;
                }
                oLayoutNode = null;
            }
            oRecordNode = null;
            iRecord++;
            iStepPosition++;
            if (iStepPosition == iStep) {
                iStepPosition = 0;
                this.UpdateProgress(iProgressPosition++, MailMergeInfoStore().Resources.ExportProcessingData);
                this.Service.MailMergeGUI().ProcessMessages();
            }
        }

        for (var i = 0; i < iColumn; i++) {
            var sColumnFormat = String(this.LayoutSheet.Cells.Item(4 + (i - 1), 3).Value);
            if ((sColumnFormat == "0") || (sColumnFormat == "3")) {
                this.GroupSheet.Range(this.GroupSheet.Cells.Item(2, i), this.GroupSheet.Cells.Item(0, i)).NumberFormat = "@";
            }
        }

        this.UpdateProgress(75, MailMergeInfoStore().Resources.ExportPopulating);

        this.GroupSheet.Range("A2", this.GetColumnCharacters(iColumn) + (iRecordCount + 1)).Value = oArray.OleArray;
        this.GroupSheet.Range("A1").Select();
        this.GroupSheet.Cells.Select();
        this.GroupSheet.Cells.EntireColumn.AutoFit();
        this.GroupSheet.Range("A1").Select();

        this.StartingRow = 2;
        this.EndingRow = (iRecordCount + 1);
        this.TotalRecords = (this.EndingRow - this.StartingRow) + 1;
        this.StartingColumn = 1;
        this.ColumnCount = iColumn;

        this.LayoutSheet.Cells.Item(1, 1).Value = this.StartingRow;
        this.LayoutSheet.Cells.Item(1, 2).Value = this.EndingRow;
        this.LayoutSheet.Cells.Item(1, 3).Value = this.StartingColumn;
        this.LayoutSheet.Cells.Item(1, 4).Value = this.ColumnCount;
        this.LayoutSheet.Cells.Item(1, 5).Value = this.GroupSheet.Name;

        return true;
    }
    catch (err) {
        this.LastError = err;
        this.ClearVars(true);
        return false;
    }
};

Sage.ExcelExport.prototype.NewActiveXObject = function(progid) {
    var bUseNativeActiveX = (MailMergeInfoStore().ExportToExcel.UseNativeActiveX && Ext.isIE);
    this.Service.Debug("ExportToExcel.UseNativeActiveX = " + bUseNativeActiveX); /* DNL */
    return (bUseNativeActiveX) ? new ActiveXObject(progid) : this.Service.NewActiveXObject(progid);
};

function InitMailMergeService() {
    if (Ext.isWindows && Sage && Sage.Services) {
        if (!Sage.gears) {
            if (typeof initGears == "function") {
                initGears();
            }
        }
        if (Sage.gears && Sage.gears.factory) {
            if (!Sage.Services.hasService("MailMergeService")) {
                Sage.Services.addService("MailMergeService", new Sage.MailMergeService());
            }
        }
    }
}

function ShowMailMergeUrl(url) {
    window.location = url;
}

InitMailMergeService();
