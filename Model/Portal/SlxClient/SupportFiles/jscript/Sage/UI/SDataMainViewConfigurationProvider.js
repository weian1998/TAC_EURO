/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'Sage/UI/ListPanel',
       'Sage/_ConfigurationProvider',
       'Sage/UI/TitleContentPane',
       'Sage/UI/DetailPanel',
       'Sage/UI/_DetailPanelConfigurationProvider',
       'dojo/_base/declare'
],
function (listPanel, _configurationProvider, titleContentPane, detailPanel, _detailPanelConfigurationProvider, declare) {
    var widget = declare('Sage.UI.SDataMainViewConfigurationProvider', [
            _configurationProvider,
            Sage.UI._TitlePaneConfigProvider,
            _detailPanelConfigurationProvider], 
        {
        // summary:
        //      Base class for classes that will act as a configuration provider to provide configurations for the list view, 
        //      detail view and the title pane.  This class mixes in Sage.UI._ListPanelConfigurationProvider,
        //      Sage.UI._TitlePaneConfigProvider and Sage.UI._DetailPanelConfigurationProvider.
            
        // entityType: string
        //      The name of the type of entity displayed in this "MainView".
        entityType: '',
        // service: object
        //      The SData Service used for SData data access
        service: null,
            
        // listPanelConfiguration: object
        //      The configuration object for the Sage.UI.ListPanel.  Do not access this property directly, use requestConfiguration() 
        //      and provide a callback instead.
        //      Example configuration object: { list: false, detail: false, summary: false, toolBar: false }
        listPanelConfiguration: false,

        constructor: function(definition) {
            this.listPanelConfiguration = this.listPanelConfiguration || {
                list: { },
                detail: false,
                summary: false
            };
            this.titlePaneConfiguration = this.titlePaneConfiguration || {
                tabs: false,
                menu: false,
                titleFmtString: '${0}'
            };            
            var eCtx = Sage.Services.getService('ClientEntityContext');
            if (eCtx) {
                eCtx.setContext({ EntityType : this.entityType });
            }
            var grpContextService = Sage.Services.getService('ClientGroupContext');
            if (grpContextService) {
                dojo.connect(grpContextService, 'onCurrentGroupChanged', this, 'handleProfileChanged');
            }
            if (Sage.Services.hasService('MainViewConfigurationProvider')) {
                Sage.Services.removeService('MainViewConfigurationProvider');
            }
        },
        handleProfileChanged: function(opt) {
            // summary:
            //      callback method for the onCurrentGroupChanged event of the ClientGroupContext service.  This fires
            //      the onConfigurationChange that the ListPanel listens for in order to refresh the list.
            this.onConfigurationChange(opt);
        },
        requestConfiguration: function(options) {
            // summary:
            //      returns the list panel configuration through the success callback method.  Override this method 
            //      to provide further logic in creating the list panel configuration before calling the success method.
            // options: object
            //      An object containing callback methods: 'success' and 'failure'.  The configuration object will be passed 
            //      as an argument to the success method.
            if (options.success && this.listPanelConfiguration) {
                options.success.call(options.scope || this, this.listPanelConfiguration, this);
            }
        }
    });

    return widget;
});

