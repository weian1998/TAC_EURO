Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.MatchOptions = {
    _workSpace: {},
    init: function (workSpace) {
        this._workSpace = workSpace;
    },
    onUseFuzzyCheckedChanged: function () {
        var lbxFuzzyLevel = dojo.byId(this._workSpace.lbxFuzzyLevelId);
        var chkUseFuzzy = dojo.byId(this._workSpace.chkUseFuzzyId);
        if (chkUseFuzzy != null && lbxFuzzyLevel != null) {
            lbxFuzzyLevel.disabled = !chkUseFuzzy.checked;
        }
    },
    onDuplicateScoreChange: function () {
        var txtDupLow = dojo.byId(this._workSpace.txtDuplicate_LowId);
        var lblNoDupHigh = dojo.byId(this._workSpace.lblNoDuplicate_HighId);
        var lblPosDupHigh = dojo.byId(this._workSpace.lblPossibleDuplicate_HighId);
        var txtPosDupLow = dojo.byId(this._workSpace.txtPossibleDuplicate_LowId);
        if (txtDupLow != null && lblNoDupHigh != null && lblPosDupHigh != null && txtPosDupLow != null) {
            if (parseInt(txtDupLow.value) > 100) {
                txtDupLow.value = 100;
            }
            var lowVal = parseInt(txtDupLow.value) - 1;
            lblPosDupHigh.textContent = parseInt(lowVal);
            if (parseInt(txtPosDupLow.value) >= parseInt(txtDupLow.value)) {
                txtPosDupLow.value = lowVal - 1;
            }
            lblNoDupHigh.textContent = parseInt(txtPosDupLow.value) - 1;
        }
    },
    onDuplicatePossibleChange: function () {
        var posDupHigh = dojo.byId(this._workSpace.lblPossibleDuplicate_HighId);
        var txtPosDupLow = dojo.byId(this._workSpace.txtPossibleDuplicate_LowId);
        if (parseInt(txtPosDupLow.value) > parseInt(posDupHigh.textContent)) {
            var posDupLow = parseInt(txtPosDupLow.value) + 1;
            posDupHigh.textContent = posDupLow;
            var txtDupLow = dojo.byId(this._workSpace.txtDuplicate_LowId);
            txtDupLow.value = parseInt(posDupLow) + 1;
        }
        var noDup = dojo.byId(this._workSpace.lblNoDuplicate_HighId);
        noDup.textContent = parseInt(txtPosDupLow.value) - 1;
    }
};
if (typeof Sys !== 'undefined')
    Sys.Application.notifyScriptLoaded();