/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Services/_ServiceMixin',
        'Sage/_ConfigurationProvider',
        'Sage/Data/GroupLayoutSingleton',
        'Sage/Data/SDataStore',
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dijit/registry',
        'dojo/string',
        'Sage/Utility/Filters',
        'dojo/json'
], function (
        _ServiceMixin,
        _ConfigurationProvider,
        GroupLayoutSingleton,
        SDataStore,
        declare,
        lang,
        registry,
        dString,
        FiltersUtility,
        json) {
    var widget = declare('Sage.UI.Filters.GroupFilterConfigurationProvider', [_ConfigurationProvider, _ServiceMixin], {
        FILTER_COUNT: 150,
        _configuration: null,
        _hasLayoutConfiguration: false,
        _hasFilterHiddenConfiguration: false,
        serviceMap: {
            'groupContextService': 'ClientGroupContext',
            'metaDataService': { type: 'sdata', name: 'metadata' },
            'systemDataService': { type: 'sdata', name: 'system' }
        },
        constructor: function (options) {
            this.inherited(arguments);
            this._subscribes.push(dojo.subscribe('/group/context/changed', this, this._onGroupContextChanged));

            // todo: subscribe to filter reload to capture state?
        },
        _onGroupContextChanged: function () {
            this.onConfigurationChange();
        },
        onConfigurationChange: function () {
        },
        _createConfiguration: function (entry, options) {
            var layout = entry && entry.layout,
                properties = [],
                captions = [],
                i = 0,
                groupContext = this.groupContextService && this.groupContextService.getContext(),
                groupId = groupContext && groupContext.CurrentGroupID,
                entityName = groupContext && groupContext.CurrentEntity,
                systemService = this.systemDataService,
                metaService = this.metaDataService,
                request, where;

            for (i = 0; i < layout.length; i++) {
                properties.push('"' + layout[i].propertyPath + '"');
                captions.push('"' + layout[i].caption + '"');
            }


            request = new Sage.SData.Client.SDataResourcePropertyRequest(metaService);
            request.setResourceKind('entities');
            request.setResourceSelector('"' + entityName + '"');
            request.setResourceProperty('filters');
            request.setQueryArg('count', this.FILTER_COUNT);

            if (entityName === 'User') {
                // This is a hack to get custom filters not in the layout (Roles and Teams).
                captions.push('"Role"');
                captions.push('"Team"');
            }

            where = dString.substitute('filterType ne "analyticsMetric" and (propertyName in (${0}) or displayName in (${1}))', [properties.join(','), captions.join(',')]);
            request.setQueryArg('where', where);

            this._configuration.store = new SDataStore({
                executeReadWith: 'readFeed',
                request: request
            });

            this._configuration.createStoreForFilter = function (filter) {
                var request = new Sage.SData.Client.SDataResourcePropertyRequest(systemService);
                request.setResourceKind('groups');
                request.setResourceSelector('"' + groupId + '"');
                request.setResourceProperty('$queries/executeMetric');
                request.setQueryArg('_filterName', filter.filterName);
                request.setQueryArg('orderby', 'displayName');
                return filter && filter.filterName ? new SDataStore({
                    executeReadWith: 'readFeed',
                    request: request
                }) : null;
            };

            this._configuration.getFilterManager = function () {
                var listPanel = registry.byId('list');
                return listPanel && listPanel.get('filterManager');
            };

            this._configuration.groupId = groupId;
        },
        requestConfiguration: function (options) {
            this._configuration = {};
            this._hasLayoutConfiguration = false;
            this._hasFilterHiddenConfiguration = false;

            var singleton = new GroupLayoutSingleton(),
                group = this.getCurrentGroup(),
                onGroupLayoutSuccess = lang.hitch(this, this._onRequestConfigurationSuccess, options || {}),
                onGroupLayoutFail = lang.hitch(this, this._onRequestConfigurationFailure, options || {});

            singleton.getGroupLayout(this.formatPredicate(group), onGroupLayoutSuccess, onGroupLayoutFail, group.$key);
            this._getHiddenFilters(options);
        },
        formatPredicate: function (group) {
            return "'" + group.$key + "'";
        },
        getCurrentGroup: function () {
            var groupContext = this.groupContextService && this.groupContextService.getContext(),
                family = groupContext && groupContext.CurrentFamily,
                name = groupContext && groupContext.CurrentName,
                id = groupContext && groupContext.CurrentGroupID;
            return {
                name: name,
                family: family,
                $key: id
            };
        },
        _onRequestConfigurationSuccess: function (options, entry) {
            this._createConfiguration(entry, options);
            this._hasLayoutConfiguration = true;
            this._callOptionsSuccess(options);
        },
        _onRequestConfigurationFailure: function (options, response) {
            if (options.failure) {
                options.failure.call(options.scope || this, response, options, this);
            }
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
    return widget;
});