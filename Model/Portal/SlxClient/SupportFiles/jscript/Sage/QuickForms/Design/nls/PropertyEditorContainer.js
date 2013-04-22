define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            specificTitleFormatText: "${0} Properties (${1})",
            genericTitleFormatText: "${0} Properties"
        }
    };
    return lang.mixin(LanguageList, nls);
});