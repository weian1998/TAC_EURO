define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            groupText: 'Groups',
            addGroupButtonTooltip: 'Add Group',
            groupButtonTooltip: 'Manage Groups',
            lookupText: 'Lookup',
            lookupResultsText: 'Lookup Results',
            groupColumnText: 'Group',
            visibleColumnText: 'Visible'
        }
    };
    return lang.mixin(LanguageList, nls);
});