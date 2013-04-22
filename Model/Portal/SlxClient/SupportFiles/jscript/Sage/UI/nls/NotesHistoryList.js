define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            typeText: 'Type',
            showDbChangesText: 'Show Database Changes',
            selectAllText: 'Select All',
            dateText: 'Date',
            dateTimeText: 'Date/Time',
            dateRangeText: 'Date Range',
            userText: 'User',
            accountText: 'Account',
            contactText: 'Contact',
            opportunityText: 'Opportunity',
            regardingText: 'Regarding',
            notesText: 'Notes',
            resultText: 'Result',
            categoryText: 'Category',
            sendEmailText: 'Send via E-Mail',
            sendToWordText: 'Send to Word',
            addNoteText: 'Add Note',
            completeAnActivityText: 'Complete an Activity',
            helpText: 'Help',
            pleaseSelectRecordsText: 'Please select one or more records',
            UnableToFindWordMsg: 'Cannot start Microsoft Word.  Please check your security settings.',
            printedOnText: 'Printed On'
        }
    };
    return lang.mixin(LanguageList, nls);
});