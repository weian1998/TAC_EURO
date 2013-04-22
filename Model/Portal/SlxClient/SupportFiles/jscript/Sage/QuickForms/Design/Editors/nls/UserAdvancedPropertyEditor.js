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
            lookupBindingModeText: "Lookup Binding Mode:",
            lookupBindingModeTooltipText: "Indicates whether you want to bind to an entity object or to a string value.",
            requiredText: "Required:",
            requiredTooltipText: "Requires a value when saving data.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form.",
            labelPlacementText: {
                left: "Left",
                right: "Right",
                top: "Top",
                none: "None"
            },
            bindingModeText: {
                Object: "Object",
                String: "String"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});