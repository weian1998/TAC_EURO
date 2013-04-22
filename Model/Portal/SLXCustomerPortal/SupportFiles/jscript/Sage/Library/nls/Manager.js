define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            AddFiles: 'Add Files',
            AddFolder: 'Add Folder',
            Confirm: 'Confirm',
            ConfirmDownload: 'The file has not been downloaded. Would you like to get it the next time you synchornize?',
            ConfirmDownloadReorder: 'The file has not been downloaded but has already been ordered. Would you like re-order the file to get it the next time you synchornize?',
            Created: 'Created',
            DeleteFolder: 'Delete Folder',
            DeleteSelectedFile: 'Delete Selected File',
            Description: 'Description',
            DirectoryInformationError: 'There was an unexpected error attempting to retreive document directory information.',  
            DocumentInformationError: 'There was an unexpected error attempting to retreive document information.',
            EditFolder: 'Edit Folder Name',
            Expires: 'Expires',
            File: 'File',
            FileProperties: 'File Properties',
            Help: 'Help',
            InvalidRoot: 'Invalid root directory: "${0}" (${1}).',
            Library: 'Library',
            LibraryDataError: 'There was an unexpected error processing library directory data.',
            Never: 'Never',
            No: 'No',
            Revised: 'Revised',
            Size: 'Size',
            Yes: 'Yes'
        }
    };
    return lang.mixin(LanguageList, nls);
});
