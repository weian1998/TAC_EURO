<%@ Control Language="C#" AutoEventWireup="true" CodeFile="PickListItems.ascx.cs" Inherits="SmartPart_PickListItems" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="Items_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="Items_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="Items_RTools" runat="server">
        <asp:ImageButton runat="server" ID="btnAdd" ToolTip="Add Items" meta:resourcekey="btnAdd" ImageUrl="~\images\icons\plus_16X16.gif"  />
        <SalesLogix:PageLink ID="lnkPicklistItemsHelp" runat="server" LinkType="HelpFileName"  ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help"
            NavigateUrl="Pick_List_Items_Tab" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
    <asp:HiddenField ID="ConfirmMessage" runat="server" meta:resourcekey="ConfirmMessage"/>
</div>
<SalesLogix:SlxGridView runat="server" ID="grdPicklistItems" GridLines="None" AutoGenerateColumns="False" CellPadding="4" CssClass="datagrid" AlternatingRowStyle-CssClass="rowdk" 
    RowStyle-CssClass="rowlt" ShowEmptyTable="True" EmptyTableRowText="<%$ resources: grdPicklistItems.EmptyTableRowText %>" AllowSorting="True" PageSize="15"
    OnRowDataBound="grdPicklistItems_RowDataBound" OnRowCommand="grdPicklistItems_RowCommand" OnRowEditing="grdPicklistItems_RowEditing" AllowPaging="true"
    OnRowDeleting="grdPicklistItems_RowDeleting" OnSorting="grdPicklistItems_Sorting" DataKeyNames="PickListItemId, PickListId" EnableViewState="False"
    RowSelect="True" SortAscImageUrl="" SortDescImageUrl="">
    <Columns>
        <asp:BoundField DataField="OrderSeq" HeaderText="Order" SortExpression="OrderSeq" meta:resourcekey="grd_Order" />
        <asp:BoundField DataField="Text" HeaderText="Text" SortExpression="Text" meta:resourcekey="grd_Text" />
        <asp:BoundField DataField="Code" HeaderText="Code" SortExpression="Code" meta:resourcekey="grd_Code"  />
        <asp:TemplateField HeaderText="Is Default" meta:resourcekey="grd_Default">
            <ItemTemplate>
                <asp:CheckBox id="chkDefault" runat="server" EnableTheming="true" enabled="false" checked='<%# IsDefault(Eval("PickListItemId"))%>'></asp:CheckBox>  
            </ItemTemplate>
        </asp:TemplateField>
        <asp:ButtonField CommandName="Edit" Text="Edit" meta:resourcekey="grd_Edit" />
        <asp:ButtonField CommandName="Delete" Text="Delete" meta:resourcekey="grd_Delete" />
    </Columns>
    <RowStyle CssClass="rowlt" />
    <AlternatingRowStyle CssClass="rowdk" />
</SalesLogix:SlxGridView>