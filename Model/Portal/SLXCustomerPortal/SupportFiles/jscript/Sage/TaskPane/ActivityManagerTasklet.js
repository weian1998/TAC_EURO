/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dijit/_Widget',
        'dijit/_Container',
        'Sage/_Templated',
        'Sage/Services/_ServiceMixin',
        'Sage/UI/Dialogs',
        'Sage/Services/ActivityService',
        'dojo/_base/declare'
],

function (
   _Widget,
   _Container,
   _Templated,
   _ServiceMixin,
   Dialogs,
   ActivityService,
   declare
) {
    var activityManagerTasklet = declare('Sage.TaskPane.ActivityManagerTasklet', [_Widget, _Container, _ServiceMixin, _Templated], {
        serviceMap: {
            'groupContextService': 'ClientGroupContext',
            'metaDataService': { type: 'sdata', name: 'metadata' }
        },

        widgetsInTemplate: false,
        widgetTemplate: new Simplate([
             '<div class="activityTask-panel"  dojoAttachPoint="containerNode">',
            '</div>'
        ]),
        _configuration: null,
        _configurationConnects: null,
        _configurationProvider: null,
        _configurationProviderType: null,
        _appliedSet: null,
        configurationProvider: null,
        configurationProviderType: null,
        autoConfigure: true,
        taskGroup: 'default',
        paneContents: null,
        constructor: function () {


        },
        postCreate: function () {

            this.inherited(arguments);

            if (!this._configurationProvider && this._configurationProviderType)
                this.set('configurationProvider', new this._configurationProviderType());

            if (this.autoConfigure) this.requestConfiguration();
        },
        uninitialize: function () {
            this.inherited(arguments);

            if (this._configurationProvider) this._configurationProvider.destroy();
        },

        _handleConfigurationChange: function () {
            this.requestConfiguration();
        },
        _setConfigurationProviderAttr: function (configurationProvider) {
            if (this._configurationConnects) {
                dojo.forEach(this._configurationConnects, function (connection) {
                    this.disconnect(connection);
                }, this);
            }

            if (this._configurationProvider && this._configurationProvider !== value) this._configurationProvider.destroy();

            this._configurationProvider = configurationProvider;
            this._configurationConnects = [];

            if (this._configurationProvider) {
                this._configurationConnects.push(this.connect(this._configurationProvider, 'onConfigurationChange', this._handleConfigurationChange));

                this._configurationProvider.set('owner', this);

                // only request configuration here if the widget has been fully created, otherwise
                // it will be handled by postCreate.
                if (this._created)
                    if (this.autoConfigure)
                        this.requestConfiguration();
            }
        },
        _getConfigurationProviderAttr: function () {
            return this._configurationProvider;
        },
        _setConfigurationProviderTypeAttr: function (value) {
            this._configurationProviderType = value;
        },
        _getConfigurationProviderTypeAttr: function () {
            return this._configurationProviderType;
        },
        requestConfiguration: function () {
            if (this._configurationProvider) {
                this._configurationProvider.requestConfiguration({
                    success: dojo.hitch(this, this._applyConfiguration)
                });
            }
        },
        _applyConfiguration: function (configuration) {
            this._configuration = configuration;

            if (!this._configuration) {
                return;
            }
            if (this.paneContents) {
                this.paneContents.destroyRecursive();
            }


            dojo.place(this._configuration.taskPane.domNode, this.containerNode, 'only');
            this.paneContents = this._configuration.taskPane;

        }

    });

    return activityManagerTasklet;

});    

