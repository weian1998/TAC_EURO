/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'dijit/_Container',
        'Sage/_Templated',
        'Sage/Services/_ServiceMixin',
        'Sage/_ConfigurationProvider',
        'Sage/UI/Filters/CheckBoxFilter',
        'Sage/UI/Filters/LookupFilter',
        'Sage/UI/Filters/EditFilters',
        'dojo/_base/declare',
        'dojo/i18n',
        'dojo/_base/array',
        'dojo/_base/lang',
        'dojo/query',
        'dojo/on',
        'dojo/i18n!./nls/FilterPanel',
        'dojo/has',
        'dojo/_base/sniff',
        'dojo/ready',
        'dojo/json'
    ], function (
        _Widget,
        _Container,
        _Templated,
        _ServiceMixin,
        _ConfigurationProvider,
        CheckBoxFilter,
        LookupFilter,
        EditFilters,
        declare,
        i18n,
        array,
        lang,
        query,
        on,
        nls,
        has,
        sniff,
        ready,
        json
    ) {
        var widget = declare('Sage.UI.Filters.FilterPanel', [_Widget, _Container, _ServiceMixin, _Templated], {
            serviceMap: {
                'groupContextService': 'ClientGroupContext',
                'metaDataService': {
                    type: 'sdata',
                    name: 'metadata'
                }
            },
            knownFilterTypes: {
                'checkedList': CheckBoxFilter,
                'comboWithArgument': LookupFilter
            },
            widgetsInTemplate: false,
            widgetTemplate: new Simplate([
            '<div class="filter-panel" data-dojo-attach-point="containerNode">',
            '<div class="filter-edit"><a href="#" data-dojo-attach-point="clearAllFiltersNode">{%= $.clearText %}</a> | <a href="#" data-dojo-attach-point="editFiltersNode">{%= $.editText %}</a></div>',
            '<div class="filter-summary" data-dojo-attach-point="filterSummaryNode">{%= $.noneText %}</div>', // TODO
            '</div>'
        ]),
            _filterGroup: null,
            _filterSubscriptions: null,
            _configuration: null,
            _configurationConnects: null,
            _configurationProvider: null,
            _configurationProviderType: null,
            _appliedSet: null,
            configurationProvider: null,
            configurationProviderType: null,
            autoConfigure: true,
            store: null,
            filterGroup: 'default',
            filterManager: null,
            _appliedFilters: null,
            _isApplyingConfig: false,
            // filter editor
            _editFilters: null,
            _editFiltersHandle: null,
            _isFetchingData: false,

            // i18n
            editText: 'Edit Filters',
            noneText: 'No filters selected.',
            clearText: 'Clear All',

            constructor: function () {
                var filterStore = Sage.Utility.getValue(window, 'Sage.UI.DataStore.Filters');

                if (filterStore && filterStore[this.filterGroup]) {
                    this._appliedSet = filterStore[this.filterGroup].applied;
                }

                if (nls) {
                    this.editText = nls.editText;
                    this.noneText = nls.noneText;
                    this.clearText = nls.clearText;
                }

                this._appliedFilters = [];
            },
            postCreate: function () {
                this.inherited(arguments);
                this.startup();
            },
            startup: function () {
                this.inherited(arguments);
                if (!this._configurationProvider && this._configurationProviderType) {
                    this.set('configurationProvider', new this._configurationProviderType());
                }
                if (this.autoConfigure) {
                    this.requestConfiguration();
                }
            },
            uninitialize: function () {
                this.inherited(arguments);

                if (this._editFilters) {
                    this._editFilters.destroy();
                    this._editFiltersHandle.remove();
                }

                if (this._configurationProvider) {
                    this._configurationProvider.destroy();
                }
            },
            _setFilterGroupAttr: function (value) {
                if (this._filterSubscriptions) {
                    dojo.forEach(this._filterSubscriptions, function (subscription) {
                        this.unsubscribe(subscription);
                    }, this);
                }

                this._filterGroup = value;
                this._filterSubscriptions = [];
                this._filterSubscriptions.push(
                this.subscribe(dojo.string.substitute("/ui/filters/${0}/apply", [this._filterGroup]), lang.hitch(this, this._onApply)));

                this._filterSubscriptions.push(
                this.subscribe(dojo.string.substitute("/ui/filters/${0}/change", [this._filterGroup]), lang.hitch(this, this._onChange)));
            },
            _getFilterGroupAttr: function () {
                return this._filterGroup;
            },
            _onChange: function (definition, name, value, source) {
                var updated = false,
                appliedFilter,
                lookupFilter = false;
                if ((definition.details.lookupFilter)||(definition.details.userLookupFilter)) {                    
                    lookupFilter = true;
                    if (value !== null) {
                        if(value.hasOwnProperty("value")){
                            if ((value.value === null) || (value.value === '')) {
                                updated = true;
                            }
                        }else{
                            if ((value === null) || (value === '')) {
                                updated = true;
                            }
                        } 
                    } 
                }
                array.forEach(this._appliedFilters, function (filter, i) {
                    var hasItem = false;
                    // If we have an existing filter in the collection,
                    // update its selected items.
                    if (filter.filterName === definition.filterName) {
                        appliedFilter = this._appliedFilters[i];
                        hasItem = array.some(appliedFilter.items, function (item) {
                            return item === name;
                        });

                        if (hasItem) {
                            if (lookupFilter) {
                                if (value === null) {

                                } else {
                                    if((value.value === null) ||(value.value === '')){
                                        //clear items
                                        appliedFilter.items = [];
                                        this._appliedFilters.splice(i, 1);
                                    } 
                                }
                            }
                            else {
                                array.forEach(appliedFilter.items, function (item, x) {
                                    if (item === name) {
                                        appliedFilter.items.splice(x, 1);
                                    }
                                }, this);
                            }
                        } else {
                            appliedFilter.items.push(name);
                        }

                        updated = true;
                    }
                }, this);

                // Did we update the exising filter?
                if (!updated) {
                    this._appliedFilters.push({ 'filterName': definition.filterName, 'displayName': definition.$descriptor || definition.displayName, items: [name] });
                }

                this._updateFilterSummary();
            },
            _updateFilterSummary: function () {
                var displayItems = [];
                array.forEach(array.filter(this._appliedFilters,
                    function (filter) {
                        return (typeof filter.displayName !== 'undefined' && filter.displayName !== '') && (filter.items && filter.items.length > 0);
                    }),
                    function (filter) {
                        displayItems.push(filter.displayName + " (" + filter.items.length + ")");
                    },
                    this
                );

                if (displayItems.length === 0) {
                    this.filterSummaryNode.innerHTML = this.noneText;
                } else {
                    this.filterSummaryNode.innerHTML = displayItems.join(', ');
                }
            },
            _onApply: function (applied, definitionSet, source) {
                var key,
                items,
                itemProp,
                definition;

                //Lets check an make sure that the appliedInfo belongs to the curent group.
                //If not Ignore and return.
                if (source && this._configuration) {
                    var context = source.getContext();
                    if (context.CurrentGroupID.toUpperCase() !== this._configuration.groupId.toUpperCase()) {
                        return;
                    }
                }

                this._appliedFilters = [];
                this._appliedSet = applied;
                var hasProperties = false;
                for (key in this._appliedSet) {
                    if (this._appliedSet.hasOwnProperty(key)) {
                        hasProperties = true;
                        // definitionSet object shares the same prop as applied
                        definition = definitionSet[key];
                        items = this._appliedSet[key];
                        if (definition.details.lookupFilter) {
                            if (items.hasOwnProperty("value")) {
                                this._onChange(definition, definition.filterName, items.value);
                            }
                        }
                        else {

                            // Iterate the filter items that are selected for this set,
                            // pass it to _onChange so we can update our summary.
                            for (itemProp in items) {
                                if (items.hasOwnProperty(itemProp)) {
                                    this._onChange(definition, itemProp);
                                }
                            }
                        }
                    }

                }
                if ((this._configuration)) {
                    this.requestData();
                }
            },
            _handleConfigurationChange: function () {
                this.requestConfiguration();
            },
            _setConfigurationProviderAttr: function (configurationProvider) {
                if (this._configurationConnects) {
                    dojo.forEach(this._configurationConnects, function (connection) {
                        this.disconnect(connection);
                    }, this);
                }

                if (this._configurationProvider && this._configurationProvider !== configurationProvider) {
                    this._configurationProvider.destroy();
                }

                this._configurationProvider = configurationProvider;
                this._configurationConnects = [];

                if (this._configurationProvider) {
                    this._configurationConnects.push(this.connect(this._configurationProvider, 'onConfigurationChange', this._handleConfigurationChange));

                    this._configurationProvider.set('owner', this);

                    // only request configuration here if the widget has been fully created, otherwise
                    // it will be handled by postCreate.
                    if (this._created) {
                        if (this.autoConfigure) {
                            this.requestConfiguration();
                        }
                    }
                }
            },
            _getConfigurationProviderAttr: function () {
                return this._configurationProvider;
            },
            _setConfigurationProviderTypeAttr: function (value) {
                this._configurationProviderType = value;
            },
            _getConfigurationProviderTypeAttr: function () {
                return this._configurationProviderType;
            },
            requestConfiguration: function () {
                if (this._configurationProvider && !this._isApplyingConfig) {
                    this._isApplyingConfig = true;
                    this._configurationProvider.requestConfiguration({
                        success: lang.hitch(this, this._applyConfiguration)
                    });
                }
            },
            _applyConfiguration: function (configuration) {
                //this._updateFilterSummary();
                this._configuration = configuration;
                this.store = configuration.store;
                this.filterManager = configuration.getFilterManager();

                if (this._editFilters) {
                    this._editFilters.destroy();
                    this._editFiltersHandle.remove();
                }

                this._editFilters = new EditFilters({
                    store: this.store,
                    filterPanel: this
                });

                this._editFiltersHandle = on(this.editFiltersNode, 'click', lang.hitch(this, function () {
                    this._editFilters.showDialog();
                }));

                on(this.clearAllFiltersNode, 'click', lang.hitch(this, this._clearAllFilters));
                //Need to clear the Previous filters.

                this._appliedSet = {};
                this._appliedFilters = [];
                this._updateFilterSummary();
                if (this._appliedSet) {
                    this.requestData(function () {
                        var service = Sage.Services.getService("ClientGroupContext");
                        service.publishFiltersApplied();
                    });
                }

                this._ensureApplyFilterWasPublished();
            },
            _ensureApplyFilterWasPublished: function () {
                // Hack: If we missed the filters/apply event, we will force the group context service to fire it.
                // This problem is in ListPanel as well.
                var service, context;
                service = Sage.Services.getService('ClientGroupContext');
                context = service && service.getContext();
                if (context && context.AppliedFilterInfo) {
                    service.publishFiltersApplied(context.AppliedFilterInfo);
                }
            },
            _clearAllFilters: function () {
                // De-select all selected filters.
                var q = query('li.filter-selected', this.containerNode),
                evt;
                array.forEach(q, function (node) {
                    if (node.click) {
                        node.click();
                    } else {
                        evt = document.createEvent('MouseEvents');
                        evt.initMouseEvent('click', true, true, window,
                        0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        node.dispatchEvent(evt);
                    }
                });

                q = query('.filter-lookup-input input', this.containerNode);
                array.forEach(q, function (node) {
                    if (node.value) {
                        node.value = '';

                        if (has('ie') < 9) {
                            // IE
                            node.fireEvent('onkeydown');
                        } else {
                            evt = document.createEvent('KeyboardEvent');
                            if (evt.initKeyEvent) {
                                evt.initKeyEvent('keydown', true, true,
                                null, false, false, false, false, 13, 0);
                            } else {
                                evt.initKeyboardEvent('keydown', true, true,
                                null, 13, null, null, 1, null);
                            }

                            node.dispatchEvent(evt);
                        }
                    }
                });
            },
            refreshFilters: function (keepSelected) {
                this._refreshing = true;
                if (keepSelected !== true) {
                    this._clearAllFilters();
                }
                this.requestConfiguration();
            },
            requestData: function (onRequestComplete) {
                if (this._isFetchingData) {
                    return;
                }

                this._isFetchingData = true;
                this.destroyDescendants();

                var cacheKey, service, context, cacheData, data;

                service = Sage.Services.getService("ClientGroupContext");
                context = service && service.getContext();
                cacheKey = "METADATA_FILTERS_" + context.CurrentGroupID;

                cacheData = sessionStorage.getItem(cacheKey);
                if (cacheData) {
                    data = json.parse(cacheData);
                    this._iterateFetchedItems(data);
                    if (onRequestComplete) {
                        onRequestComplete();
                    }
                } else {
                    this.store.fetch({
                        onError: lang.hitch(this, this._onFetchError),
                        onComplete: lang.hitch(this, this._onFetchComplete, cacheKey, onRequestComplete)
                    });
                }
            },
            onRequestDataFailure: function (response) {
            },
            _onFetchError: function () {
                this._isFetchingData = false;
            },
            _onFetchItem: function (entry) {
                var data = this._configuration._hiddenFilters || {},
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                prop = context.CurrentEntity + '_' + entry.filterName,
                hidden = false,
                type = entry.filterType,
                expanded = false;

                if (data[prop]) {
                    hidden = data[prop].hidden;
                    expanded = data[prop].expanded;
                }

                if (this.knownFilterTypes[type]) {
                    // Load filter if nothing is in storage for it,
                    // or a user set to visible.
                    if (hidden === false || typeof hidden === 'undefined' || hidden === null) {
                        this.addChild(new this.knownFilterTypes[type]({
                            configurationProvider: this._configurationProvider,
                            filter: entry,
                            store: this._configuration.createStoreForFilter(entry),
                            appliedValues: this._appliedSet && this._appliedSet[entry.$key],
                            parent: this,
                            groupId: context.CurrentGroupID,
                            expanded: expanded
                        }));
                    }
                }
            },
            _onFetchComplete: function (cacheKey, onReqestCompleteCallBack, items) {
                sessionStorage.setItem(cacheKey, json.stringify(items));
                this._iterateFetchedItems(items);
                if (onReqestCompleteCallBack) {
                    onReqestCompleteCallBack();
                }
            },
            _iterateFetchedItems: function (items) {
                if (!items || !items.length) {
                    return;
                }

                var i, length;
                length = items.length;

                for (i = 0; i < length; i++) {
                    this._onFetchItem(items[i]);
                }
                this._isFetchingData = false;
                this._isApplyingConfig = false;
            }
        });

        return widget;
    });
