/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/MainView/ActivityMgr/BaseListPanelConfig',
    'Sage/Utility',
    'Sage/Utility/Activity',
    'Sage/UI/SummaryFormatterScope',
    'Sage/Data/BaseSDataStore',
    'Sage/UI/Columns/DateTime',
    'dojo/_base/declare',
    'dojo/i18n!./nls/ConfirmListPanelConfig'
],

function (
    BaseListPanelConfig,
    SageUtility,
    UtilityActivity,
    SummaryFormatterScope,
    BaseSDataStore,
    ColumnsDateTime,
    declare,
    nlsResources
) {

    var confirmListPanelConfig = declare('Sage.MainView.ActivityMgr.ConfirmListPanelConfig', [BaseListPanelConfig], {

        constructor: function () {
            this._nlsResources = nlsResources;
            this._listId = 'confirmations';
            this._resourceKind = 'UserNotifications';
            this.entityName = 'UserNotification';
            this._contextMenu = 'ConfimationListContextMenu';
            this._scheduleContextMenu = 'ScheduleContextMenu';
            this._structure = this._getStructure();
            this._select = this._getSelect();
            this._include = this._getInclude();
            this._sort = this._getSort();
            this._where = this._getWhere();
            this._store = this._getStore();
            this.list = this._getListConfig();
            this.summary = this._getSummaryConfig();
            this.toolBar = this._getToolBars();
            dojo.subscribe('/entity/userNotification/change', this._onListRefresh);
            dojo.subscribe('/entity/userNotification/delete', this._onListRefresh);
        },
        _onListRefresh: function (event) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.refreshList('confirmations');
        },
        _getSelect: function () {
            var select = [
                '$key',
                'Type',
                'ActivityId',
                'Activity/Type',
                'Activity/StartDate',
                'Activity/Description',
                'FromUserId',
                'ToUserId',
                'FromUser/UserInfo/UserName',
                'ToUser/UserInfo/UserName'
            ];
            return select;
        },
        _getInclude: function () {
            var includes = ["UserInfo"];
            return includes;
        },
        _getSort: function () {
            var sort = [
               { attribute: 'Activity.StartDate', descending: true }
            ];
            return sort;
        },
        _getWhere: function () {
            var where = (this._currentUserId) ? dojo.string.substitute('ToUser.Id eq "${0}" ', [this._currentUserId]) : '';
            //var where = (this._currentUserId) ? dojo.string.substitute('(ToUser.UserAccessToOtherCal.OthersAccessToUserCal.Id eq "${0}")', [this._currentUserId]) : '';
            return where;
        },
        _getStructure: function () {

            var colNameType = this._nlsResources.colNameType || 'Activity Type';
            var colNameStatus = this._nlsResources.colNameNotification || 'Notification';
            var colNameStartDate = this._nlsResources.colNameStartDate || 'Start Date';
            //var colNameDuration = this._nlsResources.colNameDuration || 'Duration';
            var colNameRegarding = this._nlsResources.colNameRegarding || 'Regarding';
            var colNameFromUser = this._nlsResources.colNameFromUser || 'From';
            var colNameToUser = this._nlsResources.colNameToUser || 'To User';

            var ActivityConfirmCell = declare("Sage.MainView.ActivityMgr.ConfirmListPanelConfig.ActivityConfirmCell", dojox.grid.cells.Cell, {
                format: function (inRowIndex, inItem) {
                    //var type = this.get(inRowIndex, inItem);
                    var key = SageUtility.getValue(inItem, "$key");
                    var type = SageUtility.getValue(inItem, "Type");
                    var activityId = SageUtility.getValue(inItem, "ActivityId");
                    var toUserId = SageUtility.getValue(inItem, "ToUserId");
                    var statusName = UtilityActivity.getConfirmStatusName(type);
                    var html = "<a href='javascript:Sage.Link.editConfirmation(\"" + key + "\")' >" + statusName + "</a>";
                    return html;
                }
            });

            var ActivityTypeCell = declare("Sage.MainView.ActivityMgr.ConfirmListPanelConfig.ActivityTypeCell", dojox.grid.cells.Cell, {
                format: function (inRowIndex, inItem) {
                    var type = this.get(inRowIndex, inItem);
                    //var key = SageUtility.getValue(inItem, "$key");
                    var html = "<div><div class='Global_Images icon16x16 " + UtilityActivity.getActivityImageClass(type, 'small') + "'></div>&nbsp" + UtilityActivity.getActivityTypeName(type) + "</div>";

                    return html;
                }
            });

            var structure = [
                { field: 'Type', name: colNameStatus, type: ActivityConfirmCell, width: '90px' },
                { field: 'Activity.Type', name: colNameType, type: ActivityTypeCell, width: '90px' },
                { field: 'Activity.StartDate', name: colNameStartDate, type: ColumnsDateTime, timelessField: 'Timeless', width: '150px' },
                { field: 'Activity.Description', name: colNameRegarding, width: '300px' },
                { field: 'FromUser.UserInfo.UserName', name: colNameFromUser, width: '100px' },
                { field: 'ToUser.UserInfo.UserName', name: colNameToUser, width: '100px' }
            ];

            return structure;
        },

        _getDetailConfig: function () {
            var formatScope = this._getFormatterScope();
            var detailConfig = {
                resourceKind: this._resourceKind,
                requestConfiguration: {
                    mashupName: 'ActivityManager',
                    queryName: 'ConfirmationDetailSummary_query'
                },
                templateLocation: 'MainView/ActivityMgr/Templates/ConfirmationDetailSummary.html',
                postProcessCallBack: false
            };
            return detailConfig;
        },
        _getFormatterScope: function () {
            var formatScope = new SummaryFormatterScope({
                requestConfiguration: {
                    mashupName: 'ActivityManager',
                    queryName: 'ConfirmationListSummary_query'
                },
                templateLocation: 'MainView/ActivityMgr/Templates/ConfirmationListSummary.html'
            });
            return formatScope;
        },
        _getToolBars: function () {
            var toolBars = { items: [] };
            return toolBars;
        }

    });

    return confirmListPanelConfig;
});