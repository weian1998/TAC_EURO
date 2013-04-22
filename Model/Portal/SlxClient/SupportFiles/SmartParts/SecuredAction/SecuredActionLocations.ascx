<%@ Control Language="C#" AutoEventWireup="true" CodeFile="~/SmartParts/SecuredAction/SecuredActionLocations.ascx.cs" Inherits="SecuredActionLocations" %>
<%@ Register Assembly="Sage.SalesLogix.Client.GroupBuilder" Namespace="Sage.SalesLogix.Client.GroupBuilder" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Timeline" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="SecuredActionLocations_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkSecuredActionLocationsHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>"
            Target="Help" NavigateUrl="SecuredActionLocationsTab"
            ImageUrl="~/ImageResource.axd?scope=global&amp;type=Global_Images&amp;key=Help_16x16" >
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

  <SalesLogix:SlxGridView runat="server" ID="grdSecuredActionLocations" GridLines="None" AllowPaging="true" PageSize="20" AllowSorting="true"
AutoGenerateColumns="false" CellPadding="4" CssClass="datagrid" PagerStyle-CssClass="gridPager" OnSorting="GridSorting" OnPageIndexChanging="GridPageIndexChanging"
AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt" SelectedRowStyle-CssClass="rowSelected" ShowEmptyTable="true" EnableViewState="false"
EmptyTableRowText="<%$ resources:grdLocations_controlname_header %>"  ExpandableRows="True" ResizableColumns="True"  DataKeyNames="FileName" >
<Columns>
   <asp:TemplateField SortExpression="FileName" HeaderText="<%$ resources:grdLocations_filename_header %>">
    <itemtemplate>
        <asp:Label ID="txtFile" runat="server" Text='<%# Eval("FileName") %>'  ></asp:Label>
    </itemtemplate>
    </asp:TemplateField>
   </Columns>
</SalesLogix:SlxGridView>

