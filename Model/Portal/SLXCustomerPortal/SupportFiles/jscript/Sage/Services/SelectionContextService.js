/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    var widget = declare('Sage.Services.SelectionContextService', null, {
        _url: '',
        constructor: function() {
            this._url = "slxdata.ashx/slx/crm/-/SelectionService"; 
        },
        getSelectionInfo: function(key, callback) {
            if (typeof key === "undefined" || key == null)
                key = '';
            dojo.xhrGet({
                url: this._url,
                handleAs: 'json',
                load: function (data) {
                    callback(data);
                },
                error: function (request, status, error) {
                }
            });
        }, 
        getSelectedIds: function(options, callback) {
            if (typeof options === "undefined" || options == null)
                key = '';
            dojo.xhrGet({
                url:  this._url,
                handleAs: 'json',
                load: function(data) { 
                    callback(data);
                },
                error: function(request, status, error) { 
                }
            });
        },
        setSelectionContext: function(key, selectionInfo, callback) {
            dojo.xhrPost({
                url : dojo.string.substitute("${0}/SetSelectionContext?key=${1}", [this._url, key]),
                handleAs: 'json',
                load:  function(data) { 
                    callback(data);
                },
                error:function(request, status, error) { 
                    callback(error);
                },
                postData: dojo.toJson(selectionInfo)
            }); 
        }
    });

    Sage.Services.addService("SelectionContextService", new Sage.Services.SelectionContextService());

    return widget;
});