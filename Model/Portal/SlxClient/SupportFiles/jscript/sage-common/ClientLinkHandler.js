var Link = {
    entityDetail: function(kind, id) {
        ClientLinkHandler.request({ request: 'EntityDetail', kind: kind, id: id });
    },

    schedule: function(type) {
        ClientLinkHandler.request({ request: 'Schedule', type: type });
    },

    newNote: function() {
        ClientLinkHandler.request({ request: 'New', type: 'Note' });
    },

    scheduleActivity: function(args) {
        ClientLinkHandler.request({ request: 'ScheduleActivity', args: args });
    },

    schedulePhoneCall: function() {
        this.schedule('PhoneCall');
    },

    scheduleMeeting: function() {
        this.schedule('Meeting');
    },

    scheduleToDo: function() {
        this.schedule('ToDo');
    },

    schedulePersonalActivity: function() {
        this.schedule('PersonalActivity');
    },

    scheduleCompleteActivity: function() {
        this.schedule('CompleteActivity');
    },

    editActivity: function(id) {
        ClientLinkHandler.request({ request: 'EditActivity', id: id });
    },

    editActivityOccurrence: function(id, recurDate) {
        ClientLinkHandler.request({ request: 'EditActivityOccurrence', id: id, recurDate: recurDate });
    },

    editHistory: function(id, args) {
        if (typeof (args) !== 'undefined') {
            ClientLinkHandler.request({ request: 'EditHistory', id: id, args: args });
        } else {
            ClientLinkHandler.request({ request: 'EditHistory', id: id });
        }
    },

    completeActivity: function(id) {
        ClientLinkHandler.request({ request: 'CompleteActivity', id: id });
    },

    completeActivityOccurrence: function(id, recurDate) {
        ClientLinkHandler.request({ request: 'CompleteActivityOccurrence', id: id, recurDate: recurDate });
    },

    deleteActivity: function(id) {
        Ext.Msg.confirm(MasterPageLinks.ActivitiesDialog_DeleteActivityTitle, MasterPageLinks.ActivitiesDialog_DeleteActivity, function(btn) {
            if (btn == 'yes') {
                ClientLinkHandler.request({ request: 'DeleteActivity', id: id });
            }
        });

    },

    deleteActivityOccurrence: function(id, recurDate) {
        ClientLinkHandler.request({ request: 'DeleteActivityOccurrence', id: id, recurDate: recurDate });
    },

    confirmActivity: function(id, toUserId) {
        ClientLinkHandler.request({ request: 'ConfirmActivity', id: id, toUserId: toUserId });
    },

    deleteConfirmation: function(id, notifyId) {
        ClientLinkHandler.request({ request: 'DeleteConfirmation', id: id, notifyId: notifyId });
    },

    removeDeletedConfirmation: function(id) {
        ClientLinkHandler.request({ request: 'RemoveDeletedConfirmation', id: id });
    },

    mergeRecords: function() {
        var panel = Sage.SalesLogix.Controls.ListPanel.find("MainList");
        if (panel)
            var selectionInfo = panel.getSelectionInfo();

        if (selectionInfo.selectionCount == 2) {
            var contextService = Sage.Services.getService("SelectionContextService");
            contextService.setSelectionContext(selectionInfo.key, selectionInfo, mergeRecordsSelectionInfoCallback);
            ClientLinkHandler.request({ request: 'MergeRecords', selectionInfoKey: selectionInfo.key });
        }
        else {
            Ext.Msg.show({ title: "", msg: MasterPageLinks.Merge_Account_SelectionError, buttons: Ext.Msg.OK, icon: Ext.MessageBox.ERROR });
        }
    },

    addUsers: function() {
        ClientLinkHandler.request({ request: 'Administration', type: 'AddUsers' });
    },
    copyUser: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'CopyUser', selectionInfoKey: selInfoKey });
    },
    copyUserProfile: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'CopyUserProfile', selectionInfoKey: selInfoKey });
    },
    deleteUsers: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'DeleteUsers', selectionInfoKey: selInfoKey });
    },
    addToTeam: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'AddToTeam', selectionInfoKey: selInfoKey });
    },
    removeFromTeam: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'RemoveFromTeam', selectionInfoKey: selInfoKey });
    },
    assignRole: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'AssignRole', selectionInfoKey: selInfoKey });
    },
    removeFromAllTeams: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'RemoveFromAllTeams', selectionInfoKey: selInfoKey });
    },
    replaceTeamMember: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'ReplaceTeamMember', selectionInfoKey: selInfoKey });
    },
    getTeamMemberLink: function(entityType, entityId) {
        if (entityType.toLowerCase() == "user")
            ClientLinkHandler.request({ request: 'Administration', type: 'RedirectToUser', kind: entityType, id: entityId });
        else
            window.location.href = entityType + ".aspx?entityId=" + entityId;
    },
    editSecurityProfile: function(childId, parentId, securityProfileId) {
        ClientLinkHandler.request({ request: 'Administration', type: 'EditSecurityProfile', selectionInfoKey: childId + ',' + parentId + ',' + securityProfileId });
    },
    deleteDepartment: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'DeleteDepartment', selectionInfoKey: selInfoKey });
    },
    deleteTeam: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'DeleteTeam', selectionInfoKey: selInfoKey });
    },
    copyTeam: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'CopyTeam', selectionInfoKey: selInfoKey });
    },
    copyDepartment: function(selInfoKey) {
        ClientLinkHandler.request({ request: 'Administration', type: 'CopyDepartment', selectionInfoKey: selInfoKey });
    },
    getHelpUrl : function(topic) {
        var urlfmt = getContextByKey('WebHelpUrlFmt');
        if (urlfmt === '') {
            urlfmt = 'help/WebClient_CSH.htm#{0}';
        }
        return String.format(urlfmt, topic);
    },
    getHelpUrlTarget : function() {
        var target = getContextByKey('WebHelpLinkTarget');
        return (target === '') ? 'MCWebHelp' : target;
    },
    setUsersToStandardRole: function () {
        ClientLinkHandler.request({ request: 'Administration', type: 'SetUsersToStandardRole' });
    }
    
};

mergeRecordsSelectionInfoCallback = function() {
    // client-side action
}
