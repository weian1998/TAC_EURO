/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/i18n',
    'dijit/registry',
    'dijit/layout/BorderContainer',
    'dijit/Toolbar',
    'dijit/ToolbarSeparator',
    'Sage/_Templated',
    'Sage/UI/_DetailPanelConfigurationProvider'
], function (
    declare,
    lang,
    array,
    domConstruct,
    domClass,
    i18n,
    registry,
    BorderContainer,
    Toolbar,
    ToolbarSeparator,
    _Templated,
    _DetailPanelConfigurationProvider,
    undefined
) {
    return declare('Sage.UI.DetailPanel', [BorderContainer, _Templated], {        
        widgetsInTemplate: true,
        contentTemplate: new Simplate([
            '<div class="detail-panel-toolbar listPanelToolbar rightTools" data-dojo-type="dijit.Toolbar" style="{%= $.toolbarStyle %}" data-dojo-attach-point="_toolbar" data-dojo-props="region: \'top\', align: \'right\', splitter: false">',
            '<span data-dojo-type="dijit.ToolbarSeparator" data-dojo-attach-point="_buttonSeparator"></span>',
            '<div data-dojo-type="dijit.form.Button" data-dojo-attach-point="_helpButton" data-dojo-attach-event="onClick:showHelp" data-dojo-props="showLabel:true">{%= $.helpText %}</div>',
            '</div>'
        ]),

        helpText: 'Help',
        helpTopicName: 'detailview',
        toolbarStyle: '',
        toolbarActive: true,
        id: 'detailPanel',

        buildRendering: function() {
            this.inherited(arguments);

            domClass.add(this.domNode, 'detail-panel');
        },
        startup: function() {     
            this.inherited(arguments);

            this.requestConfiguration();
        },
        showHelp: function() {
            // summary:
            //      Shows the context sensitive help associated with this detail view.  Used
            //      as the callback method for the help button in the toolbar.
            Sage.Utility.openHelp(this.helpTopicName);
        },
        requestConfiguration: function() {
            // summary:
            //      requests the configuration from the provider.
            if (this.configurationProvider) {
                this.configurationProvider.requestDetailModeConfiguration({
                    scope: this,
                    success: this._applyConfiguration
                });
            }            
        },
        _applyConfiguration: function(configuration) {
            // summary:
            //      The callback method for receiving the configuration from the provider.
            //      Creates and starts the toolbar and content.
            this._configuration = configuration;

            this._configureToolbar(configuration);
            this._configureContent(configuration)                       
        },
        _configureContent: function(configuration) {
            var contentConfiguration = configuration && configuration.content;
            if (contentConfiguration) 
            {
                var widget = contentConfiguration;

                if (lang.isFunction(widget)) widget = widget.call(this, configuration, this);

                if (widget)
                {
                    if (this._content)
                    {
                        this.removeChild(this._content);

                        this._content.destroyRecursive();
                        this._content = null;
                    }

                    widget.set('region', 'center');                    

                    this._content = widget;

                    this.addChild(widget);
                    this.layout();
                }
            }
        },
        _configureToolbar: function(configuration) {
            if (this._toolbarApplied) return; /* temporary */

            var toolbarConfiguration = configuration && configuration.toolBar;            
            if (toolbarConfiguration === false)
            {
                if (this.toolbarActive) 
                {
                    this.removeChild(this._toolbar);
    
                    this.toolbarActive = false;
                }
            }
            else if (toolbarConfiguration)
            {
                if (!this.toolbarActive) 
                {
                    this.addChild(this._toolbar);

                    this.toolbarActive = true;
                }
                
                array.forEach(toolbarConfiguration.items, function(item, index) {
                    this._toolbar.addChild(new dijit.form.Button(item), index);                    
                }, this);
            }

            this._toolbarApplied = true;
        }
    });
});

