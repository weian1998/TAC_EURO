/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'dijit/_Contained',
       'dojo/NodeList-traverse',
       'Sage/_Templated',
       'Sage/_ActionMixin',
       'dojo/string',
       'dojo/_base/lang',
       'dojo/_base/array',
       'dijit/form/Select',
       'dijit/form/TextBox',
       'dojo/on',
       'dojo/i18n!../nls/ConditionManager',
       'dojo/_base/declare'
],
function (
        _Widget,
        _Contained,
        NodeList,
        _Templated,
        _ActionMixin,
        dString,
        lang,
        array,
        Select,
        TextBox,
        on,
        conditionManagerResource,
        declare) {
    var widget = declare('Sage.UI.Filters.LookupFilter', [_Widget, _Contained, _ActionMixin, _Templated], {
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div class="filter-type-checkbox filter-collapsed">',
                '<h3 data-action="toggleExpand" data-dojo-attach-point="filterNameNode">{%: $.filter.displayName || $.filter.filterName %}',
                '</h3>',
                '<ul class="filter-list" data-dojo-attach-point="listNode">',
                '<select class="lookup-filter-operators" data-dojo-attach-point="operators" data-dojo-type="dijit.form.Select"></select><br/>',
                '<input class="filter-lookup-input" data-dojo-attach-point="textInput" data-dojo-type="dijit.form.TextBox" />',
                '</ul>',
            '</div>'
        ]),
        _loaded: false,
        _filterGroup: 'default',
        appliedValues: null,
        _hasApplied: false,
        operatorsMapping: {
            'Equal': conditionManagerResource.equalTo,
            'NotEqual': conditionManagerResource.notEqualTo,
            'LessThan': conditionManagerResource.lessThan,
            'LessThanEqual': conditionManagerResource.equalOrLessThan,
            'GreaterThan': conditionManagerResource.greaterThan,
            'GreaterThanEqual': conditionManagerResource.equalOrGreaterThan,
            'StartsWith': conditionManagerResource.startingWith,
            'EndsWith': conditionManagerResource.endsWith,
            'Contains': conditionManagerResource.contains
        },
        filter: null,
        store: null,
        _autoSearchHandle: null,
        _autoSearchDelay: 1000,
        _selectedOp: 'Contains',
        postMixInProperties: function () {
            this.inherited(arguments);
            if (this.appliedValues) {
                setTimeout(lang.hitch(this, this.toggleExpand), 500);               
            }
        },
        postCreate: function () {
            this.inherited(arguments);
            this.textInput.on('keyDown', lang.hitch(this, this._onInputKeyDown));
            if (this.appliedValues) {
                this.textInput.set('value', this.appliedValues.value.value);
                this._selectedOp = this.appliedValues.value.operator;
                this._hasApplied = true;
            }
       
        },
        _setupAutoSearch: function () {
            if (this._autoSearchHandle > 0) {
                window.clearTimeout(this._autoSearchHandle);
            }

            this._autoSearchHandle = setTimeout(lang.hitch(this, function () {
                this.doSearch();
            }), this._autoSearchDelay);
        },
        uninitialize: function() {
            this.inherited(arguments);
        },
        toggleExpand: function(params, evt, el) {
            var ops = this.filter &&
                        this.filter.details && 
                        this.filter.details.userLookupFilter &&
                        this.filter.details.userLookupFilter.operators;
            if (this.domNode) {
                dojo.toggleClass(this.domNode, 'filter-collapsed');
            }
            if(this.operators){
                if (!this._loaded) {
                    this._loaded = true;
                    array.forEach(ops, lang.hitch(this, function (op) {
                        opSelected = false;
                        if (op === this._selectedOp) {
                            opSelected = true;
                        }
                        this.operators.addOption({
                            disabled: false,
                            label: this.operatorsMapping[op],
                            selected: opSelected,
                            value: op
                        });
                    }));
                   this.operators.set('value', this._selectedOp);
                }     

            }
        },
        _onInputKeyDown: function (event) {
            if (event.keyCode === 13 || event.keyCode === 0) {
                this.doSearch();
            } else {
                // Any time a key other than enter is pressed,
                // reset the auto search timeout
                this._setupAutoSearch();
            }
        },
        doSearch: function () {
            var value,
                name = this.filter.filterName,
                source = this;
                
            value = {
                operator: this.operators.get('value'),
                value: this.textInput.get('value')
            };
            
            this.onSelectionChange(name, value, source);
        },
        onSelectionChange: function(name, value, source) {
            dojo.publish(dString.substitute("/ui/filters/${0}/change", [this._filterGroup]), [this.filter, name, value, source]);
        }
    });

    return widget;
});