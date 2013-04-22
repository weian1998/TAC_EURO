define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            helpText: 'Help',    
            aboutText: 'About',
            webClientHelpText: 'Web Client Help',
            gettingStartedText: 'Getting Started Guide',
            quickReferenceText: 'Quick Reference Card'
        }
    };
    return lang.mixin(LanguageList, nls);
});
