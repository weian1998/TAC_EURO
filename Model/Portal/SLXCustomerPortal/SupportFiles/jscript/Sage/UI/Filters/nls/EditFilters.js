define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            selectAllText: 'Select All',
            dialogTitle: 'Edit Filters',
            okText: 'OK',
            cancelText: 'Cancel'
        }
    };
    return lang.mixin(LanguageList, nls);
});
