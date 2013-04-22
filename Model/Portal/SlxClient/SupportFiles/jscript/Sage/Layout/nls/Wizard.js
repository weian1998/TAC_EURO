define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            nextButtonLabel: "Next >",
            backButtonLabel: "< Back",
            cancelButtonLabel: "Cancel",
            doneButtonLabel: "Finish"
        }
    };
    return lang.mixin(LanguageList, nls);
});