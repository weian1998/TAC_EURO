/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/MainView/ActivityMgr/BaseListPanelConfig',
    'Sage/Utility',
    'Sage/Utility/Activity',
    'Sage/UI/SDataSummaryFormatterScope',
    'Sage/Data/BaseSDataStore',
    'Sage/UI/Columns/DateTime',
    'Sage/Data/SDataServiceRegistry',
    'dojo/_base/declare',
    'dojo/i18n!./nls/ActivityListPanelConfig'
],

function (
    BaseListPanelConfig,
    SageUtility,
    UtilityActivity,
    SDataSummaryFormatterScope,
    BaseSDataStore,
    ColumnsDateTime,
    sDataServiceRegistry,
    declare,
    nlsResources
) {
    var allOpenListPanelConfig = declare('Sage.MainView.ActivityMgr.AllOpenListPanelConfig', [BaseListPanelConfig], {

        constructor: function () {
            this._nlsResources = nlsResources;
            this._listId = 'allOpen';
            this._resourceKind = 'activities';
            this.entityName = 'Activity';
            this._contextMenu = 'ActivityListContextMenu';
            this._scheduleContextMenu = 'ScheduleContextMenu';
            this._service = sDataServiceRegistry.getSDataService('system');
            this._structure = this._getStructure();
            this._select = this._getSelect();
            this._include = this._getInclude();
            this._sort = this._getSort();
            this._where = this._getWhere();
            this._store = this._getStore();
            this.list = this._getListConfig();
            this.list.selectionMode = "single";
            this.summary = this._getSummaryConfig();
            this.detail = this._getDetailConfig();
            this.toolBar = this._getToolBars();
            dojo.subscribe('/entity/activity/change', this._onListRefresh);
            dojo.subscribe('/entity/activity/delete', this._onListRefresh);
            dojo.subscribe('/entity/activity/create', this._onListRefresh);
        },
        _onListRefresh: function (event) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.refreshList('allopen');
        },
        _getSelect: function () {
            var select = [
                      '$key',
                      'Attachment',
                      'Timeless',
                      'Recurring',
                      'RecurIterations',
                      'Alarm',
                      'Type',
                      'StartDate',
                      'Duration',
                      'ContactName',
                      'ContactId',
                      'LeadName',
                      'LeadId',
                      'AccountName',
                      'AccountId',
                      'Description',
                      'Priority',
                      'Leader',
                      'RecurrenceState'
                     ];
            return select;
        },
        _getInclude: function () {
            var includes = ["$descriptors"];
            return includes;
        },
        _getSort: function () {
            var sort = [
               { attribute: 'StartDate', descending: true }
            ];
            return sort;
        },
        _getWhere: function () {
            var where = ''; // (this._currentUserId) ? dojo.string.substitute('(UserActivities.UserId eq "${0}") and (Type ne "atLiterature" ) ', [this._currentUserId]) : '';          
            // where = '(Type ne "atLiterature" ) and (UserActivities.Status ne "asDeclned" )';
            where = '(Type ne "atLiterature" )';
            return where;
        },

        _getStructure: function () {

            var colNameAttachment = "<div class='Global_Images icon16x16 icon_attach_to_16' title='" + this._nlsResources.colNameAttachment + "' />";  //this._nlsResources.colNameAttachment || 'Attachment';
            var colNameRecurring = "<div class='Global_Images icon16x16 icon_recurring' title='" + this._nlsResources.colNameRecurring + "' />"; // this._nlsResources.colNameRecurring || 'Recurring';
            var colNameAlarm = "<img style='width: 16px; height: 16px' src='images/icons/Alarm_16x16.gif' title='" + this._nlsResources.colNameAlarm + "' alt='" + this._nlsResources.colNameAlarm + "' />";  // this._nlsResources.colNameAlarm || 'Alarm';
            var colNameType = this._nlsResources.colNameType || 'Type';
            var colNameStartDate = this._nlsResources.colNameStartDate || 'Start Date';
            var colNameDuration = this._nlsResources.colNameDuration || 'Duration';
            var colNameAccount = this._nlsResources.colNameAccount || 'Account';
            var colNameRegarding = this._nlsResources.colNameRegarding || 'Regarding';
            var colNamePriority = this._nlsResources.colNamePriority || 'Priority';
            var colNameUserId = this._nlsResources.colNameUserId || 'Leader';
            var colNameTypeName = this._nlsResources.colNameTypeName || 'Type';
            var colNameContactName = this._nlsResources.colNameContactName || 'Name';

            var structure = [
                { field: 'Alarm', name: colNameAlarm, type: UtilityActivity.activityAlarmCell, width: '20px' },
                { field: 'Attachment', name: colNameAttachment, type: UtilityActivity.activityAttachCell, width: '20px' },
                { field: 'Recurring', name: colNameRecurring, type: UtilityActivity.activityRecurringCell, width: '20px' },
                { field: 'Type', name: colNameType, type: UtilityActivity.activityTypeCell, width: '90px' },
                { field: 'StartDate', name: colNameStartDate, type: ColumnsDateTime, timelessField: 'Timeless', width: '100px' },
                { field: 'Duration', name: colNameDuration, type: UtilityActivity.activityDurationCell, width: '40px' },
                { field: 'ContactId', name: colNameTypeName, type: UtilityActivity.activityNameTypeCell, width: '40px' },
                { field: 'ContactName', name: colNameContactName, type: UtilityActivity.activityNameCell, width: '200px' },
                { field: 'AccountName', name: colNameAccount, type: UtilityActivity.activityAccountCell, width: '200px' },
                { field: 'Description', name: colNameRegarding, width: '100px' },
                { field: 'Priority', name: colNamePriority, width: '40px' },
                { field: 'Leader', name: colNameUserId, type: UtilityActivity.activityLeaderCell, width: '200px' }
            ];

            return structure;
        },


        _getDetailConfig: function () {
            //base class is calling _getFormatterScope();
            //var formatScope = this._getFormatterScope();
            var requestConfig = this._getSummaryDetailRequestConfig();
            var detailConfig = {
                resourceKind: this._resourceKind,
                requestConfiguration: requestConfig,
                templateLocation: 'MainView/ActivityMgr/Templates/AllOpenDetailSummary.html'
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
                      'Attachment',
                      'Timeless',
                      'Recurring',
                      'RecurIterations',
                      'Alarm',
                      'Type',
                      'StartDate',
                      'Duration',
                      'ContactName',
                      'ContactId',
                      'LeadName',
                      'LeadId',
                      'AccountName',
                      'AccountId',
                      'Description',
                      'Priority',
                      'Leader/$descriptor',
                      'Location',
                      'TicketId',
                      'TicketNumber',
                      'OpportunityId',
                      'OpportunityName',
                      'Notes',
                      'RecurrenceState',
                      'PhoneNumber'
                 ],
                include: ['$descriptors'],
                useBatchRequest: true
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
                      'Attachment',
                      'Timeless',
                      'Recurring',
                      'RecurIterations',
                      'Alarm',
                      'Type',
                      'StartDate',
                      'Duration',
                      'ContactName',
                      'ContactId',
                      'LeadName',
                      'LeadId',
                      'AccountName',
                      'AccountId',
                      'Description',
                      'Priority',
                      'Leader/$descriptor',
                      'Location',
                      'TicketId',
                      'TicketNumber',
                      'OpportunityId',
                      'OpportunityName',
                      'LongNotes',
                      'RecurrenceState',
                      'PhoneNumber'
                     ],
                include: ['$descriptors'],
                useBatchRequest: true
            };
            return requestConfig;

        },
        _getFormatterScope: function () {
            var requestConfig = this._getSummaryListRequestConfig();
            var formatScope = new SDataSummaryFormatterScope({
                templateLocation: 'MainView/ActivityMgr/templates/AllOpenListSummary.html',
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
            return "Timeless";

        }


    });

    return allOpenListPanelConfig;

});