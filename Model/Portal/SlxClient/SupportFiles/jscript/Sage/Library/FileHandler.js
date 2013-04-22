/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Data/SDataServiceRegistry',
        'Sage/Services/RoleSecurityService',
        'Sage/Services/SystemOptions',
        'Sage/Utility/File',
        'Sage/Utility/File/Attachment',
        'Sage/Utility/File/DragDropWatcher',
        'Sage/Utility/File/DefaultDropHandler',
        'Sage/Utility/File/FallbackFilePicker',
        'Sage/Utility/File/LibraryDocument',
        'Sage/Library/DocumentProperties',
        'Sage/UI/Dialogs',
        'Sage/Utility',
        'dijit/ProgressBar',
        'dojo/i18n',
        'dojo/parser',
        'dojo/string',
        'dojo/dom-construct',
        'dojo/_base/lang',
        'dojo/i18n!./nls/FileHandler'
    ],
// ReSharper disable InconsistentNaming    
    function (SDataServiceRegistry, RoleSecurityService, SystemOptions, File, Attachment, DragDropWatcher, DefaultDropHandler,
        FallbackFilePicker, LibraryDocument, DocumentProperties, Dialogs, Utility, ProgressBar, i18n, parser, dString,
        domConstruct, dLang, nls) {

        Sage.namespace('Library.FileHandler');
        dojo.mixin(Sage.Library.FileHandler, {
            _docPropsDlg: false,
            _fileInputBtn: false,
            _getNewRequest: function () {
                var oRequest = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Library.FileHandler._system);
                oRequest.setResourceKind('libraryDocuments');
                oRequest.setQueryArg('format', 'json');
                return oRequest;
            },
            _initSecurity: function () {
                this.can.add = this._roles.hasAccess('Entities/LibraryDocs/Add');
                this.can.edit = this._roles.hasAccess('Entities/LibraryDocs/Edit');
                this.can['delete'] = this._roles.hasAccess('Entities/LibraryDocs/Delete');
                this.can.manage = (this._roles.hasAccess('Administration/Manage/Library') || this._roles.hasAccess('Administration/View'));
            },
            _remote: false,
            _roles: null,
            _system: null,
            can: { add: false, edit: false, 'delete': false, manage: false },
            resources: {},
            init: function () {
                var oSystemOptions = Sage.Services.getService('SystemOptions');
                if (oSystemOptions) {
                    oSystemOptions.get('DbType',
                        function (val) {
                            this._remote = (val && val == 2);
                        },
                        function () {
                            if (typeof console !== 'undefined') {
                                console.error('Unable to determine SystemOptions.DbType.');
                            }
                        },
                        this
                    );
                } else {
                    if (typeof console !== 'undefined') {
                        console.error('Unable to load the SystemOptions service.');
                    }
                }
                Sage.Library.FileHandler._roles = Sage.Services.getService('RoleSecurityService');
                Sage.Library.FileHandler._initSecurity();
                Sage.Library.FileHandler._system = SDataServiceRegistry.getSDataService('system');
                dLang.mixin(Sage.Library.FileHandler.resources, nls);
                if (Sage.Library.FileHandler.can.add || Sage.Library.FileHandler.can.manage) {
                    dojo.connect(DragDropWatcher, 'onFilesDropped', this, 'onFilesDropped');
                }
                var self = this;
                this._fileInputBtn = dojo.doc.createElement('INPUT');
                dojo.attr(this._fileInputBtn, {
                    'type': 'file',
                    'multiple': 'true',
                    'accept': '*/*',
                    'class': 'display-none',
                    onchange: function (e) {
                        self.handleHTML5Files(e);
                    }
                });
                dojo.place(this._fileInputBtn, 'filePicker');
                Sage.Utility.File.DefaultDropHandler.fileType = Sage.Utility.File.fileType.ftLibraryDocs;
            },
            addFiles: function () {
                if (!(Sage.Library.FileHandler.can.add || Sage.Library.FileHandler.can.manage)) {
                    Sage.Library.FileHandler.showAccessError();
                    return;
                }
                if (Sage.gears && Sage.gears.factory) {
                    var desktop = Sage.gears.factory.create('beta.desktop');
                    desktop.openFiles(function (files) {
                        if (files && files.length > 0) {
                            LibraryDocument.createDocuments(files);
                        }
                    });
                } else if (File.supportsHTML5File) {
                    // Calls handleHTML5Files().
                    Sage.Library.FileHandler._fileInputBtn.click();
                } else {
                    // IE 8 (without Sage Gears).
                    var fbfp = dijit.byId('fallbackFilePicker');
                    if (!fbfp) {
                        fbfp = new FallbackFilePicker(
                            {
                                id: 'fallbackFilePicker',
                                fileType: Sage.Utility.File.fileType.ftLibraryDocs
                            });
                    }
                    fbfp.show();
                }
            },
            deleteFile: function (fileId, onComplete, onFailure) {
                if (!(Sage.Library.FileHandler.can['delete'] || Sage.Library.FileHandler.can.manage)) {
                    Sage.Library.FileHandler.showAccessError();
                    return;
                }
                var oRequest = Sage.Library.FileHandler._getNewRequest();
                oRequest.setResourceSelector("'" + fileId + "'");
                oRequest['delete']({}, {
                    scope: this,
                    ignoreETag: true,
                    success: function () {
                        // entry is always null during DELETE operations.
                        if (onComplete && typeof onComplete === 'function') {
                            onComplete();
                        }
                    },
                    failure: function (xhr, sdata) {
                        if (onFailure && typeof onFailure === 'function') {
                            onFailure(xhr, sdata);
                        } else {
                            Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FileHandler.resources.FileDeleteError });
                        }
                    }
                });
            },
            updateProperties: function (fileId, data, onComplete, onFailure) {
                if (!(Sage.Library.FileHandler.can.edit || Sage.Library.FileHandler.can.manage)) {
                    Sage.Library.FileHandler.showAccessError();
                    return;
                }
                var oRequest = Sage.Library.FileHandler._getNewRequest();
                oRequest.setResourceSelector("'" + fileId + "'");
                oRequest.setQueryArg('_includeFile', 'false');
                oRequest.update(data, {
                    scope: this,
                    success: function (entry) {
                        if (onComplete && typeof onComplete === 'function') {
                            onComplete(entry);
                        }
                    },
                    failure: function (xhr, sdata) {
                        if (onFailure && typeof onFailure === 'function') {
                            onFailure(xhr, sdata);
                        } else {
                            if (xhr.readyState == 4 && xhr.status == 412) {
                                Sage.UI.Dialogs.showError(Sage.Library.FileHandler.resources.DocumentUpdateConflictError);
                            } else {
                                Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FileHandler.resources.DocumentPropertiesUpdateError });
                            }
                        }
                    }
                });
            },
            onFilesDropped: function (files, target) {
                Sage.Utility.File.DefaultDropHandler.fileType = Sage.Utility.File.fileType.ftLibraryDocs;
            },
            documentProperties: function () {
                if (Sage.Library.FileHandler._docPropsDlg === false) {
                    Sage.Library.FileHandler._docPropsDlg = new DocumentProperties();
                }
                return Sage.Library.FileHandler._docPropsDlg;
            },
            getSelectedRow: function (attribute) {
                try {
                    if (!attribute) {
                        attribute = '$key';
                    }
                    var grid = dijit.byId('libraryGrid');
                    if (grid) {
                        var selrow = grid.selection.getSelected();
                        if (selrow && selrow.length > 0) {
                            return selrow[0][attribute][0];
                        }
                    }
                    return false;
                } catch (e) {
                    console.error(e);
                    return false;
                }
            },
            handleHTML5Files: function (e) {
                if (this._fileInputBtn.files.length > 0) {
                    LibraryDocument.createDocuments(this._fileInputBtn.files);
                }
            },
            handleAddButtonClicked: function (event) {
                Sage.Library.FileHandler.addFiles();
            },
            findDirectoryId: function (dropTarget) {
                if (!dropTarget) {
                    if (Sage.Library.Manager) {
                        return Sage.Library.Manager.getOpenFolderId();
                    }
                    else {
                        return '';
                    }
                }
                try {
                    var target = dijit.getEnclosingWidget(dropTarget);
                    if (target && typeof target === 'object' && target.isTreeNode) {
                        if (target.item) {
                            if (target.item.root !== true) {
                                if (target.item.id && dojo.isArray(target.item.id) && target.item.id.length == 1) {
                                    return target.item.id[0];
                                }
                                else {
                                    return '';
                                }
                            }
                            else {
                                return target.item.id;
                            }
                        }
                    }
                } catch (e) {
                    if (typeof console !== 'undefined') {
                        console.error(e);
                    }
                }
                if (Sage.Library.Manager) {
                    return Sage.Library.Manager.getOpenFolderId();
                }
                return '';
            },
            editLibraryFileProps: function () {
                var row = Sage.Library.FileHandler.getSelectedRow();
                if (row) {
                    var readOnly = !(Sage.Library.FileHandler.can.edit || Sage.Library.FileHandler.can.manage);
                    Sage.Library.FileHandler.showPropertiesDialog(row, readOnly);
                }
                else {
                    Sage.UI.Dialogs.showInfo(Sage.Library.FileHandler.resources.PleaseSelectFile);
                }
            },
            validateProperties: function (formData) {
                if (!(Sage.Library.FileHandler.can.edit || Sage.Library.FileHandler.can.manage)) {
                    return;
                }

                if (!formData) {
                    return;
                }

                if (typeof console !== 'undefined') {
                    // Clone formData since we are modifying it directly; otherwise Firebug will display
                    // the modified formData for both the original and the modified debug calls.
                    try {
                        var originalFormData = dojo.clone(formData);
                        console.debug('formData [original]: %o', originalFormData);
                    } catch (e) {
                        console.error(e);
                    }
                }

                var arrProps = ['abstract', 'createDate', 'description', 'expireDate', 'expires', 'fileName', 'flags', 'revisionDate', 'doNotExpire', 'forceDistribution', 'status', 'fileSize', 'directory'];
                dojo.forEach(arrProps, function (prop) {
                    if (formData.hasOwnProperty(prop)) {
                        var value = formData[prop];
                        var originalValue;
                        var bChecked;
                        switch (prop) {
                            case 'expireDate':
                            case 'revisionDate':
                                // "value" is a JavaScript Date object; "originalValue" is a String.
                                originalValue = formData[prop + '$originalValue']; // JSON String (e.g. "/Date(4070908800000)/")
                                if (originalValue && dojo.isString(originalValue) && Utility.Convert.isDateString(originalValue)) {
                                    var originalDate = Utility.Convert.toDateFromString(originalValue);
                                    originalDate = new Date(originalDate.getUTCFullYear(), originalDate.getUTCMonth(), originalDate.getUTCDate());
                                    if (value && value.toString() === originalDate.toString()) {
                                        // The Date was [not] modified so remove the property.
                                        delete formData[prop];
                                    }
                                }
                                break;
                            case 'doNotExpire':
                                // dijit.form.CheckBox
                                if (value) {
                                    if (formData.hasOwnProperty('expires')) {
                                        bChecked = dojo.isArray(value) && value.length > 0 && value[0] === 'on';
                                        var expires = formData['expires'];
                                        if (expires === null) {
                                            expires = 'false';
                                        }
                                        if ((!bChecked && expires == 'true') || (bChecked && expires == 'false')) {
                                            delete formData['expires'];
                                        }
                                        else {
                                            formData['expires'] = (bChecked) ? false : true;
                                        }
                                    }
                                }
                                delete formData[prop];
                                break;
                            case 'forceDistribution':
                                // dijit.form.CheckBox
                                if (value) {
                                    if (formData.hasOwnProperty('flags')) {
                                        bChecked = dojo.isArray(value) && value.length > 0 && value[0] === 'on';
                                        var flags = formData['flags'];
                                        if (flags === null) {
                                            flags = '0';
                                        }
                                        if ((!bChecked && flags === '0') || (bChecked && flags === '1')) {
                                            delete formData['flags'];
                                        }
                                        else {
                                            formData['flags'] = (bChecked) ? 1 : 0;
                                        }
                                    }
                                }
                                delete formData[prop];
                                break;
                            case 'expires':
                            case 'flags':
                                // Logic is in the handler for doNotExpire and forceDistribution.
                                break;
                            case 'status':
                            case 'createDate':
                            case 'fileSize':
                            case 'directory':
                                delete formData[prop];
                                break;
                            default:
                                // abstract, description, or fileName
                                originalValue = formData[prop + '$originalValue']; // String
                                if (value === null && originalValue === null) {
                                    delete formData[prop];
                                } else if (value !== null && originalValue === null) {
                                    // Continue
                                }
                                else if (value === null && originalValue !== null) {
                                    // Continue
                                } else if (dojo.isString(value) && dojo.isString(originalValue)) {
                                    if (value == originalValue) {
                                        delete formData[prop];
                                    }
                                }
                                break;
                        }
                    }
                    if (formData.hasOwnProperty(prop + '$originalValue')) {
                        delete formData[prop + '$originalValue'];
                    }
                });

                if (typeof console !== 'undefined') {
                    console.debug('formData [modified]: %o', formData);
                }

                var bHasMods = false;
                dojo.some(arrProps, function (prop) {
                    if (formData.hasOwnProperty(prop)) {
                        bHasMods = true;
                        return true;
                    } else {
                        return false;
                    }
                });

                if (bHasMods) {
                    var sKey = formData.$key;
                    delete formData.$key;
                    Sage.Library.FileHandler.updateProperties(
                        sKey,
                        formData,
                        function (entry) {
                            if (typeof console !== 'undefined') {
                                console.debug('Updated document: %o', entry);
                            }
                            dojo.publish('/sage/library/manager/libraryDocuments/refresh', null);
                        }
                    );
                }
            },
            closePropertiesDialog: function () {
                Sage.Library.FileHandler.documentProperties().hide();
            },
            showPropertiesDialog: function (fileId, readOnly, onFailure) {
                if (fileId) {
                    var oRequest = Sage.Library.FileHandler._getNewRequest();
                    oRequest.setResourceSelector("'" + fileId + "'");
                    oRequest.setQueryArg('_includeFile', 'false');
                    oRequest.setQueryArg('include', 'directory/fullPath');
                    oRequest.read({
                        scope: this,
                        success: function (entry) {
                            var arrProps = ['abstract', 'createDate', 'description', 'expireDate', 'expires', 'fileName', 'flags', 'revisionDate', 'status'];
                            dojo.forEach(arrProps, function (prop) {
                                var value = entry[prop];
                                if (prop != 'createDate') {
                                    entry[prop + '$originalValue'] = value;
                                }
                                switch (prop) {
                                    case 'createDate':
                                    case 'expireDate':
                                    case 'revisionDate':
                                        if (value && dojo.isString(value) && Utility.Convert.isDateString(value)) {
                                            var date = Utility.Convert.toDateFromString(value);
                                            entry[prop] = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                                        }
                                        break;
                                    case 'expires':
                                        if (value === null) {
                                            entry[prop] = 'false';
                                        }
                                        break;
                                    case 'flags':
                                        if (value === null) {
                                            entry[prop] = 0;
                                        }
                                        break;
                                    case 'abstract':
                                    case 'description':
                                    case 'fileName':
                                        if (value === null) {
                                            entry[prop] = '';
                                        }
                                        break;
                                    case 'status':
                                        entry[prop] = Sage.Library.FileHandler.translateStatus(value);
                                        break;
                                }
                            });
                            Sage.Library.FileHandler.documentProperties().show(entry, readOnly);
                        },
                        failure: function (xhr, sdata) {
                            if (onFailure && typeof onFailure === 'function') {
                                onFailure(xhr, sdata);
                            } else {
                                Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FileHandler.resources.DocumentPropertiesError });
                            }
                        }
                    });
                }
            },
            handleDeleteButtonClicked: function (button, event) {
                var name = Sage.Library.FileHandler.getSelectedRow('fileName');
                if (name) {
                    var msg = dString.substitute(Sage.Library.FileHandler.resources.DeleteFileCnfmFmt, [name]);
                    Sage.UI.Dialogs.raiseQueryDialog(
                        Sage.Library.FileHandler.resources.Confirm,
                        msg,
                        Sage.Library.FileHandler.handleDeleteConfirmed,
                        Sage.Library.FileHandler.resources.Yes,
                        Sage.Library.FileHandler.resources.No,
                        'questionIcon'
                    );
                } else {
                    Sage.UI.Dialogs.showInfo(Sage.Library.FileHandler.resources.PleaseSelectFile);
                }
            },
            handleDeleteConfirmed: function (ok) {
                if (ok) {
                    var id = Sage.Library.FileHandler.getSelectedRow();
                    if (id) {
                        Sage.Library.FileHandler.deleteFile(
                            id,
                            function () {
                                dojo.publish('/sage/library/manager/libraryDocuments/refresh', null);
                            }
                        );
                    }
                }
            },
            logRemoteDocRequest: function (fileId) {
                if (!this._remote) {
                    return;
                }
                var oRequest = new Sage.SData.Client.SDataServiceOperationRequest(this._system);
                oRequest.setResourceKind('libraryDocuments');
                oRequest.setQueryArg('format', 'json');
                oRequest.setOperationName('RequestLibraryDocument');
                var payload = {
                    '$name': 'RequestLibraryDocument',
                    'request': {
                        'entity': { $key: fileId },
                        'LibraryDocumentId': fileId
                    }
                };
                oRequest.execute(payload, {
                    scope: this,
                    success: function (entry) {
                        var bResult = false;
                        if (dojo.isObject(entry)) {
                            var oResponse = entry.response || null;
                            if (oResponse !== null) {
                                bResult = oResponse.Result || false;
                            }
                        }
                        if (bResult === false) {
                            Dialogs.showError(Sage.Library.FileHandler.resources.LogRequestError);
                        }
                    },
                    failure: function (xhr, sdata) {
                        Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FileHandler.resources.LogRequestError });
                    }
                });
            },
            showAccessError: function () {
                Sage.UI.Dialogs.showError(Sage.Library.FileHandler.resources.AccessError);
            },
            translateStatus: function (status) {
                if (!dojo.isString(status)) {
                    return Sage.Library.FileHandler.resources.Unknown;
                }
                switch (status) {
                    case 'Available': //DNL
                        return Sage.Library.FileHandler.resources.Available; // 'A'
                    case 'Ordered': //DNL
                        return Sage.Library.FileHandler.resources.Ordered; // 'O'
                    case 'Delivered': //DNL
                        return Sage.Library.FileHandler.resources.Delivered; // 'D'
                    case 'Revised': //DNL
                        return Sage.Library.FileHandler.resources.Revised; // 'R'
                    case 'RevisionOrdered': //DNL
                        return Sage.Library.FileHandler.resources.RevisionOrdered; // 'V'
                    case 'DeliveredRead': //DNL
                        return Sage.Library.FileHandler.resources.DeliveredRead; // 'L'
                    default:
                        return Sage.Library.FileHandler.resources.Unknown;
                }
            },
            updateRemoteStatus: function (fileId, status, onComplete, onFailure) {
                if (!this._remote) {
                    return;
                }
                var oRequest = Sage.Library.FileHandler._getNewRequest();
                oRequest.setResourceSelector("'" + fileId + "'");
                oRequest.setQueryArg('_includeFile', 'false');
                oRequest.update({ status: status }, {
                    scope: this,
                    success: function (entry) {
                        if (onComplete && typeof onComplete === 'function') {
                            onComplete(entry);
                        }
                    },
                    failure: function (xhr, sdata) {
                        if (onFailure && typeof onFailure === 'function') {
                            onFailure(xhr, sdata);
                        } else {
                            Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FileHandler.resources.FileStatusError });
                        }
                    }
                });
            }
        });

        Sage.Library.FileHandler.init();

        return Sage.Library.FileHandler;
    }
);