dojo.provide('Sage.UI.SLXTabGrid');

/*
sample config object...

var config = {
    id : 'OppProducts',
    tabId : 'OpportunityProducts',
    gridNodeId: 'OPGrid',
    label : 'Products',
    columnDefaults: { width: 10, editable: true, styles: 'text-align: right;' },
    columns: [
        { field: 'Sort', name: 'Sort', width: 4, editable: true, styles: 'text-align: center;', formatter: Sage.Format.integer},
        {  
            field: 'Product.Name', 
            name:'Product',
            width: 16, 
            sortable: true, 
            type: Sage.UI.Columns.SlxLink,
            styles: '',
            editable: false,
        //SlxLink column properties:
            //displayFields: ['Product.Name', 'Product.Family'],
            //displayFormatString: '{0} - {1}',
            idField: 'Product.$key',
            pageName: 'Product', 
            appliedSecurity: 'Products'//,
            //urlFields: ['Product.Family', 'Product.Name'],
            //urlFormatString: 'http://www.google.com?parm1={0}&parm2={1}',
            //target: 'newWindow',
        }, 
        { field: 'Product.Family', name: 'Family', editable: false, styles: '' },
        { field: 'Program', name: 'Program', styles: '' }, 
        { field: 'Price', name: 'Price',editable: true, formatter: Sage.UI.Format.currency },
    ],
    storeOptions: {          //an object containing options for creating a Sage.Data.SDataStore or Sage.Data.WritableSDataStore...
        pagesize: 20,        //20 is default
        resourceKind: 'opportunityproducts',
        include: ['Opportunity', 'Product'], //(optional - these will be obtained from the columns supplied, but you can add extra here if you want
        select: [ 'Id', 'Product/Name' ]     // etc.  (optional - these will be obtained from the columns supplied
    },
    contextualCondition: {  //can be a function, or an object in this format:
                            //if it is a function, it will run in the context of the SLXTabGrid (what the keyword 'this' points to)
        fn : function() { 
            return String.format('Opportunity.Id eq "{0}"', Sage.Utility.getCurrentEntityId());
        },
        scope: this
    },
    tools : [ // an array of strings specifying standard tools, or objects defining custom ones
        //standard options include: 'save', 'delete', 'add', 'cancel'
        'save', 
        'delete',
        { 
            'id' : 'myBtn',
            'icon' : 'images/icons/plus_16x16.gif',
            'handler' : function() { alert('hello'); }, 
            'alternateText' : 'Click Me!',
            'appliedSecurity' : 'Products'
        }
    ],
    onDataChange: function(entity, attribute, oldValue, newValue) {
        //handle any custom data changing code here...
    }
}

*/

(function(){
	dojo.require('dojox.grid.DataGrid');
	dojo.require("dijit.Toolbar");
	dojo.require("dijit.ToolbarSeparator");
	dojo.require("dijit.form.Button");
	dojo.require("dijit.form.NumberTextBox");
	dojo.require('Sage.Data.WritableSDataStore');
	dojo.require('Sage.Data.WritableStore');
        dojo.require('Sage.Format');
	dojo.require('Sage.UI.SDataLookup');
	dojo.require("Sage.UI.NumberTextBox");
	dojo.require('Sage.UI.Currency');
	dojo.require('Sage.UI.Controls.Numeric');    
	dojo.require('Sage.UI.Columns.SlxLink');
	dojo.require('Sage.UI.Columns.Lookup');
        dojo.require('Sage.UI.Columns.SlxEdit');
        dojo.require('Sage.UI.Columns.Currency');
        dojo.require('Sage.UI.Columns.Numeric');
	dojo.requireLocalization("dojo.cldr", "currency", 'de-de');
	dojo.requireLocalization("dojo.cldr", "number", 'de-de');
	dojo.requireLocalization("dojo.cldr", "currency", 'en-us');
	dojo.requireLocalization("dojo.cldr", "number", 'en-us');
	dojo.requireLocalization("dojo.cldr", "currency", 'fr-fr');
	dojo.requireLocalization("dojo.cldr", "number", 'fr-fr');
    dojo.require("dojo.i18n");
    dojo.requireLocalization("Sage.UI", "SLXTabGrid");
	
    dojo.declare('Sage.UI.SLXTabGrid', dojox.grid.DataGrid, {
        //i18n strings:
        unsavedDataText: '*unsaved data',
        addText: 'Add',
        deleteText: 'Delete',
        saveText: 'Save',
        cancelText: 'Cancel',
        noSelectionsText: 'There are no records selected',
        confirmDeleteFmtTxt: 'Are you sure you want to delete these {0} items?',
        //end i18n strings.
	    postMixInProperties: function(){
            dojo.mixin(this, dojo.i18n.getLocalization("Sage.UI", "SLXTabGrid", this.lang));
            this.setEditable();

            this.mode = Sage.Utility.getModeId();
    		if (!this.storeOptions) {
    		    this.storeOptions = { }
    		}
    		this.ensureValue(this.storeOptions, 'pagesize', this.rowsPerPage || 20);
    		this.ensureValue(this, 'singleClickEdit', true);
    		
    		if (typeof this.contextualCondition === 'function') {
    		    this.query = { fn : this.contextualCondition, scope : this }
    		} else if (typeof this.contextualCondition === 'object') {
    		    if (this.contextualCondition.fn) {
    		        this.ensureValue(this.contextualCondition, 'scope', this);
    		        this.query = this.contextualCondition;
    		    }
    		}
            
            //set up structure:
            this.structure = [
                { 
                    defaultCell: this.columnDefaults,
                    cells: this.columns
                }
            ];    		
            function AddToListUnique(item, list) {
                for(var i = 0; i < list.length; i++) {
                    if (item === list[i]) {
                        return;
                    }
                }
                list.push(item);
            }           
             
            //create and startup the toolbar...
            if ((this.tabId) && (this.tabId !== '')) {
                this.addToolsToWorkspaceToolbar();
                this.currentEntityId = Sage.Utility.getCurrentEntityId();
                var self = this;
            } else {
                this.createOwnToolbar();
            }

            //set up the datastore if they didn't give us one...
            var cols = this.columns;
            if (!this.store) {
                var sel = this.storeOptions.select || [];
                for (var i = 0; i < sel.length; i++){
                    sel[i] = sel[i].replace(/\./g, '/');
                }
                var inc = this.storeOptions.include || [];
                var field;
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i].field) {
                        field = cols[i].field;
                        AddToListUnique(field.replace(/\./g, '/'), sel);
                    }
                    if (cols[i].field.indexOf('.') > 0) {
                        var parts = cols[i].field.split('.');
                        var combined = '';
                        for (var p = 0; p < parts.length - 1; p++) {
                            combined += parts[p];
                            AddToListUnique(combined, inc);
                            combined += '/';
                        }
                    }
                }
                this.store = this.getStore();
    		} else {
                //this means a datastore was given to us - most likely a proxydatastore.
                var sel = this.store.select = this.store.select || [];
                var inc = this.store.include = this.store.include || [];
                for (var i = 0; i < sel.length; i++){
                    sel[i] = sel[i].replace(/\./g, '/');
                }                
                for (var i = 0; i < cols.length; i++) {
                    if (cols[i].field) {
                        field = cols[i].field;
                        AddToListUnique(field.replace(/\./g, '/'), sel);
                    }
                    if (cols[i].field.indexOf('.') > 0) {
                        var parts = cols[i].field.split('.');
                        var combined = '';
                        for (var p = 0; p < parts.length - 1; p++) {
                            combined += parts[p];
                            AddToListUnique(combined, inc);
                            combined += '/';
                        }
                    }
                }          
            }
    		this.inherited(arguments);
        },
        postCreate: function(){
            //summary:
            //Add event connections
            //Enable the grid to commit its changes on blur
            dojo.connect(this, 'onBlur', this.applyEditOnBlur); 
            //Enable the grid to commit its changes on Enter
            dojo.connect(this, 'onKeyDown', this.customKeyDown);
            // Enable the grid to retract and expand 
            dojo.connect(this, 'onResizeColumn', this.elasticizeGrid);
            dojo.connect(this, '_onFetchComplete', this.elasticizeGrid);
		    this.inherited(arguments);
	    },
        elasticizeGrid: function(){
            //summary:
            // Enable the grid to retract and expand with it's container.
            // If total grid height exceeds the max height desired, 300px, restrict grid height and provide scrollbars.

            //Check that the grid has been added to it's own node container and that node Id has been provided to the grid object.
            // gridNodeId is added in quickform scenarios.  Otherwise, this grid is likely used in a customization or in the PreviewGrid
            if (!this.gridNodeId) { return; }

            //Assemble queries by element id and css class.
            var masterHead = ['#',this.id,' .dojoxGridMasterHeader'].join('');
            var gridContent = ['#',this.id,' .dojoxGridContent'].join('');
            var gridMasterMessages = ['#',this.id,' .dojoxGridMasterMessages'].join('');
            var dojoxGridView = ['#',this.id,' .dojoxGridView'].join('');
            var dojoxGridScrollbox = ['#',this.id,' .dojoxGridScrollbox'].join('');

            // Gather the heights and widths of the various elements for resizing
            var masterHeadHeight = dojo.query(masterHead)[0].clientHeight;
            var gridContentHeight = dojo.query(gridContent)[0].clientHeight;
            var dojoxGridViewWidth = dojo.query(dojoxGridView)[0].clientWidth;
            var gridMasterMessagesHeight = dojo.query(gridMasterMessages)[0].clientHeight;
            
            var heightTotal = masterHeadHeight + gridContentHeight + gridMasterMessagesHeight;
            //If heightTotal exceeds maxHeight desired, restrict grid height and provide scrollbars.
            heightTotal = (heightTotal > 300) ? 300 : heightTotal;
            
            //Set final heights and widths based on calculated totals of various elements
            dojo.style(dojo.query(dojoxGridView)[0], 'height', [heightTotal,"px"].join(''));
            dojo.style(dojo.query(dojoxGridScrollbox)[0], 'height', '100%');
            dojo.style(dojo.query(dojoxGridView)[0], 'width', '100%');
            dojo.style(dojo.query(dojoxGridScrollbox)[0], 'width', '100%');
            dojo.style(this.domNode, 'height', [heightTotal+25,"px"].join(''));
            dojo.style(this.gridNodeId, 'height', [heightTotal+25,"px"].join(''));
            
        },
        listenForPageSave: function() {
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.addListener(ClientBindingManagerService.ON_SAVE, this.saveChanges, this);
            } 
        },
        removePageSaveListener: function() {
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.removeListener(ClientBindingManagerService.ON_SAVE, this.saveChanges)
            } 
        },
        setEditable: function() {
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
        adaptHeight: function(){
            //summary: Override of grid._Grid.adaptHeight.  To enable elasticity of grid, set the window height to
            // default value after the fact.  This allows the grid view to remain small until the data is returned.
            this.inherited(arguments);
            // Default grid height, 300. Could easily be replaced with a configurable value.
            this.scroller.windowHeight = 300; 
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
            if  (this.store.dirtyDataCache.isDirty) {
                var s = Sage.Services.getService("ClientBindingManagerService");
                r = confirm(s._PageExitWarningMessage);
            }
            if (this.columns[e.cell.index].sortable === false || !r || this.mode === 'insert') {
                dojo.stopEvent(e);
            }
            else {
                this.inherited(arguments);
            }
        },
        ensureValue: function(obj, key, defaultValue) {
            obj[key] = obj[key] || defaultValue;
        },
        amIInATab: function() {
            if (this.context && this.context.workspace) {
                return (this.context.workspace.indexOf('TabWorkspace') > -1);
            }
            return false;
        },
        isMyTabVisible: function() {
            if (this.amIInATab()) {
                return TabControl.getState().isTabVisible(this.tabId);
            }
            return true;
        },
        startup: function() {
            if (this._started) {
                return;
            }

            if (!this.isMyTabVisible()) {
                if (this.hasTabListeners) { 
                    return;
                }
                if (typeof TabControl !== 'undefined') {
                    this.moreTabListener = TabControl.addListener('moretabchange', this.startup, this);
                    this.mainTabListener = TabControl.addListener('maintabchange', this.startup, this);
                    this.hasTabListeners = true;
                    return;
                }
            } else {
                if (this.hasTabListeners) {
                    TabControl.removeListener('moretabchange', this.startup, this);
                    TabControl.removeListener('maintabchange', this.startup, this);
                    this.hasTabListeners = false;
                }
            }

            if (this.gridNodeId) {
                dojo.place(this.domNode, this.gridNodeId, 'only');
            }
            this.inherited(arguments);
            if (this.mode !== 'insert') {
                this.listenForPageSave();            
            }
        },
        destroy: function() {
            if (this.store && this.store.destroy) {
                this.store.destroy();
            }
            this.removePageSaveListener();
            this.inherited(arguments);
        },
        getStore: function() {
            if (this.store) {
                return this.store;
            }

            if (this.mode !== 'insert') {
                var store = new Sage.Data.WritableSDataStore(this.storeOptions);
            }
            else {
                var store = new Sage.Data.WritableStore(this.storeOptions);
            }      
            
            if (this.onDataChange) {
                dojo.connect(store, 'onSet', this.onDataChange);
            }
            if (store.onDataChange) {
                dojo.connect(store, 'setValue', store.onDataChange);
                dojo.connect(store, 'saveNewEntity', store.onDataChange);
                dojo.connect(store, 'deleteItem', store.onDataChange);
                dojo.connect(store, 'createItem', store.onDataChange);
            }
            dojo.connect(store, 'onSet', this, function(entity, attribute, oldValue, newValue) {
                if (oldValue !== newValue && this.mode !== 'insert') {
                    this.markDirty();
                }
            });
           
            return store;
        },
        customKeyDown: function (e) {
            this.applyEditOnEnter(e);
            this.navigateOnKeyDown(e);
        },
        navigateOnKeyDown: function(e) {
            if (e.keyCode === 38 || e.keyCode === 40) {
                var newRow = this.selection.selectedIndex;
                newRow = (e.keyCode === 38) ? newRow - 1 : newRow +1;  // Arrow button conditions
                newRow = (newRow < 0 ) ? 0 : newRow;
                newRow = (newRow > this.rowCount - 1 ) ? this.rowCount - 1 : newRow;
                this.focus.setFocusIndex(newRow, 0);
                this.selection.deselectAll();
                this.selection.select(newRow);
                this.focus.scrollIntoView();
                dojo.stopEvent(e);
            }
        },
        applyEditOnEnter: function(e) {        
            if (e.charOrCode == 13 || e.keyCode == 13) { 
                this.doApplyEdit();
                this.edit.apply();
                dojo.stopEvent(e);
            }
        },
        applyEditOnBlur: function() {
            this.edit.apply();
        },
        createOwnToolbar: function() {
            alert('not implemented: createOwnToolbar()');
            return;
            //TODO: The following is just example code - needs fixed and completed...
            //where do we render it to?:  this.id + '_tb' is not going to work...
            this.toolbar = new dijit.Toolbar({ 'style':'text-align:right' }, this.id + '_tb');
            var saveBtn = new dijit.form.Button({
                id: 'OppProd_save',
                label: this.saveText,
                title: this.saveText,
                showLabel: false,
                iconClass: 'dijitEditorIcon dijitEditorIconSave',
                onClick: this.saveChanges
            });
            this.toolbar.addChild(saveBtn);       
            
            this.toolbar.startup();        
        },
        addToolsToWorkspaceToolbar: function() {
            //summary:
            //Add items to the rightToolsContainer

            if (this.readOnly) {
                return;
            }            
            //Add dirty data message.
            //TODO: Rename TabId to containerNodeId.  Requires template change.
            this.dirtyDataMsgID = this.tabId + '_dirtydatamsg';
            var msgBox = RML.span({
                'class' : 'grid-unsaveddata-msg',
                'id' : this.dirtyDataMsgID,
                'style' : 'display:none;',
                //TODO: Localize
                'content' : (this.editable) ? this.unsavedDataText : ''
            });            
            //Place the tools and 'unsaved data' message into the correct workspace.
            switch(this.context.workspace)
            {
                case 'Sage.Platform.WebPortal.Workspaces.Tab.TabWorkspace':
                    //Don't add the dirty data message if we are in insert mode.  All data is dirty in insert mode.
                    if (this.mode !== 'insert') { dojo.place(msgBox, dojo.query('#' + 'element_' + this.tabId +' td.tws-tab-view-title')[0]); }
                    var rightToolsContainer = dojo.query('#' + 'element_' + this.tabId +' td.tws-tab-view-tools-right');
                break;
                case 'Sage.Platform.WebPortal.Workspaces.MainContentWorkspace':
                    //Don't add the dirty data message if we are in insert mode.  All data is dirty in insert mode.
                    if (this.mode !== 'insert') { dojo.place(msgBox, dojo.query('#' + this.tabId +' span.mainContentHeaderTitle')[0]); }
                    var rightToolsContainer = dojo.query('#' + this.tabId +' td.mainContentHeaderToolsRight');
                break;
                default:             
            }

            var toolFmt = '<img id="{0}" src="{1}" alt="{2}" class="ui-icon" />';
            var self = this;
            var roleService = Sage.Services.getService("RoleSecurityService");
            //Some buttons may be hidden in different modes and/or security levels.  
            //We'll keep a position variable to make sure the group stays together.            
            var position = 0;
            for (var i = 0; i < this.tools.length; i++) {
                var tool = this.tools[i];
                //TODO: REFACTOR to include a displayInInsert bool property on config object
                if ((tool.id === 'Save' || tool.id === 'Cancel') && this.mode === 'insert') {
                    continue;
                }
                //check user's access to this functionality...
                if (tool.appliedSecurity && tool.appliedSecurity !== '') {
                    if ((roleService) && (!roleService.hasAccess(tool.appliedSecurity))) {
                        continue;
                    }
                }
                if (typeof tool === 'string') {
                    switch(tool) {
                        case 'add' :
                            var addid = this.id + '_addBtn';
                            var addBtn = RML.img({
                                'id' : addid,
                                'alt' : this.addText,
                                'title' : this.addText,
                                'src' : 'images/icons/Plus_16x16.gif',
                                'class' : 'tws-header-icon'
                            });
                            dojo.place(addBtn, rightToolsContainer[0], position);
                            dojo.connect(dojo.byId(addid), 'onclick', this, this.addNew);
                            break;
                        case 'delete' :
                            var delid = this.id + '_delBtn';
                            var delBtn = RML.img({
                                'id' : delid,
                                'alt' : this.deleteText,
                                'title' : this.deleteText,
                                'src' : 'images/icons/Delete_16x16.gif',
                                'class' : 'tws-header-icon'
                            });
                            dojo.place(delBtn, rightToolsContainer[0], position);
                            dojo.connect(dojo.byId(delid), 'onclick', this, this.deleteSelected);
                            break;
                        case 'save' :
                            var saveid = this.id + '_saveBtn';
                            var saveBtn = RML.img({
                                'id' : saveid,
                                'alt' : this.saveText,
                                'title' : this.saveText,
                                'src' : 'images/icons/Save_16x16.gif',
                                'class' : 'tws-header-icon'
                            });
                            dojo.place(saveBtn, rightToolsContainer[0], position);
                            dojo.connect(dojo.byId(saveid), 'onclick', this, this.saveChanges);
                            break;
                        case 'cancel' :
                            var cclid = this.id + '_cancelBtn';
                            var cancelBtn = RML.img({
                                'id' : cclid,
                                'alt' : this.cancelText,
                                'title' : this.cancelText,
                                'src' : 'images/icons/Reset_16x16.gif',
                                'class' : 'tws-header-icon'
                            });                            
                            dojo.place(cancelBtn, rightToolsContainer[0], position);
                            dojo.connect(dojo.byId(cclid), 'onclick', this, this.cancelChanges);
                            break;                            
                            
                    }
                } else {
                    if ((tool.type) && (tool.type === 'Sage.UI.SDataLookup')) {
                        var lup = new Sage.UI.SDataLookup(tool.controlConfig || tool);
                        dojo.place(lup.domNode, rightToolsContainer[0], position);
                    } else {
                        var newTool = RML.img({
                            'id': tool.id,
                            'alt': tool.alternateText || '',
                            'title': tool.alternateText || '',
                            'src': tool.icon,
                            'class': tool['class'] || 'tws-header-icon'
                        });
                        dojo.place(newTool, rightToolsContainer[0], position);
                        dojo.connect(dojo.byId(tool.id), 'onclick', tool.scope || this, tool.handler);
                    }
                }
                //Increment the position for consistent grouping of these items.
                position++;
            }
        },
        addNew : function(args) {
            if (this.store) {
                this.store.newItem(args);
            }
        },
        createItems: function (items, callback) {
            if (dojo.isArray(items)) {
                var store = this.store;               
                var iCreateCount = items.length;
                if (typeof console !== 'undefined') {
                    console.log('createItems() items.length = %o', iCreateCount);
                }       
                //TODO: Replace callback with webworker.
                var fnResponse = function (arg1, arg2) {
                    // "this.", within the scope of fnResponse(), refers to the scope object below.
                    this.currentCount = this.currentCount + 1;
                    if (typeof console !== 'undefined') {                    
                        if (arg1 && typeof arg1 !== 'undefined' && arg1.getResponseHeader) {                            
                            console.log('createItems() response: (status = %o; statusText = %o): currentCount = %o; totalCount = %o',
                                arg1.status || 0, arg1.statusText || "", this.currentCount, this.totalCount);                  
                            console.log('createItems() response ETag: %o', arg1.getResponseHeader('ETag'));
                        }
                        else {
                            if (arg1 && typeof arg1 !== 'undefined' && typeof arg1.$httpStatus === 'string') {
                                console.log('createItems() response ($httpStatus: %o; $key: %o; $descriptor: %o $etag: %o): currentCount = %o; totalCount = %o',
                                    arg1.$httpStatus, arg1.$key || "", arg1.$descriptor, arg1.$etag, this.currentCount, this.totalCount);
                            }
                            else {
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
                }
                var scope = { grid: this, totalCount: iCreateCount, currentCount: 0, onResponse: fnResponse, onComplete: callback || null };
                for (var i = 0; i < items.length; i++) {
                    store.createItem(items[i], scope);
                }
            }
            else {
                //TODO: Localize and use message service.
                alert('The items parameter in Sage.UI.SLXTabGrid.createItems() should be an array.');
            }
        },
        deleteSelected: function (callback) {
            var selectedItems = this.selection.getSelected();
            if (selectedItems.length < 1) {
                alert(this.noSelectionsText);
                return;
            }
            if (confirm(String.format(this.confirmDeleteFmtTxt, selectedItems.length))) {
                var store = this.store;               
                var iDeleteCount = 0;
                for (var i = 0; i < selectedItems.length; i++) {
                    if (this.store.isItem(selectedItems[i])) {
                        iDeleteCount++;
                    }
                }                
                //TODO: Replace callback with webworker.
                var fnResponse = function (arg1, arg2) {
                    // "this.", within the scope of fnResponse(), refers to the scope object below.
                    this.currentCount = this.currentCount + 1;
                    if (typeof console !== 'undefined') {                    
                        if (arg1 && typeof arg1 !== 'undefined' && arg1.getResponseHeader) {                            
                            console.log('deleteSelected() response: (status = %o; statusText = %o): currentCount = %o; totalCount = %o',
                                arg1.status || 0, arg1.statusText || "", this.currentCount, this.totalCount);                  
                            console.log('deleteSelected() response ETag: %o', arg1.getResponseHeader('ETag'));
                        }
                        else {
                            console.log('deleteSelected() response (OK): currentCount = %o; totalCount = %o', this.currentCount, this.totalCount);
                        }
                    }
                    if (this.currentCount === this.totalCount) {
                        this.grid.refresh();
                        if (typeof this.onComplete === 'function') {
                            this.onComplete.call(this.grid);
                        }                  
                    }
                }
                var scope = { grid: this, totalCount: iDeleteCount, currentCount: 0, onResponse: fnResponse, onComplete: callback || null };
                for (var i = 0; i < selectedItems.length; i++) {
                    if (store.isItem(selectedItems[i])) {
                        store.deleteItem(selectedItems[i], scope);
                    }
                }
            }
        },
        cancelChanges : function() {
            if (this.store && this.store.revert) {
                this.store.revert();
                this.markClean();
                this.refresh();
            }
        },
        saveChanges: function (callback) {
            var iSaveCount = 0;
            for (var key in this.store.dirtyDataCache) {
                if (key !== 'isDirty') {
                    entity = this.store.dirtyDataCache[key];
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
                        console.log('saveChanges() response ETag: %o',arg1.getResponseHeader('ETag'));
                    }
                    else {
                        if (arg1 && typeof arg1 !== 'undefined' && typeof arg1.$httpStatus === 'string') {
                            console.log('saveChanges() response ($httpStatus: %o; $key: %o; $descriptor: %o $etag: %o; $updated: %o): currentCount = %o; totalCount = %o',
                                arg1.$httpStatus, arg1.$key || "", arg1.$descriptor, arg1.$etag, arg1.$updated, this.currentCount, this.totalCount);
                        }
                        else {
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
            }
            var scope = { grid: this, totalCount: iSaveCount, currentCount: 0, onResponse: fnResponse, onComplete: callback || null };
            this.store.save(scope);
        },
        markClean: function() {
            dojo.style(dojo.byId(this.dirtyDataMsgID), 'display', 'none');
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.clearDirtyAjaxItem(this.id);
            }
        },
        markDirty: function() {
            dojo.style(dojo.byId(this.dirtyDataMsgID), 'display', 'inline');
            var bindingMgr = Sage.Services.getService('ClientBindingManagerService');
            if (bindingMgr) {
                bindingMgr.addDirtyAjaxItem(this.id);
            }
        },
        refresh: function() {
            this._refresh();
        }
        
    });

})();
