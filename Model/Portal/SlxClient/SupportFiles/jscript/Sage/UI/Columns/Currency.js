/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, sessionStorage */
define([
    'dojo/_base/declare',
    'dojo/json',
    'Sage/Data/SDataServiceRegistry',
    'Sage/Utility/_LocalStorageMixin',
    'Sage/Utility',
    'dojo/_base/lang',
    'dojox/grid/cells/dijit'
],
function (declare, json, SDataServiceRegistry, _localStorageMixin, utility, lang) {
    /*
    sample config object...
    {
    width: 15,
    field:  'Price',
    name: 'Base Price',
    sortable: true,
    styles: 'text-align:right;',
    editable: false,
    type: Sage.UI.Columns.Currency,
    exchangeRateType: 'BaseRate',
    displayCurrencyCode: true,
    exchangeRate: 1,    
    displayMode: 'AsControl',
    field: 'Price',
    displayField: 'Price',
    //When in a grid, currencyCodeFieldName is required in AA.    
    currentCode: utility.getClientContextByKey('ExchangeRateCode'),  //'USD'
    }
    */
    var widget = declare("Sage.UI.Columns.Currency", dojox.grid.cells._Widget, {
        widgetClass: Sage.UI.Controls.Currency,
        exchangeRateLoaded: false,
        constructor: function (o) {
            if (this.multiCurrency && !this.exchangeRateLoaded) {
                var systemOptions = Sage.Services.getService('SystemOptions');
                if (systemOptions) {
                    systemOptions.get('BaseCurrency',
                        function (val) {
                            this.exchangeRateLoaded = true;
                            this.currentCode = val;
                            var loader = Sage.Services.getService('ExchangeRateLoader');
                            if (loader) {
                                loader.requestExchangeRate(this.getExchangeRate, this);
                            }
                        },
                        function () {
                            if (typeof console !== 'undefined') {
                                console.error('Unable to determine SystemOptions.BaseCurrency.');
                            }
                        },
                        this
                    );
                } else {
                    if (typeof console !== 'undefined') {
                        console.error('Unable to load the SystemOptions service.');
                    }
                }
            }
        },
        getExchangeRate: function (data) {
            this.exchangeRate = data.Rate;
        },
        getWidgetProps: function (inDatum) {
            var controlId = this.getControlId();
            //Set the options for the currency config object
            return dojo.mixin({}, this.widgetProps || {}, {
                id: controlId,
                value: inDatum,
                width: this.width,
                maxLength: this.maxLength,
                style: this.style,
                hotKey: this.hotKey,
                tabIndex: this.tabIndex,
                field: this.field,
                constraints: this.constraints,
                //Using name for ClientId of .net controls.  
                //TODO: Validate that this does not conflict with the column type.
                name: this.name,
                sortable: this.sortable,
                editable: this.editable,
                required: this.required,
                //type: this.type,
                displayMode: this.displayMode,
                displayCurrencyCode: this.displayCurrencyCode,
                multiCurrency: this.multiCurrency,
                currentCode: this.currentCode,
                exchangeRate: this.exchangeRate,
                currentUICulture: this.currentUICulture,
                textAlign: this.getAlignment()
            });
        },
        getAlignment: function () {
            var retVal = 'right';
            retVal = (this.cellClasses.indexOf('aligncenter') > -1) ? 'center' : retVal;
            retVal = (this.cellClasses.indexOf('alignleft') > -1) ? 'left' : retVal;
            return retVal;
        },
        formatNode: function (inNode, inDatum, inRowIndex) {
            if (!this.widgetClass) {
                return inDatum;
            }

            if (this.multiCurrency) {
                inDatum = inDatum * this.exchangeRate;
            }

            // Check to see if the instance for the selected node already exists
            // This check ensures that a unique control gets created for each cell.  
            // Normal grid controls are created one for the entire column.
            var thisCurrency = dijit.byId(this.getControlId());
            // If it doesn't, create one.
            if (!thisCurrency) {
                this.widget = this.createWidget.apply(this, arguments);
                // If it does, use the existing one.
            } else {
                this.widget = thisCurrency;
                //Check to see if the value has been changed outside of the control and update the control if it has.
                if (thisCurrency.value !== inDatum || this.widget.focusNode.value !== inDatum) {
                    this.widget.focusNode.attr('value', inDatum);
                }
                this.attachWidget.apply(this, arguments);
            }
            this.sizeWidget.apply(this, arguments);
            this.grid.views.renormalizeRow(inRowIndex);
            this.grid.scroller.rowHeightChanged(inRowIndex, true/*fix #11101*/);
            this.focus();
            return undefined;
        },
        formatter: function (inItem, inRowIndex) {
            var currentItem = this.grid.getItem(inRowIndex);
            var retVal = '';
            this.decimalDigit = (this.constraints && this.constraints.places) ? this.constraints.places : Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalDigits;
            //Multi-Currency is NOT enabled
            if (!this.multiCurrency) {
                retVal = dojo.currency.format(inItem, { currency: [Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol], locale: Sys.CultureInfo.CurrentCulture.name, places: this.decimalDigit });
                retVal = retVal.replace(Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol, "");
            }
            //Multi-Currency is enabled
            else {
                //1. If the exchange rate is from the document, get it from the current record, else                
                //2. If we are in insert mode then there is no parent record to query for the rate and code.
                //Else: get it from the client context service.
                if (this.exchangeRateType == 'EntityRate' && utility.getModeId() !== 'insert') {
                    //Extract the Rate value from the object by walking the sdata relationship path.
                    var rateFieldPath = this.exchangeRateField.split('.');
                    var rateFieldValue = currentItem;
                    for (i = 0; i < rateFieldPath.length; i++) {
                        if (rateFieldValue) {
                            rateFieldValue = rateFieldValue[rateFieldPath[i]];
                        } else {
                            rateFieldValue = utility.getClientContextByKey(this.exchangeRateType);
                        }
                    }
                    //Extract the Rate Code value from the object by walking the sdata relationship path.
                    var rateCodeFieldPath = this.exchangeRateCodeField.split('.');
                    var rateCodeFieldValue = currentItem;
                    for (i = 0; i < rateCodeFieldPath.length; i++) {
                        if (rateCodeFieldValue) {
                            rateCodeFieldValue = rateCodeFieldValue[rateCodeFieldPath[i]];
                        } else {
                            rateCodeFieldValue = utility.getClientContextByKey([this.exchangeRateType, 'Code'].join(''));
                        }
                    }
                    this.exchangeRate = rateFieldValue;
                    this.currentCode = rateCodeFieldValue;
                } else if (this.exchangeRateType === 'MyRate') {
                    this.exchangeRate = utility.getClientContextByKey(this.exchangeRateType);
                    this.currentCode = utility.getClientContextByKey([this.exchangeRateType, 'Code'].join(''));
                }
                inItem = inItem * this.exchangeRate;
                retVal = dojo.currency.format(inItem, { currency: [], locale: Sys.CultureInfo.CurrentCulture.name, places: this.decimalDigit });
                retVal = [retVal, '   ', this.currentCode].join("");
            }
            if (this.abbreviationLength) {
                var abbreviationFormatter = Sage.Format.abbreviationFormatter(this.abbreviationLength);
                retVal = abbreviationFormatter(retVal);
            }
            return retVal;
        },
        styles: 'text-align: right;',
        // Get the items currently being edited and make it more available for use.
        setCurrentItems: function () {
            this.editInfo = this.grid.edit.info;
            this.item = this.grid.getItem(this.editInfo.rowIndex);
        },
        getControlId: function () {
            //summary:
            //  Generates an Id for this instance of the numbertextbox widget from the item key and cell field name
            //  Example XXXXXXX_Price
            this.setCurrentItems();
            return [this.item.$key, this.editInfo.cell.field, this.index].join("_");
        },
        getValue: function (index) {
            //  summary:
            //  Retreives the value from the widget and applies it to the grid.
            //  If there is a validation error in the cell, return the old value, else return the new value.
            //Widget in template creates a second level of focusNode.  Once clicked into the widget, the value exists
            // in the second level.
            var retVal = this.widget.focusNode.valueNode.value;
            if (this.multiCurrency) {
                retVal = retVal / this.exchangeRate;
            }
            if (this.widget.focusNode.state === "Error") {
                var item = this.grid.getItem(index);
                //If there is an error return the old value.
                retVal = this.grid.store.getValue(item, this.grid.edit.info.cell.field);
                this.widget.focusNode.focusNode.value = retVal;
            }
            else if (this.widget.focusNode.state === "Incomplete") {
                retVal = utility.maximizeDecimalDigit(this.widget.focusNode.get('displayedValue'), this.constraints.places);
                this.widget.focusNode.focusNode.value = retVal;
            }
            return retVal;
        }
    });

    var exchangeRateLoader = declare('Sage.UI.Columns.Currency.BaseExchangeRateLoader', _localStorageMixin, {
        _requests: [],
        _requestingData: false,
        _exchangeRate: false,
        _storageNamespace: 'BaseCurrencyExchangeRate',
        constructor: function () {
            this._requests = [];
            this._requestingData = false;
            this._exchangeRate = false;
        },
        requestExchangeRate: function (callback, scope) {
            if (!this._exchangeRate) {
                var data = sessionStorage.getItem(this._storageNamespace);
                if (data) {
                    this._exchangeRate = json.parse(data);
                } else {
                    this._requests.push({
                        fn: callback,
                        scope: scope || this
                    });
                    if (!this._requestingData) {
                        this._requestingData = true;
                        var request = new Sage.SData.Client.SDataSingleResourceRequest(SDataServiceRegistry.getSDataService('dynamic', false, true, true));
                        request.setResourceSelector(dojo.string.substitute("'${0}'", [scope.currentCode]));
                        request.setResourceKind('exchangeRates');
                        request.read({
                            success: lang.hitch(this, this._receiveData),
                            failure: function (response) {
                                console.warn('Error reading request');
                                console.log(response);
                                if (typeof onError === "function") {
                                    onError(response);
                                }
                            },
                            async: false
                        });
                    }
                    return;
                }
            }
            callback.call(scope || this, this._exchangeRate);
        },
        _receiveData: function (data) {
            sessionStorage.setItem(this._storageNamespace, json.stringify(data));
            this._exchangeRate = data;
            var len = this._requests.length;
            for (var i = 0; i < len; i++) {
                var clbk = this._requests.pop();
                clbk.fn.call(clbk.scope, data);
            }
        }
    });
    Sage.Services.addService('ExchangeRateLoader', new exchangeRateLoader());

    return widget;
});