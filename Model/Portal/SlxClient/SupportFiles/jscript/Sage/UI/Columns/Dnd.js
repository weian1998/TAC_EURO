/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Columns/DndCell',
    'dojo/_base/declare'
],
function (DndCell, declare) {
    var widget = declare('Sage.UI.Columns.Dnd', dojox.grid.cells._Base, {
        formatter: function (val, index) {
            var item = this.grid.getItem(index);
            var results = item.displayName || item.columnName || this.defaultValue;
            var cell = new DndCell({ value: results, index: index });
            return cell;
        }
    });
    return widget;
});
