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
dojo.require("dijit.form.Form");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.TitlePane");
dojo.require('Sage.UI.Columns.DateTime');
dojo.require('Sage.UI.DateTextBox');

dojo.declare('Sage.UI.Forms.ICInvoices', null, {
    dataStore: null,
    loadSalesInvoices: function (runtimeConfig) {
        var options = {
            context: runtimeConfig,
            columns: [
                { width: 10, field: 'reference', name: InvoiceResources.grdInvoice_Name, defaultValue: '', sortable: true, formatter: Invoices_detailsViewRenderer, style: 'text-align:left;', editable: false },
                { width: 10, field: 'date', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdInvoice_Date, defaultValue: '', defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'dueDate', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdInvoice_DueDate, defaultValue: '', defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'customerReference', name: InvoiceResources.grdInvoice_PO, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'settlementDiscountTerms', name: InvoiceResources.grdInvoice_PaymentTerms, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'netTotal', name: InvoiceResources.grdInvoice_NetTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'taxTotal', name: InvoiceResources.grdInvoice_Tax, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'grossTotal', name: InvoiceResources.grdInvoice_Amount, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false }
            ],
            store: new Sage.Data.ProxySDataStore({
                service: Sage.Utility.getSDataService('proxy', true),
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
                pathSegments: [{ 'text': 'salesInvoices'}]
            }),
            tools: [],
            id: 'sdgrdInvoices',
            tabId: 'ICInvoices',
            gridNodeId: 'sdgrdInvoices_Grid',
            rowsPerPage: 20
        };
        var salesInvoices = new Sage.UI.SLXTabGrid(options);
        window.setTimeout(function () { salesInvoices.startup(); }, 1);
    },
    destroyFirst: function (id) {
        var widget = dijit.byId(id);
        if (widget) {
            widget.destroyRecursive();
        }
    },
    loadAddresses: function (data) {
        this.destroyFirst('sdgrdInvoiceAddresses');
        var salesInvoiceAddresses = new dojox.grid.DataGrid({
            id: 'sdgrdInvoiceAddresses',
            store: this.dataStore,
            structure: [
                { width: 10, field: 'type', name: InvoiceResources.grdAddress_Name, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'address1', name: InvoiceResources.grdAddress_address1, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'address2', name: InvoiceResources.grdAddress_address2, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'townCity', name: InvoiceResources.grdAddress_City, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'stateRegion', name: InvoiceResources.grdAddress_State, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'zipPostCode', name: InvoiceResources.grdAddress_Zip, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {},
            queryOptions: { singleResourceRequest: true, property: 'postalAddresses' }
        });
        dojo.place(salesInvoiceAddresses.domNode, "sdgrdInvoiceAddresses_Grid", "single");
        salesInvoiceAddresses.startup();
    },
    loadLineItems: function (data) {
        this.destroyFirst('sdgrdInvoiceLines');
        var salesInvoiceLines = new dojox.grid.DataGrid({
            id: 'sdgrdInvoiceLines',
            store: this.dataStore,
            structure: [
                { width: 10, field: 'number', name: InvoiceResources.grdItems_Line, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'type', name: InvoiceResources.grdItems_Type, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'status', name: InvoiceResources.grdItems_Status, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'commodity.name', name: InvoiceResources.grdItems_Commodity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'commodityVariant', name: InvoiceResources.grdItems_CommodityVariant, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'commodityDimension', name: InvoiceResources.grdItems_CommodityDimension, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'unitOfMeasure.name', name: InvoiceResources.grdItems_UnitOfMeasure, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'quantity', name: InvoiceResources.grdItems_Quantity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'initialPrice', name: InvoiceResources.grdItems_InitialPrice, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'actualPrice', name: InvoiceResources.grdItems_ActualPrice, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'netTotal', name: InvoiceResources.grdItems_NetTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'chargesTotal', name: InvoiceResources.grdItems_ChargesTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'discountTotal', name: InvoiceResources.grdItems_DiscountTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'taxTotal', name: InvoiceResources.grdItems_TaxTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'grossTotal', name: InvoiceResources.grdItems_GrossTotal, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {},
            queryOptions: { singleResourceRequest: true, property: 'salesInvoiceLines' }
        });
        dojo.place(salesInvoiceLines.domNode, "sdgrdInvoiceLines_Grid", "only");
        salesInvoiceLines.startup();
    },
    loadPayments: function (data) {
        this.destroyFirst('sdgrdPayments');
        var payments = new dojox.grid.DataGrid({
            id: 'sdgrdPayments',
            store: this.dataStore,
            structure: [
                { width: 10, field: 'date', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdPayments_Date, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'name', name: InvoiceResources.grdPayments_Name, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'type', name: InvoiceResources.grdPayments_Type, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'status', name: InvoiceResources.grdPayments_Status, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'netTotal', name: InvoiceResources.grdPayments_NetTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'discountTotal', name: InvoiceResources.grdPayments_Discounts, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'chargesTotal', name: InvoiceResources.grdPayments_Charges, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'taxTotal', name: InvoiceResources.grdPayments_Tax, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'grossTotal', name: InvoiceResources.grdPayments_GrossTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'currency', name: InvoiceResources.grdPayments_Currency, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'tenderType', name: InvoiceResources.grdPayments_TenderType, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'tenderReference', name: InvoiceResources.grdPayments_TenderReference, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'processDate', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdPayments_ProcessDate, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {},
            queryOptions: { singleResourceRequest: true, property: 'receipts' }
        });
        dojo.place(payments.domNode, "sdgrdPayments_Grid", "only");
        payments.startup();
    },
    loadDeliveries: function (data) {
        this.destroyFirst('sdgrdDeliveries');
        var deliveries = new dojox.grid.DataGrid({
            id: 'sdgrdDeliveries',
            store: this.dataStore,
            structure: [
                { width: 10, field: 'reference', name: InvoiceResources.grdDeliveries_Number, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'type', name: InvoiceResources.grdDeliveries_Type, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'status', name: InvoiceResources.grdDeliveries_Status, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'requestedDeliveryDate', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdDeliveries_RequestedDate, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'actualDeliveryDate', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdDeliveries_ActualDate, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'actualDeliveryTime', type: Sage.UI.Columns.DateTime, name: InvoiceResources.grdDeliveries_ActualTime, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'requestedQuantity', name: InvoiceResources.grdDeliveries_RequestedQuantity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'deliveredQuantity', name: InvoiceResources.grdDeliveries_DeliveredQuantity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'deliveryMethod', name: InvoiceResources.grdDeliveries_Method, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'carrierTradingAccount', name: InvoiceResources.grdDeliveries_Carrier, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'carrierReference', name: InvoiceResources.grdDeliveries_CarrierReference, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'dateExceptionReason', name: InvoiceResources.grdDeliveries_ExceptionReason, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {},
            queryOptions: { singleResourceRequest: true, property: 'salesOrderDeliveries' }
        });
        dojo.place(deliveries.domNode, "sdgrdDeliveries_Grid", "only");
        deliveries.startup();
    },
    loadDetailsView: function () {
        var grid = dijit.byId('sdgrdInvoices');
        var row = grid.selection.getSelected()[0];
        if (row) {
            salesInvoiceId = row['$key'];

            dijit.byId("dlgInvoiceDetails").set('value', row);
            dijit.byId("dlgInvoiceDetails").show();
            this.dataStore = new Sage.Data.ProxySDataStore({
                service: getSDataService('proxy', true),
                resourceKind: 'salesInvoices',
                getResourcePredicate: function () {
                    return String.format("'{0}'", salesInvoiceId);
                },
                getAppId: function () {
                    var clientContextService = Sage.Services.getService("ClientContextService");
                    if (clientContextService && clientContextService.containsKey("OperatingCompany")) {
                        return clientContextService.getValue("OperatingCompany");
                    }
                },
                include: ['postalAddresses', 'salesInvoiceLines', 'salesInvoiceLines/commodity', 'salesInvoiceLines/unitOfMeasure', 'receipts', 'salesOrderDeliveries'],
                select: [ ],
                includeContent: true
            });
            dojo.connect(this.dataStore, 'onGetSingleResource', this, 'buildGrids');
            this.dataStore.getSingleResource();
        }
    },
    buildGrids: function (data) {
        this.loadAddresses(data);
        this.loadLineItems(data);
        this.loadPayments(data);
        this.loadDeliveries(data);
    },
    closeDetailsDialog: function () {
        dijit.byId("dlgInvoiceDetails").hide();
    },
    init: function (runtimeConfig) {

        this.loadSalesInvoices(runtimeConfig);
    }
});

var Invoices_detailsViewRenderer = function (value) {
    return String.format('<a href="javascript:invoice.loadDetailsView();">{0}</a>', value);
}

function getSDataService(contract) {
    contract = contract || 'dynamic';
    var svcKey = "SDataService_" + contract;

    svc = new Sage.SData.Client.SDataService({
        serverName: window.location.hostname,
        virtualDirectory: Sage.Utility.getVirtualDirectoryName() + '/slxdata.ashx',
        applicationName: 'slx',
        contractName: contract,
        port: window.location.port && window.location.port != 80 ? window.location.port : false,
        protocol: /https/i.test(window.location.protocol) ? 'https' : false,
        json: true
    });
    return svc;
}
//details view
dojo.addOnLoad(function () {
    Sys.WebForms.PageRequestManager.getInstance().remove_pageLoading(InvoiceDet_destroying);
    Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(InvoiceDet_destroying);
});

function InvoiceDet_destroying(sender, args) {
    var len = args._panelsUpdating.length;
    for (var i = 0; i < len; i++) {
        var id = args._panelsUpdating[i].id
        if (id && id.indexOf('ICInvoices') > -1) {
            var d = dijit.byId('dlgInvoiceDetails');
            if (d) {
                d.destroyRecursive();
            }
        }
    }
}

if (typeof Sys !== 'undefined') {
    Sys.Application.notifyScriptLoaded();
}