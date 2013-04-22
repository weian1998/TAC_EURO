<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ContactAssociations.ascx.cs" Inherits="SmartParts_Association_ContactAssociations" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<div style="display:none">
    <asp:Panel ID="ContactAssociations_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="ContactAssociations_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="ContactAssociations_RTools" runat="server">
        <asp:ImageButton runat="server" ID="btnAddAssociation" Text="<%$ resources: btnAddAssociation.Text %>"
            ToolTip="<%$ resources: btnAddAssociation.ToolTip %>" ImageUrl="~\images\icons\plus_16X16.gif" />
        <SalesLogix:PageLink ID="lnkAssociationHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="associationstab.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<div id="ContactAssociations_Container" style="width:100%;height:100%;" class="">
    <div id="ContactAssociations_Grid" style="width:100%;height:100%;" data-dojo-type="dijit.layout.BorderContainer"></div>
</div>

<Saleslogix:ScriptResourceProvider ID="ContactAssociationsResource" runat="server">
    <Keys>
        <Saleslogix:ResourceKeyName Key="ContactAssociationsGrid_Name.HeaderText" />
        <Saleslogix:ResourceKeyName Key="ContactAssociationsGrid_Notes.HeaderText" />
        <Saleslogix:ResourceKeyName Key="ContactAssociationsGrid_CreatedBy.HeaderText" />
        <Saleslogix:ResourceKeyName Key="ContactAssociationsGrid_Date.HeaderText" />
        <Saleslogix:ResourceKeyName Key="ContactAssociationsGrid_Relation.HeaderText" />
        <Saleslogix:ResourceKeyName Key="ContactAssociationsGrid_Delete.Text" />
        <SalesLogix:ResourceKeyName Key="ContactAssociationsGrid_Edit.Text" />
    </Keys>
</Saleslogix:ScriptResourceProvider>
