/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    var provider = declare('Sage.UI._TitlePaneConfigProvider', null, {
        // summary:
        //      Base class that can be mixed in to other classes wanting to provide configuration
        //      to the TitleContentPane

        // titlePaneConfiguration: object
        //      The configuration object for the Sage.UI.TitleContentPane.  Do not access this property directly, use requestTitlePaneConfiguration() 
        //      and provide a callback instead.  Classes deriving from this can set this property for returning to the TitleContentPane.
        //      Example configuration object: { tabs: { }, menu: { }, titleFmtString: "My Entity: ${0}" }
        titlePaneConfiguration: { menu: { }, tabs: { }, titleFmtString: '${0}'},

        requestTitlePaneConfiguration: function(options) {
            // summary:
            //      returns the configuration for the title pane area
            //      including the tabs, group menu and optionally, a format string for creating the title.
            // options: object
            //      An object containing callback methods: 'success' and 'failure'.  The configuration object will be passed 
            //      as an argument to the success method.
            if (options.success && this.titlePaneConfiguration) {
                options.success.call(options.scope || this, this.titlePaneConfiguration, this);
            }
        }
    });
    
    return provider;
});