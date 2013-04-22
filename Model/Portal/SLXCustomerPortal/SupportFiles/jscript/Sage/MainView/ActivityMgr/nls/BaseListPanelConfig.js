define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleFmtString: '${0}'
        }
    };
    return lang.mixin(LanguageList, nls);
});