define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            newTabTitleText: 'New Tab Title',
            inputTitleText: 'Input a Title',
            copiedPageText: 'Copied Tab',
            showText: 'Show'
        }
    };
    return lang.mixin(LanguageList, nls);
});
