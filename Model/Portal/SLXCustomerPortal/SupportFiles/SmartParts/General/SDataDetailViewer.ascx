<%@ Control Language="C#" AutoEventWireup="true" CodeFile="SDataDetailViewer.ascx.cs" Inherits="SmartParts_General_SDataDetailViewer" %>

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

    require(['dojo/ready'], function(ready) {
        ready(function() {
            dojo.require('Sage.UI.SDataMainViewConfigurationProvider');
            dojo.require('Sage.Data.SingleEntrySDataStore');
            dojo.require('Sage.UI.DetailPanel');
            dojo.require('<%= MainViewDefinition %>');

            dojo.addOnLoad(function() {
                var configProvider = new <%= MainViewDefinition %>();
                
                var titlePane = dijit.byId('titlePane');
                if (titlePane) {
                    titlePane.set('configurationProvider', configProvider);
                }

                var panel = new Sage.UI.DetailPanel({
                    helpTopicName: '<%= HelpTopicName %>',
                    configurationProvider: configProvider,
                    id: 'detailPanel',
                    region: 'center'
                });

                var container = dijit.byId('centerContent'),
                    child = dijit.byId('mainContentDetails');
                if (container && child) {
                    container.removeChild(child);
                    container.addChild(panel);
                    container.layout();
                }
            });
        });
    });

</script>