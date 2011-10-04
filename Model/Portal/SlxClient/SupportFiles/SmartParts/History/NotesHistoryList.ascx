<%@ Control Language="C#" CodeFile="NotesHistoryList.ascx.cs" Inherits="SmartParts_History_NotesHistoryList" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<style type="text/css">
    .historyList .activityType 
    {
        background-image: url(images/icons/note_16x16.gif);
        background-repeat: no-repeat;
        padding-left: 18px;
        display: inline-block;  /* inline-block fixes problem in IE where element loses its padding */
    }
    .historyList .atPhoneCall 
    {
        background-image: url(images/icons/Call_16x16.gif);
    }
    .historyList .atAppointment 
    {
        background-image: url(images/icons/Meeting_16x16.gif);
    }
    .historyList .atEMail 
    {
        background-image: url(images/icons/mailletter_16x16.gif);
    }
    .historyList .atLiteratureRequest, .sssHistoryGrid span.atDocument 
    {
        background-image: url(images/icons/mailletter_16x16.gif);
    }
    .historyList .atPersonal
    {
        background-image: url(images/icons/Personal_16x16.gif);
    }       
    
    .historyList .atToDo
    {
        background-image: url(images/icons/To_Do_16x16.gif);
    } 
    
    .historyList .atDatabaseChange
    {
        background-image: url(images/icons/note_16x16.gif);
    } 
    
    .historyList .atFax
    {
        background-image: url(images/icons/fax_16x16.gif);
    } 
    
    .historyList .atDoc
    {
        background-image: url(images/icons/Document_Type_16x16.gif);
    } 
      
    .historyList .atSchedule
    {
        background-image: url(images/icons/Schedule_Event_16x16.gif);
    } 
    
    .historyList .atInternal
    {
        background-image: url(images/icons/Document_Type_16x16.gif);
    }       
    .filterPanel .filterItem
    {
        padding:2px;
    } 
    
    .filterPanel
    {
        height:auto;
        padding:2px;
                    
    } 
    .historyList .clearfix:after
    {
     content: ".";
     visibility: hidden;
     display: block;
     height: 0;
     clear: both;
    }  
    
    .chkShowDBChanges
    {
        padding:2px;
        margin-left:20%;
    } 
            
</style>


<div class="historyList" id="historyDiv"><%--  We need a "container" div --%>
    <div id="placeholder" runat="server" style="height:400px; "></div>
</div>

<div>
<Saleslogix:ScriptResourceProvider ID="NotesHistoryResources" runat="server">
    <Keys>
        <Saleslogix:ResourceKeyName Key="chkShowDbChangesLabel" />
        <Saleslogix:ResourceKeyName Key="optSelectAll" />
        <Saleslogix:ResourceKeyName Key="PleaseSelectRecords" />
        <Saleslogix:ResourceKeyName Key="UnableToFindWord" />
        <Saleslogix:ResourceKeyName Key="SendEmail" />
        <Saleslogix:ResourceKeyName Key="SendWord" />
        <Saleslogix:ResourceKeyName Key="AddNote" />
        <Saleslogix:ResourceKeyName Key="AddActivity" />
        <Saleslogix:ResourceKeyName Key="colUser" />
        <Saleslogix:ResourceKeyName Key="colAccount" />
        <Saleslogix:ResourceKeyName Key="colContact" />
        <Saleslogix:ResourceKeyName Key="colDescription" />
        <Saleslogix:ResourceKeyName Key="colDate" />
        <Saleslogix:ResourceKeyName Key="colType" />
        <Saleslogix:ResourceKeyName Key="AccountName" />
        <Saleslogix:ResourceKeyName Key="PrintedOn" />
        <Saleslogix:ResourceKeyName Key="Notes" />
    </Keys>
</Saleslogix:ScriptResourceProvider>
</div>