/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/form/FilteringSelect',
        'dojo/_base/declare'
], function(FilteringSelect, declare) {
    return declare('Sage.UI.FilteringSelect', FilteringSelect, {
        valueAttr: false,
        _getValueField: function(){
            // Overrides dijit.form.FilteringSelect._getValueField()
            return this.valueAttr || "value";
        }
    });
});