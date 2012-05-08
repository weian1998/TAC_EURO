/*globals Sage, dojo, dojox, dijit, Simplate, ConditionManager */  //TODO: Refactor ConditionManager
dojo.provide('Sage.UI.SDataLookup');
dojo.requireLocalization("Sage.UI", "SDataLookup");
dojo.require("dojo._base.html");
dojo.require("dojox.grid.DataGrid");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("Sage.UI.ComboBox");
dojo.require("Sage.Data.BaseSDataStore");
dojo.require('Sage.UI.ConditionManager');
dojo.require('Sage.Utility');
dojo.require('Sage._Templated');

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

dojo.declare("Sage.UI.SDataLookup", [dijit._Widget, Sage._Templated], {
    config: {},
    grid: [],
    sdataStore: [],
    conditionMgr: [],
    structure: [],
    displayMode: 5,
    seedOnRowEntity: false,
    seedOnRelatedEntity: '',
    rowEntityId: '',
    relatedEntityId: '',
    returnObject: true,
    addEmptyListItem: false,
    fields: [], //this.fields,
    query: {},
    //    name: '',
    //    field: '', 
    widgetsInTemplate: true,
    storeOptions: {
        pagesize: 15,
        include: [],
        select: ['Id'], //what about composite keys?....  <---<<<   <---<<<
        orderby: ''
    },
    gridOptions: {},
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
    //i18n strings:
    cancelText: 'Close',
    loadingText: 'Loading...',
    noDataText: 'No records returned',
    //end i18n strings.
    postMixInProperties: function () {
        dojo.mixin(this, dojo.i18n.getLocalization("Sage.UI", "SDataLookup", this.lang));
        if (typeof this.displayMode === 'string') {
            this.displayMode = this.displayModes[this.displayMode];
        }
        //Mixin any default options that are needed but were not included in the setup
        var storeOptions = {
            pagesize: 15,
            //query: [],
            //orderby: '',
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
                this.query = { fn: this.gridOptions.contextualCondition, scope: this }
            } else if (typeof this.gridOptions.contextualCondition === 'object') {
                if (this.gridOptions.contextualCondition.fn) {
                    this.ensureValue(this.gridOptions.contextualCondition, 'scope', this);
                    this.query = this.gridOptions.contextualCondition;
                }
            }
        }

        var gridOptions = {
            rowsPerPage: 15,
            loadingMessage: this.loadingText,
            noDataMessage: this.noDataText,
            query: this.query
        };

        this.storeOptions = Sage.Utility.extend(true, storeOptions, this.storeOptions);
        this.gridOptions = Sage.Utility.extend(true, gridOptions, this.gridOptions);

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
            ' dojoAttachPoint="focusNode" autoComplete="true" dojoType="Sage.UI.ComboBox" value="{%= $.setSelectedValue() %}" ',
            ' store="dijit.byId(\'{%= $.id %}\').sdataStore" name="{%= $.field %}">',
            '</select>',
            '</div>'
        ];
        var tplMode5 = ['<img style="cursor: pointer; padding-right: 4px;" ',
                ' onclick="dijit.byId(\'{%= $.id %}\').showLookup();" ',
                'src="images/icons/plus_16x16.gif" alt="{%= $.btnToolTip %}" title="{%= $.btnToolTip %}" >'];
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
        this.initGrid();
    },
    //TODO: 'Search' action should be a callback sent to the ConditionManager
    doLookup: function () {
        if (this.conditionMgr.reloadConditions()) {
            this.grid.destroy(false);
            this.gridOptions.query.conditions = this.conditionMgr.getConditionsString();
            this.initGrid();
        } else {
            alert(this.conditionMgr.setupTemplateObj.errorOperatorRequiresValue);
        }
    },
    setSelectedValue: function () {
        var retVal = (this.value != null) ? this.value : '';
        if (this.returnObject && this.value != null) {
            // The field could be serveral positions in length.
            //Extract the field value from the object by walking the sdata relationship path.
            var fieldPath = this.field.split('.');
            var fieldValue = this.value;
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
        if (items.length <= 0 && this.grid._by_idx.length == 1) {
            items.push(this.grid._by_idx[0].item);
        }
        if (items.length == 0) {
            return;
        }
        this.doSelected(items);
        this.grid.selection.deselectAll();
    },
    initConditionManager: function () {
        this.conditionMgr = new ConditionManager(this);
        this.conditionMgr.setupTemplateObj.index = 0;
        var content = this.conditionMgr.lookupTpl.apply(this.conditionMgr.setupTemplateObj);
        dojo.html.set(dojo.byId(this.id + '-Condition-container'), content);
    },
    initGrid: function () {
        //Create 
        var lookupGrid = dijit.byId([this.id, '-Grid'].join(''));
        if (!lookupGrid) {
            this.gridOptions.store = this.sdataStore;
            this.gridOptions.structure = this.structure;
            this.gridOptions.id = [this.id, '-Grid'].join('');
            this.grid = new dojox.grid.DataGrid(this.gridOptions);
            dojo.place(this.grid.domNode, [this.id, '-Grid-container'].join(''), 'only');
            this.grid.startup();
        }
        //Reuse
        else {
            this.grid = lookupGrid;
        }
    },
    initSDataStore: function () {
        var cols = this.structure[0];
        var sel = this.storeOptions.select || [];
        var inc = this.storeOptions.include || [];
        var field;
        for (var i = 0; i < cols.cells.length; i++) {
            if (cols.cells[i].field) {
                field = cols.cells[i].field;
                if (cols.cells[i].displayField) {
                    field = field + '.' + cols.cells[i].displayField;
                }
                Sage.Utility.addToListUnique(field.replace('.', '/'), sel);
                if (cols.cells[i].field.indexOf('.') > 0) {
                    var parts = cols.cells[i].field.split('.');
                    var combined = '';
                    for (var p = 0; p < parts.length - 1; p++) {
                        combined += parts[p];
                        Sage.Utility.addToListUnique(combined, inc);
                        combined += '/';
                    }
                }
            }
        }
        //create the data store        
        this.sdataStore = new Sage.Data.BaseSDataStore(this.storeOptions);
    },
    buildSDataStoreQueryConditions: function () {
        //Set seed values in query conditions
        if (this.seedOnRowEntity) {
            this.sdataStore.query = String.format("Id eq \"{0}\"", this.rowEntityId);
        }
        if (this.seedOnRelatedEntity !== '') {
            this.sdataStore.query = {
                conditions: String.format(" {0}.Id eq \"{1}\" ", this.seedOnRelatedEntity, this.relatedEntityId)
            };
        }
        // Check if there is a conditional where/contextual condition attached to the grid options.
        // If display mode is 0, then there is no grid in this first interation.
        // Future interations will include a grid in line.
        if (typeof this.gridOptions.contextualCondition === 'function') {
            var queryFunc = { fn: this.gridOptions.contextualCondition, scope: this }
            this.sdataStore.query = Sage.Utility.extend(true, this.sdataStore.query, queryFunc);
        }
    },
    //Not used
    render: function () {
        dojo.place(this.domNode, this.renderTo);
    },
    dialogContent: new Simplate(['<div >',
                    '<div style="padding:10px;" id="{%= id %}-Condition-container"></div>',
                    '<div id="{%= id %}-Grid-container" style="width:auto;height:{%= gridHeight %}px;"></div>',
                    '<div style="padding:5px;text-align:right;">',
                        '<button dojoType="dijit.form.Button" type="button" ',
                            'onClick="dijit.byId(\'{%= id %}\').getGridSelections(); ">',
                            '{%= dialogButtonText %} </button>',
                        '<button dojoType="dijit.form.Button" type="button" ',
                            'onClick="dijit.byId(\'{%= id %}-Dialog\').hide();">{%= cancelText %}</button>',
                    '</div>',
                    '</div> ']),
    canShowLookup: function () {
        if (typeof this.gridOptions.contextualShow === 'function') {
            return this.gridOptions.contextualShow();
        }
        return { result: true, reason: '' };
    },
    showLookup: function () {
        var sError = 'The lookup cannot be displayed because one or more conditions have not been met.';
        var showError = function (msg) {
            var msgService = Sage.Services.getService('WebClientMessageService');
            if (msgService != null && typeof msgService !== 'undefined') {
                msgService.showClientError(msg);
            }
            else {
                alert(msg);
            }
        }
        var oCanShowLookup = this.canShowLookup();
        if (typeof oCanShowLookup !== 'object') {
            showError('The call to the function canShowLookup() returned an invalid result.' );
            return;
        }
        if (typeof oCanShowLookup.result === 'boolean' && oCanShowLookup.result) {
            var self = this;
            var dHeight = (self.dialogHeight > 0) ? self.dialogHeight : 390;
            var dWidth = (self.dialogWidth > 0) ? self.dialogWidth : 600;
            var lookupDialog = dijit.byId([self.id, '-Dialog'].join(''));
            if (!lookupDialog) {
                lookupDialog = new dijit.Dialog({
                    title: self.dialogTitle,
                    id: [self.id, '-Dialog'].join(''),
                    style: ['height:', dHeight, 'px;width:', dWidth, 'px;'].join(''),
                    refreshOnShow: false,
                    _onKey: this._onKey
                });
                // Calculate the grid height by subtracting the height of the other dialog elements from the dialog height: dheight-125.
                lookupDialog.attr("content", self.dialogContent.apply({ cancelText: self.cancelText, dialogButtonText: self.dialogButtonText, id: self.id, gridHeight: dHeight - 125 }));

                //ToDo: Condition Manager needs to be added to the Sage.UI namespace.
                dojo.connect(ConditionManager.prototype, 'addLookupCondition', this.dialogResize);
            }
            lookupDialog.show();
            dojo.destroy([self.id, '-Dialog_underlay'].join(''));
            //Position the dialog just below the main header.
            dojo.style([self.id, '-Dialog'].join(''), 'top', '60px');
            dojo.style([self.id, '-Dialog'].join(''), 'left', '25%');

            self.initDialog();
        }
        else {            
            if (typeof oCanShowLookup.reason === 'string' && oCanShowLookup.reason.length != 0) {
                sError = oCanShowLookup.reason;
            }
            showError(sError);
        }
    },
    dialogResize: function () {
        dojo.style([this._options.id, '-Dialog'].join(''), 'height', 'auto');
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
        var self = this;
        var args = arguments;
        dojo.query('*', this.domNode).forEach(function (node, index, arr) {
            if (node == evt.target) {
                //We are inside the dialog. Call the inherited.
                self.inherited(args);
            }
        });
    }
});


//----------------------------------------------------------------
(function () {
    if (!Sage.Utility) {
        Sage.namespace("Utility");
    }
    //TODO: Move to Sage.Utility
    Sage.Utility.addToListUnique = function (item, list) {
        for (var i = 0; i < list.length; i++) {
            if (item === list[i]) {
                return;
            }
        }
        list.push(item);
    };

    Sage.Utility.SDataLookupChildObjectFormatter = function (opts) {
        var feedItem = opts.grid.grid._by_idx[opts.rowIdx].item;
        if (!feedItem || !feedItem[opts.childentity] || feedItem[opts.childentity].$resources.length == 0) {
            return dojo.string.substitute('<div style="text-indent:16px">${0}</div>', [opts.value || '&nbsp;']);
        }
        opts.value = opts.value || '&nbsp;';
        var res = [];
        if (opts.includeButton) {
            res.push(dojo.string.substitute([
                '<input type=button id="SOPshow${1}" style="height:16px;width:14px;border:0;background:transparent;vertical-align:top" onclick="dojo.query(\'.SOProw${1}\').style({display:\'\'});dojo.query(\'#SOPshow${1}\').style({display:\'none\'});dojo.query(\'#SOPhide${1}\').style({display:\'\'})" value="+">',
                '<input type=button id="SOPhide${1}" style="display:none;height:16px;width:14px;border:0;background:transparent;vertical-align:top" onclick="dojo.query(\'.SOProw${1}\').style({display:\'none\'});dojo.query(\'#SOPshow${1}\').style({display:\'\'});dojo.query(\'#SOPhide${1}\').style({display:\'none\'})" value="-"> ',
                ].join(''), [opts.value, opts.rowIdx]));
        }
        res.push(dojo.string.substitute('${0}<div class=SOProw${1} style="display:none">', [opts.value, opts.rowIdx]));
        for (var i = 0; i < feedItem[opts.childentity].$resources.length; i++) {
            res.push(dojo.string.substitute('<div style="text-indent:2em">${0}</div>', [feedItem[opts.childentity].$resources[i][opts.fieldName] || '&nbsp;']));
        }
        res.push("</div>");
        return res.join('');
    }
})();