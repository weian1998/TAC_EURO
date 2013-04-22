define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            title: 'Alerts',
            alarmsText: 'Alarms',
            unconfirmedText: 'Unconfirmed',
            deleteText: 'Delete Selected',
            helpText: 'Help',
            completeText: 'Complete selected activities'
        }
    };
    return lang.mixin(LanguageList, nls);
});
