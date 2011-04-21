/*  ------------------------------------------------------------------------
                         Sage SalesLogix Mail Merge
                      Copyright(c) 2010, Sage Software  
   
    This unit is used for testing mail merge methods.
    ------------------------------------------------------------------------ */

var RUNTEST = false;

var TestMethod = {
    tmExecuteMailMerge: 0,
    tmHandleOnRequestFormat: 1,
    tmContextService: 2,
    tmSelectPrinter: 3,
    tmHandleOnSelectPrinter: 4,
    tmHandleOnRequestPrintAddressLabels: 5,
    tmHandleOnRequestViewGroup: 6,
    tmGetPersonalDataPath: 7,
    tmExcelInstalled: 8,
    tmGetReportingUrl: 9,
    tmHandleOnRequestGroupInfoEx: 10,
    tmSelectFolder: 11,
    tmFulfillLitRequest: 12
};

function TestMailMergeService(method) {
    var oService = GetMailMergeService();
    if (oService) {
        switch (method) {
            case TestMethod.tmExecuteMailMerge:
                var oMailMergeInfo = new oService.MailMergeInformation();
                var strLiterature;
                var iLiteratureCount;
                oMailMergeInfo.BaseTable = "CONTACT";
                oMailMergeInfo.DoHistory = false;
                oMailMergeInfo.EditAfter = false;
                oMailMergeInfo.EditBefore = false;

                oMailMergeInfo.DoAttachments = true;
                oMailMergeInfo.AttachmentPath = "";
                oMailMergeInfo.LibraryPathh = "";
                oMailMergeInfo.MergeSilently = true;  //false;

                oMailMergeInfo.TemplatePluginId = "pDEMOA0000G7";
                oMailMergeInfo.MergeWith = MergeWith.withEntityIds;
                oMailMergeInfo.EntityIds = "CGHEA0002670";
                oMailMergeInfo.OutputTo = OutputType.otEmail;
                oMailMergeInfo.UseTemplateDocProperties = false; // true;
                iLiteratureCount = 2;
                strLiterature = "Company Overview (Trifold)";
                oMailMergeInfo.AddEnclosure(iLiteratureCount, strLiterature);
                oMailMergeInfo.ExecuteMailMerge();
                break;
            case TestMethod.tmHandleOnRequestFormat:
                var oParams = oService.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair(MP_ERROR, "");
                oParams.AddNameValuePair(MP_SUCCESS, false);
                oParams.AddNameValuePair(MP_RESULT, "");
                var iType = 8; // ftOwner
                var sFormatString = "";
                var sValue = "ADMIN";
                oService.HandleOnRequestFormat(iType, sFormatString, sValue, oParams);
                oService.ShowMessage("Expecting 'Administrator': " + oService.GetParamValue(oParams, MP_RESULT));
                break;
            case TestMethod.tmContextService:
                var oContext = oService.GetContext();
                if (oContext != null) {
                    oContext.SetContext("Hello", "World");
                    oService.ShowMessage("Expecting 'World': " + oContext.GetContext("Hello"), "Hello");
                }
                break;
            case TestMethod.tmSelectPrinter:
                var arrResult = oService.SelectPrinter("Select a Printer");
                if (Ext.isArray(arrResult)) {
                    oService.ShowMessage("PrinterName: " + arrResult[PrinterResult.prPrinterName]);
                    oService.ShowMessage("Canceled: " + arrResult[PrinterResult.prCanceled]);
                    oService.ShowMessage("Success: " + arrResult[PrinterResult.prSuccess]);
                }
                break;
            case TestMethod.tmHandleOnSelectPrinter:
                var oParams = oService.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair(MP_ERROR, "");
                oParams.AddNameValuePair(MP_SUCCESS, false);
                oParams.AddNameValuePair(MP_CANCELED, false);
                oParams.AddNameValuePair(MP_PRINTER, "");
                oService.HandleOnSelectPrinter("Select a Printer", oParams);
                oService.ShowMessage("PrinterName: " + oService.GetParamValue(oParams, MP_PRINTER));
                oService.ShowMessage("Canceled: " + oService.GetParamValue(oParams, MP_CANCELED));
                oService.ShowMessage("Success: " + oService.GetParamValue(oParams, MP_SUCCESS));
                oService.ShowMessage("Error: " + oService.GetParamValue(oParams, MP_ERROR));
                break;
            case TestMethod.tmHandleOnRequestPrintAddressLabels:
                var oParams = oService.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair(MP_ERROR, "");
                oParams.AddNameValuePair(MP_SUCCESS, false);
                oParams.AddNameValuePair(MP_CANCELED, false);
                oService.HandleOnRequestPrintAddressLabels(oParams);
                oService.ShowMessage("Canceled: " + oService.GetParamValue(oParams, MP_CANCELED));
                oService.ShowMessage("Success: " + oService.GetParamValue(oParams, MP_SUCCESS));
                oService.ShowMessage("Error: " + oService.GetParamValue(oParams, MP_ERROR));
                break;
            case TestMethod.tmHandleOnRequestViewGroup:
                var oParams = oService.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair(MP_ERROR, "");
                oParams.AddNameValuePair(MP_SUCCESS, false);
                // p6UJ9A000290 = Contact:My Activities for Today
                oService.HandleOnRequestViewGroup("p6UJ9A000290", oParams);
                oService.ShowMessage("Success: " + oService.GetParamValue(oParams, MP_SUCCESS));
                oService.ShowMessage("Error: " + oService.GetParamValue(oParams, MP_ERROR));
                break;
            case TestMethod.tmGetPersonalDataPath:
                oService.ShowMessage("Personal data path: " + oService.GetPersonalDataPath());
                break;
            case TestMethod.tmExcelInstalled:
                oService.ShowMessage("Is Excel installed?: " + oService.ExcelInstalled());
                break;
            case TestMethod.tmGetReportingUrl:
                oService.ShowMessage(oService.GetReportingUrl());
                break;
            case TestMethod.tmHandleOnRequestGroupInfoEx:
                var oParams = oService.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair(MP_ERROR, "");
                oParams.AddNameValuePair(MP_SUCCESS, false);
                oParams.AddNameValuePair(MP_GROUP_ADHOC, false);
                oParams.AddNameValuePair(MP_GROUP_EMPTY, true);
                oParams.AddNameValuePair(MP_GROUP_FAMILY, 0);
                oParams.AddNameValuePair(MP_GROUP_FROMSQL, "");
                oParams.AddNameValuePair(MP_GROUP_INCLAUSE, "");
                oParams.AddNameValuePair(MP_GROUP_ORDERBYSQL, "");
                oParams.AddNameValuePair(MP_GROUP_PARAMETERS, "");
                oParams.AddNameValuePair(MP_GROUP_SELECTSQL, "");
                oParams.AddNameValuePair(MP_GROUP_WHERESQL, "");
                oParams.AddNameValuePair(MP_GROUP_CONDITIONS, "");
                oParams.AddNameValuePair(MP_GROUP_LAYOUTS, "");
                oParams.AddNameValuePair(MP_GROUP_SORTS, "");
                var sGroupId = "p6UJ9A000290";
                oService.HandleOnRequestGroupInfoEx(sGroupId, false, oParams);
                oService.Debug("SelectSql = " + oService.GetParamValue(oParams, MP_GROUP_SELECTSQL));
                oService.Debug("WhereSql = " + oService.GetParamValue(oParams, MP_GROUP_WHERESQL));
                oService.Debug("OrderBySql = " + oService.GetParamValue(oParams, MP_GROUP_ORDERBYSQL));
                oService.Debug("Layouts = " + oService.GetParamValue(oParams, MP_GROUP_LAYOUTS));
                oService.Debug("Conditions = " + oService.GetParamValue(oParams, MP_GROUP_CONDITIONS));
                oService.Debug("Sorts = " + oService.GetParamValue(oParams, MP_GROUP_SORTS));
                break;
            case TestMethod.tmSelectFolder:
                var oParams = oService.NewActiveXObject("SLXMMEngineW.Params");
                oParams.AddNameValuePair(MP_SELECTION, "");
                var bSelected = oService.MailMergeGUI().SelectFolder("Caption", "Title", oParams);
                if (bSelected)
                    oService.ShowMessage("The following folder was selected: " + oService.GetParamValue(oParams, MP_SELECTION));
                else
                    oService.ShowMessage("A folder was [not] selected.");
                break;
            case TestMethod.tmFulfillLitRequest:
                var sLitReqId = "VDEMOA0000CG"; // ReqUser is ADMIN
                alert(sLitReqId);
                var arrResult = oService.FulfillLitRequest(sLitReqId);
                var bSuccess = arrResult[LitReqResult.lrSuccess];
                var bCanceled = arrResult[LitReqResult.lrCanceled];
                var sError = arrResult[LitReqResult.lrError];
                if (bCanceled) {
                    oService.ShowMessage("FulfillLitRequest() was canceled.");
                }
                else {
                    if (!bSuccess) {
                        if (!Ext.isEmpty(sError)) {
                            oService.ShowError(sError);
                        }
                        else {
                            oService.ShowError("An unknown error occurred in FulfillLitRequest().");
                        }
                    }
                    else {
                        oService.ShowMessage("The literature request was fulfilled.");
                    }
                }
                break;
        }
    }
}

function TestMailMergeServiceInit() {
    var method = TestMethod.tmFulfillLitRequest;
    window.setTimeout("TestMailMergeService(" + method + ")", 1500);
}

if (RUNTEST) {
    YAHOO.util.Event.addListener(window, "load", TestMailMergeServiceInit);
}
