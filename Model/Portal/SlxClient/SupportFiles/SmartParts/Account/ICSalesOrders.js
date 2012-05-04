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
dojo.require("dijit.form.Form");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Form");
dojo.require('Sage.UI.Columns.DateTime');
dojo.require('Sage.UI.DateTextBox');

dojo.declare('Sage.UI.Forms.ICSalesOrders', null, {
    connectHandle: { payments: null, deliveries: null },
    dataStore: null,
    paymentsDataStore: null,
    deliveriesDataStore: null,
    loadSalesOrders: function (runtimeConfig) {
        var options = {
            context: runtimeConfig,
            columns: [
                { width: 10, field: '$key', name: ' ', sortable: false, formatter: SalesOrders_X3DetailsViewRenderer, style: 'text-align:left;', editable: false, hidden: function () { return !accountingSystemHandlesSO(); } () },
                { width: 10, field: 'reference', name: SalesOrderResources.grdSalesOrder_OrderNumber, sortable: true, formatter: SalesOrders_detailsViewRenderer, style: 'text-align:left;', editable: false },
                { width: 10, field: 'date', type: Sage.UI.Columns.DateTime, formatType: 'date', dateOnly: true, utc: false, name: SalesOrderResources.grdSalesOrder_OrderDate, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'status', name: SalesOrderResources.grdSalesOrder_Status, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'statusFlagText', name: SalesOrderResources.grdSalesOrder_HoldStatus, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'type', name: SalesOrderResources.grdSalesOrder_Type, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'customerReference', name: SalesOrderResources.grdSalesOrder_PO, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'netTotal', name: SalesOrderResources.grdSalesOrder_NetTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'discountTotal', name: SalesOrderResources.grdSalesOrder_DiscountTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'chargesTotal', name: SalesOrderResources.grdSalesOrder_ChargesTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'taxTotal', name: SalesOrderResources.grdSalesOrder_TaxTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'grossTotal', name: SalesOrderResources.grdSalesOrder_GrossTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                { width: 10, field: 'currency', name: SalesOrderResources.grdSalesOrder_Currency, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false }
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
                pathSegments: [{ 'text': 'salesOrders'}]
            }),
            tools: [],
            id: 'sdgrdSalesOrders',
            tabId: 'ICSalesOrders',
            gridNodeId: 'sdgrdSalesOrders_Grid',
            rowsPerPage: 20
        };
        var salesOrders = new Sage.UI.EditableGrid(options);
        window.setTimeout(function () { salesOrders.startup(); }, 1);
    },
    destroyFirst: function (id) {
        var widget = dijit.byId(id);
        if (widget) {
            widget.destroyRecursive();
        }
    },
    loadAddresses: function (data) {
        this.destroyFirst('sdgrdSalesOrderAddresses');
        if (data && typeof data.postalAddresses === 'undefined') {
            data.postalAddresses = {};
            data.postalAddresses.$resources = new Array();
        }
        var salesOrdersAddresses = new dojox.grid.DataGrid({
            id: 'sdgrdSalesOrderAddresses',
            store: this.dataStore,
            structure: [
                { width: 10, field: 'type', name: SalesOrderResources.grdAddress_Name, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'address1', name: SalesOrderResources.grdAddress_Address1, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'address2', name: SalesOrderResources.grdAddress_Address2, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'townCity', name: SalesOrderResources.grdAddress_City, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'stateRegion', name: SalesOrderResources.grdAddress_State, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'zipPostCode', name: SalesOrderResources.grdAddress_Zip, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {},
            queryOptions: { singleResourceRequest: true, property: 'postalAddresses' }
        });
        dojo.place(salesOrdersAddresses.domNode, "sdgrdSalesOrderAddresses_Grid", "single");
        salesOrdersAddresses.startup();
    },
    loadLineItems: function (data) {
        this.destroyFirst('sdgrdSalesOrderLines');
        if (data && typeof data.salesOrderLines === 'undefined') {
            data.salesOrderLines = {};
            data.salesOrderLines.$resources = new Array();
        }
        var salesOrderLines = new dojox.grid.DataGrid({
            id: 'sdgrdSalesOrderLines',
            store: this.dataStore,
            structure: [
                { width: 10, field: 'number', name: SalesOrderResources.grdItems_Line, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'type', name: SalesOrderResources.grdItems_Type, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'commodity.name', name: SalesOrderResources.grdItems_Commodity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'commodityVariant.reference', name: SalesOrderResources.grdItems_CommodityVariant, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'commodityDimension.reference', name: SalesOrderResources.grdItems_CommodityDimension, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'unitOfMeasure.name', name: SalesOrderResources.grdItems_UnitOfMeasure, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'fulfillmentLocation.name', name: SalesOrderResources.grdItems_Location, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'pricelist.name', name: SalesOrderResources.grdItems_PriceList, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'quantity', name: SalesOrderResources.grdItems_Quantity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'initialPrice', name: SalesOrderResources.grdItems_InitialPrice, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'actualPrice', name: SalesOrderResources.grdItems_ActualPrice, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'netTotal', name: SalesOrderResources.grdItems_NetTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'chargesTotal', name: SalesOrderResources.grdItems_ChargesTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'discountTotal', name: SalesOrderResources.grdItems_DiscountTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'taxTotal', name: SalesOrderResources.grdItems_TaxTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'grossTotal', name: SalesOrderResources.grdItems_GrossTotal, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {},
            queryOptions: { singleResourceRequest: true, property: 'salesOrderLines' }
        });
        dojo.place(salesOrderLines.domNode, "sdgrdSalesOrderLines_Grid", "single");
        salesOrderLines.startup();
    },
    initPayments: function () {
        var content = dijit.byId('soPaymentsContent');
        var soDetails = dijit.byId("dlgSalesOrderDetails");
        if (content != null && soDetails != null) {
            if (content.selected && (this.connectHandle.payments != null) && soDetails.open) {
                var grid = dijit.byId('sdgrdSalesOrders');
                var row = grid.selection.getSelected()[0];
                if (row) {
                    this.paymentsDataStore = new Sage.Data.ProxySDataStore({
                        service: getSDataService('proxy', true, false),
                        getResourcePredicate: function () {
                            salesOrderId = row['$key'];
                            return String.format("'{0}'", salesOrderId || '');
                        },
                        resourceKind: 'salesOrders',
                        getAppId: function () {
                            var clientContextService = Sage.Services.getService("ClientContextService");
                            if (clientContextService && clientContextService.containsKey("OperatingCompany")) {
                                return clientContextService.getValue("OperatingCompany");
                            }
                        },
                        include: [],
                        select: [],
                        pathSegments: [{ 'text': 'receipts'}],
                        includeContent: true
                    });
                    dojo.connect(this.paymentsDataStore, 'onGetSingleResource', this, 'loadPayments');
                    this.paymentsDataStore.getSingleResource();
                }
                if (this.connectHandle.payments != null) {
                    dojo.disconnect(this.connectHandle.payments);
                    this.connectHandle.payments = null;
                }
            }
        }
    },
    loadPayments: function (data) {
        this.destroyFirst('sdgrdSOPayments');
        if (data && typeof data.receipts === 'undefined') {
            data.receipts = {};
            data.receipts.$resources = new Array();
        }
        var payments = new dojox.grid.DataGrid({
            id: 'sdgrdSOPayments',
            store: this.paymentsDataStore,
            structure: [
                { width: 10, field: 'date', type: Sage.UI.Columns.DateTime, formatType: 'date', name: SalesOrderResources.grdPayments_Date, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'name', name: SalesOrderResources.grdPayments_Name, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'type', name: SalesOrderResources.grdPayments_Type, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'status', name: SalesOrderResources.grdPayments_Status, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'netTotal', name: SalesOrderResources.grdPayments_NetTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'discountTotal', name: SalesOrderResources.grdPayments_Discounts, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'chargesTotal', name: SalesOrderResources.grdPayments_Charges, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'taxTotal', name: SalesOrderResources.grdPayments_Tax, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'grossTotal', name: SalesOrderResources.grdPayments_GrossTotal, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'currency', name: SalesOrderResources.grdPayments_Currency, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'tenderType', name: SalesOrderResources.grdPayments_TenderType, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'tenderReference', name: SalesOrderResources.grdPayments_TenderReference, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'processDate', type: Sage.UI.Columns.DateTime, formatType: 'date', name: SalesOrderResources.grdPayments_ProcessDate, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {}
        });
        dojo.place(payments.domNode, "sdgrdSOPayments_Grid", "single");
        payments.startup();
    },
    initDeliveries: function () {
        var deliveriesContent = dijit.byId('soDeliveriesContent');
        var salesOrderDetails = dijit.byId("dlgSalesOrderDetails");
        if (deliveriesContent != null && salesOrderDetails != null) {
            if (deliveriesContent.selected && (this.connectHandle.deliveries != null) && salesOrderDetails.open) {
                var grid = dijit.byId('sdgrdSalesOrders');
                var row = grid.selection.getSelected()[0];
                if (row) {
                    this.deliveriesDataStore = new Sage.Data.ProxySDataStore({
                        service: getSDataService('proxy', true, false),
                        getResourcePredicate: function () {
                            salesInvoiceId = row['$key'];
                            return String.format("'{0}'", salesInvoiceId);
                        },
                        resourceKind: 'salesOrders',
                        getAppId: function () {
                            var clientContextService = Sage.Services.getService("ClientContextService");
                            if (clientContextService && clientContextService.containsKey("OperatingCompany")) {
                                return clientContextService.getValue("OperatingCompany");
                            }
                        },
                        include: [],
                        select: [],
                        pathSegments: [{ 'text': 'salesOrderDeliveries'}],
                        includeContent: true
                    });
                    dojo.connect(this.deliveriesDataStore, 'onGetSingleResource', this, 'loadDeliveries');
                    this.deliveriesDataStore.getSingleResource();
                }
                if (this.connectHandle.deliveries != null) {
                    dojo.disconnect(this.connectHandle.deliveries);
                    this.connectHandle.deliveries = null;
                }
            }
        }
    },
    loadDeliveries: function (data) {
        this.destroyFirst('sdgrdSODeliveries');
        if (data && typeof data.salesOrderDeliveries === 'undefined') {
            data.salesOrderDeliveries = {};
            data.salesOrderDeliveries.$resources = new Array();
        }
        var deliveries = new dojox.grid.DataGrid({
            id: 'sdgrdSODeliveries',
            store: this.deliveriesDataStore,
            structure: [
                { width: 10, field: 'reference', name: SalesOrderResources.grdDeliveries_Number, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'type', name: SalesOrderResources.grdDeliveries_Type, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'status', name: SalesOrderResources.grdDeliveries_Status, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'requestedDeliveryDate', type: Sage.UI.Columns.DateTime, formatType: 'date', name: SalesOrderResources.grdDeliveries_RequestedDate, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'actualDeliveryDate', type: Sage.UI.Columns.DateTime, formatType: 'date', name: SalesOrderResources.grdDeliveries_ActualDate, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'actualDeliveryTime', type: Sage.UI.Columns.DateTime, formatType: 'date', name: SalesOrderResources.grdDeliveries_ActualTime, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'requestedQuantity', name: SalesOrderResources.grdDeliveries_RequestedQuantity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'deliveredQuantity', name: SalesOrderResources.grdDeliveries_DeliveredQuantity, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'deliveryMethod', name: SalesOrderResources.grdDeliveries_Method, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'carrierTradingAccount.name', name: SalesOrderResources.grdDeliveries_Carrier, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'carrierReference', name: SalesOrderResources.grdDeliveries_CarrierReference, defaultValue: '', sortable: true, editable: false },
                { width: 10, field: 'dateExceptionReason', type: Sage.UI.Columns.DateTime, formatType: 'date', name: SalesOrderResources.grdDeliveries_ExceptionReason, defaultValue: '', sortable: true, editable: false }
            ],
            rowsPerPage: 200,
            query: {}
        });
        dojo.place(deliveries.domNode, "sdgrdSODeliveries_Grid", "single");
        deliveries.startup();
    },
    loadDetailsView: function () {
        var grid = dijit.byId('sdgrdSalesOrders');
        var row = grid.selection.getSelected()[0];
        if (row) {
            salesOrderId = row['$key'];
            this.dataStore = new Sage.Data.ProxySDataStore({
                service: getSDataService('proxy', true, false),
                resourceKind: 'salesOrders',
                getResourcePredicate: function () {
                    return String.format("'{0}'", salesOrderId);
                },
                getAppId: function () {
                    var clientContextService = Sage.Services.getService("ClientContextService");
                    if (clientContextService && clientContextService.containsKey("OperatingCompany")) {
                        return clientContextService.getValue("OperatingCompany");
                    }
                },
                include: [],
                select: ['*,salesOrderLines/*,postalAddresses/*,buyerContact/fullName,pricelist/name,quotation/reference,salesOrderLines/commodity/name,salesOrderLines/unitOfMeasure/name,salesOrderLines/fulfillmentLocation/name,salesOrderLines/pricelist/name,salesOrderLines/commodityVariant/reference,salesOrderLines/commodityDimension/reference,salesOrderDeliveries/carrierTradingAccount/name']
            });
            dojo.connect(this.dataStore, 'onGetSingleResource', this, 'buildGrids');
            this.dataStore.getSingleResource();
            this.connectHandle.payments = dojo.connect(dijit.byId('soPaymentsContent'), 'onShow', this, 'initPayments');
            this.connectHandle.deliveries = dojo.connect(dijit.byId('soDeliveriesContent'), 'onShow', this, 'initDeliveries');
        }
    },
    callX3DetailsView: function () {
        var grid = dijit.byId('sdgrdSalesOrders');
        var row = grid.selection.getSelected()[0];
        if (row) {
            var salesOrderId = row['$key'];
            var clientContextService = Sage.Services.getService("ClientContextService");
            $.ajax({
                type: "GET",
                contentType: "application/json",
                url: String.format("slxdata.ashx/slx/crm/-/X3SalesOrder/getediterpsalesorderurl?salesOrderKey={0}&operatingCompany={1}&_dc={2}", salesOrderId,
                clientContextService.getValue("OperatingCompany"), new Date().getTime()),
                dataType: 'json',
                success: launchAccountingSystemView,
                data: {}
            })
        }
    },
    loadSalesOrderDetails: function (data) {
        if (data && typeof data !== 'undefined') {
            dijit.byId("dlgSalesOrderDetails").set('value', data);
            dijit.byId("dlgSalesOrderDetails").show();
        }
    },
    buildGrids: function (data) {
        this.loadSalesOrderDetails(data);
        this.loadAddresses(data);
        this.loadLineItems(data);
        var container = dijit.byId('salesOrderContainer');
        if (container != null) {
            container.selectChild(dijit.byId('salesOrderContent'));
        }
    },
    closeDetailsDialog: function () {
        dijit.byId("dlgSalesOrderDetails").hide();
    },
    handleOnHide: function () {
        /* Destroy the grids that are loaded dynamically, so that the 
        data for one entity is not initially displayed for another entity. */
        this.destroyFirst('sdgrdSODeliveries');
        this.deliveriesDataStore = null;
        this.destroyFirst('sdgrdSOPayments');
        this.paymentsDataStore = null;
    },
    init: function (runtimeConfig) {
        this.loadSalesOrders(runtimeConfig);
    }
});

var SalesOrders_detailsViewRenderer = function (value) {
    return String.format('<a href="javascript:salesOrder.loadDetailsView();">{0}</a>', value);
}

var SalesOrders_X3DetailsViewRenderer = function (value) {
    return String.format('<a href="javascript:salesOrder.callX3DetailsView();">{0}</a>', SalesOrderResources.grdSalesOrder_Edit);
}

function launchAccountingSystemView(data) {
    if (data.error != null) {
        alert(data.error);
    }
    else {
        window.open(data.url);
    }
}

function getSDataService(contract, keepUnique, useJson) {
    contract = contract || 'dynamic';
    var svcKey = "SDataService_" + contract;
    var bJson = true;
    if (typeof useJson === 'boolean') {
        bJson = useJson;
    }
    svc = new Sage.SData.Client.SDataService({
        serverName: window.location.hostname,
        virtualDirectory: Sage.Utility.getVirtualDirectoryName() + '/slxdata.ashx',
        applicationName: 'slx',
        contractName: contract,
        port: window.location.port && window.location.port != 80 ? window.location.port : false,
        protocol: /https/i.test(window.location.protocol) ? 'https' : false,
        json: bJson
    });
    return svc;
}

function ExecuteErpInsertView() {
    var clientContextService = Sage.Services.getService("ClientContextService");
    $.ajax({
        type: "GET",
        contentType: "application/json",
        url: String.format("slxdata.ashx/slx/crm/-/X3SalesOrder/getinserterpsalesorderurl?accountId={0}&operatingCompany={1}&_dc={2}",
                Sage.Utility.getCurrentEntityId(), clientContextService.getValue("OperatingCompany"), new Date().getTime()),
        dataType: 'json',
        success: launchAccountingSystemView,
        data: {}
    })
}

//details view
dojo.addOnLoad(function () {
    Sys.WebForms.PageRequestManager.getInstance().remove_pageLoading(SalesOrder_Destroying);
    Sys.WebForms.PageRequestManager.getInstance().add_pageLoading(SalesOrder_Destroying);
});

function SalesOrder_Destroying(sender, args) {
    var len = args._panelsUpdating.length;
    for (var i = 0; i < len; i++) {
        var id = args._panelsUpdating[i].id
        if (id && id.indexOf('ICSalesOrders') > -1) {
            var d = dijit.byId('dlgSalesOrderDetails');
            if (d) {
                d.destroyRecursive();
            }
        }
    }
}

if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();