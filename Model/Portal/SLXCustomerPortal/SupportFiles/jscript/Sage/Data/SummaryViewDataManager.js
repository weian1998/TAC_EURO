/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Data/SDataServiceRegistry',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (sDataServiceRegistry, array, declare, lang) {
    var summaryRequestQueue = declare('Sage.Data.SummaryRequestQueue', null, {
        mashupName: '',
        queryName: '',
        fetching: false,
        service: null,
        unfetchedIds: null,
        constructor: function (options) {
            lang.mixin(this, options);
            this.requestHash = {};
            this.fetching = false;
            this.unfetchedIds = [];
            this.allFetched = [];
            this.service = sDataServiceRegistry.getSDataService('mashups');
        },
        add: function (id, context) {
            this.requestHash[id] = context;
            this.allFetched.push({ id: id, context: context});
            this.unfetchedIds.push(id);
        },
        send: function (callback, manager) {
            this.fetching = true;
            var quotedIds = [],
                id,
                index;
            for (id in this.requestHash) {
                quotedIds.push('\'' + id + '\'');
                index = array.indexOf(this.unfetchedIds, id);
                if (index > -1) {
                    this.unfetchedIds.splice(index, 1);
                }
            }
            var request = new Sage.SData.Client.SDataNamedQueryRequest(this.service);
            request.setApplicationName('$app');
            request.setResourceKind('mashups');
            var mashupName = this.mashupName || 'SummaryViewQueries';
            request.uri.setCollectionPredicate("'" + mashupName + "'");
            request.setQueryName('execute');
            request.setQueryArg('_resultName', this.queryName);
            request.setQueryArg('_ids', quotedIds.join(','));
            var context = this;
            request.read({
                success: lang.hitch(manager, callback, context),
                failure: lang.hitch(this, this.requestFailed, context)
            });
        },
        requestFailed: function (a, b, c) {
            console.log('request failed %o %o %o', a, b, c);
        }
    });

    var summaryVewDataManager = declare('Sage.Data.SummaryViewDataManager', null, {
        oldQueue: null,
        queue: null,
        maxQueueLength: 100,
        constructor: function () {
            this.oldQueue = {};
            this._createNewQueue();
        },
        _createNewQueue: function () {
            this.queue = new summaryRequestQueue({});
            this.requestTimeout = false;
        },
        requestData: function (entityid, widget, requestConfiguration) {
            if (this.queue.fetching) {
                this.oldQueue = this.queue;
                this._createNewQueue();
            }
            this.queue.mashupName = requestConfiguration.mashupName;
            this.queue.queryName = requestConfiguration.queryName;
            this.queue.add(entityid, widget);
            if (this.requestTimeout) {
                window.clearTimeout(this.requestTimeout);
            }
            var q = this.queue;
            var self = this;
            
            if (q.unfetchedIds.length >= this.maxQueueLength) {
                q.send(self.receiveData, self);
            }
            
            this.requestTimeout = window.setTimeout(function () { q.send(self.receiveData, self); }, 250);
        },
        requestDataNoWait: function (entityid, widget, requestConfiguration) {
            var tempQueue = new summaryRequestQueue({
                mashupName: requestConfiguration.mashupName,
                queryName: requestConfiguration.queryName
            });
            tempQueue.add(entityid, widget);
            tempQueue.send(this.receiveData, this);
        },
        receiveData: function (context, data) {
            for (var i = 0; i < data.$resources.length; i++) {
                var entity = data.$resources[i];
                var id = entity.id;
                if (!id) {
                    id = entity.$key;
                    entity.id = entity.$key;
                }
                
                // Certain groups have duplicate entities. Find
                // all of the widgets for the given entity id and set the (duplicate) content.
                (function(entity) {
                    array.forEach(context.allFetched, function (item) {
                        try {
                            if (entity.id === item.id) {
                                item.context.set('entity', entity);
                            }
                        } catch (err) { }
                    });
                })(entity);
            }
        }
    });

    Sage.Services.addService('SummaryViewDataManager', new summaryVewDataManager());
    return summaryVewDataManager;
});