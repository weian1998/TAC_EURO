/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'dojo/_base/declare'
],
function (_Widget, declare) {
    var detailPane = declare('Sage.UI._DetailPane', [_Widget], {
        constructor: function () {
        },
        _applyConfiguration: function (configuration) {
            this._configuration = configuration;
        },
        _setConfigurationAttr: function (configuration) {
            this._applyConfiguration(configuration);
        },
        _setOwnerAttr: function (owner) {
            if (this._owner === owner) return;
            if (this._owner) throw new Error('Sage.UI._DetailPane can only be bound to a single Sage.UI.ListPanel.');
            this._owner = owner;
            this.connect(this._owner, 'onRowClick', this._onRowClick);
            this.connect(this._owner, 'onSelected', this._onSelected);
        },
        _getOwnerAttr: function() {
            return this._owner;
        },
        _onRowClick: function (index, row, grid) {
        },
        _onSelected: function (index, row, grid) {
        }
    });
    
    return detailPane;
});
