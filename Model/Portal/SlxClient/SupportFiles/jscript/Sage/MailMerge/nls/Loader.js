define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            decodeFailed: "The call to DecodeMailMergeJsonFromUrl() failed."
        }
    };
    return lang.mixin(LanguageList, nls);
});