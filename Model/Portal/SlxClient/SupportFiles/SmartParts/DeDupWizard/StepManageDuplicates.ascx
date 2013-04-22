<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepManageDuplicates.ascx.cs" Inherits="StepManageDuplicates" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<asp:HiddenField runat=server ID="Mode" EnableViewState="true" Value="" />
<table border="0" cellpadding="1" cellspacing="0" class="formtable" style="width:100%">
    <col width="1%" /><col width="99%" />
    <tr>
        <td colspan="2">
            <span class="slxlabel">
                <asp:Label runat="server" ID="lblHeader" Text="<%$ resources: lblHeader.Caption %>"></asp:Label>
                <br />
                <br />
            </span>
        </td>
    </tr>      
</table>

<asp:Panel runat="server" ID="pnlMatches" class="Bevel" Width="99%">
    <table cellpadding="1" cellspacing="0" class="formtable" style="width:100%">
        <col width="2%" /><col width="18%" /><col width="18%" /><col width="62%" />
        <tr>
            <td></td>
            <td>
                <span class="lbl">
                    <asp:Label runat="server" ID="lblMatchTypes" Text="<%$ resources: lblMatchTypes.Caption %>"></asp:Label>
                </span>
            </td>
            <td>
                <asp:CheckBoxList ID="chkListMatchTypes" runat="server" RepeatColumns="3" RepeatDirection="Horizontal" Width="500px">
                </asp:CheckBoxList>
                <br />
                <br />
            </td>
        </tr>
    </table>
    <table cellpadding="1" cellspacing="0" class="formtable" style="width:100%">
        <col width="1%" /><col width="2%" /><col width="31%" /><col width="31%" /><col width="34%" />
        <tr>
            <td></td>
            <td colspan="4">
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblMatchFilters" Text="<%$ resources: lblMatchFilters.Caption %>"></asp:Label>
                </span>
                <br />
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="3">
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblMatchFiltersDesc" Text="<%$ resources: lblMatchFiltersDesc.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="3">
                <asp:CheckBoxList ID="chklstFilters" runat="server" RepeatColumns="3" RepeatDirection="Horizontal" Width="500px">
                </asp:CheckBoxList>
                <br />
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <asp:Button runat="server" ID="cmdMatchOptions" Text="<%$ resources: cmdMatchOptions.Caption %>" OnClick="cmdMatchOptions_Click" CssClass="slxbutton" />
            </td>
        </tr>        
    </table>
    <br />
</asp:Panel>