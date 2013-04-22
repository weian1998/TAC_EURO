define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            ToDo: 'To-Do',
            PhoneCall: 'Phone Call',
            Meeting: 'Meeting',
            Personal: 'Personal Activity',
            Literature: 'Literature',
            Fax: 'Fax',
            Letter: 'Letter',
            Note: 'Note',
            Email: 'E-mail',
            Document: 'Document',
            DatabaseChange: 'Database Change',
            Event: 'Event',
            ScheduledEvent: 'Scheduled Event',
            Contact: 'Contact',
            Lead: 'Lead',
            New: 'New',
            Change: 'Change',
            Deleted: 'Deleted',
            Confirm: 'Confirm',
            Decline: 'Decline',
            Unknown: 'Unknown',
            Leader: 'Leader',
            Complete: 'Complete',
            confirmTypeChanged: 'Changed',
            confirmTypeConfirmed: 'Confirmed',
            confirmTypeDeleted: 'Deleted'
        }
    };
    return lang.mixin(LanguageList, nls);
});