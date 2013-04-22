/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Utility',
    'dojox/grid/cells',
    'dojo/_base/declare'
],
function (Utility, cells, declare) {
    var widget = declare("Sage.UI.Columns.Lookup", cells._Widget, {
		widgetClass: Sage.UI.SDataLookup,
        defaultValue: '',
        constructor: function(o) {
            if (o.lookupOptions.returnObject) {
                this.formatter = function(inDatum, inRowIndex, inNode) {
                    if (inDatum != null) {
                        // The field could be serveral positions in length.
                        //Extract the field value from the object by walking the sdata relationship path.
                        var fieldPath = o.lookupOptions.field.split('.');
                        var fieldValue = inDatum;
                        for (var i=0;i<fieldPath.length;i++) {
                            if (fieldValue) {
                                fieldValue = fieldValue[fieldPath[i]];
                            }
                        }
                        return fieldValue;
                    }
                    return null;
                };
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
                gridOptions: this.lookupGridOptions,
                //Controls in the grid are not responsible for publishing dirty data.  The grid takes care of this.
                shouldPublishMarkDirty: false
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
            if (Utility.getModeId() === 'insert') {
                retVal = [this.item.$cacheID, this.editInfo.cell.field].join("_");
            }
            return retVal;
        },
        //summary:
        //  Retreives the selected value and applies it to the grid and grid store.
        getValue: function () {
            this.setCurrentItems();
            if (this.lookupOptions.returnObject) {
                // If the user clicks into the Lookup column but does not physically make a selection
                // then we still need to return the current value.
                return (this.widget.focusNode.item !== null) ?
                    this.widget.focusNode.item : this.widget.focusNode.value;
            }
            return this.widget.focusNode.value;
        }
	});
    return widget;
});