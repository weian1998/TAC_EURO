<%@ Control Language="C#" AutoEventWireup="true" CodeFile="AccountAssociations.ascx.cs" Inherits="SmartParts_Association_AccountAssociations" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<div style="display:none">
    <asp:Panel ID="AccountAssociations_LTools" runat="server"></asp:Panel>
    <asp:Panel ID="AccountAssociations_CTools" runat="server"></asp:Panel>
    <asp:Panel ID="AccountAssociations_RTools" runat="server">
    <asp:ImageButton runat="server" ID="btnAddAssociation" ToolTip="Add Association" ImageUrl="~\images\icons\plus_16X16.gif" meta:resourcekey="btnAdd" />
        <SalesLogix:PageLink ID="lnkAssociationChangeHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>"
            Target="Help" NavigateUrl="associationstab.aspx" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<div id="AccountAssociations_Container" style="width:100%;height:100%;" class="">
    <div id="AccountAssociations_Grid" style="width:100%;height:100%;" data-dojo-type="dijit.layout.BorderContainer"></div>
</div>

<Saleslogix:ScriptResourceProvider ID="AccountAssociationsResource" runat="server">
    <Keys>
        <Saleslogix:ResourceKeyName Key="AccountAssociationsGrid_Name.HeaderText" />
        <Saleslogix:ResourceKeyName Key="AccountAssociationsGrid_Notes.HeaderText" />
        <Saleslogix:ResourceKeyName Key="AccountAssociationsGrid_CreatedBy.HeaderText" />
        <Saleslogix:ResourceKeyName Key="AccountAssociationsGrid_Date.HeaderText" />
        <Saleslogix:ResourceKeyName Key="AccountAssociationsGrid_Relation.HeaderText" />
        <Saleslogix:ResourceKeyName Key="AccountAssociationsGrid_Delete.Text" />
        <SalesLogix:ResourceKeyName Key="AccountAssociationsGrid_Edit.Text" />
    </Keys>
</Saleslogix:ScriptResourceProvider>