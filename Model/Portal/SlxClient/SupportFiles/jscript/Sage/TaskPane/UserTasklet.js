/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/i18n!./nls/UserTasklet',
    'Sage/TaskPane/_BaseTaskPaneTasklet',
    'Sage/TaskPane/TaskPaneContent',
    'Sage/Utility',
    'dojo/_base/declare'
],
function (i18nStrings, _BaseTaskPaneTasklet, TaskPaneContent, Utility, declare) {
    var userTasklet = declare('Sage.TaskPane.UserTasklet', [_BaseTaskPaneTasklet, TaskPaneContent], {
        addToRoleTitle: 'Add to Role',
        resetUsersTitle: 'Reset Users',
        taskItems: [],
        constructor: function () {
            dojo.mixin(this, i18nStrings);
            this.taskItems = [
                { taskId: 'AddToRole', type: "Link", displayName: this.addToRoleTitle, clientAction: 'userTaskletActions.addUsersToRole();',
                    securedAction: 'Entities/User/Add'
                },
                { taskId: 'ResetUsers', type: "Link", displayName: this.resetUsersTitle, clientAction: 'userTaskletActions.resetUsers();',
                    securedAction: 'Entities/User/Add'
                }
            ];
        },
        resetUsers: function () {
            if (Utility.getModeId() === "detail") {
                this.onResetUsersClick();
            }
            else {
                this.prepareSelectedRecords(this.resetUsersAction(this));
            }
        },
        addUsersToRole: function () {
            if (Utility.getModeId() === "detail") {
                this.onAddUserClick();
            }
            else {
                this.prepareSelectedRecords(this.actionItem(this));
            }
        },
        actionItem: function (self) {
            return function () {
                self.onAddUserClick();
            };
        },
        resetUsersAction: function (self) {
            return function () {
                self.onResetUsersClick();
            };
        },
        onAddUserClick: function () {
            var addUser = dojo.byId([this.clientId, '_tskAddUserToRole'].join(''));
            if (addUser) {
                addUser.click();
            }
        },
        onResetUsersClick: function () {
            var resetUser = dojo.byId([this.clientId, '_tskResetUsers'].join(''));
            if (resetUser) {
                resetUser.click();
            }
        }

    });
    return userTasklet;
});