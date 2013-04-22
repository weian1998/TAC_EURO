define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            helpTooltip: 'Help'
        }
    };
    return lang.mixin(LanguageList, nls);
});
