define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            newTabText: 'New Tab',
            addContentText: 'Add Content',
            editOptionsText: 'Edit Options',
            hideTabText: 'Hide Tab',
            closeText: 'Close',
            copyTabText: 'Copy Tab',
            showTabText: 'Show Tab',
            shareTabText: 'Share Tab',
            deleteTabText: 'Delete Tab',
            deleteTabConfirmText: 'Are you sure you want to delete this tab?',
            descriptionText: 'Description',
            everyoneText: 'Everyone',
            saveTabText: 'Save Tab',
            helpText: 'Help',
            addText: 'Add',
            invalidMessage: 'Invalid Character',
            invalidDuplicateMessage: 'Title must be unique.',
            deleteText: 'Delete',
            titleText: 'Title:',
            chooseTemplateText: 'Choose the template you want to use:',
            oneColumnText: 'One column',
            twoColumnText: 'Two columns split',
            fatLeftText: 'Two column larger left',
            fatRightText: 'Two column larger right',
            makeDefaultText: 'Make default',
            releaseFetchErrorText: 'Error fetching release list.',
            releaseDeleteNoneSelected: 'No items selected.',
            releasedToText: 'Released To:',
            typeText: 'Type',
            addLookup: 'Add',
            okButton: 'OK',
            errorText: 'Error',
            warningText: 'Warning',
            permissionErrorText: 'Error: User does not have the right to perform this action.',
            permissionErrorPerformCopyText: 'Would you like to create a personal copy of the page?',
            yesText: 'Yes',
            noText: 'No'
        }
    };
    return lang.mixin(LanguageList, nls);
});
