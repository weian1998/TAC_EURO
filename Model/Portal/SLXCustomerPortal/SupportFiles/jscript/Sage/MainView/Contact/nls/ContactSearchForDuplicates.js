define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
           svAccount_Caption: "Account:",
           svCompany_Caption: "Company:",
           svEmail_Caption: "Email:",
           svName_Caption: "Name:",
           svTitle_Caption: "Title:",
           svType_Caption: "Type:",
           svSubType_Caption: "Sub Type:",
           svAccMgr_Caption: "Acct. Mgr.:",
           svHomePhone_Caption: "Home phone:",
           svWorkPhone_Caption: "Work phone:",
           svMobilePhone_Caption: "Mobile phone:",
           svStatus_Caption: "Status:",
           svWebAddress_Caption: "Web:",
           svEntityAccount_Caption: "Account",
           svEntityLead_Caption: "Lead",
           svEntityContact_Contact: "Contact",
           svTollFree_Caption: "Toll free:",
           svIndustry_Caption: "Industry:",
           svDivision_Caption: "Division:",
           svMainPhone_Caption: "Main phone:",
           LeadSummaryView_Title: "Summary View - Lead",
           ContactSummaryView_Title: "Summary View - Contact",
           AccountSummaryView_Title: "Summary View - Account",
           closeText: "Close",
           errorLoadingSummaryView: "An error occured loading summary view: ${0}"
        }
    };
    return lang.mixin(LanguageList, nls);
});