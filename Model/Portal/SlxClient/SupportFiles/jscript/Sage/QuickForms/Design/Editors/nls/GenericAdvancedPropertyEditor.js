define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Advanced",
            appearanceText: "Appearance",
            controlInfoText: "Control Info",
            controlIdText: "Control Id:",
            controlIdTooltipText: "Identifier for this control.",
            controlTypeText: "Control Type:",
            controlTypeTooltipText: "Sage SalesLogix control type.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form."
        }
    };
    return lang.mixin(LanguageList, nls);
});