define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Column"
        }
    };
    return lang.mixin(LanguageList, nls);
});