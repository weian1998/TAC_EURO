/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/Button',
    'Sage/UI/Alarms/AlertPane',
    'Sage/UI/Alarms/UnconfirmedAlarm',
    'Sage/Link',
    'dojo/i18n',
    'dojo/i18n!./nls/UnconfirmedPane',
    'dojo/_base/declare'
],
function (Button, AlertPane, UnconfirmedAlarm, link, i18n, unconfirmedPaneStrings, declare) {
    var unconfirmedPane = declare('Sage.UI.Alarms.UnconfirmedPane', AlertPane, {
        showConfirmationsText: 'Show Confirmations',
        showCalendarText: 'Show Calendar',
        acceptText: 'Accept',
        declineText: 'Decline',
        _acceptButton: false,
        templateString: ['<div>',
            '<div class="alarm-items-contents" dojoAttachPoint="_alertContents"></div>',
            '<div class="alarm-snoozebar" dojoAttachPoint="_confButtonBar">',
                '<table style="width:100%">',
                    '<tr>',
                        '<td class="leftTools"><a href="Calendar.aspx" title="${showCalendarText}">${showCalendarText}</a>',
                        '<td class="leftTools"><a href="javascript: Sage.Link.toActivityListView(\'confirmations\')" title="${showConfirmationsText}">${showConfirmationsText}</a></td>',
                        '<td class="rightTools">',
                            '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_acceptSelected" dojoAttachPoint="_acceptButton">${acceptText}</button>',
                            '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_declineSelected">${declineText}</button>',
                        '</td>',
                    '</tr>',
                '</table>',
            '</div>',
        '</div>'].join(''),
        constructor: function () {
            dojo.mixin(this, unconfirmedPaneStrings);
        },
        onShow: function () {
            this._acceptButton.focus();
        },
        _addAlert: function (alert) {
            var confWid = new UnconfirmedAlarm({ userNotification: alert, selected: this.selectedAlerts.hasOwnProperty(alert['$key']) });
            this.alertWidgets.push(confWid);
            dojo.place(confWid.domNode, this._alertContents);
        },
        _acceptSelected: function () {
            var len = this.alertWidgets.length - 1;
            for (var i = len; i > -1; i--) {
                var wid = this.alertWidgets[i];
                if (wid.selected) {
                    var activityService = Sage.Services.getService('ActivityService');
                    activityService.acceptConfirmation({
                        notification: wid.userNotification,
                        success: this.onPostSuccess,
                        failure: function () { this._alertChanged(this.alertWidgets.length); },
                        scope: this
                    });
                    this.alertWidgets.splice(i, 1);
                    wid.destroy();
                }
            }
        },
        _declineSelected: function () {
            var len = this.alertWidgets.length - 1;
            for (var i = len; i > -1; i--) {
                var wid = this.alertWidgets[i];
                if (wid.selected) {
                    var activityService = Sage.Services.getService('ActivityService');
                    activityService.declineConfirmation({
                        notification: wid.userNotification,
                        success: this.onPostSuccess,
                        failure: function () { this._alertChanged(this.alertWidgets.length); },
                        scope: this
                    });
                    this.alertWidgets.splice(i, 1);
                    wid.destroy();
                }
            }
        },
        getUnhandledAlertCount: function () {
            return this.alertWidgets.length;
            //            var unconfirmed = 0;
            //            for (var i = 0; i < this.alertItems.length; i++) {
            //                //ToDo: if is still unconfirmed                        <---<<<   <---<<<
            //                unconfirmed++;
            //            }
            //            return unconfirmed;
        },
        onPostSuccess: function () {
            this._alertChanged(this.alertWidgets.length);
        }
    });
    return unconfirmedPane;
});
