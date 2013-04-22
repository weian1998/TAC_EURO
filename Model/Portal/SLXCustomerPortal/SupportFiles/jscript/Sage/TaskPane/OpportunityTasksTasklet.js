/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/i18n!./nls/OpportunityTasksTasklet',
    'Sage/TaskPane/_BaseTaskPaneTasklet',
    'Sage/TaskPane/TaskPaneContent',
    'Sage/MainView/Opportunity/UpdateOpportunities',
    'Sage/MainView/Opportunity/OpportunityStatistics',
    'dojo/_base/declare'
],
function (i18nStrings, _BaseTaskPaneTasklet, TaskPaneContent, UpdateOpportunities, OpportunityStatistics, declare) {
    var opportunityTasksTasklet = declare('Sage.TaskPane.OpportunityTasksTasklet', [_BaseTaskPaneTasklet, TaskPaneContent], {
        updateOpportunitiesTitle: 'Update Opportunities',
        opportunityStatisticsTitle: 'Opportunity Statistics',
        taskItems: [],
        constructor: function () {
            dojo.mixin(this, i18nStrings);
            this.taskItems = [
                { taskId: 'UpdateOpportunities', type: "Link", displayName: this.updateOpportunitiesTitle, clientAction: 'opportunityTasksActions.updateOpportunities();',
                    securedAction: 'Entities/Opportunity/MultiUpdate'
                },
                { taskId: 'OpportunityStatistics', type: "Link", displayName: this.opportunityStatisticsTitle, clientAction: 'opportunityTasksActions.opportunityStatistics();',
                    securedAction: 'Entities/Opportunity/OpportunityStatistics'
                }
            ];
        },
        updateOpportunities: function () {
            this.prepareSelectedRecords(this.updateOpportunitiesActionItem(this.getSelectionInfo()));
        },
        updateOpportunitiesActionItem: function (selectionInfo) {
            return function () {
                var updateDialog = dijit.byId("dlgUpdateMultipleOpps");
                if (!updateDialog) {
                    updateDialog = new UpdateOpportunities(selectionInfo);
                } else {
                    updateDialog.setSelectionInfo(selectionInfo);
                }
                updateDialog.show();
            };
        },
        opportunityStatistics: function () {
            this.prepareSelectedRecords(this.opportunityStatisticsActionitem(this.getSelectionInfo()));
        },
        opportunityStatisticsActionitem: function (selectionInfo) {
            return function () {
                var dialog = new OpportunityStatistics(selectionInfo);
                dialog.show();
            };
        }
    });
    return opportunityTasksTasklet;
});