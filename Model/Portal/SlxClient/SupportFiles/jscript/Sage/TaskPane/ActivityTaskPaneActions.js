/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/parser',
         'dojo/ready'
],

function (
   parser,
   ready
) {
    Sage.namespace('TaskPane.ActivityTaskPaneActions');
    Sage.TaskPane.ActivityTaskPaneActions = {

        scheduleMeeting: function () {
            this._getActivityService().scheduleActivity({ type: 'Meeting' });
        },
        scheduleToDo: function () {
            this._getActivityService().scheduleActivity({ type: 'ToDo' });
        },
        schedulePhoneCall: function () {
            this._getActivityService().scheduleActivity({ type: 'PhoneCall' });
        },
        schedulePerosnalActivity: function () {
            this._getActivityService().scheduleActivity({ type: 'Personal' });
        },
        completeActivity: function () {
            this._getActivityService().completeActivity();
        },
        deleteActivity: function () {
            this._getActivityService().deleteActivity();
        },
        acceptConfirmation: function () {
            this._getActivityService().acceptConfirmation();
        },
        declineConfirmation: function () {
            this._getActivityService().declineConfirmation();
        },
        deleteConfirmation: function () {
            this._getActivityService().deleteConfirmation();
        },
        scheduleEvent: function () {
            this._getActivityService().scheduleEvent();
        },
        deleteEvent: function () {
            this._getActivityService().deleteEvent();
        },
        scheduleLitRequest: function () {
            this._activityService.scheduleLitRequest();
        },
        deleteLitRequest: function () {
            this._getActivityService().deleteLitRequest();
        },
        _getActivityService: function () {
            return Sage.Services.getService('ActivityService');
        }

    };
    return Sage.TaskPane.ActivityTaskPaneActions;

});