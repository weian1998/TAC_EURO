Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.ManageTargets = {
    _workSpace: {},
    init: function (workSpace) {
        this._workSpace = workSpace;
        var self = this;
        window.setTimeout(function () {
            var rdg = document.getElementsByName('ctl00$DialogWorkspace$ManageTargets$rdgIncludeType');
            if (rdg != null) {
                dojo.some(rdg, function (item, idx) {
                    if (item.checked == true) {
                        self.onSearchTypeChange(idx);
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
        }, 250);
    },
    onTabLookupTargetClick: function () {
        this.setDivDisplay(this._workSpace.mt_divLookupTargetsId, "inline");
        this.setDivDisplay(this._workSpace.mt_divAddFromGroupId, "none");

        this.setTabDisplay(this._workSpace.mt_tabLookupTargetId, "tws-tab-button tws-active-tab-button");
        this.setTabDisplay(this._workSpace.mt_tabAddFromGroupId, "tws-tab-button");
    },
    onTabAddFromGroupClick: function () {
        this.setDivDisplay(this._workSpace.mt_divAddFromGroupId, "inline");
        this.setDivDisplay(this._workSpace.mt_divLookupTargetsId, "none");

        this.setTabDisplay(this._workSpace.mt_tabAddFromGroupId, "tws-tab-button tws-active-tab-button");
        this.setTabDisplay(this._workSpace.mt_tabLookupTargetId, "tws-tab-button");
    },
    setDivDisplay: function (divId, display) {
        var control = dojo.byId(divId);
        if (control != null) {
            control.style.display = display;
        }
    },
    setTabDisplay: function (tabId, displayClass) {
        var control = dojo.byId(tabId);
        if (control != null) {
            control.className = displayClass;
        }
    },
    onSearchTypeChange: function (selectedIndex) {
        var pklStatus = dojo.byId(this._workSpace.mt_pklStatusId);
        if (pklStatus != null) {
            var statusList = dojo.byId(pklStatus.listId);
            if (statusList != null) {
                //clear existing items
                statusList.length = 0;
                if (selectedIndex == 0)
                    pklStatus.PickListName = "Lead Status";
                else if (selectedIndex == 3)
                    pklStatus.PickListName = "Contact Status";
                else
                    pklStatus.PickListName = "Account Status";
            }
        }
        var control = dojo.byId(this._workSpace.mt_chkProductsId);
        if (control != null) {
            if (control.checked && (selectedIndex == 0)) {
                control.checked = false;
            }
            control.disabled = (selectedIndex == 0);
        }
        this.disableEnableControl(this._workSpace.mt_lbxProductsId, selectedIndex == 0);
        this.changeEnableLookup(this._workSpace.mt_lueProductsPrimaryId, (selectedIndex != 0));

        control = dojo.byId(this._workSpace.mt_chkLeadSourceId);
        if (control != null) {
            if (control.checked && (selectedIndex == 3)) {
                    control.checked = false;
            }
            control.disabled = (selectedIndex == 3);
        }
        this.disableEnableControl(this._workSpace.mt_lbxLeadSourceId, selectedIndex == 3);
        this.changeEnableLookup(this._workSpace.mt_lueLeadSourcePrimaryId, selectedIndex != 3);
    },
    disableEnableControl: function (id, disabled) {
        var control = dijit.byId(id);
        if (control != null) {
            control.set('disabled', disabled);
        }
    },
    clearFilters: function () {
        this.clearLookup(this._workSpace.mt_lueProductsPrimaryId);
        this.clearLookup(this._workSpace.mt_lueLeadSourcePrimaryId);
        var control = dojo.byId(this._workSpace.mt_chkCompanyId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxCompanyId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_txtCompanyId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkIndustryId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxIndustryId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_pklIndustryId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkSICId);
        if (control != null) {
            control.checked = "";
        }
        control = dijit.byId(this._workSpace.mt_lbxSICId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_txtSICId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkTitleId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxTitleId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_pklTitleId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkProductsId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxProductsId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_chkStatusId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxStatusId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_pklStatusId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkSolicitId);
        if (control != null) {
            control.checked = false;
        }
        control = dojo.byId(this._workSpace.mt_chkEmailId);
        if (control != null) {
            control.checked = false;
        }
        control = dojo.byId(this._workSpace.mt_chkCallId);
        if (control != null) {
            control.checked = false;
        }
        control = dojo.byId(this._workSpace.mt_chkMailId);
        if (control != null) {
            control.checked = false;
        }
        control = dojo.byId(this._workSpace.mt_chkFaxId);
        if (control != null) {
            control.checked = false;
        }
        control = dojo.byId(this._workSpace.mt_chkCityId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxCityId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_txtCityId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkStateId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxStateId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_txtStateId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkZipId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxZipId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_txtZipId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkLeadSourceId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxLeadSourceId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_chkImportSourceId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_lbxImportSourceId);
        if ((control != null) && (control.options)) {
            control.attr('value', control.options[0].value);
        }
        control = dojo.byId(this._workSpace.mt_pklImportSourceId);
        if (control != null) {
            control.value = "";
        }
        control = dojo.byId(this._workSpace.mt_chkCreateDateId);
        if (control != null) {
            control.checked = false;
        }
        control = dijit.byId(this._workSpace.mt_dtpFromDateId);
        if (control != null) {
            control.set('value', new Date());
        }
        control = dijit.byId(this._workSpace.mt_dtpToDateId);
        if (control != null) {
            control.set('value', new Date());
        }
    },
    onUpdateProgress: function (progressArea, args) {
        if (args.ProgressData.ProcessCompleted == "True") {
            if (_IsCompleted) {
                return false;
            }
            _IsCompleted = true;
            return false;
        }
    },
    changeEnableLookup: function (id, enabled) {
        var input = dijit.byId(id + '_LookupText');
        if (input != null) {
            input.set('disabled', !enabled);
        }
        var btn = dojo.byId(id + '_LookupBtn');
        if (btn != null) {
            btn.style.display = (enabled == true) ? 'inline' : 'none';
        }
    },
    clearLookup: function (id) {
        var input = dijit.byId(id + '_LookupText');
        if (input != null) {
            input.set('value', '');
        }
        input = dojo.byId(id + '_LookupResult');
        if (input != null) {
            input.value = '';
        }
    }
};
if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();