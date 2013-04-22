Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.LeadSearchForDuplicates = {
    _workSpace: {},
    init: function (workSpace) {
        this._workSpace = workSpace;
    },
    onTabFiltersClick: function () {
        this.setDivDisplay(this._workSpace.divFiltersID, "inline");
        this.setDivDisplay(this._workSpace.divOptionsID, "none");

        this.setTabDisplay(this._workSpace.tabFiltersID, "tws-tab-button tws-active-tab-button");
        this.setTabDisplay(this._workSpace.tabOptionsID, "tws-tab-button");
    },
    onTabOptionsClick: function () {
        this.setDivDisplay(this._workSpace.divOptionsID, "inline");
        this.setDivDisplay(this._workSpace.divFiltersID, "none");

        this.setTabDisplay(this._workSpace.tabOptionsID, "tws-tab-button tws-active-tab-button");
        this.setTabDisplay(this._workSpace.tabFiltersID, "tws-tab-button");
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
    }
};
if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded(); ; ;