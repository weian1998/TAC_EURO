/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dojo/_base/declare'
],
function (declare) {
    /**
    * summary
    * Class used to create the service for watching bound data fields and notifying the user that they have dirty data.
    * Declare the class and append its methods and properties
    * @constructor
    */
    var widget = declare('Sage.Services.ClientBindingManagerService', null, {
        constructor: function () {
            this._listeners[this.ON_SAVE] = [];
            this.inherited(arguments);
        },
        _WatchChanges: true,
        _PageExitWarningMessage: "",
        _ShowWarningOnPageExit: false,
        _SkipCheck: false,
        //this flag tracks the dirty status of controls that were databound on the server
        _CurrentEntityIsDirty: false,
        _SaveBtnID: "",
        _MsgDisplayID: "",
        _entityTransactionID: "",
        _IgnoreDirtyFlag: false,
        //this keeps track of any Ajax controls that also may have dirty data in them...
        _DirtyAjaxItems: [],
        _listeners: {},
        _init: function () {
            this.positionDirtyDataMessage();
            dojo.subscribe("Sage/events/markDirty", this, "markDirty");
        },
        positionDirtyDataMessage: function () {
            var title = dojo.query('#PageTitle');
            var msgNode = dojo.query('.dirtyDataMessage');
            if (title && title.length > 0 && msgNode && msgNode.length > 0) {
                dojo.place(msgNode[0], title[0], 'after');
                dojo.style(msgNode[0], 'top', dojo.marginBox(title[0]).t + 'px');
                dojo.style(msgNode[0], 'left', dojo.marginBox(title[0]).w + 'px');
            }
        },
        addListener: function (event, listener, scope) {
            //TODO: Refactor with this.connect
            this._listeners[event] = this._listeners[event] || [];
            this._listeners[event].push({ listener: listener, scope: scope });
        },
        removeListener: function (event, listener) {
            //TODO: Refactor with this.disconnect
            this._listeners[event] = this._listeners[event] || [];
            for (var i = 0; i < this._listeners[event].length; i++)
                if (this._listeners[event][i].listener == listener)
                    break;

            this._listeners[event].splice(i, 1);
        },
        onSave: function () {
            for (var i = 0; i < this._listeners[this.ON_SAVE].length; i++) {
                var fn = this._listeners[this.ON_SAVE][i].listener;
                var scope = this._listeners[this.ON_SAVE][i].scope || this;
                if (typeof fn === "function") {
                    fn.call(scope);
                }
            }
        },
        SetShowWarningOnPageExit: function (showMsg) {
            this._ShowWarningOnPageExit = (showMsg);
            if (this._ShowWarningOnPageExit) {
                window.onbeforeunload = this.onExit;
            }
        },
        onExit: function (e) {
            // TODO: 'this'?
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                if (mgr._ShowWarningOnPageExit) {
                    if (mgr._SkipCheck) {
                        //_SkipCheck = false;
                        return;
                    }
                    var hdd = mgr.hasDirtyData();
                    if (hdd && (mgr._IgnoreDirtyFlag == false) || Sage.Utility.getModeId() === 'insert') {
                        window.setTimeout(function () {
                            Sage.Utility.hideRequestIndicator(null, {});
                        }, 1000);
                        if (window.event) {
                            window.event.returnValue = mgr._PageExitWarningMessage;
                        } else {
                            return mgr._PageExitWarningMessage;
                        }
                    }
                }
            }
            return;
        },
        canChangeEntityContext: function () {
            if ((this._WatchChanges) && (this.hasDirtyData()) && (this._ShowWarningOnPageExit)) {
                if (confirm(this._PageExitWarningMessage)) {
                    this.clearDirtyStatus();
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        },
        hasDirtyData: function () {
            return (this._CurrentEntityIsDirty || (this._DirtyAjaxItems && this._DirtyAjaxItems.length > 0));
        },
        markDirty: function (e) {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                if (mgr._WatchChanges) {
                    mgr._CurrentEntityIsDirty = true;
                    if (mgr._IgnoreDirtyFlag == false) {
                        dojo.style(dojo.byId(mgr._MsgDisplayID), 'display', 'inline');
                    }
                }
            }
        },
        addDirtyAjaxItem: function (itemId) {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                //make sure we don't already know about this one...
                var len = this._DirtyAjaxItems.length;
                for (var i = 0; i < len; i++) {
                    if (this._DirtyAjaxItems[i] === itemId) {
                        return;
                    }
                }
                this._DirtyAjaxItems.push(itemId);
                //show the message without marking _CurrentEntityIsDirty so it can be tracked separately.
                if (this._WatchChanges) {
                    if (this._IgnoreDirtyFlag == false) {
                        dojo.style(dojo.byId(mgr._MsgDisplayID), 'display', 'inline');
                    }
                }
            }
        },
        clearDirtyAjaxItem: function (itemId) {
            var len = this._DirtyAjaxItems.length;
            for (var i = 0; i < len; i++) {
                if (this._DirtyAjaxItems[i] === itemId) {
                    this._DirtyAjaxItems.splice(i, 1);
                }
            }
            if (!this.hasDirtyData()) {
                $("#" + this._MsgDisplayID).hide();
            }
        },
        clearDirtyStatus: function () {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                mgr._CurrentEntityIsDirty = false;
                $("#" + mgr._MsgDisplayID).hide();
            }
        },
        notifyIsSaving: function () {
            if (Sage.Utility.Validate._isValid) {
                var mgr = Sage.Services.getService("ClientBindingManagerService");
                if (mgr) {
                    Sys.WebForms.PageRequestManager.getInstance().add_endRequest(mgr.handleEndSaveRequest);
                    mgr.clearDirtyStatus();
                    if (Sage.Utility.getModeId() === 'insert') {
                        mgr._SkipCheck = true;
                    }
                    mgr.onSave();
                }
            }
        },
        handleEndSaveRequest: function (sender, args) {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                if (!args.get_error()) {
                    mgr.clearDirtyStatus();
                } else {
                    mgr.markDirty();
                }
                Sys.WebForms.PageRequestManager.getInstance().remove_endRequest(mgr.handleEndSaveRequest);
            }
        },
        saveForm: function () {
            var btn = dojo.byId(this._SaveBtnID);
            if (btn) {
                if ((btn.tagName.toLowerCase() == "input") && (btn.type == "image")) {
                    this.notifyIsSaving();
                    Sys.WebForms.PageRequestManager.getInstance()._doPostBack(btn.name, null);
                } else if (btn.onClick) {
                    this.notifyIsSaving();
                    btn.onClick();
                }
            }
        },
        registerResetBtn: function (elemId) {
            if (elemId) {
                var btn = dojo.byId(elemId);
                if (btn) {
                    //TODO: dojo.connect
                    $addHandler(btn, "click", this.resetCurrentEntity);
                }
            }
        },
        registerSaveBtn: function (elemId, workspace) {
            if (elemId) {
                var btn = dojo.byId(elemId);
                if (btn) {
                    //TODO: dojo.connect
                    dojo.connect(btn, 'onclick', function () {
                        Sage.Utility.Validate.onWorkSpaceSave(workspace);
                    });
                    $addHandler(btn, "click", this.notifyIsSaving);
                    if (this._SaveBtnID == "") {
                        this._SaveBtnID = elemId;
                    }
                }
            }
        },
        registerDialogCancelBtn: function (elemId) {
            if (elemId) {
                var btn = dojo.byId(elemId);
                if (btn) {
                    //TODO: dojo.connect
                    $addHandler(btn, "click", this.rollbackCurrentTransaction);
                }
            }
        },
        registerBoundControls: function (controlList) {
            if ((this._WatchChanges) && (controlList)) {
                var ctrlIDs = controlList.split(",");
                var elem;
                for (var i = 0; i < ctrlIDs.length; i++) {
                    if (dojo.byId(ctrlIDs[i])) {
                        elem = dojo.byId(ctrlIDs[i]);
                    }
                    else if (dijit.byId(ctrlIDs[i])) {
                        elem = dijit.byId(ctrlIDs[i]).focusNode;
                    }
                    if (elem) {
                        // check here for attribute saying it is a container - if it is, recurse children looking for the correct one(s)...
                        if (elem.attributes["slxcompositecontrol"]) {
                            this.findChildControls(elem);
                        } else {
                            this.attachChangeHandler(elem);
                        }
                    }
                }
            }
            this.findWarningExceptions();
        },
        findChildControls: function (elem) {
            if ((elem) && (elem.attributes) && (elem.attributes["slxchangehook"]) && (!elem.attributes["slxcompositecontrol"])) {
                //alert("found a changehook: \nID: " + elem.id + "\nname: " + elem.name + "\nelem: " + elem);
                this.attachChangeHandler(elem);
            } else {
                if (elem.childNodes) {
                    for (var n = 0; n < elem.childNodes.length; n++) {
                        this.findChildControls(elem.childNodes[n]);
                    }
                }
            }
        },
        setDijitControlFocus: function (ctrlid) {
            var inputDijit = dijit.byId(ctrlid);
            if (inputDijit) {
                inputDijit.focus();
                if (inputDijit.select) {
                    inputDijit.select();
                }
                return true;
            }
        },
        setControlFocus: function (ctrlid) {
            var trySelect = function (elem) {
                if ((typeof (elem.select) == "function") || (typeof (elem.select) == "object")) {
                    elem.select();
                    // IE needs focus as well as select, or
                    // TAB will move to Navigation bar
                    try {
                        elem.focus();
                    }
                    catch (ex) {
                        // IE will throw an exception
                        // if focus is called on hidden/disabled fields
                        return false;
                    }
                    return true;
                }
                return false;
            };
            var elem = $("#" + ctrlid)[0];
            if (elem) {
                if (trySelect(elem)) { return; }
                elem = $("#" + ctrlid + " TEXTAREA")[0];
                if ((elem) && (trySelect(elem))) { return; }

                elem = $("#" + ctrlid + " INPUT")[0];
                // elem.select() doesn't always give focus to some composite controls
                //  so custom logic may be necessary per input type
                if (elem) {
                    console.log($("#" + ctrlid + " INPUT"));
                    // If this is a drop-down, the button would be selected
                    //  For: Picklist control
                    if (dojo.hasClass(elem, "dijitArrowButtonInner")) {
                        if (this.setDijitControlFocus(ctrlid + '-SingleSelectPickList-Combo')) { return; }
                    }
                    // [0] might be the validation image instead of the textbox
                    // For: Lookup control, Name control
                    else if (dojo.hasClass(elem, "dijitValidationInner")) {
                        elem = $("#" + ctrlid + " INPUT")[1];
                        if ((elem) && (trySelect(elem))) { return; }
                    }
                    // For: DateTime control
                    else if (dojo.style(elem, 'display') == 'none'
                        && elem.classList.length == 0) {
                        elem = $('#' + ctrlid + ' INPUT')[3];

                        if ((elem) && (trySelect(elem))) { return; }
                    }
                    // For: basic control
                    if (trySelect(elem)) { return; }
                }
                elem = $("#" + ctrlid + " SELECT")[0];
                if ((elem) && (trySelect(elem))) { return; }
            }
        },
        attachChangeHandler: function (elem) {
            if (elem) {
                if ((elem.tagName == "A") || ((elem.tagName == "INPUT") && ((elem.type == "button") || (elem.type == "image") || (elem.type == "submit")))) {
                    this.registerChildPostBackWarningExceptions(elem);
                } else {
                    //TODO: dojo.disconnect
                    try { $removeHandler(elem, "change", this.markDirty); } catch (e) { }
                    //TODO: dojo.connect
                    $addHandler(elem, "change", this.markDirty);
                }
            }
        },
        registerPostBackWarningExceptions: function (elem) {
            if (elem) {
                elems = $("a,input[type='INPUT'],input[type='BUTTON'],input[type='IMAGE'],input[type='SUBMIT']", elem).get();
                for (var i = 0; i < elems.length; i++) {
                    this.registerChildPostBackWarningExceptions(elems[i]);
                }
            }
        },
        findWarningExceptions: function () {
            var elems = $("span[slxcompositecontrol], div[slxcompositecontrol]").get();
            for (var i = 0; i < elems.length; i++) {
                this.registerPostBackWarningExceptions(elems[i]);
            }
        },
        registerChildPostBackWarningExceptions: function (elem) {
            if (elem) {
                if ($(elem).hasClass("leavesPage")) {
                    return;
                }
                if ((elem.tagName == "A") || ((elem.tagName == "INPUT") && ((elem.type == "button") || (elem.type == "image") || (elem.type == "submit")))) {
                    try { $removeHandler(elem, "click", this.skipWarning); } catch (e) { }
                    $addHandler(elem, "click", this.skipWarning);
                }
            }
        },
        turnOffWarnings: function () {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                mgr._SkipCheck = true;
                var x = window.setTimeout(function () {
                    var mgr = Sage.Services.getService("ClientBindingManagerService");
                    if (mgr) {
                        mgr._SkipCheck = true;
                    }
                }, 500); //just in case there is a timer waiting to turn it back on
            }
        },
        resumeWarning: function () {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                mgr._SkipCheck = false;
            }
        },
        skipWarning: function () {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            if (mgr) {
                mgr._SkipCheck = true;
                var x = window.setTimeout(function() {
                    var mgr = Sage.Services.getService("ClientBindingManagerService");
                    if (mgr) {
                        mgr._SkipCheck = false;
                    }
                }, 500);
            }
        },
        resetCurrentEntity: function () {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            mgr.doFormReset();
            if (mgr) {
                var contextservice = Sage.Services.getService("ClientContextService");
                if (contextservice) {
                    if (contextservice.containsKey("ResetCurrentEntity")) {
                        contextservice.setValue("ResetCurrentEntity", "true");
                    } else {
                        contextservice.add("ResetCurrentEntity", "true");
                    }
                }
                mgr.clearDirtyStatus();
            }
        },
        rollbackCurrentTransaction: function () {
            var mgr = Sage.Services.getService("ClientBindingManagerService");
            mgr.doSectionReset("dialog");
            if (mgr) {
                var contextservice = Sage.Services.getService("ClientContextService");
                if (contextservice) {
                    if (contextservice.containsKey("RollbackEntityTransaction")) {
                        contextservice.setValue("RollbackEntityTransaction", mgr._entityTransactionID);
                    } else {
                        contextservice.add("RollbackEntityTransaction", mgr._entityTransactionID);
                    }
                }
            }
        },
        doFormReset: function () {
            document.forms[0].reset();
        },
        doSectionReset: function (sectionId) {
            function getElements(sectionId, tagName) {
                if ((sectionId == "main") && (document.getElementById("MainContent"))) {
                    return document.getElementById("MainContent").getElementsByTagName(tagName);
                } else if ((sectionId == "tabs") && (document.getElementById("TabControl"))) {
                    return document.getElementById("TabControl").getElementsByTagName(tagName);
                } else if (document.getElementById("DialogWorkspace_content")) {
                    return document.getElementById("DialogWorkspace_content").getElementsByTagName(tagName);
                }
                return new Array();
            }
            var elem;
            var elems = getElements(sectionId, "INPUT");
            if (elems.length > 0) {
                for (var i = 0; i < elems.length; i++) {
                    elem = elems[i];
                    if ((elem.type == "checkbox") || (elem.type == "radio")) {
                        if (elem.checked != elem.defaultChecked) {
                            elem.checked = elem.defaultChecked;
                        }
                    } else {
                        if (elem.value != elem.defaultValue) {
                            elem.value = elem.defaultValue;
                        }
                    }
                }
                elems = getElements(sectionId, "TEXTAREA");
                for (var i = 0; i < elems.length; i++) {
                    elem = elems[i];
                    if (elem.value != elem.defaultValue) {
                        elem.value = elem.defaultValue;
                    }
                }
                elems = getElements(sectionId, "SELECT");
                for (var i = 0; i < elems.length; i++) {
                    elem = elems[i];
                    for (var k = 0; k < elem.options.length; k++) {
                        elem.options[k].selected = elem.options[k].defaultSelected;
                    }
                }
            } else {
                document.forms[0].reset();
            }
        },
        setCurrentTransaction: function (transaction) {
            this._entityTransactionID = transaction;
        },
        clearReset: function () {
            if (Sage.Services) {
                var contextservice = Sage.Services.getService("ClientContextService");
                if (contextservice) {
                    if (contextservice.containsKey("ResetCurrentEntity")) {
                        contextservice.remove("ResetCurrentEntity");
                    }
                    if (contextservice.containsKey("RollbackEntityTransaction")) {
                        contextservice.remove("RollbackEntityTransaction");
                    }
                }
            }
        }

    });  // end dojo declare

    /**
    * Make an instance of this service available to the
    * Sage.Services.getService method.
    */
    if (!Sage.Services.hasService('ClientBindingManagerService')) {
        Sage.Services.addService('ClientBindingManagerService', new Sage.Services.ClientBindingManagerService());
    }

    return widget;
});