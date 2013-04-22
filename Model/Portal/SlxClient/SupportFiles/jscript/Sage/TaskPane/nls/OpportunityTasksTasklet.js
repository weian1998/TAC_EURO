define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        updateOpportunitiesTitle: 'Update Opportunities',
        opportunityStatisticsTitle: 'Opportunity Statistics'
    }
    };
    return lang.mixin(LanguageList, nls);
});
