/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'Sage/TaskPane/_BaseTaskPaneTasklet',
        'Sage/UI/Dialogs',
        'dojo/i18n!./nls/LiteratureManagementTasks',
        'dojo/_base/declare'
],
// ReSharper disable InconsistentNaming
function (_BaseTaskPaneTasklet, Dialogs, i18nStrings, declare) {
    // ReSharper restore InconsistentNaming
    var literatureManagementTasks = declare('Sage.TaskPane.LiteratureManagementTasks', _BaseTaskPaneTasklet, {
        nlsLitManagementResources: i18nStrings,
        selectionInfo: false,
        fulfillLiteratureTask: function () {
            this.selectionInfo = this.getSelectionInfo();
            if (this.verifySelection(this.selectionInfo)) {
                this.saveSelections(this.actionItem, this.selectionInfo);
                return this.doFulfillment();
            }
            else {
                Dialogs.showWarning(this.selectRecords, this.selectRecordsTitle);
                return false;
            }
        },
        validateLiteratureTask: function () {
            this.selectionInfo = this.getSelectionInfo();
            if (this.selectionInfo != null) {
                this.saveSelections(this.actionItem, this.selectionInfo);
                return true;
            }
            else {
                return false;
            }
        },
        doFulfillment: function () {
            var successCount = 0;
            var attemptCount = this.selectionInfo.selectionCount;
            var arrErrors = [];
            var arrFulfilledIds = [];
            var sId = dojo.string.substitute("${0}_hfLastFulfilledIds", [this.clientId]);
            var oLastFulfilledIds = $get(sId);

            if (oLastFulfilledIds) {
                oLastFulfilledIds.value = "";
            }

            var self = this;
            
            require(['Sage/MailMerge/Helper', 'Sage/MailMerge/Service'], function(Helper, DesktopService) {
                var oService = Helper.GetMailMergeService();
                var i;
                if (oService) {
                    for (i = 0; i < attemptCount; i++) {
                        var sError;
                        var sLitReqId = self.selectionInfo.selections[i].id;
                        var arrResult = oService.FulfillLitRequest(sLitReqId);
                        if (dojo.isArray(arrResult)) {
                            var bSuccess = arrResult[LitReqResult.lrSuccess];
                            if (bSuccess) {
                                successCount++;
                                arrFulfilledIds.push(sLitReqId);
                                continue;
                            }
                            var bCanceled = arrResult[LitReqResult.lrCanceled];
                            if (bCanceled)
                                sError = dojo.string.substitute(self.nlsLitManagementResources.errFulFillmentCancelled, [sLitReqId]);
                            else {
                                sError = dojo.string.substitute(self.nlsLitManagementResources.errFulFillmentFailed, [sLitReqId]);
                                sError += dojo.string.substitute(" ${0}", [arrResult[LitReqResult.lrError]]);
                            }
                        } else {
                            sError = dojo.string.substitute(self.nlsLitManagementResources.errFulFillmentFailed, [sLitReqId]);
                        }
                        if (sError == "") {
                            sError = dojo.string.substitute(self.nlsLitManagementResources.errFulFillmentFailed, [sLitReqId]);
                        }
                        arrErrors.push(sError);
                    }
                } else {
                    Dialogs.showError(self.nlsLitManagementResources.errMailMergeService);
                    return false;
                }

                if (oLastFulfilledIds) {
                    oLastFulfilledIds.value = arrFulfilledIds.join();
                }

                if (successCount == attemptCount) {
                    Dialogs.showInfo(self.nlsLitManagementResources.fulFillmentSuccess);
                    return true;
                } else {
                    var sErrorMsg = self.nlsLitManagementResources.errFulFillmentRequest;
                    if (dojo.isArray(arrErrors) && arrErrors.length > 0) {
                        sErrorMsg = self.nlsLitManagementResources.errFulFillmentRequestEx;
                        for (i = 0; i < arrErrors.length; i++) {
                            sErrorMsg += dojo.string.substitute(" [${0}] ${1}", i + 1, [arrErrors[i]]);
                        }
                    }
                    Dialogs.showError(sErrorMsg);
                    return false;
                }
            });
        },
        refreshList: function () {
            var panel = dijit.byId('list');
            if (panel) {
                panel.refreshGrid();
            }
        },
        printLabels: function (pluginId, contactIdList) {
            require(["Sage/Reporting/Service"], function (ReportingService) {
                dojo.ready(function () {
                    if (Sage.Services.hasService("ReportingService")) {
                        var oReportingService = Sage.Services.getService("ReportingService");
                        if (oReportingService.checkReporting(true)) {
                            oReportingService.showReport(pluginId, "CONTACT", contactIdList);
                        }
                    }
                });
            });
        },
        actionItem: function () {
            // Some client-side action required for LitComplete
        }
    });
    return literatureManagementTasks;
});