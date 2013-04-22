define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            listText: 'List',
            summaryText: 'Summary',
            detailText: 'Detail',
            hideDetailText: 'Hide Detail',
            unsavedDataText: '*unsaved data',
            helpText: 'Help',
            refreshText: 'Refresh',
            displayingText: 'Displaying',
            ofText: 'of'
        }
    };
    return lang.mixin(LanguageList, nls);
});