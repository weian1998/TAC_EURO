define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            okText: 'OK',
            missingPickListText: 'The PickList Could Not be Found'
        }
    };
    return lang.mixin(LanguageList, nls);
});
