/*
 * SageSalesLogixCommon
 * Copyright(c) 2009, Sage Software.
 * 
 * 
 */


if(typeof Sys!=="undefined"){Type.registerNamespace("Sage.TaskPane");}else{Ext.namespace("Sage.TaskPane");}
var contextSvc;var context;var strEntityId;var strEntityDescription;var strEntityTableName;var selections;var arraySelections=new Array;var activeGrid;var postUrl="";var totalCount;var clientID;var sortExpression='';var selectedRecordActionCallback;var selectionInfo;Sage.TaskPane.CommonTasksTasklet=function(options){this._id=options.id;clientID=options.clientId;};Sage.TaskPane.CommonTasksTasklet.prototype.init=function(){var svc=Sage.Services.getService("GroupManagerService");svc.addListener(Sage.GroupManagerService.CURRENT_GROUP_CHANGED,function(sender,evt){try{this.__doPostBack(clientID,"");}catch(e){}});var prm=Sys.WebForms.PageRequestManager.getInstance();prm.add_pageLoaded(function(sender,args){var l=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(l){$("#selectionCount").text(l.getTotalSelectionCount());}});};function GetCurrentEntity(){if(Sage.Services.hasService("ClientEntityContext")){contextSvc=Sage.Services.getService("ClientEntityContext");context=contextSvc.getContext();strEntityId=context.EntityId;strEntityType=context.EntityType;strEntityTableName=context.EntityTableName;}}
removeCurrentFromGroup=function(){try{GetCurrentEntity();var groupID=Sage.Services.getService("GroupManagerService")._contextService.getContext().CurrentGroupID;}
catch(e){Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}
var svc=Sage.Services.getService("ClientGroupContext");if(svc!=null){var grpctxt=svc.getContext();var firstid=grpctxt.FirstEntityID;if(firstid==strEntityId){firstid=grpctxt.NextEntityID;}
if(firstid!=""){if(typeof(setCurentEntityContext)!="undefined"){setCurentEntityContext(firstid,strEntityId);}}}
postUrl="slxdata.ashx/slx/crm/-/groups/adhoc?action=EditAdHocGroupRemoveMembers&groupID="+groupID+"&selections="+strEntityId
if(postUrl!=""){$.ajax({type:"POST",url:postUrl,data:{},datatype:"text",error:function(request,status,error)
{alert(error)},success:function(status){}});}}
function showAdHocList(e){if(typeof(GroupAdHocListMenu)=='undefined'){GroupAdHocListMenu=new Ext.menu.Menu({id:'GroupAdHocList'});addToMenu(groupAdHocListMenu.menuitems[0].submenu,GroupAdHocListMenu);}
if(!e){e={xy:[250,250]};}
else{e={xy:[e.xy[0]-52,e.xy[1]+10]};}
GroupAdHocListMenu.showAt(e.xy);}
function GetSelectionInfo(){var selectionInfo;try{var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(panel){selectionInfo=panel.getSelectionInfo();}
return selectionInfo;}
catch(e)
{Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}}
function SetSelectionCount(){try{var panel=Sage.SalesLogix.Controls.ListPanel.find("MainList");if(panel){$("#selectionCount").text(panel.getTotalSelectionCount());}}
catch(e)
{}}
StoreAllSelectionsOrCancel=function(agree){if(agree=="yes"){var selectionKey="selectAll";document.getElementById(clientID+'_hfSelections').value=selectionKey;var svc=Sage.Services.getService("SelectionContextService");svc.setSelectionContext(selectionKey,selectionInfo,selectedRecordActionCallback);}
else{document.getElementById(clientID+'_hfSelections').value="cancel";}}
exportToExcel=function(){GetCurrentEntity();PrepareSelectedRecords(FileFormatCheck);}
FileFormatCheck=function(result){var formatIsSaved=getCookie("formatIsSaved");var format=getCookie("format");if(formatIsSaved=="true"&&format.length>0)
{document.getElementById(clientID+'_tskExportToExcel').click();}
else
{PromptForFileFormat();}}
PromptForFileFormat=function(){var form=new Ext.FormPanel({labelAlign:'left',border:false,defaults:{hideLabel:true,anchor:'100%'},items:[{border:false,html:'<p style=padding:5px;>'+CommonTasksResx.ExportToFile_Header+'</p>'},{xtype:'radio',name:'format_type',checked:true,inputValue:'csv',boxLabel:CommonTasksResx.ExportToFile_OptionCSV},{xtype:'radio',name:'format_type',inputValue:'tab',boxLabel:CommonTasksResx.ExportToFile_OptionTab},{border:false},{xtype:'checkbox',name:'exportFormatSaved',inputValue:true,boxLabel:CommonTasksResx.ExportToFile_OptionSaveFormat}]});var dialog=new Ext.Window({bodyStyle:'background-color: C6D7EF',border:false,width:315,height:175,layout:'fit',title:CommonTasksResx.ExportToFile_DialogTitle,items:form,buttonAlign:"right",buttons:[{text:CommonTasksResx.ExportToFile_OK,handler:function(){var typeIsSaved=form.getForm().getValues().exportFormatSaved;;var formatType=form.getForm().getValues().format_type;if(typeIsSaved!=undefined)
{document.cookie="formatIsSaved="+typeIsSaved+"; expires=1/01/2020";}
document.cookie="format="+formatType+"; expires=1/01/2020";document.getElementById(clientID+'_tskExportToExcel').click();dialog.hide();}},{text:CommonTasksResx.ExportToFile_Cancel,handler:function(){dialog.hide();}}]});dialog.show();}
function EmailSend(){GetCurrentEntity();var url="slxdata.ashx/slx/crm/-/namedqueries?columnaliases=email&format=json&hql="
url=url+GetURL(strEntityTableName);$.ajax({url:url,dataType:'json',success:Send,error:function(error){alert(error);}});}
function Send(email){var sEmail=email.items[0].email
if(email.count>0&&sEmail){sEmail=email.items[0].email;sEmail="mailto:"+sEmail;document.location.href=sEmail;}
else Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoEmail);}
function GetURL(entity){switch(entity){case'CONTACT':url="select con.Email from Contact con where con.id like '"+strEntityId+"'";break;case'ACCOUNT':url="select con.Email from Contact as con where con.Account.id like '"+strEntityId+"' and con.IsPrimary like 'T'";break;case'OPPORTUNITY':url="select con.Email from Opportunity as opp left join opp.Contacts as oppCon left join oppCon.Contact as con where opp.id like '"+strEntityId+"' and oppCon.IsPrimary like 'T'";break;case'LEAD':url="select le.Email from Lead le where le.id like '"+strEntityId+"'";break;case'CAMPAIGN':url="select ufo.Email from Campaign as cam left join cam.AccountManager as usr left join usr.UserInfo as ufo where cam.id like '"+strEntityId+"'";break;case'TICKET':url="select ufo.Email from User as usr left join usr.UserInfo as ufo where usr.DefaultOwner in  (select own.id from Ticket as tic left join tic.AssignedTo as own where tic.id like '"+strEntityId+"')";break;case'DEFECT':url="select ufo.Email from User as usr left join usr.UserInfo as ufo where usr.DefaultOwner in (select own.id from Defect as def left join def.AssignedTo as own where def.id like '"+strEntityId+"')";break;case'CONTRACT':url="select con.Email from Contract as crt left join crt.Contact as con where crt.id like '"+strEntityId+"'";break;}
return url;}
function PrepareSelectedRecords(callback){selectedRecordActionCallback=callback;totalCount=Sage.Services.getService("ClientGroupContext").getContext().CurrentGroupCount;dialogBody=String.format(MasterPageLinks.AdHocDialog_NoneSelectedProcess,totalCount);try{selectionInfo=GetSelectionInfo();}
catch(e)
{Ext.Msg.alert(MasterPageLinks.AdHocDialog_NoData);}
if(selectionInfo.selectionCount==0){Ext.MessageBox.confirm("",dialogBody,StoreAllSelectionsOrCancel);}
else{document.getElementById(clientID+'_hfSelections').value=selectionInfo.key;var svc=Sage.Services.getService("SelectionContextService");svc.setSelectionContext(selectionInfo.key,selectionInfo,selectedRecordActionCallback);}}
function CopyUser(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.copyUser(selectionKey);}
function CopyUserProfile(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.copyUserProfile(selectionKey);}
function DeleteUsers(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.deleteUsers(selectionKey);}
function AddToTeam(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.addToTeam(selectionKey);}
function RemoveFromTeam(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.removeFromTeam(selectionKey);}
function RemoveFromAllTeams(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.removeFromAllTeams(selectionKey);}
function AssignRole(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.assignRole(selectionKey);}
function ReplaceTeamMember(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.replaceTeamMember(selectionKey);}
function DeleteTeam(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.deleteTeam(selectionKey);}
function DeleteDepartment(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.deleteDepartment(selectionKey);}
function CopyTeam(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.copyTeam(selectionKey);}
function CopyDepartment(){var selectionKey=document.getElementById(clientID+'_hfSelections').value
Link.copyDepartment(selectionKey);}