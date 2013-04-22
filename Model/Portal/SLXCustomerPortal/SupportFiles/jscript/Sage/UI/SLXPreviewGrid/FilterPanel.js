/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/form/Button',
        'dijit/_Widget',
        'Sage/Utility/_LocalStorageMixin',
        'dojo/i18n!../nls/SLXPreviewGrid',
        'dojo/_base/declare'
],
function (Button, _Widget, _LocalStorageMixin, previewGridStrings, declare) {
    var filterPanel = declare("Sage.UI.SLXPreviewGrid.FilterPanel", [_Widget, _LocalStorageMixin], {
        // summary:
        //  Master filter panel for the grid.
        //  At construction time the "filterConfig" option should be set to an array of filter configuration objects.
        //  They must contain a property "widgetType" - type of the widget to instantiate (must have a "getQuery" method)
        //  and should have a "field" property, which usually will be used by the filter widget to build the query,
        //  and a "label" property.
        //  The rest of the options are passed down to that widget's constructor.
        // array of filter widgets
        _filters: null,
        _state: {},
        STORE_NS: 'SAGE_UI_EDITABLEGRID', //this is the same as the grid
        STORE_KEY_FILTERINFO: '_FILTER_INFO_',

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
            dojo.mixin(this, previewGridStrings);
            this._loadState();
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

            var filterStates = this._state['filterStates'] || {};
            var target = left;
            dojo.forEach(this.filterConfig, function (item, index, ar) {

                if (target === left && index + 1 > ar.length / 2) {
                    target = right;
                }
                var filterItem = document.createElement("div");
                filterItem.className = "filterItem";
                var filter = this._createFilter(item);
                if (filterStates[item.field] && filter.applyState) {
                    filter.applyState(filterStates[item.field]);
                }
                this._filters.push(filter);
                if (item.label) {
                    var lbl = document.createElement("label");
                    lbl.appendChild(document.createTextNode(item.label + ":"));
                    lbl.className = "filterPanelLabel";
                    lbl.htmlFor = filter.domNode.id;
                    filterItem.appendChild(lbl);
                }
                filterItem.appendChild(filter.domNode);
                target.appendChild(filterItem);
            }, this);

            // create apply / reset buttons and add to right columns
            var btnPanel = document.createElement("div");
            btnPanel.style.styleFloat = btnPanel.style.cssFloat = "left";
            btnPanel.style.width = "20%";
            btnPanel.className = "filterButtonPanel";
            var btnOk = new Button({ label: this.applyText });
            btnPanel.appendChild(btnOk.domNode);
            dojo.connect(btnOk, "onClick", this, "_applyFilter");
            var btnReset = new Button({ label: this.resetText });
            btnPanel.appendChild(btnReset.domNode);
            dojo.connect(btnReset, "onClick", this, "_resetFilter");
            dojo.connect(this.domNode, "keydown", this, function (e) {
                if (e.keyCode === 13) {
                    this._applyFilter();
                }
            });

            this.domNode.appendChild(left);
            this.domNode.appendChild(right);
            this.domNode.appendChild(btnPanel);
        },
        startup: function () {
            this.inherited(arguments);
            dojo.forEach(this._filters, function (item) { item.startup(); });
            if (this._state['visible'] && this._state['visible'] === true) {
                this.toggle();
            }
        },
        destroy: function () {
            dojo.forEach(this._filters, function (item) {
                item.destroy(false);
            });

            dojo.forEach(dijit.findWidgets(this.domNode), function (wid) {
                wid.destroy(false);
            });

            this.inherited(arguments);
        },
        /////////////////////////////////////
        // Public API

        getQuery: function () {
            // summary:
            //  build and return the sdata query string for the filter.  If no conditions are specified then it will return null.
            var c = [];
            dojo.forEach(this._filters, function (f) {
                var q = f.getQuery();
                if (q) {
                    c.push(q);
                }
            });
            return c.length > 0 ? c.join(" and ") : null;
        },

        toggle: function () {
            if (this.domNode.style.display === "none") {
                this.domNode.style.display = "block";
                this._state['visible'] = true;
            }
            else {
                this.domNode.style.display = "none";
                this._state['visible'] = false;
            }
            this._saveState();
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
            var filterStates = {};
            for (var i = 0; i < this._filters.length; i++) {
                var f = this._filters[i];
                if (f.getState) {
                    filterStates[f.field] = f.getState();
                }
            }
            this._state['filterStates'] = filterStates;
            this._saveState();
            this.onFilterApply(this.getQuery());
        },

        _resetFilter: function () {
            dojo.forEach(this._filters, function (f) { f.reset(); });
            this._applyFilter();
        },

        _saveState: function () {
            var key = this.STORE_KEY_FILTERINFO + this.id;
            this.saveToLocalStorage(key, this._state, this.STORE_NS);
        },
        _loadState: function () {
            var key = this.STORE_KEY_FILTERINFO + this.id;
            this._state = this.getFromLocalStorage(key, this.STORE_NS) || {};
        }
    });

    return filterPanel;
});