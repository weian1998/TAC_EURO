define([
        'Sage/LanguageList',
        'dojo/_base/lang'
],
function (LanguageList, lang) {
    var nls = {
        root: {
            ConfirmDeleteMessage: "Are you sure you want to delete the current group?",
            ConfirmDeleteFmtMessage: "Are you sure you want to delete this group: ${0}",
            InvalidSortStringMessage: "Error: Invalid sort string - ",
            InvalidConditionStringMessage: "Error: Invalid condition string - ",
            InvalidLayoutConditionStringMessage: "Error: Invalid layout string - ",
            noneSelectedTitle: 'No records selected',
            noneSelectedPromptFmt: 'No records selected. The full group, ${0} record(s), will be added.  Proceed?',
            noneSelectedRemovePromptFmt: 'No records selected. The full group, ${0} record(s), will be removed.  Proceed?',
            noRecordsInGroup: 'There are no records to be selected from this group.',
            newGroupTitle: 'Add Records to new Group',
            newGroupNamePrompt: '${0} selected record(s) will be added to this new group.<br><br>Group Name:<br>${1}',
            newGroupRePrompt: '&nbsp;&nbsp;<i>Please enter a group name.</i>',
            invalidCharMsg: 'Name Cannot contain: / \\ : * ? " <> | or \'',
            groupNameText: 'Group Name:',
            saveLookupDlgTitle: 'Save Lookup Results as New Group',
            yesCaption: 'Yes',
            noCaption: 'No',
            cancelCaption: 'Cancel',
            okCaption: 'OK',
            LOCALSTORE_NAMESPACE: 'SageGroups'
        }
    };
    return lang.mixin(LanguageList, nls);
});
