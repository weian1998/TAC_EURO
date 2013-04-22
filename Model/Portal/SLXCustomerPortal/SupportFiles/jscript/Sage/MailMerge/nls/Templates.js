define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            cancelCaption: "Cancel",
            dialogCaption: "Select a Template",
            invalidOptionsText: "The options parameter or options.onSelect is undefined or defined incorrectly.",
            loadingText: "Loading. Please wait...",
            okCaption: "OK"
        }
    };
    return lang.mixin(LanguageList, nls);
});
