<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddEditAddress.ascx.cs" Inherits="SmartParts_Address_AddEditAddress" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="AddressForm_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="AddressForm_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="AddressForm_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkAddressHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="accountaddresschange.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
    <asp:HiddenField runat="server" ID="txtEntityId" />
    <asp:HiddenField runat="server" ID="Mode" />
</div>

<table id="tblTest" border="0" cellpadding="1" cellspacing="1" style="width:100%;height:100%;padding-right:10px" >
    <tr>
        <td>
            <asp:Label ID="lblDescription" AssociatedControlID="pklDecription" runat="server" Text="Description:" meta:resourcekey="lblDecription"></asp:Label>
        </td>
        <td style="width: 150px;">
            <SalesLogix:PickListControl runat="server" ID="pklDecription"  PickListId="kSYST0000014" PickListName="Address Description (Account)" AutoPostBack="false" NoneEditable="false" mustExistInlist="false" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="Label1" AssociatedControlID="cbxPrimaryAddr" runat="server" Text="Primary" meta:resourcekey="lblPrimaryAddr"></asp:Label>
        </td>
            <td style="width: 150px;">
                <asp:CheckBox runat="server" ID="cbxPrimaryAddr" Text="" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblIsPrimary" AssociatedControlID="cbxIsPrimary" runat="server" Text="Primary Billing" meta:resourcekey="lblPrimary"></asp:Label>
        </td>
        <td style="width: 150px;">
            <asp:CheckBox runat="server" ID="cbxIsPrimary" Text="" />
        </td>
   </tr>
   <tr>
       <td>
           <asp:Label ID="lblIsShipping" AssociatedControlID="cbxIsShipping" runat="server" Text="Primary Shipping" meta:resourcekey="lblShipping"></asp:Label>
       </td>
       <td style="width: 150px;">
           <asp:CheckBox runat="server" ID="cbxIsShipping" Text="" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblAddressType" AssociatedControlID="pklAddressType" runat="server" Text="Address Type:" meta:resourcekey="lblAddressType"></asp:Label>
        </td>
        <td style="width: 150px;">
            <SalesLogix:PickListControl runat="server" ID="pklAddressType" style="width: 100%" PickListId="kDEMOA0000D5" PickListName="Address Type" AutoPostBack="false" NoneEditable="false" mustExistInlist="true"/>
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblAddress1" AssociatedControlID="txtAddress1" runat="server" Text="Address1:" meta:resourcekey="lblAddress1"></asp:Label>
        </td>
        <td style="width: 150px;">
            <asp:TextBox runat="server" ID="txtAddress1" style="width: 100%" MaxLength="64" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblAddress2"  AssociatedControlID="txtAddress2" runat="server" Text="Address2:" meta:resourcekey="lblAddress2"></asp:Label>
        </td>
        <td style="width: 150px;">
            <asp:TextBox runat="server" ID="txtAddress2" style="width: 100%" MaxLength="64" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblAddress3"  AssociatedControlID="txtAddress3" runat="server" Text="Address3:" meta:resourcekey="lblAddress3"></asp:Label>
        </td>
        <td style="width: 150px;">
            <asp:TextBox runat="server" ID="txtAddress3" style="width: 100%" MaxLength="64" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblCity" AssociatedControlID="pklCity" runat="server" Text="City:" meta:resourcekey="lblCity"></asp:Label>
        </td>
        <td style="width: 150px;">
            <SalesLogix:PickListControl runat="server" ID="pklCity" style="width: 100%" PickListId="kSYST0000384" PickListName="City"
                AutoPostBack="false" NoneEditable="false" mustExistInlist="false"/>
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblState" AssociatedControlID="pklState" runat="server" Text="State:" meta:resourcekey="lblState"></asp:Label>
        </td>
        <td style="width: 150px;">
            <SalesLogix:PickListControl runat="server" ID="pklState" style="width: 100%" PickListId="kSYST0000390" PickListName="State"
                AutoPostBack="false" NoneEditable="false" mustExistInlist="false"/>
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblPostalCode"  AssociatedControlID="txtPostalCode" runat="server" Text="PostalCode:" meta:resourcekey="lblPostalCode"></asp:Label>
        </td>
        <td style="width: 150px; ">
            <asp:TextBox runat="server" ID="txtPostalCode" style="width: 100%" MaxLength="24"  />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblCounty"  AssociatedControlID="txtCounty" runat="server" Text="<%$ resources: txtCounty.Text %>"></asp:Label>
        </td>
        <td style="width: 150px;">
            <asp:TextBox runat="server" ID="txtCounty" style="width: 100%" MaxLength="32" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblCountry" AssociatedControlID="pklCountry" runat="server" Text="Country:" meta:resourcekey="lblCountry"></asp:Label>
        </td>
        <td style="width: 150px;">
            <SalesLogix:PickListControl runat="server" ID="pklCountry" style="width: 100%" PickListId="kSYST0000386" PickListName="Country"
                AutoPostBack="false" NoneEditable="false" mustExistInlist="false" />
        </td>
    </tr>
    <tr>
        <td>
            <asp:Label ID="lblSalutation" AssociatedControlID="txtSalutation" runat="server" Text="Attention:" meta:resourcekey="lblSalutation"></asp:Label>
        </td>
        <td style="width: 150px; ">
            <asp:TextBox runat="server" ID="txtSalutation" style="width: 100%" MaxLength="64" />
        </td>
    </tr>
</table>
<div class="button-bar alignright">
            <asp:Button runat="server" ID="btnSave" CssClass="slxbutton" ToolTip="btnSave" meta:resourcekey="btnSave" />  
            <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" ToolTip="btnCancel" meta:resourcekey="btnCancel" />             
</div>