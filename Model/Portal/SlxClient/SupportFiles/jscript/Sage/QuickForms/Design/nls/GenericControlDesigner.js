define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Unknown"
        }
    };
    return lang.mixin(LanguageList, nls);
});