/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojox/grid/cells',
        'dojox/grid/cells/dijit',
        'dojo/_base/declare'
],
function (cells, dijitCells, declare) {
    // TO-DO: cell._Widget is an internal base class we shouldn't be using,
    //        but lots of our cell types currently rely on it. Should be changed
    //        alongside all of our custom cell types
    var widget = declare('Sage.UI.Columns.Cell', cells._Widget, {
        // summary:
        // This class provides overrides of dojo's implementation of certain cell functions.
        formatNode: function (inNode, inDatum, inRowIndex) {
            //summary
            // This override ensures that a unique control gets created for each cell.  
            // Normal grid controls are created one for the entire column.
            if (!this.widgetClass) {
                return inDatum;
            }
            // Check to see if the instance for the selected node already exists
            var thisWidget = dijit.byId(this._getControlId());
            // If it doesn't, create one.
            if (!thisWidget) {
                this.widget = this.createWidget.apply(this, arguments);
                // If it does, use the existing one.
            } else {
                this.widget = thisWidget;
                //Check to see if the value has been changed outside of the control and update the control if it has.
                if (thisWidget.value !== inDatum || this.widget.focusNode.value !== inDatum) {
                    //This one is a widget in a templated.
                    if (this.widget.focusNode.set) this.widget.focusNode.set('value', inDatum);
                    //This one is not.
                    else this.widget.set('value', inDatum);
                }
                this.attachWidget.apply(this, arguments);
            }
            this.sizeWidget.apply(this, arguments);
            this.grid.views.renormalizeRow(inRowIndex);
            this.grid.scroller.rowHeightChanged(inRowIndex, true/*fix #11101*/);
            this.focus();
            return undefined;
        },
        setCurrentItems: function () {
            this.editInfo = this.grid.edit.info;
            this.item = this.grid.getItem(this.editInfo.rowIndex);
        },
        _getControlId: function () {
            //summary:
            //  Generates an Id for this instance of the numbertextbox widget from the item key and cell field name
            //  Example XXXXXXX_Price
            this.setCurrentItems();
            return [this.item.$key, this.editInfo.cell.field, this.index].join("_");
        }
    });

    return widget;
});