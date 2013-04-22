define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            closeText: 'Close',
            dialogTitle: 'Copy Text To Clipboard',
            helpText: 'Select desired text and press Control-C (Command-C on Mac) to copy to your clipboard.',
            textTab: 'Text',
            sourceTab: 'Source'
        }
    };
    return lang.mixin(LanguageList, nls);
});
