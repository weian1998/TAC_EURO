<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Matching.ascx.cs" Inherits="Matching" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<SalesLogix:ScriptResourceProvider ID="MatchingResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="Error_InvalidEndpoint" />
        <SalesLogix:ResourceKeyName Key="Filter_RemoveCondition" />
        <SalesLogix:ResourceKeyName Key="Filter_AddCondition" />
        <SalesLogix:ResourceKeyName Key="Filter_SpecifyCriteria" />
        <SalesLogix:ResourceKeyName Key="Filter_AndText" />
        <SalesLogix:ResourceKeyName Key="Filter_SearchText" />
        <SalesLogix:ResourceKeyName Key="Filter_OperatorValueRequred" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_Description" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_Header" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_PropertyValue" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_OperatorValue" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_DialogCaption" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_CancelButton" />
        <SalesLogix:ResourceKeyName Key="DefaultCriteria_OKButton" />
    </Keys>
</SalesLogix:ScriptResourceProvider>

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
    SelectedRowStyle-CssClass="rowSelected" ShowEmptyTable="true" EnableViewState="false" DataKeyNames="ResourceTypeName"
    EmptyTableRowText="<%$ resources: grdMatches.EmptyTableRowText %>" ExpandableRows="True" ResizableColumns="True"  
    OnRowEditing="grdMatches_RowEditing" >
    <Columns>
        <asp:TemplateField>
            <ItemTemplate>
                <a href="javascript:onEditMatchConfig('<%# Eval("ResourceTypeName") %>', '<%# Eval("Resource") %>');">
                    <asp:Localize ID="Localize1" runat="server" Text="<%$ resources: grdMatches.Edit.Text %>" />
                </a>
            </ItemTemplate>
        </asp:TemplateField>
        <asp:BoundField DataField="ResourceTypeName" Visible="false"/>
        <asp:BoundField DataField="Resource" HeaderText="<%$ resources: grdMatches.Property.ColumnHeading %>" />
        <asp:BoundField DataField="Description" HeaderText="<%$ resources: grdMatches.Description.ColumnHeading %>" />
    </Columns>
</SalesLogix:SlxGridView>