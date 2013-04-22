define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            completedText : '(Completed)'
        }
    };
    return lang.mixin(LanguageList, nls);
});