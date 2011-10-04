<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SelectOperatingAccount.ascx.cs" Inherits="SelectOperatingAccount" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="SelectOperatingAccount_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkSelectOperatingAccountHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Select_Accounting_System"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="2%" />
    <col width="3%" />
    <col width="30%" />
    <col width="33%" />
    <col width="30%" />
    <col width="2%" />
    <tr>
        <td></td>
        <td colspan="4">
            <div class="wizardsectiontitle padBottom">
                <asp:Label runat="server" ID="lblSearchResults" Text="<%$ resources: lblSearchResults.Caption %>" />
            </div>
            <br />
        </td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3">
            <div class="wizardsectiontext">
                <asp:Label runat="server" ID="lblSearchMsg" Text="<%$ resources: lblSearchMsg.Caption %>" />
            </div>
            <br />
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="4">
            <div class="wizardsectiontitle padBottom padTop">
                <asp:Label runat="server" ID="lblCreateLink" Text="<%$ resources: lblCreateLink.Caption %>" />
            </div>
        </td>
    </tr>
    <tr runat="server" id="rowAccountingFeeds">
        <td></td>
        <td></td>
        <td>
           <div class="slxlabel">
                <asp:Label runat="server" ID="lblSystem" Text="<%$ resources: lblSystem.Caption %>" />
            </div>
        </td>
        <td colspan="2">
            <asp:ListBox ID="lbxSystems" runat="server" SelectionMode="Single" Rows="1" EnableViewState="true" Width="80%"></asp:ListBox>
        </td>
        <td>
            <br />
            <br />
        </td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td></td>
        <td>
            <asp:Button runat="server" ID="btnNext" Text="<%$ resources: btnNext.Caption %>" CssClass="slxbutton" />
        </td>
        <td>
            <div align="right">
                <asp:Button runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" CssClass="slxbutton" />
            </div>
        </td>
        <td></td>
    </tr>
</table>