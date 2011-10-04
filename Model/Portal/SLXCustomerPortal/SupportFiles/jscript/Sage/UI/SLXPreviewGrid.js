dojo.provide("Sage.UI.SLXPreviewGrid");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.i18n");
dojo.requireLocalization("Sage.UI", "SLXPreviewGrid");


//////////////////////////// Filter Widgets

dojo.provide("Sage.UI.SLXPreviewGrid.Filter.Text");
dojo.require("dijit.form.TextBox");

dojo.declare("Sage.UI.SLXPreviewGrid.Filter.Text", dijit.form.TextBox, {
    // summary:
    //  a simple free-form text filter.  by default a "contains" search is performed
    postMixInProperties: function () {
        this.set('type', 'text');
        this.inherited(arguments);
    },

    /////////////////////////////////////
    // Public API
    getQuery: function () {
        var v = this.get('value');
        if (v) {
            return this.field + " like '%" + v.replace("'", "''") + "%'";
        }
        return "";
    },

    reset: function () {
        this.set('value', '');
    }
});

dojo.provide("Sage.UI.SLXPreviewGrid.Filter.DateRange");
dojo.require("dijit.form.DateTextBox");

dojo.declare("Sage.UI.SLXPreviewGrid.Filter.DateRange", [dijit._Widget, dijit._Templated], {
    // summary:
    //  Date range filter
    templateString: "<div>" +
    "<input dojoType='dijit.form.DateTextBox' dojoAttachPoint='dteFrom' style='width:90px'> - " +
    "<input dojoType='dijit.form.DateTextBox' dojoAttachPoint='dteTo' style='width:90px'>" +
    "</div>",
    widgetsInTemplate: true,

    /////////////////////////////////////
    // Public API
    getQuery: function () {
        var toIsoStringFromDate = function (value, isUpperBound) {
            // format to ISO
            // if isUpperBound is true it will add 1 day (used for upper bound in date range)
            if (!value)
                return '';
            if (value.constructor !== Date)
                value = Date.parse(value);
            if (isUpperBound)
                value.setUTCDate(value.getUTCDate() + 1);
            var pad = function (n) { return n < 10 ? '0' + n : n };
            // adapted from: https://developer.mozilla.org/en/JavaScript/Reference/global_objects/date
            return value.getUTCFullYear() + '-'
                    + pad(value.getUTCMonth() + 1) + '-'
                    + pad(value.getUTCDate()) + 'T'
                    + pad(value.getUTCHours()) + ':'
                    + pad(value.getUTCMinutes()) + ':'
                    + pad(value.getUTCSeconds()) + 'Z';
        }
        var dFrom = toIsoStringFromDate(this.dteFrom.get('value'));
        var dTo = toIsoStringFromDate(this.dteTo.get('value'), true);
        var qry = '';
        if (dFrom)
            qry = this.field + " ge '" + dFrom + "'";
        if (dTo) {
            if (qry)
                qry += " and ";
            qry += this.field + " lt '" + dTo + "'";
        }
        return qry;
    },

    reset: function () {
        this.dteFrom.set('value', '');
        this.dteTo.set('value', '');
    }
});

dojo.require("Sage.UI.PickList");
dojo.declare("Sage.UI.SLXPreviewGrid.Filter.PickList", [Sage.UI.PickList], {
    getQuery: function () {
        var v = this.get('value');
        if(v) 
            return this.field + " eq '" + v.replace("'", "''") + "'";
        return "";
    },
    reset: function () {
        this.set('value', '');
    }
});

dojo.provide("Sage.UI.SLXPreviewGrid.FilterPanel");
dojo.require("dijit.form.Button");

dojo.declare("Sage.UI.SLXPreviewGrid.FilterPanel", [dijit._Widget], {
    // summary:
    //  Master filter panel for the grid.
    //  At construction time the "filterConfig" option should be set to an array of filter configuration objects.
    //  They must contain a property "widgetType" - type of the widget to instantiate (must have a "getQuery" method)
    //  and should have a "field" property, which usually will be used by the filter widget to build the query,
    //  and a "label" property.
    //  The rest of the options are passed down to that widget's constructor.
    // array of filter widgets
    _filters: null,

    //i18n strings:
    applyText: 'Apply',
    resetText: 'Reset',
    //end i18n strings.

    /////////////////////////////////////
    // Widget lifecycle

    constructor: function () {
        this._filters = [];
    },
    postMixInProperties: function () {
        dojo.mixin(this, dojo.i18n.getLocalization('Sage.UI', 'SLXPreviewGrid', this.lang));
        this.inherited(arguments);
    },
    buildRendering: function () {
        // summary:
        //  build the child filter widgets
        this.inherited(arguments);
        this.domNode.className = "filterPanel";
        var left = document.createElement("div");
        left.style.styleFloat = left.style.cssFloat = "left";
        left.style.width = "39%";
        var right = document.createElement("div");
        right.style.styleFloat = right.style.cssFloat = "left";
        right.style.width = "39%";

        var target = left;
        dojo.forEach(this.filterConfig, function (item, index, ar) {
            
            if (target === left && index+1 > ar.length / 2)
                target = right;

            var filterItem = document.createElement("div");
            filterItem.className = "filterItem";
            var filter = this._createFilter(item);
            this._filters.push(filter);
            if (item.label) {
                var lbl = document.createElement("label");
                lbl.appendChild(document.createTextNode(item.label+":"));
                lbl.className = "twocollbl";
                lbl.style.clear = "both";
                lbl.htmlFor = filter.domNode.id;
                filterItem.appendChild(lbl);
                //target.appendChild(lbl);
            }
            filterItem.appendChild(filter.domNode);
            target.appendChild(filterItem);
            //target.appendChild(document.createElement("br"));
        }, this);

        // create apply / reset buttons and add to right columns
        var btnPanel = document.createElement("div");
        btnPanel.style.styleFloat = btnPanel.style.cssFloat = "left"
        btnPanel.style.width = "20%";
        btnPanel.className = "filterButtonPanel";
        var btnOk = new dijit.form.Button({ label: this.applyText });
        btnPanel.appendChild(btnOk.domNode);
        dojo.connect(btnOk, "onClick", this, "_applyFilter");
        var btnReset = new dijit.form.Button({ label: this.resetText });
        btnPanel.appendChild(btnReset.domNode);
        dojo.connect(btnReset, "onClick", this, "_resetFilter");
        //right.appendChild(btnPanel);
        dojo.connect(this.domNode, "keydown", this, function (e) {
            if (e.keyCode == 13)
                this._applyFilter();
        });

        this.domNode.appendChild(left);
        this.domNode.appendChild(right);
        this.domNode.appendChild(btnPanel);
    },
    startup: function () {
        this.inherited(arguments);
        dojo.forEach(this._filters, function (item) { item.startup(); });
    },

    /////////////////////////////////////
    // Public API

    getQuery: function () {
        // summary:
        //  build and return the sdata query string for the filter.  If no conditions are specified then it will return null.
        var c = [];
        dojo.forEach(this._filters, function (f) {
            var q = f.getQuery();
            if (q)
                c.push(q);
        });
        return c.length > 0 ? c.join(" and ") : null;
    },

    toggle: function () {
        if (this.domNode.style.display === "none")
            this.domNode.style.display = "block";
        else
            this.domNode.style.display = "none";
    },

    /////////////////////////////////////
    // Events

    onFilterApply: function (conditions) {
        // summary:
        //  callback when the filter should be applied
        // conditions:
        //  conditions query string
    },

    /////////////////////////////////////
    // Private Helpers

    _createFilter: function (filterConfig) {
        // summary:
        //  instantiate and return a filter widget
        var c = filterConfig.widgetType;
        return new c(filterConfig);
    },

    _applyFilter: function () {
        this.onFilterApply(this.getQuery());
    },

    _resetFilter: function () {
        dojo.forEach(this._filters, function (f) { f.reset() });
        this._applyFilter();
    }
});




//////////////////////////// Core Grid Widget

dojo.provide("Sage.UI.SLXPreviewGrid.Grid");
dojo.require('Sage.UI.SLXTabGrid');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.form.SimpleTextarea');

dojo.declare("Sage.UI.SLXPreviewGrid.Grid", [dijit._Widget], {
    // summary: 
    //  Enhanced grid with support for filter + preview area    

    // i18n strings:
    filterText: 'Filter',
    // end i18n strings

    /////////////////////////////////////
    // Fields    
    ////    // name of sdata resource
    ////    resourceKind: "",
    // name of field to be displayed in preview pane (XXX: do we need a template?)
    previewField: "",
    // array of column configuration objects, with following properties:
    //   - field (SData field)
    //   - name (column header)
    //   - filterConfig: optional filter configuration, the "widgetType" property is the type of filter widget to use, the rest is passed to the widget
    //   - width: the width can be specified as a pixel width ('30px'), or '*' to use (approximately) the remaining width
    columnConfig: null,
    // optional array of tools to be added to the toolbar (see SLXTabGrid)
    toolConfig: null,
    // SLX context parameter: workspace, tabId
    slxContext: null,
    // optional function to be invoked when the user double clicks a row.  Will be invoked with an "id" parameter (sdata $key for the selected row), 
    //    and the record object itself (use Sage.Utility.getValue to extract data from it)
    dblClickAction: null,
    contextualConditionFunction: null,
    // default height - this is only used if srcNodeRef is not provided, otherwise we fetch its height
    height: 300,

    _filter: null, // filter panel
    _grid: null, // SLXTabGrid instance
    _preview: null, // preview widget
    _container: null, // border container

    amIInATab: function () {
        if (this.slxContext && this.slxContext.workspace) {
            return (this.slxContext.workspace.indexOf('TabWorkspace') > -1);
        }
        return false;
    },
    isMyTabVisible: function () {
        if (this.amIInATab()) {
            return TabControl.getState().isTabVisible(this.slxContext.tabId);
        }
        return true;
    },

    /////////////////////////////////////
    // Widget lifecycle

    postMixInProperties: function () {
        dojo.mixin(this, dojo.i18n.getLocalization('Sage.UI', 'SLXPreviewGrid', this.lang));
        this.inherited(arguments);
    },

    buildRendering: function () {
        this.inherited(arguments);

        var childDiv = document.createElement("div");
        if (!this.domNode.style.height)
            this.domNode.style.height = this.height + 'px';
        var bounds = dojo.marginBox(this.domNode);
        // the returned box appears to be dynamic...
        // this captures and fixes the bounds
        bounds = { w: bounds.w, h: bounds.h };

        this.domNode.style.visibility = "hidden";  // hide while building
        childDiv.style.height = this.domNode.style.height;
        this.domNode.appendChild(childDiv);
        var border = new dijit.layout.BorderContainer({
            liveSplitters: false, gutters: false
        }, childDiv);

        this._container = border;

        if (this.previewField)
            this._preview = this._buildPreview(bounds.h);
        // TODO: ideally we should build the filter only when it is shown.
        //   However, the filter widgets are used for some of the default conditions (for example the "show db changes" checkbox), 
        //   so we do need them to be available when the grid loads.
        this._filter = this._buildFilter();
        this._grid = this._buildGrid(bounds.h, bounds.w);
    },

    startup: function () {
        if (this._started) {
            return;
        }

        if (!this.isMyTabVisible()) {
            if (this.hasTabListeners) {
                return;
            }
            if (typeof TabControl !== 'undefined') {
                this.moreTabListener = TabControl.addListener('moretabchange', this.startup, this);
                this.mainTabListener = TabControl.addListener('maintabchange', this.startup, this);
                this.hasTabListeners = true;
                return;
            }
        } else {
            if (this.hasTabListeners) {
                TabControl.removeListener('moretabchange', this.startup, this);
                TabControl.removeListener('maintabchange', this.startup, this);
                this.hasTabListeners = false;
            }
        }

        this.inherited(arguments);

        this._container.startup();
        this.domNode.style.visibility = "visible";
        var splitter = this._container.getSplitter('right');
        dojo.connect(splitter, "_stopDrag", this, function () {
            this._setPref('previewSize', this._preview.domNode.style.width);
        });
    },

    /////////////////////////////////////
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
        for (var i = 0; i < this.columnConfig.length; i++) {
            if (columnName === this.columnConfig[i].field) {
                index = i;
            }
        }

        this._grid.setSortIndex(index, isAsend);
    },

    /////////////////////////////////////
    // Events

    onSelected: function () {
        // summary:
        //  Fires when a record is selected in the grid       
    },

    /////////////////////////////////////
    // Private Helpers

    _buildPreview: function (height) {
        // summary:
        //  build and return preview widget
        var preview = new dijit.form.SimpleTextarea({
            style: 'height: ' + height + 'px; width: ' + this._getPref('previewSize', '150px'),
            region: 'right', splitter: true, readOnly: true
        });
        this._container.addChild(preview);
        return preview;
    },

    _buildGrid: function (height, width) {
        // summary:
        //  build and return grid widget        
        var tools = [];
        if (this._filter)
            tools.push({
                id: 'Filter', 
                icon: 'images/icons/Filter_16x16.png',
                alternateText: this.filterText,
                handler: dojo.hitch(this, function () {
                    this._filter.toggle();
                    this._container.layout();
                })
            });
        if (this.toolConfig) {
            dojo.forEach(this.toolConfig, function (item) { tools.push(item) });
        }
        // prepare column widths, support '*' width specifier
        var colWidth = 0;
        dojo.forEach(this.columnConfig, function (col) {
            if (col.width && !isNaN(parseInt(col.width)))
                colWidth += parseInt(col.width) // we hope they specified it in px!  
                            + 12;     // the 12 is for padding, maybe this should be dynamic?
        });
        // now apply to any '*' column.  Note this will not work well if you have more than 1
        dojo.forEach(this.columnConfig, function (col) {
            if (col.width === '*') {
                var remainder = width - colWidth
                            - (this._preview ? parseInt(this._preview.domNode.style.width) : 0)
                            - 36;    // gutters, padding, whatever
                if (remainder > 30)
                    col.width = remainder + 'px';
                else
                // XXX "sometimes" the width is not calculated correctly... this provides a reasonable default in those cases
                    col.width = '300px';
            }
        }, this);

        var contextualCondition = { fn: this.contextualConditionFunction, conditions: this._filter ? this._filter.getQuery() : null };

        if (!this.storeOptions) {
            throw ("SLXPreviewGrid configuration is missing storeOptions");
        }

        this.storeOptions.select = this.storeOptions.select || [];
        this.storeOptions.select.push('Id');
        this.storeOptions.select.push(this.previewField);

        var grid = new Sage.UI.SLXTabGrid({
            id: this.domNode.id + "_grid",  // id is required by some of the SLXTabGrid stuff
            tabId: this.slxContext.tabId,
            context: this.slxContext,
            region: 'center',
            height: height + 'px',
            columnDefaults: { editable: false },
            //readOnly: true,
            columns: this.columnConfig,
            tools: tools,
            contextualCondition: contextualCondition,
            storeOptions: this.storeOptions
        });


        dojo.connect(grid, 'onSelected', this, function (itemIndex) {
            if (this.previewField) {
                // Update the preview textbox.
                // TODO: we may need to populate this field from the database, with some sort of rate limit
                var rec = grid.getItem(itemIndex);
                var note = grid.store.getValue(rec, this.previewField);
                this._preview.set('value', note);
            }
            this.onSelected();
        });

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

        this._container.addChild(grid);
        return grid;
    },

    _buildFilter: function () {
        // summary:
        //  build and return filter widget.
        //  If the grid has no filter configuration then it will return null.

        var filterConfig = [];
        dojo.forEach(this.columnConfig, function (cc) {
            if (cc.filterConfig) {
                var fc = dojo.mixin(dojo.clone(cc), cc.filterConfig);
                if (!fc.label)
                    fc.label = cc.name;
                filterConfig.push(fc);
            }
        });
        if (filterConfig.length == 0)
            return null;

        var filter = new Sage.UI.SLXPreviewGrid.FilterPanel({
            region: 'top',
            filterConfig: filterConfig,
            style: 'display: none'
        });
        this._container.addChild(filter);

        return filter;
    },

    _getPref: function (prefName, defaultValue) {
        var storage = window['localStorage'];
        var key = this.id + prefName;
        if (storage && storage[key])
            return storage[key];
        return defaultValue;
    },

    _setPref: function (prefName, value) {
        var storage = window['localStorage'];
        if (storage)
            storage[this.id + prefName] = value;
    }

});


