/*globals dojo, define, Sage, dijit, Simplate, $ */
define([
    'dojo/_base/declare',
    'dojo/i18n!./nls/ContactSearchForDuplicates',
    'dijit/_Widget',
    'Sage/_Templated',
    'Sage/Utility',
    'Sage/UI/Controls/_DialogHelpIconMixin',
    'dojo/_base/lang',
    'Sage/UI/_DialogLoadingMixin',
    'Sage/UI/Dialogs',
    'dijit/Dialog',
    'dojo/i18n!./nls/ContactSearchForDuplicates',
    'dojo/text!./templates/ContactDetailSummary.html',
    'dojo/text!../Lead/templates/LeadDetailSummary.html',
    'dojo/text!../Account/templates/AccountDetailSummary.html'
],
function (
    declare,
    i18nStrings,
    _Widget,
    _Templated,
    Utility,
    _DialogHelpIconMixin,
    dojoLang,
    _DialogLoadingMixin,
    Dialogs,
    Dialog,
    nls,
    contactTemplate,
    leadTemplate,
    accountTemplate
) {
    var contactSearchForDuplicates = declare('Sage.MainView.Contact.ContactSearchForDuplicates', [_Widget, _Templated], {
        workSpace: {},
        templateDialog: false,
        templateData: '',
        rootUrl: 'slxdata.ashx/slx/crm/-/namedqueries?format=json&',
        widgetsInTemplate: true,
        constructor: function () {
            dojo.mixin(this, i18nStrings);
        },
        init: function (workSpace) {
            this.workSpace = workSpace;
        },
        onTabFiltersClick: function () {
            this.setDivDisplay(this.workSpace.divFiltersId, "inline");
            this.setDivDisplay(this.workSpace.divOptionsId, "none");

            this.setTabDisplay(this.workSpace.tabFiltersId, "tws-tab-button tws-active-tab-button");
            this.setTabDisplay(this.workSpace.tabOptionsId, "tws-tab-button");
        },
        onTabOptionsClick: function () {
            this.setDivDisplay(this.workSpace.divOptionsId, "inline");
            this.setDivDisplay(this.workSpace.divFiltersId, "none");

            this.setTabDisplay(this.workSpace.tabOptionsId, "tws-tab-button tws-active-tab-button");
            this.setTabDisplay(this.workSpace.tabFiltersId, "tws-tab-button");
        },
        setDivDisplay: function (divId, display) {
            var control = dojo.byId(divId);
            if (control !== null) {
                control.style.display = display;
            }
        },
        setTabDisplay: function (tabId, displayClass) {
            var control = dojo.byId(tabId);
            if (control !== null) {
                control.className = displayClass;
            }
        },
        showSummaryView: function (entityType, entityId) {
            var url = this.getReqestUrl(entityType, entityId);
            this.showData(url, this.successRequest, this.errorRequest, entityType, entityId);
        },
        getReqestUrl: function (entityType, entityId) {
            var url = null;
            if (entityType === 'Contact') {
                url = this.getReqeustUrlEx(entityId, 'ContactSearch');
            }
            if (entityType === 'Lead') {
                url = this.getReqeustUrlEx(entityId, 'LeadSearch');
            }
            if (entityType === 'Account') {
                url = this.getReqeustUrlEx(entityId, 'AccountSearch');
            }
            return url;
        },
        getReqeustUrlEx: function (entityId, searchName) {
            var fmtstr = "mainentity.id eq '${0}'";
            var params =
            {
                name: searchName,
                where: dojo.string.substitute(fmtstr, [entityId])
            };
            return this.rootUrl + this.buildQParamStr(params);
        },
        buildQParamStr: function (params) {
            var o = params;
            var p = [];
            if (typeof o === "object") {
                for (var k in o) {
                    p.push(k + "=" + encodeURIComponent(o[k]));
                }
            } else if (typeof o === "string") {
                p.push(o);
            }
            return p.join("&");
        },
        showData: function (url, successcallback, errorcallback, entityType, entityId) {
            if (typeof successcallback === "undefined") { successcallback = function (data) { }; }
            if (typeof errorcallback === "undefined") { errorcallback = function () { }; }
            if (typeof entityType === "undefined") { entityType = ''; }
            if (typeof entityId === "undefined") { entityId = ''; }
            var self = this;
            dojo.xhrGet({
                url: url,
                cache: false,
                preventCache: true,
                handleAs: 'json',
                load: function (data) {
                    successcallback(self, entityType, data);
                },
                error: function (request, status, error) {
                    errorcallback(self, error);
                }
            });
        },
        successRequest: function (self, entityType, data) {
            self.show(entityType, data);
        },
        show: function (entityType, data) {
            this.templateData = data.items[0];
            this.templateDialog = new Dialog({
                title: this.getSummaryTitle(entityType),
                id: [this.id, '-Dialog'].join(''),
                content: this.getTemplate(entityType).apply(this)
            });
            this.connect(this.templateDialog, "onCancel", this._close);
            this.templateDialog.show();
        },
        errorRequest: function (self, error) {
            Dialogs.showError(dojo.string.substitute(self.errorLoadingSummaryView, [error]));
        },
        getSummaryTitle: function (entityType) {
            var title = null;
            if (entityType === 'Contact') {
                title = this.ContactSummaryView_Title;
            }
            if (entityType === 'Lead') {
                title = this.LeadSummaryView_Title;
            }
            if (entityType === 'Account') {
                title = this.AccountSummaryView_Title;
            }
            return title;
        },
        getTemplate: function (entityType) {
            var tpl = null;
            if (entityType === 'Contact') {
                tpl = new Simplate(eval(contactTemplate));
            }
            if (entityType === 'Lead') {
                tpl = new Simplate(eval(leadTemplate));
            }
            if (entityType === 'Account') {
                tpl = new Simplate(eval(accountTemplate));
            }
            return tpl;
        },
        _close: function () {
            this.templateDialog.destroyRecursive();
        }
    });
    return contactSearchForDuplicates;
});