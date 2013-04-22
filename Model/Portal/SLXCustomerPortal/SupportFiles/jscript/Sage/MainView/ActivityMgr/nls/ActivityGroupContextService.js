define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            activityTabDisplayName: 'My Activities',
            litTabDisplayName: 'Literature',
            eventTabDisplayName: 'Events',
            confirmTabDisplayName: 'Confirmations',
            pastDueTabDisplayName: 'Past Due',
            alarmTabDisplayName: 'Alarms',
            allOpenTabDisplayName: 'All Open'
        }
    };
    return lang.mixin(LanguageList, nls);
});