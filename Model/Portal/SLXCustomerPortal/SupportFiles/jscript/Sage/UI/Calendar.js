/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/Calendar',
        'dojo/_base/declare'
    ],
    function (dijitCalendar, declare) {
        var calendar = declare('Sage.UI.Calendar', dijitCalendar, {
            _dateModifiedExternal: false,
            displayMode: '',
            constructor: function (options) {
                this.displayMode = options.displayMode;
                var self = this;

                //displaymode "popup" is for the calendar defined in Sage/UI/Controls/DatetimePicker.html
                if (this.displayMode === "popup") {
                    dojo.connect(this, "_setValueAttr", function (/*Date|Number*/value, /*Boolean*/priorityChange) {
                        // summary:
                        //		Support set("value", ...)
                        // description:
                        // 		Set the current date and update the UI.  If the date is disabled, the value will
                        //		not change, but the display will change to the corresponding month.
                        // value:
                        //		Either a Date or the number of seconds since 1970.
                        // tags:
                        //      protected
                        if (value) {
                            // convert from Number to Date, or make copy of Date object so that setHours() call below
                            // doesn't affect original value
                            value = new self.dateClassObj(value);
                        }
                        if (self._isValidDate(value)) {
                            //if (!self._isValidDate(self.value) || self.dateFuncObj.compare(value, self.value)) {
                            //SalesLogix update : Commented above condition to allow the clicking on current date so that we can close the popup
                            value.setHours(1, 0, 0, 0); // round to nearest day (1am to avoid issues when DST shift occurs at midnight, see #8521, #9366)

                            if (!self.isDisabledDate(value, self.lang)) {
                                self._set("value", value);

                                // Set focus cell to the new value.   Arguably this should only happen when there isn't a current
                                // focus point.   This will also repopulate the grid, showing the new selected value (and possibly
                                // new month/year).
                                if (self.monthWidget && self.monthWidget.dropDown) {
                                    self.set("currentFocus", value);
                                }

                                if (priorityChange || typeof priorityChange == "undefined") {
                                    self.onChange(self.get('value'));
                                }
                            }
                            // }
                        } else {
                            // clear value, and repopulate grid (to deselect the previously selected day) without changing currentFocus
                            self._set("value", null);
                            self.set("currentFocus", self.currentFocus);
                        }
                    });
                } else {
                    dojo.subscribe("/entity/activity/calendar/schedulerDateChanged", function (data) {
                        (function () {
                            self._dateModifiedExternal = true;
                            self.set('value', data.date);
                            self._dateModifiedExternal = false;
                        })();
                    });
                    /**
                    This will keep the date selected when the month/year changed
                    */
                    dojo.connect(this, "_setCurrentFocusAttr", function (date) {
                        self.set('value', date);
                    });
                }
                this.inherited(arguments);
            },
            onValueSelected: function (date) {
                if (this.displayMode != "popup") {
                    if (!this._dateModifiedExternal) {
                        this._dateModifiedExternal = false;
                        dojo.publish('/entity/activity/calendar/navigationCalendarDateChanged', [date, this]);
                        this._dateModifiedExternal = false;
                    }
                }
            },
            getClassForDate: function (date) {
                var day = date.getDay();
                if ((day == 6) || (day == 0)) {
                    return "dijitCalendarWeekEndDate";
                }
            }
        });
        return calendar;
    });
   