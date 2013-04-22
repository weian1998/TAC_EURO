define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            AccessError: 'You do not have the role security required to execute this action.',
            AddFolderError: 'There was an unexpected error attempting to add a library folder.',
            Cancel: 'Cancel',
            Confirm: 'Confirm',
            DeleteFolderCnfmFmt: 'Are you sure you want to delete the "${0}" folder and all of its contents?',
            DeleteFolderError: 'There was an unexpected error attempting to delete a library folder.',
            DontDeleteRoot: 'Please do not delete the root folder.',
            DontEditRoot: 'Please do not change the name of the root folder.',
            EnterFolderName: 'Please enter the name of the new folder:',
            EnterNewFolderName: 'Please enter the new name for this folder.',
            FolderUpdateConflictError: 'The folder has been updated by another user, please refresh and retry.',
            InvalidFolderName: 'A folder name cannot contain any of the following characters: \\ / : * ? " < > |',
            NewFolder: 'New Folder',
            No: 'No',
            OK: 'OK',
            PleaseSelectFolder: 'Please select a folder.',
            RenameFolderError: 'There was an unexpected error attempting to rename a library folder.',
            Yes: 'Yes'
        }
    };
    return lang.mixin(LanguageList, nls);
});
