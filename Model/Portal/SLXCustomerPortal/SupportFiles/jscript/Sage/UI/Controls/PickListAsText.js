/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'dijit/_Templated',
       'dojo/data/ItemFileReadStore',
       'dojo/data/ObjectStore',
       'dojo/store/Memory',
       'Sage/UI/Controls/PickList',
       'dojo/text!./templates/PickListAsText.html',
       'dojo/_base/declare'
],
function (_Widget, _Templated, itemFileReadStore, objectStore, memory, pickList, template, declare) {
    /**
     * @class Class for single select picklists.
     */
    var widget = declare('Sage.UI.Controls.PickListAsText', [pickList, _Widget, _Templated], {

        /**
         * Takes the following options object: 
         * {
         *  pickListName: 'PickListName', // Required
         *  storeOptions: {}, // Optional
         *  dataStore: {}, // Option
         *  storeMode: 'text', // text, id, code
         *  sort: true,
         *  displayMode: 'AsText',
         *  clientId: 'ASP.NET Control ClientID Here',
         *  required: false
         * }
         *
         * @constructor
         */
        constructor: function(options) {
            if(options.clientId) {
                this.id = options.clientId + '-PickListAsText';
            }

            this.inherited(arguments);
        },
        _loadData: function() {
            var def = new dojo.Deferred();
            this.getPickListData(def);

            def.then(dojo.hitch(this, function(data) {
                if(typeof data === 'string') {
                    this.textSpan.innerHTML = data;
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
                
                var existingText = dojo.byId(this.textId);
                var existingId = dojo.byId(this.codeId);

                // TODO: Refactor this
                if (existingText && existingText.value) {
                    //this is here when the server control added it to the dom with a value in it
                    this.initialValue = existingText.value;
                    this.textSpan.innerHTML = this.initialValue;
                }

                if (!this.initialCode && existingId && existingId.value) {
                    this.initialCode = existingId.value;
                }

                if (this.initialCode){
                    var storeItem = this.getStoreItemById(this.initialCode);
                    if(storeItem) {
                        this.initialValue = storeItem.text;
                        this.textSpan.innerHTML = this.initialValue;
                    }
                }
            }), function (e) {
                // errback
                console.error(e);
            });
        },
        getStoreItemById: function(id) {
            if(this.storeData) {
                var results = null;
                dojo.forEach(this.storeData.items, function(item, index, array) {
                    //console.log(item.id + ' === ' + id);
                    if(item.id === id) {
                        results = item;
                    }
                } ,this);
            }
            
            return results;
        },
        _setPickListNameAttr: function(value) {
            this.inherited(arguments);
            this._loadData();
        },
        // Display properties
        templateString: template,
        widgetsInTemplate: true,

        /**
         * @property {object} storeData Data fetched from SData stored here.
         */
        storeData: null,

        /**
         * @property {string} initialValue Initial value set to the control, if any.
         */
        initialValue: '',
        initialCode: '',
        textId: '',
        codeId: ''
    });

    return widget;
});

