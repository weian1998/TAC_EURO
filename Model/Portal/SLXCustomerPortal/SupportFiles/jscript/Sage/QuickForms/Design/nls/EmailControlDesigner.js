define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Email"
        }
    };
    return lang.mixin(LanguageList, nls);
});