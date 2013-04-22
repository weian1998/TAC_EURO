define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Advanced",
            appearanceText: "Appearance",
            behaviorText: "Behavior",
            controlInfoText: "Control Info",
            dataText: "Data",
            controlIdText: "Control Id:",
            controlIdTooltipText: "Identifier for this control.",
            controlLabelPlacementText: "Label Placement:",
            controlLabelPlacementTooltipText: "Label position in relation to the control.",
            controlTypeText: "Control Type:",
            controlTypeTooltipText: "Sage SalesLogix control type.",
            defaultDataBindingText: "Data Bindings:",
            defaultDataBindingTooltipText: "Data field(s) in the database used by this control.",
            enabledText: "Enabled:",
            enabledTooltipText: "Allows user to interact with this control.",
            requiredText: "Required:",
            requiredTooltipText: "Requires a value when saving data.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form.",
            labelPlacementText: {
                left: "Left",
                right: "Right",
                top: "Top",
                none: "None"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});