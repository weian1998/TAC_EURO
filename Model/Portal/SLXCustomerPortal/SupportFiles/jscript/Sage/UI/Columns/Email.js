/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Controls/Email',
    'Sage/UI/Columns/Cell',
    'dojo/_base/declare'
],
function (Email, Cell, declare) {
    var widget = declare('Sage.UI.Columns.Email', Cell, {
        icon: '',
        defaultValue: '',
        widgetClass: Email,
        getWidgetProps: function (inDatum) {
            // Create a uniqueId for this widget.  Native dojox grid widgets are reused on every cell.
            // Sage EditableGrid cannot function this way.
            var controlId = this._getControlId();
            //Set the options for the currency config object
            return dojo.mixin({}, this.widgetProps || {}, {
                emailId: controlId,
                email: inDatum,
                width: this.width,
                maxLength: this.maxLength,
                style: this.style,
                hotKey: this.hotKey,
                tabIndex: this.tabIndex,
                field: this.field
            });
        },
        getValue: function (index) {
            //  summary:
            //  Retreives the value from the widget and applies it to the grid.
            //  If there is a validation error in the cell, return the old value, else return the new value.
            var retVal = this.widget.focusNode.value;
            if ((typeof retVal === 'undefined') || (retVal === '')) {
                retVal = this.defaultValue;
            }
            if (this.widget && this.widget.focusNode.state === "Error") {
                return this.widget.focusNode._resetValue;
            }
            return retVal;
        },
        formatter: function (val, index) {
            if (!val) return '';
            var dispstr = val; ;
            if (this.icon && this.icon !== '') {
                dispstr = (this.icon === true || this.icon === 'true')
                    ? '<img src="images/icons/Send_Write_email_16x16.png" />'
                    : '<img src="' + this.icon + '" />';
            }
            return dojo.string.substitute('<a href="mailto:${0}">${1}</a>', [val, dispstr]);
        },
        markupFactory: function (node, cell) {
            dojox.grid.cells.Cell.markupFactory(node, cell);
            if (dojo.hasAttr(node, 'icon')) {
                cell['icon'] = dojo.trim(dojo.attr(node, 'icon') || '');
            }
        }
    });

    return widget;
});