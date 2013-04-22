define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            applyText: 'Apply',
            resetText: 'Reset',
            filterText: 'Filter'
        }
    };
    return lang.mixin(LanguageList, nls);
});