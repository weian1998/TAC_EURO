/*globals Sage, dojo, dojox, dijit, Simplate, window, Sys, define */

define([
    'dojo/i18n',
    'Sage/UI/Dialogs',
    'dijit/_Widget',
    'Sage/_Templated',
    'dojo/i18n!./nls/ActivityActionProcessor',
    'dojo/_base/declare'
],
function (
    i18n,
    Dialogs,
    _Widget,
    _Templated,
    nlsStrings,
    declare
) {
    var activityActionProcessor = declare('Sage.Services.ActivityActionProcessor', [_Widget, _Templated], {
        _dialog: false,
        _currentUserId: null,
        _action: false,
        _processing: false,
        _selectionContext: false,
        btnOkayText: 'OK',
        btnCancelText: 'Cancel',
        btnCloseText: 'Close',
        btnHelpText: 'Help',
        processingText: 'Processing request please wait...',
        failureText: 'I\'m sorry, the action was not successful an error occurred.',
        titleText: 'Process',

        //end l18n strings.
        widgetsInTemplate: true,
        widgetTemplate: new Simplate([
            '<div>',
                '<div data-dojo-type="dijit.Dialog" id="activityProcessActionDialog" title="{%= $.titleText%}" dojoAttachPoint="_dialog" style="width:400px">',
                     '<div class="activityProcess-dialog">',
                        '<div data-dojo-type="dijit.layout.ContentPane" id="{%= $.id%}_cp_envet_General" title="" dojoAttachPoint="cp_General">',
                             '<div data-dojo-type="dojox.layout.TableContainer" orientation="horiz" cols="1" class="controlPropForm" labelWidth="140">',
                                 '<div id="{%= $.id%}_div_actionMessage"  name="div_actionMessage" dojoAttachPoint="div_actionMessage"></div>',
                             '</div>',
                        '</div>',
                       '<table class="button-bar"><tr><td class="alignright valignbottom">',
                            '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_OK" name="btn_OK" dojoAttachPoint="btn_OK" dojoAttachEvent="onClick:_okClick">{%= $.btnOkayText %}</div>',
                            '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_Cancel" name="btn_Cancel" dojoAttachPoint="btn_Cancel" dojoAttachEvent="onClick:_cancelClick">{%= $. btnCancelText %}</div>',
                            '<div data-dojo-type="dijit.form.Button"  id="{%= $.id%}_btn_Close" name="btn_Close" dojoAttachPoint="btn_Close" dojoAttachEvent="onClick:_closeClick">{%= $. btnCloseText %}</div>',
                       '</td><tr></table>',
                   '</div>',
               '</div>',
           '</div>'
        ]),

        constructor: function () {
            this._currentUserId = Sage.Utility.getClientContextByKey('userID') || '';
            dojo.mixin(this, nlsStrings);
        },
        //postMixInProperties: function() {
        //    this.inherited(arguments); 
        //},
        //startup: function(){
        //    this.inherited(arguments);
        //    this._loadData();             

        //},
        destroy: function () {

            this.inherited(arguments);
        },
        start: function (silent) {
            this._processing = false;
            if (this._selectionContext.count < 1) {
                return;
            }
            if (!silent) {
                this._setDisplay();
                this.show();
            } else {
                this._execute();
            }
        },
        show: function () {
            this._dialog.show();
        },
        hide: function () {
            //this._dialog.destroyRecursive();
            this._action = null;
            this._dialog.hide();

        },
        resize: function () {

        },
        _setDisplay: function () {

            dojo.style(this.btn_Close.domNode, "visibility", "hidden");
            dojo.style(this.btn_OK.domNode, "visibility", "visible");
            dojo.style(this.btn_Cancel.domNode, "visibility", "visible");

            if (this._selectionContext) {
                this.div_actionMessage.innerHTML = this._action.message;
                this._dialog.set('title', this._action.description);
            }
        },
        _setActionAttr: function (action) {
            this._action = action;
        },
        _getActionAttr: function () {
            return this._action;
        },
        _setSelectionContextAttr: function (selectionContext) {
            this._selectionContext = selectionContext;
        },
        _getSelectionContextAttr: function () {
            return this._selectionContextInfo;
        },

        _execute: function () {
            if (this._processing) {
                return;
            }
            var me = this;
            this.div_actionMessage.innerHTML = this.processingText;
            this._processing = true;
            dojo.style(this.btn_Close.domNode, "visibility", "visible");
            dojo.style(this.btn_OK.domNode, "visibility", "hidden");
            dojo.style(this.btn_Cancel.domNode, "visibility", "hidden");            
            if (this._action) {
                //this._action._selectionContext = this._selectionContext;
                this._action.execute({
                    scope: this,
                    success: function (result, scope) {
                        scope.hide();
                        scope.onActionComplete(result);
                    },
                    failure: function (result, scope) {
                        scope.onActionComplete(result);
                        Sage.UI.Dialogs.showError(me.failureText);
                    }
                });
            }
        },
        _okClick: function () {
            this._execute();
        },
        _cancelClick: function () {
            this.hide();
        },
        _closeClick: function () {
            this.hide();
        },
        onActionComplete: function (result) { }
        // ... endregion      
    });

    return activityActionProcessor;
});
