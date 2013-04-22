/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */
define([
    'dijit/form/Button',
    'dijit/Dialog',
    'dijit/ProgressBar',
    'dijit/form/TextBox',
    'dijit/form/ValidationTextBox',
    'dojo/i18n!./nls/Dialogs',
    'dojo/_base/array'
],
function (Button, Dialog, ProgressBar, TextBox, ValidationTextBox, nlsResources, array) {
    Sage.namespace('UI.Dialogs');
    dojo.mixin(Sage.UI.Dialogs, {
        raiseQueryDialog: function (title, query, callbackFn, yesText, noText, messageIcon) {
            //ToDo:  add icon: <question>
            return this.raiseQueryDialogExt({ title: title, query: query, callbackFn: callbackFn, yesText: yesText, noText: noText, icon: messageIcon });
        },
        raiseQueryDialogExt: function (opts) {
            var dlg = dijit.byId('queryDialog'),
                iWidth,
                queryDialog,
                commonCallback,
                questionDivs,
                i,
                buttonDiv,
                yesButton,
                noButton;

            if (dlg) {
                dlg.destroyRecursive();
            }

            iWidth = (opts && typeof opts.width === 'number') ? opts.width : 700;
            queryDialog = new dijit.Dialog({ id: 'queryDialog', title: opts.title, style: opts.style || { 'width': iWidth} });
            // When either button is pressed, kill the dialog and call the callbackFn.
            commonCallback = function (result) {
                queryDialog.hide();
                if (!opts.callbackFn || typeof opts.callbackFn !== 'function') {
                    return;
                }

                if (result) { //Yes was clicked
                    opts.callbackFn.call(opts.scope || this, true);
                } else {
                    opts.callbackFn.call(opts.scope || this, false);
                }
            };

            queryDialog.on('hide', function () {
                queryDialog.destroyRecursive();
            });


            if (opts.icon) {
                var iconDiv = new dojo.create('div', { id: 'queryDialog-iconDiv', 'class': 'messageIcon ' + opts.icon });
                queryDialog.containerNode.appendChild(iconDiv);
            }

            questionDivs = [];

            if (opts.query instanceof Array) {
                for (i = 0; i < opts.query.length; i++) {
                    questionDivs.push(dojo.create('div', { id: 'queryDialog-questionDiv_' + i, innerHTML: opts.query[i] }));
                }
            }
            else {
                var div = dojo.create('div', { id: 'queryDialog-questionDiv', innerHTML: opts.query });

                // Check for scripts contained in opts.query; scripts will not work in div.innerHTML, so process them so they will work.                
                var arrScripts = div.getElementsByTagName('script');
                array.forEach(arrScripts, function (script) {
                    var src = script.getAttribute('src');
                    if (src === null && script.innerHTML !== '') {
                        // Script should be in the form window.someFunction = function() {};
                        eval(script.innerHTML);
                    }
                    else if (src !== null && script.innerHTML === '') {
                        var head = document.getElementsByTagName('head')[0];
                        // Must be cloned; otherwise, div.removeChild(script) will fail.
                        var clone = dojo.clone(script);
                        (head || document.body).appendChild(clone);
                    }
                    else {
                        if (typeof console !== 'undefined') {
                            console.warn('Unable to process script in Sage.UI.Dialogs.');
                        }
                    }
                    div.removeChild(script);
                });
                questionDivs.push(div);
            }

            buttonDiv = new dojo.create("div", { id: 'queryDialog-buttonDiv', style: "text-align: " + (opts.align || "center") + "; margin-top: 10px" });

            yesButton = new dijit.form.Button({
                label: opts.yesText || nlsResources.yesText,
                id: 'qry_yesButton',
                onClick: function (result) { commonCallback(true); }
            });

            buttonDiv.appendChild(yesButton.domNode);
            if ((opts.noText) || (opts.showNoButton)) {
                noButton = new dijit.form.Button({
                    label: opts.noText || nlsResources.noText,
                    id: 'qry_noButton',
                    style: 'padding-left: 10px',
                    onClick: function (result) { commonCallback(false); }
                });
                buttonDiv.appendChild(noButton.domNode);
            }

            dojo.forEach(questionDivs, function (questionDiv) {
                queryDialog.containerNode.appendChild(questionDiv);
            });

            queryDialog.containerNode.appendChild(buttonDiv);
            queryDialog.show();
        },
        raiseInputDialog: function (title, query, callbackFn, yesText, noText, defaultValue, regExp, invalidMessage) {
            return this.raiseInputDialogExt(
                {
                    title: title,
                    query: query,
                    callbackFn: callbackFn,
                    yesText: yesText,
                    noText: noText,
                    defaultValue: defaultValue,
                    regExp: regExp,
                    invalidMessage: invalidMessage
                });
        },
        raiseInputDialogExt: function (opts) {
            //ToDo: implement the icon property from opts...
            var inputDialog, questionDiv, inputBox, commonCallback, yesButton, noButton, buttonDiv;
            
            inputDialog = dijit.byId('inputDialog');
            if (inputDialog) {
                inputDialog.destroyRecursive();
            }
            
            inputDialog = new dijit.Dialog({ id: 'inputDialog', title: opts.title });
            questionDiv = dojo.create('div', { id: 'inputDialog-questionDiv', innerHTML: opts.query });
            inputBox = (opts.regExp && dojo.isString(opts.regExp)) ?
                new dijit.form.ValidationTextBox({
                    id: 'inputDialog-inputBox',
                    value: opts.defaultValue || '',
                    style: 'margin-top: 8px',
                    regExp: opts.regExp || '',
                    invalidMessage: opts.invalidMessage || ''
                })
                : new dijit.form.TextBox({
                    id: 'inputDialog-inputBox',
                    value: opts.defaultValue || '',
                    style: 'margin-top: 8px'
                });
            commonCallback = function (result) {
                if (result) {
                    opts.callbackFn(true, inputBox.get('value'));
                } else {
                    opts.callbackFn(false, inputBox.get('value'));
                }
                inputDialog.hide();
            };
            yesButton = new dijit.form.Button({
                label: opts.yesText || nlsResources.yesText,
                id: 'inp_yesButton',
                onClick: function (result) { commonCallback(true); }
            });
            noButton = new dijit.form.Button({
                label: opts.noText || nlsResources.noText,
                id: 'inp_noButton',
                onClick: function (result) { commonCallback(false); }
            });
            buttonDiv = new dojo.create("div", { id: 'inputDialog-buttonDiv' });

            inputDialog.on('hide', function () {
                inputDialog.destroyRecursive();
            });

            buttonDiv.appendChild(yesButton.domNode);
            buttonDiv.appendChild(noButton.domNode);

            inputDialog.containerNode.appendChild(questionDiv);
            inputDialog.containerNode.appendChild(inputBox.domNode);
            inputDialog.containerNode.appendChild(buttonDiv);

            if (opts.closable === false) {
                dojo.destroy(inputDialog.closeButtonNode);
            }

            inputDialog.show();
        },
        showProgressBar: function (opts) {
            var iMax = (opts && typeof opts.maximum !== "undefined") ? opts.maximum : 100,
                prog,
                iWidth = (opts && typeof opts.width === 'number') ? opts.width : 300,
                iHeight = (opts && typeof opts.width === 'number') ? opts.height : 125,
                sStyle = dojo.string.substitute('width: ${0}px; height: ${1}px', [iWidth, iHeight]),
                bCanClose = (opts && typeof opts.canclose === 'boolean') ? opts.canclose : true,
                progressDialog,
                sMsg,
                msgDiv,
                bar,
                msg;

            if (!dijit.byId('progressDialog')) {
                prog = new dijit.ProgressBar({
                    id: 'progressDialogBar',
                    style: 'margin-top: 10px; margin-bottom: 10px',
                    indeterminate: (opts && opts.indeterminate !== "undefined") ? opts.indeterminate : false,
                    maximum: iMax
                });
                progressDialog = new dijit.Dialog({ id: 'progressDialog', title: opts.title, style: sStyle, closable: bCanClose });
                if (opts && typeof opts.showmessage === 'boolean' && opts.showmessage) {
                    sMsg = (opts && typeof opts.message === 'string') ? opts.message : "";
                    msgDiv = new dojo.create('div', { innerHTML: sMsg, style: 'text-align: left; margin-top: 10px; margin-bottom: 10px', id: 'progressDialogMessage' });
                    progressDialog.containerNode.appendChild(msgDiv);
                }

                progressDialog.containerNode.appendChild(prog.domNode);
                progressDialog.show();
            }

            bar = dijit.byId('progressDialogBar');
            bar.update({ progress: opts.pct, title: opts.title });
            if (opts && typeof opts.showmessage === 'boolean' && opts.showmessage && typeof opts.message === 'string') {
                msg = dojo.byId('progressDialogMessage');
                if (msg) {
                    msg.innerHTML = opts.message;
                }
            }
        },
        closeProgressBar: function (opts) {
            var dlg = dijit.byId("progressDialog");
            if (dlg) {
                dlg.hide();
                dlg.destroyRecursive();
            }
        },
        alert: function (msg, title, icon) {
            var opts = {
                title: title || 'Sage SalesLogix',   //  ToDo:  Localize   <---<<<   <---<<<   <---<<<
                query: msg,
                callbackFn: false,
                yesText: nlsResources.okText || 'OK',
                noText: false,
                scope: window,
                icon: icon || 'noIcon',
                style: { width: '700px' }
            };
            Sage.UI.Dialogs.raiseQueryDialogExt(opts);
        },
        showInfo: function (msg, title) {
            this.alert(msg, title, 'infoIcon');
        },
        showWarning: function (msg, title) {
            this.alert(msg, title, 'warningIcon');
        },
        showError: function (msg, title) {
            this.alert(msg, title, 'errorIcon');
        }
    });

    //Backward compatability - marked as deprecated
    Sage.WebClientMessageService = function (options) {

    };
    Sage.WebClientMessageService.prototype.hideClientMessage = function () {
        //Ext.Msg.hide();
        if (typeof console !== 'undefined') {
            console.warn(['DEPRECATED: The WebClientMessageService is deprecated.  (hideClientMessage)',
                'Use Sage.UI.Dialogs instead.'].join('\n'));
        }
    };
    Sage.WebClientMessageService.prototype.showClientMessage = function (title, msg, fn, scope) {
        if (typeof console !== 'undefined') {
            console.warn(['DEPRECATED: The WebClientMessageService is deprecated.  ',
                'Use Sage.UI.Dialogs instead.',
                'Change code like:',
                'var svc = Sage.Services.getService("WebClientMessageService");',
                'if (svc) {',
                '    Sage.UserOptionsService.showClientMessage(<title>, <msg>, <callback>, <scope>);',
                '}',
                'to this: ',
                'Sage.UI.Dialogs.raiseQueryDialog(<title>, <msg>, <callback>, <yesText>, <noText>);'
                ].join('\n'));
        }
        if (typeof title === 'object') {
            Sage.UI.Dialog.raiseQueryDialogEx(title);
        }
        var o = {
            title: (typeof msg === "string") ? title : '',
            query: (typeof msg === "string") ? msg : title,
            callbackFn: fn,
            yesText: nlsResources.yesText || 'Yes',
            noText: nlsResources.noText || 'No',
            scope: scope
        };
        Sage.UI.Dialogs.raiseQueryDialogExt(o);
    };
    Sage.Services.addService("WebClientMessageService", new Sage.WebClientMessageService());

    return Sage.UI.Dialogs;
});
