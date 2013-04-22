/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/ready',
        'dojo/aspect',
        'dijit/layout/TabContainer'
],
function (declare, ready, aspect, TabContainer) {
    //summary
    // Override of dijit layout TabContainer.
    var tabContainer = declare('Sage.Layout.TabContainer', [TabContainer], {
        region: 'center',
        destroyRecursive: function () {
            if (this.tablist) {
                this.tablist.destroy();
            }
            this.inherited(arguments);
        },
        postCreate: function () {
            aspect.after(this, 'startup', function () {
                // This is not a typo.  The dijit.layout.ContentPane is not affectively determining all of it's layout information
                // on the first pass through resize.  Calling resize twice effectively renders the TabContainer to fill it's container.
                var localTC = dijit.byId('tabContent');
                localTC.resize(); localTC.resize();
            });
        }
    });


    return tabContainer;
});