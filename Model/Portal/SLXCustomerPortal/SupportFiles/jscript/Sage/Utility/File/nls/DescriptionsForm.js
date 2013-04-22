define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
        titleFmt: 'Add Attachment(s) for ${0}',
        titleLibraryDoc: 'Add Library Document (s)',
        fileNameText: 'File name and size: ',
        descText: 'Description:',
        okText: 'OK',
        cancelText: 'Cancel'
    }
    };
    return lang.mixin(LanguageList, nls);
});
