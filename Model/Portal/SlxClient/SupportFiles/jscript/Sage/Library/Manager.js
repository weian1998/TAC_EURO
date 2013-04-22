/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Data/SDataServiceRegistry',
        'Sage/Library/FileHandler',
        'Sage/Library/FolderHandler',
        'Sage/Services/RoleSecurityService',
        'Sage/Services/SystemOptions',
        'Sage/UI/Dialogs',
        'Sage/Utility',
        'dojox/grid/DataGrid',
        'Sage/UI/ImageButton',
        'dijit/Toolbar',
        'dijit/Tree',
        'dijit/tree/ForestStoreModel',
        'dojo/data/ItemFileReadStore',
        'dojo/i18n',
        'dojo/string',
        'dojo/_base/array',
        'dojo/date/locale',
        'dojo/dom-construct',
        'dojo/_base/lang',
        'dojo/i18n!./nls/Manager',
        'dojox/widget/Standby'
    ],
// ReSharper disable InconsistentNaming
    function (SDataServiceRegistry, FileHandler, FolderHandler, RoleSecurityService, SystemOptions,
        Dialogs, Utility, DataGrid, Button, Toolbar, Tree, ForestStoreModel, ItemFileReadStore, i18n, dString,
        dArray, dLocale, domConstruct, dLang, nls, Standby) {

        Sage.namespace('Library.Manager');
        dojo.mixin(Sage.Library.Manager, {
            _convert: Utility.Convert,
            _grid: null,
            _remote: false,
            _roles: null,
            _rootId: null,
            _standby: false,
            _system: null,
            _tree: null,
            _addButtonToToolbar: function (btn, toolbar) {
                toolbar.addChild(new Button({
                    label: btn.label,
                    showLabel: false,
                    iconClass: btn.icon,
                    id: btn.id,
                    layoutAlign: 'right',
                    onClick: function () {
                        btn.clickHandler();
                    }
                }));
            },
            _createGrid: function () {
                var self = this;
                this._grid = new DataGrid({
                    store: new ItemFileReadStore({ data: { items: []} }),
                    id: 'libraryGrid',
                    structure: [{
                        field: '_item',
                        name: self.resources.File,
                        formatter: self._renderFileName,
                        width: '160px',
                        sortField: 'fileName'
                    }, {
                        field: 'fileSize',
                        name: self.resources.Size,
                        formatter: self._renderSize,
                        width: '50px'
                    }, {
                        field: 'createDate',
                        name: self.resources.Created,
                        formatter: self._renderDate,
                        width: '60px'
                    }, {
                        field: 'revisionDate',
                        name: self.resources.Revised,
                        formatter: self._renderDate,
                        width: '60px'
                    }, {
                        field: '_item',
                        name: self.resources.Expires,
                        formatter: self._renderExpires,
                        width: '60px',
                        sortField: 'expireDate'
                    }, {
                        field: 'description',
                        name: self.resources.Description,
                        width: '150px'
                    }]
                });
                if (this._remote) {
                    var oStatusColumn = {
                        field: 'status',
                        name: 'Status',
                        formatter: self._renderStatus,
                        width: '150px'
                    };
                    this._grid.structure.splice(1, 0, oStatusColumn);
                    this._grid.setStructure(this._grid.structure);
                }
                // Override the grid's getSortProps function so that we can sort correctly when
                // binding to _item. The sortField property is a custom property added to help
                // sort using the appropriate field in the data store.
                var fnGetSortProps = this._grid.getSortProps;
                this._grid.getSortProps = function () {
                    var info = dojo.hitch(self._grid, fnGetSortProps)();
                    if (info && typeof info !== 'undefined') {
                        if (info[0] && info[0]['attribute'] === '_item') {
                            var cell = self._grid.getCell(self._grid.getSortIndex());
                            if (cell && typeof cell !== 'undefined' && cell.hasOwnProperty('sortField')) {
                                info[0]['attribute'] = cell.sortField;
                            }
                        }
                        return info;
                    }
                    return null;
                };
                dojo.byId('libraryGridPlaceHolder').appendChild(this._grid.domNode);
                this._grid.startup();
            },
            _createGridToolbar: function () {
                var gridtoolbar = new Toolbar({}, 'gridToolbar');
                var btns = [];
                if (Sage.Library.FileHandler.can.add || Sage.Library.FileHandler.can.manage) {
                    btns.push({ label: this.resources.AddFiles, id: 'btnAddFiles', clickHandler: Sage.Library.FileHandler.handleAddButtonClicked, icon: 'libraryIcon addFileIcon' });
                }
                btns.push({ label: this.resources.FileProperties, id: 'btnEditFile', clickHandler: Sage.Library.FileHandler.editLibraryFileProps, icon: 'libraryIcon editFileIcon' });
                if (Sage.Library.FileHandler.can['delete'] || Sage.Library.FileHandler.can.manage) {
                    btns.push({ label: this.resources.DeleteSelectedFile, id: 'btnDeleteFile', clickHandler: Sage.Library.FileHandler.handleDeleteButtonClicked, icon: 'libraryIcon deleteFileIcon' });
                }
                btns.push({ label: this.resources.Help, id: 'btnHelp', clickHandler: function () { window.open(Link.getHelpUrl('library'), Link.getHelpUrlTarget()); }, icon: 'libraryIcon helpFileIcon' });
                for (var i = 0; i < btns.length; i++) {
                    this._addButtonToToolbar(btns[i], gridtoolbar);
                }
            },
            _createTreeView: function () {
                this.refreshDirs();
            },
            _createTreeViewToolbar: function () {
                var treetoolbar = new Toolbar({}, 'treeToolbar');
                var btns = [];
                if (Sage.Library.FolderHandler.can.add || Sage.Library.FolderHandler.can.manage) {
                    btns.push({ label: this.resources.AddFolder, id: 'btnAddFolder', clickHandler: Sage.Library.FolderHandler.handleAddFolder, icon: 'libraryIcon addFolderIcon' });
                }
                if (Sage.Library.FolderHandler.can.edit || Sage.Library.FolderHandler.can.manage) {
                    btns.push({ label: this.resources.EditFolder, id: 'btnEditFolder', clickHandler: Sage.Library.FolderHandler.handleEditFolderName, icon: 'libraryIcon editFolderIcon' });
                }
                if (Sage.Library.FolderHandler.can['delete'] || Sage.Library.FolderHandler.can.manage) {
                    btns.push({ label: this.resources.DeleteFolder, id: 'btnDeleteFolder', clickHandler: Sage.Library.FolderHandler.handleDeleteFolderClicked, icon: 'libraryIcon deleteFolderIcon' });
                }
                if (btns.length > 0) {
                    for (var i = 0; i < btns.length; i++) {
                        this._addButtonToToolbar(btns[i], treetoolbar);
                    }
                }
            },
            _createView: function () {
                this._createTreeViewToolbar();
                this._createTreeView();
                this._createGridToolbar();
                this._createGrid();
            },
            _handleDeliveredDocRequest: function (fileId) {
                Sage.Library.FileHandler.updateRemoteStatus(fileId, 'DeliveredRead' /* DNL */, function () {
                    Sage.Library.Manager.refreshGrid();
                    var sUrl = dString.substitute('slxdata.ashx/slx/system/-/libraryDocuments(\'${0}\')/file', [fileId]);
                    window.open(sUrl, 'FileWin');
                });
            },
            _handleOrderDocRequest: function (fileId, newStatus) {
                Dialogs.raiseQueryDialog(
                    Sage.Library.Manager.resources.Confirm,
                    Sage.Library.Manager.resources.ConfirmDownload,
                    function (result) {
                        if (result) {
                            Sage.Library.FileHandler.updateRemoteStatus(fileId, newStatus, function (entry) {
                                Sage.Library.FileHandler.logRemoteDocRequest(fileId);
                                Sage.Library.Manager.refreshGrid();
                            });
                        }
                    },
                    Sage.Library.Manager.resources.Yes,
                    Sage.Library.Manager.resources.No,
                    'questionIcon'
                );
            },
            _handleReorderDocRequest: function (fileId) {
                Dialogs.raiseQueryDialog(
                    Sage.Library.Manager.resources.Confirm,
                    Sage.Library.Manager.resources.ConfirmDownloadReorder,
                    function (result) {
                        if (result) {
                            Sage.Library.FileHandler.logRemoteDocRequest(fileId);
                        }
                    },
                    Sage.Library.Manager.resources.Yes,
                    Sage.Library.Manager.resources.No,
                    'questionIcon'
                );
            },
            _renderDate: function (value) {
                try {
                    if (!value) {
                        return '';
                    }
                    if (dojo.isString(value) && Sage.Library.Manager._convert.isDateString(value)) {
                        var date = Sage.Library.Manager._convert.toDateFromString(value);
                        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                        return dojo.date.locale.format(date, { selector: 'date' });
                    }
                    return '';
                } catch (e) {
                    if (typeof console !== 'undefined') {
                        console.error('_renderDate: %o', e);
                    }
                    return '';
                }
            },
            _renderExpires: function (item, meta, record) {
                try {
                    if (item.expires[0] !== true) {
                        return Sage.Library.Manager.resources.Never;
                    }
                    return Sage.Library.Manager._renderDate(item.expireDate[0]);
                } catch (e) {
                    if (typeof console !== 'undefined') {
                        console.error('_renderExpires: %o', e);
                    }
                    return '';
                }
            },
            _renderFileName: function (item, index, record) {
                try {
                    if (!Sage.Library.Manager._remote) {
                        return dString.substitute('<a id="document_${0}" href="slxdata.ashx/slx/system/-/libraryDocuments(\'${0}\')/file" target="FileWin">${1}</a>',
                            [item.$key[0], item.fileName[0] || '']);
                    } else {
                        switch (item.status[0]) {
                            case 'Available':
                                //DNL 'A'
                                // The document is available to order.                                  
                                return dString.substitute('<a id="document_${0}" href="javascript:Sage.Library.Manager._handleOrderDocRequest(\'${0}\', \'Ordered\');">${1}</a>',
                                [item.$key[0], item.fileName[0] || '']);
                            case 'Revised':
                                //DNL 'R'
                                // The document has been revised and can be ordered.
                                // The revised document has been ordered.
                                return dString.substitute('<a id="document_${0}" href="javascript:Sage.Library.Manager._handleOrderDocRequest(\'${0}\', \'RevisionOrdered\');">${1}</a>',
                                [item.$key[0], item.fileName[0] || '']);
                            case 'Ordered':
                                //DNL 'O'
                                // The document has been ordered but has not been delivered via sync.                                 
                            case 'RevisionOrdered':
                                //DNL 'V'
                                return dString.substitute('<a id="document_${0}" href="javascript:Sage.Library.Manager._handleReorderDocRequest(\'${0}\');">${1}</a>',
                                [item.$key[0], item.fileName[0] || '']);
                            case 'Delivered':
                                //DNL 'D'
                                // The document has been delivered via sync but has not been read.
                                return dString.substitute('<a id="document_${0}" href="javascript:Sage.Library.Manager._handleDeliveredDocRequest(\'${0}\');">${1}</a>',
                                [item.$key[0], item.fileName[0] || '']);
                            case 'DeliveredRead':
                                //DNL 'L' // Allow launch.
                                // The document has been delivered via sync and has been read.
                                return dString.substitute('<a id="document_${0}" href="slxdata.ashx/slx/system/-/libraryDocuments(\'${0}\')/file" target="FileWin">${1}</a>',
                                [item.$key[0], item.fileName[0] || '']);
                            default:
                                return item.fileName[0] || '';
                        }
                    }
                } catch (e) {
                    if (typeof console !== 'undefined') {
                        console.error('_renderFileName: %o', e);
                    }
                    return '';
                }
            },
            _renderFixed: function (n, d) {
                try {
                    if (typeof d !== 'number')
                        d = 2;
                    var m = Math.pow(10, d);
                    var v = Math.floor(parseFloat(n) * m) / m;
                    return v;
                } catch (e) {
                    if (typeof console !== 'undefined') {
                        console.error('_renderFixed: %o', e);
                    }
                    return '';
                }
            },
            _renderSize: function (value) {
                try {
                    if (value / (1024 * 1024) > 0.5) {
                        return Sage.Library.Manager._renderFixed(value / (1024 * 1024), 1) + ' MB';
                    }
                    if (value / (1024) > 0.05) {
                        return Sage.Library.Manager._renderFixed(value / (1024), 1) + ' KB';
                    }
                    return value + ' B';
                } catch (e) {
                    if (typeof console !== 'undefined') {
                        console.error('_renderSize: %o', e);
                    }
                    return '';
                }
            },
            _renderStatus: function (value) {
                return Sage.Library.FileHandler.translateStatus(value);
            },
            _showLoading: function () {
                if (this._standby === false && this._grid.domNode) {
                    var hideNode = this._grid.domNode;
                    this._standby = new Standby({
                        target: hideNode,
                        color: 'white',
                        image: 'images/loader_lg.gif'
                    });
                    document.body.appendChild(this._standby.domNode);
                    this._standby.startup();
                }
                var self = this;
                window.setTimeout(function () {
                    self._standby.show();
                }, 0);
            },
            _hideLoading: function () {
                var self = this;
                window.setTimeout(function () {
                    if (self._standby) {
                        self._standby.hide();
                        self._standby = false;
                    }
                }, 1);
            },
            resources: {},
            init: function () {
                Sage.Library.Manager._roles = Sage.Services.getService('RoleSecurityService');
                Sage.Library.Manager._system = SDataServiceRegistry.getSDataService('system');
                dLang.mixin(Sage.Library.Manager.resources, nls);
                dojo.subscribe('/sage/library/manager/libraryDirs/refresh', function () {
                    Sage.Library.Manager.refreshDirs();
                });
                dojo.subscribe('/sage/library/manager/libraryDocuments/refresh', function (item) {
                    Sage.Library.Manager.refreshGrid(item);
                });
            },
            createView: function () {
                var oSystemOptions = Sage.Services.getService('SystemOptions');
                if (oSystemOptions) {
                    oSystemOptions.get('DbType',
                        function (val) {
                            this._remote = (val && val == 2);
                            this._createView();
                        },
                        function () {
                            this._createView();
                            if (typeof console !== 'undefined') {
                                console.error('Unable to determine SystemOptions.DbType.');
                            }
                        },
                        this
                    );
                } else {
                    this._createView();
                    if (typeof console !== 'undefined') {
                        console.error('Unable to load the SystemOptions service.');
                    }
                }
            },
            getDirs: function (onComplete) {
                var self = this;
                var oRequest = new Sage.SData.Client.SDataResourceCollectionRequest(this._system);
                oRequest.setResourceKind('libraryDirectories');
                oRequest.setQueryArg('orderBy', 'fullPath');
                oRequest.setQueryArg('format', 'json');
                oRequest.read({
                    success: function (feed) {
                        var arrDirs = feed['$resources'];
                        if (arrDirs && dojo.isArray(arrDirs) && arrDirs.length > 0) {

                            // Locals
                            var arrDepthMap, oData, iMaxDepth = 0, bAlteredCollection = false;

                            try {

                                // Utility function to retrieve the parent of dir.
                                var fnGetParent = function (dir) {
                                    var arrResult = dojo.filter(arrDepthMap[(dir.depth - 2)].items, function (item) {
                                        return (item.$key == dir.parentId);
                                    });
                                    // Length will always be 1 if there is a result.
                                    if (arrResult.length == 1) {
                                        return arrResult[0];
                                    }
                                    return null;
                                };

                                // 1. Remove any directories that do not exist (arrDirs[i].found is not reliable).
                                for (var i = arrDirs.length - 1; i >= 0; i--) {
                                    if (this._remote === false && arrDirs[i].directoryExists === false) {
                                        arrDirs.splice(i, 1);
                                    }
                                }

                                // 2. Fix the root parentId and fullPath. The root should be the first item under MSSQL and the last under Oracle.                       
                                dojo.some(arrDirs, function (dir) {
                                    if (dir.parentId.trim() == '0') {
                                        // Remove padding of parentId.
                                        dir.parentId = '0';
                                        // Fix NULL issue (Oracle).
                                        dir.fullPath = '';
                                        // Mark the root.
                                        dir.root = true;
                                        // Store the rootId.
                                        self._rootId = dir.$key;
                                        // Break.
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });

                                // 3. Calculate the folder depth for each record.
                                dojo.forEach(arrDirs, function (dir) {
                                    // Fix bad library records that were inserted.
                                    if (dir.root !== true && dir.fullPath.indexOf('\\') != 0) {
                                        dir.fullPath = '\\' + dir.fullPath;
                                        bAlteredCollection = true;
                                        if (typeof console !== 'undefined') {
                                            console.warn('Fixed dir.fullPath: %o (%o)', dir.fullPath, dir.$key);
                                        }
                                    }
                                    // dir.depth will always be 1 or higher (except for the root).
                                    dir.depth = dir.fullPath.split('\\').length;
                                    if (dir.depth > iMaxDepth) {
                                        iMaxDepth = dir.depth;
                                    }
                                });

                                // 4. Resort by fullPath if any fullPath values had to be modified.
                                if (bAlteredCollection) {
                                    arrDirs.sort(function (dir1, dir2) {
                                        return (dir1.fullPath.toLocaleUpperCase().localeCompare(dir2.fullPath.toLocaleUpperCase()));
                                    });
                                }

                                // 5. Sort the dirs by depth.
                                arrDirs.sort(function (dir1, dir2) {
                                    return dir1.depth - dir2.depth;
                                });

                                // 6. Map each dir based on depth (performance enhancement for large libraries).
                                arrDepthMap = new Array(iMaxDepth);
                                dojo.forEach(arrDepthMap, function (item, idx) {
                                    arrDepthMap[idx] = { items: [] };
                                });
                                dojo.forEach(arrDirs, function (dir) {
                                    arrDepthMap[dir.depth - 1].items.push(dir);
                                });

                                // 7. Build up the tree dirs one level at a time.
                                dojo.forEach(arrDirs, function (dir, idx) {
                                    if (idx == 0) {
                                        if (dir.root !== true) {
                                            throw new Error(dString.substitute(self.resources.InvalidRoot, [dir.directoryName, dir.$key]));
                                        }
                                        dir.id = dir.$key;
                                        dir.items = [];
                                        oData = dir;
                                    } else {
                                        // This should always be true unless we have bad library data.
                                        if (dir.depth > 1) {
                                            switch (dir.depth) {
                                                // First level of children added to the root.                                                                                                                                                                                                                                                                                                                                                                                                                                            
                                                case 2:
                                                    dir.id = dir.$key;
                                                    dir.children = [];
                                                    oData.items.push(dir);
                                                    break;
                                                // Other levels below the first level of children.                                                                                                                                                                                                                                                                                                                                                                                                                                             
                                                default:
                                                    var oParent = fnGetParent(dir);
                                                    if (oParent !== null) {
                                                        dir.id = dir.$key;
                                                        dir.children = [];
                                                        if (!oParent.children) {
                                                            oParent.children = [];
                                                        }
                                                        oParent.children.push(dir);
                                                    } else {
                                                        if (typeof console !== 'undefined') {
                                                            console.warn('Could not locate parent directory for %o', dir);
                                                        }
                                                    }
                                                    break;
                                            }
                                        }
                                    }
                                });

                                if (typeof onComplete === 'function') {
                                    onComplete(oData);
                                }

                            } catch (e) {
                                Sage.UI.Dialogs.showError(self.resources.LibraryDataError + ' ' + e);
                            }
                        }
                    },
                    failure: function (xhr, sdata) {
                        Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: self.resources.DirectoryInformationError });
                    }
                });
                return true;
            },
            getOpenFolderId: function (item) {
                var id = this.getRootId();
                if (item && item.id && item.root !== true) {
                    id = item.id;
                    if (dojo.isArray(id)) {
                        id = id[0];
                    }
                    if (typeof console !== 'undefined') {
                        console.debug('getOpenFolderId - item.id: %o', id);
                    }
                }
                else if (this._tree.attr("selectedItem")) {
                    id = this._tree.attr("selectedItem").id;
                    if (dojo.isArray(id)) {
                        id = id[0];
                    }
                    if (typeof console !== 'undefined') {
                        console.debug('getOpenFolderId - selectedNode: %o', id);
                    }
                }
                else {
                    if (typeof console !== 'undefined') {
                        console.debug('getOpenFolderId - root: %o', id);
                    }
                }
                return id;
            },
            getRootId: function () {
                return this._rootId;
            },
            refreshDirs: function () {
                var self = this;
                this.getDirs(
                    function (data) {
                        // Destroy and recreate the tree to refresh. Setting the store has no effect.
                        // Issue: http://dojotoolkit.org/reference-guide/1.7/dijit/Tree.html
                        // 'How do I refresh a Tree from the store? This isn’t supported.'
                        if (self._tree) {
                            self._tree.destroyRecursive();
                        }
                        var oStore = new ItemFileReadStore({ data: data });
                        var oModel = new ForestStoreModel({
                            store: oStore,
                            rootId: data.$key,
                            rootLabel: Sage.Library.Manager.resources.Library,
                            labelAttr: 'directoryName',
                            childrenAttrs: ['children']
                        });
                        var oTreeDiv = new dojo.create('div', { id: 'libraryTree' });
                        self._tree = new dijit.Tree({
                            model: oModel,
                            onClick: Sage.Library.FolderHandler.handleFolderClicked,
                            persist: false,
                            _createTreeNode: function (args) {
                                // Create a unique ID that can be used by automated testing.
                                args.id = 'dijit__TreeNode_' + args.item.id;
                                return new dijit._TreeNode(args);
                            },
                            rootId: data.$key
                        },
                            oTreeDiv
                        );
                        var hTreeOnLoad = dojo.connect(self._tree, 'onLoad', function () {
                            dojo.disconnect(hTreeOnLoad);
                            self.refreshGrid();
                        });
                        dojo.place(self._tree.domNode, 'libraryTreeRoot', 'after');
                    }
                );
            },
            refreshGrid: function (item) {
                var self = this;
                var id = this.getOpenFolderId(item);
                var oRequest = new Sage.SData.Client.SDataResourceCollectionRequest(this._system);
                oRequest.setResourceKind('libraryDocuments');
                oRequest.setQueryArg('where', dString.substitute('directory.Id eq \'${0}\'', [id]));
                oRequest.setQueryArg('orderBy', 'fileName');
                oRequest.setQueryArg('format', 'json');
                this._showLoading();
                oRequest.read({
                    success: function (feed) {
                        try {
                            var files = { items: feed['$resources'] || [] };
                            // Remove any documents that do not exist (files.items[i].found is not reliable).
                            for (var i = files.items.length - 1; i >= 0; i--) {
                                if (files.items[i].fileExists === false) {
                                    // If the user is [not] a remote user.
                                    if (!self._remote) {
                                        files.items.splice(i, 1);
                                    } else {
                                        // If the user [is] a remote user.
                                        if (files.items[i].status === 'Delivered' /* DNL */ || files.items[i].status === 'DeliveredRead' /* DNL */) {
                                            // If the file was not found, but has been delivered or delivered and then read, change the status to Available
                                            // so that the document can be requested again by the user.
                                            files.items[i].status = 'Available'; //DNL
                                            Sage.Library.FileHandler.updateRemoteStatus(files.items[i].$key, 'Available'); //DNL                                    
                                        }
                                    }
                                }
                            }
                            var oStore = new ItemFileReadStore({ data: files });
                            self._grid.setStore(oStore);
                        } finally {
                            self._hideLoading();
                        }
                    },
                    failure: function (xhr, sdata) {
                        self._hideLoading();
                        Utility.ErrorHandler.handleHttpError(xhr, sdata, { message: self.resources.DocumentInformationError });
                    }
                });
            }
        });

        Sage.Library.Manager.init();

        return Sage.Library.Manager;
    }
);
    
