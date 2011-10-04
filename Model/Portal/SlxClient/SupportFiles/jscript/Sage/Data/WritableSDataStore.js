dojo.provide('Sage.Data.WritableSDataStore');
dojo.require('Sage.Data.BaseSDataStore');
dojo.require('Sage.Utility');
(function() {
    dojo.declare('Sage.Data.WritableSDataStore', Sage.Data.BaseSDataStore, {
        newItemParentReferenceProperty: false,
        constructor: function(o) {
            //dojo.mixin(this, o);
            
            //dojo.data.api.Identity Implemented on BaseSDataStore...
	    //dojo.data.api.Read Implemented on BaseSDataStore...
  		    this.features['dojo.data.api.Write'] = true;
		    this.features['dojo.data.api.Notification'] = true;
            this.dirtyDataCache = { isDirty: false };
            this.singleResourceRequest = null;
        },
        getSingleResourceRequest: function(key) {
            this.verifyService();
            if (this.singleResourceRequest === null) {
                this.singleResourceRequest = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
                this.singleResourceRequest.setResourceKind(this.resourceKind);
                if (this.select.length > 0) {
                    this.singleResourceRequest.setQueryArg('select', this.select.join(',') );
                }
                if (this.include.length > 0) {
                    this.singleResourceRequest.setQueryArg('include', this.include.join(','));
                }
            }
            if (key) {
                this.singleResourceRequest.setResourceSelector(String.format("'{0}'", key));
            }
            return this.singleResourceRequest;
        },
        onSuccess: function(context, feed)
        {
            //console.log('success: %o, %o', context, feed);
            if (context.onBegin) { context.onBegin.call(context.scope || this, feed.$totalResults, context) };
            if (context.onComplete) { context.onComplete.call(context.scope || this, feed.$resources, context) };
            this.addToCache(context, feed);
        },
        clearCache: function() {
            // Inherits from BaseSDataStore
            this.inherited(arguments);
            this.clearDirtyDataCache();
        },
        clearDirtyDataCache: function() {
            for (var key in this.dirtyDataCache) {
                if (key !== 'isDirty') {
                    delete this.dirtyDataCache[key];
                }
            }
            this.dirtyDataCache.isDirty = false;
            //this.dirtyDataCache = { isDirty: false };
        },
        isItem: function(something) {
            var id = this.getIdentity(something);
            if (id && id !== '') {
                return this.dataCache.hasOwnProperty(id);
            }
            return false;
        },
        isItemLoaded: function(/* anything */ something){
		    return this.isItem(something); //boolean
        },
        loadItem: function(/* object */ keywordArgs){
		    if (!this.isItem(keywordArgs.item)) throw new Error('Unable to load ' + keywordArgs.item);
	    },
        getValues: function(item, attributename) {
            if (this.isItem(item) && (typeof attributename === "string")) {
                return (item[attributename] || []).slice(0);
            }
            return [];
        },
        hasAttribute: function(item, attributename) {
            if (this.isItem(item) && (typeof attributename === "string")) {
                return attributename in item;
            }
            return false;
        },
        close: function() {
            this.clearCache();
        },
//dojo.data.api.Write implementations...
        deleteItem: function(item, scope) {
            var options = {};
            options.scope = scope || this;
            options.ignoreETag = true;
            request = this.getSingleResourceRequest(this.getIdentity(item));
            if (scope && typeof scope.onResponse === 'function') {
                options.success = scope.onResponse;
                options.aborted = scope.onResponse;
                options.failure = scope.onResponse;    
            }            
            request['delete'](item, options);
        },
        isDirty: function(item) {
            //alert('not implemented - isDirty');
            //item could be null - if so, it means is any item dirty...
            if (item) {
                var id = this.getIdentity(item);
                if (id && id !== '') {
                    return this.dirtyDataCache.hasOwnPropery(id);
                }
            }
            return this.dirtyDataCache.isDirty;
        },
        newItem: function(args /*, parentInfo */) {
            var request = this.createTemplateRequest();
            if (request) {
                request.read({
                    success: function (entity) {
                        this._newItemCreated(args, entity);
                        this.onNew(entity);
                    },
                    failure: this.requestTemplateFailure,
                    scope: this
                });
            }
        },
        _newItemCreated: function(options, entity) {
            //debugger;
            if (this.newItemParentReferenceProperty) {
                var currentId = Sage.Utility.getCurrentEntityId();
                if (entity.hasOwnProperty(this.newItemParentReferenceProperty) && currentId) {
                    entity[this.newItemParentReferenceProperty] = { '$key' : currentId };
                }
            }
            
            if ((options) && (options.onComplete) && (typeof options.onComplete === 'function')) {
                options.onComplete.call(options.scope || this, entity);
            }
        },
        createTemplateRequest: function () {
            //The entity to create the relationship/New record for, from the selection.        
            var request = new Sage.SData.Client.SDataTemplateResourceRequest(this.service);
            if ((this.resourceKind) && (this.resourceKind !== '')) {
                request.setResourceKind(this.resourceKind);
            }
            return request;
        },
        requestTemplateFailure: function () {
            //alert('Template not received.');
        },
        saveNewEntity : function(entity, success, failure, scope) {
            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
            if (request) {
                if ((this.resourceKind) && (this.resourceKind !== '')) {
                    request.setResourceKind(this.resourceKind);
                }

                request.create(entity, {
                    success: success || function (created) {
                        if (typeof console !== 'undefined') { console.log('created item: ' + created.$key) };
                    },
                    failure: failure || function (response, o) {
                        if (typeof console !== 'undefined') { console.log('Item not created: ' + entity.$key) };
                    },
                    scope: scope || this
                });
            }    
        },
        createItem: function (item, scope) {
            var request = new Sage.SData.Client.SDataSingleResourceRequest(this.service);
            if (request) {
                if ((this.resourceKind) && (this.resourceKind !== '')) {
                    request.setResourceKind(this.resourceKind);
                }
                var options = {};
                options.scope = scope || this;
                options.scope.store = this;
                var fnSuccess = function (created) {
                    if (typeof console !== 'undefined') {
                        console.log('createItem() created item with $key of %o', created.$key);
                    }
                    if (typeof this.onResponse === 'function') {
                        this.onResponse.call(this, created);
                    }
                }
                options.success = fnSuccess;
                var fnFailure = function (response, o) {
                    if (typeof this.onResponse === 'function') {                        
                        this.onResponse.call(this, response, o);
                    }
                    else {
                        if (typeof console !== 'undefined' && response && typeof response !== 'undefined' && response.status) {
                            // Note: item may not have scope here.
                            console.log('createItem() creation failed for an item. Response: status = %o; statusText = %o', response.status, response.statusText); 
                        }
                    }
                }
                options.failure = fnFailure;
                options.aborted = fnFailure;
                request.create(item, options);
            }
        },
        revert: function() {
            // return success
            // we don't really need to do much - the grid calls fetch again and gets the data...
            this.clearDirtyDataCache();
            this.onDataReset();
        },
        save: function(scope) {
            var entity, request;
            for (var key in this.dirtyDataCache) {
                if (key !== 'isDirty') {
                    entity = this.dirtyDataCache[key];
                    if (this.isItem(entity)) {
                        request = this.getSingleResourceRequest(key);
                        var options = {};
                        options.scope = scope || this;
                        options.scope.store = this;
                        // per the spec, the 'If-Match' header MUST be present for PUT requests.
                        // however, we are breaking with the spec, on the consumer, to allow it to be OPTIONAL so
                        // that the provider can decide if it wishes to break with the spec or not.
                        options.ignoreETag = true;
                        var fnSuccess = function (updated) {
                            //Get the current $etag from the response so we can continue to update the item via sdata.
                            this.store.dataCache[updated.$key].$etag = updated.$etag;
                            if (typeof this.onResponse === 'function') {
                                this.onResponse.call(this, updated);
                            }
                        }
                        options.success = fnSuccess;
                        var fnFailure = function (response, o) {
                            //TODO: Update the store's $etag if we get a new one during a failure?
                            if (typeof console !== 'undefined') {
                                if (response && typeof response !== 'undefined' && response.responseText) {
                                    var oResponse = dojo.fromJson(response.responseText);
                                    if (oResponse && typeof oResponse !== 'undefined' && oResponse.$key) {
                                        // entity.$key does not have the correct context here.
                                        console.log('save() item not updated for $key: %o', oResponse.$key);
                                        console.log('save() response $etag: %o', oResponse.$etag);
                                        var obj = this.store.dataCache[oResponse.$key];
                                        if (obj && obj.$etag) {
                                            console.log('save() store $etag: %o', obj.$etag);
                                        }                                                        
                                    }
                                }
                            }
                            if (typeof this.onResponse === 'function') {
                                this.onResponse.call(this, response, o);
                            }
                        }
                        options.failure = fnFailure;
                        options.aborted = fnFailure;
                        request.update(entity, options);
                    }
                    delete this.dirtyDataCache[key];
                }
            }
            this.dirtyDataCache.isDirty = false;
            // If scope.onResponse is undefined but scope.onComplete is defined.
            if (scope && typeof scope.onResponse !== 'function' && typeof scope.onComplete === 'function') {
                scope.onComplete.call(scope || dojo.global);
            }
        },
        setValue: function(item, attribute, value) {
            //if (typeof console !== 'undefined') { console.log('setValue - %o %o %o', item, attribute, value) }; 
            //alert('not implemented - setValue');
            var oldValue = this.getValue(item, attribute, '');
            Sage.Utility.setValue(item, attribute, value);

            this.onSet(item, attribute, oldValue, value);
            this.dirtyDataCache[this.getIdentity(item)] = item;
            this.dirtyDataCache.isDirty = true;
            return true;
        },
        setValues: function(item, attribute, values) {
            alert('not implemented - setValues');
            //use where values is an array
        },
        unsetAttribute: function(item, attribute) {
            alert('not implemented - unsetAttribute');
            //delete all values of an attribute on the item...
        },
        //dojo.data.api.Notification
	    onSet: function(/* item */ item,
					    /*attribute-name-string*/ attribute,
					    /*object | array*/ oldValue,
					    /*object | array*/ newValue){
		    // summary: See dojo.data.api.Notification.onSet()

		    // No need to do anything. This method is here just so that the
		    // client code can connect observers to it.
	    },
        onNew: function(newItem) {
            //nothing to do here - client code connects observers to this
        },
        onDelete: function(deletedItem) {
            //nothing to do here - client code connects observers to this
        },
        onDataReset: function() {
        },
        onDataSaved: function() {
        },
        onItemSaved: function(savedItem, parentInfo) {
        },
        onItemNotSaved: function(notSavedItem, error) {
        }
    });
})();
