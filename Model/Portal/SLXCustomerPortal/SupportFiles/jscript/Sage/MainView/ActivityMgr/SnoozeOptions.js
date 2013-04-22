/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
        'dijit/_TemplatedMixin',
        'dijit/_WidgetsInTemplateMixin',
        'dijit/_Widget',
        'dijit/Dialog',
        'dijit/form/Button',
        'dijit/form/FilteringSelect',
        'dojo/_base/declare',
        'dojo/i18n!./nls/SnoozeOptions'           
],

function (
   _TemplatedMixin,
   _WidgetsInTemplateMixin,
   _Widget,
   Dialog,
   FormButton,
   FilteringSelect,
   declare,
   nlsStrings

) {
    var SnoozeOptions = declare('Sage.MainView.ActivityMgr.SnoozeOptions', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        fiveMinText: '5 minutes',
        tenMinText: '10 minutes',
        fifteenMinText: '15 minutes',
        thirtyMinText: '30 minutes',
        oneHourText: 'x1 hour',
        twoHourText: '2 hours',
        fourHourText: '4 hours',
        eightHourText: '8 hours',
        oneDayText: '1 day',
        twoDayText: '2 days',
        threeDayText: '3 days',
        oneWeekText: '1 week',
        twoWeekText: '2 weeks',
        snoozeText: 'Snooze',
        snoozeByText: 'Snooze by:',
        snoozeAllText: 'Snooze All',
        snoozeTitle: 'Snooze Alarms',
        widgetsInTemplate: true,
        templateString: ['<div>',
             '<div data-dojo-type="dijit.Dialog" id="_snoozeDialog" title="${snoozeTitle}" dojoAttachPoint="_dialog" dojoAttachEvent="onHide:hide">',
              '<div class="alarm-snoozebar" dojoAttachPoint="_snoozebar">',
                '<table>',
                    '<tr>',
                        '<td class="snoozeText">${snoozeByText}</td>',
                        '<td class="snoozeBy">',
                            '<select name="selectSnoozeBy" dojoAttachPoint="_selSnoozeBy" data-dojo-type="dijit.form.FilteringSelect">',
                                '<option value="5" selected="selected">${fiveMinText}</option>',
                                '<option value="10" >${tenMinText}</option>',
                                '<option value="15" >${fifteenMinText}</option>',
                                '<option value="30" >${thirtyMinText}</option>',
                                '<option value="60" >${oneHourText}</option>',
                                '<option value="120" >${twoHourText}</option>',
                                '<option value="240" >${fourHourText}</option>',
                                '<option value="480" >${eightHourText}</option>',
                                '<option value="1440" >${oneDayText}</option>',
                                '<option value="2880" >${twoDayText}</option>',
                                '<option value="4320" >${threeDayText}</option>',
                                '<option value="10080" >${oneWeekText}</option>',
                                '<option value="20160" >${twoWeekText}</option>',
                            '</select>',
                       '</td>',
                       '<td class="snoozeActions">',
                           '<button data-dojo-type="dijit.form.Button" type="button" dojoAttachEvent="onClick:_snooze">${snoozeText}</button>',
                       '</td>',
                    '</tr>',
                '</table>',
            '</div>', // snoozebar
          '</div>',
        '</div>'].join(''),

        constructor: function () {
            dojo.mixin(this, nlsStrings);
        },

        show: function () {

            //this._dialog.show();
            this._showWithUserOptions();
        },

        _showWithUserOptions: function () {
            var optionsSvc = Sage.Services.getService('UserOptions');
            //console.log(optionsSvc);
            if (optionsSvc) {
                optionsSvc.getByCategory('ActivityAlarm', this._receivedOptions, this);
            }
        },
        _receivedOptions: function (data) {
            var opts = data['$resources'];
            for (var i = 0; i < opts.length; i++) {
                var opt = opts[i];
                //this._options[opt['name']] = opt['value'];
                if (opt['name'].toUpperCase() === 'DEFAULTSNOOZE') {
                    var defaultSnooze = opt['value'];
                    this._selSnoozeBy.setValue(defaultSnooze);
                }
            }
            this._dialog.show();
        },
        hide: function () {

            this.destroy();

        },

        destroy: function () {
            this._dialog.destroyRecursive();

        },

        _snooze: function (value) {

            var activityService = Sage.Services.getService('ActivityService');
            var snoozeOptions = this._getNewAlarmTimeOptions();
            this.hide();
            activityService.snooze(null, snoozeOptions);

        },
        _snoozeAll: function () {

        },
        _getNewAlarmTime: function () {
            var options = this._getNewAlarmTimeOptions();
            var newAlarm = dojo.date.add(new Date(), options.interval, options.duration);
            return Sage.Utility.Convert.toIsoStringFromDate(newAlarm);
        },

        _getNewAlarmTimeOptions: function () {

            var dur = 5, interval = 'minute';
            var selText = this._selSnoozeBy.get('displayedValue');
            var selval = this._selSnoozeBy.get('value');
            switch (selval) {
                //case this.fiveMinText : 
                case this.tenMinText:
                    dur = 10;
                    break;
                case this.fifteenMinText:
                    dur = 15;
                    break;
                case this.thirtyMinText:
                    dur = 30;
                    break;
                case this.oneHourText:
                    dur = 1;
                    interval = 'hour';
                    break;
                case this.twoHourText:
                    dur = 2;
                    interval = 'hour';
                    break;
                case this.fourHourText:
                    dur = 4;
                    interval = 'hour';
                    break;
                case this.eightHourText:
                    dur = 8;
                    interval = 'hour';
                    break;
                case this.oneDayText:
                    dur = 1;
                    interval = 'day';
                    break;
                case this.twoDayText:
                    dur = 2;
                    interval = 'day';
                    break;
                case this.threeDayText:
                    dur = 3;
                    interval = 'day';
                    break;
                case this.oneWeekText:
                    dur = 1;
                    interval = 'week';
                    break;
                case this.twoWeekText:
                    dur = 2;
                    interval = 'week';
                    break;
                default:
                    dur = selval;


            }
            var options = {
                name: selText,
                duration: dur,
                interval: interval

            };
            return options;
        },
        _showSnooze: function () {

        }

    });

    return SnoozeOptions;

});