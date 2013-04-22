define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            trueText: 'True',
            falseText: 'False',
            networkText: 'Network',
            remoteText: 'Remote',
            webText: 'Web',
            webViewerText: 'Web Viewer',
            concurrentText: 'Concurrent',
            retiredText: 'Retired',
            templateText: 'Template',
            addonText: 'Addon',
            adminText: 'Admin',
            userText: 'User',
            teamText: 'Team',
            departmentText: 'Department',
            systemText: 'System'
        }
    };
    return lang.mixin(LanguageList, nls);
});