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
            displayCurrencyCodeText: "Display Exchange Rate Code:",
            displayCurrencyCodeTooltipText: "Show the three character currency code when multi-currency is enabled.",
            displayModeText: "Display Mode:",
            displayModeTooltipText: "Mode of display of control: text box, hyperlink, or plain text.",
            enabledText: "Enabled:",
            enabledTooltipText: "Allows user to interact with this control.",
            exchangeRateTypeText: "Exchange Rate Type:",
            exchangeRateTypeTooltipText: "Type of exchange rate to show in currency fields.",
            maxLengthText: "Max Length:",
            maxLengthTooltipText: "Maximum number of characters user can enter.",
            requiredText: "Required:",
            requiredTooltipText: "Requires a value when saving data.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form.",
            displayTypeText: {
                AsHyperlink: "As Hyperlink",
                AsControl: "As Control",
                AsText: "As Text"
            },
            exchangeTypeText: {
                BaseRate: "Base Rate",
                OpportunityRate: "Opportunity Rate (Deprecated)",
                MyRate: "My Rate",
                SalesOrderRate: "Sales Order Rate (Deprecated)",
                EntityRate: "Entity Rate"
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