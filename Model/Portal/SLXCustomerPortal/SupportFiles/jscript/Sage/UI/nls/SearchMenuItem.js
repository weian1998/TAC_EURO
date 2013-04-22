define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            findText: 'Find',
            clearText: 'Clear',
            showHiddenText: 'Show Hidden: '
        }
    };
    return lang.mixin(LanguageList, nls);
});