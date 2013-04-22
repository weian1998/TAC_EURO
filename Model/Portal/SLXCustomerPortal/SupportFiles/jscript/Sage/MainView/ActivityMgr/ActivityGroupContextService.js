/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Groups/BaseGroupContextService',
    'Sage/Services/ActivityService',
    'dojo/string',
    'Sage/Data/SDataServiceRegistry',
    'dojo/_base/lang',
    'Sage/MainView/ActivityMgr/ActivityListPanelConfig',
    'Sage/MainView/ActivityMgr/AlarmListPanelConfig',
    'Sage/MainView/ActivityMgr/AllOpenListPanelConfig',
    'Sage/MainView/ActivityMgr/ConfirmListPanelConfig',
    'Sage/MainView/ActivityMgr/EventListPanelConfig',
    'Sage/MainView/ActivityMgr/LitRequestListPanelConfig',
    'Sage/MainView/ActivityMgr/PastDueListPanelConfig',
    'dojox/storage/LocalStorageProvider',
    'dojo/_base/declare',
    'dojo/i18n!./nls/ActivityGroupContextService'
],
function (
  BaseGroupContextService,
  ActivityService,
  dString,
  SDataServiceRegistry,
  lang,
  ActivityListPanelConfig,
  AlarmListPanelConfig,
  AllOpenListPanelConfig,
  ConfirmListPanelConfig,
  EventListPanelConfig,
  LitRequestListPanelConfig,
  PastDueListPanelConfig,
  LocalStorageProvider,
  declare,
  i18nStrings
  ) {

    var activityGroupContextService = declare('Sage.MainView.ActivityMgr.ActivityGroupContextService', BaseGroupContextService, {
        _currentContext: null,
        _currentTabId: false,
        _currentTabDescription: false,
        _currentUserId: false,
        _currentKeyField: '$key',
        _currentListConfiguration: false,
        groupConfigTypes: [
            {
                key: 'activities',
                descriptor: i18nStrings.activityTabDisplayName,
                keyField: "$key",
                configProviderType: ActivityListPanelConfig
            }, {
                key: 'allopen',
                descriptor: i18nStrings.allOpenTabDisplayName,
                keyField: "$key",
                configProviderType: AllOpenListPanelConfig
            }, {
                key: 'pastdue',
                descriptor: i18nStrings.pastDueTabDisplayName,
                keyField: "$key",
                isCompostie: true,
                configProviderType: PastDueListPanelConfig
            }, {
                key: 'alarms',
                descriptor: i18nStrings.alarmTabDisplayName,
                keyField: "$key",
                isCompostie: true,
                configProviderType: AlarmListPanelConfig
            }, {
                key: 'events',
                descriptor: i18nStrings.eventTabDisplayName,
                keyField: "$key",
                configProviderType: EventListPanelConfig
            }, {
                key: 'confirmations',
                descriptor: i18nStrings.confirmTabDisplayName,
                keyField: "$key",
                configProviderType: ConfirmListPanelConfig
            }, {
                key: 'literature',
                descriptor: i18nStrings.litTabDisplayName,
                keyField: "$key",
                configProviderType: LitRequestListPanelConfig
            }
        ],
        _configsHash: false,
        _LOCALSTORE_NAMESPACE: 'Sage-ActivityManagerView',
        _STORE_KEY_LASTAB: '_LASTTAB',
        _tabNameCache: {},
        constructor: function () {
            this.inherited(arguments);
            this._currentContext = {};
            dojo.mixin(this._currentContext, this._emptyContext);
            this._currentContext.CurrentTableKeyField = "$key";
            this._currentContext.AppliedFilterInfo = {};
            this._currentContext.CurrentFamily = null; // 'Actvitiy';
            this._currentContext.notGroupBased = true;

            var defaultTabId = this._getDefaultTabId();

            this.setContext(defaultTabId, 'default');
            this.unsubscribeConnects();
            this._subscribes = [];
            this._subscribes.push(
                dojo.subscribe(dString.substitute("/ui/filters/default/refresh"), this, this._onDefaultFilterRefresh)
            );
            this._onDefaultFilterLoad();

        },
        buildCurrentEntityContext: function () {
            var groupId = this._currentContext.CurrentGroupID;

            if (!groupId) {
                return;
            }

            if (this._currentListConfiguration) {
                this._currentContext.CurrentEntity = this._currentListConfiguration.entityName;
                this._currentContext.CurrentTableKeyField = this.getKeyField(groupId);
                if (!this._currentContext.CurrentName) {
                    this._currentContext.CurrentName = this.getGroupName(groupId);
                }
            }
        },
        _ensureConfigsHash: function () {
            if (!this._configsHash) {
                var hash = {};
                for (var i = 0; i < this.groupConfigTypes.length; i++) {
                    var cfg = this.groupConfigTypes[i];
                    hash[cfg.key] = lang.mixin(cfg, { instance: false });
                }
                this.configsHash = hash;
            }
        },
        _setListConfig: function () {
            this._ensureConfigsHash();

            var tabId = this._currentContext.CurrentGroupID;
            var currConfig = (this.configsHash.hasOwnProperty(tabId)) ? this.configsHash[tabId] : this.configsHash['activities'];
            if (!currConfig.instance) {
                currConfig.instance = new currConfig.configProviderType();
                this.onTabConfigCreated(currConfig.instance);
            } else {
                currConfig.instance.rebuild();
            }
            this._currentListConfiguration = currConfig.instance;
            return;
        },

        getCurrentListConfig: function () {
            this._setListConfig();
            return this._currentListConfiguration;
        },

        getKeyField: function (tabid) {
            this._ensureConfigsHash();
            var keyField = '$key';
            if (this.configsHash[tabid]) {
                keyField = this.configsHash[tabid]['keyField'] || '$key';
            }
            return keyField;
        },
        getGroupName: function (tabid) {
            this._ensureConfigsHash();
            var name = 'default';
            if (this.configsHash[tabid]) {
                name = this.configsHash[tabid]['descriptor'] || 'default';
            }
            return name;
        },

        onCurrentGroupChanged: function (options) {
            //We need to clear out the filter manager  
            this._clearFilterManager();
            var self = this;
            this._onDefaultFilterLoad(function () {
                var context = self.getContext();
                dojo.publish('/group/context/changed', [options, self]);
                self._saveToLocalStorage(self._STORE_KEY_LASTAB, context.CurrentGroupID);
                // The Filter Panel will ask to get the appled filters form the group context service.
                //self.publishFiltersApplied();
            });

        },

        _clearFilterManager: function () {
            var applied = {};
            var definitionSet = {};
            dojo.publish('/ui/filters/default/apply', [applied, definitionSet, this]);

        },
        getContext: function () {
            if (this._currentContext.CurrentGroupID === null) {
                this.requestContext();
            }

            this.buildCurrentEntityContext();
            return this._currentContext;
        },
        requestContext: function () {
            if (this._isRetrievingContext === true) {
                return;
            }
            //this.setContext('activityTab', 'Activity Tab');
        },
        setContext: function (id, name) {
            this._currentContext.CurrentGroupID = id;
            this._currentContext.CurrentName = name;
            this._setListConfig();
            this.buildCurrentEntityContext();
            this._isRetrievingContext = false;
            this.onContextSet(this._currentContext);
        },
        isContextRequired: function () {
            return !(Sage && Sage.Groups && Sage.Groups._groupContext);
        },
        setCurrentGroup: function (id, name, keyField) {
            if (this._currentContext.CurrentGroupID === id) {
                return;
            }
            if (!name || !keyField) {
                this._currentContext.CurrentGroupID = id;
                this._currentContext.CurrentName = false;
                this.buildCurrentEntityContext();  //this sets the keyField and name
                name = this._currentContext.CurrentName;
            } else {
                this._currentContext.CurrentTableKeyField = keyField;
            }
            this.setContext(id, name);
            this.onCurrentGroupChanged({ current: this._currentContext });
        },
        _onDefaultFilterLoad: function (onSuccessCallBack) {
            var context = this.getContext(),
                service = SDataServiceRegistry.getSDataService('system'),
                request,
                entry = {
                    '$name': 'getEntityFilters',
                    'request': {
                        'entityName': context.CurrentEntity,
                        'key': context.CurrentGroupID
                    }
                };
            request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                .setOperationName('getEntityFilters');

            request.execute(entry, {
                success: lang.hitch(this, function (result) {
                    try {
                        if (result.response.appliedFilterInfo) {
                            this._currentContext.AppliedFilterInfo.applied = result.response.appliedFilterInfo.applied;
                            this._currentContext.AppliedFilterInfo.definitionSet = result.response.appliedFilterInfo.definitionSet;
                            if (onSuccessCallBack) {
                                onSuccessCallBack();
                            }
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }),
                failure: function (result) {
                    console.error(result);
                },
                async: false
            });
        },
        _onDefaultFilterRefresh: function (applied, definitionSet, filterManager) {
            var context = this.getContext(),
                service = SDataServiceRegistry.getSDataService('system'),
                entry = {
                    '$name': 'applyFilterToEntity',
                    'request': {
                        'entityName': context.CurrentEntity,
                        'filter': dojo.toJson(filterManager.createValueSet()),
                        'key': context.CurrentGroupID
                    }
                },
                request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                .setOperationName('applyFilterToEntity');

            request.execute(entry, {});
        },

        getStaticTabs: function () {
            return this.groupConfigTypes;
        },

        _saveToLocalStorage: function (key, value, namespace) {

            this._saveToSessionStorage(key, value, namespace);
            return;
            /*var localStore = new LocalStorageProvider();
            if (!namespace) {
            namespace = this._LOCALSTORE_NAMESPACE;
            }
            localStore.initialize();
            localStore.put(key, value, function (status, key, message) {
            if (status === localStore.FAILED) {
            console.error('Failed writing key: ' + key + ' in local storage. Message: ' + message);
            }
            }, namespace);
            */
        },
        _getFromLocalStorage: function (key, namespace) {

            return this._getFromSessionStorage(key, namespace);
            /*
            var localStore = new LocalStorageProvider();
            localStore.initialize();
            if (!namespace) {
            namespace = this._LOCALSTORE_NAMESPACE;
            }
            return localStore.get(key, namespace); // returns null if key does not exist. 
            */
        },
        _getFromSessionStorage: function (key, namespace) {
            if (!namespace) {
                namespace = this._LOCALSTORE_NAMESPACE;
            }
            var storeKey = namespace + "_" + key;
            return sessionStorage.getItem(storeKey);
        },
        _saveToSessionStorage: function (key, value, namespace) {
            if (!namespace) {
                namespace = this._LOCALSTORE_NAMESPACE;
            }
            var storeKey = namespace + "_" + key;
            sessionStorage.setItem(storeKey, value);
        },

        _getDefaultTabId: function () {

            var defaultTabId = 'activities',
                urlTab = this._getUrlTabId(),
                activityService;

            if (urlTab) {
                urlTab = this._validateTabId(urlTab);
                if (urlTab) {
                    return urlTab;
                }
            }
            var lastTab = this._getFromLocalStorage(this._STORE_KEY_LASTAB);
            if (lastTab) {
                defaultTabId = lastTab;
            } else {
                activityService = Sage.Services.getService('ActivityService');
                if (activityService) {
                    defaultTabId = activityService.getDefaultActivityManagerTabId();
                }
            }
            //double check to make sure we really do have a config for this tab...
            if (!this._configsHash) {
                for (var i = 0; i < this.groupConfigTypes; i++) {
                    if (defaultTabId === this.groupConfigTypes[i]['key']) {
                        return defaultTabId;
                    }
                }
            }
            return defaultTabId;
        },
        _getUrlTabId: function () {
            var tabId = false,
                regexS = "[\\?&]tabId=([^%#]*)",
                regex = new RegExp(regexS),
                results = regex.exec(window.location.href);

            if (results !== null) {
                tabId = results[1];
            }

            return tabId;
        },
        _validateTabId: function (tabId) {
            if (tabId) {
                for (var i = 0; i < this.groupConfigTypes.length; i++) {
                    var cfg = this.groupConfigTypes[i];
                    if (cfg.key.toUpperCase() === tabId.toUpperCase()) {
                        return cfg.key;
                    }
                }
            }
            return null;
        },
        onTabConfigCreated: function (tabConfig) { }
    });
    if (!Sage.Services.hasService('ClientGroupContext')) {
        Sage.Services.addService('ClientGroupContext', new activityGroupContextService());

    } else {
        var actSvc = Sage.Services.getService('ClientGroupContext');
        if (actSvc.declaredClass !== 'Sage.MainView.ActivityMgr.ActivityGroupContextService') {
            actSvc.unsubscribeConnects();
            Sage.Services.removeService('ClientGroupContext');
            Sage.Services.addService('ClientGroupContext', new activityGroupContextService());
        }
    }

    return activityGroupContextService;
});