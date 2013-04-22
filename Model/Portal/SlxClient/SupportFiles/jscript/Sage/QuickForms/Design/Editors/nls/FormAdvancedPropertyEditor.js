define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Advanced",
            generalText: "General",
            useEntityNameAsTitleText: "Use Entity Name As Title:",
            useEntityNameAsTitleTooltipText: "Use name of current entity in form title."
        }
    };
    return lang.mixin(LanguageList, nls);
});