/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/i18n!./nls/SecuredActionTasklet',
    'Sage/TaskPane/_BaseTaskPaneTasklet',
    'Sage/TaskPane/TaskPaneContent',
    'Sage/Utility',
    'dojo/_base/declare'
],
function (i18nStrings, _BaseTaskPaneTasklet, TaskPaneContent, Utility, declare) {
    var securedActionTasklet = declare('Sage.TaskPane.SecuredActionTasklet', [_BaseTaskPaneTasklet, TaskPaneContent], {
        addToRoleTitle: 'Add To Role',
        taskItems: [],
        constructor: function () {
            dojo.mixin(this, i18nStrings);
            this.taskItems = [
                { taskId: 'AddToRole', type: "Link", displayName: this.addToRoleTitle, clientAction: 'securedActionTaskletActions.addSecuredActionToRole();',
                    securedAction: 'Entities/SecuredAction/Add'
                }
            ];
        },
        addSecuredActionToRole: function () {
            if (Utility.getModeId() === "detail") {
                dojo.byId([this.clientId, '_tskAddSecuredActionsToRole'].join('')).click();
            }
            else {
                this.prepareSelectedRecords(this.actionItem(this));
            }
        },
        actionItem: function (self) {
            return function() {
                dojo.byId([self.clientId, '_tskAddSecuredActionsToRole'].join('')).click();
            };
        }
    });
    return securedActionTasklet;
});