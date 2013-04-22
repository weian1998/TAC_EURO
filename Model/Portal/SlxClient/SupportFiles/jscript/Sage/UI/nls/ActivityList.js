define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            addMeetingText: 'Schedule Meeting',
            addPhoneCallText: 'Schedule Phone Call',
            addToDoText: 'Schedule To-Do',
            helpText: 'Help',
            completeText: 'Complete',
            typeText: 'Type',
            startDateText: 'Date/Time',
            dateRangeText: 'Date Range',
            durationText: 'Duration',
            leaderText: 'Leader',
            contactText: 'Contact',
            opportunityText: 'Opportunity',
            descriptionText: 'Regarding',
            categoryText: 'Category',
            firstNameText: 'First Name',
            lastNameText: 'Last Name'
            
       }
    };
    return lang.mixin(LanguageList, nls);
});