<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ICUpdatePricing.ascx.cs" Inherits="ICUpdatePricing" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>

 <SalesLogix:SmartPartToolsContainer runat="server" ID="ICUpdatePricing_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkICUpdatePricingHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>"
        Target="MCWebHelp" NavigateUrl="Checking_Prices" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
 </SalesLogix:SmartPartToolsContainer>

<table border="0" cellpadding="1" cellspacing="0" class="formtable">
    <col width="100%" />
    <col width="100%" />
    <tr>
        <td  colspan="2">
            <asp:Label runat="server" ID="lblHeader" Text="<%$ resources: lblHeader.Text %>" CssClass="wizardsectiontitle padBottom" />
        </td>
    </tr>
    <tr>
        <td>
            <div class=" lbl alignleft">
                <asp:Label ID="curOriginalTotalPrice_lbl" AssociatedControlID="curOriginalTotalPrice" runat="server"
                    Text="<%$ resources: curOriginalTotalPrice.Caption %>" >
                </asp:Label>
            </div>
            <div class="textcontrol currency">
                <SalesLogix:Currency runat="server" ID="curOriginalTotalPrice" ExchangeRateType="EntityRate" ReadOnly="true" Enabled="false"
                    DecimalDigits="-1" DisplayCurrencyCode="true" />
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            <div class=" lbl alignleft">
                <asp:Label ID="curNewTotalPrice_lbl" AssociatedControlID="curNewTotalPrice" runat="server" Text="<%$ resources: curNewTotalPrice.Caption %>" ></asp:Label>
            </div>
            <div class="textcontrol currency">
                <SalesLogix:Currency runat="server" ID="curNewTotalPrice" ExchangeRateType="EntityRate" ReadOnly="true" Enabled="false" DecimalDigits="-1"
                    ExchangeRate="1" DisplayCurrencyCode="true" />
            </div>
        </td>
        <td></td>
    </tr>
    <tr>
        <td>
            <asp:Label runat="server" ID="lblUpdates" Text="<%$ resources: lblUpdates.Text %>" CssClass="slx label padTop" />
        </td>
        <td></td>
    </tr>
    <tr>
        <td colspan="2">
            <SalesLogix:SlxGridView runat="server" ID="grdProducts" GridLines="None" AutoGenerateColumns="false" CellPadding="4" CssClass="datagrid"
                PagerStyle-CssClass="gridPager" AlternatingRowStyle-CssClass="rowdk" RowStyle-CssClass="rowlt" SelectedRowStyle-CssClass="rowSelected"
                ShowEmptyTable="true" EnableViewState="false" EmptyTableRowText="<%$ resources: grdProducts.EmptyTableRowText %>" ExpandableRows="True"
                ResizableColumns="True" DataKeyNames="grossTotal" >
                <Columns>
                    <asp:BoundField DataField="grossTotal" Visible="false"></asp:BoundField>
                    <asp:BoundField DataField="original_number" HeaderText="<%$ resources: grdProducts.LineNumber.ColumnHeading %>"></asp:BoundField>
                    <asp:BoundField DataField="original_commodityName" HeaderText="<%$ resources: grdProducts.Product.ColumnHeading %>"></asp:BoundField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.OriginalPrice.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol3" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" Text='<%# Eval("original_initialPrice") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.Price.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol4" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" ExchangeRate="1" Text='<%# Eval("initialPrice") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.Discount.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol5" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" ExchangeRate="1" Text='<%# Eval("discountTotal") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.OriginalAdjusted.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol6" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" ExchangeRate="1" Text='<%# Eval("original_actualPrice") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.AdjustedPrice.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol7" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" ExchangeRate="1" Text='<%# Eval("actualPrice") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:BoundField DataField="Quantity" HeaderText="<%$ resources: grdProducts.Quantity.ColumnHeading %>"></asp:BoundField>
                    <asp:BoundField DataField="original_unitOfMeasure.name" HeaderText="<%$ resources: grdProducts.Unit.ColumnHeading %>"></asp:BoundField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.OriginalTotal.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol10" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" ExchangeRate="1" Text='<%# Eval("original_netTotal") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
                    <asp:TemplateField HeaderText="<%$ resources: grdProducts.Extended.ColumnHeading %>">
                        <itemtemplate>
                            <SalesLogix:Currency runat="server" ID="grdProductscol11" DisplayMode="AsText" CurrentCode='<%# Eval("currencyCode") %>'
                                ExchangeRateType="EntityRate" ExchangeRate="1" Text='<%# Eval("netTotal") %>' CssClass="" DecimalDigits="2" />
                        </itemtemplate>
                    </asp:TemplateField>
            </Columns>
        </SalesLogix:SlxGridView>
    </td>
    </tr>
    <tr>
        <td></td>
        <td>
            <asp:Panel runat="server" ID="ctrlstButtons" CssClass="controlslist qfActionContainer">
                <asp:Button runat="server" ID="btnOK" Text="<%$ resources: btnOK.Caption %>" ToolTip="<%$ resources: btnOK.ToolTip %>" />
                <asp:Button runat="server" ID="btnCancel" Text="<%$ resources: btnCancel.Caption %>" ToolTip="<%$ resources: btnCancel.ToolTip %>" />
            </asp:Panel>
        </td>
    </tr>
    <tr>
        <td></td>
        <td></td>
    </tr>
</table>