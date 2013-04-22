/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
        'Sage/UI/Dialogs',
        'Sage/MainView/ActivityMgr/ActivityEditor',
        'Sage/MainView/ActivityMgr/EditEventEditor',
        'Sage/MainView/ActivityMgr/QuickCompleteEditor',
        'Sage/Services/ActivityActionProcessor',
        'Sage/Services/ActivityAction',
        'Sage/MainView/ActivityMgr/HistoryEditor',
        'Sage/MainView/ActivityMgr/OccurrenceOrSeriesQueryDlg',
        'Sage/Data/SingleEntrySDataStore',
        'Sage/Data/SDataServiceRegistry',
        'dojo/string',
        'Sage/Utility',
        'dojo/i18n!./nls/ActivityService',
        'dojo/_base/declare',
        'dojo/topic',
        'dojo/_base/lang'
],

function (
    Dialogs,
    ActivityEditor,
    EditEventEditor,
    QuickCompleteEditor,
    ActivityActionProcessor,
    ActivityAction,
    HistoryEditor,
    OccurrenceOrSeriesQueryDlg,
    SingleEntrySDataStore,
    sDataServiceRegistry,
    dString,
    sageUtility,
    nlsActivityService,
    declare,
    topic,
    lang
) {

    var activityService = declare('Sage.Services.ActivityService', null, {
        _defaultActivitManagerTabId: null,
        _activityEditor: false,
        _eventEditor: false,
        _historyEditor: false,
        _editOccSeriesDlg: false,
        _deleteOccSeriesDlg: false,
        _compOccSeriesDlg: false,
        _processor: false,
        _actCompleteQueue: false,
        _histCompleteQueue: [],

        //add these constructors as properties so they can be changed by customizations:
        activityEditorType: ActivityEditor,
        eventEditorType: EditEventEditor,
        historyEditorType: HistoryEditor,

        constructor: function () {
            dojo.mixin(this, nlsActivityService);

        },
        _ensureEditor: function () {
            if (!this._activityEditor) {
                this._activityEditor = new this.activityEditorType({ id: 'activityEditor' });
                this.onActivityEditorCreated(this._activityEditor);
            }
        },
        onActivityEditorCreated: function (editor) { },
        _ensureEventEditor: function () {
            if (!this._eventEditor) {
                this._eventEditor = new this.eventEditorType();
                this.onEventEditorCreated(this._eventEditor);
            }
        },
        onEventEditorCreated: function (editor) { },
        _ensureHistoryEditor: function () {
            if (!this._historyEditor) {
                this._historyEditor = new this.historyEditorType({ id: 'historyEditor' });
                this.onHistoryEditorCreated(this._historyEditor);
            }
        },
        onHistoryEditorCreated: function (editor) { },
        _ensureProcessor: function () {
            if (!this._processor) {
                this._processor = new ActivityActionProcessor();
            }
        },
        _getIdFromGridSelection: function () {
            var selectedItem = this.getSelectedItem();
            if (!selectedItem) {
                return false;
            }
            if (selectedItem.hasCompositeKey) {
                //Coming from User Activity entity
                return selectedItem.entity.Activity['$key'];
            } else {
                return selectedItem.id;
            }
        },
        _getRecurringFromGridSelection: function () {
            var isRecurring = false,
                selectedItem = this.getSelectedItem();
            if (selectedItem && selectedItem.entity) {
                if (selectedItem.entity.hasOwnProperty('Activity')) {
                    isRecurring = selectedItem.entity.Activity["Recurring"] === true;
                    if ((isRecurring) && (selectedItem.entity.Activity['RecurIterations'] < 0)) {
                        isRecurring = false; // reoccurnces that have no ending.
                    }
                } else {
                    isRecurring = selectedItem.entity["Recurring"] === true;
                    if ((isRecurring) && (selectedItem.entity['RecurIterations'] < 0)) {
                        isRecurring = false; // reoccurnces that have no ending.
                    }
                }
            }
            return isRecurring;
        },
        editActivity: function (id, isRecurring, memberId) {
            if (!id) {
                id = this._getIdFromGridSelection();
                isRecurring = this._getRecurringFromGridSelection();
            }
            if (!id) { return; }
            if (id.length === 12 && !isRecurring) {
                this._ensureEditor();
                this._activityEditor.set('mode', 'Update');
                this._activityEditor.set('activityId', id);
                this._activityEditor.set('activityMemberId', memberId);
                this._activityEditor.show();
            } else {
                this.editOccurrenceOrSeriesQuery(id, memberId);
            }
        },
        editOccurrence: function (id, startDate, memberId) {
            this._ensureEditor();
            this._activityEditor.set('mode', 'Update');
            this._activityEditor.set('activityId', id);
            this._activityEditor.set('activityMemberId', memberId);
            this._activityEditor.show();
        },
        editOccurrenceOrSeriesQuery: function (id, memberId) {
            if (!this._editOccSeriesDlg) {
                this._editOccSeriesDlg = new OccurrenceOrSeriesQueryDlg({ id: 'editOccSeriesQuery', mode: 'edit' });
                dojo.connect(this._editOccSeriesDlg, 'onSelectSeries', this, function (actid, mId) {
                    this.editActivity(actid.substring(0, 12), false, mId);
                });
                dojo.connect(this._editOccSeriesDlg, 'onSelectOccurrence', this, function (actid, startDate, mId) {
                    this.editOccurrence(actid, startDate, mId);
                });
            }
            this._editOccSeriesDlg.set('activityMemberId', memberId);
            this._editOccSeriesDlg.set('activityId', id);
            this._editOccSeriesDlg.show();
        },
        editTempActivity: function (id) {
            this._ensureEditor();
            this._activityEditor.set('mode', 'deleteOnCancel');
            this._activityEditor.set('activityId', id);
            this._activityEditor.show();
        },

        completeOccurrenceOrSeriesQuery: function (id) {
            if (!this._compOccSeriesDlg) {
                this._compOccSeriesDlg = new OccurrenceOrSeriesQueryDlg({ id: 'compOccSeriesQuery', mode: 'complete' });
                dojo.connect(this._compOccSeriesDlg, 'onSelectSeries', this, function (id) { this.completeActivity(id.substring(0, 12), false); });
                dojo.connect(this._compOccSeriesDlg, 'onSelectOccurrence', this, this.completeActivityOccurrence);
            }
            this._compOccSeriesDlg.set('activityId', id);
            this._compOccSeriesDlg.show();
        },
        scheduleActivity: function (args) {
            var type = args['type'] || args['Type'];
            if (type === 'CompleteActivity') {
                this.scheduleCompletedActivity(type, args);
                return;
            }

            this._ensureEditor();
            this._activityEditor.set('mode', 'New ' + args['type'] || 'Meeting');
            if (args.hasOwnProperty('preConfigured')) {
                this._activityEditor.show(args.preConfigured);
            } else {
                this.getActivityEntityContext(this._activityEditor, function (editor, context) {
                    editor.show(context);
                });
            }

        },
        completeActivityOccurrence: function (id, startDate) {
            this._ensureEditor();
            if (id.indexOf(';') < 0) {
                var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('system'))
                .setResourceKind('activities')
                .setQueryArg('select', 'StartDate')
                .setQueryArg('where', 'id eq \'' + id + '\'')  //if there is a start date, we should add that here...
                .setQueryArg('orderby', 'StartDate asc')
                .setQueryArg('count', '1');
                req.read({
                    success: function (data) {
                        var acts = data['$resources'];
                        if (acts.length > 0) {
                            this._activityEditor.set('mode', 'Complete');
                            this._activityEditor.set('activityId', acts[0]['$key']);
                            this._activityEditor.show();
                        }
                    },
                    scope: this
                });
            } else {
                this._activityEditor.set('mode', 'Complete');
                this._activityEditor.set('activityId', id);
                this._activityEditor.show();
            }
        },
        completeActivity: function (id, isRecurring) {
            var selectionContext = this._getSelectionContext(id, this.txtActivity, this.txtActivities);
            if (selectionContext.count > 1) {
                this.completeActivitiesInSelectionContext(selectionContext);
            } else {
                if (selectionContext.id) {
                    var selid = selectionContext.id;
                    if (selectionContext.selectionInfo && selectionContext.selectionInfo.selections[0].entity) {
                        var entity = selectionContext.selectionInfo.selections[0].entity;
                        if (selectionContext.selectionInfo.hasCompositeKey) {
                            //in this case we are looking at a list of UserActivities...
                            selid = entity["Activity"]["$key"];
                        }
                        if (selid.length === 12) {
                            //in case we are looking at a list of UserActivities...
                            if (entity.hasOwnProperty('Activity')) {
                                entity = entity.Activity;
                            }
                            isRecurring = entity['Recurring'] === true;
                            if ((isRecurring) && (entity['RecurIterations'] < 0)) {
                                isRecurring = false; // reoccurnces that have no ending.
                            }
                        }
                    }
                    if (selid.length === 12 && !isRecurring) {
                        this._ensureEditor();
                        this._activityEditor.set('mode', 'Complete');
                        this._activityEditor.set('activityId', selid);
                        this._activityEditor.show();
                    } else {
                        this.completeOccurrenceOrSeriesQuery(selid);
                    }
                }
            }
        },
        _quickCompleteConnections: [],
        completeActivitiesInSelectionContext: function (selectionContext) {
            if (selectionContext.count < 1) {
                return;
            }
            this._actCompleteQueue = selectionContext; //.selectionInfo.selections;
            var config = {
                selectionContext: selectionContext
            };
            var qce = new QuickCompleteEditor(config);
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCompleteIndividually', this, '_completeActivitiesInQueue'));
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCompleteNow', this, '_completeActivitiesNow'));
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCompleteAsScheduled', this, '_completeActivitiesAsScheduled'));
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCancel', this, function () { this._actCompleteQueue = false; }));
            this._quickCompleteConnections.push(dojo.connect(qce._dialog, 'onHide', this, '_quickCompleteHide'));
            qce.show();
        },
        _actEditorHideConnection: null,
        _quickCompleteHide: function () {
            if (!this._completingActivitiesIndividually) {
                this._actCompleteQueue = false;
            }
            dojo.forEach(this._quickCompleteConnections, function (connection) {
                dojo.disconnect(connection);
            });
            this._quickCompleteConnections = [];
        },
        _completingActivitiesIndividually: false,
        _completeActivitiesInQueue: function () {
            this._completingActivitiesIndividually = true;
            this._ensureEditor();
            this._actEditorHideConnection = dojo.connect(this._activityEditor, 'onHide', this, this._completeNextActivityInQueue);
            this._completeNextActivityInQueue();
        },
        _completeNextActivityInQueue: function () {
            var nextActivity = this._actCompleteQueue.selectionInfo.selections.pop();
            var id = nextActivity.id;
            var recurring = false;
            if (nextActivity.entity) {
                var activity = nextActivity.entity.hasOwnProperty('Activity') ? nextActivity.entity['Activity'] : nextActivity.entity;
                if (this._actCompleteQueue.selectionInfo.hasCompositeKey) {
                    id = nextActivity.entity["Activity"]["$key"]; ;
                }
                recurring = (id.length > 12 || activity['Recurring'] === true);
            }
            this.completeActivity(id, recurring);
            if (this._actCompleteQueues.selectionInfo.selections.length < 1) {
                dojo.disconnect(this._actEditorHideConnection);
                this._completingActivitiesIndividually = false;
            }
        },
        _completeActivitiesAsScheduled: function (options) {
            var args = {
                selectionInfo: options.selectionContext.selectionInfo,
                mode: 'asScheduled',
                note: options.note,
                resultCode: options.resultCode
            };

            var action = new ActivityAction();
            action.set('OperationName', "completeActivities");
            action.set('PublishMap', "/entity/activity/change");
            action.set('args', args);
            action.execute({
                success: function (result) {
                    topic.publish("/entity/activity/bulkComplete", "true");
                },
                failure: function () {
                    Dialogs.showError(this.txtErrorActionMsg);
                }

            });

        },
        _completeActivitiesNow: function (options) {
            var args = {
                selectionInfo: options.selectionContext.selectionInfo,
                mode: 'completeNow',
                note: options.note,
                resultCode: options.resultCode

            };
            var action = new Sage.Services.ActivityAction();
            action.set('OperationName', "completeActivities");
            action.set('PublishMap', "/entity/activity/change");
            action.set('Args', args);
            action.execute({
                success: function (result) {
                    topic.publish("/entity/activity/bulkComplete", "true");
                },
                failure: function () {
                    Dialogs.showError(this.txtErrorActionMsg);
                }
            });
        },
        completeHistoriesInList: function (histIds) {
            if (histIds.length < 1) {
                return;
            }
            if (histIds.length === 1) {
                this.completeHistory(histIds[0]);
                return;
            }
            this._histCompleteQueue = histIds;
            var config = {
                selectionContext: {
                    count: histIds.length,
                    selectionInfo: { selectedIds: histIds }
                }
            };
            this._histCompleteQueue = histIds;
            var qce = new QuickCompleteEditor(config);
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCompleteIndividually', this, '_completeHistoriesInQueue'));
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCompleteNow', this, '_updateHistoriesFromQuickComplete'));
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCompleteAsScheduled', this, '_updateHistoriesFromQuickComplete'));
            this._quickCompleteConnections.push(dojo.connect(qce, 'onCancel', this, '_cancelCompleteHistoryQueue'));
            this._quickCompleteConnections.push(dojo.connect(qce._dialog, 'onHide', this, '_quickCompleteHide'));
            qce.show();
        },
        completeHistory: function (historyId) {
            this._ensureHistoryEditor();
            this._historyEditor.set('historyId', historyId);
            this._historyEditor.set('mode', 'Complete');
            this._historyEditor.show();
        },
        _histEditorHideConnection: null,
        _quickHistoryCompleteHide: function () {
            dojo.forEach(this._histEditorHideConnection, function (connection) {
                dojo.disconnect(connection);
            });
            dojo.forEach(this._actEditorHideConnection, function (connection) {
                dojo.disconnect(connection);
            });
            this._histEditorHideConnection = false;
            this._actEditorHideConnection = false;
        },
        _completeHistoriesInQueue: function () {
            this._ensureHistoryEditor();
            this._historyEditor._doingFollowup = false;
            this._histEditorHideConnection = dojo.connect(this._historyEditor, 'onHide', this, this._completeNextHisotryInQueue);
            this._completeNextHisotryInQueue();
        },
        _completeNextHisotryInQueue: function (e) {
            if (this._histCompleteQueue.length < 1) {
                dojo.disconnect(this._histEditorHideConnection);
                dojo.disconnect(this._actEditorHideConnection);
                return;
            }
            if (this._historyEditor._doingFollowup) {
                //this._historyEditor._doingFollowup = false;
                this._ensureEditor();
                if (this._actEditorHideConnection) {
                    dojo.disconnect(this._actEditorHideConnection);
                }
                this._actEditorHideConnection = dojo.connect(this._activityEditor, 'onHide', this, this._followupCompleteNextHistoryInQueue);
                return;
            }
            var histid = this._histCompleteQueue.pop();
            var self = this;
            this.completeHistory(histid);

        },
        _followupCompleteNextHistoryInQueue: function () {
            this._historyEditor._doingFollowup = false;
            this._completeNextHisotryInQueue();
        },
        _cancelCompleteHistoryQueue: function () {
            this._deleteHistoryFromQuickComplete();
        },
        _deleteHistoryFromQuickComplete: function () {
            var doDelete = function (histId) {
                var store = new SingleEntrySDataStore({
                    resourceKind: 'history',
                    //select: ['LongNotes', 'Result'],
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
                store.fetch({
                    predicate: '"' + histId + '"',
                    onComplete: function (history) {
                        store.deleteEntity(history, this, null, null);
                    },
                    onError: function () { },
                    scope: this
                });
            };
            var count = this._histCompleteQueue.length;
            for (var i = 0; i < count; i++) {
                doDelete(this._histCompleteQueue.pop());
            }
        },
        _updateHistoriesFromQuickComplete: function (options) {
            //this._completingActivitiesIndividually = true;
            var doUpdate = function (histId) {
                var store = new SingleEntrySDataStore({
                    resourceKind: 'history',
                    select: ['LongNotes', 'Result'],
                    service: sDataServiceRegistry.getSDataService('dynamic')
                });
                store.fetch({
                    predicate: '"' + histId + '"',
                    onComplete: function (history) {
                        history.Result = options.resultCode || history.Result;
                        history.LongNotes = (history.LongNotes) ? history.LongNotes + '\n' + options.note : options.note;
                        store.save({
                            scope: this,
                            success: function (hist) { dojo.publish('/entities/history/create', hist); },
                            failure: function () { }
                        });
                    },
                    onError: function () { },
                    scope: this
                });
            };
            var count = this._histCompleteQueue.length;
            for (var i = 0; i < count; i++) {
                doUpdate(this._histCompleteQueue.pop());
            }
        },
        completeNewActivity: function (type, args) {
            this._ensureEditor();
            if (!args || typeof args != 'object') {
                args = {};
            }
            args['Type'] = args['Type'] || type || 'atAppointment';
            this._activityEditor.set('mode', 'CompleteUnscheduled');
            this._activityEditor.show(args);
        },
        deleteActivity: function (id, isRecurring, callback) {
            var selectionContext = this._getSelectionContext(id, this.txtActivity, this.txtActivities);
            if (id) {
                if ((id.length === 12 && !isRecurring) || id.indexOf("ActivityId") > -1) {
                    this.deleteActivitiesInSelectionContext(selectionContext, callback);
                }
                else {
                    this.deleteOccurrenceOrSeriesQuery(id);
                }
                return;
            }
            if (selectionContext.count < 1) {
                return;
            }
            if (selectionContext.count > 1) {
                this.deleteActivitiesInSelectionContext(selectionContext);
            }
            else {
                var selectedItem = selectionContext.selectionInfo.selections[0];
                if (selectionContext.selectionInfo.hasCompositeKey) {
                    //Coming from User Activity entity
                    if (selectedItem.entity) {
                        id = selectedItem.entity["Activity"]["$key"];
                    }
                } else {
                    id = selectedItem.id;
                }
                isRecurring = false;
                if (selectedItem.entity) {
                    if (selectedItem.entity.hasOwnProperty('Activity')) {
                        isRecurring = selectedItem.entity.Activity["Recurring"] === true;
                    } else {
                        isRecurring = selectedItem.entity["Recurring"] === true;
                    }
                }
            }
            if (!id) { return; }
            if (id.length === 12 && !isRecurring) {
                this.deleteActivitiesInSelectionContext(selectionContext);
            } else {
                this.deleteOccurrenceOrSeriesQuery(id);
            }
        },
        deleteActivitiesInSelectionContext: function (selectionContext, onComplete, onCompleteScope) {
            if (selectionContext.count < 1) {
                return;
            }
            var actionDescription = this.txtActionDeleteActivites;
            var actionQuestion = String.format(this.txtActionDeleteActivitiesQuestion, selectionContext.count, selectionContext.name);
            var action = new ActivityAction();

            var args = {
                selectionInfo: selectionContext.selectionInfo
            };

            //Needed in Activity Calendar to remove the deleted event from calendar
            if (selectionContext.count === 1) {
                var selectedItem = selectionContext.selectionInfo.selections[0];
                if (selectedItem && selectedItem.id && selectedItem.id.indexOf("ActivityId") > -1) {
                    action.set('PublishMapWithId', "/entity/userActivity/delete");
                    action.set('ActivityId', selectedItem.id);
                } else if (selectedItem) {
                    action.set('PublishMapWithId', "/entity/activity/delete/single");
                    action.set('ActivityId', selectedItem.id);
                }
            }

            action.set('OperationName', "deleteActivities");
            action.set('PublishMap', "/entity/activity/delete");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQuestion);
            action.set('Args', args);
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);

            if (onComplete) {
                var connect = dojo.connect(this._processor, 'onActionComplete', this, function (result) {
                    dojo.disconnect(connect);
                    onComplete.call(onCompleteScope || this, result);
                });
            }
            this._processor.start();
        },

        declineMemberConfirmation: function (actObj, memberId) {
            if (actObj && memberId) {
                var payload = {
                    "$name": "DeclineMember",
                    "request": {
                        "entity": actObj,
                        "memberId": memberId
                    }
                };
                var request = new Sage.SData.Client.SDataServiceOperationRequest(sDataServiceRegistry.getSDataService('dynamic'))
                    .setResourceKind('activities')
                    .setOperationName('DeclineMember');
                request.execute(payload, {
                    success: function (ua) {
                        var activityData = dString.substitute("'ActivityId=${0};UserId=${1}'", [actObj.$key, memberId]);
                        topic.publish("/entity/userActivity/delete", activityData);
                    },
                    failure: function () {

                    },
                    scope: this
                });
            }
        },

        deleteOccurrenceOrSeriesQuery: function (id) {
            if (!this._deleteOccSeriesDlg) {
                this._deleteOccSeriesDlg = new OccurrenceOrSeriesQueryDlg({ id: 'deleteOccSeriesQuery', mode: 'delete' });
                dojo.connect(this._deleteOccSeriesDlg, 'onSelectOccurrence', this, function (id) { this.deleteOccurrence(id); });
                dojo.connect(this._deleteOccSeriesDlg, 'onSelectSeries', this, function (id) { this.deleteAllOccurrence(id); });
            }
            this._deleteOccSeriesDlg.set('activityId', id);
            this._deleteOccSeriesDlg.show();
        },
        deleteOccurrence: function (id) {
            var selectionContext = this._getSelectionContext(id, this.txtActivity, this.txtActivities);
            this.deleteActivitiesInSelectionContext(selectionContext);
        },
        deleteAllOccurrence: function (id) {
            var selectionContext = this._getSelectionContext(id, this.txtActivity, this.txtActivities);
            if (selectionContext.count < 1) {
                return;
            }
            var actionDescription = this.txtActionDeleteActivites;
            var actionQuestion = String.format(this.txtActionDeleteActivitiesQuestion, selectionContext.count, selectionContext.name);
            var action = new ActivityAction();

            var args = {
                selectionInfo: selectionContext.selectionInfo
            };

            //Needed in Activity Calendar to remove the deleted event from calendar
            if (selectionContext.count === 1) {
                var selectedItem = selectionContext.selectionInfo.selections[0];
                if (selectedItem) {
                    action.set('PublishMapWithId', "/entity/activity/delete/recurrence");
                    action.set('ActivityId', selectedItem.id);
                }
            }

            action.set('OperationName', "deleteAllOccurrence");
            action.set('PublishMap', "/entity/activity/delete");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQuestion);
            action.set('Args', args);
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();

        },
        snooze: function (id, options) {
            var selectionContext = this._getSelectionContext(id, this.txtAlarm, this.txtAlarms);
            var actionDescription = this.txtActionSnoozeAlarm;
            var actionQeustion = String.format(this.txtActionSnoozeQuestion, selectionContext.count, selectionContext.name, options.name);
            var action = new ActivityAction();
            var args = {
                selectionInfo: selectionContext.selectionInfo,
                interval: options.interval,
                duration: options.duration
            };
            action.set('OperationName', "SnoozeAlarms");
            action.set('PublishMap', "/entity/UserActivity/change");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQeustion);
            action.set('Args', args);
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();

        },

        snoozeAll: function (options) {

            var id = null;
            var selectionContext = this._getSelectionContext(id, this.txtAlarm, this.txtAlarms);
            selectionContext.mode = 'ALL';
            var actionDescription = this.txtActionSnoozeAlarm;
            var actionQeustion = String.format(this.txtActionSnoozeAllQuestion, selectionContext.name, options.name);
            var action = new ActivityAction();
            var args = {
                selectionInfo: selectionContext.selectionInfo,
                interval: options.interval,
                duration: options.duration
            };
            action.set('OperationName', "SnoozeAlarms");
            action.set('PublishMap', "/entity/UserActivity/change");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQeustion);
            action.set('Args', args);
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();

        },

        dismissAlarm: function (id) {
            var selectionContext = this._getSelectionContext(id, this.txtAlarm, this.txtAlarms);
            var actionDescription = this.txtActionDismissAlarms;
            var actionQeustion = String.format(this.txtActionDismissAlarmsQuestion, selectionContext.count, selectionContext.name);
            var action = new ActivityAction();
            var args = {
                selectionInfo: selectionContext.selectionInfo

            };

            action.set('OperationName', "DismissAlarms");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQeustion);
            action.set('PublishMap', "/entity/UserActivity/change");
            action.set('Args', args);

            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();

        },

        scheduleCompletedActivity: function (activityType) {

            if (activityType) {
                this._ensureHistoryEditor();
                this._historyEditor.set('activityType', activityType);
                this._historyEditor.set('mode', 'New');
                this._historyEditor.set('historyId', '');
                this.getActivityEntityContext(this._historyEditor, function (scope, context) {
                    scope.show(context);
                });
            }
            else {
                alert('Show Schedule Completed Dialog');
            }
        },


        insertNote: function () {

            this._ensureHistoryEditor();
            this._historyEditor.set('activityType', 'Note');
            this._historyEditor.set('mode', 'New');
            this._historyEditor.set('historyId', '');
            this.getActivityEntityContext(this._historyEditor, function (scope, context) {
                scope.show(context);
            });
        },

        editHistory: function (historyId) {
            if (!historyId) {
                historyId = this.getSelectedId();
            }
            if (!historyId) { return; }
            this._ensureHistoryEditor();
            this._historyEditor.set('mode', 'Edit');
            this._historyEditor.set('historyId', historyId);
            this._historyEditor.show();
        },

        scheduleEvent: function (args) {
            this._ensureEventEditor();
            this._eventEditor.set('mode', 'New');
            this._eventEditor.set('eventId', '');
            this._eventEditor.show(args);
        },
        editEvent: function (id) {
            if (!id) {
                id = this.getSelectedId();
            }
            if (!id) { return; }
            this._ensureEventEditor();
            this._eventEditor.set('mode', 'Update');
            this._eventEditor.set('eventId', id);
            this._eventEditor.show();
        },
        deleteEvent: function (id) {
            var selectionContext = this._getSelectionContext(id, this.txtEvent, this.txtEvents);
            var actionDescription = this.txtActionDeleteEvents;
            var actionQeustion = String.format(this.txtActionDeleteEventsQuestion, selectionContext.count, selectionContext.name);
            var args = {
                selectionInfo: selectionContext.selectionInfo

            };

            var action = new ActivityAction();

            //Needed in Activity Calendar to remove the deleted event from calendar
            if (selectionContext.count === 1) {
                var selectedItem = selectionContext.selectionInfo.selections[0];
                if (selectedItem) {
                    action.set('PublishMapWithId', "/entity/event/delete/single");
                    action.set('ActivityId', selectedItem.id);
                }
            }

            action.set('OperationName', "deleteEvents");
            action.set('PublishMap', "/entity/event/delete");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQeustion);
            action.set('Args', args);
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();

        },
        confirmActivityFor: function (actId, userId, callBack, callBackScope) {
            if (actId) {
                actId = actId.substring(0, 12);
            }
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('userNotifications');
            //req.setResourceSelector('"' + actId + ';' + userId + '"');
            req.setQueryArg('where', dString.substitute('ActivityId eq \'${0}\' and ToUser.Id eq \'${1}\'', [actId, userId]));
            req.setQueryArg('precedence', '0');
            req.read({
                success: function (userNotifications) {
                    if (userNotifications['$resources'] && userNotifications['$resources'].length > 0) {
                        if (callBack) {
                            callBack.call(callBackScope || this, userNotifications['$resources'][0]['$key']);
                        } else {
                            this.editConfirmation(userNotifications['$resources'][0]['$key'], userId);
                        }
                    } else {
                        //No notifications, so go ahead and edit...
                        this.editActivity(actId, false); //assume not recurring, the scenario that reaches this code is rare anyway.
                    }
                },
                failure: function () {
                    console.warn('could not find notification information for activity:' + actId + ' and user: ' + userId);
                },
                scope: this
            });
        },
        editActivityIfConfirmed: function (activityid, isRecurring) {
            if (!activityid) {
                activityid = this._getIdFromGridSelection();
                isRecurring = this._getRecurringFromGridSelection();
            }
            //Note - only call this method if the data you have does not know if the current user has accepted
            // the activity.
            var currentUser = sageUtility.getClientContextByKey('userID');
            var predicate = dString.substitute('"${0};${1}"',
                [(activityid.indexOf(';') > 0) ? activityid.substring(0, 12) : activityid,
                  currentUser]);

            var req = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('dynamic'))
                .setResourceKind('userActivities')
                .setResourceSelector(predicate);
            req.read({
                success: function (ua) {
                    if (ua.Status === 'asUnconfirmed') {
                        this.confirmActivityFor(activityid, currentUser);
                    } else {
                        this.editActivity(activityid, isRecurring);
                    }
                },
                failure: function () {
                    this.editActivity(activityid, isRecurring);
                },
                scope: this
            });
        },
        editConfirmation: function (id, memberId) {
            if (!id) {
                id = this.getSelectedId();
            };
            if (!id) { return; }
            this._ensureEditor();
            this._activityEditor.set('mode', 'Confirm');
            this._activityEditor.set('userNotificationId', id);
            this._activityEditor.set('activityMemberId', memberId);
            this._activityEditor.show();
        },
        acceptConfirmation: function (options) {
            var id = false;
            if (options) {
                // run business rule to accept the notification - notification entity and notes, etc. are in the options...
                if (options.id) {
                    id = options.id;
                } else if (options.notification) {
                    if (options.notes) {
                        options.notification.Notes = options.notes;
                    }
                    /*
                    to get the payload template:
                    http://localhost:6666/SlxClient/slxdata.ashx/slx/dynamic/-/userNotifications/$service/accept/$template?format=json
                    */
                    var payload = {
                        "$name": "Accept",
                        "request": {
                            "entity": options.notification,
                            "UserNotificationId": options.notification['$key']
                        }
                    };

                    var request = new Sage.SData.Client.SDataServiceOperationRequest(sDataServiceRegistry.getSDataService('dynamic'))
	                    .setResourceKind('usernotifications')
	                    .setOperationName('accept');
                    request.execute(payload, {
                        success: options.success || function () { },
                        failure: options.failure || function () { },
                        scope: options.scope || this
                    });
                    return;
                }
            }
            var selectionContext = this._getSelectionContext(id, this.txtConfirmation, this.txtConfirmations);
            if (selectionContext.count > 1) {
                // run silently to accept all selected items...
                var args = {
                    selectionInfo: selectionContext.selectionInfo,
                    mode: 'accept',
                    note: ''
                };
                var actionDescription = this.txtActionAcceptConfirmations;
                var actionQeustion = String.format(this.txtActionAcceptConfirmQuestion, selectionContext.count, selectionContext.name);
                var action = new ActivityAction();
                action.set('OperationName', "acceptConfirmations");
                action.set('PublishMap', "/entity/userNotification/change");
                action.set('ActionDescription', actionDescription);
                action.set('ActionMessage', actionQeustion);
                action.set('Args', args);
                this._ensureProcessor();
                this._processor.set('Action', action);
                this._processor.set('SelectionContext', selectionContext);
                this._processor.start();
            } else {
                //open editor to accept/decline the notification
                this.editConfirmation(selectionContext.id);
            }
        },
        declineConfirmation: function (options) {
            var id = false;
            if (options) {
                if (options.id) {
                    id = options.id;
                } else if (options.notification) {
                    // run business rule to decline the notification - notification entity and notes, etc. are in the options...
                    if (options.notes) {
                        options.notification.Notes = options.notes;
                    }
                    var payload = {
                        "$name": "Decline",
                        "request": {
                            "entity": options.notification,
                            "UserNotificationId": options.notification['$key']
                        }
                    };
                    var request = new Sage.SData.Client.SDataServiceOperationRequest(sDataServiceRegistry.getSDataService('dynamic'))
	                    .setResourceKind('usernotifications')
	                    .setOperationName('decline');
                    request.execute(payload, {
                        success: options.success || function () { },
                        failure: options.failure || function () { },
                        scope: options.scope || this
                    });
                    return;
                }
            }
            var selectionContext = this._getSelectionContext(id, this.txtConfirmation, this.txtConfirmations);
            if (selectionContext.count > 1) {
                // run silently to decline all selected items...
                var args = {
                    selectionInfo: selectionContext.selectionInfo,
                    mode: 'decline',
                    note: ''
                };
                var actionDescription = this.txtDeclineConfirmations;
                var actionQeustion = String.format(this.txtActionDeclineConfrimQuestion, selectionContext.count, selectionContext.name);
                var action = new ActivityAction();
                action.set('OperationName', "declineConfirmations");
                action.set('PublishMap', "/entity/userNotification/change");
                action.set('ActionDescription', actionDescription);
                action.set('ActionMessage', actionQeustion);
                action.set('Args', args);
                this._ensureProcessor();
                this._processor.set('Action', action);
                this._processor.set('SelectionContext', selectionContext);
                this._processor.start();
            } else {
                //open editor to accept/decline the notification
                this.editConfirmation(selectionContext.id);
            }
        },
        deleteConfirmation: function (id) {
            var selectionContext = this._getSelectionContext(id, this.txtConfirmation, this.txtConfirmations);
            var args = {
                selectionInfo: selectionContext.selectionInfo
            };
            var actionDescription = this.txtActionRemoveConfirmations;
            var actionQeustion = String.format(this.txtActionRemoveConfirmationsQuestion, selectionContext.count, selectionContext.name);
            var action = new ActivityAction();
            action.set('OperationName', "deleteConfirmations");
            action.set('PublishMap', "/entity/userNotification/change");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQeustion);
            action.set('Args', args);
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();
        },

        goToActivityAssociation: function (association, id) {
            if (!id) {
                id = this.getSelectedId();
            };
            if (!id) {
                return;
            }
            this._getActivityAssociationId(association, id, function (result) {
                var entityId = '';
                switch (result.Association) {
                    case 'Account':
                        entityId = result.AccountId;
                        break;
                    case 'Contact':
                        entityId = result.ContactId;
                        break;
                    case 'Opportunity':
                        entityId = result.OpportunityId;
                        break;
                    case 'Lead':
                        entityId = result.LeadId;
                        break;
                    case 'Ticket':
                        entityId = result.TicketId;
                        break;
                    default:

                }
                if (!entityId) {
                    return;
                }
                Sage.Link.entityDetail(association, entityId);
            });
        },

        goToLitRequest: function (id) {
            if (!id) {
                id = this.getSelectedId();
            };
            if (!id) {
                return;
            }
            Sage.Link.entityDetail('LitRequest', id);
        },

        scheduleLitRequest: function () {
            var url = 'Literature.aspx?modeid=Insert';
            document.location.href = url;
        },

        deleteLitRequest: function (id) {
            var selectionContext = this._getSelectionContext(id, this.txtLiteratureRequest, this.txtLiteratureRequests);
            var actionDescription = this.txtActionDeleteLiteratureRequests;
            var actionQeustion = String.format(this.txtActionDeleteLiteratureRequestsQuestion, selectionContext.count, selectionContext.name);
            var action = new ActivityAction();
            var args = {
                selectionInfo: selectionContext.selectionInfo
            };
            action.set('Args', args);
            action.set('OperationName', "deleteLitRequests");
            action.set('ActionDescription', actionDescription);
            action.set('ActionMessage', actionQeustion);
            action.set('PublishMap', "/entity/litRequest/change");
            this._ensureProcessor();
            this._processor.set('Action', action);
            this._processor.set('SelectionContext', selectionContext);
            this._processor.start();
        },

        getActivityEntityContext: function (scope, callback) {

            var cec = Sage.Services.getService('ClientEntityContext');
            var entityContext = cec.getContext();
            var entityType = entityContext.EntityType;
            var entityId = entityContext.EntityId;
            var context = {};
            if ((entityId === '') || (entityId === 'Insert')) {
                if (callback) {
                    callback(scope, context);
                }
                return;
            }
            switch (entityType) {
                case 'Sage.Entity.Interfaces.IAccount':
                    this.getAccountContext(entityContext, scope, callback);
                    break;
                case 'Sage.Entity.Interfaces.IContact':
                    this.getContactContext(entityContext, scope, callback);
                    break;
                case 'Sage.Entity.Interfaces.IOpportunity':
                    this.getOpportunityContext(entityContext, scope, callback);
                    break;
                case 'Sage.Entity.Interfaces.ILead':
                    this.getLeadContext(entityContext, scope, callback);
                    break;
                case 'Sage.Entity.Interfaces.ITicket':
                    this.getTicketContext(entityContext, scope, callback);
                    break;
                case 'Sage.Entity.Interfaces.IReturn':
                    this.getReturnContext(entityContext, scope, callback);
                    break;
                default:
                    if (callback) {
                        callback(scope, context);
                    }
            }
        },

        getAccountContext: function (entityContext, scope, callback) {

            //look up the primary contact...
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('accounts');
            var pathIdx = req.uri.pathSegments.length - 1;
            var resourceSegment = req.uri.getPathSegment(pathIdx);
            resourceSegment['predicate'] = '"' + entityContext.EntityId + '"';
            req.uri.setPathSegment(pathIdx + 1, 'Contacts');
            req.setQueryArg('select', 'NameLF,IsPrimary,WorkPhone');
            req.setQueryArg('orderby', 'IsPrimary desc');  //rather than selecting "where IsPrimary", do it this way so we at least get something - if there is one that is primary, it will come back, otherwise, we'll just get one.
            req.setQueryArg('count', '1');  //only need one...
            req.read({
                success: function (data) {

                    var context = {
                        AccountId: entityContext.EntityId,
                        AccountName: entityContext.Description,
                        ContactId: '',
                        ContactName: '',
                        PhoneNumber: ''
                    };

                    var contacts = data['$resources'];

                    if (contacts.length > 0) {
                        var primaryContact = contacts[0];
                        context.ContactId = sageUtility.getValue(primaryContact, '$key');
                        context.ContactName = sageUtility.getValue(primaryContact, 'NameLF');
                        context.PhoneNumber = sageUtility.getValue(primaryContact, 'WorkPhone');
                    }
                    if (callback) {
                        callback(scope, context);
                    }
                },
                failure: function () {

                    var context = {
                        AccountId: entityContext.EntityId,
                        AccountName: entityContext.Description,
                        ContactId: '',
                        ContactName: '',
                        PhoneNumber: ''
                    };

                    if (callback) {
                        callback(scope, context);
                    }
                },
                scope: this
            });
        },


        getContactContext: function (entityContext, scope, callback) {
            //look up the contact and account...
            var req = new Sage.SData.Client.SDataSingleResourceRequest(sDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('contacts');
            req.setResourceSelector('"' + entityContext.EntityId + '"');
            req.setQueryArg('select', 'NameLF,IsPrimary,WorkPhone,Account,AccountName');
            req.read({
                success: function (contact) {
                    var context = {
                        AccountId: sageUtility.getValue(contact, 'Account.$key'),
                        AccountName: sageUtility.getValue(contact, 'AccountName'),
                        ContactId: entityContext.EntityId,
                        ContactName: sageUtility.getValue(contact, 'NameLF'),
                        PhoneNumber: sageUtility.getValue(contact, 'WorkPhone')
                    };
                    if (callback) {
                        callback(scope, context);
                    }
                },
                failure: function () {
                    var context = {
                        AccountId: '',
                        AccountName: '',
                        ContactId: entityContext.EntityId,
                        ContactName: entityContext.Description,
                        PhoneNumber: ''
                    };

                    if (callback) {

                        callback(scope, context);
                    }
                },
                scope: this
            });
        },

        getOpportunityContext: function (entityContext, scope, callback) {
            var store = new SingleEntrySDataStore({
                include: ['Contacts', 'Account'],
                select: ['Description', 'Contacts/IsPrimary', 'Contacts/Contact/NameLF', 'Contacts/Contact/WorkPhone', 'Account/Id', 'Account/AccountName'],
                resourceKind: 'opportunities',
                service: sDataServiceRegistry.getSDataService('dynamic')
            });
            store.fetch({
                predicate: '"' + entityContext.EntityId + '"',
                onComplete: function (opp) {
                    var context = {
                        AccountId: opp.Account.$key,
                        AccountName: opp.Account.AccountName,
                        ContactId: '',
                        ContactName: '',
                        OpportunityId: entityContext.EntityId,
                        OpportunityName: opp.Description,
                        PhoneNumber: ''
                    };
                    var oppCons = opp.Contacts.$resources;
                    var isFirst = true;
                    for (var i = 0; i < oppCons.length; i++) {
                        if (oppCons[i].IsPrimary || isFirst) {
                            context['ContactId'] = oppCons[i].Contact.$key;
                            context['ContactName'] = oppCons[i].Contact.NameLF;
                            context['PhoneNumber'] = oppCons[i].Contact.WorkPhone || '';
                        }
                        isFirst = false;
                    }
                    if (callback) {
                        callback(scope, context);
                    }
                },
                onError: function () {
                    var context = {
                        AccountId: '',
                        AccountName: '',
                        ContactId: '',
                        ContactName: '',
                        OpportunityId: entityContext.EntityId,
                        OpportunityName: entityContext.Description,
                        PhoneNumber: ''
                    };
                    if (callback) {
                        callback(scope, context);
                    }
                },
                scope: this
            });
        },

        getLeadContext: function (entityContext, scope, callback) {
            var store = new SingleEntrySDataStore({
                include: [],
                select: ['LeadFullName', 'Company', 'WorkPhone'],
                resourceKind: 'leads',
                service: sDataServiceRegistry.getSDataService('dynamic')
            });
            store.fetch({
                predicate: '"' + entityContext.EntityId + '"',
                onComplete: function (entity) {
                    var context = {
                        LeadId: entityContext.EntityId,
                        LeadName: entity.LeadFullName,
                        AccountName: entity.Company,
                        PhoneNumber: entity.WorkPhone
                    };
                    if (callback) {
                        callback(scope, context);
                    }
                },
                onError: function () {
                    var context = {
                        LeadId: entityContext.EntityId,
                        LeadName: entityContext.Description,
                        AccountName: '',
                        PhoneNumber: ''
                    };
                    if (callback) {
                        callback(scope, context);
                    }
                },
                scope: this
            });
        },

        getTicketContext: function (entityContext, scope, callback) {
            //look up the contact and account...
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('tickets');
            var pathIdx = req.uri.pathSegments.length - 1;
            var resourceSegment = req.uri.getPathSegment(pathIdx);
            resourceSegment['predicate'] = '"' + entityContext.EntityId + '"';
            // req.uri.setPathSegment(pathIdx + 1, 'Contacts');
            req.setQueryArg('select', 'Account,Account/AccountName,Contact,Contact/NameLF,Contact/WorkPhone');
            //req.setQueryArg('orderby', 'IsPrimary desc');  //rather than selecting "where IsPrimary", do it this way so we at least get something - if there is one that is primary, it will come back, otherwise, we'll just get one.
            //req.setQueryArg('count', '1');  //only need one...
            req.read({
                success: function (data) {
                    var context = {
                        AccountId: '',
                        AccountName: '',
                        ContactId: '',
                        ContactName: '',
                        TicketId: entityContext.EntityId,
                        TicketNumber: entityContext.Description,
                        PhoneNumber: ''
                    };
                    var contacts = data['$resources'];

                    if (contacts.length > 0) {
                        var contact = contacts[0];

                        context.AccountId = sageUtility.getValue(contact, 'Account.$key');
                        context.AccountName = sageUtility.getValue(contact, 'Account.AccountName');
                        context.ContactId = sageUtility.getValue(contact, 'Contact.$key');
                        context.ContactName = sageUtility.getValue(contact, 'Contact.NameLF');
                        context.PhoneNumber = sageUtility.getValue(contact, 'Contact.WorkPhone');
                    }
                    if (callback) {
                        callback(scope, context);
                    }

                },
                failure: function () {
                    var context = {
                        AccountId: '',
                        AccountName: '',
                        ContactId: '',
                        ContactName: '',
                        TicketId: entityContext.EntityId,
                        TicketNumber: entityContext.Description,
                        PhoneNumber: ''
                    };

                    if (callback) {

                        callback(scope, context);
                    }
                },
                scope: this
            });

        },

        getReturnContext: function (entityContext, scope, callback) {
            //look up the contact and account...
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('returns');
            var pathIdx = req.uri.pathSegments.length - 1;
            var resourceSegment = req.uri.getPathSegment(pathIdx);
            resourceSegment['predicate'] = '"' + entityContext.EntityId + '"';
            req.setQueryArg('select', 'Account,Account/AccountName,ReturnedBy,ReturnedBy/NameLF,ReturnedBy/WorkPhone,Ticket,Ticket/TicketNumber');
            req.read({
                success: function (data) {
                    var context = {
                        AccountId: '',
                        AccountName: '',
                        ContactId: '',
                        ContactName: '',
                        TicketId: '',
                        TicketNumber: '',
                        PhoneNumber: ''
                    };
                    var returns = data['$resources'];

                    if (returns.length > 0) {
                        var rma = returns[0];

                        context.AccountId = sageUtility.getValue(rma, 'Account.$key');
                        context.AccountName = sageUtility.getValue(rma, 'Account.AccountName');
                        context.ContactId = sageUtility.getValue(rma, 'ReturnedBy.$key');
                        context.ContactName = sageUtility.getValue(rma, 'ReturnedBy.NameLF');
                        context.PhoneNumber = sageUtility.getValue(rma, 'ReturnedBy.WorkPhone');
                        context.TicketNumber = sageUtility.getValue(rma, 'Ticket.TicketNumber');
                        context.TicketId = sageUtility.getValue(rma, 'Ticket.$key');
                    }
                    if (callback) {
                        callback(scope, context);
                    }

                },
                failure: function () {
                    var context = {
                        AccountId: '',
                        AccountName: '',
                        ContactId: '',
                        ContactName: '',
                        TicketId: '',
                        TicketNumber: '',
                        PhoneNumber: ''
                    };

                    if (callback) {

                        callback(scope, context);
                    }
                },
                scope: this
            });

        },


        _getActivityAssociationId: function (association, activityId, callback) {

            //look up activity...
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('dynamic'));
            req.setResourceKind('activities');
            var pathIdx = req.uri.pathSegments.length - 1;
            var resourceSegment = req.uri.getPathSegment(pathIdx);
            resourceSegment['predicate'] = '"' + activityId + '"';
            req.setQueryArg('select', 'AccountId,ContactId,OpportunityId,TicketId,LeadId');
            req.read({
                success: function (data) {
                    var result = {
                        Association: association,
                        ActivityId: activityId,
                        AccountId: '',
                        ContactId: '',
                        OpportunityId: '',
                        TicketId: '',
                        LeadId: ''
                    };
                    var acts = data['$resources'];

                    if (acts.length > 0) {
                        var act = acts[0];

                        result.AccountId = sageUtility.getValue(act, 'AccountId');
                        result.ContactId = sageUtility.getValue(act, 'ContactId');
                        result.OpportunityId = sageUtility.getValue(act, 'OpportunityId');
                        result.TicketId = sageUtility.getValue(act, 'TicketId');
                        result.LeadId = sageUtility.getValue(act, 'LeadId');
                    }
                    if (callback) {
                        callback(result);
                    }

                },
                failure: function () {
                    var result = {
                        Association: association,
                        ActivityId: activityId,
                        AccountId: '',
                        ContactId: '',
                        OpportunityId: '',
                        TicketId: '',
                        LeadId: ''
                    };

                    if (callback) {
                        callback(result);
                    }
                },
                scope: this
            });
        },
        getActivityFreeBusyFor: function (scope, options, onSuccessCallback, onfailCallback) {
            var self = this;
            this.getResourceActivitiesFor(self, options,
            function (resourceData) {
                self.getUserActivitiesFor(self, options,
                function (userData) {
                    var freeBusyData = self._buildFreeBusyData(resourceData, userData);
                    if (onSuccessCallback) {
                        onSuccessCallback.call(scope, freeBusyData);
                    }
                },
                function (userData) {
                    if (onfailCallback) {
                        onfailCallback.call(scope, data);
                    }
                });
            },
            function (data) {

                if (onfailCallback) {

                    onfailCallback.call(scope, data);
                }
            });
        },
        getResourceActivitiesFor: function (scope, options, onSuccessCallback, onfailCallback) {
            var select = ['Timeless',
                      'Type',
                      'StartDate',
                      'Duration',
                      'Description',
                      'Resources/Resource'
                     ];
            var include = ['$descriptors'];
            var resourceKind = 'activities';
            var service = sDataServiceRegistry.getSDataService('system');
            var isoStartDate = sageUtility.Convert.toIsoStringFromDate(options.startDate);
            var isoEndDate = sageUtility.Convert.toIsoStringFromDate(options.endDate);
            var self = this;
            var where = "(Resources.ResourceId in (" + options.quotedIds.join(',') + "))" + dojo.string.substitute("and (Timeless ne true) and (StartDate between @${0}@ and @${1}@)", [isoStartDate, isoEndDate]);
            var request = new Sage.SData.Client.SDataResourceCollectionRequest(service);
            if (options.select) {
                select = options.select;
            }
            request.setResourceKind(resourceKind);
            request.setQueryArg('select', select.join(','));
            request.setQueryArg('where', where);
            request.setQueryArg('include', include.join(','));
            request.uri.queryArgs['_expandRecurrences'] = options.expandRecurrences;
            request.read({
                success: function (data) {
                    if (onSuccessCallback) {
                        var resourceData = self._processResourceActivityData(data);
                        onSuccessCallback.call(scope, resourceData);
                    }
                },
                failure: dojo.hitch(scope, onfailCallback)
            });
        },
        getUserActivitiesFor: function (scope, options, onSuccessCallback, onfailCallback) {
            var select = ['Timeless',
                      'Type',
                      'StartDate',
                      'Duration',
                      'Description',
                      'Leader',
                      'UserActivities/User',
                      'UserActivities/Status'
                     ];

            var include = ['$descriptors'];
            var resourceKind = 'activities';
            var service = sDataServiceRegistry.getSDataService('system');
            var isoStartDate = sageUtility.Convert.toIsoStringFromDate(options.startDate);
            var isoEndDate = sageUtility.Convert.toIsoStringFromDate(options.endDate);
            var self = this;
            var where = "(UserActivities.UserId in (" + options.quotedIds.join(',') + ")) and (Type ne 'atLiterature') and (UserActivities.Status ne 'asDeclned')" + dojo.string.substitute("and (StartDate between @${0}@ and @${1}@)", [isoStartDate, isoEndDate]);
            var request = new Sage.SData.Client.SDataResourceCollectionRequest(service);
            if (options.timelessOnly) {
                where = where + ' and (Timeless eq true)'
            } else {
                if (!options.includeTimless) {
                    where = where + ' and (Timeless ne true)'
                }
            }
            if (options.select) {
                select = options.select;
            }
            request.setResourceKind(resourceKind);
            request.setQueryArg('select', select.join(','));
            request.setQueryArg('where', where);
            request.setQueryArg('include', include.join(','));
            request.uri.queryArgs['_expandRecurrences'] = options.expandRecurrences;
            request.read({
                success: function (data) {
                    var cleanList = self._processUserActivityData(data);
                    if (onSuccessCallback) {
                        onSuccessCallback.call(scope, cleanList);
                    }
                },
                failure: dojo.hitch(scope, onfailCallback)
            });
        },
        _processUserActivityData: function (actvityData) {
            var cleanData = [];
            cleanData['$resources'] = [];
            var data = actvityData['$resources'];
            if (data) {
                var cnt = data.length;
                for (var i = 0; i < cnt; i++) {
                    var userActivityFound = false;
                    var activityId = data[i]["$key"];
                    if (data[i].UserActivities) {
                        var userActivities = data[i].UserActivities.$resources;
                        var ln = userActivities.length;
                        for (var j = 0; j < ln; j++) {
                            var userId = data[i].UserActivities.$resources[j].User.$key
                            var userActvityKey = userId + ':' + activityId
                            userActivityFound = cleanData[userActvityKey];
                            if (!userActivityFound) {
                                var userActView = {
                                    $Key: userActvityKey,
                                    UserId: data[i].UserActivities.$resources[j].User.$key,
                                    ActivityId: activityId,
                                    UserActivity: data[i].UserActivities.$resources[j],
                                    Activity: data[i]
                                };
                                cleanData[userActvityKey] = userActView;
                                cleanData[userActvityKey] = userActvityKey;
                                cleanData['$resources'].push(userActView);
                                continue;
                            }

                        } //end for
                    } else {
                        //Personal Activities will not have User Activities
                        //Attach 'UserActvities.$resources' as this is the key on grid binding for userColor column
                        var uId = data[i].Leader.$key;
                        var userActvityKey = uId + ':' + activityId;
                        data[i].UserActivities = [];
                        data[i].UserActivities.$resources = [];
                        var userObj = {};
                        userObj.$key = uId;
                        userObj.User = { $key: uId };
                        data[i].UserActivities.$resources.push(userObj);
                        var userActView = {
                            $key: userActvityKey,
                            UserId: data[i].Leader.$key,
                            ActivityId: activityId,
                            UserActivity: data[i].UserActivities.$resources,
                            Activity: data[i]
                        };
                        userActivityFound = cleanData[userActvityKey];
                        if (userActivityFound) {
                            cleanData[userActvityKey] = userActvityKey;
                            cleanData['$resources'].push(userActView);
                        }
                    }
                } //end for
            } //end if
            var resData = [];
            resData['$resources'] = cleanData['$resources']
            return resData;
        },
        _processResourceActivityData: function (actvityData) {
            var cleanData = [];
            cleanData['$resources'] = [];
            var data = actvityData['$resources'];
            if (data) {
                var cnt = data.length;
                for (var i = 0; i < cnt; i++) {
                    var resourceFound = false;
                    var activityId = data[i]["$key"];
                    if (data[i].Resources) {
                        var Resources = data[i].Resources.$resources;
                        var ln = Resources.length;
                        for (var j = 0; j < ln; j++) {
                            var resourceId = data[i].Resources.$resources[j].Resource.$key
                            var resourceActvitiyKey = resourceId + ':' + activityId
                            resourceFound = cleanData[resourceActvitiyKey];
                            if (!resourceFound) {
                                var resourceActView = {
                                    $Key: resourceActvitiyKey,
                                    ResourceId: resourceId,
                                    ActivityId: activityId,
                                    ResourceActivity: data[i].Resources.$resources[j],
                                    Activity: data[i]
                                };
                                cleanData[resourceActvitiyKey] = resourceActView;
                                cleanData[resourceActvitiyKey] = resourceActvitiyKey;
                                cleanData['$resources'].push(resourceActView);
                                continue;
                            } //end if
                        } //end for 
                    } //end if
                } //end for
            } //end if
            var resData = [];
            resData['$resources'] = cleanData['$resources']
            return resData;
        },
        _buildFreeBusyData: function (resourceData, userData) {
            var rData = resourceData['$resources'];
            var uData = userData['$resources'];
            var vData = [];
            vData['$resources'] = [];
            for (var i = 0; i < uData.length; i++) {
                var itemObj = {
                    id: uData[i].$key,
                    activityId: uData[i].ActivityId,
                    itemId: uData[i].UserId,
                    type: uData[i].Activity.Type,
                    startDate: uData[i].Activity.StartDate,
                    duration: uData[i].Activity.Duration,
                    timless: uData[i].Activity.Timeless,
                    description: uData[i].Activity.Description
                };
                vData['$resources'].push(itemObj);
            }
            for (var i = 0; i < rData.length; i++) {
                var itemObj = {
                    id: rData[i].$key,
                    activityId: rData[i].ActivityId,
                    itemId: rData[i].ResourceId,
                    type: rData[i].Activity.Type,
                    startDate: rData[i].Activity.StartDate,
                    duration: rData[i].Activity.Duration,
                    timless: rData[i].Activity.Timeless,
                    description: rData[i].Activity.Description
                };
                vData['$resources'].push(itemObj);
            }
            return vData;
        },
        getDefaultActivityManagerTabId: function () {
            if (!this._defaultActivitManagerTabId) {
                var optionsSvc = Sage.Services.getService('UserOptions');
                var self = this;
                if (optionsSvc) {
                    optionsSvc.get('DefaultView', 'ActivityAlarm', function (data) {
                        self._defaultActivitManagerTabId = self.getTabIdFromCode(data.value);
                    },
                    null,
                    this,
                    false
                    );
                }
            }
            return this._defaultActivitManagerTabId;
        },
        setDefaultActivityManagerTabId: function (tabId) {
            this._defaultActivitManagerTabId = tabId;
        },
        getTabIdFromCode: function (code) {
            var tabId = 'activities';
            switch (code) {
                case '0':
                    tabId = 'activities';
                    break;
                case '1':
                    tabId = 'allopen';
                    break;
                case '2':
                    tabId = 'pastdue';
                    break;
                case '3':
                    tabId = 'alarms';
                    break;
                case '4':
                    tabId = 'events';
                    break;
                case '5':
                    tabId = 'confirmations';
                    break;
                case '6':
                    tabId = 'literature';
                    break;
            }
            return tabId;
        },
        getSelectedId: function () {
            var selectionInfo = this.getSelectionInfo();
            var id = "";
            if (selectionInfo) {
                if (selectionInfo.hasCompositeKey) {
                    var entity = selectionInfo.selections[0].entity;
                    return entity["Activity"]["$key"];
                }
                if (selectionInfo.selections.length == 1) {
                    id = selectionInfo.selections[0].id;
                } else {
                    id = selectionInfo.selections[0].id;
                }
            }
            return id;
        },

        getSelectedItem: function () {
            var selectionInfo = this.getSelectionInfo();
            var selectedItem = { id: false, hasCompositeKey: false, entity: false };
            if (selectionInfo) {
                selectedItem.hasCompositeKey = selectionInfo.hasCompositeKey;
                selectedItem.entity = selectionInfo.entity;
                if (selectionInfo.selections.length == 1) {
                    selectedItem.id = selectionInfo.selections[0].id;
                    selectedItem.entity = selectionInfo.selections[0].entity;
                } else {
                    selectedItem.id = selectionInfo.selections[0].id;
                    selectedItem.entity = selectionInfo.selections[0].entity;
                }
            }
            return selectedItem;
        },


        getSelections: function () {
            var selectionInfo = this.getSelectionInfo();
            var selections = null;
            if (selectionInfo) {
                selections = selectionInfo.selections;
            }
            return selections;
        },
        prepareSelections: function () {
            return this.getSelectionInfo();
        },
        getSelectionInfo: function () {
            var selectionInfo = false;
            try {
                var panel = dijit.byId('list');
                if (panel) {
                    selectionInfo = panel.getSelectionInfo(true);
                }
            }
            catch (e) {
                Dialogs.alert(this.txtErrorActionMsg || "error getting selectionInfo");
            }
            return selectionInfo;
        },
        getTotalSelectionCount: function () {
            var count = 0;
            try {
                var panel = dijit.byId('list');
                if (panel) {
                    count = panel.getTotalSelectionCount();
                }
            }
            catch (e) {
            }
            return count;
        },

        verifySelection: function (selectionInfo) {
            if (selectionInfo != null) {
                return (selectionInfo.selectionCount != 0);
            }
            return false;
        },
        verifySingleSelection: function (selectionInfo) {
            if (selectionInfo != null) {
                return (selectionInfo.selectionCount === 1);
            }
            return false;
        },
        setSelectionCount: function () {
            try {
                var panel = dijit.byId('list');
                if (panel) {
                    $("#selectionCount").text(panel.getTotalSelectionCount());
                }
            }
            catch (e) {
            }
        },

        refreshList: function (tabId) {
            try {
                var panel = dijit.byId('list');
                if (panel) {
                    var grpContextSvc = Sage.Services.getService('ClientGroupContext');
                    if (grpContextSvc) {
                        var ctx = grpContextSvc.getContext();
                        if (tabId === ctx.CurrentGroupID) {
                            panel.refreshView(tabId);
                        }
                    }
                }
            }
            catch (e) {
            }
        },
        _getSelectionContext: function (id, singularName, pluralName) {
            var selectionContext = {
                id: null,
                selectionInfo: null,
                count: 0,
                mode: 'select',
                name: null
            };
            if (!id) {
                selectionContext.selectionInfo = this.getSelectionInfo();
                selectionContext.count = selectionContext.selectionInfo.selectionCount;
                if (selectionContext.count === 1) {
                    selectionContext.id = selectionContext.selectionInfo.selectedIds[0];
                }
            } else {
                var selectedIds = [];
                var selections = [];
                selectedIds.push(id);
                selections.push({ rn: 0, id: id });
                var selectionInfo = {
                    key: '',
                    mode: 'singleSelect',
                    selectionCount: 1,
                    recordCount: 1,
                    sortDirection: '',
                    sortField: '',
                    keyField: '',
                    hasCompositeKey: id.indexOf("Activity") > -1 ? true : false,
                    ranges: [],
                    selections: selections,
                    selectedIds: selectedIds
                };
                selectionContext.selectionInfo = selectionInfo;
                selectionContext.id = id;
                selectionContext.count = 1;
            }
            selectionContext.name = (selectionContext.count > 1) ? pluralName : singularName;
            return selectionContext;
        },


        getActivityService: function () {
            var service = sDataServiceRegistry.getSDataService('dynamic');
            return service;
        }


    }); // end dojo declare

    /**
    * Make an instance of this service available to the 
    * Sage.Services.getService method.
    */
    if (!Sage.Services.hasService('ActivityService')) {

        Sage.Services.addService('ActivityService', new activityService());

    }
    return activityService;
})
