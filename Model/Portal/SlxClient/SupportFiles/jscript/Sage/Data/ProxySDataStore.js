dojo.provide('Sage.Data.ProxySDataStore');
dojo.require('Sage.Data.BaseSDataStore');
(function() {
    dojo.declare('Sage.Data.ProxySDataStore', Sage.Data.BaseSDataStore, {
        constructor: function(o) {
            this.singleResource = null;
            this._request = null;
            this._hasValidService = (typeof this.service !== 'undefined');
        },
        getCollectionRequestObj: function(context) {
            if (!this._hasValidService) {
                return false;
            }
            var request = this.inherited(arguments);
            if (typeof this.getResourcePredicate === 'function') {    
                var idx = request.uri.getPathSegment(Sage.SData.Client.SDataUri.ResourcePropertyIndex) || request.uri.pathSegments.length - 1;
                var resourceSegment = request.uri.getPathSegment(idx);
                var pred = this.getResourcePredicate.call(this);
                if (typeof pred !== 'undefined' && pred !== '') {
                
                    // if there aren't any spaces, and there aren't any quotes, quote it...
                    if ((pred.indexOf(' ') < 0) && ((pred.replace(/[\"\']/, "") === pred))) {
                        pred = "'" + pred + "'";
                    }
                    resourceSegment['predicate'] = pred
                    request.uri.setPathSegment(idx, resourceSegment);
                } else {
                    if (typeof console !== 'undefined') {
                        console.warn('Proxy Data Store could not create valid URL: Missing Predicate');
                        return false;
                    }
                }
            }
            if (this.pathSegments && this.pathSegments.length > 0) {
                var nextIdx = request.uri.pathSegments.length;
                for (var i = 0; i < this.pathSegments.length; i++) {
                    request.uri.setPathSegment(nextIdx, this.evaluatePathSegment(this.pathSegments[i]));
                    nextIdx++;
                }
            }
            return request;
        },
        fetch: function(context) {
            if (context.queryOptions && context.queryOptions.singleResourceRequest) {
                 this.returnCollectionProperty(context, context.queryOptions.property);
                 return;
            }
            return this.inherited(arguments);       
        },
        verifyService: function(context) {
            if (!this.service) {
                this.service = Sage.Utility.getSDataService('proxy', true);
            }
            this._hasValidService = true;
            if (typeof this.getAppId === 'function') {
                var appid = this.getAppId();
                if (typeof appid !== 'undefined' && appid !== '') {
                    //request.uri.setCompanyDataset(appid);
                    this.service.setDataSet(appid);
                } else {
                    if (typeof console !== 'undefined') {
                        console.warn('Proxy Data Store could not create valid URL: Missing Proxy Mapping Id');
                        this._hasValidService = false;
                    }
                }
            }
        },
        returnCollectionProperty: function(context, propertyName) {
            if (this._entity.hasOwnProperty(propertyName) && this._entity[propertyName] != null) {
                var list = this._entity[propertyName].$resources;
                if (typeof list !== 'unknown') {
                    if (context.onBegin) context.onBegin.call(context.scope || this, list.length, context);
                    if (context.onComplete) context.onComplete.call(context.scope || this, list, context);
                }
            }
            if (context.onError) {
                context.onError.call(context.scope || this, "Invalid data url", context);
            }
            return null;
        },
        evaluatePathSegment: function(segmentItem) {
            if (typeof segmentItem === 'string') {
                return { 'text' : segmentItem }
            }
            if (typeof segmentItem.getPredicate === 'function') {
                return { 'text' : segmentItem.text, 'predicate' : segmentItem.getPredicate() };
            }
            if (typeof segmentItem.getPredicate === 'string') {
                return { 'text' : segmentItem.text, 'predicate' : segmentItem.getPredicate };
            }
            return segmentItem;
        },
        receiveSingleResource: function(data) {
            onGetSingleResource(data);
        },
        _getRequest: function() {
            this.verifyService('proxy');
            if (this._request === null) {
                var request = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
                request.setResourceKind(this.resourceKind);
                if (typeof this.getResourcePredicate === 'function') {
                    var idx = request.uri.getPathSegment(Sage.SData.Client.SDataUri.ResourcePropertyIndex) || request.uri.pathSegments.length - 1;
                    var resourceSegment = request.uri.getPathSegment(idx);
                    var pred = this.getResourcePredicate.call(this);
                    if (typeof pred !== 'undefined' && pred !== '') {
                
                        // if there aren't any spaces, and there aren't any quotes, quote it...
                        if ((pred.indexOf(' ') < 0) && ((pred.replace(/[\"\']/, "") === pred))) {
                            pred = "'" + pred + "'";
                        }
                        resourceSegment['predicate'] = pred
                        request.uri.setPathSegment(idx, resourceSegment);
                    } else {
                        if (typeof console !== 'undefined') {
                            console.warn('Proxy Data Store could not create valid URL: Missing Predicate');
                            return false;
                        }
                    }
                }
                if (this.pathSegments && this.pathSegments.length > 0) {
                    var nextIdx = request.uri.pathSegments.length;
                    for (var i = 0; i < this.pathSegments.length; i++) {
                        request.uri.setPathSegment(nextIdx, this.evaluatePathSegment(this.pathSegments[i]));
                        nextIdx++;
                    }
                }                
                request.setQueryArgs({
                    'select': this.select.join(','),
                    'include': this.include.join(',')
                })
                if (this.includeContent && this.includeContent === true) {
                    request.setQueryArg({'_includeContent' : true});
                }
                this._request = request;
            }
            return this._request;
        },
        getSingleResource: function() {
            var request = this._getRequest();
            var key = request.read({
                success: dojo.hitch(this, this.onSuccessLoad, context),
                failure: dojo.hitch(this, this.onFailure, context)
            });
        },
        onSuccessLoad: function(options, data) {
            if (data) {
                if (typeof console !== 'undefined') {
                    console.debug('onSuccessLoad [WITH] DATA');
                }
                this._entity = data;
                this.onGetSingleResource(data);
            }
            else {
                if (typeof console !== 'undefined') {
                    console.warn('onSuccessLoad [NO] DATA');
                }
                var empty = { $resources: [] };
                this._entity = empty;
                this.onGetSingleResource(empty);
            }
        },
        onGetSingleResource: function(data) { }
    });
})();