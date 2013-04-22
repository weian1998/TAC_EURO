define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            descriptionText: 'Description',
            urlText: 'URL',
            titleText: 'Add URL Attachment',
            okText: 'OK',
            cancelText: 'Cancel',
            requestFailedMsg: 'The requested operation could not be completed, please try again later.',
            urlBlankMsg: 'The URL or description property cannot be blank.'
        }
    };
    return lang.mixin(LanguageList, nls);
});
