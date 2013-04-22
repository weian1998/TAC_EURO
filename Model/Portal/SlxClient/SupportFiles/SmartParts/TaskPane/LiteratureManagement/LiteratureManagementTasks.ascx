<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LiteratureManagementTasks.ascx.cs" Inherits="SmartParts_TaskPane_LiteratureManagementTasks" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>

<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="SAG">
    <ContentTemplate>
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
                <asp:LinkButton runat="server" ID="btnFulfill" CausesValidation="False" Text="<%$ resources: TaskText_Fulfill %>" 
                    onclick="btnFulfill_Click" OnClientClick="javascript:return literatureManagementActions.fulfillLiteratureTask();">          
                </asp:LinkButton>
                <br />
                <asp:LinkButton runat="server" ID="btnComplete" CausesValidation="False" Text="<%$ resources: TaskText_Complete %>"
                    onclick="btnComplete_Click" OnClientClick="javascript:return literatureManagementActions.validateLiteratureTask();">            
                </asp:LinkButton>
                <br />
                <asp:LinkButton runat="server" ID="btnReject" CausesValidation="False" Text="<%$ resources: TaskText_Reject %>"
                    onclick="btnReject_Click" OnClientClick="javascript:return literatureManagementActions.validateLiteratureTask();">
                </asp:LinkButton>
                <br />
                <asp:LinkButton runat="server" ID="btnRefresh" CausesValidation="False"  Text="<%$ resources: TaskText_Refresh %>"
                    OnClientClick="javascript:literatureManagementActions.refreshList();">
                </asp:LinkButton>
                <br />
                <asp:Label ID="Label1" runat="server" Text="<%$ resources: TaskText_PrintLabels %>"></asp:Label>
                <br />
                <asp:DropDownList ID="LabelsDropdown" data-dojo-type="Sage.UI.Controls.Select" 
                    CssClass="select-control" shouldPublishMarkDirty="false" runat="server" 
                    onselectedindexchanged="LabelsDropdown_SelectedIndexChanged"></asp:DropDownList>                          
            </div>
        </div>        
        <script type="text/javascript">
            var literatureManagementActions = null;
            require(['Sage/TaskPane/LiteratureManagementTasks'],
                   function (LiteratureManagementTasks) {
                       dojo.ready(function () {
                           if (literatureManagementActions === null) {
                               literatureManagementActions = new LiteratureManagementTasks({
                                   id: "literatureManagementActions",
                                   clientId: "<%= ClientID %>"
                               });
                           }
                       });
                   }
               );
        </script>
    </ContentTemplate>
</asp:UpdatePanel>