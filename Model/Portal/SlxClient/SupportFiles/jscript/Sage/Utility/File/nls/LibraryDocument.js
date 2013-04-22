define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            failureNumber: 'Failure #${0}: ',
            percentComplete: 'Uploading, please wait...',
            uploadError: 'There was an error attempting to upload one or more files (failed: ${0}; succeeded: ${1}).',
            invalidContext: 'The file(s) cannot be uploaded outside of the Sales Library.',
            unknownError: 'An unknown error occurred uploading a file.'
        }
    };
    return lang.mixin(LanguageList, nls);
});