/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/_Templated',
        'dijit/_Widget',
        'dojo/i18n',
        'Sage/Utility',
        'dijit/Dialog',
        'dijit/form/CheckBox',
        'dijit/form/DateTextBox',
        'dijit/form/Form',
        'dijit/form/Textarea',
        'dijit/form/TextBox',
        'dijit/form/ValidationTextBox',
        'dijit/layout/LayoutContainer',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',        
        'dojo/dom-construct',
        'dojo/i18n!./nls/DocumentProperties',
        'dojo/text!./templates/DocumentProperties.html',
        'dojo/_base/declare'
    ],
// ReSharper disable InconsistentNaming
    function (_Templated, _Widget, i18n, Utility, Dialog, CheckBox, DateTextBox, Form, Textarea, TextBox,
        ValidationTextBox, LayoutContainer, DialogHelpIconMixin, dLang, domConstruct, nls, template, declare) {
        
        var oDocumentProperties = declare('Sage.Library.DocumentProperties', [_Widget, _Templated], {
            _cancelClick: function () {
                this.hide();
            },
            _dialog: false,
            _doNotExpireChange: function (newValue) {
                if (this._ready) {
                    if (newValue === true) {
                        this._updateExpires(false, null);
                    }
                    else {
                        var originalValue = dijit.byId('expireDate$originalValue').get('value');
                        var originalDate = new Date();
                        if (originalValue && dojo.isString(originalValue) && Utility.Convert.isDateString(originalValue)) {
                            originalDate = Utility.Convert.toDateFromString(originalValue);
                            originalDate = new Date(originalDate.getUTCFullYear(), originalDate.getUTCMonth(), originalDate.getUTCDate());
                        }
                        this._updateExpires(true, originalDate);
                    }
                }
            },
            _neverExpireDate: new Date(2099, 0, 1),
            _ready: false,
            _submitClick: function () {
                this.hide();
                Sage.Library.FileHandler.validateProperties(this.getData());
            },
            _updateExpires: function (expires, expireDate) {
                if (expires === false) {
                    var textBox = dijit.byId('neverExpireControl');
                    if (!textBox) {
                        textBox = new TextBox({}, 'neverExpireControl');
                        textBox.set('disabled', 'disabled');
                    }
                    textBox.set('value', this.resources.Never);
                    dijit.byId('expireDate').set('value', this._neverExpireDate);
                    dojo.place(textBox.domNode, 'expiresRoot', 'only');
                }
                else {
                    var dateTextBox = dijit.byId('expireDateControl');
                    if (!dateTextBox) {
                        dateTextBox = new DateTextBox({}, 'expireDateControl');
                        dateTextBox.set('onChange', function (newValue) {
                            dijit.byId('expireDate').set('value', newValue);
                        });
                    }
                    dateTextBox.set('value', expireDate);
                    dojo.place(dateTextBox.domNode, 'expiresRoot', 'only');
                }
            },
            resources: {},
            constructor: function () {
                this.inherited(arguments);
                this.resources = {};               
            },
            postMixInProperties: function () {
                dLang.mixin(this.resources, nls);                
                this.inherited(arguments);
            },
            postCreate: function () {
                this.inherited(arguments);
                var fileName = dijit.byId('fileName');
                if (fileName) {
                    fileName.regExp = '[^\\\\/:"*?<>|\r\n]+';
                    fileName.invalidMessage = this.resources.InvalidFileName;
                }
                dLang.mixin(this._dialog, new DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic('libraryfileproperties');                 
            },
            getData: function () {
                var form = dijit.byId('propertiesForm');
                if (form) {
                    return form.get('value');
                }
                return false;
            },
            hide: function () {
                this._dialog.hide();
            },
            show: function (entry, readOnly) {
                this._ready = false;
                var self = this;
                var form = dijit.byId('propertiesForm');
                if (!this._dialog.onFocusEvent) {
                    this._dialog.onFocusEvent = dojo.connect(this._dialog, 'onFocus', function () {
                        if (form) {
                            self._updateExpires(entry.expires, entry['expireDate']);
                            form.set('value', entry);
                        }
                        self._ready = true;
                    });
                }
                if (!this._dialog.onHideEvent) {
                    this._dialog.onHideEvent = dojo.connect(this._dialog, 'onHide', function () {
                        dojo.disconnect(self._dialog.onFocusEvent);
                        dojo.disconnect(self._dialog.onHideEvent);
                        self._dialog.onFocusEvent = null;
                        self._dialog.onHideEvent = null;
                        self._ready = false;
                    });
                }
                dijit.byId('doNotExpire').set('checked', (entry.expires === false));
                dijit.byId('forceDistribution').set('checked', (entry.flags === 1));
                dijit.byId('directory.fullPath').set('readOnly', true);
                dijit.byId('status').set('readOnly', true);
                dijit.byId('fileSize').set('readOnly', true);
                if (readOnly) {
                    dijit.byId('doNotExpire').set('disabled', 'disabled');
                    dijit.byId('forceDistribution').set('disabled', 'disabled');
                    dijit.byId('fileName').set('readOnly', true);
                    dijit.byId('revisionDate').set('disabled', 'disabled');
                    dijit.byId('description').set('readOnly', true);
                    dijit.byId('abstract').set('readOnly', true);
                    dijit.byId('okButton').set('disabled', 'disabled');
                }
                this._dialog.show();
            },
            widgetsInTemplate: true,
            widgetTemplate: new Simplate(eval(template))
        });

        return oDocumentProperties;
    }
);