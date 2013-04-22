define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            showConfirmationsText: 'Show Confirmations',
            showCalendarText: 'Show Calendar',
            acceptText: 'Accept',
            declineText: 'Decline'
        }
    };
    return lang.mixin(LanguageList, nls);
});
