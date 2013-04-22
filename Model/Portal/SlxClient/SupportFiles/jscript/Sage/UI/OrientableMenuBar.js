/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/MenuBar',
    'dojo/_base/declare'
], function (MenuBar, declare) {
    var orientableMenuBar = declare('Sage.UI.OrientableMenuBar', MenuBar, {
        postCreate: function (args) {
            this.inherited(arguments);
            //the private _orient property is set internally in the postCreate method
            //by waiting until now, we can override it if an orientation was passed to the constructor
            if (typeof this.orientation !== 'undefined') {
                this._orient = this.orientation;
            }
        }
    });
    return orientableMenuBar;
});