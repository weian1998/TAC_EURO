if (typeof dojo !== 'undefined') {
    dojo.require("Sage.Utility");
    dojo.require("dojo.number");
}
Sage.namespace("UI");

if (!Sage.UI.Numeric) {
    Sage.UI.Numeric = function (controlId, decimalDigits, clearRegex, format, autoPostBack, strict) {
        this.autoPostBack = autoPostBack;
        this.clearRegex = clearRegex;
        this.controlId = controlId;
        this.decimalDigits = decimalDigits;
        this.strict = strict;
        this.format = format;
        this.currValue = 0;
        this.formatNumber();
        this.justChanged = false;
    };
    Sage.UI.Numeric.prototype.getFormatType = function () {
        //var type = "decimal";
        var type = 'number';
        if (this.format === "P") {
            type = "percent";
        }
        else if (this.format === "E") {
            type = "scientific";
        }
        return type;
    };

    Sage.UI.Numeric.prototype.restrictDecimalDigitInput = function (e) {
        var control = dojo.byId(this.controlId);
        var digits = (this.decimalDigits >= 0) ? this.decimalDigits : Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalDigits;
        var newVal = Sage.SalesLogix.Controls.restrictDecimalDigit(control.value, digits, Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator);
        if (control.value != newVal)
            control.value = newVal;
    };

    Sage.UI.Numeric.prototype.restrictToNumericInput = function (e) {
        //keypress event handler
        if (!Sage.Utility) {
            return true;
        }
        if (!Sage.Utility.restrictToNumberOnKeyPress(e, 'number')) {
            if (e.cancelBubble) {
                e.cancelBubble = true;
            }
            else if (e.stopPropogation) {
                e.stopPropogation();
            }
            return false;
        }
        return true;
    };
    Sage.UI.Numeric.prototype.changed = function (e) {
        this.justChanged = true;
    }

    Sage.UI.Numeric.prototype.validate = function () {
        this.formatNumber();
        if (this.justChanged && this.autoPostBack) {
            this.justChanged = false;
            if (Sys) {
                Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.controlId, null);
            }
            else {
                document.forms(0).submit();
            }
        }
        this.justChanged = false;
    };
    Sage.UI.Numeric.prototype.formatNumber = function () {
        var control = dojo.byId(this.controlId);
        var value = control.value;
        if (value === '') {
            this.currValue = 0;
            control.value = 0;
            return;
        }
        if (this.decimalDigits > 0 && this.strict) {
            var value = Sage.SalesLogix.Controls.maximizeDecimalDigit(value, this.decimalDigits);
        }

        var formatted = value.replace(new RegExp(this.clearRegex, 'g'), '');
        var decDigits = (this.decimalDigits >= 0) ? this.decimalDigits : Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalDigits;
        formatted = Sage.SalesLogix.Controls.formatNumber(formatted, this.getFormatType(), decDigits, '');
        if (!formatted || formatted === '') {
            //revert if formatting fails.
            formatted = this.currValue;
        }
        control.value = formatted;
        this.currValue = formatted;
    };
}