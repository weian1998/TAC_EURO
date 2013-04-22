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
            captionText: "Caption:",
            captionTooltipText: "The label to display on the form for this control.",
            captionAlignmentText: "Caption Alignment:",
            captionAlignmentTooltipText: "Justification of the label text.",
            linesText: "Lines:",
            linesTooltipText: "Number of lines of text displayed.",
            isReadOnlyText: "Read Only:",
            isReadOnlyTooltipText: "Does not allow edits.",
            toolTipText: "Tooltip:",
            toolTipTooltipText: "Short help text about control.",
            alignmentText: {
                left: "Left",
                center: "Center",
                right: "Right"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});