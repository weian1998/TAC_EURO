define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            btnOkayText: 'OK',
            btnCancelText: 'Cancel',
            btnCloseText: 'Close',
            btnHelpText: 'Help',
            processingText: 'Processing request please wait...',
            failureText: 'I\'m sorry, the action was not successful an error occurred.',
            titleText: 'Process'
         }
    };
    return lang.mixin(LanguageList, nls);
});
