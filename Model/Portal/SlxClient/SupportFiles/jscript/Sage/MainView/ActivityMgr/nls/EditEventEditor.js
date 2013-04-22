define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleScheduleText: 'Schedule Event',
            titleEditText: 'Edit Event',
            lblDayTypeText: 'Day Type:',
            lblStartDateText: 'Start Date:',
            lblEndDateText: 'End Date:',
            lblUserText: 'User:',
            lookupUserText: 'Lookup User',
            lblCategoryText: 'Category:',
            lblLocationText: 'Location:',
            lblDescriptionText: 'Description:',
            btnOkayText: 'OK',
            btnCancelText: 'Cancel',
            btnHelpText: 'Help',
            eventTypeActiveText: 'Active',
            eventTypeBusinessTripText: 'Business Trip',
            eventTypeConferenceText: 'Conference',
            eventTypeHolidayText: 'Holiday',
            eventTypeOffText: 'Off',
            eventTypeTradeShowText: 'Trade Show',
            eventTypeUnavailableText: 'Unavailable',
            eventTypeVacationText: 'Vacation',
            errorText: 'I\'m sorry, the event could not be created because an error occurred.',
            invaildDatesText: 'I\'m sorry, the end date cannot be earlier than the start date.',
            nameText: 'Name',  
        }
    };
    return lang.mixin(LanguageList, nls);
});