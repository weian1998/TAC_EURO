/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'dijit/form/FilteringSelect',
        'dojox/grid/cells/dijit',
        'dojox/grid/cells/_base',
        'dojo/_base/declare',
        'dojo/_base/xhr',
        'dojo/ready',
        'dojo/data/ItemFileReadStore'
], function (_Widget, FilteringSelect, dijitCell, _baseCell, declare, xhr, ready, ItemFileReadStore) {
    var _userCache, widget;

    // hold userid -> name map
    _userCache = null;

    // TODO - Utility + User cache methods should be moved to a more generic place...
    var escapeHTML = (function () {
        var MAP = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&#34;',
            "'": '&#39;'
        };
        var repl = function (c) { return MAP[c]; };
        return function (s) {
            return s ? s.replace(/[&<>'"]/g, repl) : "";
        };
    })();

    function buildUserCache() {
        // summary:
        //  Populate _userCache object
        return xhr('GET', {
            url: "slxdata.ashx/slx/dynamic/-/users?select=Enabled&format=json",
            handleAs: "json",
            sync: true  // we have to do a sync call here, because the grid column needs to get HTML.
                        // but, most of the time this will be cached, so it should not be a big impact.
        }).then(function(data) {
            _userCache = {};
            for(var i=0; i < data.$resources.length; i++){
                var u = data.$resources[i];
                _userCache[u.$key] = {
                    enabled: u.Enabled,
                    name: u.$descriptor
                };
            }
        });
    }

    function getUserName (userid) {
        // summary:
        //  Retrieve user name for the given id.
        if(!_userCache){
            buildUserCache();            
        }
        var trimmed = userid.replace(/^\s+|\s+$/g, '') ;
        var u = _userCache[trimmed];            
        return u ? u.name : userid;
    }

    function getActiveUsers() {
        if(!_userCache)
            buildUserCache();
        var users = [];
        for(var userId in _userCache){
            var u = _userCache[userId];
            if(u.enabled){
                users.push({ name: u.name, id: userId });
            }
        }
        return users.sort(function(a,b) { 
            return a.name.localeCompare(b.name);
        });        
    }
    widget = declare("Sage.UI.Columns.SlxUser", dojox.grid.cells.Cell, {
        // summary: 
        //  User name display based on user id.
        //  Read-only at the moment.

        format: function (inRowIndex, inItem) {            
            if(inItem){
                var userId = inItem[this.field];
                // XXX this is using a synchronous retrieve
                // we should be able to return a deferred object from this function (see http://dojotoolkit.org/reference-guide/dojox/grid/DataGrid.html)
                var name = getUserName(userId);

                return escapeHTML(name);
            }
        }
    });

    // TODO: Is this even used?
    declare("Sage.UI.Columns.SlxUserFilter", _Widget, {
        // summary:
        //  Widget used for user filtering
        _select: null,  // select widget
        field: "",  // field being filtered

        postCreate: function() {
            // we do a "lazy" load for the widget, to avoid loading it whenever the page loads... since there is a good chance they may not actually 
            // use the filter
            // note, at the moment the filter creates all the widgets eagerly anyway, so it does not really make a difference...  but hopefully in the future it might.
            var self = this;

            var div = document.createElement("div");
            this.domNode.appendChild(div);
            ready(function() {
                var userStore = new ItemFileReadStore({
                    data: { items: getActiveUsers(), label: "name", identifier: "id" }
                });
                self._select = new FilteringSelect({
                    store: userStore, required: false
                }, div);
            });
        },

        // Filter API
        getQuery: function() {
            if(this._select){
                var v = this._select.get('value');
                console.log(v);
                if(v)
                    return this.field + " eq '" + v + "'";
            }
            return "";
        },

        reset: function() {
            if(this._select){
                this._select.set('value', null);
            }
        }
    });

    return widget;
});
