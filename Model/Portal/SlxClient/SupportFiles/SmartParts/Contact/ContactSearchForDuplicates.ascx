<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ContactSearchForDuplicates.ascx.cs" Inherits="ContactSearchForDuplicates" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Src="~/SmartParts/Lead/MatchOptions.ascx" TagName="MatchOptions" TagPrefix="SalesLogix" %>

<asp:HiddenField ID="Mode" runat="server" Value="View" />
<asp:HiddenField ID="UpdateIndex" runat="server" Value="True" />

<div style="display:none">
    <asp:Panel ID="ContactMatching_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkMatchOptionsHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="contactpotentialmatch.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
            &nbsp;
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table id="SourceSnapShot" border="0" cellpadding="0" cellspacing="0" class="Bevel ExtendWidth">
    <col width="1%" /><col width="35%" /><col width="32%" /><col width="32%" />
    <tr>
        <td></td>
        <td colspan="2">
            <span class="lbl">
                <asp:Label ID="lblContact" runat="server" Text=""></asp:Label>
            </span>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <div class="textcontrol phone">
                <SalesLogix:Phone runat="server" ID="phnWorkPhone" ReadOnly="true" MaxLength="32" DisplayAsLabel="true"></SalesLogix:Phone>
            </div>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblAccount" runat="server" Text="<%$ resources: lblAccount.Caption %>" AssociatedControlID="lblValueAccount"></asp:Label>
            </span>
            <span>
                <asp:Label ID="lblValueAccount" runat="server" Text=""></asp:Label>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblEmail" runat="server" Text="<%$ resources: lblEmail.Caption %>" AssociatedControlID="lblValueEmail"></asp:Label>
            </span>
            <span>
                <asp:Label ID="lblValueEmail" runat="server" Text=""></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <span>
                <asp:Label ID="lblAddress" runat="server" Text=""></asp:Label>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblTitle" runat="server" Text="<%$ resources: lblTitle.Caption %>" AssociatedControlID="lblValueTitle"></asp:Label>
            </span>
            <span>
                <asp:Label ID="lblValueTitle" runat="server" Text=""></asp:Label>
            </span>
        </td>
        <td>
            <span class="lbl">
                <asp:Label ID="lblWeb" runat="server" Text="<%$ resources: lblWeb.Caption %>" AssociatedControlID="lblValueWeb"></asp:Label>
            </span>
            <span>
                <asp:Label ID="lblValueWeb" runat="server" Text=""></asp:Label>
            </span>
        </td>
    </tr>
</table>

<div class="tws tws-main-section">
    <div class="tws tws-main-section tws-main-tab-buttons">
        <ul>
            <li runat="server" class="tws-tab-button tws-active-tab-button" id="tabFilters">
                <a class="tws-tab-button-left" href="#" click="return false;">
                    <em class="tws-tab-button-right">
                        <span class="tws-tab-button-middle">
                            <span>
                                <asp:Localize ID="lclTabFilters" runat="server" Text="<%$ resources: lblMatchFilters.Caption %>"></asp:Localize>
                            </span>
                        </span>
                    </em>
                </a>
            </li>
            <li runat="server" class="tws-tab-button" id="tabOptions">
                <a class="tws-tab-button-left" href="#" click="return false;">
                    <em class="tws-tab-button-right">
                        <span class="tws-tab-button-middle">
                            <span>
                                <asp:Localize ID="lclTabOptions" runat="server" Text="<%$ resources: cmdSearchOptions.Caption %>"></asp:Localize>
                            </span>
                        </span>
                    </em>
                </a>
            </li>
        </ul>
    </div>
</div>

<div style="clear: both;"></div>
<div runat="server" id="divFilters">
    <table id="tblFilters" border="0" cellpadding="0" cellspacing="0" class="Bevel ExtendWidth">
    <col width="1%" /><col width="4%" /><col width="15%" /><col width="90%" />
        <tr>
            <td></td>
            <td colspan="2">
                <span class="lbl">
                    <asp:Label runat="server" ID="lblMatchTypes" Text="<%$ resources: lblMatchTypes.Caption %>"></asp:Label>
                    <br />
                </span>
            </td>
            <td>
                <span>
                    <asp:CheckBox ID="chkContacts" runat="server" Checked="true" />
                </span>
                <span class="lblright" style="padding-right:40px">
                    <asp:Label ID="lblContacts" runat="server" AssociatedControlID="chkContacts" 
                        Text="<%$ resources: lblContacts.Caption %>">
                    </asp:Label>
                </span>
                <span>
                    <asp:CheckBox ID="chkLeads" runat="server" Checked="true" />
                </span>
                <span class="lblright" style="padding-right:40px">
                    <asp:Label ID="lblleads" runat="server" AssociatedControlID="chkLeads" 
                        Text="<%$ resources: lblLeads.Caption %>">
                    </asp:Label>
                </span>
                <span>
                    <asp:CheckBox ID="chkAccounts" runat="server" Checked="true" />
                </span>
                <span class="lblright">
                    <asp:Label ID="lblAccounts" runat="server" AssociatedControlID="chkAccounts" 
                        Text="<%$ resources: lblAccounts.Caption %>">
                    </asp:Label>
                </span>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="2">
                <br />
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblMatchFilters" Text="<%$ resources: lblMatchFilters.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="2">
                <span class="slxlabel">
                    <asp:Label runat="server" ID="lblFilterDesc" Text="<%$ resources: lblFilterDesc.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td colspan="2">
                <asp:CheckBoxList ID="chklstFilters" runat="server" RepeatColumns="5" RepeatDirection="Horizontal" Width="100%"></asp:CheckBoxList>
                <br />
            </td>
        </tr>
        <tr>
            <td></td>
            <td colspan="2">
                <span class="lbl">
                    <asp:Label runat="server" ID="lblOptions" Text="<%$ resources: lblOptions.Caption %>"></asp:Label>
                </span>
            </td>
            <td colspan="3">
                <fieldset class="slxlabel radio">
                    <asp:RadioButtonList ID="rdgOptions" runat="server" RepeatDirection="Horizontal" Width="90%">
                        <asp:ListItem Selected="True" Text="<%$ resources: rdgMatchAll_Item.Text %>" Value="MatchAll" />
                        <asp:ListItem Text="<%$ resources: rdgMatchAny_Item.Text %>" Value="MatchAny" />
                    </asp:RadioButtonList>
                </fieldset>
            </td>
        </tr>
    </table>
</div>

<div runat="server" id="divOptions" style="display:none;">
    <div class="Bevel ExtendWidth">
        <SalesLogix:MatchOptions id="MatchOptions" runat="server" OnInit="SetOptions"></SalesLogix:MatchOptions>
    </div>
</div>

<br />
<div id="divUpdateMatches">
    <asp:Button runat="server" ID="cmdUpdateMatches" CssClass="slxbutton" Text="<%$ resources: cmdUpdateMatches.Caption %>" onclick="cmdUpdateMatches_Click" />
</div>
<br/>

<table id="tblResults" border="0" cellpadding="0" cellspacing="0" class="Bevel ExtendWidth">
    <tr>
        <td>
            <br />
            <span class="slxlabel">
                <asp:Label runat="server" ID="lblMatchesFound" Text="<%$ resources: lblMatchesFound.Caption %>"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td>            
            <SalesLogix:SlxGridView runat="server" ID="grdMatches" GridLines="Both" AutoGenerateColumns="false" CellPadding="4"
                CssClass="datagrid" PagerStyle-CssClass="gridPager" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt"
                SelectedRowStyle-CssClass="rowSelected" ShowEmptyTable="true" EnableViewState="false" AllowPaging="false" AllowSorting="false"
                PageSize="20" OnSelectedIndexChanged="grdMatches_SelectedIndexChanged" ExpandableRows="False" ResizableColumns="false"
                OnRowCommand="grdMatches_OnRowCommand" EmptyTableRowText="<%$ resources: grdMatches.EmptyTableRowText %>"
                UseSLXPagerTemplate="false" DataKeyNames="Id,EntityType" Width="100%" height="100%">        
                <Columns>
                    <asp:TemplateField HeaderText="">
                        <ItemTemplate>
                            <%# CreateViewButton(Eval("Id"), Eval("EntityType"))%>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="Id" Visible="false" />
                    <asp:BoundField DataField="Score" ItemStyle-HorizontalAlign="Center" HeaderText="<%$ resources: grdMatches.Score.ColumnHeading %>" />
                    <asp:BoundField DataField="EntityType" HeaderText="<%$ resources: grdMatches.Type.ColumnHeading %>" />
                    <asp:BoundField DataField="Company" HeaderText="<%$ resources: grdMatches.Company.ColumnHeading %>" />
                    <asp:BoundField DataField="FirstName" HeaderText="<%$ resources: grdMatches.FirstName.ColumnHeading %>" />
                    <asp:BoundField DataField="LastName" HeaderText="<%$ resources: grdMatches.LastName.ColumnHeading %>" />
                    <asp:BoundField DataField="Title" HeaderText="<%$ resources: grdMatches.Title.ColumnHeading %>" />
                    <asp:TemplateField HeaderText="<%$ resources: grdMatches.Email.ColumnHeading %>">
                        <ItemTemplate>
                            <SalesLogix:Email ID="Email" runat="server" DisplayMode="AsHyperlink" Text='<%# Eval("Email") %>'></SalesLogix:Email>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="CityStateZip" HeaderText="<%$ resources: grdMatches.CityStateZip.ColumnHeading %>" />
                    <asp:TemplateField HeaderText="<%$ resources: grdMatches.WorkPhone.ColumnHeading %>">
                        <ItemTemplate>
                            <SalesLogix:Phone ID="phnWorkPhone" runat="server" DisplayAsLabel="true" Text='<%# Eval("WorkPhone") %>'></SalesLogix:Phone>
                        </ItemTemplate>
                    </asp:TemplateField>
                </Columns>
            </SalesLogix:SlxGridView>
        </td>
    </tr>
    <tr>
        <td>
            <br />
            <span class="slxlabel">
                <asp:Label runat="server" ID="lblAccountMatches" Text="<%$ resources: lblAccountsFound.Caption %>"></asp:Label>
            </span>
        </td>
    </tr>
    <tr>
        <td>
            <SalesLogix:SlxGridView runat="server" ID="grdAccountMatches" GridLines="None" AutoGenerateColumns="false" CellPadding="4"
                CssClass="datagrid" PagerStyle-CssClass="gridPager" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt"
                SelectedRowStyle-CssClass="rowSelected" ShowEmptyTable="true" EnableViewState="false" AllowPaging="false" AllowSorting="false"
                PageSize="5" OnSelectedIndexChanged="grdAccountMatches_SelectedIndexChanged" ExpandableRows="False" ResizableColumns="false"
                OnRowCommand="grdAccountMatches_OnRowCommand" EmptyTableRowText="<%$ resources: grdMatches.EmptyTableRowText %>"
                UseSLXPagerTemplate="false" DataKeyNames="Id" Width="100%" height="100%">                 
                <Columns>
                    <asp:TemplateField HeaderText="">
                        <ItemTemplate>
                            <%# CreateViewButton(Eval("Id"),"Account")%>
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:ButtonField CommandName="UseAccount" Text="<%$ resources: grdAccountMatches.UseAccount.ColumnHeading %>" />
                    <asp:BoundField DataField="Id" Visible="false" />
                    <asp:BoundField DataField="Score" ShowHeader="true" HeaderText="<%$ resources: grdAccountMatches.Score.ColumnHeading %>" />
                    <asp:BoundField DataField="Account" ShowHeader="true" HeaderText="<%$ resources: grdAccountMatches.Account.ColumnHeading %>" />
                    <asp:BoundField DataField="Industry" ShowHeader="true" HeaderText="<%$ resources: grdAccountMatches.Industry.ColumnHeading %>" />
                    <asp:BoundField DataField="WebAddress" ShowHeader="true" HeaderText="<%$ resources: grdAccountMatches.WebAddress.ColumnHeading %>" />
                    <asp:BoundField DataField="CityStateZip" ShowHeader="true" HeaderText="<%$ resources: grdMatches.CityStateZip.ColumnHeading %>" />
                    <asp:TemplateField HeaderText="<%$ resources: grdAccountMatches.MainPhone.ColumnHeading %>">
                        <ItemTemplate>
                            <SalesLogix:Phone ID="phnAccountPhone" runat="server" DisplayAsLabel="true" Text='<%# Eval("MainPhone") %>' />
                        </ItemTemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="Type" ShowHeader="true" HeaderText="<%$ resources: grdAccountMatches.Type.ColumnHeading %>" />
                </Columns>
            </SalesLogix:SlxGridView>
        </td>
    </tr>    
</table>
<br/>
<div style="padding-right:20px; text-align:right" >
   <asp:Panel runat="server" ID="pnlCancel" CssClass="controlslist qfActionContainer">
        <asp:Button runat="server" ID="cmdCancel" CssClass="slxbutton" Text="<%$ resources: cmdCancel.Caption %>" />
    </asp:Panel>
</div>