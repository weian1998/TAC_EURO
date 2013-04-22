/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Data/BaseSDataStore',
        'Sage/Utility',
        'dojo/_base/declare'
],
function (BaseSDataStore, Utility, declare) {
    var singleEntrySDataStore = declare('Sage.Data.SingleEntrySDataStore', BaseSDataStore, {
        _entity: false,
        _request: false,
        _okToCache: true,
        postMixInProperties: function () {
        },
        getFeed: function (predicate) {
        },
        fetch: function (context) {
            if (context.queryOptions && context.queryOptions.currentEntity && this._entity) {
                this.returnCollectionProperty(context, context.queryOptions.property);
                return;
            }

            this.verifyService();
            var request = this._getRequest();
            if (context.predicate) {
                if (this._entity && (context.predicate === this._entity.$key) && this._okToCache) {
                    if (context.onComplete) {
                        context.onComplete.call(context.scope || this, this._entity, context);
                        return;
                    }
                }
                request.setResourceSelector(context.predicate);
            }

            if (this.select && this.select.length > 0)
                request.setQueryArg('select', this.select.join(','));
            if (this.include && this.include.length > 0)
                request.setQueryArg('include', this.include.join(','));
            if (this.predicate && this.predicate.length > 0) {
                request.setResourceSelector(this.predicate);
            }

            if (context.beforeRequest) {
                context.beforeRequest.call(context.scope || this, request);
            }
            request.read({
                success: dojo.hitch(this, this.onSuccess, context),
                failure: dojo.hitch(this, this.onFailure, context)
            });
        },
        save: function (options) {
            if (this._request && this._entity) {
                this._okToCache = false;
                this._request.update(this._entity, options);
            }
        },
        setValue: function (item, attribute, value) {
            var entity = item || this._entity;
            if (entity) {
                var oldValue = this.getValue(entity, attribute, '');
                Utility.setValue(entity, attribute, value);
                this.onSet(entity, attribute, oldValue, value);
            }
        },
        getCurrentEntity: function () {
            return this._entity;
        },
        newItem: function (args /*, parentInfo */) {
            var request = new Sage.SData.Client.SDataTemplateResourceRequest(this.service);
            request.setResourceKind(this.resourceKind);
            request.read({
                success: function (entry) {
                    this._entity = entry;
                    if ((args.onComplete) && (typeof args.onComplete === 'function')) {
                        args.onComplete.call(args.scope || this, entry);
                    }
                },
                failure: function (err) {
                    if (args.onError) {
                        args.onError.call(args.scope || this, err);
                    }
                },
                scope: this
            });
        },
        saveNewEntity: function (entity, success, failure, scope, beforePost) {
            if (!entity) {
                entity = this._entity;
            }
            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
            request.setResourceKind(this.resourceKind);
            if (beforePost) {
                beforePost.call(scope || this, request, entity);
            }
            request.create(entity, {
                success: success || function (created) {
                    if (typeof console !== 'undefined') {
                        console.log('created item: ' + created.$key);
                    }
                },
                failure: failure || function (response, o) {
                    if (typeof console !== 'undefined') {
                        console.log('Item not created: ' + entity.$key);
                    }
                },
                scope: scope || this
            });
        },
        deleteEntity: function (entity, success, failure, scope) {
            entity = entity || this._entity;
            if (entity) {
                var request = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
                request.setResourceKind(this.resourceKind);
                request.setResourceSelector("'" + entity['$key'] + "'");
                request['delete'](entity, {
                    success: success || function (result) {
                        if (typeof console !== 'undefined') {
                            console.log('item was successfully deleted. ' + result); }
                    },
                    failure: failure || function (response) {
                        if (typeof console !== 'undefined') {
                            console.log('Item not deleted: ' + entity.$key);
                        }
                    },
                    scope: scope || this
                });
            }
        },
        clearCache: function () {
            this._entity = false;
        },
        _getRequest: function () {
            if (!this._request) {
                var req = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
                req.setResourceKind(this.resourceKind);
                this._request = req;
            }
            return this._request;
        },
        returnCollectionProperty: function (context, propertyName) {
            if (this._entity && this._entity.hasOwnProperty(propertyName)) {
                var list = this._entity[propertyName].$resources;
                if (typeof list !== 'unknown') {
                    if (context.onBegin) {
                        context.onBegin.call(context.scope || this, list.length, context);
                    }
                    if (context.onComplete) {
                        context.onComplete.call(context.scope || this, list, context);
                    }
                }
            }
        },
        onSuccess: function (options, data) {
            if (data) {
                this._okToCache = true;
                this._entity = data;
                if (options.onComplete) {
                    options.onComplete.call(options.scope || this, data, options);
                }
            } else {
                if (options.onError) {
                    options.onError.call(options.scope || this, 'invalid feed', options);
                }
            }
        },
        onFailure: function (options, request, requestOptions) {
            this._entity = false;
            if (options.onError) {
                options.onError.call(options.scope || this, request.responseText, options);
            }
        },
        onSet: function (item, attribute, oldValue, value) { }
    });
    return singleEntrySDataStore;
});