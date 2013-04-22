/*globals dojo, define, Sage, dijit, Simplate, $ */
define([
    'dojo/_base/declare',
    'dojo/i18n!./nls/CustomerPaymentsRTDV',
    'dijit/_Widget',
    'Sage/_Templated',
    'Sage/UI/SLXPreviewGrid',
    'Sage/Data/ProxySDataStore',
    'Sage/UI/Dialogs',
    'Sage/UI/Columns/DateTime',
    'dojo/text!./templates/CustomerPaymentsRTDV.html',
    'Sage/UI/DateTextBox',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'dijit/Dialog',
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Dialog'
],

function (declare, i18nStrings, _Widget, _Templated, SLXPreviewGrid, ProxySDataStore, Dialogs, SlxDateTimeColumn, template) {
    var customerPaymentsRTDV = declare('Sage.MainView.IntegrationContract.CustomerPaymentsRTDV', [_Widget, _Templated], {
        workspace: '',
        tabId: '',
        grid: '',
        globalSyncId: '',
        operatingCompanyId: '',
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        loadCustomerPayments: function () {
            var self = this;
            var options = {
                readOnly: true,
                rowsPerPage: 20,
                slxContext: { workspace: this.workspace, tabId: this.tabId },
                columns: [
                    { width: 10, field: 'reference', name: this.grdPayments_Reference, sortable: true, formatter: this.customerPaymentsDetailsViewRenderer, style: 'text-align:left;width:auto;', editable: false },
                    { width: 10, field: 'date', type: SlxDateTimeColumn, formatType: 'date', dateOnly: true, utc: false, name: this.grdPayments_Date, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                    { width: 10, field: 'type', name: this.grdPayments_Type, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                    { width: 10, field: 'status', name: this.grdPayments_Status, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                    { width: 10, field: 'grossTotal', name: this.grdPayments_GrossTotal, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                    { width: 10, field: 'currency', name: this.grdPayments_Currency, sortable: true, style: 'text-align:left;width:auto;', editable: false },
                    { width: 10, field: 'processDate', type: SlxDateTimeColumn, formatType: 'date', dateOnly: true, utc: false, editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'discountTotal', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'chargesTotal', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'source', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'taxTotal', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'name', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'tenderType', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'tenderReference', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'netTotal', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'grossTotal', editable: false, hidden: function () { return true; } },
                    { width: 10, field: 'taxCode', editable: false, hidden: function () { return true; } }
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
                    pathSegments: [{ 'text': 'receipts'}]
                }),
                tools: []
            };
            var paymentsGrid = new SLXPreviewGrid.Grid(options, this.placeHolder);
            paymentsGrid.startup();
            var tabContent = dijit.byId('tabContent');
            tabContent.resize(); tabContent.resize();
            this.grid = paymentsGrid;
        },
        customerPaymentsDetailsViewRenderer: function (value) {
            return dojo.string.substitute('<a href="javascript:customerPaymentsRTDV.loadDetailsView();">${0}</a>', [value]);
        },
        loadDetailsView: function () {
            var row = this.grid._grid.selection.getSelected()[0];
            if (row) {
                this._dialog.set('value', row);
                this._dialog.show();
            }
        },
        hideDetailsDialog: function () {
            this._dialog.hide();
        }
    });
    return customerPaymentsRTDV;
});