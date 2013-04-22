Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.UpdateTargets = {
    _workSpace: {},
    init: function (workSpace) {
        this._workSpace = workSpace;
    },
    optionChange: function (ddlOptions) {
        this.setOption(dojo.byId(ddlOptions).value);
    },
    setOption: function (option) {
        this.showControl(dojo.byId(this._workSpace.optionStatusId), (option === "Status"));
        this.showControl(dojo.byId(this._workSpace.optionStageId), (option === "Stage"));
        this.showControl(dojo.byId(this._workSpace.optionInitializeTargetId), (option === "Initial Target"));
        this.showControl(dojo.byId(this._workSpace.optionAddResponseId), (option === "Add Response"));
    },
    showControl: function (ctrlId, show) {
        var ctrl = dojo.byId(ctrlId);
        if (ctrl != null) {
            if (show) {
                ctrl.style.display = 'block';
            } else {
                ctrl.style.display = 'none';
            }
        }
    }
};
if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();