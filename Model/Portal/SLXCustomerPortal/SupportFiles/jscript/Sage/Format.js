dojo.provide('Sage.Format');

Sage.Format = {
	// summary:
	// this class contains common SalesLogix based formatters for formatting data in grids.
	
	integer: function(value, rowIdx, grid) {
	    if (!isNaN(value) && (value !== null)) {
	        return Math.round(value);
	    }
	    return '';
	},
	percent: function(value, rowIdx, grid) {
	    if (!isNaN(value) && (value !== null)) {
	        if ((value <= 1) && (value >= 0)) {
	            return Math.round(value * 100) + '%';
	        }
	        return Math.round(value) + '%';
	    }
	    return value || '';
	},
    currency: function (value, rowIdx, grid) {
        //TODO: Review and Refactor
        //return value;
        //debugger;
        var code = "";  //ToDo:  Figure out what the code is and if it belongs on Sage.Region.........................  <---<<<   <---<<<
        var negativePattern = 0;  //... this too
        var positivePattern = 0;  //... yeah and this too                            <---<<<   <---<<<   <---<<<
        var val = value;
        if (typeof value === 'number') {
            val = value.toString();
        }
        var negativeCheck = new RegExp(String.format("[\{0}\(\)]", Sage.Region.numberNegativeSign));
        var isNegative = negativeCheck.test(val);
        var clearExp = '"[\,\$\-\(\) ]"';  //TODO: replace the $ with the current currency symbol?  Sage.Region.currencySymbol
        var reg = new RegExp(clearExp, "g");        
        if (val === null || typeof val === 'undefined')
            return '';
        val = val.replace(reg, "");
        // ...................................... for the currency editor...
        //        if (Sage.Region.decimalSeparator != ".") {
        //            if (val.indexOf(".") >= 0) {
        //                //alert(val + " " + this.WarningMsg);
        //                if (!isText) { currency.value = this.CurrVal; }
        //                return;
        //            }
        //        }
        //        var parts = val.split(Sage.Region.decimalSeparator);
        //        for (i = 0; i < parts.length; i++) 
        //        {
        //            if (isNaN(parts[i])) 
        //            {
        //                alert(parts[i] + " " + this.WarningMsg);
        //                if (!isText) { currency.value = this.CurrVal; }
        //                return;
        //            }
        //        }

        var result = "";
        if (value !== "") {
            var pos = val.indexOf(Sage.Region.decimalSeparator) == -1 ? val.length : val.indexOf(Sage.Region.decimalSeparator);
            result = Sage.Region.decimalSeparator;
            for (var i = 1; i <= Sage.Region.decimalDigits; i++) {
                if (pos + i >= val.length) {
                    result += "0";
                } else {
                    result += val.substr(pos + i, 1);
                }
            }
            while (pos - Sage.Region.numberGroupDigits > 0) {
                result = Sage.Region.numberGroupSeparator + val.substr(pos - Sage.Region.numberGroupDigits, Sage.Region.numberGroupDigits) + result;
                pos = pos - Sage.Region.numberGroupDigits;
            }
            if (pos > 0) {
                result = val.substr(0, pos) + result;
            }
        }

        if (result !== "") {
            if (code === Sage.Region.currencySymbol) { //multi-currency
                this.NegativePattern = 8;
                this.PositivePattern = 3;
            }

            var currencyValue = "";
            if (isNegative) {
                switch (negativePattern) {
                    case 0: // ($n) 
                        currencyValue = String.format("({0}{1})", Sage.Region.currencySymbol, result);
                        break;
                    case 1: // -$n
                        currencyValue = String.format("{0}{1}{2}", Sage.Region.numberNegativeSign, Sage.Region.currencySymbol, result);
                        break;
                    case 2: // $-n
                        currencyValue = String.format("{0}{1}{2}", Sage.Region.currencySymbol, Sage.Region.numberNegativeSign, result);
                        break;
                    case 3: // $n-
                        currencyValue = String.format("{0}{1}{3}", Sage.Region.currencySymbol, result, Sage.Region.numberNegativeSign);
                        break;
                    case 4: // (n$) 
                        currencyValue = String.format("({0}{1})", result, Sage.Region.currencySymbol);
                        break;
                    case 5: // -n$
                        currencyValue = String.format("{0}{1}{2}", Sage.Region.numberNegativeSign, result, Sage.Region.currencySymbol);
                        break;
                    case 6: // n-$ 
                        currencyValue = String.format("{0}{1}{2}", result, Sage.Region.numberNegativeSign, Sage.Region.currencySymbol);
                        break;
                    case 7: // n$- 
                        currencyValue = String.format("{0}{1}{3}", result, Sage.Region.currencySymbol, Sage.Region.numberNegativeSign);
                        break;
                    case 8: // -n $
                        currencyValue = String.format("{0}{1} {2}", Sage.Region.numberNegativeSign, result, Sage.Region.currencySymbol);
                        break;
                    case 9: // -$ n
                        currencyValue = String.format("{0}{1} {2}", Sage.Region.numberNegativeSign, Sage.Region.currencySymbol, result);
                        break;
                    case 10: // n $-
                        currencyValue = String.format("{0} {1}{2}", result, Sage.Region.currencySymbol, Sage.Region.numberNegativeSign);
                        break;
                    case 11: // $ n-
                        currencyValue = String.format("{0} {1}{2}", Sage.Region.currencySymbol, result, Sage.Region.numberNegativeSign);
                        break;
                    case 12: // $ -n
                        currencyValue = String.format("{0} {1}{2}", Sage.Region.currencySymbol, Sage.Region.numberNegativeSign, result);
                        break;
                    case 13: // n- $
                        currencyValue = String.format("{0}{1} {2}", result, Sage.Region.numberNegativeSign, Sage.Region.currencySymbol);
                        break;
                    case 14: // ($ n)
                        currencyValue = String.format("({0} {1})", Sage.Region.currencySymbol, result);
                        break;
                    case 15: //  (n $)
                        currencyValue = String.format("({0} {1})", result, Sage.Region.currencySymbol);
                        break;
                }
            } else {
                switch (positivePattern) {
                    case 0: // $n
                        currencyValue = String.format("{0}{1}", Sage.Region.currencySymbol, result);
                        break;
                    case 1: // n$
                        currencyValue = String.format("{0}{1}", result, Sage.Region.currencySymbol);
                        break;
                    case 2: // $ n
                        currencyValue = String.format("{0} {1}", Sage.Region.currencySymbol, result);
                        break;
                    case 3: // n $
                        currencyValue = String.format("{0} {1}", result, Sage.Region.currencySymbol);
                        break;
                }
            }

            //            if (isText)
            //                currency.innerText = currencyValue;
            //            else
            //                currency.value = currencyValue;

            return currencyValue;
        }
        return '';
    },
    stringFromArray : function(formatString, arr) {
        switch(arr.length) {
            case 1:
                return String.format(formatString, arr[0]);
            case 2:
                return String.format(formatString, arr[0], arr[1]);
            case 3:
                return String.format(formatString, arr[0], arr[1], arr[2]);
            case 4:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3]);
            case 5:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4]);
            case 6:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5]);
            case 7:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6]);
            case 8:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7]);
            case 9:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8]);
            case 10:
                return String.format(formatString, arr[0], arr[1], arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8], arr[9]);
            default:
                return formatString;
              
        }    
    }  
}