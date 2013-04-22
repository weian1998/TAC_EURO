/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/form/DateTextBox',
       'Sage/Utility',
       'dojo/_base/declare'
],
function (dateTextBox, util, declare) {
    var widget = declare('Sage.UI.DateTextBox', dateTextBox, {
        _getValueAttr: function () {
            var d = this.inherited(arguments);
            return (d) ? util.Convert.toJsonStringFromDate(d) : d;
        },
        _setValueAttr: function (/*Date*/value, /*Boolean?*/priorityChange, /*String?*/formattedValue) {
            if (Sage.Utility.Convert.isDateString(value)) {
                value = util.Convert.toDateFromString(value);
            }
            this.inherited(arguments, [value, priorityChange, formattedValue]);
        }
    });

    return widget;
});