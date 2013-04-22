/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/SDataMainViewConfigurationProvider',
    'Sage/UI/ListPanel',
    'Sage/Utility',
    'Sage/Utility/Activity',
    'Sage/MainView/ActivityMgr/ActivityGroupContextService',
    'Sage/Services/ActivityService',
    'Sage/MainView/ActivityMgr/FilterConfigurationProvider',
    'dojo/i18n!./nls/ActivityManager',
    'dojo/_base/declare'
],

function (
    SDataMainViewConfigurationProvider,
    ListPanel,
    SageUtility,
    UtilityActivity,
    activityGroupContextService,
    ActivityService,
    FilterConfigurationProvider,
    nlsStrings,
    declare
) {
    //dojo.requireLocalization("Sage.MainView", "ActivityManager");
    var actvityManager = declare('Sage.MainView.ActivityManager', SDataMainViewConfigurationProvider, {

        _nlsResources: false,
        _currentTabId: false,
        _currentTabDescription: false,
        _currentUserId: false,
        _currentKeyField: '$key',
        _groupContextService: false,
        _tabNameCache: {},
        _mainViewName: 'ActivityManager',
        store: false,
        constructor: function (options) {
            this._nlsResources = nlsStrings;
            this._currentUserId = 'x';
            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            if (!grpContextSvc || grpContextSvc.declaredClass !== 'Sage.MainView.ActivityMgr.ActivityGroupContextService') {
                Sage.Services.removeService('ClientGroupContext');
                grpContextSvc = new activityGroupContextService();
                Sage.Services.addService('ClientGroupContext', grpContextSvc);
            }

            var ctx = grpContextSvc.getContext();
            this._currentTabId = ctx.CurrentGroupID;
            this._currentTabDescription = ctx.CurrentName;

            var clientContextSvc = Sage.Services.getService('ClientContextService');
            if (clientContextSvc) {

                if (clientContextSvc.containsKey("userID")) {
                    this._currentUserId = clientContextSvc.getValue("userID");
                }
            }

            this.titlePaneConfiguration = {
                tabs: this._getTabsConfig(),
                menu: this._getMenuConfig(),
                titleFmtString: this._nlsResources.titleFmtString || '${0}'
            };

            dojo.subscribe('/group/context/changed', this, '_onCurrentGroupChanged');

        },

        _setListPanelConfig: function () {

            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            if (grpContextSvc) {
                //var ctx = grpContextSvc.getContext();
                //this._currentTabId = ctx.CurrentGroupID;
                //this._currentTabDescription = ctx.CurrentName;
                this.listPanelConfiguration = grpContextSvc.getCurrentListConfig();
                this.store = this.listPanelConfiguration.list.store;
                this.service = this.listPanelConfiguration.list.store.service;
            }

            return;


        },

        _getListPanelConfig: function () {

            this._setListPanelConfig();
            return this.listPanelConfiguration;
        },

        requestConfiguration: function (options) {

            //returns the list panel configuration through the success callback method...
            if (options.success) {
                options.success.call(options.scope || this, this._getListPanelConfig(), this);
            }
        },
        requestTitlePaneConfiguration: function (options) {
            if (options.success) {
                options.success.call(options.scope || this, this.titlePaneConfiguration, this);
            }
        },

        onConfigurationChange: function (obj) {
            //this._setListPanelConfig();
        },
        onTitlePaneConfigurationChange: function () {

        },

        _setUIForNewTab: function (tabId, tabDescription) {

            this._currentTabId = tabId;
            this._currentTabDescription = tabDescription;
            //set title in title pane...
            //var titlePane = dijit.byId('titlePane');
            //if (titlePane) {
            //    titlePane.set('title', this._currentTabDescription);
            //}

        },

        _onCurrentGroupChanged: function (args) {
            var context = args['current'];
            if (!context) {
                var groupContextSvc = Sage.Services.getService('ClientGroupContext');
                context = groupContextSvc.getContext();
            }

            //dijit.byId('grpMenuWithXGroup').set('label', dojo.string.substitute('For ${0} Group', [context.CurrentName])));
            if (dijit.byId('GroupTabs').selectedChildWidget.id !== context.CurrentGroupID) {
                dijit.byId('GroupTabs').selectChild(context.CurrentGroupID);
            }
        },


        _onTabSelected: function (tab) {
            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            var id = tab.id || tab;

            var keyField = grpContextSvc.getKeyField(id);
            if (grpContextSvc) {
                var ctx = grpContextSvc.getContext();
                if (ctx.CurrentGroupID === id) {
                    return;
                }
                this._setUIForNewTab(id, tab.title);
                grpContextSvc.setCurrentGroup(id, tab.title, keyField);
            }
        },
        _getTabsConfig: function () {

            var tabsConfig = {
                store: false,
                selectedTabId: this._currentTabId,
                tabKeyProperty: 'key',
                tabNameProperty: 'descriptor',
                fetchParams: { },
                staticTabs: this._getStaticTabs(),
                onTabSelect: dojo.hitch(this, '_onTabSelected'),
                onTabClose: false,
                showTabContextMenus: false
            };

            return tabsConfig;
        },
        _getStaticTabs: function () {

            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            var staticTabs = grpContextSvc.getStaticTabs();
            return staticTabs;
        },

        _getMenuConfig: function () {
            return false;
        }

    });
    return actvityManager;
});

