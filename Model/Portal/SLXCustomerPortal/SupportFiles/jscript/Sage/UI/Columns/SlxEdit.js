dojo.provide('Sage.UI.Columns.SlxEdit');
dojo.require("dojox.grid.cells._base");
(function () {
    var svc = Sage.Services.getService("RoleSecurityService");
    dojo.declare("Sage.UI.Columns.SlxEdit", dojox.grid.cells.Cell, {
        // Field: string
        //      The name of the field to be used as the entityid in the querystring
        field : '',
        // entityType: string
		//      The name of the entity.
		entityType : '',
        // cellValue: string
        //      The display value of the cell
        cellValue : '',
        // smartPart: string
        //      The name of the smartpart to load
        smartPart : '',
        // appliedSecurity: string
        //      The 'key' of the secured action the user must have in order to follow the link.
        //      If the user does not have access to the action specified, this field will contain only text.
        appliedSecurity : '',
		// dialogTitle: string
		//      Overrides the default title description if specified.
		dialogTitle : '',
        //
        //
        isCentered : true,
        dialogTop : 0,
        dialogLeft : 0,
        dialogHeight : 0,
        dialogWidth : 0,
        formObjectName : '',

        constructor: function(arguments) {
        if (!this.hidden) {
            if (arguments.appliedSecurity) {                
                    if (svc) {
                        this.hidden = !svc.hasAccess(arguments.appliedSecurity);
                    }
			    }
            }
        },

        format: function(inRowIndex, inItem){
			// summary:
			//      returns: html for a given grid cell
			if (inItem === null) { return this.defaultValue; }
            
            var cellDisplayText = this.cellValue;
            if (this.cellValue === "" && this.field != "") {
                cellDisplayText = Sage.Utility.getValue(inItem, this.field);
            }
            //need to have some default value
            if (this.cellValue === "" && cellDisplayText === "") {
                cellDisplayText = "Edit";
            }
            var entityId = Sage.Utility.getValue(inItem, '$key');               
            var obj = {
                entityType: this.entityType,
                smartPart: this.smartPart,
                entityId: entityId,
                dialogTitle: this.dialogTitle,
                isCentered: this.isCentered,
                dialogTop: this.dialogTop,
                dialogLeft: this.dialogLeft,
                dialogHeight: this.dialogHeight,
                dialogWidth: this.dialogWidth
            }
            //return String.format("<a href=javascript:Sage.Utility.loadDetailsDialog({0});>Edit</a>", Sys.Serialization.JavaScriptSerializer.serialize(obj));
            return String.format('<a href="{0}">{1}</a>', String.format("javascript:Sage.Utility.loadDetailsDialog( { entityType:'{0}', smartPart:'{1}', entityId:'{2}', dialogTitle:'{3}', isCentered:{4}, dialogTop:{5}, dialogLeft:{6}, dialogHeight:{7}, dialogWidth:{8} } );",
                this.entityType, this.smartPart, entityId, this.dialogTitle, this.isCentered, this.dialogTop, this.dialogLeft, this.dialogHeight, this.dialogWidth), cellDisplayText);
		}
    });
})();