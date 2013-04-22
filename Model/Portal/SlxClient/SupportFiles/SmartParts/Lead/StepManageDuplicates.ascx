<%@ Control Language="C#" AutoEventWireup="true" CodeFile="StepManageDuplicates.ascx.cs" Inherits="StepManageDuplicates" %>

<div style="display:none">
    <asp:Button runat="server" ID="cmdStartTestProcess" OnClick="cmdRunTest_Click" Visible="True" />
</div>
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
    <tr>
        <td></td>
        <td>
            <span>
                <asp:CheckBox runat="server" ID="chkCheckForDups" Checked="true" AutoPostBack="true" />
            </span>
            <span class="lblright">
                <asp:Label ID="lblCheckForDups" AssociatedControlID="chkCheckForDups" runat="server" Text="<%$ resources: chkCheckForDups.Caption %>"></asp:Label>
            </span>
            <br />
            <br />
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
                <span>
                    <asp:CheckBox runat="server" ID="chkContacts" Checked="true" />
                </span>
                <span class="lblright">
                    <asp:Label ID="lblContacts" AssociatedControlID="chkContacts" runat="server" Text="<%$ resources: lblContacts.Caption %>"></asp:Label>
                </span>
            </td>
            <td>
                <span>
                    <asp:CheckBox runat="server" ID="chkLeads" Checked="true" />
                </span>
                <span class="lblright">
                    <asp:Label ID="lblleads" AssociatedControlID="chkLeads" runat="server" Text="<%$ resources: lblLeads.Caption %>"></asp:Label>
                </span>
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
                <asp:CheckBoxList ID="chklstFilters" runat="server" RepeatColumns="3" RepeatDirection="Horizontal" Width="500px"></asp:CheckBoxList>
                <br />
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="2">
                <span>
                    <asp:CheckBox runat="server" ID="chkAutoMergeDups" Checked="true" />
                </span>
                <span class="lblright">
                    <asp:Label ID="lblAutoMergeDups" AssociatedControlID="chkAutoMergeDups" runat="server" Text="<%$ resources: chkAutoMergeDups.Caption %>"></asp:Label>
                </span>
            </td>
            <td colspan="2">
                <asp:Button runat="server" ID="cmdMatchOptions" Text="<%$ resources: cmdMatchOptions.Caption %>" CssClass="slxbutton" OnClick="cmdMatchOptions_Click" />
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="3">
                <span class="lbl">
                    <asp:Label ID="lblConflicts" AssociatedControlID="lbxConflicts" runat="server" Text="<%$ resources: lblConflicts.Caption %>"></asp:Label>
                </span>
                <div class="textcontrol select">
                    <asp:ListBox ID="lbxConflicts" runat="server" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false"
                        SelectionMode="Single" Rows="1" EnableViewState="true">
                        <asp:ListItem Text="<%$ resources: lbxConflicts_ExistingWins_Item %>" Value="ExistingWins" Selected="True"></asp:ListItem>
                        <asp:ListItem Text="<%$ resources: lbxConflicts_ImportedWins_Item %>" Value="ImportedWins"></asp:ListItem>
                    </asp:ListBox>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td colspan="4">
                <asp:Button runat="server" ID="cmdRunTest" Text="<%$ resources: cmdRunTest.Caption %>" CssClass="slxbutton" OnClick="cmdAssignImportHistory_Click" />
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblRunTest" Text="<%$ resources: lblRunTest.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
         <tr>
            <td></td>
            <td colspan="4" style="padding-top:15">
                <span>
                    <asp:CheckBox runat="server" ID="chkFindDupsInFile" Checked="false" />
                </span>
                <span class="lblright">
                    <asp:Label ID="lblFindDups" AssociatedControlID="chkFindDupsInFile" runat="server" Text="<%$ resources: chkCheckForDupsInFile.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
    </table>
    <br />
</asp:Panel>