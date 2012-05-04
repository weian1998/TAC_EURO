<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ICSalesOrders.ascx.cs" Inherits="ICSalesOrders" %>
<%@ Import Namespace="Sage.Platform.Application.UI" %>
<%@ Import Namespace="Sage.Platform.WebPortal.Adapters" %>
<%@ Register Assembly="Sage.SalesLogix.Web" Namespace="Sage.SalesLogix.Web" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<SalesLogix:ScriptResourceProvider ID="SalesOrderResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_Edit" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_OrderNumber" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_OrderDate" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_Status" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_HoldStatus" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_Type" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_PO" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_NetTotal" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_DiscountTotal" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_ChargesTotal" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_TaxTotal" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_GrossTotal" />
        <SalesLogix:ResourceKeyName Key="grdSalesOrder_Currency" />

        <SalesLogix:ResourceKeyName Key="grdAddress_Name" />
        <SalesLogix:ResourceKeyName Key="grdAddress_Address1" />
        <SalesLogix:ResourceKeyName Key="grdAddress_Address2" />
        <SalesLogix:ResourceKeyName Key="grdAddress_City" />
        <SalesLogix:ResourceKeyName Key="grdAddress_State" />
        <SalesLogix:ResourceKeyName Key="grdAddress_Zip" />

        <SalesLogix:ResourceKeyName Key="grdItems_Line" />
        <SalesLogix:ResourceKeyName Key="grdItems_Type" />
        <SalesLogix:ResourceKeyName Key="grdItems_Commodity" />
        <SalesLogix:ResourceKeyName Key="grdItems_CommodityVariant" />
        <SalesLogix:ResourceKeyName Key="grdItems_CommodityDimension" />
        <SalesLogix:ResourceKeyName Key="grdItems_UnitOfMeasure" />
        <SalesLogix:ResourceKeyName Key="grdItems_Location" />
        <SalesLogix:ResourceKeyName Key="grdItems_PriceList" />
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

<div id="sdgrdSalesOrders_container" style="width:100%;">
    <div id="sdgrdSalesOrders_Grid" style="width:100%;height:325px;"></div>
</div>

<SalesLogix:SmartPartToolsContainer runat="server" ID="ICSalesOrders_RTools" ToolbarLocation="right">
    <asp:ImageButton runat="server" ID="cmdAddERPSalesOrder" OnClientClick="ExecuteErpInsertView();" ToolTip="<%$ resources: cmdAddSalesOrder.ToolTip %>" ImageUrl="~/images/icons/plus_16x16.gif" />
    <SalesLogix:PageLink ID="lnkICSalesOrdersHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="MCWebHelp"
        NavigateUrl="Account_Accounting_Sales_Orders" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<div style="display: none;">
    <div dojoType="dijit.Dialog" id="dlgSalesOrderDetails" onHide="salesOrder.handleOnHide()" title="Sales Order Details" execute="">
	    <table cellspacing="30">
		    <tr>
			    <td>
                    <label for="SalesOrder_reference"><%= GetLocalResourceObject("lblSalesOrder.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="SalesOrder_reference" name="reference" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="SalesOrder_status"><%= GetLocalResourceObject("lblStatus.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="SalesOrder_status" name="status" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
		    <tr>
<%--                <td>
                    <label for="tradingAccountkey"><%= GetLocalResourceObject("lblAccount.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="tradingAccountkey" name="tradingAccount.$key" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>--%>
                <td>
                    <label for="SalesOrder_grossTotal"><%= GetLocalResourceObject("lblGrossTotal.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="SalesOrder_grossTotal" name="grossTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
	    </table>
        <br />
        <div style="width:800px;height:350px">
            <div id="salesOrderContainer" dojoType="dijit.layout.TabContainer" style="width:100%;height:100%;">
                <div id="salesOrderContent" dojoType="dijit.layout.ContentPane" title="Details" selected="true" style="width:auto;height:auto">
                    <div id="divDetails">
                        <table cellspacing="30">
                            <tr>
			                    <td>
                                    <label for="SalesOrder_OrderDate"><%= GetLocalResourceObject("lblOrderDate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_OrderDate" name="date" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_TaxTotal"><%= GetLocalResourceObject("lblTaxTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_TaxTotal" name="taxTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
		                    </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_HoldStatus"><%= GetLocalResourceObject("lblHoldStatus.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_HoldStatus" name="statusFlagText" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_Currency"><%= GetLocalResourceObject("lblCurrency.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_Currency" name="currency" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
		                    <tr>
                                <td>
                                    <label for="SalesOrder_Type"><%= GetLocalResourceObject("lblType.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_Type" name="type" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_CostTotal"><%= GetLocalResourceObject("lblCostTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_CostTotal" name="costTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_PONumber"><%= GetLocalResourceObject("lblPONumber.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_PONumber" name="customerReference" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_ProfitTotal"><%= GetLocalResourceObject("lblProfitTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_ProfitTotal" name="profitTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_Quotation"><%= GetLocalResourceObject("lblQuotation.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_Quotation" name="quotation.reference" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_InvoiceStatus"><%= GetLocalResourceObject("lblinvoiceStatus.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_InvoiceStatus" name="invoiceStatus" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_Contact"><%= GetLocalResourceObject("lblContact.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_Contact" name="buyerContact.fullName" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_DeliveryDate"><%= GetLocalResourceObject("lblDeliveryDate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_DeliveryDate" name="deliveryDate" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_SalesPerson"><%= GetLocalResourceObject("lblSalesPerson.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_SalesPerson" name="salesPersons" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_DueDate"><%= GetLocalResourceObject("lblDueDate.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_DueDate" name="dueDate" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_PriceList"><%= GetLocalResourceObject("lblPriceList.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_PriceList" name="pricelist.name" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_Carrier"><%= GetLocalResourceObject("lblCarrier.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_Carrier" name="carrierCompany" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_NetTotal"><%= GetLocalResourceObject("lblNetTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_NetTotal" name="netTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_AllocationStatus"><%= GetLocalResourceObject("lblAllocationStatus.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_AllocationStatus" name="allocationStatus" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_DiscountTotal"><%= GetLocalResourceObject("lblDiscountTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_DiscountTotal" name="discountTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                                <td>
                                    <label for="SalesOrder_DeliveryStatus"><%= GetLocalResourceObject("lblDeliveryStatus.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_DeliveryStatus" name="deliveryStatus" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <label for="SalesOrder_ChargesTotal"><%= GetLocalResourceObject("lblChargesTotal.Caption")%></label>
                                </td>
                                <td>
                                    <input type="text" id="SalesOrder_ChargesTotal" name="chargesTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div id="soAddressesContent" dojoType="dijit.layout.ContentPane" title="Addresses" style="width:100%;height:100%;">
                    <div id="sdgrdSalesOrderAddresses" style="width:100%;">
                        <div id="sdgrdSalesOrderAddresses_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
                <div id="soLinesContent" dojoType="dijit.layout.ContentPane" title="Sales Order Lines" style="width:100%;height:100%;">
                    <div id="sdgrdSalesOrderLines" style="width:100%;">
                        <div id="sdgrdSalesOrderLines_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
                <div id="soPaymentsContent" dojoType="dijit.layout.ContentPane" title="Payments" style="width:100%;height:100%;">
                    <div id="sdgrdSOPayments" style="width:100%;">
                        <div id="sdgrdSOPayments_Grid" style="width:100%;height:300px;"></div>
                    </div>
                </div>
                <div id="soDeliveriesContent" dojoType="dijit.layout.ContentPane" title="Deliveries" style="width:100%;height:100%;">
                    <div id="sdgrdSODeliveries" style="width:100%;">
                        <div id="sdgrdSODeliveries_Grid" style="width:100%;height:300px;"></div>
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
                        <button dojoType="dijit.form.Button" id="soBtnClose" type="button" onClick="salesOrder.closeDetailsDialog()">Close</button>
                    </div>
                </td>
            </tr>
	    </table>
    </div>
</div>