define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Pick List"
        }
    };
    return lang.mixin(LanguageList, nls);
});