/*globals Sage, dojo, define */
define([
    'dijit/_Widget',
    'Sage/_Templated',
    'dijit/Dialog',
    'require',
    'dojo/string',
    'Sage/UI/Dialogs',
    'Sage/Utility',
    'Sage/Utility/ErrorHandler',
    'Sage/Utility/File',
    'Sage/Utility/File/Attachment',
    'dojo/_base/lang',
    'Sage/UI/_DialogLoadingMixin',
    'dojo/i18n',
    'dojo/i18n!./nls/FallbackFilePicker',
    'dojo/text!./templates/FallbackFilePicker_Attachment.html',
    'dojo/text!./templates/FallbackFilePicker_LibraryDoc.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/has'
],
// ReSharper disable InconsistentNaming
function (
    _Widget,
    _Templated,
    Dialog,
    require,
    dString,
    Dialogs,
    sageUtility,
    ErrorHandler,
    File,
    attachmentUtility,
    dojoLang,
    _DialogLoadingMixin,
    i18n,
    nlsBundle,
    attachmentTemplate,
    libraryDocTemplate,
    array,
    declare,
    has
 ) {
    var filePicker = declare('Sage.Utility.File.FallbackFilePicker', [_Widget, _Templated], {
        addLibraryFileText: 'Add Library File',
        attachFileText: 'Attach File',
        descriptionText: 'Description',
        uploadFileText: 'Select File',
        okText: 'OK',
        cancelText: 'Cancel',
        _iframeId: 'attachmentPostIFrame',
        _hiddenFields: ['_attachDate', '_accountId', '_activityId', '_contactId', '_contractId', '_defectId', '_historyId', '_leadId', '_opportunityId', '_productId', '_returnId', '_salesOrderId', '_ticketId', '_userId'],
        _showing: false,
        fileType: File.fileType.ftAttachment,
        widgetsInTemplate: true,
        id: 'fallbackFilePicker',
        widgetTemplate: null,
        constructor: function (options) {
            this.inherited(arguments);
            if (options && typeof options === 'object') {
                dojo.mixin(this, options);
            }
        },
        destroy: function () {
            if (this._dialog) {
                this._dialog.destroyRecursive();
            }
            this.inherited(arguments);
        },
        postMixInProperties: function () {
            dojo.mixin(this, i18n.getLocalization('Sage.Utility.File', 'FallbackFilePicker'));
            this.inherited(arguments);
            if (this.fileType != File.fileType.ftLibraryDocs) {
                this.widgetTemplate = new Simplate(eval(attachmentTemplate));
            }
            else {
                this.widgetTemplate = new Simplate(eval(libraryDocTemplate));
            }
        },
        show: function () {
            if (this._postForm) {
                this._postForm.reset();
            }
            this._dialog.show();
            if (this.fileType != File.fileType.ftLibraryDocs) {
                attachmentUtility.getKnownRelationships(this._receiveRelationships, this, true);
            }
            if (has('ie') < 9) {
                // Dojo has a bug where it cannot connect to an IE8 IFrame's onload event, so attachEvent is used.
                this._iframe.attachEvent('onload', this._iframeLoad);
                window.FallbackFilePicker = this;
            }
            this._showing = true;
        },
        hide: function () {
            this._dialog.hide();
        },
        _onHide: function () {
            if (this._dialog._standby) {
                this._dialog.hideLoading();
            }
            if (this.fileType != File.fileType.ftLibraryDocs) {
                for (var i = 0; i < this._hiddenFields.length; i++) {
                    if (this._hiddenFields[i]) {
                        this[this._hiddenFields[i]].value = '';
                    }
                }
            }
            this.tb_Description.set('value', '');
            this.tb_realFileName.set('value', '');
            this._showing = false;
        },
        _receiveRelationships: function (rels) {
            if (this.fileType == File.fileType.ftLibraryDocs) {
                return;
            }
            for (var rel in rels) {
                //console.log('rel: ' + rel + ' value: ' + rels[rel]);
                if (this['_' + rel]) {
                    this['_' + rel].value = rels[rel];
                } else if (rel) {
                    this['_' + rel] = dojo.create('input', {
                        'type': 'hidden',
                        'name': rel,
                        'value': rels[rel]
                    }, this._postForm);
                    this._hiddenFields.push('_' + rel);
                }
            }
            this._userId.value = sageUtility.getClientContextByKey('userID') || '';
            this._attachDate.value = sageUtility.Convert.toIsoStringFromDate(new Date());
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
            if (this.fileType != File.fileType.ftLibraryDocs) {
                urlparts.push('/slxdata.ashx/slx/system/-/attachments/file?iframe=true&format=xml');
            }
            else {
                if (!Sage.Library || !Sage.Library.Manager || !Sage.Library.FileHandler) {
                    Dialogs.showError(this.invalidContext);
                    return null;
                }
                var sDirId = Sage.Library.FileHandler.findDirectoryId();
                var sUrl = dString.substitute('/slxdata.ashx/slx/system/-/libraryDirectories(\'${0}\')/documents/file?iframe=true&format=xml', [sDirId]);
                urlparts.push(sUrl);
            }
            var url = urlparts.join('');
            return url;
        },
        _iframeLoad: function (e) {
            var self;
            if (has('ie') < 9) {
                // NOTE: "this" in IE8 is the window and not the dialog.
                self = window.FallbackFilePicker;
            } else {
                self = this;
            }
            var frame = self._iframe;
            if (frame.contentDocument.body &&
                frame.contentDocument.body.innerText) {
                // Was there an unhandled Exception in Application_Error on the server because the file was too large?
                if (frame.contentDocument.body.innerText == 'RuntimeErrorPostTooLarge' /* DNL */) {
                    self.hide();
                    Dialogs.showError(self.fileTooLargeError);
                    return;
                }
            }
            try {
                var fnProcessDiagnoses = function (diagnosis) {
                    // Attempt to parse the innerText as an xml SData diagnoses.
                    // This data would be from a 500 error passed through by Sage.Integration.Server.dll.
                    if (diagnosis && diagnosis.hasOwnProperty('message')) {
                        var message = diagnosis.message;
                        if (diagnosis.hasOwnProperty('applicationCode') && ErrorHandler.isSDataExceptionDiagnoses(diagnosis.applicationCode)) {
                            var fnParseApplicationCode = function () {
                                var obj = {};
                                var arrAppData = diagnosis.applicationCode.split("; ");
                                array.forEach(arrAppData, function (item) {
                                    if (item && dojo.isString(item) && item.indexOf("=") !== -1) {
                                        var arrItem = item.split("=");
                                        var name = arrItem[0].trim();
                                        var value = arrItem[1].trim();
                                        obj[name] = value;
                                    }
                                });
                                return obj;
                            };
                            var info = fnParseApplicationCode();
                            if (info && info.hasOwnProperty('slxErrorId')) {
                                message += '<br /><br />';
                                message += self.slxErrorIdInfo + info.slxErrorId;
                            }
                        }
                        Dialogs.showError(message);
                    }
                };
                // The FallbackFilePicker is only used for IE
                if (has('ie')) {
                    var obj = {};
                    // Perhaps we have xml from an SData diagnoses?
                    if (has('ie') < 9) {
                        var sXml = (frame.contentDocument.body) ? frame.contentDocument.body.innerText : null;
                        if (sXml && dojo.isString(sXml)) {
                            sXml = sXml.trim();
                            // NOTE: The xml will be the "formatted" xml that IE creates...not the xml that we want.
                            var arrXml = sXml.split('\n');
                            if (dojo.isArray(arrXml)) {
                                array.forEach(arrXml, function (line, idx) {
                                    var pos = line.indexOf('- ');
                                    if (pos == 0) {
                                        arrXml[idx] = line.replace('- ', '');
                                    } else {
                                        pos = line.indexOf('  ');
                                        if (pos == 0) {
                                            arrXml[idx] = line.replace('  ', '');
                                        }
                                    }
                                });
                                sXml = arrXml.join('');
                                obj = ErrorHandler.getSDataDiagnosis(sXml, true);
                                fnProcessDiagnoses(obj);
                            }
                        }
                    } else {
                        // IE9+
                        if (frame.contentDocument.documentElement && frame.contentDocument.documentElement.childNodes.length >= 2) {
                            if (frame.contentDocument.documentElement.childNodes[1].tagName === 'sdata:diagnosis') {
                                var diagnosisNode = frame.contentDocument.documentElement.childNodes[1];
                                for (var i = 0; i < diagnosisNode.childNodes.length; i++) {
                                    var node = diagnosisNode.childNodes[i];
                                    if (node.nodeName.indexOf('sdata:') == 0) {
                                        obj[node.nodeName.replace('sdata:', '')] = node.textContent;
                                    }
                                }
                                fnProcessDiagnoses(obj);
                            }
                        }
                    }
                }
            } catch (e) {
                if (typeof console !== 'undefined') {
                    console.warn(e);
                }
            }
            if (frame.contentDocument.URL && typeof frame.contentDocument.URL !== 'undefined') {
                if (self.fileType != File.fileType.ftLibraryDocs) {
                    if (frame.contentDocument.URL.indexOf('attachments') > 0) {
                        dojo.publish('/entity/attachment/create', '');
                        self.hide();
                    }
                } else {
                    if (frame.contentDocument.URL.indexOf('/documents/file') > 0) {
                        dojo.publish('/sage/library/manager/libraryDocuments/refresh', null);
                        self.hide();
                    }
                }
            }
        },
        _onNewFile/*onChange*/: function (fileArray) {
            if (fileArray.srcElement && fileArray.srcElement.value.length > 0) {
                if (fileArray.srcElement.value) {
                    var fileName = fileArray.srcElement.value.replace(/^.*[\\\/]/, '');
                    if (this.tb_Description.get('value') === '') {
                        var fileNamePieces = fileName.split('.'),
                            descriptionValue = '';
                        if (fileNamePieces.length <= 2) {
                            descriptionValue = fileNamePieces[0];
                        }
                        else {
                            for (var i = 0; i < fileNamePieces.length - 1; i++) {
                                if (i > 0) {
                                    descriptionValue += '.';
                                }
                                descriptionValue += fileNamePieces[i];
                            }
                        }
                        this.tb_Description.set('value', descriptionValue);
                    }
                    this.tb_realFileName.set('value', fileName);
                }
            }
        },
        _okClick: function () {
            if (this.tb_realFileName.get('value') === '') {
                Dialogs.showInfo(this.pleaseSelectFile);
                return;
            }
            if (this.fileType === File.fileType.ftLibraryDocs) {
                // The action may have to change when a library file is added; the widget will only call _buildPostUrl()
                // the first time the form is submitted since the call to this._postForm.reset() does [not] reset the form action.
                this._postForm.action = this._buildPostUrl();
            }
            this._postForm.submit();
            if (!this._dialog._standby) {
                dojoLang.mixin(this._dialog, new _DialogLoadingMixin());
            }
            this._dialog.showLoading();
        },
        _cancelClick: function () {
            this.hide();
        }
    });
    return filePicker;
});