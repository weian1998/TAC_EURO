define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Hidden Text"
        }
    };
    return lang.mixin(LanguageList, nls);
});