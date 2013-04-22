define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            startsInText: 'Starts in',
            overduebyText: 'Overdue by',
            minuteText: 'minute',
            minutesText: 'minutes',
            hourText: 'hour',
            hoursText: 'hours',
            dayText: 'day',
            daysText: 'days',
            weekText: 'week',
            weeksText: 'weeks',
            monthText: 'month',
            monthsText: 'months',
            yearText: 'year',
            yearsText: 'years',
            startsNowText: 'Starts now'
        }
    };
    return lang.mixin(LanguageList, nls);
});
