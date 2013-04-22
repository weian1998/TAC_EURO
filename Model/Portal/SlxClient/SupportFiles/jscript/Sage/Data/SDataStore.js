/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare',
    'dojo/_base/lang'
],
function (declare, lang) {
    var sDataStore = declare('Sage.Data.SDataStore', null, {
        executeReadWith: 'read',
        sort: null,
        where: null,
        select: null,
        include: null,
        request: null,
        queryName: null,
        resourceKind: null,
        resourcePredicate: null,
        collection: '$resources',
        expandRecurrences: null,

        constructor: function (o) {
            lang.mixin(this, o);
            this.features = {
                'dojo.data.api.Read': true
            };
        },
        _expandExpression: function (expression) {
            /// <summary>
            ///     Expands the passed expression if it is a function.
            /// </summary>
            /// <param name="expression" type="String">
            ///     1: function - Called on this object and must return a string.
            ///     2: string - Returned directly.
            /// </param>
            if (typeof expression === 'function')
                return expression.apply(this, Array.prototype.slice.call(arguments, 1));
            else
                return expression;
        },
        _createRequest: function (options) {
            var sort = this._expandExpression(options.sort || this.sort),
                query = '',
                select = this._expandExpression(options.select || this.select),
                include = this._expandExpression(options.include || this.include),
                request = this._expandExpression(options.request || this.request);

            if (options.query) {
                if (this.where) {
                    query = this._expandExpression(this.where + ' and (' + options.query + ' )');
                }
                else {
                    query = this._expandExpression(options.query);
                }
            }
            else {
                query = this._expandExpression(this.where);
            }

            if (request) {
                request = request.clone();
            }
            else {
                var queryName = this._expandExpression(options.queryName || this.queryName),
                    resourceKind = this._expandExpression(options.resourceKind || this.resourceKind),
                    resourcePredicate = this._expandExpression(options.resourcePredicate || this.resourcePredicate);

                request = queryName
                    ? new Sage.SData.Client.SDataNamedQueryRequest(this.service).setQueryName(queryName)
                    : new Sage.SData.Client.SDataResourceCollectionRequest(this.service);

                if (resourceKind) request.setResourceKind(resourceKind);
                if (resourcePredicate) request.getUri().setCollectionPredicate(resourcePredicate);
            }

            if (select && select.length > 0)
                request.setQueryArg('select', select.join(','));

            if (include && include.length > 0)
                request.setQueryArg('include', include.join(','));

            if (query)
                request.setQueryArg('where', query);

            if (sort && sort.length > 0) {
                var order = [];
                dojo.forEach(sort, function (v) {
                    if (v.descending)
                        this.push(v.attribute + ' desc');
                    else
                        this.push(v.attribute);
                }, order);
                request.setQueryArg('orderby', order.join(','));
            }

            if (typeof options.start !== 'undefined')
                request.setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.StartIndex, options.start + 1);

            if (typeof options.count !== 'undefined')
                request.setQueryArg(Sage.SData.Client.SDataUri.QueryArgNames.Count, options.count);
  
            if (this.expandRecurrences !== null) {
                request.uri.queryArgs['_expandRecurrences'] = this.expandRecurrences;
            }

            return request;
        },
        fetch: function (options) {
            var request = this._createRequest(options),
                requestObject = lang.mixin({}, options);
            var handle = request[this.executeReadWith]({
                success: lang.hitch(this, this._onFetchSuccess, options, requestObject),
                failure: lang.hitch(this, this._onFetchFailure, options, requestObject),
                httpMethodOverride: options.queryOptions && options.queryOptions['httpMethodOverride']
            });
            requestObject['abort'] = lang.hitch(this, this._abortRequest, handle);
            return requestObject;
        },
        _abortRequest: function (handle) {
            this.service.abortRequest(handle);
        },
        _onFetchSuccess: function (options, requestObject, result) {
            if (result) {
                if (result['$resources'])
                    requestObject['feed'] = result['$resources'];
                else
                    requestObject['entry'] = result;

                var items = lang.getObject(this.collection, false, result) || [result],
                    size = result['$resources']
                        ? result['$totalResults'] || -1
                        : 1;

                if (options.onBegin) {
                    options.onBegin.call(options.scope || this, size, requestObject);
                }
                if (options.onItem) {
                    for (var i = 0; i < items.length; i++)
                        options.onItem.call(options.scope || this, items[i], requestObject);
                }
                if (options.onComplete) {
                    options.onComplete.call(options.scope || this, options.onItem ? null : items, requestObject);
                }
            }
            else {
                if (options.onError) {
                    options.onError.call(options.scope || this, 'invalid feed', options);
                }
            }
        },
        _onFetchFailure: function (options, requestObject, request, requestOptions) {
            if (options.onError)
                options.onError.call(options.scope || this, request.responseText, options);
        },
        getValue: function (item, attribute, defaultValue) {
            var value = lang.getObject(attribute, false, item);
            return typeof value === 'undefined'
                ? defaultValue
                : value;
        },
        getFeatures: function () {
            return this.features;
        }
    });
    return sDataStore;
});