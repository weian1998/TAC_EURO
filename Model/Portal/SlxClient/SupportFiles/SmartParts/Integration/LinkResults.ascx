<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LinkResults.ascx.cs" Inherits="LinkResults" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="LinkResults_RTools" runat="server">
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="2%" />
    <col width="2%" />
    <col width="44%" />
    <col width="50%" />
    <col width="2%" />
    <tr>
        <td></td>
        <td colspan="3">
            <div class="wizardsectiontitle padBottom">
                <asp:Label runat="server" ID="lblLinkResults" Text="<%$ resources: lblResultsSuccess.Caption %>" />
            </div>
            <br />
        </td>
    </tr>
    <tr>
        <td colspan="2"></td>
        <td colspan="3">
            <div class="wizardsectiontitle padBottom">
                <asp:Label runat="server" ID="lblResultsMsg" Text="<%$ resources: lblResultsSuccessMsg.Caption %>" />
            </div>
            <br />
        </td>
    </tr>
    <tr id="rowEmail" runat="server">
        <td colspan="2"></td>
        <td colspan="3">
            <asp:LinkButton ID="lnkEmail" runat="server" OnClick="SendEmail" Text="<%$ resources: lnkEmailAdministrator.Caption %>"></asp:LinkButton>
            <br />
        </td>
    </tr>
    <tr>
        <td colspan="3"></td>
        <td>
            <asp:Panel runat="server" ID="pnlButtons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnClose" Text="<%$ resources: btnClose.Caption %>" CssClass="slxbutton" />
            </asp:Panel>
        </td>
    </tr>
</table>