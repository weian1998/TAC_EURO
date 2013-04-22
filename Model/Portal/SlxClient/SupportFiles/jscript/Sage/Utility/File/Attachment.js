/*globals define, Sage, window, dojo */
define([
    'Sage/Data/SingleEntrySDataStore',
    'Sage/Data/SDataServiceRegistry',
    'Sage/Utility/File',
    'Sage/UI/Dialogs',
    'dojo/_base/lang',
    'dojo/string',
    'Sage/Utility',
        'Sage/Utility/File/DescriptionsForm',
    'dojo/i18n',
    'dojo/i18n!./nls/Attachment'
],
    function (SingleEntrySDataStore, SDataServiceRegistry, FileUtil, dialogs, dLang, dString, Utility, DescriptionsForm, i18n) {
        Sage.namespace('Utility.File.Attachment');
        Sage.Utility.File.Attachment = {
            percentComplete: 'Uploading, please wait...',
            _store: false,
            _totalProgress: 0,
            _attachmentTemplate: false,
            _mixinsByName: {},
            _files: [],
            _fileCount: 0,
            _filesUploadedCount: 0,
            _isUploading: false,
            _descriptionsForm: false,
            //_uploadUrlFmt: 'slxdata.ashx/slx/system/-/attachments(\'${0}\')/file',
            _uploadUrl: 'slxdata.ashx/slx/system/-/attachments/file',
            createAttachments: function (files) {
                var entityDesc = '';
                if (Sage.Services.hasService('ClientEntityContext')) {
                    var entitycontext = Sage.Services.getService('ClientEntityContext');
                    var context = entitycontext.getContext();
                    entityDesc = context.Description || '';
                }
                this._ensureDescriptionsForm();
                this._descriptionsForm.set('entityDesc', entityDesc);
                this._descriptionsForm.set('files', files);
                this._descriptionsForm.show();
            },
            createAttachmentSilent: function (file, mixin) {
                if (!mixin.hasOwnProperty('description')) {
                    mixin['description'] = this.getDefaultDescription(file.name);
                }
                //console.log("creating attachment silently - desc: " + mixin['description']);
                this._mixinsByName[file.name] = dLang.mixin(mixin, {
                    attachDate: Utility.Convert.toIsoStringFromDate(new Date()),
                    dataType: 'R'
                });
                this._files.push(file);
                if (!this._attachmentTemplate) {
                    this.getAttachmentTemplate(this.uploadFiles, this);
                } else {
                    this.uploadFiles();
                }
            },
            handleDescriptions: function (files, descriptions) {
                var propname = '';
                var id = '';
                this.getKnownRelationships(function (rels) {
                    var rootmixin = dLang.mixin(rels, {
                        attachDate: Utility.Convert.toIsoStringFromDate(new Date()),
                        dataType: 'R',
                        user: { '$key': Utility.getClientContextByKey('userID') || '' }
                    });
                    for (var i = 0; i < descriptions.length; i++) {
                        descriptions[i][propname] = id;
                        this._mixinsByName[descriptions[i].fileName] = dLang.mixin(descriptions[i], rootmixin);
                    }
                    for (i = 0; i < files.length; i++) {
                        this._files.push(files[i]);
                    }
                    if (!this._attachmentTemplate) {
                        this.getAttachmentTemplate(this.uploadFiles, this);
                    } else {
                        this.uploadFiles();
                    }
                }, this);
            },
            uploadFiles: function (template) {
                this._isUploading = true;
                this._fileCount = this._files.length;
                if (template && !this._attachmentTemplate) {
                    this._attachmentTemplate = template;
                }
                while (this._files.length > 0) {
                    var file = this._files.pop();
                    Sage.Utility.File.uploadFile(file,
                    this._uploadUrl,
                    this._updateProgress,
                    this._successUpload,
                    this._failAdd,
                    this);
                }
            },
            _successUpload: function (request) {

                //the id of the new attachment is buried in the Location response header...
                var url = request.getResponseHeader('Location');
                var re = /\'\w+\'/g;
                var matches = url.match(re);
                if (matches) {
                    var id = matches[0].replace(/\'/g, '');

                    //now that we have the id, we can fetch it using the SingleEntrySDataStore
                    var tempStore = new SingleEntrySDataStore({
                        resourceKind: 'attachments',
                        service: SDataServiceRegistry.getSDataService('system')
                    });
                    tempStore.fetch({
                        predicate: '"' + id + '"',
                        onComplete: function (attachment) {
                            //now we have the attachment entity, we can set the values to the properties we need to
                            var mixin = this._mixinsByName[attachment.fileName];
                            if (mixin) {
                                attachment = dLang.mixin(attachment, mixin);
                                // then save it
                                tempStore.save({
                                    scope: this,
                                    success: this._successAddEntity,
                                    failure: this._failAdd
                                });
                            }
                            //clean up in case they upload the same file again to another entity or something
                            delete (this._mixinsByName[attachment.fileName]);
                        },
                        beforeRequest: function (req) {
                            req.setQueryArg('_includeFile', 'false');
                        },
                        onError: this._failAdd,
                        scope: this
                    });
                }
                this._filesUploadedCount = this._filesUploadedCount + 1;
                this._updateProgress((this._fileCount < 1) ? 100 : (this._filesUploadedCount / this._fileCount) * 100);
            },
            _successAddEntity: function (entity) {
                //console.log('new attachment record created... ' + entity['$key']);
                dojo.publish('/entity/attachment/create', entity);
            },
            getAttachment: function (id) {
                if (id && id.length === 12) {
                    window.open('slxdata.ashx/slx/system/-/attachments(\'' + id + '\')/file', 'file');
                }
            },
            getAttachmentTemplate: function (callback, scope) {
                FileUtil.Attachment._createStore();
                FileUtil.Attachment._store.newItem({
                    onComplete: callback,
                    scope: scope || this
                });
            },
            getDefaultDescription: function (filename) {
                this._ensureDescriptionsForm();
                return this._descriptionsForm.getDefaultDescription(filename);
            },
            _createStore: function () {
                if (!FileUtil.Attachment._store) {
                    FileUtil.Attachment._store = new SingleEntrySDataStore({
                        resourceKind: 'attachments',
                        service: SDataServiceRegistry.getSDataService('system')
                    });
                }
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
                } else {
                    dialogs.closeProgressBar();
                    this._resetCounts();

                }
            },
            _resetCounts: function () {
                this._fileCount = 0;
                this._filesUploadedCount = 0;
                this._isUploading = false;
                this._totalProgress = 0;
            },
            _failAdd: function (resp) {
                console.warn('Attachment failed to save %o', resp);
            },
            _successUpdate: function (attachment) {
                dojo.publish('/entity/attachment/update', attachment);
            },
            _ensureDescriptionsForm: function () {
                if (!this._descriptionsForm) {
                    this._descriptionsForm = new DescriptionsForm({
                        entityDesc: '',
                        files: this._files || []
                    });
                    dojo.connect(this._descriptionsForm, 'onDescriptionsEntered', this, 'handleDescriptions');
                }
            },
            getKnownRelationships: function (callback, scope, includeInsertActivity) {
                var retobj = {};
                if (Sage.Services.hasService('ClientEntityContext')) {
                    var entitycontext = Sage.Services.getService('ClientEntityContext');
                    var context = entitycontext.getContext();
                    var parts = context.EntityType.split('.');
                    var entityType = parts[parts.length - 1];
                    if (context.EntityId !== "") {
                        var id = context.EntityId;
                        switch (entityType) {
                            case 'IContact':
                                this._getContactRelationships(id, callback, scope);
                                return;
                            case 'IOpportunity':
                                this._getOpportunityRelationships(id, callback, scope);
                                return;
                            case 'ITicket':
                                this._getTicketRelationships(id, callback, scope);
                                return;
                            case 'ISalesOrder':
                                this._getSalesOrderRelationships(id, callback, scope);
                                return;
                            case 'IActivity':
                                this._getActivityRelationships(id, callback, scope);
                                return;
                            case 'IHistory':
                                this._getHistoryRelationships(id, callback, scope);
                                return;
                            case 'IContract':
                                this._getContractRelationships(id, callback, scope);
                                return;
                            case 'IReturn':
                                this._getReturnRelationships(id, callback, scope);
                                return;
                        }
                        var propname = context.EntityTableName.toLowerCase() + 'Id';
                        retobj[propname] = id;
                        callback.call(scope || this, retobj);
                        return;
                    } else if (entityType === 'IActivity' && includeInsertActivity) {
                        //we are in insert activity or history mode - get the relationships from the Editor...
                        //*** note *** this should only be called by the fallback file picker
                        // when using HTML5 File support or Gears, this is not needed.  This is just
                        // a hack for IE without gears.
                        this._getInsertActivityRelationships(callback, scope);
                        return;
                    } else if (entityType === 'IHistory' && includeInsertActivity) {
                        this._getInsertHistoryRelationships(callback, scope);
                        return;
                    }
                }
                callback.call(scope || this, {});
            },
            _getRequest: function (resourceKind, id) {
                var req = new Sage.SData.Client.SDataSingleResourceRequest(SDataServiceRegistry.getSDataService('dynamic'));
                req.setResourceKind(resourceKind);
                req.setResourceSelector('"' + id + '"');
                req.setQueryArg('precedence', '0');
                return req;
            },
            _getContactRelationships: function (id, callback, scope) {
                var req = this._getRequest('contacts', id);
                req.setQueryArg('include', 'Account');
                req.read({
                    success: function (contact) {
                        var obj = {
                            accountId: Utility.getValue(contact, 'Account.$key'),
                            contactId: contact.$key
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'contactId': id });
                    },
                    scope: this
                });
            },
            _getOpportunityRelationships: function (id, callback, scope) {
                var req = this._getRequest('opportunities', id);
                req.setQueryArg('include', 'Account,Contacts');
                req.setQueryArg('select', 'Contacts/IsPrimary,Account/Id');
                req.read({
                    success: function (opp) {
                        var obj = {
                            accountId: Utility.getValue(opp, 'Account.$key'),
                            opportunityId: opp.$key
                        };
                        var contactId = '';
                        var contacts = opp.Contacts.$resources;
                        if (contacts.length > 0) {
                            contactId = contacts[0].$key;
                        }
                        for (var i = 0; i < contacts.length; i++) {
                            if (contacts[i].IsPrimary) {
                                contactId = contacts[i].$key;
                            }
                        }
                        obj['contactId'] = contactId;
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'opportunityId': id });
                    },
                    scope: this
                });
            },
            _getSalesOrderRelationships: function (id, callback, scope) {
                var req = this._getRequest('salesorders', id);
                req.setQueryArg('include', 'Account');
                req.read({
                    success: function (so) {
                        //console.dir(so);
                        var obj = {
                            accountId: Utility.getValue(so, 'Account.$key'),
                            salesOrderId: so.$key
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'salesOrderId': id });
                    },
                    scope: this
                });
            },
            _getTicketRelationships: function (id, callback, scope) {
                var req = this._getRequest('tickets', id);
                req.setQueryArg('include', 'Account,Contact');
                req.read({
                    success: function (ticket) {
                        var obj = {
                            accountId: Utility.getValue(ticket, 'Account.$key'),
                            ticketId: ticket.$key,
                            contactId: Utility.getValue(ticket, 'Contact.$key')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'ticketId': id });
                    },
                    scope: this
                });
            },
            _getReturnRelationships: function (id, callback, scope) {
                var req = this._getRequest('returns', id);
                req.setQueryArg('include', 'Account,Contact,Ticket');
                req.read({
                    success: function (rma) {
                        var obj = {
                            returnId: rma.$key,
                            accountId: Utility.getValue(rma, 'Account.$key'),
                            ticketId: Utility.getValue(rma, 'Ticket.$key'),
                            contactId: Utility.getValue(rma, 'Contact.$key')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { returnId: id });
                    },
                    scope: this
                });
            },
            _getActivityRelationships: function (id, callback, scope) {
                var req = this._getRequest('activities', id);
                req.setQueryArg('select', 'AccountId,ContactId,LeadId,OpportunityId,TicketId');
                req.read({
                    success: function (activity) {
                        //console.dir(activity);
                        var obj = {
                            accountId: Utility.getValue(activity, 'AccountId'),
                            activityId: activity.$key,
                            contactId: Utility.getValue(activity, 'ContactId'),
                            leadId: Utility.getValue(activity, 'LeadId'),
                            opportunityId: Utility.getValue(activity, 'OpportunityId'),
                            ticketId: Utility.getValue(activity, 'TicketId')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'activityId': id });
                    },
                    scope: this
                });
            },
            _getInsertActivityRelationships: function (callback, scope) {
                var ed = dijit.byId('activityEditor');
                if (ed) {
                    var obj = ed.getRelationshipsForAttachments();
                    callback.call(scope || this, obj);
                    return;
                }
                callback.call(scope || this, { 'activityId': '' });
            },
            _getHistoryRelationships: function (id, callback, scope) {
                var req = this._getRequest('history', id);
                req.setQueryArg('select', 'AccountId,ContactId,LeadId,OpportunityId,TicketId');
                req.read({
                    success: function (history) {
                        //console.dir(history);
                        var obj = {
                            accountId: Utility.getValue(history, 'AccountId'),
                            historyId: history.$key,
                            contactId: Utility.getValue(history, 'ContactId'),
                            leadId: Utility.getValue(history, 'LeadId'),
                            opportunityId: Utility.getValue(history, 'OpportunityId'),
                            ticketId: Utility.getValue(history, 'TicketId')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'historyId': id });
                    },
                    scope: this
                });
            },
            _getInsertHistoryRelationships: function (callback, scope) {
                var ed = dijit.byId('historyEditor');
                if (ed) {
                    var obj = ed.getRelationshipsForAttachments();
                    callback.call(scope || this, obj);
                    return;
                }
                callback.call(scope || this, { 'historyId': '' });
            },
            _getContractRelationships: function (id, callback, scope) {
                var req = this._getRequest('contracts', id);
                req.setQueryArg('include', 'Account,Contact');
                req.read({
                    success: function (contract) {
                        var obj = {
                            accountId: Utility.getValue(contract, 'Account.$key'),
                            contractId: contract.$key,
                            contactId: Utility.getValue(contract, 'Contact.$key')
                        };
                        callback.call(scope || this, obj);
                    },
                    failure: function () {
                        callback.call(scope || this, { 'ticketId': id });
                    },
                    scope: this
                });
            },

            /* remote database attachment sync functionailty   */

            remoteRequestAttachment: function (attachId) {
                //http://localhost:17966/SlxClient/slxdata.ashx/slx/system/-/attachments/$service/RequestAttachment/$template?format=json
                var payload = {
                    '$name': 'RequestAttachment',
                    'request': {
                        'entity': { '$key': attachId },
                        AttachmentId: attachId
                    }
                };
                var request = new Sage.SData.Client.SDataServiceOperationRequest(SDataServiceRegistry.getSDataService('system'))
                    .setResourceKind('attachments')
                    .setOperationName('RequestAttachment');
                request.execute(payload, {
                    success: function (response) { dojo.publish('/entity/attachment/requested', response); }
                });
            }

            /* end remote handling.  */
        };
        return Sage.Utility.File.Attachment = dojo.mixin(Sage.Utility.File.Attachment, i18n.getLocalization("Sage.Utility.File", "Attachment"));
    });