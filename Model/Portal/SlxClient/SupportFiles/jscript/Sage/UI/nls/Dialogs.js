define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            yesText: 'Yes',
            noText: 'No',
            okText: 'OK',
            cancelText: 'Cancel'            
        }
    };
    return lang.mixin(LanguageList, nls);
});