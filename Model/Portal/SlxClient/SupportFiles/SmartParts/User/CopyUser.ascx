<%@ Control Language="C#" AutoEventWireup="true" CodeFile="CopyUser.ascx.cs" Inherits="CopyUser" %>

<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls"
    TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts"
    TagPrefix="SalesLogix" %>

<style type="text/css">
    #outerDiv { margin: 10px; }
    table { width: 100%; }
</style>

<SalesLogix:SmartPartToolsContainer runat="server" ID="AddUsers_RTools">
    <SalesLogix:PageLink ID="lnkCopyUserHelp" runat="server" LinkType="HelpFileName"
        ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Creating_a_Copy_of_a_User.htm" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">&nbsp;&nbsp;&nbsp;&nbsp;</SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<div id="outerDiv">

<div>
    <div>
        <asp:Label id="lblStatus" runat="server" Text="<%$ resources: ConfirmCopyMessage %>"></asp:Label>
    </div>
    <p>&nbsp;</p>
    <div style="float: right">
        <asp:Button ID="btnCopy" runat="server" CssClass="slxbutton" Text="<%$ resources: OkButton.Caption %>" />
        <asp:Button ID="btnCancel" runat="server" CssClass="slxbutton" Text="<%$ resources: CancelButton.Caption %>" />
    </div>
</div>

</div>
