define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Basic",
            generalText: "General",
            activeControlText: "Active Control:",
            activeControlTooltipText: "The control the user\\'s cursor starts on.",
            descriptionText: "Description:",
            descriptionTooltipText: "Optional description of the purpose of the form.",
            nameText: "Name:",
            nameTooltipText: "Form identifier used by the system."
        }
    };
    return lang.mixin(LanguageList, nls);
});