define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            closeTooltipText: 'Close',
            minimizeTooltipText: 'Minimize',
            settingsTooltipText: 'Settings'
        }
    };
    return lang.mixin(LanguageList, nls);
});
