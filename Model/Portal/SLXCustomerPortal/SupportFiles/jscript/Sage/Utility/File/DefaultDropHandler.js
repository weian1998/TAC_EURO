/*globals Sage, dojo, define */
define([
    'Sage/Utility/File/DragDropWatcher',
    'Sage/Utility/File/Attachment',
    'Sage/Utility/File/LibraryDocument',
    'Sage/UI/Dialogs',
    'dojo/string',
    'Sage/Utility',
    'Sage/Utility/EntityRelationships',
    'dojo/_base/lang',
    'Sage/Data/SingleEntrySDataStore',
    'Sage/Data/SDataServiceRegistry',
    'dijit/_Widget',
    'Sage/Services/ActivityService',
    'dojo/i18n',
    'dojo/i18n!./nls/DefaultDropHandler',
    'dojo/_base/declare'
],
function (dragDropWatcher, attachmentUtil, libraryDocsUtil, Dialogs, dString, utility, utilEntityRelationships, dLang, SingleEntrySDataStore, sDataServiceRegistry,
    _Widget, activityService, i18n, nlsResource, declare) {
    var emailHandler = declare('Sage.Utility.File.EmailFileHandler', null, {
        file: null,
        histRelIdProperty: '',
        histRelNameProperty: '',
        histRelId: '',
        histRelName: '',
        extendRelationships: null,
        entityContext: null,
        fileMetaData: null,
        newHistory: null,
        saveAsMsg: false,
        doNotPromptHistory: false,
        saveAttachments: false,
        emailDroppedText: 'Dropped Email',
        attachmentTitleText: 'Save Attachements',
        attachmentQuestionText: 'Would you like to keep a copy of these attachment(s) in SalesLogix? <br />The attachments will be stored under the Attachments tab for relevant entities.',
        constructor: function (opts) {
            //console.log('file handler constructed. file: ' + opts.file.name);
            dLang.mixin(this, opts);
        },
        handleFile: function () {
            if (!this.file) {
                console.log('no file - aborting...');
                return;
            }

            utilEntityRelationships.getRelationships(this.entityContext, function (relationships) {

                var store = new SingleEntrySDataStore({
                    resourceKind: 'history',
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
                store.newItem({
                    onComplete: function (histTemplate) {
                        var hist = {};
                        hist[this.histRelIdProperty] = this.histRelId;
                        hist[this.histRelNameProperty] = this.histRelName;
                        hist['Type'] = 'atEmail';
                        hist['Duration'] = 1;
                        hist['Timeless'] = false;
                        hist['Category'] = this.emailDroppedText;
                        var d = (this.fileMetaData.sentOn) ? this.fileMetaData.sentOn : this.fileMetaData.receivedTime;
                        if (!d) {
                            d = new Date();
                        }
                        var strDate = utility.Convert.toIsoStringFromDate(d);
                        hist['StartDate'] = strDate;
                        hist['CompletedDate'] = strDate;
                        hist['OriginalDate'] = strDate;
                        if (this.fileMetaData['subject']) {
                            hist['Description'] = this.fileMetaData.subject.substring(0, 64);
                        }
                        if (this.fileMetaData['body']) {
                            hist['LongNotes'] = this.fileMetaData.body;
                        }
                        if (this.fileMetaData['senderName']) {
                            hist['UserDef2'] = this.fileMetaData.senderName;
                        }
                        var histTemplate = dLang.mixin(histTemplate, hist);
                        if (relationships) {
                            histTemplate = dLang.mixin(histTemplate, relationships);
                        }
                        store.saveNewEntity(histTemplate,
                        this._historySaved,
                        this._historyFailed,
                        this,
                        false);
                    },
                    scope: this
                });
            },
            this
            );

        },
        _getAttachmentMixin: function (attachment, historyMixin) {
            var mixin = {};
            for (var p in historyMixin) {
                mixin[p] = historyMixin[p];
            }
            mixin['description'] = attachment.filename;
            return mixin;
        },
        _historySaved: function (hist) {
            this.newHistory = hist;
            var mixin = {};
            mixin['HistoryId'] = hist['$key'];
            mixin['historyId'] = hist['$key'];
            //get all relationships - in case Attachment has the same ones...
            for (var p in hist) {
                var lastTwoChar = p.substring(p.length - 2);
                if (lastTwoChar.toUpperCase() === 'ID' && hist[p]) {
                    mixin[p] = hist[p];
                }
            }

            if (this.saveAsMsg) {
                //Creates the msg as an attachment.
                this.file.name = hist['$key'] + '.msg';
                this.file.filename = hist['$key'] + '.msg';
                var msgMixin = this._getAttachmentMixin(this.file, mixin);
                msgMixin.description = hist['Description'];
                attachmentUtil.createAttachmentSilent(this.file, msgMixin);
            }
            if (this.fileMetaData.attachments.length > 0) {
                if (this.saveAttachments) {
                    for (var i = 0; i < this.fileMetaData.attachments.length; i++) {
                        var attachment = this.fileMetaData.attachments[i];
                        var attachMixin = this._getAttachmentMixin(attachment, mixin);
                        if ((!attachment.name) && (attachment.filename)) {
                            attachment['name'] = attachment.filename;
                        }
                        attachmentUtil.createAttachmentSilent(attachment, attachMixin);
                    }
                }
            }

            this.onHistorySaved(hist['$key']);
        },
        _historyFailed: function (req) {

        },
        onHistoryFailed: function () { },
        onHistorySaved: function (histId) {

        }

    });

    Sage.namespace('Utility.File.DefaultDropHandler');
    Sage.Utility.File.DefaultDropHandler = {
        // i18n strings
        attachmentTitleText: 'Save Attachements',
        attachmentQuestionText: 'Would you like to keep a copy of these attachment(s) in SalesLogix? <br />The attachments will be stored under the Attachments tab for relevant entities.',
        emailDroppedText: 'Dropped Email',
        // end i18n strings
        promptForAttachments: true,
        saveAttachments: false,
        hasAttachments: false,
        options: {},
        historyQueue: [],
        historyHandlers: [],
        fileType: Sage.Utility.File.fileType.ftAttachment,
        init: function (options) {
            dojo.connect(dragDropWatcher, 'onFilesDropped', this, 'onFilesDropped');
            Sage.Utility.File.DefaultDropHandler.options['SAVEMSGFILES'] = options.saveMSGFiles;
            var uOptSvc = Sage.Services.getService('UserOptions');
            if (uOptSvc) {
                uOptSvc.get("DoNotPromptHistory", "Email",
                    function (opt) {
                        Sage.Utility.File.DefaultDropHandler.options['DoNotPromptHistory'] = (opt['value'] === 'T');
                    }
                );
            }
        },
        onFilesDropped: function (files, target) {
            if (this.shouldForceAttachments(target)) {
                if (this.fileType !== Sage.Utility.File.fileType.ftLibraryDocs) {
                    attachmentUtil.createAttachments(files);
                }
                else {
                    libraryDocsUtil.createDocuments(files, target);
                }
                return;
            }
            var emails = [];
            var attachments = [];
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (this.isOutlookEmailFile(file)) {
                    emails.push(file);
                } else {
                    attachments.push(file);
                }
            }
            if (emails.length > 0) {
                this.handleEmailFiles(emails, target);
            }
            if (attachments.length > 0) {
                if (this.fileType !== Sage.Utility.File.fileType.ftLibraryDocs) {
                    attachmentUtil.createAttachments(attachments);
                }
                else {
                    libraryDocsUtil.createDocuments(files, target);
                }
            }
        },
        shouldForceAttachments: function (target) {
            var isAttachmentDrop = false;
            if (!Sage.gears) {
                return true;
            }
            if (target) {
                isAttachmentDrop = Sage.Utility.File.DefaultDropHandler.isTargetAttachmentTab(target.parentElement);
            }
            if (isAttachmentDrop) {
                return true;
            } else {
                return false;
            }
        },

        isOutlookEmailFile: function (file) {
            var re = /\.(\w+)$/;
            var matches = file.name.match(re);
            if (matches.length > 1) {
                return matches[1].toLowerCase() === 'msg';
            }
            return false;
        },
        isTargetAttachmentTab: function (target) {

            if (!target) {
                return false;
            }
            if (target.id.indexOf('tabContent.dijitContentPane') != -1) {
                return false;
            }
            if (target.id.indexOf('AttachmentList') != -1) {
                return true;
            }
            //recursive call
            return Sage.Utility.File.DefaultDropHandler.isTargetAttachmentTab(target.parentElement);

        },
        handleEmailFiles: function (files, target) {
            if (!Sage.gears || (this.fileType === Sage.Utility.File.fileType.ftLibraryDocs)) {
                if (this.fileType !== Sage.Utility.File.fileType.ftLibraryDocs) {
                    attachmentUtil.createAttachments(files);
                }
                else {
                    libraryDocsUtil.createDocuments(files, target);
                }
                return;
            }
            if (files.length < 1) {
                return;
            }
            this.hasAttachments = false;
            this._buildEmailQueue(files);
            if (this.hasAttachments) {
                var self = this;
                var queryOptions = {
                    title: this.attachmentTitleText,
                    query: this.attachmentQuestionText,
                    callbackFn: function (result) {
                        if (result) {
                            self.saveAttachments = true;
                        }
                        else {
                            self.saveAttachments = false;
                        }
                        self._processNextHistoryHandler();
                    },
                    yesText: null,
                    noText: null,
                    showNoButton: true
                };
                Dialogs.raiseQueryDialogExt(queryOptions);
            } else {
                this.saveAttachments = false;
                this._processNextHistoryHandler();
            }

        },
        _buildEmailQueue: function (files) {
            var entinfo = this.getEntityInfo();
            var table = entinfo.EntityTableName.toUpperCase().substring(0, 1) + entinfo.EntityTableName.toLowerCase().substring(1);
            var desktop = Sage.gears.factory.create('beta.desktop');
            this.historyHandlers = [];
            this.historyQueue = [];
            for (var i = 0; i < files.length; i++) {
                var blob = null;
                if (files[i].blob) {
                    blob = files[i].blob; // from gears;
                } else {
                    blob = files[i]; //from html5 will not work.
                }
                var md = desktop.extractMetaData(blob);
                if (md.attachments.length > 0) {
                    this.hasAttachments = true;
                }

                this.historyHandlers.push(new emailHandler({
                    file: files[i],
                    histRelIdProperty: table + 'Id',
                    histRelNameProperty: table + 'Name',
                    histRelId: entinfo.EntityId,
                    histRelName: entinfo.Description,
                    entityContext: entinfo,
                    emailDroppedText: Sage.Utility.File.DefaultDropHandler.emailDroppedText,
                    fileMetaData: md,
                    saveAttachments: false,
                    saveAsMsg: Sage.Utility.File.DefaultDropHandler.options.SAVEMSGFILES,
                    doNotPromptHistory: Sage.Utility.File.DefaultDropHandler.options.DoNotPromptHistory,
                    onHistorySaved: dojo.hitch(this, '_onHistoryHandlerSuccsess'),
                    onHistoryFailed: dojo.hitch(this, '_onHistoryHandlerFailed')
                }));

            }
        },
        _processNextHistoryHandler: function () {
            if (this.historyHandlers.length > 0) {
                var handler = this.historyHandlers.pop();
                if (handler) {
                    handler.saveAttachments = this.saveAttachments;
                    handler.handleFile();
                }
            } else {
                this.saveAttachments = false; //rest the prompt.
                this._hasAttachmnets = false;
                this._checkContinueToComplete();
            }
        },
        _onHistoryHandlerSuccsess: function (historyId) {
            this.historyQueue.push(historyId);
            this._processNextHistoryHandler();
        },
        _onHistoryHandlerFailed: function () {
            //this.historyQueue.push('');
            this._processNextHistoryHandler();
        },
        _checkContinueToComplete: function () {
            //all the history records have been created - now show complete dialog...
            if (!this.options.DoNotPromptHistory) {
                this._showCompleteDlg();
            } else {
                dojo.publish('/entity/history/change', null);
                this.historyQueue = [];
            }
        },
        _showCompleteDlg: function () {
            var actService = Sage.Services.getService('ActivityService');
            actService.completeHistoriesInList(this.historyQueue);
        },
        getEntityInfo: function () {
            if (Sage.Services.hasService('ClientEntityContext')) {
                var entitycontext = Sage.Services.getService('ClientEntityContext');
                var context = entitycontext.getContext();
                if (context.EntityId != "") {
                    return context;
                } else {
                    return null;
                }
            }
        }
    };
    return Sage.Utility.File.DefaultDropHandler = dojo.mixin(Sage.Utility.File.DefaultDropHandler, i18n.getLocalization("Sage.Utility.File", "DefaultDropHandler")); ;
});
