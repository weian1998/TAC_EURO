define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            logOffText: 'Log Off'
        }
    };
    return lang.mixin(LanguageList, nls);
});
