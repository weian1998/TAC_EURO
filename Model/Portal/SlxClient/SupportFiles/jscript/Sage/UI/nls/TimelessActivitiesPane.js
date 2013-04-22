define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            header_complete: 'Complete',
            header_type: 'Type',
            header_contact: 'Name',
            header_regarding: 'Regarding',
            tooltip_type : 'Type',
            tooltip_contact: 'Contact',
            tooltip_account: 'Account',
            tooltip_lead : 'Lead',
            tooltip_phone : 'Phone',
            tooltip_leader : 'Leader',
            tooltip_regarding : 'Regarding',
            tooltip_location : 'Location',
            tooltip_notes : 'Notes',
            tooltip_company: 'Company'
        }
    };
    return lang.mixin(LanguageList, nls);
});