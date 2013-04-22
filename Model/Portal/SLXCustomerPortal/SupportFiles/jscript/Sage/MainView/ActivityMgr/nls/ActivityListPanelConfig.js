define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
           colNameComplete:'Complete',
           colNameAttachment:'Attachment',
           colNameRecurring:'Recurring',
           colNameAlarm: 'Alarm',
           colNameType:'Activity Type',
           colNameStartDate:'Start Date',
           colNameDuration:'Duration',
           colNameContact:'Name',
           colNameLead:'Lead',
           colNameAccount:'Account/Company',
           colNameCompany:'Company',
           colNameRegarding:'Regarding',
           colNamePriority:'Priority',
           colNameUserId:'Leader',
           colNameTimeless:'Timeless',
           colNameTypeName:'Type',
           colNameContactName:'Name',
           SnoozeAlarm: 'Snooze Alarm',
           DismissAlarm: 'Dismiss Alarm',
           colNameUnConfirmStatus: 'Unconfirmed' 
        }
    };
    return lang.mixin(LanguageList, nls);
});