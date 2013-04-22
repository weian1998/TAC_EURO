/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Services/_ServiceMixin',
    'Sage/_ConfigurationProvider',
    'Sage/Services/ActivityService',
    'Sage/TaskPane/ActivityTaskContents',
    'Sage/TaskPane/ActivityTaskPaneItem',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/i18n!./nls/ActivityTaskConfigurationProvider',
    'dojo/_base/declare'
],
    function (
      _ServiceMixin,
       _ConfigurationProvider,
       ActivityService,
       ActivityTaskContents,
       ActivityTaskPaneItem,
       on,
       lang,
       locResources,
       declare
    ) {

        var activityTaskConfigurationProvider = declare('Sage.TaskPane.ActivityTaskConfigurationProvider', [_ConfigurationProvider, _ServiceMixin], {
            serviceMap: {
                'groupContextService': 'ClientGroupContext'
            },
            _roleSecurityService: null,
            _currentUserId: null,
            //Localization 
            scheduleText: 'Schedule',
            eventText: 'Event',
            phoneCallText: 'Phone Call',
            toDoText: 'To-Do',
            meetingText: 'Meeting',
            personalActivityText: 'Personal Activity',
            deleteConfirmationText: 'Delete Confirmation',
            acceptConfirmationText: 'Accept Confirmation',
            declineConfirmationText: 'Decline Confirmation',
            completeActivityText: 'Complete Activity',
            deleteActivityText: 'Delete Activity',
            deleteEventText: 'Delete Event',
            scheduleEventText: 'Schedule Event',
            scheduleRequestText: 'Schedule Request',
            deleteRequestText: 'Delete Request',
            recordsSelectedText: 'record(s) selected',
            clearText: 'Clear',
            //End Localization
            actionNameSpace: 'Sage.TaskPane.ActivityTaskPaneActions',
            _taskConfigs: false,
            constructor: function (options) {

                lang.mixin(this, locResources);
                this.inherited(arguments);
                this._subscribes.push(dojo.subscribe('/group/context/changed', this, this._onGroupContextChanged));

                var clientContextSvc = Sage.Services.getService('ClientContextService');
                if (clientContextSvc) {
                    if (clientContextSvc.containsKey("userID")) {
                        this._currentUserId = clientContextSvc.getValue("userID");
                    }
                }
                this._roleSecurityService = Sage.Services.getService('RoleSecurityService');
            },


            _onGroupContextChanged: function () {
                this.onConfigurationChange();
            },
            onConfigurationChange: function () {
            },
            _createConfiguration: function () {
                var configuration;
                var groupContext = this.groupContextService && this.groupContextService.getContext();
                var groupId = groupContext && groupContext['CurrentGroupID'];
                var taskConfig = this.getTaskConfiguration(groupId);

                var taskPane = new ActivityTaskContents({
                    taskTemplate: taskConfig.configuration.taskTemplate
                });
                taskPane.startup();

                var configuration2 = {
                    tabId: taskConfig.configuration.key,
                    taskPane: taskPane
                };

                return configuration2;
            },
            getTaskConfiguration: function (key) {

                var taskconfigs = this.getTaskConfigurations();
                for (var i = 0; i < taskconfigs.length; i++) {
                    if (taskconfigs[i].key.toUpperCase() === key.toUpperCase()) {
                        return taskconfigs[i];
                    }
                }
                var defaultConfig = {
                    key: 'default',
                    configuration: this._getDefaultConfig()
                };
                return defaultConfig;
            },

            getTaskConfigurations: function () {
                if (this._taskConfigs) {
                    return this._taskConfigs;
                }
                this._taskConfigs = [
                    {
                        key: 'activities',
                        configuration: this._getActivityConfig()
                    }, {
                        key: 'allopen',
                        configuration: this._getActivityConfig()
                    }, {
                        key: 'pastdue',
                        configuration: this._getPastDueConfig()
                    }, {
                        key: 'alarms',
                        configuration: this._getAlarmConfig()
                    }, {
                        key: 'events',
                        configuration: this._getEventConfig()
                    }, {
                        key: 'confirmations',
                        configuration: this._getConfirmConfig()
                    }, {
                        key: 'literature',
                        configuration: this._getLitRequestConfig()
                    }
                ];

                return this._taskConfigs;
            },
            _getTaskTemplateString: function (taskItems, selectionText) {
                var ts = [];
                ts.push('<div class="task-pane-item-common-tasklist">');
                ts.push('<span id="selectionCount" class="task-pane-item-common-selectionText"> 0 </span><span id="selectionText"> ' + this.recordsSelectedText + '</span><br>');
                ts.push('<a id="clearSelection" href="#" class="task-pane-item-common-clearselection" dojoAttachEvent="click:_clearSelection">' + this.clearText + '</a><br>');
                ts.push('<hr>');
                for (var i = 0; i < taskItems.length; i++) {
                    var task = taskItems[i];
                    var actionNameSpace = this.actionNameSpace;
                    if (task.actionNameSpace) {
                        actionNameSpace = task.actionNameSpace;
                    }

                    if (task.template) {
                        ts.push(task.template);
                    } else {
                        ts.push("<li>");
                        var style = "";
                        if (task.style) {
                            style = task.style;
                        }
                        ts.push(dojo.string.substitute('<div dojotype="Sage.TaskPane.ActivityTaskPaneItem" class="task-pane-item-common-tasklist" style="${4}"  linkText="${3}" securedAction="${4}" action="javascript: ${1}.${2}"></div>', [task.taskId, actionNameSpace, task.action, task.displayName, task.securedAction, style]));
                    }

                }
                ts.push('</div>');
                return ts;
            },

            _getCommonTasks: function () {
                var taskItems = [];
                return taskItems;

            },
            _getCommonActivityTasks: function () {
                var taskItems = this._getCommonTasks();
                taskItems.push({ template: "<div class='slxLabel'>" + this.scheduleText + "</div>" });
                taskItems.push({ template: "<div style='padding-left:15px;'>" });
                taskItems.push({ taskId: 'SchedulePhoneCall', type: "Link", displayName: this.phoneCallText, action: 'schedulePhoneCall();', securedAction: '', style: 'padding-left:15px;' });
                taskItems.push({ taskId: 'ScheduleMeeting', displayName: this.meetingText, action: 'scheduleMeeting()', securedAction: '', style: 'padding-left:15px;' });
                taskItems.push({ taskId: 'ScheduleToDo', type: "Link", displayName: this.toDoText, action: 'scheduleToDo();', securedAction: '', style: 'padding-left:15px;' });
                taskItems.push({ taskId: 'SchedulePersonal', type: "Link", displayName: this.personalActivityText, action: 'schedulePerosnalActivity();', securedAction: '', style: 'padding-left:15px;' });
                taskItems.push({ template: "</div>" });
                taskItems.push({ taskId: 'Complete', type: "Link", displayName: this.completeActivityText, action: 'completeActivity();', securedAction: '' });
                taskItems.push({ taskId: 'Delete', type: "Link", displayName: this.deleteActivityText, action: 'deleteActivity();', securedAction: '' });
                return taskItems;

            },
            _getActivityConfig: function (entry, options) {
                var taskItems = this._getCommonActivityTasks();
                var selectionText = "Activities";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'activities',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },
            _getPastDueConfig: function (entry, options) {
                var taskItems = this._getCommonActivityTasks();
                var selectionText = "Past Due";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'PastDue',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },
            _getAlarmConfig: function (entry, options) {
                var snoozeTemplateString = '<div>Test</div>';
                var taskItems = this._getCommonActivityTasks();
                var selectionText = "Alarms";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'Alarms',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },

            _getLitRequestConfig: function (entry, options) {

                var taskItems = this._getCommonTasks();
                //taskItems.push({template:"<div class='slxLabel'>" + this.scheduleText +"</div>"});
                taskItems.push({ taskId: 'ScheduleLitRequest', displayName: this.scheduleRequestText, action: 'scheduleLitRequest();', securedAction: '', style: 'padding-left:15px;' });
                taskItems.push({ taskId: 'DeleteRequest', displayName: this.deleteRequestText, action: 'deleteLitRequest();', securedAction: '' });
                var selectionText = "Litature Requests";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'LitRequests',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },
            _getEventConfig: function (entry, options) {

                var taskItems = this._getCommonTasks();
                // taskItems.push({template:"<div class='slxLabel'>" + this.scheduleText +"</div>"});
                taskItems.push({ taskId: 'ScheduleEvent', displayName: this.scheduleEventText, action: 'scheduleEvent();', securedAction: '', style: 'padding-left:15px;' });
                taskItems.push({ taskId: 'DeleteEvent', displayName: this.deleteEventText, action: 'deleteEvent();', securedAction: '' });
                var selectionText = "Events";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'Events',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },
            _getConfirmConfig: function (entry, options) {

                var taskItems = this._getCommonTasks();
                taskItems.push({ taskId: 'AcceptConfirmation', displayName: this.acceptConfirmationText, action: 'acceptConfirmation();', securedAction: '' });
                taskItems.push({ taskId: 'DeclineConfirmation', displayName: this.declineConfirmationText, action: 'declineConfirmation();', securedAction: '' });
                taskItems.push({ taskId: 'DeleteConfirmation', displayName: this.deleteConfirmationText, action: 'deleteConfirmation();', securedAction: '' });
                var selectionText = "Confirmations";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'Confirmations',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },
            _getDefaultConfig: function (entry, options) {
                var taskItems = {};
                var selectionText = "Default";
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: 'Default',
                    taskTemplate: taskTemplate
                };

                return configuration;
            },

            buildTaskConfiguration: function (key, selectionText, taskItems) {
                var templateString = this._getTaskTemplateString(taskItems, selectionText);
                var taskTemplate = new Simplate(templateString);
                var configuration = {
                    key: key,
                    taskTemplate: taskTemplate
                };

                return configuration;

            },
            addTaskConfiguration: function (taskConfiguration) {
                var config = this.getTaskConfiguration(taskConfiguration.key);
                if (config.key === 'default') {
                    var newConfiguration = {
                        key: taskConfiguration.key,
                        configuration: taskConfiguration
                    };
                    var taskConfigs = this.getTaskConfigurations();
                    taskConfigs.push(newConfiguration);
                } else {

                    config.configuration = taskConfiguration;
                }

            },
            requestConfiguration: function (options) {
                this._onRequestConfigurationSuccess(options, null);
            },
            _onRequestConfigurationSuccess: function (options, entry) {
                if (options.success) {
                    options.success.call(options.scope || this, this._createConfiguration(entry, options), options, this);
                }
                this._createConfiguration(entry, options);
            },
            _onRequestConfigurationFailure: function (options, response) {
                if (options.failure) {
                    options.failure.call(options.scope || this, response, options, this);
                }
            },

            _scheduleMeeting: function (event) {

            }


        });

        return activityTaskConfigurationProvider;

    });