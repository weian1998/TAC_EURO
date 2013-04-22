define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            updateLeadsTitle: 'Update Leads',
            deleteLeadsTitle: 'Delete Leads',
            deleteJobError: 'Sorry an error occured during the delete lead job: ${0}',
            confirmDeleteLeads: 'Are you sure you want to delete the selected records?'
        }
    };
    return lang.mixin(LanguageList, nls);
});
