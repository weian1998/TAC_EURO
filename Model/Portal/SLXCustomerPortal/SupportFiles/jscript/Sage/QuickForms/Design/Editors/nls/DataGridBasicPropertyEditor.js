define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Basic",
            appearanceText: "Appearance",
            behaviorText: "Behavior",
            dataText: "Data",
            captionText: "Caption:",
            captionTooltipText: "The label to display on the form for this control.",
            captionAlignmentText: "Caption Alignment:",
            captionAlignmentTooltipText: "Justification of the label text.",
            pageSizeText: "Page Size:",
            pageSizeTooltipText: "The number of grid records to display on a single page.",
            resizableColumnsText: "Resizable Columns:",
            resizableColumnsTooltipText: "Allows user to resize columns.",
            alignmentText: {
                left: "Left",
                center: "Center",
                right: "Right"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});