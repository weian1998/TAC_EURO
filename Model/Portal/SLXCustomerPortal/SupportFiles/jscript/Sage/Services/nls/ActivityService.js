define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            txtErrorActionMsg:'I\'m sorry, the action was not successful an error occurred.',
            txtActivity:'activity',
            txtActivities:'activities',
            txtActionDeleteActivites: 'Delete Activities',
            txtActionDeleteActivitiesQuestion: 'Only activities that you have permission to delete will be deleted. <P> Are you sure you want to delete the {0} selected {1}?',
            txtAlarm:'alarm',
            txtAlarms:'alarms',
            txtActionSnoozeAlarm:'Snooze Alarm',
            txtActionSnoozeQuestion: 'Are you sure you want to snooze the {0} selected {1} for {2} ?',
            txtActionSnoozeAllQuestion:'Are you sure you want to snooze all {0} for {1} ?',
            txtActionDismissAlarms:'Dismiss Alarms',
            txtActionDismissAlarmsQuestion:'Are you sure you want to dismiss the {0} selected {1}?',
            txtEvent:'event',
            txtEvents:'events',
            txtActionDeleteEvents: 'Delete Events',
            txtActionDeleteEventsQuestion:'Only events that you have permission to delete will be deleted. <P> Are you sure you want to delete the {0} selected {1}?',
            txtConfirmation:'confirmation',
            txtConfirmations:'confirmations',
            txtActionAcceptConfirmations:'Accept Confirmations',
            txtActionAcceptConfirmQuestion: 'Are you sure you want to accept the {0} selected {1}? This action can only be performed on New or Chnaged confirmations. All others will be ignored.',
            txtDeclineConfirmations:'Decline Confirmations',
            txtActionDeclineConfrimQuestion: 'Are you sure you want to decline the {0} selected {1}? This action can only be performed on New or Chnaged confirmations. All others will be ignored.',
            txtActionRemoveConfirmations:'Delete Confirmations',
            txtActionRemoveConfirmationsQuestion: 'Are you sure you want to delete the {0} selected {1}? This action can only be performed on Leader, Declined or Deleted confirmations. All others will be ignored.',
            txtLiteratureRequest:'literature request',
            txtLiteratureRequests:'literature requests',
            txtActionDeleteLiteratureRequests:'Delete Literature Requests',
            txtActionDeleteLiteratureRequestsQuestion:'Only literature request that you have permission to delete will be deleted. <P> Are you sure you want to delete the {0} selected {1}?'
         }
    };
    return lang.mixin(LanguageList, nls);
});
