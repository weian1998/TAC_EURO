var Link = {
    entityDetail: function (kind, id) {
        //Sage.ClientLinkHandler.request({ request: 'EntityDetail', kind: kind, id: id });
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        Sage.Link.entityDetail(kind, id);
    },

    schedule: function (type) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //Sage.ClientLinkHandler.request({ request: 'Schedule', type: type });
        Sage.Link.schedule(type);
    },

    newNote: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //Sage.ClientLinkHandler.request({ request: 'New', type: 'Note' });
        Sage.Link.newNote();
    },

    scheduleActivity: function (args) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //Sage.ClientLinkHandler.request({ request: 'ScheduleActivity', args: args });
        Sage.Link.scheduleActivity(args);
    },

    schedulePhoneCall: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //this.schedule('PhoneCall');
        Sage.Link.schedulePhoneCall();
    },

    scheduleMeeting: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // this.schedule('Meeting');
        Sage.Link.scheduleMeeting();
    },

    scheduleToDo: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //this.schedule('ToDo');
        Sage.Link.scheduleToDo();
    },

    schedulePersonalActivity: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // this.schedule('PersonalActivity');
        Sage.Link.schedulePersonalActivity();
    },

    scheduleCompleteActivity: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // this.schedule('CompleteActivity');
        Sage.Link.scheduleCompletedActivity();
    },

    editActivity: function (id) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // Sage.ClientLinkHandler.request({ request: 'EditActivity', id: id });
        Sage.Link.editActivity(id);
    },

    editActivityOccurrence: function (id, recurDate) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // Sage.ClientLinkHandler.request({ request: 'EditActivityOccurrence', id: id, recurDate: recurDate });
        Sage.Link.editActivityOccurrence(id, recurDate);
    },

    editHistory: function (id, args) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //        if (typeof (args) !== 'undefined') {
        //            Sage.ClientLinkHandler.request({ request: 'EditHistory', id: id, args: args });
        //        } else {
        //            Sage.ClientLinkHandler.request({ request: 'EditHistory', id: id });
        //        }
        Sage.Link.editHistory(id, args);
    },

    completeActivity: function (id) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // Sage.ClientLinkHandler.request({ request: 'CompleteActivity', id: id });
        Sage.Link.completeActivity(id);
    },

    completeActivityOccurrence: function (id, recurDate) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //Sage.ClientLinkHandler.request({ request: 'CompleteActivityOccurrence', id: id, recurDate: recurDate });
        Sage.Link.completeActivityOccurrence(id, recurDate);
    },

    deleteActivity: function (id) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //        Ext.Msg.confirm(MasterPageLinks.ActivitiesDialog_DeleteActivityTitle, MasterPageLinks.ActivitiesDialog_DeleteActivity, function (btn) {
        //            if (btn == 'yes') {
        //                Sage.ClientLinkHandler.request({ request: 'DeleteActivity', id: id });
        //            }
        //        });
        Sage.Link.deleteActivity(id);
    },

    deleteActivityOccurrence: function (id, recurDate) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //Sage.ClientLinkHandler.request({ request: 'DeleteActivityOccurrence', id: id, recurDate: recurDate });
        Sage.Link.deleteActivityOccurrence(id, recurDate);
    },

    confirmActivity: function (id, toUserId) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        // Sage.ClientLinkHandler.request({ request: 'ConfirmActivity', id: id, toUserId: toUserId });
        Sage.Link.confirmActivity(id, toUserId);
    },

    deleteConfirmation: function (id, notifyId) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //Sage.ClientLinkHandler.request({ request: 'DeleteConfirmation', id: id, notifyId: notifyId });
        Sage.Link.deleteConfirmation(id, notifyId);
    },

    removeDeletedConfirmation: function (id) {
        Sage.ClientLinkHandler.request({ request: 'RemoveDeletedConfirmation', id: id });
    },
    getHelpUrl: function (topic) {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //        var urlfmt = getContextByKey('WebHelpUrlFmt');
        //        if (urlfmt === '') {
        //            urlfmt = 'help/WebClient_CSH.htm#${0}';
        //        }
        //        //return String.format(urlfmt, topic);
        //        return dojo.string.substitute(urlfmt, [topic]);
        return Sage.Link.getHelpUrl(topic);
    },
    getHelpUrlTarget: function () {
        console.warn('Depricated:  The Link object is depricated - use Sage.Link...');
        //var target = getContextByKey('WebHelpLinkTarget');
        //return (target === '') ? 'MCWebHelp' : target;
        return Sage.Link.getHelpUrlTarget();
    },
    // .............................................................................................................. 
    // .............................................................................................................. 
    // .............................................................................................................. 
    // ............The functions down to here have been moved to Sage.Link and will be removed.......................
    // ..................from here.  The ones below seem to be dead code and will probably...........................
    // ..................just be removed.............................................................................
    // ..............................................................................................................
    // .............................................................................................................. 
    // .............................................................................................................. 
    addUsers: function () {
        Sage.ClientLinkHandler.request({ request: 'Administration', type: 'AddUsers' });
    },
    setUsersToStandardRole: function () {
        Sage.ClientLinkHandler.request({ request: 'Administration', type: 'SetUsersToStandardRole' });
    }

};
