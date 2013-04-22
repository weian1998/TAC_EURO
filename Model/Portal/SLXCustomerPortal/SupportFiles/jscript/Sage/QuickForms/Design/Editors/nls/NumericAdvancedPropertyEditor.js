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
            decimalDigitsText: "Decimal Digits:",
            decimalDigitsTooltipText: "The number of digits after the decimal to display and allow for data entry.",
            defaultDataBindingText: "Data Bindings:",
            defaultDataBindingTooltipText: "Data field(s) in the database used by this control.",
            enabledText: "Enabled:",
            enabledTooltipText: "Allows user to interact with this control.",
            formatTypeText: "Format Type:",
            formatTypeTooltipText: "Type of format to use when converting number to string.",
            maxLengthText: "Max Length:",
            maxLengthTooltipText: "Maximum number of characters user can enter.",
            requiredText: "Required:",
            requiredTooltipText: "Requires a value when saving data.",
            strictText: "Strict:",
            strictTooltipText: "Pads display of number with trailing zeros as necessary.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form.",
            numberFormatText: {
                Number: "Number",
                Percent: "Percent",
                Decimal: "Decimal",
                Scientific: "Scientific"
            },
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