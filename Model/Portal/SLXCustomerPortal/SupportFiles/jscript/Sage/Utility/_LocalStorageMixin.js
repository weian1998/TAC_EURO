/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojox/storage/LocalStorageProvider'
], function (
        declare,
        LocalStorageProvider
) {
    return declare('Sage.Utility._LocalStorageMixin', null, {
        localStorageProvider: null,
        _setLocalStorageProviderAttr: function (provider) {
            this.localStorageProvider = provider;
        },
        _getLocalStorageProviderAttr: function () {
            this._ensureProvider();
            return this.localStorageProvider;
        },
        _ensureProvider: function () {
            var localStore;
            if (!this.localStorageProvider) {
                localStore = new LocalStorageProvider();
                localStore.initialize();
                this._setLocalStorageProviderAttr(localStore);
            }
        },
        saveToLocalStorage: function (key, value, ns) {
            var localStore = this._getLocalStorageProviderAttr(),
                validNS = ns,
                validKey = key;
            
            if (!localStore.isValidKey(key)) {
                //console.warn('Invalid key supplied to local storage provider. Key: ' + key);
                validKey = this._stripBadValues(key);
            }
            
            if (!localStore.isValidNamespace(ns)) {
                //console.warn('Invalid namespace supplied to local storage provider. Namespace: ' + ns);
                validNS = this._stripBadValues(ns);
            }
            
            localStore.put(validKey, value, function(status, key, message) {
                if(status === localStore.FAILED) {
                    console.error('Failed writing key: ' + key + ' in local storage. Message: ' + message);
                }
            }, validNS);


            // Update the modified_at flag for the item
            var mod = new Date(Date.now());
            localStore.put(validKey + '_modified_at', mod, function(status, key, message) {
                if(status === localStore.FAILED) {
                    console.error('Failed writing key: ' + key + ' in local storage. Message: ' + message);
                }
            }, validNS);

            // Update a modified_at flag so we know when the last time this namespace was updated 
            localStore.put('modified_at', mod, function(status, key, message) {
                if(status === localStore.FAILED) {
                    console.error('Failed writing key: ' + key + ' in local storage. Message: ' + message);
                }
            }, validNS);
        },
        getFromLocalStorage: function (key, ns) {
            var localStore = this._getLocalStorageProviderAttr(),
                validNS = ns,
                validKey = key;
                
            if (!localStore.isValidKey(key)) {
                //console.warn('Invalid key supplied to local storage provider. Key: ' + key);
                validKey = this._stripBadValues(key);
            }
            
            if (!localStore.isValidNamespace(ns)) {
                //console.warn('Invalid namespace supplied to local storage provider. Namespace: ' + ns);
                validNS = this._stripBadValues(ns);
            }
            
            return localStore.get(validKey, validNS);// returns null if key does not exist. 
        },
        getKeys: function (ns) {
            var localStore = this._getLocalStorageProviderAttr();
            return localStore.getKeys(ns);
        },
        clear: function (ns /* optional */) {
            var localStore = this._getLocalStorageProviderAttr();
            if (ns) {
                localStore.clear(ns);
            } else {
                localStore.clear();
            }
        },
        _stripBadValues: function (key) {
            // This is going to blow up for unicode.
            return key.replace(/[^A-Za-z0-9]/g, '-');
        }
    });
});