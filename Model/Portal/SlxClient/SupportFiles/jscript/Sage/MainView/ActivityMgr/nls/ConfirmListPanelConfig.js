define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            colNameType:'Activity Type',
            colNameNotification:'Notification',
            colNameStartDate:'Start Date',
            colNameDuration:'Duration',
            colNameRegarding:'Regarding',
            colNameFromUser:'From',
            colNameToUser:'To User'
        }
    };
    return lang.mixin(LanguageList, nls);
});