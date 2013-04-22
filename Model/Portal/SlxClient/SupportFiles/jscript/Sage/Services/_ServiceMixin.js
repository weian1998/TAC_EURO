/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/Data/SDataServiceRegistry',
    'dojo/_base/declare'
],
function (sDataServiceRegistry, declare) {
    var _serviceMixin = declare('Sage.Services._ServiceMixin', null, {
        serviceMap: null,
        constructor: function () {
            var map = this.serviceMap;
            if (map) {
                for (var property in map) {
                    if (this[property]) continue; /* skip any that were explicitly mixed in */

                    this[property] = this._resolveService(map[property]);
                }
            }
        },
        _resolveService: function (specification) {
            if (specification && specification.type === 'sdata')
                return sDataServiceRegistry.getSDataService(specification.name);

            return Sage.Services.getService(specification);
        }
    });
    return _serviceMixin;
});
