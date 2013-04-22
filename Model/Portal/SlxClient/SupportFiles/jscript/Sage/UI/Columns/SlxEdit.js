/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/i18n!./nls/SlxEdit',
    'dojo/_base/declare'
],
function (resource, declare) {
    var widget = declare("Sage.UI.Columns.SlxEdit", dojox.grid.cells.Cell, {
        // Field: string
        //      The name of the field to be used as the entityid in the querystring
        field: '',
        // entityType: string
        //      The name of the entity.
        entityType: '',
        // cellValue: string
        //      The display value of the cell
        cellValue: '',
        // smartPart: string
        //      The name of the smartpart to load
        smartPart: '',
        // appliedSecurity: string
        //      The 'key' of the secured action the user must have in order to follow the link.
        //      If the user does not have access to the action specified, this field will contain only text.
        appliedSecurity: '',
        // dialogTitle: string
        //      Overrides the default title description if specified.
        dialogTitle: '',
        //
        //
        isCentered: true,
        dialogTop: 0,
        dialogLeft: 0,
        dialogHeight: 0,
        dialogWidth: 0,
        formObjectName: '',
        constructor: function () {
            dojo.mixin(this, resource);
            if (!this.hidden) {
                // From templates, this.appliedSecurity is set, but the code
                // originally checked arguments.appliedSecurity. Just a precaution
                if(!this.appliedSecurity && arguments.appliedSecurity) {
                    this.appliedSecurity = arguments.appliedSecurity;
                }
                if (this.appliedSecurity) {
                    var svc = Sage.Services.getService("RoleSecurityService");
                    if (svc) {
                        this.hidden = !svc.hasAccess(this.appliedSecurity);
                    }
                }
            }
            this.inherited(arguments);
        },
        format: function (inRowIndex, inItem) {
            // summary:
            //      returns: html for a given grid cell
            if (inItem === null) { return this.defaultValue; }
            var cellDisplayText = this.cellValue;
            if (this.cellValue === "" && this.field != "") {
                cellDisplayText = Sage.Utility.getValue(inItem, this.field);
            }
            //need to have some default value
            if (this.cellValue === "" && cellDisplayText === "") {
                cellDisplayText = this.editText;
            }
            var entityId = Sage.Utility.getValue(inItem, '$key');
            //if this is entity has a composite key we need to parse it so that the dialog service recognizes it
            if (entityId.match(/[=]/)) {
                entityId = entityId.match(/[=]\S{12}/g).join(',').replace(/=/g, "");
            }
            return String.format('<a href="{0}">{1}</a>', String.format("javascript:Sage.Utility.loadDetailsDialog( {{ entityType:'{0}', smartPart:'{1}', entityId:'{2}', dialogTitle:'{3}', isCentered:{4}, dialogTop:{5}, dialogLeft:{6}, dialogHeight:{7}, dialogWidth:{8} }} );",
                this.entityType, this.smartPart, entityId, this.dialogTitle, this.isCentered, this.dialogTop, this.dialogLeft, this.dialogHeight, this.dialogWidth),
                cellDisplayText);
        }
    });
    return widget;
});