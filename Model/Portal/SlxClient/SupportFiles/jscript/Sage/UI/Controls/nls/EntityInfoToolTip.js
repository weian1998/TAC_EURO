define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            errorText: 'Information not found.',
            loadingText: 'Loading...',
            noInfoText: 'No information to show.',
            mainText: 'Main:',
            faxText: 'Fax:',
            tollFreeText: 'Toll Free:',
            urlText: 'Web URL:',
            workText: 'Work:',
            mobileText: 'Mobile:',
            emailText: 'Email:',
            contactNameText: 'Name:',
            phoneText: 'Phone:',
            accountText: 'Account:'
        }
    };
    return lang.mixin(LanguageList, nls);
});