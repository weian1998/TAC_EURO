<%@ Control Language="C#" AutoEventWireup="true" CodeFile="UpdateContactOptions.ascx.cs" Inherits="SmartParts_Contact_UpdateContactOptions" %>

<table id="tblOptions" border="0" cellpadding="1" cellspacing="2" class="formtable">
    <tr>      
        <td>
            <span>
                <asp:Label ID="lblTopMsg" runat="server" Text="<%$ resources: lblTopMsg.Text %>"></asp:Label>
            </span>
        </td>
    </tr>  
    <tr>
        <td colspan="2" style="padding:5px 0px;">
            <span>
                <hr />
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <div id="divAddress" runat="server" style="display:none">
                <span class="lbltop">
                    <asp:Label ID="lblAddress" AssociatedControlID="chkAddress" runat="server" Text="<%$ resources: lblAddress.Text %>"></asp:Label>
                </span>
                <span >
                    <asp:CheckBox runat="server" ID="chkAddress" Checked="false" Enabled ="false" Text="<%$ resources: chkAddress.Text %>" />
                </span> 
            </div>
        </td>
    </tr>
    <tr>   
        <td>
            <div id="divSalesOrderAddress" runat="server" style="display:none">
                <span>
                    <asp:CheckBox runat="server" ID="chkSalesOrderAddress" Checked="false" Enabled ="false" Text="<%$ resources: chkSalesOrderAddress.Text %>" />
                </span>
            </div>
        </td>
    </tr>
    <tr>
        <td> 
            <div id="divPhone" runat="server" style="display:none">
                <span class="lbltop">
                    <asp:Label ID="lblPhone" AssociatedControlID="chkPhone" runat="server" Text="<%$ resources: lblPhone.Text %>"></asp:Label>
                </span>
                <span>
                    <asp:CheckBox runat="server" ID="chkPhone" Checked="false" Enabled ="false" Text="<%$ resources: chkPhone.Text %>" />
                </span>
            </div>
        </td>
    </tr>
    <tr>
        <td>
            <div id="divFax" runat ="server" style="display:none">
                <span class="lbltop">
                    <asp:Label ID="lblFax" AssociatedControlID="chkFax" runat="server" Text="<%$ resources: lblFax.Text %>"></asp:Label>
                </span>
                <span>
                    <asp:CheckBox runat="server" ID="chkFax" Checked="false" Enabled ="false" Text="<%$ resources: chkFax.Text %>" />
                </span>
            </div>
        </td>
    </tr>
    <tr>  
        <td>
            <div id="divWeb" runat ="server" style="display:none">
                <span class="lbltop">
                    <asp:Label ID="lblWeb" AssociatedControlID="chkWeb" runat="server" Text="<%$ resources: lblWeb.Text %>"></asp:Label>
                </span>
                <span>
                    <asp:CheckBox runat="server" ID="chkWeb" Checked="false" Enabled ="false" Text="<%$ resources: chkWeb.Text %>" />
                </span>
            </div>
        </td>
    </tr>
    <tr>
        <td class="qfActionContainer">
            <asp:Button runat="server" ID="btnOK" Text="<%$ resources: btnOk.Text %>" CssClass="slxbutton" />
            <asp:Button runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Text %>" CssClass="slxbutton" />
        </td>
    </tr>
</table>