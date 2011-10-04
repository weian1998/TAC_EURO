<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ICCustomerPayments.ascx.cs" Inherits="SmartParts_Account_CustomerPayments" %>
<%@ Register Assembly="Sage.SalesLogix.Client.GroupBuilder" Namespace="Sage.SalesLogix.Client.GroupBuilder" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web" Namespace="Sage.SalesLogix.Web" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.Platform.WebPortal" Namespace="Sage.Platform.WebPortal.SmartParts" TagPrefix="SalesLogix" %>
<%@ Register Assembly="Sage.SalesLogix.Web.Controls" Namespace="Sage.SalesLogix.Web.Controls.ScriptResourceProvider" TagPrefix="Saleslogix" %>

<SalesLogix:ScriptResourceProvider ID="PaymentsResources" runat="server">
    <Keys>
        <SalesLogix:ResourceKeyName Key="grdPayments_Reference" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Date" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Type" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Status" />
        <SalesLogix:ResourceKeyName Key="grdPayments_GrossTotal" />
        <SalesLogix:ResourceKeyName Key="grdPayments_Currency" />
    </Keys>
</SalesLogix:ScriptResourceProvider>

<SalesLogix:SmartPartToolsContainer runat="server" ID="ICPayments_RTools" ToolbarLocation="right">
    <SalesLogix:PageLink ID="lnkICPaymentsHelp" runat="server" LinkType="HelpFileName" ToolTip="<%$ resources: Portal, Help_ToolTip %>" Target="MCWebHelp"
        NavigateUrl="Account_Payments_Tab" ImageUrl="~/ImageResource.axd?scope=global&type=Global_Images&key=Help_16x16">
    </SalesLogix:PageLink>
</SalesLogix:SmartPartToolsContainer>

<div id="sdgrdPayments_container" style="width:100%;">
    <div id="sdgrdPayments_Grid" style="width:100%;height:325px;"></div>
</div>

<div style="display: none;">
    <div dojoType="dijit.Dialog" id="dlgPaymentDetails" title="Payment Details" execute="">
	    <table cellspacing="30">
		    <tr>
			    <td>
                    <label for="PaymentDetails_reference"><%= GetLocalResourceObject("lblReference.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_reference" name="reference" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_date"><%= GetLocalResourceObject("lblDate.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_date" name="date" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                </td>
		    </tr>
		    <tr>
                <td>
                    <label for="PaymentDetails_processDate"><%= GetLocalResourceObject("lblProcessDate.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_processDate" name="processDate" readonly="readonly" dojoType="Sage.UI.DateTextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_name"><%= GetLocalResourceObject("lblName.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_name" name="name" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
                <td>
                    <label for="PaymentDetails_type"><%= GetLocalResourceObject("lblType.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_type" name="type" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_status"><%= GetLocalResourceObject("lblStatus.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_status" name="status" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
                <td>
                    <label for="PaymentDetails_currency"><%= GetLocalResourceObject("lblCurrency.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_currency" name="processDatecurrency" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_tenderType"><%= GetLocalResourceObject("lblTenderType.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_tenderType" name="tenderType" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
                <td>
                    <label for="PaymentDetails_tenderReference"><%= GetLocalResourceObject("lblTenderReference.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_tenderReference" name="tenderReference" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_originatorDocument"><%= GetLocalResourceObject("lblInvoice.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_originatorDocument" name="originatorDocument" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
                <td>
                    <label for="PaymentDetails_netTotal"><%= GetLocalResourceObject("lblNetTotal.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_netTotal" name="netTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_discountTotal"><%= GetLocalResourceObject("lblDiscounts.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_discountTotal" name="discountTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
                <td>
                    <label for="PaymentDetails_chargesTotal"><%= GetLocalResourceObject("lblCharges.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_chargesTotal" name="chargesTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_taxTotal"><%= GetLocalResourceObject("lblTaxes.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_taxTotal" name="taxTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
                <td>
                    <label for="PaymentDetails_grossTotal"><%= GetLocalResourceObject("lblGrossTotal.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_grossTotal" name="grossTotal" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
                <td>
                    <label for="PaymentDetails_source"><%= GetLocalResourceObject("lblSource.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_source" name="source" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
            <tr>
<%--                <td>
                    <label for="PaymentDetails_tradingAccount"><%= GetLocalResourceObject("lblTradingAccount.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_tradingAccount" name="tradingAccount.name" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>--%>
                <td>
                    <label for="PaymentDetails_taxCode"><%= GetLocalResourceObject("lblTaxCode.Caption")%></label>
                </td>
                <td>
                    <input type="text" id="PaymentDetails_taxCode" name="taxCode" readonly="readonly" dojoType="dijit.form.TextBox" />
                </td>
		    </tr>
	    </table>
        <br />
        <table cellspacing="30">
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td>
                    <div style="text-align: right">
                        <button dojoType="dijit.form.Button" id="paymentBtnClose" type="button" onClick="payment.closeDetailsDialog()">Close</button>
                    </div>
                </td>
            </tr>
	    </table>
    </div>
</div>