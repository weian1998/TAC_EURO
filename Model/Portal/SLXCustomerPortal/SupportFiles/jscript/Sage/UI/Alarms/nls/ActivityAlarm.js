define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            noSubjectText: 'No Subject',
            contactText: 'Contact',
            accountText: 'Account',
            opportunityText: 'Opportunity',
            leadText: 'Lead',
            companyText: 'Company',
            recurringText: 'Recurring',
            ticketText: 'Ticket',
            leaderText: 'Leader',
            locationText: 'Location'
        }
    };
    return lang.mixin(LanguageList, nls);
});
