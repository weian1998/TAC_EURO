/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */


define([
    'Sage/MainView/ActivityMgr/BaseListPanelConfig',
    'Sage/Utility',
    'Sage/Utility/Activity',
    'Sage/UI/SummaryFormatterScope',
    'Sage/Data/BaseSDataStore',
    'Sage/UI/Columns/DateTime',
    'dojo/_base/declare',
    'dojo/i18n!./nls/LitRequestListPanelConfig'
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
    var litRequestListPanelConfig = declare('Sage.MainView.ActivityMgr.LitRequestListPanelConfig', [BaseListPanelConfig], {
        constructor: function() {
            this._nlsResources = nlsResources;
            this._listId = 'literature';
            this._resourceKind = 'litRequests';
            this.entityName = 'LitRequest';
            this._contextMenu = 'LitRequestListContextMenu';
            this._securedAction = 'Activities\View\LitratureRequests';
            this._structure = this._getStructure();
            this._select = this._getSelect();
            this._sort = this._getSort();
            this._where = this._getWhere();
            this._store = this._getStore();
            this.list = this._getListConfig();
            this.summary = this._getSummaryConfig();
            this.toolBar = this._getToolBars();
            dojo.subscribe('/entity/litRequest/change', this._onListRefresh);
        },
        _onListRefresh: function(event) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.refreshList('literature');
        },

        _getSelect: function() {
            var select = [
                '$key',
                'ContactName',
                'Contact/$key',
                'Description',
                'FillDate',
                'FillStatus',
                'Options',
                'Priority',
                'RequestDate',
                'SendDate',
                'SendVia',
                'TotalCost',
                'FillUser/UserInfo/UserName',
                'RequestUser/UserInfo/UserName',
                'Contact/AccountName',
                'Contact/Address/PostalCode',
                'Contact/Account/AccountId',
                'ReqestUser/$key'
            ];
            return select;
        },
        _getSort: function() {
            var sort = [
                { attribute: 'RequestDate', descending: true }
            ];
            return sort;
        },
        _getWhere: function() {
            var completeStatus = this._nlsResources.litFillStatusComplete || 'Completed';
            var where = (this._currentUserId) ? dojo.string.substitute('(RequestUser.Id eq "${0}") and (FillStatus ne "${1}"  or FillStatus eq null )', [this._currentUserId, completeStatus]) : '';
            return where;
        },
        _getStructure: function() {
            /*
            example urls for this list...
            http://localhost:59230/SlxClient_RedPill/slxdata.ashx/slx/dynamic/-/litRequests?format=json
            */

            var colNameView = this._nlsResources.colNameView || 'View';
            var colNameContact = this._nlsResources.colNameContact || 'Contact';
            var colNameDescription = this._nlsResources.colNameDescription || 'Description';
            var colNameFillStatus = this._nlsResources.colNameFillStatus || 'Status';
            var colNamePriority = this._nlsResources.colNamePriority || 'Priority';
            var colNameReqestDate = this._nlsResources.colNameReqestDate || 'Request Date';
            var colNameSendDate = this._nlsResources.colNameSendDate || 'Send Date';
            var colNameSendVia = this._nlsResources.colNameSendVia || 'Send Via';
            var colNameTotalCost = this._nlsResources.colNameTotalCost || 'Total Cost';
            var colNameRequestUser = this._nlsResources.colNameReqestUser || 'Request User';
            var colNameAccount = this._nlsResources.colNameAccount || 'Account';
            var colNamePostalCode = this._nlsResources.colNamePostalCode || 'Postal Code';

            declare("Sage.MainView.ActivityMgr.LitRequestListPanelConfig.LitViewCell", dojox.grid.cells.Cell, {
                format: function(inRowIndex, inItem) {
                    var key = SageUtility.getValue(inItem, "$key");
                    var html = '<a href="LitRequest.aspx?entityid=' + key + '&modeid=Detail" >' + colNameView + '</a>';
                    return html;
                }
            });

            declare("Sage.MainView.ActivityMgr.LitRequestListPanelConfig.LitContactCell", dojox.grid.cells.Cell, {
                format: function(inRowIndex, inItem) {
                    var contactId = Sage.Utility.getValue(inItem, 'Contact.$key');
                    var contactName = Sage.Utility.getValue(inItem, 'ContactName');
                    var html = '<a href="Contact.aspx?entityid=' + contactId + '&modeid=Detail" >' + contactName + '</a>';
                    return html;
                }
            });

            declare("Sage.MainView.ActivityMgr.LitRequestListPanelConfig.LitAccountCell", dojox.grid.cells.Cell, {
                format: function(inRowIndex, inItem) {
                    var accountId = Sage.Utility.getValue(inItem, 'Contact.Account.$key');
                    var accountName = Sage.Utility.getValue(inItem, 'Contact.AccountName');
                    var html = '<a href="Account.aspx?entityid=' + accountId + '&modeid=Detail" >' + accountName + '</a>';
                    return html;
                }
            });
            var structure = [
                { field: '$key', name: ' ', type: Sage.MainView.ActivityMgr.LitRequestListPanelConfig.LitViewCell, width: '60px' },
                { field: 'RequestDate', name: colNameReqestDate, type: ColumnsDateTime, dateOnly: true, width: '90px' },
                { field: 'Priority', name: colNamePriority, width: '60px' },
                { field: 'Description', name: colNameDescription, width: '200px' },
                { field: 'ContactName', name: colNameContact, type: Sage.MainView.ActivityMgr.LitRequestListPanelConfig.LitContactCell, width: '200px' },
                { field: 'Contact.AccountName', name: colNameAccount, type: Sage.MainView.ActivityMgr.LitRequestListPanelConfig.LitAccountCell, width: '200px' },
                { field: 'SendDate', name: colNameSendDate, type: ColumnsDateTime, dateOnly: true, width: '90px' },
                { field: 'SendVia', name: colNameSendVia, width: '60px' },
                { field: 'TotalCost', name: colNameTotalCost, width: '60px' },
                { field: 'FillStatus', name: colNameFillStatus, width: '60px' },
                { field: 'RequestUser.UserInfo.UserName', name: colNameRequestUser, width: '90px' },
                { field: 'Contact.Address.PostalCode', name: colNamePostalCode, width: '60px' }
            ];
            return structure;
        },

        _getDetailConfig: function() {
            var detailConfig = {
                resourceKind: this._resourceKind,
                requestConfiguration: {
                    mashupName: 'ActivityManager',
                    queryName: 'LitRequestSummary_query'
                },
                templateLocation: 'MainView/ActivityMgr/Templates/LitRequestSummary.html',
                postProcessCallBack: false
            };
            return detailConfig;

        },
        _getFormatterScope: function() {
            var formatScope = new SummaryFormatterScope({
                requestConfiguration: {
                    mashupName: 'ActivityManager',
                    queryName: 'LitRequestSummary_query'
                },
                templateLocation: 'MainView/ActivityMgr/Templates/LitRequestSummary.html'
            });
            return formatScope;
        },
        _getToolBars: function() {
            var toolBars = { items: [] };
            return toolBars;
        }
    });
    return litRequestListPanelConfig;
});