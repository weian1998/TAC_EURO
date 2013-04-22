/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
       'dijit/_Widget',
       'dijit/_TemplatedMixin',
       'dojo/_base/declare'
],
function (_Widget, _TemplatedMixin, declare) {
    var taskPaneItem = declare("Sage.TaskPane.TaskPaneItem", [_Widget, _TemplatedMixin], {
        securedAction: '',
        linkText: '',
        confirmMsg: '',
        clientAction: '',
        serverAction: '',
        currentActionIndex: -1,
        actions: [],
        selectedItemList: {},
        action: '',
        type: '',
        postCreate: function (options) {
            this.checkSecurityAccess();
        },
        templateString: '<a dojoAttachPoint="linkTextNode" href="#"></a>',
        attributeMap: dojo.delegate(_Widget.prototype.attributeMap, {
            linkText: { node: 'linkTextNode', type: 'innerHTML' },
            action: { node: 'linkTextNode', type: 'attribute', attribute: 'href' }
        }),
        // this section relates to processing the link
        setActionList: function () {
            this.actions.push(this.startConfirm);
            this.actions.push(this.startGetSelectedItems);
            this.actions.push(this.startClientAction);
            this.actions.push(this.startServerAction);
        },
        doNextAction: function () {
            this.currentActionIndex++;
            this.actions[this.currentActionIndex].call();
        },
        startConfirm: function () {
            var confirmResp = true;
            if (this.confirmMsg) {
                confirmResp = confirm(this.confirmMsg); // returns bool
            }
            this.processConfirmResult(confirmResp);
        },
        processConfirmResult: function (result) {
            if (result === true) {
                this.doNextAction();
            }
        },
        startClientAction: function () {
            var result = true;
            if (this.clientAction) {
                if (typeof (this.clientAction) === "function") {
                    result = this.clientAction.call();
                }
            }
            this.processClientActionResult(result);
        },
        processClientActionResult: function (result) {
            this.doNextAction();
        },
        startServerAction: function () {
            if (this.serverAction) {
                if (this.selectedItemList.length > 0) {
                    __doPostBack(this.serverAction, this.selectedItemList);
                }
            }
        },
        startGetSelectedItems: function () {
            var options = { key: 'selectAll' };
            var selectionService = Sage.Services.getService('SelectionContextService');
            if (selectionService) {
                selectionService.getSelectedIds(options, this.processGetSelectedItemsResult);
            }
        },
        processGetSelectedItemsResult: function (result) {
            this.selectedItemList = result;
            this.doNextAction();
        },
        // this section relates to showing the link
        getCurrentUserId: function () {
            var userid = '';
            var clientContextSvc = Sage.Services.getService('ClientContextService');
            if (clientContextSvc) {
                userid = clientContextSvc.getValue('userID');
            }
            return userid;
        },
        checkSecurityAccess: function () {
            var displayMode = "none";
            if (this.securedAction.length > 0) {
                var roleSecuritySvc = Sage.Services.getService('RoleSecurityService');
                roleSecuritySvc.hasAccess(this.securedAction, function (callbackResult) {
                    if (callbackResult) {
                        displayMode = "inline";
                    }
                });
            }
            dojo.style(this.domNode, { "display": displayMode });
        }
    });
    return taskPaneItem;
});