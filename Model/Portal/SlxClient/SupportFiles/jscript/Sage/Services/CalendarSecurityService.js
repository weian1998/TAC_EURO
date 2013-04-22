/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
    'Sage/Data/SDataServiceRegistry',
    'Sage/Utility',
    'dojo/_base/declare'
],
function (sDataServiceRegistry, utility, declare) {
    var service = declare('Sage.Services.CalendarSecurityService', null, {
        /*
        allowAdd : true,
        allowDelete: true,
        allowEdit: true,
        allowSync: true
        */
        _rawList: [],
        _accessList: {},
        _dataAvailable: false,
        constructor: function (opts) {
            this._dataAvailable = false;
            this._loading = false;
            //this._loadData();
        },
        _waiting: [],
        hasAccess: function (userid, accesslevel, callback, scope) {
            //console.log('hasAccess has been called... userid: ' + userid + '    accessLevel: ' + accesslevel + '    %o', scope);
            if (this._dataAvailable) {
                var item = this._accessList[userid];
                var access = false;
                if (item) {
                    access = item[accesslevel];
                }
                if (callback) {
                    callback.call(scope || this, access);
                }
            } else {
                //console.log('connecting to onDataAvailable...');
                this._waiting.push(dojo.connect(this, 'onDataAvailable', this, function () {
                    this.hasAccess(userid, accesslevel, callback, scope);
                }));
                if (!this._loading) {
                    this._loadData();
                }
            }
        },
        getListByAccessLevel: function (level, callback, scope, idAttr, nameAttr) {
            var idattr = idAttr || 'userid';
            var nameattr = nameAttr || 'name';
            if (this._dataAvailable) {
                var list = [];
                for (var i = 0; i < this._rawList.length; i++) {
                    var item = this._rawList[i];
                    if (level === "view" || item[level]) {
                        var obj = {};
                        obj[idattr] = item['accessUserId'];
                        obj[nameattr] = item['accessUserName'];
                        list.push(obj);
                    }
                }
                callback.call(scope || this, list);
            } else {
                this._waiting.push(dojo.connect(this, 'onDataAvailable', this, function () {
                    this.getListByAccessLevel(level, callback, scope, idAttr, nameAttr);
                }));
                if (!this._loading) {
                    this._loadData();
                }
            }
        },
        _loadData: function () {
            this._loading = true;
            var svc = sDataServiceRegistry.getSDataService('mashups', false, true, true); // cached one...
            //var svc = sDataServiceRegistry.getSDataService('mashups', false, true, false); // not cached one...
            var uid = utility.getClientContextByKey('userID') || '';
            var request = new Sage.SData.Client.SDataNamedQueryRequest(svc);
            request.setApplicationName('$app');
            request.setResourceKind('mashups');
            request.uri.setCollectionPredicate("'UserCalendarQueries'");
            request.setQueryName('execute');
            request.setQueryArg('_resultName', 'UserHasAccessToTheseCalendars');
            request.setQueryArg('_userId', uid);
            request.read({
                success: this._dataReceived,
                failure: function () { console.log('user calendar request failed... %o', arguments); },
                scope: this
            });
        },
        _dataReceived: function (data) {
            this._rawList = data['$resources'];
            for (var i = 0; i < this._rawList.length; i++) {
                var item = this._rawList[i];
                this._accessList[item['accessUserId']] = {
                    'name': item['accessUserName'],
                    'userid': item['accessUserId'],
                    'allowAdd': item['allowAdd'],
                    'allowDelete': item['allowDelete'],
                    'allowEdit': item['allowEdit'],
                    'allowSync': item['allowSync']
                };
            }
            this._dataAvailable = true;
            this._loading = false;
            //fire event for things that were waiting...
            this.onDataAvailable();
            //clean up waiting connections now that they have fired...
            console.log('cleaning up waiting list');
            for (var i = 0; i < this._waiting.length; i++) {
                dojo.disconnect(this._waiting[i]);
            }
            this._waiting = [];
        },
        onDataAvailable: function () { }
    });
    Sage.Services.addService('CalendarSecurityService', new service());
});