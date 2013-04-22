/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom-class',
    'Sage/Utility/Activity',
    'dijit/form/RadioButton',
    'Sage/UI/Controls/Numeric',
    'dijit/layout/StackContainer',
    'dijit/layout/ContentPane',
    'Sage/UI/NumberTextBox',
    'dijit/form/CheckBox',
    'dijit/form/Select',
    'Sage/UI/Controls/DateTimePicker',
    'dojo/date',
    'dojo/i18n!./nls/RecurringEditor',
    'dojo/text!./templates/RecurringEditor.html'
],
function (_Widget,
    _Templated,
    declare,
    lang,
    domClass,
    activityUtility,
    RadioButton,
    Numeric,
    StackContainer,
    ContentPane,
    NumberTextBox,
    CheckBox,
    Select,
    DateTimePicker,
    dDate,
    recurringEditorStrings,
    template
    ) {

    var _recurringCalculator = declare('Sage.MainView.ActivityMgr._RecurringCalculator', null, {
        startDate: new Date(),
        initialStartDate: new Date(),
        endDate: new Date(),
        interval: 1,
        occurances: 1,
        activityRecurPeriodCode: 0,
        recurPeriod: false,
        editor: false,
        constructor: function (opts) {
            lang.mixin(this, opts);
        },
        calculateEndDate: function () {
            //calculate the end date based on the start date and number of occurances...
            if (!isNaN(this.interval) && !isNaN(this.occurances) && this.recurPeriod) {
                this.endDate = dDate.add(this.startDate, this.recurPeriod, (this.interval * this.occurances) - this.interval);
            }
            return this.endDate || this.startDate;
        },
        calculateNumberOfOccurances: function () {
            //calculate the number of occurances based on the start date and end date...
            var dif = dDate.difference(this.startDate, this.endDate, this.recurPeriod);
            var occCount = (dif / this.interval) + 1;
            occCount = Math.floor(occCount);
            return occCount;
        },
        set: function (prop, val) {
            switch (prop.toLowerCase()) {
                case 'enddate':
                    //should we check to see if it is a date? ...or maybe convert from string to date?
                    this.endDate = val;
                    this.endDate.setHours(0);
                    this.endDate.setMinutes(0);
                    //this.calculateNumberOfOccurances();
                    break;
                case 'interval':
                    this.interval = val;
                    //this.calculateNumberOfOccurances();
                    break;
                case 'occurances':
                    this.occurances = val;
                    //this.calculateEndDate();
                    break;
                case 'startdate':
                    this.startDate = val;
                    this.startDate.setHours(0);
                    this.startDate.setMinutes(0);
                    break;
                case 'initialstartdate':
                    this.initialStartDate = val;
                    this.initialStartDate.setHours(0);
                    this.initialStartDate.setMinutes(0);
                    //now what?
                    break;
                case 'editor':
                    this.editor = val;
                    break;
                case 'activityrecurperiodcode':
                    this.activityRecurPeriodCode = val;
                    break;
            }
        },
        get: function (prop) {
            switch (prop.toLowerCase()) {
                case 'enddate':
                    //should we check to see if it is a date? ...or maybe convert from string to date?
                    return this.endDate;
                case 'interval':
                    return this.interval;
                case 'occurances':
                    return this.occurances;
                case 'startdate':
                    return this.startDate;
                case 'editor':
                    return this.editor;
                case 'activityRecurPeriodCode':
                    return this.activityRecurPeriodCode;
            }
            return false;
        },
        _getTempStartDate: function () {
            // returns a clone of the start date (no time) that can be manipulated for counting occurances
            return new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
        }
    });

    var dailyRecurringCalculator = declare('Sage.MainView.ActivityMgr.DailyRecurringCalculator', _recurringCalculator, {
        recurPeriod: 'day'//,
        //        calculateNumberOfOccurances: function () {
        //            //... logic from legacy web client - actrecurdaily.js
        //            var day; // = this.startDate.getDate();
        //            var tempStart = this._getTempStartDate();
        //            var occurcount = 1;
        //            while (tempStart < this.endDate && occurcount < 999) {
        //                day = tempStart.getDate();
        //                tempStart.setDate(day + (this.interval * 1));
        //                occurcount++;
        //            }

        //            //... new logic - does it match?
        //            var occCount = this.inherited(arguments);

        //            console.warn('calculating daily occurances.  Old Logic: ' + occurcount + '     New Logic: ' + occCount);

        //            this.occurances = occurcount;
        //            return this.occurances;
        //        }
    });

    var weeklyRecurringCalculator = declare('Sage.MainView.ActivityMgr.WeeklyRecurringCalculator', _recurringCalculator, {
        recurPeriod: 'week',
        _checkedCount: 0,
        _checkedDays: {},
        calculateEndDate: function () {
            if (this.editor) {

                var checkedCount = this.editor.countCheckedDays();
                //if there is only one occurance per week, simple math will do...
                // if none are checked, assume one (the day of the start date)
                if (checkedCount < 2) {
                    if (!isNaN(this.interval) && !isNaN(this.occurances) && this.recurPeriod) {
                        this.endDate = dDate.add(this.startDate, this.recurPeriod, (this.interval * this.occurances) - this.interval);
                    }
                    return this.endDate || this.startDate;
                }
                //but if not, we never know how many of the occurances will be in the first or last weeks without digging in and counting...
                var checkedDays = this.editor.getCheckedDays();
                // (the array of 0's or 1's meaning the day is checked or not)
                var workingDate = this._getTempStartDate();
                //start off assuming the start date is the first occurance.
                var remaining = this.occurances - 1;
                while (remaining > 0) {
                    workingDate = dDate.add(workingDate, 'day', 1);
                    remaining = remaining - checkedDays[workingDate.getDay()]; //if that day is checked, it will lower the remaining.
                }
                return workingDate;
            }
            return this.endDate || this.startDate;
        } //,

        //        calculateNumberOfOccurances: function () { 
        //... ToDo: but neither method of counting is right if there are more than one occurances per week...
        // probably need to implement better logic...

        //            //... logic from Legacy web client - actrecurweekly.js
        //            var dateDiff = (this.endDate - this.startDate);
        //            var Age = Math.round(dateDiff / 86400000);
        //            var occurcount = (Age / (this.interval * 7));
        //            occurcount = (occurcount + 1);
        //            occurcount = Math.floor(occurcount);

        //            //... new logic - does it match?
        //            var occCount = this.inherited(arguments);

        //           
        //            console.warn('calculating weekly occurances.  Old Logic: ' + occurcount + '     New Logic: ' + occCount);

        //            this.occurances = occurcount;
        //            return occurcount;
        //        }

    });

    var monthlyRecurringCalculator = declare('Sage.MainView.ActivityMgr.MonthlyRecurringCalculator', _recurringCalculator, {
        recurPeriod: 'month',
        calculateStartDate: function () {
            var sDate = lang.clone(this.initialStartDate);
            var firstOccurrenceDate;
            var weekDate = parseInt(this.editor._datesSelect.get('value'), 10);
            var weekDay = parseInt(this.editor._weekdaySelect.get('value'), 10);
            var nthWeek = parseInt(this.editor._weeksSelect.get('value'), 10);

            if (this.editor._rdoMonthlyOn.get('checked')) {
                firstOccurrenceDate = this.getNthDayOfMonth(this.initialStartDate, weekDate);
                sDate = firstOccurrenceDate;
            } else if (this.editor._rdoMonthlyOnThe.get('checked')) {
                firstOccurrenceDate = activityUtility.setDateToNthWeekDay(this.initialStartDate, nthWeek, weekDay);

                firstOccurrenceDate.setHours(this.initialStartDate.getHours());
                firstOccurrenceDate.setMinutes(this.initialStartDate.getMinutes());
                //If first occurence falls before activity start date, update activity start date to first occurrance's date
                var dtCompare = dojo.date.compare(this.initialStartDate, firstOccurrenceDate, "date");
                if (dtCompare != 0) {
                    if (dtCompare > 0) {
                        sDate = this.calculateFirstOccurrance(this.initialStartDate, firstOccurrenceDate, nthWeek, weekDay);
                    } else {
                        sDate = firstOccurrenceDate;
                    }
                }
            }
            return sDate;
        },
        calculateEndDate: function () {
            var eDate = this.inherited(arguments);
            if (this.activityRecurPeriodCode === 5) {
                //adjust to the correct day of the correct week for this option. (eg. first friday or last tuesday of the month)
                var week = activityUtility.getNthWeekOfMonth(this.startDate);
                var day = this.startDate.getDay();
                eDate = activityUtility.setDateToNthWeekDay(eDate, week, day);
            }
            return eDate;
        },
        getNthDayOfMonth: function (startDate, dayNumber) {
            var firstOccurDate = lang.clone(startDate);
            var startDateDay = startDate.getDate();
            if (startDateDay > dayNumber) {
                firstOccurDate = dojo.date.add(startDate, "month", 1);
            }
            firstOccurDate.setDate(dayNumber);

            return firstOccurDate;
        },
        calculateFirstOccurrance: function (currentStartDate, currentFirstOccurranceDate, nthWeek, weekDay) {
            var nDate = currentFirstOccurranceDate;
            while (dojo.date.compare(this.initialStartDate, nDate, "date") > 0) {
                nDate = activityUtility.setDateToNthWeekDay(dojo.date.add(nDate, "month", 1), nthWeek, weekDay);
            }
            return nDate;
        }
    });

    var yearlyRecurringCalculator = declare('Sage.MainView.ActivityMgr.YearlyRecurringCalculator', _recurringCalculator, {
        recurPeriod: 'year',
        calculateEndDate: function () {
            var eDate = this.inherited(arguments);
            if (this.activityRecurPeriodCode === 8) {
                //adjust to the correct day of the correct week for this option. (eg. first friday or last tuesday of the month)
                var week = activityUtility.getNthWeekOfMonth(this.startDate);
                var day = this.startDate.getDay();
                eDate.setMonth(this.startDate.getMonth());
                eDate = activityUtility.setDateToNthWeekDay(eDate, week, day);
            }
            return eDate;
        }
    });

    /**
    * @class UI Editor for editing recurring properties of activities.  Intended to be the "Recurring" tab in a schedule/edit form for activities.
    */
    var recurringEditor = declare('Sage.MainView.ActivityMgr.RecurringEditor', [_Widget, _Templated], {
        /**
        * @property {object} activity - the activity object that is being edited
        */
        activity: {},
        id: '',
        /**
        * @property {string} indicates the width of the labels in the form.
        */
        labelWidth: '80',

        /**
        * @property {Date} Get or set the start date of the activity being edited.
        */
        startDate: new Date(),
        /**
        * @property {Int} Get or set the number of times this recurring activity occurs.
        */
        initialStartDate: new Date(),
        startDateChangedFromParent: false,
        occurances: 2,
        interval: 1,
        activityRecurPeriodCode: 0,
        recurringPeriods: {
            once: 'once',
            daily: 'daily',
            weekly: 'weekly',
            monthly: 'monthly',
            yearly: 'yearly'
        },
        currentPeriod: 'once',
        endCalculators: false,
        _applyingActivityData: false,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function () {
            lang.mixin(this, recurringEditorStrings);
        },
        postMixInProperties: function () {
            if (!this.endCalculators) {
                this.endCalculators = {};
                var config = {
                    startDate: this.startDate,
                    endDate: this.endDate,
                    interval: 1,
                    occurances: 1,
                    editor: this
                };
                this.endCalculators[this.recurringPeriods.daily] = new dailyRecurringCalculator(config);
                this.endCalculators[this.recurringPeriods.weekly] = new weeklyRecurringCalculator(config);
                this.endCalculators[this.recurringPeriods.monthly] = new monthlyRecurringCalculator(config);
                this.endCalculators[this.recurringPeriods.yearly] = new yearlyRecurringCalculator(config);
            }
        },

        // property getters and setters............................................................................
        _setStartDateAttr: function (newVal) {
            //when we notify that we've changed the start date, the main activity editor sets the time of the current activity to the new date, then fires
            // its change date functionality which sets this.  Make sure we don't keep cycling through an endless notification of changed dates.  We only
            // care about the date portion of the date anyway.
            if (newVal.getMonth() === this.startDate.getMonth() &&
                    newVal.getDate() === this.startDate.getDate() &&
                    newVal.getFullYear() === this.startDate.getFullYear()) {
                return;
            }
            //This flag is to prevent startdate change notification to parent which will keep cycling
            this.startDateChangedFromParent = true;            
            this._applyingActivityData = true;
            this.startDate = newVal;
            this.initialStartDate = newVal;
            this.dtp_startRecur.set('value', newVal);
            this._weeklySyncToStartDate();
            this._monthlySyncToStartDate();
            this._yearlySyncToStartDate();
            //this._calculateStartDate();
            this._calculateEnd();            
            this._applyingActivityData = false;
            //Set to true for enabling the start date change notification
            this.startDateChangedFromParent = false;

        },
        _getStartDateAttr: function () {
            return this.startDate;
        },
        _setOccurancesAttr: function (occ) {
            this.occurances = occ;
            this.num_Occurances.set('value', occ);
        },
        _getOccurancesAttr: function () {
            return this.occurances;
        },
        _setActivityAttr: function (activity) {
            //debugger;
            this.activity = activity;
            this._setUI();
            this._applyActivityData();
        },
        _getActivityAttr: function () {
            return this.activity;
        },
        onTabShow: function () {
            //should be called when this tab
            this._panelContainer.resize();
        },
        _setUI: function () {
            var opts = [];
            /*  add the appropriate select options  */
            if (this._datesSelect.getOptions().length < 1) {
                for (var i = 1; i < 32; i++) {
                    opts.push({
                        value: i.toString(),
                        label: i.toString()
                    });
                }
                this._datesSelect.addOption(opts);
                this._yearDatesSelect.addOption(opts);
            }
            if (this._monthNamesSelect.getOptions().length < 1) {
                opts = [
                    { value: '1', label: this.janText },
                    { value: '2', label: this.febText },
                    { value: '3', label: this.marText },
                    { value: '4', label: this.aprText },
                    { value: '5', label: this.mayText },
                    { value: '6', label: this.junText },
                    { value: '7', label: this.julText },
                    { value: '8', label: this.augText },
                    { value: '9', label: this.sepText },
                    { value: '10', label: this.octText },
                    { value: '11', label: this.novText },
                    { value: '12', label: this.decText }
                ];
                this._monthNamesSelect.addOption(opts);
                this._yearMonthNamesSelect.addOption(opts);
            }

            if (this._weeksSelect.getOptions().length < 1) {
                opts = [
                    { value: '1', label: this.firstText },
                    { value: '2', label: this.secondText },
                    { value: '3', label: this.thirdText },
                    { value: '4', label: this.fourthText },
                    { value: '5', label: this.lastText }
                ];
                this._weeksSelect.addOption(opts);
                this._yearWeeksSelect.addOption(opts);
            }
            if (this._weekdaySelect.getOptions().length < 1) {
                opts = [
                    { value: '1', label: this.monText },
                    { value: '2', label: this.tueText },
                    { value: '3', label: this.wedText },
                    { value: '4', label: this.thurText },
                    { value: '5', label: this.friText },
                    { value: '6', label: this.satText },
                    { value: '0', label: this.sunText }
                ];
                this._weekdaySelect.addOption(opts);
                this._yearWeekdaySelect.addOption(opts);
            }
        },

        // handling for recurring period radio buttons..............................................................
        _onceChanged: function (checked) {

            this._setUI();
            if (checked) {
                this._panelContainer.selectChild(this._oncePanel);
                this.interval = 1;
                this._updateRecurringPeriod(this.recurringPeriods.once);
            }
        },
        _dailyChanged: function (checked) {
            if (checked) {
                //console.log('daily is now checked');
                this._panelContainer.selectChild(this._dailyPanel);
                this._dailyUpdateInterval();
                this._updateRecurringPeriod(this.recurringPeriods.daily);
                this._toggleEndCalculatorVisibility(this._rdoDailyEvery.get('checked'));
            }
        },
        _dailyUpdateInterval: function () {
            this.interval = (this._rdoDailyEvery.get('checked')) ? this._dailyEveryText.get('value') : this._dailyEveryAfterText.get('value');
            if (isNaN(this.interval)) {
                this.interval = 1;
            }
        },
        _weeklyChanged: function (checked) {
            if (checked) {
                //console.log('weekly is now checked');
                this._panelContainer.selectChild(this._weeklyPanel);
                this._weeklyUpdateInterval();
                this._updateRecurringPeriod(this.recurringPeriods.weekly);
                this._toggleEndCalculatorVisibility(this._rdoWeeklyEvery.get('checked'));
            }
        },
        _weeklySyncToStartDate: function () {
            this._clearCheckedWeekdays();
            this._enforceWeekdayChecked();
        },
        _weeklyUpdateInterval: function () {
            this._enforceWeekdayChecked();
            this.interval = (this._rdoWeeklyEvery.get('checked')) ? this._weeklyEveryText.get('value') : this._weeklyEveryAfterText.get('value');
            if (isNaN(this.interval)) {
                this.interval = 1;
            }
        },
        _monthlyChanged: function (checked) {
            if (checked) {
                //console.log('monthly is now checked');
                this._panelContainer.selectChild(this._monthlyPanel);
                this._monthlyUpdateInterval();
                this._updateRecurringPeriod(this.recurringPeriods.monthly);
                this._toggleEndCalculatorVisibility(!this._rdoMonthlyAfter.get('checked'));
            }
        },
        _monthlyUpdateInterval: function () {
            this.interval = (this._rdoMonthlyOn.get('checked')) ? this._monthlyEveryText.get('value') :
                                (this._rdoMonthlyOnThe.get('checked')) ? this._monthlyOnTheText.get('value') : this._monthlyAfterText.get('value');
            if (isNaN(this.interval)) {
                this.interval = 1;
            }
        },
        _monthlySyncToStartDate: function () {
            this._datesSelect.set('value', this.startDate.getDate().toString());
            this._weekdaySelect.set('value', this.startDate.getDay().toString());
            this._weeksSelect.set('value', activityUtility.getNthWeekOfMonth(this.startDate).toString());

        },
        _yearlyChanged: function (checked) {
            if (checked) {
                //console.log('yearly is now checked');
                this._panelContainer.selectChild(this._yearlyPanel);
                this._yearlyUpdateInterval();
                this._updateRecurringPeriod(this.recurringPeriods.yearly);
                this._toggleEndCalculatorVisibility(!this._rdoYearlyEveryAfter.get('checked'));
            }
        },
        _yearlyUpdateInterval: function () {
            this.interval = (this._rdoYearlyOn.get('checked')) ? this._yearlyEveryText.get('value') :
                                (this._rdoYearlyEveryAfter.get('checked')) ? this._yearlyEveryAfterText.get('value') : 1;
        },
        _yearlySyncToStartDate: function () {
            this._monthNamesSelect.set('value', (this.startDate.getMonth() + 1).toString());
            this._yearDatesSelect.set('value', this.startDate.getDate().toString());
            this._yearWeeksSelect.set('value', activityUtility.getNthWeekOfMonth(this.startDate).toString());
            this._yearWeekdaySelect.set('value', this.startDate.getDay().toString());
            this._yearMonthNamesSelect.set('value', (this.startDate.getMonth() + 1).toString());
        },
        _updateRecurringPeriod: function (period) {
            //console.log('recurring period changed... ' + period);
            //console.log('recurring period changed, the interval is now ' + this.interval);
            this._toggleEndCalculatorVisibility(period !== this.recurringPeriods.once);

            this.currentPeriod = period;
            this._calculateEnd();
            this.onRecurPeriodChanged(period);
        },
        _toggleEndCalculatorVisibility: function (visible) {
            if (visible) {
                domClass.remove(this._startEndCalculator, 'display-none');
            } else {
                domClass.add(this._startEndCalculator, 'display-none');
            }
        },

        // data handling ......................................................................................
        // databinding controls when opening an existing activity for editing...
        _applyActivityData: function () {
            /* take the recurring information from the activity and set the controls appropriately  */
            /*
            RecurPeriod key:
            0 : Daily - every x days, end after n occurrences
            1 : Daily - every x days after completion
            2 : Weekly - every x weeks on day, end after n occurrences
            3 : Weekly - every x weeks after completion
            4 : Monthly - every x months, on day d, end after n occurrences
            5 : Monthly - every x months, on d'st, day, end after n occurrences
            6 : Monthly - every x months after completion
            7 : Yearly - every x years on mm/dd, end after n occurrences
            8 : Yearly - on the d'st day of mon, end after n occurrences
            9 : Yearly - every x years after completion
            */

            this._applyingActivityData = true;

            if (this.activity && this.activity.hasOwnProperty('Recurring')) {
                this.startDate = Sage.Utility.Convert.toDateFromString(this.activity.StartDate);
                this.initialStartDate = Sage.Utility.Convert.toDateFromString(this.activity.StartDate);
                if (this.activity.Timeless || activityUtility.isDateFiveSecondRuleTimeless(this.startDate)) {
                    this.startDate = new Date(this.startDate.getUTCFullYear(), this.startDate.getUTCMonth(), this.startDate.getUTCDate(), 0, 0, 5);
                }
                this.activityRecurPeriodCode = this.activity.RecurPeriod;
                this.dtp_startRecur.set('value', this.startDate);
                if (!this.activity.Recurring) {
                    this.rdo_Once.set('checked', true);
                    this._toggleEndCalculatorVisibility(false);
                    //set these up so they are ready if the user turns on recurring
                    this._resetInterval();
                    this._weeklySyncToStartDate();
                    this._monthlySyncToStartDate();
                    this._yearlySyncToStartDate();
                    this._applyingActivityData = false;
                    return;
                }
                this._toggleEndCalculatorVisibility(true);
                switch (this.activity.RecurPeriod) {
                    case 0:
                    case 1:
                        this._applyDailyRecurringValues();
                        break;
                    case 2:
                    case 3:
                        this._applyWeeklyRecurringValues();
                        break;
                    case 4:
                    case 5:
                    case 6:
                        this._applyMonthlyRecurringValues();
                        break;
                    case 7:
                    case 8:
                    case 9:
                        this._applyYearlyRecurringValues();
                        break;
                    default:
                        this.rdo_Once.set('checked', true);
                }
                this._applyingActivityData = false;
            }
            
        },
        _applyEndCalculatorValues: function () {
            this.dtp_startRecur.set('value', this.startDate);
            this._rdoEndAfter.set('checked', true);
            this.num_Occurances.set('value', this.activity.RecurIterations);
            this._calculateEnd();
        },
        _applyDailyRecurringValues: function () {
            //console.log('_applyDailyRecurringValues');
            this.rdo_Daily.set('checked', true);
            this._toggleEndCalculatorVisibility(this.activity.RecurPeriod === 0);
            this.interval = this.activity.RecurPeriodSpec;
            if (this.activity.RecurPeriod === 0) {
                this._rdoDailyEvery.set('checked', true);
                this._dailyEveryText.set('value', this.activity.RecurPeriodSpec);
                this._applyEndCalculatorValues();
            } else if (this.activity.RecurPeriod === 1) {
                this._rdoDailyEveryAfter.set('checked', true);
                this._dailyEveryAfterText.set('value', this.activity.RecurPeriodSpec);
            }
        },
        _weekDayValues: {
            sun: 131072,
            mon: 262144,
            tue: 524288,
            wed: 1048576,
            thu: 2097152,
            fri: 4194304,
            sat: 8388608
        },
        _resetInterval: function () {
            this._rdoDailyEvery.set('checked', true);
            this._dailyEveryText.set('value', "1");
            this._dailyEveryAfterText.set('value', "1");

            this._rdoWeeklyEvery.set('checked', true);
            this._weeklyEveryText.set('value', "1");
            this._weeklyEveryAfterText.set('value', "1");

            this._rdoMonthlyOn.set('checked', true);
            this._monthlyEveryText.set('value', "1");
            this._monthlyOnTheText.set('value', "1");
            this._monthlyAfterText.set('value', "1");

            this._rdoYearlyOn.set('checked', true);
            this._yearlyEveryText.set('value', "1");
            this._yearlyEveryAfterText.set('value', "1");

            this.num_Occurances.set('value', "2");
            this.occurances = 2;
            this._intervalChanged(2);

        },
        _clearCheckedWeekdays: function () {
            this._chkSaturday.set('checked', false);
            this._chkFriday.set('checked', false);
            this._chkThursday.set('checked', false);
            this._chkThursday.set('checked', false);
            this._chkWednesday.set('checked', false);
            this._chkTuesday.set('checked', false);
            this._chkMonday.set('checked', false);
            this._chkSunday.set('checked', false);
        },
        _applyWeeklyRecurringValues: function () {
            //console.log('_applyWeeklyRecurringValues');
            this.rdo_Weekly.set('checked', true);
            this._toggleEndCalculatorVisibility(this.activity.RecurPeriod === 2);
            //clear any checked days first...
            this._clearCheckedWeekdays();
            //set the weekly every radio button
            //evaluate the period spec number (and check the right days)
            this.interval = this._evalRecurperiodspec(this.activity.RecurPeriodSpec, this.activity.RecurPeriod);
            if (this.activity.RecurPeriod === 2) {
                this._rdoWeeklyEvery.set('checked', true);
                this._weeklyEveryText.set('value', this.interval);
                this._enforceWeekdayChecked();
                this._applyEndCalculatorValues();
            } else if (this.activity.RecurPeriod === 3) {
                this._rdoWeeklyEveryAfter.set('checked', true);
                this._weeklyEveryAfterText.set('value', this.interval);
            }
        },
        _evalRecurperiodspec: function (recspec, recperiod) {
            //  Figure out what days to check and reduce the RecurPeriodSpec number to the right number of weeks/months/years between occurances.
            //  Several periods need the number reduced, but only check the days for period 2.            
            if (recspec > this._weekDayValues['sat']) {
                recspec = recspec - this._weekDayValues['sat'];
                if (recperiod === 2) { this._chkSaturday.set('checked', true); }
            }
            if (recspec > this._weekDayValues['fri']) {
                recspec = recspec - this._weekDayValues['fri'];
                if (recperiod === 2) { this._chkFriday.set('checked', true); }
            }
            if (recspec > this._weekDayValues['thu']) {
                recspec = recspec - this._weekDayValues['thu'];
                if (recperiod === 2) { this._chkThursday.set('checked', true); }
            }
            if (recspec > this._weekDayValues['wed']) {
                recspec = recspec - this._weekDayValues['wed'];
                if (recperiod === 2) { this._chkWednesday.set('checked', true); }
            }
            if (recspec > this._weekDayValues['tue']) {
                recspec = recspec - this._weekDayValues['tue'];
                if (recperiod === 2) { this._chkTuesday.set('checked', true); }
            }
            if (recspec > this._weekDayValues['mon']) {
                recspec = recspec - this._weekDayValues['mon'];
                if (recperiod === 2) { this._chkMonday.set('checked', true); }
            }
            if (recspec > this._weekDayValues['sun']) {
                recspec = recspec - this._weekDayValues['sun'];
                if (recperiod === 2) { this._chkSunday.set('checked', true); }
            }
            return recspec;
        },
        _applyMonthlyRecurringValues: function () {
            //console.log('_applyMonthlyRecurringValues');
            this.rdo_Monthly.set('checked', true);
            var recspec = this.activity.RecurPeriodSpec;
            if (this.activity.RecurPeriod === 4) {
                //check the Every x months on day n radio
                this._rdoMonthlyOn.set('checked', true);
                //figure out the number of months between occurances...
                recspec = this._evalRecurperiodspec(recspec, this.activity.RecurPeriod);
                if (recspec > 65000) {
                    recspec = recspec % 65536;
                }
                this._monthlyEveryText.set('value', recspec);

                // set the day...
                this._datesSelect.set('value', this.startDate.getDate().toString());
                this._applyEndCalculatorValues();
            } else if (this.activity.RecurPeriod === 5) {

                //debugger;

                //check the every x months on the radio
                this._rdoMonthlyOnThe.set('checked', true);


                var wDay = Math.floor(recspec / 524288) - 1;
                recspec = recspec % 524288;
                var mWeek = Math.floor(recspec / 65536);
                recspec = recspec % 65536;

                //select the n'st day select box
                mWeek++;
                this._weeksSelect.set('value', (mWeek).toString());

                // select the day of the week
                this._weekdaySelect.set('value', wDay.toString());

                //set the number of months between occurances...
                this._monthlyOnTheText.set('value', recspec);
                this._applyEndCalculatorValues();
            } else if (this.activity.RecurPeriod === 6) {
                //ToDo:
                // check the every x months after completion radio
                this._rdoMonthlyAfter.set('checked', true);
                if (recspec > 1048576) {
                    recspec = recspec - 1048576;
                    if (recspec > 1000) {
                        recspec = recspec % 65536;
                    }
                }
                this._monthlyAfterText.set('value', recspec);

            }
            this.interval = recspec;
            this._toggleEndCalculatorVisibility(this.activity.RecurPeriod !== 6);
        },
        _applyYearlyRecurringValues: function () {
            //console.log('_applyYearlyRecurringValues');
            var mon;
            this.rdo_Yearly.set('checked', true);
            var recspec = this.activity.RecurPeriodSpec;
            if (this.activity.RecurPeriod === 7) {
                //select the "every x years on" radio control
                this._rdoYearlyOn.set('checked', true);
                // number of years between occurances...
                if (recspec > 38797312) {
                    recspec = eval(recspec) - 38797312;
                } else {
                    recspec = eval(recspec) - 17825792;
                }
                if (recspec > 1000) {
                    recspec = this._evalRecurperiodspec(recspec, this.activity.RecurPeriod);
                    recspec = recspec % 65536;
                }
                this._yearlyEveryText.set('value', recspec);
                // set the month and day from the start date...
                mon = this.startDate.getMonth();
                mon++;
                this._monthNamesSelect.set('value', mon.toString());

                var d = this.startDate.getDate();
                this._yearDatesSelect.set('value', d.toString());

                this._applyEndCalculatorValues();
            } else if (this.activity.RecurPeriod === 8) {
                //ToDo: This should be right, but something is wrong - either in scheduling them in 7.5.4 or in this logic...
                this._rdoYearlyOnThe.set('checked', true);

                //                console.warn('ToDo: There appears to be problems with this option - Yearly recurring, selecting the n\'st weekday in month.  Check that these are saving correctly in 7.5.4 - they do not seem to be.');

                mon = Math.floor(recspec / 4194304);
                recspec = recspec % 4194304;
                var wDay = Math.floor(recspec / 524288) - 1;
                recspec = recspec % 524288;
                var mWeek = Math.floor(recspec / 65536);
                mWeek++;
                recspec = recspec % 65536;

                this._yearWeeksSelect.set('value', mWeek.toString());
                this._yearWeekdaySelect.set('value', wDay.toString());
                this._yearMonthNamesSelect.set('value', mon.toString());


                this._applyEndCalculatorValues();
            } else if (this.activity.RecurPeriod === 9) {
                this._rdoYearlyEveryAfter.set('checked', true);

                if (recspec > 38797312) {
                    recspec = recspec - 38797312;
                    if (recspec > 1000) {
                        recspec = this._evalRecurperiodspec(recspec, this.activity.RecurPeriod);
                        recspec = recspec % 65536;
                    }
                }
                this._yearlyEveryAfterText.set('value', recspec);

            }
            this.interval = recspec;
            this._toggleEndCalculatorVisibility(this.activity.RecurPeriod !== 9);
        },
        // end databinding controls when opening an existing activity for editing...





        // daily panel handling......................................................................................
        _dailyEveryChanged: function () {
            this._setDailyUI();
            this._applyChangesToActivity();
        },
        _setDailyUI: function () {
            //console.log('_setDailyUI');
            var dailyEveryChecked = this._rdoDailyEvery.get('checked');
            this._dailyEveryText.set('disabled', !dailyEveryChecked);
            this._dailyEveryAfterText.set('disabled', dailyEveryChecked);
            this._dailyUpdateInterval();
            this.activityRecurPeriodCode = this._rdoDailyEvery.get('checked') ? 0 : 1;
            this._toggleEndCalculatorVisibility(dailyEveryChecked);
        },
        // weekly panel handling ....................................................................................
        _weeklyEveryChanged: function () {
            this._setWeeklyUI();
            this._applyChangesToActivity();
        },
        _setWeeklyUI: function () {
            //console.log('_setWeeklyUI');
            var disable = !this._rdoWeeklyEvery.get('checked');
            this._weeklyEveryText.set('disabled', disable);
            this._chkMonday.set('disabled', disable);
            this._chkTuesday.set('disabled', disable);
            this._chkWednesday.set('disabled', disable);
            this._chkThursday.set('disabled', disable);
            this._chkFriday.set('disabled', disable);
            this._chkSaturday.set('disabled', disable);
            this._chkSunday.set('disabled', disable);

            this._weeklyEveryAfterText.set('disabled', !this._rdoWeeklyEveryAfter.get('checked'));
            this._enforceWeekdayChecked();
            this._weeklyUpdateInterval();
            this.activityRecurPeriodCode = this._rdoWeeklyEvery.get('checked') ? 2 : 3;
            this._toggleEndCalculatorVisibility(this._rdoWeeklyEvery.get('checked'));
        },
        _dayChecked: function () {
            this._enforceWeekdayChecked();
            this._calculateEnd();
        },
        _enforceWeekdayChecked: function () {
            var checkedCount = this.countCheckedDays();
            if (checkedCount < 1) {
                var d = this.startDate.getDay();
                switch (d) {
                    case 0:
                        this._chkSunday.set('checked', true);
                        break;
                    case 1:
                        this._chkMonday.set('checked', true);
                        break;
                    case 2:
                        this._chkTuesday.set('checked', true);
                        break;
                    case 3:
                        this._chkWednesday.set('checked', true);
                        break;
                    case 4:
                        this._chkThursday.set('checked', true);
                        break;
                    case 5:
                        this._chkFriday.set('checked', true);
                        break;
                    case 6:
                        this._chkSaturday.set('checked', true);
                        break;
                }
            }
            if (checkedCount > this.occurances) {
                this._setOccurancesAttr(checkedCount);
            }
        },
        getCheckedDays: function () {
            // returns an array of 7 numbers, either 0 or 1 corresponding to the whether
            // the corresponding day is checked or not; 1 means checked 0 means unchecked.
            // The number in the 0 position is sunday, 1 is monday etc.
            return [
                this._chkSunday.get('checked') ? 1 : 0, //'sun': 
                this._chkMonday.get('checked') ? 1 : 0, //'mon': 
                this._chkTuesday.get('checked') ? 1 : 0, //'tue': 
                this._chkWednesday.get('checked') ? 1 : 0, //'wed': 
                this._chkThursday.get('checked') ? 1 : 0, //'thu': 
                this._chkFriday.get('checked') ? 1 : 0, //'fri': 
                this._chkSaturday.get('checked') ? 1 : 0 //'sat': 
            ];
        },
        countCheckedDays: function () {
            var checkedCount = 0;
            var checkedDays = this.getCheckedDays();
            for (var i = 0; i < checkedDays.length; i++) {
                checkedCount += Number(checkedDays[i]);
            }
            return checkedCount;
        },
        // monthly panel handling...................................................................................
        _monthlyOnChanged: function () {
            this._setMonthlyUI();
            if (this._rdoMonthlyAfter.get('checked')) {       //for the other two cases, this has already happened.
                this._applyChangesToActivity();               //                                  <---<<<   <---<<<
            }
        },
        _setMonthlyUI: function () {
            //console.log('_setMonthlyUI');
            var disable = !this._rdoMonthlyOn.get('checked');
            this._monthlyEveryText.set('disabled', disable);
            this._datesSelect.set('disabled', disable);

            disable = !this._rdoMonthlyOnThe.get('checked');
            this._monthlyOnTheText.set('disabled', disable);
            this._weeksSelect.set('disabled', disable);
            this._weekdaySelect.set('disabled', disable);

            this._monthlyAfterText.set('disabled', !this._rdoMonthlyAfter.get('checked'));
            this._monthlyUpdateInterval();
            this.activityRecurPeriodCode = this._rdoMonthlyOn.get('checked') ? 4 : this._rdoMonthlyOnThe.get('checked') ? 5 : 6;
            this._toggleEndCalculatorVisibility(!this._rdoMonthlyAfter.get('checked'));
            if (this.activityRecurPeriodCode < 6) {
                this._calculateEnd();
            }
        },
        _monthlyValidateEndDate: function () {
            if (this.rdo_Monthly.get('checked')) {
                //ToDo:  this logic assumes that the month selected matches
                // the pattern.  For example, if the recurrence is every 6 months and they select
                // a date 7 months away, this will stay in the same month and show a date 
                // that is not actually in the recurrence pattern.
                // Incidentally, I tried the example above in 7.5.4 - and it set the date 5 years later
                // than the date I selected and set occurances to 10.  hmmmm...
                var endDate = this.dtp_endRecur.get('value');
                //console.log('validating end date for monthly recurring... %o', endDate);
                if (this._rdoMonthlyOn.get('checked')) {
                    //make sure the end date matches the date...
                    var correctDate = parseInt(this._datesSelect.get('value'), 10);
                    if (endDate.getDate() !== correctDate) {
                        endDate.setDate(correctDate);
                        this.dtp_endRecur.set('value', endDate);
                        //console.log('montly end date validation failed changing date to %o', endDate);
                        return false;
                    }
                } else if (this._rdoMonthlyOnThe.get('checked')) {
                    //make sure the end date matches the nth weekday...
                    var correctDay = parseInt(this._weekdaySelect.get('value'), 10);
                    var correctWeek = parseInt(this._weeksSelect.get('value'), 10);
                    if (activityUtility.getNthWeekOfMonth(endDate) !== correctWeek || endDate.getDay() !== correctDay) {
                        endDate = activityUtility.setDateToNthWeekDay(endDate, correctWeek, correctDay);
                        this.dtp_endRecur.set('value', endDate);
                        //console.log('montly end date validation failed changing date to %o', endDate);
                        return false;
                    }
                }
            }
            return true;
        },
        // yearly panel handling.....................................................................................
        _yearlyOnChanged: function () {
            this._setYearlyUI();
            this._applyChangesToActivity();
        },
        _setYearlyUI: function () {
            //console.log('_setYearlyUI');
            var disable = !this._rdoYearlyOn.get('checked');
            this._yearlyEveryText.set('disabled', disable);
            this._monthNamesSelect.set('disabled', disable);
            this._yearDatesSelect.set('disabled', disable);

            disable = !this._rdoYearlyOnThe.get('checked');
            this._yearWeeksSelect.set('disabled', disable);
            this._yearWeekdaySelect.set('disabled', disable);
            this._yearMonthNamesSelect.set('disabled', disable);

            this._yearlyEveryAfterText.set('disabled', !this._rdoYearlyEveryAfter.get('checked'));
            this._yearlyUpdateInterval();
            this.activityRecurPeriodCode = this._rdoYearlyOn.get('checked') ? 7 : this._rdoYearlyOnThe.get('checked') ? 8 : 9;
            this._toggleEndCalculatorVisibility(!this._rdoYearlyEveryAfter.get('checked'));
        },
        _yearlyValidateEndDate: function () {
            var valid = true;
            if (this.rdo_Yearly.get('checked')) {
                var endDate = this.dtp_endRecur.get('value');
                var mon = this.startDate.getMonth();
                if (endDate.getMonth() !== mon) {
                    valid = false;
                    endDate.setMonth(mon);
                }
                if (this._rdoYearlyOn.get('checked')) {
                    var dt = this.startDate.getDate();
                    if (endDate.getDate !== dt) {
                        valid = false;
                        endDate.setDate(dt);
                    }
                } else if (this._rdoYearlyOnThe.get('checked')) {
                    //make sure the end date matches the nth weekday...
                    var correctDay = parseInt(this._yearWeekdaySelect.get('value'), 10);
                    var correctWeek = parseInt(this._yearWeeksSelect.get('value'), 10);
                    if (activityUtility.getNthWeekOfMonth(endDate) !== correctWeek || endDate.getDay() !== correctDay) {
                        valid = false;
                        endDate = activityUtility.setDateToNthWeekDay(endDate, correctWeek, correctDay);
                    }
                }
                if (!valid) {
                    this.dtp_endRecur.set('value', endDate);
                }
            }
            return valid;
        },
        _yearlyRecurDateChanged: function () {
            // avoid changing the start date before things have settled down...            
            if (this._applyingActivityData) { return; }
            var month, changed = false;
            //debugger;
            var tempStartDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth(), this.startDate.getDate());
            if (this._rdoYearlyOn.get('checked')) {
                //get the date characteristics from the "every x years on" section...
                month = parseInt(this._monthNamesSelect.get('value'), 10) - 1;
                var dt = parseInt(this._yearDatesSelect.get('value'), 10);
                if (tempStartDate.getMonth() !== month) {
                    tempStartDate.setMonth(month);
                    changed = true;
                }
                if (tempStartDate.getDate() !== dt) {
                    tempStartDate.setDate(dt);
                    changed = true;
                }

            } else if (this._rdoYearlyOnThe.get('checked')) {
                //get the date characteristics from the "The n'st weekday in month" section...
                month = parseInt(this._yearMonthNamesSelect.get('value'), 10) - 1;
                if (tempStartDate.getMonth() !== month) {
                    tempStartDate.setMonth(month);
                    changed = true;
                }
                var dy = parseInt(this._weekdaySelect.get('value'), 10);
                var wk = parseInt(this._weeksSelect.get('value'), 10);
                var compareDate = activityUtility.setDateToNthWeekDay(tempStartDate, wk, dy);
                if (tempStartDate.getDate() !== compareDate.getDate()) {
                    if (compareDate < new Date()) {
                        compareDate = dDate.add(compareDate, 'year', 1);
                        compareDate = activityUtility.setDateToNthWeekDay(compareDate, wk, dy);
                    }
                    tempStartDate = compareDate;
                    changed = true;
                }
            }
            if (changed) {
                //if it is in the past, add a year...
                if (tempStartDate < new Date()) {
                    tempStartDate = dDate.add(tempStartDate, 'year', 1);
                }

                //console.log('one of the yearly recurring select boxes has been changed - causing the start date to change.');

                if (!this.startDateChangedFromParent) {
                    this.onStartDateChanged(tempStartDate);
                }

            }
        },
        // common ui handling........................................................................................
        _intervalChanged: function (newVal) {
            // occurs when the interval value changes on any recurring type.
            this.interval = newVal;
            this._calculateEnd();
        },
        _recurringStartDateChanged: function (newStart) {
            //console.log('firing onStartDateChanged...');
            if (!this.startDateChangedFromParent) {
                this.onStartDateChanged(newStart);
            }
        },
        _endCalcModeChanged: function () {

        },
        _numOccurancesChanged: function (occurances) {
            this.occurances = occurances;
            this._calculateEndDate();
        },
        _endRecurChanged: function (newEnd) {
            if (this._rdoEndOn.get('checked')) {
                if (this._monthlyValidateEndDate() && this._yearlyValidateEndDate()) {
                    this._calculateOccurances();
                }
            }
        },
        _calculateEnd: function () {
            if (this.currentPeriod === 'once') {
                this._applyChangesToActivity();
                return;
            }
            if (this._rdoEndAfter.get('checked')) {
                if (this.rdo_Monthly.get('checked') && !this.startDateChangedFromParent) {
                    this._calculateStartDate();
                }
                this._calculateEndDate();
            } else {
                this._calculateOccurances();
            }
        },
        _calculateStartDate: function () {
            var calculator = this.endCalculators[this.currentPeriod];
            if (calculator && this._rdoEndAfter.get('checked')) {
                this._applyCurrentValuesToCalculator(calculator);
                calculator.set('occurances', this.occurances);
                var startDate = calculator.calculateStartDate();
                this.startDate = startDate;
                this.dtp_startRecur.set('value', startDate);
                if (!this.startDateChangedFromParent) {
                    this.onStartDateChanged(startDate);
                }
            }

        },
        _calculateEndDate: function () {
            var calculator = this.endCalculators[this.currentPeriod];
            if (calculator && this._rdoEndAfter.get('checked')) {
                this._applyCurrentValuesToCalculator(calculator);
                calculator.set('occurances', this.occurances);
                var endDate = calculator.calculateEndDate();
                this.dtp_endRecur.set('value', endDate);
                //IS THIS THE RIGHT PLACE TO CALL THIS?????????????????????   <---<<<   <---<<<
                this._applyChangesToActivity();
            }
        },
        _applyCurrentValuesToCalculator: function (calculator) {
            calculator.set('startDate', this.startDate);
            calculator.set('initialStartDate', this.initialStartDate);
            calculator.set('interval', this.interval);
            calculator.set('activityRecurPeriodCode', this.activityRecurPeriodCode);
        },
        _calculateOccurances: function () {
            var calculator = this.endCalculators[this.currentPeriod];
            if (calculator && this._rdoEndOn.get('checked')) {
                this._applyCurrentValuesToCalculator(calculator);
                calculator.set('endDate', this.dtp_endRecur.get('value'));
                var occ = 1;
                if (calculator.endDate < calculator.startDate) {
                    this.dtp_endRecur.set('value', this.startDate);
                } else {
                    occ = calculator.calculateNumberOfOccurances();
                }
                this.occurances = occ;
                this.num_Occurances.set('value', occ);
                //IS THIS THE RIGHT PLACE TO CALL THIS?????????????????????   <---<<<   <---<<<
                this._applyChangesToActivity();
            }
        },
        _applyChangesToActivity: function () {
            //calculate and set the values of the Recurring fields on the activity
            if (this._applyingActivityData) { return; }
            //console.log('calculating and applying recurring data to activity...');
            if (this.rdo_Once.get('checked')) {
                this.activity.RecurIterations = 0;
                this.activity.RecurPeriod = 0;
                this.activity.RecurPeriodSpec = 0;
                this.activity.Recurring = false;
                return;
            }

            var recperiod = this._getCurrentRecperiod();
            this.activity.RecurPeriod = recperiod;
            var modifier = 0;
            var occurances = this.num_Occurances.get('value');
            switch (recperiod) {
                case 0:
                case 1:
                    this._dailyUpdateInterval();
                    if (recperiod === 1) { occurances = -1; }
                    break;
                case 2:
                    modifier = this._sumWeekDays();
                    this._weeklyUpdateInterval();
                    break;
                case 3:
                    modifier = 1048576;
                    this._weeklyUpdateInterval();
                    occurances = -1;
                    break;
                case 4:
                    modifier = 1048576;
                    this._monthlyUpdateInterval();
                    break;
                case 5:
                    modifier = this._sumMonthly();
                    this._monthlyUpdateInterval();
                    break;
                case 6:
                    modifier = 1048576;
                    this._monthlyUpdateInterval();
                    occurances = -1;
                    break;
                case 7:
                    modifier = 38797312;
                    this._yearlyUpdateInterval();
                    break;
                case 8:
                    modifier = this._sumYearly();
                    this.interval = 1;
                    break;
                case 9:
                    modifier = 38797312;
                    this._yearlyUpdateInterval();
                    occurances = -1;
                    break;
            }
            this.activity.RecurIterations = occurances;
            this.activity.RecurPeriodSpec = modifier + this.interval;
            this.activity.Recurring = true;

            //            console.log('calculated and applied the recuring properties of activity.  interval: ' + this.interval);
            //            console.log('RecurIterations: ' + occurances);
            //            console.log('RecurPeriod: ' + recperiod);
            //            console.log('RecurPeriodSpec: ' + this.activity.RecurPeriodSpec);

        },
        _getCurrentRecperiod: function () {
            if (this.rdo_Daily.get('checked')) {
                return (this._rdoDailyEvery.get('checked')) ? 0 : 1;
            }
            if (this.rdo_Weekly.get('checked')) {
                return (this._rdoWeeklyEvery.get('checked')) ? 2 : 3;
            }
            if (this.rdo_Monthly.get('checked')) {
                return (this._rdoMonthlyOn.get('checked')) ? 4 :
                            (this._rdoMonthlyOnThe.get('checked')) ? 5 : 6;
            }
            if (this.rdo_Yearly.get('checked')) {
                return (this._rdoYearlyOn.get('checked')) ? 7 :
                                (this._rdoYearlyOnThe.get('checked')) ? 8 : 9;
            }
            return 0;
        },
        _sumWeekDays: function () {
            var result = 0;
            if (this._chkSaturday.get('checked')) {
                result += this._weekDayValues['sat'];
            }
            if (this._chkFriday.get('checked')) {
                result += this._weekDayValues['fri'];
            }
            if (this._chkThursday.get('checked')) {
                result += this._weekDayValues['thu'];
            }
            if (this._chkWednesday.get('checked')) {
                result += this._weekDayValues['wed'];
            }
            if (this._chkTuesday.get('checked')) {
                result += this._weekDayValues['tue'];
            }
            if (this._chkMonday.get('checked')) {
                result += this._weekDayValues['mon'];
            }
            if (this._chkSunday.get('checked')) {
                result += this._weekDayValues['sun'];
            }
            //console.log('sum week days: ' + result);
            return result;
        },
        _getNthOccurenceOfWeekDay: function () {
            var weekDay = parseInt(this._weekdaySelect.get('value'), 10);
            var nthWeek = parseInt(this._weeksSelect.get('value'), 10);
            var today = new Date();

            for (var i = 0; i < 7; i++) {
                var d = new Date(today.getFullYear(), today.getMonth(), i + 1);
                if (d.getDay() == weekDay) {
                    return dojo.date.add(d, "day", ((nthWeek - 1) * 7));
                }
            }

        },
        _sumMonthly: function () {
            // used to determine the value for periodspec for activities that occur
            // monthly every nth weekday (i.e. every 3 months on the 3rd Friday).

            var weekDay = parseInt(this._weekdaySelect.get('value'), 10) + 1;
            var nthWeek = parseInt(this._weeksSelect.get('value'), 10);
            return ((weekDay * 524288) + ((nthWeek - 1) * 65536));
        },
        _sumYearly: function () {
            // returns the value for recperiodspec for activities that occur
            // yearly every nth weekday of a specific month (i.e. every 3rd Friday of September).

            var weekDay = parseInt(this._yearWeekdaySelect.get('value'), 10) + 1;
            var monthNum = parseInt(this._yearMonthNamesSelect.get('value'), 10);
            var nthWeek = parseInt(this._yearWeeksSelect.get('value'), 10);
            return ((monthNum * 4194304) + (weekDay * 524288) + ((nthWeek - 1) * 65536));

        },
        _setReadOnly: function (readOnly) {
            var recurringDisableList = ["rdo_Once", "rdo_Daily", "rdo_Weekly", "rdo_Monthly", "rdo_Yearly", "_rdoDailyEvery", "_dailyEveryText", "_rdoDailyEveryAfter", "_dailyEveryAfterText", "_rdoWeeklyEvery", "_weeklyEveryText", "_chkMonday", "_chkTuesday", "_chkWednesday", "_chkThursday", "_chkFriday", "_chkSaturday", "_chkSunday", "_rdoWeeklyEveryAfter", "_weeklyEveryAfterText", "_rdoMonthlyOn", "_monthlyEveryText", "_datesSelect", "_rdoMonthlyOnThe", "_monthlyOnTheText", "_weeksSelect", "_weekdaySelect", "_rdoMonthlyAfter", "_monthlyAfterText", "_rdoYearlyOn", "_yearlyEveryText", "_monthNamesSelect", "_yearDatesSelect", "_rdoYearlyOnThe", "_yearWeeksSelect", "_yearWeekdaySelect", "_yearMonthNamesSelect", "_rdoYearlyEveryAfter", "_yearlyEveryAfterText", "dtp_startRecur", "_rdoEndAfter", "num_Occurances", "_rdoEndOn", "dtp_endRecur"];
            if (readOnly) {
                this._bulkSetProperty(this, recurringDisableList, 'disabled', true);
            } else {
                this._bulkSetProperty(this, recurringDisableList, 'disabled', false);
                this._setUI();
                this._applyActivityData();
            }
        },
        _bulkSetProperty: function (ui, propsList, prop, val) {
            for (var i = 0; i < propsList.length; i++) {
                var ctrl = ui[propsList[i]];
                if (ctrl) {
                    ctrl.set(prop, val);
                }
            }
        },
        // events for main editor...
        onStartDateChanged: function (newStartDate) { },
        onRecurPeriodChanged: function (newRecPer) { }
    });
    return recurringEditor;
});