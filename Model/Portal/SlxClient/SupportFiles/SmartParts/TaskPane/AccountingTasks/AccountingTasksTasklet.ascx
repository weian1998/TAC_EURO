<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AccountingTasksTasklet.ascx.cs" Inherits="AccountingTasksTasklet" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="SalesLogix" %>

<asp:HiddenField ID="hfSelections" runat="server" Value="" />
<div runat="server" id="divEntityAccountList" class="task-pane-item-common-tasklist" style="display:none">
    <table border="0" cellpadding="1" cellspacing="0" class="formtable">
        <col width="100%" />
        <tr runat="server" id="rowlnkLinkAccount_List">
            <td>
                <div>
                    <asp:Image ID="imgListLink" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=promote_account_16x16"
                        runat="server" AlternateText="<%$ resources: imgLinkAccount.Caption %>" />
                    <asp:LinkButton runat="server" ID="lnkListLinkAccount" CausesValidation="False" Text="<%$ resources: lblLinkAccount.Caption %>" 
                        onclick="lnkLinkAccount_Click" OnClientClick="javascript:return LinkAccount();">
                    </asp:LinkButton>
                </div>
            </td>
        </tr>
    </table>
</div>

<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="updateAccountPanel">
    <ContentTemplate>
        <div runat="server" id="divEntityAccountDetails" class="task-pane-item-common-tasklist" style="display:none">
            <table border="0" cellpadding="1" cellspacing="0" class="formtable">
                <col width="100%" />
                <tr runat="server" id="rowlnkLinkAccount">
                    <td>
                        <div>
                            <asp:Image ID="imgLinkAccount" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=promote_account_16x16"
                                runat="server" AlternateText="<%$ resources: imgLinkAccount.Caption %>" />
                            <asp:LinkButton runat="server" ID="lblLinkAccount" CausesValidation="False" Text="<%$ resources: lblLinkAccount.Caption %>" 
                                onclick="lnkLinkAccount_Click" OnClientClick="javascript:return LinkAccount();">
                            </asp:LinkButton>
                        </div>
                        <br />
                        <br />
                    </td>
                </tr>
                <tr runat="server" id="rowlnkLinkStatus">
                    <td>
                        <asp:Label ID="lblLinkStatus" runat="server" Text="<%$ resources: lblStatus.Caption %>"></asp:Label>
                        <asp:Label ID="lblLinkedStatus" runat="server" Font-Bold="True" Text="<%$ resources: Status_Linked.Caption %>"></asp:Label>
                        <asp:Label ID="lblNotLinkedStatus" runat="server" Font-Bold="True" ForeColor="#FF3300"
                            Text="<%$ resources: Status_NotLinked.Caption %>">
                        </asp:Label>
                    </td>
                </tr>
                <tr runat="server" id="rowLastUpdate">
                    <td>
                        <asp:Label ID="lblLastUpdate" runat="server" Text="<%$ resources: lblLastUpdate.Caption %>"></asp:Label>
                    </td>
                </tr>
            </table>
         </div>
     </ContentTemplate>
</asp:UpdatePanel>

<asp:UpdatePanel UpdateMode="Conditional" runat="server" ID="updateSOPanel">
    <ContentTemplate>
         <div runat="server" id="divEntitySalesOrder" class="task-pane-item-common-tasklist" style="display:none">
            <table border="0" cellpadding="1" cellspacing="0" class="formtable">
                <col width="100%" />
                <tr runat="server" id="rowCheckPrices">
                    <td>
                        <div>
                            <asp:Image ID="imgCheckPrices" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=update_price_list_16x16"
                                runat="server" AlternateText="<%$ resources: lnkCheckPrices.Caption %>" />
                            <asp:LinkButton runat="server" ID="lnkCheckPrices" CausesValidation="False" Text="<%$ resources: lnkCheckPrices.Caption %>" 
                                onclick="lnkCheckPrices_Click" OnClientClick="javascript:return CheckPrices();">
                            </asp:LinkButton>
                        </div>
                        <br />
                    </td>
                </tr>
                <tr runat="server" id="rowSOSubmit">
                    <td>
                        <div>
                            <asp:Image ID="imgSOSubmit" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=submit_to_accounting_sys_16x16"
                                runat="server" AlternateText="<%$ resources: imgSOSubmit.Caption %>" />
                            <asp:LinkButton runat="server" ID="lnkSOSubmit" CausesValidation="False" Text="<%$ resources: lnkSOSubmit.Caption %>" 
                                onclick="lnkSubmitSalesOrder_Click" OnClientClick="javascript:return SubmitSalesOrder();">
                            </asp:LinkButton>
                        </div>
                        <br />
                    </td>
                </tr>
                <tr runat="server" id="rowSOStatus">
                    <td>
                        <div>
                            <asp:Label ID="lblSOStatus" runat="server" Text="<%$ resources: lblStatus.Caption %>"></asp:Label>
                            <asp:Label ID="lblStatus" runat="server" Font-Bold="True" Text="<%$ resources: Status.Caption %>"></asp:Label>
                        </div>
                        <br />
                    </td>
                </tr>
                <tr>
                    <td>
                        <div runat="server" id="divSOLastUpdate">
                            <asp:Label ID="lblSOSubmittedOn" runat="server" Text="<%$ resources: lblSOSubmittedOn.Caption %>"></asp:Label>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
     </ContentTemplate>
</asp:UpdatePanel>

<script type="text/javascript">
    var <%= ID %>;
    $(document).ready(function(){
        if (!<%= ID %>)
        {
            <%= ID %> = new Sage.TaskPane.AccountingTasksTasklet({
                id: "<%= ID %>",
                clientId: "<%= ClientID %>"        
            });
            <%= ID %>.init();  
        }        
    });
</script>

<SalesLogix:ScriptResourceProvider ID="AccountingTasksResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="Msg_Select_Records" />
        <SalesLogix:ResourceKeyName Key="Msg_Select_Records_Title" />
        <SalesLogix:ResourceKeyName Key="Err_SelectionInfo" />
    </Keys>
</SalesLogix:ScriptResourceProvider>