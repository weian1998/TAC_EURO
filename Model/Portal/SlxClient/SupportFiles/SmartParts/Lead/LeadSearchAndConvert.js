Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.LeadSearchAndConvert = {
    workSpace: {},
    init: function (workSpace) {
        this.workSpace = workSpace;
    },
    onTargetWins: function () {
        $(".rdoTargetWins").attr('checked', true);
    },
    onSourceWins: function () {
        $(".rdoSourceWins").attr('checked', true);
    },
    onTabFiltersClick: function () {
        this.setDivDisplay(this.workSpace.divFiltersID, "inline");
        this.setDivDisplay(this.workSpace.divOptionsID, "none");

        this.setTabDisplay(this.workSpace.tabFiltersID, "tws-tab-button tws-active-tab-button");
        this.setTabDisplay(this.workSpace.tabOptionsID, "tws-tab-button");
    },
    onTabOptionsClick: function () {
        this.setDivDisplay(this.workSpace.divOptionsID, "inline");
        this.setDivDisplay(this.workSpace.divFiltersID, "none");

        this.setTabDisplay(this.workSpace.tabOptionsID, "tws-tab-button tws-active-tab-button");
        this.setTabDisplay(this.workSpace.tabFiltersID, "tws-tab-button");
    },
    setDivDisplay: function (divId, display) {
        var control = dojo.byId(divId);
        if (control) {
            control.style.display = display;
        }
    },
    setTabDisplay: function (tabId, displayClass) {
        var control = dojo.byId(tabId);
        if (control) {
            control.className = displayClass;
        }
    }
};
if (typeof Sys !== 'undefined') {
    Sys.Application.notifyScriptLoaded();
}