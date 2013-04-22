Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.AccountAssociations = {
    makeGrid: function (runtimeConfig) {
        require(['Sage/UI/EditableGrid',
            'Sage/UI/Columns/DateTime',
            'Sage/UI/Columns/SlxUser',
            'Sage/UI/Columns/SlxEdit',
            'Sage/Utility',
            'dojo/aspect'],
            function (editableGrid, dateTime, slxUser, slxEdit, utility, aspect) {
                var parentId = utility.getCurrentEntityId();
                if (typeof AccountAssociationsResource === 'undefined') {
                    AccountAssociationsResource = {};
                }
                
                var accountCell = dojo.declare(dojox.grid.cells.Cell, {
                    // summary:
                    //  custom column used for display of history type (also acts as a link for edit)
                    format: function (inRowIndex, inItem) {
                        var fromid = utility.getValue(inItem, "FromId");
                        var toid = utility.getValue(inItem, "ToId");
                        var fromname = utility.getValue(inItem, "FromAccount.AccountName");
                        var toname = utility.getValue(inItem, "ToAccount.AccountName");
                        var accountId = fromid == parentId ? toid : fromid;
                        var accountName = fromid == parentId ? toname : fromname;
                        return dojo.string.substitute("<a href='Account.aspx?entityid=${0}'>${1}</a>", [accountId, utility.htmlEncode(accountName)]);
                    }
                });

                var relationshipCell = dojo.declare(dojox.grid.cells.Cell, {
                    // summary:
                    //  custom column used for display of history type (also acts as a link for edit)
                    format: function (inRowIndex, inItem) {
                        var fromId = utility.getValue(inItem, "FromId");
                        var relation;
                        if (fromId == parentId) {
                            relation = utility.getValue(inItem, "BackRelation");
                        }
                        else {
                            relation = utility.getValue(inItem, "ForwardRelation");
                        }
                        return relation;
                    }
                });

                var descriptionCell = dojo.declare(dojox.grid.cells.Cell, {
                    // summary:
                    //  custom column used for display of history type (also acts as a link for edit)
                    format: function (inRowIndex, inItem) {
                        var fromId = utility.getValue(inItem, "FromId");
                        var notes;
                        if (fromId == parentId) {
                            notes = utility.getValue(inItem, "BackNotes");
                        }
                        else {
                            notes = utility.getValue(inItem, "ForwardNotes");
                        }
                        return notes;
                    }
                });

                var options = {
                    context: runtimeConfig,
                    readOnly: false,
                    columns: [
                        {
                            name: ' ', field: 'Id', width: 5, type: slxEdit, cellValue: AccountAssociationsResource.AccountAssociationsGrid_Edit_Text,
                            entityType: 'Sage.Entity.Interfaces.IAssociation, Sage.Entity.Interfaces', smartPart: 'AddEditAccountAssociation',
                            isCentered: true, dialogHeight: 320, dialogWidth: 600, formObjectName: 'Sage.UI.Forms.AccountAssociations'
                        },
                        { field: "FromAccount.AccountName", name: AccountAssociationsResource.AccountAssociationsGrid_Name_HeaderText, width: 10, type: accountCell },
                        { field: "ForwardRelation", name: AccountAssociationsResource.AccountAssociationsGrid_Relation_HeaderText, width: 8, type: relationshipCell },
                        { field: "ForwardNotes", name: AccountAssociationsResource.AccountAssociationsGrid_Notes_HeaderText, width: 20, type: descriptionCell, formatter: Sage.Format.abbreviationFormatter(128) },
                        { field: "CreateUser", name: AccountAssociationsResource.AccountAssociationsGrid_CreatedBy_HeaderText, width: 10, type: slxUser },
                        { field: "CreateDate", name: AccountAssociationsResource.AccountAssociationsGrid_Date_HeaderText, width: 10, type: dateTime, dateOnly: true }
                    ],
                    storeOptions: {
                        resourceKind: 'associations',
                        include: [],
                        select: ["FromId", "ToId", "ToAccount.AccountName", "BackNotes", "BackRelation", "IsAccountAssociation"],
                        dataCarrierId: 'AccountAssociationsgrdAssociations_DataCarrier',
                        sort: []
                    },
                    tools: [
                        {
                            id: 'Delete',
                            icon: '~/ImageResource.axd?scope=global&type=Global_Images&key=Delete_16x16',
                            'alternateText': AccountAssociationsResource.AccountAssociationsGrid_Delete_Text,
                            mergeControlId: 'btnAddAssociation', mergePosition: 'After',
                            appliedSecurity: 'Entities/Account/Edit',
                            'handler': function () { this.deleteSelected(); }
                        }
                    ],
                    contextualCondition: function () { return dojo.string.substitute("FromId eq '${0}' or ToId eq '${0}'", [parentId]); },
                    tabId: 'AccountAssociations',
                    gridNodeId: 'AccountAssociations_Grid',
                    id: 'AccountAssociationsgrdAssociations',
                    rowsPerPage: 20,
                    singleClickEdit: false
                };

                var grid = new editableGrid(options);
                var container = dijit.byId(grid.gridNodeId);
                container.addChild(grid);
                window.setTimeout(function () { grid.startup(); }, 1);
                aspect.after(grid, 'startup', function () {
                    // This is not a typo.  The dijit.layout.ContentPane is not affectively determining all of it's layout information
                    // on the first pass through resize.  Calling resize twice effectively renders the grid to fill it's container.
                    var localTc = dijit.byId('tabContent');
                    localTc.resize(); localTc.resize();
                });
            });
    },
    init: function (runtimeConfig) {
        var self = this;
        setTimeout(function () { self.makeGrid(runtimeConfig); }, 1);
    }
};
if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();