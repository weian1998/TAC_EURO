/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Format',
    'Sage/UI/Controls/Phone',
    'Sage/UI/Columns/Cell',
    'dojo/_base/declare'
],
function (Format, Phone, Cell, declare) {
    var widget = declare('Sage.UI.Columns.Phone', Cell, {
        defaultValue: '',
        widgetClass: Phone,
        getWidgetProps: function (inDatum) {
            // Create a uniqueId for this widget.  Native dojox grid widgets are reused on every cell.
            // Sage EditableGrid cannot function this way.
            var controlId = this._getControlId();
            //Set the options for the currency config object
            return dojo.mixin({}, this.widgetProps || {}, {
                id: controlId,
                value: inDatum,
                width: this.width,
                maxLength: this.maxLength,
                style: this.style,
                hotKey: this.hotKey,
                tabIndex: this.tabIndex,
                field: this.field
            });
        },
        formatter: Format.phone,
        styles: 'text-align: left;',
        getValue: function (index) {
            //  summary:
            //  Retreives the value from the widget and applies it to the grid.
            //  If there is a validation error in the cell, return the old value, else return the new value.
            var retVal = this.widget.get('value');
            retVal = this.widget.unformatNumber(retVal);
            if ((typeof retVal === 'undefined') || (retVal === '')) {
                retVal = this.defaultValue;
            }
            if (this.widget && this.widget.focusNode.state === "Error") {
                return this.widget.focusNode._resetValue;
            }
            return retVal;
        }
    });

    return widget;
});