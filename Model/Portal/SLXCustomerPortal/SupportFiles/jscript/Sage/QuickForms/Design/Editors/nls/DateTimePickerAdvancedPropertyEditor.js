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
            buttonToolTipText: "Button Tooltip:",
            buttonToolTipTooltipText: "The tooltip  to display when the user\\'s mouse hovers over the button part of the control.",
            controlIdText: "Control Id:",
            controlIdTooltipText: "Identifier for this control.",
            controlLabelPlacementText: "Label Placement:",
            controlLabelPlacementTooltipText: "Label position in relation to the control.",
            controlTypeText: "Control Type:",
            controlTypeTooltipText: "Sage SalesLogix control type.",
            defaultDataBindingText: "Data Bindings:",
            defaultDataBindingTooltipText: "Data field(s) in the database used by this control.",
            displayModeText: "Display Mode:",
            displayModeTooltipText: "Mode of display of control: text box, hyperlink, or plain text.",
            enabledText: "Enabled:",
            enabledTooltipText: "Allows user to interact with this control.",
            requiredText: "Required:",
            requiredTooltipText: "Requires a value when saving data.",
            timelessText: "Timeless:",
            timelessTooltipText: "Use date without time and no DST conversion.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form.",
            labelPlacementText: {
                left: "Left",
                right: "Right",
                top: "Top",
                none: "None"
            },
            displayModeTypeText: {
                AsControl: "As Control",
                AsText: "As Text",
                AsHyperlink: "As Hyperlink"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});