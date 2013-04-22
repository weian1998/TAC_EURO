/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojo/i18n',
       'Sage/UI/GridContainer',
       'Sage/UI/Dialogs',
       'Sage/UI/Dashboard/DashboardWidgetCell',
       'Sage/Utility',
       'dijit/form/ValidationTextBox',
       'Sage/UI/Controls/_DialogHelpIconMixin',
       'dojo/dom-construct',
       'Sage/Array',
       'dojo/i18n!./nls/DashboardTabController',
       'dojo/i18n!./nls/WidgetDefinition',
       'dojo/_base/declare'
],
function (
    i18n, 
    gridContainer,
    dialogs,
    dashboardWidgetCell,
    Utility,
    validationTextBox,
    _DialogHelpIconMixin,
    domConstruct,
    SageArray,
    resourceDashboardTabController,
    resourceWidgetDefinition,
    declare
    ) {
    //dojo.requireLocalization("dijit", "common");

    // the number of columns could change during runtime now, keep track of them
    // with a class each to make them easier to persist. Each col obj should
    // be named column number, have a width (maybe deprecated), and an array of
    // Widget objects
    var dashboardColumn = declare('Sage.UI.Persistance.DashboardColumn', null, {
        constructor: function (config) {
            dojo.safeMixin(this, config);
        }
    });

    /**
    * Dashboard page class will handle individual tab page duties such as layout,
    * generating the widget 'cells', adding and removing page content, drag and
    * dropping widgets etc, page persistance, etc...
    */
    var widget = declare('Sage.UI.Dashboard.DashboardPage', gridContainer, {
        _nwTableOuter: new Simplate(['<div id="nwTable" class="new-widget-table"><div style="height:400px; overflow-y:auto;"><table width="100%">{%= $.content %}</table></div>',
            '<div align="right"><button data-dojo-type="dijit.form.Button"',
            ' type="button" id="btnAddContentClose" class="ok-button" title="{%= $.buttonCancel %}" align="right" style="margin-top:10px;">{%= $.buttonCancel %}</button>',
            '</div></div>']),
        _nwTableInner: new Simplate([
            '<tr><td><b>{%= $.key %}</b><br />{%= $.value %}</td></tr>',
            '<tr><td><button data-dojo-type="dijit.form.Button"',
            'type="button" id="{%= $.btnId %}" class="btn-add-new">{%= $.addText %}</button></td></tr>',
            '<tr><td><hr /></td></tr>'
        ]),
        style: 'z-index:500;',
        _eoTable: new Simplate([
            '<div id="eoTable" class="edit-options-table"><table width="100%">',
            '<tr><td>{%= $.titleText %}</td><td><div data-dojo-type="dijit.form.ValidationTextBox" id="txtEO"',
            ' regExp="[^-<>:;@#\$!%\^&\*\(\)\+=\`\[{},/?\.~]*" value="{%= $.title %}" invalidMessage="{%= $.invalidMessage %}"></div></td></tr>',
            '<tr><td colspan=2>{%= $.chooseTemplateText %}</td></tr>',
            '<tr><td><input type="radio" id="rdoEO0" data-dojo-type="dijit.form.RadioButton"',
            ' value="one_column" name="radioEO" /></td><td><label for="rdoEO0">{%= $.oneColumnText %}',
            '</label></td></tr>',
            '<tr><td><input type="radio" id="rdoEO1" data-dojo-type="dijit.form.RadioButton"',
            ' value="two_even" name="radioEO" /></td><td><label for="rdoEO1">{%= $.twoColumnText %}',
            '</label></td></tr>',
            '<tr><td><input type="radio" id="rdoEO2" data-dojo-type="dijit.form.RadioButton"',
            ' value="fat_left" name="radioEO" /></td><td><label for="rdoEO2">{%= $.fatLeftText %}',
            '</label></td></tr>',
            '<tr><td><input type="radio" id="rdoEO3" data-dojo-type="dijit.form.RadioButton"',
            ' value="fat_right" name="radioEO" /></td><td><label for="rdoEO3">{%= $.fatRightText %}',
            '</label></td></tr>',
            '<tr><td><input type="checkbox" id="chkMD" data-dojo-type="dijit.form.CheckBox"',
            ' value="make_def"/></td><td><label for="chkMD">{%= $.makeDefaultText %}</label></td></tr>',
            '<tr><td colspan=2 align="right"><button data-dojo-type="dijit.form.Button" type="button"',
            ' id="btnEOK" class="ok-button" title="{%= $.buttonOk %}" >{%= $.buttonOk %}</button>',
            '<button data-dojo-type="dijit.form.Button" type="button"',
            ' id="btnEOCancel" class="cancel-button" title="{%= $.buttonCancel %}">{%= $.buttonCancel %}</button>',
            '</td></tr></table></div>'
        ]),
        _raisePermissionInvalidMessage: function() {
            var currentDashboardTab = this;
            var fn = function(ans) {
                if(ans) {
                    var db = dijit.byId('Dashboard');
                    db._copyPage(currentDashboardTab);
                }
            }
            
            var opts = {
                    title: this.resources.errorText,
                    query: [this.resources.permissionErrorText, this.resources.permissionErrorPerformCopyText],
                    yesText: this.resources.yesText,
                    noText: this.resources.noText,
                    callbackFn: fn,
                    style: {width: '350px'},
                    align: 'right'
                }

            Sage.UI.Dialogs.raiseQueryDialogExt(opts);
        },
        postCreate: function () {
            this.inherited(arguments);
            this.subscribe('/ui/dashboard/pageSave', function (page) {
                if (typeof page === 'string') { page = parseInt(page, 10); }
                if (page === this._page) {
                    if(this.permission) {
                        this._save();
                    }
                    else {
                        this._raisePermissionInvalidMessage();
                    }
                }
            });
            this.subscribe('/dojox/mdnd/drop', '_dropped');
        },
        resources: {},
        postMixInProperties: function () {
            dojo.mixin(this.resources, i18n.getLocalization("Sage.UI.Dashboard", "DashboardTabController"));
            //dojo.mixin(this.resources, i18n.getLocalization("Sage.UI.Dashboard", "WidgetDefinition"));
            dojo.mixin(this.resources, i18n.getLocalization("dijit", "common"));
            this._releaseManager.page = this;
            this.inherited(arguments);
        },
        _createChild: function (widget, col, idx, page) {
            var widgetName = widget.options.title || widget['@name'],
                nameResourceString = widgetName;
            
            while(nameResourceString.indexOf(' ') >= 0) { nameResourceString = nameResourceString.replace(' ', '_'); }
            while(nameResourceString.indexOf('.') >= 0) { nameResourceString = nameResourceString.replace('.', '_'); }
            while(nameResourceString.indexOf('\'') >= 0) { nameResourceString = nameResourceString.replace('\'', '_'); }
            
            if(resourceWidgetDefinition[nameResourceString]) {
                widgetName = resourceWidgetDefinition[nameResourceString];
            }
            
            this._childWidgets.push(
            new dashboardWidgetCell({
                dndType: 'Portlet',
                title: widgetName,
                resizeChildren: false,
                column: col,
                index: idx,
                _page: page,
                _parentId: this.id,
                preventRender: this.toBeHidden,
                widgetOptions: widget.options
            }));
            // always return the last one added
            return this._childWidgets[this._childWidgets.length - 1];
        },
        _addNewWidget: function (name) {
            if(this.permission) {
                // who is the last widget?
                var last = this._childWidgets[this._childWidgets.length - 1];
                var col = last && last.column ? last.column : 0;
                var idx = last && last.index ? last.index + 1 : 0;
                var newWidget = new dashboardWidgetCell({
                    dndType: 'Portlet',
                    isNew: true,
                    title: this.resources[name] || name,
                    resizeChildren: false,
                    column: col,
                    index: idx,
                    _page: this._page,
                    _parentId: this.id,
                    widgetOptions: {
                        name: name,
                        title: name
                    }
                });
                this._childWidgets.push(newWidget);
                this.addChild(this._childWidgets[this._childWidgets.length - 1], col, idx);
                this._save();
            }
            else {
                this._raisePermissionInvalidMessage();
            }
        },
        _editOptionsMenu: function () {
            var uo = Sage.UI.DataStore.Dashboard.userOptions;
            var oneColumn = false, evenSplit = false, fatLeft = false, fatRight = false;
            switch (this.colWidths.toString()) {
                case '50,50':
                    evenSplit = true;
                    break;
                case '67,33':
                    fatLeft = true;
                    break;
                case '33,67':
                    fatRight = true;
                    break;
                case '100':
                default:
                    oneColumn = true;
            }

            var d = new dijit.Dialog({
                title: this.resources.editOptionsText,
                style: "width:350px"
            });

            // write the html
            d.set('content', this._eoTable.apply({
                title: this.get('title'),
                buttonOk: this.resources.buttonOk,
                buttonCancel: this.resources.buttonCancel,
                addText: this.resources.addText,
                titleText: this.resources.titleText,
                chooseTemplateText: this.resources.chooseTemplateText,
                oneColumnText: this.resources.oneColumnText,
                twoColumnText: this.resources.twoColumnText,
                fatLeftText: this.resources.fatLeftText,
                fatRightText: this.resources.fatRightText,
                makeDefaultText: this.resources.makeDefaultText,
                invalidMessage: this.resources.invalidMessage
            }));
            // Setting this when writing the html fails in IE,
            //  which will always render the radio buttons as checked
            dijit.byId('rdoEO0').set('checked', oneColumn);
            dijit.byId('rdoEO1').set('checked', evenSplit);
            dijit.byId('rdoEO2').set('checked', fatLeft);
            dijit.byId('rdoEO3').set('checked', fatRight);
            
            if(uo.defaultTab == this.title) {
                dijit.byId('chkMD').set('checked', true);
            }
            
            d.show();
            var fnDestroy = function () {
                if (this.isNew) {
                    // This tab doesn't yet exist, so just hide it. On refresh, it won't exist
                    var parent = dijit.byId('Dashboard');
                    parent.closeChild(this);
                    parent.selectFirstVisible();
                }

                dojo.disconnect(_closed);
                dojo.disconnect(ok);
                dojo.disconnect(cancel);
                d.destroyRecursive();
            };
            var _closed = dojo.connect(d, "hide", this, fnDestroy);

            // cancel
            var cancel = dojo.connect(dijit.byId('btnEOCancel'), 'onClick', this,
                function () {
                    d.hide();
                });
            var ok = dojo.connect(dijit.byId('btnEOK'), 'onClick', this,
                function () {
                    if(this.permission) {
                        var txtEO = dijit.byId('txtEO');
                        if (!txtEO.isValid() || !this.getParent()._isTitleUnique(txtEO.value, this.id)) {
                            return false;
                        }
                        
                        // build up a config to pass to setOptions
                        var config = {};
                        config.ttl = txtEO.value;
                        config.one_column = dijit.byId('rdoEO0').get('value');
                        config.even_split = dijit.byId('rdoEO1').get('value');
                        config.fat_left = dijit.byId('rdoEO2').get('value');
                        config.fat_right = dijit.byId('rdoEO3').get('value');
                        config.make_def = dijit.byId('chkMD').get('value');
                        
                        // Only set the name of the tab the first time
                        if (this.isNew) {
                            this.isNew = false;
                        }
                        else {
                            config.oldName = this.name;
                        }
                        
                        this._setOptions(config);
                        this._save();
                        this._redrawWidgets();
                        this.getParent().addRemovePageContextMenu();
                        d.hide();
                    }
                    else {
                        d.hide();
                        this._raisePermissionInvalidMessage();
                    }
                });
        },
        _redrawWidgets: function () {
            if (this._childWidgets) {
                dojo.forEach(this._childWidgets, function (widget) {
                    widget.refresh(true);
                });
            }
        },
        // A class to support the Release management of plugins.
        _releaseManager: {
            // TODO: 
            // constructor: 
            // Initialization function fired on click action. Handles the launch of share dialog with release list grid.
            share: function () {
                this.lookupOptions.callerId = this.page.id;
                if (!this.dialog) {
                    this.dialog = new dijit.Dialog({
                        id: this.page.id + '-shareDialog',
                        style: "width: 405px",
                        title: this.page.resources.shareTabText
                    });
                    var _closed = dojo.connect(this.dialog, "hide", this, this.fnHide);
                    dojo.mixin(this.dialog, new _DialogHelpIconMixin());
                    this.dialog.createHelpIconByTopic("Working_with_the_Dashboard");
                }

                if (this.grid) { this.grid.destroyRecursive(); }
                this.grid = new dojox.grid.DataGrid({
                    id: this.page.id + '-shareDialog-grid',
                    structure: [
                            {
                                field: '$key',
                                editable: false,
                                hidden: true,
                                id: 'id',
                                formatter: function (value, rowIdx, cel) {
                                    var id = [cel.grid.id, '-row', rowIdx].join('');
                                    var anchor = ['<div id=', id, ' >', id, '</ div>'].join('');
                                    return anchor;
                                }
                            },
                            { field: 'Text', name: this.page.resources.releasedToText, width: '185px' }, //, editable: false 
                            {field: 'Type', name: this.page.resources.typeText, width: '175px'} //, editable: false 
                        ],
                    height: '200px'
                }, document.createElement('div'));

                // go get the json for release candidates
                var def = dojo.xhrGet({
                    url: 'slxdata.ashx/slx/crm/-/dashboard/release', //ReleaseManager config: { url: '' }
                    preventCache: true,
                    handleAs: 'json',
                    content: {
                        name: this.page.name,
                        family: this.page.family
                    },
                    load: dojo.hitch(this, this.releaseFetchSuccess),
                    error: function (data) {
                        console.log(this.page.resources.releaseFetchErrorText);
                    }
                });

            },
            releaseFetchSuccess: function (data, xhr) {
                //Assemble with data and show.
                var storeData = { identifier: 'Id', items: data };
                this.gridStore = new dojo.data.ItemFileWriteStore({
                    data: storeData
                });
                this.dialog.set('content', this.dialogContent.apply({
                    id: this.dialog.id,
                    pageId: this.page.id,
                    closeText: this.page.resources.closeText,
                    everyoneText: this.page.resources.everyoneText,
                    headerText: this.page.resources.shareTabText
                }));
                this.initTools();

                this.dialog.show();
                dojo.place(this.grid.domNode, this.dialog.id + '-grid', 'replace');
                this.grid.setStore(this.gridStore);
                dojo.style(this.dialog.id, 'top', '130px');
            },
            fnHide: function () {
                // Essentially perform the save only after the dialog is hidden
                this.release();
            },
            initTools: function () {
                var delid = this.dialog.id + '_delBtn';
                var delBtn = domConstruct.create('img', {
                    'id': delid,
                    'alt': this.page.resources.deleteText,
                    'title': this.page.resources.deleteText,
                    'src': 'images/icons/Delete_16x16.png',
                    'class': 'tws-header-icon'
                });
                dojo.place(delBtn, dojo.query(['#', this.dialog.id, '-toolbar'].join(''))[0], 'last');
                dojo.connect(dojo.byId(delid), 'onclick', this, this.deleteSelected);

                var delid = this.dialog.id + '_lookupBtn';
                var delBtn = domConstruct.create('img', {
                    'id': delid,
                    'alt': this.page.resources.addText,
                    'title': this.page.resources.addText,
                    'src': 'images/icons/Plus_16x16.gif',
                    'class': 'tws-header-icon'
                });
                dojo.place(delBtn, dojo.query(['#', this.dialog.id, '-toolbar'].join(''))[0], 'last');
                dojo.connect(dojo.byId(delid), 'onclick', this, this.startLookup);
            },
            //addSelected: see this.lookupOptions.doSelected
            deleteSelected: function () {
                var selectedItems = this.grid.selection.getSelected(); // 'this' doesn't work within the forEach
                if (selectedItems.length) {
                    var gStore = this.gridStore;
                    dojo.forEach(selectedItems, function (item) {
                        if (item !== null) {
                            // Delete the item from the data store:
                            gStore.deleteItem(item);
                        }
                    }); // end forEach
                    this.gridStore.save();
                }
            },
            // The parent page object
            page: null,
            // Release list
            grid: null,
            //        gridOptions: null,
            gridStore: null,
            //Share dialog
            dialog: null,
            // The template for the share dialog
            dialogContent: new Simplate(['<div width="560px">',
                '<div style="width:100%;" align="right" id="{%= $.id %}-toolbar"></div>',
                '<div id="{%= $.id %}-grid" ></div>',
            //TODO: Add button bar feature to a Sage.UI.Dialogs option.
                '<div style="width:100%;" align="right" ><button data-dojo-type="dijit.form.Button" type="button" style="margin-top:10px;" ',
                'data-dojo-props="onClick:function(){dijit.byId(\'{%= $.pageId %}\')._releaseManager.everyoneClick();}"',
                '>{%= $.everyoneText %}</button>', //{%= $.buttonClose %}
            //TODO: Add button bar feature to a Sage.UI.Dialogs option.
                '<button data-dojo-type="dijit.form.Button" type="button" style="margin-left:10px; margin-top:10px;" ',
                'data-dojo-props="onClick:function(){dijit.byId(\'{%= $.pageId %}\')._releaseManager.dialog.hide();}"',
                '>{%= $.closeText %}</button></div>', //{%= $.buttonClose %}        
                '</div> ']),
            // Owner lookup control
            lookup: null,
            //
            everyoneClick: function () {
                //doSelected expects objects sent from sdata.  Format our default value as such.
                var item = [{ $key: "SYST00000001", OwnerDescription: this.page.resources.everyoneText}];
                this.lookupOptions.doSelected(item);
            },
            release: function () {
                var ids = "";
                var items = this.gridStore._arrayOfAllItems;
                //this.gridStore.
                for (var i = 0; i < items.length; i++) {
                    if (items[i]) {
                        ids += items[i].Id[0] + ",";
                    }
                }
                var vURL = "SLXGroupBuilder.aspx?method=GetGroupIdFromNameFamilyAndType&name=" + this.page.name + "&family=System&type=36";
                dojo.xhrGet({
                    url: vURL,
                    error: dojo.hitch(this, function (pluginData) { console.log(['Page ', this.page.id, ' not released.'].join('')); }),
                    load: dojo.hitch(this, function (pluginData) {
                        vURL = "SLXGroupBuilder.aspx?method=ReleaseGroup&gid=" + pluginData + "&toids=" + ids;
                        dojo.xhrGet({
                            url: vURL,
                            error: dojo.hitch(this, function (releaseData) { console.log(['Page [', releaseData, '] not released.'].join('')); }),
                            load: dojo.hitch(this, function (releaseData) { })
                        });
                    })
                });
            },
            startLookup: function () {
                if (!this.lookup) {
                    this.lookup = new Sage.UI.SDataLookup(this.lookupOptions);
                    // lookupOptions constructor doesn't have access to the resources
                    this.lookup.dialogTitle = this.page.resources.addLookup;
                    this.lookup.dialogButtonText = this.page.resources.okButton;
                    this.lookup.structure[0].cells[0].name = this.page.resources.typeText;
                    this.lookup.structure[0].cells[1].name = this.page.resources.descriptionText;
                }
                this.lookup.showLookup();
            },
            // Configuration object for the Owner lookup control 
            lookupOptions: {
                callerId: null,
                displayMode: 5,
                structure: [{
                    cells: [
                        { name: "", field: "Type", sortable: true, width: "150px", editable: false, styles: null,
                            propertyType: "Sage.Entity.Interfaces.OwnerType", excludeFromFilters: false, useAsResult: false
                        },
                        { "name": "", "field": "OwnerDescription", "sortable": true, "width": "500px", "editable": false, "styles": null, "propertyType": "System.String", "excludeFromFilters": false, "useAsResult": false}],
                    "defaultCell": { "name": null, "field": null, "sortable": false, "width": "50px", "editable": false, "styles": "text-align: left;", "propertyType": null, "excludeFromFilters": false, "useAsResult": false }
                }],
                gridOptions: {},
                storeOptions: { "resourceKind": "owners" },
                dialogTitle: '',
                dialogButtonText: '',
                id: "MainContent_AccountDetails_Owner_Grid",
                modality: 'modal',
                doSelected: function (items) {
                    //When refactored to stand alone, caller will BE _releaseManager.
                    var manager = dijit.byId(this.callerId)._releaseManager;
                    for (var i = 0, len = items.length; i < len; i++) {
                        if (!manager.gridStore._itemsByIdentity[items[i].$key]) {
                            manager.gridStore.newItem({ Id: items[i].$key, Text: items[i].OwnerDescription, Type: items[i].Type });
                        }
                    }
                    manager.gridStore.save();
                    //Don't save until the window is closed
                    //manager.release();
                    manager.grid.startup();
                    if (manager.lookup && manager.lookup.lookupDialog) {
                        manager.lookup.lookupDialog.hide();
                    }
                }
            }
        },
        // If column is set to 1, make sure to move all the content from the second column first
        _joinColumnWidgets: function () {
            if (this.nbZones === 2) {
                for (var i = this._childWidgets.length - 1; i >= 0; i--) {
                    if (this._childWidgets[i].column === 1) {
                        this.removeChild(this._childWidgets[i]);
                        this._childWidgets[i].column = 0;
                        this._childWidgets[i].index += this._childWidgets.length;
                        this.addChild(this._childWidgets[i], 0, this._childWidgets[i].index);
                    }
                }
                this._deleteColumn(1);
            }
        },
        _setOptions: function (config) {
            var uo = Sage.UI.DataStore.Dashboard.userOptions;

            if (config.ttl) {
                this.title = config.ttl;
                this.set('name', config.ttl);
                
                var dashboardTab = dijit.byId('Dashboard_tablist_' + this.id);
                if(dashboardTab) {
                    dashboardTab._setLabelAttr(config.ttl);
                }
            }
            if (config.one_column) {
                this._joinColumnWidgets();
                this.setColumns(1);
                this.set('colWidths', '100');
                dojo.publish('ui/dashboard/columnResize');
            }

            if (config.even_split) {
                this.setColumns(2);
                this.set('colWidths', '50,50');
                dojo.publish('/ui/dashboard/columnResize');
            }

            if (config.fat_left) {
                this.setColumns(2);
                this.set('colWidths', '67,33');
                dojo.publish('/ui/dashboard/columnResize');
            }

            if (config.fat_right) {
                this.setColumns(2);
                this.set('colWidths', '33,67');
                dojo.publish('/ui/dashboard/columnResize');
            }

            if (config.make_def) {
                // get the parent db
                var db = dijit.byId(this._parentId);
                // set the def as this pages title
                if (this.title) {
                    uo.defaultTab = this.title;
                    // update the opts
                    db._updateUserOptions();
                }
            }
            
            if(config.oldName) {
                this.oldName = config.oldName;
            }
            else {
                this.oldName = '';
            }
        },
        _newWidgetMenu: function () {
            // the dialog
            var d = new dijit.Dialog({
                title: this.resources.addContentText,
                style: "width:365px;"
            });
            dojo.mixin(d, new _DialogHelpIconMixin());
            // build up the content
            var list = Sage.UI.DataStore.Dashboard.widgetsList;
            // table content
            var inner = [];
            this._nwListeners = [];
            for (var item in list) {
                if (list.hasOwnProperty(item) && item != 'Default') {
                    var btn_id = item.replace(' ', '_');
                    inner.push(this._nwTableInner.apply({
                        btnId: btn_id + '_label',
                        key: resourceWidgetDefinition[btn_id] || item,
                        value: resourceWidgetDefinition[btn_id + '_Description'] || list[item],
                        addText: this.resources.addText
                    }));
                }
            }
            var mkup = this._nwTableOuter.apply({
                content: inner.join(''),
                buttonCancel: this.resources.buttonCancel
            });

            d.createHelpIconByTopic('Introducing_Widgets');
            d.set('content', mkup);
            d.show();

            var fnDestroy = function () {
                dojo.forEach(this._nwListeners, dojo.disconnect);
                dojo.disconnect(_closed);
                dojo.disconnect(closeClick);

                setTimeout((function (d) {
                    return function () {
                        d.destroyDescendants();
                        d.destroy(false);
                    };
                })(d), 1);
            };

            var _closed = dojo.connect(d, "hide", this, fnDestroy);
            var closeClick = dojo.connect(dijit.byId('btnAddContentClose'), "onClick", this, function () {
                d.hide();
            });

            // get a ref to the Add buttons
            var adds = dijit.findWidgets(dojo.byId('nwTable'));
            for (var i = 0, len = adds.length; i < len; i++) {
                if (adds[i].id != 'btnAddContentClose') {
                    // pass a ref to the dialog so we can close it
                    //  (and the id, otherwise clicking on the button's outer edge
                    //   prevents the id from being attainable)
                    var cb = dojo.hitch(this, this._addNewClick, d, adds[i].id);
                    // disconnect these when destroyed
                    this._nwListeners.push(dojo.connect(adds[i], 'onClick', null, cb));
                }
            }
        },
        _addNewClick: function (d, buttonId, evt) {
            var id = buttonId.replace('_label', '').replace('_', ' ');
            d.hide();
            this._addNewWidget(id);
        },
        // callable from the parent dashboard so that
        // unselected children don't startup until viewed
        _init: function () {
            // has already rendered?
            if (this.pageRendered) {
                // here all charting types on 'firstButNotDefault' should redraw
                if (this.firstButNotDefault) {
                    for (var k = 0, llen = this._childWidgets.length; k < llen; k++) {
                        this._childWidgets[k]._redrawCharts();
                    }
                    // reset the flag so we don't fire this again
                    this.firstButNotDefault = false;
                }
                return;
            }
            // set colWidths now that I am selected
            //        if (this._colWidths) {
            //            this.set('colWidths', this._colWidths);
            //        }
            // a new page won't have a length
            if (this._columns.length) {
                //iterate over the zones and add widget cells to them
                for (var i = 0; i < this.nbZones; i++) {
                    //per column 
                    if (this._columns[i]) {
                        // If there is only 1 Widget, it may not be an array, which won't get caught in the following for-loop
                        //  So ensure it's an array first
                        this._columns[i].Widgets.Widget = Utility.Convert.toArrayFromObject(this._columns[i].Widgets.Widget);
                        for (var j = 0, len = this._columns[i].Widgets.Widget.length; j < len; j++) {
                            if(this._columns[i].Widgets.Widget[j]) {
                                this.addChild(this._createChild(
                                    this._columns[i].Widgets.Widget[j], i, j, this._page), i, j);
                            }
                        }
                    }
                }
            }
            this.pageRendered = true;
        },
        _dropped: function (drp, target, i) {
            // get a ref to the widget instance being dropped
            var widget = dijit.byId(drp.id);
            // ignore if not this page
            if (this._page !== widget._page) { return; }
            // what is the target column
            var col = target.node.cellIndex;
            // change the widget's col and index to match
            widget._setColumn(col);
            widget._setIndex(i);
            // inform widgets dropped, page, column, index
            dojo.publish('/ui/widget/dropped', [drp.id, widget._page, col, i]);
            
            if(this.permission) {
                this._save();
            }
            else {
                this._raisePermissionInvalidMessage();
            }
        },
        // alias for _save(true) => the bool representing 'hidden'. the page
        // representation is just returned so it can be stored and eventually 
        // 'shown' or just copied
        _hide: function () {
            return this.title;
        },
        _copy: function () {
            return this._save(true);
        },
        // If the context menu option for Saving the Page is hit and the Page
        // hasn't been viewed yet, all the content of the page would get removed on Save
        _contextSave: function() {
            if(!this.pageRendered) {
                // page hasn't been rendered, so there couldn't have been any changes to save
                return;
            }
            
            this._save();
        },
        // push in the columns and send the page to dashboard
        _save: function (hidden) {
            // need to get the current colWidths
            var cw = this.colWidths;
            var _cw;
            if (cw) {
                _cw = typeof cw === 'string' ?
                    cw : cw.join(',');
            }
            // make the page & column objects a local var so we forget...
            var pageObject;
            if(hidden) {
                pageObject = {
                    '@name': this.name,
                    '@title': this.name,
                    '@id': this.id,
                    '@family': this.family || 'System',
                    '@permission': this.permission,
                    // an array of strings if present
                    '@colWidths': _cw,
                    Columns: {
                        Column: []
                    }
                };
            }
            else {
                pageObject = {
                    '@name': this.name,
                    '@title': this.name,
                    '@id': this.id,
                    '@family': this.family || 'System',
                    // an array of strings if present
                    '@colWidths': _cw,
                    Columns: {
                        Column: []
                    }
                };
            }
            
            var columnObjects = {};
            // iterate over the widgets and push them into the correct
            // column objects
            for (var i = 0, len = this._childWidgets.length; i < len; i++) {
                var col = this._childWidgets[i].column;
                var opts = this._childWidgets[i].widgetOptions;
                // a wrapper object for each widgetOptions
                var w = {
                    // index only used by placeByAttr
                    index: this._childWidgets[i].index,
                    '@name': opts.name,
                    '@family': opts.family || 'System',
                    options: opts
                };
                if (!columnObjects[col]) {
                    columnObjects[col] =
                        new dashboardColumn({
                            Widgets: {
                                Widget: [] // array of widget objects
                            }
                        });
                }
                // the order may have changed. use placeByAttr?
                columnObjects[col].Widgets.Widget.placeByAttr(w, 'index');
            }
            // how many columns now?
            var cols = Sage.Utility.size(columnObjects);
            // push them into a pageObject.Column
            for (var j = 0; j < cols; j++) {
                pageObject.Columns.Column.push(columnObjects[j]);
            }
            // match the current (overly-nested) DB structure
            var pg = { Dashboard: {} };
            // mixin is copying too much stuff
            Sage.Utility.mixOwn(pg.Dashboard, pageObject);
            if (hidden) {
                /* We were returning pg here (it was not being used by callers), and
                JSLint was warning that _save does not always return a value.*/
                return pg;
            }
            var pgStr = dojo.toJson(pg);
            
            if(!this.oldName) {
                this.oldName = '';
            }
            
            // post to the server if not hidden specified
            var uri = dojo.string.substitute('slxdata.ashx/slx/crm/-/dashboard/page?name=${0}&family=${1}&oldName=${2}',
                [encodeURIComponent(this.name), encodeURIComponent(this.family), encodeURIComponent(this.oldName)]);
            var def = dojo.xhrPost({
                url: uri,
                handleAs: 'text',
                postData: pgStr,
                load: function (data) {
                },
                error: function (err) {
                    console.error(err);
                }
            });
        }
    });

    return widget;

});
