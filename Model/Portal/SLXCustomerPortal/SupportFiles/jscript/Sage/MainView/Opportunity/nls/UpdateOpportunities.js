define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            addToForecast_No: 'No',
            addToForecast_Yes: 'Yes',
            btnCancel_Caption: 'Cancel',
            btnOK_Caption: 'OK',
            estimatedClose_Days: 'days',
            estimatedClose_MoveOut: 'Move',
            estimatedClose_To: 'To',
            moveEstCloseDate_Backward: 'Backward',
            moveEstCloseDate_Forward: 'Forward',
            update_To_Caption: 'To:',
            update_Property_Caption: 'Update:',
            updateMultipleOpps_Caption: 'Update Opportunities',
            updateProp_AcctMgr: 'Account Manager',
            updateProp_Comments: 'Comments',
            updateProp_EstClose: 'Estimated Close',
            updateProp_Forecast: 'Add To Forecast',
            updateProp_Probability: 'Close Probability %',
            lookupActMgrText: 'Lookup Account Manager',
            lookupNameColText: 'Name',
            lookupTitleColText: 'Title',
            lookupDepartmentColText: 'Department',
            lookupRegionColText: 'Region',
            lookupTypeColText: 'Type',
            errorUnspecifiedValue: 'Please specify a value before continuing.',
            errorRequestingJobMgr: 'An error occured performing update: ${0}'
        }
    };
    return lang.mixin(LanguageList, nls);
});