/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, TabControl */

define(['dojox/grid/DataGrid',
    'dijit/Toolbar',
    'dijit/form/Button',
    'dijit/layout/ContentPane',
    'Sage/Data/WritableSDataStore',
    'Sage/Data/WritableStore',
    'Sage/UI/SDataLookup',
    'dojo/i18n',
    'dojo/_base/lang',
    'Sage/Utility',
    'Sage/UI/ImageButton',
    'Sage/UI/Dialogs',
    'Sage/Utility/_LocalStorageMixin',
    'dojo/i18n!./nls/EditableGrid',
    'Sage/UI/ToolBarLabel',
    'dojo/parser',
    'dojo/dom-construct',
    'dojo/_base/declare',
    'dojo/_base/array'
],
function (DataGrid,
    Toolbar,
    Button,
    ContentPane,
    WritableSDataStore,
    WritableStore,
    SDataLookup,
    i18n,
    dojolang,
    Utility,
    ImageButton,
    Dialogs,
    _LocalStorageMixin,
    nlsEditablGrid,
    ToolBarLabel,
    parser,
    domConstruct,
    declare,
    array
) {
    var editableGrid = declare('Sage.UI.EditableGrid', [DataGrid, _LocalStorageMixin], {
        recordCountLabel: null,
        STORE_KEY_COLUMN_SIZE: '_COLUMN_UNIT_WIDTH_',
        STORE_NS: 'SAGE_UI_EDITABLEGRID',
        STORE_KEY_SORT: '_SORT_INFO_',
        lookupControl: null,
        mode: '',
        region: 'center',
        _dataChangeConnections: [],
        _registeredWidgets: null,

        constructor: function (opts) {
            this.mode = Utility.getModeId();
            if (opts.storeOptions && opts.storeOptions.isInsertMode) {
                this.mode = 'insert';
            }

            this._dataChangeConnections = [];
            this._registeredWidgets = [];
        },

        _setModeAttr: function (mode) {
            if (this.mode !== mode) {
                this.mode = mode;
                if (!this.store) {
                    return;
                }
                if (((mode === 'insert') && (this.store.declaredClass !== 'Sage.Data.WritableStore')) ||
                   ((mode !== 'insert') && (this.store.declaredClass != 'Sage.Data.WritableSDataStore'))) {
                    this._replaceStore();
                }
            }
        },
        _getModeAttr: function () {
            return this.mode;
        },
        // Fixes IE. Issue was the grid itself has focus, so blur on cells doesn't work
        onBlur: function () {
            if (this.edit && this.edit.isEditing()) {
                this.edit.apply();
            }
        },

        //end i18n strings.
        postMixInProperties: function () {
            dojo.mixin(this, nlsEditablGrid);
            dojo.mixin(this, i18n.getLocalization("dijit", "common"));
            this.setEditable();

            if (!this.storeOptions) {
                this.storeOptions = {};
            }
            this.ensureValue(this.storeOptions, 'pagesize', this.rowsPerPage || 20);
            this.ensureValue(this, 'singleClickEdit', true);

            if (typeof this.contextualCondition === 'function') {
                this.query = { fn: this.contextualCondition, scope: this };
            } else if (typeof this.contextualCondition === 'object') {
                if (this.contextualCondition.fn) {
                    this.ensureValue(this.contextualCondition, 'scope', this);
                    this.query = this.contextualCondition;
                }
            }

            //set up structure:
            this.structure = [
                {
                    defaultCell: dojolang.mixin({ defaultValue: '' }, this.columnDefaults),
                    cells: this.columns
                }
            ];
            function addToListUnique(item, list) {
                for (var i = 0; i < list.length; i++) {
                    if (item === list[i]) {
                        return;
                    }
                }
                list.push(item);
            }

            //create and startup the toolbar...
            if ((this.tabId) && (this.tabId !== '')) {
                this.addToolsToWorkspaceToolbar();
                this.currentEntityId = Utility.getCurrentEntityId();
            } else {
                this.createOwnToolbar();
            }

            //set up the datastore if they didn't give us one...
            this._setUserPrefColumnWidths();
            var cols = this.columns,
                sel, i, p, inc, parts, combined;

            if (!this.store) {
                sel = this.storeOptions.select || [];
                for (i = 0; i < sel.length; i++) {
                    sel[i] = sel[i].replace(/\./g, '/');
                }
                inc = this.storeOptions.include || [];
                var field;
                for (i = 0; i < cols.length; i++) {
                    if (cols[i].field) {
                        field = cols[i].field;
                        addToListUnique(field.replace(/\./g, '/'), sel);
                    }
                    if (cols[i].field.indexOf('.') > 0) {
                        parts = cols[i].field.split('.');
                        combined = '';
                        for (p = 0; p < parts.length - 1; p++) {
                            combined += parts[p];
                            addToListUnique(combined, inc);
                            combined += '/';
                        }
                    }
                }
                this.store = this.getStore();
                //Clean up any dirty data flags.  We can assume it is clean with a new store.
                this.markClean();
            } else {
                //this means a datastore was given to us - most likely a proxydatastore.
                sel = this.store.select = this.store.select || [];
                inc = this.store.include = this.store.include || [];
                for (i = 0; i < sel.length; i++) {
                    sel[i] = sel[i].replace(/\./g, '/');
                }
                for (i = 0; i < cols.length; i++) {
                    if (cols[i].field) {
                        field = cols[i].field;
                        addToListUnique(field.replace(/\./g, '/'), sel);
                    }
                    if (cols[i].field.indexOf('.') > 0) {
                        parts = cols[i].field.split('.');
                        combined = '';
                        for (p = 0; p < parts.length - 1; p++) {
                            combined += parts[p];
                            addToListUnique(combined, inc);
                            combined += '/';
                        }
                    }
                }
            }
            //apply saved sort information...
            this._setSortInfo();
            this.inherited(arguments);
        },
        postCreate: function () {
            //summary:
            //Add event connections
            //Enable the grid to commit its changes on Enter -- TODO: Review behavior.
            dojo.connect(this, 'onKeyDown', this.customKeyDown);
            // Store column resizings
            dojo.connect(this, 'onResizeColumn', this._onResizeColumn);
            dojo.subscribe('Sage/events/TabWorkspace/MIDDLE_AREA_DROP', this, this._setMiddleAreaHeight);
            // Enhanced Loading message when adding and deleting items from the editable 
            // grid to display immediately rather than waiting for datastore fetch.
            this.connect(this, '_onNew', this.showLoading);
            // Update the display count.
            this.connect(this.scroller, 'scroll', this._onScroll);
            dojo.connect(this, 'onResizeColumn', this._onScroll);
            this.setupHeader();
            this.inherited(arguments);
        },
        showLoading: function () {
            this.showMessage(this.loadingMessage);
            this._clearData();
            this.markClean();
        },
        headerTemplate: new Simplate([
            '<div>',
            '<div id="{%= $.id %}_HeaderBar"  data-dojo-type="dijit.layout.ContentPane" gutters="false"  region="top" ',
                'style="{%= $.headerStyle %}" class="editable-grid-hbar">',
                '<div class="editable-grid-hbar-left"></div>',
                '<div class="editable-grid-hbar-center"></div>',
                    '<div class="editable-grid-hbar-right"><div id="{%= $.gridNodeId %}_recordCountLabel"></div></div>',
            '</div>',
            '</div>'
        ]),
        setupHeader: function () {
            //Get the headerBar created and ready.
            this.recordCountLabel = new ToolBarLabel();
            this.recordCountLabel.set('label', dojo.string.substitute(this.recordCountFormatString, this._getRecordCount()));
            var headerBar = this.headerTemplate.apply(this);
            headerBar = dojo.toDom(headerBar);
            this.headerContentPane = parser.parse(headerBar);
            // Put the header bar in place.
            //dojo.place(this.headerBar, this.gridNodeId, 'before');
            var container = dijit.byId(this.gridNodeId);
            container.addChild(this.headerContentPane[0]);
            // Put the record label in place
            dojo.place(this.recordCountLabel.domNode, this.gridNodeId + '_recordCountLabel', 'replace');
        },
        resetContextualCondition: function (contextualCondition) {
            if (typeof contextualCondition === 'function') {
                this.query = { fn: contextualCondition, scope: this };
            } else if (typeof contextualCondition === 'object') {
                if (contextualCondition.fn) {
                    this.ensureValue(contextualCondition, 'scope', this);
                    this.query = contextualCondition;
                }
            }
            this.contextualCondition = contextualCondition;

        },
        _getRecordCount: function () {
            // summary: Returns an array with the counts for the displayed records in the grid.  [firstrow, lastrow, count]
            var scroller,
                firstrow,
                lastrow,
                count;
            scroller = this.scroller;
            count = scroller.rowCount;
            if (count <= 0) {
                firstrow = 0;
                lastrow = 0;
                count = 0;
            } else {
                firstrow = (scroller.firstVisibleRow === 0) ? 1 : scroller.firstVisibleRow + 1;
                lastrow = (scroller.lastVisibleRow >= scroller.rowCount) ? scroller.rowCount : scroller.lastVisibleRow;
            }
            return [firstrow, lastrow, count];
        },
        _onScroll: function (inTop) {
            // Set the record count.
            if (this.recordCountLabel) {
                this.recordCountLabel.set('label', dojo.string.substitute(this.recordCountFormatString, this._getRecordCount()));
            }
        },
        _setMiddleAreaHeight: function (data) {
            var selfQuery = ['#', data.tab.ElementId, ' #', this.id].join('');
            var self = dojo.query(selfQuery)[0];
            if (self) {
                var middleTabItemQuery = ['#', data.tab.ElementId, ' .tws-tab-view-body'].join('');
                var middleTabItemViewBody = dojo.query(middleTabItemQuery)[0];
                //Set a default height (> 0) so the grid will have a place to expand from.
                dojo.style(middleTabItemViewBody, 'height', '10px');
                TabControl.setViewBodyHeight();
            }
        },
        _setUserPrefColumnWidths: function () {
            var self = this;
            dojo.forEach(this.columns, function (col) {
                if (col && col.field) {
                    var key = self._getColumnSizeKey(col),
                        value = self.getFromLocalStorage(key, self.STORE_NS);
                    if (value) {
                        col.width = value;
                    }
                }
            });
        },
        _getColumnSizeKey: function (cell) {
            var fieldStripped = cell.field.replace(/[\.\$]/g, '_'),
                id = [this.id, '_', this.STORE_KEY_COLUMN_SIZE, fieldStripped].join('');
            return id;
        },
        _onResizeColumn: function (columnIndex) {
            // Handle size storage
            var cell = this.getCell(columnIndex),
                value = cell.unitWidth,
                key = this._getColumnSizeKey(cell);
            this.saveToLocalStorage(key, value, this.STORE_NS);
        },
        listenForPageSave: function () {
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.addListener(bindingMgr.ON_SAVE, this.saveChanges, this);
            }
        },
        removePageSaveListener: function () {
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.removeListener(bindingMgr.ON_SAVE, this.saveChanges);
            }
        },
        setEditable: function () {
            var editable = true;
            //Check Action security of the grid.
            if (this.appliedSecurity) {
                var svc = Sage.Services.getService("RoleSecurityService");
                if (svc) {
                    editable = svc.hasAccess(this.appliedSecurity);
                }
            }
            if (this.readOnly) {
                editable = false;
            }

            //If user does not have edit access to the grid, we need to override each column and set them to false.
            if (!editable) {
                for (var i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].editable) {
                        this.columns[i].editable = false;
                    }
                }
                this.editable = false;
            } else {
                //if any of the columns are editable, assume the grid is editable...
                for (var i = 0; i < this.columns.length; i++) {
                    if (this.columns[i].editable) {
                        this.editable = true;
                        break;
                    }
                }
            }
        },
        onHeaderCellClick: function (e) {
            // summary:
            // OVERRIDE of event fired when a header cell is clicked.
            // e: Event
            // Decorated event object which contains reference to grid, cell, and rowIndex
            // description:
            // Override for grid sorting to allow for:
            // 1. Disabling of sorting on a column level.
            // 2. Disabling of sorting on Insert mode due to limitations in the WritableStore.
            // 3. Displaying PageExitWarningMessage when unsaved data exists.
            var r = true;
            if (this.store.dirtyDataCache.isDirty) {
                var s = Sage.Services.getService("ClientBindingManagerService");
                r = confirm(s._PageExitWarningMessage);
            }
            if (this.columns[e.cell.index].sortable === false || !r || this.mode === 'insert') {
                dojo.stopEvent(e);
            }
            else {
                this.inherited(arguments);
                var sortProps = this.getSortProps();
                if (sortProps && sortProps.length > 0) {
                    var sortInfo = sortProps[0];
                    sortInfo.cellIndex = e.cell.index;
                    this.saveToLocalStorage(this.STORE_KEY_SORT + this.id, sortInfo, this.STORE_NS);
                }
            }
        },
        _setSortInfo: function () {
            var key = this.STORE_KEY_SORT + this.id;
            var sortProps = this.getFromLocalStorage(key, this.STORE_NS);
            if (sortProps) {
                if (sortProps.descending) {
                    this.sortInfo = (sortProps.cellIndex + 1) * -1;
                } else {
                    this.sortInfo = sortProps.cellIndex + 1;
                }
            }
        },
        ensureValue: function (obj, key, defaultValue) {
            obj[key] = obj[key] || defaultValue;
        },
        amIInATab: function () {
            if (this.context && this.context.workspace) {
                return (this.context.workspace.indexOf('TabWorkspace') > -1);
            }
            return false;
        },
        isMyTabVisible: function () {
            if (this.amIInATab() && window.TabControl) {
                return window.TabControl.getState().isTabVisible(this.tabId);
            }
            return true;
        },
        startup: function () {
            if (this._started) {
                return;
            }

            console.warn('ToDo: EditableGrid needs to connect to tab change events to properly refresh themselves.   EditableGrid - startup()');

            //            if (!this.isMyTabVisible()) {
            //                if (this.hasTabListeners) {
            //                    return;
            //                }
            //                if (typeof TabControl !== 'undefined') {
            //                    this.moreTabListener = TabControl.addListener('moretabchange', this.startup, this);
            //                    this.mainTabListener = TabControl.addListener('maintabchange', this.startup, this);
            //                    this.hasTabListeners = true;
            //                    return;
            //                }
            //            } else {
            //                if (this.hasTabListeners && TabControl) {
            //                    TabControl.removeListener('moretabchange', this.startup, this);
            //                    TabControl.removeListener('maintabchange', this.startup, this);
            //                    this.hasTabListeners = false;
            //                }
            //            }

            this.inherited(arguments);
            if (this.mode !== 'insert') {
                this.listenForPageSave();
            }
            // There are certain scenarios where a default height is required.
            if (this.context && this.context.workspace) {
                if (this.context.workspace.indexOf('TabWorkspace') <= -1) {
                    //console.log('grid.id = ' + this.id);
                    dojo.style(dojo.byId(this.id + '_Container'), 'height', '300px');
                    var main = dijit.byId(this.gridNodeId);
                    main.resize();
                }
            }
            if (this.amIInATab() && this.isMyTabVisible()) {
                var formtableQuery = ['#', 'element_', this.tabId, ' .formtable'].join('');
                var formTableBody = dojo.query(formtableQuery)[0];
                // Control is in a visible tab that is using a table layout
                if (formTableBody) {
                    //Editable Grid with it's container in markup
                    var container = dojo.byId(this.id + '_Container');
                    if (!container) {
                        //Preview Grid Layout container
                        container = dijit.byId(this.id).getParent();
                        container = container.domNode;
                    }

                    dojo.style(container, 'height', '300px');
                }
            }
        },
        destroy: function () {
            if (this.lookupControl) {
                this.lookupControl.destroy(false);
            }

            if (this.toolbar) {
                this.toolbar.destroy(false);
            }

            if (this.grid) {
                this.grid.destroy(false);
            }

            if (this.store && this.store.destroy) {
                this.store.destroy(false);
            }

            if (this._registeredWidgets) {
                array.forEach(this._registeredWidgets, function (item) {
                    item.destroy(false);
                });

                this._registeredWidgets = null;
            }

            this.removePageSaveListener();
            this.inherited(arguments);
        },
        _replaceStore: function () {
            dojo.forEach(this._dataChangeConnections, function (connection) {
                dojo.disconnect(connection);
            });
            if (this.store && this.store.destroy) {
                this.store.destroy(false);
            }
            this.store = false;
            this.store = this.getStore();
        },
        getStore: function () {
            if (this.store) {
                return this.store;
            }

            this.storeOptions['isInsertMode'] = (this.mode === 'insert');

            var store = (this.mode !== 'insert')
                ? new WritableSDataStore(this.storeOptions)
                : new WritableStore(this.storeOptions);

            if (this.onDataChange) {
                this._dataChangeConnections.push(dojo.connect(store, 'onSet', this.onDataChange));
            }
            if (store.onDataChange) {
                this._dataChangeConnections.push(dojo.connect(store, 'setValue', store.onDataChange));
                this._dataChangeConnections.push(dojo.connect(store, 'saveNewEntity', store.onDataChange));
                this._dataChangeConnections.push(dojo.connect(store, 'deleteItem', store.onDataChange));
                this._dataChangeConnections.push(dojo.connect(store, 'createItem', store.onDataChange));
            }
            this._dataChangeConnections.push(dojo.connect(store, 'onSet', this, function (entity, attribute, oldValue, newValue) {
                if (this.mode !== 'insert' && newValue) {
                    //Varying column types have different levels of depth. We must check down the chain to
                    // get to our returnObject property.
                    if (this.edit.info.cell &&
                        this.edit.info.cell.widget &&
                        this.edit.info.cell.widget.returnObject === true) {
                        if (oldValue.$key !== newValue.$key) {
                            this.markDirty();
                        }
                    }
                    else {
                        if (oldValue !== newValue) {
                            this.markDirty();
                        }
                    }
                }
            }));

            return store;
        },
        customKeyDown: function (e) {
            this.applyEditOnEnter(e);
            this.navigateOnKeyDown(e);
        },
        navigateOnKeyDown: function (e) {
            /* This code is causing the cells data to copy into the next cell on down arrow.
            if (e.keyCode === 38 || e.keyCode === 40) {
            var newRow = this.selection.selectedIndex;
            newRow = (e.keyCode === 38) ? newRow - 1 : newRow + 1;  // Arrow button conditions
            newRow = (newRow < 0) ? 0 : newRow;
            newRow = (newRow > this.rowCount - 1) ? this.rowCount - 1 : newRow;
            this.focus.setFocusIndex(newRow, 0);
            this.selection.deselectAll();
            this.selection.select(newRow);
            this.focus.scrollIntoView();
            dojo.stopEvent(e);
            }
            */
        },
        applyEditOnEnter: function (e) {
            if (e.charOrCode == 13 || e.keyCode == 13) {
                this.doApplyEdit();
                this.edit.apply();
                dojo.stopEvent(e);
            }
        },
        createOwnToolbar: function () {
            var roleService = Sage.Services.getService("RoleSecurityService");
            var container = dijit.byId(this.gridNodeId);
            this.toolbar = new Toolbar({ 'class': 'right-tools', 'region': 'top' });
            container.addChild(this.toolbar);
            for (var i = 0; i < this.tools.length; i++) {
                var tool = this.tools[i];
                if (tool.appliedSecurity && tool.appliedSecurity !== '') {
                    if ((roleService) && (!roleService.hasAccess(tool.appliedSecurity))) {
                        continue;
                    }
                }
                var btn = false;
                if (typeof tool === 'string') {
                    switch (tool) {
                        case 'add':
                            btn = new ImageButton({
                                imageClass: 'icon_plus_16x16',
                                tooltip: this.addText,
                                id: this.id + '_addBtn',
                                onClick: dojolang.hitch(this, function () { this.addNew(); })
                            });
                            break;
                        case 'delete':
                            btn = new ImageButton({
                                imageClass: 'icon_Delete_16x16',
                                tooltip: this.deleteText,
                                id: this.id + '_delBtn',
                                onClick: dojolang.hitch(this, function () { this.deleteSelected(); })
                            });
                            break;
                        case 'save':
                            btn = new ImageButton({
                                imageClass: 'icon_Save_16x16',
                                tooltip: this.saveText,
                                id: this.id + '_saveBtn',
                                onClick: dojolang.hitch(this, function () { this.saveChanges(); })
                            });
                            break;
                        case 'cancel':
                            btn = new ImageButton({
                                imageClass: 'icon_Reset_16x16',
                                tooltip: this.cancelText,
                                id: this.id + '_cancelBtn',
                                onClick: dojolang.hitch(this, function () { this.cancelChanges(); })
                            });
                            break;
                    }
                } else {
                    if ((tool.type) && (tool.type === 'Sage.UI.SDataLookup')) {
                        var conf = tool.controlConfig || tool;
                        btn = new SDataLookup(conf);
                        this.lookupControl = btn;
                    } else {
                        btn = new ImageButton({
                            icon: tool.icon || '',
                            imageClass: tool.imageClass || '',
                            id: tool.id,
                            onClick: dojolang.hitch(tool.scope || this, tool.handler),
                            tooltip: tool.alternateText || tool.tooltip
                        });
                    }
                }
                if (btn) {
                    this.toolbar.addChild(btn);
                    btn = false;
                }
            }

            this.toolbar.startup();
        },
        addToolsToWorkspaceToolbar: function () {
            //summary:
            //Add items to the rightToolsContainer

            if (this.readOnly) {
                return;
            }
            //Add dirty data message.
            //TODO: Rename TabId to containerNodeId.  Requires template change.
            this.dirtyDataMsgID = this.tabId + '_dirtydatamsg';
            var msgBox = domConstruct.create('span', {
                'class': 'grid-unsaveddata-msg',
                'id': this.dirtyDataMsgID,
                'style': 'display:none;',
                //TODO: Localize
                'content': (this.editable) ? this.unsavedDataText : ''
            });
            var rightToolsContainer, containerId;
            //Place the tools and 'unsaved data' message into the correct workspace.
            switch (this.context.workspace) {
                case 'Sage.Platform.WebPortal.Workspaces.Tab.TabWorkspace':
                    //Don't add the dirty data message if we are in insert mode.  All data is dirty in insert mode.
                    if (this.mode !== 'insert') {
                        var elem = dojo.query('#' + 'element_' + this.tabId + ' td.tws-tab-view-title');
                        if (elem) {
                            dojo.place(msgBox, elem[0]);
                        }
                    }
                    containerId = ['element_', this.tabId].join('');
                    rightToolsContainer = dojo.query(['#', containerId, ' td.tws-tab-view-tools-right'].join(''));
                    break;
                case 'Sage.Platform.WebPortal.Workspaces.MainContentWorkspace':
                    //Don't add the dirty data message if we are in insert mode.  All data is dirty in insert mode.
                    if (this.mode !== 'insert') { dojo.place(msgBox, dojo.query('#' + this.tabId + ' span.mainContentHeaderTitle')[0]); }
                    //This containerId assignment appears redundant but we need the specific Id for the later query when placing the tool.
                    containerId = this.tabId;
                    rightToolsContainer = dojo.query('#' + containerId + ' td.mainContentHeaderToolsRight');
                    break;
                case 'Sage.Platform.WebPortal.Workspaces.DialogWorkspace':
                    //This containerId assignment appears redundant but we need the specific Id for the later query when placing the tool.
                    rightToolsContainer = dojo.query('td.dialog-tools-right');
                    break;
                default:
            }

            var roleService = Sage.Services.getService("RoleSecurityService");
            //Some buttons may be hidden in different modes and/or security levels.  
            //We'll keep a position variable to make sure the group stays together.            
            var position = 0, positionString, refNode;
            for (var i = 0; i < this.tools.length; i++) {
                positionString = '';
                var tool = this.tools[i];
                if (typeof tool.mergeControlId !== 'undefined' && tool.mergeControlId.length !== 0) {
                    refNode = dojo.query('[id$=' + tool.mergeControlId + ']', dojo.byId('element_' + this.tabId))[0];
                    positionString = tool.mergePosition.toLowerCase();
                }
                if (!refNode) {
                    // No control to place next to.  Use the container and possition 0.
                    refNode = rightToolsContainer[0];
                    positionString = '';
                }
                if (this.mode === 'insert' && !tool.displayInInsert) {
                    continue;
                }
                //check user's access to this functionality...
                if (tool.appliedSecurity && tool.appliedSecurity !== '') {
                    if ((roleService) && (!roleService.hasAccess(tool.appliedSecurity))) {
                        continue;
                    }
                }
                if (typeof tool === 'string') {
                    switch (tool) {
                        case 'add':
                            var addid = this.id + '_addBtn';
                            var addBtn = new ImageButton({
                                id: addid,
                                imageClass: 'icon_plus_16x16',
                                onClick: dojolang.hitch(this, this.addNew),
                                tooltip: this.addText
                            });
                            this._registeredWidgets.push(addBtn);
                            dojo.place(addBtn.domNode, rightToolsContainer[0], position);
                            break;
                        case 'delete':
                            var delid = this.id + '_delBtn';
                            var delBtn = new ImageButton({
                                id: delid,
                                tooltip: this.deleteText,
                                imageClass: 'icon_Delete_16x16',
                                onClick: dojolang.hitch(this, this.deleteSelected)
                            });
                            this._registeredWidgets.push(delBtn);
                            dojo.place(delBtn.domNode, rightToolsContainer[0], position);
                            break;
                        case 'save':
                            var saveid = this.id + '_saveBtn';
                            var saveBtn = new ImageButton({
                                id: saveid,
                                tooltip: this.saveText,
                                imageClass: 'icon_Save_16x16',
                                onClick: dojolang.hitch(this, this.saveChanges)
                            });
                            this._registeredWidgets.push(saveBtn);
                            dojo.place(saveBtn.domNode, rightToolsContainer[0], position);
                            break;
                        case 'cancel':
                            var cclid = this.id + '_cancelBtn';
                            var cancelBtn = new ImageButton({
                                id: cclid,
                                tooltip: this.cancelText,
                                imageClass: 'icon_Reset_16x16',
                                onClick: dojolang.hitch(this, this.cancelChanges)
                            });
                            this._registeredWidgets.push(cancelBtn);
                            dojo.place(cancelBtn.domNode, rightToolsContainer[0], position);
                            break;
                    }
                } else {
                    if ((tool.type) && (tool.type === 'Sage.UI.SDataLookup')) {
                        var conf = tool.controlConfig || tool;
                        var lup = new SDataLookup(conf);
                        dojo.place(lup.domNode, refNode, position);
                        this.lookupControl = lup;
                    } else {
                        var custombtn = new ImageButton({
                            id: tool.id,
                            icon: tool.icon || '',
                            imageClass: tool.imageClass || '',
                            onClick: dojolang.hitch(tool.scope || this, tool.handler),
                            tooltip: tool.alternateText || tool.tooltip
                        });
                        this._registeredWidgets.push(custombtn);
                        dojo.place(custombtn.domNode, refNode, (positionString.length > 0) ? positionString : position);
                    }
                }
                //Increment the position for consistent grouping of these items.
                position++;
            }
        },
        addNew: function (args) {
            if (this.store) {
                this.store.newItem(args);
            }
        },
        addAssociatedItems: function (items, parentName, childName, lookup) {
            // summary:
            //  Helper function for lookup tools.  This can be called by the handler to add items selected in a lookup
            var grid = this;
            if (Utility.getModeId() !== 'insert' && this.store.dirtyDataCache.isDirty) {
                Dialogs.raiseQueryDialog(
                    'SalesLogix',
                    this.dirtyDataMessage,
                    function (result) {
                        if (result) {
                            grid.addSelectedItems(items, parentName, childName, lookup);
                        }
                    },
                    this.okText,
                    this.cancelText
                );
            }
            else {
                grid.addSelectedItems(items, parentName, childName, lookup);
            }
        },
        addSelectedItems: function (items, parentName, childName, lookup) {
            var entities = [];
            var grid = this;
            for (var i = 0; i < items.length; i++) {
                var hasRecord = false;
                // duplicate detection
                for (var k in grid.store.dataCache) {
                    var rec = grid.store.dataCache[k];
                    if (rec[childName] && rec[childName].$key == items[i].$key)
                        hasRecord = true;
                }
                if (hasRecord)
                    continue;

                //Insert mode check
                var newRecord = {};
                if (Utility.getModeId() !== 'insert') {
                    newRecord[parentName] = { $key: Utility.getCurrentEntityId() };
                }
                newRecord[childName] = {};
                Utility.extend(newRecord[childName], items[i]);
                delete newRecord.$key;
                delete newRecord.$name;
                delete newRecord.$url;
                entities.push(newRecord);
            }
            if (entities.length > 0)
                grid.createItems(entities, function () {
                    if (Utility.getModeId() !== 'insert') {
                        __doPostBack("MainContent", "");
                    }
                });
            if (lookup)
                lookup.lookupDialog.hide();
        },
        createItems: function (items, callback) {
            if (dojo.isArray(items)) {
                var store = this.store;
                var iCreateCount = items.length;
                if (typeof console !== 'undefined') {
                    console.log('createItems() items.length = %o', iCreateCount);
                }
                //TODO: Replace callback with webworker.
                var fnResponse = function (arg1) {
                    // "this.", within the scope of fnResponse(), refers to the scope object below.
                    this.currentCount = this.currentCount + 1;
                    if (typeof console !== 'undefined') {
                        if (arg1 && typeof arg1 !== 'undefined' && arg1.getResponseHeader) {
                            console.log('createItems() response: (status = %o; statusText = %o): currentCount = %o; totalCount = %o',
                            arg1.status || 0, arg1.statusText || "", this.currentCount, this.totalCount);
                            console.log('createItems() response ETag: %o', arg1.getResponseHeader('ETag'));
                        } else {
                            if (arg1 && typeof arg1 !== 'undefined' && typeof arg1.$httpStatus === 'string') {
                                console.log('createItems() response ($httpStatus: %o; $key: %o; $descriptor: %o $etag: %o): currentCount = %o; totalCount = %o',
                                arg1.$httpStatus, arg1.$key || "", arg1.$descriptor, arg1.$etag, this.currentCount, this.totalCount);
                            } else {
                                console.log('createItems() response: (unknown status): currentCount = %o; totalCount = %o',
                                this.currentCount, this.totalCount);
                            }
                        }
                    }
                    if (this.currentCount === this.totalCount) {
                        this.grid.refresh();
                        if (typeof this.onComplete === 'function') {
                            this.onComplete.call(this.grid);
                        }
                    }
                };
                var scope = { grid: this, totalCount: iCreateCount, currentCount: 0, onResponse: fnResponse, onComplete: callback || null };
                for (var i = 0; i < items.length; i++) {
                    store.createItem(items[i], scope);
                }
            }
            else {
                //TODO: Localize and use message service.
                Dialogs.showError(this.createItemsInvalidArrayText);
            }
        },
        deleteSelected: function (callback) {
            var selectedItems = this.selection.getSelected();
            if (selectedItems.length < 1) {
                Dialogs.showError(this.noSelectionsText);
                return;
            }
            if (this.mode !== 'insert') {
                if (!this.store._checkPageExitWarningMessage()) {
                    return;
                }
            }
            var self = this;
            var opts = {
                title: 'Sage SalesLogix',
                query: dojo.string.substitute(this.confirmDeleteFmtTxt, [selectedItems.length]),
                callbackFn: function (result) { self.deleteCallback(result, callback, selectedItems); },
                yesText: this.buttonOk, //OK
                noText: this.buttonCancel //Cancel
            };
            Dialogs.raiseQueryDialogExt(opts);
        },
        deleteCallback: function (result, callback, selectedItems) {
            if (result) {
                var grid = this;
                var store = this.store;
                var iDeleteCount = 0;
                for (var i = 0; i < selectedItems.length; i++) {
                    if (this.store.isItem(selectedItems[i])) {
                        iDeleteCount++;
                    }
                }
                grid.selection.clear();
                this.showLoading();
                //TODO: Replace callback with webworker.
                var fnResponse = function (arg1, arg2) {
                    // "this.", within the scope of fnResponse(), refers to the scope object below.
                    this.currentCount = this.currentCount + 1;
                    if (typeof console !== 'undefined') {
                        if (arg1 && typeof arg1 !== 'undefined' && arg1.getResponseHeader) {
                            console.log('deleteSelected() response: (status = %o; statusText = %o): currentCount = %o; totalCount = %o',
                                arg1.status || 0, arg1.statusText || "", this.currentCount, this.totalCount);
                            console.log('deleteSelected() response ETag: %o', arg1.getResponseHeader('ETag'));
                        } else {
                            console.log('deleteSelected() response (OK): currentCount = %o; totalCount = %o', this.currentCount, this.totalCount);
                        }
                    }
                    if (this.currentCount === this.totalCount) {
                        grid.refresh();
                        if (typeof this.onComplete === 'function') {
                            this.onComplete.call(grid);
                        }
                    }
                };
                var scope = { grid: grid, totalCount: iDeleteCount, currentCount: 0, onResponse: fnResponse, onComplete: callback || null };
                for (var i = 0; i < selectedItems.length; i++) {
                    if (store.isItem(selectedItems[i])) {
                        store.deleteItem(selectedItems[i], scope);
                    }
                }
                store.clearCache();
            }
        },
        cancelChanges: function () {
            if (this.store && this.store.revert) {
                this.store.revert();
                this.markClean();
                this.refresh();
            }
        },
        saveChanges: function (callback) {
            //grids onBlur event doesn't work as expected in IE9, have to actually click outside the grid to have the event fire, so in lieu of relying on that event we'll just apply here
            if (this.exit) {
                this.edit.apply();
            }

            //Can be called from a listener on the page level save.  If the store is a proxy sdata store, it will not have a save function.
            if (!this.store.save) return;

            var iSaveCount = 0;
            for (var key in this.store.dirtyDataCache) {
                if (key !== 'isDirty') {
                    var entity = this.store.dirtyDataCache[key];
                    if (this.store.isItem(entity)) {
                        iSaveCount++;
                    }
                }
            }
            //TODO: Replace callback with webworker.
            var fnResponse = function (arg1, arg2) {
                // "this.", within the scope of fnResponse(), refers to the scope object below.
                this.currentCount = this.currentCount + 1;
                if (typeof console !== 'undefined') {
                    if (arg1 && typeof arg1 !== 'undefined' && arg1.getResponseHeader) {
                        console.log('saveChanges() response: (status = %o; statusText = %o): currentCount = %o; totalCount = %o',
                        arg1.status || 0, arg1.statusText || "", this.currentCount, this.totalCount);
                        console.log('saveChanges() response ETag: %o', arg1.getResponseHeader('ETag'));
                    } else {
                        if (arg1 && typeof arg1 !== 'undefined' && typeof arg1.$httpStatus === 'string') {
                            console.log('saveChanges() response ($httpStatus: %o; $key: %o; $descriptor: %o $etag: %o; $updated: %o): currentCount = %o; totalCount = %o',
                            arg1.$httpStatus, arg1.$key || "", arg1.$descriptor, arg1.$etag, arg1.$updated, this.currentCount, this.totalCount);
                        } else {
                            console.log('saveChanges() response: (unknown status): currentCount = %o; totalCount = %o',
                            this.currentCount, this.totalCount);
                        }
                    }
                }
                if (this.currentCount === this.totalCount) {
                    this.grid.markClean();
                    this.grid.refresh();
                    if (typeof this.onComplete === 'function') {
                        this.onComplete.call(this.grid);
                    }
                }
            };
            var scope = { grid: this, totalCount: iSaveCount, currentCount: 0, onResponse: fnResponse, onComplete: callback || null };
            this.store.save(scope);
        },
        markClean: function () {
            if (this.dirtyDataMsgID) {
                var dirtyDataMsg = dojo.byId(this.dirtyDataMsgID);
                if (dirtyDataMsg) {
                    dojo.style(dojo.byId(this.dirtyDataMsgID), 'display', 'none');
                }
                var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
                if (bindingMgr) {
                    bindingMgr.clearDirtyAjaxItem(this.id);
                }
            }
        },
        markDirty: function () {
            var node = dojo.byId(this.dirtyDataMsgID);
            if (node) {
                dojo.style(node, 'display', 'inline');
            }
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.addDirtyAjaxItem(this.id);
            }
        },
        refresh: function () {
            if (!this.scroller) {
                return;
            }
            this._refresh();
            this.onRefresh();
        },
        onRefresh: function () { }
    });
    return editableGrid;
});