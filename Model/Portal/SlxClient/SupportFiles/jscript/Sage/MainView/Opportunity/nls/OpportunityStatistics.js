define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            opportunityStatistics_Caption: 'Opportunity Statistics',
            loadingMessge: 'Loading...',
            opportunityCount: '# of Opportunities',
            salesPotentialTotal: 'Sales Potential Total (Average)',
            weightedPotentialTotal: 'Weighted Potential Total (Average)',
            averageCloseProbability: 'Average Close Probability',
            actualAmountTotal: 'Actual Amount Total (Average)',
            averageDaysOpen: 'Average # of Days Open',
            rangeEstClose: 'Range of Est. Close (Min - Max)',
            btnClose_Caption: 'Close',
            errorRequestingStatistics: 'Sorry an error occured attempting to request opportunity statistics.'
        }
    };
    return lang.mixin(LanguageList, nls);
});