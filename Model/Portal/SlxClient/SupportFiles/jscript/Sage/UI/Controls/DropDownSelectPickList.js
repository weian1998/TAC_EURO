/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dijit/_Widget',
       'dijit/form/ComboBox',
       'dojo/data/ItemFileReadStore',
       'dojo/data/ObjectStore',
       'dojo/store/Memory',
       'Sage/UI/ComboBox',
       'Sage/UI/Controls/PickList',
       'dojo/_base/array',
       'dojo/text!./templates/DropDownSelectPickList.html',
       'dojo/_base/declare'
],
function (_TemplatedMixin, _WidgetsInTemplateMixin, _Widget, comboBox, itemFileReadStore, objectStore, memory, sageComboBox, pickList, array, template, declare) {
    /**
     * @class Class for dropdown select picklists. Used in search condition widgets.
     */
    var widget = declare('Sage.UI.Controls.DropDownSelectPickList', [pickList, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

        /**
         * Takes the following options object: 
         * {
         *  pickListName: 'PickListName', // Required
         *  storeOptions: {}, // Optional
         *  dataStore: {}, // Option
         *  canEditText: false,
         *  itemMustExist: true,
         *  maxLength: -1,
         *  storeMode: 'text', // text, id, code
         *  sort: true,
         *  displayMode: 'AsControl',
         *  clientId: 'ASP.NET Control ClientID Here',
         *  required: false
         * }
         *
         * @constructor
         */
        constructor: function(options) {
            if(options.clientId) {
                this.id = options.clientId + '-DropDownSelectPickList';
            }
            
            this.inherited(arguments);
        },
        postCreate: function () {            
            this.inherited(arguments);
        },
        _onChange: function (newVal) {
            this.onChange(newVal);
        },
        _loadData: function() {
            var def = new dojo.Deferred();
            this.getPickListData(def);

            def.then(dojo.hitch(this, function(data) {
                if(typeof data === 'string') {
                    this.comboBox.set('value', data);
                }

                var items = [];
                for(var i = 0; i < data.items.$resources.length; i++) {
                    var item = data.items.$resources[i];
                    items.push({
                        id: item.$key,
                        code: item.code,
                        number: item.number,
                        text: item.text
                    });
                }

                this.storeData = {
                    identifier: 'id',
                    label: 'text',
                    items: items
                };

                var tempStore = new itemFileReadStore({data: this.storeData});
                this.comboBox.set('store', tempStore);
                this.comboBox.set('searchAttr', 'text');

            }), function(e) {
                // errback
                console.error(e);
            });
        },
        uninitialize: function() {
            this.inherited(arguments);
        },
        _getValueAttr: function() {
            var results = this.comboBox.get('value');
            
            if (this.storeMode === 'id') {
                array.forEach(this.storeData.items, function (item) {
                    // donotlint
                    if (results == item.text) {
                        results = item.id;
                    }
                }, this);
            }
            return results;
        },
        _setPickListNameAttr: function(value) {
            this.inherited(arguments);
            this._loadData();
        },
        value: '',
        // Display properties
        templateString: template,
        widgetsInTemplate: true,

        /**
         * @property {object} storeData Data fetched from SData stored here.
         */
        storeData: null,

        // TODO: Remove
        /**
         * @property {string} lastValidValue Last valid value entered into the control.
         */
        lastValidValue: '',
        onChange: function (newVal) { }
    });

    return widget;
});

