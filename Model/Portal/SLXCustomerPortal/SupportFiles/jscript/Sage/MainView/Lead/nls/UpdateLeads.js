define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            updateMultipleLeads_Caption: 'Update Multiple Leads',
            labelWidth: '100',
            btnCancel_Caption: 'Cancel',
            ok_Text: 'OK',
            update_To_Caption: 'To:',
            update_Property_Caption: 'Update:',
            updateProp_Owner: 'Owner',
            lookupOwnerText: 'Lookup Owner:',
            lookupDescriptionColText: 'Description',
            updateProp_AcctMgr: 'Account Manager',
            lookupActMgrText: 'Lookup Account Manager',
            lookupNameColText: 'Name',
            lookupTitleColText: 'Title',
            lookupDepartmentColText: 'Department',
            lookupRegionColText: 'Region',
            lookupTypeColText: 'Type',
            errorUnspecifiedValue: 'Please specify a value before continuing.',
            errorRequestingJobMgr: 'An error occurred requesting the job manager.'
        }
    };
    return lang.mixin(LanguageList, nls);
});
