/*globals define, Sage   */
define([
    'Sage/Utility/File',
    'dijit/_Widget',
    'Sage/_Templated',
    'dojo/_base/lang',
    'dojo/string',
    'dijit/Dialog',
    'dojo/i18n',
    'dojo/i18n!./nls/DescriptionsForm',
    'dojo/_base/declare'
],
function (File, _Widget, _Templated, dLang, dString, Dialog, i18n, descriptionsFormStrings, declare) {
    var descForm = declare('Sage.Utility.File.DescriptionsForm', [_Widget, _Templated], {
        fileType: File.fileType.ftAttachment,
        titleFmt: 'Add Attachment(s) for ${0}',
        titleLibraryDoc: 'Add Library Document(s)',
        fileNameText: 'File name and size: ',
        descText: 'Description:',
        okText: 'OK',
        cancelText: 'Cancel',
        entityDesc: '',
        _formParts: [],
        files: [],
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div>',
                '<div dojoType="dijit.Dialog" id="dlgFileDescriptions" title="" dojoAttachPoint="_dialog">',
                    '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="2" labelWidth="3" style="width:580px">',
                        '<div dojoType="dijit.layout.ContentPane" label="" style="width:212px;"><label>{%= $.fileNameText %}</label></div>',
                        '<div dojoType="dijit.layout.ContentPane" label="" style="width:250px;"><label>{%= $.descText %}</label></div>',
                    '</div>', //labels
                    '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="2" labelWidth="5" dojoAttachPoint="contentNode" style="min-height:150px;width:580px;max-height:250px;overflow:auto" >',

                    '</div>', //body
                    '<div class="general-dialog-actions">', //buttons
                        '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnOK" name="_btnOK" dojoAttachPoint="_btnOK" dojoAttachEvent="onClick:_okClick">{%= $.okText %}</div>',
                        '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnCancel" name="_btnCancel" dojoAttachPoint="_btnCancel" dojoAttachEvent="onClick:_cancelClick">{%= $.cancelText %}</div>',
                    '</div>', //buttons
                '</div>', //dialog
            '</div>' //root
        ]),
        postMixInProperties: function () {
            dojo.mixin(this, descriptionsFormStrings);
            this.inherited(arguments);
        },
        show: function () {
            if (this.fileType !== File.fileType.ftLibraryDocs) {
                this._dialog.set('title', dString.substitute(this.titleFmt, [this.entityDesc]));
            }
            else {
                this._dialog.set('title', this.titleLibraryDoc);
            }
            this._dialog.show();
            this._addFormParts();
        },
        //        destroy: function () {
        //            this.inherited(arguments);
        //        },
        _setEntityDescAttr: function (desc) {
            this.entityDesc = desc;
        },
        _getEntityDescAttr: function () {
            return this.entityDesc;
        },
        _setFilesAttr: function (files) {
            this.files = files;
        },
        _getFilesAttr: function () {
            return this.files;
        },
        _addFormParts: function () {
            for (var i = 0; i < this.files.length; i++) {
                var file = this.files[i];
                var filelength = 0;
                if (file.size === 0) {
                    filelength = 0;
                }
                else {
                    filelength = file.size || file.blob.length;
                }
                if (filelength === 0) {
                    filelength += "0 Bytes";
                }
                else {
                    if (filelength) {
                        if (filelength > 1024) {
                            if (filelength > 1048576) {
                                filelength = Math.round(filelength / 1048576) + " MB";
                            } else {
                                filelength = Math.round(filelength / 1024) + " KB";
                            }
                        } else {
                            filelength += " Bytes";
                        }
                    }
                }
                var fnFld = new dijit.form.TextBox({
                    id: 'filename_' + i,
                    value: file.name + "  (" + filelength + ")",
                    style: 'min-width:250px;margin:0 0 5px 15px;',
                    disabled: true
                });
                var descFld = new dijit.form.TextBox({
                    id: 'desc_' + i,
                    value: this.getDefaultDescription(file.name),
                    style: 'min-width:250px;margin:0 0 5px 20px;',
                    maxLength: 128,
                    relFileName: file.name
                });
                this._formParts.push(fnFld);
                this._formParts.push(descFld);
                this.contentNode.addChild(fnFld);
                this.contentNode.addChild(descFld);
            }
        },
        _clearForm: function () {
            var len = this._formParts.length;
            for (var i = len - 1; i > -1; i--) {
                var elem = this._formParts[i];
                this.contentNode.removeChild(elem);
                elem.destroyRecursive(false);
            }
            this._formParts = [];
        },
        _okClick: function () {
            var descriptions = [];
            for (var i = 0; i < this._formParts.length; i++) {
                var elem = this._formParts[i];
                if (elem.params['relFileName']) {
                    descriptions.push({
                        description: elem.get('value') || this.getDefaultDescription(elem.params['relFileName']),
                        fileName: elem.params['relFileName']
                    });
                }
            }
            this._clearForm();
            this.onDescriptionsEntered(this.files, descriptions);
            this._dialog.hide();
        },
        _cancelClick: function () {
            this._clearForm();
            this._dialog.hide();
        },
        getDefaultDescription: function (filename) {
            return filename.replace(/\.[\w]*/, '');
        },
        onDescriptionsEntered: function (files, descriptions) { }
    });
    return descForm;
});