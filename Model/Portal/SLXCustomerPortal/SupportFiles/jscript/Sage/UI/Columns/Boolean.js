/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojox/grid/cells/_base',
    'dojo/i18n',
    'Sage/Utility',
    'dojo/i18n!../nls/Boolean',
    'dojo/_base/declare'
],
function (_base, i18n, Utility, nlsResource, declare) {
    var widget = declare('Sage.UI.Columns.Boolean', _base, {
        constructor: function () {
            var resource = i18n.getLocalization('Sage.UI', 'Boolean');
            dojo.mixin(this, resource);
            this.inherited(arguments);
        },
        formatter: function (val, index) {
            var truthy = {
                'T': true,
                't': true,
                'Y': true,
                'y': true,
                '1': true,
                '+': true
            };
            if (!this.formatString) return (val in truthy) ? this.yesText :
			this.noText;
            var arrVals = this.formatString.split('/');
            if (arrVals.length && arrVals.length === 2) {
                var strVal = (val in truthy) ? arrVals[0] : arrVals[1];
                if (!strVal) {
                    return (val in truthy) ? this.yesText : this.noText;
                } else { return Utility.htmlEncode(strVal); }
            }
            return (val in truthy) ? this.yesText : this.noText;
        }
    });

    return widget;
});