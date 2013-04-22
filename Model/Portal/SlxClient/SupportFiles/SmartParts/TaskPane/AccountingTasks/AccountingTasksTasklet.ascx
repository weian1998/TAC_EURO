<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AccountingTasksTasklet.ascx.cs" Inherits="AccountingTasksTasklet" %>

<asp:HiddenField ID="hfSelections" runat="server" Value="" />
<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="updateAccountListPanel">
    <ContentTemplate>
        <div runat="server" id="divEntityAccountList" class="task-pane-item-common-tasklist" style="display:none">
            <div runat="server" id="rowlnkLinkAccount_List">
                <div class="task-pane-item-common-tasklist">
                    <asp:Image ID="imgListLink" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=promote_account_16x16"
                        runat="server" AlternateText="<%$ resources: imgLinkAccount.Caption %>" />
                    <asp:LinkButton runat="server" ID="lnkListLinkAccount" CausesValidation="False" Text="<%$ resources: lblLinkAccount.Caption %>" 
                        onclick="lnkLinkAccount_Click" OnClientClick="javascript:return accountingTasksActions.linkAccount();">
                    </asp:LinkButton>
                </div>
            </div>
        </div>
    </ContentTemplate>
</asp:UpdatePanel>

<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="updateAccountPanel">
    <ContentTemplate>
        <div runat="server" id="divEntityAccountDetails" class="task-pane-item-common-tasklist" style="display:none">
            <div runat="server" id="rowlnkLinkAccount" class="task-pane-item-common-tasklist">
                <asp:Image ID="imgLinkAccount" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=promote_account_16x16"
                    runat="server" AlternateText="<%$ resources: imgLinkAccount.Caption %>" />
                <asp:LinkButton runat="server" ID="lblLinkAccount" CausesValidation="False" Text="<%$ resources: lblLinkAccount.Caption %>" 
                    onclick="lnkLinkAccount_Click" OnClientClick="javascript:return accountingTasksActions.linkAccount();">
                </asp:LinkButton>
            </div>
            <br />
            <div runat="server" id="rowlnkLinkStatus" class="task-pane-item-common-tasklist">
                <asp:Label ID="lblLinkStatus" runat="server" Text="<%$ resources: lblStatus.Caption %>"></asp:Label>
                <asp:Label ID="lblLinkedStatus" runat="server" Font-Bold="True" Text="<%$ resources: Status_Linked.Caption %>"></asp:Label>
                <asp:Label ID="lblNotLinkedStatus" runat="server" Font-Bold="True" ForeColor="#FF3300"
                    Text="<%$ resources: Status_NotLinked.Caption %>">
                </asp:Label>
            </div>
            <div runat="server" id="rowLastUpdate" class="task-pane-item-common-tasklist">
                <asp:Label ID="lblLastUpdate" runat="server" Text="<%$ resources: lblLastUpdate.Caption %>"></asp:Label>
            </div>
        </div>
     </ContentTemplate>
</asp:UpdatePanel>

<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="updateSOPanel">
    <ContentTemplate>
        <div runat="server" id="divEntitySalesOrder" class="task-pane-item-common-tasklist" style="display:none">
            <div runat="server" id="rowCheckPrices" class="task-pane-item-common-tasklist">
                <asp:Image ID="imgCheckPrices" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=update_price_list_16x16"
                    runat="server" AlternateText="<%$ resources: lnkCheckPrices.Caption %>" />
                <asp:LinkButton runat="server" ID="lnkCheckPrices" CausesValidation="False" Text="<%$ resources: lnkCheckPrices.Caption %>" 
                    onclick="lnkCheckPrices_Click" OnClientClick="javascript:return accountingTasksActions.checkPrices();">
                </asp:LinkButton>
                <br />
            </div>
            <div runat="server" id="rowSOSubmit" class="task-pane-item-common-tasklist">
                <asp:Image ID="imgSOSubmit" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=submit_to_accounting_sys_16x16"
                    runat="server" AlternateText="<%$ resources: imgSOSubmit.Caption %>" />
                <asp:LinkButton runat="server" ID="lnkSOSubmit" CausesValidation="False" Text="<%$ resources: lnkSOSubmit.Caption %>" 
                    onclick="lnkSubmitSalesOrder_Click" OnClientClick="javascript:return accountingTasksActions.submitSalesOrder();">
                </asp:LinkButton>
                <br />
            </div>
            <div runat="server" id="rowSOStatus" class="task-pane-item-common-tasklist">
                <asp:Label ID="lblSOStatus" runat="server" Text="<%$ resources: lblStatus.Caption %>"></asp:Label>
                <asp:Label ID="lblStatus" runat="server" Font-Bold="True" Text="<%$ resources: Status.Caption %>"></asp:Label>
                <br />
            </div>
            <div runat="server" id="divSOLastUpdate" class="task-pane-item-common-tasklist">
                <asp:Label ID="lblSOSubmittedOn" runat="server" Text="<%$ resources: lblSOSubmittedOn.Caption %>"></asp:Label>
            </div>
        </div>
     </ContentTemplate>
</asp:UpdatePanel>

<script type="text/javascript">
    var accountingTasksActions;
    require(['Sage/TaskPane/AccountingTasksTasklet'],
           function (AccountingTasksTasklet) {
               dojo.ready(function () {
                   if (!accountingTasksActions) {
                       accountingTasksActions = new AccountingTasksTasklet({
                           id: "accountingTasksActions",
                           clientId: "<%= ClientID %>"
                       });
                   }
               });
           }
       );
</script>