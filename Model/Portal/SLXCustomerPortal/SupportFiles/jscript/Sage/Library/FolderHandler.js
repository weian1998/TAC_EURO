/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Data/SDataServiceRegistry',
        'Sage/Services/RoleSecurityService',
        'Sage/UI/Dialogs',
        'Sage/Utility',
        'dijit/ProgressBar',
        'dojo/i18n',
        'dojo/parser',
        'dojo/string',
        'dojo/_base/lang',
        'dojo/i18n!./nls/FolderHandler'
    ],
// ReSharper disable InconsistentNaming    
    function (SDataServiceRegistry, RoleSecurityService, Dialogs, Utility, ProgressBar, i18n, parser, dString, dLang, nls) {
        Sage.namespace('Library.FolderHandler');
        dojo.mixin(Sage.Library.FolderHandler, {
            _getNewRequest: function () {
                var oRequest = new Sage.SData.Client.SDataSingleResourceRequest(Sage.Library.FolderHandler._system);
                oRequest.setResourceKind('libraryDirectories');
                oRequest.setQueryArg('format', 'json');
                return oRequest;
            },
            _initSecurity: function () {
                this.can.add = this._roles.hasAccess('Entities/LibraryDirs/Add');
                this.can.edit = this._roles.hasAccess('Entities/LibraryDirs/Edit');
                this.can['delete'] = this._roles.hasAccess('Entities/LibraryDirs/Delete');
                this.can.manage = (this._roles.hasAccess('Administration/Manage/Library') || this._roles.hasAccess('Administration/View'));
            },
            _roles: null,
            _system: null,
            can: { add: false, edit: false, 'delete': false, manage: false },
            resources: {},
            init: function () {
                Sage.Library.FolderHandler._roles = Sage.Services.getService('RoleSecurityService');
                Sage.Library.FolderHandler._initSecurity();
                Sage.Library.FolderHandler._system = SDataServiceRegistry.getSDataService('system');
                dLang.mixin(Sage.Library.FolderHandler.resources, nls);
            },
            addFolder: function (parentId, folderName, onComplete, onFailure) {
                if (!(Sage.Library.FolderHandler.can.add || Sage.Library.FolderHandler.can.manage)) {
                    Sage.Library.FolderHandler.showAccessError();
                    return;
                }
                var oRequest = Sage.Library.FolderHandler._getNewRequest();
                oRequest.create({ parentId: parentId, directoryName: folderName }, {
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
                            Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FolderHandler.resources.AddFolderError });
                        }
                    }
                });
            },
            deleteFolder: function (directoryId, onComplete, onFailure) {
                if (!(Sage.Library.FolderHandler.can['delete'] || Sage.Library.FolderHandler.can.manage)) {
                    Sage.Library.FolderHandler.showAccessError();
                    return;
                }
                var oRequest = Sage.Library.FolderHandler._getNewRequest();
                oRequest.setResourceSelector("'" + directoryId + "'");
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
                            Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FolderHandler.resources.DeleteFolderError });
                        }
                    }
                });
            },
            getOpenFolderEtag: function (item) {
                if (item) {
                    return item.$etag;
                }
                var libTree = dijit.byId('libraryTree');
                var etag = (!(libTree.selectedNode) || libTree.selectedNode.item.root)
                    ? libTree.selectedNode.item.root.$etag[0]
                    : libTree.selectedNode.item.$etag[0];
                return etag;

            },
            getOpenFolderName: function () {
                var libTree = dijit.byId('libraryTree');
                return libTree.selectedNode.label;
            },
            handleDeleteFolderClicked: function (button, event) {
                if (Sage.Library.Manager.getOpenFolderId() == Sage.Library.Manager.getRootId()) {
                    Sage.UI.Dialogs.showWarning(Sage.Library.FolderHandler.resources.DontDeleteRoot);
                    return;
                }
                var dirName = Sage.Library.FolderHandler.getOpenFolderName();
                if (dirName !== '') {
                    var msg = dString.substitute(Sage.Library.FolderHandler.resources.DeleteFolderCnfmFmt, [dirName]);
                    Sage.UI.Dialogs.raiseQueryDialog(Sage.Library.FolderHandler.resources.Confirm,
                        msg,
                        Sage.Library.FolderHandler.handleDeletefolderConfirmed,
                        Sage.Library.FolderHandler.resources.Yes,
                        Sage.Library.FolderHandler.resources.No,
                        'questionIcon'
                    );
                } else {
                    Sage.UI.Dialogs.showInfo(Sage.Library.FolderHandler.resources.PleaseSelectFolder);
                }
            },
            handleDeletefolderConfirmed: function (ok) {
                if (ok) {
                    Sage.Library.FolderHandler.deleteFolder(
                        Sage.Library.Manager.getOpenFolderId(),
                        function () {
                            dojo.publish('/sage/library/manager/libraryDirs/refresh', '');
                        }
                    );
                }
            },
            handleAddFolder: function (button, event) {
                Sage.UI.Dialogs.raiseInputDialog(
                    Sage.Library.FolderHandler.resources.NewFolder,
                    Sage.Library.FolderHandler.resources.EnterFolderName,
                    Sage.Library.FolderHandler.handleAddFolderCallback,
                    Sage.Library.FolderHandler.resources.OK,
                    Sage.Library.FolderHandler.resources.Cancel
                );
            },
            handleAddFolderCallback: function (ok, text) {
                if (ok) {
                    var dirid = Sage.Library.Manager.getOpenFolderId();
                    Sage.Library.FolderHandler.addFolder(
                        dirid,
                        text,
                        function (entry) {
                            if (typeof console !== 'undefined') {
                                console.debug('New folder: %o', entry);
                            }
                            dojo.publish('/sage/library/manager/libraryDirs/refresh', '');
                        }
                    );
                }
            },
            handleEditFolderName: function (button, event) {
                if (Sage.Library.Manager.getOpenFolderId() == Sage.Library.Manager.getRootId()) {
                    Sage.UI.Dialogs.showWarning(Sage.Library.FolderHandler.resources.DontEditRoot);
                    return;
                }
                var dirName = Sage.Library.FolderHandler.getOpenFolderName();
                Sage.UI.Dialogs.raiseInputDialog(
                    Sage.Library.FolderHandler.resources.NewFolder,
                    Sage.Library.FolderHandler.resources.EnterNewFolderName,
                    Sage.Library.FolderHandler.handleEditFolderNameCallback,
                    Sage.Library.FolderHandler.resources.OK,
                    Sage.Library.FolderHandler.resources.Cancel,
                    dirName,
                   '[^\\\\/:"*?<>|\r\n]+',
                   Sage.Library.FolderHandler.resources.InvalidFolderName
                );
            },
            handleEditFolderNameCallback: function (ok, text) {
                if (ok) {
                    var dirid = Sage.Library.Manager.getOpenFolderId();
                    var etag = Sage.Library.FolderHandler.getOpenFolderEtag();
                    Sage.Library.FolderHandler.renameFolder(
                        dirid,
                        text,
                        etag,
                        function (entry) {
                            if (typeof console !== 'undefined') {
                                console.debug('Renamed folder: %o', entry);
                            }
                            dojo.publish('/sage/library/manager/libraryDirs/refresh', '');
                        }
                    );
                }
            },
            handleFolderClicked: function (item, node) {
                //var nodeid = (typeof node == 'undefined') ? Sage.Library.FolderHandler.getOpenFolderId() : node.id;
                var delBtn = dijit.byId('btnDeleteFolder');
                var editBtn = dijit.byId('btnEditFolder');
                if ((typeof delBtn !== 'undefined') && (delBtn !== null) && (editBtn !== null)) {
                    if (item.root) {
                        delBtn.set('disabled', true);
                        editBtn.set('disabled', true);
                    } else {
                        delBtn.set('disabled', false);
                        editBtn.set('disabled', false);
                    }
                }
                dojo.publish('/sage/library/manager/libraryDocuments/refresh', item);
            },
            renameFolder: function (directoryId, newName, etag, onComplete, onFailure) {
                if (!(Sage.Library.FolderHandler.can.edit || Sage.Library.FolderHandler.can.manage)) {
                    Sage.Library.FolderHandler.showAccessError();
                    return;
                }
                var oRequest = Sage.Library.FolderHandler._getNewRequest();
                oRequest.setResourceSelector("'" + directoryId + "'");
                oRequest.update({ $etag: etag, directoryId: directoryId, directoryName: newName }, {
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
                                Sage.UI.Dialogs.showError(Sage.Library.FolderHandler.resources.FolderUpdateConflictError);
                            }
                            else {
                                Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: Sage.Library.FolderHandler.resources.RenameFolderError });
                            }
                        }
                    }
                });
            },
            showAccessError: function () {
                Sage.UI.Dialogs.showError(Sage.Library.FolderHandler.resources.AccessError);
            }
        });

        Sage.Library.FolderHandler.init();

        return Sage.Library.FolderHandler;
    }
);