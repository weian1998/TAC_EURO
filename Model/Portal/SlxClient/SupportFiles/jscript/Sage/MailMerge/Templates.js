/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
/*
    // Example
    dojo.require("Sage.MailMerge.Templates");
    var sMainTable = "CONTACT"; // Valid values are "CONTACT", "LEAD", or "ANY" (i.e. both "CONTACT" and "LEAD")
    var fnOnSelect = function (item) {
    console.debug("Template: family=%o; name=%o; id=%o; maintable=%o; template=%o",
    item.family, item.name, item.id, item.maintable, item.template);
    };
    var fnOnCancel = function () {
    console.debug("Template selection canceled.");
    };
    var opts = { onSelect: fnOnSelect, onCancel: fnOnCancel };
    var oTemplates = new Sage.MailMerge.Templates();
    oTemplates.select(sMainTable, opts);
*/

define([
        "Sage/UI/Dialogs",
        "dijit/_Widget",
        "dijit/Dialog",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/Tree",
        "dijit/tree/ForestStoreModel",
        "dojo/data/ItemFileReadStore",
        "dojo/i18n",
        "dojo/string",
        "dojo/_base/lang",
        "dojo/i18n!./nls/Templates",
        "dojo/_base/declare"
    ],
// ReSharper disable InconsistentNaming
    function (Dialogs, _Widget, dDialog, BorderContainer, ContentPane, Tree, ForestStoreModel,
        ItemFileReadStore, i18n, dString, dLang, nls, declare) {
        var oMailMergeTemplates = declare("Sage.MailMerge.Templates", [_Widget], {
            constructor: function () {
                this.inherited(arguments);
                this.maintable = null;
                this.store = null;
            },
            postMixInProperties: function () {
                dLang.mixin(this, nls);
                this.inherited(arguments);
            },
            _translateItem: function (item) {
                if (dojo.isObject(item) && dojo.isObject(item.family)) {
                    var obj = new Object();
                    obj.family = item.family[0];
                    obj.name = item.name[0];
                    obj.id = item.id[0];
                    obj.maintable = item.maintable[0];
                    obj.template = item.template[0];
                    return obj;
                }
                return item;
            },
            select: function (maintable, opts) {
                var self = this;
                if (!opts || !dojo.isObject(opts) || !dojo.isFunction(opts.onSelect)) {
                    if (opts && dojo.isObject(opts) && dojo.isFunction(opts.onError)) {
                        opts.onError(this.invalidOptionsText);
                    } else {
                        Dialogs.showError(this.invalidOptionsText);
                    }
                    return;
                }
                var bSameMainTable = (dojo.isString(this.maintable) && dojo.isString(maintable) && this.maintable.toUpperCase() == maintable.toUpperCase());
                var sMainTable = "CONTACT";
                if (!bSameMainTable) {
                    if (dojo.isString(maintable)) {
                        sMainTable = maintable;
                    }
                    this.maintable = sMainTable;
                }
                var oDialog = dijit.byId("SelectTemplateDialog");
                if (oDialog) {
                    oDialog.destroyRecursive();
                }
                var iWidth = (typeof opts.width === "number") ? opts.width : 470;
                var iHeight = (typeof opts.height === "number") ? opts.height : 335;
                var sTitle = (dojo.isString(opts.title)) ? opts.title : this.dialogCaption;
                var sDialogStyle = dString.substitute("width: ${0}px; height: ${1}px;", [iWidth, iHeight]);
                oDialog = new dDialog({ id: "SelectTemplateDialog", title: sTitle, style: sDialogStyle });
                var oStore;
                if (this.store != null && bSameMainTable) {
                    oStore = this.store;
                } else {
                    oStore = new ItemFileReadStore({ url: "SLXMailMergeClient.ashx?method=GetTemplates&maintable=" + sMainTable });
                    this.store = oStore;
                }
                // ReSharper disable UnusedParameter
                var fnOnFetchError = function (error, request) {
                    if (error && typeof error === "object" && error instanceof Error && error.name === "TypeError") {
                        // There is a bug in dojo's replaceClass function that does not check for a null node, which will
                        // lead to a TypeError. This can be safely ignored, as it will only occur during startup if the
                        // user is using the keyboard while the dialog is loading. Ignoring the keyboard input for the 
                        // dialog or tree has no effect.
                        // The error is in dojo.js.uncompressed.js (line 21768: fakeNode[className] = node[className];).
                        if (typeof console !== "undefined") {
                            console.warn("The ForestStoreModel.onError returned: %o", error);
                        }
                        return;
                    }
                    // ReSharper restore UnusedParameter
                    dojo.disconnect(hDialogHide);
                    oDialog.destroyRecursive();
                    if (dojo.isFunction(opts.onError)) {
                        opts.onError(error);
                    } else {
                        Dialogs.showError(error);
                    }
                };
                oStore.fetch({ onError: fnOnFetchError });
                var oModel = new ForestStoreModel({
                    store: oStore,
                    query: { type: "*" },
                    rootId: "root",
                    rootLabel: "Templates",
                    labelAttr: "label",
                    childrenAttrs: ["children"]
                });
                var sBorderContainerStyle = dString.substitute("width: ${0}px; height: ${1}px; position: absolute;", [iWidth - (10 * 2), iHeight - (26 * 2)]);
                var oBorderContainer = new BorderContainer({ id: oDialog.id + "-BorderContainer", style: sBorderContainerStyle });
                var oTopPane = new ContentPane({
                    id: oDialog.id + "-TopPane",
                    region: "center",
                    style: "height: 100%; overflow: hidden; border: none; background-color: inherit;"
                });
                oBorderContainer.addChild(oTopPane);
                var oBottomPane = new ContentPane({
                    id: oDialog.id + "-BottomPane",
                    region: "bottom",
                    style: "height: 42px; margin-top: 6px; margin-right: 0px; position: absolute; border: none; background-color: inherit;"
                });
                oBorderContainer.addChild(oBottomPane);
                oDialog.containerNode.appendChild(oBorderContainer.domNode);
                var oTreeDiv = new dojo.create("div", { id: oDialog.id + "-TreeDiv" });
                oTopPane.containerNode.appendChild(oTreeDiv);
                var fnSelectionCallback = opts.onSelect;
                var fnCancelCallback = opts.onCancel || function () {
                };
                var oTree = new Tree(
                    {
                        id: oDialog.id + "-TreeView",
                        model: oModel,
                        showRoot: false,
                        persist: false,
                        _createTreeNode: function (args) {
                            // Create a unique ID that can be used by automated testing.
                            args.id = "dijit__TreeNode_" + args.item.id;
                            return new dijit._TreeNode(args);
                        }
                    }, oTreeDiv);
                var hDialogHide = dojo.connect(oDialog, "onHide", function () {
                    if (dojo.isFunction(fnCancelCallback)) {
                        dojo.disconnect(hDialogHide);
                        fnCancelCallback();
                    }
                });
                var hDblClick = dojo.connect(oTree, "onDblClick", function (item) {
                    if (item.type == "item") {
                        dojo.disconnect(hDblClick);
                        fnSelectionCallback(self._translateItem(item));
                        dojo.disconnect(hDialogHide);
                        oDialog.hide();
                    }
                });
                dojo.connect(oTree, "onKeyPress", function (event) {
                    switch (event.charOrCode) {
                        case dojo.keys.ENTER:
                            {
                                if (dojo.isObject(oTree.selectedItem) && oTree.selectedItem.type == "item") {
                                    var bOkDisabled = oOkButton.get("disabled");
                                    if (!bOkDisabled) {
                                        fnSelectionCallback(self._translateItem(oTree.selectedItem));
                                        dojo.disconnect(hDialogHide);
                                        oDialog.hide();
                                    }
                                }
                            }
                            break;
                    }
                });
                var oLoadingSpan = new dojo.create("span", { id: oDialog.id + "-LoadingSpan", style: "text-align: left; margin: 10px;", innerHTML: this.loadingText });
                var hTreeOnLoad = dojo.connect(oTree, "onLoad", function () {
                    dojo.disconnect(hTreeOnLoad);
                    var oNodes = oTree.rootNode.getChildren();
                    var oNode;
                    for (var i = 0; i < oNodes.length; i++) {
                        oNode = oNodes[i];
                        if (oNode.item.id == "PublicTemplates" || oNode.item.id == "PrivateTemplates") {
                            oTree._expandNode(oNode);
                        }
                    }
                    oLoadingSpan.style.visibility = "hidden";
                });
                oTopPane.containerNode.appendChild(oTree.domNode);
                var oButtonContainer = new dojo.create("span", { id: oDialog.id + "-ButtonContainer", style: "right: 0px; position:absolute; margin: 10px;" });
                var oOkButton = new dijit.form.Button({
                    id: oDialog.id + "-OkButton",
                    disabled: true,
                    label: this.okCaption,
                    onClick: function () {
                        if (dojo.isObject(oTree.selectedItem) && oTree.selectedItem.type == "item") {
                            fnSelectionCallback(self._translateItem(oTree.selectedItem));
                            dojo.disconnect(hDialogHide);
                            oDialog.hide();
                        }
                    }
                });
                dojo.connect(oTree, "onClick", function (item) {
                    oOkButton.set("disabled", (item.type != "item"));
                });
                oButtonContainer.appendChild(oOkButton.domNode);
                var oCancelButton = new dijit.form.Button({
                    id: oDialog.id + "-CancelButton",
                    label: this.cancelCaption,
                    onClick: function () {
                        oDialog.hide();
                    }
                });
                oButtonContainer.appendChild(new dojo.create("span", { innerHTML: "&nbsp;" }));
                oButtonContainer.appendChild(oCancelButton.domNode);
                oBottomPane.containerNode.appendChild(oLoadingSpan);
                oBottomPane.containerNode.appendChild(oButtonContainer);
                oBorderContainer.startup();
                oDialog.show();
            },
            destroy: function () {
                var oDialog = dijit.byId("SelectTemplateDialog");
                if (oDialog) {
                    setTimeout(function () { oDialog.destroyRecursive(false); }, 1);
                }
                this.inherited(arguments);
            }
        });

        return oMailMergeTemplates;
    }
);

