/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    var configProvider = declare('Sage.UI._DetailPanelConfigurationProvider', null, {
        // summary:
        //      Base class for classes that will act as a configuration provider for a Sage.UI.DetailPanel.

        // detailModeConfiguration: object
        //      The configuration object for the Sage.UI.DetailPanel.  Do not access this property directly, use requestDetailModeConfiguration() 
        //      and provide a callback instead.  Classes deriving from this can set this property for returning to the DetailPanel
        //      Example configuration object: { toolBar: false, contentType: typename, <other configuration options for constructor of the object defined by contentType> }
        detailModeConfiguration: false,        
        
        constructor: function(options) {
            dojo.mixin(this, options);
        },
        requestDetailModeConfiguration: function(options) {
            // summary:
            //      returns the configuration for the detail panel.
            // options: object
            //      An object containing callback methods: 'success' and 'failure'.  The configuration object will be passed 
            //      as an argument to the success method.
            if (options.success && this.detailModeConfiguration) {
                options.success.call(options.scope || this, this.detailModeConfiguration, this);
            }
        }
    });
    
    return configProvider;
});