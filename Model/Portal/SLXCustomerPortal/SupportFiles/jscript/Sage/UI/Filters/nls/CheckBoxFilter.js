define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            loadingText: 'Loading...',
            moreText: 'Edit Items',
            clearText: 'Clear',
            emptyText: '(Blank)',
            nullText: '(Null)',
            ofText: '/'
        }
    };
    return lang.mixin(LanguageList, nls);
});
