/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'Sage/UI/GroupListConfigurationProvider',
    'dojo/string',
    'dojo/_base/declare'
],
function (
    GroupListConfigurationProvider,
    string,
    declare
) {
    var dashboardGroupListConfigurationProvider = declare('Sage.UI.DashboardGroupListConfigurationProvider', [GroupListConfigurationProvider], {
        
        formatPredicate: function (group) {
            group.family = group.family && group.family.toUpperCase();
            return string.substitute("name eq '${name}' and upper(family) eq '${family}'", group);
        },
        _createConfigurationForList: function (entry) {
            var groupContextService = Sage.Services.getService("ClientGroupContext"),
                context;
            if (groupContextService) {
                context = groupContextService.getContext();
            }
            context.CurrentTable = '';
            return this.inherited(arguments);
        },
        _getListContextMenuItems: function() {
            return [];
        },
        _onListContext: function (e) {
            return;
        }
    });
    return dashboardGroupListConfigurationProvider;
});