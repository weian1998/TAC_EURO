/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojox/grid/cells/_base',
       'Sage/Utility',
       'Sage/Utility/Activity',
       'dojo/string',
       'dojo/_base/declare'
],
function (_base, util, activity, dString, declare) {
    var widget = declare("Sage.UI.Columns.ActivityType", _base, {
        keyField: false,
        format: function (inRowIndex, inItem) {
            var type = this.get(inRowIndex, inItem);
            if (!type) {
                return this.defaultValue;
            }
            var key = util.getValue(inItem, this.keyField || "$key");
            var fmt = '<div class="Global_Images icon16x16 ${0}"></div>&nbsp;<a href="javascript:Sage.Link.editActivity(\'${1}\')">${2}</a>';
            return dString.substitute(fmt, [activity.getActivityImageClass(type, 'small'), key, activity.getActivityTypeName(type)]);
        }
    });

    return widget;
});
