<%@ Control  Language="C#" AutoEventWireup="true" CodeFile="AddEditPickListItem.ascx.cs" inherits="AddEditPickListItem" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<asp:HiddenField ID="hdPickListId" runat="server" value=""></asp:HiddenField>
<asp:HiddenField ID="hdPickListItemId" runat="server" value=""></asp:HiddenField>
<asp:HiddenField ID="hdMode" runat="server" value=""></asp:HiddenField>
<asp:HiddenField ID="hdIsDefault" runat="server" value=""></asp:HiddenField>

<SalesLogix:SmartPartToolsContainer runat="server" ID="AddEditItem_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkPicklistEditItemsHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help"
        NavigateUrl="Managing_Items_in_a_Pick_List" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="txtItemText_lbl" AssociatedControlID="txtItemText" runat="server" Text="<%$ resources: txtItemText.Caption %>" ></asp:Label>
            </div>
            <div class="textcontrol">
                <asp:TextBox runat="server" ID="txtItemText" Rows="1" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class=" lbl alignleft">
                <asp:Label ID="txtCode_lbl" AssociatedControlID="txtCode" runat="server" Text="<%$ resources: txtCode.Caption %>" ></asp:Label>
            </div>
            <div class="textcontrol">
                <asp:TextBox runat="server" ID="txtCode" Rows="1" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="txtOrder_lbl" AssociatedControlID="txtOrder" runat="server" Text="<%$ resources: txtOrder.Caption %>" ></asp:Label>
            </div>
            <div class="textcontrol">
                <asp:TextBox runat="server" ID="txtOrder" Rows="1" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div class="slxlabel alignleft checkbox">
                <SalesLogix:SLXCheckBox runat="server" ID="chkIsDefaultItem" CssClass="" Text="<%$ resources: chkIsDefaultItem.Caption %>" TextAlign="right" />
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <asp:Panel runat="server" ID="QFControlsList" CssClass="controlslist qfActionContainer">
                <asp:Button ID="btnSaveNew" Text="<%$ resources: btnSaveNew.Caption %>" runat="server" CssClass="slxbutton" />
                <asp:Button ID="btnOK" Text="<%$ resources: btnOK.Caption %>" runat="server" CssClass="slxbutton"
                    OnClientClick="var x = new Sage.UI.Controls.PickList({});x.clear(x._storageNameSpace);" />
                <asp:Button ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" runat="server" CssClass="slxbutton" />
            </asp:Panel>
        </td>
    </tr>
</table>