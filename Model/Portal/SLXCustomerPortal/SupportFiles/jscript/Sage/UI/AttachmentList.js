/*globals Sage, dojo, define, window  */
define([
    'dijit/_Widget',
    'Sage/UI/EditableGrid',
    'Sage/Data/SDataServiceRegistry',
    'dojo/string',
    'Sage/UI/Columns/DateTime',
    'Sage/UI/Columns/SlxLink',
    'Sage/Utility',
    'Sage/Utility/File',
    'Sage/Utility/File/Attachment',
    'Sage/UI/Dialogs',
    'Sage/Utility/File/AttachmentPropertiesEditForm',
    'Sage/Utility/File/FallbackFilePicker',
    'Sage/Utility/File/AddURLAttachment',
    'Sage/Utility/File/GoogleDocPicker',
    'Sage/UI/SLXPreviewGrid',
    'Sage/UI/SLXPreviewGrid/Filter/DateRange',
    'Sage/UI/SLXPreviewGrid/Filter/Text',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/i18n!./nls/AttachmentList'
],
function (_Widget,
    EditableGrid,
    SDataServiceRegistry,
    dString,
    colDateTime,
    colLink,
    utility,
    fileUtility,
    attachmentUtility,
    Dialogs,
    attachmentForm,
    FallbackFilePicker,
    AddURLAttachment,
    GoogleDocPicker,
    SlxPreviewGrid,
    dateRangeFilter,
    textFilter,
    declare,
    lang,
    attachmentListStrings) {
    var attachmentList = declare('Sage.UI.AttachmentList', [_Widget], {
        placeHolder: '',
        conditionFmt: '',
        parentRelationshipName: '',
        workspace: '',
        tabId: '',
        fileInputBtn: false,
        _attachmentEditor: false,
        _newAttachmentsCache: [],
        subscriptions: [],
        constructor: function () {
            lang.mixin(this, attachmentListStrings);
            this.subscriptions = [];
        },
        startup: function (callBack) {
            this._checkDbType(callBack);
        },
        _checkDbType: function (callBack) {
            var svc = Sage.Services.getService('SystemOptions');
            svc.get('DbType',
                function (val) {
                    this._buildGrid(val === "2" || val === "3");
                    if (typeof callBack == 'function') {
                        callBack(this);
                    }
                },
                function () {
                    this._buildGrid(false);
                    if (typeof callBack == 'function') {
                        callBack(this);
                    }
                },
                this
            );
        },
        _buildGrid: function (isRemote) {
            var columns = [
                {
                    // key field, added for automation
                    field: '$key',
                    editable: false,
                    hidden: true,
                    id: 'id',
                    formatter: function (value, rowIdx, cel) {
                        var insertId = [cel.grid.id, '-row', rowIdx].join('');
                        var id = (utility.getModeId() === 'insert') ? insertId : value;
                        var anchor = ['<div id=', id, ' >', id, '</ div>'].join('');
                        return anchor;
                    }
                },
                {
                    field: 'description',
                    name: attachmentListStrings.attachmentText,
                    format: function (rowIdx, rowItem) {
                        if (!rowItem) {
                            return this.defaultValue;
                        }

                        //console.warn('ToDo: include role security to Attachment description column rendering (or whatever other security) that was applied before.   <---<<<   <---<<<');
                        if (rowItem['url']) {
                            var href = rowItem['url'] || '';
                            href = (href.indexOf('http') < 0) ? 'http://' + href : href;
                            return dString.substitute('<a href="${0}" target="_blank" title="${1}">${2}</a>', [href, rowItem['url'], rowItem['$descriptor']]);
                        } else {
                            if (rowItem['fileExists']) {
                                return dString.substitute('<a href="javascript: Sage.Utility.File.Attachment.getAttachment(\'${0}\');" title="${1}">${1}</a>',
                                    [rowItem['$key'], rowItem['$descriptor']]);
                            } else {
                                return rowItem['$descriptor'];
                            }
                        }
                    },
                    filterConfig: { widgetType: textFilter },
                    width: '300px'
                },
                {
                    field: 'user',
                    name: attachmentListStrings.userText,
                    format: function (rowIdx, rowItem) {
                        if (!rowItem) { return ''; }
                        var user = (rowItem.hasOwnProperty('user') && typeof rowItem['user'] === 'object') ? rowItem.user : null;
                        if (!user) {
                            return '';
                        }
                        return user['$descriptor'];
                    },
                    width: '120px'
                },
                {
                    field: 'attachDate',
                    name: attachmentListStrings.modDateText,
                    filterConfig: {
                        widgetType: dateRangeFilter,
                        label: attachmentListStrings.dateRangeText
                    },
                    type: colDateTime,
                    width: '175px'
                }, {
                    field: 'fileSize',
                    name: attachmentListStrings.sizeText,
                    formatter: function (v) {
                        return fileUtility.formatFileSize(v);
                    },
                    width: '120px'
                }, {
                    field: 'fileName',
                    name: attachmentListStrings.extensionText,
                    formatter: function (s, rowIdx, cell) {
                        if (!s) {
                            return '.';
                        }
                        return s.substr(s.lastIndexOf('.'));
                    },
                    sortable: false,
                    width: '120px'
                }
            ];
            var tools = [
                {
                    id: this.id + '_btnBrowse',
                    imageClass: 'icon_plus_16x16',
                    handler: this.browseForFiles,
                    title: attachmentListStrings.addFileText,
                    alternateText: attachmentListStrings.addFileText,
                    appliedSecurity: '',
                    scope: this
                }, {
                    //       id: this.id + '_btnAddGoogle',
                    //      imageClass: 'icon_google_16x16',
                    //      handler: this.addGoogle,
                    //      title: attachmentListStrings.addGoogleText,
                    //      appliedSecurity: '',
                    //      scope: this
                    //  }, {
                    id: this.id + '_btnAddUrl',
                    imageClass: 'icon_Internet_Service_Add_16x16',
                    handler: this.addUrlAttachment,
                    title: attachmentListStrings.addUrlText,
                    appliedSecurity: '',
                    alternateText: attachmentListStrings.addUrlText,
                    scope: this
                }, {
                    id: this.id + '_btnEditAttachProps',
                    imageClass: 'icon_Edit_Item_16x16',
                    handler: this.editSelectedAttachment,
                    title: attachmentListStrings.editText,
                    appliedSecurity: '',
                    alternateText: attachmentListStrings.editText,
                    scope: this
                }, {
                    id: this.id + '_btnDeleteAttachment',
                    imageClass: 'icon_Delete_16x16',
                    title: attachmentListStrings.deleteText,
                    handler: this.deleteSelectedAttachment,
                    appliedSecurity: '',
                    alternateText: attachmentListStrings.deleteText,
                    scope: this
                }, {
                    id: this.id + '_btnHelp',
                    imageClass: 'icon_Help_16x16',
                    handler: function () {
                        utility.openHelp('attachmentstab');
                    },
                    title: attachmentListStrings.helpText,
                    alternateText: attachmentListStrings.helpText,
                    appliedSecurity: ''
                }
            ];

            if (isRemote) {
                var remoteColumn = {
                    field: 'remoteStatus',
                    name: '&nbsp;',
                    width: '300px',
                    format: function (rowIdx, rowItem) {
                        if (!rowItem) {
                            return this.defaultValue;
                        }

                        var status = (rowItem['remoteStatus']) ? rowItem['remoteStatus'] : (rowItem['fileExists']) ? 'Delivered' : 'Available';
                        if (!rowItem['dataType']) {
                            status = 'X'; // URL attachments - do not put a link to download these, they fail anyway.
                        }

                        // Available | Requested | Delivered
                        var link = dString.substitute('<a href="javascript:Sage.Utility.File.Attachment.remoteRequestAttachment(\'${0}\')">${1}</a>',
                            [rowItem['$key'], attachmentListStrings.request]);
                        switch (status) {
                            case 'Available':
                                return attachmentListStrings.available + ' - ' + link;
                            case 'Requested':
                                return attachmentListStrings.requested; // +' - ' + link;
                            case 'Delivered':
                                return attachmentListStrings.delivered + ' - ' + link;
                            default:
                                return ' ';
                        }
                    }
                };
                columns.splice(2, 0, remoteColumn);
            }

            var parentRelationshipName = this.parentRelationshipName;
            var entityId = utility.getCurrentEntityId()
            if (parentRelationshipName === 'activityId') {
                entityId = entityId.substr(0, 12); // for reoccuring activity Ids;
            }
            var options = {
                readOnly: true,
                columns: columns,
                tools: tools,
                storeOptions: {
                    service: SDataServiceRegistry.getSDataService('system'),
                    resourceKind: 'attachments',
                    include: ['$descriptors'],
                    select: ['description', 'user', 'attachDate', 'fileSize', 'fileName', 'url', 'fileExists', 'remoteStatus', 'dataType'],
                    sort: [{ attribute: 'attachDate'}]
                },
                slxContext: { 'workspace': this.workspace, tabId: this.tabId },
                contextualCondition: function () {



                    return (parentRelationshipName || '\'A\'') + ' eq \'' + entityId + '\'';
                },
                id: this.id + '_attachments',
                rowsPerPage: 20
            };
            var curId = utility.getCurrentEntityId();
            if (!curId) {
                options.storeOptions['isInsertMode'] = true;
            }
            //fire this so that customizations can change these options without overriding the whole thing
            this.onBeforeCreateGrid(options);

            var grid = new SlxPreviewGrid.Grid(options, this.placeHolder);
            grid.setSortColumn('attachDate');
            this._grid = grid._grid;
            this._previewGrid = grid;

            grid.startup();
            // This is not a typo.  The dijit.layout.ContentPane is not affectively determining all of it's layout information
            // on the first pass through resize.  Calling resize twice effectively renders the grid to fill it's container.
            if (this.workspace) {
                var localTC = dijit.byId('tabContent');
                localTC.resize(); localTC.resize();
            }
            //            });

            var self = this;
            //<input type="file" id="fileElem" multiple="true" accept="image/*" style="display:none" onchange="handleFiles(this.files)">  
            this.fileInputBtn = dojo.doc.createElement('INPUT');
            dojo.attr(this.fileInputBtn, {
                'type': 'file',
                'multiple': 'true',
                'accept': '*/*',
                'class': 'display-none',
                onchange: function (e) {
                    self.handleFiles(e);
                }
            });
            dojo.place(this.fileInputBtn, this.domNode, 'last');

            this.subscriptions.push(dojo.subscribe('/entity/attachment/create', this, this.onNewAttachmentEntity));
            this.subscriptions.push(dojo.subscribe('/entity/attachment/update', this, this.onAttachmentUpdated));
            if (isRemote) {
                this.subscriptions.push(dojo.subscribe('/entity/attachment/requested', this, this.onAttachmentUpdated));
            }

            dojo.connect(grid, 'destroy', this, this.destroy);
            var contextservice = Sage.Services.getService('ClientEntityContext');
            var ctx = contextservice.getContext();
            this.contextEntityType = ctx.EntityType;
        },
        refresh: function () {
            if (this._grid) {
                var gridmode = this._grid.get('mode');
                var curId = utility.getCurrentEntityId();
                if ((!curId && gridmode !== 'insert') ||
                   (curId && gridmode === 'insert')) {
                    this._grid.set('mode', (!curId) ? 'insert' : '');
                }
                this._previewGrid.refresh();
            }
        },
        resetEntityContext: function () {
            var parentRelationshipName = this.parentRelationshipName;
            var entityId = utility.getCurrentEntityId();
            if (parentRelationshipName === 'activityId') {
                entityId = entityId.substr(0, 12); // for reoccuring activity Ids;
            }
            var contextualCondition = function () {
                return (parentRelationshipName || '\'A\'') + ' eq \'' + entityId + '\'';
            };
            this._previewGrid.resetContextualCondition(contextualCondition);
            this.refresh();
        },
        destroy: function () {
            var len = this.subscriptions.length;
            for (var i = 0; i < len; i++) {
                dojo.unsubscribe(this.subscriptions.pop());
            }
        },
        handleFiles: function (e) {
            var files = this.fileInputBtn.files;
            this._createAttachments(files);
        },
        handleGearsDesktopFileSelect: function (files) {
            if (files.length > 0) {
                attachmentUtility.createAttachments(files);
            }
        },
        _createAttachments: function (files) {
            if (files.length > 0) {
                attachmentUtility.createAttachments(files);
            }
        },
        onNewAttachmentEntity: function (attachment) {
            var contextservice = Sage.Services.getService('ClientEntityContext');
            var ctx = contextservice.getContext();
            if (this.contextEntityType !== ctx.EntityType) {
                return;
            }
            if (this._grid.mode === 'insert') {
                if (!attachment) {
                    this._getFallBackPickerAttachment();
                    return;
                } else {
                    this._newAttachmentsCache.push(attachment);
                    this._grid.store.addToCache(this, attachment, 1);
                }
            }
            this._previewGrid.refresh();
        },
        _getFallBackPickerAttachment: function () {
            var editor = dijit.byId('activityEditor');
            var idField = 'activityId';
            if (!editor || !editor._tempIdForAttachments) {
                editor = dijit.byId('historyEditor') || {};
                idField = 'historyId';
            }
            var tempid = editor._tempIdForAttachments;
            if (tempid) {
                var req = new Sage.SData.Client.SDataResourceCollectionRequest(SDataServiceRegistry.getSDataService('system'))
                    .setResourceKind('attachments')
                    .setQueryArg('select', ['description', 'userId', 'attachDate', 'fileSize', 'fileName', 'url', 'fileExists'].join(','))
                    .setQueryArg('where', idField + ' eq \'' + tempid + '\'')
                    .setStartIndex(1)
                    .setCount(50);
                req.read({
                    success: this._receivedFallBackPickerAttachments,
                    failure: function () {
                    },
                    scope: this
                });

            }
        },
        _receivedFallBackPickerAttachments: function (data) {
            var attachments = data.$resources;
            this.clearNewAttachments();
            for (var i = 0; i < attachments.length; i++) {
                var att = attachments[i];
                this._newAttachmentsCache.push(att);
                this._grid.store.addToCache(this, att, i);
            }
            this._previewGrid.refresh();
        },
        onAttachmentUpdated: function (attachment) {

            var contextservice = Sage.Services.getService('ClientEntityContext');
            var ctx = contextservice.getContext();
            if (this.contextEntityType !== ctx.EntityType) {
                return;
            }
            if (this._grid.mode === 'insert') {
                var newAtts = this._newAttachmentsCache;
                for (var i = 0; i < newAtts.length; i++) {
                    if (newAtts[i].$key === attachment.$key) {
                        lang.mixin(newAtts[i], attachment);
                    }
                }
            }
            this._previewGrid.refresh();
        },
        getNewAttachments: function () {
            return this._newAttachmentsCache;
        },
        clearNewAttachments: function () {
            this._newAttachmentsCache = [];
            this._grid.store.clearCache();
        },
        _editAttachmentInfo: function (attachId) {
            // use query parameter of _includeFile=false to get only the attachment entity for editing

            if (!this._attachmentEditor) {
                this._attachmentEditor = new attachmentForm();
            }
            this._attachmentEditor.set('attachmentId', attachId);
            this._attachmentEditor.show();

        },
        browseForFiles: function (e) {
            if (Sage.gears) {
                var desktop = Sage.gears.factory.create('beta.desktop');
                desktop.openFiles(this.handleGearsDesktopFileSelect);
            } else if (fileUtility.supportsHTML5File) {
                this.fileInputBtn.click();
            } else {
                var fbfp = dijit.byId('fallbackFilePicker');
                if (!fbfp) {
                    fbfp = new FallbackFilePicker({ id: 'fallbackFilePicker' });
                }
                fbfp.show();
            }
        },
        addUrlAttachment: function (e) {
            var ed = dijit.byId('urlAttachmentEditor');
            if (!ed) {
                ed = new AddURLAttachment({ id: 'urlAttachmentEditor' });
            }
            ed.set('attachmentId', '');
            ed.show();
        },
        editSelectedAttachment: function () {
            var selectedItems = this._grid.selection.getSelected();
            if (selectedItems.length < 1) {
                return;
            }
            var item = selectedItems[0];  // what do we do if more than one is selected - edit only the first?
            this._editAttachmentInfo(item['$key']);
        },
        deleteSelectedAttachment: function () {
            this._grid.deleteSelected(function () {
                dojo.publish('/entity/attachment/delete');
            });
        },
        addGoogle: function () {
            var gPicker = dijit.byId('googleDocumentPicker');
            if (!gPicker) {
                gPicker = new GoogleDocPicker({ id: 'googleDocumentPicker' });
                dojo.connect(gPicker, 'onDocumentSelected', this, '_handleGoogleDocPicked');
            }
            gPicker.pick();
        },
        _handleGoogleDocPicked: function (title, url) {
            var request = new Sage.SData.Client.SDataTemplateResourceRequest(SDataServiceRegistry.getSDataService('system'));
            request.setResourceKind('attachments');
            request.read({
                success: function (attachment) {
                    attachment.description = dojo.isArray(title) ? title[0] : title;
                    attachment.url = dojo.isArray(url) ? url[0] : url;
                    this._addRelationshipsToGoogleDocAttachment(attachment);
                },
                failure: function (err) {
                    console.warn('an exception occurred getting attachment template ' + err);
                },
                scope: this
            });
        },
        _addRelationshipsToGoogleDocAttachment: function (attachment) {
            attachmentUtility.getKnownRelationships(function (rels) {
                var newAttach = lang.mixin(attachment, rels);
                newAttach.user = { '$key': utility.getClientContextByKey('userID') || '' };
                newAttach.attachDate = utility.Convert.toIsoStringFromDate(new Date());
                var request = new Sage.SData.Client.SDataSingleResourceRequest(SDataServiceRegistry.getSDataService('system'))
                    .setResourceKind('attachments');
                request.create(newAttach, {
                    success: function (att) {
                        dojo.publish('/entity/attachment/create', att);
                    },
                    failure: function (err) {
                        console.warn('an exception occurred saving google document attachment ' + err);
                    },
                    scope: this
                });
            }, this);
        },
        onBeforeCreateGrid: function (options) { },
        setToReadOnly: function (readOnly) {

            var disableList = [this.id + '_btnBrowse',
                             this.id + '_btnAddUrl',
                             this.id + '_btnEditAttachProps',
                             this.id + '_btnDeleteAttachment'
                             ];
            this._bulkSetProperty(this, disableList, 'disabled', readOnly);

        },
        _bulkSetProperty: function (ui, propsList, prop, val) {
            for (var i = 0; i < propsList.length; i++) {
                var ctrl = dijit.byId(propsList[i]);
                if (ctrl) {
                    ctrl.set(prop, val);
                }
            }
        }

    });

    return attachmentList;
});