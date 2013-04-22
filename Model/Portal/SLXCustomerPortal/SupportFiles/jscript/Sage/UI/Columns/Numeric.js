/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Controls/Numeric',
    'dojox/grid/cells/dijit',
    'dojo/_base/declare'
],
function (controlsNumeric, dijitCell, declare) {
    var widget = declare("Sage.UI.Columns.Numeric", dojox.grid.cells._Widget, {
        widgetClass: controlsNumeric,
        isWholeNumberPercent: false,
        getWidgetProps: function (inDatum) {
            var controlId = this.getControlId();
            //Set the options for the currency config object
            return dojo.mixin({}, this.widgetProps || {}, {
                constraints: this.constraints,
                value: inDatum,
                width: this.width,
                maxLength: this.maxLength,
                style: this.style,
                hotKey: this.hotKey,
                tabIndex: this.tabIndex,
                field: this.field,
                //Using name for ClientId of .net controls.  
                //TODO: Validate that this does not conflict with the column type.
                name: this.name,
                sortable: this.sortable,
                editable: this.editable,
                required: this.required,
                formatType: this.formatType,
                textAlign: this.getAlignment()
            });
        },
        getAlignment: function () {
            var retVal = 'right';
            retVal = (this.cellClasses.indexOf('aligncenter') > -1) ? 'center' : retVal;
            retVal = (this.cellClasses.indexOf('alignleft') > -1) ? 'left' : retVal;
            return retVal;
        },
        formatNode: function (inNode, inDatum, inRowIndex) {
            if (!this.widgetClass) {
                return inDatum;
            }

            // Check to see if the instance for the selected node already exists
            // This check ensures that a unique control gets created for each cell.  
            // Normal grid controls are created one for the entire column.
            var thisCurrency = dijit.byId(this.getControlId());
            // If it doesn't, create one.
            if (!thisCurrency) {
                this.widget = this.createWidget.apply(this, arguments);
                // If it does, use the existing one.
            } else {
                this.widget = thisCurrency;
                //Check to see if the value has been changed outside of the control and update the control if it has.
                if (thisCurrency.value !== inDatum || this.widget.focusNode.value !== inDatum) {
                    this.widget.focusNode.attr('value', inDatum);
                }
                this.attachWidget.apply(this, arguments);
            }
            this.sizeWidget.apply(this, arguments);
            this.grid.views.renormalizeRow(inRowIndex);
            this.grid.scroller.rowHeightChanged(inRowIndex, true);
            this.focus();

            if (this.formatType == 'Percent') {
                // dijit percent gets formated onfocus, don't format it here (it expects a decimal when focus starts)
                this.widget.focusNode.constraints['type'] = 'percent'; // ensure widget has constraint set
                this.widget.focusNode.focus();
            }

            return undefined;
        },
        formatter: function (value, index) {
            var vals = [];
            //If the user entered 0 just return an empty string.
            if (value == 0 || value == null) {
                return '';
            }

            if (this.isWholeNumberPercent && this.formatType === 'Percent') {
                //Percentage fields store the decimal value, but we want to display the whole number.
                value = Math.round(value * 100) / 10000;
            }

            //Build up display string if formatstring was specified.  Most common case is a PickList used as a percent selector.
            if ((this.displayFormatString) && (this.displayFormatString !== '')) {
                if (this.displayFields.length < 1) {
                    vals.push[value];
                }
                for (var idx = 0; idx < this.displayFields.length; idx++) {
                    //Gather the items to be used in the format 
                    vals.push(Sage.Utility.getValue(this.grid._by_idx[index].item, this.displayFields[idx]));
                }
                value = Sage.Format.stringFromArray(this.displayFormatString, vals);
                return value;
            }

            //Format the value based on locale number formatting and constraints.
            if (this.formatType === 'Percent') {
                this.constraints['type'] = 'percent';
            }

            value = dojo.number.format(value, dojo.mixin(this.constraints, { locale: Sys.CultureInfo.CurrentCulture.name }));
            //dojo.number.format will include a trailing decimal delimiter if places == 0 and round == -1.
            //Assume the need to slice this trailing delimiter.
            if (this.constraints && this.constraints.places == 0 && this.constraints.round == -1
                && value.lastIndexOf(Sys.CultureInfo.CurrentCulture.numberFormat.NumberDecimalSeparator) > -1) {
                value = value.slice(0, value.length - 1);
            }

            if (this.abbreviationLength) {
                var abbreviationFormatter = Sage.Format.abbreviationFormatter(this.abbreviationLength);
                value = abbreviationFormatter(value);
            }
            return value;
        },
        styles: 'text-align: right;',
        setCurrentItems: function () {
            this.editInfo = this.grid.edit.info;
            this.item = this.grid.getItem(this.editInfo.rowIndex);
        },
        getControlId: function () {
            //summary:
            //  Generates an Id for this instance of the numbertextbox widget from the item key and cell field name
            //  Example XXXXXXX_Price
            this.setCurrentItems();
            return [this.item.$key, this.editInfo.cell.field, this.index].join("_");
        },
        getValue: function (index) {
            //  summary:
            //  Retreives the value from the widget and applies it to the grid.
            //  If there is a validation error in the cell, return the old value, else return the new value.
            var retVal = this.widget.focusNode.valueNode.value;
            if ((typeof retVal === 'undefined') || (retVal === '')) {
                retVal = 0;
            }

            if (this.widget && this.widget.state === "Error") {
                var item = this.grid.getItem(index);
                var oldValue = this.grid.store.getValue(item, this.grid.edit.info.cell.field);
                return oldValue;
            }

            return retVal;
        }
    });
    return widget;
});