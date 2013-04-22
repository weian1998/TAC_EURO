/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/i18n',
    'dojo/i18n!../nls/OwnerType',
    'dojo/_base/declare'
],
function (i18n, nlsResource, declare) {
    var widget = declare('Sage.UI.Columns.OwnerType', dojox.grid.cells._Base, {
        constructor: function(){
            var resource = i18n.getLocalization('Sage.UI', 'OwnerType');
            dojo.mixin(this, resource);
            this.inherited(arguments);
        },
        formatter: function(val, index) {
            var ownerTypes = { 
                'G': this.teamText,
                'D': this.departmentText,
                'S': this.systemText,
                'U': this.userText
            };
            return ownerTypes[val] ? Sage.Utility.htmlEncode(ownerTypes[val]) : val;
        },
        styles: 'text-align: right;'
    });

return widget;
});