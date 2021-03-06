/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
        'dojo/i18n',
        'Sage/MainView/ActivityMgr/BaseListPanelConfig',
        'Sage/Utility/Activity',
        'Sage/UI/SummaryFormatterScope',
        'Sage/UI/SDataSummaryFormatterScope',
        'Sage/Data/BaseSDataStore',
        'Sage/Data/SDataStore',
        'Sage/UI/Columns/DateTime',
        'Sage/Data/SDataServiceRegistry',
        'dojo/_base/declare',
        'dojo/i18n!./nls/ActivityListPanelConfig'
],

function (
   i18n,
   BaseListPanelConfig,
   UtilityActivity,
   SummaryFormatterScope,
   SDataSummaryFormatterScope,
   BaseSDataStore,
   SDataStore,
   ColumnsDateTime,
   sDataServiceRegistry,
   declare,
   nlsResources
) {
    var activityListPanelConfig = declare('Sage.MainView.ActivityMgr.ActivityListPanelConfig', [BaseListPanelConfig], {

        constructor: function () {
            this._nlsResources = nlsResources;
            this._listId = 'Activities';
            this._resourceKind = 'userActivities';
            this.entityName = 'UserActivity';
            this._contextMenu = 'ActivityListContextMenu';
            this._scheduleContextMenu = 'ScheduleContextMenu';
            //this._service = sDataServiceRegistry.getSDataService('dynamic');
            this._service = sDataServiceRegistry.getSDataService('system');
            this._structure = this._getStructure();
            this._select = this._getSelect();
            this._include = this._getInclude();
            this._sort = this._getSort();
            this._where = this._getWhere();
            this._store = this._getStore();
            this.list = this._getListConfig();
            this.summary = this._getSummaryConfig();
            this.detail = this._getDetailConfig();
            this.toolBar = this._getToolBars();
            this.keyField = "$key";
            this.hasCompositeKey = true;
            dojo.subscribe('/entity/activity/change', this._onListRefresh);
            dojo.subscribe('/entity/activity/delete', this._onListRefresh);
            dojo.subscribe('/entity/activity/create', this._onListRefresh);
            dojo.subscribe('/entity/userActivity/change', this._onListRefresh);
            dojo.subscribe('/entity/userActivity/delete', this._onListRefresh);
            dojo.subscribe('/entity/userActivity/create', this._onListRefresh);
            dojo.subscribe('/entity/activity/confirm', this._onListRefresh);
            dojo.subscribe('/entity/activity/decline', this._onListRefresh);
            dojo.subscribe('/entity/userNotification/delete', this._onListRefresh);             
        },
        _onListRefresh: function (event) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.refreshList('activities');
        },
        _getSelect: function () {
         
            var select = [
                      'Activity/Attachment',
                      'Activity/Timeless',
                      'Activity/Recurring',
                      'Activity/RecurIterations',
                      'Activity/Alarm',
                      'Activity/Type',
                      'Activity/StartDate',
                      'Activity/Duration',
                      'Activity/ContactName',
                      'Activity/ContactId',
                      'Activity/LeadName',
                      'Activity/LeadId',
                      'Activity/AccountName',
                      'Activity/AccountId',
                      'Activity/Description',
                      'Activity/Priority',
                      'Activity/Leader',
                      'UserId',
                      'AlarmTime',
                      'Alarm',
                      'Status'
                     ];
            return select;


        },
        _getInclude: function () {
            var includes = ["Activity", "$descriptors"];
            return includes;
        },
        _getSort: function () {
            var sort = [
               { attribute: 'Activity.StartDate', descending: true }
            ];
            return sort;
        },
        _getWhere: function () {
            //var where = (this._currentUserId) ? dojo.string.substitute('(UserActivities.User.Id eq "${0}") and (UserActivities.Status ne "asDeclned" ) and (Type ne "atLiterature" ) ', [this._currentUserId]) : '';
            var where = (this._currentUserId) ? dojo.string.substitute('(User.Id eq "${0}") and (Status ne "asDeclned" ) and (Activity.Type ne "atLiterature" ) ', [this._currentUserId]) : '';
            return where;
        },

       // _getStore: function () {
       //     var store = new SDataStore({
       //         id: this._listId,
       //         service: this._service,
       //         resourceKind: this._resourceKind,
       //         include: this._include,
       //         select: this._select,
       //         sort: this._sort,
       //         expandRecurrences: false,
                //query: {conditions:this._where }
      //          where: this._where
      //      });
      //      return store;
      //  },
        _getStructure: function () {

            var colNameAttachment = "<div class='Global_Images icon16x16 icon_attach_to_16' title='" + this._nlsResources.colNameAttachment + "' />";  //this._nlsResources.colNameAttachment || 'Attachment';
            var colNameRecurring = "<div class='Global_Images icon16x16 icon_recurring' title='" + this._nlsResources.colNameRecurring + "' />"; // this._nlsResources.colNameRecurring || 'Recurring';
            var colNameAlarm = "<img src='images/icons/Alarm_16x16.gif' title='" + this._nlsResources.colNameAlarm + "' alt='" + this._nlsResources.colNameAlarm + "' />"; // this._nlsResources.colNameAlarm || 'Alarm';
            var colNameStatus = "<div class='Global_Images icon16x16 icon_unconfirmedActivity16x16' title='" + this._nlsResources.colNameUnConfirmStatus + "' />";
            var colNameType = this._nlsResources.colNameType || 'Activity Type';
            var colNameStartDate = this._nlsResources.colNameStartDate || 'Start Date';
            var colNameDuration = this._nlsResources.colNameDuration || 'Duration';
            var colNameAccount = this._nlsResources.colNameAccount || 'Account/Company';
            var colNameRegarding = this._nlsResources.colNameRegarding || 'Regarding';
            var colNamePriority = this._nlsResources.colNamePriority || 'Priority';
            var colNameUserId = this._nlsResources.colNameUserId || 'Leader';
            var colNameTypeName = this._nlsResources.colNameTypeName || 'Type';
            var colNameContactName = this._nlsResources.colNameContactName || 'Name';

            var structure = [
                { field: 'Status', name: colNameStatus, type: UtilityActivity.activityConfirmStatusCell, width: '20px' },
                { field: 'Alarm', name: colNameAlarm, type: UtilityActivity.activityAlarmCell, width: '20px' },
                { field: 'Activity.Attachment', name: colNameAttachment, type: UtilityActivity.activityAttachCell, width: '20px' },
                { field: 'Activity.Recurring', name: colNameRecurring, type: UtilityActivity.activityRecurringCell, width: '20px' },
                { field: 'Activity.Type', name: colNameType, type: UtilityActivity.activityTypeCell, width: '90px' },
                { field: 'Activity.StartDate', name: colNameStartDate, type: ColumnsDateTime, timelessField: 'Activity.Timeless', width: '100px' },
                { field: 'Activity.Duration', name: colNameDuration, type: UtilityActivity.activityDurationCell, width: '40px' },
                { field: 'Activity.ContactId', name: colNameTypeName, type: UtilityActivity.activityNameTypeCell, width: '40px' },
                { field: 'Activity.ContactName', name: colNameContactName, type: UtilityActivity.activityNameCell, width: '200px' },
                { field: 'Activity.AccountName', name: colNameAccount, type: UtilityActivity.activityAccountCell, width: '200px' },
                { field: 'Activity.Description', name: colNameRegarding, width: '100px' },
                { field: 'Activity.Priority', name: colNamePriority, width: '40px' },
                {field: 'Activity.Leader', name: colNameUserId, type: UtilityActivity.activityLeaderCell, width: '200px' }
            ];

            return structure;
        },

        _getSummaryConfig: function () {
            var store = new SDataStore({
                id: this._listId,
                service: this._service,
                resourceKind: this._resourceKind,
                include: ['Activity','$descriptors'],
                select: ['$key'],
                expandRecurrences: false,
                // sort: this._sort,
                //query: {conditions:this._where }
                where: this._where
            });

            var structure = [
                {
                    field: '$key',
                    formatter: 'formatSummary',
                    width: '100%',
                    name: 'Summary View'
                }
            ];
            var formatScope = this._getFormatterScope();
            var summaryConfig = {
                structure: structure,
                layout: 'layout',
                store: store,
                rowHeight: 170,
                rowsPerPage: 10,
                formatterScope: formatScope
            };

            return summaryConfig;
        },
       
        _getDetailConfig: function () {

            var formatScope = this._getFormatterScope();
            var requestConfig = this._getSummaryDetailRequestConfig();
            var detailConfig = {
                resourceKind: this._resourceKind,
                requestConfiguration: requestConfig,
                templateLocation: 'MainView/ActivityMgr/Templates/UserActivityDetailSummary.html'
            };
            return detailConfig;

        },
        _getSummaryListRequestConfig: function () {

            var requestConfig = {
                resourceKind: this._resourceKind,
                serviceName: 'system',
                keyField: '$key',
                select: [
                      '$key',
                      'Alarm',
                      'Status',
                      'User',
                      'Activity/Attachment',
                      'Activity/Timeless',
                      'Activity/Recurring',
                      'Activity/RecurIterations',
                      'Activity/Type',
                      'Activity/StartDate',
                      'Activity/Duration',
                      'Activity/ContactName',
                      'Activity/ContactId',
                      'Activity/LeadName',
                      'Activity/LeadId',
                      'Activity/AccountName',
                      'Activity/AccountId',
                      'Activity/Description',
                      'Activity/Priority',
                      'Activity/Leader',
                      'Activity/Location',
                      'Activity/TicketId',
                      'Activity/TicketNumber',
                      'Activity/OpportunityId',
                      'Activity/OpportunityName',
                      'Activity/Notes',
                      'Activity/PhoneNumber'
                     ],
                include: ['Activity','$descriptors'],
                useBatchRequest: true,
                expandRecurrences: false
            };
            return requestConfig;

        },
        _getSummaryDetailRequestConfig: function () {
            var requestConfig = {
                resourceKind: this._resourceKind,
                serviceName: 'system',
                keyField: '$key',
                select: [
                      '$key',
                      'Alarm',
                      'Status',
                      'User',
                      'Activity/Attachment',
                      'Activity/Timeless',
                      'Activity/Recurring',
                      'Activity/RecurIterations',
                      'Activity/Type',
                      'Activity/StartDate',
                      'Activity/Duration',
                      'Activity/ContactName',
                      'Activity/ContactId',
                      'Activity/LeadName',
                      'Activity/LeadId',
                      'Activity/AccountName',
                      'Activity/AccountId',
                      'Activity/Description',
                      'Activity/Priority',
                      'Activity/Leader',
                      'Activity/Location',
                      'Activity/TicketId',
                      'Activity/TicketNumber',
                      'Activity/OpportunityId',
                      'Activity/OpportunityName',
                      'Activity/LongNotes',
                      'Activity/PhoneNumber'
                     ],
                include: ['Activity', '$descriptors'],
                useBatchRequest: true,
                expandRecurrences: false
            };
            return requestConfig;

        },
        _getFormatterScope: function () {
            var requestConfig = this._getSummaryListRequestConfig();
            var formatScope = new SDataSummaryFormatterScope({
                templateLocation: 'MainView/ActivityMgr/templates/UserActivityListSummary.html',
                resetDataManager: true,
                requestConfiguration: requestConfig

            });
            return formatScope;

        },
        
        _getToolBars: function () {
            var toolBars = { items: [] };
            return toolBars;
        },
        getTimelessProperty: function (propertyName) {
            return "Activity.Timeless";

        }
    });

    return activityListPanelConfig;

});
