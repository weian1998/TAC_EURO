<%@ Control Language="C#" AutoEventWireup="true" CodeFile="ActivityFilters.ascx.cs" Inherits="SmartParts_TaskPane_ActivityFilters" %>

<div dojoType="Sage.UI.Filters.FilterPanel" id="PrimaryFilters" configurationProviderType="Sage.MainView.ActivityMgr.FilterConfigurationProvider"></div>

<script type="text/javascript">
    define("Sage/UI/DataStore/Filters", [
            "Sage/UI/Filters/FilterPanel",
            "Sage/MainView/ActivityMgr/FilterConfigurationProvider",
            "dojo/ready",
            "dojo/_base/connect",
            "dijit/registry"
        ],
        function (FilterPanel, FilterConfigurationProvider, ready, connect, registry) {
            ready(function () {
                connect.subscribe('/listView/refresh', function () {
                    var filterPanel = registry.byId("PrimaryFilters");
                    if (filterPanel) {
                        filterPanel.refreshFilters(true); //True means keep selections
                    }
                });
            });

            return {};
    });
</script>  