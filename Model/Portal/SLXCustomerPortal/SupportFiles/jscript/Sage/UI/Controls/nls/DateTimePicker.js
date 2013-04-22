define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            okText: 'OK',
            cancelText: 'Cancel',
            convertDescription: 'Compare to another time zone.',
            convertText: 'Compare',
            calculatorText: 'Time Zone Calculator',
            timeZoneSourceText: 'Current Time Zone',
            timeZoneDestText: 'Comparison Time Zone',
            buttonToolTip: 'Calendar',
            timeStartText: 'Time',
            timeZoneCalculatorText: 'Time Zone Calculator'
        }
    };
    return lang.mixin(LanguageList, nls);
});
