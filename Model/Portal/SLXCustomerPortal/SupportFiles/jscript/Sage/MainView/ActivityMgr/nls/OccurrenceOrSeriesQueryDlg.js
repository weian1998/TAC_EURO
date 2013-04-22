define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleFmt: '${type} - ${description}',
            actDateText: 'Activity Date:',
            contactText: 'Contact:',
            accountText: 'Account:',
            opportunityText: 'Opportunity:',
            editAllText: 'Edit all Occurrences',
            editOneText: 'Edit this Occurrence',
            completeAllText: 'Complete all Occurrences',
            completeOneText: 'Complete this Occurrence',
            deleteAllText: 'Delete all Occurrences',
            deleteOneText: 'Delete this Occurrence',
            continueText: 'Continue',
            failedToLoadMsg: 'Could not load activity'
        }
    };
    return lang.mixin(LanguageList, nls);
});