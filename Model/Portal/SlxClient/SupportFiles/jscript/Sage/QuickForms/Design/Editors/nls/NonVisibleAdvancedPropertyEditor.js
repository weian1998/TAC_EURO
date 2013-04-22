define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Advanced",
            controlInfoText: "Control Info",
            controlIdText: "Control Id:",
            controlIdTooltipText: "Identifier for this control.",
            controlTypeText: "Control Type:",
            controlTypeTooltipText: "Sage SalesLogix control type."
        }
    };
    return lang.mixin(LanguageList, nls);
});