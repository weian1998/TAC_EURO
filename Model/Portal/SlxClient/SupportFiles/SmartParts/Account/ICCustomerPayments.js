dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require('dojox.grid.DataGrid');
dojo.require('Sage.UI.EditableGrid');
dojo.require('Sage.Data.ProxySDataStore');
Sage.namespace("Sage.UI.Forms");
dojo.requireLocalization("Sage.UI", "ListPanel");
dojo.require("dijit.layout.LayoutContainer");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TitlePane");
dojo.require('Sage.UI.Columns.DateTime');
dojo.require('Sage.UI.DateTextBox');

dojo.declare('Sage.UI.Forms.ICCustomerPayments', null, {
    loadCustomerPayments: function (runtimeConfig) {
        var options = {
            context: runtimeConfig,
            columns: [
                { width: 10, field: 'reference', name: PaymentsResources.grdPayments_Reference, sortable: true, formatter: CustomerPayments_detailsViewRenderer, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'date', type: Sage.UI.Columns.DateTime, formatType: 'date', dateOnly: true, utc: false, name: PaymentsResources.grdPayments_Date, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'type', name: PaymentsResources.grdPayments_Type, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'status', name: PaymentsResources.grdPayments_Status, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'grossTotal', name: PaymentsResources.grdPayments_GrossTotal, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'currency', name: PaymentsResources.grdPayments_Currency, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'processDate', type: Sage.UI.Columns.DateTime, formatType: 'date', dateOnly: true, utc: false, editable: false, hidden: function () { return true } },
                { width: 10, field: 'discountTotal', editable: false, hidden: function () { return true } },
                { width: 10, field: 'chargesTotal', editable: false, hidden: function () { return true } },
                { width: 10, field: 'source', editable: false, hidden: function () { return true } },
                { width: 10, field: 'taxTotal', editable: false, hidden: function () { return true } },
                { width: 10, field: 'name', editable: false, hidden: function () { return true } },
                { width: 10, field: 'tenderType', editable: false, hidden: function () { return true } },
                { width: 10, field: 'tenderReference', editable: false, hidden: function () { return true } },
                { width: 10, field: 'netTotal', editable: false, hidden: function () { return true } },
                { width: 10, field: 'grossTotal', editable: false, hidden: function () { return true } },
                { width: 10, field: 'taxCode', editable: false, hidden: function () { return true } }
            ],
            store: new Sage.Data.ProxySDataStore({
                service: Sage.Utility.getSDataService('proxy', true, false),
                resourceKind: 'tradingAccounts',
                getResourcePredicate: function () {
                    var clientContextService = Sage.Services.getService("ClientContextService");
                    if (clientContextService && clientContextService.containsKey("GlobalSyncId")) {
                        return String.format("$uuid eq '{0}'", clientContextService.getValue("GlobalSyncId"));
                    }
                },
                getAppId: function () {
                    var clientContextService = Sage.Services.getService("ClientContextService");
                    if (clientContextService && clientContextService.containsKey("OperatingCompany")) {
                        return clientContextService.getValue("OperatingCompany");
                    }
                },
                include: [],
                select: [],
                pathSegments: [{ 'text': 'receipts'}]
            }),
            tools: [],
            id: 'sdgrdPayments',
            tabId: 'ICCustomerPayments',
            gridNodeId: 'sdgrdPayments_Grid',
            rowsPerPage: 20
        };
        //destory the container so that we don't get duplicate id reference errors
        //        var content = dijit.byId('dlgPaymentDetails');
        //        if (content != null) {
        //            content.destroyRendering();
        //        }
        var payments = new Sage.UI.EditableGrid(options);
        window.setTimeout(function () { payments.startup(); }, 1);
    },
    loadDetailsView: function () {
        var grid = dijit.byId('sdgrdPayments');
        var row = grid.selection.getSelected()[0];
        if (row) {
            paymentId = row['$key'];
            dijit.byId("dlgPaymentDetails").set('value', row);
            dijit.byId("dlgPaymentDetails").show();
//            this.paymentsDataStore = new Sage.Data.ProxySDataStore({
//                service: Sage.Utility.getSDataService('proxy', true, false),
//                resourceKind: 'receipts',
//                getResourcePredicate: function () {
//                    return String.format("$uuid eq '{0}'", paymentId);
//                },
//                getAppId: function () {
//                    var clientContextService = Sage.Services.getService("ClientContextService");
//                    if (clientContextService && clientContextService.containsKey("OperatingCompany")) {
//                        return clientContextService.getValue("OperatingCompany");
//                    }
//                },
//                include: [],
//                select: [],
//                //pathSegments: [{ 'text': 'receipts'}],
//                includeContent: true
//            });
//            dojo.connect(this.paymentsDataStore, 'onGetSingleResource', this, 'loadView');
//            this.paymentsDataStore.getSingleResource();
        }
    },
    closeDetailsDialog: function () {
        dijit.byId("dlgPaymentDetails").hide();
    },
    init: function (runtimeConfig) {
        this.loadCustomerPayments(runtimeConfig);
    }
});

var CustomerPayments_detailsViewRenderer = function (value) {
    return String.format('<a href="javascript:payment.loadDetailsView();">{0}</a>', value);
}

dojo.addOnLoad(function () {
    Sys.WebForms.PageRequestManager.getInstance().remove_pageLoading(CustPayments_destroying);
    Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(CustPayments_destroying);
});

function CustPayments_destroying(sender, args) {
    var len = args._panelsUpdating.length;
    for (var i = 0; i < len; i++) {
        var id = args._panelsUpdating[i].id
        if (id && id.indexOf('ICCustomerPayments') > -1) {
            var d = dijit.byId('dlgPaymentDetails');
            if (d) {
                d.destroyRecursive();
            }
        }
    }
}

if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();