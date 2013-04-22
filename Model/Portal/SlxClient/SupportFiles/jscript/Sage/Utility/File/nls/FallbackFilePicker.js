define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        addLibraryFileText: 'Add Library File',
        attachFileText: 'Attach File',
        descriptionText: 'Description',
        uploadFileText: 'Attachment',
        okText: 'OK',
        cancelText: 'Cancel',
        invalidContext: 'The file(s) cannot be uploaded outside of the Sales Library.',
        fileTooLargeError: 'The file upload attempt was aborted because the file was too large.',
        pleaseSelectFile: 'Please select a file first.',
        slxErrorIdInfo: 'SalesLogix Error Id: '
    }
    };
    return lang.mixin(LanguageList, nls);
});
