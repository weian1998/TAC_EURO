<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddPickList.ascx.cs" inherits="AddPickList"  %>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <tr>
        <td>
            <div class="lbl alignleft">
                <asp:Label ID="txtPicklistName_lbl" AssociatedControlID="txtPicklistName" runat="server" Text="<%$ resources: txtPicklistName.Caption %>"></asp:Label>
            </div>
            <div class="textcontrol">
                <asp:TextBox runat="server" ID="txtPicklistName" Rows="1" dojoType="Sage.UI.Controls.TextBox"></asp:TextBox>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
                <asp:Button ID="btnOK" Text="<%$ resources: btnOK.Caption %>" runat="server" CssClass="slxbutton" />
                <asp:Button ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" runat="server" CssClass="slxbutton" />
            </asp:Panel>
        </td>
    </tr>
</table>