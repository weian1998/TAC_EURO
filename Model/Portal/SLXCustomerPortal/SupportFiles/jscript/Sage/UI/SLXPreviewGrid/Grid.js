/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, TabControl */
define([
    'Sage/UI/EditableGrid',
    'dijit/layout/BorderContainer',
    'dijit/form/SimpleTextarea',
    'dijit/_Widget',
    'dijit/_Templated',
    'dojo/i18n!../nls/SLXPreviewGrid',
    'dojo/_base/declare'
],
function (EditableGrid, BorderContainer, SimpleTextarea, _Widget, _Templated, i18nStrings, declare) {
    //dojo.requireLocalization("Sage.UI", "SLXPreviewGrid");
    var Grid = declare("Sage.UI.SLXPreviewGrid.Grid", [_Widget, BorderContainer], {
        // summary: 
        //  Editable grid with support for filter + preview area    

        // i18n strings:
        filterText: 'Filter',
        // end i18n strings

        // Fields    
        // name of sdata resource
        ////    resourceKind: "",
        // name of field to be displayed in preview pane (XXX: do we need a template?)
        previewField: "",
        // array of column configuration objects, with following properties:
        //   - field (SData field)
        //   - name (column header)
        //   - filterConfig: optional filter configuration, the "widgetType" property is 
        //      the type of filter widget to use, the rest is passed to the widget
        //   - width: the width can be specified as a pixel width ('30px')
        columns: null,
        // optional array of tools to be added to the toolbar (see EditableGrid)
        tools: null,
        // SLX context parameter: workspace, tabId
        slxContext: null,
        // optional function to be invoked when the user double clicks a row.  
        // Will be invoked with an "id" parameter (sdata $key for the selected row), 
        //    and the record object itself (use Sage.Utility.getValue to extract data from it)
        dblClickAction: null,
        contextualConditionFunction: null,
        liveSplitters: true,
        gutters: false,
        gridNodeId: '',
        _filter: null, // filter panel
        _grid: null, // EditableGrid instance
        _preview: null, // preview widget
        constructor: function () {
            this.connections = [];
        },
        amIInATab: function () {
            if (this.slxContext && this.slxContext.workspace) {
                return (this.slxContext.workspace.indexOf('TabWorkspace') > -1);
            }
            return false;
        },
        isMyTabVisible: function () {
            if (this.amIInATab() && TabControl) {
                return TabControl.getState().isTabVisible(this.slxContext.tabId);
            }

            return true;
        },

        // Widget lifecycle

        postMixInProperties: function () {
            dojo.mixin(this, i18nStrings);
            this.inherited(arguments);
        },

        buildRendering: function () {
            this.inherited(arguments);

            if (this.previewField) {
                this._preview = this._buildPreview();
            }

            this._filter = this._buildFilter();
            this._grid = this._buildGrid();
        },

        startup: function () {
            if (this._started) {
                return;
            }

            console.warn('ToDo: SLXPreviewGrid needs to connect to tab change events to properly refresh themselves.   SLXPreviewGrid - startup()');
            this.inherited(arguments);

            this.domNode.style.visibility = "visible";
            if (this._preview) {
                var splitter = this.getSplitter('right');
                this.connections.push(dojo.connect(splitter, "_stopDrag", this, function () {
                    this._setPref('previewSize', this._preview.domNode.style.width);
                    this.layout();
                }));
            }
        },

        // Public API

        getSelectedRecords: function (fields) {
            // summary:
            //  Retrieve an array of records selected in the grid.
            // fields:
            //  array of fields to extract data for.  For example, ["LongNotes", "ContactName"].  The returned objects
            //  will be plain JS objects with LongNotes and ContactName properties.
            var selIndices = this._grid.selection.getSelected();
            return dojo.map(selIndices, function (rec) {
                var result = {};
                dojo.forEach(fields, function (fieldName) {
                    result[fieldName] = this._grid.store.getValue(rec, fieldName);
                }, this);
                return result;
            }, this);
        },
        refresh: function () {
            // summary:
            //  Refreshes the grid's data (this does not affect the filter)
            this._grid.refresh();
        },

        setSortIndex: function (index, isAsend) {
            // summary:
            //  Set the Default sort column.
            this._grid.setSortIndex(index, isAsend);
        },
        setSortColumn: function (columnName, isAsend) {
            // summary:
            //  Set the Default sort column.
            var index = 0;
            for (var i = 0; i < this.columns.length; i++) {
                if (columnName === this.columns[i].field) {
                    index = i;
                }
            }
            this._grid.setSortIndex(index, isAsend);
        },

        addAssociatedItems: function () {
            // summary:
            //  Redirects to the grid's methods - this is a convenience for when the grid is used on a QF
            this._grid.addAssociatedItems.apply(this._grid, arguments);
        },

        // Events

        onSelected: function () {
            // summary:
            //  Fires when a record is selected in the grid       
        },

        // Private Helpers
        _buildPreview: function () {
            // summary:
            //  build and return preview widget
            var preview = new SimpleTextarea({
                style: 'height:100%; overflow: auto; width: ' + this._getPref('previewSize', '150px'),
                region: 'right',
                splitter: true,
                readOnly: true
            });
            this.addChild(preview);
            dojo.addClass(preview.domNode, 'preview-grid-text');
            return preview;
        },
        _buildGrid: function () {
            // summary:
            //  build and return grid widget        
            var tools = [];
            if (this._filter) {
                tools.push({
                    id: this.id + '_Filter',
                    imageClass: 'icon_Filter_16x16',
                    tooltip: this.filterText,
                    handler: dojo.hitch(this, function () {
                        this._filter.toggle();
                        this.layout();
                    })
                });
            }
            if (this.tools) {
                dojo.forEach(this.tools, function (item) { tools.push(item); });
            }

            var contextualCondition = { fn: this.contextualConditionFunction ||
                this.contextualCondition, conditions: this._filter ? this._filter.getQuery() : null
            };

            if (!this.storeOptions) {
                throw ("SLXPreviewGrid configuration is missing storeOptions");
            }

            this.storeOptions.select = this.storeOptions.select || [];
            this.storeOptions.select.push('Id');
            this.storeOptions.select.push(this.previewField);
            var grid = new EditableGrid({
                id: this.domNode.id + "_grid",
                gridNodeId: this.id,
                tabId: this.slxContext.tabId,
                context: this.slxContext,
                region: 'center',
                columnDefaults: { editable: false },
                //readOnly: true,
                columns: this.columns,
                tools: tools,
                contextualCondition: contextualCondition,
                storeOptions: this.storeOptions,
                keepSelection: true
            });

            this.connections.push(dojo.connect(grid, 'onSelected', this, this._updatePreviewText));
            this.connections.push(dojo.connect(grid.store, 'onSuccess', this, this._updatePreviewText));

            if (this.dblClickAction) {
                dojo.connect(grid, 'onRowDblClick', this, function (e) {
                    // Edit the selected item.
                    var rec = grid.getItem(e.rowIndex);
                    var id = grid.store.getValue(rec, "$key");
                    this.dblClickAction(id, rec);
                });
            }
            if (this._filter) {
                dojo.connect(this._filter, 'onFilterApply', this, function (conditions) {
                    contextualCondition.conditions = this._filter.getQuery();
                    grid.refresh();
                });
            }

            this.addChild(grid);
            return grid;
        },
        destroy: function () {
            var len = this.connections.length;
            for (var i = 0; i < len; i++) {
                dojo.disconnect(this.connections.pop());
            }
            this.inherited(arguments);
        },
        resetContextualCondition: function (contextualConditionFunction) {

            this.contextualConditionFunction = contextualConditionFunction;
            var contextualCondition = { fn: this.contextualConditionFunction ||
                this.contextualCondition, conditions: this._filter ? this._filter.getQuery() : null
            };
            this._grid.resetContextualCondition(contextualCondition);

        },
        _updatePreviewText: function () {
            if (this.previewField) {
                // Update the preview textbox.
                var sel = this._grid.selection.getSelected();
                var note = '';
                if (sel.length > 0 && sel[0]) {
                    note = sel[0][this.previewField] || this._grid.store.getValue(sel[0], this.previewField);
                }
                this._preview.set('value', note);
            }
        },
        _buildFilter: function () {
            // summary:
            //  build and return filter widget.
            //  If the grid has no filter configuration then it will return null.

            var filterConfig = [];
            dojo.forEach(this.columns, function (cc) {
                if (cc.filterConfig) {
                    // the filterconfig is supplemented with the column config itself, this way we keep the same label etc.
                    var fc = dojo.mixin(dojo.clone(cc), cc.filterConfig);
                    if (!fc.label) {
                        fc.label = cc.name;
                    }
                    filterConfig.push(fc);
                }
            });
            if (filterConfig.length === 0) {
                return null;
            }
            var filter = new Sage.UI.SLXPreviewGrid.FilterPanel({
                id: this.id + '_filterpanel',
                region: 'top',
                filterConfig: filterConfig,
                style: 'display: none'
            });
            this.addChild(filter);

            return filter;
        },
        _getPref: function (prefName, defaultValue) {
            var storage = window['localStorage'];
            var key = this.id + prefName;
            if (storage && storage[key]) {
                return storage[key];
            }
            return defaultValue;
        },
        _setPref: function (prefName, value) {
            var storage = window['localStorage'];
            if (storage) {
                storage[this.id + prefName] = value;
            }
        }

    });
    return Grid;
});