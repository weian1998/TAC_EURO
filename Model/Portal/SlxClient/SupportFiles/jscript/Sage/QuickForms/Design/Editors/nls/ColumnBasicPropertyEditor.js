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
            indexTooltipText: "Number of the row or column, beginning with zero.",
            widthText: "Width:",
            widthTooltipText: "Width of this column of controls.",
            sizeTypeText: "Size Type:",
            sizeTypeTooltipText: "Method of sizing: Absolute, AutoSize, or Percent.",
            rowSizeTypeText: {
                Absolute: "Absolute",
                Percent: "Percent",
                AutoSize: "AutoSize"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});