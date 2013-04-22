/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/Utility',
        'Sage/Data/SDataServiceRegistry',
        'dojo/_base/declare',
        'dojo/_base/lang'
],
function (Utility, SDataServiceRegistry, declare, lang) {
    var baseStore = declare('Sage.Data.BaseSDataStore', null, {
        queryName: null,
        constructor: function (o) {
            lang.mixin(this, o);
            this.features = {
                'dojo.data.api.Read': true
            };
            if (!this.identityAttributes) {
                this.identityAttributes = [this.identityAttribute || '$key'];
            }
            if (!this.labelAttributes) {
                this.labelAttributes = ['$descriptor'];
            }
            this.features['dojo.data.api.Identity'] = true;
            this.dataCache = { query: '' };
        },
        fetch: function (context) {
            if (!this.isNewContext(context) && this.feed) {
                this.onSuccess(context, this.feed);
                return;
            }

            this.setContext(context);
            if (context.count === Infinity) {
                context.count = 500;  //500 is almost Infinity, right?
            }

            var pagesize = (context.count - 0) || this.pageSize || 15;
            var startIdx = (context.start - 0) || 1;
            if (startIdx > 1) {
                startIdx = startIdx + 1;
            }

            this.verifyService();
            var request = this.getCollectionRequestObj(context);
            if (!request) {
                if (context.onError) {
                    context.onError.call(context.scope || this, "Invalid data url", context);
                }
                return;
            }

            request.setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.StartIndex, (isNaN(startIdx)) ? 1 : startIdx);
            var qry = '';

            // New dojo 1.7 controls will clobber this.query.
            // Issue a warn if this.query was set to an object or string
            if (this.query && typeof this.query !== 'function') {
                console.warn('BaseSDataStore.query should not be set. Use directQuery instead.');

                // Set the new property so we don't break anything.
                if (!this.directQuery) {
                    this.directQuery = this.query;
                }
            }

            // Check to see if a query has been added directly to the store, for binding with native dojo components, ie. ComboBox
            // TODO: Determine patterns for mixin, replacement, seed value, etc. of query,
            if (this.directQuery) {
                if (!context.query) {
                    context.query = {};
                }
                lang.mixin(context.query, this.directQuery);
            }
            if (context.query) {
                if (typeof context.query === 'function') {
                    qry = context.query();
                } else if (typeof context.query === 'string') {
                    qry = context.query;
                } else if (typeof context.query === 'object') {
                    for (var queryItem in context.query) {
                        //Initial context based query
                        if (queryItem === 'fn') {
                            qry = context.query.fn.call(context.query.scope || this);
                        }
                        //Additional conditions.  Typically from the ConditionManager.
                        else if (queryItem === 'conditions') {
                            if (typeof context.query.conditions === 'string' && context.query.conditions !== '') {
                                qry += (qry && qry.length > 0) ? ' and ' + context.query.conditions : context.query.conditions;
                            }
                        }
                        //In the case of ComboBoxes and FilteringTextBoxes, we need to include the user input into the query.
                        else if (queryItem !== 'scope') {
                            if (context.query.hasOwnProperty(queryItem)) {
                                var userInput = [queryItem, ' like ', "'", context.query[queryItem].replace('*', '%'), "'"].join('');
                                qry += (qry.length > 0) ? ' and ' + userInput : userInput;
                            }
                        }
                    }
                }
            }

            context.evaluatedQuery = qry || '';
            if (qry && qry !== '') {
                request.setQueryArg('where', qry);
            }

            if (this.select && this.select.length > 0)
                request.setQueryArg('select', this.select.join(','));

            if (this.include && this.include.length > 0)
                request.setQueryArg('include', this.include.join(','));

            if (this.sort) {
                // add the "intrinsic" sort (specified in store options)
                // take care not to re-add an attribute that is already specified in the context sort 
                // (or sdata will give an error)
                context.sort = context.sort || [];

                dojo.forEach(this.sort, function (sortItem) {
                    if (dojo.filter(context.sort, function (existingSort) {
                        return sortItem.attribute == existingSort.attribute;
                    }).length == 0) {
                        context.sort.push(sortItem);
                    }
                });
            }

            if (typeof context.resourcePredicate !== 'undefined') {
                request.getUri().setCollectionPredicate(context.resourcePredicate);
            }

            this._setQueryArgsOnRequest(context.queryArgs, request);

            if (context.sort && context.sort.length > 0) {
                var order = [];
                dojo.forEach(context.sort, function (v) {
                    if (v.descending)
                        this.push(v.attribute + ' desc');
                    else
                        this.push(v.attribute);
                }, order);
                // ProxySDataStore hits this, and it should be camel-case to follow our SData spec
                //  Our system is case-insensitive, but other systems following the spec may not be (X3 for instance)
                request.setQueryArg('orderBy', order.join(','));
            }

            if (this.beforeRequest && typeof this.beforeRequest === 'function') {
                this.beforeRequest.call(context.scope || this, request);
            }
            var key = request.read({
                success: lang.hitch(this, this.onSuccess, context),
                failure: lang.hitch(this, this.onFailure, context)
            });

            return {
                abort: lang.hitch(this, this.abortRequest, key)
            };
        },
        getCollectionRequestObj: function (context) {
            var request = this.queryName
                ? new Sage.SData.Client.SDataNamedQueryRequest(this.service).setQueryName(this.queryName)
                : new Sage.SData.Client.SDataResourceCollectionRequest(this.service);

            request.setResourceKind(this.resourceKind);
            request.setStartIndex(context.start + 1);

            if (this.resourcePredicate
                && this.resourcePredicate !== "''") {
                request.getUri().setCollectionPredicate(this.resourcePredicate);
            }

            this._setQueryArgsOnRequest(this.queryArgs, request);

            if (!context.count && this.count) {
                context.count = this.count;
            }
            request.setCount(context.count);
            return request;
        },
        _setQueryArgsOnRequest: function (queryArgs, request) {
            if (queryArgs) {
                for (var prop in queryArgs) {
                    if (queryArgs.hasOwnProperty(prop)) {
                        request.setQueryArg(prop, queryArgs[prop]);
                    }
                }
            }
        },
        abortRequest: function (key) {
            this.service.abortRequest(key);
        },
        onSuccess: function (context, feed) {
            if (context.onBegin) {
                if (typeof feed.$totalResults === 'undefined') {
                    feed.$totalResults = 500000;
                }
                context.onBegin.call(context.scope || this, feed.$totalResults, context);
            }
            if (context.onComplete) context.onComplete.call(context.scope || this, feed.$resources, context);
            this.addToCache(context, feed);
        },
        onFailure: function (context, request, o) {
            var msg = 'An unknown exception occurred obtaining data.';
            if (request.responseText) {
                var responseJObj = Sys.Serialization.JavaScriptSerializer.deserialize(request.responseText);
                if (dojo.isArray(responseJObj)) {
                    msg = responseJObj[0].message;
                } else {
                    msg = request.responseText;
                }
            }
            if (context && context.onError) {
                context.onError.call(context.scope || this, msg, context);
            }
            else {
                if (typeof msg === 'string' && typeof console !== 'undefined') {
                    if (request && request.status) {
                        msg += ' (HTTP status = %o; statusText = %o)';
                        console.error(msg, request.status, request.statusText);
                    }
                    else
                        console.error(msg);
                }
            }
        },
        setContext: function (newContext) {
            this.context = {
                start: newContext.start,
                count: newContext.count,
                query: newContext.query,
                queryOptions: newContext.queryOptions,
                sort: newContext.sort
            };
        },
        addToCache: function (context, feed) {
            var i, item, key;
            if (context.evaluatedQuery !== this.dataCache.query) {
                this.clearCache();
                this.dataCache.query = context.evaluatedQuery;
            }
            if (feed.$resources) {
                for (i = 0; i < feed.$resources.length; i++) {
                    item = feed.$resources[i];
                    key = this.getIdentity(item);
                    this.dataCache[key] = item;
                }
            }
        },
        clearCache: function () {
            for (var key in this.dataCache) {
                if (key !== 'query') {
                    delete this.dataCache[key];
                }
            }
            this.dataCache.query = '';
        },
        isNewContext: function (newContext) {
            if (typeof this.context !== 'object') return true;
            if (this.context.start !== newContext.start) return true;
            if (this.context.count !== newContext.count) return true;
            return false;
        },
        verifyService: function (contract) {
            if (!this.service) {
                this.service = SDataServiceRegistry.getSDataService(contract || 'dynamic');
            }
        },
        getValue: function (item, attribute, defaultValue) {
            return Utility.getValue(item, attribute);
        },
        getFeatures: function () {
            return this.features;
        },
        //dojo.data.api.Read implementations....
        getLabel: function (item) {
            var lbl = [];
            for (var i = 0; i < this.labelAttributes.length; i++) {
                if (item.hasOwnProperty(this.labelAttributes[i])) {
                    lbl.push(item[this.labelAttributes[i]]);
                }
            }
            return lbl.join(' ');
        },
        getLabelAttributes: function (item) {
            return this.labelAttributes;
        },
        //dojo.data.api.Identity implementations...
        getIdentity: function (item) {
            //summary:
            //  Returns the value of the unique identifier for the item passed
            //item:
            //  The item from which to obtain its identifier.
            if (item) {
                var identity = [];
                for (var i = 0; i < this.identityAttributes.length; i++) {
                    if (item.hasOwnProperty(this.identityAttributes[i])) {
                        identity.push(item[this.identityAttributes[i]]);
                    }
                }
                return identity.join('');
            }
        },
        getIdentityAttributes: function (item) {
            return this.identityAttributes;
        },
        fetchItemByIdentity: function (keywordArgs) {
            //summary:
            //  returns the item from the store that matches the identity passed in the keywordArgs object.
            //keywordArgs:
            //  object that defines the item to locate and callback methods to invoke when the item has been located and loaded.
            //  {
            //      identity: string|object,    //id
            //      onItem: function(item),     //called when item has been loaded
            //      onError: function(error),   //called when an error occurred or item could not be loaded.
            //      scope: object,              //the scope in which to call the onItem and onError functions
            //  }
            if (this.dataCache.hasOwnProperty(keywordArgs.identity)) {
                keywordArgs.onItem.call(keywordArgs.scope || this, this.dataCache[keywordArgs.identity]);
            } else {
                var msg = 'Item with that key does not exist in the data cache: ' + keywordArgs.identity;
                if (keywordArgs.onError) {
                    keywordArgs.onError.call(keywordArgs.scope || this, { 'error': msg });
                } else {
                    if (typeof console !== 'undefined') { console.info(msg); }
                }
            }
        },
        containsValue: function (item, attr, value) {
            var val = Utility.getValue(item, attr);
            return val !== '';
        }
    });

    return baseStore;
});