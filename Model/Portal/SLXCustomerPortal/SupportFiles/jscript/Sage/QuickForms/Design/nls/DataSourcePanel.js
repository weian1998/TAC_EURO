define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            loadingText: "Loading..."
        }
    };
    return lang.mixin(LanguageList, nls);
});