<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Matching.ascx.cs" Inherits="Matching" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="Matching_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkMatchingHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources:Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Matching_Tab"
            ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<SalesLogix:SlxGridView runat="server" ID="grdMatches" GridLines="None" AutoGenerateColumns="false" CellPadding="4"
    CssClass="datagrid" PagerStyle-CssClass="gridPager" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt"
    SelectedRowStyle-CssClass="rowSelected" ShowEmptyTable="true" EnableViewState="false" DataKeyNames="ResourceKind"
    EmptyTableRowText="<%$ resources: grdMatches.EmptyTableRowText %>" ExpandableRows="True" ResizableColumns="True"  
    OnRowEditing="grdMatches_RowEditing" >
    <Columns>
        <asp:TemplateField>
            <ItemTemplate>
                <a href="javascript:matchingOptionsConfig.onEditMatchConfig('<%# Eval("ResourceKind") %>', '<%# Eval("Resource") %>');">
                    <asp:Localize ID="Localize1" runat="server" Text="<%$ resources: grdMatches.Edit.Text %>" />
                </a>
            </ItemTemplate>
        </asp:TemplateField>
        <asp:BoundField DataField="ResourceKind" Visible="false"/>
        <asp:BoundField DataField="Resource" HeaderText="<%$ resources: grdMatches.Property.ColumnHeading %>" />
        <asp:BoundField DataField="Description" HeaderText="<%$ resources: grdMatches.Description.ColumnHeading %>" />
    </Columns>
</SalesLogix:SlxGridView>