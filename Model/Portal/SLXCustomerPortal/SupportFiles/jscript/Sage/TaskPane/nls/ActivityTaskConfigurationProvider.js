define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            scheduleText: 'Schedule',
            eventText: 'Event',
            phoneCallText: 'Phone Call',
            toDoText: 'To-Do',
            meetingText: 'Meeting',
            personalActivityText: 'Personal Activity',
            deleteConfirmationText: 'Delete Confirmation',
            acceptConfirmationText: 'Accept Confirmation',
            declineConfirmationText: 'Decline Confirmation',
            completeActivityText: 'Complete Activity',
            deleteActivityText: 'Delete Activity',
            deleteEventText: 'Delete Event',
            scheduleEventText: 'Schedule Event',
            scheduleRequestText: 'Schedule Request',
            deleteRequestText: 'Delete Request',
            recordsSelectedText: 'record(s) selected',
            clearText: 'Clear'
        }
    };
    return lang.mixin(LanguageList, nls);
});
