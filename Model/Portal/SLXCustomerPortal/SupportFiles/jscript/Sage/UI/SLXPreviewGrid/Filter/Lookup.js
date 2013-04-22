/*globals Sage, dojo, define */
define([
    'dojo/_base/declare',
    'dijit/_Widget',
    'Sage/UI/SLXPreviewGrid/Filter/_previewGridFilterMixin'
],
function (declare, _Widget, _filterMixin) {
    var lookupFilter = declare('Sage.UI.SLXPreviewGrid.Filter.Lookup', [_Widget, _filterMixin], {
        okText: 'OK',
        //These properties can come from the column configuration if it is a lookup column
        // type, or they can come directly from the filterConfig.
        lookupStructure: [],
        lookupGridOptions: {},
        lookupStoreOptions: {},
        postCreate: function () {
            this.inherited(arguments);
            var lupConfig = {
                structure: this.lookupStructure,
                gridOptions: this.lookupGridOptions,
                storeOptions: this.lookupStoreOptions,
                isModal: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.name,
                dialogButtonText: this.okText
            };
            this._lup = new Sage.UI.Controls.Lookup({
                id: this.id + '_lup',
                config: lupConfig,
                required: false
            }, this.domNode);
            var div = document.createElement('div');
            this.domNode.appendChild(div);
            dojo.place(this._lup.domNode, div, 'only');
        },
        getQuery: function () {
            var obj = this._lup.get('selectedObject');
            if (obj && obj['$key']) {
                return this.field + ' eq \'' + obj['$key'] + '\'';
            }
            return '';
        },
        reset: function () {
            this._lup.set('selectedObject', null);
        },
        getState: function () {
            return { 'value': this._lup.get('selectedObject') };
        },
        applyState: function (state) {
            if (state) {
                this._lup.set('selectedObject', state['value'] || '');
            }
        }
    });
    return lookupFilter;
}
);