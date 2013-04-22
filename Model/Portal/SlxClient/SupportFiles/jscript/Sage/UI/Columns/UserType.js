/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Utility',
    'dojo/i18n!../nls/UserType',
    'dojo/_base/declare'
],
function (Utility, resource, declare) {
    var widget = declare('Sage.UI.Columns.UserType', dojox.grid.cells._Base, {
        constructor: function(){
            dojo.mixin(this, resource);
            this.inherited(arguments);
        },
        formatter: function(val, index) {
            var userTypes = { 
                'W': this.administratorText,
                'P': this.templateText,
                'M': this.remoteText,
                'T': this.webOnlyText,
                'R': this.retiredText,
                'C': this.concurrentText,
                'V': this.webViewerText,
                'N': this.networkText,
                'A': this.addOnUserText
            };
            return (userTypes[val] ? Utility.htmlEncode(userTypes[val]) : val);
        }
    });
    return widget;
});
