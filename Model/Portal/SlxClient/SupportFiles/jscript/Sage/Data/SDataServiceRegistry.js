/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define, sessionStorage */
define(['Sage/Utility', 'dojo/json'],
function (Utility, json) {
    var _services = {},
    _defaultService = false;

    Sage.namespace('Data.SDataServiceRegistry');
    Sage.Data.SDataServiceRegistry = {
        registerService: function (name, s, o) {
            o = o || {};
            var service = s instanceof Sage.SData.Client.SDataService ?
                s : new Sage.SData.Client.SDataService(s);

            _services[name] = service;

            if (o.isDefault || !_defaultService) {
                _defaultService = service;
            }
            return service;
        },
        hasService: function (name) {
            return (typeof _services[name] !== 'undefined');
        },
        getService: function (name) {
            if (typeof name === 'string' && _services[name]) {
                return _services[name];
            }
            return _defaultService;
        },
        _createCacheKey: function (request) {
            var key = request.build();
            key = key.replace(/[^a-zA-Z0-9_]/g, '');
            var ns = request.getResourceKind().text;
            key = ns + "_" + key;
            return key;
        },
        _loadSDataRequest: function (request, o) {
            /// <param name="request" type="Sage.SData.Client.SDataBaseRequest" />
            var key = this._createCacheKey(request);
            var feed = this._getFromLocalStorage(key);
            if (feed) {
                o.result = feed;
                // o.result = dojo.toJson(feed);
            }
        },
        _cacheSDataRequest: function (request, o, feed) {
            /* todo: decide how to handle PUT/POST/DELETE */
            if (/get/i.test(o.method) && typeof feed === 'object') {
                var key = this._createCacheKey(request);
                this._saveToLocalStorage(key, feed);
                // this._saveToLocalStorage(key, dojo.fromJson(feed));
            }
        },
        _saveToLocalStorage: function (key, value) {
            sessionStorage.setItem(key, json.stringify(value));
        },
        _getFromLocalStorage: function (key) {
            return json.parse(sessionStorage.getItem(key));
        },
        _removeFromLocalStorage: function (resourceKind) {
            var keysCount = sessionStorage.length;
            var keys = [];
            for (var i = 0; i < keysCount; i++) {
                var key = sessionStorage.key(i);
                if (key.indexOf(resourceKind) > -1) {
                    keys.push(key);
                }
            }
            for (var j = 0; j < keys.length; j++) {
                sessionStorage.removeItem(keys[j]);
            }
        },
        getSDataService: function (contract, keepUnique, useJson, cacheResult) {
            // Returns the instance of the service for the specific contract requested.
            // For example, if the data source needs an SData service for the dynamic or system feeds,
            // the code would pass 'dynamic' or 'system' to this method.
            // Proxy datastore needs to always keep it's own unique instance of the service.
            // cacheResult uses a service with overridden beforerequest and requestcomplete methods
            keepUnique = contract === 'proxy' ? true : keepUnique;
            contract = contract || 'dynamic';
            var svcKey = "SDataService_" + contract;
            //Create a SDataService that caches its results
            svcKey = cacheResult ? [svcKey, '_cacheResult'].join('') : svcKey;

            if (this.hasService(svcKey) && !keepUnique) {
                return this.getService(svcKey);
            }

            var bJson = true;
            if (typeof useJson === 'boolean') {
                bJson = useJson;
            }

            var svc = new Sage.SData.Client.SDataService({
                serverName: window.location.hostname,
                virtualDirectory: Sage.Utility.getVirtualDirectoryName() + '/slxdata.ashx',
                applicationName: 'slx',
                contractName: contract,
                port: window.location.port && window.location.port !== 80 ? window.location.port : false,
                protocol: /https/i.test(window.location.protocol) ? 'https' : false,
                json: bJson
            });

            if (cacheResult) {
                svc.on('beforerequest', this._loadSDataRequest, this);
                svc.on('requestcomplete', this._cacheSDataRequest, this);
            }

            if (!keepUnique) {
                this.registerService(svcKey, svc);
                //  Sage.Services.registerService(svcKey, svc);
            }
            return svc;
        }
    };
    return Sage.Data.SDataServiceRegistry;
});
/*
 *Usage:
(function() {
     var virdir = function() {
        var match = /^\/([^\/]+)\//.exec(location.pathname);               
        return match ? match[1] : '';
    }; 
    
     Sage.Data.SDataServiceRegistry.registerService('dynamic', {
           serverName: window.location.hostname,
           virtualDirectory: virdir() + '/slxdata.ashx',
           applicationName: 'slx',
           contractName: 'dynamic',
           port: window.location.port && window.location.port != 80 ? window.location.port : false,
           protocol: /https/i.test(window.location.protocol) ? 'https' : false
     }, { isDefault: true});
    
     Sage.Data.SDataServiceRegistry.registerService('system', {
           serverName: window.location.hostname,
           virtualDirectory: virdir() + '/slxdata.ashx',
           applicationName: 'slx',
           contractName: 'system',
           port: window.location.port && window.location.port != 80 ? window.location.port : false,
           protocol: /https/i.test(window.location.protocol) ? 'https' : false
     }); 
})();
 
*in code 
returns the 'dynamic' service since it's the default 
Sage.Data.SDataServiceRegistry.getService();
 
*returns the 'system' service since it was explicitly selected 
Sage.Data.SDataServiceRegistry.getService('system');
 
*returns the 'dynamic' service since it was explicitly selected 
Sage.Data.SDataServiceRegistry.getService('dynamic');
 
*in customizations, 3rd party developers could register their own services 
Sage.Data.SDataServiceRegistry.registerService('sage50', {
     serverName: 'ec2-67-202-57-59.compute-1.amazonaws.com',
     virtualDirectory: 'sage50',
     applicationName: 'accounts50',
     contractName: 'gcrm',
     port: 80,
     protocol: /https/i.test(window.location.protocol) ? 'https' : false,
     userName: 'manager',
     password: '',
     version: { major: 0, minor: 9 }
}); 
 
*and use them* 
Sage.Data.SDataServiceRegistry.getService('sage50');
 
*this is probably best used with a mixin* 
define(['Sage.Data.SDataServiceRegistry', 'dojo/_base/declare'], 
function(sDataServiceRegistry, declare) {
     var _sDataServiceAware = declare('Sage.UI._SDataServiceAware', null, {
           serviceName: false,
           getService: function() {
                sDataServiceRegistry.getService(this.serviceName)
           }
     });
     return _sDataServiceAware;
});
 
any widget that mixes in that class can specify a 'serviceName' property as 
part of their prototype, or in their constructor, or passed in via constructor 
options, or even assigned later on.  if no name is specified, it just gets the default service, if one was registered    
*/
