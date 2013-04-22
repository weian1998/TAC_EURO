/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/Dialogs',
    'Sage/Utility',
    'Sage/Services/ActivityService',
    'dojo/string'
],
function (dialogs, utility, ActivityService, dojoString) {
    Sage.namespace('Link');
    Sage.Link = {
        entityDetail: function (kind, id) {
            var kindUC = kind.toUpperCase();
            switch (kindUC) {
                case 'ACTIVITY':
                    this.editActivity(id);
                    break;
                case 'HISTORY':
                    this.editHistory(id);
                    break;
                default:
                    //if we are in detail mode for the entity requested, just navigate to that entity
                    if (utility.getModeId() === 'detail') {
                        var clientEntityContextSvc = Sage.Services.getService('ClientEntityContext');
                        var eContext = clientEntityContextSvc.getContext();
                        if (eContext.EntityType === kind || eContext.EntityType === 'Sage.Entity.Interfaces.I' + kind) {
                            clientEntityContextSvc.navigateSLXGroupEntity(id);
                            return;
                        }
                    }
                    var url = dojoString.substitute('${0}.aspx?entityid=${1}&modeid=Detail', [kind, id]);
                    document.location = url;
                    break;
            }
        },
        toListView: function (kind) {
            var url;
            if (typeof kind !== 'undefined') {
                url = kind + '.aspx?modeid=list';
            } else {
                url = document.location.href.replace("#", "");
                if (url.indexOf("?") > -1) {
                    var halves = url.split("?");
                    url = halves[0];
                }
                url += "?modeid=list";
            }
            document.location = url;
        },
        toActivityListView: function (tabid) {
            if (document.location.href.toLowerCase().indexOf('activitymanager.aspx') < 1) {
                var url = 'ActivityManager.aspx' + ((tabid) ? '?tabId=' + tabid : '');
                // IE8 fix - as the page is leaving and the rest of the dojo event handling 
                // code is running, wild things start happening and IE ends up back where it started,
                // but with bad errors...
                window.setTimeout(function () {
                    document.location = url;
                }, 5);
            } else {
                if (tabid) {
                    var s = Sage.Services.getService('ClientGroupContext');
                    s.setCurrentGroup(tabid);
                }
            }
        },
        schedule: function (type) {

            if (type === 'CompleteActivity') {
                Sage.ClientLinkHandler.request({ request: 'Schedule', type: type });
                return;
            }

            var activityService = Sage.Services.getService('ActivityService');
            if (!activityService) {
                Sage.Services.addService('ActivityService', new ActivityService());
                activityService = Sage.Services.getService('ActivityService');
            }
            activityService.scheduleActivity({ type: type });
        },

        newNote: function () {

            var activityService = Sage.Services.getService('ActivityService');
            if (!activityService) {
                Sage.Services.addService('ActivityService', new ActivityService());
                activityService = Sage.Services.getService('ActivityService');
            }
            activityService.insertNote();

            //Sage.ClientLinkHandler.request({ request: 'New', type: 'Note' });
        },

        scheduleActivity: function (args) {
            console.warn('ToDo: this method - Sage.Link.scheduleActivity seems to have been used for various purposes, passing various bits of information in the args parameter.  This needs to be fixed for each call...');
            this.schedule(args);
        },

        schedulePhoneCall: function () {
            this.schedule('PhoneCall');
        },

        scheduleMeeting: function () {
            this.schedule('Meeting');
        },

        scheduleToDo: function () {
            this.schedule('ToDo');
        },

        schedulePersonalActivity: function () {
            this.schedule('PersonalActivity');
        },

        scheduleCompleteActivity: function () {
            this.schedule('CompleteActivity');
        },

        scheduleEvent: function (args) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.scheduleEvent(args);
        },


        editEvent: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.editEvent(id);
        },

        deleteEvent: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.deleteEvent(id);
        },

        editActivity: function (id, isRecurring, memberId) {
            var activityService = Sage.Services.getService('ActivityService');
            if (!activityService) {
                Sage.Services.addService('ActivityService', new ActivityService());
                activityService = Sage.Services.getService('ActivityService');
            }
            memberId = memberId || '';
            activityService.editActivity(id, isRecurring, memberId);
        },
        editActivityIfConfirmed: function (id, isRecurring) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.editActivityIfConfirmed(id, isRecurring);              
        },
        editActivityOccurrence: function (id, recurDate) {
            Sage.ClientLinkHandler.request({ request: 'EditActivityOccurrence', id: id, recurDate: recurDate });
        },

        editHistory: function (id, args) {
            var activityService = Sage.Services.getService('ActivityService');
            if (!activityService) {
                Sage.Services.addService('ActivityService', new ActivityService());
                activityService = Sage.Services.getService('ActivityService');
            }
            activityService.editHistory(id);

        },

        completeActivity: function (id, isRecurring) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.completeActivity(id, isRecurring);
        },

        completeNewActivity: function (type, args) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.completeNewActivity(type, args);
        },

        completeActivityOccurrence: function (id, recurDate) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.completeActivityOccurrence(id, recurDate);
        },

        deleteActivity: function (id, callback) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.deleteActivity(id, false, callback);
        },

        deleteActivityOccurrence: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.deleteActivity(id);
        },
        confirmActivityFor: function (actId, userId) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.confirmActivityFor(actId, userId);
        },
        editConfirmation: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.editConfirmation(id);
        },
        acceptConfirmation: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.acceptConfirmation({ id: id });
        },
        declineConfirmation: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.declineConfirmation(id);
        },
        deleteConfirmation: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.deleteConfirmation(id);
        },
        scheduleLitRequest: function () {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.scheduleLitRequest();
        },
        deleteLitRequest: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.deleteLitRequest(id);
        },
        goToLitRequest: function (id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.goToLitRequest(id);
        },
        goToActivityAssociation: function (association, id) {
            var activityService = Sage.Services.getService('ActivityService');
            activityService.goToActivityAssociation(association, id);
        },

        mergeRecords: function () {
            var panel = dijit.byId('list');
            if (panel) {
                var selectionInfo = panel.getSelectionInfo();

                if (selectionInfo.selectionCount === 2) {
                    var contextService = Sage.Services.getService("SelectionContextService");
                    contextService.setSelectionContext(selectionInfo.key, selectionInfo, this.mergeRecordsSelectionInfoCallback);
                    Sage.ClientLinkHandler.request({ request: 'MergeRecords', selectionInfoKey: selectionInfo.key });
                }
                else {
                    dialogs.showInfo(MasterPageLinks.Merge_Account_SelectionError);
                }
            }
        },
        mergeRecordsSelectionInfoCallback: function () {
            // client-side action
        },
        removeDeletedConfirmation: function (id) {
            Sage.ClientLinkHandler.request({ request: 'RemoveDeletedConfirmation', id: id });
        },
        getHelpUrl: function (topic, subsystem) {
            var urlfmt;
            /*if(subsystem) {
            urlfmt = dojoString.substitute('help/Subsystems/${0}/${0}_CSH.htm#${1}', [subsystem, topic]);
            return urlfmt;
            }*/

            urlfmt = utility.getClientContextByKey('WebHelpUrlFmt');
            if (urlfmt === '') {
                urlfmt = 'help/WebClient_CSH.htm#${0}';
            }
            return dojoString.substitute(urlfmt, [topic]);
        },
        getHelpUrlTarget: function () {
            var target = utility.getClientContextByKey('WebHelpLinkTarget');
            return (target === '') ? 'MCWebHelp' : target;
        },
        editSecurityProfile: function (childId, parentId, securityProfileId) {
            Sage.ClientLinkHandler.request({ request: 'Administration', type: 'EditSecurityProfile', selectionInfoKey: childId + ',' + parentId + ',' + securityProfileId });
        },
        getTeamMemberLink: function (entityType, entityId) {
            if (entityType.toLowerCase() == "user")
                Sage.ClientLinkHandler.request({ request: 'Administration', type: 'RedirectToUser', kind: entityType, id: entityId });
            else
                window.location.href = entityType + ".aspx?entityId=" + entityId;
        }
    };
    window.Link = Sage.Link;
    return Sage.Link;
});