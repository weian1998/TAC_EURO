/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dojo/_base/declare',
    'Sage/Data/SingleEntrySDataStore',
    'Sage/MainView/BindingsManager',
    'Sage/Utility',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'Sage/UI/_DialogLoadingMixin',
    'Sage/Utility/Activity',
    'dojo/date',
    'dojo/date/locale',
    'dojo/string',
    'Sage/UI/Dialogs',
    'dijit/Tooltip',
    'Sage/UI/AttachmentList',
    'Sage/Data/SDataServiceRegistry',
    'Sage/Utility/File',
    'Sage/Utility/File/Attachment',
    'Sage/UI/Controls/Lookup',
    'dojo/i18n!./nls/ActivityEditor',
    'dojo/text!./templates/ActivityEditor.html',
    'dojo/dom-class',
    'Sage/Utility/UserOptions',
    "dijit/focus",
    'dojo/_base/lang',

    'dijit/Toolbar',
    'dijit/layout/TabContainer',
    'dijit/layout/ContentPane',
    'dijit/form/Textarea',
    'dojox/layout/TableContainer',
    'dijit/layout/BorderContainer',
    'dijit/form/ComboBox',
    'Sage/Services/UserOptions',
    'Sage/UI/Controls/SingleSelectPickList',
    'Sage/UI/Controls/DateTimePicker',
    'Sage/UI/Controls/Lookup',
    'Sage/MainView/ActivityMgr/RecurringEditor',
    'dijit/Dialog',
    'Sage/UI/Controls/DurationSelect',
    'Sage/Services/CalendarSecurityService'
],
function (_Widget, _Templated, declare, SingleEntrySDataStore, BindingsManager, utility, _DialogHelpIconMixin,
    dojoLang, _DialogLoadingMixin, activityUtility, dojoDate, locale, dString, sageDialogs, tooltip, AttachmentList,
    sDataServiceRegistry, fileUtility, attachmentUtility, Lookup, activityEditorStrings, template, domClass, userOptionsUtility, focusUtil, lang) {
    var activityEditor = declare('Sage.MainView.ActivityMgr.ActivityEditor', [_Widget, _Templated], {
        activityId: '',
        activityMemberId: '',
        _memberSecurityData: [],
        mode: '',
        userNotificationId: '',
        id: '',
        activityType: '',
        _options: {},
        _dialog: false,
        _currentUserId: null,
        _originalLeaderId: false,
        _activityService: false,
        _activityData: false,
        _activityStore: false,
        _currentUserActivityData: false,
        _tempUAData: false,
        _currentUserActivityStore: false,
        _notificationData: false,
        _notificationStore: false,
        _notificationBindingMgr: false,
        _historyStore: false,
        _deleteAttendeeConnects: [],
        _attendeesData: [],
        _newAttendeesData: [],
        _attendeesForRemoval: [],
        _userActivitiesRequestCount: 0,
        _resourceRequestCount: 0,
        _resourceDeleteRequestCount: 0,
        _availabilityShowing: false,
        _bindingMgr: false,
        _uaBindingMgr: false,
        _activityChangeConnection: false,
        lup_Account: false,
        lup_Contact: false,
        lup_Opportunity: false,
        lup_Ticket: false,
        lup_Lead: false,
        lup_Leader: false,
        accountLookupConfig: {},
        contactLookupConfig: {},
        opportunityLookupConfig: {},
        ticketLookupConfig: {},
        leadLookupConfig: {},
        resourcesLookupConfig: {},
        _isBinding: false,
        _activitySaved: false,
        _userActivitiesSaved: false,
        _currentUserActivitySaved: false,
        _resourcesSaved: false,
        _resourcesRemoved: false,
        _attachmentsSaved: false,
        _completeAfterSaving: false,
        _attachmentList: false,
        _tempIdForAttachments: false,
        confirmationDisableList: ['pk_Regarding', 'tb_Location', 'dtp_startDate', 'sel_Duration', 'cb_Timeless', 'cb_Alarm', 'sel_AlarmDur', 'cb_AutoRollover', 'rdo_Contact', 'rdo_Lead', 'lup_Account', 'lup_Contact', 'lup_Opportunity', 'lup_Ticket', 'lup_Lead', 'ta_Notes', 'pk_Priority', 'lup_Leader', 'pk_Category'],
        noEditDisableList: ['pk_Regarding', 'tb_Location', 'dtp_startDate', 'sel_Duration', 'cb_Timeless', 'cb_AutoRollover', 'rdo_Contact', 'rdo_Lead', 'lup_Account', 'lup_Contact', 'lup_Opportunity', 'lup_Ticket', 'lup_Lead', 'ta_Notes', 'pk_Priority', 'lup_Leader', 'pk_Category'], // 'cb_Alarm', 'btn_OK', 'sel_AlarmDur',
        _readOnlyMode: false,
        _isProcessing: false,
        eventConnections: [],
        activityDefaultValues: {},
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function () {
            dojoLang.mixin(this, activityEditorStrings);
            this._preloadActivityOptions();
            this._activityService = sDataServiceRegistry.getSDataService('system');
            this._setupStore();
            this._currentUserId = utility.getClientContextByKey('userID') || '';
            this._currentUserId = this._currentUserId.trim();
            dojo.subscribe('/entity/attachment/create', this, this._updateActivityETag);
            dojo.subscribe('/entity/attachment/update', this, this._updateActivityETag);
            dojo.subscribe('/entity/attachment/delete', this, this._updateActivityETag);
        },
        destroy: function () {
            if (this._activityChangeConnection) {
                dojo.disconnect(this._activityChangeConnection);
                this._activityChangeConnection = false;
            }
            if (this._bindingMgr) {
                this._bindingMgr.destroy();
            }
            if (this._uaBindingMgr) {
                this._uaBindingMgr.destroy();
            }
            for (var i = 0; i < this.eventConnections.length; i++) {
                dojo.disconnect(this.eventConnections[i]);
            }
            this.lup_Account.destroy();
            this.lup_Contact.destroy();
            this.lup_Opportunity.destroy();
            this.lup_Ticket.destroy();
            this.lup_Lead.destroy();
            this.lup_Leader.destroy();
            this.eventConnections = [];
            this.inherited(arguments);
        },
        postCreate: function () {
            //set up tooltips for "complete" buttons.  Include change event handlers
            // to keep the tooltip showing the date/time that the completed date will be.
            this._asScheduledTooltip = new tooltip({
                connectId: [this.btn_asScheduled.id],
                label: ' ',
                position: ['below']
            });
            dojo.connect(this.dtp_scheduledDate, 'onChange', this, function () {
                this._asScheduledTooltip.set('label', locale.format(this.dtp_scheduledDate.get('value'), { selector: 'datetime', fullYear: true }));
            });

            this._nowTooltip = new tooltip({
                connectId: [this.btn_Now.id],
                label: ' ',
                position: ['below']
            });
            dojo.connect(this.dtp_completedDate, 'onChange', this, function () {
                this._nowTooltip.set('label', locale.format(this.dtp_completedDate.get('value'), { selector: 'datetime', fullYear: true }));
            });
        },
        isFirstOpen: true,
        show: function (mixinProperties) {
            this._isProcessing = false;
            this._dialog.set('refocus', false);
            this._dialog.show();
            if (this.isFirstOpen) {
                // create lookup controls...
                this.isFirstOpen = false;
                this._ensureLookupsCreated();
                this.connect(this._recurringEditor, 'onStartDateChanged', this._recurringStartDateChanged);
                this.connect(this._recurringEditor, 'onRecurPeriodChanged', this._recurringPeriodChanged);

                this.connect(this._dialog, 'onHide', this._cleanOnClose);
                //ToDo: This makes it so you cannot type in the followup control, but it also
                // causes you to not be able to tab to it...
                //this.sel_Followup.textbox.disabled = true;
            }
            //Reset the duration selector.
            this.sel_AlarmDur.resetItems();
            this.activityDefaultValues = {};
            if (this.mode === 'New') {
                this.activityDefaultValues = mixinProperties || {};
                this._loadData();
            }
            if (this.mode === 'CompleteUnscheduled' && !this.historyId) {
                this.activityDefaultValues = mixinProperties || {};
                this._loadHistory();
            }
            if (!this._dialog._standby) {
                dojoLang.mixin(this._dialog, new _DialogLoadingMixin());
                if (!this._activityData && !this._notificationData) {
                    this._dialog.showLoading();
                }
            }

            // Create help icon
            if (!this._dialog.helpIcon) {
                dojoLang.mixin(this._dialog, new _DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic(this._getHelpTopicByMode());
            }
            this._availabilityShowing = false;
            this.tc_EditActivity.selectChild(this.cp_General);
            this._dialog.resize();
        },
        hide: function () {
            this._dialog.hide();
        },
        _onDlgHide: function () {
            this.onHide();
        },
        onHide: function () { },
        _cleanOnClose: function () {
            var svc = Sage.Services.getService('ClientEntityContext');
            svc.clearTemporaryContext();
            this.set('activityId', '');
            this.set('activityMemberId', '');
            if (this._activityStore) {
                this._activityStore.clearCache();
            }
            if (this._historyStore) {
                this._historyStore.clearCache();
            }

            //Making sure the tooltips are hidden when closing the dialog
            this._hideLookupTooltip(this.lup_Account);
            this._hideLookupTooltip(this.lup_Contact);
            this._hideLookupTooltip(this.lup_Opportunity);
            this._hideLookupTooltip(this.lup_Ticket);
            this._hideLookupTooltip(this.lup_Lead);
            this._hideLookupTooltip(this.lup_Leader);

        },
        _hideLookupTooltip: function (control) {
            if(control) {
                control.hideTooltip();
            }
        },
        _controllOnMouseEnter: function () {
        },
        // ... region - Activity data methods   .....................
        _updateActivityETag: function (attachment) {
            //listener for attachment record changes.  
            if (attachment) {
                this._activityData.AttachmentCount++;
            } else {
                this._activityData.AttachmentCount--;
            }
            if (this._dialog.open && this.activityId) {
                var req = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('system'));
                req.setResourceKind('activities');
                req.setResourceSelector('"' + this.activityId + '"');
                req.setQueryArg('precedence', '0');
                req.read({
                    success: function (activity) {
                        this._activityData['$etag'] = activity['$etag'];
                    },
                    scope: this
                });
            }
        },
        _getHelpTopicByMode: function () {
            switch (this.mode) {
                case 'Confirm':
                    return 'confirmnotifications';
                case 'Complete':
                case 'CompleteUnscheduled':
                    return 'completeactivity';
            }
            return 'activitydetailview';
        },
        _showCorrectButtonBar: function (mode) {
            if (mode === 'Confirm') {
                domClass.add(this.add_edit_buttons, 'display-none');
                domClass.add(this.complete_buttons, 'display-none');
                domClass.remove(this.confirmation_edit_buttons, 'display-none');
            } else if (mode === 'Complete' || mode === 'CompleteUnscheduled') {
                domClass.add(this.add_edit_buttons, 'display-none');
                domClass.add(this.confirmation_edit_buttons, 'display-none');
                domClass.remove(this.complete_buttons, 'display-none');
            } else {
                domClass.add(this.confirmation_edit_buttons, 'display-none');
                domClass.add(this.complete_buttons, 'display-none');
                domClass.remove(this.add_edit_buttons, 'display-none');
            }
        },
        _setModeAttr: function (mode) {
            //console.log('setModeAttr: ' + mode);
            this.mode = mode;
            //set correct button bar...
            this._showCorrectButtonBar(mode);

            if (mode === 'Confirm') {
                //disable activity controls...
                this._ensureLookupsCreated(); //sometimes this happens before they get created.
                this._bulkSetProperty(this, this.confirmationDisableList, 'disabled', true);
            } else {
                //re-enable activity controls...
                this._bulkSetProperty(this, this.confirmationDisableList, 'disabled', false);
            }
            if (mode.indexOf('New') === 0) {
                this.mode = 'New';
                var typename = mode.replace('New ', '').toLowerCase();
                switch (typename) {
                    case 'phonecall':
                    case 'atphonecall':
                        this.activityType = 'atPhoneCall';
                        break;
                    case 'meeting':
                    case 'atappointment':
                        this.activityType = 'atAppointment';
                        break;
                    case 'todo':
                    case 'attodo':
                        this.activityType = 'atToDo';
                        break;
                    case 'personalactivity':
                    case 'atpersonal':
                    case 'personal':
                        this.activityType = 'atPersonal';
                        break;
                    case 'letter':
                    case 'atletter':
                    case 'doc':
                    case 'atdoc':
                        this.activityType = 'atDoc';
                        break;
                    case 'fax':
                    case 'atfax':
                        this.activityType = 'atFax';
                        break;
                    default:
                        this.activityType = 'atAppointment';
                        break;
                }
                this._activityData = false;
                domClass.add(this.btn_Delete.domNode, 'display-none');
                domClass.add(this.btn_Complete.domNode, 'display-none');
            } else {
                domClass.remove(this.btn_Delete.domNode, 'display-none');
                domClass.remove(this.btn_Complete.domNode, 'display-none');
            }
            if (mode === 'Complete' || mode === 'CompleteUnscheduled') {  // show appropriate info for completing activities
                //date section
                domClass.add(this.dateSection_AddEdit.domNode, 'display-none');
                domClass.remove(this.dateSection_Complete.domNode, 'display-none');
                //result picklist
                domClass.remove(this.resultContainer.domNode, 'display-none');
                //Recurring tab
                var idx = this.tc_EditActivity.getIndexOfChild(this.cp_Recurring);
                if (idx > 0) {
                    this.tc_EditActivity.removeChild(this.cp_Recurring);
                    var self = this;
                    window.setTimeout(function () { self._dialog.resize(); }, 10);
                }
                if (this._dialog.open) {
                    // if the dialog is open, we already have the activity record and 
                    // the form is bound to it.  We won't be requesting the activity again 
                    // so just run the initialization stuff...
                    this._setUI();
                    this._completeModeManualBind();  //sets default values on non-bound controls.
                }
                //set default follow-up activity values...
                var fupType = this._options.followUp.defaultFollowUpType;
                var setVal = (fupType === 'None') ? this.noneText : activityUtility.getActivityTypeName(fupType);
                this.sel_Followup.set('value', setVal);
                this.ck_coAttachments.set('checked', this._options.followUp.carryOverAttachments);
                this.ck_coNotes.set('checked', this._options.followUp.carryOverNotes);
            } else {  // show appropriate information for adding, editing activities as well as displaying info for confirmations
                //date section
                domClass.add(this.dateSection_Complete.domNode, 'display-none');
                domClass.remove(this.dateSection_AddEdit.domNode, 'display-none');
                //result picklist
                domClass.add(this.resultContainer.domNode, 'display-none');
                //Recurring tab
                var idx = this.tc_EditActivity.getIndexOfChild(this.cp_Recurring);
                if (idx < 0) {
                    var insIdx = this.tc_EditActivity.getIndexOfChild(this.cp_Attachments);
                    this.tc_EditActivity.addChild(this.cp_Recurring, insIdx);
                    var self = this;
                    window.setTimeout(function () { self._dialog.resize(); }, 10);
                }
            }
            if (this._dialog.helpIcon) {
                this._dialog.set('helpTopic', this._getHelpTopicByMode());
            }
        },
        _setActivityIdAttr: function (activityId) {
            activityId = activityId || '';
            this.activityId = activityId;
            this._activityData = false;
            if (activityId !== '') {
                this.historyId = '';
                this._loadData();
            }
        },
        _getActivityIdAttr: function () {
            return this.activityId;
        },
        _setActivityMemberIdAttr: function (memberId) {
            memberId = memberId || '';
            this.activityMemberId = memberId;
        },
        _getActivityMemberIdAttr: function () {
            return this.activityMemberId;
        },
        _setUserNotificationIdAttr: function (userNotificationId) {
            userNotificationId = userNotificationId || '';
            if (userNotificationId !== this.userNotificationId) {
                this.userNotificationId = userNotificationId;
                this.set('activityId', '');
                this._notificationData = false;
                this._loadNotification();
            }
        },
        _getUserNotificationId: function () {
            return this.userNotificationId;
        },
        _setHistoryIdAttr: function (historyId) {
            historyId = historyId || '';
            if (this.historyId !== historyId) {
                this.historyId = historyId;
                this._activityData = false;
                if (historyId !== '') {
                    this.activityId = '';
                    this._loadHistory();
                }
            }
        },
        _getHistoryIdAttr: function () {
            return this.historyId;
        },
        _preloadActivityOptions: function () {
            this._options = {
                atAppointment: {
                    alarmLead: '15',
                    duration: '60',
                    autoRollover: false,
                    timeless: false
                },
                atPhoneCall: {
                    alarmLead: '15',
                    duration: '15',
                    autoRollover: false,
                    timeless: false
                },
                atToDo: {
                    alarmLead: 'none',
                    duration: '15',
                    autoRollover: false,
                    timeless: false
                },
                atPersonal: {
                    alarmLead: 'none',
                    duration: '5',
                    autoRollover: false,
                    timeless: false
                },
                followUp: {
                    defaultFollowUpType: 'None',
                    carryOverNotes: false,
                    carryOverAttachments: false
                },
                calendar: {
                    dayStartTime: '9',
                    dayEndTime: '6'
                }
            };
            var optionsSvc = Sage.Services.getService('UserOptions');
            if (optionsSvc) {
                optionsSvc.getByCategories(['ActivityMeetingOptions', 'ActivityPhoneOptions', 'ActivityToDoOptions', 'ActivityPersonalOptions', 'Calendar'], this._receivedOptions, this);
            }
        },
        _receivedOptions: function (data) {
            //set these up as easily accessible values...
            var followUpMap = {
                '0': 'None',
                '1': 'atPhoneCall',
                '2': 'atAppointment',
                '3': 'atToDo'
            };
            var opts = data['$resources'];
            for (var i = 0; i < opts.length; i++) {
                var opt = opts[i];
                var appliesTo = (opt.category === 'ActivityMeetingOptions') ? 'atAppointment' :
                                (opt.category === 'ActivityPhoneOptions') ? 'atPhoneCall' :
                                (opt.category === 'ActivityToDoOptions') ? 'atToDo' :
                                (opt.category === 'ActivityPersonalOptions') ? 'atPersonal' : false;
                if (appliesTo && this._options[appliesTo] && opt.value) {
                    switch (opt.name) {
                        case 'AlarmLead':
                            this._options[appliesTo].alarmLead = (parseInt(opt.value, 10) > 0) ? opt.value : 'none';
                            break;
                        case 'Duration':
                            this._options[appliesTo].duration = opt.value;
                            break;
                        case 'Timeless':
                            var tval = opt.value.substring(0, 1).toUpperCase();
                            this._options[appliesTo].timeless = tval === 'T';
                            break;
                        case 'AutoRollover':
                            var arval = opt.value.substring(0, 1).toUpperCase();
                            this._options[appliesTo].autoRollover = arval === 'T';
                            break;
                    }
                } else if (opt.category === 'Calendar') {
                    switch (opt.name) {
                        case 'DayStartTime':
                            this._options.calendar.dayStartTime = userOptionsUtility.getConvertedOptionValue(opt['name'], opt['value']);
                            break;
                        case 'DayEndTime':
                            this._options.calendar.dayEndTime = userOptionsUtility.getConvertedOptionValue(opt['name'], opt['value']);
                            break;
                        case 'DefaultFollowUpType':
                            this._options.followUp.defaultFollowUpType = followUpMap[opt.value] || 'None';
                            break;
                        case 'CarryOverNotes':
                            var nval = opt.value.substring(0, 1).toUpperCase();
                            this._options.followUp.carryOverNotes = nval === 'T';
                            break;
                        case 'CarryOverAttachments':
                            var aval = opt.value.substring(0, 1).toUpperCase();
                            this._options.followUp.carryOverAttachments = aval === 'T';
                    }
                }
            }
        },
        _setupStore: function () {
            if (!this._activityStore) {
                this._activityStore = new SingleEntrySDataStore({
                    include: ['$descriptors'],
                    resourceKind: 'activities',
                    service: this._activityService
                });
            }
            if (!this._currentUserActivityStore) {
                this._currentUserActivityStore = new SingleEntrySDataStore({
                    include: ['$descriptors'],
                    select: ['Alarm', 'AlarmTime', 'Activity/StartDate'],
                    resourceKind: 'userActivities',
                    service: this._activityService
                });
            }
            if (!this._historyStore) {
                //used when completing unscheduled activities
                // and new history items created by mail merge or other processes
                this._historyStore = new SingleEntrySDataStore({
                    include: ['$descriptors'],
                    resourceKind: 'history',
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
            }
        },
        _resetDataProps: function () {
            this._activityData = false;
            this._currentUserActivityData = false;
            this._tempUAData = false;
            this._notificationData = false;
            this._attendeesData = [];
            this._attendeesForRemoval = [];
            this._newAttendeesData = [];
            this._userActivitiesRequestCount = 0;
            this._resourceRequestCount = 0;
            this._resourceDeleteRequestCount = 0;
            this._activitySaved = false;
            this._userActivitiesSaved = false;
            this._currentUserActivitySaved = false;
            this._resourcesSaved = false;
            this._resourcesRemoved = false;
            this._attachmentsSaved = false;
            this._originalLeaderId = false;
            if (this._attachmentList) {
                this._attachmentList.clearNewAttachments();
            }
            this._availabilityDataDateRange = {
                fromDate: false,
                toDate: false,
                users: []
            };
        },
        _loadData: function () {
            //console.log('_loadData');
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            this._resetDataProps();
            if (this._activityStore) {
                //this._resetAttendeesList();
                if (this.mode === 'New') {
                    this._activityStore.newItem({
                        onComplete: function (act) {
                            Sage.Utility.setValue(act, 'Type', this.activityType);
                            this._receivedActivity(act);
                        },
                        onError: this._requestFailure,
                        scope: this
                    });
                } else {
                    this._activityStore.fetch({
                        predicate: '"' + this.activityId + '"',
                        onComplete: this._receivedActivity,
                        onError: this._requestFailure,
                        scope: this
                    });
                }
            }
        },
        _receivedActivity: function (activity) {
            this._activityData = activity;
            if ((this._currentUserActivityStore) && (this.mode !== 'New') && (this.mode != 'CompleteUnscheduled')) {
                //if it is a single occurence of a recurring activity, the id will have a date code appended with semicolon.
                var id = this.activityId || activity.$key;
                id = (id.indexOf(';') > 0) ? id.substring(0, 12) : id;
                var membId = this.activityMemberId || this._currentUserId;
                this._currentUserActivityStore.fetch({
                    predicate: dString.substitute("'ActivityId=${0};UserId=${1}'", [id, membId]),
                    onComplete: this._receivedUserActivity,
                    onError: this._noUserActivity,
                    scope: this
                });
            }

            if (activity.AttachmentCount > 0) {
                this._activityData.Attachment = true;
            }
            this._tempIdForAttachments = false;
            var contextSvc = Sage.Services.getService('ClientEntityContext');
            var context = (this.historyId) ? {
                "EntityId": this.historyId,
                "EntityType": "Sage.Entity.Interfaces.IHistory",
                "Description": this._activityData.$descriptor,
                "EntityTableName": "HISTORY"
            } : {
                "EntityId": this.activityId,
                "EntityType": "Sage.Entity.Interfaces.IActivity",
                "Description": this._activityData.$descriptor,
                "EntityTableName": "ACTIVITY"
            };
            contextSvc.setTemporaryContext(context);

            if (this.mode !== 'New' && this.mode != 'CompleteUnscheduled') {
                this.activityType = activity.Type;
            } else {
                this._applyUserOptionsForNewActivity();
            }

            if (this.activityMemberId && this.activityMemberId !== this._currentUserId && !this._memberSecurityData[this.activityMemberId]) {
                this._checkSecurityAccess(this._currentUserId, this.activityMemberId, function (accessData) {
                    if (accessData) {
                        this._memberSecurityData[this.activityMemberId] = [];
                        this._memberSecurityData[this.activityMemberId].AllowAdd = accessData.AllowAdd;
                        this._memberSecurityData[this.activityMemberId].AllowEdit = accessData.AllowEdit;
                        this._memberSecurityData[this.activityMemberId].AllowDelete = accessData.AllowDelete;
                    }
                    this._setUIForActivityType(activity.Type);
                    this._bind();
                }, this);
            } else {
                this._setUIForActivityType(activity.Type);
                this._bind();
            }

            //save the original leader's id for later...
            if (this._activityData['Leader']) {
                this._originalLeaderId = this._activityData.Leader['$key'];
            } else {
                this._originalLeaderId = this._activityData['UserId'] || this._currentUserId;
            }
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
        },
        _receivedUserActivity: function (userActivity) {
            //console.log('user activity: %o', userActivity);
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            this._currentUserActivityData = userActivity;

            // if the activity is created in the LAN client, the ALARM and ALARMTIME values are null
            // apparantly the lan client handles this, so we have to too.
            if (userActivity.Alarm === null) {
                userActivity.Alarm = this._activityData.Alarm;
            }
            if (userActivity.AlarmTime === null) {
                userActivity.AlarmTime = this._activityData.AlarmTime;
            }
            this._tempUAData = {
                Alarm: userActivity.Alarm,
                AlarmTime: utility.Convert.toDateFromString(userActivity.AlarmTime)
            };

            this._bindUserActivity();
        },
        _loadNotification: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            this._resetDataProps();
            if (!this._notificationStore) {
                this._notificationStore = new SingleEntrySDataStore({
                    include: ['Activity', '$descriptors'],
                    resourceKind: 'userNotifications',
                    service: sDataServiceRegistry.getSDataService('system')
                });
            }
            this._notificationStore.fetch({
                predicate: "'" + this.userNotificationId + "'",
                onComplete: this._receivedNotification,
                onError: this._requestFailure,
                scope: this
            });
        },
        _loadHistory: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            if (this._historyStore) {
                if (!this.historyId) {
                    this._historyStore.newItem({
                        onComplete: function (hist) {
                            this._receivedActivity(dojoLang.mixin(hist, this.activityDefaultValues));
                            this._formatHeader();
                        },
                        scope: this
                    });
                } else {
                    this._historyStore.fetch({
                        predicate: this.historyId,
                        onComplete: function (hist) {
                            this._receivedActivity(hist);
                            this._formatHeader();
                        },
                        onError: this._requestFailure,
                        scope: this
                    });
                }
            }
        },
        _receivedNotification: function (notification) {
            this._receivedActivity(notification.Activity || this._emptyActivity);
            this._notificationData = notification;
            this._formatHeader();
            this._bindUserNotification();
            if (notification.Type === 'New') {
                this._setUIAsUnConfirmed();
            } else {
                domClass.remove(this.otherConfButtons, 'display-none');
                domClass.add(this.newConfButtons, 'display-none');
                if (notification.Type === 'Confirm' || notification.Type === 'Decline') {
                    this.ta_confirmationResponse.set('disabled', true);
                    domClass.remove(this.responseLabel, 'display-none');
                    domClass.remove(this.ta_confirmationResponse.domNode, 'display-none');
                } else {
                    domClass.add(this.responseLabel, 'display-none');
                    domClass.add(this.ta_confirmationResponse.domNode, 'display-none');
                }
                if (notification.Type === 'Change') {
                    this._checkUserConfirmationStatus();
                }
            }
        },
        _checkUserConfirmationStatus: function () {
            var req = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('system'))
                .setResourceKind('userActivities')
                .setResourceSelector('"' + this._notificationData.Activity['$key'] + ';' + this._notificationData.ToUser['$key'] + '"');
            req.read({
                success: function (ua) {
                    if (ua.Status === 'asUnconfirmed') {
                        this._setUIAsUnConfirmed();
                    }
                },
                failure: function () { },
                scope: this
            });
        },
        _setUIAsUnConfirmed: function () {
            domClass.add(this.otherConfButtons, 'display-none');
            domClass.remove(this.newConfButtons, 'display-none');
            this.ta_confirmationResponse.set('disabled', false);
            domClass.remove(this.responseLabel, 'display-none');
            domClass.remove(this.ta_confirmationResponse.domNode, 'display-none');
        },
        _applyUserOptionsForNewActivity: function () {
            //set start and alarm time to user options.
            var newDate = activityUtility.roundDateToNextQuarterHour(new Date());
            //utility.setValue(this._activityData, 'StartDate', utility.Convert.toIsoStringFromDate(newDate));
            //set default values based on user options...
            var alarmdur = '15';
            if (this._options[this.activityType]) {
                var optset = this._options[this.activityType];
                utility.setValue(this._activityData, 'Duration', optset['duration'] || '60');
                alarmdur = optset['alarmLead'];
                utility.setValue(this._activityData, 'Rollover', optset['autoRollover']);
                utility.setValue(this._activityData, 'Timeless', optset['timeless']);

                if (this._activityData.Timeless) {
                    //Create Timeless Date.
                    newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 0, 0, 0);
                }
            }
            utility.setValue(this._activityData, 'StartDate', utility.Convert.toIsoStringFromDate(newDate));

            //override with preConfigured properties (from calendar, sales process, etc.)
            this._activityData = dojoLang.mixin(this._activityData, this.activityDefaultValues);

            //calculate alarm time based on current startdate
            if (alarmdur.toLowerCase() === 'none') {
                utility.setValue(this._activityData, 'Alarm', false);
                alarmdur = 15;
            } else {
                Sage.Utility.setValue(this._activityData, 'Alarm', true);
                alarmdur = parseInt(alarmdur, 10);
            }

            //get the date from the activity again, since it might have been overriden by default values...
            var d = utility.Convert.toDateFromString(utility.getValue(this._activityData, 'StartDate'));
            var alarmTime = this._getAlarmTime(d, alarmdur, this._activityData.Timeless);
            utility.setValue(this._activityData, 'AlarmTime', utility.Convert.toIsoStringFromDate(alarmTime));
            this.sel_AlarmDur.set('startTime', d);
            this.sel_AlarmDur.set('timeValue', alarmTime);
            var ldr = {
                '$key': this._currentUserId,
                '$descriptor': utility.getClientContextByKey('userPrettyName')
            };
            utility.setValue(this._activityData, 'Leader', ldr);

            if (this.activityDefaultValues.hasOwnProperty('carryOverAttachmentsFrom')) {
                var self = this, histId = this.activityDefaultValues['carryOverAttachmentsFrom']
                window.setTimeout(function () {
                    self.doCarryOverAttachments(histId);
                }, 1000);
            }
        },
        _noUserActivity: function () {
            this._bindUserActivity();
        },
        _requestFailure: function (request) {
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            console.warn('error requesting data %o', arguments);
            sageDialogs.showError(this.failedLoadingDataMsg);
            this.hide();
        },
        _createBindings: function () {
            if (this._bindingMgr) {
                this._bindingMgr.destroy();
                this._bindingMgr = false;
            }
            this._bindingMgr = new BindingsManager({
                defaultBinding: { boundEntity: this._activityData },
                items: [
                {
                    boundWidget: this.tb_Location,
                    entityProperty: 'Location'
                }, {
                    boundWidget: this.pk_Regarding,
                    entityProperty: 'Description',
                    onChange: dojo.hitch(this, '_descriptionChanged')
                }, {
                    boundWidget: this.pk_Category,
                    entityProperty: 'Category'
                }, {
                    boundWidget: this.pk_Priority,
                    entityProperty: 'Priority'
                }, {
                    boundWidget: this.ta_Notes,
                    entityProperty: 'LongNotes',
                    onChange: dojo.hitch(this, '_notesChanged')
                }, {
                    boundWidget: this.dtp_startDate,
                    dataType: 'date',
                    entityProperty: 'StartDate',
                    onChange: dojo.hitch(this, '_startDateChanged')
                }, {
                    boundWidget: this.sel_Duration,
                    entityProperty: 'Duration'
                }, {
                    boundWidget: this.sel_Duration,
                    entityProperty: 'StartDate',
                    widgetProperty: 'startTime',
                    dataType: 'date',
                    twoWay: false
                }, {
                    boundWidget: this.sel_AlarmDur,
                    entityProperty: 'StartDate',
                    widgetProperty: 'startTime',
                    dataType: 'date',
                    twoWay: false
                }, {
                    boundWidget: this.cb_Timeless,
                    entityProperty: 'Timeless',
                    widgetProperty: 'checked',
                    onChange: dojo.hitch(this, '_timelessChange')
                }, {
                    boundWidget: this.cb_AutoRollover,
                    entityProperty: 'Rollover',
                    widgetProperty: 'checked'
                }, {
                    boundWidget: this.dtp_scheduledDate,
                    dataType: 'date',
                    entityProperty: 'StartDate'
                }, {
                    boundWidget: this.sel_DurationComplete,
                    entityProperty: 'Duration'
                }, {
                    boundWidget: this.sel_DurationComplete,
                    entityProperty: 'StartDate',
                    widgetProperty: 'startTime',
                    dataType: 'date',
                    twoWay: false
                }, {
                    boundWidget: this.cb_TimelessComplete,
                    entityProperty: 'Timeless',
                    widgetProperty: 'checked',
                    onChange: dojo.hitch(this, '_timelessChange')
                }
            ]
            });
        },

        _createUABindings: function () {
            //if it is new or the current user is not a member, bind the alarm and alarm duration fields to the activity record - otherwise, bind them
            // to the user-activity...            
            this._uaBindingMgr = new BindingsManager({
                items: [{
                    boundWidget: this.cb_Alarm,
                    entityProperty: 'Alarm',
                    widgetProperty: 'checked',
                    onChange: dojo.hitch(this, '_alarmCheckChanged')
                }]
            });
        },
        _createNotificationBindings: function () {
            this._notificationBindingMgr = new BindingsManager({
                items: [{
                    boundWidget: this.ta_confirmationResponse,
                    entityProperty: 'Notes',
                    boundEntity: this._notificationData
                }]
            });
        },
        _bind: function () {
            if (this._activityData) {
                if (!this._bindingMgr) {
                    this._createBindings();
                } else {
                    if (!this._bindingMgr.boundEntity || (this._activityData['$key'] !== this._bindingMgr.boundEntity['$key'])) {
                        this._bindingMgr.setBoundEntity(this._activityData);
                    } else {
                        this._bindingMgr.bind();
                    }
                }
                if (this.mode === 'New' || this.mode === 'CompleteUnscheduled') {
                    this._noUserActivity();
                }
                this._manualBind();
                this._setUI();
            }
        },
        _bindUserNotification: function () {
            if (!this._notificationBindingMgr) {
                this._createNotificationBindings();
            } else {
                this._notificationBindingMgr.setBoundEntity(this._notificationData);
            }
        },
        _isNullOrWhitespace: function (str) {
            return (!str || str.trim() === '');
        },
        _manualBind: function () {
            //because there are not relationships to several related entities, we have to manually bind to keep the denormalized data in sync...
            //console.log('_manualBind');
            if (this._activityData) {
                this._isBinding = true;  //this prevents the change event handlers from overwriting values that we are going to set here...
                //for example, the account change handler removes the contact, opp, and ticket values.
                // account...
                var act = this._activityData;
                var mockAcctObj = this._isNullOrWhitespace(act.AccountId) ? null : {
                    '$key': act.AccountId,
                    '$descriptor': act.AccountName
                };
                this.lup_Account.set('selectedObject', mockAcctObj);
                // contact...
                var mockContact = this._isNullOrWhitespace(act.ContactId) ? null : {
                    '$key': act.ContactId,
                    '$descriptor': act.ContactName
                };
                this.lup_Contact.set('selectedObject', mockContact);

                // opportunity...
                var mockOpp = this._isNullOrWhitespace(act.OpportunityId) ? null : {
                    '$key': act.OpportutunityId,
                    '$descriptor': act.OpportunityName
                };
                this.lup_Opportunity.set('selectedObject', mockOpp);

                // ticket...
                var mockTick = this._isNullOrWhitespace(act.TicketId) ? null : {
                    '$key': act.TicketId,
                    '$descriptor': act.TicketNumber
                };
                this.lup_Ticket.set('selectedObject', mockTick);

                // lead...
                var mockLead = this._isNullOrWhitespace(act.LeadId) ? null : {
                    '$key': act.LeadId,
                    '$descriptor': act.LeadName
                };

                this.lup_Lead.set('selectedObject', mockLead);
                this.tb_LeadCompanyName.set('value', this._isNullOrWhitespace(act.LeadId) ? '' : act.AccountName);

                this._updateLookupSeedValues(act.AccountId);

                // Leader...
                this.lup_Leader.set('selectedObject', act.Leader);

                //recurring tab...
                if (this.mode !== 'Complete') { //Recurring editor can cause reoccunce to change even though editoer is hidden.
                    this._recurringEditor.set('activity', act);
                }
                var alarmTime = Sage.Utility.Convert.toDateFromString(this._activityData.AlarmTime);
                this.sel_AlarmDur.set('timeValue', alarmTime);


                this._completeModeManualBind();

                this._isBinding = false;
            }
        },
        _completeModeManualBind: function () {
            if (this.mode === 'Complete' || this.mode === 'CompleteUnscheduled') {

                this.dtp_completedDate.set('value', new Date());

                this.pl_Result.set('value', this.completeText);
                if (this.mode === 'Complete') {
                    this.pl_Result.focus();
                }
            }
        },
        _bindUserActivity: function () {
            if (!this._uaBindingMgr) {
                this._createUABindings();
            }
            //before we bind, just make sure the start date is correct because it re-calculates the duration again only
            // when setting the time value...  Depending on how fast things load, sometimes the start date isn't right yet.
            //var disabled = this.sel_AlarmDur.get('disabled');
            this.sel_AlarmDur.set('disabled', false);
            var instanceStartDate = this._getActivityStartDate();
            this.sel_AlarmDur.set('startTime', instanceStartDate);

            var ent = (this._currentUserActivityData) ? this._currentUserActivityData : this._activityData;
            var alarmTime = utility.Convert.toDateFromString(ent.AlarmTime);
            if (this._currentUserActivityData && utility.getValue(this._activityData, 'RecurrenceState') === 'rstOccurrence') {
                //adjust the useractivity alarm time to match this occurrence...
                var baseStartDate = utility.Convert.toDateFromString(this._currentUserActivityData.Activity.StartDate);
                var baseAlarmDate = utility.Convert.toDateFromString(this._currentUserActivityData.AlarmTime);
                var dur = dojoDate.difference(baseStartDate, baseAlarmDate, 'minute');
                alarmTime = dojoDate.add(instanceStartDate, 'minute', dur);
            }
            this._uaBindingMgr.setBoundEntity(ent);

            this.sel_AlarmDur.set('timeValue', alarmTime);
            this.sel_AlarmDur.set('disabled', !ent.Alarm || this.mode === 'Confirm');
        },
        _getActivityStartDate: function () {
            if (this._activityData) {
                var sDate = Sage.Utility.Convert.toDateFromString(this._activityData.StartDate);
                if ((this._activityData.Timeless) && (activityUtility.isDateFiveSecondRuleTimeless(sDate))) {
                    return new Date(sDate.getUTCFullYear(), sDate.getUTCMonth(), sDate.getUTCDate(), 0, 0, 5);
                }
                return sDate;
            }
            return new Date();
        },
        _onShowAvailabilityTab: function () {
            if (!this._availabilityShowing) {
                this._resetAttendeesList();
                this._loadAttendeesData();
            } else {
                scheduler.setCurrentView(this._getActivityStartDate(), 'timeline');
            }
        },
        _accountChanged: function (newAcct) {

            if (this._isBinding) { return; }

            var newId = (newAcct) ? newAcct['$key'] : '';
            var newActName = (newAcct) ? newAcct['$descriptor'] : '';

            var act = this._activityData;
            var mustSetContact = this._isNullOrWhitespace(act.ContactId);

            act.AccountId = newId;
            act.AccountName = newActName;
            act.ContactId = null;
            act.ContactName = '';
            act.PhoneNumber = '';
            act.OpportunityId = null;
            act.OpportunityName = '';
            act.TicketId = null;
            act.TicketNumber = '';
            act.LeadId = null;
            act.LeadName = '';

            this._isBinding = true;
            this.lup_Contact.set('selectedObject', null);
            this.lup_Opportunity.set('selectedObject', null);
            this.lup_Ticket.set('selectedObject', null);
            this.lup_Lead.set('selectedObject', null);
            this.tb_LeadCompanyName.set('value', '');
            this._updateLookupSeedValues(newId);

            this.lup_Lead.set('selectedObject', null);
            this.tb_LeadCompanyName.set('value', '');
            if (mustSetContact) {
                this._setContactToCurrentAccountPrimary();
            }
            this._isBinding = false;
        },
        _contactChanged: function (newContact) {
            if (this._isBinding) { return; }
            var act = this._activityData;
            if (!newContact) {
                act.ContactId = null;
                act.ContactName = '';
                act.PhoneNumber = '';
                return;
            }
            act.ContactId = newContact['$key'];
            act.ContactName = newContact['$descriptor'];
            act.PhoneNumber = Sage.Utility.getValue(newContact, 'WorkPhone');

            //remove lead
            act.LeadId = null;
            act.LeadName = '';

            //set associated account
            act.AccountId = newContact.Account['$key'];
            act.AccountName = newContact.Account.AccountName;
            //account changed, so update seed values...
            this._updateLookupSeedValues(newContact.Account['$key']);

            this._isBinding = true;
            this.lup_Account.set('selectedObject', { '$key': newContact.Account['$key'], '$descriptor': newContact.Account.AccountName });
            this.lup_Lead.set('selectedObject', null);
            this.tb_LeadCompanyName.set('value', '');
            this._isBinding = false;

        },
        _opportunityChanged: function (newOpp) {
            if (this._isBinding) { return; }
            /*
            The logic for when the opportunity changes is like this...
            - If there is already a contact and account selected, and the opportunity is associated to the same account - do nothing
            - If there is no contact or account selected for the activity - or the account is different do the following:
            - Set the account to the associated account and:
            - If ONE associated contact is marked IsPrimary = true set the contact to it.
            - if more than one associated contact is marked primary, or none are marked primary, 
            -if one of these is primary for the account and use it
            -if not, just grab the first one.
            -if there are no contacts associate with the opportunity, use the account's primary contact.
            */

            var act = this._activityData;
            if (!newOpp) {
                act.OpportunityId = null;
                act.OpportunityName = '';
                return;
            }
            act.OpportunityId = newOpp['$key'];
            act.OpportunityName = newOpp['$descriptor'];

            if (this._isNullOrWhitespace(act.AccountId) || act.AccountId !== newOpp.Account['$key']) {

                //set the associated account...
                act.AccountId = newOpp.Account['$key'];
                act.AccountName = newOpp.Account.AccountName;
                act.LeadId = null;
                act.LeadName = '';

                this._updateLookupSeedValues(newOpp.Account['$key']);

                this._isBinding = true;
                this.lup_Account.set('selectedObject', { '$key': newOpp.Account['$key'], '$descriptor': newOpp.Account.AccountName });
                //remove contact for now, then when we find the primary, we'll set it again.
                this.lup_Contact.set('selectedObject', null);
                this.lup_Lead.set('selectedObject', null);
                this.tb_LeadCompanyName.set('value', '');
                this._isBinding = false;

                this._setContactBasedOnOpportunity();
            }
        },
        _ticketChanged: function (newTick) {
            if (this._isBinding) { return; }
            var act = this._activityData;
            if (!newTick) {
                act.TicketId = null;
                act.TicketNumber = '';
                return;
            }

            act.TicketId = newTick['$key'];
            act.TicketNumber = newTick['$descriptor'];
            //update account and contact, if there isn't an account - or if the account is different from the ticket's account
            if (this._isNullOrWhitespace(act.AccountId) || act.AccountId !== newTick.Account['$key']) {
                act.AccountId = newTick.Account['$key'];
                act.AccountName = newTick.Account['AccountName'];
                act.LeadId = null;
                act.LeadName = '';
                this._updateLookupSeedValues();

                //Do we set it to the contact associated with the ticket - or the primary?
                // I'm going with the one on the ticket, but previous versions used the primary...
                act.ContactId = Sage.Utility.getValue(newTick, 'Contact.$key');
                act.ContactName = Sage.Utility.getValue(newTick, 'Contact.NameLF');
                act.PhoneNumber = Sage.Utility.getValue(newTick, 'Contact.WorkPhone');

                this._isBinding = true;
                this.lup_Account.set('selectedObject', { '$key': newTick.Account['$key'], '$descriptor': newTick.Account['AccountName'] });
                this.lup_Contact.set('selectedObject', { '$key': newTick.Contact['$key'], '$descriptor': newTick.Contact['NameLF'] });
                this.lup_Lead.set('selectedObject', null);
                this.tb_LeadCompanyName.set('value', '');
                this._isBinding = false;
                // In case I have to change it back to the account's primary...
                //this._setContactToCurrentAccountPrimary();
            }
        },
        _leadChanged: function (newLead) {
            if (this._isBinding) { return; }
            var act = this._activityData;
            if (!newLead) {
                act.LeadId = null;
                act.LeadName = '';
                act.PhoneNumber = '';
                this.tb_LeadCompanyName.set('value', '');
                return;
            }
            //clear out the TACO and make way for Lead.
            act.ContactId = null;
            act.ContactName = '';
            act.AccountId = null;
            act.TicketId = null;
            act.TicketNumber = '';
            act.OpportunityId = null;
            act.OpportunityName = '';
            this._updateLookupSeedValues();
            this._isBinding = true;
            this.lup_Contact.set('selectedObject', null);
            this.lup_Account.set('selectedObject', null);
            this.lup_Opportunity.set('selectedObject', null);
            this.lup_Ticket.set('selectedObject', null);
            this._isBinding = false;
            // now set the lead info...
            act.LeadId = newLead['$key'];
            act.LeadName = newLead['LeadFullName'];
            act.AccountName = newLead['Company'];
            act.PhoneNumber = newLead['WorkPhone'];
            this.tb_LeadCompanyName.set('value', newLead['Company']);
        },
        _leaderChanged: function (newLeader) {
            if (this._isBinding) { return; }
            var oldLeaderId = this._activityData.Leader['$key'] || this._activityData['UserId'];
            if (newLeader) {
                var key = newLeader['$key'].substr(0, 12);
                this._activityData.Leader = {
                    '$key': key,
                    '$descriptor': newLeader['$descriptor'] || newLeader['Name']
                };
                this._activityData.LeaderChanged = true;
            }
            this._updateUsersListWithNewLeader(oldLeaderId, this._activityData.Leader);
        },
        _setContactBasedOnOpportunity: function () {
            if (this._isNullOrWhitespace(this._activityData.OpportunityId)) {
                this._rebindToCurrentContact();
                return;
            }
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('opportunities');
            var pathIdx = req.uri.pathSegments.length - 1;
            var resourceSegment = req.uri.getPathSegment(pathIdx);
            resourceSegment['predicate'] = '"' + this._activityData.OpportunityId + '"';
            req.uri.setPathSegment(pathIdx + 1, 'Contacts');
            req.setQueryArg('select', 'IsPrimary,Contact/NameLF,Contact/IsPrimary,Contact/WorkPhone');
            req.setQueryArg('orderby', 'IsPrimary desc');
            req.read({
                success: function (data) {
                    var oppCons = data['$resources'];
                    if (oppCons.length < 1) {
                        this._setContactToCurrentAccountPrimary();
                        return;
                    }
                    var oppPri = false, accPri = false, firstCon = oppCons[0], newActCon;
                    for (var i = 0; i < oppCons.length; i++) {
                        if (!_isNullOrWhitespace(oppCons[i])) {
                            if (oppCons.IsPrimary) {
                                if (!oppPri || oppCons[i].Contact.IsPrimary) {
                                    oppPri = oppCons[i];
                                }
                            }
                            if (!accPri && oppCons[i].Contact.IsPrimary) {
                                accPri = oppCons[i];
                            }
                        }
                    }
                    newActCon = oppPri || accPri || firstCon;
                    if (newActCon) {
                        this._activityData.ContactId = Sage.Utility.getValue(newActCon, 'Contact.$key');
                        this._activityData.ContactName = Sage.Utility.getValue(newActCon, 'Contact.NameLF');
                        this._activityData.PhoneNumber = Sage.Utility.getValue(newActCon, 'Contact.WorkPhone');
                        this._rebindToCurrentContact();
                    }
                },
                failure: function () {
                    this._rebindToCurrentContact();
                },
                scope: this
            });
        },
        _setContactToCurrentAccountPrimary: function () {
            if (this._isNullOrWhitespace(this._activityData.AccountId)) {
                this._rebindToCurrentContact();
                return;
            }
            //look up the primary contact...
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('accounts');
            var pathIdx = req.uri.pathSegments.length - 1;
            var resourceSegment = req.uri.getPathSegment(pathIdx);
            resourceSegment['predicate'] = '"' + this._activityData.AccountId + '"';
            req.uri.setPathSegment(pathIdx + 1, 'Contacts');
            req.setQueryArg('select', 'NameLF,IsPrimary,WorkPhone');
            req.setQueryArg('orderby', 'IsPrimary desc');  //rather than selecting "where IsPrimary", do it this way so we at least get something - if there is one that is primary, it will come back, otherwise, we'll just get one.
            req.setQueryArg('count', '1');  //only need one...
            req.read({
                success: function (data) {
                    var contacts = data['$resources'];
                    if (contacts.length < 1) {
                        //fall back to the one that was there...
                        this._rebindToCurrentContact();
                        return;
                    }
                    var primaryContact = contacts[0];
                    this._activityData.ContactId = Sage.Utility.getValue(primaryContact, '$key');
                    this._activityData.ContactName = Sage.Utility.getValue(primaryContact, 'NameLF');
                    this._activityData.PhoneNumber = Sage.Utility.getValue(primaryContact, 'WorkPhone');
                    this._isBinding = true;
                    this.lup_Contact.set('selectedObject', primaryContact);
                    this._isBinding = false;
                },
                failure: function () {
                    this._rebindToCurrentContact();
                },
                scope: this
            });
        },
        _rebindToCurrentContact: function () {
            this._isBinding = true;
            this.lup_Contact.set('selectedObject', { '$key': this._activityData.ContactId, '$descriptor': this._activityData.ContactName });
            this._isBinding = false;
        },
        _updateLookupSeedValues: function (newSeed) {
            var accId = newSeed || this._activityData.AccountId;
            this.contactLookupConfig.seedValue = accId;
            this.opportunityLookupConfig.seedValue = accId;
            this.ticketLookupConfig.seedValue = accId;
        },
        // ... endregion - data methods

        // ... region UI interactions   ...
        _setUI: function () {
            this._formatHeader();
            this._setDisabledByTimlessValue();
            this._setHasAlarmUI();
            if (this._isNullOrWhitespace(this._activityData.LeadId)) {
                this.rdo_Contact.set('checked', true);
            } else {
                this.rdo_Lead.set('checked', true);
            }
            this._setContactLeadVisibility();
            this._setScheduledByLabel();
        },

        _checkSecurityAccess: function (accessFor, accessTo, callback, scope) {
            this.accessData = false;
            if (!this._accessStore) {
                this._accessStore = new SingleEntrySDataStore({
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
                    callback.call(scope, null);
                },
                scope: this
            });
        },

        _setUIForActivityType: function (actType) {
            this.pk_Regarding.set('pickListName', activityUtility.getActivityPicklistName('Regarding', actType));
            this.pk_Category.set('pickListName', activityUtility.getActivityPicklistName('Category', actType));
            this.pl_Result.set('pickListName', activityUtility.getActivityPicklistName('Result', actType));

            //Applying AllowComplete Option.
            this.btn_Complete.set('disabled', !this._activityData.AllowComplete);

            //If the user doesn't have access to edit the Leader's calendar, we need to disable a bunch of stuff...
            //this.btn_OK.set('disabled', false);  //enable it in case it was disabled the last time around...
            if (this.mode !== 'Confirm') {
                var editAllowed = this._activityData.AllowEdit;
                var deleteAllowed = this._activityData.AllowDelete;
                
                //Users can edit only alarm time if its not the leader's instance
                if (this.activityMemberId && this.activityMemberId !== this._activityData.Leader.$key) {
                    editAllowed = false;
                    deleteAllowed = false;
                }
                this._bulkSetProperty(this, this.noEditDisableList, 'disabled', (!editAllowed));

                //To allow members to update their alarmtime even if they don't have edit access to leader's calendar
                if ((this.activityMemberId && this._memberSecurityData[this.activityMemberId] && this._memberSecurityData[this.activityMemberId].AllowEdit) || this.activityMemberId === this._currentUserId || this._activityData['UserId'] === this._currentUserId) {
                    this.btn_OK.set('disabled', false);
                } else {
                    this.btn_OK.set('disabled', !this._activityData.AllowEdit);
                }
                this.btn_Delete.set('disabled', !deleteAllowed);
            }

            if (this.mode === 'Complete') {
                this.btn_asScheduled.set('disabled', !this._activityData.AllowComplete);
                this.btn_Now.set('disabled', !this._activityData.AllowComplete);
            }

            // disable the category picklist for personal activities...
            this.pk_Category.set('disabled', (actType === 'atPersonal') || (this.mode === 'Confirm') || this.pk_Category.get('disabled'));
            // hide the add (lookup) resources/users button for to-do and personal activities
            if ((!this._canEdit()) || (actType === 'atPersonal' || actType === 'atToDo')) {
                domClass.add(this.lup_Resources.domNode, 'display-none');
            } else {
                domClass.remove(this.lup_Resources.domNode, 'display-none');
            }
        },
        _setDisabledByTimlessValue: function () {
            if (!this._activityData) {
                return;
            }
            var tless = this._activityData['Timeless'];
            //this.cb_AutoRollover.set('disabled', !tless);
            this._handleAutoRolloverState();
            this.dtp_startDate.set('displayTime', !tless);
            var editAllowed = this._activityData.AllowEdit;
            if (this.activityMemberId && this.activityMemberId !== this._activityData.Leader.$key) {
                editAllowed = false;
            }
            this.sel_Duration.set('disabled', tless || (this.mode === 'Confirm') || !editAllowed);
            this.sel_DurationComplete.set('disabled', tless);
            this.dtp_scheduledDate.set('displayTime', !tless);
        },
        _handleAutoRolloverState: function () {
            var enabled = (this._activityData['Timeless'] && !this._activityData['Recurring']);
            if (enabled) {
                this.cb_AutoRollover.set('disabled', false);
            } else {
                this.cb_AutoRollover.set('disabled', true);
                this.cb_AutoRollover.set('checked', false);
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
        _timelessChange: function () {
            this._setDisabledByTimlessValue();
            if (this.mode === 'Complete' || this.mode === 'CompleteUnscheduled') {
                if (this.cb_TimelessComplete.get('checked')) {
                    var schedDate = this.dtp_scheduledDate.get('value');
                    schedDate.setHours(0);
                    schedDate.setMinutes(0);
                    schedDate.setSeconds(5);
                    this.dtp_scheduledDate.set('value', schedDate);
                   
                }
            } else {
                if (this.cb_Timeless.get('checked')) {
                    var d = this.dtp_startDate.get('value');
                    d.setHours(0);
                    d.setMinutes(0);
                    d.setSeconds(5);
                    this.dtp_startDate.set('value', d);
                    var leadTime = this._getAlarmLeadTime();
                    var alarmTime = this._getAlarmTime(d, leadTime, true);
                    this.sel_AlarmDur.set('startTime', d);
                    this.sel_AlarmDur.set('timeValue', alarmTime);
                    //utility.setValue(this._activityData, 'AlarmTime', utility.Convert.toIsoStringFromDate(alarmTime));
                }
                else {
                    var d = this.dtp_startDate.get('value');
                    var nowDate = activityUtility.roundDateToNextQuarterHour(new Date());
                    var min = nowDate.getMinutes();
                    var hour = nowDate.getHours();
                    var newDate = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, min);
                    this.dtp_startDate.set('value', newDate);
                    var leadTime = this._getAlarmLeadTime();
                    var alarmTime = this._getAlarmTime(newDate, leadTime, false);
                    this.sel_AlarmDur.set('startTime', newDate);
                    this.sel_AlarmDur.set('timeValue', alarmTime);
                }
            }
        },
        _alarmCheckChanged: function (entity, property, oldValue, newValue) {
            this._setHasAlarmUI(newValue);
        },
        _descriptionChanged: function () {
            this._formatHeader();
        },
        _notesChanged: function (entity, property, oldNotes, newNotes) {
            utility.setValue(this._activityData, 'Notes', (newNotes) ? newNotes.substr(0, 255) : newNotes);
        },
        _startDateChanged: function () {
            var newStartDate = this.dtp_startDate.get('value');
            this.sel_Duration.set('startTime', newStartDate);
            this.sel_AlarmDur.set('startTime', newStartDate);

            //Account for Timeless start Time
            var leadTime = this._getAlarmLeadTime();
            var alarmTime = this._getAlarmTime(newStartDate, leadTime, this.cb_Timeless.get('checked'));
            this.sel_AlarmDur.set('timeValue', alarmTime);
            
            //let the duration picker calculate the new alarm time, then set it back to the activity or user activity...
            var act = (this._currentUserActivityData) ? this._currentUserActivityData : this._activityData;
            Sage.Utility.setValue(act, 'AlarmTime', Sage.Utility.Convert.toIsoStringFromDate(this.sel_AlarmDur.get('timeValue')));

            if (this._availabilityShowing) {
                scheduler.setCurrentView(newStartDate, 'timeline');
                //make sure we have the availability data...
                this._requestAvailability();
            }

            //tell the recurring editor...
            this._recurringEditor.set('startDate', newStartDate);
        },
        _getAlarmTime: function (startDate, leadTime, timeless) {
            var alarmTime = dojoDate.add(startDate, 'minute', leadTime * -1);
            if (timeless === true) {
                alarmTime = new Date(startDate.getFullYear(), startDate.getMonth(),startDate.getDate());
                alarmTime = dojoDate.add(alarmTime, 'minute', leadTime * -1);               
            }
            return alarmTime;

        },
        _getAlarmLeadTime: function () {
            var leadTime = '15';
            if (this._options[this.activityType]) {
                var optset = this._options[this.activityType];
                leadTime = optset['alarmLead'];
            }
            if (leadTime.toLowerCase() === 'none') {
                leadTime = 15;
            } else {
                leadTime = parseInt(leadTime, 10);
            }
            return leadTime;
        },

        _setHasAlarmUI: function (newValue) {
               
            if (typeof newValue === 'undefined') {
                newValue = Sage.Utility.getValue(this._currentUserActivityData || this._activityData, 'Alarm');
            }
            this.sel_AlarmDur.set('disabled', !newValue || this.mode === 'Confirm');
        },
        _setContactLeadVisibility: function () {
            var cVisible = this.rdo_Contact.get('checked');

            domClass.remove((cVisible) ? this.contactContainer.domNode : this.leadContainer.domNode, 'display-none');
            domClass.add((cVisible) ? this.leadContainer.domNode : this.contactContainer.domNode, 'display-none');
        },
        _formatHeader: function () {
            //'${actionText} ${activityType} - ${description}',
            var action = '';
            var activityType = activityUtility.getActivityTypeName(this._activityData['Type'] || 'atAppointment');
            switch (this.mode) {
                case 'New':
                    action = this.scheduleText;
                    break;
                case 'Complete':
                case 'CompleteUnscheduled':
                    action = this.completeText;
                    break;
            }
            if (this.mode === 'Confirm') {
                if (!this._notificationData) {
                    return;
                }
                this._getUserInfoFor(this._notificationData.FromUser['$key'], function (user) {
                    if (this._notificationData) {
                        var confType = this._notificationData.Type;
                        switch (confType) {
                            case 'Change':
                                action = this.updatedText;
                                break;
                            case 'Confirm':
                                action = this.acceptedText;
                                break;
                            case 'Deleted':
                                action = this.deletedText;
                                break;
                            case 'Leader':
                                action = this.scheduledText;
                                break;
                            case 'Decline':
                                action = this.declinedText;
                                break;
                        }
                        var fmttext = (confType === 'New') ? this.newConfirmationHeaderFormatText : this.otherConfimationHeaderFormatText;
                        this._setHeader(dString.substitute(fmttext, {
                            activityType: activityType,
                            actionText: action,
                            user: user['UserName'] || user['$descriptor']
                        }));
                    }
                });
            } else {
                this._setHeader(dString.substitute(this.dialogHeaderFormatText, {
                    actionText: action,
                    activityType: activityType,
                    description: this._activityData['Description'] || ''
                }));
            }

        },
        _setHeader: function (headerText) {
            var html = dString.substitute('<div class="Global_Images icon16x16 ${0}" > </div>&nbsp;<span class="activity-dialog-title">${1}</span>', [activityUtility.getActivityImageClass(this._activityData['Type'] || 'atAppointment', 'small'), headerText]);
            this._dialog.titleNode.innerHTML = html;
        },
        _setScheduledByLabel: function () {
            // adds the note:  Scheduled by <user> on <scheduled Date>
            var createDate = utility.Convert.toDateFromString(utility.getValue(this._activityData, 'CreateDate'));
            if (!createDate || createDate.getFullYear() < 1000) {
                createDate = new Date();
            }
            var startDate = this._getActivityStartDate();
            var createUser = utility.getValue(this._activityData, 'CreateUser').trim();
            var fmtStr = (this.mode === 'Complete' || this.mode === 'CompleteUnscheduled') ? this.completeScheduledByFormatText : this.scheduledByFormatText;
            var lbl;
            if (!createUser || this._currentUserId === createUser) {
                createUser = utility.getClientContextByKey('userPrettyName');
            } else if (createUser === 'PROCESS' || createUser === 'ADMIN') {
                createUser = 'Administrator';
            } else {
                this._getUserInfoFor(createUser, function (user) {
                    lbl = dString.substitute(fmtStr, {
                        user: user['$descriptor'],
                        date: locale.format(createDate, { selector: 'date', fullYear: true }),
                        startDate: locale.format(startDate, { selector: 'date', fullYear: true })
                    });
                    dojo.html.set(this.lbl_ScheduledBy, lbl);
                    dojo.html.set(this.lbl_ScheduledByComp, lbl);
                });
                return;
            }

            lbl = dString.substitute(fmtStr, {
                user: createUser,
                date: locale.format(createDate, { selector: 'date', fullYear: true }),
                startDate: locale.format(startDate, { selector: 'date', fullYear: true })
            });
            dojo.html.set(this.lbl_ScheduledBy, lbl);
            dojo.html.set(this.lbl_ScheduledByComp, lbl);
        },
        _getUserInfoFor: function (userId, callback) {
            if (userId) {
                var request = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic', false, true, true)); //go ahead and cache this...
                request.setResourceKind('userInfo');
                request.setResourceSelector("'" + userId + "'");
                //using precedence of 0 we only get $descriptor which is <lastname, firstname>, 
                //...but do we want the UserName property which is <firstname lastname>???
                request.setQueryArg('precedence', '0');
                request.read({
                    success: callback,
                    scope: this,
                    failure: function () { }
                });
            }
        },
        _showRecurringTab: function () {
            this._recurringEditor.onTabShow();
            this._recurringEditor._setReadOnly(!this._canEdit());
        },
        _showAttachmentsTab: function () {
            var self = this;
            window.setTimeout(function () {
                self._ensureAttachmentList();
            }, 100);
        },
        _ensureAttachmentList: function () {
            if (!this._attachmentList) {
                this._attachmentList = new AttachmentList({
                    workspace: '',
                    tabId: '',
                    placeHolder: this.id + '_attachmentsGridPlaceholder',
                    parentRelationshipName: 'activityId'
                });
                var self = this;
                this._attachmentList.startup(function () {
                    if (self.cp_Attachments) {
                        self.cp_Attachments.resize();
                    }
                    if (self._canEdit()) {
                        self._attachmentList.setToReadOnly(false);
                    }
                    else {
                        self._attachmentList.setToReadOnly(true);
                    }

                });
            } else {

                if (this._canEdit()) {
                    this._attachmentList.setToReadOnly(false);
                }
                else {
                    this._attachmentList.setToReadOnly(true);
                }
                this._attachmentList.resetEntityContext();
            }

        },

        // ... endregion UI interactions

        // ... region click/action handlers
        _completeClick: function () {
            this._completeAfterSaving = true;
            this._saveAndClose();
        },
        _deleteClick: function () {
            if (this._activityData && this._activityStore) {
                sageDialogs.raiseQueryDialogExt({
                    title: '',
                    query: this.areYouSureText,
                    callbackFn: function (result) {
                        if (result) {
                            this._activityStore.deleteEntity(this._activityData, this._successfulActivityDelete, this._failedActivityDelete, this);
                        }
                    },
                    yesText: this.okText,
                    noText: this.cancelText,
                    icon: 'questionIcon',
                    scope: this
                });
            }
        },
        _asScheduledClick: function () {
            this._completeActivity(this.dtp_scheduledDate.get('value'));
        },
        _nowClick: function () {
            this._completeActivity(this.dtp_completedDate.get('value'));
        },
        _completeActivity: function (completedDate) {
            if (this._isProcessing) {
                return;
            }
            this._isProcessing = true;
            /*
            to get the template:
            http://localhost:17966/SlxClient/slxdata.ashx/slx/system/-/activities/$service/complete/$template?format=json
            */
            if (this.mode === 'Complete') {
                var payload = {
                    "$name": "Complete",
                    "request": {
                        "entity": this._activityData,
                        "userId": this._currentUserId,
                        "result": this.pl_Result.get('value'),
                        "resultCode": '',
                        "completeDate": utility.Convert.toIsoStringFromDate(completedDate)
                    }
                };

                var request = new Sage.SData.Client.SDataServiceOperationRequest(sDataServiceRegistry.getSDataService('system'))
	                .setResourceKind('activities')
	                .setOperationName('Complete');
                request.execute(payload, {
                    success: this._successfulComplete,
                    failure: this._failedComplete,
                    scope: this
                });
            } else if (this.mode === 'CompleteUnscheduled') {
                var histStore = new SingleEntrySDataStore({
                    include: ['$descriptors'],
                    resourceKind: 'history',
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
                utility.setValue(this._activityData, 'CompletedDate', utility.Convert.toIsoStringFromDate(completedDate));
                utility.setValue(this._activityData, 'Result', this.pl_Result.get('value'));
                histStore.saveNewEntity(this._activityData, this._successfulComplete, this._failedComplete, this);
            }
        },
        _okClick: function () {
            var activeElement = focusUtil.curNode;
            if(activeElement){
                activeElement.blur();
            }
            // IE8 has an issue where the value is saved before the blur realizes the value has changed
            //  and setting a timeout of 1 is enough for the change to be seen after the blur
            setTimeout(lang.hitch(this, function() {
            this._saveAndClose();
            }), 1);
        },
        _saveAndClose: function () {
            var alarmTime = this.sel_AlarmDur.get('timeValue');
            //Alarm Time should never have a timeless date so fix it duration picker adds it.
            if (alarmTime.getSeconds() === 5) {
                alarmTime = new Date(alarmTime.getFullYear(), alarmTime.getMonth(), alarmTime.getDate(), alarmTime.getHours(), alarmTime.getMinutes(), 0);
            }
            if (this.mode === 'New') {
                if (this._attachmentList) {
                    var attachments = this._attachmentList.getNewAttachments();
                    if (attachments.length > 0) {
                        this._activityData.Attachment = true;
                    }
                }
                this._currentUserActivitySaved = true;
                utility.setValue(this._activityData, 'Alarm', this.cb_Alarm.get('checked'));
                utility.setValue(this._activityData, 'AlarmTime', utility.Convert.toIsoStringFromDate(alarmTime));
                this._activityStore.saveNewEntity(this._activityData, this._successfulActivitySave, this._failedActivitySave, this);
            } else {
                this._activityData.Attachment = this._activityData.AttachmentCount > 0 ? true : false;
                if (this._currentUserActivityData) {
                    //if it hasn't changed, don't bother posting...
                    if (utility.getValue(this._activityData, 'RecurrenceState') === 'rstOccurrence') {
                        //Set the current alarm and alarmtime values onto the activity 
                        // and don't save the user activity since we are creating an exception...
                        utility.setValue(this._activityData, 'Alarm', this.cb_Alarm.get('checked'));
                        utility.setValue(this._activityData, 'AlarmTime', utility.Convert.toIsoStringFromDate(alarmTime));
                        this._currentUserActivitySaved = true;
                    } else if ((this._tempUAData) && (this._tempUAData.Alarm === this._currentUserActivityData.Alarm
                            && this._tempUAData.AlarmTime.getTime() === alarmTime.getTime())) {
                        this._currentUserActivitySaved = true;
                    } else {
                        delete (this._currentUserActivityData.Activity);
                        this._currentUserActivityData.AlarmTime = utility.Convert.toIsoStringFromDate(alarmTime);
                        this._currentUserActivityStore.save({
                            scope: this,
                            success: this._successfulCurrentUserActivitySave,
                            failure: this._failedUserActivitySave
                        });
                    }
                } else {
                    utility.setValue(this._activityData, 'AlarmTime', utility.Convert.toIsoStringFromDate(alarmTime));
                    this._currentUserActivitySaved = true;
                }
                if (this._activityData.AllowEdit) {
                    this._activityStore.save({
                        scope: this,
                        success: this._successfulActivitySave,
                        failure: this._failedActivitySave
                    });
                } else {
                    this._activitySaved = true;
                    this._userActivitiesSaved = true;
                    this._resourcesSaved = true;
                    this._resourcesRemoved = true;
                    this._attachmentsSaved = true;
                    this._hideIfComplete();
                }
            }
        },
        _successfulActivitySave: function (activity) {
            //create user_activity and resourceschedule items...
            if (this._activityData.LeaderChanged) {
                activity.LeaderChanged = true;
            }
            this._activityData = activity;
            var isNew = false;
            var svc = Sage.Services.getService('ClientEntityContext');
            svc.clearTemporaryContext();
            if (this.activityId === '') {
                dojo.publish('/entity/activity/create', [this._activityData, this]);
                isNew = true;
            }
            this.activityId = activity['$key'];  //Set this so that new UserActivities and ResourceSchedules can reference the parent...
            var hasMembers = false, hasResources = false;
            var ldr = activity.Leader['$key'];
            for (var i = 0; i < this._newAttendeesData.length; i++) {
                hasMembers = (hasMembers || (this._newAttendeesData[i]['Type'] === 'User' && this._newAttendeesData[i]['$key'] !== ldr));
                hasResources = (hasResources || this._newAttendeesData[i]['Type'] === 'Resource');
            }
            if (hasMembers) {
                var uareq = new Sage.SData.Client.SDataTemplateResourceRequest(sDataServiceRegistry.getSDataService('system'));
                uareq.setResourceKind('userActivities');
                uareq.read({
                    success: this._onGetUserActivityTemplate,
                    failure: this._failedUserActivitySave,
                    scope: this
                });
            } else {
                this._userActivitiesSaved = true;
            }
            if (hasResources) {
                var resreq = new Sage.SData.Client.SDataTemplateResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'));
                resreq.setResourceKind('resourceSchedules');
                resreq.read({
                    success: this._onGetResourceScheduleTemplate,
                    failure: this._failedUserActivitySave,
                    scope: this
                });
            } else {
                this._resourcesSaved = true;
            }
            this._attachmentsSaved = true;
            if (this._attachmentList) {
                var attachments = this._attachmentList.getNewAttachments();
                if (attachments.length > 0 && this.mode === 'New') {
                    this._saveAttachments(attachments);
                    this._attachmentsSaved = false;
                }
            }
            if (this._attendeesForRemoval.length > 0) {
                this._removeResources();
            } else {
                this._resourcesRemoved = true;
            }
            if (!this._completeAfterSaving && !isNew) {
                //we're just switching to complete mode, no need for other things to update UI yet...
                //console.log('finished saving;... mode: ' + this.mode);
                dojo.publish('/entity/activity/change', [activity, this]);
            }
            this._activitySaved = true;
            this._hideIfComplete();
        },
        _saveAttachments: function (attachments) {
            this._attachmentRequests = attachments.length;
            for (var i = 0; i < attachments.length; i++) {
                var att = attachments[i];
                var req = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('system'));
                req.setResourceKind('attachments');
                req.setResourceSelector('\'' + att.$key + '\'');
                att.activityId = this.activityId;
                for (var p in this._activityData) {
                    if (p.substring(p.length - 2) === 'Id' && p !== 'UserId') {
                        var attProp = p.substring(0, 1).toLowerCase() + p.substring(1);
                        att[attProp] = this._activityData[p];
                    }
                }
                req.update(att, {
                    ignoreETag: true,
                    success: this._successfulAttachmentSave,
                    failure: this._failedAttachmentSave,
                    scope: this
                });

            }
        },
        _removeAttachments: function () {
            if (!this._attachmentList) {
                return;
            }
            var attachments = this._attachmentList.getNewAttachments();
            for (var i = 0; i < attachments.length; i++) {
                var att = attachments[i];
                var req = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('system'));
                req.setResourceKind('attachments');
                req.setResourceSelector('\'' + att.$key + '\'');
                req['delete'](att, {
                    success: function () { },
                    failure: function () { },
                    scope: this
                });
            }
        },
        getRelationshipsForAttachments: function () {
            var obj = {};
            for (var p in this._activityData) {
                if (p.substring(p.length - 2) === 'Id' && p !== 'UserId') {
                    var attProp = p.substring(0, 1).toLowerCase() + p.substring(1);
                    obj[attProp] = this._activityData[p];
                }
            }
            if (this.mode === 'New' && !fileUtility.supportsHTML5File && !Sage.gears) {
                this._tempIdForAttachments = this._makeTempID();
                obj['activityId'] = this._tempIdForAttachments;
            }
            return obj;
        },
        doCarryOverAttachments: function (histId) {
            this._ensureAttachmentList();
            attachmentUtility.getAttachmentTemplate(function (template) {
                this._getHistoryAttachments(histId, template);
            }, this);
        },
        _getHistoryAttachments: function (histId, template) {
            var histReq = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('system'));
            histReq.setResourceKind('attachments');
            histReq.setQueryArg('where', 'historyId eq \'' + histId + '\'');
            histReq.read({
                success: function (data) {
                    var items = data['$resources'];
                    var mixin = {
                        activityId: this._makeTempID(),
                        historyId: null
                    };
                    var req = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('system'));
                    req.setResourceKind('attachments');
                    if (items && items.length) {
                        var l = items.length;
                        for (var i = 0; i < l; i++) {
                            var oldAttach = dojoLang.mixin(items[i], mixin);
                            var newAttach = dojoLang.mixin(template, oldAttach);
                            delete newAttach.createDate;
                            delete newAttach.modifyDate;
                            delete newAttach.createUser;
                            delete newAttach.modifyUser;
                            delete newAttach.$key;
                            delete newAttach.$etag;
                            //set the fileName property to the physicalFileName value so that it
                            // doesn't add this new record's ID to the beginning of the physicalFileName.
                            // It can't find it when that happens.
                            newAttach.fileName = newAttach.physicalFileName;
                            newAttach.attachDate = utility.Convert.toIsoStringFromDate(new Date());

                            req.create(newAttach, {
                                success: function (savedAttachment) {
                                    dojo.publish('/entity/attachment/create', [savedAttachment]);
                                },
                                failure: function () {
                                    console.log('failed to carry over attachment');
                                },
                                scope: this
                            });
                        }
                    }
                },
                failure: function () { },
                scope: this
            });
        },
        _makeTempID: function () {
            if (!this._tempIdForAttachments) {
                var uid = this._currentUserId;
                var dstr = utility.Convert.toIsoStringFromDate(this.dtp_startDate.get('value'));
                dstr = dstr.replace(/[T:-]/g, '').substr(6, 6);
                this._tempIdForAttachments = 'NE' + uid.substr(uid.length - 4, 4) + dstr;
            }
            return this._tempIdForAttachments;
        },
        _attachmentRequests: 0,
        _successfulAttachmentSave: function (attachment) {
            this._attachmentRequests--;
            if (this._attachmentRequests < 1) {
                this._attachmentsSaved = true;
                this._hideIfComplete();
            }
        },
        _failedAttachmentSave: function () {
            this._attachmentRequests--;
            if (this._attachmentRequests < 1) {
                this._attachmentsSaved = true;
                this._hideIfComplete();
            }
        },
        _successfulCurrentUserActivitySave: function (userActivity) {
            this._currentUserActivitySaved = true;
            dojo.publish('/entity/userActivity/change', [userActivity, this]);
            this._hideIfComplete();
        },
        _successfulActivityDelete: function () {
            var svc = Sage.Services.getService('ClientEntityContext');
            svc.clearTemporaryContext();
            dojo.publish('/entity/activity/delete', [this._activityData['$key'], this]);
            if (this._activityData['Timeless']) {
                dojo.publish('/entity/activity/timeless/delete', [this._activityData['$key'], this]);
            }
            this.hide();
        },
        _successfulComplete: function (request) {
            this._isProcessing = false;
            var svc = Sage.Services.getService('ClientEntityContext');
            svc.clearTemporaryContext();
            var hist = request;
            if (this.mode === 'Complete') {
                if (request.Response) {
                    hist = request.Response;
                }
                dojo.publish('/entity/activity/delete', [this._activityData['$key'], this]);
                if (this._activityData['Timeless']) {
                    dojo.publish('/entity/activity/timeless/delete', [this._activityData['$key'], this]);
                }
            }
            dojo.publish('/entity/history/create', [hist, this]);
            var followUp = this.sel_Followup.get('value');
            switch (followUp) {
                case this.noneText:
                    this.hide();
                    return;
                case activityUtility.getActivityTypeName('atPhoneCall'):
                    //doing the circles because of localization...
                    followUp = 'atPhoneCall';
                    break;
                case activityUtility.getActivityTypeName('atAppointment'):
                    followUp = 'atAppointment';
                    break;
                case activityUtility.getActivityTypeName('atToDo'):
                    followUp = 'atToDo';
                    break;
            }
            var histId = null;
            if (this.mode === 'Complete') {
                if (request.Response) {
                    histId = request.Response.HistoryId;
                }
            }
            else {
                histId = hist.$key;
            }
            if (typeof histId === 'undefined' || histId === null) {
                this.hide();
                sageDialogs.showError(this.scheduleFollowUpErrorText);
                return;
            }
            var actMixin = this._getFollowUpActivityData(histId);
            this.hide();
            window.setTimeout(function () {
                var actsvc = Sage.Services.getService('ActivityService');
                if (actsvc) {
                    actsvc.scheduleActivity({ 'type': followUp, 'preConfigured': actMixin });
                }
            }, 250);
        },
        _getFollowUpActivityData: function (historyId) {
            var a = this._activityData;
            var ret = {
                AccountId: a.AccountId,
                AccountName: a.AccountName,
                ContactId: a.ContactId,
                ContactName: a.ContactName,
                Description: a.Description,
                LeadId: a.LeadId,
                LeadName: a.LeadName,
                OpportunityId: a.OpportunityId,
                OpportunityName: a.OpportunityName,
                TicketId: a.TicketId,
                TicketNumber: a.TicketNumber

            };
            if (this.ck_coNotes.get('checked')) {
                ret['LongNotes'] = a.LongNotes;
                ret['Notes'] = a.Notes;
            }
            if (this.ck_coAttachments.get('checked')) {
                ret['carryOverAttachmentsFrom'] = historyId;
            }
            return ret;
        },
        _failedActivitySave: function (request) {
            var msg = activityUtility.findFailedRequestMessage(request, this.couldNotSaveErrorText);

            console.log('an error occured saving activity %o', request);
            sageDialogs.showError(msg);
            this._completeAfterSaving = false;
        },
        _failedActivityDelete: function (request) {
            var msg = activityUtility.findFailedRequestMessage(request, this.couldNotDeleteErrorText);

            console.log('an error occured deleting %o', request);
            sageDialogs.showError(msg);
            this._completeAfterSaving = false;
        },
        _failedUserActivitySave: function (request) {
            var msg = activityUtility.findFailedRequestMessage(request, this.couldNotSaveErrorText);
            console.log('an error occured saving user activity %o', request);
            sageDialogs.showError(msg);
        },
        _failedResourceSave: function (request) {
            console.warn('an error occured saving resources %o', request);
            var msg = activityUtility.findFailedRequestMessage(request, this.couldNotSaveErrorText);
            sageDialogs.showError(msg);
        },
        _failedComplete: function (request) {
            var msg = activityUtility.findFailedRequestMessage(request, this.couldNotCompleteErrorText);
            console.log('an error occured completing activity %o', request);
            sageDialogs.showError(msg);
            this._isProcessing = false;
        },
        _onGetUserActivityTemplate: function (userActivity) {
            this._userActivitiesRequestCount = 0;
            var ldr = this.lup_Leader.get('selectedObject');
            ldr = ldr['$key'].substr(0, 12);
            var act = this._activityData;
            var alarmtime = utility.Convert.toDateFromString(act.AlarmTime);
            for (var i = 0; i < this._newAttendeesData.length; i++) {
                var nat = this._newAttendeesData[i];
                //don't post a useractivity for the leader...
                if (nat['Type'] === 'User' && nat['$key'] !== ldr) {
                    var newua = dojo.mixin({}, userActivity);
                    var setVals = {
                        User: { '$key': nat['$key'] },
                        ActivityId: this.activityId,
                        Activity: { '$key': this.activityId },
                        Alarm: act.Alarm,
                        AlarmTime: utility.Convert.toIsoStringFromDate(alarmtime),
                        Status: 'asUnconfirmed'
                    };
                    newua = dojoLang.mixin(newua, setVals);
                    var req = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('system'));
                    req.setResourceKind('userActivities');
                    this._userActivitiesRequestCount++;
                    req.create(newua, {
                        success: function (savedUserActivity) {
                            this._userActivitiesRequestCount--;
                            dojo.publish('/entity/userActivity/create', [savedUserActivity, this]);
                            if (this._userActivitiesRequestCount < 1) {
                                this._userActivitiesSaved = true;
                                this._hideIfComplete();
                            }
                        },
                        failure: this._failedUserActivitySave,
                        scope: this
                    });
                }
            }
            if (this._userActivitiesRequestCount < 1) {
                this._userActivitiesSaved = true;
                if (act.Timeless) {
                    dojo.publish('/entity/userActivities/timeless/saved', [act, this]);
                }
                this._hideIfComplete();
            }
        },
        _onGetResourceScheduleTemplate: function (resourceSched) {
            this._resourceRequestCount = 0;
            for (var i = 0; i < this._newAttendeesData.length; i++) {
                var nat = this._newAttendeesData[i];
                if (nat['Type'] === 'Resource') {
                    var newRe = dojoLang.mixin({}, resourceSched);
                    var act = this._activityData;
                    var sd = Sage.Utility.Convert.toDateFromString(act['StartDate']);
                    var ed = dojoDate.add(sd, 'minute', act['Duration']);
                    var setVals = {
                        ResourceId: nat['$key'],
                        ActivityId: this.activityId,
                        Description: nat['Name'],
                        StartDate: act['StartDate'],
                        EndDate: Sage.Utility.Convert.toIsoStringFromDate(ed),
                        UserId: act.Leader['$key']
                    };
                    newRe = dojoLang.mixin(newRe, setVals);
                    var req = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'));
                    req.setResourceKind('resourceSchedules');
                    this._resourceRequestCount++;
                    req.create(newRe, {
                        success: function (resourceSchedule) {
                            this._resourceRequestCount--;
                            if (this._resourceRequestCount < 1) {
                                this._resourcesSaved = true;
                                this._hideIfComplete();
                            }
                        },
                        failure: this._failedResourceSave,
                        scope: this
                    });
                }
            }
        },
        _removeResources: function () {
            this._resourceDeleteRequestCount = 0;
            for (var i = 0; i < this._attendeesForRemoval.length; i++) {
                var rem = this._attendeesForRemoval[i];
                var request;
                var predicate;
                var publishEvt;
                if (rem['type'] === 'user') {
                    request = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('system'));
                    request.setResourceKind('userActivities');
                    predicate = dString.substitute("'ActivityId=${0};UserId=${1}'", [this.activityId, rem['id']]);
                    publishEvt = '/entity/userActivity/delete';
                } else {
                    request = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Data.SDataServiceRegistry.getSDataService('dynamic'));
                    request.setResourceKind('resourceSchedules');
                    predicate = '\'' + rem['rsid'] + '\'';
                    publishEvt = '/entity/resourceSchedule/delete';
                }
                request.setResourceSelector(predicate);
                this._resourceDeleteRequestCount++;
                // create this scope object to maintain the correct event and ID to publish
                var scopeObj = {
                    notify: function () {
                        dojo.publish(this.evt, [this.predicate]);
                        this.editor._resourceDeleteRequestCount--;
                        if (this.editor._resourceDeleteRequestCount < 1) {
                            this.editor._resourcesRemoved = true;
                            this.editor._hideIfComplete();
                        }
                    },
                    evt: publishEvt,
                    predicate: predicate,
                    editor: this
                };

                var options = {
                    success: scopeObj.notify,
                    aborted: function () { },
                    failure: this._failedResourceSave,
                    scope: scopeObj
                };
                request['delete']({ '$key': predicate }, options);
            }
        },
        _cancelClick: function () {
            if (this.mode === 'New') {
                this._removeAttachments();
            }
            this.hide();
        },
        _hideIfComplete: function () {
            if (this._activitySaved && this._userActivitiesSaved && this._currentUserActivitySaved
                    && this._resourcesSaved && this._resourcesRemoved && this._attachmentsSaved) {
                var actId = this.activityId;
                if (this._completeAfterSaving) {
                    this._completeAfterSaving = false;
                    var svc = Sage.Services.getService('ActivityService');
                    if (svc) {
                        svc.completeActivity(actId);
                    }
                } else {
                    this.hide();
                }
            }
        },
        _acceptConfClick: function () {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.acceptConfirmation({
                notification: this._notificationData,
                success: this._successfulAcceptConfirmation,
                failure: this._failedAcceptDecline,
                scope: this
            });

        },
        _declineClick: function () {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.declineConfirmation({
                notification: this._notificationData,
                success: this._successfulDeclineConfirmation,
                failure: this._failedAcceptDecline,
                scope: this
            });
        },
        _deleteConfClick: function () {
            if (this._notificationData && this._notificationStore) {
                this._notificationStore.deleteEntity(this._notificationData, this._successfulNotificationDelete, this._failedActivityDelete, this);
            }
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
        _successfulAcceptConfirmation: function () {
            dojo.publish('/entity/activity/confirm', [this._getActivityDataFromNotificationData(), null]);
            this._successfulNotificationDelete();
        },
        _successfulDeclineConfirmation: function () {
            dojo.publish('/entity/activity/decline', [this._getActivityDataFromNotificationData(), null]);
            this._successfulNotificationDelete();
        },
        _successfulNotificationDelete: function () {
            dojo.publish('/entity/userNotification/delete', [this._notificationData['$key'], this]);
            this.hide();
        },

        // ... endregion

        //region lookup configs
        _ensureLookupsCreated: function () {
            if (!this.lup_Account) {
                this.createAccountLookup();
                this.createContactLookup();
                this.createOpportunityLookup();
                this.createTicketLookup();
                this.createLeadLookup();
                this.createLeaderlookup();
                this.createResourcesLookup();
            }
        },
        createAccountLookup: function () {
            this.accountLookupConfig = {
                id: '_activityAcc',
                structure: [
                    {
                        "cells": [
                            {
                                "name": this.accountText,
                                "field": "AccountName"
                            },
                            {
                                "name": this.cityText,
                                "field": "Address.City"
                            },
                            {
                                "name": this.stateText,
                                "field": "Address.State"
                            },
                            {
                                "name": this.mainPhoneText,
                                "field": "MainPhone"
                            },
                            {
                                "name": this.typeText,
                                "field": "Type"
                            },
                            {
                                "name": this.subTypeText,
                                "field": "SubType"
                            },
                            {
                                "name": this.statusText,
                                "field": "Status"
                            },
                            {
                                "name": this.acctMgrText,
                                "field": "AccountManager.UserInfo.UserName"
                            },
                            {
                                "name": this.ownerText,
                                "field": "Owner.OwnerDescription"
                            }
                        ],
                        "defaultCell": {
                            "sortable": true,
                            "width": "150px",
                            "editable": false,
                            "propertyType": "System.String",
                            "excludeFromFilters": false,
                            "useAsResult": false,
                            "pickListName": null,
                            "defaultValue": ""
                        }
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'accounts',
                    sort: [{ attribute: 'AccountName'}]
                },
                isModal: true,
                seedProperty: '',
                seedValue: '',
                overrideSeedValueOnSearch: false,
                initializeLookup: false,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupActText,
                dialogButtonText: this.okText
            },
            this.lup_Account = new Lookup({
                id: 'lu_account',
                allowClearingResult: true,
                showEntityInfoToolTip: true,
                readonly: true,
                config: this.accountLookupConfig
            });
            this.eventConnections.push(dojo.connect(this.lup_Account, 'onChange', this, '_accountChanged'));
            dojo.place(this.lup_Account.domNode, this.container_AccountLup.domNode, 'only');
        },
        createContactLookup: function () {
            this.contactLookupConfig = {
                id: '_activityContact',
                structure: [
                    { defaultCell: {
                        "sortable": true,
                        "width": "150px",
                        "editable": false,
                        "propertyType": "System.String",
                        "excludeFromFilters": false,
                        "useAsResult": false,
                        "pickListName": null,
                        "defaultValue": ""
                    },
                        cells: [
                        {
                            name: this.nameText,
                            field: 'NameLF'
                        }, {
                            name: this.accountText,
                            field: 'Account.AccountName'
                        }, {
                            name: this.cityText,
                            field: 'Address.City'
                        }, {
                            name: this.stateText,
                            field: 'Address.State'
                        }, {
                            name: this.workphoneText,
                            field: 'WorkPhone'
                        }, {
                            name: this.emailText,
                            field: 'Email'
                        }
                    ]
                    }],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'contacts',
                    sort: [{ attribute: 'NameLF'}]
                },
                isModal: true,
                seedProperty: 'Account.Id',
                seedValue: '',
                overrideSeedValueOnSearch: true,
                initialLookup: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupContactText,
                dialogButtonText: this.okText
            };
            this.lup_Contact = new Lookup({
                id: 'lu_contact',
                allowClearingResult: true,
                config: this.contactLookupConfig,
                readonly: true,
                showEntityInfoToolTip: true
            });
            this.eventConnections.push(dojo.connect(this.lup_Contact, 'onChange', this, '_contactChanged'));
            dojo.place(this.lup_Contact.domNode, this.container_ContactLup.domNode, 'only');
        },
        createOpportunityLookup: function () {
            this.opportunityLookupConfig = {
                id: '_activityOpp',
                structure: [
                    {
                        defaultCell: {
                            "sortable": true,
                            "width": "150px",
                            "editable": false,
                            "propertyType": "System.String",
                            "excludeFromFilters": false,
                            "useAsResult": false,
                            "pickListName": null,
                            "defaultValue": ""
                        },
                        cells: [
                            {
                                name: this.descriptionText,
                                field: 'Description'
                            }, {
                                name: this.acctMgrText,
                                field: 'AccountManager.UserInfo.UserName'
                            }, {
                                name: this.accountText,
                                field: 'Account.AccountName'
                            }, {
                                name: this.stageText,
                                field: 'Stage'
                            }, {
                                name: this.statusText,
                                field: 'Status'
                            }, {
                                name: this.ownerText,
                                field: 'Owner.OwnerDescription'
                            }
                        ]
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'opportunities',
                    sort: [{ attribute: 'Description'}]
                },
                isModal: true,
                seedProperty: 'Account.Id',
                seedValue: '',
                overrideSeedValueOnSearch: true,
                initialLookup: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupOpportunityText,
                dialogButtonText: this.okText
            };
            this.lup_Opportunity = new Lookup({
                id: 'lu_opportunity',
                allowClearingResult: true,
                config: this.opportunityLookupConfig,
                readonly: true,
                showEntityInfoToolTip: true
            });
            this.eventConnections.push(dojo.connect(this.lup_Opportunity, 'onChange', this, '_opportunityChanged'));
            dojo.place(this.lup_Opportunity.domNode, this.container_OppLup.domNode, 'only');
        },
        createTicketLookup: function () {
            this.ticketLookupConfig = {
                id: '_activityTicket',
                structure: [
                    {
                        defaultCell: {
                            "sortable": true,
                            "width": "150px",
                            "editable": false,
                            "propertyType": "System.String",
                            "excludeFromFilters": false,
                            "useAsResult": false,
                            "pickListName": null,
                            "defaultValue": ""
                        },
                        cells: [
                            {
                                name: this.ticketNumberText,
                                field: 'TicketNumber'
                            }, {
                                name: this.accountText,
                                field: 'Account.AccountName'
                            }, {
                                name: this.nameText,
                                field: 'Contact.NameLF'
                            }, {
                                name: this.phoneText,
                                field: 'Contact.WorkPhone'//,
                                //'styles': 'text-align: right;'
                            }, {
                                name: this.statusText,
                                field: 'StatusCode',
                                pickListName: 'Ticket Status',
                                propertyType: 'SalesLogix.PickList',
                                type: Sage.UI.Columns.PickList
                            }, {
                                name: this.urgencyText,
                                field: 'Urgency.Description'
                            }, {
                                name: this.areaText,
                                field: 'Area'
                            }
                        ]
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'tickets',
                    sort: [{ attribute: 'TicketNumber'}]
                },
                isModal: true,
                seedProperty: 'Account.Id',
                seedValue: '',
                overrideSeedValueOnSearch: true,
                initialLookup: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupTicketText,
                dialogButtonText: this.okText
            };
            this.lup_Ticket = new Lookup({
                id: 'lu_ticket',
                allowClearingResult: true,
                config: this.ticketLookupConfig,
                readonly: true,
                showEntityInfoToolTip: true
            });
            this.eventConnections.push(dojo.connect(this.lup_Ticket, 'onChange', this, '_ticketChanged'));
            dojo.place(this.lup_Ticket.domNode, this.container_TicketLup.domNode, 'only');
        },
        createLeadLookup: function () {
            this.leadLookupConfig = {
                id: '_activityLead',
                structure: [
                    {
                        defaultCell: {
                            "sortable": true,
                            "width": "150px",
                            "editable": false,
                            "propertyType": "System.String",
                            "excludeFromFilters": false,
                            "useAsResult": false,
                            "pickListName": null,
                            "defaultValue": ""
                        },
                        cells: [
                            {
                                name: this.leadFullNameText,
                                field: 'LeadFullName'
                            }, {
                                name: this.companyText,
                                field: 'Company'
                            }, {
                                name: this.cityText,
                                field: 'Address.City'
                            }, {
                                name: this.stateText,
                                field: 'Address.State'
                            }, {
                                name: this.postalText,
                                field: 'Address.PostalCode'
                            }, {
                                name: this.statusText,
                                field: 'Status'
                            }, {
                                name: this.workphoneText,
                                field: 'WorkPhone'//,
                                //'styles': 'text-align: right;'
                            }, {
                                name: this.ownerText,
                                field: 'Owner.OwnerDescription'
                            }
                        ]
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'leads',
                    sort: [{ attribute: 'LeadFullName'}]
                },
                isModal: true,
                initialLookup: false,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupLeadText,
                dialogButtonText: this.okText
            };
            this.lup_Lead = new Lookup({
                id: 'lu_lead',
                allowClearingResult: true,
                config: this.leadLookupConfig,
                readonly: true,
                showEntityInfoToolTip: true
            });
            this.eventConnections.push(dojo.connect(this.lup_Lead, 'onChange', this, '_leadChanged'));
            dojo.place(this.lup_Lead.domNode, this.container_LeadLup.domNode, 'only');
        },
        createLeaderlookup: function () {
            var leaderLookupConfig = {
                id: '_activityLeader',
                structure: [
                    {
                        cells:
                            [
                                {
                                    name: this.nameText,
                                    field: 'Name',
                                    sortable: true,
                                    width: "400px",
                                    editable: false,
                                    propertyType: "System.String",
                                    excludeFromFilters: false,
                                    defaultValue: ""
                                }
                            ]
                    }
                ],
                gridOptions: {
                    contextualCondition: function () {
                        return 'AllowAdd AND (AccessId eq \'' + utility.getClientContextByKey('userID') + '\' OR AccessId eq \'EVERYONE\') AND Type eq \'User\'';
                    },
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: {
                    resourceKind: 'activityresourceviews',
                    sort: [{ attribute: 'Name'}]
                },
                isModal: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupLeaderText,
                dialogButtonText: this.okText
            };
            this.lup_Leader = new Lookup({
                id: 'lu_leader',
                readonly: true,
                config: leaderLookupConfig
            });
            this.eventConnections.push(dojo.connect(this.lup_Leader, 'onChange', this, '_leaderChanged'));
            dojo.place(this.lup_Leader.domNode, this.container_LeaderLup.domNode, 'only');
        },
        createResourcesLookup: function () {
            this.resourcesLookupConfig = {
                id: '_activityResources',
                btnToolTip: this.lookupResourcesText,
                structure: [
                    {
                        defaultCell: {
                            "sortable": true,
                            "width": "150px",
                            "editable": false,
                            "propertyType": "System.String",
                            "excludeFromFilters": false,
                            "useAsResult": false,
                            "pickListName": null,
                            "defaultValue": ""
                        },
                        cells:
                        [
                            {
                                name: this.nameText,
                                field: 'Name'
                            }, {
                                name: this.typeText,
                                field: 'Type',
                                width: '100px'
                            }, {
                                name: this.locationText,
                                field: 'IsLocation',
                                propertyType: 'System.Boolean',
                                format: function (inRowIndex, inItem) {
                                    //console.log('a: ' + a + 'b: ' + b + 'c: ' + c);
                                    var type = utility.getValue(inItem, 'Type');
                                    if (!type) {
                                        return this.defaultValue;
                                    }
                                    if (type === 'User') {
                                        return '';
                                    }
                                    return (inItem['IsLocation'] === null || inItem['IsLocation'] === 'false') ? this.noText : this.yesText;
                                }
                            }, {
                                name: this.descriptionText,
                                field: 'Subtype',
                                width: '200px'
                            }
                        ]
                    }
                ],
                gridOptions: {
                },
                displayMode: 5,
                storeOptions: {
                    resourceKind: 'activityresourceviews',
                    select: ['AccessId', 'ResourceId', 'AllowAdd', 'AllowEdit', 'AllowDelete'],
                    sort: [{ attribute: 'Type' }, { attribute: 'Name'}]
                },
                isModal: true,
                initialLookup: false,
                preFilters: [],
                query: {
                    conditions: 'AllowAdd AND (AccessId eq \'' + this._currentUserId + '\' OR AccessId eq \'EVERYONE\')'
                },
                dialogTitle: this.lookupResourcesText,
                dialogButtonText: this.addResourceText,
                doSelected: function (items) {
                    var actEditor = dijit.byId('activityEditor');
                    if (actEditor) {
                        actEditor.addMembers(items);
                    }
                    this.lookupDialog.hide();
                }
            };
            this.lup_Resources = new Sage.UI.SDataLookup(this.resourcesLookupConfig);
            dojo.place(this.lup_Resources.domNode, this.container_ResourcesLup.domNode, 'only');
        },

        //end region lookup configs

        //Availability Tab functionality...
        _schedulerInitialized: false,
        _resetAttendeesList: function () {

            if (!this._schedulerInitialized) {
                // to override scheduler's create activity functionality:
                scheduler.showLightbox = function () { return false; };

                //for re-rendering the timeline when the left or right arrow clicked
                scheduler.config.timelineStep = 30; // get it from user option??
                scheduler.config.timelineStart = (this._options.calendar.dayStartTime * 2);
                scheduler.config.timelineSize = ((this._options.calendar.dayEndTime - this._options.calendar.dayStartTime) * 2);

                scheduler.createTimelineView({
                    name: "timeline",
                    x_unit: "minute",
                    x_date: "%g:%i",
                    x_step: scheduler.config.timelineStep,
                    x_start: scheduler.config.timelineStart,
                    x_size: scheduler.config.timelineSize,
                    //x_length:  96,  //show the whole day
                    y_unit: [],
                    y_property: "section_id",
                    render: "bar",
                    section_autoheight: false,
                    dy: 30  //min-height
                });
                scheduler.init('scheduler_here', new Date(), 'timeline');
                //don't allow dragging of activities...
                scheduler.attachEvent('onBeforeDrag', function () { return false; });
                //don't allow double clicking to create activity
                scheduler.config.dblclick_create = false;

                /*Added to highlight the current event timeline columns
                var act = this._activityData;
                var sd = Sage.Utility.Convert.toDateFromString(act['StartDate']);
                var ed = dojoDate.add(sd, 'minute', act['Duration']);

                //Used in dhtmlxscheduler_timeline.js to highlight the current events timeline columns
                scheduler.config.currentEventStartTime = sd;
                scheduler.config.currentEventEndTime = ed;*/

                var self = this;

                //To support rerender timeline view with different times on click of buttons
                dojo.query(".dhx_cal_prev_timeline_button").connect("onclick", function () {
                    if (!scheduler.config.timelineStart == 0) {
                        self.reRenderTimeline('left');
                    }
                });
                dojo.query(".dhx_cal_next_timeline_button").connect("onclick", function () {
                    if (scheduler.config.timelineStart + scheduler.config.timelineSize < 48) {
                        self.reRenderTimeline('right');
                    }
                });
                this._schedulerInitialized = true;
            }
            scheduler.clearAll();
        },

        _loadAttendeesData: function () {
            this._availabilityShowing = true;
            if (this.mode === 'New') {
                //create a mock attendee for the leader so it can be loaded into the list...
                var ldr = this.lup_Leader.get('selectedObject');
                var leaderName = ldr['$descriptor'],
                    leaderId = ldr['$key'].substr(0, 12);
                this.addMembers([{
                    $descriptor: leaderName,
                    $key: leaderId,
                    IsLocation: false,
                    Name: leaderName,
                    Subtype: '',
                    Type: 'User'
                }]);
                return;
            }
            var actid = this.activityId;
            if (!actid && this._activityData) {
                actid = this._activityData.$key;
            }
            if (!actid) {
                console.warn('could not find activityid for query to get attendee data');
                return;
            }
            realActivityId = actid.substr(0, 12);

            var req = new Sage.SData.Client.SDataNamedQueryRequest(Sage.Data.SDataServiceRegistry.getSDataService('mashups'))
                .setApplicationName('$app')
                .setResourceKind('mashups')
                .setQueryName('execute')
                .setQueryArg('_resultName', 'GetMembers')
                .setQueryArg('_activityId', realActivityId);
            req.uri.setCollectionPredicate("'ActivityFreeBusy'");
            req.read({
                success: dojo.hitch(this, this._onReceiveAttendees),
                failure: dojo.hitch(this, this._availabilityFailed)
            });
        },
        _attendeesTemplate: new Simplate([
            '<table class="attendee-item">',
                '<tr>',
                    '<td class="attendee-name">{%= $.name %}</td>',
                    '{% if (($.isNotLeader) && ($.allowDelete)) { %}',
                        '<td class="remove-attendee" id="{%= $.id %}"><img src="images/icons/Delete_16x16.png" alt="{%= $.removeText %}" title="{%= $.removeText %}" onclick="{%= $.deleteCode %}" /></td>',
                    '{% } %}',
                    '<td class="attendee-status"><img src="{%= $.img %}" alt="{%= $.imgToolTipText %}" title="{%= $.imgToolTipText %}"/></td>',
                '</tr>',
            '</table>'
        ]),
        _onReceiveAttendees: function (data) {
            this._attendeesData = data['$resources'];
            //if the leader has changed since the dialog opened, the old leader will need to be removed from this list...
            if (this._originalLeaderId && this._originalLeaderId !== this._activityData.Leader['$key']) {
                var len = this._attendeesData.length;
                for (var i = 0; i < len; i++) {
                    if (this._attendeesData[i]['id'] === this._originalLeaderId) {
                        this._attendeesData.splice(i, 1);
                        break;
                    }
                }
            }
            this._rebuildTimeLine();
            this._requestAvailability();
        },
        _rebuildTimeLine: function (scrollDirection) {
            var i;
            for (i = 0; i < this._deleteAttendeeConnects.length; i++) {
                dojo.disconnect(this._deleteAttendeeConnects[i]);
            }
            this._deleteAttendeeConnects = [];
            var y_units = [];
            var leaderYUnit = {};
            var memberUnits = [];
            var resourceUnits = [];
            var leaderId = this._activityData.Leader['$key'].trim();
            var deleteCode = "Sage.Utility.Activity.removeMember('${0}','${1}');";
            for (i = 0; i < this._attendeesData.length; i++) {
                var img = this._blankGif;
                var imgToolTipText = "";
                var status = this._attendeesData[i]['status'] || 0;
                if (status === 1 || status === 'asAccepted') {
                    img = 'images/icons/Accept.png';
                    imgToolTipText = this.acceptedText;
                } else if (status === 2 || status === 'asDeclned') {
                    img = 'images/icons/Decline.png';
                    imgToolTipText = this.declinedText;
                }
                var yUnit = {
                    key: this._attendeesData[i]['id'],
                    label: this._attendeesTemplate.apply({
                        name: this._attendeesData[i]['name'],
                        img: img,
                        imgToolTipText: imgToolTipText,
                        id: this._attendeesData[i]['id'],
                        isNotLeader: this._attendeesData[i]['id'].trim() !== leaderId,
                        allowDelete: this._canEdit(),
                        removeText: this.removeText,
                        deleteCode: dojo.string.substitute(deleteCode, [this.id, this._attendeesData[i]['id']])
                    })
                };
                if (this._attendeesData[i]['id'].trim() === leaderId) {
                    leaderYUnit = yUnit;
                } else if (this._attendeesData[i]['type'] === 'user') {
                    memberUnits.push(yUnit);
                } else {
                    resourceUnits.push(yUnit);
                }
            }
            y_units = (leaderYUnit.key) ? [leaderYUnit].concat(memberUnits.concat(resourceUnits)) : memberUnits.concat(resourceUnits);
            for (i = 0; i < this._newAttendeesData.length; i++) {

                y_units.push({
                    key: this._newAttendeesData[i]['$key'],
                    label: this._attendeesTemplate.apply({
                        name: this._newAttendeesData[i]['Name'],
                        img: this._blankGif,
                        id: this._newAttendeesData[i]['$key'],
                        isNotLeader: this._newAttendeesData[i]['$key'].trim() !== leaderId,
                        allowDelete: this._canEdit(),
                        removeText: this.removeText,
                        deleteCode: dojo.string.substitute(deleteCode, [this.id, this._newAttendeesData[i]['$key']])
                    })
                });
            }

            if (scrollDirection == "left") {
                if ((scheduler.config.timelineStart - scheduler.config.timelineSize) > 0) {
                    scheduler.config.timelineStart = scheduler.config.timelineStart - scheduler.config.timelineSize;
                } else {
                    scheduler.config.timelineStart = 0;
                }
            } else if (scrollDirection == "right") {
                var st = (scheduler.config.timelineSize + scheduler.config.timelineStart);
                if (st > (48 - scheduler.config.timelineSize)) {
                    scheduler.config.timelineStart = 48 - scheduler.config.timelineSize;
                } else {
                    scheduler.config.timelineStart = st;
                }
            }
            var self = this;
            scheduler.createTimelineView({
                name: "timeline",
                x_unit: "minute",
                x_date: "%g:%i",
                x_step: scheduler.config.timelineStep,
                x_start: scheduler.config.timelineStart,
                x_size: scheduler.config.timelineSize,
                //x_length:  96,  //show the whole day
                y_unit: y_units,
                y_property: "section_id",
                render: "bar",
                section_autoheight: false,
                dy: 30  //min-height
            });

            scheduler.setCurrentView(this._getActivityStartDate(), 'timeline');

        },
        _updateLocation: function (newLocation, isAdd) {
            var location = this._activityData.Location;
            if (!location || location === '') {
                if (isAdd) {
                    location = newLocation;
                }
            } else {
                var parts = location.split('; ');
                var newParts = [];
                var exists = false;
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i] === newLocation) {
                        if (isAdd) {
                            exists = true;
                        } else {
                            continue;
                        }
                    }
                    newParts.push(parts[i]);
                }
                if (!exists && isAdd) {
                    newParts.push(newLocation);
                }
                location = newParts.join('; ');
            }
            Sage.Utility.setValue(this._activityData, 'Location', location);
            this.tb_Location.set('value', location);
        },
        _removeMember: function (args) {
            var i
            var id = args.memberId;
            var lst = [];
            for (i = 0; i < this._attendeesData.length; i++) {
                if (this._attendeesData[i]['id'] === id) {
                    if (this._attendeesData[i]['type'] === 'resource' && this._attendeesData[i]['IsLocation']) {
                        this._updateLocation(this._attendeesData[i]['name'], false); //sending false removes it from the location...
                    }
                    this._attendeesForRemoval.push(this._attendeesData[i]);
                } else {
                    lst.push(this._attendeesData[i]);
                }
            }
            this._attendeesData = lst;
            lst = [];
            for (i = 0; i < this._newAttendeesData.length; i++) {
                if (this._newAttendeesData[i]['$key'] === id) {
                    if (this._newAttendeesData[i]['Type'] === 'Resource' && this._newAttendeesData[i]['IsLocation'] === true) {
                        this._updateLocation(this._newAttendeesData[i]['Name'], false); //sending false removes it from the location...
                    }
                } else {
                    lst.push(this._newAttendeesData[i]);
                }
            }
            this._newAttendeesData = lst;
            this._rebuildTimeLine();
        },
        addMembers: function (items) {
            //this._requestAvailability();
            /* sample return obj...
            [{
            $descriptor: 'Lois Tomlin',  //and other sdata fields...
            $key: 'UDEMO...',
            IsLocation: false,
            Name: 'Lois Tomlin',
            Subtype: '....',
            Type: 'User'
            },{
            $descriptor: 'Room 10',
            $key: 'RDEMO...',
            IsLocation: true,
            Name: 'Room 10',
            Subtype: '....',
            Type: 'Resource'
            }]
            */
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item['$key'].length > 12) {
                    item['$key'] = item['$key'].substr(0, 12);
                }
                if (this._isMember(item)) {
                    continue;
                }
                if (item['ResourceId']) {
                    item['$key'] = item['ResourceId'];
                }
                if (item['Type'] === 'Resource' && item['IsLocation'] === true) {
                    this._updateLocation(item['Name'], true);
                }
                this._newAttendeesData.push(item);
            }
            if (this._availabilityShowing) {
                this._rebuildTimeLine();
                this._requestAvailability();
            }
        },
        _isMember: function (newMember) {
            var i, len = this._attendeesData.length;
            for (i = 0; i < len; i++) {
                if (this._attendeesData[i]['id'] === newMember['$key']) {
                    return true;
                }
            }
            len = this._newAttendeesData.length;
            for (i = 0; i < len; i++) {
                if (this._newAttendeesData[i]['$key'] === newMember['$key']) {
                    return true;
                }
            }
            return false;
        },
        _updateUsersListWithNewLeader: function (oldLeaderId, newLeader) {
            //remove the old one...
            var i, len = this._attendeesData.length;
            for (i = 0; i < len; i++) {
                if (this._attendeesData[i]['id'] === oldLeaderId) {
                    this._attendeesData.splice(i, 1);
                    break;
                }
            }
            len = this._newAttendeesData.length;
            for (i = 0; i < len; i++) {
                if (this._newAttendeesData[i]['$key'] === oldLeaderId) {
                    this._newAttendeesData.splice(i, 1);
                    break;
                }
            }
            //add the new one...
            this.addMembers([{
                $descriptor: newLeader['$descriptor'],
                $key: newLeader['$key'],
                IsLocation: false,
                Name: newLeader['$descriptor'],
                Subtype: '',
                Type: 'User'
            }]);
        },
        _requestAvailability: function () {
            if (this._attendeesData.length < 1 && this._newAttendeesData.length < 1) {
                return;
            }
            var quotedIds = [];
            for (var i = 0; i < this._attendeesData.length; i++) {
                quotedIds.push('\'' + this._attendeesData[i]['id'] + '\'');
            }
            for (i = 0; i < this._newAttendeesData.length; i++) {
                quotedIds.push('\'' + this._newAttendeesData[i]['$key'] + '\'');
            }
            if (this._availabilityDataDateRange.fromDate) {
                //do we already have the data for these users for this date range?
                var startDate = Sage.Utility.Convert.toDateFromString(this._activityData['StartDate']);
                if ((startDate > this._availabilityDataDateRange.fromDate)
                    && (startDate < this._availabilityDataDateRange.toDate)
                    && (quotedIds.join('') === this._availabilityDataDateRange.users.join(''))) {
                    return;
                }
            }
            this._requestAvailabilityFor(quotedIds);
        },
        _availabilityDataDateRange: {
            fromDate: false,
            toDate: false,
            users: []
        },
        _requestAvailabilityFor: function (quotedIds) {
            var startDate = Sage.Utility.Convert.toDateFromString(this._activityData['StartDate']);
            var fromDate = dojoDate.add(startDate, 'day', -7);
            var toDate = dojoDate.add(startDate, 'day', 7);

            this._availabilityDataDateRange.fromDate = fromDate;
            this._availabilityDataDateRange.toDate = toDate;
            this._availabilityDataDateRange.users = quotedIds;

            var actsvc = Sage.Services.getService('ActivityService');
            if (actsvc) {
                var options = {
                    quotedIds: quotedIds,
                    startDate: fromDate,
                    endDate: toDate,
                    expandRecurrences: true,
                    includeTimless: false,
                    timelessOnly: false
                };
                actsvc.getActivityFreeBusyFor(this, options, this._onReceiveAvailability, this._availabilityFailed);
            }

        },
        _onReceiveAvailability: function (data) {
            this._availabilityData = data['$resources'];
            this._applyAvailability();
        },
        _applyAvailability: function () {
            scheduler.clearAll();
            for (var i = 0; i < this._availabilityData.length; i++) {
                var item = this._availabilityData[i];
                if (item.type === 262162 && item.itemId !== this._currentUserId) {
                    item['description'] = activityUtility.getActivityTypeName('atPersonal');
                }
                var isCurrentEvent = (item["activityId"] == this.activityId) ? true : false;
                var stDate = Sage.Utility.Convert.toDateFromString(item['startDate']);
                var eDate = dojoDate.add(stDate, 'minute', item['duration']);
                scheduler.addEvent(stDate, eDate, item['description'], null, { section_id: item['itemId'], activity_Id: item['activityId'], current_event: isCurrentEvent });
            }
        },
        reRenderTimeline: function (direction) {
            this._rebuildTimeLine(direction);
            this._applyAvailability();
        },

        _availabilityFailed: function (req, msg) {
            console.warn('Availability request failed.');
        },

        //end Availability tab...

        //Recurring tab functionality...

        _recurringStartDateChanged: function (newStart) {
            var stDate = this.dtp_startDate.get('value');
            if (newStart.getMonth() === stDate.getMonth() &&
                newStart.getDate() === stDate.getDate() &&
                    newStart.getFullYear() === stDate.getFullYear()) {
                return;
            }
            if (this._activityData.StartDate) {
                var currentStartDateHrs = Sage.Utility.Convert.toDateFromString(this._activityData.StartDate).getHours();
                var currentStartDateMins = Sage.Utility.Convert.toDateFromString(this._activityData.StartDate).getMinutes();
                newStart.setHours(currentStartDateHrs);
                newStart.setMinutes(currentStartDateMins);
            }
            this._activityData.StartDate = (newStart.getFullYear) ? utility.Convert.toIsoStringFromDate(newStart) : newStart;
            this.dtp_startDate.set('value', newStart);
            this._startDateChanged();
        },
        _recurringPeriodChanged: function (newPeriod) {
            this._handleAutoRolloverState();
        },
        _isOccurence: function () {
            if (this.activityId.length > 12) {
                return true;
            }
            return false;
        },
        _canEdit: function () {
            if ((this.mode === 'Confirm') || (!this._activityData.AllowEdit) || this._isOccurence()) {
                return false;
            }
            return true;
        },
        _emptyActivity: {
            "$key": "",
            "AccountId": null,
            "AccountName": "",
            "ActivityBasedOn": null,
            //"ActivityId": "",
            "Alarm": false,
            "AlarmTime": utility.Convert.toIsoStringFromDate(new Date()),
            "Attachment": false,
            "Category": null,
            "ContactId": null,
            "ContactName": "",
            "CreateDate": "",
            "CreateUser": "",
            "Description": "",
            "Duration": 15,
            "ForeignId1": null,
            "ForeignId2": null,
            "ForeignId3": null,
            "ForeignId4": null,
            "LeadId": null,
            "LeadName": "",
            "LongNotes": null,
            "Notes": null,
            "OpportunityId": null,
            "OpportunityName": null,
            "OriginalDate": "",
            "PhoneNumber": "",
            "Priority": null,
            "ProcessId": null,
            "ProcessNode": null,
            "ProjectId": null,
            "RecurIterations": 0,
            "RecurPeriod": 0,
            "RecurPeriodSpec": 0,
            "Recurring": false,
            "RecurSkip": "",
            "Rollover": false,
            "StartDate": utility.Convert.toIsoStringFromDate(new Date()),
            "TicketId": null,
            "TicketNumber": null,
            "Timeless": false,
            "Type": "atAppointment",
            "UserDef1": null,
            "UserDef2": null,
            "UserDef3": null,
            //"UserId": "",
            "AttachmentCount": null,
            "Location": null,
            "EndDate": "",
            "Resources": {},
            "Leader": { "$key": "" },
            "UserActivities": {},
            "UserNotifications": {}
        }
    });
    return activityEditor;

});
