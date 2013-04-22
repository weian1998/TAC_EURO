define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        addSecurityProfileTitle: 'Add Profile',
        editSecurityProfileTitle: 'Edit Profile'
    }
    };
    return lang.mixin(LanguageList, nls);
});
