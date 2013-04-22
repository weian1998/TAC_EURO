define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            selectAllText: 'Select All',
            findItemText: 'Find Item:',
            findText: 'Find',
            clearText: 'Clear',
            dialogTitle: 'Edit Filter Items',
            okText: 'OK',
            cancelText: 'Cancel'
        }
    };
    return lang.mixin(LanguageList, nls);
});
