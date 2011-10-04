if (typeof Sys !== "undefined") {
    Ext.namespace("Sage.TaskPane");
}

Sage.TaskPane.AccountingTasksTasklet = function(options) {
    this._id = options.id;
    clientID = options.clientId;
};

Sage.TaskPane.AccountingTasksTasklet.prototype.init = function () {

};

LinkAccount = function() {
    var selectionInfo = PrepareSelections();
    if (selectionInfo != null) {
        if (selectionInfo.selectionCount == 0) {
            Ext.MessageBox.alert(AccountingTasksResources.Msg_Select_Records_Title, AccountingTasksResources.Msg_Select_Records);
            return false;
        }
    }
    SaveSelections(selectionInfo, ActionItem);
}

CheckPrices = function() {
    var selectionInfo = PrepareSelections();
    if (selectionInfo != null) {
        if (selectionInfo.selectionCount != 1) {
            Ext.MessageBox.alert(AccountingTasksResources.Msg_Select_Records_Title, AccountingTasksResources.Msg_UpdatePricing_Records);
            return false;
        }
    }
    SaveSelections(selectionInfo, ActionItem);
}

SubmitSalesOrder = function() {
    var selectionInfo = PrepareSelections();
    if (selectionInfo != null) {
        if (selectionInfo.selectionCount != 1) {
            Ext.MessageBox.alert(AccountingTasksResources.Msg_Select_Records_Title, AccountingTasksResources.Msg_UpdatePricing_Records);
            return false;
        }
    }
    SaveSelections(selectionInfo, ActionItem);
}

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

SaveSelections = function(selectionInfo, callback) {
    if (selectionInfo != null) {
        document.getElementById(clientID + '_hfSelections').value = selectionInfo.key;
        var svc = Sage.Services.getService("SelectionContextService");
        svc.setSelectionContext(selectionInfo.key, selectionInfo, callback)
    }
}

function PrepareSelections() {
    var selectionInfo;
    try {
        selectionInfo = GetSelectionInfo();
    }
    catch (e) {
        Ext.Msg.alert(AccountingTasksResources.Err_SelectionInfo);
        return null;
    }

    return selectionInfo;
}

ActionItem = function() {
    //Client-side actions
}