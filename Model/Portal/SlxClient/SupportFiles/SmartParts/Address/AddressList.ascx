<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AddressList.ascx.cs" Inherits="SmartParts_AddressList" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="Address_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="Address_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="Address_RTools" runat="server">
        <asp:ImageButton runat="server" ID="btnAdd" ToolTip="<%$ resources: btnAdd.ToolTip %>" ImageUrl="~\images\icons\plus_16X16.gif" />
        <SalesLogix:PageLink ID="lnkAddressHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="addressestab.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
    <asp:HiddenField ID="ConfirmMessage" runat="server" meta:resourcekey="ConfirmMessage"/>
</div>
<SalesLogix:SlxGridView runat="server" ID="AddressGrid" GridLines="None" AutoGenerateColumns="false" CellPadding="4" AllowPaging="true" PageSize="10" ResizableColumns="true"
    ShowEmptyTable="true" OnRowDataBound="AddressGrid_RowDataBound" EmptyTableRowText="<%$ resources: AddressGrid_NoRecordFound.EmptyTableRowText %>"
    OnRowCommand="AddressGrid_RowCommand" OnRowEditing="AddressGrid_RowEditing" OnRowDeleting="AddressGrid_RowDeleting" OnSorting="AddressGrid_Sorting"
    DataKeyNames="Id" AllowSorting="true" RowSelect="true" EnableViewState="false" CssClass="datagrid" ShowSortIcon="true" ExpandableRows="False"
    AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt" PagerStyle-CssClass="gridPager" SelectedRowStyle-CssClass="rowSelected" >
    <Columns>
        <asp:ButtonField CommandName="Edit" Text="<%$ resources: AddressGrid_Edit.Text %>" /> 
        <asp:ButtonField CommandName="Delete" Text="<%$ resources: AddressGrid_Delete.Text %>" />
        <asp:TemplateField HeaderText="<%$ resources: AddressGrid_PrimaryAddress.HeaderText %>" SortExpression="PrimaryAddress">
            <ItemTemplate><%# ConvertBoolean(Eval("PrimaryAddress")) %></ItemTemplate>
        </asp:TemplateField>
        <asp:TemplateField HeaderText="<%$ resources: AddressGrid_Primary.HeaderText %>" SortExpression="IsPrimary">
            <ItemTemplate><%# ConvertBoolean(Eval("IsPrimary")) %></ItemTemplate>
        </asp:TemplateField>
        <asp:TemplateField HeaderText="<%$ resources: AddressGrid_Shipping.HeaderText %>" SortExpression="IsMailing">
            <ItemTemplate><%# ConvertBoolean(Eval("IsMailing")) %></ItemTemplate>
        </asp:TemplateField>
        <asp:BoundField DataField="AddressType" HeaderText="<%$ resources: AddressGrid_AddressType_HeaderText %>" SortExpression="AddressType" />
        <asp:BoundField DataField="Description" HeaderText="<%$ resources: AddressGrid_Description.HeaderText %>" SortExpression="Description" />
        <asp:BoundField DataField="Salutation" HeaderText="<%$ resources: AddressGrid_Attention.HeaderText %>" SortExpression="Salutation" />
        <asp:BoundField DataField="StreetAddress" HeaderText="<%$ resources: AddressGrid_Address1.HeaderText %>" SortExpression="Address1" />
        <asp:BoundField DataField="City" HeaderText="<%$ resources: AddressGrid_City.HeaderText %>"  SortExpression="City" />
        <asp:BoundField DataField="State" HeaderText="<%$ resources: AddressGrid_State.HeaderText %>" SortExpression="State" />
        <asp:BoundField DataField="PostalCode" HeaderText="<%$ resources: AddressGrid_PostalCode.HeaderText %>" SortExpression="PostalCode" />
        <asp:BoundField DataField="Country" HeaderText="<%$ resources: AddressGrid_Country.HeaderText %>" SortExpression="Country" />
    </Columns>
    <asp:PagerSettings Mode="NumericFirstLast" FirstPageImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Start_16x16" 
        LastPageImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=End_16x16" />
</SalesLogix:SlxGridView>
        