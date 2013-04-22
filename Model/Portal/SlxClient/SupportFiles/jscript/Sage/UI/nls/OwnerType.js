define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            teamText: 'Team',
            departmentText: 'Department',
            systemText: 'System',
            userText: 'User'
        }
    };
    return lang.mixin(LanguageList, nls);
});