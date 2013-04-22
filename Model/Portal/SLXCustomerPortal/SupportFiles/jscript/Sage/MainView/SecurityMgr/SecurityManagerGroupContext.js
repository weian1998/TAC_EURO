/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Groups/GroupContextService',
    'dojo/_base/declare'
],
function (groupContextService, declare) {
    var grpContext = declare('Sage.MainView.SecurityMgr.SecurityManagerGroupContext', groupContextService, {
        _currentContext: {},
        constructor: function () {
            dojo.mixin(this._currentContext, this._emptyContext);
        },
        getContext: function () {
            if (this._currentContext.CurrentGroupID === null) {
                this.requestContext();
            }
            return this._currentContext;
        },
        requestContext: function () {
            if (this._isRetrievingContext === true) {
                return;
            }
            this.setContext('PROF00000001', 'Read/Write Default');
            //            var userOptionsService = Sage.Services.getService('UserOptions');
            //            if (!userOptionsService) {
            //                
            //            }
            //ToDo:  call the useroptionsService to get the user option for this...
        },
        setContext: function (id, name) {
            this._currentContext.CurrentGroupID = id;
            this._currentContext.CurrentName = name;
            this._isRetrievingContext = false;
        },
        setCurrentGroup: function (id, name) {
            //ToDo:  call useroptions service to set the user option for this...
            this.setContext(id, name);
            this.onCurrentGroupChanged({ current: this._currentContext });
        }
    });
    return grpContext;
});