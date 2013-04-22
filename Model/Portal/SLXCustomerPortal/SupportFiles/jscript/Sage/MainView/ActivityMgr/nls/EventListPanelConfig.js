define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
           colNameType:'Type',
           colNameStartDate:'Start Date',
           colNameEndDate:'End Date',
           colNameDescription:'Description',
           colNameUser:'User',
           colNameLocation: 'Location'    
        }
    };
    return lang.mixin(LanguageList, nls);
});
