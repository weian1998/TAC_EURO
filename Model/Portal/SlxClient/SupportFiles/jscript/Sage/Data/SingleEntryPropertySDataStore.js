/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Data/SingleEntrySDataStore',
        'dojo/_base/declare'
],
function (SingleEntrySDataStore, declare) {
    var SingleEntryPropertySDataStore = declare('Sage.Data.SingleEntryPropertySDataStore', SingleEntrySDataStore, {
        propertyName: null,
        fetch: function (context) {
            var request = this._getRequest(context),
                key;
                
            if (this.sort) {
                request.setQueryArg('orderby', this.sort);
            }

            this.verifyService();
            
            if (context.predicate) {
                if (this._entity && (context.predicate === this._entity.$key) && this._okToCache) {
                    if (context.onComplete) {
                        context.onComplete.call(context.scope || this, this._entity, context);
                        return;
                    }
                }
                request.setResourceSelector(context.predicate);
            }

            if (this.select && this.select.length > 0) {
                request.setQueryArg('select', this.select.join(','));
            }
            
            if (this.include && this.include.length > 0) {
                request.setQueryArg('include', this.include.join(','));
            }
            if (this.predicate && this.predicate.length > 0) {
                request.setResourceSelector(this.predicate);
            }

            if (context.beforeRequest) {
                context.beforeRequest.call(context.scope || this, request);
            }

            request.setQueryArg('startIndex', context.start + 1);
            request.setQueryArg('count', context.count || 100);
            
            key = request.readFeed({
                success: dojo.hitch(this, this.onSuccess, context),
                failure: dojo.hitch(this, this.onFailure, context)
            });
            
            return {
                abort: dojo.hitch(this, this.abortRequest, key)
            };
        },
        abortRequest: function (key) {
            this.service.abortRequest(key);
        },
        onSuccess: function (context, feed) {
            if (context.onBegin) {
                context.onBegin.call(context.scope || this, feed.$totalResults, context);
            }
            if (context.onComplete) context.onComplete.call(context.scope || this, feed.$resources, context);
        },
        _getRequest: function (context) {
            // Override the _getRequest of SingleEntrySDataStore to use a different SData client request
            if (!this._request) {
                var req = new Sage.SData.Client.SDataResourcePropertyRequest(this.service);
                req.setResourceKind(this.resourceKind);
                req.setResourceProperty(this.propertyName);
                this._request = req;
            }
            return this._request;
        },
    });
    return SingleEntryPropertySDataStore;
});