/*globals dojo, define, Sage, dijit, Simplate, $ */
define([
    'dojo/_base/declare',
    'dojo/i18n!./nls/InvoiceRTDV',
    'dijit/_Widget',
    'Sage/_Templated',
    'Sage/UI/SLXPreviewGrid',
    'Sage/Data/ProxySDataStore',
    'Sage/UI/Dialogs',
    'Sage/UI/Columns/DateTime',
    'dojo/text!./templates/InvoiceRTDV.html',
    'Sage/UI/DateTextBox',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'dijit/Dialog',
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Dialog'
],

function (declare, i18nStrings, _Widget, _Templated, SLXPreviewGrid, ProxySDataStore, Dialogs, SlxDateTimeColumn, template) {
    var invoiceRTDV = declare('Sage.MainView.IntegrationContract.InvoiceRTDV', [_Widget, _Templated], {
        workspace: '',
        tabId: '',
        grid: '',
        globalSyncId: '',
        operatingCompanyId: '',
        dataStore: null,
        paymentsDataStore: null,
        deliveriesDataStore: null,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        loadSalesInvoices: function () {
            var self = this;
            var options = {
                readOnly: true,
                rowsPerPage: 20,
                slxContext: { workspace: this.workspace, tabId: this.tabId },
                columns: [
                    { width: 10, field: 'reference', name: this.grdInvoice_Name, defaultValue: '', sortable: true, formatter: this.invoiceDetailsViewRenderer, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'date', type: SlxDateTimeColumn, formatType: 'date', dateOnly: true, utc: false, name: this.grdInvoice_Date, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'customerReference', name: this.grdInvoice_PO, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'settlementDiscountTerms', name: this.grdInvoice_PaymentTerms, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'netTotal', name: this.grdInvoice_NetTotal, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'taxTotal', name: this.grdInvoice_Tax, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false },
                    { width: 10, field: 'grossTotal', name: this.grdInvoice_Amount, defaultValue: '', sortable: true, style: 'text-align:left;', editable: false }
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
                    pathSegments: [{ 'text': 'salesInvoices'}]
                }),
                tools: []
            };
            var salesInvoicesGrid = new SLXPreviewGrid.Grid(options, this.placeHolder);
            salesInvoicesGrid.startup();
            var tabContent = dijit.byId('tabContent');
            tabContent.resize(); tabContent.resize();
            this.grid = salesInvoicesGrid;
        },
        invoiceDetailsViewRenderer: function (value) {
            return dojo.string.substitute('<a href="javascript:invoiceRTDV.loadDetailsView();">${0}</a>', [value]);
        },
        destroyFirst: function (id) {
            var widget = dijit.byId(id);
            if (widget) {
                widget.destroyRecursive();
            }
        },
        loadAddresses: function (data) {
            this.destroyFirst('sdgrdInvoiceAddresses');
            if (data && typeof data.postalAddresses === 'undefined') {
                data.postalAddresses = {};
                data.postalAddresses.$resources = new Array();
            }
            var salesInvoiceAddresses = new dojox.grid.DataGrid({
                id: 'sdgrdInvoiceAddresses',
                store: this.dataStore,
                structure: [
                    { width: 10, field: 'type', name: this.grdAddress_Name, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'address1', name: this.grdAddress_address1, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'address2', name: this.grdAddress_address2, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'townCity', name: this.grdAddress_City, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'stateRegion', name: this.grdAddress_State, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'zipPostCode', name: this.grdAddress_Zip, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {},
                queryOptions: { singleResourceRequest: true, property: 'postalAddresses' }
            });
            dojo.place(salesInvoiceAddresses.domNode, this.sdgrdInvoiceAddresses_Grid, "single");
            salesInvoiceAddresses.startup();
        },
        loadLineItems: function (data) {
            this.destroyFirst('sdgrdInvoiceLines');
            if (data && typeof data.salesInvoiceLines === 'undefined') {
                data.salesInvoiceLines = {};
                data.salesInvoiceLines.$resources = new Array();
            }
            var salesInvoiceLines = new dojox.grid.DataGrid({
                id: 'sdgrdInvoiceLines',
                store: this.dataStore,
                structure: [
                    { width: 10, field: 'number', name: this.grdItems_Line, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'type', name: this.grdItems_Type, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'status', name: this.grdItems_Status, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'commodity.name', name: this.grdItems_Commodity, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'commodityVariant.reference', name: this.grdItems_CommodityVariant, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'commodityDimension.reference', name: this.grdItems_CommodityDimension, defaultValue: '', sortable: true, editable: false },
                    { width: 10, field: 'unitOfMeasure.name', name: this.grdItems_UnitOfMeasure, defaultValue: '', sortable: true, editable: false },
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
                queryOptions: { singleResourceRequest: true, property: 'salesInvoiceLines' }
            });
            dojo.place(salesInvoiceLines.domNode, this.sdgrdInvoiceLines_Grid, "only");
            salesInvoiceLines.startup();
        },
        initPayments: function () {
            if (this.paymentsDataStore) return;
            var self = this;
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                this.paymentsDataStore = new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    getResourcePredicate: function () {
                        var salesInvoiceId = row['$key'];
                        return dojo.string.substitute("'${0}'", [salesInvoiceId]);
                    },
                    resourceKind: 'salesInvoices',
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
            this.destroyFirst('sdgrdPayments');
            if (data && typeof data.receipts === 'undefined') {
                data.receipts = {};
                data.receipts.$resources = new Array();
            }
            var payments = new dojox.grid.DataGrid({
                id: 'sdgrdPayments',
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
            dojo.place(payments.domNode, this.sdgrdPayments_Grid, "only");
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
                    resourceKind: 'salesInvoices',
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
            this.destroyFirst('sdgrdDeliveries');
            if (data && typeof data.salesOrderDeliveries === 'undefined') {
                data.salesOrderDeliveries = {};
                data.salesOrderDeliveries.$resources = new Array();
            }
            var deliveries = new dojox.grid.DataGrid({
                id: 'sdgrdDeliveries',
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
                    { width: 10, field: 'dateExceptionReason', name: this.grdDeliveries_ExceptionReason, defaultValue: '', sortable: true, editable: false }
                ],
                rowsPerPage: 200,
                query: {}
            });
            dojo.place(deliveries.domNode, this.sdgrdDeliveries_Grid, "only");
            deliveries.startup();
        },
        loadDetailsView: function () {
            dojo.removeClass(this.loadingContainer, "display-none");
            dojo.addClass(this.invoiceDialogContent, "display-none");
            this._dialog.show();
            var self = this;
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                var salesInvoiceId = row['$key'];
                this.dataStore = new ProxySDataStore({
                    service: Sage.Data.SDataServiceRegistry.getSDataService('proxy', true, false),
                    resourceKind: 'salesInvoices',
                    getResourcePredicate: function () {
                        return dojo.string.substitute("'${0}'", [salesInvoiceId]);
                    },
                    getAppId: function () {
                        return self.operatingCompanyId;
                    },
                    include: [],
                    select: ['*,salesInvoiceLines/*,postalAddresses/*,buyerContact/fullName,pricelist/name,salesInvoiceLines/commodity/name,salesInvoiceLines/unitOfMeasure/name,salesInvoiceLines/commodityVariant/reference,salesInvoiceLines/commodityDimension/reference,salesOrderDeliveries/carrierTradingAccount/name'],
                    includeContent: true
                });
                dojo.connect(this.dataStore, 'onGetSingleResource', this, 'buildGrids');
                this.dataStore.getSingleResource();
            }
        },
        loadInvoiceDetails: function (data) {
            if (data && typeof data !== 'undefined') {
                this._dialog.set('value', data);
            }
        },
        buildGrids: function (data) {
            this.loadInvoiceDetails(data);
            this.loadAddresses(data);
            this.loadLineItems(data);
            if (this.invoiceTabContainer != null) {
                this.invoiceTabContainer.selectChild(this.invoiceContent);
            }
            dojo.addClass(this.loadingContainer, "display-none");
            dojo.removeClass(this.invoiceDialogContent, "display-none");
            this._dialog.resize();
        },
        hideDetailsDialog: function () {
            /* Destroy the grids that are loaded dynamically, so that the 
            data for one entity is not initially displayed for another entity. */
            this.destroyFirst('sdgrdDeliveries');
            this.deliveriesDataStore = null;
            this.destroyFirst('sdgrdPayments');
            this.paymentsDataStore = null;
            this._dialog.hide();
        }
    });
    return invoiceRTDV;
});