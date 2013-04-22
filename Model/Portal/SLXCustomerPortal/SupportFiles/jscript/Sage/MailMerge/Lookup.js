/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/*
//Example
dojo.require("Sage.MailMerge.Lookup");
var oLookup;
var fnOnSelect = function(items) {
if (dojo.isArray(items)) {
var selectedKey = items[0].$key;
console.debug("selectedKey: %o", selectedKey);
oLookup.destroy();
}
};
var fnOnCancel = function() {
console.debug("onCancel");
oLookup.destroy();
};
var fnOnError = function(msg) {
console.debug("error: %o", msg);
oLookup.destroy();
};
var opts = {
onSelect: fnOnSelect,
onCancel: fnOnCancel,
onError: fnOnError,
maintable: "OPPORTUNITY",
seedProperty: "Opportunity.Id",
seedValue: "OGHEA0002815",
initializeLookup: true,
preFilters: [],
title: "Select an Opportunity Contact",
isListView: false
};
oLookup = new Sage.MailMerge.Lookup(opts);
oLookup.show();
*/

define([
        "Sage/UI/Columns/Phone",
        "Sage/UI/Dialogs",
        "Sage/UI/SDataLookup",
        "dijit/_Widget",
        "dojo/i18n",
        "dojo/_base/lang",
        "dojo/i18n!./nls/Lookup",
        "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function (Phone, Dialogs, SDataLookup, _Widget, i18n, dLang, nls, declare) {
        // ReSharper restore InconsistentNaming
        var oMailMergeLookup = declare("Sage.MailMerge.Lookup", [_Widget], {
            constructor: function (opts) {
                this.inherited(arguments);
                this._initialized = false;
                if (!opts || !dojo.isObject(opts) || !dojo.isFunction(opts.onSelect)) {
                    if (opts && dojo.isObject(opts) && dojo.isFunction(opts.onError)) {
                        opts.onError(this.invalidOptionsText);
                    } else {
                        Dialogs.showError(this.invalidOptionsText);
                    }
                    return;
                }
                this.options = opts || { maintable: "CONTACT" };
                this.maintable = (dojo.isString(opts.maintable)) ? opts.maintable : "CONTACT";
                this._initialized = true;
            },
            postMixInProperties: function () {
                dLang.mixin(this, nls);
                this.inherited(arguments);
            },
            getConfiguration: function () {
                if (!this._initialized) return null;
                var sResourceKind = "contacts";
                var bAccount = false;
                var bLead = false;
                var bOpp = false;
                switch (this.maintable.toUpperCase()) {
                    case "ACCOUNT":
                        bAccount = true;
                        break;
                    case "LEAD":
                        bLead = true;
                        sResourceKind = "leads";
                        break;
                    case "OPPORTUNITY":
                        bOpp = true;
                        sResourceKind = "opportunityContacts";
                        break;
                }
                var iWidth = (isNaN(this.options.dialogWidth)) ? null : Number(this.options.dialogWidth);
                var iHeight = (isNaN(this.options.dialogHeight)) ? null : Number(this.options.dialogHeight);
                var oConfiguration = {
                    "dialogWidth": iWidth,
                    "dialogHeight": iHeight,
                    "displayMode": 5,
                    "structure": [
                        {
                            "cells": [
                                {
                                    "name": (bLead) ? this.companyCaption : this.accountCaption,
                                    "field": (bLead) ? "Company" : "AccountName",
                                    "sortable": true,
                                    "width": "150px",
                                    "editable": false,
                                    "styles": null,
                                    "propertyType": "",
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                },
                                {
                                    "name": this.lastNameCaption,
                                    "field": "LastName",
                                    "sortable": true,
                                    "width": "150px",
                                    "editable": false,
                                    "styles": null,
                                    "propertyType": "",
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                },
                                {
                                    "name": this.firstNameCaption,
                                    "field": "FirstName",
                                    "sortable": true,
                                    "width": "150px",
                                    "editable": false,
                                    "styles": null,
                                    "propertyType": "",
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                },
                                {
                                    "name": this.workCaption,
                                    "field": "WorkPhone",
                                    "sortable": true,
                                    "width": "150px",
                                    "editable": false,
                                    "styles": null,
                                    "type": Phone,
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                },
                                {
                                    "name": this.mobileCaption,
                                    "field": "Mobile",
                                    "sortable": true,
                                    "width": "150px",
                                    "editable": false,
                                    "styles": null,
                                    "type": Phone,
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                },
                                {
                                    "name": this.emailCaption,
                                    "field": "Email",
                                    "sortable": true,
                                    "width": "150px",
                                    "editable": false,
                                    "styles": null,
                                    "propertyType": "",
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                }],
                            "defaultCell":
                                {
                                    "name": null,
                                    "field": null,
                                    "sortable": false,
                                    "width": "50px",
                                    "editable": false,
                                    "styles": "text-align: right;",
                                    "propertyType": null,
                                    "excludeFromFilters": false,
                                    "useAsResult": false
                                }
                        }],
                    "gridOptions":
                        {
                            "contextualCondition": "",
                            "contextualShow": "",
                            "selectionMode": "single"
                        },
                    "storeOptions":
                        {
                            "resourceKind": sResourceKind
                        },
                    "dialogTitle": (dojo.isString(this.options.title)) ? this.options.title : (bLead) ? this.leadTitle : this.contactTitle,
                    "dialogButtonText": this.okText,
                    "id": "LookupMailMergeEntity",
                    "seedProperty": (dojo.isString(this.options.seedProperty)) ? this.options.seedProperty : "",
                    "seedValue": (dojo.isString(this.options.seedValue)) ? this.options.seedValue : "",
                    "overrideSeedValueOnSearch": false,
                    "initializeLookup": (typeof this.options.initializeLookup == "boolean") ? this.options.initializeLookup : true,
                    "preFilters": (dojo.isArray(this.options.preFilters)) ? this.options.preFilters : [],
                    "returnPrimaryKey": true,
                    "isModal": (typeof this.options.modal == "boolean") ? this.options.modal : true
                };
                if (bAccount) {
                    if (typeof this.options.isListView == "boolean" && !this.options.isListView) {
                        /* Remove the first column (Account) */
                        oConfiguration.structure[0].cells.shift();
                    }
                } else if (bOpp) {
                    var i;
                    for (i = 0; i < oConfiguration.structure[0].cells.length; i++) {
                        oConfiguration.structure[0].cells[i].field = "Contact." + oConfiguration.structure[0].cells[i].field;
                    }
                    if (typeof this.options.isListView == "boolean") {
                        if (this.options.isListView) {
                            /* Add Opportunity.Description as the first column */
                            oConfiguration.structure[0].cells.splice(0, 0, {
                                "name": this.opportunityCaption,
                                "field": "Opportunity.Description",
                                "sortable": true,
                                "width": "250px",
                                "editable": false,
                                "styles": null,
                                "propertyType": "",
                                "excludeFromFilters": false,
                                "useAsResult": false
                            });
                        } else {
                            /* Remove the first column (Contact.Account) */
                            oConfiguration.structure[0].cells.shift();
                        }
                    }
                }
                return oConfiguration;
            },
            show: function () {
                if (!this._initialized) return;
                var oLookup = dijit.byId("LookupMailMergeEntity");
                if (oLookup) {
                    oLookup.destroy();
                }
                var oConfiguration = this.getConfiguration();
                oLookup = new SDataLookup(oConfiguration);
                var fnOnSelect = (typeof this.options.onSelect === "function") ? this.options.onSelect : function (items) {
                    if (dojo.isArray(items)) {
                        var selectedKey = items[0].$key;
                        if (dojo.config.isDebug) {
                            console.debug("debug selectedKey: %o", selectedKey);
                        }
                    }
                };
                oLookup.onDoubleClick = function (e) {
                    dojo.stopEvent(e);
                    var btnOk = dijit.byId("LookupMailMergeEntity-GridSelectButton");
                    if (btnOk) {
                        btnOk.onClick();
                    }
                };
                oLookup.doSelected = function (items) {
                    dojo.disconnect(hOnHide);
                    fnOnSelect(items);
                    if (dojo.isObject(oLookup.lookupDialog) && dojo.isFunction(oLookup.lookupDialog.hide)) {
                        oLookup.lookupDialog.hide();
                    }
                    oLookup.destroy();
                };
                var fnOnCancel = (typeof this.options.onCancel === "function") ? this.options.onCancel : function () {
                };
                oLookup.showLookup();
                var hOnHide = dojo.connect(oLookup.lookupDialog, "onHide", function () {
                    dojo.disconnect(hOnHide);
                    fnOnCancel();
                    oLookup.destroy();
                });
            },
            destroy: function () {
                var oLookup = dijit.byId("LookupMailMergeEntity");
                if (oLookup) {
                    oLookup.destroy();
                }
                this.inherited(arguments);
            }
        });

        return oMailMergeLookup;
    }
);
