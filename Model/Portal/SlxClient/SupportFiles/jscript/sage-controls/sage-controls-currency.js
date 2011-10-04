if (typeof dojo !== 'undefined') {
    dojo.require("Sage.Utility");
    //dojo.require("dojo.currency");
}

Currency = function (currCode, cntrID, decimalSeparator, groupSeparator, symbol, groupDigits, decimalDigits, clearRegex, currVal, autoPostBack, warning, positivePattern, negativePattern, negativeSign) {
    this.cntrID = cntrID;
    this.DecimalSeparator = decimalSeparator;
    this.GroupSeparator = groupSeparator;
    this.GroupDigits = groupDigits;
    this.DecimalDigits = decimalDigits;
    this.Symbol = symbol;
    this.Code = currCode;
    this.ClearRegex = clearRegex;
    this.AutoPostBack = autoPostBack;
    this.CurrVal = currVal;
    this.WarningMsg = warning;
    this.PositivePattern = positivePattern;
    this.NegativePattern = negativePattern;
    this.NegativeSign = negativeSign;
    this.justChanged = false;
}

function Currency_calculateCurrency(val) {
    result = val * 1;
    var elem = document.getElementById(this.cntrID);
    elem.value = result;
}

function Currency_FormatCurrency() {
    var currency = document.getElementById(this.cntrID);
    var val;
    var isText = false;
    if (this.cntrID.indexOf("_Text") > 0) {
        isText = true;
        val = currency.innerText;
    } else {
        val = currency.value;
    }

    if (val != "") {
        this.CurrVal = this.FormatLocalizedCurrency(val);
        if (isText) {
            currency.innerText = this.CurrVal;
        } else {
            currency.value = this.CurrVal;
        }
    }
}

function Currency_FormatLocalizedCurrency(valNum) {
    var val = valNum.toString();
    var negativeCheck = new RegExp(String.format("[\{0}\(\)]", this.NegativeSign));
    var isNegative = negativeCheck.test(val);

    var reg = new RegExp(this.ClearRegex, "g");
    val = val.replace(reg, "");
    if (this.DecimalSeparator != ".") {
        if (val.indexOf(".") >= 0) {
            alert(val + " " + this.WarningMsg);
            //if (!isText) { currency.value = this.CurrVal; }
            return this.CurrVal;
        }
    }
    //always force decimal places in currency control...
    val = Sage.SalesLogix.Controls.maximizeDecimalDigit(val, this.DecimalDigits, Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator);
    var result = Sage.SalesLogix.Controls.formatNumber(val, 'currency', this.DecimalDigits, this.WarningMsg);
    /*
    var parts = val.split(this.DecimalSeparator);
    for (i = 0; i < parts.length; i++) {
        if (isNaN(parts[i])) {
            alert(parts[i] + " " + this.WarningMsg);
            //if (!isText) { currency.value = this.CurrVal; }
            return this.CurrVal;
        }
    }

    var result = "";
    if (val != "") {
        var pos = val.indexOf(this.DecimalSeparator) == -1 ? val.length : val.indexOf(this.DecimalSeparator);
        result = this.DecimalSeparator;
        for (var i = 1; i <= this.DecimalDigits; i++) {
            if (pos + i >= val.length) {
                result += "0";
            } else {
                result += val.substr(pos + i, 1);
            }
        }
        while (pos - this.GroupDigits > 0) {
            result = this.GroupSeparator + val.substr(pos - this.GroupDigits, this.GroupDigits) + result;
            pos = pos - this.GroupDigits;
        }
        if (pos > 0) {
            result = val.substr(0, pos) + result;
        }
    }
    */

    if (result && result != "") {
        if (this.Code == this.Symbol) { //multi-currency
            this.NegativePattern = 8;
            this.PositivePattern = 3;
        }

        var currencyValue = "";
        if (isNegative) {
            switch (this.NegativePattern) {
                case 0: // ($n) 
                    currencyValue = String.format("({0}{1})", this.Symbol, result);
                    break;
                case 1: // -$n
                    currencyValue = String.format("{0}{1}{2}", this.NegativeSign, this.Symbol, result);
                    break;
                case 2: // $-n
                    currencyValue = String.format("{0}{1}{2}", this.Symbol, this.NegativeSign, result);
                    break;
                case 3: // $n-
                    currencyValue = String.format("{0}{1}{3}", this.Symbol, result, this.NegativeSign);
                    break;
                case 4: // (n$) 
                    currencyValue = String.format("({0}{1})", result, this.Symbol);
                    break;
                case 5: // -n$
                    currencyValue = String.format("{0}{1}{2}", this.NegativeSign, result, this.Symbol);
                    break;
                case 6: // n-$ 
                    currencyValue = String.format("{0}{1}{2}", result, this.NegativeSign, this.Symbol);
                    break;
                case 7: // n$- 
                    currencyValue = String.format("{0}{1}{3}", result, this.Symbol, this.NegativeSign);
                    break;
                case 8: // -n $
                    currencyValue = String.format("{0}{1} {2}", this.NegativeSign, result, this.Symbol);
                    break;
                case 9: // -$ n
                    currencyValue = String.format("{0}{1} {2}", this.NegativeSign, this.Symbol, result);
                    break;
                case 10: // n $-
                    currencyValue = String.format("{0} {1}{2}", result, this.Symbol, this.NegativeSign);
                    break;
                case 11: // $ n-
                    currencyValue = String.format("{0} {1}{2}", this.Symbol, result, this.NegativeSign);
                    break;
                case 12: // $ -n
                    currencyValue = String.format("{0} {1}{2}", this.Symbol, this.NegativeSign, result);
                    break;
                case 13: // n- $
                    currencyValue = String.format("{0}{1} {2}", result, this.NegativeSign, this.Symbol);
                    break;
                case 14: // ($ n)
                    currencyValue = String.format("({0} {1})", this.Symbol, result);
                    break;
                case 15: //  (n $)
                    currencyValue = String.format("({0} {1})", result, this.Symbol);
                    break;

            }
        } else {
            switch (this.PositivePattern) {
                case 0: // $n
                    currencyValue = String.format("{0}{1}", this.Symbol, result);
                    break;
                case 1: // n$
                    currencyValue = String.format("{0}{1}", result, this.Symbol);
                    break;
                case 2: // $ n
                    currencyValue = String.format("{0} {1}", this.Symbol, result);
                    break;
                case 3: // n $
                    currencyValue = String.format("{0} {1}", result, this.Symbol);
                    break;
            }
        }

        return currencyValue;
    }
    return this.CurrVal;
}

Currency.prototype.restrictDecimalDigitInput = function (e) {
    //    var control = (typeof dojo !== 'undefined') ? dojo.byId(this.cntrID) : document.getElementById(this.cntrID);
    //    control.value = Sage.Utility.restrictDecimalDigit(control.value, this.DecimalDigits);
    var control = document.getElementById(this.cntrID);
    var newVal = Sage.SalesLogix.Controls.restrictDecimalDigit(control.value, this.DecimalDigits, Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator);
    if (control.value != newVal)
        control.value = newVal;
}

Currency.prototype.restrictToCurrencyInput = function (e) {
    if (!Sage.Utility) {
        return true;
    }
    if (!Sage.Utility.restrictToNumberOnKeyPress(e, 'currency')) {
        if (e.cancelBubble) {
            e.cancelBubble = true;
        }
        else if (e.stopPropogation) {
            e.stopPropogation();
        }
        return false;
    }
    return true;
}

Currency.prototype.changed = function (e) {
    this.justChanged = true;
}

Currency.prototype.isValid = function () {
    this.FormatCurrency();
    if (this.justChanged && this.AutoPostBack) {
        this.justChanged = false;
        if (Sys) {
            Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.cntrID, null);
        } else {
            document.forms(0).submit();
        }
    }
    this.justChanged = false;
}

Currency.prototype.CalculateCurrency = Currency_calculateCurrency;
Currency.prototype.FormatCurrency = Currency_FormatCurrency;
Currency.prototype.FormatLocalizedCurrency = Currency_FormatLocalizedCurrency;
