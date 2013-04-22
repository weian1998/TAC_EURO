define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            displayNameText: "Data Grid",
            emptyTableRowStringText: "No records match the selection criteria."
        }
    };
    return lang.mixin(LanguageList, nls);
});