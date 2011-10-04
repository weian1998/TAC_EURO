/*global Sage $ MasterPageLinks Ext __doPostBack Sys*/
Sage.namespace('Sage.TaskPane');

Sage.TaskPane.TaskPaneItem = function (config) {

    this.config = config || {};
    this.selectionInfo = {};
    this.anchor = {};
    this.parent = config.parent;

    var that = this;
    var id = config.id;

    var link = $("#" + id);

    if (link.size() > 0) {
        this.anchor = link.get(0);
    }

    if (!this.anchor.href) {
        var hrefattr = document.createAttribute('href');
        hrefattr.nodeValue = "#";
        this.anchor.setAttributeNode(hrefattr);
    }
    if (!this.anchor.getAttribute('onclick')) {
        this.anchor.onclick = function () {
            that.doClick();
        };
    }
    return this.anchor;
};
Sage.TaskPane.TaskPaneItem.prototype.doClick = function () {
    var link = this;
    var confirmResp = true;
    if (link.config.confirmMsg) {
        confirmResp = confirm(link.config.confirmMsg);
    }
    if (confirmResp) {
        if (link.config.jscommand) {
            if (typeof link.config.jscommand === "function") {
                link.config.jscommand.call();
            }
            else {
                eval(link.config.jscommand);
            }
        }
        if (link.config && link.config.serverCommand) {
            // get selected items
            link.selectionInfo = link.getSelectionInfo();

            if (link.selectionInfo.selectionCount === 0) {
                link.confirmSelectAllRecords();
            }
            else {
                link.processSelectedRecords();
            }
        }
    }
};
Sage.TaskPane.TaskPaneItem.prototype.confirmSelectAllRecords = function () {
    var totalCount = Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;
    var dialogBody = String.format(MasterPageLinks.AdHocDialog_NoneSelectedProcess, totalCount);
    var that = this;
    Ext.MessageBox.confirm("", dialogBody, function (btn) {
        if (btn === 'yes') {
            that.selectionInfo.key = "selectAll";
            that.processSelectedRecords();
        }
        else {
            that.selectionInfo.key = "cancel";
        }
    });
};
Sage.TaskPane.TaskPaneItem.prototype.getSelectionInfo = function () {
    try {
        var selectionInfo = "";
        var panel = Sage.SalesLogix.Controls.ListPanel.find("MainList");
        if (panel) {
            selectionInfo = panel.getSelectionInfo();
        }
        return selectionInfo;
    }
    catch (e) {
        Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);
    }
};
Sage.TaskPane.TaskPaneItem.prototype.processSelectedRecords = function () {
    var svc = Sage.Services.getService("SelectionContextService");
    if (svc !== undefined) {
        var that = this;
        svc.setSelectionContext(this.selectionInfo.key, this.selectionInfo,
            function () {
                var link = that;
                if (that.selectionInfo.key) {
                    var prm = Sys.WebForms.PageRequestManager.getInstance();
                    prm.add_endRequest(function (sender, args) {

                        link.parent.showLinks();
                    });
                    __doPostBack(that.anchor.id, that.config.serverCommand + ',' + that.selectionInfo.key);
                }
            });
    }
    else {
        Ext.MessageBox.Alert(Sage.TaskPane.Resources.error_nosvc_title,
            String.format(Sage.TaskPane.Resources.error_nosvc_msg, "SelectionContextService"));
    }
};

