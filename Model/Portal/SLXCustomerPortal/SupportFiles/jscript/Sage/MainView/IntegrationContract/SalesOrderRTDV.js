/*globals dojo, define, Sage, dijit, Simplate, $ */
define([
    'dojo/_base/declare',
    'dojo/i18n!./nls/SalesOrderRTDV',
    'dijit/_Widget',
    'Sage/_Templated',
    'Sage/UI/SLXPreviewGrid',
    'Sage/Data/ProxySDataStore',
    'Sage/UI/Dialogs',
    'Sage/UI/Columns/DateTime',
    'dojo/text!./templates/SalesOrderRTDV.html',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'Sage/UI/DateTextBox',
    'dijit/Dialog',
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Dialog'
],

function (declare, i18nStrings, _Widget, _Templated, SLXPreviewGrid, ProxySDataStore, Dialogs, SlxDateTimeColumn, template, dHelpIcon, lang) {
    var salesOrderRTDV = declare('Sage.MainView.IntegrationContract.SalesOrderRTDV', [_Widget, _Templated], {
        workspace: '',
        tabId: '',
        grid: '',
        globalSyncId: '',
        operatingCompanyId: '',
        dataStore: null,
        salesPersonsDataStore: null,
        paymentsDataStore: null,
        deliveriesDataStore: null,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        loadSalesOrders: function () {
            var self = this;
            var options = {
                readOnly: true,
                rowsPerPage: 20,
                slxContext: { workspace: this.workspace, tabId: this.tabId },
                columns: [
                    { width: 10, field: '$key', name: ' ', sortable: false, formatter: this.salesOrdersX3DetailsViewRenderer, style: 'text-align:left;', editable: false, hidden: function () { return !accountingSystemHandlesSO(); } () },
                    { width: 10, field: 'reference', name: this.grdSalesOrder_OrderNumber, sortable: true, formatter: this.salesOrdersDetailsViewRenderer, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'date', type: SlxDateTimeColumn, formatType: 'date', dateOnly: true, utc: false, name: this.grdSalesOrder_OrderDate, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'status', name: this.grdSalesOrder_Status, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'statusFlagText', name: this.grdSalesOrder_HoldStatus, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'type', name: this.grdSalesOrder_Type, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'customerReference', name: this.grdSalesOrder_PO, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'netTotal', name: this.grdSalesOrder_NetTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'discountTotal', name: this.grdSalesOrder_DiscountTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'chargesTotal', name: this.grdSalesOrder_ChargesTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'taxTotal', name: this.grdSalesOrder_TaxTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'grossTotal', name: this.grdSalesOrder_GrossTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'currency', name: this.grdSalesOrder_Currency, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false }
                ],
                storeOptions: new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    resourceKind: 'tradingAccounts',
                    getResourcePredicate: function () {
                        return dojo.string.substitute("$uuid eq '${0}'", [self.globalSyncId]);
                    },
                    getAppId: function () {
                        return self.operatingCompanyId;
                    },
                    include: [],
                    select: [],
                    pathSegments: [{ 'text': 'salesOrders'}]
                }),
                tools: []
            };
            var salesOrdersGrid = new SLXPreviewGrid.Grid(options, this.placeHolder);
            salesOrdersGrid.startup();
            var tabContent = dijit.byId('tabContent');
            tabContent.resize(); tabContent.resize();
            this.grid = salesOrdersGrid;
        },
        salesOrdersDetailsViewRenderer: function (value) {
            return dojo.string.substitute('<a href="javascript:salesOrderRTDV.loadDetailsView();">${0}</a>', [value]);
        },
        salesOrdersX3DetailsViewRenderer: function () {
            return dojo.string.substitute('<a href="javascript:salesOrderRTDV.callX3DetailsView();">${0}</a>', [i18nStrings.grdSalesOrder_Edit]);
        },
        destroyFirst: function (id) {
            var widget = dijit.byId(id);
            if (widget) {
                widget.destroyRecursive();
            }
        },
        initSalesPersons: function () {
            if (this.salesPersonsDataStore) return;
            var self = this;
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                this.salesPersonsDataStore = new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    getResourcePredicate: function () {
                        var salesOrderId = row['$key'];
                        return dojo.string.substitute("'${0}'", [salesOrderId || '']);
                    },
                    resourceKind: 'salesOrders',
                    getAppId: function () {
                        return self.operatingCompanyId;
                    },
                    include: [],
                    select: [],
                    pathSegments: [{ 'text': 'salesPersons'}],
                    includeContent: true
                });
                dojo.connect(this.salesPersonsDataStore, 'onGetSingleResource', this, 'loadSalesPersons');
                this.salesPersonsDataStore.getSingleResource();
            }
        },
        loadSalesPersons: function (data) {
            this.destroyFirst('sdgrdSalesPersons');
            if (data && typeof data.salesPersons === 'undefined') {
                data.salesPersons = {};
                data.salesPersons.$resources = new Array();
            }
            var salesPersons = new dojox.grid.DataGrid({
                id: 'sdgrdSalesPersons',
                store: this.salesPersonsDataStore,
                structure: [
                    { width: 10, field: 'name', name: this.grdSalesPersons_Name, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'type', name: this.grdSalesPersons_Type, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'extension', name: this.grdSalesPersons_Extension, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'relationship', name: this.grdSalesPersons_Relationship, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {}
            });
            dojo.place(salesPersons.domNode, this.sdgrdSalesPersons_Grid, "single");
            salesPersons.startup();
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
                    { width: 10, field: 'type', name: this.grdAddress_Name, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'address1', name: this.grdAddress_Address1, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'address2', name: this.grdAddress_Address2, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'townCity', name: this.grdAddress_City, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'stateRegion', name: this.grdAddress_State, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'zipPostCode', name: this.grdAddress_Zip, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {},
                queryOptions: { singleResourceRequest: true, property: 'postalAddresses' }
            });
            dojo.place(salesOrdersAddresses.domNode, this.sdgrdSalesOrderAddresses_Grid, "single");
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
                    { width: 10, field: 'number', name: this.grdItems_Line, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'type', name: this.grdItems_Type, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'commodity.name', name: this.grdItems_Commodity, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'commodityVariant.reference', name: this.grdItems_CommodityVariant, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'commodityDimension.reference', name: this.grdItems_CommodityDimension, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'unitOfMeasure.name', name: this.grdItems_UnitOfMeasure, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'fulfillmentLocation.name', name: this.grdItems_Location, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'pricelist.name', name: this.grdItems_PriceList, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'quantity', name: this.grdItems_Quantity, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'initialPrice', name: this.grdItems_InitialPrice, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'actualPrice', name: this.grdItems_ActualPrice, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'netTotal', name: this.grdItems_NetTotal, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'chargesTotal', name: this.grdItems_ChargesTotal, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'discountTotal', name: this.grdItems_DiscountTotal, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'taxTotal', name: this.grdItems_TaxTotal, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'grossTotal', name: this.grdItems_GrossTotal, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {},
                queryOptions: { singleResourceRequest: true, property: 'salesOrderLines' }
            });
            dojo.place(salesOrderLines.domNode, this.sdgrdSalesOrderLines_Grid, "single");
            salesOrderLines.startup();
        },
        initPayments: function () {
            if (this.paymentsDataStore) return;
            var self = this;
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                this.paymentsDataStore = new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    getResourcePredicate: function () {
                        var salesOrderId = row['$key'];
                        return dojo.string.substitute("'${0}'", [salesOrderId || '']);
                    },
                    resourceKind: 'salesOrders',
                    getAppId: function () {
                        return self.operatingCompanyId;
                    },
                    include: [],
                    select: [],
                    pathSegments: [{ 'text': 'receipts'}],
                    includeContent: true
                });
                dojo.connect(this.paymentsDataStore, 'onGetSingleResource', this, 'loadPayments');
                this.paymentsDataStore.getSingleResource();
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
                    { width: 10, field: 'date', type: SlxDateTimeColumn, formatType: 'date', name: this.grdPayments_Date, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'name', name: this.grdPayments_Name, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'type', name: this.grdPayments_Type, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'status', name: this.grdPayments_Status, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'netTotal', name: this.grdPayments_NetTotal, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'discountTotal', name: this.grdPayments_Discounts, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'chargesTotal', name: this.grdPayments_Charges, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'taxTotal', name: this.grdPayments_Tax, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'grossTotal', name: this.grdPayments_GrossTotal, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'currency', name: this.grdPayments_Currency, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'tenderType', name: this.grdPayments_TenderType, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'tenderReference', name: this.grdPayments_TenderReference, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'processDate', type: SlxDateTimeColumn, formatType: 'date', name: this.grdPayments_ProcessDate, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {}
            });
            dojo.place(payments.domNode, this.sdgrdSOPayments_Grid, "single");
            payments.startup();
        },
        initDeliveries: function () {
            if (this.deliveriesDataStore) return;
            var self = this;
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                this.deliveriesDataStore = new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    getResourcePredicate: function () {
                        var salesInvoiceId = row['$key'];
                        return dojo.string.substitute("'${0}'", [salesInvoiceId]);
                    },
                    resourceKind: 'salesOrders',
                    getAppId: function () {
                        return self.operatingCompanyId;
                    },
                    include: [],
                    select: [],
                    pathSegments: [{ 'text': 'salesOrderDeliveries'}],
                    includeContent: true
                });
                dojo.connect(this.deliveriesDataStore, 'onGetSingleResource', this, 'loadDeliveries');
                this.deliveriesDataStore.getSingleResource();
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
                    { width: 10, field: 'reference', name: this.grdDeliveries_Number, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'type', name: this.grdDeliveries_Type, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'status', name: this.grdDeliveries_Status, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'requestedDeliveryDate', type: SlxDateTimeColumn, formatType: 'date', name: this.grdDeliveries_RequestedDate, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'actualDeliveryDate', type: SlxDateTimeColumn, formatType: 'date', name: this.grdDeliveries_ActualDate, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'actualDeliveryTime', type: SlxDateTimeColumn, formatType: 'date', name: this.grdDeliveries_ActualTime, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'requestedQuantity', name: this.grdDeliveries_RequestedQuantity, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'deliveredQuantity', name: this.grdDeliveries_DeliveredQuantity, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'deliveryMethod', name: this.grdDeliveries_Method, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'carrierTradingAccount.name', name: this.grdDeliveries_Carrier, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'carrierReference', name: this.grdDeliveries_CarrierReference, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'dateExceptionReason', type: SlxDateTimeColumn, formatType: 'date', name: this.grdDeliveries_ExceptionReason, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {}
            });
            dojo.place(deliveries.domNode, this.sdgrdSODeliveries_Grid, "single");
            deliveries.startup();
        },
        loadDetailsView: function () {
            dojo.removeClass(this.loadingContainer, "display-none");
            dojo.addClass(this.salesOrderDetails, "display-none");
            dojo.addClass(this.tabContentDetails, "display-none");
            this._dialog.show();
            var self = this;
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                var salesOrderId = row['$key'];
                this.dataStore = new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    resourceKind: 'salesOrders',
                    getResourcePredicate: function () {
                        return dojo.string.substitute("'${0}'", [salesOrderId]);
                    },
                    getAppId: function () {
                        return self.operatingCompanyId;
                    },
                    include: [],
                    select: ['*,salesOrderLines/*,postalAddresses/*,buyerContact/fullName,pricelist/name,quotation/reference,salesOrderLines/commodity/name,salesOrderLines/unitOfMeasure/name,salesOrderLines/fulfillmentLocation/name,salesOrderLines/pricelist/name,salesOrderLines/commodityVariant/reference,salesOrderLines/commodityDimension/reference,salesOrderDeliveries/carrierTradingAccount/name']
                });
                dojo.connect(this.dataStore, 'onGetSingleResource', this, 'buildGrids');
                this.dataStore.getSingleResource();
            }
        },
        callX3DetailsView: function () {
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                var salesOrderId = row['$key'];
                dojo.xhrGet({
                    url: dojo.string.substitute("slxdata.ashx/slx/crm/-/X3SalesOrder/getediterpsalesorderurl?salesOrderKey=${0}&operatingCompany=${1}&_dc=${2}",
                        [salesOrderId, this.operatingCompanyId, new Date().getTime()]),
                    cache: false,
                    preventCache: true,
                    handleAs: 'json',
                    load: lang.hitch(this, function (data, xhr) {
                        this.launchAccountingSystemView(data);
                    }),
                    error: function (request, status, error) {
                        dojo.byId([self.id, "-Loading-container"].join('')).innerHTML = i18nStrings.Error_InvalidEndpoint;
                    }
                });
            }
        },
        loadSalesOrderDetails: function (data) {
            if (data && typeof data !== 'undefined') {
                this._dialog.set('value', data);
            }
        },
        buildGrids: function (data) {
            this.loadSalesOrderDetails(data);
            this.loadAddresses(data);
            this.loadLineItems(data);
            if (this.salesOrderContainer != null) {
                this.salesOrderContainer.selectChild(this.salesOrderContent);
            }
            dojo.addClass(this.loadingContainer, "display-none");
            dojo.removeClass(this.salesOrderDetails, "display-none");
            dojo.removeClass(this.tabContentDetails, "display-none");
            this._dialog.resize();
        },
        hideDetailsDialog: function () {
            /* Destroy the grids that are loaded dynamically, so that the 
            data for one entity is not initially displayed for another entity. */
            this.destroyFirst('sdgrdSalesPersons');
            this.salesPersonsDataStore = null;
            this.destroyFirst('sdgrdSODeliveries');
            this.deliveriesDataStore = null;
            this.destroyFirst('sdgrdSOPayments');
            this.paymentsDataStore = null;
            this._dialog.hide();
        },
        destroy: function (sender, args) {
        },
        launchAccountingSystemView: function (data) {
            if (data.error != null) {
                Dialogs.showError(data.error);
            }
            else {
                try {
                    window.open(data.url);
                } catch (err) {
                    Dialogs.showError(this.errorERPRequest);
                    console.error(dojo.string.substitute(this.errorERPRequestDetails, [this.errorERPRequest, err, url]));
                }
            }
        },
        executeErpInsertView: function () {
            dojo.xhrGet({
                url: dojo.string.substitute("slxdata.ashx/slx/crm/-/X3SalesOrder/getinserterpsalesorderurl?accountId=${0}&operatingCompany=${1}&_dc=${2}",
                        [Sage.Utility.getCurrentEntityId(), this.operatingCompanyId, new Date().getTime()]),
                cache: false,
                preventCache: true,
                handleAs: 'json',
                load: lang.hitch(this, function (data, xhr) {
                    this.launchAccountingSystemView(data);
                }),
                error: function (request, status, error) {
                    dojo.byId([self.id, "-Loading-container"].join('')).innerHTML = i18nStrings.errorERPRequest;
                }
            });
        }
    });
    return salesOrderRTDV;
});