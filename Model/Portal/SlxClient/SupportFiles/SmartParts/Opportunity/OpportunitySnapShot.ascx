<%@ Control Language="C#" AutoEventWireup="true" CodeFile="OpportunitySnapShot.ascx.cs" Inherits="SmartParts_OpportunitySnapShot" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.PickList" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.DependencyLookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.Lookup" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.HighLevelTypes" Namespace="Sage.SalesLogix.HighLevelTypes" TagPrefix="SalesLogix" %>

<div class="Bevel" style="width: 95%">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <col width="60%" />
        <col width="40%" />
        <tr class="snapshot-main-header">
            <td>
                <asp:Label ID="lblTitle" runat="server" Font-Bold="True" Text="<%$ resources: lblTitle.Caption %>"></asp:Label>
            </td>
            <td>
                <asp:LinkButton ID="lnkEmail" runat="server" OnClick="SendEmail" Font-Bold="True" Text="<%$ resources: cpyCopyToEmail.Caption %>"></asp:LinkButton>
            </td>
        </tr>
    </table>
    <table id="tblDetails" runat="server" border="0" cellpadding="0" cellspacing="0">
        <col width="25%" />
        <col width="25%" />
        <col width="25%" />
        <col width="25%" />
        <tr runat="server" id="rowDetailsHeader" class="snapshot-details-header" visible="false">
            <td style="background-color:White">
            </td>
            <td>
                <asp:Label ID="lblBaseHeader" runat="server" Text="<%$ resources: lblBaseHeader.Caption %>"></asp:Label>
            </td>
            <td>
                <asp:Label ID="lblOpportunityHeader" runat="server" Text="<%$ resources: lblOpportunityHeader.Caption %>"></asp:Label>
            </td>
            <td>
                <asp:Label ID="lblMyCurrencyHeader" runat="server" Text="<%$ resources: lblMyCurrencyHeader.Caption %>"></asp:Label>   
            </td>
        </tr>
        <tr runat="server" id="rowOpenSalesPotential">
            <td runat="server" id="colOpenSalesPotential" class="snapshot-column">
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblOpenSalesPotential" runat="server" Text="<%$ resources: lblOpenSalesPotential.Caption %>"
                        AssociatedControlID="lnkOpenBaseSalesPotential">
                    </asp:Label>
                </div>
            </td>
            <td class="snapshot-column alignright">
                <asp:LinkButton ID="lnkOpenBaseSalesPotential" runat="server" OnClick="OnClickSalesPotentialBaseRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curOpenBaseSalesPotential" DisplayMode="AsText" ExchangeRateType="BaseRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
            <td runat="server" class="snapshot-column alignright" id="colOppSalesPotential" visible="false">
                <asp:LinkButton ID="lnkOpenSalesPotential" runat="server" OnClick="OnClickSalesPotentialEntityRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curOpenSalesPotential" DisplayMode="AsText" ExchangeRateType="EntityRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
            <td runat="server" class="snapshot-column alignright" id="colMyCurSalesPotential" visible="false">
                <asp:LinkButton ID="lnkMyCurSalesPotential" runat="server" OnClick="OnClickSalesPotentialMyRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curMyCurSalesPotential" DisplayMode="AsText" ExchangeRateType="MyRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
        </tr>
        <tr runat="server" id="rowActualWon">
            <td runat="server" id="colActualWon" class="snapshot-column">
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblPotentialWon" runat="server" Text="<%$ resources: lblPotentialAmount.Caption %>" 
                        AssociatedControlID="curBaseActualWon">
                    </asp:Label>
                </div>
            </td>
            <td class="snapshot-column alignright">
                <asp:LinkButton ID="lnkActualAmountBaseRate" runat="server" OnClick="OnClickActualAmountBaseRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curBaseActualWon" DisplayMode="AsText" ExchangeRateType="BaseRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
            <td runat="server" class="snapshot-column alignright" id="colOppActualWon" visible="false">
                <asp:LinkButton ID="lnkActualAmountEnityRate"  runat="server" OnClick="OnClickActualAmountEntityRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curActualWon" DisplayMode="AsText" ExchangeRateType="EntityRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
            <td runat="server" class="snapshot-column alignright" id="colMyCurActualWon" visible="false">
                <asp:LinkButton ID="lnkActualAmountMyRate"  runat="server" OnClick="OnClickActualAmountMyRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curMyCurActualWon" DisplayMode="AsText" ExchangeRateType="MyRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
        </tr>
        <tr runat="server" id="rowPotentialLost">
            <td runat="server" id="colPotentialLost" class="snapshot-column">
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblPotentialLost" runat="server" Text="<%$ resources: lblPotentialAmount.Caption %>"
                        AssociatedControlID="curBasePotentialLost">
                    </asp:Label>
                </div>
            </td>
            <td class="snapshot-column alignright">
                <asp:LinkButton ID="lnkActualAmountBaseRateLost" runat="server" OnClick="OnClickActualAmountBaseRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curBasePotentialLost" DisplayMode="AsText" ExchangeRateType="BaseRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
            <td runat="server" id="colOppPotentialLost" visible="false" class="snapshot-column alignright">
                <asp:LinkButton ID="lnkActualAmountEntityRateLost" runat="server" OnClick="OnClickActualAmountEntityRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curPotentialLost" DisplayMode="AsText" ExchangeRateType="EntityRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
            <td runat="server" id="colMyCurPotentialLost" visible="false" class="snapshot-column alignright">
                <asp:LinkButton ID="lnkActualAmountMyRateLost" runat="server" OnClick="OnClickActualAmountMyRate" Text="">
                    <SalesLogix:Currency runat="server" ID="curMyCurPotentialLost" DisplayMode="AsText" ExchangeRateType="MyRate"
                        DisplayCurrencyCode="true">
                    </SalesLogix:Currency>
                </asp:LinkButton>
            </td>
        </tr>
        <tr runat="server" id="rowWeighted">
            <td class="snapshot-column">
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblWeighted" runat="server" Text="<%$ resources: lblWeighted.Caption %>"
                        AssociatedControlID="curWeighted">
                    </asp:Label>
                </div>
            </td>
            <td class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curBaseWeighted" DisplayMode="AsText" ExchangeRateType="BaseRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td runat="server" id="colOppWeighted" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curWeighted" DisplayMode="AsText" ExchangeRateType="EntityRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
            <td runat="server" id="colMyCurWeighted" visible="false" class="snapshot-column alignright">
                <SalesLogix:Currency runat="server" ID="curMyCurWeighted" DisplayMode="AsText" ExchangeRateType="MyRate"
                    DisplayCurrencyCode="true">
                </SalesLogix:Currency>
            </td>
        </tr>
    </table>
    <br />
    <table id="tblMultiCurrency" runat="server" border="0" cellpadding="0" cellspacing="0" visible="false" width="60%">
        <col width="200px"/>
        <col width="50%"/>
        <tr>
            <td>
                <div class="lbl alignleft">
                    <asp:Label ID="lueCurrencyCode_lbl" AssociatedControlID="lueCurrencyCode" runat="server"
                        Text="<%$ resources: lueCurrencyCode.Caption %>" >
                    </asp:Label>
                </div>
            </td>
            <td>
                <div>
                    <SalesLogix:LookupControl runat="server" ID="lueCurrencyCode" ToolTip="<%$ resources: lueCurrencyCode.ToolTip %>"
                        LookupEntityName="ExchangeRate" LookupDisplayMode="HyperText" OnLookupResultValueChanged="CurrencyCode_OnChange"
                        AutoPostBack="true" LookupBindingMode="String" ReturnPrimaryKey="True" InitializeLookup="true"
                        LookupEntityTypeName="Sage.Entity.Interfaces.IExchangeRate, Sage.Entity.Interfaces, Version=0.0.0.0, Culture=neutral, PublicKeyToken=null">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCurrencyCode.Description.PropertyHeader %>" PropertyName="Description"
                                PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueCurrencyCode.Currency.PropertyHeader %>" PropertyName="Id"
                                PropertyType="System.String" PropertyFormat="None" UseAsResult="True" ExcludeFromFilters="False">
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
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblExchangeRate" AssociatedControlID="lblExchangeRateValue" runat="server"
                        Text="<%$ resources: lblExchangeRate.Caption %>">
                    </asp:Label>
                </div>
            </td>
            <td>
                <div runat="server" id="divExchangeRateLabel" class="textcontrol alignleft">
                    <asp:Label runat="server" ID="lblExchangeRateValue" Enabled="false"></asp:Label>
                </div>
                <div runat="server" id="divExchangeRateText" class="textcontrol alignleft">
                    <SalesLogix:NumericControl runat="server" ID="numExchangeRateValue" Strict="false" OnTextChanged="ExchangeRate_OnChange"
                        AutoPostBack="true" FormatType="Decimal" DecimalDigits="4"/>
                </div>
            </td>
        </tr>
        <tr>
            <td>
                <div class="slxlabel alignleft">
                    <asp:Label ID="lblExchangeRateDate" AssociatedControlID="dtpExchangeRateDate" runat="server"
                        Text="<%$ resources: dtpExchangeRateDate.Caption %>">
                    </asp:Label>
                </div>
            </td>
            <td>
                <div class="alignleft">
                    <SalesLogix:DateTimePicker runat="server" ID="dtpExchangeRateDate" DisplayMode="AsText"></SalesLogix:DateTimePicker>
                </div>
            </td>
        </tr>
        <tr>
            <td colspan="2">
                <asp:CheckBox runat="server" ID="chkLockRate" Text="<%$ resources: chkLockRate.Caption %>"/>
            </td>
        </tr>
        <tr>
            <td>
                <br />
            </td>
        </tr>
    </table>
    <table id="tblSummary" runat="server" border="0" cellpadding="0" cellspacing="0" width="">
        <tr>
            <td>
                <div class="lbl">
                    <asp:Label runat="server" ID="lblSummaryHeader" Text="<%$ resources: lblSummaryHeader.Caption %>"></asp:Label>
                </div>
            </td>
        </tr>
        <tr runat="server" id="rowOpenSummary">
            <td>
                <asp:Label ID="lblSummary" runat="server" Text="<%$ resources: lblSummary.Caption %>"></asp:Label>
                <span class="datepicker a">
                    <SalesLogix:DateTimePicker ID="dtpDateOpened" Timeless="true" runat="server" DisplayMode="AsHyperlink"
                        DisplayTime="False" OnDateTimeValueChanged="dtpDateOpened_DateTimeValueChanged" AutoPostBack="true">
                    </SalesLogix:DateTimePicker>
                </span>
                <asp:Label ID="lblSummaryActivity" runat="server"></asp:Label>
            </td>
        </tr>
        <tr runat="server" id="rowClosedWon">
            <td>
                <asp:Label ID="lblClosedWonSummary" runat="server" Text="<%$ resources: lblClosedSummary.Caption %>"></asp:Label>
                <span class="datepicker a">
                    <SalesLogix:DateTimePicker ID="dtpClosedWonSummary" Timeless="true" runat="server" DisplayMode="AsHyperlink"
                        DisplayTime="False">
                    </SalesLogix:DateTimePicker>
                </span>
                <asp:Label ID="lblDaysOpen" runat="server"></asp:Label>
            </td>
        </tr>
        <tr runat="server" id="rowClosedLost">
            <td>
                <asp:Label ID="lblClosedLostSummary" runat="server" Text="<%$ resources: lblClosedSummary.Caption %>"></asp:Label>
                <span class="datepicker a">
                    <SalesLogix:DateTimePicker ID="dtpClosedLostSummary" Timeless="true" runat="server" DisplayMode="AsHyperlink"
                        DisplayTime="False">
                    </SalesLogix:DateTimePicker>
                </span>
                <asp:Label ID="lblLostDaysOpen" runat="server"></asp:Label>
            </td>
        </tr>
    </table>
    <table id="tblReasonWonLost" runat="server" border="0" cellpadding="0" cellspacing="0">
        <tr runat="server" id="rowReasonWon">
            <td>
                <div>
                    <asp:Label ID="lblReasonWon" runat="server" Text="<%$ resources: lblReasonWon.Caption %>"></asp:Label>
                </div>
            </td>
            <td>
                <div class="textcontrol picklist">
                    <SalesLogix:PickListControl runat="server" ID="pklReasonWon" PickListName="Reason Won" AllowMultiples="true" NoneEditable="true"  />
                </div>
            </td>
        </tr>
        <tr runat="server" id="rowReasonLost">
            <td>
                <asp:Label ID="lblReasonLost" runat="server" AssociatedControlID="pklReasonLost"
                    Text="<%$ resources: lblReasonLost.Caption %>">
                </asp:Label>
            </td>
            <td>
                <SalesLogix:PickListControl runat="server" ID="pklReasonLost" DisplayMode="AsHyperlink" PickListName="Reason Won"
                    ValueStoredAsText="false" AllowMultiples="true" NoneEditable="true" />
            </td>
        </tr>
    </table>
    <table id="tblProcesCompetitors" runat="server" border="0" cellpadding="0" cellspacing="0">
        <tr runat="server" id="rowSalesProcess">
            <td>
                <div>
                    <asp:Label ID="lblSalesProcess" runat="server" Text="<%$ resources: lblSalesProcess.Caption %>"></asp:Label>
                </div>
            </td>
        </tr>
        <tr runat="server" id="rowCompetitors">
            <td>
                <div>
                    <asp:Label ID="lblCompetitors" runat="server"></asp:Label>
                </div>
            </td>
        </tr>
    </table>
    <table id="tblTypeSource" runat="server" border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td>
                <div>
                    <asp:Label runat="server" ID="lblType" AssociatedControlID="pklType" Text="<%$ resources: lblType.Caption %>" />
                </div>
            </td>
            <td>
                <div class="textcontrol picklist">
                    <SalesLogix:PickListControl runat="server" ID="pklType" PickListName="Opportunity Type" DisplayMode="AsHyperlink" />
                </div>
            </td>
        </tr>
        <tr id="rowSource">
            <td>
                <div>
                    <asp:Label runat="server" ID="lblSource" Text="<%$ resources: lblSource.Caption %>" /> 
                </div>
            </td>
            <td>
                <div>
                    <SalesLogix:LookupControl runat="server" ID="lueLeadSourceOpen" LookupEntityName="LeadSource" LookupDisplayMode="HyperText"
                        LookupEntityTypeName="Sage.SalesLogix.Entities.LeadSource, Sage.SalesLogix.Entities" AutoPostBack="True">
                        <LookupProperties>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.Type.PropertyHeader %>"
                                PropertyType="System.String" PropertyName="Type" PropertyFormat="None" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.Description.PropertyHeader %>"
                                PropertyType="System.String" PropertyName="Description" PropertyFormat="None" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                            <SalesLogix:LookupProperty PropertyHeader="<%$ resources: lueLeadSource.AbbrevDescription.PropertyHeader %>"
                                PropertyType="System.String" PropertyName="AbbrevDescription" PropertyFormat="None" UseAsResult="True">
                            </SalesLogix:LookupProperty>
                        </LookupProperties>
                        <LookupPreFilters>              
                        </LookupPreFilters>
                    </SalesLogix:LookupControl>
                </div>
            </td>
        </tr>
    </table>
</div>