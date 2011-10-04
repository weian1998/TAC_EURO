/*
 * SageSalesLogixCommon
 * Copyright(c) 2009, Sage Software.
 * 
 * 
 */


if(typeof Ext!="undefined"){Ext.onReady(function(){Ext.QuickTips.init();});}
function showMoreInfo()
{var address='ActivexInfo.aspx';var win=window.open(address,'AlarmMgrWin','width=425,height=425,directories=no,location=no,menubar=no,status=yes,scrollbars=yes,resizable=yes,titlebar=no,toolbar=no');}
function convertTimelessDate(value){return new Date(value.getUTCFullYear(),value.getUTCMonth(),value.getUTCDate(),0,0,5,0);}
function ConvertToPhpDateTimeFormat(formatstring){var conversions=[{"mm":"i"},{"m":"i"},{"ss":"s"},{"dddd":"l"},{"ddd":"D"},{"d":"j"},{"jj":"d"},{"MMMM":"F"},{"M":"n"},{"nnn":"M"},{"nn":"m"},{"yyyy":"Y"},{"yy":"y"},{"hh":"h"},{"h":"g"},{"HH":"H"},{"H":"G"},{"tt":"A"},{"t":"A"},{"fff":"u"},{"ff":"u"},{"f":"u"},{"zzz":"Z"},{"zz":"Z"},{"z":"Z"}];var result=formatstring;for(var i=0;i<conversions.length;i++)
{for(var k in conversions[i])
result=result.replace(new RegExp(k,"g"),conversions[i][k]);}
return result;}
function getContextByKey(key){var res='';if(Sage.Services){var contextservice=Sage.Services.getService("ClientContextService");if((contextservice)&&(contextservice.containsKey(key))){res=contextservice.getValue(key);}}
return res;}
function getCookie(c_name)
{if(document.cookie.length>0)
{c_start=document.cookie.indexOf(c_name+"=");if(c_start!=-1)
{c_start=c_start+c_name.length+1;c_end=document.cookie.indexOf(";",c_start);if(c_end==-1)c_end=document.cookie.length;return unescape(document.cookie.substring(c_start,c_end));}}
return"";}
function showRequestIndicator(){var elem=document.getElementById("asyncpostbackindicator");if(elem){elem.style.visibility="visible";}}
function hideRequestIndicator(sender,args){var errorMessage;var elem=document.getElementById("asyncpostbackindicator");if(elem){elem.style.visibility="hidden";}
if(!args||!args.get_error)return;if(args.get_error!=undefined&&args.get_error()!=undefined){if(args.get_response()!=null&&args.get_response().get_responseAvailable()&&args.get_response().get_statusCode()=='0'){args.set_errorHandled(true);return;}
if(args.get_response()!=null&&(args.get_response().get_timedOut()||(args.get_response().get_responseAvailable()&&args.get_response().get_statusCode()=='200'))){errorMessage=args.get_error().message;}
else{var e=$get("defaultErrorMessage");if(e){if(e.innerText){errorMessage=e.innerText;}else{for(var i=0;i<e.childNodes.length;i++){if(e.childNodes[i].nodeType==3){errorMessage=e.childNodes[i].nodeValue;break;}}}}}
args.set_errorHandled(true);var regx=new RegExp("^.*:");errorMessage=errorMessage.replace(regx,"");var msgService=Sage.Services.getService("WebClientMessageService");if(msgService){msgService.showClientMessage(errorMessage);}}}
function linkTo(url,helpWindow,target){if(helpWindow){var helpWin=window.open(url,'MCWebHelp');if(Ext.isIE)
helpWin.location.reload();return;}
if(target){var win=window.open(url,target);return;}
try{window.location.href=url;}catch(e){}}
function DoGeneralSearchOptionsPage_init(){if(document.getElementById("FaxProviderOptions")){var inputs=document.getElementsByTagName("input");for(var i=0;i<inputs.length;i++){if(inputs[i].id.indexOf("txtFaxProvider")>-1){FaxProviderControl=inputs[i];break;}}
if(typeof(FaxProviderControl)!="undefined"){FaxProviderControl.style.display="none";var oService=GetMailMergeService(false);if(oService){var x=oService.MailMergeGUI().GetFaxProviderOptions(FaxProviderControl.value);x='<select name="FaxOptions" onchange="updateFaxProvider()">'+x+'</select>';var oFaxProviderOptions=$get("FaxProviderOptions");if(oFaxProviderOptions){oFaxProviderOptions.innerHTML=x;}
return;}
var oFaxProviderLabel=$get("FaxProviderLabel");if(oFaxProviderLabel){oFaxProviderLabel.style.display="none";}}}}
function GeneralSearchOptionsPage_init(){window.setTimeout('DoGeneralSearchOptionsPage_init()',500);}
function SaveLookupAsGroup(obj,e,msg){if(typeof(msg)=='undefined'){msg=MasterPageLinks.SaveLookupAsGroupNamePrompt;}
Ext.Msg.prompt(MasterPageLinks.SaveLookupAsGroupNameDlgTitle,msg,function(btn,text){if(btn=='ok'&&text==''){SaveLookupAsGroup(obj,MasterPageLinks.AdHocDialog_NewGroupRePrompt);}
else if(btn=='ok'&&(text.match(/\'|\"|\/|\\|\*|\:|\?|\<|\>/)!=null)){promptForName(MasterPageLinks.SaveLookupAsGroupInvalidChar);}
else if(btn=='ok'&&text!=''){SaveLookup(text);}},'New Group');}
function SaveLookup(name){var postUrl="slxdata.ashx/slx/crm/-/groups/adhoc?action=SaveLookupAsGroup&name="+encodeURIComponent(name);$.ajax({type:"POST",url:postUrl,error:HandleSaveLookupError,success:OnNewGroupCreated,data:{},dataType:"text"});}
function HandleSaveLookupError(request,status){if(typeof request!='undefined'){if((typeof request.responseXML!='undefined')&&(request.responseXML!=null)){var nodes=request.responseXML.getElementsByTagName('sdata:message');if(nodes.length>0){Ext.Msg.show({title:"",msg:nodes[0].text,buttons:Ext.Msg.OK,icon:Ext.MessageBox.ERROR});}else{nodes=request.responseXML.getElementsByTagName('message');if(nodes.length>0){Ext.Msg.show({title:"",msg:nodes[0].textContent,buttons:Ext.Msg.OK,icon:Ext.MessageBox.ERROR});}}}
else{Ext.Msg.alert("an unidentified exception has occured");}}}
function OnNewGroupCreated(data,data2){var url=document.location.href.replace("#","");if(url.indexOf("?")>-1){var halves=url.split("?");url=halves[0];}
url+="?modeid=list"
document.location=url;}
function showAdHocMenu(e){var groupID=Sage.Services.getService("GroupManagerService")._contextService.getContext().CurrentGroupID;if(typeof(GroupGridContextMenu)!='undefined')
{GroupGridContextMenu.removeAll();}
else
{GroupGridContextMenu=new Ext.menu.Menu({id:'GroupGridContext'});if(typeof idMenuItems!="undefined"){GroupGridContextMenu.on("show",function(){idMenuItems();});}}
if(typeof groupGridContextMenuData==="undefined"||!groupGridContextMenuData)
return;var menustring=Sys.Serialization.JavaScriptSerializer.serialize(groupGridContextMenuData.menuitems);var newgmd=Sys.Serialization.JavaScriptSerializer.deserialize(menustring.replace(/%GROUPID%/g,groupID));addToAdHocMenu(newgmd,GroupGridContextMenu);if(!e)
{e={xy:[250,250]};}
GroupGridContextMenu.showAt(e.xy);}
function addToAdHocMenu(navItems,menu){if(navItems.length>0){for(var i=0;i<navItems.length;i++){if((navItems[i].isspacer=="True")||(navItems[i].text=='-')){menu.addSeparator();}else{if(navItems[i].submenu.length>0){var newsubmenu=new Ext.menu.Menu({id:navItems[i].id+'submenu'});addToAdHocMenu(navItems[i].submenu,newsubmenu);var itemhandler=(navItems[i].href!="")?makeLink(navItems[i].href):function(){return false;};menu.add({text:navItems[i].text,handler:itemhandler,id:navItems[i].id,menu:newsubmenu});}else{if(!getCurrentGroupInfo().isAdhoc&&navItems[i].id=="contextRemoveFromGroup")
{}
else if(navItems[i].submenu.length==0&&navItems[i].id=="contextAddToAdHoc")
{}
else
menu.add({text:navItems[i].text,handler:makeLink(navItems[i].href),id:navItems[i].id});}}}}}
function GroupNameByID(id){return id;}
var _ignoreChangeEvent=false;function handleGroupChange(gMgrSvc,args){if(GroupTabBar){_ignoreChangeEvent=true;GroupTabBar.setActiveTab(args.current.CurrentGroupID);populateGroupTabs()
_ignoreChangeEvent=false;}}
if(typeof Sage!='undefined')Sage.Lookupdisplayed=false;function showMainLookup(){Sage.Lookupdisplayed=true;var contextservice=Sage.Services.getService("ClientContextService");var modeid="List";if((contextservice)&&(contextservice.containsKey("modeid"))){modeid=contextservice.getValue("modeid");}
if(!Sage.Services.hasService('GroupLookupManager')){Sage.Services.addService("GroupLookupManager",new Sage.GroupLookupManager());}
var mgr=Sage.Services.getService("GroupLookupManager");if(modeid.toUpperCase()!="LIST"){var url=document.location.href;var endIndex=url.indexOf('?');endIndex=(endIndex>0)?endIndex:url.length;var page=url.substring(url.lastIndexOf('/')+1,endIndex);var grpInfo=getCurrentGroupInfo();mgr.showLookup({family:grpInfo.Family,name:'LookupLayoutGroup',returnTo:page});}else{mgr.showLookup();}}
function showMainLookupFor(family,page){if(typeof family==="undefined"||typeof page==="undefined"){Ext.Msg.show({title:"Sage SalesLogix",msg:"The parameters are incorrectly defined for showMainLookupFor().",buttons:Ext.Msg.OK,icon:Ext.MessageBox.ERROR});return;}
Sage.Lookupdisplayed=true;var clContext=Sage.Services.getService("ClientContextService");var contextservice=Sage.Services.getService("ClientContextService");var modeid="List";if((contextservice)&&(contextservice.containsKey("modeid"))){modeid=contextservice.getValue("modeid");}
var bFamilyIsActive=false;var bIsList=false;var grpInfo=getCurrentGroupInfo();if(grpInfo!=""){if(grpInfo.Family!=null){if(grpInfo.Family.toUpperCase()==family.toUpperCase()){if((document.location.href.toUpperCase().indexOf(page.toUpperCase()))!=-1){bIsList=(modeid.toUpperCase()=="LIST");bFamilyIsActive=true;}}}}
if(!bIsList&&bFamilyIsActive){var mgr=Sage.Services.getService("GroupLookupManager");if(mgr){mgr.showLookup({family:family,name:'LookupLayoutGroup',returnTo:page});}}else if(!bIsList&&!bFamilyIsActive){var url=document.location.href;var iIndex=url.lastIndexOf("/");if(iIndex!=-1){url=url.substring(0,iIndex);url=String.format("{0}/{1}?modeid=list&showlookuponload=true",url,page);}
document.location=url;}
else{if(!Sage.Services.hasService('GroupLookupManager')){Sage.Services.addService("GroupLookupManager",new Sage.GroupLookupManager());}
var mgr=Sage.Services.getService("GroupLookupManager");mgr.showLookup();}}
function handleGroupTabChange(tabPanel,newTab,currentTab){if(_ignoreChangeEvent==true){return;}
window.setTimeout(function(){navToNewGroup(newTab.url);},1000);}
function navToNewGroup(url){window.location=url;}
function getCurrentGroupID(){var clGrpContextSvc=Sage.Services.getService("ClientGroupContext");if(clGrpContextSvc){var clGrpContext=clGrpContextSvc.getContext();return clGrpContext.CurrentGroupID;}else if(typeof(window.__groupContext)!="undefined"){return window.__groupContext.CurrentGroupID;}
return"";}
function getCurrentGroupInfo(){var clGrpContextSvc=Sage.Services.getService("ClientGroupContext");if(clGrpContextSvc){var clGrpContext=clGrpContextSvc.getContext();return{"Name":clGrpContext.CurrentName,"DisplayName":clGrpContext.CurrentDisplayName,"Family":clGrpContext.CurrentFamily,"Id":clGrpContext.CurrentGroupID,"isAdhoc":clGrpContext.isAdhoc,"Entity":clGrpContext.CurrentEntity};}else if(typeof(window.__groupContext)!="undefined"){return{"Name":window.__groupContext.CurrentName,"DisplayName":window.__groupContext.CurrentDisplayName,"Family":window.__groupContext.CurrentFamily,"Id":window.__groupContext.CurrentGroupID,"isAdhoc":window.__groupContext.isAdhoc};}
return"";}
function makeLink(dest,isHelpLink,target){if(!isHelpLink)
isHelpLink=false;return function(){linkTo(dest,isHelpLink,target)};}
AutoLogout=new function(){this.OneMinute=60000;this.LogoutDuration=20;this.StartAlertAt=10;this.StartWarnAt=5;this.Enabled=true;}
AutoLogout.process=function(minutes){if(!AutoLogout.Enabled)return;if(AutoLogout.LogoutReset){minutes=0;AutoLogout.LogoutReset=false;}
if(minutes==this.LogoutDuration){linkTo('Shutdown.axd',false);return;}
if(minutes<this.StartWarnAt){window.setTimeout('AutoLogout.process('+(minutes+1)+')',this.OneMinute);return;}
if(typeof MasterPageLinks!="undefined"){var msg=String.format(MasterPageLinks.IdleMessage,minutes);if(minutes>=this.LogoutDuration-this.StartAlertAt){Ext.get('autoLogoff').addClass("alerttext");msg=String.format(MasterPageLinks.LogoffMessage,this.LogoutDuration-minutes);}
Ext.get('autoLogoff').dom.innerHTML=msg;window.setTimeout('AutoLogout.process('+(minutes+1)+')',this.OneMinute);}
return;}
AutoLogout.resetTimer=function(){AutoLogout.LogoutReset=true;Ext.get('autoLogoff').removeClass("alerttext").dom.innerHTML="";}
function timesince(start){var now=new Date();return now-start;}
var contextSvc;var context;var strEntityId;var strEntityType;var strEntityTableName;var postUrl="";var totalCount;var selections;var arraySelections=new Array;var groupID="";var dialogBody="";function GetCurrentEntity()
{if(Sage.Services.hasService("ClientEntityContext"))
{contextSvc=Sage.Services.getService("ClientEntityContext");context=contextSvc.getContext();strEntityId=context.EntityId;strEntityType=context.EntityType;strEntityTableName=context.EntityTableName;}}
saveSelectionsAsNewGroup=function(){totalCount=Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;dialogBody=String.format(MasterPageLinks.AdHocDialog_NoneSelectedNewGroup,totalCount);var name="";var selectionInfo;try{selectionInfo=GetSeletionInfo();}
catch(e)
{Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}
if(selectionInfo.selectionCount==0){Ext.Msg.show({title:MasterPageLinks.AdHocDialog_NoneSelectedTitle,msg:dialogBody,buttons:{ok:MasterPageLinks.AdHocDialog_YesButton,cancel:MasterPageLinks.AdHocDialog_NoButton},fn:CreateNewGroup,icon:Ext.MessageBox.QUESTION});}
else
{promptForName('');}}
function CreateNewGroup(btn){if(btn=='ok'){promptForName('');}}
promptForName=function(addlMsg){var totalToAdd;var selectionInfo=GetSeletionInfo();if(selectionInfo.selectionCount==0)
{totalToAdd=totalCount}
else{totalToAdd=selectionInfo.selectionCount}
dialogBody=String.format(MasterPageLinks.AdHocDialog_NewGroupNamePrompt,totalToAdd)
Ext.MessageBox.buttonText.cancel=MasterPageLinks.AdHocDialog_CancelButton;Ext.MessageBox.buttonText.ok=MasterPageLinks.AdHocDialog_OkButton;Ext.Msg.prompt(MasterPageLinks.AdHocDialog_NewGroupTitle,dialogBody+addlMsg,function(btn,text){if(btn=='ok'&&text==''){promptForName(MasterPageLinks.AdHocDialog_NewGroupRePrompt);}
else if(btn=='ok'&&(text.match(/\'|\"|\/|\\|\*|\:|\?|\<|\>/)!=null)){promptForName(MasterPageLinks.SaveLookupAsGroupInvalidChar);}
else if(btn=='ok'&&text!=''){saveNewGroupPost(text);}},'New Group');}
saveNewGroupPost=function(name)
{var selectionInfo=GetSeletionInfo();if(selectionInfo.selectionCount==0){selectionInfo.mode='selectAll';}
postUrl="slxdata.ashx/slx/crm/-/groups/adhoc?action=CreateAdHocGroup&name="+encodeURIComponent(name)+"&selectionKey="+selectionInfo.key;if(postUrl!="")
{$.ajax({type:"POST",url:postUrl,contentType:"application/json",data:Ext.encode(selectionInfo),processData:false,error:HandleSaveLookupError,success:function(data)
{OnNewGroupCreated();}});}}
removeSelectionsFromGroup=function(){totalCount=Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;dialogBody=String.format(MasterPageLinks.AdHocDialog_NoneSelectedRemove,totalCount);var selectionInfo;try
{selectionInfo=GetSeletionInfo();groupID=Sage.Services.getService("GroupManagerService")._contextService.getContext().CurrentGroupID;}
catch(e)
{Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}
if(selectionInfo.selectionCount==0)
{if(totalCount==0)
{Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoneSelectedTitle,MasterPageLinks.AdHocDialog_GroupCountZero);}
else
{Ext.Msg.confirm(MasterPageLinks.AdHocDialog_NoneSelectedTitle,dialogBody,function(btn)
{if(btn=='yes')
{removeConfirmed();}});}}
else
{removeConfirmed();}}
removeConfirmed=function(){var selectionInfo=GetSeletionInfo();if(selectionInfo.selectionCount==0)
{selectionInfo.mode="selectAll";}
postUrl="slxdata.ashx/slx/crm/-/groups/adhoc?action=EditAdHocGroupRemoveMembers&groupID="+groupID+"&selectionKey="+selectionInfo.key;$.ajax({type:"POST",url:postUrl,contentType:"application/json",data:Ext.encode(selectionInfo),processData:false,error:function(request,status,error)
{alert(error)},success:function(status)
{}});Sage.Services.getService("GroupManagerService").setNewGroup(groupID);}
addSelectionsToGroup=function(groupID){GetCurrentEntity();if(strEntityId!=''){postUrl="slxdata.ashx/slx/crm/-/groups/adhoc?action=EditAdHocGroupAddMembers&groupID="+groupID+"&selections="+strEntityId
postAddToGroup(postUrl,{});}
else{var selectionInfo;try{totalCount=Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;dialogBody=String.format(MasterPageLinks.AdHocDialog_NoneSelectedAddToGroup,totalCount);selectionInfo=GetSeletionInfo();}
catch(e){Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}
if(selectionInfo.selectionCount==0){if(totalCount==0){Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoneSelectedTitle,MasterPageLinks.AdHocDialog_GroupCountZero);}
else{Ext.Msg.confirm(MasterPageLinks.AdHocDialog_NoneSelectedTitle,dialogBody,function(btn){if(btn=='yes'){addConfirmed(groupID);}});}}
else{addConfirmed(groupID);}}};addConfirmed=function(groupID){if(Sage.Services.getService("GroupManagerService")._contextService.getContext().CurrentGroupID===groupID){var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(panel){panel.views.list.view.reset();}}
var selectionInfo=GetSeletionInfo();postUrl="slxdata.ashx/slx/crm/-/groups/adhoc?action=EditAdHocGroupAddMembers&groupID="+groupID+"&selectionKey="+selectionInfo.key;if(selectionInfo.selectionCount==0){selectionInfo.mode='selectAll';}
postAddToGroup(postUrl,selectionInfo);};postAddToGroup=function(postUrl,payLoad)
{if(postUrl!="")
{$.ajax({type:"POST",url:postUrl,contentType:"application/json",data:Ext.encode(payLoad),processData:false,error:function(request,status,error)
{alert(error)},success:function(status)
{}});}}
function doTextBoxKeyUp(control)
{maxLength=control.attributes["MultiLineMaxLength"].value;value=control.value;if(value.length>maxLength-1)
control.value=value.substring(0,maxLength);}
function doTextBoxPaste(control)
{maxLength=control.attributes["MultiLineMaxLength"].value;value=control.value;if(maxLength)
{maxLength=parseInt(maxLength);var oTR=control.document.selection.createRange();var iInsertLength=maxLength-value.length+oTR.text.length;var sData=window.clipboardData.getData("Text").substr(0,iInsertLength);oTR.text=sData;return false;}}
function leadAssignOwner(){var selectionInfo=GetSeletionInfo();if(selectionInfo.selectionCount>0){LeadAssignOwner.addListener("change",LeadAssignOwnerChange);Javascript:window.LeadAssignOwner.show();}}
function LeadAssignOwnerChange(){var msgBox=Ext.MessageBox.show({title:MasterPageLinks.Leads_AssignOwner_ProgressTitle,msg:MasterPageLinks.Leads_AssignOwner_ProgressMsg,width:300,wait:true,waitConfig:{interval:200}});var assignOwnerId=document.getElementById(LeadAssignOwner._valueClientId);if(assignOwnerId!=null){var selectionInfo=GetSeletionInfo();var postUrl=String.format("slxdata.ashx/slx/crm/-/leads/assignowner?id={0}&selectionKey={1}",assignOwnerId.value,selectionInfo.key)
$.ajax({type:"POST",url:postUrl,contentType:"application/json",data:Ext.encode(selectionInfo),processData:false,error:HandleSaveLookupError,success:function(){msgBox.hide();RefreshListView();}});}}
function leadDeleteRecords(){if(ContinueWithSelections()){var selectionInfo=GetSeletionInfo();if(selectionInfo.selectionCount>0){dialogBody=MasterPageLinks.confirm_DeleteRecords;var conf=confirm(dialogBody);if(conf){var msgBox=Ext.MessageBox.show({title:MasterPageLinks.Leads_AssignOwner_ProgressTitle,msg:MasterPageLinks.Leads_DeleteLeads_ProgressMsg,width:300,wait:true,waitConfig:{interval:200}});$.ajax({type:"POST",url:String.format("slxdata.ashx/slx/crm/-/leads/deleteleads?selectionKey={0}",selectionInfo.key),contentType:"application/json",data:Ext.encode(selectionInfo),processData:false,error:HandleSaveLookupError,success:function(){msgBox.hide();RefreshListView();}});}}
else{selectionInfo.mode='selectAll';var msgBox=Ext.MessageBox.show({title:MasterPageLinks.Leads_AssignOwner_ProgressTitle,msg:MasterPageLinks.Leads_DeleteLeads_ProgressMsg,width:300,wait:true,waitConfig:{interval:200}});$.ajax({type:"POST",url:String.format("slxdata.ashx/slx/crm/-/leads/deleteAllLeadsInGroup?selectionKey={1}",selectionInfo.key),contentType:"application/json",data:Ext.encode(selectionInfo),processData:false,error:HandleSaveLookupError,success:function(){msgBox.hide();RefreshListView();}});}}}
function GetSeletedIdList(strEntity){var rc=false;try{var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(panel){arraySelections=panel.getSelections({idOnly:true});if(arraySelections.length==0){var totalCount=Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;dialogBody=String.format(MasterPageLinks.AdHocDialog_NoneSelectedAddToGroup,totalCount);var agree=confirm(dialogBody);if(agree){arraySelections=panel.getSelections({idOnly:false});}
rc=agree;}
else{rc=true;}}
return rc;}
catch(e){Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}}
function ContinueWithSelections(){var rc=false;var selectionInfo;try{var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(panel){selectionInfo=panel.getSelectionInfo();if(selectionInfo.selectionCount==0){var totalCount=Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;dialogBody=String.format(MasterPageLinks.AdHocDialog_NoneSelectedRemove,totalCount);var agree=confirm(dialogBody);rc=agree;}
else{rc=true;}}
return rc;}
catch(e){Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}}
function GetSeletionInfo(){var selectionInfo;try{var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(panel){selectionInfo=panel.getSelectionInfo();}
return selectionInfo;}
catch(e){Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}}
function RefreshListView()
{var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");panel.refresh();}
SparkLine=function(config){this.config=config;if(typeof(config.data)!='undefined'){if(config.data.type.toLowerCase()=='mashup'){var self=this;$.get("MashupHandler.ashx",config.data.params,function(result,status){var datavals="";var first=true;var elems=result.documentElement.getElementsByTagName(config.data.datavaluename);for(var i=0;i<elems.length;i++){if(!first)datavals+=",";datavals+=$(elems[i]).text();first=false;}
self.makeImg(config,datavals);});}else if(config.data.type.toLowerCase()=='literal'){this.makeImg(config,config.data.data.join(','));}}};SparkLine.prototype.makeImg=function(config,datavals){var sparkurl="Libraries/SparkHandler.ashx?"
for(var param in config.params){sparkurl+=param+"="+encodeURIComponent(config.params[param])+"&";}
sparkurl+=config.paramdataname+"="+datavals;$('#'+config.renderTo).html(String.format('<img src="{0}" alt="{1}" title="{1}" />',sparkurl,datavals));};function RunSummarySparkLine(config){window.setTimeout(function(){var spk=new SparkLine(config);},10);return'';}
ScriptQueue=(function(){var queue={dom:[]};var run={dom:false};var options={trapExceptions:false};var execute=function(fn){try
{if(fn)fn.call();}
catch(e)
{if(options.trapExceptions===false)
throw e;Ext.Msg.alert("Error",e.message||e.description);}};return{options:options,at:{immediate:function(fn){execute(fn);},dom:function(fn){if(run.dom)
execute(fn);else if(fn)
queue.dom.push(fn);},ready:function(fn){if(fn)$(document).ready(fn);}},run:{dom:function(){run.dom=true;execute(function(){for(var i=0;i<queue.dom.length;i++)
queue.dom[i].call();});queue.dom=[];}}};})();Error.prototype.toMessage=function(xtraMsg,showFullStack){var sError="";if(Ext.isDefined(xtraMsg)&&!Ext.isEmpty(xtraMsg)&&Ext.isString(xtraMsg)){sError=xtraMsg;if(!(sError.lastIndexOf(" ")+1==sError.length)){sError+=" ";}}
var sMsg=this.message;if(!(sMsg.lastIndexOf(".")+1==sMsg.length)){sMsg+=".";}
if(Ext.isIE){var iNumber=this.number;if(isNaN(iNumber)){iNumber=0;}
sError=String.format("{0}{1} Details: name={2}; number={3}.",sError,sMsg,this.name,iNumber);}
else{var iLineNumber=-1;var sSource="";var sStack="";if(Ext.isDefined(this.lineNumber)){iLineNumber=this.lineNumber;}
if(Ext.isDefined(this.stack)){sStack=this.stack;if(Ext.isBoolean(showFullStack)&&showFullStack){sSource=sStack;}
else{if(!isNaN(iLineNumber)){var iPos=sStack.indexOf(String.format(".js:{0}",iLineNumber));if(iPos!=-1){sSource=sStack.substring(0,iPos+3);iPos=sSource.lastIndexOf("/");if(iPos!=-1){sSource=sSource.substring(iPos+1);}}}}}
if(Ext.isEmpty(sSource)){sSource="unknown";}
if(iLineNumber==-1){iLineNumber="unknown";}
sError=String.format("{0}{1} Details: name={2}; line={3}; source={4}.",sError,sMsg,this.name,iLineNumber,sSource);}
return sError;};