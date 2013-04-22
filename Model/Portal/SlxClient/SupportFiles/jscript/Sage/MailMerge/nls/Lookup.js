define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            accountCaption: "Account",
            companyCaption: "Company",
            contactTitle: "Select a Contact",
            emailCaption: "E-mail",
            firstNameCaption: "First Name",
            invalidOptionsText: "The options parameter or options.onSelect is undefined or defined incorrectly.",
            lastNameCaption: "Last Name",
            leadTitle: "Select a Lead",
            mobileCaption: "Mobile",
            opportunityCaption: "Opportunity",
            workCaption: "Work",
            okText: "OK"
        }
    };
    return lang.mixin(LanguageList, nls);
});
