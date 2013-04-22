define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        updatePricingRecords: 'You may only select one record when performing this option.'
    }
    };
    return lang.mixin(LanguageList, nls);
});
