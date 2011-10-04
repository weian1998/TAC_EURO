<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ICInvoices.ascx.cs" Inherits="ICInvoices" %>
<%@ Register Assembly="Sage.SalesLogix.Web" Namespace="Sage.SalesLogix.Web" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<SalesLogix:ScriptResourceProvider ID="InvoiceResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="grdInvoice_Name" />
        <SalesLogix:ResourceKeyName Key="Status" />

        <SalesLogix:ResourceKeyName Key="grdInvoice_Amount" />
        <SalesLogix:ResourceKeyName Key="grdInvoice_PaymentTerms" />
        <SalesLogix:ResourceKeyName Key="grdInvoice_NetTotal" />
        <SalesLogix:ResourceKeyName Key="grdInvoice_PO" />
        <SalesLogix:ResourceKeyName Key="grdInvoice_DueDate" />
        <SalesLogix:ResourceKeyName Key="grdInvoice_Date" />
        <SalesLogix:ResourceKeyName Key="grdInvoice_Tax" />

        <SalesLogix:ResourceKeyName Key="grdAddress_Name" />
        <SalesLogix:ResourceKeyName Key="grdAddress_address1" />
        <SalesLogix:ResourceKeyName Key="grdAddress_address2" />
        <SalesLogix:ResourceKeyName Key="grdAddress_City" />
        <SalesLogix:ResourceKeyName Key="grdAddress_State" />
        <SalesLogix:ResourceKeyName Key="grdAddress_Zip" />

        <SalesLogix:ResourceKeyName Key="grdItems_Line" />
        <SalesLogix:ResourceKeyName Key="grdItems_Type" />
        <SalesLogix:ResourceKeyName Key="grdItems_Status" />
        <SalesLogix:ResourceKeyName Key="grdItems_Commodity" />
        <SalesLogix:ResourceKeyName Key="grdItems_CommodityVariant" />
        <SalesLogix:ResourceKeyName Key="grdItems_CommodityDimension" />
        <SalesLogix:ResourceKeyName Key="grdItems_UnitOfMeasure" />
        <SalesLogix:ResourceKeyName Key="grdItems_Quantity" />
        <SalesLogix:ResourceKeyName Key="grdItems_InitialPrice" />
        <SalesLogix:ResourceKeyName Key="grdItems_ActualPrice" />
        <SalesLogix:ResourceKeyName Key="grdItems_NetTotal" />
        <SalesLogix:ResourceKeyName Key="grdItems_ChargesTotal" />
        <SalesLogix:ResourceKeyName Key="grdItems_DiscountTotal" />
        <SalesLogix:ResourceKeyName Key="grdItems_TaxTotal" />
        <SalesLogix:ResourceKeyName Key="grdItems_GrossTotal" />

        <SalesLogix:ResourceKeyName Key="grdPayments_Date" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Name" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Type" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Status" />
        <SalesLogix:ResourceKeyName Key="grdPayments_NetTotal" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Discounts" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Charges" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Tax" />
        <SalesLogix:ResourceKeyName Key="grdPayments_GrossTotal" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Currency" />
        <SalesLogix:ResourceKeyName Key="grdPayments_TenderType" />
        <SalesLogix:ResourceKeyName Key="grdPayments_TenderReference" />
        <SalesLogix:ResourceKeyName Key="grdPayments_ProcessDate" />

        <SalesLogix:ResourceKeyName Key="grdDeliveries_Number" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_Type" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_Status" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_RequestedDate" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_ActualDate" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_ActualTime" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_RequestedQuantity" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_DeliveredQuantity" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_Method" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_Carrier" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_CarrierReference" />
        <SalesLogix:ResourceKeyName Key="grdDeliveries_ExceptionReason" />
    </Keys>
</SalesLogix:ScriptResourceProvider>

<div id="sdgrdInvoices_container" style="width:100%;">
    <div id="sdgrdInvoices_Grid" style="width:100%;height:325px;"></div>
</div>

<SalesLogix:SmartPartToolsContainer runat="server" ID="ICInvoices_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkICInvoicesHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="MCWebHelp"
        NavigateUrl="Account_Invoices_Tab" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<div style="display: none;">
    <div dojoType="dijit.Dialog" id="dlgInvoiceDetails" title="Invoice Details" execute="">
	    <table cellspacing="30">
		    <tr>
			    <td>
                    <label for="Invoice"><%= GetLocalResourceObject("lblInvoice.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="Invoice_reference" name="reference" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="NetTotal"><%= GetLocalResourceObject("lblNetTotal.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="Invoice_grossTotal" name="grossTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
	    </table>
        <br />
        <div style="width:800px;height:350px">
            <div id="invoiceTabContainer" dojoType="dijit.layout.TabContainer" style="width:100%;height:100%;">
                <div id="invoiceContent" dojoType="dijit.layout.ContentPane" title="Details" selected="true" style="width:auto;height:auto">
                    <div id="divInvoiceDetails">
                        <table cellspacing="30">
                            <tr>
			                    <td>
                                    <label for="Invoice_date"><%= GetLocalResourceObject("lblInvoiceDate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_date" name="date" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_invoiceDiscountAmount"><%= GetLocalResourceObject("lblInvoiceDiscountAmount.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_invoiceDiscountAmount" name="invoiceDiscountAmount" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
		                    </tr>
                            <tr>
                                <td>
                                    <label for="Invoice_deliveryDate"><%= GetLocalResourceObject("lblDueDate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_deliveryDate" name="deliveryDate" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                                </td>
                                <td>
                                    <label for="invoiceDiscountPercent"><%= GetLocalResourceObject("lblInvoiceDiscountPercent.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="invoiceDiscountPercent" name="invoiceDiscountPercent" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
		                    <tr>
                                <td>
                                    <label for="Invoice_customerReference"><%= GetLocalResourceObject("lblCustomerPO.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_customerReference" name="customerReference" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_carrierTotalPrice"><%= GetLocalResourceObject("lblCarrierTotalPrice.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_carrierTotalPrice" name="carrierTotalPrice" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="settlementDiscountPercent"><%= GetLocalResourceObject("lblSettlementDiscountPercent.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="settlementDiscountPercent" name="settlementDiscountPercent" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_taxTotal"><%= GetLocalResourceObject("lblTax.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_taxTotal" name="taxTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="settlementDiscountTerms"><%= GetLocalResourceObject("lblSettlementDiscountTerms.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="settlementDiscountTerms" name="settlementDiscountTerms" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_notes"><%= GetLocalResourceObject("lblNotes.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_notes" name="notes" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="operatingCompanyCurrency"><%= GetLocalResourceObject("lblOperatingCompanyCurrency.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="operatingCompanyCurrency" name="operatingCompanyCurrency" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_costTotal"><%= GetLocalResourceObject("lblCostTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_costTotal" name="costTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="operatingCompanyCurrencyExchangeRateDate"><%= GetLocalResourceObject("lblOperatingCompanyCurrencyExchangeRateDate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="operatingCompanyCurrencyExchangeRateDate" name="operatingCompanyCurrencyExchangeRateDate" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_profitTotal"><%= GetLocalResourceObject("lblProfitTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_profitTotal" name="profitTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="operatingCompanyCurrencyExchangeRate"><%= GetLocalResourceObject("lblOperatingCompanyCurrencyExchangeRate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="operatingCompanyCurrencyExchangeRate" name="operatingCompanyCurrencyExchangeRate" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_priceList"><%= GetLocalResourceObject("lblPriceList.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_priceList" name="priceList" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="Invoice_currency"><%= GetLocalResourceObject("lblCurrency.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_currency" name="currency" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="Invoice_salesPerson"><%= GetLocalResourceObject("lblSalesPerson.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="Invoice_salesPerson" name="salesPerson" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div id="addressesContent" dojoType="dijit.layout.ContentPane" title="Addresses" style="width:100%;height:100%;">
                    <div id="sdgrdInvoiceAddresses" style="width:100%;">
                        <div id="sdgrdInvoiceAddresses_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
                <div id="invoiceLinesContent" dojoType="dijit.layout.ContentPane" title="Invoice Lines" style="width:100%;height:100%;">
                    <div id="sdgrdInvoiceLines" style="width:100%;">
                        <div id="sdgrdInvoiceLines_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
                <div id="paymentsContent" dojoType="dijit.layout.ContentPane" title="Payments" style="width:100%;height:100%;">
                    <div id="sdgrdPayments" style="width:100%;">
                        <div id="sdgrdPayments_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
                <div id="deliveriesContent" dojoType="dijit.layout.ContentPane" title="Deliveries" style="width:100%;height:100%;">
                    <div id="sdgrdDeliveries" style="width:100%;">
                        <div id="sdgrdDeliveries_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
            </div>
        </div>
        <br />
        <table cellspacing="30">
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <div style="text-align: right">
                        <button dojoType="dijit.form.Button" id="invoiceBtnClose" type="button" onClick="invoice.closeDetailsDialog()">Close</button>
                    </div>
                </td>
            </tr>
	    </table>
    </div>
</div>