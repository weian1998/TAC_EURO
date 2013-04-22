/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
      'Sage/Data/WritableSDataStore',
      'Sage/Data/SingleEntrySDataStore',
      'Sage/Data/SDataServiceRegistry',
      'Sage/Utility',
      'dojo/string',
      'dojo/_base/lang',
      'dojo/_base/declare',
      'dojo/i18n!./nls/ActivityCalendar',
      'Sage/Array'

],
function (writableSDataStore, singleEntrySDataStore, sDataServiceRegistry, utility, dstring, lang, declare, nlsStrings) {

    var activityCalendar = declare('Sage.MainView.ActivityMgr.ActivityCalendar', null, {
        _contentWindow: null, /* This is being used to display the dhtmlxScheduler inside iFrame 
                                 as we have another instance on acticity window and dhtmlxscheduler 
                                 is a singleton instance to DOM */
        _activitiesData: null,
        _eventsData: null,
        _allData: null,
        _schedulerEvents: [],
        _schedulerEvents1: [],
        _schedulerLoaded: false,
        _loadHistoryOnStart: false,
        self: this,
        _calendarUsers: [],
        _selectedUsers: [],
        _currentUser: null,
        _userOptions: {},
        _userActivityData: [],
        _reccurring: [],
        _currentUserId: null,
        _currentUserColor: [],
        _dateRangeStart: null,
        _dateRangeEnd: null,
        completedText: '(Completed)',
        meetingIconUrl: '../../images/icons/meeting_14x14.png',
        toDoIconUrl: '../../images/icons/To_Do_14x14.png',
        phoneCallIconUrl: '../../images/icons/Call_14x14.png',
        personalActivityIconUrl: '../../images/icons/personal_14x14.png',
        _userColors: [],
        constructor: function (contentWindow, userOptions) {
            (function () {
                this._contentWindow = contentWindow;
            })();
            this._currentUserId = lang.trim(utility.getClientContextByKey('userID')) || '';
            this._userOptions = userOptions;
            this._userColors["user1"] = "#D5E2BD";
            this._userColors["user2"] = "#CFDEF5";
            this._userColors["user3"] = "#FBDBB5";
            this._userColors["user4"] = "#DFC9F6";
            this._currentUserColor = [];
            this._nlsResources = nlsStrings;
            var formatEventStartDate = function (dt) {
                return dojo.date.locale.format(new Date(dt), { selector: "date", datePattern: "EEE MMM d yyyy 00:00:00 ZZZZ" });
            };
            var formatEventEndDate = function (dt) {
                return dojo.date.locale.format(new Date(dt), { selector: "date", datePattern: "EEE MMM d yyyy 24:00:00 ZZZZ" });
            };
            var formatEventData = function (data) {
                var eventData = [{
                    StartDate: formatEventStartDate(Sage.Utility.Convert.toDateFromString(data.StartDate)),
                    EndDate: formatEventEndDate(Sage.Utility.Convert.toDateFromString(data.EndDate)),
                    Text: data.Type,
                    Id: data.$key + "-evt"
                }];
                return eventData;
            };
            var self = this;


            dojo.subscribe("/entity/history/create", function (data) {
                if (data != null) {
                    var historyId = data.HistoryId || data.$key;
                    if (historyId) {
                        self._getHistoryItem(historyId);
                    }
                }
            });

            dojo.subscribe("/entity/history/delete", function (key) {
                if (key != null) {
                    self._deleteHistoryItem(key);
                }
            });



            //This will trigger when the activity is created thro Activity Editor dialog
            //User activities(members) will not be part of the data at this time, will be fetched thro '/userActivity/create' event
            dojo.subscribe("/entity/activity/create", function (data) {
                if (data != null) {
                    if (!data.Timeless) {
                        var userId = data.Leader.$key;
                        userId = lang.trim(userId);

                        //Check if the user is selected in Calendar Users grid
                        if (self._isUserSelected(userId)) {
                            if (data.Recurring) {
                                //If recurring, load all the instances including member instances of the activity
                                //self._reloadAllActivitiesByActivityId(data.$key);
                                //self._getActivities(userId);
                                self._refreshSchedulerEvents();
                            } else {
                                var activityObject = self._formatActivityObject(data, userId);
                                //Store the activity object to be used for any useractivity updates
                                if (!self._userActivityData[userId]) {
                                    self._userActivityData[userId] = [];
                                    self._userActivityData[userId]["activities"] = [];
                                }
                                self._userActivityData[userId]["activities"].push(activityObject);

                                dojo.publish('/entity/activity/addToScheduler', [activityObject, this]);
                            }
                        }
                    }
                }
            });

            //This will trigger whenever the activity is updated with new member or removal of any existing member of the activity
            //Also this will be followed by '/activity/create' event
            dojo.subscribe("/entity/userActivity/create", function (data) {
                if (data != null && data.Activity) {
                    var actId = data.Activity.$key;
                    var userId = data.User.$key;
                    var status = data.Status;

                    //Check if the user is selected in Calendar Users grid
                    if (self._isUserSelected(userId)) {

                        if (self._reccurring[actId]) {

                            self._removeReccurringFromScheduler(actId);
                            window.setTimeout(function () { self._reloadAllActivitiesByActivityId(actId); }, 1);
                        } else {
                            //Get the activity object which we stored during '/activity/create'
                            var origActivityObj = self._getActivityObjectFromCollection(actId);
                            if (origActivityObj) {
                                var userActivityObj = self._getUserActivityFromActivity(origActivityObj, actId, userId, status);
                                //Render in scheduler
                                dojo.publish('/entity/activity/addToScheduler', [userActivityObj, this]);
                                if (!self._userActivityData[userId]) {
                                    self._userActivityData[userId] = [];
                                    self._userActivityData[userId]["activities"] = [];
                                }
                                //Store the member instance of the activity
                                self._userActivityData[userId]["activities"].push(userActivityObj);
                            }
                        }
                    }
                }
            });

            dojo.subscribe("/entity/activity/activityScheduler/reloadActivity", function (activityId) {
                self._reloadAllActivitiesByActivityId(activityId);
            });

            //This will trigger whenever a member is removed from activity thro activity dialog
            dojo.subscribe("/entity/userActivity/delete", function (data) {
                if (data != null) {
                    //data = "'ActivityId=VDEMOA0000HQ;UserId=UDEMOA000000'"
                    var activityItem = data.split(";")[0];
                    var userItem = data.split(";")[1];
                    var activityId = activityItem.split("=")[1];

                    if (self._reccurring[activityId]) {
                        self._removeReccurringFromScheduler(activityId);
                        window.setTimeout(function () { self._reloadAllActivitiesByActivityId(activityId); }, 1);
                    } else {
                        var userId = userItem.split("=")[1];
                        userId = userId.replace("'", "");
                        var actId = activityId + "-" + userId + "-act";
                        if (lang.trim(utility.getClientContextByKey('userID')) == userId) {
                            actId = "0:" + actId;
                        }
                        dojo.publish('/entity/activity/deleteFromScheduler', [actId, this]);
                        //Remove from collection
                        self._removeActivityObjectFromCollection(activityId, userId);
                    }

                }
            });

            //This will trigger whenever the activity is updated thro Activity dialog
            dojo.subscribe("/entity/activity/change", function (data) {
                if (data != null) {
                    if (data.Recurring || data.RecurrenceState.toLowerCase() !== 'rsnotrecurring') {
                        //If recurring, remove all instances of the activity from scheduler and reload to get updated
                        //                        self._removeReccurringFromScheduler(data.$key);
                        //                        self._reloadAllActivitiesByActivityId(data.$key);

                        self._refreshSchedulerEvents();
                    } else {
                        //When the leader changed, we need to remove current activity from scheduler as the color will change
                        if (data.LeaderChanged) {
                            self._deleteFromSchedulerByActivity(data.$key);
                        }
                        var userId = null;
                        if (data.Leader && data.Leader.$key) {
                            userId = lang.trim(data.Leader.$key);
                        }

                        //Check if the userId is in selected calendar users list
                        if (self._isUserSelected(userId)) {
                            var activityObject = self._formatActivityObject(data, userId);
                            dojo.publish('/entity/activity/updateScheduler', [activityObject, this]);
                            self._removeActivityObjectFromCollection(data.$key, userId);
                            self._userActivityData[userId]["activities"].push(activityObject);
                        }

                        //Update member activity instances on scheduler
                        var members = self._getMembersOfActivity(data.$key);
                        if (members) {
                            for (var i = 0; i < members.length; i++) {
                                if (members[i] !== userId) {
                                    activityObject = self._formatActivityObject(data, members[i]);
                                    dojo.publish('/entity/activity/updateScheduler', [activityObject, this]);
                                    self._removeActivityObjectFromCollection(data.$key, members[i]);
                                    if (!self._userActivityData[members[i]]) {
                                        self._userActivityData[members[i]] = [];
                                        self._userActivityData[members[i]]["activities"] = [];
                                    }
                                    self._userActivityData[members[i]]["activities"].push(activityObject);
                                }
                            }
                        }


                    }
                }
            });

            dojo.subscribe("/entity/activity/delete/single", function (activityId) {
                self._deleteFromSchedulerByActivity(activityId);
            });

            dojo.subscribe("/entity/activity/confirm", function (activityData) {
                if (activityData) {
                    self._refreshSchedulerByActivity(activityData.activityId);
                }
            });

            dojo.subscribe("/entity/activity/decline", function (activityData) {
                if (activityData) {
                    self._refreshSchedulerByActivity(activityData.activityId);
                }
            });

            dojo.subscribe("/entity/activity/delete/recurrence", function (activityId) {
                var actId;

                if (activityId) {
                    actId = activityId.substring(0, 13);
                    if (self._userActivityData) {
                        for (var i in self._userActivityData) {
                            if (self._userActivityData[i] != null) {
                                var deleteActivities = [];
                                //Remove activities of selected user from scheduler
                                if (self._userActivityData[i]["activities"]) {
                                    for (var k = 0; k < self._userActivityData[i]["activities"].length; k++) {
                                        if (self._userActivityData[i]["activities"][k]) {
                                            var id = self._userActivityData[i]["activities"][k]["id"];
                                            if (id.indexOf(actId) > -1) {
                                                deleteActivities.push(id);
                                            }
                                        }
                                    }
                                    if (deleteActivities.length > 0) {
                                        dojo.publish('/entity/activity/clearSchedulerEvents', [deleteActivities, this]);
                                    }
                                }
                            }
                        }
                    }
                }

            });

            dojo.subscribe("/entity/activity/delete", function (activityId) {
                self._deleteFromSchedulerByActivity(activityId);
            });


            dojo.subscribe("/entity/event/create", function (data) {
                if (data != null) {
                    var userId = data.UserId;
                    userId = lang.trim(userId);
                    var eventObject = self._formatEventObject(data, userId);
                    dojo.publish('/entity/activity/addToScheduler', [eventObject, this]);
                }
            });

            dojo.subscribe("/entity/event/change", function (data) {
                if (data != null) {
                    var userId = data.UserId;
                    userId = lang.trim(userId);
                    var eventObject = self._formatEventObject(data, userId);
                    dojo.publish('/entity/activity/updateScheduler', [eventObject, this]);
                }
            });

            dojo.subscribe("/entity/event/delete/single", function (eventId) {
                var evId = eventId + "-evt";
                dojo.publish('/entity/activity/deleteFromScheduler', [evId, this]);
            });

            dojo.subscribe("/entity/calendar/userlist/add", function (data) {
                (function () {
                    dojo.publish('/entity/activity/updateScheduler', [formatEventData(data), this]);
                })();
            });

            completedText = this._nlsResources.completedText || '(Completed)';
        },
        _deleteHistoryItem: function (historyId) {
            if (this._userActivityData) {
                for (var i in this._userActivityData) {
                    if (this._userActivityData[i] != null) {
                        //Remove history item of from scheduler
                        if (this._userActivityData[i]["history"]) {
                            for (var k = 0; k < this._userActivityData[i]["history"].length; k++) {
                                if (this._userActivityData[i]["history"][k]) {
                                    var id = this._userActivityData[i]["history"][k]["id"];
                                    if (id.indexOf(historyId) > -1) {
                                        delete this._userActivityData[i]["history"][k];
                                        dojo.publish('/entity/activity/deleteFromScheduler', [id, this]);
                                        break;
                                    }
                                }
                            }

                        }
                    }
                }
            }
        },
        _deleteFromSchedulerByActivity: function (activityId) {
            if (activityId && activityId.indexOf("{") == -1) {
                var activityIds = this._getAllActivitiesFromCollectionById(activityId);
                for (var i = 0; i < activityIds.length; i++) {
                    dojo.publish('/entity/activity/deleteFromScheduler', [activityIds[i], this]);
                    this._removeActivityObjectFromCollectionByActivityId(activityIds[i]);
                }
            }
        },
        _isUserSelected: function (userId) {
            var userSelected = false;
            for (var i in this._selectedUsers) {
                if (this._selectedUsers[i]["userId"]) {
                    if (this._selectedUsers[i]["userId"].toString() == userId) {
                        userSelected = true;
                        break;
                    }
                }
            }
            return userSelected;
        },
        _refreshSchedulerByActivity: function (activityId) {
            if (activityId) {
                this._deleteFromSchedulerByActivity(activityId);
                this._reloadAllActivitiesByActivityId(activityId);
            }
        },
        _getUserActivityFromActivity: function (actObj, actId, userId, status) {
            var userActivityObj = dojo.clone(actObj);
            var sd = actObj.start_date;
            var ed = actObj.end_date;
            var isConfirmed = false;
            if (userActivityObj) {
                userActivityObj.id = actId + "-" + userId + "-act";
                if (status) {
                    switch (status) {
                        case "asAccepted":
                            isConfirmed = true;
                            break;
                        case "asUnconfirmed":
                            isConfirmed = false;
                            break;
                    }
                }
                userActivityObj.userColor = this._currentUserColor[userId];
                // var sDate = utility.Activity.formatActivityStartDateForCalendar(userActivityObj.start_date);
                userActivityObj.end_date = ed; // utility.Activity.formatActivityEndDateForCalendar(userActivityObj.start_date, userActivityObj.duration);
                userActivityObj.start_date = sd; // sDate;
                userActivityObj.confirmed = isConfirmed;
            }
            return userActivityObj;
        },
        _getActivityObjectFromCollection: function (activityId) {
            var actObj = null;
            var br = false;
            if (this._userActivityData) {
                for (var i in this._userActivityData) {
                    if (this._userActivityData[i] != null) {
                        if (this._userActivityData[i]["activities"]) {
                            for (var k = 0; k < this._userActivityData[i]["activities"].length; k++) {
                                if (this._userActivityData[i]["activities"][k]) {
                                    var id = this._userActivityData[i]["activities"][k]["id"];
                                    if (id.indexOf(activityId) > -1) {
                                        actObj = this._userActivityData[i]["activities"][k];
                                        br = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (br)
                        break;
                }
            }
            return actObj;
        },
        _getAllActivitiesFromCollectionById: function (activityId) {
            var actArr = [];
            if (this._userActivityData) {
                for (var i in this._userActivityData) {
                    if (this._userActivityData[i] != null) {
                        if (this._userActivityData[i]["activities"]) {
                            for (var k = 0; k < this._userActivityData[i]["activities"].length; k++) {
                                if (this._userActivityData[i]["activities"][k]) {
                                    var id = this._userActivityData[i]["activities"][k]["id"];
                                    if (id.indexOf(activityId) > -1) {
                                        actArr.push(id);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return actArr;
        },
        _removeActivityObjectFromCollection: function (activityId, userId) {
            if (this._userActivityData) {
                if (this._userActivityData[userId] != null) {
                    if (this._userActivityData[userId]["activities"]) {
                        for (var k = 0; k < this._userActivityData[userId]["activities"].length; k++) {
                            if (this._userActivityData[userId]["activities"][k]) {
                                var id = this._userActivityData[userId]["activities"][k]["id"];
                                if (id.indexOf(activityId) > -1) {
                                    delete this._userActivityData[userId]["activities"][k];
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        },
        _removeActivityObjectFromCollectionByActivityId: function (activityId) {
            var br = false;
            if (this._userActivityData) {
                for (var i in this._userActivityData) {
                    if (this._userActivityData[i] != null) {
                        if (this._userActivityData[i]["activities"]) {
                            for (var k = 0; k < this._userActivityData[i]["activities"].length; k++) {
                                if (this._userActivityData[i]["activities"][k]) {
                                    var id = this._userActivityData[i]["activities"][k]["id"];
                                    if (id == activityId) {
                                        delete this._userActivityData[i]["activities"][k];
                                        br = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (br)
                        break;
                }

            }
        },
        _getMembersOfActivity: function (activityId) {
            var actObj;
            var members = [];
            if (this._userActivityData) {
                for (var i in this._selectedUsers) {
                    if (this._selectedUsers[i] && this._selectedUsers[i]["userId"]) {
                        var cUserId = this._selectedUsers[i]["userId"].toString();
                        if (this._userActivityData[cUserId] != null) {
                            if (this._userActivityData[cUserId]["activities"]) {
                                actObj = this._userActivityData[cUserId]["activities"].filter(function (activity) { return activity.id.indexOf(activityId) > -1 });
                                if (actObj.length > 0) {
                                    members.push(cUserId);
                                }
                            }
                        }
                    }

                }
            }
            return members;
        },
        _getWeekStart: function (userWeekStart, date) {
            if (date == null) {
                date = new Date();
            }
            var shift = date.getDay();
            shift = userWeekStart - shift;
            var stDate = dojo.date.add(date, "day", shift);
            if (stDate > date) {
                stDate = dojo.date.add(stDate, "day", -7);
            }
            return stDate;
        },
        _setQueryDates: function (data) {
            var ndate = data.date.valueOf();
            switch (data.mode) {
                case 'day':
                case 'week':
                case 'workweek':
                case 'month':
                    var daysInMonth = dojo.date.getDaysInMonth(new Date(ndate));
                    var firstDayOfMonth = new Date(new Date(ndate).setDate(1));
                    firstDayOfMonth.setHours(0, 0, 0, 0);
                    var lastDayOfMonth = new Date(new Date(ndate).setDate(daysInMonth));
                    lastDayOfMonth.setHours(0, 0, 0, 0);

                    var rangeStart = this._dateAdd(firstDayOfMonth, "day", -7);
                    var rangeEnd = this._dateAdd(lastDayOfMonth, "day", 8);

                    this._dateRangeStart = Sage.Utility.Convert.toIsoStringFromDate(rangeStart);
                    this._dateRangeEnd = Sage.Utility.Convert.toIsoStringFromDate(rangeEnd);
                    break;
            }
        },
        _updateDateRange: function (data, initial) {

            if (!initial && !this._schedulerLoaded)
                return;
            var nDate = data.date;
            if (Sage.Utility.Convert.isDateString(nDate)) {
                nDate = Sage.Utility.Convert.toDateFromString(nDate);
            }
            nDate = new Date(nDate.getFullYear(), nDate.getMonth(), nDate.getDate(), nDate.getHours(), nDate.getMinutes());

            if (this._dateRangeStart && this._dateRangeEnd) {
                var sDate = this._dateRangeStart;
                if (Sage.Utility.Convert.isDateString(sDate)) {
                    sDate = Sage.Utility.Convert.toDateFromString(sDate);
                }
                sDate = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate(), sDate.getHours(), sDate.getMinutes());
                var eDate = this._dateRangeEnd;
                if (Sage.Utility.Convert.isDateString(eDate)) {
                    eDate = Sage.Utility.Convert.toDateFromString(eDate);
                }
                eDate = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate(), eDate.getHours(), eDate.getMinutes());

                if (data.mode == "month" || ((dojo.date.compare(nDate, eDate, "date") > 0) || ((dojo.date.compare(sDate, nDate, "date") > 0)))) {
                    this._setQueryDates(data);
                    this._refreshSchedulerEvents();
                }
            } else {
                this._setQueryDates(data);
                this._refreshSchedulerEvents();
            }

        },
        _updateCalendarUsers: function (userId, action) {
            var idx = dojo.indexOf(this._calendarUsers, userId);
            //var idx = this._calendarUsers.indexOf(userId);
            if (action === "add") {
                if (idx != -1) this._calendarUsers.splice(idx);
                this._calendarUsers.push(userId);
            } else if (action === "remove") {
                if (idx != -1) this._calendarUsers.splice(idx);
            }
        },
        _updateReccurring: function (id) {
            if (id) {
                //id = id.replace("0:", "");
                var rId = id.replace("0:", "").split(";");
                var aId = rId[0];


                if (!this._reccurring[aId])
                    this._reccurring[aId] = [];
                this._reccurring[aId].push(id);
            }
        },
        _dateAdd: function (dt, mode, duration) {
            if (!dt) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(dt)) {
                dt = Sage.Utility.Convert.toDateFromString(dt);
            }
            var dtAdd = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
            dtAdd = dojo.date.add(dtAdd, mode, duration);
            return dtAdd;
        },
        _reloadUserCalendars: function (userId) {
            if (this._userActivityData) {
                if (this._userActivityData[userId] != null) {
                    var deleteActivities = [];
                    var deleteEvents = [];
                    var deleteHistory = [];
                    //Remove activities of selected user from scheduler
                    if (this._userActivityData[userId]["activities"]) {
                        for (var k = 0; k < this._userActivityData[userId]["activities"].length; k++) {
                            if (this._userActivityData[userId]["activities"][k])
                                deleteActivities.push(this._userActivityData[userId]["activities"][k]["id"]);
                        }
                        dojo.publish('/entity/activity/clearSchedulerEvents', [deleteActivities, this]);
                    }
                    //Remove events of selected user from scheduler
                    if (this._userActivityData[userId]["events"]) {
                        for (var l = 0; l < this._userActivityData[userId]["events"].length; l++) {
                            if (this._userActivityData[userId]["events"][l])
                                deleteEvents.push(this._userActivityData[userId]["events"][l]["id"]);
                        }
                        dojo.publish('/entity/activity/clearSchedulerEvents', [deleteEvents, this]);
                    }
                    //Remove history activities of selected user from scheduler
                    if (this._userActivityData[userId]["history"]) {
                        for (var m = 0; m < this._userActivityData[userId]["history"].length; m++) {
                            if (this._userActivityData[userId]["history"][m])
                                deleteHistory.push(this._userActivityData[userId]["history"][m]["id"]);
                        }
                        dojo.publish('/entity/activity/clearSchedulerEvents', [deleteHistory, this]);
                    }
                }
            }

        },
        _updateSelectedUsers: function (usersList, remove, loadHistoryOnStart) {
            if (usersList) {
                if (this._selectedUsers == null || this._selectedUsers.length == 0) {
                    this._selectedUsers = lang.clone(usersList);
                } else {
                    var userId;
                    if (remove) {
                        for (var i in usersList) {
                            userId = usersList[i]["userId"];
                            if (userId) {
                                delete this._selectedUsers[userId];
                            }
                        }
                    } else {
                        for (var i in usersList) {
                            userId = usersList[i]["userId"];
                            userColor = usersList[i]["usercolor"];
                            if (userId) {
                                this._selectedUsers[userId] = usersList[i];
                                if (this._currentUserId == userId) {
                                    this._updateCalendarUsers(userId.toString(), "add");
                                    this._getActivities(userId.toString(), userColor.toString());
                                    this._getEvents(userId.toString(), userColor.toString());
                                    if (loadHistoryOnStart) {
                                        this._getHistory(userId.toString(), userColor.toString());
                                    }
                                } else {
                                    var scopeObj = { userId: userId, userColor: userColor };
                                    this._getSecurityAccessData(lang.trim(utility.getClientContextByKey('userID')), userId, scopeObj, function (scObj) {
                                        this._updateCalendarUsers(scObj.userId.toString(), "add");
                                        this._getActivities(scObj.userId.toString(), scObj.userColor.toString());
                                        this._getEvents(scObj.userId.toString(), scObj.userColor.toString());
                                        if (loadHistoryOnStart) {
                                            this._getHistory(scObj.userId.toString(), scObj.userColor.toString());
                                        }
                                    }, this);
                                }
                            }

                        }
                    }
                }


            }
        },
        _refreshSchedulerEvents: function () {
            dojo.publish("/entity/activity/clearScheduler", [null, this]);
            if (this._selectedUsers) {
                var userId, userColor;

                var cUserId = lang.trim(utility.getClientContextByKey('userID'));

                var showHistory = this._selectedUsers[cUserId]["loadHistoryOnStart"];

                for (var i in this._selectedUsers) {
                    userId = this._selectedUsers[i]["userId"];
                    userColor = this._selectedUsers[i]["usercolor"];
                    var scopeObj = { userId: userId, userColor: userColor };
                    if (userId == cUserId) {
                        this._getActivities(userId, userColor);
                        this._getEvents(userId, userColor);
                        if (showHistory)
                            this._getHistory(userId, userColor);
                    } else if (userId) {
                        this._getSecurityAccessData(cUserId, userId, scopeObj, function(scObj) {
                            this._getActivities(scObj.userId, scObj.userColor);
                            this._getEvents(scObj.userId, scObj.userColor);
                            if (showHistory)
                                this._getHistory(scObj.userId, scObj.userColor);
                        }, this);
                    }
                }
            }
            this._schedulerLoaded = true;
        },
        _removeReccurringFromScheduler: function (activityId) {
            if (this._reccurring) {
                var list = this._reccurring[activityId];
                if (list && list.length > 0)
                    dojo.publish('/entity/activity/clearSchedulerEvents', [list, this]);
            }

        },
        _checkSecurityAccess: function (accessFor, accessTo, callback, scope) {
            //console.log("_checkSecurityAccess accessFor-" + accessFor + ",accessTo-" + accessTo);
            this.accessData = false;
            if (!this._accessStore) {
                this._accessStore = new singleEntrySDataStore({
                    include: ['$descriptors'],
                    resourceKind: 'activityresourceviews',
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
            }
            this._accessStore.fetch({
                predicate: "'" + accessTo + "-" + accessFor + "'",
                onComplete: function (accessData) {
                    callback.call(scope, accessData);
                },
                onError: function () {
                    console.log("Error retrieving access data");
                    callback.call(scope, null);
                },
                scope: this
            });
        },
        _getSecurityAccessData: function (accessFor, accessTo, scObj, callBack, scope) {
            //console.log("_getSecurityAccessData : accessFor-" + accessFor + ",accessTo-" + accessTo);
            if (this._selectedUsers[accessTo] && this._selectedUsers[accessTo]["access"]) {
                //console.log("_getSecurityAccessData : accessFor-" + accessFor + ",accessTo-" + accessTo + "  RETURN");
                callBack.call(scope, scObj);
            } else {
                this._checkSecurityAccess(accessFor, accessTo, function (accessData) {
                    if (accessData) {
                        this._selectedUsers[accessTo]["access"] = [];
                        this._selectedUsers[accessTo]["access"].allowAdd = accessData.AllowAdd;
                        this._selectedUsers[accessTo]["access"].allowEdit = accessData.AllowEdit;
                        this._selectedUsers[accessTo]["access"].allowDelete = accessData.AllowDelete;
                        //console.log("_getSecurityAccessData set :" + accessTo);
                    }
                    //console.log("_getSecurityAccessData callback :" + accessTo);
                    callBack.call(scope, scObj);

                }, this);
            }
        },
        _reloadAllActivitiesByActivityId: function (activityId) {

            if (!this.allActivitiesStore) {
                this.allActivitiesStore = writableSDataStore({
                    service: sDataServiceRegistry.getSDataService('system'),
                    resourceKind: 'activities',
                    include: ['$descriptors,UserInfo'],
                    select: ['$key', 'Alarm', 'AlarmTime', 'Status', 'AccountId', 'AccountName', 'ActivityId', 'ContactId', 'ContactName', 'Description', 'Duration', 'LeadId', 'LeadName', 'OpportunityId', 'OpportunityName', 'TicketId', 'Recurring', 'StartDate', 'Timeless', 'Type', 'Priority', 'Notes', 'Phonenumber', 'Location', 'Leader/Userinfo/UserName', 'Useractivities/status', 'Useractivities/User/$key'],
                    sort: [{ attribute: 'StartDate', descending: true}]
                });
            }

            this.allActivitiesStore.fetch({
                query: dstring.substitute('Id eq \'${0}\' and not Timeless and UserActivities.Status ne \'asDeclned\'', [activityId]),
                count: 80,
                start: 0,
                onComplete: this._onallActivitiesRequestComplete,
                scope: this
            });
        },
        _onallActivitiesRequestComplete: function (activitiesJson) {

            dojo.require('Sage.Utility');
            dojo.require("dojo.date.locale");

            if (activitiesJson != null && activitiesJson != undefined) {
                this._schedulerEventsx = [];
                var currentUserId = null;
                for (var i = 0; i < activitiesJson.length; i++) {
                    var activityObj = {};
                    if (!activitiesJson[i].Timeless) {
                        var resources = activitiesJson[i]["UserActivities"]["$resources"];
                        if (resources && resources.length > 0) {
                            for (var j = 0; j < resources.length; j++) {
                                currentUserId = resources[j]["User"]["$key"];
                                currentUserId = lang.trim(currentUserId);

                                if (this._isUserSelected(currentUserId) && resources[j]["Status"] != 'asDeclned') {
                                    activityObj = this._formatActivityObject(activitiesJson[i], currentUserId, resources[j]["Status"]);
                                    if (activityObj) {
                                        this._schedulerEventsx.push(activityObj);
                                        if (!this._userActivityData[currentUserId]) {
                                            this._userActivityData[currentUserId] = [];
                                            this._userActivityData[currentUserId]["activities"] = [];
                                        } else if (this._userActivityData[currentUserId]["activities"]) {
                                            try {
                                                this._userActivityData[currentUserId]["activities"].removeByAttr("id", activityObj.id);
                                            } catch (ex) {
                                            }
                                        }
                                        this._userActivityData[currentUserId]["activities"].push(activityObj);
                                    }
                                }
                            }
                        }
                    }
                }
                dojo.publish('/entity/activity/loadScheduler', [dojo.clone(this._schedulerEventsx), this]);
            }

        },
        _getActivities: function (userId, color) {
            if (userId == null) {
                userId = utility.getClientContextByKey('userID');
            }
            userId = lang.trim(userId);
            self._currentUser = userId;
            if (color == null || color == undefined) {
                color = "user1";
            }
            this._currentUserColor[userId] = color;
            if (!this.activitiesStore) {
                this.activitiesStore = writableSDataStore({
                    service: sDataServiceRegistry.getSDataService('system'),
                    resourceKind: 'activities',
                    include: ['$descriptors'],
                    select: ['Alarm', 'AlarmTime', 'Attachment', 'Status', 'AccountId', 'AccountName', 'ActivityId', 'ContactId', 'ContactName', 'Description', 'Duration', 'LeadId', 'LeadName', 'OpportunityId', 'OpportunityName', 'TicketId', 'Recurring', 'StartDate', 'Timeless', 'Type', 'Priority', 'Notes', 'Phonenumber', 'Location', 'AllowEdit', 'AllowDelete', 'Leader/Userinfo/UserName', 'UserActivities', 'UserActivities/User', 'UserActivities/Status'],
                    sort: [{ attribute: 'StartDate', descending: true}]
                });
            }

            //Define custom object with current context and the userId being queried to pass the userId to call back function
            var scopeObj = { 'me': this, 'userId': userId };

            this.activitiesStore.fetch({
                query: dstring.substitute('UserActivities.UserId eq \'${0}\' and not Timeless and UserActivities.Status ne \'asDeclned\' and StartDate gt @${1}@ and StartDate lt @${2}@', [userId, this._dateRangeStart, this._dateRangeEnd]),
                onComplete: this._onActivitiesRequestComplete,
                scope: scopeObj
            });
        },
        _getEvents: function (userId, color) {
            if (userId == null) {
                userId = utility.getClientContextByKey('userID');
            }
            userId = lang.trim(userId);
            this._currentUserColor[userId] = color;
            if (!this.eventsStore) {
                this.eventsStore = writableSDataStore({
                    service: sDataServiceRegistry.getSDataService('dynamic'),
                    resourceKind: 'events',
                    include: [],
                    select: ['Type',
                      'StartDate',
                      'EndDate',
                      'Location',
                      'Description',
                      'User'],
                    sort: [{ attribute: 'StartDate', descending: true}]
                });
            }

            this.eventsStore.fetch({
                query: { conditions: dstring.substitute('UserId eq \'${0}\' and StartDate gt @${1}@ and StartDate lt @${2}@', [userId, this._dateRangeStart, this._dateRangeEnd]) },
                onComplete: this._onEventsRequestComplete,
                scope: this
            });
        },
        _getHistory: function (userId, color) {
            if (userId == null) {
                userId = utility.getClientContextByKey('userID');
            }
            this._currentUserColor[userId] = color;
            if (!this.historyActivitiesStore) {

                this.historyActivitiesStore = writableSDataStore({
                    service: sDataServiceRegistry.getSDataService('dynamic'),
                    resourceKind: 'history',
                    include: ['History'],
                    select: ['$key', 'UserId', 'ActivityId',
                        'AccountName',
                        'Category',
                        'CompletedDate',
                        'ContactId',
                        'ContactName',
                        'Description',
                        'Duration',
                        'LeadId',
                        'LeadName',
                        'LongNotes',
                        'Notes',
                        'OpportunityId',
                        'OpportunityName',
                        'Priority',
                        'Timeless',
                        'Type',
                        'Location',
                        'StartDate',
                        'EndDate'],
                    sort: [{ attribute: 'StartDate', descending: true}]
                });
            }

            this.historyActivitiesStore.fetch({
                query: dstring.substitute('UserId eq \'${0}\' and not Timeless and StartDate gt @${1}@ and StartDate lt @${2}@ and Type in (\'atPhoneCall\',\'atToDo\',\'atAppointment\',\'atPersonal\')', [userId, this._dateRangeStart, this._dateRangeEnd]),
                onComplete: this._onHistoryRequestComplete,
                scope: this
            });
        },
        _getHistoryItem: function (historyId) {
            if (!this._historyStore) {
                this._historyStore = new singleEntrySDataStore({
                    include: [],
                    resourceKind: 'history',
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
            }
            this._historyStore.fetch({
                predicate: '"' + historyId + '"',
                onComplete: this._receivedHistoryItem,
                scope: this
            });
        },
        _receivedHistoryItem: function (historyData) {
            var userId;
            var loggedInUser = lang.trim(utility.getClientContextByKey('userID'));
            if (historyData != null && historyData != undefined) {
                userId = historyData.UserId;
                if (this._selectedUsers[userId]) {
                    var showHistory = this._selectedUsers[userId]["loadHistoryOnStart"];
                    if (showHistory) {
                        var histObj = {};
                        histObj = this._formatHistoryObject(userId, historyData, loggedInUser);
                        if (!this._isEmptyObject(histObj)) {
                            if (!this._userActivityData[userId])
                                this._userActivityData[userId] = {};

                            if (!this._userActivityData[userId]["history"])
                                this._userActivityData[userId]["history"] = [];

                            this._userActivityData[userId]["history"].push(histObj);
                            dojo.publish('/entity/activity/addToScheduler', [dojo.clone(histObj), this]);
                        }
                    }
                }
            }
        },
        iframeRef: function (frameRef) {
            return frameRef.contentWindow ? frameRef.contentWindow.document : frameRef.contentDocument;

        },
        _getActivityUserId: function (activityKey) {
            var uId = null;
            if (activityKey) {
                var keyData = activityKey.split(";");
                if (keyData && keyData.length > 1) {
                    uId = keyData[1].split("=")[1];
                }
            }
            return uId;
        },
        _getAccessData: function (userId, accessType) {
            var access = false;
            if (this._selectedUsers && this._selectedUsers[userId] && this._selectedUsers[userId]["access"]) {
                switch (accessType) {
                    case "allowAdd":
                        access = this._selectedUsers[userId]["access"]["allowAdd"];
                        break;
                    case "allowEdit":
                        access = this._selectedUsers[userId]["access"]["allowEdit"];
                        break;
                    case "allowDelete":
                        access = this._selectedUsers[userId]["access"]["allowDelete"];
                        break;
                }
            }
            return access;
        },
        _formatActivityObject: function (actJson, userId, status, loggedInUser) {
            var startDate, endDate, text, iconSrc;
            var actObj = {};
            var isLoggedInUser = false;
            if (!loggedInUser)
                loggedInUser = lang.trim(utility.getClientContextByKey('userID'));
            if (userId === lang.trim(loggedInUser)) {
                isLoggedInUser = true;
            }

            if (actJson != null) {
                //Hack to sort the activities by id so that the logged in User's activity will be displayed first
                if (isLoggedInUser) {
                    actObj.id = "0:";
                    actObj.id += actJson.$key;
                } else {
                    actObj.id = actJson.$key;
                }

                actObj.currentUser = isLoggedInUser;
                actObj.id += "-" + userId;
                actObj.id += "-act";
                actObj.type = "userActivity";
                actObj.subType = actJson.Type;
                startDate = actJson.StartDate;
                text = actJson.ContactName;
                actObj.text = (text == null) ? "" : text;
                actObj.timeless = actJson.Timeless;
                actObj.alarm = actJson.Alarm;
                if (actJson["Leader"]) {
                    actObj.leaderUserId = actJson["Leader"]["$key"];
                }
                actObj.alarmTime = Sage.Utility.Convert.toDateFromString(actJson.AlarmTime);
                actObj.duration = actJson.Duration;
                actObj.description = actJson.Description;
                actObj.contactId = actJson.ContactId;
                actObj.contactName = actJson.ContactName;
                actObj.accountId = actJson.AccountId;
                actObj.accountName = actJson.AccountName;
                actObj.leadId = actJson.LeadId;
                actObj.leadName = actJson.LeadName;
                actObj.regarding = actJson.Description;
                actObj.priority = actJson.Priority;
                actObj.notes = actJson.Notes;
                actObj.phoneNumber = actJson.PhoneNumber;
                actObj.opportunityId = actJson.OpportunityId;
                actObj.opportunity = actJson.OpportunityName;
                actObj.recurring = actJson.$key.indexOf(";") > 0 ? true : false;

                if (isLoggedInUser) {
                    actObj.allowDelete = true;
                    actObj.allowEdit = actJson.AllowEdit;
                } else {
                    actObj.allowDelete = this._getAccessData(userId, "allowDelete");
                    actObj.allowEdit = this._getAccessData(userId, "allowEdit");
                }
                actObj.ticketId = actJson.TicketId;

                if (actObj.recurring) {
                    this._updateReccurring(actObj.id);
                }


                actObj.attachment = actJson.Attachment;
                actObj.location = actJson.Location;
                switch (actJson.Type.toUpperCase()) {
                    case "ATTODO":
                        iconSrc = this.toDoIconUrl;
                        break;
                    case "ATAPPOINTMENT":
                        iconSrc = this.meetingIconUrl;
                        break;
                    case "ATPHONECALL":
                        iconSrc = this.phoneCallIconUrl;
                        break;
                    case "ATPERSONAL":
                        iconSrc = this.personalActivityIconUrl;
                        break;
                }
                actObj.iconSrc = iconSrc;
                actObj.userColor = this._currentUserColor[userId];
                var isConfirmed = true;

                if (status) {
                    switch (status) {
                        case "asAccepted":
                            isConfirmed = true;
                            break;
                        case "asUnconfirmed":
                            isConfirmed = false;
                            break;
                    }
                }
                actObj.confirmed = isConfirmed;
                actObj.start_date = utility.Activity.formatActivityStartDateForCalendar(actJson.StartDate);
                actObj.end_date = utility.Activity.formatActivityEndDateForCalendar(actJson.StartDate, actObj.duration);

                if (actObj.alarmTime) {
                    actObj.alarmMinutesBefore = dojo.date.difference(Sage.Utility.Convert.toDateFromString(actJson.StartDate), actObj.alarmTime, "minute");
                }

            }
            return actObj;
        },
        _formatEventObject: function (eventJson, userId) {
            var evtObj = {};
            if (eventJson != null) {
                evtObj.id = eventJson.$key;
                evtObj.id += "-evt";
                evtObj.type = "event";
                evtObj.subType = eventJson.Type;
                evtObj.description = eventJson.Description;
                evtObj.location = eventJson.Location;
                evtObj.text = eventJson.Type;
                evtObj.userColor = this._currentUserColor[userId];
                evtObj.start_date = utility.Activity.formatActivityStartDateForCalendar(eventJson.StartDate, "MM/d/yy 0:00");
                evtObj.end_date = utility.Activity.formatActivityStartDateForCalendar(eventJson.EndDate, "MM/d/yy 24:00");
            }
            return evtObj;
        },
        _updateUserActivityDataCollection: function (userId, activityObj) {
            if (!this._userActivityData[userId]) {
                this._userActivityData[userId] = [];
            }
            if (!this._userActivityData[userId]["activities"]) {
                this._userActivityData[userId]["activities"] = [];
            }
            this._userActivityData[userId]["activities"].push(activityObj);
        },
        _onActivitiesRequestComplete: function (activitiesJson, contextscope) {
            //Get the context and userId from the custom object (scopeObj) from _getActivities method
            var _queryUserId = contextscope.scope.userId;
            var _this = contextscope.scope.me;

            if (activitiesJson != null && activitiesJson != undefined) {
                _this._schedulerEvents = [];
                var currentUserId = null;
                var status = null;
                var loggedInUserId = utility.getClientContextByKey('userID');

                for (var i = 0; i < activitiesJson.length; i++) {
                    var activityObj = {};
                    if (!activitiesJson[i].Timeless) {
                        if (activitiesJson[i]["UserActivities"]) {
                            if (activitiesJson[i]["UserActivities"]["$resources"]) {
                                for (var j = 0; j < activitiesJson[i]["UserActivities"]["$resources"].length; j++) {
                                    if (activitiesJson[i]["UserActivities"]["$resources"][j]["User"]) {
                                        if (_queryUserId == activitiesJson[i]["UserActivities"]["$resources"][j]["User"]["$key"]) {
                                            currentUserId = activitiesJson[i]["UserActivities"]["$resources"][j]["User"]["$key"];
                                            currentUserId = lang.trim(currentUserId);
                                            status = activitiesJson[i]["UserActivities"]["$resources"][j]["Status"];
                                            activityObj = _this._formatActivityObject(activitiesJson[i], currentUserId, status, loggedInUserId);
                                            _this._updateUserActivityDataCollection(currentUserId, activityObj);
                                        }
                                    }
                                }
                            }
                        } else if (activitiesJson[i]["Leader"]) {
                            //If there is no UserActivities, it could be personal Activity
                            currentUserId = activitiesJson[i]["Leader"]["$key"];
                            currentUserId = lang.trim(currentUserId);
                            activityObj = _this._formatActivityObject(activitiesJson[i], currentUserId, loggedInUserId);
                            _this._updateUserActivityDataCollection(currentUserId, activityObj);
                            currentUserId = null;
                        }
                    }
                    if (!_this._isEmptyObject(activityObj)) {
                        _this._schedulerEvents.push(activityObj);
                    }
                }
                dojo.publish('/entity/activity/loadScheduler', [dojo.clone(_this._schedulerEvents), _this]);
            }

        },
        _onEventsRequestComplete: function (eventsJson) {
            dojo.require('Sage.Utility');
            dojo.require("dojo.date.locale");
            if (eventsJson != null && eventsJson != undefined) {
                this._schedulerEvents1 = [];
                var currentUserId = null;
                for (var i = 0; i < eventsJson.length; i++) {
                    var eventObj = {};

                    if (!currentUserId) {
                        currentUserId = eventsJson[i]["User"]["$key"];
                    }
                    currentUserId = lang.trim(currentUserId);
                    eventObj = this._formatEventObject(eventsJson[i], currentUserId);
                    if (eventObj) {
                        this._schedulerEvents1.push(eventObj);
                    }
                }
                if (!this._userActivityData[currentUserId])
                    this._userActivityData[currentUserId] = {};
                this._userActivityData[currentUserId]["events"] = this._schedulerEvents1;
                dojo.publish('/entity/activity/loadScheduler', [dojo.clone(this._schedulerEvents1), this]);
            }
        },
        _formatHistoryObject: function (userId, historyData, loggedInUser) {
            var historyActivityObj = {};
            var iconSrc = "";
            var text;
            userId = lang.trim(userId);
            if (!historyData.Timeless) {

                if (userId == lang.trim(loggedInUser)) {
                    historyActivityObj.id = "0:";
                    historyActivityObj.id += historyData.$key;
                } else {
                    historyActivityObj.id = historyData.$key;
                }
                historyActivityObj.id += "-" + userId;
                historyActivityObj.id += "-hist";
                historyActivityObj.type = "userHistoryActivity";
                historyActivityObj.activityId = historyData.ActivityId;
                historyActivityObj.subType = historyData.Type;
                //text = completedText;
                text = historyData.ContactName;
                historyActivityObj.text = (text == null) ? "" : text;
                historyActivityObj.timeless = historyData.Timeless;
                historyActivityObj.duration = historyData.Duration;
                historyActivityObj.description = historyData.Description;
                historyActivityObj.contactName = historyData.ContactName;
                historyActivityObj.accountName = historyData.AccountName;
                historyActivityObj.leadName = historyData.LeadName;
                historyActivityObj.regarding = historyData.Description;
                historyActivityObj.priority = historyData.Priority;
                historyActivityObj.notes = historyData.Notes;
                historyActivityObj.location = historyData.Location;
                historyActivityObj.opportunity = historyData.OpportunityName;
                historyActivityObj.userColor = this._currentUserColor[userId];
                historyActivityObj.confirmed = true;

                switch (historyData.Type.toUpperCase()) {
                    case "ATTODO":
                        iconSrc = this.toDoIconUrl;
                        break;
                    case "ATAPPOINTMENT":
                        iconSrc = this.meetingIconUrl;
                        break;
                    case "ATPHONECALL":
                        iconSrc = this.phoneCallIconUrl;
                        break;
                    case "ATPERSONALACTIVITY":
                        iconSrc = this.personalActivityIconUrl;
                        break;
                }
                historyActivityObj.iconSrc = iconSrc;
                historyActivityObj.start_date = utility.Activity.formatActivityStartDateForCalendar(historyData.CompletedDate);
                historyActivityObj.end_date = utility.Activity.formatActivityEndDateForCalendar(historyData.CompletedDate, historyActivityObj.duration);

            }
            return historyActivityObj;

        },
        _onHistoryRequestComplete: function (historyData) {
            if (historyData != null && historyData != undefined) {
                var schedulerEventsHistory = [];
                var text;
                var currentUserId = null;
                var loggedInUser = lang.trim(utility.getClientContextByKey('userID'));
                for (var i = 0; i < historyData.length; i++) {
                    var historyActivityObj = {};
                    currentUserId = historyData[i].UserId;
                    historyActivityObj = this._formatHistoryObject(currentUserId, historyData[i], loggedInUser);
                    if (!this._isEmptyObject(historyActivityObj)) {
                        schedulerEventsHistory.push(historyActivityObj);
                    }
                }

                if (!this._userActivityData[currentUserId])
                    this._userActivityData[currentUserId] = {};

                this._userActivityData[currentUserId]["history"] = schedulerEventsHistory;

                dojo.publish('/entity/activity/loadScheduler', [dojo.clone(schedulerEventsHistory), this]);
            }

        },
        _getEventColorByUser: function (userId) {
            var userColor = "#d5e2bd";
            for (var i = 0; i < this._calendarUsers.length; i++) {
                if (this._calendarUsers[i].userId == userId) {
                    userColor = this._calendarUsers[i].eventColor;
                }
            }
            return userColor;
        },
        _isEmptyObject: function (obj) {
            for (var i in obj) { return false; }
            return true;
        }

    });
    return activityCalendar;
});
