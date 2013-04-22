/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/_Templated',
    'dijit/_Widget',
    'Sage/Utility',
    'dojo/date',
    'dojo/html',
    'dojo/i18n',
    'dojo/i18n!./nls/AlarmCountDown',
    'dojo/_base/declare'
],
function (_Templated, _Widget, utility, dojoDate, dojoHtml,
    i18n, alarmCountDownStrings, declare) {
    var alarmCountDown = declare('Sage.UI.Alarms.AlarmCountDown', [_Widget, _Templated], {
        widgetsInTemplate: false,
        startDate: '',
        _isOverdue: false,
        _timer: false,
        widgetTemplate: new Simplate([
            '<div>',
                '<div dojoAttachPoint="_startsIn"></div>',
                '<div>',
                    '<span dojoAttachPoint="_countDownAmount" class="alarm-countdown"></span>',
                    '<span dojoAttachPoint="_countDownTimeFrame"></span>',
                '</div>',
                '<div dojoAttachPoint="_countDown2">',
                    '<span dojoAttachPoint="_countDown2Amount" class="alarm-countdown"></span>',
                    '<span dojoAttachPoint="_countDown2TimeFrame"></span>',
                '</div>',
            '</div>'
        ]),
        constructor: function () {
            dojo.mixin(this, alarmCountDownStrings);
        },
        postCreate: function () {
            this.inherited(arguments);
            var c = utility.Convert;
            if (c.isDateString(this.startDate)) {
                this.startDate = c.toDateFromString(this.startDate);
            }
            if (!this.startDate) {
                return;
            }
            this._calculate();
        },
        _calculate: function () {
            var n = new Date();
            var firstDate, secondDate;
            if (dojoDate.difference(this.startDate, n, 'minute') < 0) {
                firstDate = n;
                secondDate = this.startDate;
                this._isOverdue = false;
            } else {
                firstDate = this.startDate;
                secondDate = n;
                this._isOverdue = true;
            }
            var diff;
            if (firstDate.getFullYear() === secondDate.getFullYear()
                && firstDate.getMonth() === secondDate.getMonth()
                && firstDate.getDate() === secondDate.getDate()) {
                //happens today, show hours and minutes and keep updating...
                diff = dojoDate.difference(firstDate, secondDate, 'minute');
                if (diff < 61) {
                    //less than an hour, show just minutes
                    this._setUI(diff, (diff > 1) ? this.minutesText : this.minuteText);
                } else {
                    var minutes = diff % 60;
                    var hours = Math.floor(diff / 60);
                    this._setUI(hours, (hours > 1) ? this.hoursText : this.hourText,
                        minutes, (minutes > 1) ? this.minutesText : this.minuteText);
                }
                var self = this;
                window.setTimeout(function () { self._update(); }, 60000);
                return;
            }
            diff = dojoDate.difference(firstDate, secondDate, 'day');
            if (diff < 31) {
                //less than a month, show number of days
                this._setUI(diff, (diff > 1) ? this.daysText : this.dayText, false, false);
                return;
            }
            diff = dojoDate.difference(firstDate, secondDate, 'month');
            if (diff < 13) {
                //less than a year, show number of months
                this._setUI(diff, (diff > 1) ? this.monthsText : this.monthText, false, false);
                return;
            }
            //over a year, just show how many years
            diff = dojoDate.difference(firstDate, secondDate, 'year');
            this._setUI(diff, (diff > 1) ? this.yearsText : this.yearText);
        },
        _setUI: function (amt, timeframeText, amt2, timeframe2Text) {
            if (amt !== 0) {
                dojoHtml.set(this._startsIn, (this._isOverdue) ? this.overduebyText : this.startsInText);
                dojoHtml.set(this._countDownAmount, ' ' + amt + ' ');
                if (amt2) {
                    dojoHtml.set(this._countDown2Amount, ' ' + amt2 + ' ');
                    dojo.removeClass(this._countDown2, 'display-none');
                } else {
                    dojo.addClass(this._countDown2, 'display-none');
                }
            } else {
                dojoHtml.set(this._startsIn, '');
                dojoHtml.set(this._countDownAmount, '');
                timeframeText = this.startsNowText;
            }
            dojoHtml.set(this._countDownTimeFrame, timeframeText);
            if (timeframe2Text) {
                dojoHtml.set(this._countDown2TimeFrame, timeframe2Text);
            }
            if (this._isOverdue) {
                dojo.addClass(this.domNode, 'overdue-alarm');
            } else {
                dojo.removeClass(this.domNode, 'overdue-alarm');
            }
        },
        _update: function () {
            this._calculate();
        },
        destroy: function () {
            if (this._timer) {
                window.clearTimeout(this._timer);
            }
            this.inherited(arguments);
        }
    });
    return alarmCountDown;
});