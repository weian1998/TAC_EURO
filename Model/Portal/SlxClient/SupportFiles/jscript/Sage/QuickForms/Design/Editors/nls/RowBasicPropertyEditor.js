define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Basic",
            appearanceText: "Appearance",
            indexText: "Index:",
            indexTooltipText: "Number of the row or column, beginning with zero."
        }
    };
    return lang.mixin(LanguageList, nls);
});