dojo.provide('Sage.UI.DateTextBox');
dojo.require('dijit.form.DateTextBox');
dojo.require('Sage.Utility');

dojo.declare('Sage.UI.DateTextBox', dijit.form.DateTextBox, {
    _getValueAttr: function () {
        var d = this.inherited(arguments);
        return (d) ? Sage.Utility.Convert.toJsonStringFromDate(d) : d;
    },
    _setValueAttr: function (/*Date*/value, /*Boolean?*/priorityChange, /*String?*/formattedValue) {
        if (Sage.Utility.Convert.isDateString(value)) {
            value = Sage.Utility.Convert.toDateFromString(value)
        }
        this.inherited(arguments, [value, priorityChange, formattedValue]);
    }
});