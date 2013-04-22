define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            noQueryDataText: 'The server has no data for query ',
            initializingText: 'Initializing'
        }
    };
    return lang.mixin(LanguageList, nls);
});
