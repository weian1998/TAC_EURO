define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            administratorText: 'Administrator',
            templateText: 'Template',
            remoteText: 'Remote',
            webOnlyText: 'Web Only',
            retiredText: 'Retired',
            concurrentText: 'Concurrent',
            webViewerText: 'Web Viewer',
            networkText: 'Network',
            addOnUserText: 'Add-on User'

        }
    };
    return lang.mixin(LanguageList, nls);
});