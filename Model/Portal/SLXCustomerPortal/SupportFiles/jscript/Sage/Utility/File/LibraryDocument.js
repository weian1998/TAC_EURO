/*globals define, Sage, window, dojo */
define([
        'Sage/Data/SingleEntrySDataStore',
        'Sage/Data/SDataServiceRegistry',
        'Sage/Utility/File',
        'Sage/UI/Dialogs',
        'dojo/_base/lang',
        'dojo/string',
        'Sage/Utility',
        'Sage/Utility/ErrorHandler',
        'Sage/Utility/File/DescriptionsForm',
        'dojo/i18n!./nls/LibraryDocument'
    ],
// ReSharper disable InconsistentNaming
    function (SingleEntrySDataStore, SDataServiceRegistry, FileUtil, dialogs, dLang, dString,
        Utility, ErrorHandler, DescriptionsForm, nls) {

        Sage.namespace('Utility.File.LibraryDocument');
        Sage.Utility.File.LibraryDocument = {
            _stateInfo: {
                total: 0,
                processed: 0,
                successCount: 0,
                failedCount: 0
            },
            _errors: [],
            _store: false,
            _target: false,
            _totalProgress: 0,
            _attachmentTemplate: false,
            _files: [],
            _fileCount: 0,
            _uploadAttemptCount: 0,
            _isUploading: false,
            _descriptionsForm: false,
            _uploadUrlFmt: 'slxdata.ashx/slx/system/-/libraryDirectories(\'${0}\')/documents/file',
            _uploadUrl: false,
            createDocuments: function (files, target) {
                this._target = (target && typeof target !== 'undefined') ? target : false;
                var entityDesc = 'Library Document';
                this._ensureDescriptionsForm();
                this._descriptionsForm.set('entityDesc', entityDesc);
                this._descriptionsForm.set('files', files);
                this._descriptionsForm.show();
            },
            handleDescriptions: function (files, descriptions) {
                var propname = '';
                var id = '';
                for (var i = 0; i < descriptions.length; i++) {
                    descriptions[i][propname] = id;
                }
                for (var i = 0; i < files.length; i++) {
                    this._files.push(files[i]);
                }
                this.uploadFiles();
            },
            _checkState: function () {
                if (this._stateInfo.processed == this._stateInfo.total) {
                    dialogs.closeProgressBar();
                    if (this._errors.length > 0) {
                        var crlf = '<br>';
                        var arrMsg = [];
                        arrMsg.push(dString.substitute(this.uploadError, [this._stateInfo.failedCount, this._stateInfo.successCount]));
                        arrMsg.push(crlf);
                        var self = this;
                        dojo.forEach(this._errors, function (err, idx) {
                            if (err && typeof err === 'object' && err.hasOwnProperty('message')) {
                                arrMsg.push(dString.substitute(self.failureNumber, [(idx + 1)]) + err.message);
                                if (idx !== (self._errors.length - 1)) {
                                    arrMsg.push(crlf);
                                }
                            }
                        });
                        this._errors = [];
                        Sage.UI.Dialogs.showError(arrMsg.join(crlf));
                    }
                    dojo.publish('/sage/library/manager/libraryDocuments/refresh', null);
                    this._resetCounts();
                }
            },
            _resetCounts: function () {
                this._fileCount = 0;
                this._uploadAttemptCount = 0;
                this._isUploading = false;
                this._totalProgress = 0;
                this._stateInfo.processed = 0;
                this._stateInfo.total = 0;
                this._stateInfo.failedCount = 0;
                this._stateInfo.successCount = 0;
            },
            _failAdd: function (xhr) {
                var options = { url: this._uploadUrl };
                var oError = ErrorHandler.getHttpStatusInfo(xhr, options);
                if (oError && typeof oError === 'object') {
                    this._errors.push(oError);
                } else {
                    this._errors.push({ message: this.unknownError });
                }
                this._uploadAttemptCount = this._uploadAttemptCount + 1;
                this._updateProgress((this._fileCount < 1) ? 100 : (this._uploadAttemptCount / this._fileCount) * 100);
                this._stateInfo.processed++;
                this._stateInfo.failedCount++;
                this._checkState();
            },
            _ensureDescriptionsForm: function () {
                if (!this._descriptionsForm) {
                    this._descriptionsForm = new DescriptionsForm({
                        entityDesc: '',
                        fileType: Sage.Utility.File.fileType.ftLibraryDocs,
                        files: this._files || []
                    });
                    dojo.connect(this._descriptionsForm, 'onDescriptionsEntered', this, 'handleDescriptions');
                }
            },
            _successUpload: function (request) {
                this._uploadAttemptCount = this._uploadAttemptCount + 1;
                this._updateProgress((this._fileCount < 1) ? 100 : (this._uploadAttemptCount / this._fileCount) * 100);
                this._stateInfo.processed++;
                this._stateInfo.successCount++;
                this._checkState();
            },
            _updateProgress: function (curFileProgress) {
                //console.log('progress obj: %o', curFileProgress);
                var pct = this._totalProgress;
                //console.log('pct: ' + pct);
                if (curFileProgress && curFileProgress.lengthComputable) {
                    var thisFilePercent = (curFileProgress.loaded / curFileProgress.total) * 100;
                    pct += Math.round(thisFilePercent / this._fileCount);
                } else if (curFileProgress) {
                    pct = curFileProgress;
                }
                this._totalProgress = pct;
                //console.log('now calculated pct: ' + pct);
                if (pct < 99) {
                    dialogs.showProgressBar({
                        pct: pct,
                        title: this.percentComplete
                    });
                }
            },
            uploadFiles: function (template) {
                this._isUploading = true;
                this._fileCount = this._files.length;
                if (template && !this._attachmentTemplate) {
                    this._attachmentTemplate = template;
                }
                var sDirId = '';
                if (Sage.Library && Sage.Library.FileHandler) {
                    sDirId = Sage.Library.FileHandler.findDirectoryId(this._target);
                }
                var sUrl = dString.substitute(this._uploadUrlFmt, [sDirId]);
                this._uploadUrl = sUrl;
                this._stateInfo.processed = 0;
                this._stateInfo.total = this._files.length;
                while (this._files.length > 0) {
                    var file = this._files.pop();
                    Sage.Utility.File.uploadFile(file,
                        this._uploadUrl,
                        this._updateProgress,
                        this._successUpload,
                        this._failAdd,
                        this);
                }
            }
        };

        dLang.mixin(Sage.Utility.File.LibraryDocument, nls);
        return Sage.Utility.File.LibraryDocument;
    });
