/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Controls/_customSelectMixin',
    'Sage/Utility/Activity',
    'dojo/date',
    'dojo/data/ItemFileReadStore',
    'dojo/i18n!./nls/DurationSelect',
    'dojo/_base/declare'
],
function (_customSelectMixin, activityUtility, dojoDate, ItemFileReadStore, durSelectStrings, declare) {
    var durationSelect = declare('Sage.UI.Controls.DurationSelect', _customSelectMixin, {
        id: '',
        startTime: new Date(),
        timeValue: new Date(),
        valuesAreAfterStart: true,
        _store: null,
        _storeData: {},
        labelFmt: '${amount} ${interval} (${endTime})',
        splitAmoutLabelFmt: '${amount1} ${interval1}, ${amount2} ${interval2} (${endTime})',

        //i18n strings
        minuteText: 'minute',
        minutesText: 'minutes',
        hourText: 'hour',
        hoursText: 'hours',
        dayText: 'day',
        daysText: 'days',
        //end i18n strings.
        timeIncrements: [0, 5, 10, 15, 30, 60, 120, 240],
        items: [],
        itemsByDur: {},
        constructor: function () {
            dojo.mixin(this, durSelectStrings);
        },
        resetItems: function () {
            this.items = [];
            this.itemsByDur = {};
        },
        _fillSelect: function () {
            if (this._select) {
                this.resetItems();
                var hasItemForCurrentValue = false;
                for (var i = 0; i < this.timeIncrements.length; i++) {
                    var inc = this.timeIncrements[i];
                    this.items.push(this._createItem(inc));
                    hasItemForCurrentValue = hasItemForCurrentValue || (this.value === inc);
                }
                if (!hasItemForCurrentValue && (this.value)) {
                    //this.timeIncrements.push(this.value);
                    this.items.push(this._createItem(this.value));
                }
                this._storeData = {
                    identifier: 'value',
                    label: 'label',
                    items: this.items
                };

                this._store = new ItemFileReadStore({ data: this._storeData });
                this._select.set('store', this._store);
                this._select.set('searchAttr', 'label');
                if (this.value || this.value === 0) {
                    this.set('value', this.value);
                }
            }
        },
        _createItem: function (inc) {
            var st = this.startTime;
            var newD;
            newD = dojoDate.add(st, 'minute', (this.valuesAreAfterStart) ? inc : inc * -1);
            var obj = {
                'value': inc,
                'dateValue': newD,
                'label': this._formatLabel(inc, newD)
            };
            this.itemsByDur[inc] = obj;
            return obj;
        },
        _formatLabel: function (inc, dateval) {
            var hourinc;
            var fmtOptions = {
                amount: inc,
                interval: (inc === 1) ? this.minuteText : this.minutesText,
                endTime: dojoDate.locale.format(dateval, { selector: 'time' })
            };
            var fmtStr = this.labelFmt;
            if (inc > 59) {
                var mod = inc % 60;
                hourinc = Math.floor(inc / 60);
                if (mod === 0) {
                    fmtOptions['amount'] = hourinc;
                    fmtOptions['interval'] = (hourinc === 1) ? this.hourText : this.hoursText;
                } else {
                    fmtOptions['amount1'] = hourinc;
                    fmtOptions['interval1'] = (hourinc === 1) ? this.hourText : this.hoursText;
                    fmtOptions['amount2'] = mod;
                    fmtOptions['interval2'] = (mod === 1) ? this.minuteText : this.minutesText;
                    fmtStr = this.splitAmoutLabelFmt;
                }
                if (hourinc > 23) {
                    var dayinc = Math.round(hourinc / 24);
                    fmtOptions['amount'] = dayinc;
                    fmtOptions['interval'] = (dayinc === 1) ? this.dayText : this.daysText;
                    fmtOptions['endTime'] = dojoDate.locale.format(dateval, { selector: 'datetime' });
                }
            }
            return dojo.string.substitute(fmtStr, fmtOptions);
        },
        _handleValueNotInStore: function (newValue) {
            //override this method to create a new item, or revert to last known good value...
            var curVal = this.text;
            var timeReg = /\(([\s\S]*)\)/;
            var newMatches = timeReg.exec(newValue);
            var curMatches = timeReg.exec(curVal);
            if ((newMatches) && (curMatches)) {
                //we have something in parenthesis - 
                if (newMatches[1] === curMatches[1]) {
                    //the time was the same, so focus on what they put as the duration number...
                    newValue = newValue.replace(newMatches[0], '');
                } else {
                    //they changed the time... can we parse it?
                    var timeDate = dojoDate.locale.parse(newMatches[1], { selector: 'time' });
                    if (timeDate) {
                        timeDate.setFullYear(this.startTime.getFullYear());
                        timeDate.setMonth(this.startTime.getMonth());
                        timeDate.setDate(this.startTime.getDate());
                        this._setTimeValueAttr(timeDate);
                        return this.value;
                    }
                }
            }

            var dur = 0;
            if (typeof newValue === 'number') {
                dur = newValue;
            } else {
                //see if we have one or more numbers and intervals...
                if (newValue.indexOf(',') > 0) {
                    var sections = newValue.split(',');
                    for (var i = 0; i < sections.length; i++) {
                        var partDur = this._getMinutesFromStringPart(sections[i]);
                        if (partDur) {
                            dur += partDur;
                        }
                    }
                } else {
                    dur = this._getMinutesFromStringPart(newValue);
                }
            }
            if (!dur) {
                this._select.set('value', this.text);
                return this.value;
            }
            var newOption = this._createItem(dur);
            this.value = newOption.value;
            this.text = newOption.label;
            this._select.set('displayedValue', newOption.label);
            return newOption.value;
        },
        _setValueAttr: function (value) {
            this._removeOldValueFromStore();
            this.text = value;
            this.value = value;
            if (this._store) {
                this._store.fetchItemByIdentity({
                    identity: value,
                    onItem: function (item) {
                        if (item) {
                            //                        console.log('found the item in the store... %o', item);
                            this._select.set('value', this._store.getValue(item, this._storeData.label));
                            this.value = this._store.getValue(item, this._storeData.identifier);
                            this.text = this._store.getValue(item, this._storeData.label);
                        } else {
                            this._handleValueNotInStore(value);
                            //this._select.set('value', value);
                        }
                    },
                    onError: function () {
                        //console.log('did not find item. ' + this.value);
                    },
                    scope: this
                });
            }
        },
        _removeOldValueFromStore: function () {
            //we may want to leave it...
            for (var i = 0; i < this.timeIncrements.length; i++) {
                if (this.value === this.timeIncrements[i]) {
                    return;
                }
            }
            delete (this.itemsByDur[this.value]);
            var l = this.items.length;
            for (i = 0; i < l; i++) {
                if (this.items[i].value === this.value || this.items[i].value[0] === this.value) {
                    this.items.splice(i, 1);
                    return;
                }
            }
        },
        _getMinutesFromStringPart: function (str) {
            var parts = str.trim().split(' ');
            var num = parseInt(parts[0], 10);
            if (isNaN(num)) {
                return false;
            }
            if (parts.length > 1) {
                if (this.hoursText.indexOf(parts[1]) > -1) {
                    num = num * 60;
                }
            }
            return num;
        },
        _setStartTimeAttr: function (startTime) {
            if (dojoDate.compare(this.startTime, startTime, 'datetime') !== 0) {
                this.startTime = startTime;
                this._fillSelect();
            }
        },
        _setValuesAreAfterStartAttr: function (areAfter) {
            if (this.valuesAreAfterStart !== areAfter) {
                this.valuesAreAfterStart = areAfter;
                this._fillSelect();
            }
        },
        _getTimeValueAttr: function () {
            if (this.itemsByDur.hasOwnProperty(this.value)) {
                var dVal = this.itemsByDur[this.value].dateValue;
                return (dojo.isArray(dVal)) ? dVal[0] : dVal;
            } else {
                if (this.value && this.startTime) {
                    var d = dojoDate.add(this.startTime, 'minute', (this.valuesAreAfterStart) ? this.value : this.value * -1);
                    this.dateValue = d;
                    return this.dateValue;
                }
                return null;
            }
        },
        _setTimeValueAttr: function (time) {
            if (!time) {
                return;
            }
            if (this.items.length < 1) {
                this._fillSelect();
            }
            var d = this.startTime;
            if (d.getHours() === 0 && d.getMinutes === 0 && d.getSeconds() === 5) {
                time = new Date(d.getUTCFullYear(),
                    d.getUTCMonth(),
                    d.getUTCDate(),
                    d.getUTCHours(),
                    d.getUTCMinutes(),
                    d.getUTCSeconds());
            }
            for (var obj in this.itemsByDur) {
                if (obj && this.itemsByDur[obj].dateValue) {
                    var compDate = dojo.isArray(this.itemsByDur[obj].dateValue) ? this.itemsByDur[obj].dateValue[0] : this.itemsByDur[obj].dateValue;
                    if (dojoDate.compare(compDate, time, 'datetime') === 0) {
                        this.set('value', this.itemsByDur[obj].value);
                        this.text = this.itemsByDur[obj].label;
                        this._select.set('displayedValue', this.itemsByDur[obj].label);
                        return;
                    }
                }
            }
            //need to make one...
            //find difference in minutes, then create item
            var dur = dojoDate.difference(this.startTime, time, 'minute');
            if (dur < 0) {
                dur = dur * -1; // ensure it is a positive value...
            }
            var o = {
                'value': dur,
                'dateValue': time,
                'label': this._formatLabel(dur, time)
            };
            this.set('value', dur);
            this.text = o.label;
            this.itemsByDur[dur] = o;
            this._select.set('displayedValue', o.label);
        },
        _setTimeIncrementsAttr: function (incrments) {
            if (this.timeIncrements === incrments) {
                return;
            }
            this.timeIncrements = incrments;
            this._fillSelect();
        }
    });
    return durationSelect;
});