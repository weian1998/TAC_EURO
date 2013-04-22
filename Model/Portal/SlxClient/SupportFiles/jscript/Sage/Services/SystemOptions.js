/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Data/SDataServiceRegistry',
    'dojo/_base/declare'
],
function (sDataServiceRegistry, declare) {
    var svc = declare('Sage.Services.SystemOptions', null, {
        _systemOptions: false,
        _systemOptionsByName: false,
        notFoundrrorMsg: 'A system option was requested that cannot be found.',
        requestFailedErrorMsg: 'A request for system options has failed to return results.',
        get: function (optionName, callback, onError, scope) {
            if (!this._systemOptions) {
                var req = new Sage.SData.Client.SDataResourceCollectionRequest(sDataServiceRegistry.getSDataService('system', false, true, true));
                req.setResourceKind('systemoptions');
                req.read({
                    success: function (result) {
                        this._buildHash(result);
                        this._returnOption(optionName, callback, onError, scope);
                    },
                    failure: function (response) {
                        onError.call(scope || this, this.requestFailedErrorMsg);
                    },
                    scope: this
                });
            } else {
                this._returnOption(optionName, callback, onError, scope);
            }
        },
        _buildHash: function (results) {
            var items = results.$resources;
            this._systemOptionsByName = { };
            dojo.forEach(items, function (item) {
                this._systemOptionsByName[item.name] = item;
            }, this);
            this._systemOptions = results.$resources;
        },
        _returnOption: function (optionName, callback, onError, scope) {
            if (this._systemOptionsByName[optionName]) {
                callback.call(scope || this, this._systemOptionsByName[optionName].value);
            } else {
                onError.call(scope || this, this.notFoundrrorMsg);
            }
        }
    });
    /**
    * Add an instance of this service to the Sage.Services service collection.
    */
    Sage.Services.addService('SystemOptions', new Sage.Services.SystemOptions());
    return svc;
});