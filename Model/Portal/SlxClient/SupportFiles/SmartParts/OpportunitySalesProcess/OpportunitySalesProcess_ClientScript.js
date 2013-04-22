dojo.require("dojox.widget.Standby");
dojo.require("Sage.UI.Dialogs");

var currentCompleteCheckboxCtrl = null;
var luUserEventSubscribed = false;
var luOppContactEventSubscribed = false;
var currentProcessAction = null;
var salesProcessStandby = false;

var OppSPMessages;

function salesProcessPageLoad() {
    luOppContactEventSubscribed = false;
    luUserEventSubscribed = false;
}

function ProcessAction(stepId, actionType) {
    this.state = 0;
    this.stepId = stepId;
    this.xml = null;
    this.actionType = actionType;
    this.primaryContactId = null;
    this.selectedContactId = null;
    this.selectedUserId = null;
    this.selectWithOption = '';
    this.selectForOption = '';
    this.selectForValue = '';
    this.selectUserDesc = 'Schedule for user:';
    this.selectContactDesc = 'Schedule with contact:';
    this.autoSchedule = false;
    this.IsInit = false;
}

function ProcessAction_Execute() {
    sp_ShowProcessView();
    var action = this;
    if ((this.xml == null) && (this.state == 0)) {
        this.LoadXML(function(result){
                
             if (result == null) {
               action.WebServiceErrorHandler(result);
               return;
             }
             action.WebServiceHandler(result);
             action.Execute(); 
       });
        
        return;
    }
   
    if ((this.selectedContactId == null) && (this.state == 1)) {
        this.ResolveContact();
    }

    if ((this.selectedUserId == null) && (this.state == 2)) {
        this.ResolveUser();
    }

    if ((this.IsInit == true) && (this.state == 3)) {
        this.DoAction();
    }
   
}

function ProcessAction_Init() {
    //Default 
    this.selectWithOption = 'PRIMARYOPPCONTACT';
    this.selectForOption = 'CURRENTUSER';
    this.selectForValue = null;
    this.IsInit = true;
}

function ProcessAction_DoAction() {
    if (this.IsInit == true) {
        this.ShowMessage(OppSPMessages.ProcessingAction);
        //By Default we will post back for server side processing
        var cmdCtrl = document.getElementById(spCtrlIDs.cmdDoActionCtrlId);
        var actionContextCtrl = document.getElementById(spCtrlIDs.actionContextCtrlId);
        actionContextCtrl.value = this.stepId;
        sp_InvokeClickEvent(cmdCtrl);
    } 
}

function ProcessAction_LoadXML(callback) {
    this.ShowStatus(OppSPMessages.InitAction);
    this.ShowMessage(OppSPMessages.PleaseWait);
    sp_Service('GetActionXML', this.stepId, function (result) {
        if (typeof callback === "function") {
            callback(result);
        }
    });
   
}

function ProcessAction_WebServiceHandler(result) {
    if (this.state == 0) {
        this.state = 1;
        this.xml = result;
        this.Init();
    }
}

function ProcessAction_WebServiceErrorHandler(result) {
    if (this.state == 0) {
        this.ShowStatus('Error getting XML !' + result);
        this.Finish();
    } 
}

function ProcessAction_ResolveContact() {
    var contactId = null;
    this.ShowMessage(this.selectContactDesc);
    switch (this.selectWithOption.toUpperCase()) {
        case 'PRIMARYOPPCONTACT':
            contactId = sp_GetPrimaryOppContact();
            this.state = 2;
            break;
        case 'USERSELECTEDCONTACT':
            sp_SelectContact();
            break;
        case 'ALLOPPCONTACTS':
            contactId = 'ALLOPPCONTACTS';
            this.state = 2;
            break;
        default:
            contactId = 'Unknown';
            this.state = 2;
            break;
    }
    this.selectedContactId = contactId;
    var selectedContactIddElement = document.getElementById(spCtrlIDs.selectedContactIdCtrlId);
    selectedContactIddElement.value = contactId;
}

function ProcessAction_LuOppContactHandler(type, args) {
    var divLUCtrl = document.getElementById('divLUControls');
    divLUCtrl.style.display = 'none';
    var luOppContactTextCtrl = document.getElementById(spCtrlIDs.luOppContactCtrlId + '_LookupResult');
    var selectContactId = document.getElementById(spCtrlIDs.selectedContactIdCtrlId);
    selectContactId.value = luOppContactTextCtrl.value;
    if (currentProcessAction != null) {
        currentProcessAction.state = 2;
        currentProcessAction.selectedContactId = selectContactId.value;
        currentProcessAction.Execute();
    }
}

function ProcessAction_ResolveUser() {
    var userId = null;
    this.ShowMessage(this.selectUserDesc);
    switch (this.selectForOption.toUpperCase()) {
        case "CURRENTUSER":
            userId = sp_GetCurrentUser();
            this.state = 3;
            break;
        case "ACCTMGR":
            userId = sp_GetAcctManager();
            this.state = 3;
            break;
        case "SPECIFIC":
            userId = this.selectForValue;
            this.state = 3;
            break;
        case "SELECT":
            sp_SelectUser();
            break;
        default:
            userId = 'Unknown';
            this.state = 3;
            break;
    }
    this.selectedUserId = userId;
    var selectedUserIdElement = document.getElementById(spCtrlIDs.selectedUserIdCtrlId);
    selectedUserIdElement.value = userId;
}

function ProcessAction_LuUserHandler(type, args) {
    var divLUCtrl = document.getElementById('divLUControls');
    divLUCtrl.style.display = 'none';
    var luUserTextCtrl = document.getElementById(spCtrlIDs.luUserCtrlId + '_LookupResult');
    var selectedUserId = document.getElementById(spCtrlIDs.selectedUserIdCtrlId);
    selectedUserId.value = luUserTextCtrl.value;
    if (currentProcessAction != null) {
        currentProcessAction.state = 3;
        currentProcessAction.selectedUserId = selectedUserId.value;
        currentProcessAction.Execute();
    }
}

function ProcessAction_ShowMessage(message)
{
    sp_ShowMessage(message);
}

function ProcessAction_Finish() {
    sp_CloseProcessView();
    sp_CloseStatus();
}

function ProcessAction_ShowStatus(status) {
    sp_ShowStatus(status);
}
  
ProcessAction.prototype.Execute = ProcessAction_Execute;
ProcessAction.prototype.Init = ProcessAction_Init;
ProcessAction.prototype.LoadXML = ProcessAction_LoadXML;
ProcessAction.prototype.ResolveContact = ProcessAction_ResolveContact;
ProcessAction.prototype.LuOppContactHandler = ProcessAction_LuOppContactHandler;
ProcessAction.prototype.ResolveUser = ProcessAction_ResolveUser;
ProcessAction.prototype.LuUserHandler = ProcessAction_LuUserHandler;
ProcessAction.prototype.ShowMessage = ProcessAction_ShowMessage;
ProcessAction.prototype.ShowStatus = ProcessAction_ShowStatus;
ProcessAction.prototype.WebServiceHandler = ProcessAction_WebServiceHandler;
ProcessAction.prototype.WebServiceErrorHandler = ProcessAction_WebServiceErrorHandler;
ProcessAction.prototype.DoAction = ProcessAction_DoAction;
ProcessAction.prototype.Finish = ProcessAction_Finish;

function onSalesProcessChange() {
    var currentSalesProcessName = document.getElementById(spCtrlIDs.currentSalesProcessCtrlId).value;
    var numStepsCompleted = document.getElementById(spCtrlIDs.numOfStepsCompletedCtrlId).value;
    var newSalesProcessName = dijit.byId(spCtrlIDs.ddlSalesProcessCtrlId).get('displayedValue');
    if (currentSalesProcessName == newSalesProcessName) {
        return;
    }
    if (numStepsCompleted != '0') {
        Sage.UI.Dialogs.raiseQueryDialog(
            OppSPMessages.Confirm,
            dojo.string.substitute(OppSPMessages.ChangeSalesProcess, [currentSalesProcessName, newSalesProcessName]),
            function(result) {
                if (result) {
                    // Let the server postback handle the Re Initialization of the SalesProcess.
                    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(spCtrlIDs.ddlSalesProcessCtrlId, null);
                } else {
                    SetSalesProcessDDL(currentSalesProcessName);
                }
            },
            OppSPMessages.Yes,
            OppSPMessages.No,
            'questionIcon'
        );
    } else {
        // Let the server postback handle the Re Initialization of the SalesProcess.
        Sys.WebForms.PageRequestManager.getInstance()._doPostBack(spCtrlIDs.ddlSalesProcessCtrlId, null);
    }
}

function SetSalesProcessDDL(salesProcessName) {
    var ddl = dijit.byId(spCtrlIDs.ddlSalesProcessCtrlId);
    for (var i = 0; i < ddl.options.length; i++) {
        if (ddl.options[i].label == salesProcessName) {
            ddl.attr('value', ddl.options[i].value);
            break;
        }
    }
}

function SetStageDDL(stageId) {
    var ddl = dijit.byId(spCtrlIDs.ddlStagesCtrlId);
    for (var i = 0; i < ddl.options.length; i++) {
        if (ddl.options[i].value == stageId) {
            ddl.attr('value', ddl.options[i].value);
            break;
        }
    }
}

function doPostBack(control) {
    Sys.WebForms.PageRequestManager.getInstance().add_initializeRequest(showSalesProcessLoading);
    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(control.id, null);
}

function onCompleteStep(cmdCompleteCtrlId, stepContextCtrlId, stepContext) {
    var cmdCtrl = document.getElementById(cmdCompleteCtrlId);
    var stepContextCtrl = document.getElementById(stepContextCtrlId);
    stepContextCtrl.value = stepContext;
    sp_InvokeClickEvent(cmdCtrl);
}

function onCompleteStepWithDate(sender, cmdCompleteCtrlId, contextCtrlId, contextValue) {
    var cmdCtrl = document.getElementById(cmdCompleteCtrlId);
    var contextCtrl = document.getElementById(contextCtrlId);
    contextCtrl.value = contextValue + ':' + sender.value;
    sp_InvokeClickEvent(cmdCtrl);
}

function onStartStepWithDate(sender, cmdStartCtrlId, contextCtrlId, contextValue) {
    var cmdCtrl = document.getElementById(cmdStartCtrlId);
    var contextCtrl = document.getElementById(contextCtrlId);
    contextCtrl.value = contextValue + ':' + sender.value;
    sp_InvokeClickEvent(cmdCtrl);
}

function sp_InvokeClickEvent(control) {
    if (document.createEvent) {
        // FireFox
        var e = document.createEvent("MouseEvents");
        e.initEvent("click", true, true);
        control.dispatchEvent(e);
    }
    else {
        // IE
        control.click();
    }
}

// we can remove this since we do this as a post back
function onStageChange() {
}

// we can remove this since we do this as a post back
function onStageChangeCallBack(result) {
    var ddlStagesCtrl = dijit.byId(spCtrlIDs.ddlStagesCtrlId);
    var currentStageId = document.getElementById(spCtrlIDs.currentStageCtrlId).value;
    if (ddlStagesCtrl != null) {
        if (result == "") {
            Sage.UI.Dialogs.showInfo(result);
            // There is no un compeleted required steps so go ahead and change the stage.
            // Let the server postback handle the changing of the stage.
            Sys.WebForms.PageRequestManager.getInstance()._doPostBack(ddlStagesCtrl.id, null);
        }
        else {
            // stop and do not continue. 
            // we need to display the message.
            Sage.UI.Dialogs.showInfo(result);
            SetStageDDL(currentStageId);
        }
    }
}

// we can remove this since we do this as a post back
function onStageChangeCallBackError(result) {
    var ddlStagesCtrl = dijit.byId(spCtrlIDs.ddlSalesProcessCtrlId);
    var currentStageId = document.getElementById(spCtrlIDs.currentStageCtrlId).value;
    if (ddlStagesCtrl != null) {
        Sage.UI.Dialogs.showInfo(result);
        SetStageDDL(currentStageId);
    }
}

function sp_SelectContact() {
    var sLookupObjId = spCtrlIDs.luOppContactObj;
    var oLookup = eval("window." + sLookupObjId);
    if (oLookup != null) {
        /* Override the OpportunityContact.DisplayProperty, if any. This is the value
        that will display in the lookup text box. */
        oLookup._entityDisplayProperty = "Contact_NameLF";
    }
    var divSelectContact = document.getElementById('spSelectContactDiv');
    var divSelectUser = document.getElementById('spSelectUserDiv');
    divSelectContact.style.display = 'block';
    divSelectUser.style.display = 'none';
    var luOppContactTextCtrl = document.getElementById(spCtrlIDs.luOppContactCtrlId + '_LookupResult');
    luOppContactTextCtrl.value = '';
    var luOppContactText = document.getElementById(spCtrlIDs.luOppContactCtrlId + '_LookupText');
    luOppContactText.value = '';
    var luOppContactBtnCtrl = document.getElementById(spCtrlIDs.luOppContactCtrlId + '_LookupBtn');
    if (luOppContactBtnCtrl != null) {
        //Open up the look up!
        sp_InvokeClickEvent(luOppContactBtnCtrl);   
    }
}

function onSelectContactNext() {
    var luOppContactTextCtrl = document.getElementById(spCtrlIDs.luOppContactCtrlId + '_LookupResult');
    var selectContactId = document.getElementById(spCtrlIDs.selectedContactIdCtrlId);
    selectContactId.value = luOppContactTextCtrl.value;
    if (currentProcessAction != null) {
        if (selectContactId.value == '') {
            Sage.UI.Dialogs.showInfo(OppSPMessages.MustSelectContact);
        }
        else {
            var divSelectContact = document.getElementById('spSelectContactDiv');
            divSelectContact.style.display = 'none';
            sp_Service("RESOLVEOPPCONTACT", selectContactId.value, function(result){
              
               selectContactId.value = result;
               currentProcessAction.selectedContactId = selectContactId.value;
               currentProcessAction.state = 2;
               currentProcessAction.Execute();
            
            });
            
        }
    }
    return false;
}

function sp_SelectUserOld(returnHandler) {
    if (luUserObj == null) {
        luUserObj = eval(spCtrlIDs.luUserObj); // @LUUSEROBJ;
    }
    var divLUCtrl = document.getElementById('divLUControls');
    divLUCtrl.style.display = 'block';
    luUserObj.Show();
    if (luUserEventSubscribed == false) {
        luUserObj.panel.hideEvent.subscribe(returnHandler);
        luUserEventSubscribed = true;
    }
}

function onSelectUserNext() {
    var luUserTextCtrl = document.getElementById(spCtrlIDs.luUserCtrlId + '_LookupResult');
    var selectedUserId = document.getElementById(spCtrlIDs.selectedUserIdCtrlId);
    selectedUserId.value = luUserTextCtrl.value;
    if (currentProcessAction != null) {
        if (selectedUserId.value == '') {
            Sage.UI.Dialogs.showInfo(OppSPMessages.MustSelectUser);
        }
        else {
            var divSelectContact = document.getElementById('spSelectContactDiv');
            divSelectContact.style.display = 'none';

            currentProcessAction.state = 3;
            currentProcessAction.selectedUserId = selectedUserId.value;
            currentProcessAction.Execute();
        }
    }
    return false;
}

function sp_SelectUser()
{
    var divSelectContact = document.getElementById('spSelectContactDiv');
    var divSelectUser = document.getElementById('spSelectUserDiv');
    var divMain = document.getElementById('spMain');
    divSelectContact.style.display = 'none';
    divSelectUser.style.display = 'block';
    return false;
}

function sp_GetCurrentUser()
{
    sp_ShowMessage(OppSPMessages.GettingCurrentUser); 
    var ctrl = document.getElementById(spCtrlIDs.currentUserIdCtrlId);
    var result = ctrl.value;
    return result;
}

function sp_GetPrimaryOppContact()
{
    sp_ShowMessage(OppSPMessages.GettingOppContact);
    var ctrl = document.getElementById(spCtrlIDs.primaryOppContactIdCtrlId);
    var result = ctrl.value;
    return result;
}

function sp_GetOppContactCount() {
    var ctrl = document.getElementById(spCtrlIDs.oppContactCountCtrlId);
    var result = ctrl.value;
    return result;
}

function sp_GetAcctManager() {
    sp_ShowMessage(OppSPMessages.GettingOppContact);
    var ctrl = document.getElementById(spCtrlIDs.accountManagerIdCtrlId);
    var result = ctrl.value;
    return result;
}

function sp_GetOpportunity() {
    var ctrl = document.getElementById(spCtrlIDs.opportunityIdCtrlId);
    var result = ctrl.value;
    return result;
}

function executeAction(stepId, actionType) {
    currentProcessAction = null;
    //Reset the default functions..
    ProcessAction.prototype.Init = ProcessAction_Init;
    ProcessAction.prototype.DoAction = ProcessAction_DoAction;
    var boolExecute = false;
    switch (actionType) {
        case 'None':
            break;
        case 'MailMerge':
            ProcessAction.prototype.Init = Init_MailMerge;
            ProcessAction.prototype.DoAction = doMailMerge;
            boolExecute = true;
            break;
        case 'Script':
            break;
        case 'Form':
            break;
        case 'PhoneCall':
            ProcessAction.prototype.Init = Init_Activity;
            ProcessAction.prototype.DoAction = doActivity;
            boolExecute = true;
            break;
        case 'ToDo':
            ProcessAction.prototype.Init = Init_Activity;
            ProcessAction.prototype.DoAction = doActivity;
            boolExecute = true;
            break;
        case 'Meeting':
            ProcessAction.prototype.Init = Init_Activity;
            ProcessAction.prototype.DoAction = doActivity;
            boolExecute = true;
            break;
        case 'LitRequest':
            ProcessAction.prototype.Init = Init_LitRequest;
            boolExecute = true;
            break;
        case 'ContactProcess':
            ProcessAction.prototype.Init = Init_ContactProcess;
            boolExecute = true;
            break;
        case 'ActivityNotePad':
            break;
        default:
            break;
    }
    if (boolExecute == true) {
      
          sp_Service("CANCOMPLETESTEP", stepId, function (result){
          if (result != '') {
              sp_Alert(result);
               currentProcessAction = null;
           }
           else {
              currentProcessAction = new ProcessAction(stepId, actionType);
              currentProcessAction.Execute();
           } 
        });
       
    }
    else {
        currentProcessAction = null;
    }
}

function Init_MailMerge() {
    this.ShowMessage(OppSPMessages.InitMailMerge);

    var xmlDoc = sp_GetXmlDoc(this.xml);
    var objAct = xmlDoc.getElementsByTagName('MergeOptions');
    var strAuthorType = "";
    var strAuthorValue = "";
    var strMergeWith = "";

    if (objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Type')[0].firstChild) {
        strAuthorType = objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Type')[0].firstChild.nodeValue;
    }
    if (objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Value')[0].firstChild){
       strAuthorValue = objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Value')[0].firstChild.nodeValue;
    }
    if (objAct[0].getElementsByTagName('MergeWith')[0].firstChild) {
      strMergeWith = objAct[0].getElementsByTagName('MergeWith')[0].firstChild.nodeValue;
    }

    this.selectWithOption = strMergeWith;
    this.selectForOption = strAuthorType;
    this.selectForValue = strAuthorValue;
    this.selectUserDesc = OppSPMessages.SelectAuthor;
    this.selectContactDesc = OppSPMessages.MergeWith;
    this.ShowStatus(OppSPMessages.PerformingMailMerge);
    this.ShowMessage(OppSPMessages.PleaseWait);
    this.IsInit = true;

}


function doMailMerge() {
    this.ShowMessage(OppSPMessages.ProcessingMailMerge);
    var xmlDoc = sp_GetXmlDoc(this.xml);
    var scheduleForType = '';
    var scheduleForValue = '';
    var leaderId = '';
    var objAct = xmlDoc.getElementsByTagName('FollowUpActivity');
    if (objAct[0].getElementsByTagName('Leader')[0].getElementsByTagName('Type')[0].firstChild) {
        scheduleForType = objAct[0].getElementsByTagName('Leader')[0].getElementsByTagName('Type')[0].firstChild.nodeValue;
    }
    if (objAct[0].getElementsByTagName('Leader')[0].getElementsByTagName('Value')[0].firstChild) {
       scheduleForValue = objAct[0].getElementsByTagName('Leader')[0].getElementsByTagName('Value')[0].firstChild.nodeValue;
    }
  
    switch (scheduleForType.toUpperCase()) {
        case 'CURRENTUSER':
            leaderId = sp_GetCurrentUser();
            break;
        case 'ACCTMGR':
            leaderId = sp_GetAcctManager();
            break;
        case 'SPECIFIC':
            leaderId = scheduleForValue;
            break;
        default:
            leaderId = sp_GetCurrentUser();
            break;
    }
    this.ShowMessage(OppSPMessages.ProcessingMailMerge);

    var self = this;
    
    require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service'], function(Helper, DesktopService) {
        sp_DoMailMerge(self.xml, self.selectedContactId, self.selectedUserId, leaderId);
        self.Finish();
    });
    
    return false;
}

function Init_Activity() {
    this.ShowMessage(OppSPMessages.InitActivity);

    var xmlDoc = sp_GetXmlDoc(this.xml);
    var objAct = xmlDoc.getElementsByTagName('ActivityAction');
    var strScheduleForType = "";
    var strScheduleForValue = "";
    var strScheduleWith = "";
    var strAutoSchedule = "F";
    var desc = '';

    if (objAct[0].getElementsByTagName('ScheduleFor')[0].getElementsByTagName('Type')[0].firstChild) {
        strScheduleForType = objAct[0].getElementsByTagName('ScheduleFor')[0].getElementsByTagName('Type')[0].firstChild.nodeValue;
    }

    if (objAct[0].getElementsByTagName('ScheduleFor')[0].getElementsByTagName('Value')[0].firstChild) {
        strScheduleForValue = objAct[0].getElementsByTagName('ScheduleFor')[0].getElementsByTagName('Value')[0].firstChild.nodeValue;
    }

    if (objAct[0].getElementsByTagName('ScheduleWith')[0].firstChild) {
        strScheduleWith = objAct[0].getElementsByTagName('ScheduleWith')[0].firstChild.nodeValue;
    }

    if (objAct[0].getElementsByTagName('AutoSchedule')[0].firstChild) {
       strAutoSchedule = objAct[0].getElementsByTagName('AutoSchedule')[0].firstChild.nodeValue
    }
    

    switch (this.actionType.toUpperCase()) {
        case 'TODO':
            desc = OppSPMessages.ToDo;
            break;
        case 'PHONECALL':
            desc = OppSPMessages.PhoneCall;
            break;
        case 'MEETING':
            desc = OppSPMessages.Meeting;
            break;
        default:
            desc = 'Activty';
            break;
    }

    this.selectWithOption = strScheduleWith;
    this.selectForOption = strScheduleForType;
    this.selectForValue = strScheduleForValue;
    this.selectUserDesc = OppSPMessages.SelectActLeader;
    this.selectContactDesc = OppSPMessages.ScheduleWithContact;
    if(strAutoSchedule === 'F'){
       this.autoSchedule = false;
    }else{
       this.autoSchedule = true;    
    }
    this.ShowStatus(dojo.string.substitute(OppSPMessages.PerformingActivity, [desc]));
    this.IsInit = true;

}

function doActivity() {
     if (this.IsInit == false) { 
        return;
     }

    if(this.autoSchedule){
        this.ShowMessage(OppSPMessages.ProcessingAction);
        //By Default we will post back for server side processing
        var cmdCtrl = document.getElementById(spCtrlIDs.cmdDoActionCtrlId);
        var actionContextCtrl = document.getElementById(spCtrlIDs.actionContextCtrlId);
        actionContextCtrl.value = this.stepId;
        sp_InvokeClickEvent(cmdCtrl);
        return;             
    }
    
     //Show Activity Dialog;
     var leaderId = this.selectedUserId;
     var contactId = this.selectedContactId;
     var opportunityId = sp_GetOpportunity();
    
     var args =   this.stepId + "," + contactId + "," + opportunityId + "," + leaderId;
    var action = this;
     sp_Service('SCHEDULEACTIVITY', args ,function(result){
        
            if(result != ''){
                 var activityService = Sage.Services.getService('ActivityService');
                 activityService.editTempActivity(result);                
               }
               action.Finish();
               return false;
    });

}


function Init_LitRequest() {
    this.ShowMessage(OppSPMessages.InitLitRequest);

    var xmlDoc = sp_GetXmlDoc(this.xml);
    var objAct = xmlDoc.getElementsByTagName('LitRequestAction');
    var strScheduleForType = "";
    var strScheduleForValue = "";
    var strScheduleWith = "";
    
    if (objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Type')[0].firstChild) {
        strScheduleForType = objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Type')[0].firstChild.nodeValue;
    }

    if (objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Value')[0].firstChild) {
        strScheduleForValue = objAct[0].getElementsByTagName('Author')[0].getElementsByTagName('Value')[0].firstChild.nodeValue;
    }

    if (objAct[0].getElementsByTagName('RequestFor')[0].firstChild) {
        strScheduleWith = objAct[0].getElementsByTagName('RequestFor')[0].firstChild.nodeValue;
    }

    this.selectWithOption = strScheduleWith;
    this.selectForOption = strScheduleForType;
    this.selectForValue = strScheduleForValue;
    this.selectUserDesc = OppSPMessages.SelectAuthor;
    this.selectContactDesc = OppSPMessages.RequestFor;
    this.ShowStatus(OppSPMessages.PerformingLitReq);
    this.IsInit = true;
 
}

function Init_ContactProcess() {
    this.ShowMessage(OppSPMessages.InitContactProc);

    var xmlDoc = sp_GetXmlDoc(this.xml);
    var objAct = xmlDoc.getElementsByTagName('ContactProcessAction');
    var strScheduleWith = "";

    if (objAct[0].getElementsByTagName('ScheduleWith')[0].firstChild) {
        strScheduleWith = objAct[0].getElementsByTagName('ScheduleWith')[0].firstChild.nodeValue;
    }

    this.selectWithOption = strScheduleWith;
    this.selectForOption = '';
    this.selectForValue = '';
    this.selectContactDesc = OppSPMessages.ScheduleWithContact;
    this.ShowStatus(OppSPMessages.PerformingContactProc);
    this.IsInit = true;
  
}

function sp_Service(serviceType, serviceContext, callback) {
    var sUrl = "./SmartParts/OpportunitySalesProcess/SalesProcessService.aspx?serviceType=" + serviceType + "&serviceContext=" + serviceContext;
    var result = null;
    dojo.xhrGet({
        url: sUrl,
        handleAs: "text",
        preventCache: true,
        sync: typeof callback === "undefined",
        load: function (data) {
            result = data;
            if (typeof callback === "function") {
                callback(result);
            }
        },
        error: function (err) {
            console.error("sp_Service error: %o", err);
            return err;
        }
    });

    return result;   
}

function sp_ShowStatus(status) {
    var divStatus = document.getElementById('spStatus');
    var divMain = document.getElementById('spMain');
    divStatus.innerHTML = status;
    divStatus.style.display = 'block';
    divMain.style.display = 'none';
}

function sp_CloseStatus() {
    var divStatus = document.getElementById('spStatus');
    var divMain = document.getElementById('spMain');
    divStatus.style.display = 'none';
    divMain.style.display = 'block';
    sp_CloseMessage();
}

function sp_ShowMessage(msg) {
    var divCtrl = document.getElementById('spMsg');
    divCtrl.innerHTML = '<b>' + msg + '</b>';
    divCtrl.style.display = 'block';
}

function sp_CloseMessage() {
    var divCtrl = document.getElementById('spMsg');
    divCtrl.style.display = 'none';
}

function sp_ShowProcessView() {
    var divCtrl = document.getElementById('spProcessView');
    divCtrl.style.display = 'block';
}

function sp_CloseProcessView() {
    var divCtrl = document.getElementById('spProcessView');
    divCtrl.style.display = 'none';
}

function sp_GetXmlDoc(xmlData) {
    var xmlDoc = null;
    // If IE
    if (window.ActiveXObject) {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(xmlData);
    }
    // Else Firefox
    else {
        var domParser = new DOMParser();
        xmlDoc = domParser.parseFromString(xmlData, "text/xml");
    }
    return xmlDoc;
}

function sp_Format(formatString, value1, value2) {
    return dojo.string.substitute(formatString, [value1, value2]);
}

function sp_Alert(message) {
    Sage.UI.Dialogs.showInfo(message);
}

function sp_Error(message) {
    Sage.UI.Dialogs.showError(message);
}

function btnDisable(btnStages) {
    document.getElementById(btnStages).style.display = 'none';
    document.getElementById(btnStages + 'Hide').style.display = 'inline';
}

function showSalesProcessLoading() {
    if (salesProcessStandby === false) {
        salesProcessStandby = new dojox.widget.Standby({
            target: 'spMain',
            color: 'white',
            image: 'images/loader_lg.gif'
        });
        document.body.appendChild(salesProcessStandby.domNode);
        salesProcessStandby.startup();
    }
    window.setTimeout(function () {
        if (salesProcessStandby) {
            salesProcessStandby.show();
        }
    }, 0);
}

function hideSalesProcessLoading() {
    Sys.WebForms.PageRequestManager.getInstance().remove_initializeRequest(showSalesProcessLoading);
    if (salesProcessStandby) {
        window.setTimeout(function () {
            if (salesProcessStandby) {
                salesProcessStandby.hide();
                salesProcessStandby = false;                
            }
        }, 1);
    }
}

dojo.ready(function () {
    Sys.WebForms.PageRequestManager.getInstance().add_pageLoaded(salesProcessPageLoad);   
    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(hideSalesProcessLoading);
});

if (typeof (Sys) !== 'undefined') Sys.Application.notifyScriptLoaded();