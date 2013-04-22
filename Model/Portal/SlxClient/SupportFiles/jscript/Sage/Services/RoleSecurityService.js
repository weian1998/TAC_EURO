/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/_Widget',
    'Sage/Data/SDataServiceRegistry',
    'Sage/Utility/_LocalStorageMixin',
    'dojo/_base/declare'
],
function (_Widget, SDataServiceRegistry, _LocalStorageMixin, declare) {
    /**
    * Declare the UserOptions class and append its methods and properties
    * @constructor
    */
    var widget = declare('Sage.Services.RoleSecurityService', [_Widget, _LocalStorageMixin], {
        _currentUserId: '',
        _accessListCache: false,
        _enabled: true,
        _nameSpace: 'Sage_SalesLogix_RoleSecurityService',
        _clearCache: false,
        constructor: function (options) {
            this.inherited(arguments);
            dojo.mixin(this, options);
            this._currentUserId = this._getCurrentUserId();           
        },
        postCreate: function (options) {
            this._getFromCache();
        },

        _getCurrentUserId: function () {

            if (!this._currentUserId) {
                var clientContextSvc = Sage.Services.getService('ClientContextService');
                if (clientContextSvc) {
                    if (clientContextSvc.containsKey("userID")) {
                        this._currentUserId = clientContextSvc.getValue("userID");
                    }
                }
            }

            return this._currentUserId;
        },
        _virtuald: function () {
            var match = /^\/([^\/]+)\//.exec(location.pathname);
            return match ? match[1] : '';
        },
        hasAccess: function (actionName, callback) {
            var result = this._internalHasAccess(actionName);
            if (callback) {
                callback(result);
            }
            return result;
        },
        _internalHasAccess: function (actionName) {

            if (!this._enabled) {
                return true;
            }

            if (!actionName) {
                return true;
            }
            if (actionName.trim() === '') {
                return true;
            }

            if (this._getCurrentUserId().trim() === 'ADMIN') {
                return true;
            }
            var accessList = this._getAccessList();
            if (accessList) {
                for (var i = 0; i < accessList.length; i++) {
                    if (accessList[i] === actionName) {
                        return true;
                    }
                }
            }
            return false;
        },
        _getAccessList: function () {
            if (this._accessListCache) {
                return this._accessListCache.securedActions;
            }
            else {
                var accessList = this._getFromCache();
                if (accessList) {
                    return accessList.securedActions;
                }
            }
            return false;
        },
        _getFromCache: function () {
            var me = this;
            var currentUserId = this._getCurrentUserId();
            var rsData = this.getFromLocalStorage(this._nameSpace, this._nameSpace);
            if (rsData) {
                for (var i = 0; i < rsData.length; i++) {
                    if (rsData[i].userId === currentUserId) {
                        if (this._clearCache) {
                            this._clearCache = false;
                            rsData.splice(i, 1);
                        }
                        else {
                            this._accessListCache = rsData[i];
                            return rsData[i];
                        }
                    }
                }
            }
            this._loadUserAccessList(function (userData) {
                if (!rsData) {
                    rsData = [];
                }
                me._accessListCache = userData;
                rsData.push(userData);
                me.saveToLocalStorage(me._nameSpace, rsData, me._nameSpace);
            });
            return false;
        },
        _loadUserAccessList: function (callBack) {
            var request = new Sage.SData.Client.SDataServiceOperationRequest(Sage.Data.SDataServiceRegistry.getSDataService('system')) .setContractName('system') .setOperationName('getCurrentUser');
            request.execute({}, {

                success: function (data) {
                    if (callBack) {
                        callBack(data.response);
                    }
                    //console.warn('succsess role security');

                },
                failure: function (data) {
                    console.warn('Error reading request');
                    //console.log(data);
                },
                scope: this
            });

        }

    }); // end dojo declare

    /**
    * Make an instance of this service available to the 
    * Sage.Services.getService method.
    */
    if (!Sage.Services.hasService('RoleSecurityService')) {
        Sage.Services.addService('RoleSecurityService', new Sage.Services.RoleSecurityService());
    }

    return widget;
});