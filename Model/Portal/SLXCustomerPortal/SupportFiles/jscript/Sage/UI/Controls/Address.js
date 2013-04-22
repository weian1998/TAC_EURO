/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/**
* @class Class for Address control read only texarea with edit dialog.
*/
define([
       'dijit/_Widget',
       'Sage/_Templated',
       'Sage/Utility',
       'Sage/UI/Controls/TextBox',
       'Sage/UI/Controls/PickList',
       'Sage/UI/Controls/DropDownSelectPickList',
       'dijit/Dialog',
       'Sage/UI/Controls/_DialogHelpIconMixin',
       'dojo/i18n!./nls/Address',
       'dojo/text!./templates/Address.html',
       'dojo/text!./templates/AddressEdit.html',
       'dojo/_base/declare',
       'dojo/_base/array'
],
// ReSharper disable InconsistentNaming
function (
    _Widget,
    _sageTemplated,
    utility,
    textBox,
    pickList,
    dropDownSelectedPickList,
    dialog,
    _DialogHelpIconMixin,
    i18nStrings,
    addressTemplate,
    editTemplate,
    declare,
    array
) {
// ReSharper restore InconsistentNaming
    var widget = declare('Sage.UI.Controls.Address', [_Widget, _sageTemplated], {
        //using Simplate to faciliate conditional display
        widgetTemplate: new Simplate(addressTemplate.split('\r')),
        dialogContent: new Simplate(editTemplate.split('\r')),
        // @property {string} Overrides default dialog layout template.
        templateOverridePath: '', //i.e. 'templates/Address-Override.html'
        widgetsInTemplate: true,
        clientId: '',
        tabIndex: 0,
        //.net property
        autoPostBack: false,
        readOnly: false,
        enabled: true,
        showButton: true,
        displayValue: '',
        displayValueClientId: '',
        height: '',
        // @property {object} The Urls and ToolTips of map and edit buttons.
        imageData: {
            imageEditUrl: '',
            // @property {string} The tooltip of the edit image.
            imageEditToolTip: '',
            imageEditAltText: '',
            // @property {string} The url of the map image.
            imageMapQuestUrl: '',
            // @property {string}  The tooltip of the map image.
            imageMapQuestToolTip: '',
            imageMapQuestAltText: ''
        },
        fields: [],
        mapQuestValues: {},
        // @property {function} - Provides change hook for fields in the edit dialog to mark the control as dirty.
        editorChange: function () {
            this.isDirty = true;
        },
        // @property {boolean} - Indicates whether a field has been changed in the edit dialog. default = true
        isDirty: false,
        //.net bound control
        // @property {string} Client Id of the main address control.
        name: '',
        constructor: function (options) {
            dojo.mixin(this, options);
            options.id = options.clientId;
            this.resources = i18nStrings;
            if (options.templateOverridePath && options.templateOverridePath.length > 0) {
                try {
                    this.dialogContent = new Simplate(dojo['cache']('Sage.UI.Controls', options.templateOverridePath).split('\r'));
                }
                catch (e) {
                    // No overriding template exists.
                    console.log('Could not load template:' + e.description);
                }
            }
            this.inherited(arguments);
        },
        setAttribute: function (attr, val) {
            /* Hide deprecated warnings, due to the parser and _WidgetBase assuming focusNode is a dom node and not a widget */
            this.set(attr, val);
        },
        postCreate: function () {
            this.inherited(arguments);
            // the tabindex property is pointing to a div, and it shouldn't be selectable via tabbing
            // (however, tabindex is still necessary on construction to set the index of child controls)
            this.setAttribute('tabindex', '-1');
        },
        showDialog: function () {
            this.editDialog = dijit.byId([this.id, '-Dialog'].join(''));
            if (!this.editDialog) {
                this.editDialog = new dialog({
                    title: this.resources.dialogTitle,
                    id: [this.id, '-Dialog'].join(''),
                    'class': 'address-edit'
                });
                dojo.mixin(this.editDialog, new _DialogHelpIconMixin());
                this.editDialog.createHelpIconByTopic("accountaddresschange");
            }
            this.htmlEncodeForEditDialog();
            this.editDialog.set("content", this.dialogContent.apply({
                id: this.id,
                cancelText: this.resources.cancelText,
                okText: this.resources.okText,
                fields: this.fields
            }));
            this.isDirty = false;
            this.editDialog.show();
            if (this.modality === 'modeless') {
                dojo.destroy([this.id, '-Dialog_underlay'].join(''));
            }
        },
        // encode doube-quotes before sending them to the edit template,
        // otherwise they escape a double quote and the value won't fully appear
        // (trying to encode before this point causes the encoded string to appear
        //  in the textarea control for the address, which is bad)
        htmlEncodeForEditDialog: function() {
            array.forEach(this.fields, function(entry, i) {
                if(entry.xtype === 'textfield'
                    && entry.value.indexOf('"') > -1) {
                    entry.value = utility.htmlEncode(entry.value);
                }
            });
        },
        showMap: function () {
            this.createFormItems();
            var values = this.getAddressValues();
            var map = { 'streetaddress': 'addr1', 'city': 'city', 'state': 'state', 'zip': 'postalcode', 'country': 'country' };
            var parameters = {};

            for (var key in map) {
                if (values[map[key]])
                    parameters[key] = (typeof values[map[key]] === "object") ? values[map[key]].text : values[map[key]];
            }
            parameters.level = 9;
            parameters.iconid = 0;
            parameters.height = 300;
            parameters.width = 500;
            var queryParams = [];
            for (var paramKey in parameters) {
                queryParams.push(paramKey + "=" + encodeURIComponent(parameters[paramKey]));
            }
            var url = "http://www.mapquest.com/cgi-bin/ia_free?" + queryParams.join("&");
            var options = 'directories=no,location=no,menubar=no,pageXOffset=0px,pageYOffset=0px,scrollbars=yes,status=no,titlebar=no,toolbar=yes';
            window.open(url, '', options);
        },
        createFormItems: function () {
            var items = [];
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].visible === false)
                    continue;
                this.mapQuestValues[this.fields[i].name] = this.fields[i];
                var f = $.extend(this.fields[i], this.fields[i].pickList, {
                    id: this._clientId + "_field_" + this.fields[i].name,
                    stateful: false,
                    anchor: (this.fields[i].xtype != "checkbox") ? "100%" : false
                });
                if (f.maxLength > 0) {
                    f.autoCreate = { tag: 'input', type: 'text', maxlength: this.fields[i].maxLength };
                }
                f.tabIndex = i + 1;
                items.push(f);
            }
            return items;
        },
        getAddressValues: function () {
            var values = {};
            for (var name in this.mapQuestValues) {
                var field = this.mapQuestValues[name];
                if (field) {
                    values[name] = field.value;
                }
            }
            return values;
        },
        getEditFields: function () {
			
            this.setDataFields();
        },
        setDataFields: function () {
            var editField, dataField, xtype;
            for (var i = 0; i < this.fields.length; i++) {
                // Get the edit field from inside the dialog.
                editField = dijit.byId([this.id, '-', this.fields[i].name].join(''));
                // Get the hidden dataField provided by the server control
                dataField = dojo.byId(this.fields[i].formClientId);
                // Get the field type
                xtype = this.fields[i].xtype;

                // Check to see if the field has been added to the form.
                if (editField) {
                    //Set the data fields for PickLists
                    if (xtype === 'picklistcombo') {
                        //Check to see if a hidden field has been added to the configuration. Update it if so.
                        if (dataField) {
                            dataField.value = editField.get('value');
                        }
                        //Always update the field obj.
                        this.fields[i].value = editField.get('value');
                    }

                    //Set the data fields for CheckBox
                    if (xtype === 'checkbox') {
                        //Check to see if a hidden field has been added to the configuration and update it if so.
                        if (dataField) {
                            dataField.checked = editField.get('checked');
                        }
                        //Always update the field obj.  Checkbox as 'value' rather than 'checked' 
                        this.fields[i].value = editField.get('checked');
                    }

                    //Set the data fields for Text fields
                    if (xtype === 'textfield') {
                        //Check to see if a hidden field has been added to the configuration and update it if so.
                        if (dataField) {
                            dataField.value = editField.get('value');
                        }
                        //Always update the field obj.
                        this.fields[i].value = editField.get('value');
                    }
                }
            }
        },
        _okClicked: function () {
			var that = this;
			setTimeout((function (d) {
				return function () {
					that._updateValues();
				};
			})(that), 1);
        },
		_updateValues: function() {
            if (this.isDirty) {
                this.getEditFields();
                var resultNode = dojo.byId(this.resultValueClientId);
                dijit.byId(this.clientId + '_displayText').set('value', Sage.Format.Address.formatAddress(this.fields, true));
                resultNode.value = Sage.Format.Address.formatAddress(this.fields, true);
                dojo.publish("Sage/events/markDirty");
                if (this.autoPostBack) {
                    __doPostBack(resultNode.name, '');
                }
            }
		},
        _cancelClicked: function () {
            this.editDialog.hide();
        }
    });

    return widget;
});
