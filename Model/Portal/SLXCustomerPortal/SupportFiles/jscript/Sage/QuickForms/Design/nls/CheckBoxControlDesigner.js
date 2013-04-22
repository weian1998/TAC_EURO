define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "CheckBox"
        }
    };
    return lang.mixin(LanguageList, nls);
});