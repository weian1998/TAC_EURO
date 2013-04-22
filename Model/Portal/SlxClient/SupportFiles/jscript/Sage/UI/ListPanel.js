/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       "dojo/i18n",
       'dijit/layout/BorderContainer',
       'dijit/layout/StackContainer',
       'dijit/layout/ContentPane',
       'dijit/Toolbar',
       'dijit/ToolbarSeparator',
       'dojox/grid/EnhancedGrid',
       'Sage/_Templated',
       'Sage/UI/Filters/FilterManager',
       'Sage/UI/ToolBarLabel',
       'dijit/Menu',
       "dojox/grid/enhanced/plugins/Menu",
       'Sage/Utility',
       'dojox/storage/LocalStorageProvider',
       'Sage/UI/_DetailPane',
       'dijit/_Widget',
       'dojox/grid/enhanced/plugins/IndirectSelection',
       'Sage/UI/Grid/Plugins/ShowHideColumns',
       'dojo/_base/array',
       'dojo/_base/lang',
       'dojo/_base/declare',
       'dojo/i18n!./nls/ListPanel',
       'dojo/_base/sniff',
       'dojo/dom-geometry',
       'dijit/registry',
       'dojo/_base/connect',
       'dojo/ready'
],
function (i18n,
         borderContainer,
         stackContainer,
         contentPane,
         toolbar,
         toolbarSeperator,
         enhancedGrid,
         _Templated,
         FilterManager,
         toolbarLabel,
         dijitMenu,
         pluginMenu,
         util,
         LocalStorageProvider,
         _DetailPane,
         _Widget,
         IndirectSelection,
         ShowHideColumns,
         array,
         lang,
         declare,
         nlsListPanel,
         has,
         domGeo,
         registry,
         connect,
         ready) {

    var listPanel = declare('Sage.UI.ListPanel', [borderContainer, _Widget, _Templated], {
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '{%! $.menuTemplate %}',
            '{%! $.listTemplate %}',
            '{%! $.detailTemplate %}'
        ]),
        listTemplate: new Simplate([
            '<div data-dojo-type="dijit.layout.StackContainer" region="center" splitter="true" data-dojo-attach-point="_gridContainer">',
                '<div data-dojo-type="dijit.layout.ContentPane" data-dojo-attach-point="_noConfigurationPane"></div>',
                '<div id="{%= $.id %}_listGrid" columnReordering="true" class="listGrid" data-dojo-type="{%= $.gridType %}" data-dojo-attach-point="_listGrid" plugins="{menus:{selectedRegionMenu:\'_listContextmenu\', rowMenu:\'_listContextmenu\'}, indirectSelection: {%: $._indirectSelection%}, showHideColumns: true}" dojoAttachEvent="onRowClick:_onRowClick,onRowContextMenu:_onRowContextMenu,onSelected:_onSelectedInList,onSelectionChanged:_onSelectionChanged,onResizeColumn:_onResizeColumn,onHeaderCellClick:_onHeaderCellClick,onCellClick:_onCellClick,onRowDblClick:_onRowDblClick">',
                '<div data-dojo-type="dijit.Menu" id="_listContextmenu" dojotAttachPoint="_listContextmenu" style="display:none" ></div>',
                '</div>',
                '<div id="{%= $.id %}_summaryGrid" class="summaryGrid" data-dojo-type="{%= $.gridType %}" selectionMode="none" data-dojo-attach-point="_summaryGrid" dojoAttachEvent="onRowClick:_onRowClick,onRowContextMenu:_onRowContextMenu,onSelected:_onSelectedInSummary,onSelectionChanged:_onSelectionChanged"></div>',
            '</div>'
        ]),
        menuTemplate: new Simplate([
            '<div data-dojo-type="dijit.Toolbar" region="top" splitter="false" id="{%= $.id %}_toolbar" style="{%= $.toolbarStyle %}" data-dojo-attach-point="_tbar" class="list-panel-tbar right-tools">',
                '<div data-dojo-type="Sage.UI.ToolBarLabel" label="" data-dojo-attach-point="_tbarLabel" class="list-panel-left-tools"></div>',
                '<div data-dojo-type="Sage.UI.ToolBarLabel" label="{%= $.unsavedDataText %}" data-dojo-attach-point="_unsavedDataLabel" class="display-none"></div>',
                '<div data-dojo-type="Sage.UI.ToolBarLabel" label="" data-dojo-attach-point="_filterSummary" class="filter-summary-view"></div>',
                '<div data-dojo-type="dijit.form.Button" showLabel="true" id="{%= $.id %}_detailBtn" data-dojo-attach-point="_detailButton" dojoAttachEvent="onClick:toggleDetail" class="list-panel-tool-detail">{%= $.detailText %}</div>',
                '<span data-dojo-type="dijit.ToolbarSeparator" data-dojo-attach-point="_buttonSection" class="list-panel-tool-section"></span>',
                '<div data-dojo-type="dijit.form.Button" showLabel="true" id="{%= $.id %}_listBtn" data-dojo-attach-point="_listButton" dojoAttachEvent="onClick:showList" class="list-panel-tool-list">{%= $.listText %}</div>',
                '<div data-dojo-type="dijit.form.Button" showLabel="true" id="{%= $.id %}_summaryBtn" data-dojo-attach-point="_summaryButton" dojoAttachEvent="onClick:showSummary" class="list-panel-tool-summary">{%= $.summaryText %}</div>',
                '<div data-dojo-type="Sage.UI.ImageButton" iconClass="Global_Images icon16x16 icon_refresh"  tooltip="{%: $.refreshText %}" id="refreshBtn" data-dojo-attach-point="_refreshButton" dojoAttachEvent="onClick:refreshView" class="list-panel-tool-help"></div>',
                '<div data-dojo-type="Sage.UI.ImageButton" iconClass="Global_Images icon16x16 icon_Help_16x16" tooltip="{%: $.helpText %}" id="helpBtn" data-dojo-attach-point="_helpButton" dojoAttachEvent="onClick:showHelp" class="list-panel-tool-help"></div>',
            '</div>'
        ]),
        detailTemplate: new Simplate([
            '<div data-dojo-type="{%= $.detailType %}" region="{%= $.detailRegion %}" splitter="true" style="{%= $.detailStyle %}" data-dojo-attach-point="_detailPane">',
            '</div>'
        ]),
        _filterGroup: null,
        _filterSubscriptions: null,
        _filterManager: null,
        _toolbarApplied: false,
        _configurationProvider: null,
        _configurationConnects: null,
        _contextConnects: null,
        _dataChangeWatchers: [],
        _gridContainer: null,
        _noConfigurationPane: null,
        _listGrid: null,
        _indirectSelection: '',
        _summaryGrid: null,
        _detailPane: null,
        _tbar: null,
        _tbarCustom: false,
        _tbarLabel: null,
        _buttonSection: null,
        _detailButton: null,
        _listButton: null,
        _summaryButton: null,
        _helpButton: null,
        _filterSummary: null,
        _unsavedDataLabel: null,
        _listMode: 'list',
        helpTopicName: 'listview',
        gutters: false,
        toolbarStyle: '',
        // todo: might have to fix this issue: http://bugs.dojotoolkit.org/ticket/10930 if we support editing
        gridType: 'dojox.grid.EnhancedGrid',
        initialGrid: 'list',
        filterGroup: 'default',
        detailVisible: false,
        detailOnSummary: false,
        detailRegion: 'bottom',
        detailStyle: 'height: 256px;',
        detailType: 'dijit.layout.ContentPane',
        autoConfigure: true,
        hasCheckBox: false,
        autoFitColumns: true,

        // i18n
        listText: 'List',
        summaryText: 'Summary',
        detailText: 'Detail',
        hideDetailText: 'Hide Detail',
        unsavedDataText: '*unsaved data',
        helpText: 'Help',
        refreshText: 'Refresh',
        ofText: 'of',
        // end i18n

        FILTER_UPDATE_DELAY: 1000,
        STORE_KEY_COLUMN_SIZE: '_COLUMN_UNIT_WIDTH_',
        STORE_KEY_SORT_INFO: '_GRID_SORT_PROPS_',
        STORE_KEY_LAYOUT_INFO: '_GRID_LAYOUT_PROPS_',
        STORE_KEY_TOGGLE_INFO: '_GRID_TOTTLE_PROPS_',
        STORE_KEY_STORE_QUERY: '_STORE_QUERY_',
        STORE_KEY_VIEWSTATE: 'LISTPANEL_VIEWSTATE', // Key for view state - did we leave off in list or summary view?

        constructor: function () {
            this.inherited(arguments);

            //dojo.subscribe('/group/context/changed', lang.hitch(this, this._onLViewConfigChanging));
            //dojo.subscribe('/ui/filterPanel/ready', lang.hitch(this, this._onFilterPanelReady));
            //dojo.subscribe('/ui/filterManager/ready', lang.hitch(this, this._onFilterManagerReady));


        },
        postMixInProperties: function () {
            this.inherited(arguments);
            lang.mixin(this, nlsListPanel);
            this._setupCheckBox();
            this._setupAutoFit();
        },
        postCreate: function () {
            this.inherited(arguments);

            if (this._listGrid) {
                this.connect(this._listGrid.scroller, 'scroll', this._onListScroll);
                //this.connect(this._listGrid, 'canSort', this._onListCanSort);
                this.connect(this._summaryGrid.scroller, 'scroll', this._onSummaryScroll);
                this._listGrid.canSort = function (col) {
                    var cells = this.layout.cells;
                    var cell = cells[Math.abs(col) - 1];
                    if (cell.nosort) {
                        return false;
                    }
                    return true;
                };

                this._listGrid.columnReordering = true;
                this._listGrid.selectionMode = 'extended';

                // TODO: Use same storage for cell order and visibility
                dojo.connect(this._listGrid, 'onMoveColumn', this, function (type, mapping, cols) {
                    var cells = this._listGrid.layout.cells,
                        results = [],
                        i = 0,
                        key = '';

                    for (i = 0; i < cells.length; i++) {
                        if (cells[i].field) {
                            results.push(cells[i].field);
                        }
                    }

                    key = this._getGridLayoutKey();
                    this._saveToLocalStorage(key, results);
                });

                dojo.subscribe('/sage/ui/grid/columnToggle/' + this._listGrid.id, dojo.hitch(this, function (cell) {
                    var cells = this._listGrid.layout.cells,
                        results = [],
                        i = 0,
                        key = '';
                    for (i = 0; i < cells.length; i++) {
                        results.push({ field: cells[i].field, hidden: cells[i].hidden });
                    }

                    key = this._getGridColumnToggleKey();
                    this._saveToLocalStorage(key, results);
                }));
            }

            this._gridContainer.selectChild(this._noConfigurationPane);

            if (this._detailPane.isInstanceOf(_DetailPane)) {
                this._detailPane.set('owner', this);
            }

            this._setDetailPaneVisibility(false);

            this._updateToolbarItemVisibility();
        },
        startup: function () {
            this.inherited(arguments);

            if (this.autoConfigure) {
                this.requestConfiguration();
            }
        },
        uninitialize: function () {
            this.inherited(arguments);

            if (this._filterManager) {
                this._filterManager.destroy();
            }

            if (this._configurationProvider) {
                this._configurationProvider.destroy();
            }
        },
        _setupCheckBox: function () {
            // Load the grid checkbox selector plugin "indirectSelection"
            // based on a user option.
            var service = Sage.Services.getService('UserOptions');
            this._indirectSelection = 'false';

            if (service && service.get) {
                service.get('GroupCheckboxEnabled', 'GroupGridView', lang.hitch(this, function (data) {
                    var groupCheckboxEnabled = data && data.value;
                    if (groupCheckboxEnabled === 'True' || groupCheckboxEnabled === 'T') {
                        this._indirectSelection = '{ draggable: false}';
                        this.hasCheckBox = true;
                    } else {
                        this.hasCheckBox = false;
                    }
                }), null, this, false);
            }
        },
        _setupAutoFit: function () {
            var service = Sage.Services.getService('UserOptions');
            if (service && service.get) {
                service.get('autoFitColumns', 'GroupGridView', lang.hitch(this, function (data) {
                    var val = data && data.value;
                    if (val === 'True' || val === 'T') {
                        this.autoFitColumns = true;
                    } else {
                        this.autoFitColumns = false;
                    }
                }), null, this, false);
            }
        },
        _setSortInfo: function (store) {
            var key = this._getGridSortKey(),
                sortProps = this._getFromLocalStorage(key);
            if (sortProps) {
                if (sortProps.descending) {
                    this._listGrid.sortInfo = (sortProps.cellIndex + 1) * -1;
                } else {
                    this._listGrid.sortInfo = sortProps.cellIndex + 1;
                }

                store.sort = [sortProps];
            }
        },
        _setSummarySortInfo: function (store) {
            var key = this._getGridSortKey(),
                sortProps = this._getFromLocalStorage(key);
            if (sortProps) {
                store.sort = [sortProps];
            }
        },
        _setColumnSizes: function (structure) {
            var cells = structure;

            if (structure[0].cells) {
                cells = structure[0].cells[0];
            }

            array.forEach(cells, function (item) {
                if (item && item.field) {
                    var key = this._getColumnSizeKey(item.field),
                        value = this._getFromLocalStorage(key);
                    if (value) {
                        item.width = value;
                    }
                }
            }, this);
        },
        /* {{{
        * Calculates the percentage of the grid columns against the original layout width,
        * and then applies that percentage against the grid containers parent. This will run
        * on initial load and on resize events.
        *
        }}}*/
        _doAutoFitColumns: function () {
            if (!this.autoFitColumns) {
                return;
            }

            var structure = this._listGrid.get('structure'),
                cells = structure,
                layoutWidth = 0,
                dimensions,
                realWidth,
                checkBoxOffset = 0;

            if (structure && structure[0].cells) {
                cells = structure[0].cells[0];
            }

            array.forEach(cells, function (item) {
                if (item && item.field) {
                    var key = this._getColumnSizeKey(item.field),
                        value = this._getFromLocalStorage(key);
                    if (value) {
                        item.width = value;
                    }
                    layoutWidth += parseInt(item.width, 10);
                }
            }, this);

            dimensions = domGeo.getContentBox('list'); /* dimensions of the parent container */
            realWidth = dimensions.w;

            // If check box selection is enabled, calc the offset
            if (this.hasCheckBox) {
                checkBoxOffset = 200;
            } else {
                checkBoxOffset = 155;
            }

            realWidth = realWidth - checkBoxOffset;

            array.forEach(cells, function (item) {
                var width,
                    pct,
                    newWidth;
                if (item && item.field) {
                    width = parseInt(item.width, 10);
                    pct = width / layoutWidth;
                    newWidth = Math.round(realWidth * pct);
                    item.width = newWidth + 'px';
                }
            }, this);

            this._listGrid.set('structure', structure);
        },
        _updateStructureFromLocalStore: function () {
            var key = this._getGridLayoutKey(),
                toggleKey = this._getGridColumnToggleKey(),
                structure = this._listGrid.structure,
                fields = this._getFromLocalStorage(key),
                toggleFields = this._getFromLocalStorage(toggleKey),
                cell, cells, newIndex, temp, i;

            if (fields) {
                cells = structure[0].cells[0];
                if (cells) {
                    cells.sort(function (a, b) {
                        var aIndex = array.indexOf(fields, a.field),
                            bIndex = array.indexOf(fields, b.field);

                        if (aIndex > bIndex) {
                            return 1;
                        }

                        if (aIndex < bIndex) {
                            return -1;
                        }

                        return 0;

                    });
                }

                this._listGrid.set('structure', structure);
            }

            if (toggleFields) {
                array.forEach(this._listGrid.layout.cells, lang.hitch(this, function (cell) {
                    array.forEach(toggleFields, lang.hitch(this, function (item) {
                        if (item.field === cell.field) {
                            this._listGrid.layout.setColumnVisibility(cell.index, !item.hidden);
                        }
                    }));
                }));

            }
        },
        _handleConfigurationChange: function () {
            this._listGrid.selection.clear();
            if (this._detailPane) {
                this._detailPane.clear();
            }
            this.requestConfiguration();
        },
        _setConfigurationProviderAttr: function (value) {

            if (this._configurationConnects) {
                array.forEach(this._configurationConnects, function (connection) {
                    this.disconnect(connection);
                }, this);
            }

            if (this._configurationProvider && this._configurationProvider !== value) {
                this._configurationProvider.destroy();
            }

            this._configurationProvider = value;
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
        _setFilterGroupAttr: function (value) {
            if (this._filterSubscriptions) {
                array.forEach(this._filterSubscriptions, function (subscription) {
                    this.unsubscribe(subscription);
                }, this);
            }

            this._filterGroup = value;
            this.set('filterManager', new FilterManager({
                filterGroup: this._filterGroup
            }));
            this._filterSubscriptions = [];
            this._filterSubscriptions.push(this.subscribe(dojo.string.substitute("/ui/filters/${0}/change", [this._filterGroup]), this._onFilterChange));

            // Delay for at least 1 second without input (matches checkbox filter)
            var lazyRefresh = util.debounce(lang.hitch(this, this._onFilterRefresh), this.FILTER_UPDATE_DELAY);
            this._filterSubscriptions.push(this.subscribe(dojo.string.substitute("/ui/filters/${0}/refresh", [this._filterGroup]), lazyRefresh));
            this._ensureApplyFilterWasPublished();
        },
        _ensureApplyFilterWasPublished: function (direct) {
            // Hack: If we missed the filters/apply event, we will force the group context service to fire it.
            var service, context;
            service = Sage.Services.getService('ClientGroupContext');
            context = service && service.getContext();
            if (context && context.AppliedFilterInfo) {
                service.publishFiltersApplied(context.AppliedFilterInfo);
            }
            if (this._filterManager && direct && service.applyFilters) {               
               service.applyFilters(this._filterManager);              
            }
        },
        _getFilterGroupAttr: function () {
            return this._filterGroup;
        },
        _setFilterManagerAttr: function (value) {
            if (this._filterManager && this._filterManager !== value) {
                this._filterManager.destroy();
            }

            this._filterManager = value;

            if (this._filterManager) {
                this._filterManager.set('owner', this);
            }
        },
        _getFilterManagerAttr: function () {
            return this._filterManager;
        },
        _onFilterChange: function () {
        },
        _onFilterRefresh: function (applied, definitionSet, manager) {
            // todo: add support for summary view
            // todo: turn this off when no filters are applied
            this._listGrid.selection.clear();
            if (this._detailPane) {
                this._detailPane.clear();
            }
            var query = manager.createQuery(),
                key = this._getStoreQueryKey();

            if (this._listMode === 'summary' && this._hasConfigurationForSummary()) {
                this._summaryGrid.queryOptions = this._summaryGrid.queryOptions || {};
                this._summaryGrid.filter(query);
            } else {

                this._listGrid.queryOptions = this._listGrid.queryOptions || {};
                this._listGrid.queryOptions.httpMethodOverride = !!query;
                this._listGrid.filter(query, true);
            }
            this._saveToLocalStorage(key, { store: this._listGrid.store, query: query });
        },
        _setConfigurationAttr: function (configuration) {
            this._applyConfiguration(configuration);
        },
        _getListAttr: function () {
            return this._listGrid;
        },
        _getSummaryAttr: function () {
            return this._summaryGrid;
        },
        _getDetailAttr: function () {
            return this._detailPane;
        },
        _applyConfigurationFailed: function (configuration) {
            // TODO: Maybe we should publish the configuration failed?
            // Group tabs depend on this firing so they can load.
            dojo.publish('/listView/applyConfiguration', this);
        },
        _applyConfiguration: function (configuration) {
            //this._onLViewConfigChanging();
            dojo.publish('/listView/applyConfiguration', this);

            var key = this._getViewStateKey(),
                state = this._getFromLocalStorage(key, this._getViewNS());

            if (state) {
                this.initialGrid = state;
            }

            this._configuration = configuration;
            this._gridContainer.selectChild(this._noConfigurationPane);


            if (this.initialGrid === 'list' && this._hasConfigurationForList()) {
                this.showList();
            }

            if (this._hasConfigurationForSummary()) {
                this._configuration.summary.active = false;
            }

            if (this.initialGrid === 'summary' && this._hasConfigurationForSummary()) {
                if (this._gridContainer.selectedChildWidget === this._noConfigurationPane) {
                    this.showSummary();
                }
            }

            this._applyToolBar();

            if (this._configuration && this._configuration.list && this._configuration.list.selectionMode && this._configuration.list.selectionMode === 'single') {
                this._listGrid.selection.setMode('single');
            } else if (this._configuration && this._configuration.list && this._configuration.list.selectionMode && this._configuration.list.selectionMode === 'none') {
                this._listGrid.selection.setMode('none');
            } else {
                this._listGrid.selection.setMode('extended');
            }
            
        },
        _applyToolBar: function () {
            var toolBarItems, i, items;

            if (this._tbarCustom) {
                toolBarItems = this._tbar.getChildren();
                for (i = 0; i < toolBarItems.length; i++) {
                    if (toolBarItems[i].custom) {
                        this._tbar.removeChild(toolBarItems[i]);
                    }
                }

                this._tbarCustom = false;
            }

            if (this._toolbarApplied && !this._configuration.updateToolBar) {
                return;
            }

            if (this._configuration && this._configuration.toolBar) {
                items = this._configuration.toolBar.items || [];
                if (items.length > 0) {
                    this._tbarCustom = true;
                }

                for (i = 0; i < items.length; i++) {
                    if (items[i].icon || items[i].imageClass) {
                        this._tbar.addChild(new Sage.UI.ImageButton(items[i]), i);
                    } else {
                        this._tbar.addChild(new dijit.form.Button(items[i]), i);
                    }
                }
            }

            this._toolbarApplied = true;
        },
        _setDetailPaneVisibility: function (value) {
            if (value) {
                if (this._hasConfigurationForDetail() && !this._isConfigurationActiveForDetail()) {
                    if (this._detailPane.isInstanceOf(_DetailPane)) {
                        this._detailPane.set('configuration', this._configuration.detail);
                    }

                    this._configuration.detail.active = true;
                }
                this._detailButton.set('label', this.hideDetailText);
                this.addChild(this._detailPane);
                //Set the first selected Record on the list grid.
                var selected = this._getSelection(0);
                if (selected) {
                    this._detailPane._onSelected(selected.rowIndex, selected, this._listGrid);
                }
                else {
                    this._detailPane.clear();
                }

            } else {
                this._detailButton.set('label', this.detailText);
                this.removeChild(this._detailPane);
            }
        },
        _getSelection: function (index) {
            var sels = this._listGrid.selection.getSelected();
            var selection = null;
            for (var i = 0; i < sels.length; i++) {
                if (index == i) {
                    selection = sels[i];
                    return selection;
                }
            }
            return selection;
        },
        _updateToolbarItemVisibility: function () {
            dojo.toggleClass(this.domNode, 'list-panel-has-summary', this._hasConfigurationForSummary());
            dojo.toggleClass(this.domNode, 'list-panel-has-detail', this._canShowDetailPane());
        },
        _canShowDetailPane: function () {
            return (this._hasConfigurationForDetail() && ((this._gridContainer.selectedChildWidget !== this._summaryGrid) || this.detailOnSummary));
        },
        _shouldShowDetailPane: function () {
            return (this._canShowDetailPane() && this.detailVisible);
        },
        _hasConfigurationForList: function () {
            return (this._configuration && this._configuration.list);
        },
        _hasConfigurationForSummary: function () {
            return (this._configuration && this._configuration.summary);
        },
        _hasConfigurationForDetail: function () {
            return (this._configuration && this._configuration.detail);
        },
        _isConfigurationActiveForList: function () {
            return (this._hasConfigurationForList() && this._configuration.list.active);
        },
        _isConfigurationActiveForSummary: function () {
            return (this._hasConfigurationForSummary() && this._configuration.summary.active);
        },
        _isConfigurationActiveForDetail: function () {
            return (this._hasConfigurationForDetail() && this._configuration.detail.active);
        },
        _onRowClick: function (e) {
            this.onRowClick(e.rowIndex, e.grid.getItem(e.rowIndex), e.grid);
        },
        _onRowContextMenu: function (e) {
            var selection = e.grid.selection,
                selected = selection.getSelected();

            if (selected.length === 0) {
                selection.select(e.rowIndex);
            }

            this.onRowContextMenu(e.rowIndex, e.grid.getItem(e.rowIndex), e.grid);
        },
        _onSelectedInList: function (index) {
            this.onSelected(index, this._listGrid.getItem(index), this._listGrid);
        },
        _onSelectedInSummary: function (index) {
            this.onSelected(index, this._summaryGrid.getItem(index), this._summaryGrid);
        },
        _onSelectionChanged: function () {
            dojo.publish('/sage/ui/list/selectionChanged', this);
            this.onSelectionChanged();
        },
        _onResizeColumn: function (columnIndex) {
            // Handle size storage
            var grid = this._listGrid,
                cell = grid.getCell(columnIndex),
                value = cell.unitWidth,
                key = this._getColumnSizeKey(cell.field);

            this._saveToLocalStorage(key, value);
            this._doAutoFitColumns();
        },
        _onHeaderCellClick: function (e) {
            // Handle sort storage
            var grid = this._listGrid,
                key = this._getGridSortKey(),
                value,
                sortProps = grid.getSortProps();

            grid.selection.clear();

            if (sortProps && sortProps.length > 0) {
                // sortProps is an array of objects:
                // { attribute: 'Cell Name', descending: true/false }
                value = sortProps[0];
                value.cellIndex = e.cell.index;

                //if cell has no sort then don't save.
                if (e.cell.nosort) { return; }

                this._saveToLocalStorage(key, value);
            }
        },
        _onRowDblClick: function (e) {
            if (this._configuration.list.onNavigateToDefaultItem) {
                if (e.rowIndex > -1) {
                    var item = e.grid._by_idx[e.rowIndex].item;
                    this._configuration.list.onNavigateToDefaultItem(item);
                }
            }
        },
        _onCellClick: function (e) {
            var i,
                inc = 1,
                selected = e.grid.selection.isSelected(e.rowIndex),
                newSelected;

            if (has('ie') > 8) {
                try {
                    var selection = document.getSelection();
                    if (selection && selection.removeAllRanges) {
                        selection.removeAllRanges();
                    }
                } catch (err) { }
            }
            // If we click the other cells, "pretend" we clicked the row select cell checkbox
            if (e.grid.rowSelectCell) {
                if (e.grid.rowSelectCell.index !== e.cell.index) {
                    if (e.shiftKey === true && e.grid.rowSelectCell.lastClickRowIdx !== e.rowIndex) {
                        // Shift is being held, select from previous click to this
                        // last 0 -> current 10 we need to increment up (set inc to positive)
                        // last 10 -> current 0 we need to increment down (set inc to negative)
                        if (e.grid.rowSelectCell.lastClickRowIdx > e.rowIndex) {
                            inc = -1;
                        }

                        for (i = e.grid.rowSelectCell.lastClickRowIdx; i !== e.rowIndex; i += inc) {
                            e.grid.rowSelectCell.toggleRow(i, true);
                        }

                        e.grid.rowSelectCell.toggleRow(e.rowIndex, true);
                    } else {
                        e.grid.rowSelectCell.toggleRow(e.rowIndex, !selected);
                        if (this._shouldShowDetailPane() && selected) {
                            newSelected = this._getSelection(0);
                            if (newSelected) {
                                this._detailPane._onSelected(newSelected.rowIndex, newSelected, e.grid);
                            }
                            else {
                                this._detailPane.clear();
                            }
                        }
                    }

                    e.grid.rowSelectCell.lastClickRowIdx = e.rowIndex;
                }
                else {
                    if (this._shouldShowDetailPane() && selected) {
                        // This is a hack since the selection from the check box is changed some where else.
                        // So we clear it to get the next selection then set it back so the event form the check box un togeles the selection correctly.
                        e.grid.rowSelectCell.toggleRow(e.rowIndex, !selected);
                        newSelected = this._getSelection(0);
                        e.grid.rowSelectCell.toggleRow(e.rowIndex, selected);
                        if (newSelected) {
                            this._detailPane._onSelected(newSelected.rowIndex, newSelected, e.grid);
                        }
                        else {
                            this._detailPane.clear();
                        }
                    }
                }
            }
        },
        _saveToLocalStorage: function (key, value, namespace) {
            var localStore;

            try {
                localStore = new LocalStorageProvider();
                localStore.initialize();

                if (!namespace) {
                    namespace = this._getGroupNS();
                }

                namespace = this._makeValidNamespace(namespace);
                localStore.put(key, value, function (status, key, message) {
                    if (status === localStore.FAILED) {
                        console.error('Failed writing key: ' + key + ' in local storage. Message: ' + message);
                    }
                }, namespace);
            } catch (err) {
                console.error(err);
            }
        },
        _getFromLocalStorage: function (key, namespace) {
            var localStore, results;

            try {
                localStore = new LocalStorageProvider();
                localStore.initialize();
                if (!namespace) {
                    namespace = this._getGroupNS();
                }

                namespace = this._makeValidNamespace(namespace);
                results = localStore.get(key, namespace); // returns null if key does not exist.
            } catch (err) {
                console.error(err);
            }

            return results;
        },
        _makeValidNamespace: function (ns) {
            // This is similar to the regex dojo uses to validate a valid namespace,
            // except we replace anything that would be invalid with a dash.
            // See: https://github.com/dojo/dojox/blob/1.7.3/storage/LocalStorageProvider.js
            return ns.replace(/[^0-9^A-Z^a-z^\-]/g, '-');
        },
        _getGroupNS: function () {
            var ns = Sage.Groups.GroupManager.LOCALSTORE_NAMESPACE + '-' + this._getGroupID();
            return ns;
        },
        _getViewNS: function () {
            var ns = Sage.Groups.GroupManager.LOCALSTORE_NAMESPACE + '-' + this._getMainViewName();
            return ns;
        },
        _getGroupID: function () {
            var service = Sage.Services.getService("ClientGroupContext"),
                results = -1,
                context = null;
            if (service) {
                context = service.getContext();
                if (context) {
                    results = context.CurrentGroupID;
                }
            }

            return results;
        },
        _getMainViewName: function () {
            if (this._configurationProvider._mainViewName) {
                return this._configurationProvider._mainViewName;
            }
            //if not defined then use the group context.
            var service = Sage.Services.getService("ClientGroupContext"),
                results = -1,
                context = null;
            if (service) {
                context = service.getContext();
                if (context) {
                    results = context.CurrentEntity;
                }
            }
            return results;
        },
        _getColumnSizeKey: function (columnName) {
            var stripped = columnName.replace(/[\.\$]/g, '_'),
                id = this._listGrid.id + '_' + this._configuration.list.id + '_' + this.STORE_KEY_COLUMN_SIZE + stripped;
            return id;
        },
        _getGridSortKey: function () {
            return this._keyGen(this.STORE_KEY_SORT_INFO);
        },
        _getGridLayoutKey: function () {
            return this._keyGen(this.STORE_KEY_LAYOUT_INFO);
        },
        _getGridColumnToggleKey: function () {
            return this._keyGen(this.STORE_KEY_TOGGLE_INFO);
        },
        _getViewStateKey: function () {
            return this.STORE_KEY_VIEWSTATE;
        },
        _getStoreQueryKey: function () {
            var id = this.STORE_KEY_STORE_QUERY + this._getGroupID();
            return id;
        },
        _keyGen: function (keyPart) {
            var id = this._listGrid.id + keyPart + this._configuration.list.id;
            return id;
        },
        _onListScroll: function () {
            this._onScroll(this._listGrid.scroller);
        },
        _onSummaryScroll: function () {
            this._onScroll(this._summaryGrid.scroller);
        },
        _onScroll: function (scroller) {
            var firstrow,
                lastrow,
                count,
                lbl;

            if (this._tbarLabel) {
                count = scroller.rowCount;
                if (count <= 0) {
                    firstrow = 0;
                    lastrow = 0;
                    count = 0;
                } else {
                    firstrow = (scroller.firstVisibleRow === 0) ? 1 : scroller.firstVisibleRow + 1;
                    lastrow = (scroller.lastVisibleRow >= scroller.rowCount) ? scroller.rowCount : scroller.lastVisibleRow + 1;
                }

                lbl = dojo.string.substitute('${0} ${1} - ${2} ${3} ${4}', [this.displayingText, firstrow, lastrow, this.ofText, count]);
                this._tbarLabel.set('label', lbl);
            }
        },
        _markDirty: function (entity) {
            // this doesn't work because dojo renders the html for the row after this event has run.
            // So, we need to override the render row and check if the entity is dirty and add the
            // class at that point.
            //				if (entity) {
            //					var idx = this._listGrid.getItemIndex(entity);
            //					if (idx && idx > -1) {
            //						var row = this._listGrid.getRowNode(idx);
            //						//row = row.firstChild;
            //						if (row) {
            //							dojo.addClass(row, 'row_unsaved_changes');
            //						}
            //					}
            //				}
            this._unsavedDataLabel.set('style', 'display:inline');
        },
        _markClean: function () {
            this._unsavedDataLabel.set('style', 'display:none');
        },
        getTotalSelectionCount: function () {
            var totalCount = 0,
                sel;

            if (this._listMode === 'list') {
                this._configuration.list.active = true; //active is getting nulled out some how?
            }


            if (!this._isConfigurationActiveForList() || !this._listGrid) {
                return [];  //selections only valid for list mode
            }

            sel = this._listGrid.selection;
            if (sel) {
                totalCount = sel.getSelectedCount();
            }

            return totalCount;
        },
        getSelectionInfo: function (includeEntity) {
            var recordCount,
                selectionCount,
                selectionKey,
                mode,
                selections,
                groupContextSvc,
                keyField,
                hasCompositeKey,
                sels,
                selectedIds = [],
                i,
                selectionInfo;

            if (this._listMode === 'list') { //active is getting nulled out some how?
                this._configuration.list.active = true;
            }

            if (!this._isConfigurationActiveForList() || !this._listGrid) {
                return [];  //selections only valid for list mode
            }

            recordCount = this._listGrid.rowCount || 0;
            selectionCount = this.getTotalSelectionCount();
            selectionKey = this.id;
            mode = 'selection';
            selections = [];
            groupContextSvc = Sage.Services.getService('ClientGroupContext');
            keyField = (groupContextSvc) ? groupContextSvc.getContext().CurrentTableKeyField || '' : '';
            if (this._configuration.hasCompositeKey) {
                hasCompositeKey = this._configuration.hasCompositeKey;
            }
            else {

                hasCompositeKey = false;
            }

            sels = this._listGrid.selection.getSelected();
            selectedIds = [];

            for (i = 0; i < sels.length; i++) {
                if (sels[i]) {
                    var selectionsObj = {
                        rn: 0, //ToDo: do we need SLXRN?  No, but removing requires modifications to Sage.SalesLogix.SelectionService, which could potentially break customizations
                        id: sels[i][keyField]
                    };
                    if (includeEntity) {
                        selectionsObj['entity'] = sels[i];
                    }
                    selections.push(selectionsObj);
                    //we still want to store the ids as an array
                    selectedIds.push(sels[i][keyField]);
                }
            }

            selectionInfo = {
                key: selectionKey,
                mode: mode,
                selectionCount: selectionCount,
                recordCount: recordCount,
                sortDirection: '', // sortDirection,  //ToDo: find these... <---<<<   <---<<<
                sortField: '', // sortField,
                keyField: keyField,
                hasCompositeKey: hasCompositeKey,
                ranges: [], // ranges, //ranges are leftover from the Ext grid - the dojo grid does not use ranges, when a large range is selected, it fetches all the data...
                selections: selections,
                selectedIds: selectedIds
            };

            return selectionInfo;
        },
        requestConfiguration: function () {
            ready(lang.hitch(this, function() {
                if (this._configurationProvider) {
                    this._configurationProvider.requestConfiguration({
                        success: lang.hitch(this, this._applyConfiguration),
                        failure: lang.hitch(this, this._applyConfigurationFailed)
                    });
                }
            }));
        },
        refreshView: function () {
            if (this._configuration.rebuildOnRefresh) {
                this.requestConfiguration();
            }
            this.refreshList();
            dojo.publish('/listView/refresh', this);
        },
        refreshList: function (listId) {
            if (this._listMode !== 'list') {
                this.refreshSummary();
                return;
            }

            if (!listId) {
                this._listGrid._refresh();
            } else {
                if (this._configuration._listId === listId) {
                    this._listGrid._refresh();
                }
            }

            if (this._listGrid && this._listGrid.selection) {
                this._listGrid.selection.clear();
            }

            if (this._detailPane) {
                this._detailPane.clear();
            }
        },
        refreshSummary: function () {
            if (this._hasConfigurationForSummary() && (this._listMode !== 'list')) {
                this._summaryGrid._refresh();
            }
        },
        showHelp: function () {
            util.openHelp(this.helpTopicName);
        },
        refreshGrid: function () {
            // Fired from refreshButton
            this._listGrid.selection.clear();
            this.refreshList();
            this.refreshSummary();
        },
        showList: function () {
            var query,
                queryOptions,
                regionChildItems,
                menuItem,
                i,
                cMenu,
                cMenuItems,
                curChildItems,
                store,
                key,
                viewStateKey,
                centerContent;

            this._listMode = 'list';

            if (!this._hasConfigurationForList()) {
                return;
            }

            viewStateKey = this._getViewStateKey();
            this._saveToLocalStorage(viewStateKey, 'list', this._getViewNS());

            this._ensureApplyFilterWasPublished(true);

            query = this._filterManager.createQuery();
            key = this._getStoreQueryKey();
            queryOptions = this._listGrid.queryOptions || {};
            queryOptions.httpMethodOverride = !!query;
            this._setSortInfo(this._configuration.list.store);

            if (this._configuration.list.rowsPerPage > 0) {
                this._listGrid.set('rowsPerPage', this._configuration.list.rowsPerPage);
            }

            //this._listGrid.setStore(this._configuration.list.store, query, queryOptions);
            //Broke this out of setStore() method so the grid would not refresh untill the structure isset for sort order,
            //and then refesh grid after structure is set.
            this._listGrid._setStore(this._configuration.list.store);
            this._listGrid._setQuery(query, queryOptions);
            //
            this._saveToLocalStorage(key, { store: this._configuration.list.store, query: query });
            if (this._listGrid.structure !== this._configuration.list.structure) {
                this._setColumnSizes(this._configuration.list.structure);
                this._listGrid.set('structure', this._configuration.list.structure);
                this._doAutoFitColumns();
                // override structure from local storage (if any)
                this._updateStructureFromLocalStore();
            }

            //Refresh grid since we are going around the setStore method and using _setStore instead.
            this._listGrid._refresh(true);

            if (!this._isConfigurationActiveForList()) {
                if (this._dataChangeWatchers.length > 0) {
                    array.forEach(this._dataChangeWatchers, dojo.disconnect);
                    this._dataChangeWatchers = [];
                }


                if (this._configuration.list.formatterScope && (this._listGrid.formatterScope !== this._configuration.list.formatterScope)) {
                    this._listGrid.set('formatterScope', this._configuration.list.formatterScope);
                }

                if (this._configuration.rebuildMenus) {
                    regionChildItems = this._listGrid.selectedRegionMenu.getChildren();
                    for (i = 0; i < regionChildItems.length; i++) {
                        menuItem = regionChildItems[i];
                        this._listGrid.selectedRegionMenu.removeChild(menuItem);
                    }
                }

                cMenuItems = this._configuration.list.selectedRegionContextMenuItems || [];
                if (cMenuItems.length > 0) {
                    curChildItems = this._listGrid.selectedRegionMenu.getChildren();
                    if (curChildItems.length !== cMenuItems.length) {
                        cMenu = this._listGrid.selectedRegionMenu;
                        for (i = 0; i < cMenuItems.length; i++) {
                            cMenu.addChild(cMenuItems[i]);
                        }

                        if (this._configuration.list.onSelectedRegionContextMenu) {
                            if (this._contextConnects) {
                                array.forEach(this._contextConnects, dojo.disconnect);
                            }
                            this._contextConnects = [];
                            this._contextConnects.push(dojo.connect(this._listGrid, 'onRowContextMenu', this._configurationProvider, this._configuration.list.onSelectedRegionContextMenu));
                        }
                    }
                }

                store = this._listGrid.store;
                if (store && store !== null) {
                    if (store.features.hasOwnProperty('dojo.data.api.Write')) {
                        this._dataChangeWatchers.push(dojo.connect(store, 'onSet', this, function (entity, attribute, oldValue, newValue) {
                            if (oldValue !== newValue) {
                                this._markDirty(entity);
                            }
                        }));

                        if (store.onDataReset) {
                            this._dataChangeWatchers.push(dojo.connect(store, 'onDataReset', this, '_markClean'));
                        }
                    }
                }

                //this._configuration.list.active = true;
            }
            this._configuration.list.active = true;
            this._gridContainer.selectChild(this._listGrid);
            this._setDetailPaneVisibility(this._shouldShowDetailPane());
            this._updateToolbarItemVisibility();

            centerContent = registry.byId('centerContent');
            //connect.connect(centerContent, 'resize', this, this._doAutoFitColumns, false);
        },
        showSummary: function () {
            var viewStateKey,
                query;
            this._listMode = 'summary';
            if (!this._hasConfigurationForSummary()) {
                return;
            }

            query = this._filterManager.createQuery();

            this._setSummarySortInfo(this._configuration.summary.store);

            this._summaryGrid.setStore(this._configuration.summary.store, query);
            this._summaryGrid.setStructure(this._configuration.summary.structure);
            // For some reason the lastVisibleRow index is 0 unless resize is called...
            dojo.connect(this._summaryGrid, '_onFetchComplete', this, lang.hitch(this, function () { this._summaryGrid.resize(); }));

            if (this._listGrid.selection) {
                this._listGrid.selection.clear();
            }


            if (!this._isConfigurationActiveForSummary()) {
                viewStateKey = this._getViewStateKey();
                this._saveToLocalStorage(viewStateKey, 'summary', this._getViewNS());

                if (this._configuration.summary.hasOwnProperty('rowHeight')) {
                    this._summaryGrid.set('rowHeight', this._configuration.summary.rowHeight);
                }

                if (this._configuration.summary.hasOwnProperty('rowsPerPage')) {
                    this._summaryGrid.set('rowsPerPage', this._configuration.summary.rowsPerPage);
                }

                if (this._configuration.summary.hasOwnProperty('formatterScope')) {
                    this._summaryGrid.set('formatterScope', this._configuration.summary.formatterScope);
                }

                this._summaryGrid.canSort = function (col) {
                    return false;
                };
                this._configuration.summary.active = true;
            }

            this._gridContainer.selectChild(this._summaryGrid);
            this._setDetailPaneVisibility(this._shouldShowDetailPane());
            this._updateToolbarItemVisibility();
        },
        toggleDetail: function () {
            if (!this._hasConfigurationForDetail()) {
                return;
            }

            this.detailVisible = !this.detailVisible;

            this._setDetailPaneVisibility(this._shouldShowDetailPane());
        },
        onRowClick: function (index, row, grid) {
        },
        onRowContextMenu: function (index, row, grid) {
        },
        onSelected: function (index, row, grid) {
        },
        onSelectionChanged: function () {
        },
        resolveProperty: function (propertyName, dataPath /* optional */) {
            var list = this._configuration && this._configuration.list,
                layout = list && list.layout,
                tableAliases = (list && list.tableAliases) || {},
                i,
                item,
                table,
                tableAlias,
                propertyPathSplit,
                propertyNameSplit,
                joinChars = ['<', '>'];


            if (layout) {
                // todo: cache this information
                for (i = 0; i < layout.length; i++) {
                    item = layout[i];

                    // Extract the property name out if in form:
                    // Account.AccountName
                    propertyPathSplit = item.propertyPath && item.propertyPath.split('.');
                    if (propertyPathSplit && propertyPathSplit.length === 2) {
                        propertyPathSplit = propertyPathSplit[1];
                    } else if (propertyPathSplit && propertyPathSplit.length === 1) {
                        propertyPathSplit = propertyPathSplit[0];
                    }

                    propertyNameSplit = propertyName && propertyName.split('.');
                    if (propertyNameSplit && propertyNameSplit.length === 2) {
                        propertyNameSplit = propertyNameSplit[1];
                    } else if (propertyNameSplit && propertyNameSplit.length === 1) {
                        propertyNameSplit = propertyNameSplit[0];
                    }

                    // The filter datapath will be inner, compare against that
                    if (item.dataPath) {
                        array.forEach(joinChars, function (c) {
                            item.dataPath = item.dataPath.replace(c, '=');
                        });
                    }

                    if (item.propertyPath === propertyName || (dataPath && item.dataPath === dataPath) || propertyPathSplit === propertyNameSplit) {
                        if (/^[a-z]\d+_/i.test(item.alias)) {
                            return item.alias;
                        }

                        table = item.dataPath && item.dataPath.split(':')[0];
                        tableAlias = table && tableAliases[table.toUpperCase()];
                        if (tableAlias) {
                            return tableAlias + '.' + item.alias;
                        }

                        return item.alias;
                    }
                }
            }

            return propertyName;
        }
    });

    return listPanel;
});
