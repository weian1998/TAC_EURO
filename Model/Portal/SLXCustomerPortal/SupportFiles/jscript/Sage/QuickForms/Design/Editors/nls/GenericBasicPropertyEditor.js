define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Basic",
            appearanceText: "Appearance",
            captionText: "Caption:",
            captionTooltipText: "The label to display on the form for this control.",
            captionAlignmentText: "Caption Alignment:",
            captionAlignmentTooltipText: "Justification of the label text.",
            alignmentText: {
                left: "Left",
                center: "Center",
                right: "Right"
            }
        }
    };
    return lang.mixin(LanguageList, nls);
});