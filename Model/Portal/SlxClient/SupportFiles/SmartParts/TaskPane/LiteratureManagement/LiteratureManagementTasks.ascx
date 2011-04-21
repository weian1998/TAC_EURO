<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LiteratureManagementTasks.ascx.cs" Inherits="SmartParts_TaskPane_LiteratureManagementTasks" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="SalesLogix" %>

<asp:HiddenField ID="hfSelections" runat="server" Value="" />
<asp:HiddenField ID="hfLastFulfilledIds" runat="server" Value="" />
 <style>
 a 
 {
     line-height: 1.22em;
 }
 </style>
<div id="<%= ClientID %>" class="task-pane-item-common-tasklist">
        <div>
        <!-- the separate control with color is used because higher-level styles allow the link to be active even when the linkButton is disabled -->
        <asp:Label ID="disabledFulfillLink" runat="server" Enabled="false" ForeColor="#BBBBBB" Text="<%$ resources: TaskText_Fulfill %>" Visible="false"></asp:Label>
        <asp:LinkButton runat="server" ID="btnFulfill"
        CausesValidation="False" Text="<%$ resources: TaskText_Fulfill %>" 
        onclick="btnFulfill_Click" OnClientClick="javascript:return FulfillLiteratureTask();">          
        </asp:LinkButton><br />

        <asp:LinkButton runat="server" ID="btnComplete" 
        CausesValidation="False" Text="<%$ resources: TaskText_Complete %>"
        onclick="btnComplete_Click"  OnClientClick="javascript:return ValidateLiteratureTask();">            
        </asp:LinkButton><br />   

        <asp:LinkButton runat="server" ID="btnReject" 
        CausesValidation="False" Text="<%$ resources: TaskText_Reject %>"
        onclick="btnReject_Click"  OnClientClick="javascript:return ValidateLiteratureTask();">
        </asp:LinkButton><br />               

        <asp:LinkButton runat="server" ID="btnRefresh" 
        CausesValidation="False"  Text="<%$ resources: TaskText_Refresh %>"
        OnClientClick="javascript:RefreshList();">
        </asp:LinkButton><br />

        <asp:Label runat="server" Text="<%$ resources: TaskText_PrintLabels %>"></asp:Label><br />
        <asp:DropDownList ID="LabelsDropdown" runat="server">
        </asp:DropDownList>                          
        </div>
 </div>        

  <script type="text/javascript">
var <%= ID %>;
$(document).ready(function(){
    if (!<%= ID %>)
    {
        <%= ID %> = new Sage.TaskPane.LiteratureManagementTasks({
            id: "<%= ID %>",
            clientId: "<%= ClientID %>"        
        });
        <%= ID %>.init();  
    }        
});


</script>

<SalesLogix:ScriptResourceProvider ID="LiteratureManagementResx" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="Msg_Select_Records" />
        <SalesLogix:ResourceKeyName Key="Msg_Select_Records_Title" />
        <SalesLogix:ResourceKeyName Key="Err_SelectionInfo" />
        <SalesLogix:ResourceKeyName Key="Err_Fulfill" />
        <SalesLogix:ResourceKeyName Key="Err_FulfillEx" />
        <SalesLogix:ResourceKeyName Key="Fulfill_Success" />
        <SalesLogix:ResourceKeyName Key="Err_MailMergeService" />
        <SalesLogix:ResourceKeyName Key="Err_FulfillCanceled" />
        <SalesLogix:ResourceKeyName Key="Err_FulfillFailed" />
    </Keys>
</SalesLogix:ScriptResourceProvider>