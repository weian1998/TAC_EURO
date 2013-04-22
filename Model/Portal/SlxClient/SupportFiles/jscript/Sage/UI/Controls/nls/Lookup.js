define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            buttonToolTip: 'Find',
            closeButtonToolTip: 'Remove'
        }
    };
    return lang.mixin(LanguageList, nls);
});
