/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/*
sample config object for renderMode 5 ...
 {
    id: 'ProdLookup',
    btnToolTip: 'Lookup Product',
    dialogButtonText: 'Add Product',
    displayMode: 5, //$ {qf control . LookupDisplayMode}  When adding other dijit templates, 
        need to convert control to use enum values
    dialogTitle: 'Product Lookup',
    structure: [
    {
        defaultCell: { width: 12, editable: false, styles: 'text-align: right;' },
        cells: [
        {
            name: 'Family',
            field: 'Family',
            displayField: 'Family',
            sortable: true,
            width: 15
        },
        {
            name: 'Name',
            field: 'Name',
            displayField: 'Name',
            sortable: true,
            width: 15
        },
        {
            name: 'Price',
            field: 'Price',
            displayField: 'Price',
            sortable: true,
            width: 15
        },
        {
            name: 'Program',
            field: 'Program',
            displayField: 'Program',
            sortable: true,
            width: 15
        }
    ]
    }], storeOptions: {
        resourceKind: 'products'
    },
    gridOptions: {
        selectionMode: 'Single',
        rowsPerPage: 15
    },
    doSelected: function (items) {
        var grid = dijit.byId('OppProducts');
        if (grid && grid.store) {
            grid.store.newItem({ onComplete: function (oppProduct) {
                var i;
                for (i = 0; i < items.length; i += 1) {
                    var newEntity = {};
                    var item = items[i];

                    oppProduct.Opportunity = { $key: Sage.Utility.getCurrentEntityId() };
                    //Set item to the product before destroying the key                           
                    oppProduct.Product = {};
                    delete item.index;
                    Sage.Utility.extend(oppProduct.Product, item);
                    //Clean up the item
                    delete item.$key;
                    delete item.$name;
                    delete item.$url;

                    Sage.Utility.extend(true, newEntity, oppProduct, item);
                    grid.store.saveNewEntity(newEntity, function (entity) { this._refresh(); }, function () { }, grid);
                }
            }
            });
        }
    }
}
*/
define([
        'dojo/_base/html',
        'dojox/grid/DataGrid',
        'dijit/Dialog',
        'dijit/form/Button',
        'Sage/UI/ComboBox',
        'Sage/Data/BaseSDataStore',
        'Sage/UI/ConditionManager',
        'Sage/Utility',
        'Sage/_Templated',
        'Sage/UI/Columns/DateTime',
        'Sage/UI/Columns/Phone',
        'Sage/UI/Columns/PickList',
        'dijit/_Widget',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',
        'dojo/i18n!./nls/SDataLookup',
        'dojo/_base/declare'
],
function (html, DataGrid, Dialog, Button, ComboBox, BaseSDataStore, ConditionManager, Utility, _Templated, DateTime, Phone, PickList, _Widget, DialogHelpIconMixin, dojoLang, nlsResource, declare) {
    //dojo.requireLocalization("Sage.UI", "SDataLookup");
    (function () {

        if (!Utility) {
            Sage.namespace("Utility");
        }
        //TODO: Move to Sage.Utility
        Utility.addToListUnique = function (item, list) {
            for (var i = 0; i < list.length; i++) {
                if (item === list[i]) {
                    return;
                }
            }
            list.push(item);
        };

        Utility.SDataLookupChildObjectFormatter = function (opts) {
            console.warn("Deprecated: Utility.SDataLookupChildObjectFormatter. Use: Sage.Utility.SDataLookup.ChildObjectFormatter");
            var feedItem = opts.grid.grid._by_idx[opts.rowIdx].item,
                res,
                i;

            if (!feedItem || !feedItem[opts.childentity] || feedItem[opts.childentity].$resources.length === 0) {
                return dojo.string.substitute('<div style="text-indent:16px">${0}</div>', [opts.value || '&nbsp;']);
            }

            opts.value = opts.value || '&nbsp;';
            res = [];
            if (opts.includeButton) {
                res.push(dojo.string.substitute([
                    '<input type=button id="SOPshow${1}" style="height:16px;width:14px;border:0;background:transparent;vertical-align:top" onclick="dojo.query(\'.SOProw${1}\').style({display:\'\'});dojo.query(\'#SOPshow${1}\').style({display:\'none\'});dojo.query(\'#SOPhide${1}\').style({display:\'\'})" value="+">',
                    '<input type=button id="SOPhide${1}" style="display:none;height:16px;width:14px;border:0;background:transparent;vertical-align:top" onclick="dojo.query(\'.SOProw${1}\').style({display:\'none\'});dojo.query(\'#SOPshow${1}\').style({display:\'\'});dojo.query(\'#SOPhide${1}\').style({display:\'none\'})" value="-"> '
                    ].join(''), [opts.value, opts.rowIdx]));
            }

            res.push(dojo.string.substitute('${0}<div class=SOProw${1} style="display:none">', [opts.value, opts.rowIdx]));
            for (i = 0; i < feedItem[opts.childentity].$resources.length; i++) {
                res.push(dojo.string.substitute('<div style="text-indent:2em">${0}</div>', [feedItem[opts.childentity].$resources[i][opts.fieldName] || '&nbsp;']));
            }

            res.push("</div>");
            return res.join('');
        };
    } ());

    var widget = declare("Sage.UI.SDataLookup", [_Widget, _Templated], {
        config: null,
        grid: null,
        sdataStore: null,
        conditionMgr: null,
        structure: null,
        displayMode: 5,
        lookupDialog: null,
        dialogTitle: '',
        dialogWidth: 675,
        dialogHeight: 500,
        seedOnRowEntity: false,
        seedOnRelatedEntity: '',
        seedProperty: '',
        seedValue: '',
        overrideSeedValueOnSearch: false,
        preFilters: null,
        initializeLookup: true,
        rowEntityId: '',
        relatedEntityId: '',
        returnObject: true,
        addEmptyListItem: false,
        fields: null, //this.fields,
        query: null,
        // Id of the calling object.  Usage: To return data in doSelected.
        callerId: null,
        //    name: '',
        //    field: '', 
        widgetsInTemplate: true,
        storeOptions: null,
        gridOptions: null,
        sortColumn: '',
        //Reference enum for Display Mode 
        displayModes: {
            'DropDownList': 0,
            'Dialog': 1,
            'HyperText': 2,
            'Text': 3,
            'ButtonOnly': 4,
            'ButtonOnlyClient': 5
        },
        btnIcon: 'images/icons/plus_16x16.gif',
        isModal: false,
        //i18n strings:
        cancelText: 'Cancel',
        closeText: 'Close',
        loadingText: 'Loading...',
        noDataText: 'No records returned',
        _initialized: false,
        //end i18n strings.
        _addCondHandle: null,
        _removeCondHandle: null,
        _originalQueryConditions: '',
        id: 'lookupControl',

        dialogContent: new Simplate(['<div >',
            '<div style="padding:5px;" id="{%= $.id %}-Condition-container"></div>',
            '<div id="{%= $.id %}-Grid-container" style="width:auto;height:{%= $.gridHeight %}px;"></div>',
            '<div class="lookupButtonWrapper">',
            '{% if($.dialogButtonText){ %}',
                '<button data-dojo-type="dijit.form.Button" type="button" id="{%= $.id %}-GridSelectButton" ',
                    'onClick="dijit.byId(\'{%= $.id %}\').getGridSelections(); ">',
                    '{%= $.dialogButtonText %} </button>',
            '{% } %}',
                '<button data-dojo-type="dijit.form.Button" type="button" id="{%= $.id %}-CloseButton" ',
                    'onClick="dijit.byId(\'{%= $.id %}-Dialog\').hide();">{%= $.hideText %}</button>',
            '</div>',
            '</div> ']),
        constructor: function () {
            this.gridOptions = {};
            this.storeOptions = {
                pagesize: 15,
                include: [],
                select: ['Id'], //what about composite keys?....  <---<<<   <---<<<
                orderby: ''
            };

            this.preFilters = [];

            this.query = {};
            this.config = {};
            this.fields = [];
            this.structure = [];
            this.grid = [];
            this.sdataStore = [];
        },
        postMixInProperties: function () {
            var cells,
                i,
                storeOptions,
                gridOptions;

            this._initialized = false;
            dojoLang.mixin(this, dojo.i18n.getLocalization("Sage.UI", "SDataLookup"));
            if (typeof this.displayMode === 'string') {
                this.displayMode = this.displayModes[this.displayMode];
            }

            // Fix column types coming in from JSON. The cell/structure type must be a constructor.
            if (this.structure && this.structure[0] && this.structure[0].cells) {
                cells = this.structure[0].cells;
                for (i = 0; i < cells.length; i++) {
                    if (cells[i] && cells[i].type && (typeof cells[i].type === 'string')) {
                        switch (cells[i].type) {
                            case 'Sage.UI.Columns.DateTime':
                                cells[i].type = DateTime;
                                break;
                            case 'Sage.UI.Columns.Phone':
                                cells[i].type = Phone;
                                break;
                            case 'Sage.UI.Columns.PickList':
                                cells[i].type = PickList;
                                break;
                            default:
                                delete cells[i].type;
                                break;
                        }
                    }
                }
            }

            //Mixin any default options that are needed but were not included in the setup
            storeOptions = {
                pagesize: 15,
                include: [],
                orderby: '',
                select: ['Id'] //what about composite keys?....  <---<<<   <---<<<            
            };

            //If we are in Mode 0, drop down list, extend the grid query options directly onto the store.
            if (this.displayMode === 0) {
                this.initSDataStore();
                this.buildSDataStoreQueryConditions();
            }
            //Else add them to the lookup level query.
            //Do we need this else block?????
            else {
                if (typeof this.gridOptions.contextualCondition === 'function') {
                    this.query = { fn: this.gridOptions.contextualCondition, scope: this };
                } else if (typeof this.gridOptions.contextualCondition === 'object') {
                    if (this.gridOptions.contextualCondition.fn) {
                        this.ensureValue(this.gridOptions.contextualCondition, 'scope', this);
                        this.query = this.gridOptions.contextualCondition;
                    }
                }

                this.buildSDataStoreQueryForSeeding();
            }

            gridOptions = {
                rowsPerPage: 15,
                loadingMessage: this.loadingText,
                noDataMessage: this.noDataText,
                query: this.query
            };

            this._originalQueryConditions = this.query.conditions;

            this.storeOptions = Utility.extend(true, storeOptions, this.storeOptions);
            this.gridOptions = Utility.extend(false, gridOptions, this.gridOptions);

            // Set the widgetTemplate here so we can select the appropriate template for the selected display mode.
            this.widgetTemplate = new Simplate(this.setTemplate(this.displayMode));
        },
        setTemplate: function (mode) {
            //TODO: Move templates to Sage.Templates

            //TODO: Code review. 
            //  store="dijit.byId(\'{%= $.id %}\').sdataStore"
            // VS.
            // store="sdataStore"
            var tplMode0 = [
                    '<div id="{%= $.id %}" style="width:inherit;" > ',
                    '<select style="width:inherit;"  id="{%= $.id %}_select" searchAttr="{%= $.field %}" labelAttr="{%= $.field %}" ',
                    ' dojoAttachPoint="focusNode" autoComplete="true" required="{%= $.required %}" data-dojo-type="Sage.UI.ComboBox" value="{%= $.setSelectedValue() %}" ',
                    ' store="dijit.byId(\'{%= $.id %}\').sdataStore" name="{%= $.field %}">',
                    '</select>',
                    '</div>'
                ],
                tplMode5 = ['<img style="cursor: pointer; padding-right: 4px;" ',
                    ' onclick="dijit.byId(\'{%= $.id %}\').showLookup();" ',
                    'src="{%= $.btnIcon %}" alt="{%= $.btnToolTip %}" title="{%= $.btnToolTip %}" >'];
            switch (mode) {
                case 0:
                    return tplMode0;
                case 5:
                    return tplMode5;
                default:
                    return tplMode5;
            }
        },
        initDialog: function () {
            this.initConditionManager();
            this.initSDataStore();
            this._setQueryForLoad();
            this.initGrid(this.initializeLookup);
        },
        _setQueryForLoad: function () {
            var condQuery = this.conditionMgr.getConditionsAsUrlWhereString(),
                seededQuery = this._originalQueryConditions,
                newQuery = '',
                queryParts = [];

            queryParts.push(condQuery);
            queryParts.push(seededQuery);

            // filter out empty items
            queryParts = dojo.filter(queryParts, function (item, index, array) {
                return item && item !== '';
            });

            newQuery = queryParts.join(' and ');

            if (newQuery) {
                this.gridOptions.query.conditions = newQuery;
            }
        },
        _setQueryForSearch: function () {
            var condQuery = this.conditionMgr.getConditionsAsUrlWhereString(),
                existingQuery = this._originalQueryConditions, // seeded query or existing query passed in via query
                newQuery = '',
                queryParts = [];

            if (this.isSeeded() && this.overrideSeedValueOnSearch === false) {
                queryParts.push(condQuery);
                queryParts.push(existingQuery);
            } else {
                if (this.isSeeded()) {
                    // discard the seed, override is true
                    queryParts.push(condQuery);
                } else {
                    // We are not seeded, add condition query and existing query if any
                    queryParts.push(condQuery);
                    queryParts.push(existingQuery);
                }
            }

            // filter out empty items
            queryParts = dojo.filter(queryParts, function (item, index, array) {
                return item && item !== '';
            });

            newQuery = queryParts.join(' and ');

            this.gridOptions.query.conditions = newQuery;
        },
        doLookup: function () {
            this.grid.destroy(false);
            this._setQueryForSearch();
            this.initGrid(true);
        },
        setSelectedValue: function () {
            var retVal = (this.value !== null) ? this.value : '',
                fieldPath,
                fieldValue,
                i;

            if (this.returnObject && this.value !== null) {
                // The field could be serveral positions in length.
                //Extract the field value from the object by walking the sdata relationship path.
                fieldPath = this.field.split('.');
                fieldValue = this.value;
                for (i = 0; i < fieldPath.length; i++) {
                    if (fieldValue) {
                        fieldValue = fieldValue[fieldPath[i]];
                    }
                }

                retVal = fieldValue;
            }

            return retVal;
        },
        getGridSelections: function () {
            var items = this.grid.selection.getSelected();

            if (items.length <= 0 && this.grid._by_idx.length === 1) {
                items.push(this.grid._by_idx[0].item);
            }

            if (items.length === 0) {
                return;
            }

            this.doSelected(items);
            this.grid.selection.deselectAll();
        },
        initConditionManager: function () {
            var addToFieldsUnique,
                cols,
                fields,
                fieldName,
                displayName,
                propertyType,
                pickListName,
                i,
                cell,
                opts,
                self,
                index,
                filter,
                field,
                op,
                value,
                visible;

            if (this.conditionMgr) {
                return;
            }

            addToFieldsUnique = function (fieldName, displayName, propertyType, pickListName, pickListStorageMode, list) {
                var i;
                for (i = 0; i < list.length; i++) {
                    if (fieldName === list[i].fieldname) {
                        return;
                    }
                }
                list.push({ fieldName: fieldName, displayName: displayName, propertyType: propertyType, pickListName: pickListName, pickListStorageMode: pickListStorageMode });
            };

            cols = this.structure[0];
            fields = this.fields;

            for (i = 0; i < cols.cells.length; i++) {
                if (cols.cells[i].excludeFromFilters !== true) {
                    if (cols.cells[i].field) {
                        cell = cols.cells[i];
                        fieldName = cell.field;
                        propertyType = cell.propertyType;
                        displayName = cell.displayField || cell.name;
                        pickListName = cell.pickListName;
                        pickListStorageMode = cell.pickListStorageMode;
                        addToFieldsUnique(fieldName, displayName, propertyType, pickListName, pickListStorageMode, fields);
                    }
                }
            }

            opts = {
                fields: fields,
                fieldNameProperty: 'fieldName',
                fieldDisplayNameProperty: 'displayName',
                fieldTypeProperty: 'propertyType',
                id: this.id + '-ConditionManager'
            };

            this.conditionMgr = new ConditionManager(opts);
            self = this;

            this._addCondHandle = dojo.subscribe('onAddLookupCondition', self, function (mgr) {
                this._increaseDialogHeight();
            });

            this._removeCondHandle = dojo.subscribe('onRemoveLookupCondition', self, function (mgr) {
                this._decreaseDialogHeight();
            });

            // Leave first condition empty
            if (this.preFilters.length > 0) {
                this.conditionMgr.setFirstConditionValue('', '=', '');
            }

            // Add conditions here for preFilter
            for (index = 0; index < this.preFilters.length; index++) {
                filter = this.preFilters[index];
                field = filter.propertyName.trim();
                op = filter.conditionOperator.trim();
                value = filter.filterValue.trim();
                visible = filter.visible;

                this.conditionMgr.addCondition(field, op, value, visible);

                if (visible) {
                    this._increaseDialogHeight();
                }
            }

            dojo.place(this.conditionMgr.domNode, dojo.byId(this.id + '-Condition-container'), 'only');
            this._doSearchConnection = dojo.connect(this.conditionMgr, 'onDoSearch', this, 'doLookup');
        },
        _increaseDialogHeight: function () {
            if (this.dialogHeight) {
                this.dialogHeight += 30;
                dojo.style([this.id, '-Dialog'].join(''), 'height', this.dialogHeight + 'px');
            }
        },
        _decreaseDialogHeight: function () {
            if (this.dialogHeight) {
                this.dialogHeight -= 30;
                dojo.style([this.id, '-Dialog'].join(''), 'height', this.dialogHeight + 'px');
            }
        },
        onDoubleClick: function (event) {
            this.getGridSelections(); // fires onSelected
            if (this.lookupDialog) {
                //this.lookupDialog.hide();
            }
        },
        initGrid: function (autoStartup) {
            //Create
            var lookupGrid = dijit.byId([this.id, '-Grid'].join(''));
            if (!lookupGrid) {
                this.gridOptions.store = this.sdataStore;
                this.gridOptions.structure = this.structure;
                this.gridOptions.id = [this.id, '-Grid'].join('');
                this.grid = new DataGrid(this.gridOptions);
                this.grid.canSort = function (index) {
                    var cols = this.structure[0];
                    return cols.cells[Math.abs(index) - 1].sortable;
                };

                dojo.connect(this.grid, 'onDblClick', this, this.onDoubleClick);
                dojo.place(this.grid.domNode, [this.id, '-Grid-container'].join(''), 'only');

                if (autoStartup) {
                    this.grid.startup();
                }
                else {
                    this.grid.query.conditions = "Id like '_hack_'";
                    this.grid.startup();
                }
            }
            //Reuse - but only if the query conditions are different
            else {
                if (this.query.conditions !== lookupGrid.query.conditions) {
                    lookupGrid.destroy();
                    this.initGrid(autoStartup);
                } else {
                    this.grid = lookupGrid;
                }
            }
        },
        initSDataStore: function () {
            var cols = this.structure[0],
            sel = this.storeOptions.select || [],
            inc = this.storeOptions.include || [],
            field,
            i,
            parts,
            combined,
            p;

            for (i = 0; i < cols.cells.length; i++) {
                if (cols.cells[i].field) {
                    field = cols.cells[i].field;
                    if (cols.cells[i].displayField) {
                        field = field + '.' + cols.cells[i].displayField;
                    }

                    Utility.addToListUnique(field.replace(/\./g, '/'), sel);

                    if (cols.cells[i].field.indexOf('.') > 0) {
                        parts = cols.cells[i].field.split('.');
                        combined = '';
                        for (p = 0; p < parts.length - 1; p++) {
                            combined += parts[p];
                            Utility.addToListUnique(combined, inc);
                            combined += '/';
                        }
                    }
                }
            }
            //Update the include and selects with additional items.
            this.storeOptions.include = inc;
            this.storeOptions.select = sel;
            //create the data store
            this.sdataStore = new BaseSDataStore(this.storeOptions);
        },
        isSeeded: function () {
            var seeded = (this.seedValue && this.seedValue !== '' && this.seedProperty !== '');
            return seeded;
        },
        buildSDataStoreQueryForSeeding: function () {
            var newQuery,
                seedQuery,
                existingQuery;

            if (this.isSeeded()) {
                seedQuery = dojo.string.substitute('${0} eq "${1}"', [this.seedProperty, this.seedValue]);
                existingQuery = this.query.conditions;

                if (existingQuery && existingQuery !== '') {
                    newQuery = existingQuery + ' and ' + seedQuery;
                } else {
                    newQuery = seedQuery;
                }

                this.sdataStore.query = {
                    conditions: newQuery
                };

                this.query.conditions = newQuery;
            }
        },
        buildSDataStoreQueryConditions: function () {
            var queryFunc;

            //Set seed values in query conditions
            if (this.seedOnRowEntity) {
                this.sdataStore.directQuery = dojo.string.substitute('Id eq "${0}"', [this.rowEntityId]);
            }

            if (this.seedOnRelatedEntity !== '') {
                this.sdataStore.directQuery = {
                    conditions: dojo.string.substitute(' ${0}.Id eq "${1}" ', [this.seedOnRelatedEntity, this.relatedEntityId])
                };
            }

            // Check if there is a conditional where/contextual condition attached to the grid options.
            // If display mode is 0, then there is no grid in this first interation.
            // Future interations will include a grid in line.
            if (typeof this.gridOptions.contextualCondition === 'function') {
                queryFunc = { fn: this.gridOptions.contextualCondition, scope: this };
                this.sdataStore.directQuery = Utility.extend(true, this.sdataStore.directQuery, queryFunc);
            }
        },
        //Not used
        render: function () {
            dojo.place(this.domNode, this.renderTo);
        },
        canShowLookup: function () {
            if (typeof this.gridOptions.contextualShow === 'function') {
                return this.gridOptions.contextualShow();
            }
            return { result: true, reason: '' };
        },
        showLookup: function () {
            var sError = 'The lookup cannot be displayed because one or more conditions have not been met.',
                oCanShowLookup = this.canShowLookup(),
                self = this,
                dHeight,
                dWidth,
                hideText = '';

            if (typeof oCanShowLookup !== 'object') {
                Sage.UI.Dialogs.showError('The call to the function canShowLookup() returned an invalid result.');
                return;
            }
            if (typeof oCanShowLookup.result === 'boolean' && oCanShowLookup.result) {
                dHeight = (self.dialogHeight > 0) ? self.dialogHeight : 450;
                dWidth = (self.dialogWidth > 0) ? self.dialogWidth : 700;
                self.lookupDialog = dijit.byId([self.id, '-Dialog'].join(''));
                if (!self.lookupDialog) {
                    self.lookupDialog = new Dialog({
                        title: self.dialogTitle,
                        id: [self.id, '-Dialog'].join(''),
                        style: ['height:', dHeight, 'px;width:', dWidth, 'px;'].join(''),
                        refreshOnShow: false,
                        _onKey: this._onKey
                    });

                    self.dialogHeight = dHeight;
                    self.dialogWidth = dWidth;

                    // If dialog is modal, we want the hide button to display "Cancel", otherwise "Close"
                    if (self.isModal) {
                        hideText = self.cancelText;
                    } else {
                        hideText = self.closeText;
                    }

                    // Calculate the grid height by subtracting the height of the other dialog elements from the dialog height: dheight-125.
                    self.lookupDialog.set("content", self.dialogContent.apply({ hideText: hideText, dialogButtonText: self.dialogButtonText, id: self.id, gridHeight: dHeight - 150 }));

                    // Create help icon
                    dojoLang.mixin(self.lookupDialog, new DialogHelpIconMixin());
                    self.lookupDialog.createHelpIconByTopic('findlookup');
                }
                else {
                    // self.dialogHeight is null on refresh, which causes the dialog to not grow when adding conditions
                    self.dialogHeight = dHeight;
                    dojo.style([self.id, '-Dialog'].join(''), 'height', dHeight + 'px');
                }

                self.lookupDialog.show();
                if (!this.isModal) {
                    dojo.destroy([self.id, '-Dialog_underlay'].join(''));
                }

                //Position the dialog just below the main header.
                dojo.style([self.id, '-Dialog'].join(''), 'top', '60px');
                dojo.style([self.id, '-Dialog'].join(''), 'left', '300px');

                self.initDialog();
            }
            else {
                if (typeof oCanShowLookup.reason === 'string' && oCanShowLookup.reason.length !== 0) {
                    sError = oCanShowLookup.reason;
                }
                Sage.UI.Dialogs.showError(sError);
            }
        },
        doSelected: function (items) {
            //do nothing, this is here as a placeholder for consumers to add custom handling for this event.
        },
        _onKey: function (/*Event*/evt) {
            //summary:
            // An override to the Dialog _onKey that allows the Lookup control to function as a modeless dialog.  
            // Future implementations will see this feature as a mixin class available to any dialog class.
            // modality: modal, modeless
            // (modality === 'modeless') ? dijit.byId('dijit_DialogUnderlay_0').hide(); 
            // OR
            //  dojo.destroy(self.id + '-Dialog_underlay');        
            var self = this,
                args = arguments;
            dojo.query('*', this.domNode).forEach(function (node, index, arr) {
                if (node === evt.target) {
                    //We are inside the dialog. Call the inherited.
                    self.inherited(args);
                }
            });
        },
        destroy: function () {
            var dialog = dijit.byId([this.id, '-Dialog'].join(''));

            if (this.btnIcon) {
                dojo.destroy(this.btnIcon);
            }

            dojo.disconnect(this._doSearchConnection);
            dojo.unsubscribe(this._addCondHandle);
            dojo.unsubscribe(this._removeCondHandle);

            if (this.conditionMgr) {
                this.conditionMgr.destroy(false);
            }

            if (dialog) {
                dialog.uninitialize();
            }

            this.inherited(arguments);
        }
    });

    return widget;
});
