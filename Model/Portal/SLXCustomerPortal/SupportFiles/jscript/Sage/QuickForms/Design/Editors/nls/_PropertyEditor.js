define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Properties"
        }
    };
    return lang.mixin(LanguageList, nls);
});