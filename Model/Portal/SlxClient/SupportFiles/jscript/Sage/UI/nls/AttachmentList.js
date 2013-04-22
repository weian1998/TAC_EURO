define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            attachmentText: 'Attachment',
            userText: 'User',
            modDateText: 'Modify Date/Time',
            dateRangeText: 'Modify Date Range',
            sizeText: 'Size',
            extensionText: 'File Extension',
            addFileText: 'Add File',
            addUrlText: 'Add URL',
            editText: 'Edit',
            helpText: 'Help',
            addGoogleText: 'Add Google Document',
            deleteText: 'Delete',
            request: 'Request File',
            delivered: 'Delivered',
            requested: 'Requested',
            available: 'Available'
        }
    };
    return lang.mixin(LanguageList, nls);
});