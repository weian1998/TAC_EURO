<%@ Control Language="C#" AutoEventWireup="true" CodeFile="Filters.ascx.cs" Inherits="SmartParts_TaskPane_Filters" EnableViewState="false" ViewStateMode="Disabled" %>

<div dojoType="Sage.UI.Filters.FilterPanel" id="PrimaryFilters" configurationProviderType="Sage.UI.Filters.GroupFilterConfigurationProvider"></div>

<script type="text/javascript">
    define("Sage/UI/DataStore/Filters", [
            "Sage/UI/Filters/FilterPanel"
        ],
        function (FilterPanel) {
            return {};
    });
</script>