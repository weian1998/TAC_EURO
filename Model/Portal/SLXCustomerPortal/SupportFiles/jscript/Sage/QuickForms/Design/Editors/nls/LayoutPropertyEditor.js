define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Layout",
            positionText: "Position",
            sizeText: "Size",
            rowText: "Row:",
            rowTooltipText: "Row number of the control.",
            columnText: "Column:",
            columnTooltipText: "Column number of the control.",
            rowSpanText: "Row Span:",
            rowSpanTooltipText: "Number of cells the control occupies vertically.",
            columnSpanText: "Column Span:",
            columnSpanTooltipText: "Number of cells the control occupies horizontally."
        }
    };
    return lang.mixin(LanguageList, nls);
});