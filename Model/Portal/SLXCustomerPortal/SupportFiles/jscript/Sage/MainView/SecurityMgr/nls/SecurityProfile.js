define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            securityProfile_Caption: 'Security Profile',
            btnCancel_Caption: 'Cancel',
            ok_Text: 'OK',
            description_Text: 'Description',
            profileType_Text: 'Profile Type'
        }
    };
    return lang.mixin(LanguageList, nls);
});