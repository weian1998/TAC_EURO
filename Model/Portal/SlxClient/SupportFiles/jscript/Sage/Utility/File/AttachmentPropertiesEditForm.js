/*globals dojo, define, Sage, Simplate  */
define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dojo/string',
    'dijit/Dialog',
    'Sage/UI/_DialogLoadingMixin',
    'dojo/_base/lang',
    'Sage/Data/SingleEntrySDataStore',
    'Sage/Data/SDataServiceRegistry',
    'Sage/MainView/BindingsManager',
    'Sage/Utility/File',
    'Sage/Utility',
    'Sage/UI/Dialogs',
    'dojox/layout/TableContainer',
    'Sage/UI/Controls/DateTimePicker',
    'dijit/form/TextBox',
    'dijit/form/Button',
    'dojox/form/Uploader',
    'dojo/i18n',
    'dojo/i18n!./nls/AttachmentPropertiesEditForm',
    'dojo/_base/declare'
],
function (_Widget,
    _Templated,
    dString,
    Dialog,
    _DialogLoadingMixin,
    dojoLang,
    SingleEntrySDataStore,
    sDataServiceRegistry,
    BindingsManager,
    fileUtility,
    sageUtility,
    sageDialogs,
    TableContainer,
    DateTimePicker,
    TextBox,
    Button,
    uploader,
    i18n,
    nlsResource,
    declare) {
    var attachForm = declare('Sage.Utility.File.AttachmentPropertiesEditForm', [_Widget, _Templated], {
        attachmentId: '',
        widgetsInTemplate: true,
        attachment: false,
        _bindingMgr: false,
        _store: false,
        _tempFile: false,
        _iframe: null,
        _showing: false,
        _iframeId: 'attachmentRePostIFrame',
        _uploadUrlFmt: 'slxdata.ashx/slx/system/-/attachments(\'${0}\')/file',
        widgetTemplate: new Simplate([
            '<div>',
                '<div dojoType="dijit.Dialog" title="{%= $.editText %}" dojoAttachPoint="_dialog">',
                    '<iframe src="about:blank" style="width:0px;height:0px;border-width:0px;" name="{%= $._iframeId %}" id="{%= $._iframeId %}" dojoAttachPoint="_iframe" dojoAttachEvent="onload:_iframeLoad"></iframe>',
                    '<form method="post" enctype="multipart/form-data" action="{%= $._buildPostUrl() %}" target="{%= $._iframeId %}" dojoAttachPoint="_postForm", class="attachment-properties-form">',
                        '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="1" labelWidth="160" dojoAttachPoint="_urlContainer">',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.urlText %}" id="{%= $.id %}_tb_Url" dojoAttachPoint="tb_Url" ></div>',
                        '</div>',
                        '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="1" labelWidth="160" dojoAttachPoint="_fileNameContainer" >',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.fileText %}" id="{%= $.id %}_tb_File" dojoAttachPoint="tb_File" ></div>',
                        '</div>',
                        '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="1" labelWidth="160" >',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.descriptionText %}" name="description" id="{%= $.id %}_tb_Description" dojoAttachPoint="tb_Description" maxlength="128" ></div>',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.sizeText %}" id="{%= $.id %}_tb_size" dojoAttachPoint="tb_size" disabled="true" shouldPublishMarkDirty="false"></div>',
                            '<div dojoType="Sage.UI.Controls.DateTimePicker" label="{%= $.attachDateText %}" id="{%= $.id %}_dtp_AttachDate" dojoAttachPoint="dtp_attachDate" displayDate="true" displayTime="true" disabled="true" shouldPublishMarkDirty="false"></div>',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.attachedByText %}" id="{%= $.id %}_tb_attachedBy" dojoAttachPoint="tb_attachedBy" disabled="true" shouldPublishMarkDirty="false"></div>',
                        '</div>', //form

                        '<div class="general-dialog-actions">',
                            '<input dojoType="dojox.form.Uploader" multiple="false" label="{%= $.uploadFileText %}" type="file" name="file" dojoAttachEvent="onChange:_onNewFile" dojoAttachPoint="btn_FileSelect" class="uploadButton" ></input>',
                        '</div>',
                        '<div class="general-dialog-actions">', //buttons
                            '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnOK" name="_btnOK" dojoAttachPoint="_btnOK" dojoAttachEvent="onClick:_okClick" >{%= $.okText %}</div>',
                            '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnCancel" name="_btnCancel" dojoAttachPoint="_btnCancel" dojoAttachEvent="onClick:_cancelClick">{%= $.cancelText %}</div>',
                        '</div>', //buttons
                        '<input type="hidden" name="X-HTTP-Method-Override" value="PUT" />', //in case we don't have async support
                    '</form>',
                '</div>', //dialog
            '</div>' //root node
        ]),
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.Utility.File", "AttachmentPropertiesEditForm"));
            this.inherited(arguments);
        },
        show: function () {
            this._dialog.show();
            if (!this._dialog._standby) {
                dojoLang.mixin(this._dialog, new _DialogLoadingMixin());
            }
            this._showing = true;
            if (!this.attachment) {
                this._dialog.showLoading();
            }
        },
        hide: function () {
            this.attachmentId = '';
            this.attachment = false;
            this._tempFile = false;
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            this._dialog.hide();
            this._showing = false;
        },
        _buildPostUrl: function () {
            var urlparts = [];
            urlparts.push(/https/i.test(window.location.protocol) ? 'https' : 'http');
            urlparts.push('://');
            urlparts.push(window.location.hostname);
            if (window.location.port && window.location.port !== 80) {
                urlparts.push(':', window.location.port);
            }
            urlparts.push('/');
            urlparts.push(sageUtility.getVirtualDirectoryName());
            urlparts.push('/slxdata.ashx/slx/system/-/attachments');
            if (this.attachment) {
                urlparts.push('("' + this.attachment.$key + '")');
            }
            urlparts.push('/file');
            var url = urlparts.join('');
            return url;
        },
        _iframeLoad: function (e) {
            if (this._iframe.contentDocument && this._iframe.contentDocument.URL.indexOf('attachments') > 0) {
                dojo.publish('/entity/attachment/update', '');
                this.hide();
            }
        },
        _setAttachmentIdAttr: function (attachId) {
            this.attachmentId = attachId;
            if (this.attachmentId && this.attachmentId !== '') {
                this._loadData();
            }
        },
        _getAttachmentIdAttr: function () {
            return this.attachmentId;
        },
        _loadData: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            if (!this._store) {
                this._store = new SingleEntrySDataStore({
                    include: ['$descriptors'],
                    resourceKind: 'attachments',
                    service: sDataServiceRegistry.getSDataService('system')
                });
            }
            if (this.attachmentId !== '') {
                this._store.clearCache();
                this._store.fetch({
                    predicate: '"' + this.attachmentId + '"',
                    onComplete: this._receiveAttachment,
                    beforeRequest: function (request) {
                        request.setQueryArg('_includeFile', 'false');
                    },
                    onError: this._requestFail,
                    scope: this
                });
            } else {
                sageDialogs.showError('No attachment to edit');
            }
        },
        _receiveAttachment: function (attachment) {
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            this.attachment = attachment;
            this._ensureBindings();
            this._bind();
            if (this.attachment.url) {
                dojo.removeClass(this._urlContainer.domNode, 'display-none');
                dojo.addClass(this.btn_FileSelect.domNode, 'display-none');
                dojo.addClass(this._fileNameContainer.domNode, 'display-none');
            } else {
                dojo.addClass(this._urlContainer.domNode, 'display-none');
                dojo.removeClass(this.btn_FileSelect.domNode, 'display-none');
                dojo.removeClass(this._fileNameContainer.domNode, 'display-none');
            }
        },
        _ensureBindings: function () {
            if (!this._bindingMgr) {
                this._bindingMgr = new BindingsManager({
                    defaultBinding: { boundEntity: this.attachment },
                    items: [
                        {
                            boundWidget: this.tb_File,
                            entityProperty: 'fileName'
                        }, {
                            boundWidget: this.tb_Description,
                            entityProperty: 'description'
                        }, {
                            boundWidget: this.tb_size,
                            entityProperty: 'fileSize',
                            _formatValueFromEntity: function (v) {
                                return Sage.Utility.File.formatFileSize(v);
                            },
                            twoWay: false
                        }, {
                            boundWidget: this.dtp_attachDate,
                            entityProperty: 'attachDate',
                            dataType: 'date',
                            twoWay: false
                        }, {
                            boundWidget: this.tb_Url,
                            entityProperty: 'url'
                        }, {
                            boundWidget: this.tb_attachedBy,
                            entityProperty: 'user.$descriptor',
                            twoWay: false
                        }
                    ]
                });
            }
        },
        _bind: function () {
            if (!this._bindingMgr.boundEntity || (this.attachment.$key !== this._bindingMgr.boundEntity.$key)) {
                this._bindingMgr.setBoundEntity(this.attachment);
            } else {
                this._bindingMgr.bind();
            }
        },
        _onNewFile: function () {
            var files = this.btn_FileSelect._files;
            if (files && files.length > 0) {
                this.tb_File.set('value', files[0].name);
                this._tempFile = files[0];
            } else {
                //this._tempFile = true;
            }
            this.tb_Description.focus();
        },
        _uploadNewFile: function (file) {
            if (file) {
                var url = dString.substitute(this._uploadUrlFmt, [this.attachment.$key]);
                //Only Support by HTML5
                fileUtility.uploadFileHTML5(file,
                    url,
                    false,
                    this._newFileUploaded,
                    this._requestFail,
                    this,
                    true);
            }
        },
        _newFileUploaded: function () {
            this._tempFile = false;
            dojo.publish('/entity/attachment/update', self.attachment);
            this.hide();
        },
        _okClick: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            this._saveAndHide();
        },
        _saveAndHide: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            var self = this;
            if ((!fileUtility.supportsHTML5File && !Sage.gears) && (this._tempFile)) {
                this._store._okToCache = false;
                this._postForm.action = this._buildPostUrl();
                this._postForm.submit();
                //hack alert!... IE8 does not fire the iframe onload event, so hacking...
                //which is especially stupid because IE is the reason we have to do this kind
                // of post in the first place.  ugh!
                window.setTimeout(function () {
                    if (self._showing) {
                        dojo.publish('/entity/attachment/update', '');
                        self.hide();
                    }
                }, 5000);
                return;
            }

            //pop this into another thread so change events of the currently focused control have a chance to fire
            window.setTimeout(function () {
                self._saveAttachment();
            }, 10);
        },
        _saveAttachment: function () {
            if (this._tempFile) {
                this._uploadNewFile(this._tempFile);
            }
            this._store.save({
                scope: this,
                success: function (attachmentUpdated) {
                    dojo.publish('/entity/attachment/update', attachmentUpdated);
                    this._dialog.hide();
                },
                failure: this._requestFail
            });
        },
        _cancelClick: function () {
            this.hide();
        },
        _requestFail: function (req) {
            console.warn('attachment request failed: ' + req);
            sageDialogs.showError(this.requestFailedMsg);
            this.hide();
        }
    });
    return attachForm;
});