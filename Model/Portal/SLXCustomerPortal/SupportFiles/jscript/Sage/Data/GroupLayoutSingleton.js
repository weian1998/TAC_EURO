/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, sessionStorage */
define([
        'dojo/_base/declare',
        'dojo/_base/array',
        'dojo/_base/lang',
        'Sage/Data/SDataServiceRegistry',
        'dojo/ready',
        'dojo/json'
    ],
function (
        declare,
        array,
        lang,
        SDataServiceRegistry,
        ready,
        json
    ) {
    var m = declare('Sage.Data.GroupLayoutSingleton', null, {
        data: {},
        _fetchCache: {},
        _registeredOnSuccess: {},
        _registeredOnFailure: {},
        _baseCacheKey: 'GROUPLAYOUT_',
        constructor: function () {
        },
        /* TODO: Make this a common pattern. Change groupId to a key. Allow caller to pass
         * in a request and/or service. Something like:
         * getData : function(key, sdataRequest, onSuccess, onFailure) { }
         */
        getGroupLayout: function (groupPredicate, onSuccess, onFailure, groupId) {
            var service = SDataServiceRegistry.getSDataService('system'),
                request = new Sage.SData.Client.SDataSingleResourceRequest(service),
                regOnSuccess = this._registeredOnSuccess[groupId],
                regOnFail = this._registeredOnFailure[groupId],
                cacheKey = this._baseCacheKey + groupId,
                cacheData = null;

            if (groupId !== "LOOKUPRESULTS") {
                cacheData = sessionStorage.getItem(cacheKey);
            }

            if (cacheData) {
                this.data[groupId] = json.parse(cacheData);
            }

            if (this.data[groupId]) {
                // If we have the data already,
                // don't register the callback and just return it to the caller.
                if (typeof onSuccess === 'function') {
                    onSuccess(this.data[groupId]);
                }
                return;
            }

            if (!regOnSuccess) {
                this._registeredOnSuccess[groupId] = [];
                regOnSuccess = this._registeredOnSuccess[groupId];
            }

            if (!regOnFail) {
                this._registeredOnFailure[groupId] = [];
                regOnFail = this._registeredOnFailure[groupId];
            }

            regOnSuccess.push(onSuccess);
            regOnFail.push(onFailure);

            // Bail out if we are in the middle of a request,
            // to prevent multiple requests for this data.
            if (this._fetchCache[groupId]) {
                return;
            } else {
                this._fetchCache[groupId] = true;
            }

            request.setResourceKind('groups');
            request.setResourceSelector(groupPredicate);
            request.setQueryArg('include', 'layout,tableAliases');

            request.read({
                success: lang.hitch(this, this._onSuccess, groupId),
                failure: lang.hitch(this, this._onFailure, groupId)
            });
        },
        _onSuccess: function(groupId, data) {
            var regOnSuccess = this._registeredOnSuccess[groupId];
            if (regOnSuccess) {
                array.forEach(regOnSuccess, function (cb) {
                    if (typeof cb === 'function') {
                        cb(data);
                    }
               });
            }

            if (groupId !== 'LOOKUPRESULTS') {
                this.data[groupId] = data;
            }
            sessionStorage.setItem(this._baseCacheKey + groupId, json.stringify(data));
            this._doneFetching(groupId);
        },
        _onFailure: function (groupId, err) {
            var regOnFail = this._registeredOnFailure[groupId];
            if (regOnFail) {
                array.forEach(regOnFail, function (cb) {
                    if (typeof cb === 'function') {
                        cb(err);
                    }
                });
            }

            this._doneFetching(groupId);
        },
        _doneFetching: function (groupId) {
            this._registeredOnSuccess[groupId] = [];
            this._registeredOnFailure[groupId] = [];
            this._fetchCache[groupId] = false;
        }
    });
    return m;
});