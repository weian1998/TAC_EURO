<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SDataListViewer.ascx.cs" Inherits="SmartParts_General_SDataListViewer" %>


<style>
.listPanelToolbar
{
    height: 21px;
}
.rightTools
{
    text-align: right;
}
.leftTools
{
    text-align: left;
    z-index: 4;
}

</style>

<script type="text/javascript">

    require([
        'Sage/UI/ListPanel',
        'Sage/UI/SDataMainViewConfigurationProvider',
        'Sage/Data/SingleEntrySDataStore',
        'dojo/ready',
        '<%= MainViewDefinitionForwardSlash %>'
    ],
    function(
        listPanel,
        sdataMainViewConfigurationProvider,
        singleEntrySDataStore,
        ready,
        mainViewDefinition
    ) {
        ready(function() {
            var virdir = function () {
                var match = /^\/([^\/]+)\//.exec(location.pathname);
                return match ? match[1] : '';
            };
            dojo.addOnLoad(function () {

                var configProvider = new mainViewDefinition({
                detailConfiguration: <%= GetConfiguration(DetailsPaneConfigFile) %>,
                summaryOptions: <%= GetConfiguration(SummaryConfigFile) %>
               });          
       
               var panel = new listPanel({
                    id: 'list',
                    autoConfigure: false,
                    configurationProvider: configProvider,
                    detailType:  '<%= DetailPaneType %>', //'Sage.UI.SDataDetailPane',
                    detailVisible: ('<%= DetailPaneVisibleOnLoad %>' === 'True'),
                    detailStyle: 'height:<%= DetailPaneDefaultHeight %>px;border-top:solid #D5CDB5 1px',
                    helpTopicName: '<%= HelpTopicName %>',
                    region: 'center'
                });
                var titlePane = dijit.byId('titlePane');
                if (titlePane) {
                    titlePane.set('configurationProvider', configProvider);
                }
  
                var container = dijit.byId('centerContent'),
                    child = dijit.byId('mainContentDetails');
                if (container && child) {
                    container.removeChild(child);
                    container.addChild(panel);
                    container.layout();
                }
                panel.requestConfiguration();
            });

            dojo.declare('Sage.UI.SDataDetailPane', [Sage.UI._DetailPane, Sage._Templated], {
                service: null,
                store: null,
                _msgFmt: '<div style="font-size:110%;width:100%;height:150px;text-align:center;padding-top:60px;">${0}</div>',
                widgetTemplate: new Simplate([
                    '<div id="customDetailPane">',
                    '<div dojoAttachPoint="contentNode"></div>',
                    '</div>'
                ]),
                attributeMap: {
                    'content': { node: 'contentNode', type: 'innerHTML' }
                },
                _onSelected: function (index, row, grid) {
                    if (!this._configuration) {
                        return;
                    }
                    if ((typeof this._configuration.resourceKind !== 'string') || (!typeof this._configuration.predicateProperty)) {
                        this.showError('Sage.UI.SDataDetailPane requires resourceKind and predicateProperty configurations');
                        return;
                    }
                    this.set('content', dojo.string.substitute(this._msgFmt, [this._configuration.loadingMsg || 'Loading...']));

                    if (this.service === null) {
                        this.service = this._owner.configurationProvider.service;
                    }
                    var storeOptions = dojo.mixin({
                            service: this.service,
                            resourceKind: this._configuration.resourceKind
                        }, this._configuration.storeOptions || { });
                    if (this.store === null) {
                        this.store = new singleEntrySDataStore(storeOptions);
                    }
                    this.store.fetch({
                        predicate: row[this._configuration.predicateProperty || 'name'],
                        onComplete: this._receiveData,
                        onError: this._requestFailure,
                        scope: this
                    });
                },
                _receiveData: function (feed) {
                    if (typeof this.myContent !== 'undefined') {
                        this.myContent.destroy();
                    }
                    this.myContent = new this._configuration.contentType(dojo.mixin({ dataStore: this.store, id: 'myContent' }, feed));
                    dojo.place(this.myContent.domNode, this.contentNode, 'only');
                    this.myContent.startup();
                },
                _requestFailure: function (msg, options) {
                    this.showError(msg);
                },
                showError: function (errorMsg) {
                    this.set('content', dojo.string.substitute(this._msgFmt, [errorMsg]));
                }

            });
        });
    });


</script>