define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        fileText: 'File',
        descriptionText: 'Description',
        sizeText: 'Size',
        attachDateText: 'Attached Date',
        attachedByText: 'Attached By',
        uploadFileText: 'Select Different File...',
        editText: 'Edit Attachment',
        okText: 'OK',
        cancelText: 'Cancel',
        browseText: 'Browse',
        urlText: 'URL',
        requestFailedMsg: 'The requested operation could not be completed, please try again later.'
    }
    };
    return lang.mixin(LanguageList, nls);
});
