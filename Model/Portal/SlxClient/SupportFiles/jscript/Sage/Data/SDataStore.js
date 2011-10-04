dojo.provide('Sage.Data.SDataStore');
dojo.require('Sage.Utility');

(function() {
    var S = Sage,
        U = Sage.Utility,
        C = Sage.SData.Client,
        getVirtualDirectoryName = function() {
            var reg = new RegExp(window.location.host + "/([A-Za-z\-_]+)/");
            var arr = reg.exec(window.location.href);
            if (arr)
                return arr[1];
            return '';
        };

    dojo.declare('Sage.Data.SDataStore', null, {        
        queryName: null,
        resourceKind: null,
        resourcePredicate: null,
        constructor: function(o) {
            dojo.mixin(this, o);

            this.features = {
                'dojo.data.api.Read': true
            };
        },
        expandExpression: function(expression) {
            /// <summary>
            ///     Expands the passed expression if it is a function.
            /// </summary>
            /// <param name="expression" type="String">
            ///     1: function - Called on this object and must return a string.
            ///     2: string - Returned directly.
            /// </param>
            if (typeof expression === 'function')
                return expression.call(this);
            else
                return expression;
        },
        createFetchRequest: function() {
            var queryName = this.expandExpression(this.options.queryName || this.queryName),
                resourceKind = this.expandExpression(this.options.resourceKind || this.resourceKind),
                resourcePredicate = this.expandExpression(this.options.resourcePredicate || this.resourcePredicate),
                sort = this.options.sort || this.sort,
                select = this.options.select || this.select,
                include = this.options.include || this.include,                
                request;

            if (queryName)
            {
                request = new C.SDataNamedQueryRequest(this.service)
                    .setQueryName(queryName);

                // todo: add this to the named query request class?
                if (resourcePredicate) request.getUri().setCollectionPredicate(resourcePredicate);                
            }
            else
                request = new C.SDataResourceCollectionRequest(this.service);
            
            if (resourceKind) request.setResourceKind(resourceKind);

            if (select && select.length > 0)
                request.setQueryArg('select', select.join(','));

            if (include && include.length > 0)
                request.setQueryArg('include', include.join(','));

            if (sort && sort.length > 0)
            {
                var order = [];
                dojo.forEach(sort, function(v) {
                    if (v.descending)
                        this.push(v.attribute + ' desc');
                    else
                        this.push(v.attribute);
                }, order);
                request.setQueryArg('orderby', order.join(','));
            }

            request
                .setStartIndex(this.options.start)
                .setCount(this.options.count);

            return request;
        },
        fetch: function(options) {
            if (this.fetchRequiredFor(options))
            {
                this.options = options || {};
            }
            else
            {
                this.onSuccess(options, this.getCachedFeedFor(options));
                return;
            }
            var request = this.createFetchRequest();            

            var key = request.read({
                success: dojo.hitch(this, this.onSuccess, options),
                failure: dojo.hitch(this, this.onFailure, options)
            });

            return {
                abort: dojo.hitch(this, this.abortRequest, key)
            };
        },
        abortRequest: function(key) {
            this.service.abortRequest(key);
        },
        onSuccess: function(options, feed)
        {
            if (feed)
            {
                if (options.onBegin)
                    options.onBegin.call(options.scope || this, feed.$totalResults, options);
                if (options.onComplete)
                    options.onComplete.call(options.scope || this, feed.$resources, options);
            }
            else
            {
                if (options.onError)
                    options.onError.call(options.scope || this, 'invalid feed', options);
            }
        },
        onFailure: function(options, request, requestOptions)
        {
            if (options.onError)
                options.onError.call(options.scope || this, request.responseText, options);
        },
        getCachedFeedFor: function(options) {
            return null;
        },
        fetchRequiredFor: function(options) {
            if (this.options)
            {
                if (options)
                {
                    // todo: compare options
                    return true;
                }

                return false;
            }
            else
                return true;
        },
        getValue: function(item, attribute, defaultValue)
        {
            return Sage.Utility.getValue(item, attribute, defaultValue);
        },
        getFeatures: function() {
            return this.features;
        }
    });
})();



