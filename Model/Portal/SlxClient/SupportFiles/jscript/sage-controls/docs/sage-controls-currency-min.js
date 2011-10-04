/*
 * Sage SalesLogix Web Controls
 * Copyright(c) 2009, Sage Software.
 */


if(typeof dojo!=='undefined'){dojo.require("Sage.Utility");}
Currency=function(currCode,cntrID,decimalSeparator,groupSeparator,symbol,groupDigits,decimalDigits,clearRegex,currVal,autoPostBack,warning,positivePattern,negativePattern,negativeSign){this.cntrID=cntrID;this.DecimalSeparator=decimalSeparator;this.GroupSeparator=groupSeparator;this.GroupDigits=groupDigits;this.DecimalDigits=decimalDigits;this.Symbol=symbol;this.Code=currCode;this.ClearRegex=clearRegex;this.AutoPostBack=autoPostBack;this.CurrVal=currVal;this.WarningMsg=warning;this.PositivePattern=positivePattern;this.NegativePattern=negativePattern;this.NegativeSign=negativeSign;this.justChanged=false;}
function Currency_calculateCurrency(val){result=val*1;var elem=document.getElementById(this.cntrID);elem.value=result;}
function Currency_FormatCurrency(){var currency=document.getElementById(this.cntrID);var val;var isText=false;if(this.cntrID.indexOf("_Text")>0){isText=true;val=currency.innerText;}else{val=currency.value;}
if(val!=""){this.CurrVal=this.FormatLocalizedCurrency(val);if(isText){currency.innerText=this.CurrVal;}else{currency.value=this.CurrVal;}}}
function Currency_FormatLocalizedCurrency(valNum){var val=valNum.toString();var negativeCheck=new RegExp(String.format("[\{0}\(\)]",this.NegativeSign));var isNegative=negativeCheck.test(val);var reg=new RegExp(this.ClearRegex,"g");val=val.replace(reg,"");if(this.DecimalSeparator!="."){if(val.indexOf(".")>=0){alert(val+" "+this.WarningMsg);return this.CurrVal;}}
val=Sage.SalesLogix.Controls.maximizeDecimalDigit(val,this.DecimalDigits,Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator);var result=Sage.SalesLogix.Controls.formatNumber(val,'currency',this.DecimalDigits,this.WarningMsg);if(result&&result!=""){if(this.Code==this.Symbol){this.NegativePattern=8;this.PositivePattern=3;}
var currencyValue="";if(isNegative){switch(this.NegativePattern){case 0:currencyValue=String.format("({0}{1})",this.Symbol,result);break;case 1:currencyValue=String.format("{0}{1}{2}",this.NegativeSign,this.Symbol,result);break;case 2:currencyValue=String.format("{0}{1}{2}",this.Symbol,this.NegativeSign,result);break;case 3:currencyValue=String.format("{0}{1}{3}",this.Symbol,result,this.NegativeSign);break;case 4:currencyValue=String.format("({0}{1})",result,this.Symbol);break;case 5:currencyValue=String.format("{0}{1}{2}",this.NegativeSign,result,this.Symbol);break;case 6:currencyValue=String.format("{0}{1}{2}",result,this.NegativeSign,this.Symbol);break;case 7:currencyValue=String.format("{0}{1}{3}",result,this.Symbol,this.NegativeSign);break;case 8:currencyValue=String.format("{0}{1} {2}",this.NegativeSign,result,this.Symbol);break;case 9:currencyValue=String.format("{0}{1} {2}",this.NegativeSign,this.Symbol,result);break;case 10:currencyValue=String.format("{0} {1}{2}",result,this.Symbol,this.NegativeSign);break;case 11:currencyValue=String.format("{0} {1}{2}",this.Symbol,result,this.NegativeSign);break;case 12:currencyValue=String.format("{0} {1}{2}",this.Symbol,this.NegativeSign,result);break;case 13:currencyValue=String.format("{0}{1} {2}",result,this.NegativeSign,this.Symbol);break;case 14:currencyValue=String.format("({0} {1})",this.Symbol,result);break;case 15:currencyValue=String.format("({0} {1})",result,this.Symbol);break;}}else{switch(this.PositivePattern){case 0:currencyValue=String.format("{0}{1}",this.Symbol,result);break;case 1:currencyValue=String.format("{0}{1}",result,this.Symbol);break;case 2:currencyValue=String.format("{0} {1}",this.Symbol,result);break;case 3:currencyValue=String.format("{0} {1}",result,this.Symbol);break;}}
return currencyValue;}
return this.CurrVal;}
Currency.prototype.restrictDecimalDigitInput=function(e){var control=document.getElementById(this.cntrID);var newVal=Sage.SalesLogix.Controls.restrictDecimalDigit(control.value,this.DecimalDigits,Sys.CultureInfo.CurrentCulture.numberFormat.CurrencyDecimalSeparator);if(control.value!=newVal)
control.value=newVal;}
Currency.prototype.restrictToCurrencyInput=function(e){if(!Sage.Utility){return true;}
if(!Sage.Utility.restrictToNumberOnKeyPress(e,'currency')){if(e.cancelBubble){e.cancelBubble=true;}
else if(e.stopPropogation){e.stopPropogation();}
return false;}
return true;}
Currency.prototype.changed=function(e){this.justChanged=true;}
Currency.prototype.isValid=function(){this.FormatCurrency();if(this.justChanged&&this.AutoPostBack){this.justChanged=false;if(Sys){Sys.WebForms.PageRequestManager.getInstance()._doPostBack(this.cntrID,null);}else{document.forms(0).submit();}}
this.justChanged=false;}
Currency.prototype.CalculateCurrency=Currency_calculateCurrency;Currency.prototype.FormatCurrency=Currency_FormatCurrency;Currency.prototype.FormatLocalizedCurrency=Currency_FormatLocalizedCurrency;