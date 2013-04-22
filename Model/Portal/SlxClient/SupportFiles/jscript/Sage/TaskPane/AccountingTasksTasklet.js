/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/TaskPane/_BaseTaskPaneTasklet',
        'Sage/UI/Dialogs',
        'dojo/i18n!./nls/AccountingTasksTasklet',
        'dojo/_base/declare'
],
function (_BaseTaskPaneTasklet, Dialogs, i18nStrings, declare) {
    var accountingTasksTasklet = declare('Sage.TaskPane.AccountingTasksTasklet', _BaseTaskPaneTasklet, {
        nlsAccountingResources: i18nStrings,
        linkAccount: function () {
            //if details mode just assume the current id, which will be handled by the user control
            if (Sage.Utility.getModeId() === 'detail') {
                return true;
            }
            var selectionInfo = this.getSelectionInfo();
            if (this.verifySingleSelection(selectionInfo)) {
                this.saveSelections(this.actionItem, selectionInfo);
                return true;
            }
            else {
                Dialogs.showInfo(this.selectSingleRecord, this.invalidSelectionTitle);
                return false;
            }
        },
        actionItem: function () {
            //Client-side actions
        },
        checkPrices: function () {
            if (Sage.Utility.getModeId() === 'detail') {
                return true;
            }
            var selectionInfo = this.getSelectionInfo();
            if (this.verifySingleSelection(selectionInfo)) {
                this.saveSelections(this.actionItem, selectionInfo);
            }
            else {
                Dialogs.showInfo(this.nlsAccountingResources.updatePricingRecords, this.invalidSelectionTitle);
                return false;
            }
        },
        submitSalesOrder: function () {
            if (Sage.Utility.getModeId() === 'detail') {
                return true;
            }
            var selectionInfo = this.getSelectionInfo();
            if (this.verifySingleSelection(selectionInfo)) {
                this.saveSelections(this.actionItem, selectionInfo);
            }
            else {
                Dialogs.showInfo(this.nlsAccountingResources.updatePricingRecords, this.invalidSelectionTitle);
                return false;
            }
        }
    });
    return accountingTasksTasklet;
});