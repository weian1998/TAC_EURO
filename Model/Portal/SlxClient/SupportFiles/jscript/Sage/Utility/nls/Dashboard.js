define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            pageText: 'Page'
        }
    };
    return lang.mixin(LanguageList, nls);
});