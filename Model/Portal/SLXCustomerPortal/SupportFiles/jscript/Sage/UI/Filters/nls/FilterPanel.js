define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            editText: 'Edit Filters',
            noneText: 'No filters selected',
            clearText: 'Clear All'
        }
    };
    return lang.mixin(LanguageList, nls);
});
