/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Data/SDataServiceRegistry',
    'dojo/_base/declare'
],
function (SDataServiceRegistry, declare) {
    /**
    * Append the UserOptions object to the Sage.Services namespace
    * Declare the UserOptions class and append its methods and properties
    * @constructor
    */
    var widget = declare('Sage.Services.UserOptions', null, {
        constructor: function (options) {
            this.inherited(arguments);
            dojo.mixin(this, options);
            if (!options || !options.service) {
                this.service = SDataServiceRegistry.getSDataService('system', false, true, true);
            }
        },
        get: function (name, category, callback, onError, scope, async) {
            var req = this._createRequest(name, category);

            if (typeof async === 'undefined') {
                async = true;
            }

            if (req) {
                req.read({
                    success: callback,
                    failure: function (response) {
                        console.warn('Error reading request');
                        console.log(response);
                        if (typeof onError === "function") {
                            onError(response);
                        }
                    },
                    scope: scope || this,
                    async: async
                });
            } else {
                console.warn('Unable to create SData request');
            }
        },
        set: function (name, category, newValue, _success, _failure, scope) {
            var req = this._createRequest(name, category);
            _failure = _failure || function (response) {
                console.warn('Error reading request');
                console.log(response);
            };
            if (req) {
                req.read({
                    success: dojo.hitch(req, function (response) {
                        response.value = newValue;
                        SDataServiceRegistry._removeFromLocalStorage("userOptions");
                        this.update(response, { success: _success, scope: this });
                    }),
                    failure: _failure,
                    scope: scope || this
                });
            }
        },
        getByCategory: function (category, callback, scope, onError) {
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(this.service);
            req.setResourceKind('userOptions');
            req.setQueryArg('where', 'category eq \'' + category + '\'');
            req.read({
                success: callback,
                failure: function (response) {
                    console.warn('Error reading user options request %o', response);
                    if (typeof onError === "function") {
                        onError(response);
                    }
                },
                scope: scope || this
            });
        },
        getByCategories: function (categories, callback, scope) {
            var req = new Sage.SData.Client.SDataResourceCollectionRequest(this.service);
            var strCategories = '';
            var strDel = ',';
            for (var i = 0; i < categories.length; i++) {
                if (i == categories.length - 1) {
                    strDel = '';
                }
                strCategories += '"' + categories[i] + '"' + strDel;
            }
            req.setResourceKind('userOptions');
            req.setQueryArg('where', 'category in (' + strCategories + ')');
            req.setQueryArg('count', '500');
            req.read({
                success: callback,
                failure: function (response) {
                    console.warn('Error reading user options request %o', response);
                },
                scope: scope || this
            });
        },
        _formatPredicate: function (n, c) {
            return dojo.string.substitute("category eq '${0}' and name eq '${1}'", [c, n]);
        },
        _createRequest: function (n, c) {
            var req = new Sage.SData.Client.SDataSingleResourceRequest(
					this.service);
            req.setResourceSelector(this._formatPredicate(n, c));
            req.setResourceKind('userOptions');
            // NOTE is there a need for a select query arg?
            return req;
        },
        _virtuald: function () {
            var match = /^\/([^\/]+)\//.exec(location.pathname);
            return match ? match[1] : '';
        }
    });
    /**
    * Make an instance of this service available to the 
    * Sage.Services.getService method.
    */
    Sage.Services.addService('UserOptions', new Sage.Services.UserOptions());

    //Backward compatibility mark as depricated...
    Sage.UserOptionsService = {
        getCommonOption: function (name, category, callback) {
            if (typeof console !== 'undefined') {
                console.warn(['DEPRECATED: Sage.UserOptionsService is deprecated.  ',
                'Use the UserOptions service instead.',
                'Change code like:',
                'Sage.UserOptionsService.getCommonOption(<option>, <category>, <callback>);',
                'to this: ',
                'var svc = Sage.Services.getService("UserOptions");',
                'if (svc) {',
                '	 svc.get(<option>, <category>, <callback>);',
                '}'].join('\n'));
            }
            var origCallback = callback;
            var svc = Sage.Services.getService('UserOptions');
            if (svc) {
                svc.get(name, category, function (option) {
                    var oldFmt = {
                        category: option.category,
                        option: option.name,
                        optionValue: option.value
                    };
                    if (origCallback) {
                        origCallback.call(window, oldFmt);
                    }
                });
            }
        },
        setCommonOption: function (name, category, data, callback) {
            if (typeof console !== 'undefined') {
                console.warn(['DEPRECATED: Sage.UserOptionsService is deprecated.  ',
                'Use the UserOptions service instead.',
                'Change code like:',
                'Sage.UserOptionsService.setCommonOption(<option>, <category>, <newValue>, <callback>);',
                'to this: ',
                'var svc = Sage.Services.getService("UserOptions");',
                'if (svc) {',
                '	 svc.set(<option>, <category>, <newValue>, <callback>);',
                '}'].join('\n'));
            }
            var svc = Sage.Services.getService('UserOptions');
            if (svc) {
                svc.set(name, category, data, callback);
            }
        }
    };

    return widget;
});


