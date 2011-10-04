<script language="javascript" type="text/javascript">
   
 
 var cmdCloseCtrlId = "@cmdCloseCtrlId";
 var processStatusCrtlId = "@ProcessStatusCtrlId";
 
function ImportProgress_InvokeClickEvent(control)
{
   if (document.createEvent)
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
function OnUpdateProgress(progressArea, args)
{
    if (args.ProgressData.ProcessCompleted=="True")
    {
        var elementProcessStatusCtrl = document.getElementById(processStatusCrtlId);
        var elementCloseCtrl = document.getElementById(cmdCloseCtrlId);
        if ((elementCloseCtrl != null)&&(elementProcessStatusCtrl != null))
        {
             
             if(elementProcessStatusCtrl.value != "Completed")
             {
               elementProcessStatusCtrl.value = "Completed"
               ImportProgress_InvokeClickEvent(elementCloseCtrl);
               return false;
             }
            
        }       
    }
    return true;
}

 
</script>
