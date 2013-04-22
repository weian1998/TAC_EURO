/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/CurrencyTextBox',
       'dojo/currency',
       'Sage/Utility',
       'dojo/_base/declare',
       'dojo/_base/lang'
],
function (currencyTextBox, currency, Utility, declare, lang) {
    var widget = declare("Sage.UI.Controls.CurrencyTextBox", [currencyTextBox], {
        shouldPublishMarkDirty: true,
        //.Net control behavior
        autoPostBack: false,
        hotKey: '',
        attributeMap: {
            hotKey: { node: 'textbox', type: 'attribute', attribute: 'accessKey' }
        },
        onBlur: function () {
            this.textbox.value = Utility.maximizeDecimalDigit(this.textbox.value, this.constraints.places);
        },
        _sageUICurrencyTextBox_IsValid: function () {
            if (this.constraints.places > -1) {
                var txtVal = Utility.restrictDecimalDigit(this.textbox.value, this.constraints.places);
                this.textbox.value = lang.trim(txtVal.replace(Sys.CultureInfo.CurrentCulture.numberFormat.CurrencySymbol, ""));
            }
            this.inherited(arguments);
        },
        postCreate: function () {
            this.connect(this, 'isValid', this._sageUICurrencyTextBox_IsValid);
            this.connect(this, 'onChange', this.onChanged);
            this.connect(this, 'onBlur', this.onBlur);
            this.inherited(arguments);
        },
        onChanged: function (e) {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            if (this.autoPostBack) {
                if (Sys) {
                    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.id, null);
                }
            }
        },
        setAttribute: function (attr, val) {
            /* Hide deprecated warnings, due to the parser and _WidgetBase assuming focusNode is a dom node and not a widget */
            this.set(attr, val);
        }
    });

    return widget;
});