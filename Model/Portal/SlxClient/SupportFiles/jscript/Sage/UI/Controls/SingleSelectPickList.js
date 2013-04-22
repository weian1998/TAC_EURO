/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'dijit/_TemplatedMixin',
       'dijit/_WidgetsInTemplateMixin',
       'dijit/form/ComboBox',
       'dojo/data/ItemFileReadStore',
       'dojo/data/ObjectStore',
       'dojo/store/Memory',
       'Sage/UI/ComboBox',
       'Sage/UI/Controls/PickList',
       'dojo/text!./templates/SingleSelectPickList.html',
       'dojo/_base/declare'
],
function (_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _comboBox, itemFileReadStore, objectStore, memory, sageComboBox, pickList, template, declare) {
    /**
    * @class Class for single select picklists.
    */
    var widget = declare('Sage.UI.Controls.SingleSelectPickList', [pickList, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {

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
        constructor: function (options) {
            if (options.clientId) {
                this.id = options.clientId + '-SingleSelectPickList';
            }

            this.inherited(arguments);
        },
        postCreate: function () {
            this._setupTooltips(this.comboBox._buttonNode, this.comboBox.textbox);
            this._setupRenderAsHyperlink();
            this._setupTooltips();            
            this.inherited(arguments);
            var existingText = dojo.byId(this._textId);
            if (existingText && existingText.value && (this.comboBox.value !== existingText.value)) {
                this.comboBox.set('value', existingText.value);
            }
        },
        _setupTooltips: function () {
            if (this.controlTooltip && this.controlTooltip !== '') {
                this.comboBox.set('title', this.controlTooltip);
            }

            if (this.buttonTooltip && this.buttonTooltip !== '') {
                if (this.comboBox._buttonNode) {
                    this.comboBox._buttonNode.title = this.buttonTooltip;
                }
            }
        },
        _setupRenderAsHyperlink: function () {
            if (!this.renderAsHyperlink) {
                return;
            }

            dojo.addClass(this.comboBox.domNode, 'comboAsHyperlink');
            dojo.connect(this.comboBox.domNode, 'onclick', this, function () {
                this.comboBox.loadDropDown();
            });
        },
        _loadData: function () {
            var def = new dojo.Deferred();
            this.getPickListData(def);

            def.then(dojo.hitch(this, function (data) {
                if (typeof data === 'string') {
                    this.comboBox.set('value', data);
                }

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

                var tempStore = new itemFileReadStore({ data: this.storeData });
                this.comboBox.set('store', tempStore);
                this.comboBox.set('searchAttr', 'text');

                var existingText = dojo.byId(this._textId);
                var existingId = dojo.byId(this._codeId);
                if (existingText && existingText.value) {
                    //this is here when the server control added it to the dom with a value in it
                    this.lastValidValue = existingText.value;
                    this.initialValue = this.lastValidValue;
                    this.comboBox.set('value', this.lastValidValue);
                }

                if (existingId && existingId.value) {
                    var storeItem = this.getStoreItemById(existingId.value);
                    if (storeItem) {
                        this.lastValidValue = storeItem.text;
                        this.initialValue = this.lastValidValue;
                        this.comboBox.set('value', this.lastValidValue);
                    }
                } else {
                    //this is when it is used as a strictly client-side control and the value may have already been set.
                    var val = this.comboBox.get('value');
                    if (val || val === '') {
                        this.lastValidValue = val;
                    } else {
                        this.lastValidValue = items[0].text;
                        this.comboBox.set('value', this.lastValidValue);
                    }
                }
            }), function (e) {
                // errback
                console.error(e);
            });

            // Adjust control according to properties set in AA

            // Disable textbox to prevent edit
            if (this.get('canEditText') === false) {
                this.comboBox.textbox.disabled = true;
            }

            var len = this.get('maxLength');
            if (len > 0) {
                this.comboBox.set('maxLength', len);
            }

            if (this.get('itemMustExist')) {
                dojo.connect(this.comboBox, 'onChange', dojo.hitch(this, function (currentVal) {

                    // Check if what we have entered is valid or not
                    var valid = dojo.some(this.storeData.items, function (item) {
                        // There is no guarantee the types will match so evaluate the type as well
                        // (i.e. do not use === for comparison). This can happen if a custom store is
                        // used to store the data, etc.
                        if (item.text == currentVal || currentVal == '') {
                            return true;
                        } else {
                            return false;
                        }
                    }, this);

                    if (valid) {
                        this.lastValidValue = currentVal;
                    }

                    if (!valid) {
                        // Attempt to restore last valid value.
                        if (this.lastValidValue !== 'undefined' && this.lastValidValue !== null) {
                            this.comboBox.set('value', this.lastValidValue);
                        }
                    }
                }));
            }
        },
        uninitialize: function () {
            this.inherited(arguments);
        },
        _onBlur: function () {
            // Send the values to the hidden ASP.NET fields if we are valid, and the value actually changed.
            if (this.comboBox.isValid() && this.storeData) {
                var val = this.comboBox.get('value');

                if (val != this.initialValue) {
                    var code = '';
                    dojo.forEach(this.storeData.items, function (item, index, array) {
                        if (item.text == val) {
                            code = item.id;
                        }
                    }, this);

                    this.setASPNETInputs(val, code);
                }
            }
        },
        getStoreItemById: function (id) {
            if (this.storeData) {
                var results = null;
                dojo.forEach(this.storeData.items, function (item, index, array) {
                    if (item.id === id) {
                        results = item;
                    }
                }, this);
            }

            return results;
        },
        _onChange: function (newVal) {
            this.onChange(newVal);
        },
        _setPickListNameAttr: function (value) {
            this.inherited(arguments);
            this._loadData();
        },
        _setValueAttr: function (value) {
            this.inherited(arguments);
            this.comboBox.set('value', value);
        },
        _getValueAttr: function () {
            return this.comboBox.get('value');
        },
        // Display properties
        templateString: template,
        widgetsInTemplate: true,

        /**
        * @property {object} storeData Data fetched from SData stored here.
        */
        storeData: null,

        /**
        * @property {string} lastValidValue Last valid value entered into the control.
        */
        lastValidValue: '',

        /**
        * @property {string} initialValue Initial value set to the control, if any.
        */
        initialValue: '',

        /**
        * @property {bool} disabled.
        */
        disabled: false,

        _setDisabledAttr: function (disabled) {
            this.disabled = disabled;


            this.comboBox.set('disabled', disabled);
        },
        _getDisabledAttr: function () {
            return this.disabled = this.comboBox.get('disabled');
        },
        focus: function () {
            this.comboBox.focus();
        },
        onChange: function (newVal) { }
    });

    return widget;
});

