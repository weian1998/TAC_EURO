define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "DateTime Picker"
        }
    };
    return lang.mixin(LanguageList, nls);
});