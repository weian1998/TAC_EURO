define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        percentComplete: 'Uploading, please wait...'
    }
    };
    return lang.mixin(LanguageList, nls);
});
