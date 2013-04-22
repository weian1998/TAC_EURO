define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            yesText: 'Yes',
            noText: 'No'
        }
    };
    return lang.mixin(LanguageList, nls);
});