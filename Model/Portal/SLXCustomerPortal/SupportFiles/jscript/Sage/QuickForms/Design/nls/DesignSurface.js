define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            bisectionErrorText: "The placement will cause another control to be bisected.",
            rowBoundsErrorText: "The chosen row is out of bounds.",
            columnBoundsErrorText: "The chosen column is out of bounds.",
            rowSpanBoundsErrorText: "The chosen row span is out of bounds.",
            columnSpanBoundsErrorText: "The chosen column span is out of bounds.",
            occupiedErrorText: "There is not enough empty space for the chosen size."
        }
    };
    return lang.mixin(LanguageList, nls);
});