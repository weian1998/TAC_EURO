/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/MainView/ActivityMgr/BaseListPanelConfig',
    'Sage/Utility',
    'Sage/Utility/Activity',
    'Sage/UI/SummaryFormatterScope',
    'Sage/Data/BaseSDataStore',
    'Sage/UI/Columns/DateTime',
    'dojo/_base/declare',
    'dojo/i18n!./nls/EventListPanelConfig'
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

    //dojo.requireLocalization("Sage.MainView.ActivityMgr", "EventListPanelConfig");
    var eventListPanelConfig = declare('Sage.MainView.ActivityMgr.EventListPanelConfig', [BaseListPanelConfig], {

        constructor: function () {
            this._nlsResources = nlsResources;
            this._listId = 'events';
            this._resourceKind = 'events';
            this.entityName = 'Event';
            this._contextMenu = 'EventListContextMenu';
            this._securedAction = 'Activities\View\Events';
            this._structure = this._getStructure();
            this._select = this._getSelect();
            this._sort = this._getSort();
            this._where = this._getWhere();
            this._store = this._getStore();
            this.list = this._getListConfig();
            this.summary = this._getSummaryConfig();
            this.toolBar = this._getToolBars();
            dojo.subscribe('/entity/event/create', this._onListRefresh);
            dojo.subscribe('/entity/event/change', this._onListRefresh);
            dojo.subscribe('/entity/event/delete', this._onListRefresh);
        },
        _onListRefresh: function (event) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.refreshList('events');
        },

        _getSelect: function () {
            var select = [
                      '$key',
                      'Type',
                      'StartDate',
                      'EndDate',
                      'Location',
                      'Description',
                      'User/UserInfo/UserName',
                      'User/UserAccessToOtherCal/OthersAccessToUserCal/Id'
                      ];
            return select;
        },
        _getSort: function () {
            var sort = [
              { attribute: 'StartDate', descending: true }
            ];
            return sort;
        },
        _getWhere: function () {

            var where = (this._currentUserId) ? dojo.string.substitute('(User.UserAccessToOtherCal.OthersAccessToUserCal.Id eq "${0}")', [this._currentUserId]) : '';
            return where;
        },
        _getStructure: function () {

            var colNameType = this._nlsResources.colNameType || 'Type';
            var colNameStartDate = this._nlsResources.colNameStartDate || 'Start Date';
            var colNameEndDate = this._nlsResources.colNameEndDate || 'End Date';
            var colNameDescription = this._nlsResources.colNameDescription || 'Description';
            var colNameUser = this._nlsResources.colNameUser || 'User';
            var colNameLocation = this._nlsResources.colNameLocation || 'Location';

            declare("Sage.MainView.ActivityMgr.EventListPanelConfig.EditEventCell", dojox.grid.cells.Cell, {
                format: function (inRowIndex, inItem) {
                    var type = this.get(inRowIndex, inItem);
                    var key = Sage.Utility.getValue(inItem, "$key");
                    var html = "<a href='javascript:Sage.Link.editEvent(\"" + key + "\")' >" + "Edit" + "</a>";
                    return html;
                }
            });

            declare("Sage.MainView.ActivityMgr.EventListPanelConfig.EventTypeCell", dojox.grid.cells.Cell, {
                format: function (inRowIndex, inItem) {
                    var key = Sage.Utility.getValue(inItem, "$key");
                    var type = Sage.Utility.getValue(inItem, "Type");
                    var html = "<a href='javascript:Sage.Link.editEvent(\"" + key + "\")' >" + type + "</a>";
                    return html;
                }
            });

            var structure = [
               { field: 'Type', name: colNameType, type: Sage.MainView.ActivityMgr.EventListPanelConfig.EventTypeCell, width: '100px' },
               { field: 'StartDate', name: colNameStartDate, type: ColumnsDateTime, dateOnly: true, width: '100px' },
               { field: 'EndDate', name: colNameEndDate, type: ColumnsDateTime, dateOnly: true, width: '100px' },
               { field: 'User.UserInfo.UserName', name: colNameUser, width: '120px' },
               { field: 'Location', name: colNameLocation, width: '200px' },
               { field: 'Description', name: colNameDescription, width: '300px' }
            ];

            return structure;
        },
        _getDetailConfig: function () {
            var formatScope = this._getFormatterScope();
            var detailConfig = {
                resourceKind: this._resourceKind,
                requestConfiguration: {
                    mashupName: 'ActivityManager',
                    queryName: 'EventSummary_query'
                },
                templateLocation: 'MainView/ActivityMgr/Templates/EventSummary.html',
                postProcessCallBack: false
            };
            return detailConfig;

        },
        _getFormatterScope: function () {
            var formatScope = new SummaryFormatterScope({
                requestConfiguration: {
                    mashupName: 'ActivityManager',
                    queryName: 'EventSummary_query'
                },
                templateLocation: 'MainView/ActivityMgr/Templates/EventSummary.html'
            });
            return formatScope;
        },
        _getToolBars: function () {
            var toolBars = { items: [] };
            return toolBars;
        }

    });
    return eventListPanelConfig;

});