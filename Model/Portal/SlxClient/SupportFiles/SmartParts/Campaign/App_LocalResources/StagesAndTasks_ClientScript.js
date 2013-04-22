<script type="text/javascript" language="Javascript" id="MANAGESTAGESCRIPT" >
<!--

function onCompleteStage(cmdCompleteCtrlId, stageContextCtrlId, stageContext)
{
    var cmdCtrl = dojo.byId(cmdCompleteCtrlId);
    var stageContextCtrl = dojo.byId(stageContextCtrlId);
    stageContextCtrl.value = stageContext;
    spm_InvokeClickEvent(cmdCtrl);
}

function onSetCurrent(cmdSetCurrentCtrlId, currentContextCtrlId, currentContext)
{
    var cmdCtrl = dojo.byId(cmdSetCurrentCtrlId);
    var currentContextCtrl = dojo.byId(currentContextCtrlId);
    currentContextCtrl.value = currentContext;
    spm_InvokeClickEvent(cmdCtrl);
}

function onCompleteStageWithDate(sender, cmdCompleteCtrlId, contextCtrlId, contextValue)
{
    var cmdCtrl = dojo.byId(cmdCompleteCtrlId);
    var contextCtrl = dojo.byId(contextCtrlId);
    contextCtrl.value = contextValue + ':' + sender.value;
    spm_InvokeClickEvent(cmdCtrl);
}

function onStartStageWithDate(sender, cmdStartCtrlId, contextCtrlId, contextValue)
{
    var cmdCtrl = dojo.byId(cmdStartCtrlId);
    var contextCtrl = dojo.byId(contextCtrlId);
    contextCtrl.value = contextValue + ':' + sender.value;
    spm_InvokeClickEvent(cmdCtrl);
}

function spm_InvokeClickEvent(control)
{
    if (dojo.isFF)
    {
        // FireFox
        var e = document.createEvent("MouseEvents");
        e.initEvent("click", true, true);
        control.dispatchEvent(e);
    }
    else
    {
        // IE
        control.click();
    }
}

function saveState(context)
{
   if (Sage.Services)
     { 
         // Get the client side service:
         var contextservice = Sage.Services.getService("ClientContextService");
         // Check for a value:
         if (contextservice.containsKey("STAGECHANGED"))
         {
             // set a value that currently exists:  
             contextservice.setValue("STAGECHANGED", context);
         } 
         else
         {
             // add a new value:
             contextservice.add("STAGECHANGED", context);
         }
     }
}
-->
</script>