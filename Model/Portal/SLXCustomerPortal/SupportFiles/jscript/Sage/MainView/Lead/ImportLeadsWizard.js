/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
        'dojo/_base/declare',
        'dojo/i18n!./nls/ImportLeadsWizard',
        'Sage/UI/Controls/_DialogHelpIconMixin',
        'dojo/_base/lang',
        'dijit/Dialog',
        'dijit/_Widget',
        'Sage/_Templated',
        'Sage/UI/Dialogs',
        'dojo/text!./templates/ImportLeadsProgressDisplay.html',
        'dijit/ProgressBar',
        'dojo/string',
        'dijit/form/Form',
        'dijit/layout/ContentPane',
        'dojox/layout/TableContainer'
],
function (declare, i18nStrings, _DialogHelpIconMixin, dojoLang, dijitDialog, _Widget, _Templated, Dialogs, importLeadsProgressDisplay, ProgressBar, dojoString) {
    var importLeadsWizard = declare('Sage.MainView.Lead.ImportLeadsWizard', [_Widget, _Templated], {
        importHistoryId: '',
        startProcessCtrlId: '',
        isActualImport: true,
        widgetsInTemplate: true,
        progressBar: '',
        widgetTemplate: new Simplate(eval(importLeadsProgressDisplay)),
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        onAddHocGroupChecked: function (groupOptionsId, chkAddToGroupId) {
            var addToGroup = dojo.byId(chkAddToGroupId);
            if (addToGroup) {
                var value = addToGroup.checked;
                var groupOptions = dojo.byId(groupOptionsId);
                if (value) {
                    dojo.style(groupOptions, 'display', '');
                }
                else {
                    dojo.style(groupOptions, 'display', 'none');
                }
            }
        },
        onGridViewRowSelected: function (rowIdx, grdCtrlId, rowIdxCtrlId) {
            var gridViewCtl = dojo.byId(grdCtrlId);
            var idxCtrl = dojo.byId(rowIdxCtrlId);
            var selRow = this.getSelectedRow(idxCtrl.value, gridViewCtl);
            if (selRow) {
                selRow.style.backgroundColor = '#ffffff';
            }

            selRow = this.getSelectedRow(rowIdx, gridViewCtl);
            if (null !== selRow) {
                idxCtrl.value = rowIdx;
                selRow.style.backgroundColor = '#E3F2FF';
            }
        },
        getSelectedRow: function (rowIdx, gridViewCtl) {
            if (gridViewCtl) {
                return gridViewCtl.rows[rowIdx];
            }
            return null;
        },
        enableDisableControl: function (control, value) {
            if (control !== null) {
                control.disabled = value;
            }
        },
        showImportProcess: function (startProcessCtrlId) {
            this.isActualImport = true;
            this.startProcessCtrlId = startProcessCtrlId;
            this.showProcess();
        },
        showTestImportProcess: function (startProcessCtrlId) {
            this.isActualImport = false;
            this.startProcessCtrlId = startProcessCtrlId;
            this.showProcess();
        },
        showProcess: function () {
            this.clearResults();
            this._dialog.show();
            var self = this;
            setTimeout(function () { self.getImportHistory(); }, 1000);
        },
        setDisplayProperty: function (property, display) {
            if (property && display) {
                dojo.removeClass(property, "display-none");
            }
            else if (property) {
                dojo.addClass(property, "display-none");
            }
        },
        getImportHistory: function () {
            if (this.importHistoryId === '') {
                this.invokeClickEvent(dojo.byId(this.startProcessCtrlId));
                var contextService = Sage.Services.getService("ClientContextService");
                if ((contextService) && (contextService.containsKey("ImportHistoryId"))) {
                    this.importHistoryId = contextService.getValue("ImportHistoryId");
                }
            }
            if (this.importHistoryId != '') {
                var select = "select=ImportNumber,Status,RecordCount,ProcessedCount,DuplicateCount,ErrorCount,WarningCount";
                var self = this;
                var sUrl = dojoString.substitute("slxdata.ashx/slx/dynamic/-/importHistory('${0}')?${1}&format=json", [this.importHistoryId, select]);
                dojo.xhrGet({
                    cache: false,
                    preventCache: true,
                    handleAs: 'json',
                    url: sUrl,
                    load: function (importHistory) {
                        self.updateProgress(importHistory);
                    },
                    data: {},
                    error: function (request, status, error) {
                        Dialogs.showError(this.errorRequestImportHistory);
                    }
                });
            }
        },
        updateProgress: function (importHistory) {
            if (importHistory != null) {
                var self = this;
                if (importHistory.ProcessedCount > 0) {
                    this.processedCount.set('value', importHistory.ProcessedCount);
                    this.duplicatesCount.set('value', importHistory.DuplicateCount);
                    this.duplicateRate.focusNode.set('value', importHistory.DuplicateCount / importHistory.RecordCount);
                    this.errorsCount.set('value', importHistory.ErrorCount);
                    if (!this.progressBar) {
                        this.setDisplayProperty(this.lblProcessingLabelContainer, false);
                        this.progressBar = new ProgressBar({
                            id: 'importTestProgressBar',
                            maximum: importHistory.RecordCount
                        });
                        dojo.place(this.progressBar.domNode, this.importTestProgressBarContainer, 'only');
                        this.importHistoryLink.href = dojoString.substitute('ImportHistory.aspx?entityid=${0}&modeid=Detail', [this.importHistoryId]);
                        this.importHistoryLink.text = importHistory.ImportNumber;
                        this.setDisplayProperty(this.importHistoryLinkContainer, this.isActualImport);
                    }
                    this.progressBar.set('value', this.processedCount.value % 100);
                }
                if (importHistory.Status === this.importStatusProcessing) {
                    setTimeout(function () { self.getImportHistory(); }, 500);
                }
                else if (importHistory.Status === this.importStatusCompleted) {
                    this.progressBar.set('value', this.progressBar.maximum % 100);
                    this.setDisplayProperty(this.btn_Cancel.domNode, false);
                    if (!this.isActualImport) {
                        this.deleteImportHistory();
                    }
                }
            }
        },
        deleteImportHistory: function () {
            var sUrl = dojoString.substitute("slxdata.ashx/slx/dynamic/-/importHistory('${0}')", [this.importHistoryId]);
            dojo.xhrDelete({
                handleAs: 'json',
                url: sUrl,
                error: function (request, status, error) {
                }
            });
        },
        invokeClickEvent: function (control) {
            if (dojo.isIE) {
                control.click();
            } else {
                var e = document.createEvent("MouseEvents");
                e.initEvent("click", true, true);
                control.dispatchEvent(e);
            }
        },
        clearResults: function () {
            this.setDisplayProperty(this.btn_Cancel.domNode, this.isActualImport);
            this.setDisplayProperty(this.importHistoryLinkContainer, false);
            this.processedCount.set('value', this.calculatingText);
            this.duplicatesCount.set('value', this.calculatingText);
            this.duplicateRate.focusNode.set('value', 0);
            this.errorsCount.set('value', this.calculatingText);
        },
        _cancel: function () {
            this.abortImport();
            this._close();
        },
        abortImport: function () {
            var service = Sage.Data.SDataServiceRegistry.getSDataService('dynamic', false, true, true);
            var request = new Sage.SData.Client.SDataSingleResourceRequest(service);
            request.setResourceSelector(dojo.string.substitute("'${0}'", [this.importHistoryId]));
            request.setResourceKind('importHistory');
            var status = this.abortImportProcessStatus;
            request.update({ Status: status, ProcessState: status }, {
                scope: this,
                success: function (response) {
                },
                failure: function (response) {
                    console.log(response);
                }
            });
        },
        _close: function () {
            this._dialog.hide();
            if (this.progressBar) {
                this.progressBar.destroy();
            }
        }
    });
    return importLeadsWizard;
});