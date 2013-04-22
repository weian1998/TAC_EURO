/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dojox/layout/GridContainer',
       'dojo/_base/declare'
],
function (gridContainer, declare) {
    var container = declare("Sage.UI.GridContainer", gridContainer, {
        /**
        * The OOB dojox gridContainer class has a bug where this method
        * doesn't always get called with a manager object.
        * Create a new args object with the correct _dragManager.
        * @private
        */  

        _updateColumnsWidth: function (/*Object*/manager) {
            if (!manager) {            
                var newArgs = [];
                newArgs.push(this._dragManager);
                newArgs.callee = arguments.callee;
                this.inherited(newArgs);
            }
            else {
                this.inherited(arguments);
            }
        }
    });

    return container;
});

