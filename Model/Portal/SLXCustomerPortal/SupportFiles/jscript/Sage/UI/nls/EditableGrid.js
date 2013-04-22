define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            unsavedDataText: '*unsaved data',
            addText: 'Add',
            deleteText: 'Delete',
            saveText: 'Save',
            cancelText: 'Cancel',
            noSelectionsText: 'There are no records selected.',
            confirmDeleteFmtTxt: 'Are you sure you want to delete these ${0} items?',
            yesText: 'Yes',
            noText: 'No',
            createItemsInvalidArrayText: 'The items parameter in Sage.UI.EditableGrid.createItems() should be an array.',
            recordCountFormatString: 'Records ${0} - ${1} of ${2}',
            noDataMessage: 'No records match the selection criteria.',
            dirtyDataMessage: 'You have unsaved data.  If you continue you will lose the changes you have made.',
            okText: 'OK'
        }
    };
    return lang.mixin(LanguageList, nls);
});