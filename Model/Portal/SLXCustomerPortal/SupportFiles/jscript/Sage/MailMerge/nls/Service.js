define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            selectContactCaption: "Select a Contact",
            selectOppContactCaption: "Select an Opportunity Contact",
            selectLeadCaption: "Select a Lead",
            errorAttachmentUpdate: "Unable to update the Attachment record.",
            errorHistoryUpdate: "Unable to update the History record.",
            errorXmlHttp: "There was an error processing the request for ${0}. ${1} (${2})."
        }
    };
    return lang.mixin(LanguageList, nls);
});
