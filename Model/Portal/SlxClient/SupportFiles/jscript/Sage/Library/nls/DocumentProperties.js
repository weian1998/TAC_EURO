define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            Abstract: 'Abstract',
            Cancel: 'Cancel',
            DocumentProperties: 'Document Properties',
            Created: 'Created',
            Description: 'Description',
            Directory: 'Directory',
            DoNotExpire: 'Do Not Expire',
            Expires: 'Expires',
            FileName: 'File Name',
            ForceDistribution: 'Force distribution of this file',
            InvalidFileName: 'A filename cannot contain any of the following characters: \\ / : * ? " < > |',
            Never: 'Never',
            OK: 'OK',
            Revised: 'Revised',
            Size: 'Size',
            Status: 'Status'
        }
    };
    return lang.mixin(LanguageList, nls);
});
