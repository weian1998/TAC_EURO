/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/i18n!./nls/UpdateLeads',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',
        'dijit/Dialog',
        'dijit/_Widget',
        'Sage/_Templated',
        'Sage/UI/Dialogs',
        'Sage/UI/Controls/Lookup',
        'dijit/form/Form',
        'dijit/form/Select',
        'dijit/form/Textarea',
        'dijit/layout/ContentPane',
        'dojox/layout/TableContainer',
        'dojo/i18n!./nls/UpdateLeads'
],
function (declare, i18nStrings, _DialogHelpIconMixin, dojoLang, dijitDialog, _Widget, _Templated, Dialogs, Lookup) {
    var updateLeads = declare('Sage.MainView.Lead.UpdateLeads', [_Widget, _Templated], {
        id: "dlgUpdateMultipleLeads",
        _dialog: false,
        _selectionInfo: false,
        _updateableProperties: false,
        selectedFieldIndex: 1,
        lup_Owner: false,
        lup_AcctMgr: false,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div>',
                '<div data-dojo-type="dijit.Dialog" title="{%= $.updateMultipleLeads_Caption %}" dojoAttachPoint="_dialog" dojoAttachEvent="onCancel:_close">',
                    '<div data-dojo-type="dijit.form.Form" id="{%= $.id %}_frmUpdateMultipleLeads">',
                        '<table cellspacing="20">',
                            '<tr>',
                                '<td>',
                                    '<label>{%= $.update_Property_Caption %}</label>',
                                '</td>',
                                '<td>',
                                    '<select title="{%= $.update_Property_Caption %}" labelWidth="20" name="{%= $.id %}_PropertyName" dojoAttachPoint="propertyNameSelect" dojoAttachEvent="onChange:_propertyChanged" data-dojo-type="dijit.form.Select" style="width:150px">',
                                        '{% for (var i=0; i < $._updateableProperties.length;i++) { %}',
                                            '<option value="{%= $._updateableProperties[i].propertyName %}" {% if ($.selectedFieldIndex == i ) { %} selected {% } %} >{%= $._updateableProperties[i].propertyDisplayName %}</option>',
                                        '{% } %}',
                                    '</select>',
                                '</td>',
                                '<td>',
                                    '<div id="divUpdateLeadsTolbl" dojoAttachPoint="divUpdateLeadsTolbl">',
                                        '<label>{%= $.update_To_Caption %}</label>',
                                    '</div>',
                                '</td>',
                                '<td>',
                                    '<div dojoAttachPoint="divOwnerContainer" baseClass="lookup-container">',
                                        '<div data-dojo-type="dijit.layout.ContentPane" label="{%= $.lookupOwnerText %}" dojoAttachPoint="assignOwner_Container" class="removePadding"></div>',
                                    '</div>',
                                    '<div dojoAttachPoint="divAcctMgrContainer" baseClass="lookup-container" class="display-none">',
                                        '<div data-dojo-type="dijit.layout.ContentPane" label="{%= $.update_To_Caption %}" id="{%= $.id %}_luAccountMgr" dojoAttachPoint="accountMgr_Container" allowClearingResult="false" class="removePadding"></div>',
                                    '</div>',
                                '</td>',
                            '</tr>',
                        '</table>',
                        '<div class="button-bar" align="right">',
                            '<div data-dojo-type="dijit.form.Button" id="{%= $.id%}_btn_OK" name="btn_OK" dojoAttachPoint="btn_OK" dojoAttachEvent="onClick:_okClick">{%= $.ok_Text %}</div>',
                            '<div data-dojo-type="dijit.form.Button" id="{%= $.id%}_btn_Cancel" name="btn_Cancel" dojoAttachPoint="btn_Cancel" dojoAttachEvent="onClick:_close">{%= $.btnCancel_Caption %}</div>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ]),
        constructor: function (selectionInfo) {
            this._selectionInfo = selectionInfo;
            dojo.mixin(this, i18nStrings);
            if (!this._updateableProperties) {
                this._updateableProperties = [{ propertyName: '', propertyDisplayName: ''}];
                this.loadUpdateableProperties('Owner', this.updateProp_Owner);
                this.loadUpdateableProperties('AcctMgr', this.updateProp_AcctMgr);
            }
        },
        loadUpdateableProperties: function (propertyName, propertyDisplayName) {
            var property = {
                propertyName: propertyName,
                propertyDisplayName: propertyDisplayName
            };
            this._updateableProperties.push(property);
        },
        show: function () {
            if (!this.lup_Owner) {
                this.createOwnerLookup();
            }
            if (!this.lup_AcctMgr) {
                this.createAcctMgrLookup();
            }
            this._dialog.show();
            if (!this._dialog.helpIcon) {
                dojoLang.mixin(this._dialog, new _DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic('updateleads');
            }
        },
        _propertyChanged: function () {
            if (this.propertyNameSelect) {
                this.setDisplayProperty(this.divAcctMgrContainer, (this.propertyNameSelect.value == "AcctMgr"));
                this.setDisplayProperty(this.divOwnerContainer, (this.propertyNameSelect.value == "Owner"));
            }
        },
        setDisplayProperty: function (property, display) {
            if (property && display) {
                dojo.removeClass(property, "display-none");
            }
            else if (property) {
                dojo.addClass(property, "display-none");
            }
        },
        createOwnerLookup: function () {
            this.assignOwnerLookupConfig = {
                id: '_assignOwner',
                structure: [
                    {
                        defaultCell: {
                            sortable: true,
                            width: '150px',
                            editable: false,
                            styles: 'text-align: left;',
                            propertyType: 'System.String',
                            excludeFromFilters: false,
                            useAsResult: false,
                            pickListName: null,
                            defaultValue: ''
                        },
                        cells: [
                            {
                                name: this.lookupDescriptionColText,
                                field: 'Description'
                            }, {
                                name: this.lookupTypeColText,
                                field: 'Type',
                                PropertyType: 'Sage.Entity.Interfaces.OwnerType'
                            }
                        ]
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: { resourceKind: 'ownerViews', sort: [{ attribute: "Description"}] },
                isModal: true,
                initialLookup: true,
                preFilters: [],
                returnPrimaryKey: true,
                dialogTitle: this.lookupOwnerText,
                dialogButtonText: this.ok_Text
            };
            this.lup_Owner = new Lookup({
                id: 'lu_AssignOwner',
                config: this.assignOwnerLookupConfig,
                style: 'width:100%'
            });
            dojo.place(this.lup_Owner.domNode, this.assignOwner_Container.domNode, 'only');
        },
        createAcctMgrLookup: function () {
            this.accountMgrLookupConfig = {
                id: '_acctMgr',
                structure: [
                    {
                        defaultCell: {
                            sortable: true,
                            width: '150px',
                            editable: false,
                            styles: 'text-align: left;',
                            propertyType: 'System.String',
                            excludeFromFilters: false,
                            useAsResult: false,
                            pickListName: null,
                            defaultValue: ''
                        },
                        cells: [
                            {
                                name: this.lookupNameColText,
                                field: 'UserInfo.UserName'
                            }, {
                                name: this.lookupTitleColText,
                                field: 'UserInfo.Title'
                            }, {
                                name: this.lookupDepartmentColText,
                                field: 'UserInfo.Department'
                            }, {
                                name: this.lookupRegionColText,
                                field: 'UserInfo.Region'
                            }, {
                                name: this.lookupTypeColText,
                                field: 'Type',
                                propertyType: 'Sage.Entity.Interfaces.UserType'
                            }
                        ]
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: { resourceKind: 'users', sort: [{ attribute: "UserInfo.UserName"}] },
                isModal: true,
                initialLookup: true,
                preFilters: [
                    {
                        propertyName: 'type',
                        propertyType: 'Sage.Entity.Interfaces.UserType',
                        conditionOperator: '!=',
                        filterValue: '5'
                    },
                    {
                        propertyName: 'type',
                        propertyType: 'Sage.Entity.Interfaces.UserType',
                        conditionOperator: '!=',
                        filterValue: '6'
                    },
                    {
                        propertyName: 'type',
                        propertyType: 'Sage.Entity.Interfaces.UserType',
                        conditionOperator: '!=',
                        filterValue: '7'
                    },
                    {
                        propertyName: 'type',
                        propertyType: 'Sage.Entity.Interfaces.UserType',
                        conditionOperator: '!=',
                        filterValue: '8'
                    }
                ],
                returnPrimaryKey: true,
                dialogTitle: this.lookupActMgrText,
                dialogButtonText: this.okText
            };
            this.lup_AcctMgr = new Lookup({
                id: 'lu_AcctMgr',
                config: this.accountMgrLookupConfig,
                style: 'width:100%'
            });
            dojo.place(this.lup_AcctMgr.domNode, this.accountMgr_Container.domNode, 'only');
        },
        _okClick: function () {
            var property = this.getPropertySelectionValue();
            var self = this;
            if (!property && !property.value) {
                Dialogs.showError(this.errorUnspecifiedValue);
                return;
            }
            var service = Sage.Data.SDataServiceRegistry.getSDataService('scheduling');
            var request = new Sage.SData.Client.SDataServiceOperationRequest(service)
                .setApplicationName('$app')
                .setOperationName('trigger')
                .setResourceKind("jobs('Sage.SalesLogix.BusinessRules.Jobs.UpdateEntityJob')");
            var entry = {
                "$name": "Sage.SalesLogix.BusinessRules.Jobs.UpdateEntityJob",
                "request": {
                    "parameters": [
                        { "name": "EntityName", "value": "Lead" },
                        { "name": "PropertyNames", "value": property.name },
                        { "name": "PropertyValues", "value": property.value },
                        { "name": "SelectedIds", "value": (this._selectionInfo.selectionCount > 0) ? this._selectionInfo.selectedIds.join(',') || '' : '' },
                        { "name": "GroupId", "value": (this._selectionInfo.selectionCount == 0) ? this.getCurrentGroupId() || '' : '' }
                    ]
                }
            };
            request.execute(entry, {
                success: function (result) {
                    self._close();
                },
                failure: function (result) {
                    Dialogs.showError(this.errorRequestingJobMgr);
                }
            });
        },
        getCurrentGroupId: function () {
            var grpContextSvc = Sage.Services.getService('ClientGroupContext');
            if (grpContextSvc) {
                var contextService = grpContextSvc.getContext();
                return contextService.CurrentGroupID;
            }
            return '';
        },
        getPropertySelectionValue: function () {
            if (this.propertyNameSelect) {
                switch (this.propertyNameSelect.value) {
                    case 'AcctMgr':
                        if (this.lup_AcctMgr.selectedObject) {
                            return { name: 'AccountManager', value: this.lup_AcctMgr.selectedObject.$key };
                        }
                        return false;
                    case 'Owner':
                        if (this.lup_Owner.selectedObject) {
                            return { name: 'Owner', value: this.lup_Owner.selectedObject.$key };
                        }
                        return false;
                }
            }
            return false;
        },
        _close: function () {
            this._dialog.hide();
        }
    });
    return updateLeads;
});