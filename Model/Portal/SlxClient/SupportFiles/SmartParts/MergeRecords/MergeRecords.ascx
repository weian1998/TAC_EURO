<%@ Control Language="C#" AutoEventWireup="true" CodeFile="MergeRecords.ascx.cs" Inherits="MergeRecords" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<input runat="server" id="txtShowAll" value="false" enableviewstate="true" type="hidden" />

<div style="display:none">
    <asp:Panel ID="MergeRecords_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkMergeRecordsHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="mergerecordslistview.aspx"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        &nbsp;&nbsp;&nbsp;&nbsp;
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<asp:Panel runat="server" ID="pnlMergeRecords">
    <table border="0" cellpadding="1" cellspacing="0" class="formtable">
        <col width="2%" />
        <col width="2%" />
        <col width="94%" />
        <col width="2%" />
        <tr>
            <td></td>
            <td colspan="2">
                <div class="wizardsectiontitle padBottom">
                    <asp:Label ID="lblMergeText" runat="server"></asp:Label>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>
                <div class="wizardsectiontext">
                    <asp:Label runat="server" ID="lblMergeDetailDifferences" />
                </div>
                <br />
                <br />
            </td>
            <td></td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td>
                <SalesLogix:SlxGridView runat="server" ID="grdMerge" AllowPaging="false" GridLines="Both" AutoGenerateColumns="False"
                    AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt" CellPadding="4" CssClass="datagrid" Width="100%"
                    EnableViewState="false" ExpandableRows="false" ResizableColumns="false" DataKeyNames="PropertyMapId"
                    ShowEmptyTable="true" EmptyTableRowText="<%$ resources: grdMerge.EmptyTableRowText %>" >
                    <Columns>
                        <asp:BoundField DataField="PropertyMapId" Visible="false" />
                        <asp:BoundField DataField="Description" HeaderText="<%$ resources: Header.Property.Caption %>"/>
                        <asp:TemplateField HeaderStyle-Width="20px" ItemStyle-HorizontalAlign="Center">
                            <HeaderTemplate>
                                <%# CreateRecordRadioButton("Source") %>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <%# CreatePropertyRadioButton(Container.DataItem, "Source") %>
                            </ItemTemplate>
                            <ItemStyle Width="20px" HorizontalAlign="Center" />
                        </asp:TemplateField>
                        <asp:TemplateField>
                            <HeaderTemplate>
                                <asp:Label runat="server" ID="lblSourceRecord" Text="<%# GetSourceHeaderCaption() %>"></asp:Label>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <asp:Label runat="server" ID="SourceValue" Text='<%# Eval("SourceValue") %>' />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:TemplateField HeaderStyle-Width="20px" ItemStyle-HorizontalAlign="Center">
                            <HeaderTemplate>
                                <%# CreateRecordRadioButton("Target")%> 
                            </HeaderTemplate>
                            <ItemTemplate>
                                <%# CreatePropertyRadioButton(Container.DataItem, "Target")%> 
                            </ItemTemplate>
                            <ItemStyle Width="20px" HorizontalAlign="Center" />
                        </asp:TemplateField>
                        <asp:TemplateField>
                            <HeaderTemplate>
                                <asp:Label runat="server" ID="lblTargetRecord" Text="<%# GetTargetHeaderCaption() %>"/>
                            </HeaderTemplate>
                            <ItemTemplate>
                                <asp:Label runat="server" ID="TargetValue" Text='<%# Eval("TargetValue") %>' />
                            </ItemTemplate>
                        </asp:TemplateField>
                    </Columns>
                    <HeaderStyle HorizontalAlign="Center" BackColor="#F3F3F3" BorderColor="Transparent" Font-Bold="True" Font-Size="Small" />
                </SalesLogix:SlxGridView>
                <br />
            </td>
            <td></td>
        </tr>
    </table>
    <table border="0" cellpadding="1" cellspacing="0" class="formtable">
        <col width="4%" />
        <col width="25%" />
        <col width="46%" />
        <col width="25%" />
        <tr runat="server" id="rowStandardButtons">
            <td></td>
            <td>
                <asp:LinkButton runat="server" ID="lnkShowAll" OnClientClick="ShowAll_Click()" OnClick="lnkShowAll_OnClick"
                    Text="<%$ resources: lnkShowAll.Caption %>">
                </asp:LinkButton>
            </td>
            <td colspan="2">
                <asp:Panel runat="server" ID="pnlStandardButtons" CssClass="controlslist qfActionContainer">
                    <asp:Button runat="server" ID="btnOK" CssClass="slxbutton" Text="<%$ resources: btnOK.Caption %>" />
                    <asp:Button runat="server" ID="btnCancel" CssClass="slxbutton" Text="<%$ resources: btnCancel.Caption %>" />
                </asp:Panel>
            </td>
        </tr>
        <tr runat="server" id="rowWizardButtons" visible="false">
            <td></td>
            <td>
                <asp:LinkButton runat="server" ID="lnkShowAllWizard" OnClientClick="ShowAll_Click()" OnClick="lnkShowAll_OnClick"
                    Text="<%$ resources: lnkShowAll.Caption %>">
                </asp:LinkButton>
            </td>
            <td>
                <asp:Panel runat="server" ID="pnlWizard" CssClass="controlslist qfActionContainer">
                    <asp:Button runat="server" ID="btnBack" Text="<%$ resources: btnBack.Caption %>" CssClass="slxbutton" />
                    <asp:Button runat="server" ID="btnNext" Text="<%$ resources: btnNext.Caption %>" CssClass="slxbutton" />
                </asp:Panel>
            </td>
            <td>
                <asp:Panel runat="server" ID="pnlWizardClose" CssClass="controlslist qfActionContainer">
                    <asp:Button runat="server" ID="btnClose" Text="<%$ resources: btnCancel.Caption %>" CssClass="slxbutton" />
                </asp:Panel>
            </td>
        </tr>
    </table>
</asp:Panel>
