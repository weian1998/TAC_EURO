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
    'Sage/Utility/File/Attachment',
    'Sage/UI/Dialogs',
    'dojo/i18n',
    'dojo/i18n!./nls/AddURLAttachment',
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
    attachmentUtility,
    sageDialogs,
    i18n,
    nlsResource,
    declare) {
    var urlAttachForm = declare('Sage.Utility.File.AddURLAttachment', [_Widget, _Templated], {
        //i18n strings
        descriptionText: 'Description',
        urlText: 'URL',
        titleText: 'Add URL Attachment',
        okText: 'OK',
        cancelText: 'Cancel',
        requestFailedMsg: 'The requested operation could not be completed, please try again later.',
        urlBlankMsg:'The URL or description property cannot be blank.',
        //end i18n strings
        attachmentId: '',
        attachment: false,
        widgetsInTemplate: true,
        _bindingMgr: false,
        _store: false,
        id: '',
        widgetTemplate: new Simplate([
            '<div>',
                '<div dojoType="dijit.Dialog" id="addUrlAttachDialog" title="{%= $.titleText %}" dojoAttachPoint="_dialog">',
                    '<div  class="attachment-properties-form">',
                        '<div dojoType="dojox.layout.TableContainer" orientation="horiz" cols="1" labelWidth="160" >',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.urlText %}" id="{%= $.id %}_tb_Url" dojoAttachPoint="tb_Url" ></div>',
                            '<div dojoType="dijit.form.TextBox" label="{%= $.descriptionText %}" name="description" id="{%= $.id %}_tb_Description" dojoAttachPoint="tb_Description" maxlength="128" ></div>',
                        '</div>', //tableContainer
                        '<div class="general-dialog-actions">', //buttons
                            '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnOK" name="_btnOK" dojoAttachPoint="_btnOK" dojoAttachEvent="onClick:_okClick" >{%= $.okText %}</div>',
                            '<div dojoType="dijit.form.Button" id="{%= $.id %}_btnCancel" name="_btnCancel" dojoAttachPoint="_btnCancel" dojoAttachEvent="onClick:_cancelClick">{%= $.cancelText %}</div>',
                        '</div>', //buttons
                    '</div>', // container
                '</div>', //dialog
            '</div>'// root
        ]),
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization("Sage.Utility.File", "AddURLAttachment"));
            this.inherited(arguments);
        },
        show: function () {
            this._dialog.show();
            if (!this._dialog._standby) {
                dojoLang.mixin(this._dialog, new _DialogLoadingMixin());
            }
            this._loadData();
        },
        hide: function () {
            this.attachmentId = '';
            this.attachment = false;
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            this._dialog.hide();
        },
        _loadData: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            if (!this._store) {
                this._store = new SingleEntrySDataStore({
                    include: [],
                    resourceKind: 'attachments',
                    service: sDataServiceRegistry.getService('system')
                });
            }
            this._store.newItem({
                onComplete: this._receiveAttachment,
                onError: this._requestFail,
                scope: this
            });
        },
        _receiveAttachment: function (attachment) {
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            this.attachment = attachment;
            attachmentUtility.getKnownRelationships(this._receiveRelationships, this);
        },
        _ensureBindings: function () {
            if (!this._bindingMgr) {
                this._bindingMgr = new BindingsManager({
                    defaultBinding: { boundEntity: this.attachment },
                    items: [
                        {
                            boundWidget: this.tb_Description,
                            entityProperty: 'description'
                        }, {
                            boundWidget: this.tb_Url,
                            entityProperty: 'url',
                            onChange: dojo.hitch(this, this._urlChange)
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
            //console.dir(this.attachment);
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
        },
        _receiveRelationships: function (rels) {
            this.attachment = dojoLang.mixin(this.attachment, rels);
            this.attachment.user = { '$key': sageUtility.getClientContextByKey('userID') || '' };
            this.attachment.attachDate = sageUtility.Convert.toIsoStringFromDate(new Date());
            this._ensureBindings();
            this._bind();
        },
        _urlChange: function () {
            var desc = this.tb_Description.get('value');
            if (!desc) {
                var newUrl = this.tb_Url.get('value');
                if (newUrl) {
                    var r = new RegExp(/\.([\w]*)/);
                    var matches = r.exec(newUrl);
                    if (matches.length > 1) {
                        this.tb_Description.set('value', matches[1]);
                    }
                }
            }
        },
        _cancelClick: function () {
            this.hide();
        },
        _okClick: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            if ((this.attachment.url == null) || (this.attachment.url.trim() == '')) {
                 sageDialogs.showError(this.urlBlankMsg);
                return;
            }
            if ((this.attachment.description == null)|| (this.attachment.description.trim() == '')) {
                sageDialogs.showError(this.urlBlankMsg);
                return;
            }
            this._saveAndHide();
        },
        _saveAndHide: function () {
            if (this._dialog._standby) {
                this._dialog.showLoading();
            }
            //pop this into another thread so change events of the currently focused control have a chance to fire
            var self = this;
            window.setTimeout(function () {
                var attachment = self.attachment;


                self._store.saveNewEntity(attachment,
                    function (newattachment) {
                        dojo.publish('/entity/attachment/create', newattachment);
                        this.hide();
                    },
                    self._requestFail,
                    self
                );
            }, 10);
        },
        _requestFail: function (req) {
            console.warn('url attachment failed: ' + req);
            sageDialogs.showError(this.requestFailedMsg);
            this.hide();
        }
    });
    return urlAttachForm;
});