define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            AccessError: 'You do not have the role security required to execute this action.',
            Available: 'Available',
            Confirm: 'Confirm',
            DeleteFileCnfmFmt: 'Are you sure you want to delete the file "${0}"?',
            Delivered: 'Delivered: Not read',
            DeliveredRead: 'Delivered: Read',
            DocumentPropertiesError: 'There was an unexpected error attempting to retrieve the document properties.',
            DocumentPropertiesUpdateError: 'There was an unexpected error attempting to update document properties.',
            DocumentUpdateConflictError: 'The file has been updated by another user, please refresh and retry.',
            FileDeleteError: 'There was an unexpected error attempting to delete a file.',
            FileStatusError: 'There was an unexpected error attempting to update the file status.',
            LogRequestError: 'There was an unexpected failure attempting to log the document synchronization request.',
            No: 'No',
            NoAccessMessage: 'You do not have permission to add files to the Library. For more information contact your Sage SalesLogix administrator.',
            Ordered: 'Ordered',
            PleaseSelectFile: 'Please select a file.',
            PleaseWait: 'Please wait',
            Revised: 'Revised',
            RevisionOrdered: 'Revision Ordered',
            UploadError: 'There was an error attempting to upload a file.',
            Unknown: 'Unknown',
            Yes: 'Yes'
        }
    };
    return lang.mixin(LanguageList, nls);
});
