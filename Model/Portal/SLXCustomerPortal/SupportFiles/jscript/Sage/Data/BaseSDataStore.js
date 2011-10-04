dojo.provide('Sage.Data.BaseSDataStore');
dojo.require('Sage.Utility');
(function() {
    dojo.declare('Sage.Data.BaseSDataStore', null, {
        constructor: function(o) {
            dojo.mixin(this, o);
            this.features = {
                'dojo.data.api.Read': true
            };
            if (!this.identityAttributes) {
                this.identityAttributes = ['$key'];
            }
            if (!this.labelAttributes) {
                this.labelAttributes = ['$descriptor'];
            }
            this.features['dojo.data.api.Identity'] = true;
            this.dataCache = { query: '' };
        },
        fetch: function(context) {
            if (!this.isNewContext(context) && this.feed)
            {
                this.onSuccess(context, this.feed);
                return;
            }
            this.setContext(context);
            this.verifyService();
            var request = this.getCollectionRequestObj(context);
            if (!request) {
                if (context.onError) {
                    context.onError.call(context.scope || this, "Invalid data url", context);
                }
                return;
            }

            var qry = '';
            // Check to see if a query has been added directly to the store, for binding with native dojo components, ie. ComboBox
            // TODO: Determine patterns for mixin, replacement, seed value, etc. of query, 
            if (this.query) {
                if (!context.query) {
                    context.query = { };
                }
                dojo.mixin(context.query, this.query);    
            }
            if (context.query ) {
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
                            if (typeof context.query.conditions === 'string') {
                                qry += (qry.length > 0) ? ' and ' + context.query.conditions : context.query.conditions;
                            }
                        }
                        //In the case of ComboBoxes and FilteringTextBoxes, we need to include the user input into the query.
                        else if (queryItem !== 'scope') {
                            var userInput = [queryItem, ' like ', "'", context.query[queryItem].replace('*','%'),"'"].join('');
                                qry += (qry.length > 0) ? ' and ' + userInput : userInput;
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

            if (context.sort && context.sort.length > 0) {
                var order = [];
                dojo.forEach(context.sort, function(v) {
                    if (v.descending)
                        this.push(v.attribute + ' desc');
                    else
                        this.push(v.attribute);
                }, order);
                request.setQueryArg('orderby', order.join(','));
            }

            var key = request.read({
                success: dojo.hitch(this, this.onSuccess, context),
                failure: dojo.hitch(this, this.onFailure, context)
            });

            return {
                abort: dojo.hitch(this, this.abortRequest, key)
            };
        },
        getCollectionRequestObj: function(context) {
            return new Sage.SData.Client.SDataResourceCollectionRequest(this.service)
                .setResourceKind(this.resourceKind)
                .setStartIndex(context.start+1)
                .setCount(context.count);
        },
        abortRequest: function(key) {
            this.service.abortRequest(key);
        },
        onSuccess: function(context, feed)
        {
            if (context.onBegin) context.onBegin.call(context.scope || this, feed.$totalResults, context);
            if (context.onComplete) context.onComplete.call(context.scope || this, feed.$resources, context);
            this.addToCache(context, feed);
        },
        onFailure: function(context, request, o)
        {
            var msg = 'An unknown exception occurred obtaining data.';
            if (request.responseText) {
                var responseJObj = Sys.Serialization.JavaScriptSerializer.deserialize(request.responseText);
                if (dojo.isArray(responseJObj)) {
                    msg = responseJObj[0].message;
                } else {
                    msg = request.responseText;
                }
            }
            if (context.onError) context.onError.call(context.scope || this, msg, context);
        },
        setContext: function(newContext) {

            //this.feed = false;
            this.context = {
                start: newContext.start,
                count: newContext.count,
                query: newContext.query,
                queryOptions: newContext.queryOptions,
                sort: newContext.sort
            };
        },
        addToCache: function(context, feed) {
            var i, item, key;
            if (context.evaluatedQuery !== this.dataCache.query) {
                this.clearCache();
                this.dataCache.query = context.evaluatedQuery;
            }
            for (i = 0; i < feed.$resources.length; i++) {
                item = feed.$resources[i];
                key = this.getIdentity(item);
                this.dataCache[key] = item;
            }
        },
        clearCache: function() {
            for (var key in this.dataCache) {
                if (key !== 'query') {
                    delete this.dataCache[key];
                }
            }
            this.dataCache.query = '';
            // is that the same as just going like this:
            //this.dataCache = { query: '' };            
        },
        isNewContext: function(newContext) {
            if (typeof this.context !== 'object') return true;

            if (this.context.start !== newContext.start) return true;
            if (this.context.count !== newContext.count) return true;

            return false;
        },
        verifyService: function(contract) {
            if (!this.service) {
                this.service = Sage.Utility.getSDataService(contract || 'dynamic')
            }
        },
        getValue: function(item, attribute, defaultValue)
        {
            return Sage.Utility.getValue(item, attribute);
        },
        getFeatures: function() {
            return this.features;
        },
        //dojo.data.api.Read implementations....
        getLabel: function(item) {
            var lbl = [];
            for (var i = 0; i < this.labelAttributes.length; i++) {
                if (item.hasOwnProperty(this.labelAttributes[i])) {
                    lbl.push(item[this.labelAttributes[i]]);
                }
            }
            return lbl.join(' ');
        },
        getLabelAttributes: function(item) {
            return this.labelAttributes
        },
        //dojo.data.api.Identity implementations...
        getIdentity: function(item) {
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
         getIdentityAttributes: function(item) {
            return this.identityAttributes;
        },
        fetchItemByIdentity: function(keywordArgs) {
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
                keywordArgs.onError.call(keywordArgs.scope || this, { 'error' : 'Item with that key does not exist in the data cache: ' + keywordArgs.identity });
            }
        }
        //close: function() {  /* clear or close as needed...*/ },
        //containsValue: function(item, attr, value) { return true||false },
    });

})();