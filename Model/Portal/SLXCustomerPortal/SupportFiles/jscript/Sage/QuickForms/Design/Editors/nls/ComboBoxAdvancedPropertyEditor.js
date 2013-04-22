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
            itemGroupText: "Items",
            controlIdText: "Control Id:",
            controlIdTooltipText: "Identifier for this control.",
            controlLabelPlacementText: "Label Placement:",
            controlLabelPlacementTooltipText: "Label position in relation to the control.",
            controlTypeText: "Control Type:",
            controlTypeTooltipText: "Sage SalesLogix control type.",
            dataSourceText: "Data Source:",
            dataSourceTooltipText: "Source of the data for this control such as another control or an entity.",
            defaultDataBindingText: "Data Bindings:",
            defaultDataBindingTooltipText: "Data field(s) in the database used by this control.",
            enabledText: "Enabled:",
            enabledTooltipText: "Allows user to interact with this control.",
            itemsText: "Items:",
            itemsTooltipText: "Values the user can select.",
            textFieldText: "Text Field:",
            textFieldTooltipText: "The name of the data source field used to populate the visible text portion of the list items.",
            valueFieldText: "Value Field:",
            valueFieldTooltipText: "The name of the data source field used to populate the value portion of the list items.",
            visibleText: "Visible:",
            visibleTooltipText: "Show or hide this control on the form.",
            labelPlacementText: {
                left: "Left",
                right: "Right",
                top: "Top",
                none: "None"
            },
            hasItemsText: "Set",
            noItemsText: "Not Set"
        }
    };
    return lang.mixin(LanguageList, nls);
});