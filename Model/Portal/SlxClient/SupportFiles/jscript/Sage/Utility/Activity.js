/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/date/locale',
    'dojox/grid/cells/_base',
    'Sage/Utility',
    'dojo/string',
    'dojo/i18n!./nls/Activity',
    'dojo/_base/declare'
],
function (dateLocale, cell, utility, dstring, nlsStrings, declare) {
    var isValidId = function (id) {
        var valid = false;
        if (id) {
            if (id.trim() !== '') {
                valid = true;
            }
        }
        return valid;
    };
    var typeCell = declare("Sage.Utility.Activity.TypeCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            //console.log('index: ' + inRowIndex + '   item: %o', inItem);
            if (!inItem) {
                return this.defaultValue;
            }
            var type = this.get(inRowIndex, inItem);
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var key = utility.getValue(activity, "$key");
            var confStatus = (inItem.hasOwnProperty('Status')) ? inItem.Status : false;
            var fmtStr = '<a href="${0}" ><div class="Global_Images icon16x16 ${1}" title="${2}"></div>&nbsp;${2}</a>';

            //Determine the recurrnece context, se we pass the correct recurring flag so that the reocrrnce dlg will be not be shown if there is no ending to the reocurrnce. 
            var reocState = Sage.Utility.getValue(activity, 'RecurrenceState');
            var recurring = Sage.Utility.Activity._getReccurenceFlag(activity);
            //typically, we will want to edit the activity
            var href = 'javascript:Sage.Link.editActivity(\'' + key + '\', ' + recurring + ')';
            if (confStatus) {
                var curUser = utility.getClientContextByKey('userID');
                //assume the current user is who the useractivity is for...
                var actUser = (inItem.hasOwnProperty['User']) ? inItem.User['$key'] : curUser;
                //if the current user has not confirmed the activity, then they need to confirm it before editing.
                if (confStatus === 'asUnconfirmed' && curUser === actUser) {
                    href = 'javascript:Sage.Link.confirmActivityFor(\'' + key + '\', \'' + curUser + '\')';
                }
            } else {
                //if we don't know if the user has confirmed or not, let the activity service check...
                href = 'javascript:Sage.Link.editActivityIfConfirmed(\'' + key + '\', ' + recurring + ')';
            }
            return dstring.substitute(fmtStr, [href, Sage.Utility.Activity.getActivityImageClass(type, 'small'), Sage.Utility.Activity.getActivityTypeName(type)]);
        }
    });
    var historyTypeCell = declare('Sage.Utility.Activity.HistoryTypeCell', dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var key = utility.getValue(inItem, '$key');
            var type = utility.getValue(inItem, 'Type');
            var typeDisp = Sage.Utility.Activity.getActivityTypeName(type);
            var fmt = '<a href="javascript:Sage.Link.editHistory(\'${0}\')" ><div class="Global_Images icon16x16 ${1} title="${2}"></div>&nbsp;${2}</a>';
            return dstring.substitute(fmt, [key, Sage.Utility.Activity.getActivityImageClass(type, 'small'), typeDisp]);
        }
    });
    var alarmCell = declare('Sage.Utility.Activity.AlarmCell', cell, {
        formatter: function (val, index) {
            return (val) ? "<img src='images/icons/Alarm_16x16.gif'/>" : "<div><div>";
        }
    });
    var recurCell = declare("Sage.Utility.Activity.RecurCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var html = "";
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var recur = utility.getValue(activity, 'Recurring');
            var recurState = utility.getValue(activity, 'RecurrenceState');
            if (recur || (recurState && recurState === 'rstOccurrence')) {
                html = '<div class="Global_Images icon16x16 icon_recurring"></div>';
            }
            return html;
        }
    });
    var attachCell = declare("Sage.Utility.Activity.AttachCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var html = "<div><div>";
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var attach = utility.getValue(activity, 'Attachment');
            if (attach) {
                html = '<div class="Global_Images icon16x16 icon_attach_to_16"></div>';
            }
            return html;
        }
    });
    var confrimStatusCell = declare("Sage.Utility.Activity.ConfrimStatusCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var html = "<div><div>";
            var status = utility.getValue(inItem, 'Status');
            if (status === 'asUnconfirmed') {
                html = '<div class="Global_Images icon16x16 icon_unconfirmedActivity16x16"></div>';
            }
            return html;
        }
    });
    var durationCell = declare("Sage.Utility.Activity.DurationCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var durationStr = "";
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var duration = utility.getValue(activity, 'Duration');
            if (duration) {
                var timeless = utility.getValue(activity, 'Timeless');
                durationStr = Sage.Utility.Activity.formatDuration(duration, timeless);
            }
            return durationStr;
        }
    });
    var nameCell = declare("Sage.Utility.Activity.NameCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var contact = utility.getValue(activity, 'ContactName');
            var contactId = utility.getValue(activity, 'ContactId');
            if (isValidId(contactId)) {
                return '<a href="Contact.aspx?entityid=' + contactId + '" >' + contact + '</a>';
            }
            var lead = utility.getValue(activity, 'LeadName');
            var leadId = utility.getValue(activity, 'LeadId');
            if (isValidId(leadId)) {
                return '<a href="Lead.aspx?entityid=' + leadId + '" >' + lead + '</a>';
            }
            return "<div></div> ";
        }
    });
    var nameTypeCell = declare("Sage.Utility.Activity.NameTypeCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var contactId = utility.getValue(activity, 'ContactId');
            if (isValidId(contactId)) {
                return nlsStrings.Contact;
            }
            var leadId = utility.getValue(activity, 'LeadId');
            if (isValidId(leadId)) {
                return nlsStrings.Lead;
            }
            return '';
        }
    });
    var accountCell = declare("Sage.Utility.Activity.AccountCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
            var account = utility.getValue(activity, 'AccountName');
            var accountId = utility.getValue(activity, 'AccountId');
            var html = '';
            if (isValidId(accountId)) {
                html = '<a href="Account.aspx?entityid=' + accountId + '" >' + account + '</a>';
            }
            var leadId = utility.getValue(activity, 'LeadId');
            if (isValidId(leadId)) {
                html = '<a href="Lead.aspx?entityid=' + leadId + '" >' + account + '</a>';
            }
            return html;
        }
    });
    var leaderCell = declare("Sage.Utility.Activity.LeaderCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : null;
            var leader;

            if (activity) {
                leader = utility.getValue(activity, "Leader");
            } else {
                leader = (inItem.hasOwnProperty('Leader') && typeof inItem['Leader'] === 'object') ? inItem.Leader : inItem;
            }
            var leaderName = utility.getValue(leader, '$descriptor');
            return leaderName;
        }
    });
    var completeCell = declare("Sage.Utility.Activity.CompleteCell", dojox.grid.cells.Cell, {
        format: function (inRowIndex, inItem) {
            if (!inItem) {
                return this.defaultValue;
            }
            var key = utility.getValue(inItem, '$key');
            if (isValidId(key)) {
                var activity = (inItem.hasOwnProperty('Activity') && typeof inItem['Activity'] === 'object') ? inItem.Activity : inItem;
                return dstring.substitute('<a href="javascript:Sage.Link.completeActivity(\'${0}\', ${1})">${2}</a>', [key, utility.getValue(activity, 'Recurring'), nlsStrings.Complete]);
            }
            return '';
        }
    });
    Sage.namespace('Utility.Activity');
    return Sage.Utility.Activity = {
        timelessText: 'timeless',
        _imageMap: {
            small: {
                'atNote': 'images/icons/note_16x16.gif',
                'atPhoneCall': 'images/icons/Call_16x16.gif',
                'atToDo': 'images/icons/To_Do_16x16.gif',
                'atAppointment': 'images/icons/Meeting_16x16.gif',
                'atPersonal': 'images/icons/Personal_16x16.gif',
                'atLiterature': 'images/icons/Literature_16x16.png',
                'atDoc': 'images/icons/mailletter_16x16.png',
                'atFax': 'images/icons/fax_16x16.gif',
                'atEmail': 'images/icons/mailletter_16x16.png'
            },
            medium: {
                'atNote': 'images/icons/Note_24x24.gif',
                'atPhoneCall': 'images/icons/Call_24x24.gif',
                'atToDo': 'images/icons/To_Do_24x24.gif',
                'atAppointment': 'images/icons/Meeting_24x24.gif',
                'atPersonal': 'images/icons/Personal_24x24.gif',
                'atLiterature': 'images/icons/Literature_24x24.png',
                'atDoc': 'images/icons/mailletter_24x24.gif',
                'atFax': 'images/icons/fax_24x24.gif',
                'atEmail': 'images/icons/mailletter_24x24.gif'
            },
            large: {
                'atNote': 'images/icons/Note_24x24.gif',
                'atPhoneCall': 'images/icons/Call_32x32.gif',
                'atToDo': 'images/icons/To_Do_32x32.gif',
                'atAppointment': 'images/icons/Meeting_32x32.gif',
                'atPersonal': 'images/icons/Personal_32x32.gif',
                'atLiterature': 'images/icons/Literature_32x32.png',
                'atDoc': 'images/icons/mailletter_32x32.gif',
                'atFax': 'images/icons/fax_32x32.gif',
                'atEmail': 'images/icons/mailletter_32x32.gif'
            }
        },
        _iconClassMap: {
            small: {
                'atNote': 'icon_note_16x16',
                'atPhoneCall': 'icon_Call_16x16',
                'atToDo': 'icon_To_Do_16x16',
                'atAppointment': 'icon_Meeting_16x16',
                'atPersonal': 'icon_Personal_16x16',
                'atLiterature': 'icon_Literature_16x16',
                'atDoc': 'icon_mailletter_16x16',
                'atFax': 'icon_fax_16x16',
                'atEMail': 'icon_mailletter_16x16'
            },
            medium: {
                'atNote': 'icon_Note_24x24',
                'atPhoneCall': 'icon_Call_24x24',
                'atToDo': 'icon_To_Do_24x24',
                'atAppointment': 'icon_Meeting_24x24',
                'atPersonal': 'icon_Personal_24x24',
                'atLiterature': 'icon_Literature_24x24',
                'atDoc': 'icon_mailletter_24x24',
                'atFax': 'icon_fax_24x24',
                'atEmail': 'icon_mailletter_24x24'
            },
            large: {
                'atNote': 'icon_Note_24x24',
                'atPhoneCall': 'icon_Call_32x32',
                'atToDo': 'icon_To_Do_32x32',
                'atAppointment': 'icon_Meeting_32x32',
                'atPersonal': 'icon_Personal_32x32',
                'atLiterature': 'icon_Literature_32x32',
                'atDoc': 'icon_mailletter_32x32',
                'atFax': 'icon_fax_32x32',
                'atEmail': 'icon_mailletter_32x32'
            }
        },
        _picklistMap: {
            'Regarding': {
                'atNote': 'Note Regarding',
                'atPhoneCall': 'Phone Call Regarding',
                'atToDo': 'To Do Regarding',
                'atAppointment': 'Meeting Regarding',
                'atEmail': 'To Do Regarding',
                'atPersonal': 'Personal Activity Regarding',
                'atLiterature': 'To Do Regarding'
            },
            'Category': {
                'atNote': 'Note Category Codes',
                'atPhoneCall': 'Phone Call Category Codes',
                'atToDo': 'To Do Category Codes',
                'atAppointment': 'Meeting Category Codes',
                'atEmail': 'To Do Category Codes',
                'atPersonal': '',
                'atLiterature': 'To Do Category Codes'
            },
            'Result': {
                'atNote': 'Meeting Result Codes',
                'atPhoneCall': 'Phone Call Result Codes',
                'atToDo': 'To Do Result Codes',
                'atAppointment': 'Meeting Result Codes',
                'atEmail': 'To Do Result Codes',
                'atPersonal': 'Personal Activity Result Codes',
                'atLiterature': 'To Do Result Codes'
            }
        },
        _notMyPersonalActivityMixin: {
            "AccountId": '',
            "AccountName": '',
            "Category": nlsStrings.Personal,
            "ContactId": '',
            "ContactName": '',
            "Description": nlsStrings.Personal,
            "LeadId": '',
            "LeadName": "",
            "LongNotes": '',
            "Notes": '',
            "OpportunityId": '',
            "OpportunityName": '',
            "PhoneNumber": "",
            "Priority": '',
            "TicketId": '',
            "TicketNumber": '',
            "Location": ''
        },
        secureActivityData: function (activity) {
            if ((activity.Type == 262162) || (activity.Type == 'atPersonal')) {
                var currentUserId;
                var clientContextSvc = Sage.Services.getService('ClientContextService');
                if (clientContextSvc) {
                    if (clientContextSvc.containsKey("userID")) {
                        currentUserId = clientContextSvc.getValue("userID");
                    }
                }
                if (currentUserId === activity.UserId) {
                    return;
                }
                if (activity.Leader) {

                    if (currentUserId === activity.Leader.$key) {
                        return;
                    }
                }
                //the current user does should not see this data.
                dojo.mixin(activity, Sage.Utility.Activity._notMyPersonalActivityMixin);
            }
        },
        getActivityImage: function (type, size) {
            size = Sage.Utility.Activity._verifySize(size);
            type = type || 'atAppointment';
            return Sage.Utility.Activity._imageMap[size][type] || Sage.Utility.Activity._imageMap[size]['atAppointment'];
        },
        _verifySize: function (size) {
            size = size || 'small';
            size = size.toLowerCase();
            if (size !== 'small' && size !== 'medium' && size !== 'large') {
                size = 'small';
            }
            return size;
        },
        getActivityImageClass: function (type, size) {
            size = Sage.Utility.Activity._verifySize(size);
            type = type || 'atAppointment';
            return Sage.Utility.Activity._iconClassMap[size][type] || Sage.Utility.Activity._iconClassMap[size]['atAppointment'];
        },
        getActivityTypeName: function (type) {
            switch (type) {
                case 'atPhoneCall':
                    return nlsStrings.PhoneCall || 'Phone Call';
                case 'atToDo':
                    return nlsStrings.ToDo || 'To Do';
                case 'atAppointment':
                    return nlsStrings.Meeting || 'Meeting';
                case 'atPersonal':
                    return nlsStrings.Personal || 'Personal Activity';
                case 'atLiterature':
                    return nlsStrings.Literature || 'Literature';
                case 'atFax':
                    return nlsStrings.Fax || 'Fax';
                case 'atLetter':
                    return nlsStrings.Letter || 'Letter';
                case 'atNote':
                    return nlsStrings.Note || 'Note';
                case 'atEMail':
                    return nlsStrings.Email || 'E-mail';
                case 'atDoc':
                    return nlsStrings.Document || 'Document';
                case 'atDatabaseChange':
                    return nlsStrings.DatabaseChange || 'Database Change';
                case 'atInternal':
                    return nlsStrings.Event || 'Event';
                case 'atSchedule':
                    return nlsStrings.ScheduledEvent || 'Scheduled Event';
                default:
                    return type;
            }
        },
        getActivityTypeEnumCode: function (type) {
            switch (type) {
                case 262146:
                    return 'atPhoneCall';
                case 262147:
                    return 'atToDo';
                case 'atAppointment':
                case 262145:
                    return 'atAppointment';
                case 262162:
                    return 'atPersonal';
                case 'atLiterature':
                    return 'atLiterature';
                case 'atFax':
                    return 'atFax';
                case 'atLetter':
                    return 'atLetter';
                case 'atNote':
                    return 'atNote';
                case 'atEMail':
                    return 'atEMail';
                default:
                    return type;
            }
        },
        getConfirmationTypeEnumCode: function (type) {
            switch (type) {
                case 0:
                    return 'New';
                case 1:
                    return 'Change';
                case 2:
                    return 'Deleted';
                case 3:
                    return 'Confirm';
                case 4:
                    return 'Decline';
                case 5:
                    return 'Unknown';
                case 6:
                    return 'Leader';
                default:
                    return type;
            }
        },
        getConfirmationDisplayName: function (type) {
            switch (type) {
                case 'New':
                    return nlsStrings.New || 'New';
                case 'Change':
                    return nlsStrings.Change || 'Change';
                case 'Deleted':
                    return nlsStrings.Deleted || 'Deleted';
                case 'Confirm':
                    return nlsStrings.Confirm || 'Confirm';
                case 'Decline':
                    return nlsStrings.Decline || 'Decline';
                case 'Unknown':
                    return nlsStrings.Unknown || 'Unknown';
                case 'Leader':
                    return nlsStrings.Leader || 'Leader';
                default:
                    return type;
            }
        },
        getActivityPicklistName: function (picklist, actType) {
            picklist = picklist || 'Regarding';
            if (!Sage.Utility.Activity._picklistMap.hasOwnProperty(picklist)) {
                picklist = 'Regarding';
            }
            return Sage.Utility.Activity._picklistMap[picklist][actType] || Sage.Utility.Activity._picklistMap[picklist]['atToDo'];
        },
        formatActivityStartDate: function (startDate, timeless) {
            if (!startDate) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(startDate)) {
                startDate = Sage.Utility.Convert.toDateFromString(startDate);
            }
            if (typeof timeless === 'undefined') {
                timeless = Sage.Utility.Activity.isDateFiveSecondRuleTimeless(startDate);
            }
            if (!timeless) {
                return dateLocale.format(startDate, { selector: 'datetime', fullYear: true });
            } else {
                var timelessDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
                return dateLocale.format(timelessDate, { selector: 'date', fullYear: true }) + ' ' + this.timelessText;
            }
        },
        getActivityEndDate: function (startDate, duration, timeless) {
            if (!startDate) {
                return false;
            }
            if (Sage.Utility.Convert.isDateString(startDate)) {
                startDate = Sage.Utility.Convert.toDateFromString(startDate);
            }
            if (typeof timeless === 'undefined') {
                timeless = Sage.Utility.Activity.isDateFiveSecondRuleTimeless(startDate);
            }
            if (!timeless) {
                return dojo.date.add(startDate, "minute", duration);
            } else {
                return new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 5);
            }
        },
        formatActivityStartDateForCalendar: function (startDate, dateFormat, timeless) {
            if (!startDate) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(startDate)) {
                startDate = Sage.Utility.Convert.toDateFromString(startDate);
            }
            var sDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours(), startDate.getMinutes());
            if(timeless) {
                sDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 5);
            }
            if (dateFormat)
                return dateLocale.format(sDate, { selector: 'date', datePattern: dateFormat });
            else
                return dateLocale.format(sDate, { selector: 'date', datePattern: "MM/d/yy H:mm" });
        },
        formatActivityEndDateForCalendar: function (startDate, duration) {
            if (!startDate) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(startDate)) {
                startDate = Sage.Utility.Convert.toDateFromString(startDate);
            }
            var stDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), startDate.getHours(), startDate.getMinutes());
            var eDate = dojo.date.add(stDate, "minute", duration);
            //Some activities will end after midnight, so make it same date and just update the time to handle it in Activity scheduler
            if (dojo.date.compare(eDate, stDate, "date") > 0) {
                //eDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), eDate.getHours(), eDate.getMinutes());
                return dateLocale.format(stDate, { selector: 'date', datePattern: "MM/d/yy 24:00" });
            }
            return dateLocale.format(eDate, { selector: 'date', datePattern: "MM/d/yy H:mm" });
        },
        formatEventDate: function (startDate) {
            if (!startDate) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(startDate)) {
                startDate = Sage.Utility.Convert.toDateFromString(startDate);
            }
            return dateLocale.format(startDate, { selector: 'date', fullYear: true });
        },
        formatDateAdd: function (dt, mode, duration) {
            if (!dt) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(dt)) {
                dt = Sage.Utility.Convert.toDateFromString(dt);
            }
            var dtAdd = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
            dtAdd = dojo.date.add(dtAdd, mode, duration);
            return dateLocale.format(dtAdd, { selector: 'date', fullYear: true });
        },
        formatShortDate: function (dt) {
            if (!dt) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(dt)) {
                dt = Sage.Utility.Convert.toDateFromString(dt);
            }
            var dtAdd = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
            return dateLocale.format(dtAdd, { selector: 'date', formatLength: 'short', fullYear: true });
        },
        formatLongDate: function (dt) {
            if (!dt) {
                return '';
            }
            if (Sage.Utility.Convert.isDateString(dt)) {
                dt = Sage.Utility.Convert.toDateFromString(dt);
            }
            var dtAdd = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes());
            return dateLocale.format(dtAdd, { selector: 'date', formatLength: 'long', fullYear: true });
        },
        roundDateToNextQuarterHour: function (dt) {
            dt.setSeconds(0);
            var curMin = dt.getMinutes();
            if (curMin < 15) {
                dt.setMinutes(15);
            } else if (curMin < 30) {
                dt.setMinutes(30);
            } else if (curMin < 45) {
                dt.setMinutes(45);
            } else {
                dt.setMinutes(0);
                dt = dojo.date.add(dt, 'hour', 1);
            }
            return dt;
        },
        isDateFiveSecondRuleTimeless: function (d) {
            if (!d) {
                return false;
            }
            return ((d.getUTCHours() === 0) && (d.getUTCMinutes() === 0) && (d.getUTCSeconds() === 5));
        },
        formatDuration: function (duration, timeless) {
            if (timeless) {
                return '';
            }
            if (!duration) {
                return '0m';
            }
            if (duration < 60) {
                return duration + "m";
            }
            if (duration > 60) {
                var hours = String(duration / 60).split(".");
                var min = duration % 60;
                return hours[0] + "h " + min + "m";
            }
            else {
                return "1hr";
            }
        },
        formatTimelessStartDate: function (value) {
            if (!value) {
                return '';
            }
            var pad = function (n) { return n < 10 ? '0' + n : n; };
            return value.getUTCFullYear() + '-'
                + pad(value.getUTCMonth() + 1) + '-'
                + pad(value.getUTCDate()) + 'T00:00:00Z';
        },
        formatTimelessEndDate: function (dateValue, mode, increment) {
            if (!dateValue) {
                return '';
            }
            var newDate = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
            newDate = dojo.date.add(newDate, mode, increment);
            var pad = function (n) { return n < 10 ? '0' + n : n; };
            var utcYear = newDate.getUTCFullYear();
            var utcMonth = newDate.getUTCMonth() + 1;
            var utcDate = newDate.getUTCDate();
           
            return utcYear + '-'
                + pad(utcMonth) + '-'
                + pad(utcDate) + 'T23:59:59Z';
        },
        getNthWeekOfMonth: function (d) {
            //returns a number 1 - 5 indicating the week in which the supplied date occurs.
            //The typical usage should consider a return value of 5 to mean the "Last" week.
            var tempDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            var curMonth = tempDate.getMonth();
            for (var i = 1; i < 7; i++) {
                tempDate = dojo.date.add(tempDate, 'week', -1);
                if (curMonth !== tempDate.getMonth()) {
                    return i;
                }
            }
            return 1;
        },
        setDateToNthWeekDay: function (d, nthWeek, weekDay) {
            //returns the date in the month of the provided date that lands on the 
            // specified weekday.  e.g. First Friday.
            var i, tempDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            if (nthWeek === 5) {
                //"last" - count backwards...
                tempDate.setDate(dojo.date.getDaysInMonth(tempDate));
                for (i = 0; i < 7; i++) {
                    if (tempDate.getDay() === weekDay) {
                        break;
                    }
                    tempDate = dojo.date.add(tempDate, 'day', -1);
                }
            } else {
                // count from the beginning...
                tempDate.setDate(1);
                //get to the first day that matches...
                for (i = 0; i < 7; i++) {
                    if (tempDate.getDay() === weekDay) {
                        break;
                    }
                    tempDate = dojo.date.add(tempDate, 'day', 1);
                }
                //then add correct number of weeks (first week - add 0 etc.)
                tempDate = dojo.date.add(tempDate, 'week', nthWeek - 1);
            }
            return tempDate;
        },
        isValidId: function (id) {
            var valid = false;
            if (id) {
                if (id.trim() != '') {
                    valid = true;
                }
            }
            return valid;
        },
        getConfirmStatusName: function (type) {
            if (!type) {
                return nlsStrings.Unknown || 'Unknown';
            }
            switch (type.toUpperCase().trim()) {
                case "CHANGE":
                    return nlsStrings.confirmTypeChanged || 'Changed';
                case "CONFIRM":
                    return nlsStrings.confirmTypeConfirmed || 'Confirmed';
                case "DELETED":
                    return nlsStrings.confirmTypeDeleted || 'Deleted';
                case "LEADER":
                    return nlsStrings.Leader || 'Leader';
                case "NEW":
                    return nlsStrings.New || 'New';
                default:
                    return type;
            }
        },
        isReocurringId: function (id) {
            if (id.charAt(12) === ';') {
                return true;
            }
            return false;
        },
        findFailedRequestMessage: function (request, def) {
            if (request.responseText) {
                var rsp = eval(request.responseText);
                if (dojo.isArray(rsp)) {
                    if (rsp[0]) {
                        return rsp[0].message || def;
                    }
                }
            }
            return def;
        },
        removeMember: function (actvityEditorId, memberId) {
            var editor = dijit.byId(actvityEditorId);
            if (editor) {
                var args = {
                    memberId: memberId
                };
                editor._removeMember(args);
            }
        },
        getActivityEditLink: function (activity) {
            var key = activity.id;
            var fmtStr = '<a href="${0}" >${1}</a>';
            var recurring = Sage.Utility.Activity._getReccurenceFlag(activity);
            var desc = activity.Description || Sage.Utility.Activity.getActivityTypeName(Sage.Utility.Activity.getActivityTypeEnumCode(activity.Type));
            var href = 'javascript:Sage.Link.editActivity(\'' + key + '\', ' + recurring + ')';
            return dstring.substitute(fmtStr, [href, desc]);
        },
        getActivitySummaryHeader: function (activity) {
            var key = activity.id;
            var fmtStr = '<a href="${0}" >${1}</a>';
            var sHtml = '';
            if (activity.Alarm) {
                sHtml += '<div class="Global_Images icon24x24 icon_Alarm_24x24" > </div>&nbsp;';
            }
            if ((Sage.Utility.Activity.isReocurringId(activity.id)) || (activity.Recurring)) {
                sHtml += '<div class="Global_Images icon16x16 icon_recurring" > </div>&nbsp;';
            }
            sHtml += '<div class="Global_Images icon24x24 ' + Sage.Utility.Activity.getActivityImageClass(activity.Type, 'medium') + '"> </div>&nbsp;';
            var recurring = Sage.Utility.Activity._getReccurenceFlag(activity);
            var desc = activity.Description || Sage.Utility.Activity.getActivityTypeName(Sage.Utility.Activity.getActivityTypeEnumCode(activity.Type));
            var href = 'javascript:Sage.Link.editActivity(\'' + key + '\', ' + recurring + ')';
            sHtml += dstring.substitute(fmtStr, [href, desc]);
            return sHtml;
        },
        getUserActivitySummaryHeader: function (userActivity) {
            var activity = userActivity.Activity;
            var sHtml = '';
            if (userActivity.Status === "asUnconfirmed") {
                sHtml += '<div class="Global_Images icon16x16 icon_unconfirmedActivity16x16" > </div>';
            }

            if (activity.Alarm) {
                sHtml += '<div class="Global_Images icon24x24 icon_Alarm_24x24" > </div>&nbsp;';
            }
            if ((Sage.Utility.Activity.isReocurringId(activity.$key)) || (activity.Recurring)) {
                sHtml += '<div class="Global_Images icon16x16 icon_recurring" > </div>&nbsp;';
            }
            sHtml += '<div class="Global_Images icon24x24 ' + Sage.Utility.Activity.getActivityImageClass(activity.Type, 'medium') + '"> </div>&nbsp;';
            var recurring = Sage.Utility.Activity._getReccurenceFlag(activity);
            var fmtStr = '<a href="${0}" >${1}</a>';
            var desc = activity.Description || Sage.Utility.Activity.getActivityTypeName(Sage.Utility.Activity.getActivityTypeEnumCode(activity.Type));
            var href = 'javascript:Sage.Link.editActivity(\'' + activity.$key + '\', ' + recurring + ')';
            if (userActivity.Status === "asUnconfirmed") {
                href = 'javascript:Sage.Link.confirmActivityFor(\'' + activity.$key + '\', ' + userActivity.User.$key + ')';
            }
            sHtml += dstring.substitute(fmtStr, [href, desc]);
            return sHtml;
        },
        getActivityCompleteHref: function (activity) {
            var key = activity.$key;
            var recurring = Sage.Utility.Activity._getReccurenceFlag(activity);
            var href = 'javascript:Sage.Link.completeActivity(\'' + key + '\', ' + recurring + ')';
            return href;
        },
        _getReccurenceFlag: function (activity) {
            if (activity.RecurrenceState) {
                // comeing from system feed;
                // Case where no end of reoccuring range. so let treat this as not reoccuring. 
                if ((activity.Recurring === true) && (activity.RecurrenceState === 'rstMaster')) {
                    return false;
                }
                if ((activity.Recurring === true) && ((activity.RecurIterations) < 0)) {
                    return false;
                }
                if (activity.RecurrenceState === 'rstOccurrence') {
                    return true;
                }
            } else {
                if (activity.Recurring === true) {
                    if ((activity.RecurIterations) < 0) {
                        return false;
                    }
                    return true;
                }
                return false;
            }
            return false;
        },
        activityTypeCell: typeCell,
        activityAlarmCell: alarmCell,
        activityRecurringCell: recurCell,
        activityAttachCell: attachCell,
        activityConfirmStatusCell: confrimStatusCell,
        activityDurationCell: durationCell,
        activityNameCell: nameCell,
        activityNameTypeCell: nameTypeCell,
        activityAccountCell: accountCell,
        activityCompleteCell: completeCell,
        historyTypeCell: historyTypeCell,
        activityLeaderCell: leaderCell
    };
});