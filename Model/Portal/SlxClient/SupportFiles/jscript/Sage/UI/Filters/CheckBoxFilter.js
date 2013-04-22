/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'dijit/_Contained',
       'dojo/NodeList-traverse',
       'Sage/_Templated',
       'Sage/Services/_ServiceMixin',
       'Sage/_ActionMixin',
       'dojo/string',
       'dojo/on',
       'dojo/_base/lang',
       'dojo/dom-construct',
       './EditFilterItems',
       'dojo/_base/array',
       'dojo/query',
       'dojo/dom-attr',
       'dojo/i18n!./nls/CheckBoxFilter',
       'Sage/Utility',
       'Sage/Utility/Filters',
       'dojo/json',
       'dijit/registry',
       'dojo/_base/declare'
],
function (
        _Widget,
        _Contained,
        NodeList,
        _Templated,
        _ServiceMixin,
        _ActionMixin,
        dString,
        on,
        lang,
        domConstruct,
        EditFilterItems,
        array,
        query,
        domAttr,
        nls,
        Utility,
        FiltersUtility,
        json,
        registry,
        declare) {
    var widget = declare('Sage.UI.Filters.CheckBoxFilter', [_Widget, _Contained, _ServiceMixin, _ActionMixin, _Templated], {
        attributeMap: {
            'content': { node: 'listNode', type: 'innerHTML' }
        },
        serviceMap: {
            'groupContextService': 'ClientGroupContext',
            'systemDataService': { type: 'sdata', name: 'system' }
        },
        widgetsInTemplate: false,
        widgetTemplate: new Simplate([
            '<div class="filter-type-checkbox filter-collapsed">',
                '<h3 data-action="toggleExpand" data-dojo-attach-point="filterNameNode">{%: $.filter.displayName || $.filter.filterName %}',
                '</h3>',
                '<ul class="filter-loading-indicator"><li><span>{%: $.loadingText %}</span></li></ul>',
                '<a href="#" class="filter-clear" data-dojo-attach-point="clearLinkNode">{%: $.clearText %}</a>',
                '<span class="filter-sep" data-dojo-attach-point="linkSep"> | </span>',
                '<a href="#" class="filter-edit-items" data-dojo-attach-point="moreLinkNode">{%: $.moreText %}</a>',
                '<ul class="filter-list" data-dojo-attach-point="listNode"></ul>',
            '</div>'
        ]),
        itemTemplate: new Simplate([
            '<li data-action="toggleSelect" class="{%= $.selected ? "filter-selected" : "" %}" data-name="{%= $.name %}" data-selected="{%= !!$.selected %}">',
            '<div>',
            '<span class="p-selection">&nbsp;</span>',
            '<span class="p-label">{%: $$._formatLabelText($.$descriptor, $.name) %}</span>',
            '{% if ($.value > -1) { %}',
            '&nbsp;<span class="p-spacer">(</span>',
            '<span class="p-count">{%: $.value %}</span>',
            '<span class="p-spacer"> {%: $.ofText %} </span>',
            '<span class="p-total">{%: $.value %}</span>',
            '<span class="p-spacer">)</span>',
            '{% } %}',
            '</div>',
            '</li>'
        ]),
        _activeFilterCount: 0,
        _loaded: false,
        _selected: null,
        _ranges: null,
        _filterGroup: null,
        _filterSubscriptions: null,
        appliedValues: null,
        parent: null,
        _originalActiveFilter: '',

        // i18n
        loadingText: 'Loading...',
        moreText: 'Add/Remove Items',
        clearText: 'Clear',
        emptyText: '(empty)',
        nullText: '(null)',
        ofText: 'of',
        // end i18n

        nullName: 'SLX_NULL',
        emptyName: 'SLX_EMPTY',

        filterGroup: 'default',
        filter: null,
        store: null,
        editFilterItems: null,
        editFilterItemsHandle: null,
        output: null,
        entries: [],
        expanded: false,
        FILTER_UPDATE_DELAY: 1000,
        lazyUpdateCounts: null,

        // Paging
        count: 1000,
        loading: true,
        groupId: '',
        constructor: function () {
            this.inherited(arguments);
            this.output = [];
            this.entries = [];
            lang.mixin(this, nls);
        },
        postMixInProperties: function () {
            this.inherited(arguments);

            this._selected = {};

            var rangeFilter = this._isRangeFilter();
            if (rangeFilter) {
                this.store.request.setQueryArg('orderby', '');
                this.compileRanges(rangeFilter.ranges);
            }

            if (this.expanded) {
                this.expanded = false; // toggleExpand will flip this
                setTimeout(lang.hitch(this, this._toggleExpand), 500);
            } else if (this.appliedValues) {
                setTimeout(lang.hitch(this, this._loadItems), 500);
            }

            if (this.store && this.store.request && this.store.request.getQueryArg) {
                this._originalActiveFilter = this.store.request.getQueryArg('_activeFilter');
            }
        },
        postCreate: function () {
            this.inherited(arguments);

            var hasFormatter = false;
            if (this.configurationProvider.getFilterFormatter) {
                var formatter = this.configurationProvider.getFilterFormatter(this.filter);
                if (formatter) {
                    hasFormatter = true;
                }
            }

            if (!this._isDistinctFilter() || hasFormatter) {
                domConstruct.destroy(this.moreLinkNode);
                domConstruct.destroy(this.linkSep);
            } else {
                this.editFilterItemsHandle = on(this.moreLinkNode, 'click', lang.hitch(this, this._moreLinkClicked));
            }

            on(this.clearLinkNode, 'click', lang.hitch(this, this._clearLinkClicked));

            var id = this.filter.$key + '_editFilterItems',
                editor = registry.byId(id);
            this.editFilterItems = editor || new EditFilterItems({
                id: id,
                store: this.store,
                filter: this.filter,
                filterPanel: this.parent,
                parent: this
            });
        },
        _clearLinkClicked: function () {
            // De-select selected filters.
            var q = query('li.filter-selected', this.listNode),
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
        },
        _moreLinkClicked: function (e) {

            if (this._originalActiveFilter) {
                this.editFilterItems.baseFilter = this._originalActiveFilter;
            }

            this.editFilterItems.showDialog();
            e.cancelBubble = true;
        },
        uninitialize: function () {
            this.inherited(arguments);

            if (this.editFilterItems) {
                this.editFilterItems.destroy(false);

            }

            if (this.editFilterItemsHandle) {
                this.editFilterItemsHandle.remove();
            }
        },
        _setFilterGroupAttr: function (value) {
            if (this._filterSubscriptions) {
                array.forEach(this._filterSubscriptions, function (subscription) {
                    this.unsubscribe(subscription);
                }, this);
            }

            this._filterGroup = value;
            this._filterSubscriptions = []; // we do not listen to reload, as reload will destroy this widget
            this._filterSubscriptions.push(
                this.subscribe(dString.substitute("/ui/filters/${0}/change", [this._filterGroup]), this._onChange),
                this.subscribe(dString.substitute("/ui/filters/${0}/clear", [this._filterGroup]), this._onClear),
                this.subscribe(dString.substitute("/ui/filters/${0}/refresh", [this._filterGroup]), lang.hitch(this, this._onRefresh)));
        },
        _onRefresh: function (applied, definitionSet, filterManager) {
            this.appliedValues = applied;
            this.updateCounts();
        },
        _updateActiveFilters: function () {
            var filterManager = this._getFilterManager(),
                queryParts = [],
                q = false;

            if (filterManager) {
                q = filterManager.createQuery();
            }

            if (!this.expanded) {
                return;
            }

            if (q === false) {
                q = '';
            } else {
                queryParts.push(q);
            }

            if (this._originalActiveFilter) {
                queryParts.push(this._originalActiveFilter);
            }

            if (queryParts.length > 1) {
                q = queryParts.join(' AND ');
            } else {
                q = queryParts.join('');
            }

            this.store.request.setQueryArg('_activeFilter', q);
        },
        refresh: function () {
            // Force a refresh if we have already loaded
            if (this._loaded) {
                array.forEach(query('*', this.listNode), function (item) {
                    domConstruct.destroy(item);
                });

                this.requestData();
            }
        },
        _onChange: function (definition, name, value, source) {
            // todo: save value if we are not expanded
            name = this._transformFilterItemName(name);
            if (source !== this && definition.$key === this.filter.$key) {
                query(dString.substitute('> [data-name="${0}"]', [name]), this.listNode).forEach(function (el) {
                    dojo.attr(el, 'data-selected', (!!value).toString());
                    dojo.toggleClass(el, 'filter-selected', !!value);
                });
            }
        },
        _onClear: function (definition, source) {
            if (source !== this && (!definition || definition.$key === this.filter.$key)) {
                dojo.query('> [data-selected="true"]', this.listNode).forEach(function (el) {
                    dojo.attr(el, 'data-selected', 'false');
                    dojo.toggleClass(el, 'filter-selected', false);
                });
            }
        },
        _getFilterGroupAttr: function () {
            return this._filterGroup;
        },
        _formatLabelText: function (value, name) {
            if (name === this.nullName) {
                return this.nullText;
            } else if (name === this.emptyName) {
                return this.emptyText;
            }

            if (this.configurationProvider) {
                if (this.configurationProvider.getFilterFormatter) {
                    var formatter = this.configurationProvider.getFilterFormatter(this.filter);
                    if (formatter) {
                        return formatter(value);
                    }
                }
            }

            return value;
        },
        _isDistinctFilter: function () {
            return this.filter &&
                   this.filter.details &&
                   this.filter.details.distinctFilter;
        },
        _isRangeFilter: function () {
            return this.filter &&
                   this.filter.details &&
                   this.filter.details.rangeFilter;
        },
        compileRanges: function (ranges) {
            var i = 0;
            this._ranges = {};
            for (i = 0; i < ranges.length; i++) {
                this._ranges[this._transformFilterItemName(ranges[i].rangeName)] = ranges[i];
            }
        },
        _saveExpandState: function () {
            var data = this.parent._configuration._hiddenFilters || {},
                key = this.parent._configuration._hiddenFiltersKey,
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                prop = context.CurrentEntity + '_' + this.filter.filterName;

            // Create it if necessary
            if (!data[prop]) {
                data[prop] = {
                    expanded: false,
                    hidden: false
                };
            }

            data[prop].expanded = this.expanded;
            FiltersUtility.setHiddenFilters(key, json.stringify(data));
        },
        toggleExpand: function (params, evt, el) {
            // toggleExpand is called when the user clicks the filter to expand it
            this._toggleExpand();
            this._saveExpandState();
        },
        _toggleExpand: function () {
            // toggle expanded state without saving state
            this.expanded = !this.expanded;

            if (this.domNode) {
                dojo.toggleClass(this.domNode, 'filter-collapsed');
            }

            this._loadItems();
        },
        _loadItems: function () {
            if (!this._loaded) {
                this._loaded = true;
                this.requestData();
            } else {
                this.updateCounts();
            }
        },
        toggleSelect: function (params, evt, el) {
            var selected = /^true$/i.test(params.selected),
                name = params.name,
                value = !selected && (this._isRangeFilter() ? this._ranges[name] : name);
            this.onSelectionChange(this.filter, name, value, this);
            dojo.attr(el, 'data-selected', (!selected).toString());
            dojo.toggleClass(el, 'filter-selected', !selected);
        },
        onSelectionChange: function (definition, name, value, source) {
            dojo.publish(dString.substitute("/ui/filters/${0}/change", [this._filterGroup]), [definition, name, value, source]);
        },
        updateCounts: function () {
            if (!this.lazyUpdateCounts) {
                this.lazyUpdateCounts = Utility.debounce(lang.hitch(this, function () {
                    if (this.expanded) {
                        query('li[data-name] div span.p-count', this.listNode).forEach(function (node) {
                            node.innerHTML = '0';
                        });

                        this._updateActiveFilters();
                        this._doUpdateCounts();
                    }
                }), this.FILTER_UPDATE_DELAY);
            }

            this.lazyUpdateCounts();
        },
        _doUpdateCounts: function () {
            this.store.fetch({
                onComplete: lang.hitch(this, this._updateCountsInPlace),
                count: this.count
            });
        },
        requestData: function () {
            if (this.loading) {
                if (this.domNode) {
                    dojo.addClass(this.domNode, 'filter-loading');
                    this.set('content', '');
                }
            }

            this.store.fetch({
                onError: lang.hitch(this, this._onFetchError),
                onComplete: lang.hitch(this, this._onFetchComplete),
                count: this.count
            });
        },
        _onFetchComplete: function (items, requestObject) {
            this._processFetchResult(items, requestObject);
        },
        _onFetchError: function (error, requestObject) {
            if (this.domNode) {
                dojo.removeClass(this.domNode, 'filter-loading');
            }
        },
        isFilterItemHidden: function (filterItem) {
            var data = this.parent._configuration._hiddenFilters || {},
                service = Sage.Services.getService("ClientGroupContext"),
                context = service && service.getContext(),
                prop = context.CurrentEntity + '_' + this.filter.filterName,
                hidden = false;

            if (data[prop]) {
                hidden = array.some(data[prop].items, function (item) {
                    return item === filterItem;
                });
            }

            return hidden;
        },
        _updateCountsInPlace: function (items, requestObject) {
            var i = 0,
                entry = null,
                len = items.length;

            for (i = 0; i < len; i++) {
                entry = items[i];
                entry.name = this._transformFilterItemName(entry.name);
                query("li[data-name=\"" + entry.name + "\"]", this.listNode).forEach(function (node) {
                    query("div span.p-count", node).forEach(function (span) {
                        span.innerHTML = entry.value;
                    });
                });
            }

            this._finishedLoading();
        },
        _processFetchResult: function (items, requestObject) {
            var i = 0,
                entry = null,
                hidden = false,
                len = items.length,
                selected = false;

            for (i = 0; i < len; i++) {
                entry = items[i];
                entry.name = this._transformFilterItemName(entry.name);
                hidden = this.isFilterItemHidden(entry.name);
                if (hidden === false || this._isRangeFilter()) {
                    selected = this.appliedValues && this.appliedValues[this.filter.$key] && !!this.appliedValues[this.filter.$key][entry.name];
                    entry.selected = selected || (this.appliedValues && !!this.appliedValues[entry.name]);
                    entry.ofText = this.ofText;

                    this.output.push(this.itemTemplate.apply(entry, this));
                    this.entries.push(entry);
                }
            }

            this._fixMissingItems();
            if (this.domNode) {
                this.set('content', this.output.join(''));
            }
            this._clearOutputEntries();
            this.updateCounts();
        },
        _transformFilterItemName: function (name) {
            var results = name;
            if (name === null) {
                results = this.nullName;
            } else if (name === '') {
                results = this.emptyName;
            }

            return results.trim();
        },
        _fixMissingItems: function () {
            /*
            We could end up in a situation where we have applied a filter,
            and then edited the item. This would cause the distinct checkboxes
            to not show up, thus allowing the user to never clear it. Find these
            and add them to the filter items list so the user can uncheck it.
            */
            var tempEntry,
                prop,
                val,
                exists = true;

            for (prop in this.appliedValues) {
                if (this.appliedValues.hasOwnProperty(prop)) {
                    val = this.appliedValues[prop];
                    exists = array.some(this.entries, function (entry) {
                        return entry.name === prop;
                    });

                    if (!exists) {
                        tempEntry = {
                            name: '',
                            $descriptor: '',
                            selected: true,
                            value: 0
                        };

                        tempEntry.name = prop;
                        tempEntry.$descriptor = val;
                        tempEntry.ofText = this.ofText;

                        if (typeof tempEntry.$descriptor === 'string') {
                            this.output.push(this.itemTemplate.apply(tempEntry, this));
                            this.entries.push(tempEntry);
                        }
                    }
                }
            }
        },
        _clearOutputEntries: function () {
            this.output = [];
            this.entries = [];
        },
        _finishedLoading: function () {
            this.loading = false;
            this.store.request.setQueryArg('_activeFilter', this._originalActiveFilter || '');
            if (this.domNode) {
                dojo.removeClass(this.domNode, 'filter-loading');
            }
        },
        _getFilterManager: function () {
            var filterManager = this.parent.filterManager;
            if (!filterManager) {
                if (this.parent._configuration.getFilterManager) {
                    filterManager = this.parent._configuration.getFilterManager();
                }
            }
            //Add to make sure the check box filter is part of the current view.            
            var service = Sage.Services.getService("ClientGroupContext");
            var context = service && service.getContext();
            if (this.groupId != context.CurrentGroupID) {
                filterManager = null;
            }
            return filterManager;
        }
    });

    return widget;
});
