define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            buttonOKText: 'OK',
            buttonCancelText: 'Cancel',
            timeZoneText: 'Time zone',
            timeZoneSettingsText: 'Time Zone Settings',
            setTimeZoneText: 'Set the time zone:'
        }
    };
    return lang.mixin(LanguageList, nls);
});