define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            minuteText: 'minute',
            minutesText: 'minutes',
            hourText: 'hour',
            hoursText: 'hours',
            dayText: 'day',
            daysText: 'days'
        }
    };
    return lang.mixin(LanguageList, nls);
});
