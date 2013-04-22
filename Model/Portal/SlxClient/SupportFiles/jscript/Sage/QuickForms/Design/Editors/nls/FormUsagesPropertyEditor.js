define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            titleText: "Usage",
            portalText: "Portal",
            viewText: "View",
            modesText: "Modes",
            descriptionText: "Description"
        }
    };
    return lang.mixin(LanguageList, nls);
});