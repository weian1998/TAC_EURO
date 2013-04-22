define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            editText: 'Edit'
        }
    };
    return lang.mixin(LanguageList, nls);
});
