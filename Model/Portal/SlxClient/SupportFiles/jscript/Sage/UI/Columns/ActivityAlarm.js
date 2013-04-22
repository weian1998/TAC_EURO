/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojox/grid/cells/_base',
       'Sage/Utility',
       'dojo/_base/declare'
],
function (_base, util, declare) {
    var widget = declare("Sage.UI.Columns.ActivityAlarm", _base, {
        format: function (inRowIndex, inItem) {
            var alarm = util.getValue(inItem, "Alarm");
            var html = "<div><div>";
            if (alarm) {
                html = "<img src='images/icons/Alarm_16x16.gif'/>";
            }
            return html;
        }
    });

    return widget;
});
