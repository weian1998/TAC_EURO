<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SearchResults.ascx.cs" Inherits="SearchResults" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="SearchResults_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkSearchResultsHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Select_or_Create_Account"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<div id="hiddenProps" style="display:none" runat="server">
    <asp:Button ID="btnRefreshGrid" runat="server" OnClick="btnReloadGrid_OnClick" />
    <asp:TextBox ID="txtFilters" runat="server"></asp:TextBox>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="2%" />
    <col width="3%" />
    <col width="3%" />
    <col width="45%" />
    <col width="45%" />
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
            <div class="wizardsectiontext padBottom">
                <asp:Label runat="server" ID="lblResultsMsg" />
            </div>
            <br />
        </td>
    </tr>
    <tr id="rowLinkTo" runat="server">
        <td></td>
        <td></td>
        <td colspan="3">
            <fieldset class="radio">
                <asp:RadioButton ID="rdbLinkTo" runat="server" GroupName="rdgpLinkOption" Text="<%$ resources:rdbLinkAccount.Caption %>" />
            </fieldset>
        </td>
        <td>
            <br />
            <br />
        </td>
    </tr>
    <tr id="rowSearchResults" runat="server">
        <td></td>
        <td></td>
        <td></td>
        <td colspan="2">
            <SalesLogix:SlxGridView runat="server" ID="grdMatches" AutoGenerateColumns="false" CellPadding="4" CssClass="datagrid"
                EnableViewState="false" GridLines="Both" ShowEmptyTable="true" ResizableColumns="true" DataKeyNames="key,Uuid"
                OnRowCreated="grdMatches_RowCreated" Width="100%" AllowPaging="false" AlternatingRowStyle-CssClass="rowdk"
                PagerStyle-CssClass="gridPager" RowStyle-CssClass="rowlt" SelectedRowStyle-CssClass="rowSelected" >
                <Columns>
                    <asp:TemplateField HeaderStyle-Width="20px" ItemStyle-HorizontalAlign="Center">
                        <ItemTemplate>
                            <asp:Literal runat="server" ID="rdbTarget"></asp:Literal>
                        </ItemTemplate>
                        <ItemStyle HorizontalAlign="Center" />
                    </asp:TemplateField>
                    <asp:BoundField DataField="Name" HeaderText="<%$ resources: grdMatches.Account.ColumnHeading %>"
                        SortExpression="Name" >
                    </asp:BoundField>
                    <asp:BoundField DataField="key" Visible="false"/>
                    <asp:BoundField DataField="Uuid" Visible="false"/>
                </Columns>
            </SalesLogix:SlxGridView>
            <br />
        </td>
        <td></td>
    </tr>
    <tr id="rowCreateAccount" runat="server">
        <td></td>
        <td colspan="4">
            <div class="wizardsectiontext">
                <asp:Label runat="server" ID="lblCreateAccount" Text="<%$ resources: lblCreateAccount.Caption %>" />
                <br />
                <br />
            </div>
        </td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3">
            <fieldset class="radio">
                <asp:RadioButton ID="rdbCreateNew" runat="server" GroupName="rdgpLinkOption" Text="<%$ resources:rdbCreateNew.Caption %>" />
            </fieldset>
        </td>
        <td>
            <br />
            <br />
        </td>
    </tr>
    <tr>
        <td></td>
        <td></td>
        <td colspan="3">
            <fieldset class="radio">
                <asp:RadioButton ID="rdbRefineSearch" runat="server" GroupName="rdgpLinkOption" Text="<%$ resources:rdbRefineSearch.Caption %>" />
            </fieldset>
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
            <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnBack" Text="<%$ resources: btnBack.Caption %>" CssClass="slxbutton" />
                <asp:Button runat="server" ID="btnNext" Text="<%$ resources: btnNext.Caption %>" CssClass="slxbutton"
                    OnClientClick="if (advancedSearchOptions.onRefineSearch()) return false;" OnClick="btnNext_ClickAction" />
            </asp:Panel>
        </td>
        <td>
            <asp:Panel runat="server" ID="pnlbuttons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" CssClass="slxbutton" />
            </asp:Panel>
        </td>
    </tr>
</table>