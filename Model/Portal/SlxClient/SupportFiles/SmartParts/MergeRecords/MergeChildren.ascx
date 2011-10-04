<%@ Control Language="C#" AutoEventWireup="true" CodeFile="MergeChildren.ascx.cs" Inherits="MergeChildren" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div style="display:none">
    <asp:Panel ID="MergeChildren_RTools" runat="server">
        <SalesLogix:PageLink ID="lnkMergeChildrenHelp" runat="server" LinkType="HelpFileName"
            ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="Help" NavigateUrl="Merge_Contacts"
            ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
        &nbsp;&nbsp;&nbsp;&nbsp;
        </SalesLogix:PageLink>
    </asp:Panel>
</div>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="2%" />
    <col width="42%" />
    <col width="8%" />
    <col width="42%" />
    <col width="2%" />
    <tr>
        <td></td>
        <td colspan="3">
            <div class="wizardsectiontitle padBottom">
                <asp:Label ID="lblDescription" runat="server" Text="<%$ resources: lblDescription.Caption %>"></asp:Label>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <div class="wizardsectiontitle">
                <asp:Label ID="lblTargetRecords" runat="server"></asp:Label>
            </div>
        </td>
        <td></td>
        <td>
            <div class="wizardsectiontitle">
                <asp:Label ID="lblSlxRecords" runat="server"></asp:Label>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <asp:Panel runat="server" ID="pnlSourceRecords" Height="150px">
                <SalesLogix:SlxGridView runat="server" ID="grdSourceRecords" GridLines="None" AutoGenerateColumns="false"
                    CellPadding="4" ResizableColumns="True" DataKeyNames="Id,firstName,lastName" ShowEmptyTable="true"
                    CssClass="datagrid" ExpandableRows="false" EmptyTableRowText="<%$ resources: EmptyTableRowText %>"
                    EnableViewState="false" OnRowCommand="grdSourceRecords_OnRowCommand"  RowStyle-CssClass="rowlt" 
                    PagerStyle-CssClass="gridPager" SelectedRowStyle-CssClass="rowSelected"
                    AlternatingRowStyle-CssClass="rowdk" >
                    <Columns>
                        <asp:BoundField DataField="Id" Visible="false"/>
                        <asp:CommandField ShowSelectButton="true" SelectText="<%$ resources: Grid.Select.Text %>"
                            ButtonType="link" >
              	        </asp:CommandField>
                        <asp:BoundField DataField="firstName" HeaderText="<%$ resources: Grid_FirstName_Column %>" />
                        <asp:BoundField DataField="lastName" HeaderText="<%$ resources: Grid_LastName_Column %>" />
                        <asp:BoundField DataField="city" HeaderText="<%$ resources: Grid_City_Column %>" />
                        <asp:TemplateField HeaderText="<%$ resources: Grid_WorkPhone_Column %>" >
                            <ItemTemplate>
                                <SalesLogix:Phone runat="server" ID="sourceWorkPhone" DisplayAsLabel="True" CssClass=""
                                    Text='<%# Eval("workPhone") %>' />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:BoundField DataField="email" HeaderText="<%$ resources: Grid_Email_Column %>" />
                    </Columns>
                </SalesLogix:SlxGridView>
            </asp:Panel>
            <br />
        </td>
        <td>
            <asp:Button runat="server" ID="btnLink" Text="<%$ resources: btnLink.Caption %>"
                OnClick="btnLink_Click" CssClass="slxbutton" />
        </td>
        <td>
            <asp:Panel runat="server" ID="pnlTarget" Height="150px">
                <SalesLogix:SlxGridView runat="server" ID="grdTargetRecords" GridLines="None" AutoGenerateColumns="false"
                    CellPadding="4" ResizableColumns="True" DataKeyNames="Id" ShowEmptyTable="true" CssClass="datagrid"
                    ExpandableRows="false" EnableViewState="false" OnRowCommand="grdTargetRecords_OnRowCommand"
                    EmptyTableRowText="<%$ resources: EmptyTableRowText %>" RowStyle-CssClass="rowlt"
                    PagerStyle-CssClass="gridPager" SelectedRowStyle-CssClass="rowSelected"
                    AlternatingRowStyle-CssClass="rowdk" >
                    <Columns>
                        <asp:BoundField DataField="Id" Visible="false"/>
                        <asp:CommandField ShowSelectButton="true" SelectText="<%$ resources: Grid.Select.Text %>"
                            ButtonType="link" >
              	        </asp:CommandField>
                        <asp:BoundField DataField="firstName" HeaderText="<%$ resources: Grid_FirstName_Column %>" />
                        <asp:BoundField DataField="lastName" HeaderText="<%$ resources: Grid_LastName_Column %>" />
                        <asp:BoundField DataField="city" HeaderText="<%$ resources: Grid_City_Column %>" />
                        <asp:TemplateField HeaderText="<%$ resources: Grid_WorkPhone_Column %>" >
                            <ItemTemplate>
                                <SalesLogix:Phone runat="server" ID="targetWorkPhone" DisplayAsLabel="True" CssClass=""
                                    Text='<%# Eval("workPhone") %>' />
                            </ItemTemplate>
                        </asp:TemplateField>
                        <asp:BoundField DataField="email" HeaderText="<%$ resources: Grid_Email_Column %>" />
                    </Columns>
                </SalesLogix:SlxGridView>
            </asp:Panel>
            <br />
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td colspan="3">
            <div class="wizardsectiontitle">
                <asp:Label ID="lblLinkedRecords" runat="server"></asp:Label>
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td></td>
        <td>
            <asp:Panel runat="server" ID="pnlLinkedRecords" Height="200px">
                <SalesLogix:SlxGridView runat="server" ID="grdLinkedRecords" GridLines="None" AutoGenerateColumns="false" CellPadding="4"
                    ResizableColumns="True" DataKeyNames="SourceId,TargetId" ShowEmptyTable="true" ExpandableRows="false" CssClass="datagrid"
                    EnableViewState="false" OnRowCommand="grdLinkedRecords_OnRowCommand" EmptyTableRowText="<%$ resources: EmptyTableRowText %>"
                    RowStyle-CssClass="rowlt" PagerStyle-CssClass="gridPager" SelectedRowStyle-CssClass="rowSelected"
                    AlternatingRowStyle-CssClass="rowdk" >
                    <Columns>
                        <asp:BoundField DataField="Id" Visible="false"/>
                        <asp:CommandField ShowSelectButton="true" SelectText="<%$ resources: Grid.Select.Text %>"
                            ButtonType="link" >
              	        </asp:CommandField>
              	        <asp:ButtonField CommandName="Unlink" Text="<%$ resources: Grid_Unlink.Column %>" />
                        <asp:BoundField DataField="firstName" HeaderText="<%$ resources: Grid_FirstName_Column %>" />
                        <asp:BoundField DataField="lastName" HeaderText="<%$ resources: Grid_LastName_Column %>" />
                    </Columns>
                </SalesLogix:SlxGridView>
            </asp:Panel>
        </td>
        <td colspan="2">
            <asp:Panel runat="server" ID="pnlMatchDetails" Height="200px">
                <SalesLogix:SlxGridView runat="server" ID="grdMatchDetails" GridLines="None" AutoGenerateColumns="false"
                    CellPadding="4" ResizableColumns="True" ShowEmptyTable="true" ExpandableRows="false" CssClass="datagrid"
                    EnableViewState="false" EmptyTableRowText="<%$ resources: EmptyTableRowText %>" RowStyle-CssClass="rowlt"
                    PagerStyle-CssClass="gridPager" SelectedRowStyle-CssClass="rowSelected" AlternatingRowStyle-CssClass="rowdk" >
                    <Columns>
                        <asp:BoundField DataField="property" HeaderText="<%$ resources: Grid_Property_Column %>" />
                        <asp:BoundField DataField="sourceData" HeaderText="<%$ resources: Grid_Source_Column %>" />
                        <asp:BoundField DataField="targetData" HeaderText="<%$ resources: Grid_Target_Column %>" />
                    </Columns>
                </SalesLogix:SlxGridView>
            </asp:Panel>
        </td>
        <td></td>
    </tr>
</table>
<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="2%" />
    <col width="50%" />
    <col width="24%" />
    <col width="24%" />
    <col width="2%" />
    <tr>
        <td></td>
        <td></td>
        <td>
            <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnBack" Text="<%$ resources: btnBack.Caption %>" CssClass="slxbutton" />
                <asp:Button runat="server" ID="btnNext" Text="<%$ resources: btnNext.Caption %>" CssClass="slxbutton" />
            </asp:Panel>
        </td>
        <td>
            <asp:Panel runat="server" ID="pnlCancel" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" CssClass="slxbutton" />
            </asp:Panel>
        </td>
        <td></td>
    </tr>
</table>