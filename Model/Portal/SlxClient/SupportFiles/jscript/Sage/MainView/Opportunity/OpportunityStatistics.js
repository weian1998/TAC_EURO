/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/i18n!./nls/OpportunityStatistics',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',
        'dijit/Dialog',
        'dijit/_Widget',
        'Sage/_Templated',
        'Sage/UI/Dialogs',
        'Sage/UI/Controls/Currency',
        'Sage/UI/Controls/Numeric',
        'Sage/Data/SDataServiceRegistry',
        'dojo/date/locale',
        'Sage/Utility',
        'dojo/text!./templates/OpportunityStatistics.html',
        'dojo/html',
        'dijit/form/Form',
        'dijit/form/Select',
        'dijit/form/Textarea',
        'dijit/layout/ContentPane',
        'dojox/layout/TableContainer'
],
function (declare, i18nStrings, _DialogHelpIconMixin, dojoLang, dijitDialog, _Widget, _Templated, Dialogs, Currency, Numeric, sDataServiceRegistry, locale, utility, template, html) {
    var opportunityStatistics = declare('Sage.MainView.Opportunity.OpportunityStatistics', [_Widget, _Templated], {
        _dialog: false,
        _selectionInfo: false,
        selectedCount: 0,
        resource: '',
        currencyDecimalDigits: 2,
        currencyCode: 'USD',
        locale: Sys.CultureInfo.CurrentCulture.name,
        isMultiCurrencyEnabled: false,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function (selectionInfo) {
            this._selectionInfo = selectionInfo;
            this.currencyDecimalDigits = Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalDigits;
            this.isMultiCurrencyEnabled = isMultiCurrencyEnabled();
            dojo.mixin(this, i18nStrings);
        },
        show: function () {
            this._dialog.show();
            if (!this._dialog.helpIcon) {
                dojoLang.mixin(this._dialog, new _DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic('opportunitystatistics');
            }
            var service = sDataServiceRegistry.getSDataService('mashups');
            var request = new Sage.SData.Client.SDataNamedQueryRequest(service);
            request.setApplicationName('$app');
            request.setResourceKind('mashups');
            request.uri.setCollectionPredicate("'OpportunityStatistics'");
            request.setQueryName('execute');
            request.setQueryArg('_resultName', 'OpportunityStatisticsMashup');
            request.setQueryArg('_selectionKey', this._selectionInfo.key);
            var self = this;
            request.read({
                success: function (data) {
                    self.resource = data.$resources[0];
                    self.selectedCount = self.resource.RecordCount;
                    self.currencyCode = self.resource.CurrencyCode;
                    html.set(self.opportunityCount,self.selectedCount);
                    self.createControls();
                    var average = self.resource.DaysOpened;
                    if (self.selectedCount > 1) {
                        average = Math.round(self.resource.DaysOpened / self.selectedCount);
                    }
                    html.set(self.daysOpen_Container, average.toString());
                    dojo.addClass(self.loadingContainer, "display-none");
                    dojo.removeClass(self.statisticsContentsContainer, "display-none");
                },
                failure: function (request, status, error) {
                    Dialogs.showError(self.errorRequestingStatistics);
                }
            });
        },
        formatCurrency: function(val)
        {
            val = val.replace(" ", "", "gi");
            val = val.replace(Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator, ".", "gi");
            return val;
        },
        createControls: function () {
            this.createSalesPotential();
            this.createCloseProbability();
            this.createWeightedPotential();
            this.createActualAmount();
            this.createRangeEstClose();
        },
        createSalesPotential: function () {
            this.salesPotentialTotal = new Currency({
                id: 'cur_SalesPotentialTotal',
                constraints: { places: this.currencyDecimalDigits, currency: this.currencyCode, locale: this.locale },
                exchangeRateType: 'BaseRate',
                multiCurrency: this.isMultiCurrencyEnabled,
                disabled: true,
                'class': 'textcontrol currency',
                value: this.formatCurrency(this.resource.SalesPotential)
            });
            //}, this.salesPotentialTotal_Container);
            dojo.place(this.salesPotentialTotal.domNode, this.salesPotentialTotal_Container, 'replace');

            this.salesPotentialAverage = new Currency({
                id: 'cur_SalesPotentialAverage',
                constraints: { places: this.currencyDecimalDigits, currency: this.currencyCode, locale: this.locale },
                exchangeRateType: 'BaseRate',
                multiCurrency: this.isMultiCurrencyEnabled,
                disabled: true,
                'class': 'textcontrol currency',
                value: this.formatCurrency(this.resource.SalesPotential) / this.selectedCount
            });
            dojo.place(this.salesPotentialAverage.domNode, this.salesPotentialAverage_Container, 'replace');
        },
        createCloseProbability: function () {
            this.closeProbability = new Numeric({
                id: 'num_CloseProbability',
                constraints: { places: 2 }, //maxPlaces: 2, type: 'percent', round: -1
                formatType: 'percent',
                disabled: true,
                value: this.resource.CloseProbability / this.selectedCount
            });
            dojo.place(this.closeProbability.domNode, this.closeProbability_Container.domNode, 'only');
            this.closeProbability_Container.value = this.resource.CloseProbability / this.selectedCount;

        },
        createWeightedPotential: function () {
            this.weightedPotentialTotal = new Currency({
                id: 'cur_WeightedPotentialTotal',
                constraints: { places: this.currencyDecimalDigits, currency: this.currencyCode, locale: this.locale },
                exchangeRateType: 'BaseRate',
                multiCurrency: this.isMultiCurrencyEnabled,
                disabled: true,
                'class': 'textcontrol currency',
                value: this.resource.CloseProbability
            });
            dojo.place(this.weightedPotentialTotal.domNode, this.weightedPotentialTotal_Container, 'only');

            this.weightedPotentialAverage = new Currency({
                id: 'cur_WeightedPotentialAverage',
                constraints: { places: this.currencyDecimalDigits, currency: this.currencyCode, locale: this.locale },
                exchangeRateType: 'BaseRate',
                multiCurrency: this.isMultiCurrencyEnabled,
                disabled: true,
                'class': 'textcontrol currency',
                value: this.resource.CloseProbability / this.selectedCount
            });
            dojo.place(this.weightedPotentialAverage.domNode, this.weightedPotentialAverage_Container, 'only');
        },
        createActualAmount: function () {
            this.actualAmountTotal = new Currency({
                id: 'cur_ActualAmount',
                constraints: { places: this.currencyDecimalDigits, currency: this.currencyCode, locale: this.locale },
                exchangeRateType: 'BaseRate',
                multiCurrency: this.isMultiCurrencyEnabled,
                disabled: true,
                'class': 'textcontrol currency',
                value: this.formatCurrency(this.resource.ActualAmount)
            });
            dojo.place(this.actualAmountTotal.domNode, this.actualAmountTotal_Container, 'only');

            this.actualAmountAverage = new Currency({
                id: 'cur_ActualAmountAverage',
                constraints: { places: this.currencyDecimalDigits, currency: this.currencyCode, locale: this.locale },
                exchangeRateType: 'BaseRate',
                multiCurrency: this.isMultiCurrencyEnabled,
                disabled: true,
                'class': 'textcontrol currency',
                value: this.formatCurrency(this.resource.ActualAmount) / this.selectedCount
            });
            dojo.place(this.actualAmountAverage.domNode, this.actualAmountAverage_Container, 'only');
        },
        createRangeEstClose: function () {
            var minDate = locale.format(utility.Convert.toDateFromString(this.resource.MinDateEstClosed, true), { fullYear: true, selector: 'date' });
            var maxDate = locale.format(utility.Convert.toDateFromString(this.resource.MaxDateEstClosed, true), { fullYear: true, selector: 'date' });
            html.set(this.rangeEstClose_Container, dojo.string.substitute('${0} - ${1}', [minDate, maxDate]));
        },
        _close: function () {
            this._dialog.hide();
            this._dialog.destroyRecursive();
            this.destroyRecursive();
            this.salesPotentialTotal.destroy();
            this.salesPotentialAverage.destroy();
            this.closeProbability.destroy();
            this.weightedPotentialTotal.destroy();
            this.weightedPotentialAverage.destroy();
            this.actualAmountTotal.destroy();
            this.actualAmountAverage.destroy();
        }
    });
    return opportunityStatistics;
});