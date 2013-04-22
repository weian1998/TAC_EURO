Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.ContactAssociations = {
    makeGrid: function (runtimeConfig) {
        require(['Sage/UI/EditableGrid',
            'Sage/UI/Columns/DateTime',
            'Sage/UI/Columns/SlxEdit',
            'Sage/Utility',
            'dojo/aspect'],
            function (editableGrid, dateTime, slxEdit, utility, aspect) {
                var parentId = utility.getCurrentEntityId();
                if (typeof ContactAssociationsResource === 'undefined') {
                    ContactAssociationsResource = {};
                }
                var contactCell = dojo.declare(dojox.grid.cells.Cell, {
                    // summary:
                    //  custom column used for display of history type (also acts as a link for edit)
                    format: function (inRowIndex, inItem) {
                        var fromid = utility.getValue(inItem, "FromId");
                        var toid = utility.getValue(inItem, "ToId");
                        var fromname = utility.getValue(inItem, "FromContact.NameLF");
                        var toname = utility.getValue(inItem, "ToContact.NameLF");
                        var contactId = fromid == parentId ? toid : fromid;
                        var contactName = fromid == parentId ? toname : fromname;

                        return dojo.string.substitute("<a href='Contact.aspx?entityid=${0}&modeid=Detail'>${1}</a>", [contactId, utility.htmlEncode(contactName)]);
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
                            name: ' ', field: 'Id', width: 5, type: slxEdit, cellValue: ContactAssociationsResource.ContactAssociationsGrid_Edit_Text,
                            entityType: 'Sage.Entity.Interfaces.IAssociation, Sage.Entity.Interfaces', smartPart: 'AddEditContactAssociation',
                            isCentered: true, dialogHeight: 290, dialogWidth: 600, formObjectName: 'Sage.UI.Forms.ContactAssociations'
                        },
                        { field: "FromContact.NameLF", name: ContactAssociationsResource.ContactAssociationsGrid_Name_HeaderText, width: 10, type: contactCell },
                        { field: "ForwardRelation", name: ContactAssociationsResource.ContactAssociationsGrid_Relation_HeaderText, width: 8, type: relationshipCell },
                        { field: "ForwardNotes", name: ContactAssociationsResource.ContactAssociationsGrid_Notes_HeaderText, width: 20, type: descriptionCell, formatter: Sage.Format.abbreviationFormatter(128) },
                        { field: "CreateDate", name: ContactAssociationsResource.ContactAssociationsGrid_Date_HeaderText, width: 10, type: dateTime, dateOnly: true }
                    ],
                    storeOptions: {
                        resourceKind: 'associations',
                        include: [],
                        select: ["FromId", "ToId", "ToContact.NameLF", "BackNotes", "BackRelation"],
                        dataCarrierId: 'ContactAssociationsgrdAssociations_DataCarrier',
                        sort: []
                    },
                    tools: [
                        {
                            id: 'Delete',
                            icon: '~/ImageResource.axd?scope=global&type=Global_Images&key=Delete_16x16',
                            'alternateText': ContactAssociationsResource.ContactAssociationsGrid_Delete_Text,
                            mergePosition: 'After',
                            mergeControlId: 'btnAddAssociation',
                            appliedSecurity: 'Entities/Contact/Edit',
                            'handler': function () { this.deleteSelected(); }
                        }
                    ],
                    contextualCondition: function () { return dojo.string.substitute("FromId eq '${0}' or ToId eq '${0}'", [parentId]); },
                    tabId: 'ContactAssociations',
                    gridNodeId: 'ContactAssociations_Grid',
                    id: 'ContactAssociationsgrdAssociations',
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