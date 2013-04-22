define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleFmtString: '${0}',
            tabDisplayNameActivity: 'Activities',
            tabDisplayNameLit: 'Literature',
            tabDisplayNameEvent: 'Events',
            tabDisplayNameConfirm: 'Confirmations',
            activityColNameComplete: 'Complete',
            activityColNameAttachment: 'Attachment',
            activityColNameRecurring: 'Recurring',
            activityColNameAlarm: 'Alarm',
            activityColNameType: 'ActivityType',
            activityColNameStartDate: 'StartDate',
            activityColNameDuration: 'Duration',
            activityColNameContact: 'Contact',
            activityColNameLead: 'Lead',
            activityColNameAccount: 'Account',
            activityColNameRegarding:'Regarding',
            activityColNamePriority:'Priority',
            activityColNameUserId: 'leader',
            activityTypePhone:'Phone',
            activityTypeCall:'Call',
            activityTypeMeeting:'Meeting',
            activityTypePersonal:'Personal'
        }
    };
    return lang.mixin(LanguageList, nls);
});
