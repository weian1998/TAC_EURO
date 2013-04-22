<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SalesOrderSnapShot.ascx.cs" Inherits="SalesOrderSnapShot" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>
    
<div class="Bevel" style="width: 95%">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <col width="60%" />
        <col width="40%" />
        <tr class="snapshot-main-header boldtext">
            <td>
                <asp:Label ID="lblTitle" runat="server" Text="<%$ resources: lblTitle.Caption %>"></asp:Label>
            </td>
            <td>
                <asp:LinkButton ID="lnkEmail" runat="server" OnClick="SendEmail" Text="<%$ resources: cpyCopyToEmail.Caption %>"></asp:LinkButton>
            </td>
        </tr>
    </table>
    <table id="tblDetails" runat="server" border="0" cellpadding="0" cellspacing="0">
        <col width="25%" />
        <col width="25%" />
        <col width="25%" />
        <col width="25%" />
        <tr runat="server" id="rowDetailsHeader" class="snapshot-details-header" visible="false">
            <td style="background-color:White"></td>
            <td>
                <asp:Label ID="lblBaseHeader" runat="server" Text="<%$ resources: lblBaseHeader.Caption %>"></asp:Label>
            </td>
            <td>
                <asp:Label ID="lblSalesOrderHeader" runat="server" Text="<%$ resources: lblSalesOrderHeader.Caption %>"></asp:Label>
            </td>
            <td>
                <asp:Label ID="lblMyCurrencyHeader" runat="server" Text="<%$ resources: lblMyCurrencyHeader.Caption %>"></asp:Label>   
            </td>
        </tr>
        <tr>
            <td runat="server" id="rowSubTotal" class="snapshot-column">
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblSubTotal" runat="server" Text="<%$ resources: lblSubTotal.Caption %>"
                        AssociatedControlID="curSubTotal">
                    </asp:Label>
                </div>
            </td>
            <td runat="server" id="rowBaseSubTotal" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curBaseSubTotal" DisplayMode="AsText" ExchangeRateType="BaseRate"
                    DisplayCurrencyCode="false">
                </SalesLogix:Currency>
            </td>
            <td id="rowSOSubTotal" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curSubTotal" DisplayMode="AsText" ExchangeRateType="EntityRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td id="rowMyCurSubTotal" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curMySubTotal" DisplayMode="AsText" ExchangeRateType="MyRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
        </tr>
        <tr>
            <td class="snapshot-column">
                <asp:LinkButton ID="lnkDiscount" runat="server" Text="<%$ resources: lnkDiscount.Caption %>"
                    OnClick="ShowDetailsView_OnClick">
                </asp:LinkButton>
            </td>
            <td class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curBaseDiscount" DisplayMode="AsText" ExchangeRateType="BaseRate"
                    DisplayCurrencyCode="false">
                </SalesLogix:Currency>
            </td>
            <td id="rowSODiscount" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curDiscount" DisplayMode="AsText" ExchangeRateType="EntityRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td id="rowMyCurDiscount" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curMyDiscount" DisplayMode="AsText" ExchangeRateType="MyRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
        </tr>
        <tr>
            <td class="snapshot-column">
                <asp:LinkButton ID="lnkShipping" runat="server" Text="<%$ resources: lblShipping.Caption %>"
                    OnClick="ShowDetailsView_OnClick">
                </asp:LinkButton>
            </td>
            <td class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curBaseShipping" DisplayMode="AsText" ExchangeRateType="BaseRate"
                    DisplayCurrencyCode="false">
                </SalesLogix:Currency>
            </td>
            <td id="rowSOShipping" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curShipping" DisplayMode="AsText" ExchangeRateType="EntityRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td id="rowMyCurShipping" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curMyShipping" DisplayMode="AsText" ExchangeRateType="MyRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
        </tr>
        <tr>
            <td class="snapshot-column">
                <asp:LinkButton ID="lnkTaxRate" runat="server" Text="<%$ resources: lnkTax.Caption %>"
                    OnClick="ShowDetailsView_OnClick">
                </asp:LinkButton>
            </td>
            <td class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curBaseTax" DisplayMode="AsText" ExchangeRateType="BaseRate"
                    DisplayCurrencyCode="false">
                </SalesLogix:Currency>
                <asp:Label runat="server" ID="lblBaseRatePercentage" Enabled="false"></asp:Label>
            </td>
            <td id="rowSOTax" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curTax" DisplayMode="AsText" ExchangeRateType="EntityRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td id="rowMyCurTax" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curMyTax" DisplayMode="AsText" ExchangeRateType="MyRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
        </tr>
        <tr class="boldtext">
            <td runat="server" class="snapshot-column">
                <asp:Label ID="lblTotal" runat="server" Text="<%$ resources: lblTotal.Caption %>"
                    AssociatedControlID="curTotal">
                </asp:Label>
            </td>
            <td class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curBaseTotal" DisplayMode="AsText" ExchangeRateType="BaseRate"
                    DisplayCurrencyCode="false">
                </SalesLogix:Currency>
            </td>
            <td id="rowSOTotal" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curTotal" DisplayMode="AsText" ExchangeRateType="EntityRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td id="rowMyCurTotal" runat="server" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curMyTotal" DisplayMode="AsText" ExchangeRateType="MyRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
        </tr>
    </table>
    <br />
    <table id="tblMultiCurrency" runat="server" border="0" cellpadding="0" cellspacing="0" width="100%" visible="false">
        <col width="100%" />
        <tr>
            <td>
                <div class=" lbl alignleft">
                    <asp:Label ID="lueCurrencyCode_lbl" AssociatedControlID="lueCurrencyCode" runat="server"
                        Text="<%$ resources: lueCurrencyCode.Caption %>" >
                    </asp:Label>
                </div>
                <div class="textcontrol lookup">
                    <SalesLogix:LookupControl runat="server" ID="lueCurrencyCode" ToolTip="<%$ resources: lueCurrencyCode.ToolTip %>" LookupEntityName="ExchangeRate"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IExchangeRate, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null"
                        LookupDisplayMode="HyperText" OnLookupResultValueChanged="CurrencyCode_OnChange" AutoPostBack="true" LookupBindingMode="String"
                        InitializeLookup="true" >
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCurrencyCode.Description.PropertyHeader %>" PropertyName="Description"
                                PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="Currency Code" PropertyName="Id" PropertyFormat="None" PropertyType="System.String"
                                UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCurrencyCode.Rate.PropertyHeader %>" PropertyName="Rate"
                                PropertyType="System.Double" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters>
                        </LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="lbl alignleft">
                    <asp:Label ID="txtExchangeRate_lbl" AssociatedControlID="lblExchangeRateValue" runat="server"
                        Text="<%$ resources: txtExchangeRate.Caption %>">
                    </asp:Label>
                </div>
                <div runat="server" id="divExchangeRateLabel" class="textcontrol">
                    <asp:Label runat="server" ID="lblExchangeRateValue" Enabled="false"></asp:Label>
                </div>
                <div runat="server" id="divExchangeRateText" class="textcontrol" style="width:65px">
                    <SalesLogix:NumericControl runat="server" ID="numExchangeRateValue" OnTextChanged="ExchangeRate_OnChange"
                        AutoPostBack="true" FormatType="Decimal" DecimalDigits="4"/>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="lbl alignleft">
                    <asp:Label ID="lblExchangeRateDate" AssociatedControlID="dtpExchangeRateDate" runat="server"
                        Text="<%$ resources: dtpExchangeRateDate.Caption %>">
                    </asp:Label>
                </div>
                <div>
                    <SalesLogix:DateTimePicker runat="server" ID="dtpExchangeRateDate" DisplayMode="AsText"></SalesLogix:DateTimePicker>
                </div>
            </td>
        </tr>
    </table>
</div>