/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define(
    ['dojo/i18n',
        'dojo/date',
        'dijit/Menu',
        'Sage/Data/SingleEntrySDataStore',
        'Sage/Data/SDataServiceRegistry',
        'Sage/Utility/UserOptions',
        'Sage/Utility/Activity',
        'Sage/Utility',
        'Sage/MainView/ActivityMgr/OccurrenceOrSeriesQueryDlg',
        'dojo/i18n!./nls/ActivityScheduler',
        'dojo/_base/declare',
         'dojo/_base/lang',
        'dojo/string'

     ],
    function (i18n, dojoDate, dijitMenu, singleEntrySDataStore, sDataServiceRegistry, userOptionsUtility, activityUtility, utility, occurrenceOrSeriesQueryDlg, nlsResource, declare, dojoLang, dstring) {

        var activityScheduler = declare('Sage.UI.ActivityScheduler', null, {
            _weekStart: null,
            _scheduler: null,
            _schedulerId: 'slxLogixScheduler',
            schedulerContextMenu: null,
            eventConnections: [],
            _menuItems: null,
            _contentWindow: null,
            _iFrameId: null,
            _userOptions: {},
            _schedulerLaunched: false,
            self: this,
            _recurringIcon: '../../images/icons/recurring_14x14.png',
            _attachmentIcon: '../../images/icons/attach_14x14.png',
            _alarmIcon: '../../images/icons/alarm_14x14.png',
            _activityCompleteIcon: '../../images/icons/completed_step_14x14.png',
            _userActivityData: {},
            _currentActivity: {},
            _securityAccessData: [],
            constructor: function (schedulerInstance, schedulerId, contentWindow, iFrameId) {
                dojoLang.mixin(this, nlsResource);
                this._userOptions = {
                    daystarttime: '9',
                    dayendtime: '6',
                    defaultactivity: 'meeting',
                    starttime: '8',
                    endtime: '5',
                    weekstart: '1',
                    numevents: '3',
                    defaultcalendarview: 'month',
                    defaultinterval: 15,
                    displaycontactaccount: '0',
                    rememberusers: true,
                    workweekmon: true,
                    workweektue: true,
                    workweekwed: true,
                    workweekthu: true,
                    workweekfri: true,
                    workweeksat: false,
                    workweeksun: false,
                    workweek: [1, 2, 3, 4, 5],
                    showonopportunities: false,
                    showonregarding: false,
                    showonphonenumber: false,
                    showontime: false
                };

                _scheduler = contentWindow.scheduler; // schedulerInstance;
                _schedulerId = schedulerId;
                this._menuItems = [];
                this._contentWindow = contentWindow;
                this._iFrameId = iFrameId;
                this._preloadCalendarUserOptions();
                var self = this;
                dojo.subscribe("/entity/activity/updateScheduler", function (data) {
                    self._updateSchedulerEvent(data);
                });

                dojo.subscribe("/entity/activity/clearScheduler", function () {
                    self._clearScheduler();
                });

                dojo.subscribe("/entity/activity/addToScheduler", function (data) {
                    self._addSchedulerEvent(data);
                });

                dojo.subscribe("/entity/activity/deleteFromScheduler", function (id) {
                    if (id) {
                        //The activity can be deleted from activity dialog and from context menu on calendar
                        //Delete from activity dialog returns id, delete from activity service doesnt return id
                        if (id.indexOf("result") == -1)
                            self._deleteSchedulerEvent(id);
                    }
                });


            },
            _loadAllEvents: function (data) {
                setTimeout(function () { this._scheduler.parse(data, "json"); }, 100);
            },
            _addSchedulerEvent: function (data) {
                if (data != null) {

                    var dataObj = dojo.clone(data);

                    var jsonObj = [];
                    jsonObj.push(dataObj);
                    self._scheduler.parse(jsonObj, "json");
                }
            },
            _updateSchedulerEvent: function (data) {
                if (data != null) {
                    var dataObj = dojo.clone(data);
                    //Remove the updated activity/event from scheduler and parse the updated object
                    self._scheduler.deleteEvent(dataObj.id);
                    var jsonObj = [];
                    jsonObj.push(dataObj);
                    self._scheduler.parse(jsonObj, "json");
                }
            },
            _deleteSchedulerEvent: function (activityId) {
                _scheduler.deleteEvent(activityId);
            },
            _setCurrentDate: function (date) {
                _scheduler.setCurrentView(date);
            },
            _getSchedulerDate: function () {
                return _scheduler._date;
            },
            _launchScheduler: function () {
                _scheduler.init(_schedulerId, new Date(), this._userOptions['defaultcalendarview']);
                this._schedulerLaunched = true;
                this._userOptions["date"] = _scheduler.date;
                this._userOptions["weekStartDate"] = _scheduler._week_min_date;
                this._userOptions["weekEndDate"] = _scheduler._week_max_date;
                this._userOptions["workWeekStartDate"] = _scheduler._workweek_min_date;
                this._userOptions["workWeekEndDate"] = _scheduler._workweek_max_date;
                dojo.publish('/entity/activity/SchedulerCreated', [this._userOptions, this]);

            },
            _clearScheduler: function () {
                _scheduler.clearAll();
            },
            _clearSchedulerEvents: function (data) {
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        _scheduler.deleteEvent(data[i]);
                    }
                }

            },
            _loadTimelessActivities: function () {
                var ar = [];
                ar.push(_scheduler._mode);
                ar.push(_scheduler._date);
                ar.push(self._getWeekStart(date));
                dojo.publish('/entity/activity/calendar/schedulerDateChanged', [ar, this]);

            },
            _initScheduler: function () {
                
                _scheduler.config.scroll_hour = this._userOptions['daystarttime'];
                _scheduler.config.workWeek = this._userOptions['workweek'];
                _scheduler.config.workHours = [0, this._userOptions['daystarttime'] * 60, this._userOptions['dayendtime'] * 60, 24 * 60];
                _scheduler.config.eventsMaxCount = this._userOptions["numevents"];
                _scheduler.locale = {
                    date: this.scheduler_dates, // from nls file
                    labels: this.scheduler_labels // from nls file
                };

                /**
                * Function : Custom date format 
                * Views : Day
                */
                _scheduler.templates.day_scale_date = function (d) {
                    var dayFormat = _scheduler.date.date_to_str("%l");
                    return dayFormat(d);
                };

                _scheduler.templates.day_date = function (dt) {
                    return activityUtility.formatLongDate(dt);
                };

                _scheduler.templates.week_date = function (d1, d2) {

                    var formatFullMonthAndDate = _scheduler.date.date_to_str("%F %d");
                    var formatDatePartandFullYear = _scheduler.date.date_to_str("%d, %Y");

                    if (d1.getMonth() != d2.getMonth()) {
                        //example : April 30 - May 06, 2012
                        //return formatFullMonthAndDate(d1) + " &ndash; " + scheduler.templates.day_date(scheduler.date.add(d2, -1, "day"));
                        return activityUtility.formatLongDate(d1) + " &ndash; " + activityUtility.formatLongDate(_scheduler.date.add(d2, -1, "day"));
                    } else {
                        //example : April 16 - 22, 2012
                        var d3 = scheduler.date.add(d2, -1, "day");
                        // return formatFullMonthAndDate(d1) + " &ndash; " + formatDatePartandFullYear(d3);
                        return activityUtility.formatLongDate(d1) + " &ndash; " + activityUtility.formatLongDate(_scheduler.date.add(d2, -1, "day"));
                    }


                };

                var isValidId = function (id) {
                    var valid = false;
                    if (id) {
                        if (id.trim() != '') {
                            valid = true;
                        }
                    }
                    return valid;
                };


                var activityFormat = _scheduler.date.date_to_str("%g:%i %A");
                var eventFormat = _scheduler.date.date_to_str("%m/%d/%Y");
                _scheduler.templates.tooltip_text = function (start, end, event) {
                    var type = event.type;
                    var toolTipText = "";
                    var subType = (event.subType == null) ? "" : event.subType.replace("at", "");
                    if (type == "event") {
                        toolTipText = "<b>" + self.tooltipType + " :</b> Event<br><b>" + self.tooltipDayType + " :</b> " + subType;
                        toolTipText += "<br/><b>" + self.tooltipStartDate + " :</b> " + activityUtility.formatEventDate(start);
                        toolTipText += "<br/><b>" + self.tooltipEndDate + " :</b> " + activityUtility.formatDateAdd(end, "day", -1);
                        if (event.location) toolTipText += "<br/><b>" + self.tooltipLocation + " :</b> " + event.location;
                        if (event.description) toolTipText += "<br/><b>" + self.tooltipDescription + " :</b> " + event.description;
                    } else {
                        toolTipText = "<b>" + self.tooltipTime + " :</b> " + activityFormat(start) + " - " + activityFormat(end);
                        if (isValidId(event.leadId)) {
                            if (event.leadName)
                                toolTipText += "<br/><b>" + self.tooltipLeadName + " :</b> " + event.leadName;
                            if (event.accountName)
                                toolTipText += "<br/><b>" + self.tooltipCompanyName + " :</b> " + event.accountName;
                        } else {
                            if (event.contactName)
                                toolTipText += "<br/><b>" + self.tooltipContactName + " :</b> " + event.contactName;
                            if (event.accountName)
                                toolTipText += "<br/><b>" + self.tooltipAccountName + " :</b> " + event.accountName;
                        }

                        if (event.phoneNumber) toolTipText += "<br/><b>" + self.tooltipPhoneNumber + " :</b> " + event.phoneNumber;
                        if (event.location) toolTipText += "<br/><b>" + self.tooltipLocation + " :</b> " + event.location;
                        if (event.regarding) toolTipText += "<br/><b>" + self.tooltipRegarding + " :</b> " + event.regarding;
                        if (event.priority) toolTipText += "<br/><b>" + self.tooltipPriority + " :</b> " + event.priority;
                        if (event.notes) toolTipText += "<br/><b>" + self.tooltipNotes + " :</b> " + event.notes;

                    }
                    return toolTipText;
                };
                _scheduler.clearAll();
                var self = this;

              

                /**
                * Function : Defining Work week 
                * Views : work week
                */
                _scheduler.attachEvent("onTemplatesReady", function () {
                    //Set work week
                    _scheduler.date.workweek_start = _scheduler.date.WorkWeekStart;
                    _scheduler.templates.workweek_date = _scheduler.templates.week_date;
                    _scheduler.templates.workweek_scale_date = _scheduler.templates.week_scale_date;
                    _scheduler.date.add_workweek = function (date, inc) { return _scheduler.date.add(date, inc * 7, "day"); };
                    _scheduler.date.get_workweek_end = function (date) {
                        var shift = self._userOptions['workweek'][(self._userOptions['workweek'].length) - 1] - self._userOptions['workweek'][0];
                        return _scheduler.date.add(date, shift, "day");
                    };



                });
                _scheduler.date.WorkWeekStart = function (date) {
                    var userWeekStart = self._userOptions["workweek"][0];
                    if (date == null) {
                        date = new Date();
                    }
                    var shift = date.getDay();
                    shift = userWeekStart - shift;
                    var stDate = _scheduler.date.add(date, shift, "day");
                    if (stDate > date) {
                        stDate = _scheduler.date.add(stDate, -7, "day");
                    }
                    return _scheduler.date.date_part(stDate);
                };

                /**
                * Function : Event title bar- Change background image for unconfirmed activities
                * Views : Day and Week
                */
                _scheduler.templates.event_title_class = function (start, end, event) {
                    var mode = _scheduler.getState().mode;
                    if (mode !== "month" && event.type !== "event") {
                        if (!event.confirmed) {
                            return "pending";
                        }
                    }
                    return "";
                };

                _scheduler.date.getDay = function (value) {
                    var retValue = value;
                    if (value.length > 1) {
                        var daysArr = [];
                        daysArr["SUNDAY"] = 0;
                        daysArr["MONDAY"] = 1;
                        daysArr["TUESDAY"] = 2;
                        daysArr["WEDNESDAY"] = 3;
                        daysArr["THURSDAY"] = 4;
                        daysArr["FRIDAY"] = 5;
                        daysArr["SATURDAY"] = 6;
                        retValue = daysArr[value.toUpperCase()];
                    }
                    if (!retValue) retValue = 1;
                    return retValue;

                };


                /**
                * Function : Event header - Adding Icons
                * Views : Day and Week
                */
                _scheduler.templates.event_header = function (start, end, ev) {
                    var html = "";
                    var timeFormatDayView = _scheduler.date.date_to_str("%g:%i %A");
                    var timeFormatWeekView = _scheduler.date.date_to_str("%g:%i");
                    if (ev.iconSrc)
                        html += '<img src="' + ev.iconSrc + '" style="float:left;padding-right:4px;"/>';

                    if (ev["recurring"])
                        html += '  <img src="' + self._recurringIcon + '" style="float:left;padding-right:4px;"/>';


                    //Display attachment and Alarm icons only on day view
                    if (_scheduler._mode === "day") {
                        if (ev["attachment"])
                            html += '  <img src="' + self._attachmentIcon + '" style="float:left;padding-right:4px;"/>';

                        if (ev["alarm"])
                            html += '  <img src="' + self._alarmIcon + '" style="float:left;padding-right:4px;"/>';
                    }

                    if (ev["id"].toString().indexOf("-hist") > 0)
                        html += '  <img src="' + self._activityCompleteIcon + '" style="float:left;padding-right:4px;"/>';

                    if (_scheduler._mode === "day") {
                        html += timeFormatDayView(start) + "-" + timeFormatDayView(end);
                    } else {
                        html += timeFormatWeekView(start) + "-" + timeFormatWeekView(end);
                    }


                    return html;
                },

                /**
                * Function : Event text - display details based on user options
                * Views : Day and Week
                */
                _scheduler.templates.event_text = function (start, end, ev) {
                    var evText = "";
                    var timeFormat = _scheduler.date.date_to_str("%g:%i %A");
                    if (_scheduler._mode !== "month") {

                        var contactId = ev["contactId"];
                        var contactName = ev["contactName"];
                        var leadId = ev["leadId"];
                        var leadName = ev["leadName"];
                        var accountId = ev["accountId"];
                        var accountName = ev["accountName"];
                        var opportunityId = ev["opportunityId"];
                        var opportunityName = ev["opportunity"];
                        var contactText = "";
                        var accountText = "";
                        var iconAdded = false;

                        if (iconAdded) evText += "</br>";

                        if (isValidId(leadId) && accountName) {
                            if (leadName) {

                                contactText = '<a href="javascript:void(window.parent.location =\'../../Lead.aspx?entityid=' + leadId + '\')" >' + leadName + '</a><br>';
                            }
                            accountText = '<a href="javascript:void(window.parent.location =\'../../Lead.aspx?entityid=' + leadId + '\')" >' + accountName + '</a><br>';
                        } else {
                            if (isValidId(accountId) && accountName) {
                                accountText = '<a href="javascript:void(window.parent.location = \'../../Account.aspx?entityid=' + accountId + '\')">' + accountName + '</a><br>';
                            }
                            if (isValidId(contactId)) {
                                contactText = '<a href="javascript:void(window.parent.location =\'../../Contact.aspx?entityid=' + contactId + '\')" >' + contactName + '</a><br>';
                            }
                        }

                        switch (self._userOptions["displaycontactaccount"]) {
                            case "0":
                                evText += contactText;
                                break;
                            case "1":
                                evText += accountText;
                                break;
                            case "2":
                                evText += contactText;
                                evText += accountText;
                                break;
                            case "3":
                                evText += accountText;
                                evText += contactText;
                                break;
                            case "4":
                                evText += "";
                                break;
                        }
                        if (self._userOptions["showonopportunities"] && isValidId(opportunityId)) {
                            evText += '<a href="javascript:void(window.parent.location =\'../../Opportunity.aspx?entityid=' + opportunityId + '&modeid=Detail\')" >' + opportunityName + '</a><br>';
                        }
                        if (self._userOptions["showonphonenumber"] && ev["phoneNumber"]) {
                            evText += ev["phoneNumber"] + "<br/>";
                        }
                        if (self._userOptions["showonregarding"] && ev["regarding"]) {
                            evText += ev["regarding"] + "<br/>";
                        }
                        if (self._userOptions["showontime"]) {
                            evText += timeFormat(start) + "-" + timeFormat(end) + "<br/>";
                        }
                        if (ev["location"]) {
                            evText += ev["location"] + "<br/>";
                        }
                        if (ev["priority"]) {
                            evText += ev["priority"] + "<br/>";
                        }
                        if (ev["notes"]) {
                            evText += ev["notes"];
                        }
                    }
                    else {
                        evText = ev.text;
                    }
                    return evText;
                };

                _scheduler.date.week_start = function (date) {
                    var userWeekStart = self._userOptions["weekstart"];
                    if (date == null) {
                        date = new Date();
                    }
                    var shift = date.getDay();
                    shift = userWeekStart - shift;
                    var stDate = _scheduler.date.add(date, shift, "day");
                    if (stDate > date) {
                        stDate = _scheduler.date.add(stDate, -7, "day");
                    }
                    return _scheduler.date.date_part(stDate);
                };

                _scheduler.date.arraySort = function (a, b) {
                    return a - b;
                };

                _scheduler.addEventNow = function (start, end, type) {
                    var sdate, edate, duration;
                    //On Month view set current time to the date selected
                    if (start == null) {
                        if (_scheduler._mode === 'month') {
                            sdate = activityUtility.roundDateToNextQuarterHour(new Date());
                        } else {
                            sdate = new Date();
                        }
                    } else {
                        var nDate = new Date(start);
                        if (_scheduler._mode === 'month') {
                            nDate.setMinutes(new Date().getMinutes());
                            nDate.setHours(new Date().getHours());
                            sdate = activityUtility.roundDateToNextQuarterHour(nDate);
                        } else {
                            sdate = nDate;
                        }
                    }
                    edate = end == null ? sdate : new Date(end);
                    if (type == null || typeof type == "object") {
                        type = self._userOptions['defaultactivity'];
                    }
                    if (end != null) {
                        duration = dojo.date.difference(sdate, new Date(end), 'minute');
                    } else {
                        duration = '60';
                    }
                    var svc = Sage.Services.getService('ActivityService');
                    if (type == "event") {
                        var args = {
                            StartDate: Sage.Utility.Convert.toIsoStringFromDate(sdate),
                            EndDate: Sage.Utility.Convert.toIsoStringFromDate(edate)
                        };

                        svc.scheduleEvent(args);
                    } else {
                        if (type != null) {
                            if (type.toLowerCase().indexOf("phone") > -1) {
                                type = "PhoneCall";
                            } else if (type.toLowerCase().indexOf("meeting") > -1) {
                                type = "Meeting";
                            } else if (type.toLowerCase().indexOf("to") > -1) {
                                type = "ToDo";
                            } else if (type.toLowerCase().indexOf("personal") > -1) {
                                type = "PersonalActivity";
                            } else {
                                type = "Meeting";
                            }
                        }
                        svc.scheduleActivity({
                            type: type,
                            preConfigured: {
                                StartDate: Sage.Utility.Convert.toIsoStringFromDate(sdate),
                                Duration: duration
                            }
                        });
                    }
                };
                _scheduler.xy.menu_width = 0;
                _scheduler.config.details_on_dblclick = true;
                _scheduler.config.details_on_create = true;
                _scheduler.attachEvent("onClick", function () { return false; });


                //eventId - activity: {activityId}-{userId}-act
                //eventId - history: {activityId}-{userId}-hist
                //eventId - event: {activityId}-{userId}-evt
                _scheduler.showLightbox = function (eventId) {
                    if (eventId != null && eventId != undefined) {
                        if (typeof eventId == "string") {
                            var eId = eventId.replace("0:", "");
                            var eIdArr = eId.split("-");
                            if (eIdArr[2] == "act") {
                                //If unconfirmed Activity open confirmation dialog
                                // if (eventId.indexOf("0:") > -1 && _scheduler._events[eventId] && !_scheduler._events[eventId].confirmed) {
                                if (_scheduler._events[eventId] && !_scheduler._events[eventId].confirmed) {
                                    //Passing activityId and Userid 
                                    Sage.Link.confirmActivityFor(eIdArr[0], eIdArr[1]);
                                } else {
                                    //Sage.Link.editActivity(eIdArr[0]);
                                    Sage.Link.editActivity(eIdArr[0], false, eIdArr[1]);
                                }
                            } else if (eIdArr[1] == "evt" || eIdArr[2] == "evt") {
                                Sage.Link.editEvent(eIdArr[0]);
                            } else if (eIdArr[1] == "hist" || eIdArr[2] == "hist") {
                                Sage.Link.editHistory(eIdArr[0]);
                            }
                        }
                    }
                };
                _scheduler.getCalendarEventID = function (eventId) {
                    var cEventId = eventId;
                    if (eventId != null && eventId != undefined) {
                        if (typeof eventId == "string") {
                            eventId = eventId.replace("0:", "");
                            var eId = eventId.split("-");
                            cEventId = eId[0];
                        }
                    }
                    return cEventId;
                };

                _scheduler.getCalendarEventUserID = function (eventId) {
                    var cEventUserId = eventId;
                    if (eventId != null && eventId != undefined) {
                        if (typeof eventId == "string") {
                            eventId = eventId.replace("0:", "");
                            var eId = eventId.split("-");
                            cEventUserId = eId[1];
                        }
                    }
                    return cEventUserId;
                };

                _scheduler.goToActivityAssociation = function (associationType, eventId) {
                    var associationId = null;
                    if (_scheduler._events && _scheduler._events[eventId]) {
                        switch (associationType) {
                            case "Contact":
                                associationId = _scheduler._events[eventId].contactId;
                                break;
                            case "Account":
                                associationId = _scheduler._events[eventId].accountId;
                                break;
                            case "Lead":
                                associationId = _scheduler._events[eventId].leadId;
                                break;
                            case "Opportunity":
                                associationId = _scheduler._events[eventId].opportunityId;
                                break;
                            case "Ticket":
                                associationId = _scheduler._events[eventId].ticketId;
                                break;
                        }
                    }

                    if (isValidId(associationId)) {
                        Sage.Link.entityDetail(associationType, associationId);
                    }
                };

                _scheduler.openActivity = function (eventId) {
                    _scheduler.showLightbox(eventId);
                };
                _scheduler.completeActivity = function (eventId) {
                    Sage.Link.completeActivity(_scheduler.getCalendarEventID(eventId));
                };

                _scheduler.getMenuActivityAction = function (eventId, actionType) {
                    if (!eventId)
                        return false;
                    var allowAction = false;
                    var eventUserId = _scheduler.getCalendarEventUserID(eventId);
                    var activityLeaderUserId = _scheduler._events[eventId]["leaderUserId"];
                    var currentUserId = utility.getClientContextByKey('userID');
                    var confirmed = _scheduler._events[eventId]["confirmed"] || false;
                    var allowDelete = _scheduler._events[eventId]["allowDelete"];
                    var allowEdit = _scheduler._events[eventId]["allowEdit"];

                    switch (actionType) {
                        case "delete":
                            if (allowDelete) {
                                if (eventUserId === activityLeaderUserId) {
                                    //Delete the activity
                                    allowAction = "delete";
                                } else if (confirmed) {
                                    //Decline activity by sending activityId and memberId to delete Activity service
                                    //Server side will take care of declining if its composite key
                                    allowAction = "declineConfirmed";
                                } else {
                                    //Decline the activity
                                    allowAction = "decline";
                                }
                            } else if (currentUserId === eventUserId) {
                                if (currentUserId === activityLeaderUserId) {
                                    allowAction = "delete";
                                } else if (confirmed) {
                                    allowAction = "declineConfirmed";
                                } else {
                                    allowAction = "decline";
                                }
                            } else {
                                allowAction = false;
                            }
                            break;
                        case "complete":
                            if (confirmed && eventUserId === activityLeaderUserId && allowEdit) {
                                allowAction = true;
                            }
                            break;
                    }
                    return allowAction;
                };

                _scheduler.deleteActivity = function (eventId) {
                    var activityId = _scheduler.getCalendarEventID(eventId);
                    Sage.Link.deleteActivity(activityId);
                };

                _scheduler.declineConfirmedUserActivity = function (eventId) {
                    // If this is a member, then decline the activity - do not delete
                    var activityId = _scheduler.getCalendarEventID(eventId);
                    var userId = _scheduler.getCalendarEventUserID(eventId);
                    var activityLeaderUserId = _scheduler._events[eventId]["leaderUserId"];

                    activityId = activityId.indexOf(';') > 0 ? activityId.substring(0, 12) : activityId;
                    var activityObj = {
                        "$key": activityId,
                        "Leader": { "$key": activityLeaderUserId }
                    };

                    var activityService = Sage.Services.getService('ActivityService');
                    activityService.declineMemberConfirmation(activityObj, userId);
                };

                _scheduler.declineActivity = function (eventId) {
                    var calEventId = _scheduler.getCalendarEventID(eventId);
                    var eventUserId = _scheduler.getCalendarEventUserID(eventId);
                    var activityService = Sage.Services.getService('ActivityService');
                    activityService.confirmActivityFor(calEventId, eventUserId, self._loadNotification, self);
                };

                _scheduler.deleteActivityEvent = function (eventId) {
                    Sage.Link.deleteEvent(_scheduler.getCalendarEventID(eventId));
                };

                _scheduler.attachEvent("onEventAdded", function (eventId, eventObject) {
                    if (typeof eventId != "string") {
                        _scheduler.addEventNow(eventObject.start_date, eventObject.end_date, 'atAppointment');
                        _scheduler.deleteEvent(eventId);
                    }
                });

                _scheduler.attachEvent("onBeforeEventChanged", function (eventObject, nativeEvent, isNew) {
                    if (isNew) {
                        switch (this._mode) {
                            case "day":
                            case "week":
                            case "workweek":
                                _scheduler.addEventNow(eventObject.start_date, eventObject.end_date, self._userOptions['defaultactivity']);
                                _scheduler.deleteEvent(eventObject.id);
                                break;
                            case "month":
                                var endDate = eventObject.end_date;
                                if (dojo.date.compare(eventObject.end_date, eventObject.start_date) > 0) {
                                    endDate = dojo.date.add(eventObject.end_date, "day", -1);
                                }
                                _scheduler.addEventNow(eventObject.start_date, endDate, 'event');
                                _scheduler.deleteEvent(eventObject.id);
                                break;
                        }

                    } else {
                        if (!eventObject.allowEdit) {
                            return false;
                        }
                        var eventObj = {
                            Id: eventObject.id,
                            Text: eventObject.text,
                            StartDate: eventObject.start_date,
                            Alarm: eventObject.alarm,
                            EndDate: Sage.Utility.Convert.toIsoStringFromDate(eventObject.end_date),
                            AlarmMinutesBefore: eventObject.alarmMinutesBefore || -15,
                            Duration: dojo.date.difference(eventObject.start_date, eventObject.end_date, 'minute')
                        };
                        if (typeof eventObject.id == "string") {
                            if (eventObject.id && eventObject.id.indexOf("-act") > 0) {
                                eventObj.Id = _scheduler.getCalendarEventID(eventObject.id);
                                eventObj.UserId = _scheduler.getCalendarEventUserID(eventObject.id);

                                if (eventObj.AlarmMinutesBefore) {
                                    eventObj.AlarmTime = dojo.date.add(eventObj.StartDate, "minute", eventObj.AlarmMinutesBefore);
                                    eventObj.AlarmTime = Sage.Utility.Convert.toIsoStringFromDate(eventObj.AlarmTime);
                                }
                                eventObj.StartDate = Sage.Utility.Convert.toIsoStringFromDate(eventObj.StartDate);
                                self._currentActivity = eventObj;
                                if (eventObject.id.indexOf(";") > 0) {
                                    //Recurrence activity
                                    //Show the edit recurrence dialog 
                                    self.onEditRecurrenceActivity(eventObj.Id);
                                } else {
                                    //Need to update UserActivity record to update the Alarm time
                                    //And then update Activity record for start date and duration
                                    self._updateUserActivity();
                                }
                            } else if (eventObject.id && eventObject.id.indexOf("-evt") > 0) {
                                eventObj.Id = eventObject.id.replace("-evt", "");
                                eventObj.EndDate = dojo.date.add(eventObject.end_date, "day", -1);
                                self._updateEvent(eventObj);
                            }
                        }
                    }
                    return true;
                });
                _scheduler.attachEvent("onViewChange", function (mode, date) {

                    var dataObj = {};
                    dataObj.mode = mode;
                    dataObj.date = date;
                    dataObj.weekStartDate = _scheduler._week_min_date;
                    dataObj.weekEndDate = _scheduler._week_max_date;
                    dataObj.workWeekStartDate = _scheduler._workweek_min_date;
                    dataObj.workWeekEndDate = _scheduler._workweek_max_date;

                    dojo.publish('/entity/activity/calendar/schedulerDateChanged', [dataObj, this]);
                });

                _scheduler.attachEvent("onContextMenu", function (eventId, nativeEventObject) {

                    var pos = _scheduler._mouse_coords(nativeEventObject);
                    var start = _scheduler._min_date.valueOf() + (pos.y * _scheduler.config.time_step + (_scheduler._table_view ? 0 : pos.x) * 24 * 60) * 60000;
                    start = _scheduler._correct_shift(start);

                    self._bindContextMenu(eventId, start);
                });
                var schedulerHourFormat = _scheduler.date.date_to_str("%g %A");
                _scheduler.config.hour_size_px = (60 / this._userOptions['defaultinterval']) * 42;
                // _scheduler.config.hour_size_px = 84;

                _scheduler.templates.hour_scale = function (date) {
                    html = "";
                    for (var i = 0; i < 60 / self._userOptions['defaultinterval']; i++) {

                        if (i === 0) {
                            html += "<div style='height:21px;line-height:21px;border-bottom: 1px solid #DcDcDc;'>" + schedulerHourFormat(date) + "</div>";
                            date = _scheduler.date.add(date, self._userOptions['defaultinterval'], "minute");
                        } else {
                            html += "<div style='height:21px;line-height:21px;'></div>";
                        }
                    }
                    return html;
                };


                _scheduler.render_event_bar = function (ev) {

                    //this._cols will have widths of each visible columns in day, week and workweek views
                    //if the width is 0, that means that column is not visible in calendar(workweek view skipped days), so ignore rendering 
                    if (this._cols[ev._sday] == 0)
                        return;

                    var parent = this._rendered_location;
                    //this_colsS.heights will have stating position y coordinates of each week
                    var x = this._colsS[ev._sday];
                    var x2 = this._colsS[ev._eday];
                    if (x2 == x) x2 = this._colsS[ev._eday + 1];
                    var hb = this.xy.bar_height;

                    var y = this._colsS.heights[ev._sweek] + (this._colsS.height ? (this.xy.month_scale_height + 2) : 2) + (ev._sorder * hb);

                    var d = document.createElement("DIV");
                    var cs = ev._timed ? "dhx_cal_event_clear" : "dhx_cal_event_line";
                    var cse = _scheduler.templates.event_class(ev.start_date, ev.end_date, ev);
                    if (cse) cs = cs + " " + cse;

                    var bg_color = (ev.color ? ("background-color:" + ev.color + ";") : "");
                    var color = (ev.textColor ? ("color:" + ev.textColor + ";") : "");
                    var html = "";

                    var arrowHeight = 10;
                    //min height needed = height of event bar + 2px space + arrow height
                    var minHeightNeeded = (this.xy.month_scale_height + arrowHeight) + 2;
                    //remaining height = next row starting position - current height
                    var remainingHeight = this._colsS.heights[ev._sweek + 1] - y;


                    //On month view, on a single day, if there are more items and and not enough space on that cell
                    //show an down arrow which will take to the day view to show all the events.
                    //Check if we have enough space to render a bar and the arrow
                    //If Yes display the bar
                    if (this._mode !== 'month' || (this._mode === 'month' && (remainingHeight > minHeightNeeded))) {
                        var eventbarWidth = x2 - x - 15;
                        if (ev["id"].toString().indexOf("-evt") === -1) {
                            x += 5;
                            eventbarWidth = x2 - x - 8;
                        }

                        html = '<div event_id="' + ev.id + '" class="' + cs + '" style="position:absolute; top:' + y + 'px; left:' + x + 'px; width:' + eventbarWidth + 'px;' + color + '' + bg_color + '' + (ev._text_style || "") + '" id ="' + _scheduler.uid() + '">';

                        if (ev._timed) {
                            if (ev.iconSrc) {
                                html += '<img src="' + ev.iconSrc + '" style="float:left;padding-right:4px;"/>';
                            }
                            if (ev["id"].toString().indexOf("-hist") > 0)
                                html += '  <img src="' + self._activityCompleteIcon + '" style="float:left;padding-right:4px;"/>';


                            html += _scheduler.templates.event_bar_date(ev.start_date, ev.end_date, ev);
                        }
                        html += _scheduler.templates.event_bar_text(ev.start_date, ev.end_date, ev) + '</div>';
                        html += '</div>';
                    } else if (remainingHeight > (arrowHeight + 2)) {
                        //If remaining height is more than the space needed for arrow, display arrow button
                        var uId = _scheduler.uid();
                        //console.log("inside if-->else-->y:%o,x:%o,x2:%o,uId:%o", y, x, x2, uId);
                        html = '<div style="position:absolute; top:' + y + 'px; left:' + x + 'px;width:' + (x2 - x - 5) + 'px;" id ="' + uId + '">';
                        html += '<a title="' + self.tooltipMoreActivities + '" href ="javascript:window.scheduler.setCurrentView(new Date(\'' + ev.start_date + '\'),\'day\');">';
                        html += '<img src="../../images/CalendarMoreArrow.png" style="float:right" />';
                        html += '</a></div>';

                    } else {
                        //If remaining height is less than the arrow button height, hide the event
                        html = '<div></div>';
                    }
                    d.innerHTML = html;
                    this._rendered.push(d.firstChild);
                    parent.appendChild(d.firstChild);
                };


                this.eventConnections.push(dojo.connect(document.body, 'onclick', this, '_bodyClicked'));
                this.eventConnections.push(dojo.connect(window.parent.document.body, 'onclick', this, '_bodyClicked'));

                this._bindContextMenu(null, new Date());
            
            },

            _loadNotification: function (notificationId) {
                this._notificationData = false;
                if (!this._notificationStore) {
                    this._notificationStore = new singleEntrySDataStore({
                        include: ['Activity', '$descriptors'],
                        resourceKind: 'userNotifications',
                        service: sDataServiceRegistry.getSDataService('system')
                    });
                }
                this._notificationStore.fetch({
                    predicate: "'" + notificationId + "'",
                    onComplete: this._receivedNotification,
                    onError: this._requestFailure,
                    scope: this
                });
            },
            _requestFailure: function () {
                console.warn('error requesting data %o', arguments);
                //sageDialogs.showError(this.failedLoadingDataMsg);
            },
            _receivedNotification: function (notification) {
                this._notificationData = notification;
                var activityService = Sage.Services.getService('ActivityService');
                activityService.declineConfirmation({
                    notification: this._notificationData,
                    success: this._successfulDeclineConfirmation,
                    failure: this._failedAcceptDecline,
                    scope: this
                });
            },
            _successfulDeclineConfirmation: function () {
                dojo.publish('/entity/activity/decline', [this._getActivityDataFromNotificationData(), null]);
                dojo.publish('/entity/userNotification/delete', [this._notificationData['$key'], this]);
            },
            _getActivityDataFromNotificationData: function () {
                var activityId = null;
                var userId = null;
                if (this._notificationData) {
                    if (this._notificationData.Activity) {
                        activityId = this._notificationData.Activity.$key;
                    }
                    if (this._notificationData.ToUser) {
                        userId = this._notificationData.ToUser.$key;
                    }
                }
                var actObj = { 'activityId': activityId, 'userId': userId };
                return actObj;
            },
            onEditRecurrenceActivity: function (actId) {
                //Summary:
                //          Show separate instance of this dialog instead calling link.editActivity, as we don't need 
                //          to show the activity edit dialog and we can just update the time of activity

                if (!this._editOccSeriesDlg) {
                    //Disabling the occurrence series option on the dialog as we allow drag and drop in calendar only for single occurrence 
                    this._editOccSeriesDlg = new occurrenceOrSeriesQueryDlg({ id: 'editOccSeriesQueryCalendar', mode: 'edit', disableSeriesOption: 'disabled' });
                    //dojo.connect(this._editOccSeriesDlg, 'onSelectSeries', this, function (actid) {
                    //    this._currentActivity.Id = actid.substring(0, 12);
                    //    this._updateUserActivity();
                    //});
                    dojo.connect(this._editOccSeriesDlg, 'onSelectOccurrence', this, function (actid, sDate) {
                        this._updateActivity(this._currentActivity);
                    });
                }
                this._editOccSeriesDlg.set('activityId', actId);
                this._editOccSeriesDlg.show();
            },
            _bodyClicked: function () {
                if (this.schedulerContextMenu && this.schedulerContextMenu.isShowingNow) {
                    this.schedulerContextMenu._popupWrapper.style.display = 'none';
                }
            },
            _updateUserActivity: function () {
                var activityObj = this._currentActivity;
                var request = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('system'));
                request.setResourceKind('userActivities');
                var key = dojo.string.substitute('"ActivityId=${0};UserId=${1}"', [activityObj.Id, activityObj.UserId]);
                request.setResourceSelector(key);
                this._userActivityData = {
                    $key: key,
                    Id: activityObj.Id,
                    StartDate: activityObj.StartDate,
                    Alarm: activityObj.Alarm,
                    Duration: activityObj.Duration
                };
                if (activityObj.AlarmMinutesBefore) {
                    this._userActivityData.AlarmTime = activityObj.AlarmTime;
                }
                request.update(this._userActivityData, {
                    scope: this,
                    success: function (act) {
                        this._updateActivity();
                    },
                    failure: function (e) {
                        console.log("User activity update failed");
                    }
                });
            },
            _updateActivity: function (activityObj) {

                if (!activityObj)
                    activityObj = this._userActivityData;

                activityObj.$key = activityObj.Id;

                var request = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('system'));
                request.setResourceKind('activities');
                request.setResourceSelector(dojo.string.substitute('"${0}"', [activityObj.$key]));
                request.update(activityObj, {
                    success: function (act) {
                        var actIds = [];
                        //console.log("activity updated");
                        var actId = activityObj.$key.substring(0, 12);
                        for (var i in this._scheduler._events) {
                            var evt = this._scheduler._events[i];
                            if (evt.id.indexOf(actId) > -1) {
                                actIds.push(evt.id);
                            }
                        }
                        if (actIds) {
                            //Remove all occurrences of the activity from scheduler
                            for (var i = 0; i < actIds.length; i++) {
                                this._scheduler.deleteEvent(actIds[i]);
                            }
                        }
                        //The activity being dragged/updated
                        dojo.publish("/entity/activity/activityScheduler/reloadActivity", [actId, this]);
                        if (actId !== act.$key) {
                            //Newly created activity when editing single occurrence
                            dojo.publish("/entity/activity/activityScheduler/reloadActivity", [act.$key, this]);
                        }
                    },
                    failure: function () {
                        console.log("activity update failed");
                    },
                    scope: dojo.global
                });
            },
            _getWeekStart: function (date) {
                var userWeekStart = this._userOptions["weekstart"];
                if (date == null) {
                    date = new Date();
                }
                var shift = date.getDay();
                shift = userWeekStart - shift;
                var stDate = _scheduler.date.add(date, shift, "day");
                if (stDate > date) {
                    stDate = _scheduler.date.add(stDate, -7, "day");
                }
                return _scheduler.date.date_part(stDate);
            },
            _getWorkWeekStart: function (date) {

            },
            _getMonthStart: function (date) {
                return date.setDate(1);
            },
            _updateEvent: function (eventObj) {
                var request = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'));
                request.setResourceKind('events');
                request.setResourceSelector(dojo.string.substitute('"${0}"', [eventObj.Id]));
                var event = {
                    $key: eventObj.Id,
                    StartDate: Sage.Utility.Convert.toIsoStringFromDate(eventObj.StartDate),
                    EndDate: Sage.Utility.Convert.toIsoStringFromDate(eventObj.EndDate)
                };
                request.update(event, {
                    success: function (act) {
                        console.log("event updated");
                    },
                    failure: function () {
                        console.log("event update failed");
                    },
                    scope: dojo.global
                });
            },
            _preloadCalendarUserOptions: function () {
                var optionsSvc = Sage.Services.getService('UserOptions');
                if (optionsSvc) {
                    optionsSvc.getByCategory('Calendar', this._receivedCalendarOptions, this, this._failedCalendarOptions);
                }
            },
            _receivedCalendarOptions: function (data) {
                var opts = data['$resources'];
                if (opts.length > 0) {
                    this._userOptions['workweek'] = [];
                }
                for (var i = 0; i < opts.length; i++) {
                    var opt = opts[i];

                    switch (opt['name'].toUpperCase()) {
                        case 'WEEKSTART':
                            this._userOptions['weekstart'] = userOptionsUtility.getDay(opt['value']); // _scheduler.date.getDay(opt['value']);
                            break;
                        default:
                            this._userOptions[opt['name'].toLowerCase()] = userOptionsUtility.getConvertedOptionValue(opt['name'], opt['value']);
                            break;
                    }
                }
                if (this._userOptions['workweeksun']) this._userOptions['workweek'].push(0);
                if (this._userOptions['workweekmon']) this._userOptions['workweek'].push(1);
                if (this._userOptions['workweektue']) this._userOptions['workweek'].push(2);
                if (this._userOptions['workweekwed']) this._userOptions['workweek'].push(3);
                if (this._userOptions['workweekthu']) this._userOptions['workweek'].push(4);
                if (this._userOptions['workweekfri']) this._userOptions['workweek'].push(5);
                if (this._userOptions['workweeksat']) this._userOptions['workweek'].push(6);

                if (this._userOptions['workweek'])
                    this._userOptions['workweek'].sort(userOptionsUtility.arraySort);

                this._initScheduler();
                this._launchScheduler();

            },
            _failedCalendarOptions: function (data) {
                this._initScheduler();
                this._launchScheduler();
            },
            _bindContextMenu: function (eventId, startDate) {

                if (this.schedulerContextMenu) {
                    this.schedulerContextMenu.unBindDomNode(this._iFrameId);
                }
                this.schedulerContextMenu = new dijit.Menu({});
                var menuType = null;
                if (eventId == null) {
                    menuType = "mnuCalendarSchedule";
                } else if (eventId.indexOf("-act") > 0) {
                    menuType = "mnuCalendarActivity";
                } else if (eventId.indexOf("-evt") > 0) {
                    menuType = "mnuCalendarEvent";
                } else if (eventId.indexOf("-hist") > 0) {
                    menuType = "mnuCalendarHistory";
                }
                var menuConfig = Sage.UI.DataStore.ContextMenus.calendar_activityContextMenu.items;
                var len = menuConfig.length;
                for (var i = 0; i < len; i++) {
                    var mDef = menuConfig[i];
                    if (mDef.id === menuType) {
                        this._buildChildMenu(mDef.submenu, null, eventId, startDate);
                        break;
                    }
                }
                this.schedulerContextMenu.bindDomNode(this._iFrameId);
            },
            _buildChildMenu: function (parentMenuDef, parentMenu, eventId, startDate) {

                var len = parentMenuDef.length;
                for (var i = 0; i < len; i++) {
                    var mDef = parentMenuDef[i];
                    if (mDef.submenu.length > 0) {
                        var subMenu = new dijit.Menu();
                        this._buildChildMenu(mDef.submenu, subMenu, eventId, startDate);
                        var popsubMenu = new dijit.PopupMenuItem({
                            label: mDef.text,
                            popup: subMenu
                        });

                        if (parentMenu) {
                            parentMenu.addChild(popsubMenu);
                        }
                        else {
                            this.schedulerContextMenu.addChild(popsubMenu);
                        }
                    }
                    else {

                        var menuItem = null;
                        if ((mDef.text === '-') || (mDef.text === ' ') || (mDef.isspacer)) {
                            menuItem = new dijit.MenuSeparator();
                        } else {
                            var href = mDef.href;
                            href = href.replace('javascript:Sage.Link.', 'javascript:parent.Sage.Link.');

                            var disableMenu = false;
                            var deleteAction = false;
                            if (href.toUpperCase() === "DELETEACTIVITY") {
                                deleteAction = _scheduler.getMenuActivityAction(eventId, "delete");
                                if (!deleteAction) {
                                    disableMenu = true;
                                }

                            } else if (href.toUpperCase() === "COMPLETEACTIVITY") {
                                var completeAction = _scheduler.getMenuActivityAction(eventId, "complete");
                                if (!completeAction) {
                                    disableMenu = true;
                                }
                            }

                            menuItem = new Sage.UI.MenuItem({
                                label: mDef.text || '...',
                                icon: 'Libraries/dojo/dojo/resources/blank.gif',
                                title: mDef.tooltip || '',
                                ref: href,
                                deleteAction: deleteAction,
                                disabled: disableMenu,
                                onClick: function () {
                                    switch (this.ref.toUpperCase()) {
                                        case "SCHEDULEPHONECALL":
                                            _scheduler.addEventNow(startDate, null, 'PhoneCall');
                                            break;
                                        case "SCHEDULEMEETING":
                                            _scheduler.addEventNow(startDate, null, 'Meeting');
                                            break;
                                        case "SCHEDULETODO":
                                            _scheduler.addEventNow(startDate, null, 'ToDo');
                                            break;
                                        case "SCHEDULEPERSONALACTIVITY":
                                            _scheduler.addEventNow(startDate, null, 'PersonalActivity');
                                            break;
                                        case "SCHEDULEEVENT":
                                            _scheduler.addEventNow(startDate, null, 'event');
                                            break;
                                        case "OPENACTIVITY":
                                        case "OPENEVENT":
                                        case "OPENHISTORY":
                                            _scheduler.openActivity(eventId);
                                            break;
                                        case "COMPLETEACTIVITY":
                                            _scheduler.completeActivity(_scheduler.getCalendarEventID(eventId));
                                            break;
                                        case "DELETEACTIVITY":
                                            if (this.deleteAction === "delete") {
                                                _scheduler.deleteActivity(eventId);
                                            } else if (this.deleteAction === "decline") {
                                                _scheduler.declineActivity(eventId);
                                            } else if (this.deleteAction === "declineConfirmed") {
                                                _scheduler.declineConfirmedUserActivity(eventId);
                                            }
                                            break;
                                        case "GOTOACCOUNT":
                                            _scheduler.goToActivityAssociation('Account', eventId);
                                            break;
                                        case "GOTOCONTACT":
                                            _scheduler.goToActivityAssociation('Contact', eventId);
                                            break;
                                        case "GOTOOPPORTUNITY":
                                            _scheduler.goToActivityAssociation('Opportunity', eventId);
                                            break;
                                        case "GOTOTICKET":
                                            _scheduler.goToActivityAssociation('Ticket', eventId);
                                            break;
                                        case "GOTOLEAD":
                                            _scheduler.goToActivityAssociation('Lead', eventId);
                                            break;
                                        case "DELETEEVENT":
                                            _scheduler.deleteActivityEvent(_scheduler.getCalendarEventID(eventId));
                                            break;
                                    }
                                }
                            });
                        }
                        if (parentMenu) {
                            parentMenu.addChild(menuItem);
                        }
                        else {
                            this.schedulerContextMenu.addChild(menuItem);
                        }
                    }
                }
            }
        });
        return activityScheduler;

    });