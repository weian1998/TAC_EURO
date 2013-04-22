/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/form/ComboBox',
    'dojo/_base/declare'
],
function (_Widget, _Templated, ComboBox, declare) {
    var customSelectMixin = declare('Sage.UI.Controls._customSelectMixin', [_Widget, _Templated], {
        widgetsInTemplate: true,
        disabled: false,
        value: '',
        text: '',
        widgetTemplate: new Simplate([
            '<div>',
                '<select dojoType="dijit.form.ComboBox" id="{%= $.id %}_select" labelAttr="label" dojoAttachPoint="_select" dojoAttachEvent="onChange:_onChange"></select>',
            '</div>' //root node
        ]),
        postCreate: function () {
            this.inherited(arguments);
            this._fillSelect();
        },
        _fillSelect: function () {
            // override to fill with custom data...
        },
        _setValueAttr: function (value) {
            this.text = value;
            this.value = value;
            if (this._store) {
                this._store.fetchItemByIdentity({
                    identity: value,
                    onItem: function (item) {
                        if (item) {
                            this._select.set('value', this._store.getValue(item, this._storeData.label));
                            this.value = this._store.getValue(item, this._storeData.identifier);
                            this.text = this._store.getValue(item, this._storeData.label);
                        } else {
                            this._handleValueNotInStore(value);
                        }
                    },
                    onError: function () {
                        //console.log('did not find item. ' + this.value);
                    },
                    scope: this
                });
            }
        },
        _getValueAttr: function () {
            if (this._select.item && this._store) {
                this.value = this._store.getValue(this._select.item, this._storeData.identifier);
            }
            return this.value;
        },
        _onChange: function (newValue) {
            //handles the _select control's change event...  newValue is the text
            if ((this.value === newValue) || (this.text === newValue)) {
                return;
            }
            if (this._select.item) {
                var item = this._select.item;
                //this.value = item[this._storeData.identifier];
                //this.text = item[this._storeData.label];                
                this.value = this._store.getValue(item, this._storeData.identifier);
                this.text = this._store.getValue(item, this._storeData.label);
            } else {
                this.value = this._handleValueNotInStore(newValue);
            }
            this.onChange(this.value);
        },
        _handleValueNotInStore: function (newValue) {
            //override this method to create a new item, or revert to last known good value...
            this.text = newValue;
            this.value = newValue;
            return newValue;
        },
        _getTextAttr: function () {
            return this.text;
        },
        _setTextAttr: function (text) {
            this.text = text;
            this._select.set('displayedValue', text);
        },
        _setDisabledAttr: function (disabled) {
            this.disabled = disabled;
            this._select.set('disabled', disabled);
        },
        _getDisabledAttr: function () {
            return this.disabled = this._select.get('disabled');
        },
        onChange: function () { }
    });
    return customSelectMixin;
});