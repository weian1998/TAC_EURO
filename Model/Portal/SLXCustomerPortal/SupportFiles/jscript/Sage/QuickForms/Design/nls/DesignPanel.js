define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            cultureListText: {
                iv: "[invariant]",
                de_DE: "de-DE",
                fr_FR: "fr-FR",
                it_IT: "it-IT",
                ru_RU: "ru-RU"
            },
            helpText: "Help",
            saveText: "Save",
            cultureText: "Culture:",
            loadingText: "Loading...",
            savingText: "Saving...",
            saveErrorText: "An error occurred saving the form.",
            readErrorText: "Could not load the requested form.",
            cultureReloadConfirmText: "You have unsaved changes.  Are you sure you want to reload the form with a different culture?"
        }
    };
    return lang.mixin(LanguageList, nls);
});