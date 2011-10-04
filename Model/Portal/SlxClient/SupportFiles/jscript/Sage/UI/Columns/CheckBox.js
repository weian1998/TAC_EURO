dojo.provide('Sage.UI.Columns.CheckBox');
dojo.require("dojox.grid.cells._base");
(function () {
    dojo.declare("Sage.UI.Columns.CheckBox", dojox.grid.cells.Cell, {
        //TODO - add interaction support
        format: function(inRowIndex, inItem){
			// summary:
			//      returns: html for a given grid cell
			if (inItem === null) { return this.defaultValue; }
		}
    });
})();