Sage.namespace("Sage.UI.Forms");
Sage.UI.Forms.ManageStages = {
    workSpace: {},
    init: function () {
        //this.workSpace = workSpace;
    },
    onCompleteStage: function (cmdCompleteCtrlId, stageContextCtrlId, stageContext) {
        var cmdCtrl = document.getElementById(cmdCompleteCtrlId);
        var stageContextCtrl = document.getElementById(stageContextCtrlId);
        stageContextCtrl.value = stageContext;
        this.invokeClickEvent(cmdCtrl);
    },
    onSetCurrent: function (cmdSetCurrentCtrlId, currentContextCtrlId, currentContext) {
        var cmdCtrl = document.getElementById(cmdSetCurrentCtrlId);
        var currentContextCtrl = document.getElementById(currentContextCtrlId);
        currentContextCtrl.value = currentContext;
        this.invokeClickEvent(cmdCtrl);
    },
    onCompleteStageWithDate: function (sender, cmdCompleteCtrlId, contextCtrlId, contextValue) {
        var cmdCtrl = document.getElementById(cmdCompleteCtrlId);
        var contextCtrl = document.getElementById(contextCtrlId);
        contextCtrl.value = contextValue + ':' + sender.value;
        this.invokeClickEvent(cmdCtrl);
    },
    onStartStageWithDate: function (sender, cmdStartCtrlId, contextCtrlId, contextValue) {
        var cmdCtrl = document.getElementById(cmdStartCtrlId);
        var contextCtrl = document.getElementById(contextCtrlId);
        contextCtrl.value = contextValue + ':' + sender.value;
        this.invokeClickEvent(cmdCtrl);
    },
    saveState: function (context) {
        if (Sage.Services) {
            // Get the client side service:
            var contextservice = Sage.Services.getService("ClientContextService");
            // Check for a value:
            if (contextservice.containsKey("STAGECHANGED")) {
                // set a value that currently exists:  
                contextservice.setValue("STAGECHANGED", context);
            } else {
                // add a new value:
                contextservice.add("STAGECHANGED", context);
            }
        }
    },
    invokeClickEvent: function (control) {
        if (document.createEvent) {
            // FireFox
            var e = document.createEvent("MouseEvents");
            e.initEvent("click", true, true);
            control.dispatchEvent(e);
        } else {
            // IE
            control.click();
        }
    }
};
if (typeof Sys !== 'undefined') {
    Sys.Application.notifyScriptLoaded();
}