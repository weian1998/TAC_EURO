/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Data/SDataServiceRegistry',
    'Sage/Data/SDataStore',
    'dojo/_base/declare',
    'dojo/_base/lang'
],
function (sDataServiceRegistry, SDataStore, declare, lang) {
    var sDataSummaryRequestQueue = declare('Sage.Data.SDataSummaryRequestQueue', null, {
        select: [],
        resourceKind: '',
        fetching: false,
        serviceName: 'dynamic',
        include: [],
        service: null,
        useBathRequest: false,
        expandRecurrences: null,
        constructor: function (options) {
            lang.mixin(this, options);
            this.requestHash = {};
            this.fetching = false;
            //this.service = sDataServiceRegistry.getSDataService(this.serviceName);
        },
        add: function (entityid, context) {

            var currentContext = this.requestHash[entityid];
            if ((currentContext) && (currentContext.id !== context.id)) {
                if (!currentContext.duplicates) {
                    currentContext.duplicates = [];
                }
                var found = false;
                for (var i = 0; i < currentContext.duplicates.length; i++) {
                    if (currentContext.duplicates[i].context.id === context.id) {
                        found = true;
                    }
                }
                if (!found) {
                    currentContext.duplicates.push({ id: context.id, context: context });
                }

            } else {
                this.requestHash[entityid] = context;
            }


        },
        send: function (callback, manager) {
            this.fetching = true;
            this.service = sDataServiceRegistry.getSDataService(this.serviceName);
            var context = this;
            if (this.useBatchRequest) {
                var batch = new Sage.SData.Client.SDataBatchRequest(this.service);
                batch.setResourceKind(this.resourceKind);
                batch.setQueryArg('select', this.select.join(','));
                batch.setQueryArg('include', this.include.join(','));

                batch.using(function () {
                    for (var bid in context.requestHash) {
                        var brequest = new Sage.SData.Client.SDataSingleResourceRequest(context.service);
                        brequest.setResourceKind(context.resourceKind);
                        brequest.setResourceSelector("'" + bid + "'");
                        if (context.expandRecurrences !== null) {
                            brequest.uri.queryArgs['_expandRecurrences'] = context.expandRecurrences;
                        }
                        brequest.setQueryArg('include', context.include.join(','));
                        brequest.read();
                    }
                });

                batch.commit({
                    success: lang.hitch(manager, callback, context),
                    failure: lang.hitch(this, this.requestFailed, context)
                });

            } else {
                var quotedIds = [];
                for (var id in this.requestHash) {
                    quotedIds.push('\'' + id + '\'');
                }
                var request = new Sage.SData.Client.SDataResourceCollectionRequest(this.service);
                var where = "Id in (" + quotedIds.join(',') + ")";
                request.setResourceKind(this.resourceKind);
                request.setQueryArg('select', this.select.join(','));
                request.setQueryArg('where', where);
                request.setQueryArg('include', this.include.join(','));
                request.read({
                    success: lang.hitch(manager, callback, context),
                    failure: lang.hitch(this, this.requestFailed, context)
                });
            }
        },
        requestFailed: function (a, b, c) {
            console.log('request failed %o %o %o', a, b, c);
        }
    });

    var sDataSummaryVewDataManager = declare('Sage.Data.SDataSummaryViewDataManager', null, {
        keyField: "$key",
        constructor: function () {
            this._createNewQueue();
        },
        _createNewQueue: function () {
            this.queue = new sDataSummaryRequestQueue();
            this.requestTimeout = false;
        },
        requestData: function (entityid, widget, requestConfiguration) {
            if (this.queue.fetching) {
                this.oldQueue = this.queue;
                this._createNewQueue();
            }
            if (requestConfiguration.keyField) {
                this.keyField = requestConfiguration.keyField;
            }
            this.queue.select = requestConfiguration.select;
            this.queue.resourceKind = requestConfiguration.resourceKind;
            this.queue.serviceName = requestConfiguration.serviceName;
            this.queue.include = requestConfiguration.include;
            this.queue.useBatchRequest = requestConfiguration.useBatchRequest;
            if (requestConfiguration.expandRecurrences !== null) {
                this.queue.expandRecurrences = requestConfiguration.expandRecurrences;
            }
            this.queue.add(entityid, widget);
            if (this.requestTimeout) {
                window.clearTimeout(this.requestTimeout);
            }
            var q = this.queue;
            var self = this;
            this.requestTimeout = window.setTimeout(function () { q.send(self.receiveData, self); }, 250);
        },
        requestDataNoWait: function (entityid, widget, requestConfiguration) {
            var tempQueue = new sDataSummaryRequestQueue();
            if (requestConfiguration.keyField) {
                this.keyField = requestConfiguration.keyField;
            }
            tempQueue.select = requestConfiguration.select;
            tempQueue.resourceKind = requestConfiguration.resourceKind;
            tempQueue.serviceName = requestConfiguration.serviceName;
            tempQueue.include = requestConfiguration.include;
            tempQueue.useBatchRequest = requestConfiguration.useBatchRequest;
            if (requestConfiguration.expandRecurrences !== null) {
                tempQueue.expandRecurrences = requestConfiguration.expandRecurrences;
            }
            tempQueue.add(entityid, widget);
            tempQueue.send(this.receiveData, this);
        },
        receiveData: function (context, data) {
            for (var i = 0; i < data.$resources.length; i++) {
                var entity = data.$resources[i];
                var id = entity.id;
                if (!id) {
                    id = entity[this.keyField];
                    entity.id = id;
                }

                var currentContext = context.requestHash[entity.id];
                if (currentContext) {
                    // Certain requests have duplicate entities.
                    if (currentContext.duplicates) {
                        try {
                            if (!currentContext.applied) {
                                currentContext.applied = true;
                                currentContext.set('entity', entity);
                                // Set all of the widgets for the given entity id and set the (duplicate) content.
                                for (var i = 0; i < currentContext.duplicates.length; i++) {
                                    try {

                                        if (!currentContext.duplicates[i].context.applied) {
                                            currentContext.duplicates[i].context.applied = true;
                                            currentContext.duplicates[i].context.set('entity', entity);
                                        }
                                    }
                                    catch (err) {
                                        console.error(err);
                                    }
                                }
                            }
                        }
                        catch (err) {
                            console.error(err);
                        }

                    }
                    else {
                        try {
                            if (!currentContext.applied) {
                                currentContext.applied = true;
                                currentContext.set('entity', entity);
                            }
                        }
                        catch (err) {
                            console.error(err);
                        }
                    }
                }
            }
        }
    });
    return sDataSummaryVewDataManager;
});