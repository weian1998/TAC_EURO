define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            headerText: "Non-Visual Controls"
        }
    };
    return lang.mixin(LanguageList, nls);
});