define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            googleDocumentsTitle: 'Google Documents',
            couldNotOpenWindowMsg: 'Could not open authentication window - please check your popup blocker settings.'
        }
    };
    return lang.mixin(LanguageList, nls);
});