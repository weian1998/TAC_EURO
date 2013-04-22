/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/topic',
        'dojo/_base/declare',
        'dijit/_Widget',
        'dijit/Tooltip',
        'Sage/Data/BaseSDataStore',
        'Sage/Utility',
        'dijit/Tooltip',
        'dojo/i18n!./nls/PickList',
        'dojo/_base/lang',
        'Sage/Utility/_LocalStorageMixin',
        'Sage/Data/SDataServiceRegistry'
],
function (topic, declare, _Widget, toolTip, baseSDataStore, util, tooltip, nls, lang, _localStorageMixin, SDataServiceRegistry) {
    //dojo.requireLocalization('Sage.UI.Controls', 'PickList');

    /**
    * @class Base class for PickList widgets.
    */
    var widget = declare('Sage.UI.Controls.PickList', [_Widget, _localStorageMixin], {

        /**
         * @property {object} dataStore The data store which implements fetch()
         */
        dataStore: null,

        /**
         * @property {object} storeOptions The data store options object. See default values in constructor.
         */
        storeOptions: null,

        /**
         * @property {string} pickListName The name of the picklist. This is passed into the storeOptions.query if it was not overridden.
         */
        pickListName: '',

        /**
         * @property {boolean} canEditText Determines if a user can edit text in the textbox.
         */
        canEditText: false,

        /**
         * @property {boolean} itemMustExist Restrict data entered to data available in the picklist.
         */
        itemMustExist: true,

        /**
         * @property {number} maxLength Max length for item entered.
         */
        maxLength: -1,

        /**
         * @property {string} storeMode Determines what dropdown value/text gets posted back to the server (ASP.NET). 
         */
        storeMode: 'text', // text, id, code

        /**
         * @property {boolean} sort Tell the data store to sort by the picklist items/text property
         */
        sort: true,

        /**
         * @property {string} displayMode Sets the display mode as control or a hyperlink.
         */
        displayMode: 'AsControl', // AsControl, AsHyperlink (do we really need this?)

        /**
         * @property {string} clientID ASP.NET control's ClientID property.
         */
        clientId: '', 

        /**
         * @property {boolean} required Set to true if a value is required.
         */
        required: false,

        /**
         * @property {string} placeInNodeId Place widget in this dom node.
         */
        placeInNodeId: '',

        /**
         * @property {boolean} autoPostBack Should the control auto postback when value changes (onBlur).
         */
        autoPostBack: false,
        
        /**
         * @property {string} Tooltip text that displays over control.
         */
        controlTooltip: '',
        
        /**
         * @property {string} Tooltip text that displays over control button.
         */
        buttonTooltip: '',
        /**
        * @property {boolean} - Indicates whether the implementation should publish that it has dirty data to the ClientBindingManagerService.
        * default = true
        */
        shouldPublishMarkDirty: true,
         /**
         * @property Render the control as a hyperlink
         */
        renderAsHyperlink: false,

        // Private props for ASP.NET
        // TODO: _textId and _codeId are now passed in via config options (textId and codeId)
        _textId: '', // Textbox user sees (or used to see)
        _codeId: '', // Value for textbox, has either text or code
        _defaultValueId: '', // Default value
        _defaultCodeId: '', // Default code
        _storageNameSpace: 'PickListData',
        // localized strings
        okText: '',
        missingPickListText: '',
        // end localized strings

        // TODO: We need a hook for onChange

        /**
         * Takes the following options object: 
         * {
         *  pickListName: 'PickListName', // Required
         *  storeOptions: {}, // Optional
         *  dataStore: {}, // Optional
         *  canEditText: false,
         *  itemMustExist: true,
         *  maxLength: -1,
         *  storeMode: 'text', // text, id, code
         *  sort: true,
         *  displayMode: 'AsControl',
         *  clientId: 'ASP.NET Control ClientID Here',
         *  required: false
         *  placeInNodeId: '',
         *  autoPostBack: false
         * }
         *
         * @constructor
         */
        constructor: function(options) {
            this.storeOptions = options.storeOptions;
            this.dataStore = options.dataStore;

            this.clientId = options.clientId || '';
            var cid = this.clientId;
            this._textId = cid + '_Text';
            this._codeId = cid + '_Code';
            this._defaultValueId = cid + '_DefaultValue';
            this._defaultCodeId = cid + '_DefaultCode';

            if (nls) {
                this.okText = nls.okText;
                this.missingPickListText = nls.missingPickListText;
            }
        },
        postCreate: function() {
            var node = dojo.byId(this.placeInNodeId);
            if(node) {
                this._setDefaultFields();
                dojo.place(this.domNode, node, 'first');
            }

            this.inherited(arguments);
        },
        uninitialize: function() {
            this.inherited(arguments);
        },
        /**
         * Sets store up using given picklist name.
         * @function
         */
        _setStore: function(pickListName) {
            this.storeOptions = {
                    include: ['items'],
                    select: [
                        'Id',
                        'name',
                        'allowMultiples',
                        'valuesMustExist',
                        'required',
                        'alphaSorted',
                        'noneEditable',
                        //Include modifyDate to ensure that local storage data stays current.
                        'modifyDate',
                        'items/text',
                        'items/code',
                        'items/number'
                    ],
                resourceKind: 'picklists',            
                //Params: contract, keepUnique, useJson, cacheResult
                service: SDataServiceRegistry.getSDataService('system', false, true, false),
                directQuery: { name: pickListName} // TODO: this will get translated into a LIKE - Fix it
            };

            this.dataStore = new baseSDataStore(this.storeOptions);
        },
        
        /**
         * Sets hidden fields to correct values if required is true. Logic pulled from old picklist control.
         * @function
         */
        _setDefaultFields: function() {
            if(this.required) {
                var text = dojo.byId(this._textId);

                if(text && text.value === '') {
                    var code = dojo.byId(this._codeId);
                    var defaultValue = dojo.byId(this._defaultValueId);
                    var defaultCode = dojo.byId(this._defaultCodeId);

                    text.value = defaultValue.value;
                    if(this.storeMode === 'text') {
                        code.value = defaultValue.value;
                    } else {
                        // storeMode will be id or code here
                        code.value = defaultCode.value;
                    }
                }
            }
        },
        
        /**
         * Creates tooltips for button (buttonNode) and control (focusNode)
         * @function
         */
        _setupTooltips: function(buttonNode, focusNode) {
            if (this.controlTooltip && this.controlTooltip !== '' && focusNode) {
                var t = new tooltip({
                    connectId: [focusNode],
                    label: this.controlTooltip,
                    position: ['below']
                });
            }

            if (this.buttonTooltip && this.buttonTooltip !== '' && buttonNode) {
                var t2 = new tooltip({
                    connectId: [buttonNode],
                    label: this.buttonTooltip,
                    position: ['below']
                });
            }
        },

        /**
        * @returns {object} SData picklist object with child items resource included. dojo.Deferred required as an argument.
        * Example: {
        *  name: 'PickList Name',
        *  allowMultiples: false,
        *  valueMustExist: true,
        *  required: true,
        *  alphaSorted: true,
        *  noneEditable: true,
        *  items: [
        *      { text: 'Arizona', code: 'AZ', number: 0 },
        *      { text: 'Michigan', code: 'MI', number: 1 }
        *  ]
        * }
        */
        getPickListData: function (deferred) {
            var list = this.getFromLocalStorage(this.pickListName, this._storageNameSpace);
            if (list) {
                deferred.callback(list);
                return;
            }

            this.dataStore.fetch({
                onComplete: lang.hitch(this, function(data) {
                    var pickListData;
                    if(data && data.length > 0) {
                        pickListData = data[0];
                        var temp = pickListData.items.$resources;

                        if(this.sort) {
                            pickListData.items.$resources = temp.sort(function(a, b) {
                                if(a.text < b.text) {
                                    return -1;
                                }

                                if(a.text > b.text) {
                                    return 1;
                                }

                                return 0;
                            });
                        }
                        
                    } else {
                        pickListData = this.missingPickListText;
                    }

                    this.saveToLocalStorage(this.pickListName, pickListData, this._storageNameSpace);
                    deferred.callback(pickListData);
                }),
                onError: function(e) {
                    deferred.errback(e);
                },
                scope: this
            });
        },

        /**
         * Sets hidden ASP.NET fields.
         * @function
         */
        setASPNETInputs: function(textValue, codeValue) {
            if(this._textId && this._codeId) {
                var text = dojo.byId(this._textId);
                var code = dojo.byId(this._codeId);

                if(text && code) {
                    text.value = textValue;

                    if(this.storeMode == 'text') {
                        code.value = textValue;
                    } else {
                        code.value = codeValue;
                    }

                    this.invokeChangeEvent();
                }
            }
        },

        /**
        * If configured to do so, publishes the markDirty event, showing that there is un-saved data. Will auto postback here if set as well.
         * @function
         */
        invokeChangeEvent: function() {
            if (this.shouldPublishMarkDirty) {
                dojo.publish("Sage/events/markDirty");
            }
            if(this.autoPostBack) {
                __doPostBack(this.clientId, '');
            }
        },

        // Properties 

        _getCanEditTextAttr: function() {
            return this.canEditText;
        },
        _setCanEditTextAttr: function(value) {
            this.canEditText = value;
        },

        _getItemMustExistAttr: function() {
            return this.itemMustExist;
        },
        _setItemMustExistAttr: function(value) {
            this.itemMustExist = value;
        },

        _getMaxLengthAttr: function() {
            return this.maxLength;
        },
        _setMaxLengthAttr: function(value) {
            this.maxLength = value;
        },

        _getStoreModeAttr: function() {
            return this.storeMode;
        },
        _setStoreModeAttr: function(value) {
            this.storeMode = value;
        },

        _getPickListNameAttr: function() {
            return this.pickListName;
        },
        _setPickListNameAttr: function(value) {
            this.pickListName = value;
            this._setStore(value);
        },
        statics: {
        }
    });

    return widget;
});
