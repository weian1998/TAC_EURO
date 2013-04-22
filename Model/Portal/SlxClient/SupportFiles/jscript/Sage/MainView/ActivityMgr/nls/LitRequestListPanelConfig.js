define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            colNameView:'View',
            colNameContact:'Contact',
            colNameDescription:'Description',
            colNameFillDate: 'Filled',
            colNameFillStatus:'Status',
            colNameOptions:'Options',
            colNamePriority:'Priority',
            colNameReqestDate:'Request Date',
            colNameSendDate:'Send Date',
            colNameSendVia:'Send Via',
            colNameTotalCost:'Total Cost',
            colNameFillUser: 'Fill User',
            colNameReqestUser:'Request User',
            colNameAccount:'Account',
            colNamePostalCode:'Postal Code'
        }
    };
    return lang.mixin(LanguageList, nls);
});