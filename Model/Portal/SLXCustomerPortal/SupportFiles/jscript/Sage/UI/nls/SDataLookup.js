define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            closeText: 'Close',
            cancelText: 'Cancel',
            loadingText: 'Loading...',
            noDataText: 'No records returned'
        }
    };
    return lang.mixin(LanguageList, nls);
});