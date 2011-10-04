dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.require('dojox.grid.DataGrid');
dojo.require('Sage.UI.SLXTabGrid');
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
    dataStore: null,
    loadCustomerPayments: function (runtimeConfig) {
        var options = {
            context: runtimeConfig,
            columns: [
                { width: 10, field: 'reference', name: PaymentsResources.grdPayments_Reference, sortable: true, formatter: CustomerPayments_detailsViewRenderer, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'date', type: Sage.UI.Columns.DateTime, name: PaymentsResources.grdPayments_Date, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'type', name: PaymentsResources.grdPayments_Type, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'status', name: PaymentsResources.grdPayments_Status, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'grossTotal', name: PaymentsResources.grdPayments_GrossTotal, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                { width: 10, field: 'currency', name: PaymentsResources.grdPayments_Currency, sortable: true, style: 'text-align:left;width:auto;', editable: false }
            ],
            store: new Sage.Data.ProxySDataStore({
                service: Sage.Utility.getSDataService('proxy',  true),
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
        var payments = new Sage.UI.SLXTabGrid(options);
        window.setTimeout(function () { payments.startup(); }, 1);
    },
    loadDetailsView: function () {
        var grid = dijit.byId('sdgrdPayments');
        var row = grid.selection.getSelected()[0];
        if (row) {
            paymentId = row['$key'];
            dijit.byId("dlgPaymentDetails").set('value', row);
            dijit.byId("dlgPaymentDetails").show();
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
    console.log("running ICCustomerPayments not parsing its div...");
    //dojo.parser.parse();
    //dojo.parser.parse(dojo.query('#element_ICCustomerPayments td.tws-tab-view-body')[0]);
        Sys.WebForms.PageRequestManager.getInstance().remove_pageLoading(CustPayments_destroying);
        Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(CustPayments_destroying);
    console.log('finished running ICCustomerPayments');
});
function CustPayments_destroying(sender, args) {
    var len = args._panelsUpdating.length;
    for (var i = 0; i < len; i++) {
        var id = args._panelsUpdating[i].id
        console.log('Payments - what am I: ' + id + '   ' + id.indexOf('ICCustomerPayments'));
        if (id && id.indexOf('ICCustomerPayments') > -1) {
            var d = dijit.byId('dlgPaymentDetails');
            if (d) {
                console.log('destroying dlgPaymentDetails');
                d.destroyRecursive();
            }
        }
    }
}

if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();