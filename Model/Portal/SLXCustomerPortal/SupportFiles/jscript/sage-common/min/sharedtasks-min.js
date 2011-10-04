/*
 * SageSalesLogixCommon
 * Copyright(c) 2009, Sage Software.
 * 
 * 
 */


Sage.namespace('TaskPane');Sage.TaskPane.Utility={getCurrentEntityType:function(){var entityType="";if(Sage.Services.hasService("ClientEntityContext")){var entitySvc=Sage.Services.getService("ClientEntityContext");if(entitySvc){var context=entitySvc.getContext();if(context){entityType=context.EntityType;if(entityType){entityType=entityType.split('.').pop();}}}}
return entityType;},getCurrentViewMode:function(){var viewMode="List";if(Sage.Services.hasService("ClientContextService")){var contextSvc=Sage.Services.getService("ClientContextService");if(contextSvc){if(contextSvc.containsKey("modeid")){viewMode=contextSvc.getValue("modeid");}}}
return viewMode;}}
if(!Sage.TaskPane.Shared){Sage.TaskPane.Shared=function(){this.isAdHoc=false;this.hasAdHoc=false;this.commonTaskContainer=$("ul[id$='CommonTasksTasklet']");this.determineAdHocStatus();this.groupInfoList={};this.currentGroupInfo={};};Sage.TaskPane.Shared.prototype.determineAdHocStatus=function(){var svc=Sage.Services.getService("GroupManagerService");this.groupInfoList=svc.findGroupInfoList();this.currentGroupInfo=(typeof(getCurrentGroupInfo)==="function")?getCurrentGroupInfo():null;if(this.currentGroupInfo){this.isAdHoc=this.currentGroupInfo.isAdhoc;this.hasAdHoc=false;if(this.groupInfoList&&this.groupInfoList.groupInfos){var groupLen=this.groupInfoList.groupInfos.length;for(var i=0;i<groupLen;i++){if(this.groupInfoList.groupInfos[i].groupID!=this.currentGroupInfo.Id&&this.groupInfoList.groupInfos[i].isAdHoc){this.hasAdHoc=true;break;}}}}}
Sage.TaskPane.Shared.prototype.showCommonLinks=function(){var that=this;var container=$("ul[id*='item_CommonTasksTasklet_CommonTasksTasklet']");if(container.find("a").size()==0){if(that.hasAdHoc){that.commonTaskContainer.append("<li><a href='#' onclick='showAdHocList(Ext.EventObject);'>"+Sage.TaskPane.SharedResources.addtogroup_linktext+"</a></li>");}
if(that.isAdHoc){that.commonTaskContainer.append("<li><a href='#' onclick='removeSelectionsFromGroup();'>"+Sage.TaskPane.SharedResources.removefromgroup_linktext+"</a></li>");}
var viewMode=Sage.TaskPane.Utility.getCurrentViewMode();if(new RegExp("list","i").test(viewMode)){that.commonTaskContainer.append("<li><a href='#' onclick='saveSelectionsAsNewGroup();'>"+Sage.TaskPane.SharedResources.saveasnewgroup_linktext+"</a></li>");that.commonTaskContainer.append("<li><a href='#' onclick='exportToExcel();'>"+Sage.TaskPane.SharedResources.exporttofile_linktext+"</a></li>");}
var hasVisibleChildren=container.find("a:visible").size()>0;if(!hasVisibleChildren){container.parents(".task-pane-item").css("display","none");}}};}
$(document).ready(function(){var container=$("ul[id*='item_CommonTasksTasklet_CommonTasksTasklet']");if(container.size()>0&&Sage.TaskPane.Utility.getCurrentEntityType()!==""){var sharedTasks=new Sage.TaskPane.Shared();sharedTasks.showCommonLinks();Sage.TaskPane.prm=Sys.WebForms.PageRequestManager.getInstance();Sage.TaskPane.prm.add_pageLoaded(function(sender,args){var st=new Sage.TaskPane.Shared();st.showCommonLinks();});}});