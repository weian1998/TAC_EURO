/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/NumberTextBox',
       'dijit/form/ValidationTextBox',
       'dojo/number',
       'Sage/Utility',
       'dojo/_base/declare'
],
function (NumberTextBox, ValidationTextBox, number, Utility, declare) {
    var widget = declare("Sage.UI.NumberTextBox", NumberTextBox, {
        shouldPublishMarkDirty: true,
        //.Net control behavior
        autoPostBack: false,
        hotKey: '',
        maxLength: '',
        formatType: '',
        attributeMap: {
            hotKey: { node: 'textbox', type: 'attribute', attribute: 'accessKey' },
            maxLength: { node: 'textbox', type: 'attribute', attribute: 'maxLength' }
        },
        textAlign: '',
        _getValueAttr: function () {            
           
            var results = this.inherited(arguments);        
           // the inherited stuff is too picky about decimal digits, we handle it our way,
           // when dojo doesn't like the number of digits, it returns undefined.
           //for Percent values, we need to keep the value without rounding off
           if ((typeof results === 'undefined' || isNaN(results) || this.formatType === 'Percent') && this.textbox.value !== '') {
               results = this.getTextBoxValue();            
           }    
         
           return results;
        },
        _setValueAttr: function (v) {
            this.constraints['locale'] = Sys.CultureInfo.CurrentCulture.name;
            this.inherited(arguments);
        },
        _onFocus: function () {
            this.onFocusFiring = true;
            this.inherited(arguments); // Dojo will format this as a decimal

            // HACK
            if (this.constraints.type === 'percent') {
                this.textbox.value = Math.round(this.value * 10000) / 100;
            }
            this.onFocusFiring = false;
        },
        _onBlur: function () {
            this.onBlurFiring = true;
            // HACK
            if (this.formatType === 'Percent' || this.constraints.type === 'percent') {
                // Strange issue if the control is focused on page load,
                // the textbox value should NOT contain a percent sign on blur
                if (this.textbox.value.indexOf('%') === -1) {
                    var enteredValue = this.getTextBoxValue();
                    var toDecimal = enteredValue / 100;
                    this.set('displayedValue', toDecimal); // trick dojo into thinking we entered a decimal
                }
            }
            this.onBlurFiring = false;
            this.inherited(arguments);
        },
        _sageUINumberTextBox_IsValid: function () {
            //In IE dojo makes two passes through validation.  Only on the second pass is the new value present.
            if (this.formatType !== 'Percent' || this.constraints.type !== 'percent') {
                if (dojo.isIE) {
                    if (this.oldValue !== this.textbox.value) {
                        var trim = this._restrictDD();
                        if (trim !== this.textbox.value) {
                            this.textbox.value = trim;
                        }
                    }
                    this.oldValue = this.textbox.value;
                } else {
                    this.textbox.value = this._restrictDD();
                }
            }
            this.inherited(arguments);
        },
        _restrictDD: function () {
            var retVal = this.textbox.value;
            if (this.onBlurFiring || this.onFocusFiring) {
                // Prevent this from running when onFocus or onBlur are firing (dojo makes changes to the text at that point).
                return retVal;
            }
            if (this.constraints.places) {
                retVal = Utility.restrictDecimalDigit(this.textbox.value, this.constraints.places);
            }
            return retVal;
        },
        _sageUINumberTextBox_KeyPress: function (e) {
            var type = this.constraints.type;
            if (!Utility.restrictToNumberOnKeyPress(e, type)) {
                dojo.stopEvent(e);
            }
        },
        _sageUINumberTextBox_OnFocus: function (/*Event*/e) {
            // Templated widgets are having difficulty remaining selectable in IE.  Reset their attribute to ensure access.
            dojo.setSelectable(this.domNode, true);
        },
        startup: function () {
            this.inherited(arguments);
            //summary:
            // Wire up event handlers and to add keystroke restrictions.
            var self = this;
            //Set the text alignment preference from the configuration object.
            dojo.style(self.focusNode, 'textAlign', self.textAlign);
            self.value = self.value || 0;
            self.onBlurFiring = false;
            self.onFocusFiring = false;
            //Event handlers
            this.connect(self, 'isValid', self._sageUINumberTextBox_IsValid);
            this.connect(self, 'onKeyPress', self._sageUINumberTextBox_KeyPress, true);
            this.connect(self, 'onFocus', self._sageUINumberTextBox_OnFocus, true);

            if (!this.ignorechange) {
                this.connect(self, 'onChange', self.valueChanged);
            }
        },
        valueChanged: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            if (this.autoPostBack) {
                if (Sys) {
                    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.id, null);
                }
            }
        },
        getTextBoxValue: function () {
            var results = 0;
            var tbVal = this.textbox.value;
            if (tbVal.lastIndexOf(Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator) === tbVal.length - 1) {
                tbVal = tbVal.slice(0, tbVal.length - 1);
            }

            results = tbVal;
            if (isNaN(results)) {
                results = number.parse(tbVal, { locale: Sys.CultureInfo.CurrentCulture.name });
            }
            if (isNaN(results)) {
                results = this.value;
            }
            return results;
        }
    });
    return widget;
});