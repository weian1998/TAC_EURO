/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Controls/PickList',
    'Sage/UI/Controls/DropDownSelectPickList',
    'Sage/Data/BaseSDataStore',
    'dojo/_base/declare'
],
function (PickList, DropDownSelectPickList, BaseSDataStore, declare) {
    var widget = declare('Sage.UI.Columns.PickList', dojox.grid.cells._Widget, {
        icon: '',
        widgetClass: DropDownSelectPickList,
        /**
        * @property {object} storeData Data fetched from SData stored here.
        */
        storeData: null,
        pickList: null,
        storageMode: 'id', //Default for column picklist
        displayMode: 'AsText', //Default for column picklist formatting
        constructor: function (args) {
            this.inherited(arguments);
            if (this.storageMode === 'id' && this.displayMode === 'AsText') {
                if (this.pickListName && this.storeData === null) {
                    this._loadPickList();
                }
            }
        },
        formatter: function (val, index) {
            if (this.storageMode === 'id') {
            val = this.getStoreTextById(val);
            }
            return val;
        },
        _loadPickList: function () {
            var deferred = new dojo.Deferred();
            var config = {
                pickListName: this.pickListName, // Required
                // storeOptions: {}, // Optional
                // dataStore: {}, // Optional
                canEditText: false,
                itemMustExist: true,
                maxLength: -1,
                storeMode: this.storageMode, // text, id, code
                sort: false,
                displayMode: this.displayMode
            };
            this.pickList = new PickList(config);
            this.pickList.getPickListData(deferred);
            deferred.then(dojo.hitch(this, this._loadData), function (e) {
                console.error(e); // errback
            });

        },
        getStoreTextById: function (val) {
            if (this.storeData) {
                //If the value is not found as an id in the list, return the value back.
                var result = val;
                dojo.forEach(this.storeData.items, function (item, index, array) {
                    //console.log(item.id + ' === ' + id);
                    if (item.id === val) {
                        result = item.text;
                    }
                }, this);
            }

            return result;
        },
        _loadData: function (data) {
                var items = [];
                for (var i = 0; i < data.items.$resources.length; i++) {
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
            }
    });

    return widget;
});
