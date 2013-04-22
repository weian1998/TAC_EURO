define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            dismissAllText: 'Dismiss all',
            dismissText: 'Dismiss',
            fiveMinText: '5 minutes',
            tenMinText: '10 minutes',
            fifteenMinText: '15 minutes',
            thirtyMinText: '30 minutes',
            oneHourText: '1 hour',
            twoHourText: '2 hours',
            fourHourText: '4 hours',
            eightHourText: '8 hours',
            oneDayText: '1 day',
            twoDayText: '2 days',
            threeDayText: '3 days',
            oneWeekText: '1 week',
            twoWeekText: '2 weeks',
            snoozeText: 'Snooze',
            snoozeByText: 'Snooze by:',
            snoozeAllText: 'Snooze All',
            showCalendarText: 'Show Calendar'
        }
    };
    return lang.mixin(LanguageList, nls);
});
