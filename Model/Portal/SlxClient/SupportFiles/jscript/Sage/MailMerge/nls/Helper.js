define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            destkopErrorsError: "The call to DesktopErrors() failed.",
            mailMergeInfoStoreError: "The call to MailMergeInfoStore() failed."
        }
    };
    return lang.mixin(LanguageList, nls);
});