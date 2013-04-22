/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/Button',
    'dijit/form/FilteringSelect',
    'dojo/date',
    'Sage/Utility',
    'Sage/UI/Alarms/AlertPane',
    'Sage/UI/Alarms/ActivityAlarm',
    'dojo/i18n',
    'dojo/i18n!./nls/AlarmPane',
    'dojo/_base/declare',
    'dojo/topic'
],
function (button, FilteringSelect, dojoDate, utility, AlertPane, ActivityAlarm, i18n, alarmPaneStrings, declare, topic) {
    var alarmPane = declare('Sage.UI.Alarms.AlarmPane', AlertPane, {
        defaultSnooze: '5',
        _snoozeButton: false,
        templateString: [
        '<div>',
            '<div class="alarm-items-contents" dojoAttachPoint="_alertContents"></div>',
            '<div class="alarm-snoozebar" dojoAttachPoint="_snoozebar">',
                '<table>',
                    '<tr>',
                        '<td colspan="2" class="dismissActions">',
                            '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_dismissSelected">${dismissText}</button>',
                            '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_dismissAll">${dismissAllText}</button>',
                        '</td>',
                        '<td colspan="2" class="calendar-link">',
                            '<a href="calendar.aspx" title="${showCalendarText}">${showCalendarText}</a>',
                        '</td>',
                    '</tr><tr>',
                        '<td class="snoozeText">${snoozeByText}</td>',
                        '<td colspan="2" class="snoozeBy">',
                            '<select name="selectSnoozeBy" dojoAttachPoint="_selSnoozeBy" data-dojo-type="dijit.form.FilteringSelect">',
                                '<option value="5" {% if ($.defaultSnooze == 5) { %} selected="selected" {% } %}>${fiveMinText}</option>',
                                '<option value="10" {% if ($.defaultSnooze == 10) { %} selected="selected" {% } %}>${tenMinText}</option>',
                                '<option value="15" {% if ($.defaultSnooze == 15) { %} selected="selected" {% } %}>${fifteenMinText}</option>',
                                '<option value="30" {% if ($.defaultSnooze == 30) { %} selected="selected" {% } %}>${thirtyMinText}</option>',
                                '<option value="60" {% if ($.defaultSnooze == 60) { %} selected="selected" {% } %}>${oneHourText}</option>',
                                '<option value="120" {% if ($.defaultSnooze == 120) { %} selected="selected" {% } %}>${twoHourText}</option>',
                                '<option value="240" {% if ($.defaultSnooze == 240) { %} selected="selected" {% } %}>${fourHourText}</option>',
                                '<option value="480" {% if ($.defaultSnooze == 480) { %} selected="selected" {% } %}>${eightHourText}</option>',
                                '<option value="1440" {% if ($.defaultSnooze == 1440) { %} selected="selected" {% } %}>${oneDayText}</option>',
                                '<option value="2880" {% if ($.defaultSnooze == 2880) { %} selected="selected" {% } %}>${twoDayText}</option>',
                                '<option value="4320" {% if ($.defaultSnooze == 4320) { %} selected="selected" {% } %}>${threeDayText}</option>',
                                '<option value="10080" {% if ($.defaultSnooze == 10080) { %} selected="selected" {% } %}>${oneWeekText}</option>',
                                '<option value="20160" {% if ($.defaultSnooze == 20160) { %} selected="selected" {% } %}>${twoWeekText}</option>',
                            '</select>',
                        '</td>',
                        '<td class="snoozeActions">',
                            '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_snooze" dojoAttachPoint="_snoozeButton">${snoozeText}</button>',
                            '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_snoozeAll">${snoozeAllText}</button>',
                        '</td>',
                    '</tr>',
                '</table>',
            '</div>', // snoozebar
        '</div>'].join(''),
        constructor: function () {
            dojo.mixin(this, alarmPaneStrings);
        },
        _durByText: false,
        _textByDur: false,
        onShow: function () {
            this._snoozeButton.focus();
        },
        setDefaultSnooze: function (snooze) {
            this.defaultSnooze = snooze;
            this._setSnoozeSelect(snooze);
        },
        _addAlert: function (item) {
            if (this._alarmRinging(item)) {
                var alarmWid = new ActivityAlarm({ userActivity: item, selected: this.selectedAlerts.hasOwnProperty(item['$key']) });
                this.alertWidgets.push(alarmWid);
                dojo.place(alarmWid.domNode, this._alertContents);
            }
        },
        _alarmRinging: function (userActivity) {
            var n = new Date();
            var alarmTime;
            var alarm;
            if ((userActivity.Alarm == null) && (userActivity.AlarmTime == null)) {
                alarmTime = utility.Convert.toDateFromString(userActivity.Activity.AlarmTime);
                alarm = userActivity.Activity.Alarm;
                userActivity.Alarm = alarm;
                userActivity.AlarmTime = userActivity.Activity.AlarmTime;
            } else {
                alarmTime = utility.Convert.toDateFromString(userActivity.AlarmTime);
                alarm = userActivity.Alarm;
            }
            return (alarm && (dojoDate.compare(alarmTime, n) < 1));
        },
        _snooze: function () {
            for (var i = 0; i < this.alertWidgets.length; i++) {
                var wid = this.alertWidgets[i];
                if (wid.selected) {
                    this._snoozeItem(wid.userActivity);
                }
            }
            this.store.save(this);
        },
        _snoozeAll: function () {
            for (var i = 0; i < this.alertWidgets.length; i++) {
                this._snoozeItem(this.alertWidgets[i].userActivity);
            }
            this.store.save(this);
        },
        _setSnoozeSelect: function (snooze) {
            if (!this._textByDur) {
                this._textByDur = {
                    '5': this.fiveMinText,
                    '10': this.tenMinText,
                    '15': this.fifteenMinText,
                    '30': this.thirtyMinText,
                    '60': this.oneHourText,
                    '120': this.twoHourText,
                    '240': this.fourHourText,
                    '480': this.eightHourText,
                    '1440': this.oneDayText,
                    '2880': this.twoDayText,
                    '4320': this.threeDayText,
                    '10080': this.oneWeekText,
                    '20160': this.twoWeekText
                };
            }
            this._selSnoozeBy.set('displayedValue', this._textByDur[snooze]);
            this._selSnoozeBy.set('value', snooze);
        },
        _snoozeItem: function (userActivity) {
            var selval = this._selSnoozeBy.get('value');
            var dur = parseInt(selval);
            var dateNow = new Date();
            var newAlarm = dojoDate.add(dateNow, 'minute', dur);
            //this.store.setValue(userActivity, 'Alarm', true);
            this.store.setValue(userActivity, 'AlarmTime', utility.Convert.toIsoStringFromDate(newAlarm));
        },
        _dismissAll: function () {
            for (var i = 0; i < this.alertWidgets.length; i++) {
                this._dismissItem(this.alertWidgets[i].userActivity);
            }
            this.store.save(this);
        },
        _dismissSelected: function () {
            for (var i = 0; i < this.alertWidgets.length; i++) {
                var wid = this.alertWidgets[i];
                if (wid.selected) {
                    this._dismissItem(wid.userActivity);
                }
            }
            this.store.save(this);
        },
        _dismissItem: function (userActivity) {
            this.store.setValue(userActivity, 'Alarm', false);
        },
        deleteSelected: function () {
            var selectionContext = this._makeSelectionContext(false);
            if (selectionContext) {
                var svc = Sage.Services.getService('ActivityService');
                if (selectionContext.count === 1) {
                    var activity = selectionContext.selectionInfo.selections[0].entity;
                    svc.deleteActivity(activity['$key'], activity.Recurring);
                } else {
                    svc.deleteActivitiesInSelectionContext(selectionContext, this._reloadAlarms, this);
                }
                //this._alertChanged(this.alertWidgets.length - selectionContext.count);
            }
        },
        _reloadAlarms: function (result) {
            var alarmPopup = dijit.byId('alarmPopup');
            alarmPopup.reloadAlarms();
        },
        completeSelected: function () {
            var selectionContext = this._makeSelectionContext(false);
            if (selectionContext) {
                var svc = Sage.Services.getService('ActivityService');
                var self = this;
                var handle = topic.subscribe("/entity/activity/bulkComplete", function (result) {
                    self._reloadAlarms();
                    handle.remove();
                });
                if (selectionContext.count === 1) {
                    var activity = selectionContext.selectionInfo.selections[0].entity;
                    //if we want to show the series or single occurrence dialog do this:
                    svc.completeActivity(activity['$key'], activity.Recurring);
                    //to skip it do this:
                    //svc.completeActivityOccurrence(activity['$key'], activity['StartDate']);
                } else {
                    svc.completeActivitiesInSelectionContext(selectionContext);
                }
                //this._alertChanged(this.alertWidgets.length - selectionContext.count);
            }
        },
        _makeSelectionContext: function (removeWidget) {
            var ids = [], sels = [];
            var len = this.alertWidgets.length - 1;
            for (var i = len; i > -1; i--) {
                var wid = this.alertWidgets[i];
                if (wid.selected) {
                    var id = wid.userActivity.Activity['$key'];
                    ids.push(id);
                    sels.push({ rn: 0, id: id, entity: wid.userActivity.Activity });
                    if (removeWidget) {
                        this.alertWidgets.splice(i, 1);
                        wid.destroy();
                    }
                }
            }
            if (ids.length > 0) {
                return {
                    count: ids.length,
                    id: null,
                    mode: 'select',
                    name: 'activities',
                    selectionInfo: {
                        key: 'alert',
                        keyField: '$key',
                        mode: 'selection',
                        ranges: [],
                        recordCount: ids.length,
                        selectedIds: ids,
                        selectionCount: 2,
                        selections: sels,
                        sortDirection: '',
                        sortField: ''
                    }
                };
            }
            return false;
        },
        onComplete: function () {
            //this gets fired by the datastore when items have been saved.
            // it happens after any snooze or dismiss
            //we need to see if the alarm should still be in the list...

            var len = this.alertWidgets.length - 1;
            for (var i = len; i > -1; i--) {
                var wid = this.alertWidgets[i];
                if (!this._alarmRinging(wid.userActivity)) {
                    this.alertWidgets.splice(i, 1);
                    wid.destroy();
                }
            }
            this._alertChanged(this.alertWidgets.length);
        },
        getUnhandledAlertCount: function () {
            var ringing = 0;
            for (var i = 0; i < this.alertItems.length; i++) {
                if (this._alarmRinging(this.alertItems[i])) {
                    ringing++;
                }
            }
            return ringing;
        }
    });
    return alarmPane;
});