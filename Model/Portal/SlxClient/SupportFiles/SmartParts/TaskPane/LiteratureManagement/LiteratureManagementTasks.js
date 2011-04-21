if(typeof Sys!=="undefined") 
    { Ext.namespace("Sage.TaskPane"); }
var contextSvc;
var context;
var strEntityId;
var strEntityDescription;
var strEntityTableName;
var selections;
var arraySelections = new Array;
var activeGrid;
var postUrl = "";
var totalCount;
var clientID;
var sortExpression = '';

Sage.TaskPane.LiteratureManagementTasks = function(options) {
    this._id = options.id;
    clientID = options.clientId;
};

Sage.TaskPane.LiteratureManagementTasks.prototype.init = function() {
    var svc = Sage.Services.getService("GroupManagerService");
    svc.addListener(Sage.GroupManagerService.CURRENT_GROUP_CHANGED, function(sender, evt) {
        this.__doPostBack(clientID, "");
    });
       
};

function GetSelectionInfo() {
   var selectionInfo;
    try {
        var panel = Sage.SalesLogix.Controls.ListPanel.find("MainList");
        if (panel) {          
            selectionInfo = panel.getSelectionInfo();
        }
        return selectionInfo;
    }
    catch (e)
    { Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData); }
}

FulfillLiteratureTask = function() {
    var selectionInfo = PrepareSelections();
    if (selectionInfo != null) {
        SaveSelections(selectionInfo, ActionItem);
  
        return DoFulfillment(selectionInfo);

    }
    else
        return false;
}

DoFulfillment = function(selectionInfo) {
    var successCount = 0;
    var attemptCount = selectionInfo.selectionCount;
    var arrErrors = [];
    var arrFulfilledIds = [];
    var sId = String.format("{0}_hfLastFulfilledIds", clientID);
    var oLastFulfilledIds = $get(sId);
    if (oLastFulfilledIds) {
        oLastFulfilledIds.value = "";
    }

    var oService = GetMailMergeService();
    if (oService) {
        for (var i = 0; i < attemptCount; i++) {
            var sError = "";
            var sLitReqId = selectionInfo.selections[i].id;
            var arrResult = oService.FulfillLitRequest(sLitReqId);
            if (Ext.isArray(arrResult)) {
                var bSuccess = arrResult[LitReqResult.lrSuccess];
                if (bSuccess) {
                    successCount++;
                    arrFulfilledIds.push(sLitReqId);
                    continue;
                }
                var bCanceled = arrResult[LitReqResult.lrCanceled];
                if (bCanceled)
                    sError = String.format(LiteratureManagementResx.Err_FulfillCanceled, sLitReqId);
                else {
                    sError = String.format(LiteratureManagementResx.Err_FulfillFailed, sLitReqId);
                    sError += String.format(" {0}", arrResult[LitReqResult.lrError]);
                }
            }
            else {
                sError = String.format(LiteratureManagementResx.Err_FulfillFailed, sLitReqId);
            }
            if (Ext.isEmpty(sError)) {
                sError = String.format(LiteratureManagementResx.Err_FulfillFailed, sLitReqId);
            }
            arrErrors.push(sError);
        }
    }
    else {
        Ext.Msg.show({
            title: "Sage SalesLogix",
            msg: LiteratureManagementResx.Err_MailMergeService,
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
        return false;
    }

    if (oLastFulfilledIds) {
        oLastFulfilledIds.value = arrFulfilledIds.join();
    }

    if (successCount == attemptCount) {
        Ext.Msg.show({
            title: "Sage SalesLogix",
            msg: LiteratureManagementResx.Fulfill_Success,
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.INFO
        });
        return true;
    }
    else {
        var sErrorMsg = LiteratureManagementResx.Err_Fulfill;
        if (Ext.isArray(arrErrors) && arrErrors.length > 0) {
            // Cannot use CrLf in Ext.Msg.show.
            sErrorMsg = LiteratureManagementResx.Err_FulfillEx;
            for (var i = 0; i < arrErrors.length; i++) {
                sErrorMsg += String.format(" [{0}] {1}", i + 1, arrErrors[i]);
            }
        }
        Ext.Msg.show({
            title: "Sage SalesLogix",
            msg: sErrorMsg,
            buttons: Ext.Msg.OK,
            icon: Ext.MessageBox.ERROR
        });
        return false;
    }
}

PrintLabels = function(pluginId, contactIdList) {
    ShowReport(pluginId, 'CONTACT', contactIdList);
}

ValidateLiteratureTask = function() {
    var selectionInfo = PrepareSelections();
    if (selectionInfo != null) {
        SaveSelections(selectionInfo, ActionItem);

    }
    else
        return false;
}

SaveSelections = function(selectionInfo, callback) {
    document.getElementById(clientID + '_hfSelections').value = selectionInfo.key;
    var svc = Sage.Services.getService("SelectionContextService");
    svc.setSelectionContext(selectionInfo.key, selectionInfo, callback)
}
ActionItem = function() {
    // Some client-side action required for LitComplete
}

RefreshList = function()
{
    if (Sage && Sage.SalesLogix && Sage.SalesLogix.Controls && Sage.SalesLogix.Controls.ListPanel) {
        var panel = Sage.SalesLogix.Controls.ListPanel.find('MainList');
        if (panel)
            panel.refresh();
    }
}

function PrepareSelections() {
    
    var selectionInfo;
    try {
        selectionInfo = GetSelectionInfo();
    }
    catch (e) {
        Ext.Msg.alert(LiteratureManagementResx.Err_SelectionInfo);
        return null;
    }

    if ((!Object(selectionInfo).hasOwnProperty("selectionCount")) || (selectionInfo.selectionCount == 0)) {
        Ext.MessageBox.alert(LiteratureManagementResx.Msg_Select_Records_Title, LiteratureManagementResx.Msg_Select_Records);
        return null;
    }

    return selectionInfo;
}

