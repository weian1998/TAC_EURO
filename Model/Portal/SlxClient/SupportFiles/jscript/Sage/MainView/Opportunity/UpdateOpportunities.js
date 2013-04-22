/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/i18n!./nls/UpdateOpportunities',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',
        'dijit/Dialog',
        'dijit/_Widget',
        'Sage/_Templated',
        'Sage/UI/Dialogs',
        'Sage/UI/Controls/Lookup',
        'dojo/text!./templates/UpdateOpportunities.html',
        'Sage/UI/Controls/SingleSelectPickList',
        'Sage/UI/Controls/DateTimePicker',
        'dijit/form/Form',
        'dijit/form/Select',
        'dijit/form/Textarea',
        'dijit/layout/ContentPane',
        'dojox/layout/TableContainer'
],
function (declare, i18nStrings, _DialogHelpIconMixin, dojoLang, dijitDialog, _Widget, _Templated, Dialogs, Lookup, template) {
    var updateOpportunities = declare('Sage.MainView.Opportunity.UpdateOpportunities', [_Widget, _Templated], {
        id: "dlgUpdateMultipleOpps",
        _dialog: false,
        _updateableProperties: false,
        selectedFieldIndex: 1,
        lup_AcctMgr: false,
        _selectionInfo: false,
        widgetsInTemplate: true,
        widgetTemplate: new Simplate(eval(template)),
        constructor: function (selectionInfo) {
            this._selectionInfo = selectionInfo;
            dojo.mixin(this, i18nStrings);
            if (!this._updateableProperties) {
                this._updateableProperties = [{ propertyName: '', propertyDisplayName: ''}];
                this.loadUpdateableProperties('AcctMgr', this.updateProp_AcctMgr);
                this.loadUpdateableProperties('Forecast', this.updateProp_Forecast);
                this.loadUpdateableProperties('CloseProb', this.updateProp_Probability);
                this.loadUpdateableProperties('EstClose', this.updateProp_EstClose);
                this.loadUpdateableProperties('Comments', this.updateProp_Comments);
            }
        },
        loadUpdateableProperties: function (propertyName, propertyDisplayName) {
            var property = {
                propertyName: propertyName,
                propertyDisplayName: propertyDisplayName
            };
            this._updateableProperties.push(property);
        },
        setSelectionInfo: function (selectionInfo) {
            this._selectionInfo = selectionInfo;
        },
        show: function () {
            this._dialog.show();
            if (!this.lup_AcctMgr) {
                this.createAcctMgrLookup();
            }
            this._propertyChanged();
            if (!this._dialog.helpIcon) {
                dojoLang.mixin(this._dialog, new _DialogHelpIconMixin());
                this._dialog.createHelpIconByTopic('updateopportunities');
            }
        },
        _propertyChanged: function () {
            if (this.propertyNameSelect) {
                this.setDisplayProperty(this.divAcctMgrContainer, (this.propertyNameSelect.value == "AcctMgr"));
                this.setDisplayProperty(this.divCloseProbContainer, (this.propertyNameSelect.value == "CloseProb"));
                this.setDisplayProperty(this.divCommentsContainer, (this.propertyNameSelect.value == "Comments"));
                this.setDomDisplayProperty(this.divForecastContainer, (this.propertyNameSelect.value == "Forecast"));
                this.setDisplayProperty(this.divUpdateOppsTolbl, (this.propertyNameSelect.value != "EstClose"));
                this.setDomDisplayProperty(this.divEstCloseContainer, (this.propertyNameSelect.value == "EstClose"));
            }
            this.estimatedCloseDateChange();
        },
        setDisplayProperty: function (property, display) {
            if (property && display) {
                dojo.removeClass(property, "display-none");
            }
            else if (property) {
                dojo.addClass(property, "display-none");
            }
        },
        setDomDisplayProperty: function (property, display) {
            if (property && display) {
                dojo.removeClass(property.domNode, "display-none");
            }
            else if (property) {
                dojo.addClass(property.domNode, "display-none");
            }
        },
        estimatedCloseDateChange: function () {
            var closeOption = this.rdoEstClose.get('checked');
            if (this.propertyNameSelect) {
                this.setDisplayProperty(this.divEstCloseDateContainer, (closeOption && this.propertyNameSelect.value == "EstClose"));
                this.setDisplayProperty(this.divMoveEstimatedCloseContainer, (!closeOption && this.propertyNameSelect.value == "EstClose"));
            }
        },
        createAcctMgrLookup: function () {
            this.accountMgrLookupConfig = {
                id: '_acctMgr',
                structure: [
                    {
                        defaultCell: {
                            "sortable": true,
                            "width": "150px",
                            "editable": false,
                            "propertyType": "System.String",
                            "excludeFromFilters": false,
                            "useAsResult": false,
                            "pickListName": null,
                            "defaultValue": ""
                        },
                        cells: [
                            {
                                "name": this.lookupNameColText,
                                "field": "UserInfo.UserName"
                            }, {
                                "name": this.lookupTitleColText,
                                "field": "UserInfo.Title"
                            }, {
                                "name": this.lookupDepartmentColText,
                                "field": "UserInfo.Department"
                            }, {
                                "name": this.lookupRegionColText,
                                "field": "UserInfo.Region"
                            }, {
                                "name": this.lookupTypeColText,
                                "field": "Type",
                                "propertyType": "Sage.Entity.Interfaces.UserType"
                            }
                        ]
                    }
                ],
                gridOptions: {
                    contextualCondition: '',
                    contextualShow: '',
                    selectionMode: 'single'
                },
                storeOptions: { resourceKind: 'users' },
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
                dialogButtonText: this.btnOK_Caption
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
                        { "name": "EntityName", "value": "Opportunity" },
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
                    Dialogs.showError(dojo.string.substitute(self.errorRequestingJobMgr, [result.statusText]));
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
                    case 'CloseProb':
                        return { name: 'CloseProbability', value: this.pkl_CloseProbability.get('value') };
                    case 'Forecast':
                        return { name: 'AddToForecast', value: this.rdoYesForecast.get('checked') };
                    case 'EstClose':
                        if (this.rdoEstClose.get('checked')) {
                            return { name: 'EstimatedClose', value: this.dtpEstCloseDate.get('value') };
                        }
                        else {
                            var date = new Date();
                            if (this.moveEstCloseDateList.value == "Forward") {
                                return { name: 'EstimatedClose', value: new Date().setDate(date.getDate() + this.daysToMove.value) };
                            }
                            else {
                                return { name: 'EstimatedClose', value: new Date().setDate(date.getDate() - this.daysToMove.value) };
                            }
                        }
                    case 'Comments':
                        return { name: 'Notes', value: this.txtComments.value };
                }
            }
            return false;
        },
        _close: function () {
            this._dialog.hide();
        }
    });
    return updateOpportunities;
});