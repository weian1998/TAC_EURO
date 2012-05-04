/*globals Sage, dojo, dojox, dijit */
dojo.provide('Sage.UI.Columns.Lookup');
dojo.require("dojox.grid.cells.dijit");

(function () {        
	dojo.declare("Sage.UI.Columns.Lookup", dojox.grid.cells._Widget, {
//summary:
//        A Lookup implementation which renders a column in the SDataTabGrid.
//        The configuration object should be included as a column object when setting up the SDataTabGrid.
//        Sample objects and property descriptions below.
//width: int
//field: String                      
//        The data for the column.
//name: String
//        Column header
//sortable: bool
//lookupOptions: object
//        Options to pass to the Lookup widget
//  field: String                      
//        The data for the column.
//  name: String
//        Column header
//  seedOnRowEntity: bool
//        The seed value for this Lookup should come from the current row's entity
//  seedOnRelatedEntity: String
//        The seed value for this Lookup should come from the selected related entity.
//  returnObject: bool 
//        'true' if the return value of this Lookup should be an object 'false' if it should be a String.
//lookupStructure: array 
//      Column structure for the lookup control.    
//lookupStoreOptions: object
//      Options to be used by the lookup control's data store.
//
//
//description:        
//        Sample configuration object for a relationship lookup returning an object.
//            {
//	            width: 15,    
//	            field: 'AccountManager.UserInfo.UserName',
//	            name: 'Acct Manager',
//	            sortable: true,
//              style: 'text-align:left;',  
//	            editable: true,
//	            type: Sage.UI.Columns.Lookup,
//	            appliedSecurity: '',
//	            lookupOptions: {
//	                field: 'UserInfo.UserName',
//	                name: 'UserInfo.UserName',
//                  seedOnRowEntity: false,
//	                seedOnRelatedEntity: '',
//	                returnObject: true,
//	                displayMode: 'DropDownList'
//                },	
//	            lookupStructure: [{
//                    cells: [{
//                        name: 'UserInfo.UserName',
//                        field: 'UserInfo.UserName'
//		            }]
//                }],
//                lookupStoreOptions: {
//                    include: ['UserInfo'],
//                    resourceKind: 'users'
//                }
//            }
//
//
//        Sample configuration object for a relationship lookup returning a string.
//            {
//	            width: 15,
//	            field: 'Program',
//	            name: 'Program',
//	            sortable: true,
//              style: 'text-align:left;',  
//	            editable: true,
//	            type: Sage.UI.Columns.Lookup,
//	            appliedSecurity: '',
//	            lookupOptions: {
//                  field: 'Program',
//	                name: 'Program',
//                  seedOnRowEntity: false,
//	                seedOnRelatedEntity: 'Product',
//	                returnObject: false,
//	                displayMode: 'DropDownList'
//                },	
//	            lookupStructure: [{
//                    cells: [{
//		                 name: 'Program',
//		                 field: 'Program',
//		                 displayField: 'Program'
//		             }]
//                }],
//	            lookupStoreOptions: {		
//                    resourceKind:  'productPrograms'
//                }
//           }
//tags:
//  columns lookup 
		widgetClass: Sage.UI.SDataLookup,
        defaultValue: '',

        constructor: function(o) {
            if (o.lookupOptions.returnObject) {
                this.formatter = function(inDatum, inRowIndex, inNode) {
                    if (inDatum != null)
                    {
                        // The field could be serveral positions in length.
                        //Extract the field value from the object by walking the sdata relationship path.
                        var fieldPath = o.lookupOptions.field.split('.');
                        var fieldValue = inDatum;
                        for (i=0;i<fieldPath.length;i++) {
                            if (fieldValue) {
                                fieldValue = fieldValue[fieldPath[i]];
                            }
                        }
                        return fieldValue;
                    }
                    return null;
                }
            }
        },

//summary:
//  Get the options from the column configuration and set them on the widget, SDataLookup config object.        
		getWidgetProps: function (inDatum) {
            var luId = this.LuId();
            var sRelatedEntityId = '';
            if (this.lookupOptions.seedOnRelatedEntity) {
                var oItem = this.item[this.lookupOptions.seedOnRelatedEntity];
                if (oItem && typeof oItem.$key !== 'undefined') {
                    sRelatedEntityId = oItem.$key;
                }
                else {
                    // This will be valid for custom products added to a Sales Order (FreeText).
                }
            }           
			return dojo.mixin({}, this.widgetProps || {}, {
                id: luId,    
				value: inDatum, //User value to set selected item
				displayMode: this.lookupOptions.displayMode,
                //The seed value for this lookup should come from the current row's entity
                seedOnRowEntity: this.lookupOptions.seedOnRowEntity,
                seedOnRelatedEntity: this.lookupOptions.seedOnRelatedEntity,
                relatedEntityId: sRelatedEntityId,
                rowEntityId: this.item.$key,
                returnObject: this.lookupOptions.returnObject, 
                addEmptyListItem: this.lookupOptions.addEmptyListItem,
                field: this.lookupOptions.field,
                name: this.lookupOptions.name,
                structure: this.lookupStructure,
                storeOptions: this.lookupStoreOptions,
                gridOptions: this.lookupGridOptions
			});
		},
//summary:
//  Override - formatNode: Enable the column to have individual instances of the widget for each cell,
//  rather than one shared instance accross the column.        
        formatNode: function (inNode, inDatum, inRowIndex) {
            if (!this.widgetClass) {
                return inDatum;
            }
            // Check to see if the instance for the selected node already exists
            var thisLookup = dijit.byId(this.LuId());
            if (!thisLookup) {
                this.widget = this.createWidget.apply(this, arguments);
            } else {
                this.widget = thisLookup;
                this.attachWidget.apply(this, arguments);
            }
            this.sizeWidget.apply(this, arguments);
            // BEGIN: Changeset 22903 http://bugs.dojotoolkit.org/changeset/22903
            // this.grid.rowHeightChanged(inRowIndex);
            this.grid.views.renormalizeRow(inRowIndex); 
 	        this.grid.scroller.rowHeightChanged(inRowIndex, true/*fix #11101*/);   
            // END
            this.focus();
            return undefined;
        },
//summary:
//  Retrieves current select item from parent SDataTabGrid
        setCurrentItems: function () {
            this.editInfo = this.grid.edit.info;
            this.item = this.grid.getItem(this.editInfo.rowIndex);
        },
//summary:
//  Generates an Id for this instance of the Lookup widget
        LuId: function () {
            this.setCurrentItems(); 
            var retVal = [this.item.$key, this.editInfo.cell.field].join("_");
            if (Sage.Utility.getModeId() === 'insert') {
                retVal = [this.item.$cacheID, this.editInfo.cell.field].join("_");
            }
            return retVal;
        },
//summary:
//  Retreives the selected value and applies it to the grid and grid store.
		getValue: function () {
            this.setCurrentItems();
            if (this.lookupOptions.returnObject)
            {
                return dojo.mixin(this.item[this.field.split(".", 1)], this.widget.focusNode.item);
            }
            return this.widget.focusNode.value;
        }
	});
})();