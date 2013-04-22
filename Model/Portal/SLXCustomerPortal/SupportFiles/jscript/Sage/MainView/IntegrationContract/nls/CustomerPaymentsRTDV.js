define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            dialogCaption: "Payment Details",
            loadingText: "loading...",
            lblReferenceCaption: "Receipt Number:",
            lblDateCaption: "Payment Date:",
            lblProcessDateCaption: "Process Date:",
            lblNameCaption: "Name:",
            lblTypeCaption: "Type:",
            lblStatusCaption: "Status:",
            lblCurrencyCaption: "Currency:",
            lblTenderTypeCaption: "Tender Type:",
            lblTenderReferenceCaption: "Tender Reference:",
            lblNetTotalCaption: "Net Total:",
            lblDiscountsCaption: "Discounts:",
            lblChargesCaption: "Charges:",
            lblTaxesCaption: "Taxes:",
            lblGrossTotalCaption: "Payment Amount:",
            lblSourceCaption: "Source:",
            lblTaxCodeCaption: "Tax Code:",
            grdPayments_Reference: "Receipt Number",
            grdPayments_Date: "Payment Date",
            grdPayments_Type: "Type",
            grdPayments_Status: "Status",
            grdPayments_GrossTotal: "Payment Amount",
            grdPayments_Currency: "Currency",
            btnCloseCaption: "Close"
        }
    };
    return lang.mixin(LanguageList, nls);
});