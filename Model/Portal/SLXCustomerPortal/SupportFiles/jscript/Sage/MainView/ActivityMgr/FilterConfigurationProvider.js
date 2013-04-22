/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Services/_ServiceMixin',
        'Sage/_ConfigurationProvider',
        'Sage/Utility',
        'Sage/Utility/Activity',
        'Sage/Data/SDataStore',
        'Sage/Services/ActivityService',
        'Sage/MainView/ActivityMgr/ActivityGroupContextService',
        'dijit/registry',
        'dojo/_base/declare',
        'Sage/Utility/Filters',
        'dojo/_base/lang',
        'dojo/json'
    ],
function (
        _ServiceMixin,
        _ConfigurationProvider,
        SageUtility,
        UtilityActivity,
        SDataStore,
        ActivityService,
        ActivityGroupContextService,
        registry,
        declare,
        FiltersUtility,
        lang,
        json
    ) {
    var FilterConfigurationProvider = declare('Sage.MainView.ActivityMgr.FilterConfigurationProvider', [_ConfigurationProvider, _ServiceMixin], {
        _configuration: null,
        _hasLayoutConfiguration: false,
        _hasFilterHiddenConfiguration: false,
        _currentUserId: false,
        serviceMap: {
            'groupContextService': 'ClientGroupContext',
            'metaDataService': { type: 'sdata', name: 'metadata' },
            'systemDataService': { type: 'sdata', name: 'system' }
        },
        constructor: function (options) {
            this.inherited(arguments);

            if (this.groupContextService.declaredClass !== 'Sage.MainView.ActivityMgr.ActivityGroupContextService') {
                Sage.Services.removeService('ClientGroupContext');
                this.groupContextService = new ActivityGroupContextService();
                Sage.Services.addService('ClientGroupContext', this.groupContextService);
            }

            var clientContextSvc = Sage.Services.getService('ClientContextService');
            if (clientContextSvc) {
                if (clientContextSvc.containsKey("userID")) {
                    this._currentUserId = clientContextSvc.getValue("userID");
                }
            }
            this._subscribes.push(dojo.subscribe('/group/context/changed', this, this._onGroupContextChanged));

            // todo: subscribe to filter reload to capture state?
        },
        _onGroupContextChanged: function () {
            this.onConfigurationChange();
        },
        onConfigurationChange: function () {
        },
        _createConfiguration: function (entry, options) {
            var currentListConfig = this.groupContextService.getCurrentListConfig();
            this._configuration = currentListConfig.getFilterConfig(this.metaDataService, entry, options);
            if (!this._configuration) {

                this._configuration = {};
            }

            this._configuration.getFilterManager = function () {
                var listPanel = registry.byId('list');
                return listPanel && listPanel.get('filterManager');
            };

            this._hasLayoutConfiguration = true;
        },
        requestConfiguration: function (options) {
            this._configuration = {};
            this._hasLayoutConfiguration = false;
            this._hasFilterHiddenConfiguration = false;

            this._onRequestConfigurationSuccess(options, null);
            this._getHiddenFilters(options);
        },
        _onRequestConfigurationSuccess: function (options, entry) {
            this._createConfiguration(entry, options);
            this._callOptionsSuccess(options);
        },
        _onRequestConfigurationFailure: function (options, response) {
            if (options.failure) {
                options.failure.call(options.scope || this, response, options, this);
            }
        },
        getFilterFormatter: function (filter) {
            if (filter) {
                if (filter.filterName === 'Duration') {
                    return UtilityActivity.formatDuration;
                }
            }
            return false;
        },
        ModifyFilterQuery: function (filter, query) {
            var hasQuery = false;
            if (query) {
                hasQuery = true;
            }
            if (filter.propertyName === 'Activity.Duration') {
                if (hasQuery) {
                    query = '(' + query + ') and (Activity.Timeless ne true)';
                } else {
                    query = '(Activity.Timeless ne true)';
                }
            } else if (filter.propertyName === 'Duration') {
                if (hasQuery) {
                    query = '(' + query + ') and (Timeless ne true)';
                } else {
                    query = '(Timeless ne true)';
                }
            }
            return query;
        },
         _getHiddenFilters: function (options) {
            var key = this._getHiddenFiltersKey();
            if (key) {
                FiltersUtility.getHiddenFilters(key,
                    lang.hitch(this, this._onHiddenFiltersFetchComplete, options || {}),
                    function (err) {
                        console.error(err);
                    }
                );
            }
        },
        _getHiddenFiltersKey: function () {
            var key = FiltersUtility.getHiddenFiltersKey();
            return key;
        },
        _onHiddenFiltersFetchComplete: function (options, result) {
            if (result && result.response && result.response.value) {
                this._configuration._hiddenFilters = json.parse(result.response.value);
                // Getting a key without data will return "[]"
                if (this._configuration._hiddenFilters && this._configuration._hiddenFilters.constructor === Array) {
                    this._configuration._hiddenFilters = {};
                }
            }

            this._configuration._hiddenFiltersKey = this._getHiddenFiltersKey();

            this._hasFilterHiddenConfiguration = true;
            this._callOptionsSuccess(options);
        },
        _callOptionsSuccess: function (options) {
            if (!this._hasLayoutConfiguration || !this._hasFilterHiddenConfiguration) {
                return;
            }

            if (options.success) {
                options.success.call(options.scope || this, this._configuration, options, this);

                this._hasLayoutConfiguration = false;
                this._hasFilterHiddenConfiguration = false;
            }
        }
    });
    return FilterConfigurationProvider;
});