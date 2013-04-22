/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dijit/_Widget',
       'dijit/form/ComboBox',
       'dojo/data/ItemFileReadStore',
       'Sage/Data/BaseSDataStore',
       'Sage/Data/SDataServiceRegistry',
       'Sage/UI/ComboBox',
       'dojo/text!./templates/DropDownSelectUser.html',
       'dojo/_base/declare'
],
function (_TemplatedMixin, _WidgetsInTemplateMixin, _Widget, comboBox, itemFileReadStore, baseSDataStore, _SDataServiceRegistry, sageComboBox, template, declare) {
    /**
     * @class Search Condition "user" widget.
     */
    var widget = declare('Sage.UI.Controls.DropDownSelectUser', [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        /**
         * @property {object} dataStore The data store which implements fetch()
         */
        dataStore: null,

        /**
         * @property {object} storeOptions The data store options object. See default values in constructor.
         */
        storeOptions: null,
        
        storeData: null,
        
        // Display properties
        templateString: template,
        widgetsInTemplate: true,
        
        /**
         * Takes the following options object: 
         * {
         *  storeOptions: {}, // Optional
         * }
         *
         * @constructor
         */
        constructor: function(options) {
            this.storeOptions = options.storeOptions || {
                    include: ['UserInfo'],
                    select: [
                        'Id',
                        'UserName',
                        'UserInfo/FirstName',
                        'UserInfo/LastName',
                        'Type'
                    ],
                    sort: [
                        { attribute: 'UserInfo.LastName', descending: false }
                    ],
                    service: _SDataServiceRegistry.getSDataService('dynamic', false, true, true), 
                    resourceKind: 'users'
            };

            this.dataStore = new baseSDataStore(this.storeOptions);
            
            this.inherited(arguments);
        },
        postCreate: function () {            
            var def = new dojo.Deferred();
            this.getUserData(def);

            def.then(dojo.hitch(this, function(data) {
                if(!data) {
                    return;
                }

                var items = [];
                var count = data.length;
                var item = null;
                for(var i = 0; i < count; i++) {
                    item = data[i];
                    if (item.Type !== 'Template') {
                        items.push({
                            id: item.$key,
                            text: [item.UserInfo.FirstName, item.UserInfo.LastName].join(' ')
                        });
                    }
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
            
            this.inherited(arguments);
        },
        /**
         * @returns {object} SData users object with child UserInfo resource included. dojo.Deferred required as an argument.
         */
        getUserData: function(deferred) {
            this.dataStore.fetch({
                onComplete: function(data) {
                    deferred.callback(data);
                },
                onError: function(e) {
                    deferred.errback(e);
                },
                scope: this
            });
        },
        _getValueAttr: function() {
            return this.comboBox.get('value');
        }
    });

    return widget;
});
