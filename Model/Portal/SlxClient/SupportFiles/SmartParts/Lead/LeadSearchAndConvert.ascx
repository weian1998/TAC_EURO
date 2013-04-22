<%@ Control Language="C#" AutoEventWireup="true" CodeFile="LeadSearchAndConvert.ascx.cs" Inherits="LeadSearchAndConvert" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Src="~/SmartParts/Lead/MatchOptions.ascx" TagName="MatchOptions" TagPrefix="SalesLogix" %>

<asp:HiddenField ID="Mode" runat="server" Value="View" />
<asp:HiddenField ID="UpdateIndex" runat="server" Value="True" />
<div style="display:none">
    <asp:Panel ID="LeadMatching_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkMatchOptionsHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="leadmergerecords.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
            &nbsp;&nbsp;&nbsp;&nbsp;
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<asp:Panel runat="server" ID="pnlSearchForDuplicates" Visible="true">
    <table id="SourceSnapShot" border="0" cellpadding="0" cellspacing="0" class="Bevel ExtendWidth">
        <col width="33%" /><col width="33%" />
        <tr>            
            <td colspan="3">
                <span class="lbl">
                    <asp:Label ID="lblLead" runat="server" Text=""></asp:Label>
                </span>
            </td>
            <td></td>
        </tr>
       <tr>
            <td>
                <div class="textcontrol phone">
                    <SalesLogix:Phone runat="server" ID="phnWorkPhone" ReadOnly="true" MaxLength="32" DisplayAsLabel="true"></SalesLogix:Phone>
                </div>
            </td>
            <td>
                <span class="lbl">
                    <asp:Label ID="lblCompany" runat="server" Text="<%$ resources: lblCompany.Caption %>" AssociatedControlID="lblValueCompany"></asp:Label>
                </span>
                <span>
                    <asp:Label ID="lblValueCompany" runat="server" Text=""></asp:Label>
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
            <colgroup>
                <col width="1%" />
                <col width="4%" />
                <col width="20%" />
                <col width="75%" />
            </colgroup>
            <tr>
                <td></td>
                <td colspan="2">
                    <span runat="server" id="divTypes" class="lbl" style="padding-right:30px; display:none">
                        <asp:Label ID="lblMatchTypes" runat="server" Text="<%$ resources: lblMatchTypes.Caption %>"></asp:Label>
                        <br />
                    </span>
                </td>
                <td>
                    <div runat="server" id="divSearchTypes" style="display:none">
                        <span>
                            <asp:CheckBox ID="chkContacts" runat="server" Checked="true" />
                        </span>
                        <span class="lblright" style="padding-right:40px">
                            <asp:Label ID="lblContacts" runat="server" AssociatedControlID="chkContacts" 
                                Text="<%$ resources: lblContacts.Caption %>"> </asp:Label>
                        </span>
                        <span>
                            <asp:CheckBox ID="chkLeads" runat="server" Checked="true" />
                        </span>
                        <span class="lblright">
                            <asp:Label ID="lblleads" runat="server" AssociatedControlID="chkLeads" 
                                Text="<%$ resources: lblLeads.Caption %>"></asp:Label>
                        </span>
                    </div>
                </td>
                <td></td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td colspan="2">
                    <span class="slxlabel">
                        <asp:Label ID="lblMatchFilters" runat="server" Text="<%$ resources: lblMatchFilters.Caption %>"></asp:Label>
                    </span>
                </td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td colspan="2">
                    <span class="slxlabel">
                        <asp:Label ID="lblFilterDesc" runat="server" Text="<%$ resources: lblFilterDesc.Caption %>"></asp:Label>
                    </span>
                </td>
            </tr>
            <tr>
                <td></td>
                <td></td>
                <td colspan="2">
                    <asp:CheckBoxList ID="chklstFilters" runat="server" RepeatColumns="5" RepeatDirection="Horizontal" Width="100%"></asp:CheckBoxList>
                </td>
            </tr>
            <tr>
                <td></td>
                <td colspan="2">
                    <span class="lbl">
                        <asp:Label runat="server" ID="lblOptions" Text="<%$ resources: lblOptions.Caption %>"></asp:Label>
                    </span>
                </td>
                <td>
                    <fieldset class="slxlabel radio">
                        <asp:RadioButtonList ID="rdgOptions" runat="server" RepeatDirection="Horizontal" Width="75%">
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
            <SalesLogix:MatchOptions id="MatchOptions" runat="server" OnLoad="SetOptions" ></SalesLogix:MatchOptions>
        </div>
    </div>

    <br/>
     <div id="divUpdateMatches">
        <asp:Button runat="server" ID="cmdUpdateMatches" CssClass="slxbutton" Text="<%$ resources: cmdUpdateMatches.Caption %>" onclick="cmdUpdateMatches_Click" />
    </div>
    <br/>

    <table id="tblResults" border="0" cellpadding="0" cellspacing="0" class="Bevel ExtendWidth">
        <tr>
            <td>
                <span class="slxlabel">
                    <asp:Label ID="lblMatchesFound" runat="server" Text="<%$ resources: lblMatchesFound.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
        <tr>
            <td>
                <SalesLogix:SlxGridView ID="grdMatches" runat="server" ResizableColumns="false" PageSize="5"
                    AllowPaging="false" DataKeyNames="Id,EntityType" Width="100%" height="120px" AllowSorting="false"
                    ShowEmptyTable="true" UseSLXPagerTemplate="false" AutoGenerateColumns="false" CellPadding="4"
                    CssClass="datagrid" EmptyTableRowText="<%$ resources: grdMatches.EmptyTableRowText %>"
                    EnableViewState="false" ExpandableRows="False" GridLines="Both" PagerStyle-CssClass="gridPager"
                    OnRowCommand="grdMatches_OnRowCommand" OnSelectedIndexChanged="grdMatches_SelectedIndexChanged"
                    AlternatingRowStyle-CssClass="rowdk" SelectedRowStyle-CssClass="rowSelected" RowStyle-CssClass="rowlt">
                    <Columns>
                        <asp:ButtonField CommandName="Merge" Text="<%$ resources: grdMatches.Merge.ColumnHeading %>" />
                        <asp:BoundField DataField="Id" Visible="false" />
                        <asp:BoundField DataField="EntityType" Visible="false" />
                        <asp:BoundField DataField="Score" HeaderText="<%$ resources: grdMatches.Score.ColumnHeading %>" 
                            ItemStyle-HorizontalAlign="Center" />
                        <asp:BoundField DataField="EntityName" HeaderText="<%$ resources: grdMatches.Type.ColumnHeading %>" />
                        <asp:BoundField DataField="Company" HeaderText="<%$ resources: grdMatches.Company.ColumnHeading %>" />
                        <asp:BoundField DataField="FirstName" HeaderText="<%$ resources: grdMatches.FirstName.ColumnHeading %>" />
                        <asp:BoundField DataField="LastName" HeaderText="<%$ resources: grdMatches.LastName.ColumnHeading %>" />
                        <asp:BoundField DataField="Title" HeaderText="<%$ resources: grdMatches.Title.ColumnHeading %>" />
                        <asp:TemplateField HeaderText="<%$ resources: grdMatches.Email.ColumnHeading %>">
                            <ItemTemplate>
                                <SalesLogix:Email ID="Email" runat="server" DisplayMode="AsHyperlink" Text='<%# Eval("Email") %>'>
                                </SalesLogix:Email>
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:BoundField DataField="CityStateZip" HeaderText="<%$ resources: grdMatches.CityStateZip.ColumnHeading %>" />
                        <asp:TemplateField HeaderText="<%$ resources: grdMatches.WorkPhone.ColumnHeading %>">
                            <ItemTemplate>
                                <SalesLogix:Phone ID="phnWorkPhone" runat="server" DisplayAsLabel="true" Text='<%# Eval("WorkPhone") %>'>
                                </SalesLogix:Phone>
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
                    <asp:Label ID="lblAccountMatches" runat="server" Text="<%$ resources: lblAccountMatches.Caption %>"></asp:Label>
                </span>
            </td>
        </tr>
        <tr>
            <td>
                <SalesLogix:SlxGridView ID="grdAccountMatches" runat="server" AllowPaging="false" AllowSorting="false" ExpandableRows="False"
                    CellPadding="4" CssClass="datagrid" DataKeyNames="Id" EmptyTableRowText="<%$ resources: grdMatches.EmptyTableRowText %>"
                    Width="100%" Height="120px" PageSize="5" GridLines="Vertical" AutoGenerateColumns="false" EnableViewState="false"
                    OnRowCommand="grdAccountMatches_OnRowCommand" OnSelectedIndexChanged="grdAccountMatches_SelectedIndexChanged"
                    ResizableColumns="false" RowStyle-CssClass="rowlt" ShowEmptyTable="true" UseSLXPagerTemplate="false"
                    SelectedRowStyle-CssClass="rowSelected" AlternatingRowStyle-CssClass="rowdk" PagerStyle-CssClass="gridPager">
                    <Columns>
                        <asp:ButtonField CommandName="Add Contact" Text="<%$ resources: grdAccount.AddContact.ColumnHeading %>" />
                        <asp:BoundField DataField="Id" Visible="false" />
                        <asp:BoundField DataField="Score" HeaderText="<%$ resources: grdAccountMatches.Score.ColumnHeading %>" />
                        <asp:BoundField DataField="AccountName" HeaderText="<%$ resources: grdAccountMatches.Account.ColumnHeading %>" />
                        <asp:BoundField DataField="Industry" HeaderText="<%$ resources: grdAccountMatches.Industry.ColumnHeading %>" />
                        <asp:BoundField DataField="WebAddress" HeaderText="<%$ resources: grdAccountMatches.WebAddress.ColumnHeading %>" />
                        <asp:BoundField DataField="CityStateZip" HeaderText="<%$ resources: grdMatches.CityStateZip.ColumnHeading %>" />
                        <asp:TemplateField HeaderText="<%$ resources: grdAccountMatches.MainPhone.ColumnHeading %>">
                            <ItemTemplate>
                                <SalesLogix:Phone ID="phnAccountPhone" runat="server" DisplayAsLabel="true" 
                                    Text='<%# Eval("MainPhone") %>' />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:BoundField DataField="Type" HeaderText="<%$ resources: grdAccountMatches.Type.ColumnHeading %>" />
                    </Columns>
                </SalesLogix:SlxGridView>
            </td>
        </tr>
    </table>
    
    <table border="0" cellpadding="1" cellspacing="0" width="100%">
        <col width="50%" /><col width="50%" />
        <tr>
            <td>
                <div class="lbl alignleft">
                    <asp:Label ID="lblAccountConflicts" runat="server" Text="<%$ resources: lblAccountConflicts.Caption %>" AssociatedControlID="ddlAccountConflicts"></asp:Label>
                </div>
                <div class="textcontrol select" width="70%">
                    <asp:DropDownList ID="ddlAccountConflicts" data-dojo-type="Sage.UI.Controls.Select" CssClass="select-control" shouldPublishMarkDirty="false" runat="server">
                        <asp:ListItem Text="<%$ resources: ddlAccountConflicts_Item_AccountWins %>" Value="ACCOUNTWINS"></asp:ListItem>
                        <asp:ListItem Text="<%$ resources: ddlAccountConflicts_Item_LeadWins %>" Value="LEADWINS"></asp:ListItem>
                    </asp:DropDownList>
                </div>
            </td>
            <td>
                <span>
                    <asp:CheckBox ID="chkCreateOpportunity" runat="server" />
                </span>
                <span class="lblright">
                    <asp:Label ID="lblCreateOpportunity" runat="server" AssociatedControlID="chkCreateOpportunity" 
                        Text="<%$ resources: lblCreateOpportunity.Caption %>"> </asp:Label>
                </span>
            </td>
        </tr>
    </table>
    <div style="padding-right:20px; text-align:right" >
       <asp:Panel runat="server" ID="pnlCancel" CssClass="controlslist qfActionContainer">
            <asp:Button ID="cmdInsert" runat="server" OnClick="cmdInsert_Click" Text="<%$ resources: cmdInsert.Caption %>" CssClass="slxbutton" />
            <asp:Button ID="cmdConvert" runat="server" OnClick="cmdConvert_Click" Text="<%$ resources: cmdConvert.Caption %>" CssClass="slxbutton" />
            <asp:Button ID="cmdCancel" runat="server" Text="<%$ resources: cmdCancel.Caption %>" CssClass="slxbutton" />
        </asp:Panel>
    </div>
</asp:Panel>

<%--Layout for the Merge Records view--%>
<asp:Panel runat="server" ID="pnlMergeRecords" Visible="false">
    <div id="MergeRecords">
        <asp:HiddenField ID="hdfSourceID" runat="server" />
        <asp:HiddenField ID="hdfSourceType" runat="server" />
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td>
                    <asp:Label ID="lblMergeText" runat="server" Text="<%$ resources: lblMergeText.Text %>"></asp:Label>
                </td>
            </tr>
        </table>
        <br />
        <table cellpadding="0" cellspacing="0" border="0" class="Bevel ExtendWidth">
            <tr>
                <td>
                    <SalesLogix:SlxGridView runat="server" ID="grdMerge" AllowPaging="false" GridLines="Both" CssClass="datagrid"
                        AutoGenerateColumns="False" DataKeyNames="PropertyMapId" CellPadding="4" PageSize="5"
                        OnRowDataBound="grdMerge_RowDataBound" OnSelectedIndexChanged="grdMerge_SelectedIndexChanged"
                        EnableViewState="false" ExpandableRows="false" ResizableColumns="false" Height="450px" Width="100%"
                        AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt">
                        <Columns>
                            <asp:BoundField DataField="PropertyMapId" Visible="false" />
                            <asp:BoundField DataField="Description" HeaderText="Property"/>
                            <asp:TemplateField ItemStyle-HorizontalAlign="Center" HeaderStyle-HorizontalAlign="Center">
                                <HeaderTemplate>
                                    <%# CreateRecordRadioButton("Source") %>
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <%# CreatePropertyRadioButton(Container.DataItem, "Source") %>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField>
                                <HeaderTemplate>
                                    <asp:Label runat="server" ID="lblSourceRecord" Text="Source"></asp:Label>
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <asp:Label runat="server" ID="SourceValue" Text='<%# Eval("SourceValue") %>' />
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField ItemStyle-HorizontalAlign="Center" HeaderStyle-HorizontalAlign="Center">
                                <HeaderTemplate>
                                    <%# CreateRecordRadioButton("Target")%>
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <%# CreatePropertyRadioButton(Container.DataItem, "Target")%>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField>
                                <HeaderTemplate>
                                    <asp:Label runat="server" ID="lblTargetRecord" Text="Target"/>
                                </HeaderTemplate>
                                <ItemTemplate>
                                    <asp:Label runat="server" ID="TargetValue" Text='<%# Eval("TargetValue") %>' />
                                </ItemTemplate>
                            </asp:TemplateField>
                        </Columns>
                        <RowStyle CssClass="rowlt" />
                        <AlternatingRowStyle CssClass="rowdk" />
                    </SalesLogix:SlxGridView>
                </td>
            </tr>
        </table>
        <br/>
        <div style="padding-right:20px; text-align:right" >
            <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnMerge" CssClass="slxbutton" Onclick="btnMerge_Click" ToolTip="Merge" Text="<%$ resources: cmdMerge.Caption %>" />
                <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" ToolTip="Cancel" Text="<%$ resources: cmdCancel.Caption %>" onclick="btnCancel_Click" />
            </asp:Panel>
        </div>
    </div>
</asp:Panel>