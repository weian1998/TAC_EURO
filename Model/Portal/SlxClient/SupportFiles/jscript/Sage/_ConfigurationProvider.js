/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    var _configurationProvider = declare('Sage._ConfigurationProvider', null, {
        _connects: null,
        _subscribes: null,
        constructor: function (options) {
            dojo.mixin(this, options);

            this._connects = [];
            this._subscribes = [];
        },
        // todo: total hack for attribute support
        'set': function (name, value) {
            this['_' + name] = value;
        },
        'get': function (name) {
            return this['_' + name];
        },
        requestConfiguration: function (options) {
            // success: function(configuration, options, provider)
            // failure: function(result, options, provider)
        },
        onConfigurationChange: function () {
        },
        destroy: function () {
            dojo.forEach(this._connects, function (handle) {
                dojo.disconnect(handle);
            });

            dojo.forEach(this._subscribes, function (handle) {
                dojo.unsubscribe(handle);
            });

            this.uninitialize();
        },
        uninitialize: function () {

        }
    });

    var staticProvider = declare('Sage.StaticConfigurationProvider', [_configurationProvider], {
        createConfiguration: function () {
            var configuration = {};

            for (var name in this)
                if (this.hasOwnProperty(name) && !/^_/.test(name))
                    configuration[name] = this[name];

            return configuration;
        },
        requestConfiguration: function (options) {
            if (options.success)
                options.success.call(options.scope || this, this.createConfiguration(options), options, this);
        }
    });

    return _configurationProvider;
});