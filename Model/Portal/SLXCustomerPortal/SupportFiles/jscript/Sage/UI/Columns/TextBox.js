/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Controls/TextBox',
    'Sage/UI/Columns/Cell',
    'dojo/_base/declare'
],
function (TextBox, Cell, declare) {
    var widget = declare('Sage.UI.Columns.TextBox', Cell, {
        defaultValue: '',
        widgetClass: TextBox,
        getWidgetProps: function (inDatum) {
            // Create a uniqueId for this widget.  Native dojox grid widgets are reused on every cell.
            // Sage EditableGrid cannot function this way.
            var controlId = this._getControlId();
            this.defaultValue = inDatum;
            //Set the options for the currency config object
            return dojo.mixin({}, this.widgetProps || {}, {
                value: '',
                maxLength: this.maxLength,
                regExp: this.regExp,
                shouldPublishMarkDirty: false
            })
        },
        getValue: function (index) {
            //  summary:
            //  Retreives the value from the widget and applies it to the grid.
            //  If there is a validation error in the cell, return the old value, else return the new value.
            var retVal = this.widget.focusNode.value;
            var textBox = dijit.byId(this.widget.focusNode.id);
            if (!textBox.isValid()
                    || (typeof retVal === 'undefined')
                    || (retVal === '')) {
                textBox.undo();
                retVal = this.defaultValue;
            }
            else {
                defaultValue = retVal;
            }
            return retVal;
        }
    });

    return widget;
});